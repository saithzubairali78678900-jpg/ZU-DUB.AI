import React from 'react';
import { Volume2, VolumeX, Sliders, Mic2, Disc, Sparkles } from 'lucide-react';
import { AudioMixerSettings, AudioTrackMode } from '../types/dubbing';

interface AudioMixerProps {
  settings: AudioMixerSettings;
  onChange: (settings: AudioMixerSettings) => void;
  audioTrackMode: AudioTrackMode;
  onAudioTrackModeChange: (mode: AudioTrackMode) => void;
  isPlaying: boolean;
}

export const AudioMixer: React.FC<AudioMixerProps> = ({
  settings,
  onChange,
  audioTrackMode,
  onAudioTrackModeChange,
  isPlaying,
}) => {
  const updateSetting = <K extends keyof AudioMixerSettings>(key: K, value: AudioMixerSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Dual-Track Audio Mixer
            </h3>
            <p className="text-[11px] text-slate-400">
              Balance original background score &amp; Hindi dubbed vocals with auto-ducking
            </p>
          </div>
        </div>

        {/* Live Signal Activity Light */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          <span className="text-slate-300">{isPlaying ? 'LIVE MIX' : 'STANDBY'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
        {/* Track 1: Original Audio (Music / SFX) */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">Original Video Audio</span>
            </div>
            <button
              onClick={() => updateSetting('isSourceMuted', !settings.isSourceMuted)}
              className={`p-1 rounded text-xs transition-colors ${
                settings.isSourceMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={settings.isSourceMuted ? 'Unmute Original' : 'Mute Original'}
            >
              {settings.isSourceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Volume</span>
              <span className="text-amber-400 font-bold">{Math.round(settings.sourceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sourceVolume}
              disabled={settings.isSourceMuted}
              onChange={(e) => updateSetting('sourceVolume', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
            />
          </div>

          <p className="text-[10px] text-slate-500 mt-2">
            Contains original background music and Foley SFX.
          </p>
        </div>

        {/* Track 2: Hindi Dubbed Voice Track */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">Hindi Dubbed Vocals</span>
            </div>
            <button
              onClick={() => updateSetting('isHindiMuted', !settings.isHindiMuted)}
              className={`p-1 rounded text-xs transition-colors ${
                settings.isHindiMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
              title={settings.isHindiMuted ? 'Unmute Hindi' : 'Mute Hindi'}
            >
              {settings.isHindiMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Volume</span>
              <span className="text-amber-400 font-bold">{Math.round(settings.hindiVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.hindiVolume}
              disabled={settings.isHindiMuted}
              onChange={(e) => updateSetting('hindiVolume', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
            />
          </div>

          <p className="text-[10px] text-amber-400/80 mt-2 font-medium">
            Studio-mastered synthesized Hindi voice.
          </p>
        </div>

        {/* Track 3: Smart Auto-Ducking & Master Mix */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Smart Auto-Ducking</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              ACTIVE
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>BG Music Level</span>
              <span className="text-emerald-400 font-bold">{Math.round(settings.duckingAmount * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.05}
              value={settings.duckingAmount}
              onChange={(e) => updateSetting('duckingAmount', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <p className="text-[10px] text-slate-500 mt-2">
            Lowers original speech when Hindi vocals speak so music stays clean.
          </p>
        </div>
      </div>
    </div>
  );
};
