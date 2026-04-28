import { useState, useEffect, useRef } from "react";
import { getWeatherFeed, type WeatherEntry } from "../lib/api";
import { Activity, Wind, Thermometer, Droplets, Zap, Radio } from "lucide-react";

function getActionStyle(action: string, autoTriggered: boolean) {
  if (autoTriggered || action === "DISRUPTION_FLAGGED")
    return { dot: "bg-red-500", text: "text-red-400", badge: "bg-red-500/20 border-red-500/30 text-red-400", label: "⚡ DISRUPTION FLAGGED" };
  if (action === "RISK_ELEVATED")
    return { dot: "bg-yellow-400", text: "text-yellow-400", badge: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400", label: "⚠ RISK ELEVATED" };
  return { dot: "bg-green-400", text: "text-green-400", badge: "bg-green-500/20 border-green-500/30 text-green-400", label: "✓ NOMINAL" };
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

export default function LiveDataFeed() {
  const [feed, setFeed] = useState<WeatherEntry[]>([]);
  const [fetching, setFetching] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  const prevFeedLen = useRef(0);

  const fetchFeed = async () => {
    setFetching(true);
    try {
      const { feed: data } = await getWeatherFeed();
      // Detect new entries for flash animation
      if (data.length > prevFeedLen.current) {
        const newIds = new Set(data.slice(0, data.length - prevFeedLen.current).map(e => e.timestamp + e.node_id));
        setNewEntryIds(newIds);
        setTimeout(() => setNewEntryIds(new Set()), 1500);
      }
      prevFeedLen.current = data.length;
      setFeed(data);
      setLastFetch(new Date());
    } catch {
      // backend may not have data yet
    } finally {
      setFetching(false);
      setCountdown(10);
    }
  };

  // Poll every 10 seconds
  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 10_000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [lastFetch]);

  // Force re-render for "X ago" timestamps
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Radio className="w-3.5 h-3.5 text-[#34A853]" />
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Weather Feed</span>
        <div className="ml-auto flex items-center gap-1.5">
          {fetching ? (
            <span className="text-[9px] font-bold text-[#34A853] animate-pulse tracking-widest">FETCHING…</span>
          ) : (
            <span className="text-[9px] text-zinc-600">next in {countdown}s</span>
          )}
          <div className={`w-1.5 h-1.5 rounded-full ${fetching ? "bg-[#34A853] animate-pulse" : "bg-zinc-700"}`} />
        </div>
      </div>

      {/* Feed entries */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        {feed.length === 0 ? (
          <div className="text-center py-6 text-zinc-600 text-xs">
            Waiting for first weather poll…
          </div>
        ) : (
          feed.map((entry) => {
            const key = entry.timestamp + entry.node_id;
            const style = getActionStyle(entry.action, entry.auto_triggered);
            const isNew = newEntryIds.has(key);

            return (
              <div
                key={key}
                className={`rounded-lg border px-3 py-2 transition-all duration-500 ${
                  isNew ? "scale-[1.02] border-white/20 bg-white/5" : "border-white/5 bg-zinc-900/40"
                }`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <span className="text-[11px] font-bold text-white">{entry.city}</span>
                    <span className="text-[9px] text-zinc-600">{entry.node_id.replace(/_/g, " ")}</span>
                  </div>
                  <span className="text-[9px] text-zinc-600">{timeAgo(entry.timestamp)}</span>
                </div>

                {/* Weather metrics row */}
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] text-zinc-300 font-mono">{entry.temp_c}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] text-zinc-300 font-mono">{entry.wind_kmh} km/h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] text-zinc-300 font-mono">{entry.humidity}%</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 ml-auto truncate max-w-[80px]">{entry.condition}</span>
                </div>

                {/* Risk + action row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-zinc-500" />
                    <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${entry.risk_pct}%`,
                          backgroundColor: entry.risk_pct > 60 ? "#EA4335" : entry.risk_pct > 30 ? "#FBBC04" : "#34A853",
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400">{entry.risk_pct}%</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${style.badge}`}>
                    {entry.auto_triggered && <Zap className="w-2.5 h-2.5 inline mr-0.5" />}
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[8px] text-zinc-700 mt-1.5 text-center">
        OpenWeatherMap API · Real-time · Polling every 60s backend / 10s frontend
      </p>
    </div>
  );
}
