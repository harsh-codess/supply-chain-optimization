import { useState, useEffect, Suspense, lazy } from "react";
import DashboardApp from "./DashboardApp";

// Lazy-load landing page components to keep dashboard bundle untouched
const Navbar = lazy(() => import("./components/layout/Navbar").then(m => ({ default: m.Navbar })));
const Footer = lazy(() => import("./components/layout/Footer").then(m => ({ default: m.Footer })));
const Hero = lazy(() => import("./components/sections/Hero").then(m => ({ default: m.Hero })));
const WhatItDoes = lazy(() => import("./components/sections/WhatItDoes").then(m => ({ default: m.WhatItDoes })));
const MetricsTicker = lazy(() => import("./components/sections/MetricsTicker").then(m => ({ default: m.MetricsTicker })));
const Scenarios = lazy(() => import("./components/sections/Scenarios").then(m => ({ default: m.Scenarios })));
const CallToAction = lazy(() => import("./components/sections/CallToAction").then(m => ({ default: m.CallToAction })));
const NetworkCanvas = lazy(() => import("./components/canvas/NetworkCanvas").then(m => ({ default: m.NetworkCanvas })));

type ViewMode = "landing" | "dashboard";

function resolveView(): ViewMode {
  return window.location.hash.toLowerCase() === "#dashboard" ? "dashboard" : "landing";
}

export default function App() {
  const [view, setView] = useState<ViewMode>(resolveView);

  useEffect(() => {
    const onHash = () => setView(resolveView());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goToDashboard = () => {
    window.location.hash = "dashboard";
    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const goToLanding = () => {
    window.history.replaceState(null, document.title, window.location.pathname);
    setView("landing");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // ── Dashboard: render the EXACT original dashboard, untouched ──────────
  if (view === "dashboard") {
    return (
      <div className="h-screen w-screen flex flex-col bg-black overflow-hidden">
        {/* Thin top bar with back button */}
        <div className="flex-none flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-black">
          <button
            onClick={goToLanding}
            className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            BACK TO HOME
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[11px] font-mono text-zinc-600 tracking-widest hidden sm:block">SUPPLYGUARD AI — LIVE DASHBOARD</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono text-green-400">LIVE</span>
          </div>
        </div>

        {/* Mobile message — shown on small screens instead of 3-col layout */}
        <div className="flex-1 min-h-0 flex sm:hidden flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Open on Desktop</p>
            <p className="text-zinc-500 text-sm leading-relaxed">The live dashboard requires a wider screen to display the network graph, AI analysis, and control panels.</p>
          </div>
          <div className="w-full max-w-xs rounded-xl border border-white/5 bg-zinc-900/50 p-4 text-left space-y-3">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">System Status</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Monitoring</span>
              <span className="text-xs font-mono text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"/>ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Nodes tracked</span>
              <span className="text-xs font-mono text-white">7 global ports</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Push notifications</span>
              <span className="text-xs font-mono text-green-400">✓ Registered</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">AI Engine</span>
              <span className="text-xs font-mono text-[#4285F4]">Gemini 2.5 Flash</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-700">You'll still receive push notifications on this device when disruptions are detected.</p>
        </div>

        {/* Full dashboard — hidden on small screens */}
        <div className="flex-1 min-h-0 hidden sm:block">
          <DashboardApp />
        </div>
      </div>
    );
  }

  // ── Landing Page ───────────────────────────────────────────────────────
  return (
    <div className="landing-page noise-overlay" style={{ position: "relative", minHeight: "100vh" }}>
      <Suspense fallback={null}>
        <NetworkCanvas />
      </Suspense>
      <div style={{ position: "relative", zIndex: 10 }}>
        <Suspense fallback={null}>
          <Navbar />
          <main>
            <Hero onLaunchDashboard={goToDashboard} />
            <WhatItDoes />
            <MetricsTicker />
            <Scenarios />
            <CallToAction onLaunchDashboard={goToDashboard} onReadDocs={() => window.open("/api/docs", "_blank")} />
          </main>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
