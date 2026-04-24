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
  baseURL: "http://localhost:8000",
  timeout: 60000, // Gemini calls can take time
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
