import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  Cpu, 
  Mic2, 
  Film, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Layers
} from 'lucide-react';

interface StartupSplashScreenProps {
  onComplete: () => void;
}

export const StartupSplashScreen: React.FC<StartupSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const startupSteps = [
    {
      id: 'neural',
      label: 'Initializing Gemini Neural Engine & AI Translation Pipeline...',
      detail: 'Connecting to multi-tier Flash models for sub-second Hindi dubbing',
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
      targetProgress: 25,
    },
    {
      id: 'voices',
      label: 'Loading 6 Indian Voice Personas & Acoustic Profiles...',
      detail: 'Calibrating Aditi, Kabir, Rohan, Priya, Dev, and Ananya voice models',
      icon: <Mic2 className="w-4 h-4 text-emerald-400" />,
      targetProgress: 55,
    },
    {
      id: 'lipsync',
      label: 'Pre-warming Syllable-Sync & Lip-Flap Calibrator...',
      detail: 'Setting up mouth movement duration alignment and Hinglish dictionary',
      icon: <Film className="w-4 h-4 text-sky-400" />,
      targetProgress: 80,
    },
    {
      id: 'selfhealing',
      label: 'Activating Universal AI Self-Healing Subsystems...',
      detail: 'Zero-crash guards, auto-retry re-routers, and offline canvas fallback active',
      icon: <ShieldCheck className="w-4 h-4 text-orange-400" />,
      targetProgress: 95,
    },
    {
      id: 'ready',
      label: 'Ready! Launching ZU VIDEO DUB.AI Studio...',
      detail: 'Welcome to free & unlimited Hindi video dubbing',
      icon: <Sparkles className="w-4 h-4 text-amber-300" />,
      targetProgress: 100,
    },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const totalDuration = 2200; // 2.2 seconds total startup load

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(currentPct);

      if (currentPct < 25) {
        setCurrentStepIndex(0);
      } else if (currentPct < 55) {
        setCurrentStepIndex(1);
      } else if (currentPct < 80) {
        setCurrentStepIndex(2);
      } else if (currentPct < 95) {
        setCurrentStepIndex(3);
      } else {
        setCurrentStepIndex(4);
      }

      if (currentPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(onComplete, 450);
        }, 400);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950 text-white transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      {/* Background Animated Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/20 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10 flex flex-col items-center text-center">
        {/* Brand Logo & Aura */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 shadow-2xl shadow-amber-500/30 text-slate-950 font-black text-3xl tracking-tighter ring-4 ring-amber-400/20 animate-bounce">
            <span>ZU</span>
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>ZU VIDEO DUB</span>
              <span className="text-amber-400 font-mono text-sm uppercase px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30">
                .AI
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Next-Gen AI Hindi Video Dubbing &amp; Syllable Lip-Sync Engine
            </p>
          </div>
        </div>

        {/* Audio Spectrum Wave Animation */}
        <div className="flex items-center justify-center gap-1.5 h-8">
          {[18, 28, 12, 32, 22, 14, 30, 24, 16, 28, 20].map((h, i) => (
            <span
              key={i}
              style={{
                height: `${Math.max(6, (h * progress) / 100)}px`,
                animationDelay: `${i * 80}ms`,
              }}
              className="w-1.5 bg-gradient-to-t from-amber-500 to-orange-400 rounded-full transition-all duration-150 animate-pulse"
            />
          ))}
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Studio Initialization</span>
            </span>
            <span className="text-amber-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 relative shadow-inner">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 rounded-full transition-all duration-100 relative shadow-lg shadow-amber-500/50"
            >
              <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/60 rounded-full blur-[1px]" />
            </div>
          </div>
        </div>

        {/* Dynamic Checklist Steps */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 backdrop-blur-md shadow-xl">
          {startupSteps.map((step, idx) => {
            const isFinished = progress >= step.targetProgress;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-2.5 transition-all duration-200 text-xs ${
                  isFinished
                    ? 'text-emerald-400 opacity-100'
                    : isCurrent
                    ? 'text-white opacity-100 font-semibold'
                    : 'text-slate-600 opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isFinished ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center animate-spin">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center text-[9px] text-slate-500">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs leading-tight">
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug animate-in fade-in">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="text-xs text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors pt-2 cursor-pointer font-medium"
        >
          <span>Skip directly to Studio</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
