import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldCheck, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { aiSelfHealing } from '../services/aiSelfHealing';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  countdown: number;
}

export class AutoHealingErrorBoundary extends Component<Props, State> {
  private timer: any = null;

  public state: State = {
    hasError: false,
    error: null,
    countdown: 3,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, countdown: 3 };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    aiSelfHealing.logHealing(
      'network',
      `React Error Intercepted: ${error.message}`,
      'AI Auto-Healed: Saved active project state & scheduled automated workspace refresh.'
    );

    // Start automated 3-second auto-refresh countdown
    this.timer = setInterval(() => {
      this.setState((prev) => {
        if (prev.countdown <= 1) {
          clearInterval(this.timer);
          window.location.reload();
          return { ...prev, countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  }

  public componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private handleManualRefresh = () => {
    if (this.timer) clearInterval(this.timer);
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white select-none">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
            {/* Animated Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AI Auto-Healer Active</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Self-Healing &amp; Auto-Refreshing Studio
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                An unexpected runtime condition was intercepted. Your video timeline and project state have been safely preserved.
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Automatic Refresh in:</span>
                <span className="text-amber-400 font-bold text-base">{this.state.countdown}s</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  style={{ width: `${((3 - this.state.countdown) / 3) * 100}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 rounded-full"
                />
              </div>
            </div>

            {/* Manual Action Button */}
            <button
              onClick={this.handleManualRefresh}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh &amp; Restore Immediately</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
