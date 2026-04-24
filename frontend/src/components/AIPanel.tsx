import { useState, useEffect, useRef, useMemo } from "react";
import {
  Brain,
  Loader2,
  CheckCircle2,
  Route,
  MapPin,
} from "lucide-react";
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { GraphData, GeminiSection } from "../types";

interface AIPanelProps {
  aiResponse: string | null;
  isLoading: boolean;
  graphData: GraphData | null;
  disruptedNodeId: string | null;
  onExecuteReroute: () => void;
  rerouteActive: boolean;
}

const SECTION_CONFIG: Record<string, { color: string; bgColor: string }> = {
  "RISK ASSESSMENT": { color: "#ef4444", bgColor: "rgba(239,68,68,0.1)" },
  "CASCADING NODES": { color: "#f97316", bgColor: "rgba(249,115,22,0.1)" },
  "RECOMMENDED REROUTE": { color: "#4285F4", bgColor: "rgba(66,133,244,0.15)" },
  "COST TRADEOFF": { color: "#94a3b8", bgColor: "rgba(148,163,184,0.1)" },
  "48HR PREDICTION": { color: "#eab308", bgColor: "rgba(234,179,8,0.1)" },
  ACTION: { color: "#22c55e", bgColor: "rgba(34,197,94,0.1)" },
};

function parseGeminiResponse(response: string): GeminiSection[] {
  const sections: GeminiSection[] = [];
  const labels = Object.keys(SECTION_CONFIG);

  for (const label of labels) {
    // Try multiple separator patterns: "LABEL:", "**LABEL:**", "**LABEL**:"
    const patterns = [
      new RegExp(`\\*\\*${label}:\\*\\*\\s*`, "i"),
      new RegExp(`\\*\\*${label}\\*\\*:\\s*`, "i"),
      new RegExp(`${label}:\\s*`, "i"),
    ];

    let startIdx = -1;
    let matchLen = 0;

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match.index !== undefined) {
        startIdx = match.index;
        matchLen = match[0].length;
        break;
      }
    }

    if (startIdx === -1) continue;

    const contentStart = startIdx + matchLen;

    // Find the end (start of next section or end of string)
    let endIdx = response.length;
    for (const nextLabel of labels) {
      if (nextLabel === label) continue;
      const nextPatterns = [
        new RegExp(`\\*\\*${nextLabel}:\\*\\*`, "i"),
        new RegExp(`\\*\\*${nextLabel}\\*\\*:`, "i"),
        new RegExp(`${nextLabel}:`, "i"),
      ];
      for (const np of nextPatterns) {
        const nextMatch = response.substring(contentStart).match(np);
        if (nextMatch && nextMatch.index !== undefined) {
          const possibleEnd = contentStart + nextMatch.index;
          if (possibleEnd < endIdx && possibleEnd > contentStart) {
            endIdx = possibleEnd;
          }
        }
      }
    }

    const content = response.substring(contentStart, endIdx).trim();
    if (content) {
      const config = SECTION_CONFIG[label];
      sections.push({
        label,
        content,
        color: config.color,
        bgColor: config.bgColor,
      });
    }
  }

  return sections;
}

/* ── Polyline sub-component (needs map context) ─────────────────────── */
function RoutePolyline({ path, color }: { path: { lat: number; lng: number }[]; color: string }) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");

  useEffect(() => {
    if (!map || !mapsLib || path.length < 2) return;

    const polyline = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: 3,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, mapsLib, path, color]);

  return null;
}

