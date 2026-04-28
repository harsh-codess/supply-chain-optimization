import { type CSSProperties } from 'react'
import { cn, clamp } from '../../lib/utils'

type StatusType = 'critical' | 'elevated' | 'nominal' | 'reroute'

interface DataCardProps {
  node: string
  status: StatusType
  risk?: number
  label?: string
  className?: string
  style?: CSSProperties
}

const STATUS_MAP: Record<StatusType, { text: string; color: string; bar: string }> = {
  critical: { text: 'CRITICAL', color: 'text-cb-red', bar: 'bg-cb-red' },
  elevated: { text: 'ELEVATED', color: 'text-cb-blue', bar: 'bg-cb-blue' },
  nominal: { text: 'NOMINAL', color: 'text-cb-mint', bar: 'bg-cb-mint' },
  reroute: { text: 'REROUTE OK', color: 'text-cb-mint', bar: 'bg-cb-mint' },
}

export function DataCard({
  node,
  status,
  risk,
  label,
  className,
  style,
}: DataCardProps) {
  const statusData = STATUS_MAP[status]
  const riskValue = risk === undefined ? undefined : clamp(risk, 0, 1)

  return (
    <div
      className={cn(
        'absolute card min-w-[168px] p-3',
        'bg-cb-surface/80 backdrop-blur-md',
        status === 'critical' && 'border-l-2 border-l-cb-red',
        status === 'elevated' && 'border-l-2 border-l-cb-blue',
        status === 'reroute' && 'border-l-2 border-l-cb-mint',
        status === 'nominal' && 'border-l-2 border-l-cb-text-3',
        className,
      )}
      style={style}
    >
      <p className="mb-1 font-mono text-[10px] tracking-widest text-cb-text-2">
        {node}
      </p>
      <p className={cn('font-mono text-[11px] font-medium', statusData.color)}>
        {statusData.text}
      </p>

      {riskValue !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-[2px] flex-1 bg-cb-border">
            <div
              className={cn('h-full', statusData.bar)}
              style={{ width: `${riskValue * 100}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-cb-text-2">
            {riskValue.toFixed(2)}
          </span>
        </div>
      )}

      {label && <p className="mt-1 font-mono text-[10px] text-cb-text-3">{label}</p>}
    </div>
  )
}