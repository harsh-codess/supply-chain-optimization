/* ── Types for Supply Chain Risk Monitor ─────────────────────────────── */

export interface GraphNode {
  id: string;
  type: string;
  region: string;
  lat: number;
  lng: number;
  risk: number;
  weather_score: number;
  congestion_score: number;
  carrier_score: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  dependency: number;
  disrupted: boolean;
}

export interface RerouteState {
  active: boolean;
  disrupted_edges: string[][];
  alternate_route: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  reroute: RerouteState;
}

export interface DisruptionPayload {
  node_id: string;
  severity: number;
  disruption_type: string;
  context: string;
}

export interface TriggerResponse {
  graph: GraphData;
  ai_response: string;
  triggered_at: string;
}

export interface ResetResponse {
  status: string;
  graph: GraphData;
}

export interface ReroutePayload {
  disrupted_edges: string[][];
  alternate_route: string[];
}

export interface RerouteResponse {
  status: string;
  graph: GraphData;
  reroute: RerouteState;
}

export interface DisruptionType {
  id: string;
  name: string;
  icon: string;
  node_id: string;
  severity: number;
  disruption_type: string;
  context: string;
  color: string;
}

export interface GeminiSection {
  label: string;
  content: string;
  color: string;
  bgColor: string;
}

export interface FirestoreDisruption {
  nodeId: string;
  risk: number;
  disruptionType: string;
  timestamp: Date;
  action?: string;
}
