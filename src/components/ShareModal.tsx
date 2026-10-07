import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Code, 
  Send, 
  Globe, 
  Download, 
  Sparkles,
  ExternalLink,
  MessageCircle,
  FileText
} from 'lucide-react';
import { DubProject } from '../types/dubbing';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DubProject;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState<'link' | 'social' | 'embed' | 'qr'>('link');
  const [showQrCode, setShowQrCode] = useState(false);

  // Generate shareable URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : 'https://zu-video-dub.ai';
  const shareableUrl = `${currentUrl}?project=${encodeURIComponent(project.id)}&title=${encodeURIComponent(project.title)}`;

  // Embed code
  const embedCode = `<iframe src="${shareableUrl}&embed=true" width="100%" height="450" frameborder="0" allow="autoplay; fullscreen" style="border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  // Social sharing handlers
  const shareText = `Check out this Hindi dubbed video "${project.title}" created with ZU VIDEO DUB.AI! 🇮🇳🎙️`;
  
  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      bg: 'bg-emerald-600 hover:bg-emerald-500',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareableUrl)}`,
    },
    {
      name: 'Twitter / X',
      icon: '🐦',
      bg: 'bg-sky-600 hover:bg-sky-500',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareableUrl)}`,
    },
    {
      name: 'Telegram',
      icon: '✈️',
      bg: 'bg-blue-600 hover:bg-blue-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      bg: 'bg-blue-700 hover:bg-blue-600',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`,
    },
    {
      name: 'Facebook',
      icon: '📘',
      bg: 'bg-indigo-600 hover:bg-indigo-500',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`,
    },
    {
      name: 'Email',
      icon: '✉️',
      bg: 'bg-slate-700 hover:bg-slate-600',
      url: `mailto:?subject=${encodeURIComponent('Dubbed Video: ' + project.title)}&body=${encodeURIComponent(shareText + '\n\nWatch here: ' + shareableUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Share Dubbed Video
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Share <span className="text-amber-400 font-semibold">{project.title}</span> with audience and social platforms
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-5 pb-4 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveShareTab('link')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeShareTab === 'link'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Shareable Link</span>
          </button>

          <button
            onClick={() => setActiveShareTab('social')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeShareTab === 'social'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Social Platforms</span>
          </button>

          <button
            onClick={() => setActiveShareTab('embed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeShareTab === 'embed'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Embed Player</span>
          </button>

          <button
            onClick={() => setActiveShareTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeShareTab === 'qr'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-5">
          {/* TAB 1: Shareable Link */}
          {activeShareTab === 'link' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Direct Web Link:</span>
                  <span className="text-[11px] text-emerald-400 font-normal">Active &amp; Ready</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Video Project Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-4">
                <div className="w-20 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 relative">
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{project.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {project.duration.toFixed(1)}s • {project.segments.length} Hindi Dubbed Segments • {project.defaultVoiceId.toUpperCase()} Voice
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Social Sharing Buttons */}
          {activeShareTab === 'social' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Instantly broadcast and publish your dubbed video link to community channels:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3.5 rounded-2xl ${item.bg} text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Embed Code */}
          {activeShareTab === 'embed' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300">
                HTML Embed Code (Place on website or blog):
              </label>
              <textarea
                rows={4}
                readOnly
                value={embedCode}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-amber-300/90 focus:outline-none select-all leading-relaxed resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleCopyEmbed}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedEmbed
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                >
                  {copiedEmbed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed HTML'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: QR Code */}
          {activeShareTab === 'qr' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
              <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-amber-400">
                {/* SVG Mock QR Code */}
                <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner boxes */}
                  <rect x="10" y="10" width="24" height="24" fill="black" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="black" />

                  <rect x="66" y="10" width="24" height="24" fill="black" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="black" />

                  <rect x="10" y="66" width="24" height="24" fill="black" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="black" />

                  {/* QR Pattern dots */}
                  <rect x="42" y="12" width="6" height="6" fill="black" />
                  <rect x="52" y="12" width="6" height="6" fill="black" />
                  <rect x="42" y="24" width="6" height="6" fill="black" />
                  <rect x="52" y="32" width="6" height="6" fill="black" />
                  <rect x="12" y="42" width="6" height="6" fill="black" />
                  <rect x="24" y="42" width="6" height="6" fill="black" />
                  <rect x="36" y="42" width="6" height="6" fill="black" />
                  <rect x="48" y="42" width="6" height="6" fill="black" />
                  <rect x="60" y="42" width="6" height="6" fill="black" />
                  <rect x="72" y="42" width="6" height="6" fill="black" />
                  <rect x="84" y="42" width="6" height="6" fill="black" />
                  <rect x="42" y="60" width="6" height="6" fill="black" />
                  <rect x="52" y="60" width="6" height="6" fill="black" />
                  <rect x="64" y="60" width="6" height="6" fill="black" />
                  <rect x="42" y="72" width="6" height="6" fill="black" />
                  <rect x="52" y="80" width="6" height="6" fill="black" />
                  <rect x="76" y="72" width="6" height="6" fill="black" />
                  <rect x="84" y="80" width="6" height="6" fill="black" />
                </svg>
              </div>
              <p className="text-xs text-slate-300 max-w-sm">
                Scan this QR code with any smartphone camera to open and listen to the dubbed Hindi video instantly.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>ZU VIDEO DUB.AI • Free Dubbing Share</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
