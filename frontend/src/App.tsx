import { useState, useEffect, useCallback } from "react";
import ControlPanel from "./components/ControlPanel";
import GraphPanel from "./components/GraphPanel";
import AIPanel from "./components/AIPanel";
import { getGraph, triggerDisruption, resetGraph, executeReroute } from "./lib/api";
import { logDisruption } from "./lib/firebase";
import type { GraphData, DisruptionType } from "./types";

// Alternate routes mapped by disrupted node for reroute execution
const REROUTE_MAP: Record<
  string,
  { disrupted_edges: string[][]; alternate_route: string[] }
> = {
  Shanghai_Port: {
    disrupted_edges: [["Shanghai_Port", "Singapore_Hub"], ["Shanghai_Port", "Los_Angeles_Port"]],
    alternate_route: ["Singapore_Hub", "Colombo_Port", "Mumbai_Port", "Rotterdam_Port"],
  },
  Singapore_Hub: {
    disrupted_edges: [["Singapore_Hub", "Dubai_Port"], ["Singapore_Hub", "Colombo_Port"], ["Singapore_Hub", "Los_Angeles_Port"]],
    alternate_route: ["Shanghai_Port", "Los_Angeles_Port"],
  },
  Dubai_Port: {
    disrupted_edges: [["Dubai_Port", "Rotterdam_Port"]],
    alternate_route: ["Shanghai_Port", "Singapore_Hub", "Colombo_Port", "Mumbai_Port", "Rotterdam_Port"],
  },
};

export default function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [disruptedNodeId, setDisruptedNodeId] = useState<string | null>(null);
  const [rerouteActive, setRerouteActive] = useState(false);

  // Initial graph fetch
  useEffect(() => {
    getGraph()
      .then(setGraphData)
      .catch((err) => console.error("Failed to fetch graph:", err));
  }, []);

  // Poll graph every 10 seconds for live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        getGraph()
          .then(setGraphData)
          .catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle disruption trigger
  const handleTrigger = useCallback(async (disruption: DisruptionType) => {
    setIsLoading(true);
    setAiResponse(null);
    setRerouteActive(false);
    setDisruptedNodeId(disruption.node_id);

    try {
      const response = await triggerDisruption({
        node_id: disruption.node_id,
        severity: disruption.severity,
        disruption_type: disruption.disruption_type,
        context: disruption.context,
      });

      setGraphData(response.graph);
      setAiResponse(response.ai_response);

      // Log to Firebase
      await logDisruption(
        disruption.node_id,
        disruption.severity,
        disruption.disruption_type
      );
    } catch (err) {
      console.error("Trigger failed:", err);
      setAiResponse(
        "RISK ASSESSMENT: Failed to connect to backend API. Ensure the FastAPI server is running on port 8000.\nCASCADING NODES: Unable to calculate.\nRECOMMENDED REROUTE: System offline.\nCOST TRADEOFF: N/A\n48HR PREDICTION: Manual monitoring required.\nACTION: Start backend server with 'uvicorn main:app --reload --port 8000'"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle reset
  const handleReset = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await resetGraph();
      setGraphData(response.graph);
      setAiResponse(null);
      setDisruptedNodeId(null);
      setRerouteActive(false);
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle execute reroute
  const handleExecuteReroute = useCallback(async () => {
    if (!disruptedNodeId) return;
    const rerouteConfig = REROUTE_MAP[disruptedNodeId];
    if (!rerouteConfig) return;

    try {
      const response = await executeReroute(rerouteConfig);
      setGraphData(response.graph);
      setRerouteActive(true);

      // Log reroute execution to Firebase
      await logDisruption(
        disruptedNodeId,
        0,
        "REROUTE_EXECUTED",
      );
    } catch (err) {
      console.error("Reroute failed:", err);
    }
  }, [disruptedNodeId]);

  return (
    <div className="h-screen w-screen flex bg-black overflow-hidden">
      {/* Left Panel — Control */}
      <div className="w-[25%] min-w-[320px] border-r border-white/5 bg-black flex flex-col overflow-hidden">
        <ControlPanel
          graphData={graphData}
          onTrigger={handleTrigger}
          onReset={handleReset}
          isLoading={isLoading}
        />
      </div>

      {/* Center Panel — Graph */}
      <div className="flex-1 border-r border-white/5 bg-black flex flex-col overflow-hidden">
        <GraphPanel graphData={graphData} />
      </div>

      {/* Right Panel — AI */}
      <div className="w-[25%] min-w-[320px] bg-black flex flex-col overflow-hidden">
        <AIPanel
          aiResponse={aiResponse}
          isLoading={isLoading}
          graphData={graphData}
          disruptedNodeId={disruptedNodeId}
          onExecuteReroute={handleExecuteReroute}
          rerouteActive={rerouteActive}
        />
      </div>
    </div>
  );
}
