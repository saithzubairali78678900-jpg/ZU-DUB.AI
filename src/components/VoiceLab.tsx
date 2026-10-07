import React, { useState } from 'react';
import { HINDI_VOICES } from '../data/sampleProjects';
import { VoicePersona } from '../types/dubbing';
import { playAudioOrSpeak, stopCurrentPlayback } from '../services/ttsService';
import { 
  Mic2, 
  Volume2, 
  Sparkles, 
  Sliders, 
  Check, 
  RotateCcw, 
  Radio, 
  Flame, 
  BookOpen, 
  Tv, 
  Headphones 
} from 'lucide-react';

interface VoiceLabProps {
  currentVoiceId: string;
  onSelectDefaultVoice: (voiceId: string) => void;
}

export const VoiceLab: React.FC<VoiceLabProps> = ({
  currentVoiceId,
  onSelectDefaultVoice,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>(
    HINDI_VOICES.find(v => v.id === currentVoiceId) || HINDI_VOICES[0]
  );
  const [customText, setCustomText] = useState<string>(
    'नमस्ते दोस्तों! वाणीSync AI के साथ आपका वीडियो कुछ ही सेकंड में एकदम सहज और जीवंत हिन्दी में डब हो जाता है।'
  );
  const [pitch, setPitch] = useState<number>(1.0);
  const [rate, setRate] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('default');

  const presetDialogues = [
    {
      label: '🎬 Bollywood Dramatic',
      text: 'जिंदगी अगर एक खेल है, तो हम वो खिलाड़ी हैं जो हर बाजी अपने नाम करना जानते हैं!',
    },
    {
      label: '📱 Tech Review & Unboxing',
      text: 'अरे बॉस! इसका प्रोसेसर इतना फास्ट है कि हैवी गेमिंग भी मक्खन की तरह बिना किसी लैग के चलती है!',
    },
    {
      label: '🌍 Wildlife & Nature Documentary',
      text: 'इस विशालकाय जंगल में सूरज की किरणें पत्तों को चीरती हुई ज़मीन पर एक सुनहरा कालीन बिछा देती हैं।',
    },
    {
      label: '💼 Corporate & Educational Pitch',
      text: 'हमारी तकनीक का मुख्य उद्देश्य समय की बचत करना और भारतीय बाज़ार में आपकी पहुंच को दोगुना करना है।',
    },
  ];

  const handleAudition = (textToSpeak: string) => {
    if (isPlaying) {
      stopCurrentPlayback();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    playAudioOrSpeak(textToSpeak, selectedVoice.id, undefined, () => {
      setIsPlaying(false);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Voice Lab Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Mic2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  Voice Lab (Indian Voice Casting Studio)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Gemini 3.8 Neural Audio
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Audition, customize and cast the ideal Hindi voice persona for your video genres — from high-energy YouTube vloggers to deep cinematic movie narrators.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectDefaultVoice(selectedVoice.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>Set {selectedVoice.name} as Project Default</span>
          </button>
        </div>
      </div>

      {/* Voice Talent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {HINDI_VOICES.map((voice) => {
          const isCurrent = selectedVoice.id === voice.id;
          const isProjectDefault = currentVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => setSelectedVoice(voice)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'border-amber-400 bg-amber-500/10 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/40'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      {voice.name}
                    </h3>
                    <p className="text-xs font-devanagari text-amber-300 font-semibold">
                      {voice.hindiName}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {voice.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {voice.description}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Sample Audition Line:
                  </span>
                  <p className="text-xs font-devanagari text-slate-200 mt-1 italic">
                    "{voice.sampleLine}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVoice(voice);
                    handleAudition(voice.sampleLine);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audition Voice</span>
                </button>

                {isProjectDefault && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Current Default
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice Tuning & Custom Script Audition Workbench */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Live Voice Tuner &amp; Dialogue Testing: {selectedVoice.name}
              </h3>
              <p className="text-xs text-slate-400">
                Test custom Hindi dialogues, adjustments, and dialogue presets in real time
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPitch(1.0);
              setRate(1.0);
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300">
            Choose a genre test line:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetDialogues.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomText(p.text);
                  setActivePreset(p.label);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  activePreset === p.label
                    ? 'border-amber-400 bg-amber-500/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-amber-300 mb-0.5">{p.label}</div>
                <div className="font-devanagari text-[11px] text-slate-300 truncate">
                  "{p.text}"
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Text Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white">
            Custom Hindi Dialogue Input:
          </label>
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-base font-devanagari text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-medium"
            placeholder="Type any Hindi sentence here to audition voice..."
          />
        </div>

        {/* Audio Tuning Sliders (Pitch & Speed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Speech Rate</span>
              <span className="text-amber-400 font-bold">{rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.4}
              step={0.05}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Voice Pitch</span>
              <span className="text-amber-400 font-bold">{pitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.3}
              step={0.05}
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Audition Trigger Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Target: {selectedVoice.name} ({selectedVoice.accent})</span>
          </div>

          <button
            onClick={() => handleAudition(customText)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isPlaying
                ? 'bg-rose-500 text-white shadow-rose-500/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlaying ? 'Stop Playback' : 'Synthesize & Audition Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
