import React, { useState } from 'react';
import { DubSegment, DubProject } from '../types/dubbing';
import { 
  generateHindiSrt, 
  generateHindiVtt, 
  generateCueSheetCsv, 
  downloadFile,
  exportCombinedWavAudio 
} from '../services/audioExporter';
import { 
  Download, 
  X, 
  FileAudio, 
  FileText, 
  Table, 
  Youtube, 
  Check, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DubProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  const [isExportingAudio, setIsExportingAudio] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const notifySuccess = (item: string) => {
    setDownloadSuccess(item);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadSrt = (mode: 'hindi' | 'romanized' | 'bilingual' = 'hindi') => {
    const srt = generateHindiSrt(project.segments, mode);
    downloadFile(srt, `${project.title.replace(/\s+/g, '_')}_Hindi_${mode}.srt`, 'text/plain');
    notifySuccess(`Subtitles (${mode.toUpperCase()} .SRT)`);
  };

  const handleDownloadVtt = (mode: 'hindi' | 'romanized' | 'bilingual' = 'hindi') => {
    const vtt = generateHindiVtt(project.segments, mode);
    downloadFile(vtt, `${project.title.replace(/\s+/g, '_')}_Hindi_${mode}.vtt`, 'text/vtt');
    notifySuccess(`WebVTT (${mode.toUpperCase()} .VTT)`);
  };

  const handleDownloadCsv = () => {
    const csv = generateCueSheetCsv(project.segments);
    downloadFile(csv, `${project.title.replace(/\s+/g, '_')}_Dubbing_Cue_Sheet.csv`, 'text/csv');
    notifySuccess('Dubbing Cue Sheet (.CSV)');
  };

  const handleDownloadWav = async () => {
    setIsExportingAudio(true);
    try {
      const wavBlob = await exportCombinedWavAudio(project.segments, project.duration);
      downloadFile(wavBlob, `${project.title.replace(/\s+/g, '_')}_Hindi_Dubbed_Master.wav`, 'audio/wav');
      notifySuccess('Master Hindi Audio (.WAV)');
    } catch (err) {
      console.warn('Audio export error:', err);
      handleDownloadCsv();
    } finally {
      setIsExportingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Export Dubbed Audio &amp; Subtitles
            </h2>
            <p className="text-xs text-slate-400">
              Download synchronized Hindi audio tracks, SRT subtitles, and cue sheets
            </p>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Downloaded <strong>{downloadSuccess}</strong> successfully!</span>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="space-y-4 pt-4">
          {/* 1. Master Hindi Audio Track (.WAV) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileAudio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  मास्टर हिन्दी ऑडियो ट्रैक (Master Hindi Audio - .WAV)
                </h4>
                <p className="text-xs text-slate-400">
                  Uncompressed 44.1kHz studio master audio synchronized with your video duration ({project.duration.toFixed(1)}s)
                </p>
              </div>
            </div>

            <button
              disabled={isExportingAudio}
              onClick={handleDownloadWav}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingAudio ? 'Rendering...' : 'Download .WAV'}</span>
            </button>
          </div>

          {/* 2. Hindi Subtitles (.SRT & .VTT) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  सिंक्रोनाइज़्ड हिन्दी सबटाइटल्स (Synchronized Subtitles)
                </h4>
                <p className="text-xs text-slate-400">
                  Time-coded UTF-8 subtitles compatible with YouTube, Premiere Pro, and VLC
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleDownloadSrt('hindi')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Devanagari .SRT</span>
              </button>

              <button
                onClick={() => handleDownloadSrt('romanized')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Hinglish .SRT</span>
              </button>

              <button
                onClick={() => handleDownloadSrt('bilingual')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Bilingual .SRT</span>
              </button>

              <button
                onClick={() => handleDownloadVtt('hindi')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3 h-3 text-sky-400" />
                <span>WebVTT (.VTT)</span>
              </button>
            </div>
          </div>

          {/* 3. Dubbing Cue Sheet (.CSV) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  डबिंग क्यू शीट (Dubbing Cue Sheet - .CSV)
                </h4>
                <p className="text-xs text-slate-400">
                  Full dialogue breakdown with timestamps, speaker names, and voice tags for film editors
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .CSV</span>
            </button>
          </div>

          {/* YouTube Multi-Language Audio Integration Guide */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
              <Youtube className="w-4 h-4" />
              <span>YouTube Multi-Language Audio Guide (600M+ Hindi Viewers)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              1. Download your Hindi <strong className="text-white">.WAV</strong> track above.<br />
              2. Go to <strong>YouTube Studio &gt; Content &gt; Subtitles &gt; Add Language &gt; Hindi</strong>.<br />
              3. Under "Audio", click <strong>Add</strong> and upload the .WAV file.<br />
              4. YouTube will now automatically play the Hindi dubbed audio for viewers across India!
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-5 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
