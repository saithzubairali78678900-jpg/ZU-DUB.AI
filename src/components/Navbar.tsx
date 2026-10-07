import React from 'react';
import { ActiveTab } from '../types/dubbing';
import { 
  Mic2, 
  Video, 
  Sparkles, 
  SlidersHorizontal, 
  FileText, 
  FolderGit2, 
  HelpCircle, 
  Upload, 
  Download, 
  Mic, 
  Bot, 
  Music, 
  Image as ImageIcon,
  Link2,
  Share2
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
  isProcessing: boolean;
  projectTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenExport,
  onOpenShare,
  isProcessing,
  projectTitle,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 shadow-lg shadow-amber-500/25 text-slate-950 font-black text-lg tracking-tighter">
              <span>ZU</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  ZU VIDEO DUB.<span className="text-amber-400 font-mono text-xs uppercase px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">AI</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Hindi Dubbing Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs font-mono">
                {projectTitle || 'ZU Video Dub Studio'}
              </p>
            </div>
          </div>

          {/* Navigation Screen Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'studio'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('transcribe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'transcribe'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Transcribe</span>
            </button>

            <button
              onClick={() => setActiveTab('livechat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'livechat'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Director</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'music'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-orange-400" />
              <span>Music (Lyria)</span>
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'image'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Thumbnails</span>
            </button>

            <button
              onClick={() => setActiveTab('voicelab')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'voicelab'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Voice Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('script')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'script'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lip-Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Samples</span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all shadow-sm cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Paste Link / Upload</span>
            </button>

            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all shadow-sm cursor-pointer"
              title="Share dubbed video link, social, embed, or QR code"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dub</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-900 gap-1 text-[11px]">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'studio' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('transcribe')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'transcribe' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Transcribe
          </button>
          <button
            onClick={() => setActiveTab('livechat')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'livechat' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Director
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'music' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Music
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'image' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Thumbnails
          </button>
          <button
            onClick={() => setActiveTab('voicelab')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'voicelab' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Voice Lab
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'script' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Lip-Sync
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'projects' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Samples
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'pricing' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            FAQ
          </button>
        </div>
      </div>
    </header>
  );
};

