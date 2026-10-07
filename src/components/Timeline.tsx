import React from 'react';
import { DubSegment } from '../types/dubbing';
import { Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface TimelineProps {
  segments: DubSegment[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  segments,
  duration,
  currentTime,
  onSeek,
  selectedSegmentId,
  onSelectSegment,
}) => {
  const safeDuration = Math.max(duration, 10);
  const playheadPercent = (currentTime / safeDuration) * 100;

  // Generate tick markers every 2 or 5 seconds
  const tickInterval = safeDuration > 60 ? 10 : 2;
  const numTicks = Math.ceil(safeDuration / tickInterval);
  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => i * tickInterval);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            Visual Timeline &amp; Lip-Sync Tracker
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Matched
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Check Timing
          </span>
          <span className="text-amber-400 font-bold">
            {segments.length} Hindi Dialogue Segments
          </span>
        </div>
      </div>

      {/* Interactive Timeline Canvas Container */}
      <div 
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          onSeek(ratio * safeDuration);
        }}
        className="relative h-24 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer overflow-hidden select-none"
      >
        {/* Time ruler ticks */}
        <div className="absolute inset-x-0 top-0 h-6 bg-slate-900/60 border-b border-slate-800 flex items-center px-1 text-[9px] font-mono text-slate-400">
          {ticks.map((t) => {
            const leftPercent = (t / safeDuration) * 100;
            if (leftPercent > 100) return null;
            return (
              <div
                key={t}
                style={{ left: `${leftPercent}%` }}
                className="absolute flex flex-col items-center -translate-x-1/2 pointer-events-none"
              >
                <span>{t}s</span>
                <span className="h-1.5 w-px bg-slate-700"></span>
              </div>
            );
          })}
        </div>

        {/* Audio Waveform background lines simulation */}
        <div className="absolute inset-x-0 top-7 bottom-0 opacity-15 flex items-center justify-between px-2 pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              style={{ height: `${20 + Math.sin(i * 0.4) * 35}%` }}
              className="w-1 bg-amber-400 rounded-full"
            />
          ))}
        </div>

        {/* Segment Blocks */}
        <div className="absolute inset-x-0 top-7 bottom-1 px-1">
          {segments.map((seg) => {
            const left = (seg.start / safeDuration) * 100;
            const width = Math.max(1.5, ((seg.end - seg.start) / safeDuration) * 100);
            const isSelected = selectedSegmentId === seg.id;
            const isCurrent = currentTime >= seg.start && currentTime <= seg.end;

            // Border color by sync rating
            const statusColor = 
              seg.syllableRating === 'slightly_long' 
                ? 'border-amber-400 bg-amber-500/20' 
                : 'border-emerald-500/80 bg-emerald-500/15';

            return (
              <div
                key={seg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSegment(seg.id);
                  onSeek(seg.start);
                }}
                style={{ left: `${left}%`, width: `${width}%` }}
                className={`absolute top-1 bottom-1 rounded-lg border px-2 py-1 flex flex-col justify-between transition-all group overflow-hidden ${statusColor} ${
                  isSelected
                    ? 'ring-2 ring-amber-400 bg-amber-500/30 z-20 shadow-lg shadow-amber-500/20'
                    : isCurrent
                    ? 'ring-1 ring-white/60 z-10'
                    : 'hover:brightness-125'
                }`}
                title={`[${seg.speaker}] ${seg.hindiText}`}
              >
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="font-bold text-amber-300 truncate">
                    {seg.speaker}
                  </span>
                  <span className="font-mono text-slate-300 text-[9px] shrink-0">
                    {(seg.end - seg.start).toFixed(1)}s
                  </span>
                </div>
                <p className="text-[10px] text-white/90 font-devanagari truncate font-medium">
                  {seg.hindiText}
                </p>
              </div>
            );
          })}
        </div>

        {/* Playhead Indicator Line */}
        <div
          style={{ left: `${playheadPercent}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-lg shadow-amber-400 z-30 pointer-events-none transition-all flex flex-col items-center"
        >
          <div className="w-3 h-3 bg-amber-400 rotate-45 -translate-y-1 shadow-md"></div>
        </div>
      </div>
    </div>
  );
};
