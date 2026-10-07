import React, { useState } from 'react';
import { DubSegment, VoicePersona } from '../types/dubbing';
import { HINDI_VOICES } from '../data/sampleProjects';
import { playAudioOrSpeak, stopCurrentPlayback } from '../services/ttsService';
import { 
  Play, 
  Pause, 
  Scissors, 
  Sparkles, 
  Volume2, 
  Edit3, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  Plus,
  Trash2,
  VolumeX
} from 'lucide-react';

interface SegmentListProps {
  segments: DubSegment[];
  onUpdateSegment: (segmentId: string, updated: Partial<DubSegment>) => void;
  onOpenLipSyncModal: (segment: DubSegment) => void;
  onSeek: (time: number) => void;
  currentTime: number;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  onSynthesizeSegment: (segmentId: string) => void;
  onAddSegment: () => void;
  onDeleteSegment: (id: string) => void;
  onAutoDubAll: () => void;
  isAutoDubbingAll: boolean;
}

export const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  onUpdateSegment,
  onOpenLipSyncModal,
  onSeek,
  currentTime,
  selectedSegmentId,
  onSelectSegment,
  onSynthesizeSegment,
  onAddSegment,
  onDeleteSegment,
  onAutoDubAll,
  isAutoDubbingAll,
}) => {
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);

  const handleAudition = (segment: DubSegment) => {
    if (playingSegmentId === segment.id) {
      stopCurrentPlayback();
      setPlayingSegmentId(null);
      return;
    }
    setPlayingSegmentId(segment.id);
    playAudioOrSpeak(segment.hindiText, segment.voiceId, segment.audioUrl, () => {
      setPlayingSegmentId(null);
    });
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      {/* Header & Batch Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Dialogue &amp; Lip-Sync Editor
          </h3>
          <p className="text-[11px] text-slate-400">
            {segments.length} segments with syllable timing and individual voice assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddSegment}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Add dialogue segment"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Segment</span>
          </button>

          <button
            disabled={isAutoDubbingAll}
            onClick={onAutoDubAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAutoDubbingAll ? 'Synthesizing All...' : 'Auto-Dub All (1-Click)'}</span>
          </button>
        </div>
      </div>

      {/* Segments Scrollable List */}
      <div className="space-y-3 mt-3 overflow-y-auto max-h-[600px] pr-1">
        {segments.map((seg, idx) => {
          const isSelected = selectedSegmentId === seg.id;
          const isCurrentTime = currentTime >= seg.start && currentTime <= seg.end;
          const isPlaying = playingSegmentId === seg.id;
          const assignedVoice = HINDI_VOICES.find(v => v.id === seg.voiceId) || HINDI_VOICES[0];

          return (
            <div
              key={seg.id}
              onClick={() => {
                onSelectSegment(seg.id);
                onSeek(seg.start);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : isCurrentTime
                  ? 'border-slate-700 bg-slate-800/80'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
              }`}
            >
              {/* Card Top: Timing, Speaker, Voice & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-xs">
                {/* Left: Index badge & Timestamps */}
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                    {idx + 1}
                  </span>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{seg.start.toFixed(1)}s</span>
                    <span>→</span>
                    <span>{seg.end.toFixed(1)}s</span>
                    <span className="text-amber-400 font-bold">({seg.duration.toFixed(1)}s)</span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-300">
                    {seg.speaker}
                  </span>
                </div>

                {/* Right: Assigned Hindi Voice picker & Lip-Sync Action */}
                <div className="flex items-center gap-1.5">
                  {/* Voice Selector */}
                  <select
                    value={seg.voiceId}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdateSegment(seg.id, { voiceId: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    {HINDI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.hindiName})
                      </option>
                    ))}
                  </select>

                  {/* Audition Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAudition(seg);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isPlaying
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30'
                    }`}
                    title="Audition Hindi Voice"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                  </button>

                  {/* AI Lip-Sync Accuracy Assistant Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLipSyncModal(seg);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 transition-all"
                    title="Open Lip-Sync Accuracy Assistant"
                  >
                    <Scissors className="w-3 h-3 text-amber-400" />
                    <span>Lip-Sync</span>
                  </button>

                  {/* Delete segment button */}
                  {segments.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSegment(seg.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete segment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Hindi Devanagari Editable Dialogue Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">
                    Hindi Dubbed Dialogue (Devanagari):
                  </span>
                  <span className="text-amber-400 font-mono text-[10px]">
                    Voice: {assignedVoice.name}
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={seg.hindiText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdateSegment(seg.id, { hindiText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm font-devanagari text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              {/* Romanized Hindi & English Reference */}
              <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
                <p className="truncate italic">
                  <span className="text-slate-400 font-mono">Original:</span> "{seg.originalText}"
                </p>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  Lip-Sync: {seg.syllableRating || 'matched'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
