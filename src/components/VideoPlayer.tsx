import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Subtitles, 
  Sparkles,
  Layers,
  Gauge,
  Film,
  Radio,
  Tv,
  AlertCircle
} from 'lucide-react';
import { DubSegment, SubtitleMode, AudioTrackMode, AudioMixerSettings, DubProject } from '../types/dubbing';
import { playAudioOrSpeak, stopCurrentPlayback } from '../services/ttsService';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  projectTitle?: string;
  segments: DubSegment[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (dur: number) => void;
  onTogglePlay: () => void;
  subtitleMode: SubtitleMode;
  onSubtitleModeChange: (mode: SubtitleMode) => void;
  audioTrackMode: AudioTrackMode;
  onAudioTrackModeChange: (mode: AudioTrackMode) => void;
  mixerSettings: AudioMixerSettings;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  projectTitle = 'ZU Video Dub',
  segments,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onTogglePlay,
  subtitleMode,
  onSubtitleModeChange,
  audioTrackMode,
  onAudioTrackModeChange,
  mixerSettings,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const [hasVideoError, setHasVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [activeSegment, setActiveSegment] = useState<DubSegment | null>(null);
  const [lastSpokenSegmentId, setLastSpokenSegmentId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Reset video error state whenever videoUrl changes
  useEffect(() => {
    setHasVideoError(false);
    setIsVideoLoaded(false);
    setLastSpokenSegmentId(null);
  }, [videoUrl]);

  // Sync play/pause state
  useEffect(() => {
    if (isPlaying) {
      if (videoRef.current && !hasVideoError && videoRef.current.src && videoRef.current.readyState >= 2) {
        videoRef.current.play().catch(() => {
          // If video element playback fails, gracefully continue via canvas visualizer mode
          setHasVideoError(true);
        });
      }
    } else {
      if (videoRef.current && !hasVideoError) {
        try {
          videoRef.current.pause();
        } catch {}
      }
      stopCurrentPlayback();
    }
  }, [isPlaying, hasVideoError]);

  // Canvas-based virtual playback loop when video element has no direct stream or has error
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // If video element is playing normally, timeUpdate event handles currentTime.
      // Otherwise, our virtual sync clock drives the timeline.
      if (hasVideoError || !videoRef.current || videoRef.current.paused) {
        let nextTime = currentTime + delta * playbackRate;
        const maxDuration = duration > 0 ? duration : 15;
        if (nextTime >= maxDuration) {
          nextTime = 0; // loop
          setLastSpokenSegmentId(null);
        }
        onTimeUpdate(nextTime);

        // Detect active segment
        const seg = segments.find(s => nextTime >= s.start && nextTime <= s.end);
        setActiveSegment(seg || null);

        if ((audioTrackMode === 'hindi_dub' || audioTrackMode === 'ducked_dual') && isPlaying) {
          if (seg && seg.id !== lastSpokenSegmentId) {
            setLastSpokenSegmentId(seg.id);
            playAudioOrSpeak(seg.hindiText, seg.voiceId, seg.audioUrl);
          } else if (!seg && lastSpokenSegmentId !== null) {
            setLastSpokenSegmentId(null);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, playbackRate, hasVideoError, segments, audioTrackMode, lastSpokenSegmentId, onTimeUpdate]);

  // Adjust video element volume based on track mode and mixer
  useEffect(() => {
    if (!videoRef.current) return;

    if (mixerSettings.isSourceMuted || isMuted) {
      videoRef.current.volume = 0;
      return;
    }

    if (audioTrackMode === 'hindi_dub') {
      videoRef.current.volume = 0;
    } else if (audioTrackMode === 'ducked_dual') {
      const isSpeaking = !!activeSegment;
      const targetVol = isSpeaking
        ? mixerSettings.sourceVolume * mixerSettings.duckingAmount
        : mixerSettings.sourceVolume;
      videoRef.current.volume = Math.max(0, Math.min(1, targetVol * mixerSettings.masterVolume));
    } else {
      videoRef.current.volume = Math.max(0, Math.min(1, mixerSettings.sourceVolume * mixerSettings.masterVolume));
    }
  }, [audioTrackMode, activeSegment, mixerSettings, isMuted]);

  // Handle native video time update
  const handleTimeUpdate = () => {
    if (!videoRef.current || hasVideoError) return;
    const time = videoRef.current.currentTime;
    onTimeUpdate(time);

    const seg = segments.find(s => time >= s.start && time <= s.end);
    setActiveSegment(seg || null);

    if ((audioTrackMode === 'hindi_dub' || audioTrackMode === 'ducked_dual') && isPlaying) {
      if (seg && seg.id !== lastSpokenSegmentId) {
        setLastSpokenSegmentId(seg.id);
        playAudioOrSpeak(seg.hindiText, seg.voiceId, seg.audioUrl);
      } else if (!seg && lastSpokenSegmentId !== null) {
        setLastSpokenSegmentId(null);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setIsVideoLoaded(true);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
        onDurationChange(videoRef.current.duration);
      }
    }
  };

  const handleVideoError = () => {
    // Instead of throwing errors, switch seamlessly to Studio Visualizer Mode
    setHasVideoError(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current && !hasVideoError) {
      videoRef.current.currentTime = newTime;
    }
    onTimeUpdate(newTime);
    stopCurrentPlayback();
    setLastSpokenSegmentId(null);
  };

  const handleSkip = (seconds: number) => {
    const target = Math.max(0, Math.min(duration || 15, currentTime + seconds));
    if (videoRef.current && !hasVideoError) {
      videoRef.current.currentTime = target;
    }
    onTimeUpdate(target);
    stopCurrentPlayback();
    setLastSpokenSegmentId(null);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00.0';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Render animated speaker lip-sync simulation on canvas if native video cannot play or is in visualizer mode
  useEffect(() => {
    if (!canvasRef.current || (!hasVideoError && isVideoLoaded)) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const renderCanvas = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark cinematic background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Grid effect
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Audio Spectrum Waveform Bars
      const numBars = 32;
      const barWidth = 8;
      const spacing = 6;
      const totalWidth = numBars * (barWidth + spacing);
      const startX = (w - totalWidth) / 2;
      const centerY = h / 2 - 20;

      const isSpeaking = isPlaying && !!activeSegment;

      for (let i = 0; i < numBars; i++) {
        const timeFactor = Date.now() * 0.005 + i * 0.2;
        const amplitude = isSpeaking 
          ? Math.sin(timeFactor) * 35 + Math.cos(timeFactor * 1.5) * 20 + 40 
          : isPlaying 
          ? Math.sin(timeFactor) * 8 + 12 
          : 6;

        const x = startX + i * (barWidth + spacing);
        const y = centerY - amplitude / 2;

        const barGrad = ctx.createLinearGradient(0, y, 0, y + amplitude);
        barGrad.addColorStop(0, '#f59e0b');
        barGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, Math.max(4, amplitude), 4);
        ctx.fill();
      }

      // Simulated Speaker Avatar with Lip-Sync animation
      const avatarX = w / 2;
      const avatarY = centerY + 80;
      const avatarRadius = 38;

      // Glow circle
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius + (isSpeaking ? Math.sin(Date.now() * 0.01) * 4 + 4 : 2), 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? 'rgba(245, 158, 11, 0.2)' : 'rgba(100, 116, 139, 0.15)';
      ctx.fill();

      // Avatar circle
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = isSpeaking ? '#f59e0b' : '#475569';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(avatarX - 12, avatarY - 8, 3, 0, Math.PI * 2);
      ctx.arc(avatarX + 12, avatarY - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Animated mouth flap
      ctx.fillStyle = isSpeaking ? '#f43f5e' : '#64748b';
      const mouthOpen = isSpeaking ? Math.abs(Math.sin(Date.now() * 0.015)) * 9 + 3 : 2;
      ctx.beginPath();
      ctx.ellipse(avatarX, avatarY + 12, 10, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();

      // Speaker Name Tag
      ctx.fillStyle = isSpeaking ? '#fde68a' : '#94a3b8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      const speakerName = activeSegment ? `${activeSegment.speaker} (${activeSegment.voiceId.toUpperCase()})` : 'ZU Video Dub Stage';
      ctx.fillText(speakerName, avatarX, avatarY + 56);

      animId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();
    return () => cancelAnimationFrame(animId);
  }, [hasVideoError, isVideoLoaded, isPlaying, activeSegment]);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group"
    >
      {/* Video Viewport Stage */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {/* Native HTML5 Video Element */}
        {!hasVideoError && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleVideoError}
            onClick={onTogglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : null}

        {/* Fallback Interactive Canvas Studio Player (Active when video fails or URL is non-stream) */}
        {(hasVideoError || !videoUrl) && (
          <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={onTogglePlay}>
            <canvas
              ref={canvasRef}
              width={720}
              height={405}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Studio Dub Stage Active</span>
            </div>
          </div>
        )}

        {/* Audio Track Badge Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold">
            {audioTrackMode === 'hindi_dub' && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>🇮🇳 Hindi Dub Track (Active)</span>
              </span>
            )}
            {audioTrackMode === 'ducked_dual' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🎧 Hindi Voice + Ducked SFX</span>
              </span>
            )}
            {audioTrackMode === 'source_original' && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Original Source Audio</span>
              </span>
            )}
          </div>

          {activeSegment && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              <span>Lip-Sync: {activeSegment.speaker} ({activeSegment.voiceId})</span>
            </div>
          )}
        </div>

        {/* Subtitle Display Overlay */}
        {activeSegment && subtitleMode !== 'none' && (
          <div className="absolute bottom-12 inset-x-4 flex justify-center text-center pointer-events-none z-20 transition-all">
            <div className="max-w-2xl px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-500/30 shadow-2xl text-white">
              {(subtitleMode === 'hindi' || subtitleMode === 'bilingual') && (
                <p className="text-base sm:text-lg md:text-xl font-bold font-devanagari text-amber-300 leading-snug drop-shadow-md">
                  {activeSegment.hindiText}
                </p>
              )}
              {subtitleMode === 'romanized' && (
                <p className="text-sm sm:text-base font-semibold text-amber-200/90 tracking-wide">
                  {activeSegment.romanizedHindi}
                </p>
              )}
              {subtitleMode === 'bilingual' && (
                <p className="text-xs sm:text-sm text-slate-300/80 font-normal mt-0.5 border-t border-slate-700/60 pt-0.5">
                  {activeSegment.originalText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Play/Pause Large Center Click Indicator (on pause) */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 hover:scale-110 transition-transform z-10 cursor-pointer"
            aria-label="Play video"
          >
            <Play className="w-8 h-8 fill-slate-950 ml-1" />
          </button>
        )}
      </div>

      {/* Segment Markers on Seekbar */}
      <div className="relative w-full bg-slate-950 px-4 pt-3 pb-2 border-t border-slate-800">
        <div className="relative flex items-center h-4 group/scrub">
          {/* Segment visual blocks highlight on timeline */}
          {duration > 0 && segments.map((seg) => {
            const leftPercent = (seg.start / duration) * 100;
            const widthPercent = ((seg.end - seg.start) / duration) * 100;
            const isActive = currentTime >= seg.start && currentTime <= seg.end;
            return (
              <div
                key={seg.id}
                title={`${seg.speaker}: ${seg.hindiText}`}
                style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                className={`absolute h-2 rounded-sm pointer-events-none transition-all ${
                  isActive 
                    ? 'bg-amber-400 shadow-md shadow-amber-400/50 h-3 z-10' 
                    : 'bg-amber-600/40 hover:bg-amber-500/60'
                }`}
              />
            );
          })}

          {/* Input Range Seekbar */}
          <input
            type="range"
            min={0}
            max={duration || 15}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 z-20 focus:outline-none"
          />
        </div>

        {/* Player Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-2 text-xs text-slate-300">
          {/* Left Controls: Play/Pause, Skips, Timestamp */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onTogglePlay}
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
            </button>

            <button
              onClick={() => handleSkip(-3)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Jump 3s back"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleSkip(3)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Jump 3s forward"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-slate-400 font-medium tracking-tight">
              <span className="text-amber-400 font-bold">{formatTime(currentTime)}</span> / {formatTime(duration || 15)}
            </span>
          </div>

          {/* Right Controls: Track Mode Switcher, Subtitles, Speed, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Track Selector Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => onAudioTrackModeChange('hindi_dub')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  audioTrackMode === 'hindi_dub'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dub Only: Pure Hindi synthesized dialogue"
              >
                🇮🇳 Hindi Dub
              </button>
              <button
                onClick={() => onAudioTrackModeChange('ducked_dual')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  audioTrackMode === 'ducked_dual'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Smart Mix: Hindi Dub + Ducked original background music/SFX"
              >
                🎧 Dual Mix
              </button>
              <button
                onClick={() => onAudioTrackModeChange('source_original')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  audioTrackMode === 'source_original'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Original: English source speech"
              >
                Original
              </button>
            </div>

            {/* Subtitle Mode Selector */}
            <div className="relative group/sub">
              <button
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] cursor-pointer"
                title="Subtitles"
              >
                <Subtitles className="w-3.5 h-3.5 text-amber-400" />
                <span className="capitalize">{subtitleMode}</span>
              </button>
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover/sub:flex flex-col bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-xl z-30 min-w-[120px]">
                <button
                  onClick={() => onSubtitleModeChange('hindi')}
                  className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                    subtitleMode === 'hindi' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  हिन्दी (Devanagari)
                </button>
                <button
                  onClick={() => onSubtitleModeChange('romanized')}
                  className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                    subtitleMode === 'romanized' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Hinglish (English)
                </button>
                <button
                  onClick={() => onSubtitleModeChange('bilingual')}
                  className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                    subtitleMode === 'bilingual' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Bilingual (Dual)
                </button>
                <button
                  onClick={() => onSubtitleModeChange('none')}
                  className={`text-left px-2 py-1 rounded text-[11px] cursor-pointer ${
                    subtitleMode === 'none' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Off (None)
                </button>
              </div>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-0.5">
              {[0.8, 1, 1.25].map(rate => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`text-[10px] px-1 py-0.5 rounded font-mono cursor-pointer ${
                    playbackRate === rate ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
