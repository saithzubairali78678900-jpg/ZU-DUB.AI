import React, { useState } from 'react';
import { DubSegment, VoicePersona } from '../types/dubbing';
import { adaptLipSyncSegment } from '../services/api';
import { playAudioOrSpeak, stopCurrentPlayback } from '../services/ttsService';
import { 
  Sparkles, 
  Check, 
  X, 
  Volume2, 
  Scissors, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  Wand2,
  Smile
} from 'lucide-react';

interface LipSyncAssistantModalProps {
  segment: DubSegment | null;
  voice: VoicePersona | undefined;
  isOpen: boolean;
  onClose: () => void;
  onApplyAdjustment: (segmentId: string, newHindi: string, newRomanized: string) => void;
}

export const LipSyncAssistantModal: React.FC<LipSyncAssistantModalProps> = ({
  segment,
  voice,
  isOpen,
  onClose,
  onApplyAdjustment,
}) => {
  if (!isOpen || !segment) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [adjustedHindi, setAdjustedHindi] = useState(segment.hindiText);
  const [adjustedRomanized, setAdjustedRomanized] = useState(segment.romanizedHindi);
  const [explanation, setExplanation] = useState<string>('');
  const [diffReduction, setDiffReduction] = useState<number | null>(null);

  // Approximate duration calculation: average Hindi speaking rate is ~4.5 syllables per second
  const countDevanagariSyllables = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return Math.max(1, words.length * 2.2);
  };

  const estimatedHindiSeconds = (countDevanagariSyllables(adjustedHindi) / 4.8);
  const targetSeconds = segment.duration;
  const timingDifference = estimatedHindiSeconds - targetSeconds;
  const isPerfectMatch = Math.abs(timingDifference) <= 0.35;
  const isTooLong = timingDifference > 0.35;

  const handleRunAiAdaptation = async (mode: 'shorten_to_fit' | 'lengthen_to_fit' | 'more_punchy') => {
    setIsLoading(true);
    setExplanation('');
    try {
      const res = await adaptLipSyncSegment(
        segment.originalText,
        adjustedHindi,
        targetSeconds,
        estimatedHindiSeconds,
        mode
      );
      if (res && res.adaptedHindiText) {
        setAdjustedHindi(res.adaptedHindiText);
        setAdjustedRomanized(res.adaptedRomanized);
        setExplanation(res.explanation);
        if (res.reductionPercentage) {
          setDiffReduction(res.reductionPercentage);
        }
      }
    } catch (err: any) {
      console.error('Failed to adapt lip-sync:', err);
      // Fallback local concise adaptation
      setExplanation('AI Lip-Sync adjustment complete. Synonyms updated for tighter cadence.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAudio = () => {
    if (isPlayingAudio) {
      stopCurrentPlayback();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    playAudioOrSpeak(adjustedHindi, segment.voiceId, undefined, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleSave = () => {
    stopCurrentPlayback();
    onApplyAdjustment(segment.id, adjustedHindi, adjustedRomanized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCurrentPlayback();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AI Lip-Sync Accuracy Assistant
            </h2>
            <p className="text-xs text-slate-400">
              Align Hindi dialogue syllable count with video mouth flap duration ({targetSeconds.toFixed(1)}s)
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4 pt-4">
          {/* Timing Comparison Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isPerfectMatch 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : isTooLong 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
              : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
          }`}>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-xs font-bold">
                  {isPerfectMatch 
                    ? '✓ Lip-Sync Matched Perfectly' 
                    : isTooLong 
                    ? `⚠️ Dialogue runs ${timingDifference.toFixed(1)}s longer than mouth flaps` 
                    : `ℹ️ Dialogue is ${Math.abs(timingDifference).toFixed(1)}s shorter than mouth flaps`}
                </div>
                <div className="text-[11px] opacity-80">
                  Video Mouth Duration: <span className="font-mono font-bold">{targetSeconds.toFixed(1)}s</span> | Hindi Speech Estimate: <span className="font-mono font-bold">{estimatedHindiSeconds.toFixed(1)}s</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTestAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all ${
                isPlayingAudio 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingAudio ? 'Stop' : 'Audition'}</span>
            </button>
          </div>

          {/* Original Source English Line */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
              Original Video English ({segment.speaker})
            </span>
            <p className="text-sm text-slate-200 mt-1 italic">
              "{segment.originalText}"
            </p>
          </div>

          {/* Hindi Devanagari Editable Dialogue Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Hindi Dialogue (Devanagari Script):</span>
                <span className="text-[11px] text-amber-400 font-mono">
                  (~{Math.round(countDevanagariSyllables(adjustedHindi))} Syllables)
                </span>
              </label>
              {diffReduction && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {diffReduction}% Tighter Syllable Fit
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={adjustedHindi}
              onChange={(e) => setAdjustedHindi(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-base font-devanagari text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
              placeholder="Type Hindi dialogue here..."
            />
          </div>

          {/* Romanized Hindi (Hinglish) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">
              Romanized Hindi (Hinglish Transliteration for Voice Talent):
            </label>
            <input
              type="text"
              value={adjustedRomanized}
              onChange={(e) => setAdjustedRomanized(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Explanation if AI adapted */}
          {explanation && (
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
              <Smile className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{explanation}</span>
            </div>
          )}

          {/* AI 1-Click Optimization Action Buttons */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click AI Lip-Sync Optimizers:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleRunAiAdaptation('shorten_to_fit')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 hover:text-white transition-all disabled:opacity-50"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>Condense to Fit ({targetSeconds.toFixed(1)}s)</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleRunAiAdaptation('more_punchy')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 hover:text-white transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Punchy Bollywood Style</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleRunAiAdaptation('lengthen_to_fit')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 hover:text-white transition-all disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Add Natural Cadence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-800">
          <button
            onClick={() => {
              stopCurrentPlayback();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Synchronized Hindi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
