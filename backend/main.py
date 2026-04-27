"""
Supply Chain Disruption Detection & AI-Powered Rerouting System
Backend — FastAPI + NetworkX + Google Gemini 2.5 Flash
"""

import os
import asyncio
import json
import time
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional

import networkx as nx
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google import genai
from google.genai import types

load_dotenv()

# ── Configuration ──────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

client: genai.Client | None = None

def get_gemini_client() -> genai.Client:
    global client
    if client is None:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set in backend/.env")
        client = genai.Client(api_key=GEMINI_API_KEY)
    return client

# ── Supply Chain Graph ─────────────────────────────────────────────────────

NODES = {
    "Shanghai_Port":    {"type": "origin",        "region": "Asia",              "lat": 31.2304, "lng": 121.4737},
    "Singapore_Hub":    {"type": "transit_hub",    "region": "Southeast Asia",    "lat": 1.3521,  "lng": 103.8198},
    "Colombo_Port":     {"type": "transit_hub",    "region": "South Asia",        "lat": 6.9271,  "lng": 79.8612},
    "Dubai_Port":       {"type": "transit_hub",    "region": "Middle East",       "lat": 25.2048, "lng": 55.2708},
    "Mumbai_Port":      {"type": "alternate_hub",  "region": "South Asia",        "lat": 19.0760, "lng": 72.8777},
    "Rotterdam_Port":   {"type": "destination",    "region": "Europe",            "lat": 51.9244, "lng": 4.4777},
    "Los_Angeles_Port": {"type": "destination",    "region": "North America",     "lat": 34.0522, "lng": -118.2437},
}

EDGES = [
    ("Shanghai_Port",  "Singapore_Hub",    0.90),
    ("Singapore_Hub",  "Dubai_Port",       0.85),
    ("Singapore_Hub",  "Colombo_Port",     0.70),
    ("Dubai_Port",     "Rotterdam_Port",   0.88),
    ("Colombo_Port",   "Mumbai_Port",      0.75),
    ("Mumbai_Port",    "Rotterdam_Port",   0.65),
    ("Shanghai_Port",  "Los_Angeles_Port", 0.80),
    ("Singapore_Hub",  "Los_Angeles_Port", 0.70),
]

ROUTES = {
    "europe_primary":   ["Shanghai_Port", "Singapore_Hub", "Dubai_Port", "Rotterdam_Port"],
    "europe_alternate": ["Shanghai_Port", "Singapore_Hub", "Colombo_Port", "Mumbai_Port", "Rotterdam_Port"],
    "pacific_direct":   ["Shanghai_Port", "Los_Angeles_Port"],
    "pacific_alternate":["Singapore_Hub", "Los_Angeles_Port"],
}

# Weather monitoring cities
WEATHER_CITIES = {
    "Shanghai_Port":  {"city": "Shanghai", "lat": 31.2304, "lon": 121.4737},
    "Singapore_Hub":  {"city": "Singapore", "lat": 1.3521, "lon": 103.8198},
    "Dubai_Port":     {"city": "Dubai", "lat": 25.2048, "lon": 55.2708},
}


def build_graph() -> nx.DiGraph:
    G = nx.DiGraph()
    for node_id, attrs in NODES.items():
        G.add_node(node_id, **attrs, risk=0.0, weather_score=0.0, congestion_score=0.0, carrier_score=0.0)
    for src, dst, dep in EDGES:
        G.add_edge(src, dst, dependency=dep, disrupted=False)
    return G


graph = build_graph()

# Track reroute state
reroute_state = {"active": False, "disrupted_edges": [], "alternate_route": []}

# Auto-detected event queue (cleared after frontend acknowledges)
pending_auto_event: dict | None = None


# ── Pydantic Models ────────────────────────────────────────────────────────

class DisruptionPayload(BaseModel):
    node_id: str
    severity: float
    disruption_type: str
    context: str


class ReroutePayload(BaseModel):
    disrupted_edges: list[list[str]]
    alternate_route: list[str]


# ── Cascade Propagation ───────────────────────────────────────────────────

def propagate_risk(G: nx.DiGraph, trigger_node: str, base_risk: float):
    G.nodes[trigger_node]["risk"] = base_risk
    for downstream in G.successors(trigger_node):
        weight = G[trigger_node][downstream]["dependency"]
        child_risk = round(base_risk * weight, 2)
        if child_risk > G.nodes[downstream]["risk"]:
            G.nodes[downstream]["risk"] = child_risk
            propagate_risk(G, downstream, child_risk)


