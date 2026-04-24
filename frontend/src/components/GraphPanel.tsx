import { useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeCard from "./NodeCard";
import type { GraphData } from "../types";

interface GraphPanelProps {
  graphData: GraphData | null;
}

// Node positions — exact spec geographic layout (left=Asia, right=Europe/Americas)
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  Shanghai_Port:    { x: 50,  y: 200 },
  Singapore_Hub:    { x: 200, y: 300 },
  Colombo_Port:     { x: 300, y: 350 },
  Mumbai_Port:      { x: 350, y: 250 },
  Dubai_Port:       { x: 450, y: 200 },
  Rotterdam_Port:   { x: 650, y: 100 },
  Los_Angeles_Port: { x: 100, y: 450 },
};

const nodeTypes: NodeTypes = {
  custom: NodeCard,
};

function getEdgeColor(source: string, target: string, graphData: GraphData): string {
  const edgeData = graphData.edges.find(e => e.source === source && e.target === target);
  if (edgeData?.disrupted) return "#475569";

  if (graphData.reroute?.active) {
    const altRoute = graphData.reroute.alternate_route;
    for (let i = 0; i < altRoute.length - 1; i++) {
      if (altRoute[i] === source && altRoute[i + 1] === target) return "#4285F4";
    }
  }

  const targetNode = graphData.nodes.find(n => n.id === target);
  if (targetNode) {
    if (targetNode.risk > 0.6) return "#ef4444";
    if (targetNode.risk > 0.3) return "#eab308";
  }
  return "#475569";
}

/* ── Inner graph — has access to ReactFlow context ───────────────────── */
function GraphInner({ graphData }: GraphPanelProps) {
  const { fitView } = useReactFlow();

  const flowNodes = useMemo<Node[]>(() => {
    if (!graphData) return [];
    return graphData.nodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: NODE_POSITIONS[node.id] || { x: 0, y: 0 },
      data: {
        label: node.id,
        nodeType: node.type,
        risk: node.risk,
        region: node.region,
        isAlternateRoute: graphData.reroute?.active
          ? graphData.reroute.alternate_route.includes(node.id)
          : false,
      },
    }));
  }, [graphData]);

  const flowEdges = useMemo<Edge[]>(() => {
    if (!graphData) return [];
    return graphData.edges.map((edge) => {
      const isDisrupted = edge.disrupted;
      const isReroute = graphData.reroute?.active
        ? (() => {
            const alt = graphData.reroute.alternate_route;
            for (let i = 0; i < alt.length - 1; i++) {
              if (alt[i] === edge.source && alt[i + 1] === edge.target) return true;
            }
            return false;
          })()
        : false;

      return {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: `${edge.dependency.toFixed(2)}`,
        animated: !isDisrupted,
        style: {
          stroke: getEdgeColor(edge.source, edge.target, graphData),
          strokeWidth: isReroute ? 3 : isDisrupted ? 1 : 2,
          strokeDasharray: isDisrupted ? "8 4" : undefined,
          opacity: isDisrupted ? 0.3 : 1,
        },
        labelStyle: {
          fill: isDisrupted ? "#475569" : "#94a3b8",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
        },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Sync nodes/edges and re-fit view every time graph data changes
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 60);
    return () => clearTimeout(t);
  }, [flowNodes, flowEdges, setNodes, setEdges, fitView]);

  const onInit = useCallback(() => {
    fitView({ padding: 0.15 });
  }, [fitView]);

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
        <Controls showInteractive={false} className="!bottom-4 !left-4" />
      </ReactFlow>

      {graphData?.reroute?.active && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4285F4]/20 border border-[#4285F4]/40 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse-green" />
            <span className="text-xs font-bold text-[#4285F4] tracking-wide">
              REROUTE EXECUTED — ALTERNATE ROUTE ACTIVE
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Outer wrapper provides the ReactFlow context ────────────────────── */
export default function GraphPanel({ graphData }: GraphPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#4285F4] shadow-[0_0_8px_rgba(66,133,244,0.5)]" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Live Network Graph
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 ml-5">
          Real-time supply chain topology • {graphData?.nodes.length || 0} nodes • {graphData?.edges.length || 0} edges
        </p>
      </div>

      <ReactFlowProvider>
        <GraphInner graphData={graphData} />
      </ReactFlowProvider>
    </div>
  );
}
