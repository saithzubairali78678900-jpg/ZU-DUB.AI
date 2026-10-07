import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Youtube, 
  HelpCircle, 
  Download,
  Languages,
  Mic2,
  Video
} from 'lucide-react';

export const FreeTierFaq: React.FC = () => {
  const features = [
    {
      title: '100% Free & Open Video Dubbing',
      hindi: 'पूरी तरह मुफ़्त डबिंग',
      desc: 'No credit card required, no trial expiration dates, and no hidden subscriptions. Dub your videos freely.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Zero Watermark Guarantee',
      hindi: 'बिना किसी वॉटरमार्क के',
      desc: 'Your exported audio tracks and synchronized subtitles are clean and 100% watermark-free for all platforms.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'YouTube Monetization Safe',
      hindi: 'यूट्यूब मोनेटाइजेशन फ्रेंडली',
      desc: 'Dubbed dialogues and synthesized voices are cleared for commercial YouTube monetization and creator revenue.',
      icon: <Youtube className="w-5 h-5 text-rose-400" />,
    },
    {
      title: 'Syllable-Accurate Lip-Syncing',
      hindi: 'सटीक लिप-सिंक परिशुद्धता',
      desc: 'AI adapts Hindi phrasing length to match exact mouth flap duration without altering your original meaning.',
      icon: <Sparkles className="w-5 h-5 text-sky-400" />,
    },
    {
      title: '6 Indian Voice Personas',
      hindi: '६ विशिष्ट भारतीय आवाज़ें',
      desc: 'Access warm female tones, deep cinematic male baritones, peppy RJ Hinglish, and professional tech anchors.',
      icon: <Mic2 className="w-5 h-5 text-purple-400" />,
    },
    {
      title: 'Multi-Format Studio Exports',
      hindi: 'मल्टी-फॉर्मेट एक्सपोर्ट',
      desc: 'Download uncompressed .WAV master tracks, Devanagari & Hinglish .SRT/.VTT, and production .CSV cue sheets.',
      icon: <Download className="w-5 h-5 text-orange-400" />,
    },
  ];

  const faqs = [
    {
      q: 'Can I dub a video by pasting a link from any website or YouTube?',
      hindiQ: 'क्या मैं किसी भी वेबसाइट या यूट्यूब का लिंक पेस्ट करके डब कर सकता हूँ?',
      a: 'Yes! ZU VIDEO DUB.AI has a dedicated link dubbing engine. Simply paste the link from YouTube, Vimeo, TikTok, direct MP4/WebM video, or cloud storage into the URL bar, and our AI will fetch the video, extract the speech, and dub it into Hindi with syllable-matched lip-sync!',
    },
    {
      q: 'How does ZU VIDEO DUB.AI ensure lip-sync accuracy?',
      hindiQ: 'ZU VIDEO DUB.AI लिप-सिंक परिशुद्धता कैसे सुनिश्चित करता है?',
      a: 'Hindi sentences are usually 20-30% longer than English when translated directly. ZU VIDEO DUB.AI uses a specialized syllable-matching algorithm that calculates the speaker\'s mouth flap duration and condenses or restructures Hindi phrasing with natural idioms so speech finishes at the exact millisecond the mouth closes.',
    },
    {
      q: 'Can I upload my own videos to dub into Hindi?',
      hindiQ: 'क्या मैं अपने खुद के वीडियो अपलोड करके डब कर सकता हूँ?',
      a: 'Yes! Simply click "Paste Link / Upload", choose any MP4, WebM, or MOV video from your computer, select your preferred target Hindi voice (like Aditi or Kabir), and let the AI automatically transcribe and dub it.',
    },
    {
      q: 'How do I add the dubbed Hindi audio to YouTube?',
      hindiQ: 'यूट्यूब पर हिन्दी डब ऑडियो कैसे जोड़ें?',
      a: 'Export the .WAV audio track from ZU VIDEO DUB.AI. Then open YouTube Studio, navigate to your video\'s Subtitles tab, click "Add Language", select Hindi, and under the Audio column, click "Add" to upload the .WAV file. YouTube will serve this track automatically to Hindi-speaking viewers!',
    },
    {
      q: 'What is Dual-Track Mixing with Smart Ducking?',
      hindiQ: 'स्मार्ट डकिंग के साथ डुअल-ट्रैक मिक्सिंग क्या है?',
      a: 'Smart Ducking automatically reduces the original video\'s vocal volume during dialogue segments while preserving the background score and sound effects, giving your video an authentic, studio-mastered dubbing finish.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center space-y-3 shadow-2xl">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          🇮🇳 ZU VIDEO DUB.AI • 100% Free Hindi Dubbing
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Free &amp; Unlimited Hindi Video Dubbing Studio
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empowering Indian and global creators to localize their content into Hindi for over 600 million viewers with cinematic voiceovers and syllable-matched lip synchronization.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2 shadow-lg"
          >
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 w-fit">
              {feat.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{feat.title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {feat.desc}
            </p>
          </div>
        ))}
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4 pt-1">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
            >
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400 font-mono">Q{idx + 1}.</span> {faq.q}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/60">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
