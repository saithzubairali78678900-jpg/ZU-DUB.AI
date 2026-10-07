import React, { useState, useEffect } from 'react';
import { 
  DubProject, 
  DubSegment, 
  ActiveTab, 
  SubtitleMode, 
  AudioTrackMode, 
  AudioMixerSettings,
  DubStyle 
} from './types/dubbing';
import { SAMPLE_PROJECTS, HINDI_VOICES, STYLE_DEFINITIONS } from './data/sampleProjects';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { AudioMixer } from './components/AudioMixer';
import { Timeline } from './components/Timeline';
import { SegmentList } from './components/SegmentList';
import { VoiceLab } from './components/VoiceLab';
import { ScriptStudio } from './components/ScriptStudio';
import { ProjectsView } from './components/ProjectsView';
import { FreeTierFaq } from './components/FreeTierFaq';
import { VideoUploaderModal } from './components/VideoUploaderModal';
import { LipSyncAssistantModal } from './components/LipSyncAssistantModal';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { AiAutoHealingMonitor } from './components/AiAutoHealingMonitor';
import { StartupSplashScreen } from './components/StartupSplashScreen';
import { AudioTranscribeStudio } from './components/AudioTranscribeStudio';
import { LiveVoiceDirector } from './components/LiveVoiceDirector';
import { MusicGeneratorStudio } from './components/MusicGeneratorStudio';
import { ImageStudio } from './components/ImageStudio';
import { SmartAiDubToolbar } from './components/SmartAiDubToolbar';
import { getOrSynthesizeSegmentAudio, stopCurrentPlayback } from './services/ttsService';
import { fetchUrlVideo } from './services/api';
import { aiSelfHealing } from './services/aiSelfHealing';
import { Sparkles, Upload, Mic2, Download, Video, CheckCircle2, Share2 } from 'lucide-react';

