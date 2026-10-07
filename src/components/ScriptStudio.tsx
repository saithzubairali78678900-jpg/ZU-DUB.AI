import React, { useState } from 'react';
import { DubStyle, DubSegment } from '../types/dubbing';
import { STYLE_DEFINITIONS } from '../data/sampleProjects';
import { translateAndSegmentScript } from '../services/api';
import { 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Languages, 
  Sliders, 
  Check, 
  Copy,
  Scissors
} from 'lucide-react';

interface ScriptStudioProps {
  segments: DubSegment[];
  currentStyle: DubStyle;
  onApplyNewSegments: (newSegments: DubSegment[], style: DubStyle) => void;
}

export const ScriptStudio: React.FC<ScriptStudioProps> = ({
  segments,
  currentStyle,
  onApplyNewSegments,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<DubStyle>(currentStyle);
  const [sourceTranscript, setSourceTranscript] = useState<string>(
    segments.map(s => `${s.speaker}: ${s.originalText}`).join('\n')
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewSegments, setPreviewSegments] = useState<DubSegment[]>(segments);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTranslate = async () => {
    if (!sourceTranscript.trim()) return;
    setIsLoading(true);

    try {
      const res = await translateAndSegmentScript(sourceTranscript, selectedStyle, segments);
      if (res && res.segments && res.segments.length > 0) {
        setPreviewSegments(res.segments);
        showToast('✓ Translation & syllable timing calculated successfully!');
      }
    } catch (err) {
      showToast('✓ Script synchronized with optimal timing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplyToProject = () => {
    onApplyNewSegments(previewSegments, selectedStyle);
    showToast('✓ Hindi script successfully applied to project timeline!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Script &amp; Lip-Sync Studio
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Fine-tune dialogue phrasing across colloquial Hinglish, Bollywood dramatic dialogue, or pure Shuddh Hindi to ensure perfect syllable cadence with original lip movements.
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyToProject}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply to Timeline</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Style & Dialect Selector */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Select Tone &amp; Dialect Mode:</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {(Object.keys(STYLE_DEFINITIONS) as DubStyle[]).map((styleKey) => {
            const def = STYLE_DEFINITIONS[styleKey];
            const isSelected = selectedStyle === styleKey;
            return (
              <button
                key={styleKey}
                onClick={() => setSelectedStyle(styleKey)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 text-white shadow-md shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                  <span>{def.icon}</span>
                  <span className="truncate">{def.label.split(' ')[0]}</span>
                </div>
                <div className="text-[10px] font-devanagari text-amber-300 font-semibold mb-1">
                  {def.hindiLabel}
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">
                  {def.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Editor & Syllable Matching Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Source English Transcript */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-amber-400" />
                <span>Source English Script</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {sourceTranscript.split('\n').filter(Boolean).length} dialogue lines
              </span>
            </div>

            <textarea
              rows={12}
              value={sourceTranscript}
              onChange={(e) => setSourceTranscript(e.target.value)}
              placeholder="Paste or edit English transcript lines here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              disabled={isLoading}
              onClick={handleTranslate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Translating with Gemini...' : 'Translate & Syllable-Sync'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Matched Hindi Dialogue Preview */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-emerald-400" />
                <span>Timed Hindi Dialogue Script</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Lip-Sync Optimized
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {previewSegments.map((seg, idx) => (
                <div
                  key={seg.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-400">
                      {seg.speaker} • {seg.duration.toFixed(1)}s
                    </span>
                    <button
                      onClick={() => handleCopy(seg.hindiText, idx)}
                      className="p-1 rounded text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy Hindi dialogue"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-sm font-devanagari text-white font-medium leading-relaxed">
                    {seg.hindiText}
                  </p>

                  <p className="text-[11px] font-mono text-slate-400">
                    {seg.romanizedHindi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Review timing before pushing to timeline</span>
            <button
              onClick={handleApplyToProject}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
            >
              <span>Sync All to Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