def compute_composite_risk(node_id: str) -> float:
    """Combine weather, congestion, and carrier scores into a composite risk."""
    n = graph.nodes[node_id]
    weather = n.get("weather_score", 0.0)
    congestion = n.get("congestion_score", 0.0)
    carrier = n.get("carrier_score", 0.0)
    # Weighted formula
    composite = (weather * 0.4) + (congestion * 0.35) + (carrier * 0.25)
    return round(min(composite, 1.0), 2)


# ── Graph Serialization ───────────────────────────────────────────────────

def serialize_graph():
    nodes = []
    for nid, data in graph.nodes(data=True):
        nodes.append({
            "id": nid,
            "type": data.get("type", ""),
            "region": data.get("region", ""),
            "lat": data.get("lat", 0),
            "lng": data.get("lng", 0),
            "risk": data.get("risk", 0),
            "weather_score": data.get("weather_score", 0.0),
            "congestion_score": data.get("congestion_score", 0.0),
            "carrier_score": data.get("carrier_score", 0.0),
        })
    edges = []
    for src, dst, data in graph.edges(data=True):
        edges.append({
            "source": src,
            "target": dst,
            "dependency": data.get("dependency", 0),
            "disrupted": data.get("disrupted", False),
        })
    return {"nodes": nodes, "edges": edges, "reroute": reroute_state, "auto_event": pending_auto_event}


# ── Gemini AI Call ─────────────────────────────────────────────────────────

async def call_gemini(node_id: str, severity: float, disruption_type: str, context: str) -> str:
    affected = []
    for nid, data in graph.nodes(data=True):
        if data["risk"] > 0:
            affected.append(f"  - {nid}: {data['risk'] * 100:.0f}% risk")
    affected_str = "\n".join(affected) if affected else "  None yet"

    # Determine primary affected route
    primary_route = "Unknown"
    for route_name, route_nodes in ROUTES.items():
        if node_id in route_nodes:
            primary_route = " → ".join(route_nodes)
            break

    alt_routes = []
    for route_name, route_nodes in ROUTES.items():
        if node_id not in route_nodes:
            alt_routes.append(f"  - {route_name}: {' → '.join(route_nodes)}")
    alt_str = "\n".join(alt_routes) if alt_routes else "  None available"

    prompt = f"""You are an AI logistics optimization engine for a global supply chain risk management system.

DISRUPTION DETECTED:
- Type: {disruption_type}
- Location: {node_id}
- Severity: {severity * 100:.0f}%
- Context: {context}

CASCADING IMPACT:
{affected_str}

PRIMARY ROUTE AFFECTED:
{primary_route}

AVAILABLE ALTERNATE ROUTES:
{alt_str}

Respond with exactly this structure:
RISK ASSESSMENT: (2 sentences on severity and immediate impact)
CASCADING NODES: (which nodes will be affected and timeline)
RECOMMENDED REROUTE: (specific alternate route with port names)
COST TRADEOFF: (estimated time and cost difference)
48HR PREDICTION: (what happens if no action is taken)
ACTION: (one clear instruction for logistics manager)"""

    try:
        gemini = get_gemini_client()
        response = gemini.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
            ),
        )
        return response.text
    except Exception as e:
        return f"Gemini API error: {str(e)}\n\nFallback analysis:\nRISK ASSESSMENT: {disruption_type} at {node_id} with {severity*100:.0f}% severity requires immediate attention.\nCASCADING NODES: Downstream nodes at risk.\nRECOMMENDED REROUTE: Use alternate routes avoiding {node_id}.\nCOST TRADEOFF: Expect 15-25% cost increase.\n48HR PREDICTION: Delays will cascade if no action taken.\nACTION: Activate contingency routing immediately."


# ── Weather Monitoring ─────────────────────────────────────────────────────

weather_monitoring_active = True
last_weather_check = None


