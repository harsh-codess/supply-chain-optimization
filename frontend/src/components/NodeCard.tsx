import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface NodeCardData {
  label: string;
  nodeType: string;
  risk: number;
  region: string;
  isAlternateRoute?: boolean;
  [key: string]: unknown;
}

function getRiskColor(risk: number): string {
  if (risk > 0.6) return "#ef4444";
  if (risk > 0.3) return "#eab308";
  return "#22c55e";
}

function getRiskLabel(risk: number): string {
  if (risk > 0.6) return "CRITICAL";
  if (risk > 0.3) return "ELEVATED";
  return "NOMINAL";
}

function getNodeIcon(nodeType: string): string {
  switch (nodeType) {
    case "origin": return "🏭";
    case "transit_hub": return "🔄";
    case "destination": return "🏁";
    case "alternate_hub": return "🔀";
    default: return "📍";
  }
}

const NodeCard = memo(({ data }: NodeProps) => {
  const { label, nodeType, risk, region, isAlternateRoute } = data as unknown as NodeCardData;
  const riskColor = getRiskColor(risk);
  const riskLabel = getRiskLabel(risk);
  const riskPercent = Math.round(risk * 100);
  const isCritical = risk > 0.6;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-slate-500 !border-slate-600 !w-2 !h-2" />
      <div
        className={`
          relative rounded-xl px-4 py-3 min-w-[160px]
          transition-all duration-300 cursor-pointer
          ${isCritical ? "animate-pulse-critical" : ""}
          ${isAlternateRoute ? "animate-reroute-glow" : ""}
        `}
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))",
          border: `2px solid ${riskColor}`,
          boxShadow: isCritical
            ? `0 0 20px ${riskColor}40, inset 0 1px 0 rgba(255,255,255,0.05)`
            : `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{getNodeIcon(nodeType)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {(label as string).replace(/_/g, " ")}
            </div>
            <div className="text-[10px] text-slate-400">{region}</div>
          </div>
        </div>

        {/* Risk Bar */}
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[10px] font-bold tracking-wider"
              style={{ color: riskColor }}
            >
              {riskLabel}
            </span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: riskColor }}
            >
              {riskPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${riskPercent}%`,
                backgroundColor: riskColor,
                boxShadow: `0 0 8px ${riskColor}80`,
              }}
            />
          </div>
        </div>

        {/* Alternate route badge */}
        {isAlternateRoute && (
          <div className="mt-2 text-center">
            <span className="text-[9px] font-bold bg-[#4285F4] text-white px-2 py-0.5 rounded-full">
              REROUTE ACTIVE
            </span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-500 !border-slate-600 !w-2 !h-2" />
    </>
  );
});

NodeCard.displayName = "NodeCard";
export default NodeCard;
