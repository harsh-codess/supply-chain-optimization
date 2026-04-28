import { useState, useEffect } from "react";
import LiveDataFeed from "./LiveDataFeed";
import {
  CloudLightning,
  Container,
  ShipWheel,
  RotateCcw,
  Activity,
  Shield,
  AlertTriangle,
  Zap,
  Wifi,
  Database,
  Cpu,
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
    case "weather": return <CloudLightning className="w-5 h-5" />;
    case "congestion": return <Container className="w-5 h-5" />;
    case "carrier": return <ShipWheel className="w-5 h-5" />;
    default: return <AlertTriangle className="w-5 h-5" />;
  }
}

function getRiskBadge(risk: number) {
  if (risk > 0.6)
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
  if (risk > 0.3)
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">ELEVATED</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">NOMINAL</span>;
}

export default function ControlPanel({
  graphData,
  onTrigger,
  onReset,
  isLoading,
}: ControlPanelProps) {
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [_lastCheck, setLastCheck] = useState<Date>(new Date());
  const [tick, setTick] = useState(0);

  // Update "last check" every 5 minutes (same as backend poll)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date());
      setTick(t => t + 1);
    }, 300_000);
    return () => clearInterval(interval);
  }, []);

  // Live seconds counter
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(0);
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [tick]);

  const handleTrigger = (disruption: DisruptionType) => {
    setTriggeringId(disruption.id);
    onTrigger(disruption);
  };

  const secsAgo = elapsed < 60 ? `${elapsed}s ago` : `${Math.floor(elapsed / 60)}m ago`;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex-none">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#4285F4]/20 border border-[#4285F4]/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#4285F4]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Supply Chain Risk Monitor
            </h1>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              Powered by Gemini 2.5 Flash + Google Cloud
            </p>
          </div>
        </div>

        {/* Live monitoring */}
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-green" />
          <span className="text-[11px] font-semibold text-green-400 tracking-wide">
            LIVE MONITORING ACTIVE
          </span>
          <Activity className="w-3 h-3 text-green-400 ml-auto" />
        </div>

        {/* Real-time data sources */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            { icon: <Wifi className="w-3 h-3" />, label: "Weather", detail: secsAgo, color: "#34A853" },
            { icon: <Cpu className="w-3 h-3" />, label: "Gemini AI", detail: "Grounded", color: "#4285F4" },
            { icon: <Database className="w-3 h-3" />, label: "Firebase", detail: "Connected", color: "#FBBC04" },
          ].map((src) => (
            <div
              key={src.label}
              className="rounded-lg px-2 py-1.5 flex flex-col items-center gap-0.5 border"
              style={{ background: `${src.color}08`, borderColor: `${src.color}20` }}
            >
              <span style={{ color: src.color }}>{src.icon}</span>
              <span className="text-[8px] font-bold text-zinc-400">{src.label}</span>
              <span className="text-[7px] text-zinc-600">{src.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        {/* Disruption Triggers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Disruption Scenarios
            </span>
          </div>
          <div className="space-y-3">
            {DISRUPTIONS.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border overflow-hidden transition-all duration-200"
                style={{ borderColor: `${d.color}25`, background: `${d.color}08` }}
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
                      <h3 className="text-sm font-semibold text-white">{d.name}</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {d.node_id.replace(/_/g, " ")} •{" "}
                        <span style={{ color: d.color }}>{Math.round(d.severity * 100)}% severity</span>
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed line-clamp-2">{d.context}</p>
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
                    {isLoading && triggeringId === d.id ? "⏳ Analyzing with Gemini..." : "⚡ Trigger Disruption"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node Risk Table */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Node Risk Status
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden">
            {graphData?.nodes.map((node, i) => (
              <div
                key={node.id}
                className={`flex items-center justify-between px-4 py-2.5 transition-colors duration-200 ${
                  i !== (graphData?.nodes.length || 0) - 1 ? "border-b border-white/5" : ""
                } hover:bg-white/[0.02]`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-zinc-300 truncate block">
                    {node.id.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-zinc-600">🌤 {Math.round(node.weather_score * 100)}%</span>
                    <span className="text-[9px] text-zinc-600">📦 {Math.round(node.congestion_score * 100)}%</span>
                    <span className="text-[9px] text-zinc-600">🚢 {Math.round(node.carrier_score * 100)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {Math.round(node.risk * 100)}%
                  </span>
                  {getRiskBadge(node.risk)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1.5 px-1 flex items-center gap-3 text-[8px] text-zinc-700">
            <span>🌤 OpenWeatherMap</span>
            <span>📦 Port Authority Feed</span>
            <span>🚢 Carrier API Feed</span>
          </div>
        </div>

        {/* Live Data Feed */}
        <div className="border-t border-white/5 pt-3">
          <LiveDataFeed />
        </div>
      </div>

      {/* Reset Button */}
      <div className="px-4 py-4 border-t border-white/5 flex-none">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-zinc-400 bg-zinc-900 border border-white/5 hover:bg-zinc-800 hover:border-white/10 transition-all duration-200 disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Systems
        </button>
      </div>
    </div>
  );
}
