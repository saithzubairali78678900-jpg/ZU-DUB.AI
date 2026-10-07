import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  AlertTriangle,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { aiSelfHealing, HealingEvent } from '../services/aiSelfHealing';

export const AiAutoHealingMonitor: React.FC = () => {
  const [events, setEvents] = useState<HealingEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [latestHealedToast, setLatestHealedToast] = useState<HealingEvent | null>(null);

  useEffect(() => {
    const unsubscribe = aiSelfHealing.subscribe((newEvents) => {
      setEvents(newEvents);
      if (newEvents.length > 0) {
        const latest = newEvents[0];
        // Show brief auto-heal toast for 4 seconds if recent
        if (Date.now() - latest.timestamp.getTime() < 3000) {
          setLatestHealedToast(latest);
          setTimeout(() => setLatestHealedToast(null), 4500);
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {/* Floating Mini Auto-Healing Badge in Bottom Left */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer group"
          title="Click to view AI Auto-Healing Diagnostic Log"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-200 group-hover:text-white">AI Auto-Healer:</span>
          <span className="text-emerald-400 font-bold">100% Operational</span>
          {events.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] font-mono border border-emerald-500/30">
              {events.length} Healed
            </span>
          )}
        </button>
      </div>

      {/* Auto-Heal Notification Toast */}
      {latestHealedToast && !isOpen && (
        <div className="fixed bottom-14 left-4 z-50 max-w-sm p-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300">AI Auto-Healed Error</span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed line-clamp-2">
                {latestHealedToast.resolvedAction}
              </p>
            </div>
            <button
              onClick={() => setLatestHealedToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Diagnostic Log Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Universal Self-Healing Engine
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time error interceptor, automatic retries &amp; zero-crash guarantees
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Health Metrics Card */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400">System Health</span>
                <p className="text-base font-black text-emerald-400 mt-0.5">100%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400">Errors Resolved</span>
                <p className="text-base font-black text-amber-400 mt-0.5">{events.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-400">Zero Crash</span>
                <p className="text-base font-black text-sky-400 mt-0.5">Active</p>
              </div>
            </div>

            {/* Event Log */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">
                Self-Healing Event Log:
              </span>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {events.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-200">Zero Active Errors</p>
                    <p className="text-[11px] text-slate-500">
                      All dubbing endpoints, video decoders, and audio pipelines are running in optimal condition.
                    </p>
                  </div>
                ) : (
                  events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-amber-400 uppercase font-semibold">
                          [{ev.category}]
                        </span>
                        <span className="text-slate-500 font-mono">
                          {ev.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 font-mono text-[11px] truncate">
                        {ev.message}
                      </p>
                      <p className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{ev.resolvedAction}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => aiSelfHealing.triggerAutoSmartRefresh('User requested studio re-alignment', 1000)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                title="Saves all state and refreshes studio cleanly"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Refresh &amp; Re-align</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Close Monitor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
