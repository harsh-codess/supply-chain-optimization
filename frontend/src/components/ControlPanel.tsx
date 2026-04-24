import { useState } from "react";
import {
  CloudLightning,
  Container,
  ShipWheel,
  RotateCcw,
  Activity,
  Shield,
  AlertTriangle,
  Zap,
} from "lucide-react";
import type { GraphData, DisruptionType } from "../types";

interface ControlPanelProps {
  graphData: GraphData | null;
  onTrigger: (disruption: DisruptionType) => void;
  onReset: () => void;
  isLoading: boolean;
}

const DISRUPTIONS: DisruptionType[] = [
  {
    id: "weather",
    name: "Severe Weather Event",
    icon: "weather",
    node_id: "Shanghai_Port",
    severity: 0.9,
    disruption_type: "SEVERE_WEATHER",
    context:
      "Typhoon Mawar has shut Shanghai Port. 300+ vessels delayed. Estimated closure: 5-7 days.",
    color: "#EA4335",
  },
  {
    id: "congestion",
    name: "Port Congestion Bottleneck",
    icon: "congestion",
    node_id: "Singapore_Hub",
    severity: 0.85,
    disruption_type: "PORT_CONGESTION",
    context:
      "Singapore Port congestion at 94% capacity. Average dwell time increased from 3 to 11 days. Vessel queues backing up.",
    color: "#FBBC04",
  },
  {
    id: "carrier",
    name: "Carrier Route Suspension",
    icon: "carrier",
    node_id: "Dubai_Port",
    severity: 0.8,
    disruption_type: "CARRIER_SUSPENSION",
    context:
      "Major carrier MSC has suspended Dubai route. Insurance risk surcharge making routes commercially unviable.",
    color: "#FF6D01",
  },
];

function getDisruptionIcon(icon: string) {
  switch (icon) {
    case "weather":
      return <CloudLightning className="w-5 h-5" />;
    case "congestion":
      return <Container className="w-5 h-5" />;
    case "carrier":
      return <ShipWheel className="w-5 h-5" />;
    default:
      return <AlertTriangle className="w-5 h-5" />;
  }
}

function getRiskBadge(risk: number) {
  if (risk > 0.6)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse-critical">
        CRITICAL
      </span>
    );
  if (risk > 0.3)
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        ELEVATED
      </span>
    );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
      LOW
    </span>
  );
}

export default function ControlPanel({
  graphData,
  onTrigger,
  onReset,
  isLoading,
}: ControlPanelProps) {
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const handleTrigger = (disruption: DisruptionType) => {
    setTriggeringId(disruption.id);
    onTrigger(disruption);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Supply Chain Risk Monitor
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Powered by Gemini 2.5 Flash + Google Cloud
            </p>
          </div>
        </div>

        {/* Live monitoring indicator */}
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-green" />
          <span className="text-[11px] font-semibold text-green-400 tracking-wide">
            LIVE MONITORING ACTIVE
          </span>
          <Activity className="w-3 h-3 text-green-400 ml-auto" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Disruption Triggers */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Disruption Scenarios
            </span>
          </div>

          <div className="space-y-3">
            {DISRUPTIONS.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden transition-all duration-200 hover:border-slate-600/80 hover:bg-slate-800/70"
              >
                <div className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${d.color}20`, color: d.color }}
                    >
                      {getDisruptionIcon(d.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">
                        {d.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {d.node_id.replace(/_/g, " ")} •{" "}
                        <span style={{ color: d.color }}>
                          {Math.round(d.severity * 100)}% severity
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {d.context}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTrigger(d)}
                    disabled={isLoading}
                    className="w-full mt-3 py-2 rounded-lg text-xs font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${d.color}, ${d.color}cc)`,
                      boxShadow: `0 2px 12px ${d.color}30`,
                    }}
                  >
                    {isLoading && triggeringId === d.id
                      ? "⏳ Analyzing with Gemini..."
                      : "⚡ Trigger Disruption"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node Risk Table */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Node Risk Status
            </span>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
            {graphData?.nodes.map((node, i) => (
              <div
                key={node.id}
                className={`flex items-center justify-between px-4 py-2.5 transition-colors duration-200 ${
                  i !== (graphData?.nodes.length || 0) - 1
                    ? "border-b border-slate-700/30"
                    : ""
                } hover:bg-slate-700/20`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-slate-200 truncate block">
                    {node.id.replace(/_/g, " ")}
                  </span>
                  {/* Data source breakdown */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-slate-500">
                      🌤 {Math.round(node.weather_score * 100)}%
                    </span>
                    <span className="text-[9px] text-slate-500">
                      📦 {Math.round(node.congestion_score * 100)}%
                    </span>
                    <span className="text-[9px] text-slate-500">
                      🚢 {Math.round(node.carrier_score * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {Math.round(node.risk * 100)}%
                  </span>
                  {getRiskBadge(node.risk)}
                </div>
              </div>
            ))}
          </div>

          {/* Data source legend */}
          <div className="mt-2 px-2">
            <div className="flex items-center gap-3 text-[9px] text-slate-500">
              <span>🌤 OpenWeatherMap</span>
              <span>📦 Port Authority Feed</span>
              <span>🚢 Carrier API Feed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Systems
        </button>
      </div>
    </div>
  );
}