async def check_weather():
    """Poll OpenWeatherMap for severe weather at key ports."""
    global last_weather_check
    if not OPENWEATHER_API_KEY:
        return

    for node_id, city_info in WEATHER_CITIES.items():
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={city_info['city']}&appid={OPENWEATHER_API_KEY}&units=metric"
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                continue
            data = resp.json()

            wind_speed_kmh = data.get("wind", {}).get("speed", 0) * 3.6  # m/s → km/h
            weather_id = data.get("weather", [{}])[0].get("id", 800)

            # Compute weather severity score
            weather_severity = 0.0
            if wind_speed_kmh > 50:
                weather_severity = min(wind_speed_kmh / 100, 1.0)
            if weather_id < 300:  # Thunderstorm
                weather_severity = max(weather_severity, 0.7)
            elif weather_id < 600:  # Rain/drizzle
                weather_severity = max(weather_severity, 0.3)
            elif weather_id >= 700 and weather_id < 800:  # Atmosphere (fog, etc.)
                weather_severity = max(weather_severity, 0.2)

            graph.nodes[node_id]["weather_score"] = round(weather_severity, 2)

            # Auto-trigger disruption if severe
            if wind_speed_kmh > 50 or weather_id < 250:
                global pending_auto_event
                severity = min(0.6 + (wind_speed_kmh / 200), 0.95)
                context = f"Auto-detected: Wind speed {wind_speed_kmh:.0f}km/h, Weather condition ID {weather_id}"
                graph.nodes[node_id]["risk"] = max(graph.nodes[node_id]["risk"], severity)
                propagate_risk(graph, node_id, severity)
                # Set pending event so frontend can pick it up and run Gemini
                if pending_auto_event is None:  # Don't overwrite if already pending
                    pending_auto_event = {
                        "node_id": node_id,
                        "severity": round(severity, 2),
                        "disruption_type": "SEVERE_WEATHER",
                        "context": context,
                        "detected_at": datetime.now(timezone.utc).isoformat(),
                    }

        except Exception:
            pass

    last_weather_check = datetime.now(timezone.utc).isoformat()


async def weather_monitor_loop():
    """Background loop checking weather every 60 seconds."""
    while True:
        await check_weather()
        await asyncio.sleep(60)


# ── Simulated Data Feeds ──────────────────────────────────────────────────

def update_simulated_feeds():
    """Update simulated congestion and carrier scores for realism."""
    import random
    for node_id in NODES:
        # Port Authority Feed — simulated congestion
        current = graph.nodes[node_id].get("congestion_score", 0.0)
        drift = random.uniform(-0.05, 0.05)
        graph.nodes[node_id]["congestion_score"] = round(max(0, min(1, current + drift)), 2)

        # Carrier API Feed — simulated reliability
        current_carrier = graph.nodes[node_id].get("carrier_score", 0.0)
        drift_c = random.uniform(-0.03, 0.03)
        graph.nodes[node_id]["carrier_score"] = round(max(0, min(1, current_carrier + drift_c)), 2)


# ── Application Lifecycle ─────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch background weather monitor
    task = asyncio.create_task(weather_monitor_loop())
    yield
    # Shutdown: cancel background task
    task.cancel()


app = FastAPI(title="Supply Chain Risk Monitor", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── API Endpoints ─────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "weather_monitoring": weather_monitoring_active,
        "last_weather_check": last_weather_check,
    }


@app.get("/graph")
async def get_graph():
    update_simulated_feeds()
    return serialize_graph()


@app.post("/trigger")
async def trigger_disruption(payload: DisruptionPayload):
    if payload.node_id not in graph.nodes:
        raise HTTPException(status_code=404, detail=f"Node '{payload.node_id}' not found")

    # Set data source scores based on disruption type
    if payload.disruption_type == "SEVERE_WEATHER":
        graph.nodes[payload.node_id]["weather_score"] = payload.severity
    elif payload.disruption_type == "PORT_CONGESTION":
        graph.nodes[payload.node_id]["congestion_score"] = payload.severity
    elif payload.disruption_type == "CARRIER_SUSPENSION":
        graph.nodes[payload.node_id]["carrier_score"] = payload.severity

    # Propagate cascade risk
    propagate_risk(graph, payload.node_id, payload.severity)

    # Call Gemini 2.5 Flash with Search Grounding
    ai_response = await call_gemini(
        payload.node_id,
        payload.severity,
        payload.disruption_type,
        payload.context,
    )

    return {
        "graph": serialize_graph(),
        "ai_response": ai_response,
        "triggered_at": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/reset")
async def reset_graph():
    global graph, reroute_state
    graph = build_graph()
    reroute_state = {"active": False, "disrupted_edges": [], "alternate_route": []}
    return {"status": "reset", "graph": serialize_graph()}


@app.post("/reroute")
async def execute_reroute(payload: ReroutePayload):
    global reroute_state
    # Mark disrupted edges
    for edge_pair in payload.disrupted_edges:
        src, dst = edge_pair[0], edge_pair[1]
        if graph.has_edge(src, dst):
            graph[src][dst]["disrupted"] = True

    reroute_state = {
        "active": True,
        "disrupted_edges": payload.disrupted_edges,
        "alternate_route": payload.alternate_route,
    }

    return {"status": "reroute_executed", "graph": serialize_graph(), "reroute": reroute_state}


@app.post("/ack-event")
async def acknowledge_event():
    """Frontend calls this after processing auto_event to clear it."""
    global pending_auto_event
    pending_auto_event = None
    return {"status": "cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
