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

const NodeCard = memo(({ data }: NodeProps) => {
  const { label, nodeType: _nodeType, risk, region, isAlternateRoute } = data as unknown as NodeCardData;
  const riskColor = getRiskColor(risk);
  const riskLabel = getRiskLabel(risk);
  const riskPercent = Math.round(risk * 100);
  const isCritical = risk > 0.6;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-zinc-700 !border-zinc-600 !w-2 !h-2"
      />
      <div
        className={`
          relative rounded-xl px-4 py-3 min-w-[155px]
          transition-all duration-300 cursor-pointer
          ${isCritical ? "animate-pulse-critical" : ""}
          ${isAlternateRoute ? "animate-reroute-glow" : ""}
        `}
        style={{
          background: "linear-gradient(135deg, #0d0d0d 0%, #080808 100%)",
          border: `2px solid ${riskColor}`,
          boxShadow: isCritical
            ? `0 0 20px ${riskColor}40`
            : `0 4px 16px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Node name */}
        <div className="mb-2">
          <div className="text-xs font-bold text-white tracking-wide leading-tight">
            {(label as string).replace(/_/g, " ")}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{region}</div>
        </div>

        {/* Risk bar */}
        <div>
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
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${riskPercent}%`,
                backgroundColor: riskColor,
                boxShadow: riskPercent > 0 ? `0 0 6px ${riskColor}80` : "none",
              }}
            />
          </div>
        </div>

        {/* Alternate route badge */}
        {isAlternateRoute && (
          <div className="mt-2 text-center">
            <span className="text-[9px] font-bold bg-[#4285F4] text-white px-2 py-0.5 rounded-full tracking-wider">
              REROUTE ACTIVE
            </span>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-zinc-700 !border-zinc-600 !w-2 !h-2"
      />
    </>
  );
});

NodeCard.displayName = "NodeCard";
export default NodeCard;