/* ── Typewriter Text ────────────────────────────────────────────────── */
function TypewriterText({ text, speed = 8 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <>{displayed}<span className="animate-pulse">|</span></>;
}

/* ── Main AI Panel ──────────────────────────────────────────────────── */
export default function AIPanel({
  aiResponse,
  isLoading,
  graphData,
  disruptedNodeId,
  onExecuteReroute,
  rerouteActive,
}: AIPanelProps) {
  const sections = useMemo(
    () => (aiResponse ? parseGeminiResponse(aiResponse) : []),
    [aiResponse]
  );

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // Build map markers and route from graph data
  const markers = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.map((n) => ({
      id: n.id,
      lat: n.lat,
      lng: n.lng,
      risk: n.risk,
      label: n.id.replace(/_/g, " "),
    }));
  }, [graphData]);

  // Build alternate route polyline path
  const alternatePath = useMemo(() => {
    if (!graphData?.reroute?.active || !graphData.reroute.alternate_route.length)
      return [];
    return graphData.reroute.alternate_route
      .map((nodeId) => {
        const node = graphData.nodes.find((n) => n.id === nodeId);
        return node ? { lat: node.lat, lng: node.lng } : null;
      })
      .filter(Boolean) as { lat: number; lng: number }[];
  }, [graphData]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4285F4] to-[#A855F7] flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Gemini AI Analysis
            </h2>
            <p className="text-[10px] text-slate-400">
              Gemini 2.5 Flash • Search Grounded
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-[#4285F4] animate-spin" />
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-[#4285F4]/20" />
            </div>
            <p className="text-sm text-slate-400 mt-4 font-medium">
              Gemini is analyzing disruption...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Searching live data sources
            </p>
            <div className="mt-4 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4285F4] to-[#34A853] rounded-full animate-shimmer" />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !aiResponse && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Awaiting Disruption Trigger
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Trigger a disruption scenario to activate Gemini AI analysis and rerouting
            </p>
          </div>
        )}

        {/* AI Response Sections */}
        {!isLoading && sections.length > 0 && (
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div
                key={section.label}
                className="rounded-xl border overflow-hidden animate-slide-in"
                style={{
                  borderColor: `${section.color}30`,
                  backgroundColor: section.bgColor,
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ borderColor: `${section.color}20` }}>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${section.color}20`,
                      color: section.color,
                      border: `1px solid ${section.color}40`,
                    }}
                  >
                    {section.label}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p
                    className={`text-xs leading-relaxed ${
                      section.label === "ACTION"
                        ? "font-bold text-green-300"
                        : "text-slate-300"
                    }`}
                  >
                    <TypewriterText
                      text={section.content}
                      speed={section.label === "ACTION" ? 12 : 6}
                    />
                  </p>
                </div>
              </div>
            ))}

            {/* Execute Reroute Button */}
            {!rerouteActive && (
              <button
                onClick={onExecuteReroute}
                className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#4285F4] to-[#34A853] hover:shadow-lg hover:shadow-[#4285F4]/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Route className="w-4 h-4" />
                Execute Reroute
              </button>
            )}

            {/* Reroute Confirmed */}
            {rerouteActive && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#34A853]/10 border border-[#34A853]/30">
                <CheckCircle2 className="w-5 h-5 text-[#34A853]" />
                <div>
                  <p className="text-sm font-bold text-[#34A853]">
                    Reroute Executed
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Alternate route activated • Logged to Firebase
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Google Maps */}
        {graphData && mapsApiKey && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#EA4335]" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Route Visualization{disruptedNodeId ? ` — ${disruptedNodeId.replace(/_/g, " ")}` : ""}
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700/50" style={{ height: 280 }}>
              <APIProvider apiKey={mapsApiKey}>
                <Map
                  defaultCenter={{ lat: 20.0, lng: 80.0 }}
                  defaultZoom={2}
                  mapId="supply-chain-map"
                  gestureHandling="greedy"
                  disableDefaultUI={true}
                  style={{ width: "100%", height: "100%" }}
                  colorScheme="DARK"
                >
                  {markers.map((m) => (
                    <Marker
                      key={m.id}
                      position={{ lat: m.lat, lng: m.lng }}
                      title={m.label}
                    />
                  ))}
                  {alternatePath.length > 1 && (
                    <RoutePolyline path={alternatePath} color="#4285F4" />
                  )}
                </Map>
              </APIProvider>
            </div>
          </div>
        )}

        {/* No Maps API key fallback */}
        {graphData && !mapsApiKey && (
          <div className="mt-4 px-4 py-6 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
            <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              Set VITE_GOOGLE_MAPS_API_KEY to enable map visualization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
