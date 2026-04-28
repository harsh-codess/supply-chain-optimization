import axios from "axios";
import type {
  GraphData,
  DisruptionPayload,
  TriggerResponse,
  ResetResponse,
  ReroutePayload,
  RerouteResponse,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

export async function getGraph(): Promise<GraphData> {
  const { data } = await api.get<GraphData>("/graph");
  return data;
}

export async function triggerDisruption(
  payload: DisruptionPayload
): Promise<TriggerResponse> {
  const { data } = await api.post<TriggerResponse>("/trigger", payload);
  return data;
}

export async function resetGraph(): Promise<ResetResponse> {
  const { data } = await api.post<ResetResponse>("/reset");
  return data;
}

export async function executeReroute(
  payload: ReroutePayload
): Promise<RerouteResponse> {
  const { data } = await api.post<RerouteResponse>("/reroute", payload);
  return data;
}

export async function ackEvent(): Promise<void> {
  await api.post("/ack-event");
}

export async function registerFcmToken(token: string): Promise<void> {
  await api.post("/register-fcm", { token });
}

export async function getWeatherFeed(): Promise<{ feed: WeatherEntry[] }> {
  const { data } = await api.get<{ feed: WeatherEntry[] }>("/weather-feed");
  return data;
}

export interface WeatherEntry {
  node_id: string;
  city: string;
  timestamp: string;
  temp_c: number;
  wind_kmh: number;
  condition: string;
  humidity: number;
  weather_score: number;
  risk_pct: number;
  action: string;
  auto_triggered: boolean;
}