export default function App() {
  // Current active project (with automatic state restoration if refreshed)
  const [project, setProject] = useState<DubProject>(() => {
    const saved = aiSelfHealing.getSavedProjectState();
    return saved || SAMPLE_PROJECTS[0];
  });

  // Current screen tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');

  // Video playback states
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => {
    const saved = aiSelfHealing.getSavedProjectState();
    return saved?.duration || SAMPLE_PROJECTS[0].duration;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('hindi');
  const [audioTrackMode, setAudioTrackMode] = useState<AudioTrackMode>('ducked_dual');

  // Auto-persist project state to self-healing storage
  useEffect(() => {
    aiSelfHealing.saveProjectState(project);
  }, [project]);

  // Audio mixer settings
  const [mixerSettings, setMixerSettings] = useState<AudioMixerSettings>({
    sourceVolume: 0.8,
    hindiVolume: 1.0,
    duckingAmount: 0.15,
    masterVolume: 1.0,
    playbackSpeed: 1.0,
    isSourceMuted: false,
    isHindiMuted: false,
  });

  // Selected segment for timeline & editor focus
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  // Modals state
  const [isStartupLoading, setIsStartupLoading] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isLipSyncModalOpen, setIsLipSyncModalOpen] = useState<boolean>(false);
  const [segmentForLipSync, setSegmentForLipSync] = useState<DubSegment | null>(null);

  // Auto-Dub all progress state
  const [isAutoDubbingAll, setIsAutoDubbingAll] = useState<boolean>(false);
  const [dubbingProgress, setDubbingProgress] = useState<number>(0);

  // Stop playback when changing screen tabs
  useEffect(() => {
    setIsPlaying(false);
    stopCurrentPlayback();
  }, [activeTab]);

  // Handle video seek
  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Update a segment's data
  const handleUpdateSegment = (segmentId: string, updated: Partial<DubSegment>) => {
    setProject((prev) => ({
      ...prev,
      segments: prev.segments.map((seg) =>
        seg.id === segmentId ? { ...seg, ...updated } : seg
      ),
    }));
  };

  // Open lip-sync accuracy modal for a segment
  const handleOpenLipSyncModal = (segment: DubSegment) => {
    setSegmentForLipSync(segment);
    setIsLipSyncModalOpen(true);
  };

  // Apply lip-sync adjustment from assistant
  const handleApplyLipSyncAdjustment = (segmentId: string, newHindi: string, newRomanized: string) => {
    handleUpdateSegment(segmentId, {
      hindiText: newHindi,
      romanizedHindi: newRomanized,
      syllableRating: 'matched',
    });
  };

  // Synthesize single segment audio
  const handleSynthesizeSegment = async (segmentId: string) => {
    const seg = project.segments.find((s) => s.id === segmentId);
    if (!seg) return;

    try {
      handleUpdateSegment(segmentId, { isSynthesizing: true });
      const res = await getOrSynthesizeSegmentAudio(seg.hindiText, seg.voiceId);
      handleUpdateSegment(segmentId, {
        audioUrl: res.audioUrl,
        isSynthesizing: false,
      });
    } catch (e) {
      console.warn('Synthesis error for segment:', segmentId, e);
      handleUpdateSegment(segmentId, { isSynthesizing: false });
    }
  };

  // Synthesize all segments sequentially
  const handleAutoDubAll = async () => {
    setIsAutoDubbingAll(true);
    setDubbingProgress(0);

    const total = project.segments.length;
    for (let i = 0; i < total; i++) {
      const seg = project.segments[i];
      try {
        const res = await getOrSynthesizeSegmentAudio(seg.hindiText, seg.voiceId);
        handleUpdateSegment(seg.id, { audioUrl: res.audioUrl });
      } catch (err) {
        console.warn('Batch synthesis item error:', err);
      }
      setDubbingProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsAutoDubbingAll(false);
  };

  // Add a new segment at the end
  const handleAddSegment = () => {
    const lastSeg = project.segments[project.segments.length - 1];
    const newStart = lastSeg ? lastSeg.end + 0.2 : 0;
    const newEnd = newStart + 3.0;

    const newSegment: DubSegment = {
      id: `seg-${Date.now()}`,
      start: newStart,
      end: newEnd,
      duration: 3.0,
      originalText: 'New dialogue line',
      hindiText: 'नया हिन्दी संवाद यहाँ लिखें',
      romanizedHindi: 'Naya Hindi samvad yahaan likhein',
      speaker: 'Speaker',
      voiceId: project.defaultVoiceId,
      syllableRating: 'matched',
    };

    setProject((prev) => ({
      ...prev,
      segments: [...prev.segments, newSegment],
    }));
  };

  // Delete a segment
  const handleDeleteSegment = (id: string) => {
    setProject((prev) => ({
      ...prev,
      segments: prev.segments.filter((s) => s.id !== id),
    }));
  };

  // Set default voice globally
  const handleSelectDefaultVoice = (voiceId: string) => {
    setProject((prev) => ({
      ...prev,
      defaultVoiceId: voiceId,
      segments: prev.segments.map((seg) => ({ ...seg, voiceId })),
    }));
  };

  // Change project
  const handleSelectProject = (newProj: DubProject) => {
    stopCurrentPlayback();
    setProject(newProj);
    setCurrentTime(0);
    setDuration(newProj.duration);
    setSelectedSegmentId(null);
    setActiveTab('studio');
  };

  // Receive newly uploaded video project
  const handleProjectCreated = (newProj: DubProject) => {
    stopCurrentPlayback();
    setProject(newProj);
    setCurrentTime(0);
    setDuration(newProj.duration);
    setSelectedSegmentId(null);
    setActiveTab('studio');
  };

  // Add transcribed segments from mic
  const handleAddTranscribedSegments = (newSegs: DubSegment[]) => {
    setProject((prev) => ({
      ...prev,
      segments: [...prev.segments, ...newSegs],
    }));
    setActiveTab('studio');
  };

  // Update thumbnail from ImageStudio
  const handleSetThumbnail = (imageUrl: string) => {
    setProject((prev) => ({
      ...prev,
      thumbnailUrl: imageUrl,
    }));
    setActiveTab('studio');
  };

  // Update all segments in batch
  const handleUpdateAllSegments = (newSegments: DubSegment[]) => {
    setProject((prev) => ({
      ...prev,
      segments: newSegments,
    }));
  };

  // Direct URL fetch and dub
  const handleDirectUrlDub = async (url: string) => {
    const result = await fetchUrlVideo(url, project.defaultStyle, project.defaultVoiceId);
    const newProject: DubProject = {
      id: `url-${Date.now()}`,
      title: result.title || 'Online Video Dub',
      description: `Dubbed into Hindi (${project.defaultStyle}) from ${result.platform || 'Web Video URL'}.`,
      category: result.platform || 'Online Video',
      videoUrl: result.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: result.thumbnailUrl || 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80',
      duration: result.duration || 15.0,
      defaultStyle: project.defaultStyle,
      defaultVoiceId: project.defaultVoiceId,
      segments: result.segments || [],
    };
    handleProjectCreated(newProject);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Startup Web Loading & AI Calibration Screen */}
      {isStartupLoading && (
        <StartupSplashScreen onComplete={() => setIsStartupLoading(false)} />
      )}

      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        isProcessing={isAutoDubbingAll}
        projectTitle={project.title}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. STUDIO SCREEN (Core Dubbing Experience) */}
        {activeTab === 'studio' && (
          <div className="space-y-5">
            {/* Smart AI Dubbing Assistant Bar with Quick URL Dub */}
            <SmartAiDubToolbar
              segments={project.segments}
              onUpdateSegments={handleUpdateAllSegments}
              onAutoDubAll={handleAutoDubAll}
              isAutoDubbingAll={isAutoDubbingAll}
              onTogglePlay={handleTogglePlay}
              isPlaying={isPlaying}
              onOpenPasteModal={() => setIsUploadModalOpen(true)}
              onDirectUrlDub={handleDirectUrlDub}
            />

            {/* Quick Example Videos Switcher Strip */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white shrink-0">
                <Video className="w-4 h-4 text-amber-400" />
                <span>Quick Example Demos:</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {SAMPLE_PROJECTS.map((sample, idx) => {
                  const isActive = project.id === sample.id;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectProject(sample)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{idx === 0 ? '📱' : idx === 1 ? '🐅' : idx === 2 ? '🍝' : idx === 3 ? '🎤' : '🎬'}</span>
                      <span>{sample.title.split(':')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Studio Action & Dialect Bar */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              {/* Left: Project title & Style indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {project.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Right: Quick Global Voice & 1-Click Auto-Dub */}
              <div className="flex items-center gap-2.5">
                {/* Voice Picker */}
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Voice:</span>
                  <select
                    value={project.defaultVoiceId}
                    onChange={(e) => handleSelectDefaultVoice(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {HINDI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.hindiName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 1-Click Auto-Dub Button */}
                <button
                  disabled={isAutoDubbingAll}
                  onClick={handleAutoDubAll}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isAutoDubbingAll
                      ? `Dubbing (${dubbingProgress}%)`
                      : 'Auto-Dub All (1-Click)'}
                  </span>
                </button>

                {/* Share Button in Studio */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all cursor-pointer"
                  title="Share dubbed video link, social, embed, or QR code"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Main Stage Grid: Video Player (Left) + Segment Editor (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Video Player Stage (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-4">
                <VideoPlayer
                  videoUrl={project.videoUrl}
                  thumbnailUrl={project.thumbnailUrl}
                  projectTitle={project.title}
                  segments={project.segments}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onTimeUpdate={setCurrentTime}
                  onDurationChange={setDuration}
                  onTogglePlay={handleTogglePlay}
                  subtitleMode={subtitleMode}
                  onSubtitleModeChange={setSubtitleMode}
                  audioTrackMode={audioTrackMode}
                  onAudioTrackModeChange={setAudioTrackMode}
                  mixerSettings={mixerSettings}
                />

                {/* Dual-Track Mixer Controls */}
                <AudioMixer
                  settings={mixerSettings}
                  onChange={setMixerSettings}
                  audioTrackMode={audioTrackMode}
                  onAudioTrackModeChange={setAudioTrackMode}
                  isPlaying={isPlaying}
                />
              </div>

              {/* Right Column: Dialogue & Lip-Sync Editor (5 cols on lg) */}
              <div className="lg:col-span-5 flex flex-col">
                <SegmentList
                  segments={project.segments}
                  onUpdateSegment={handleUpdateSegment}
                  onOpenLipSyncModal={handleOpenLipSyncModal}
                  onSeek={handleSeek}
                  currentTime={currentTime}
                  selectedSegmentId={selectedSegmentId}
                  onSelectSegment={setSelectedSegmentId}
                  onSynthesizeSegment={handleSynthesizeSegment}
                  onAddSegment={handleAddSegment}
                  onDeleteSegment={handleDeleteSegment}
                  onAutoDubAll={handleAutoDubAll}
                  isAutoDubbingAll={isAutoDubbingAll}
                />
              </div>
            </div>

            {/* Visual Timeline Bar with Lip-Sync Tracking */}
            <Timeline
              segments={project.segments}
              duration={duration}
              currentTime={currentTime}
              onSeek={handleSeek}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={setSelectedSegmentId}
            />
          </div>
        )}

        {/* 2. AUDIO TRANSCRIBE SCREEN (gemini-3.5-transcribe) */}
        {activeTab === 'transcribe' && (
          <AudioTranscribeStudio
            onAddSegmentsToProject={handleAddTranscribedSegments}
            defaultVoiceId={project.defaultVoiceId}
          />
        )}

        {/* 3. LIVE VOICE DIRECTOR SCREEN (gemini-3.8-live) */}
        {activeTab === 'livechat' && <LiveVoiceDirector />}

        {/* 4. BACKGROUND MUSIC LAB SCREEN (lyria-3-clip-preview) */}
        {activeTab === 'music' && <MusicGeneratorStudio />}

        {/* 5. THUMBNAIL & ARTWORK STUDIO (gemini-3.1-flash-image) */}
        {activeTab === 'image' && (
          <ImageStudio onSetProjectThumbnail={handleSetThumbnail} />
        )}

        {/* 6. VOICE LAB SCREEN */}
        {activeTab === 'voicelab' && (
          <VoiceLab
            currentVoiceId={project.defaultVoiceId}
            onSelectDefaultVoice={handleSelectDefaultVoice}
          />
        )}

        {/* 3. SCRIPT & LIP-SYNC STUDIO SCREEN */}
        {activeTab === 'script' && (
          <ScriptStudio
            segments={project.segments}
            currentStyle={project.defaultStyle}
            onApplyNewSegments={(newSegs, style) => {
              setProject((prev) => ({
                ...prev,
                defaultStyle: style,
                segments: newSegs,
              }));
              setActiveTab('studio');
            }}
          />
        )}

        {/* 4. SAMPLE PROJECTS & TEMPLATES SCREEN */}
        {activeTab === 'projects' && (
          <ProjectsView
            currentProjectId={project.id}
            onSelectProject={handleSelectProject}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        )}

        {/* 5. FREE TIER TRANSPARENCY & FAQ SCREEN */}
        {activeTab === 'pricing' && <FreeTierFaq />}
      </main>

      {/* Upload Video Modal */}
      <VideoUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Lip-Sync Accuracy Assistant Modal */}
      <LipSyncAssistantModal
        segment={segmentForLipSync}
        voice={HINDI_VOICES.find((v) => v.id === segmentForLipSync?.voiceId)}
        isOpen={isLipSyncModalOpen}
        onClose={() => {
          setIsLipSyncModalOpen(false);
          setSegmentForLipSync(null);
        }}
        onApplyAdjustment={handleApplyLipSyncAdjustment}
      />

      {/* Export Hub Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={project}
      />

      {/* AI Universal Self-Healing Monitor */}
      <AiAutoHealingMonitor />
    </div>
  );
}
