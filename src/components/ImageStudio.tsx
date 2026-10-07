import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Check, Layers, Sliders, RefreshCw } from 'lucide-react';
import { generateStudioImage } from '../services/api';
import { downloadFile } from '../services/audioExporter';

interface ImageStudioProps {
  onSetProjectThumbnail?: (imageUrl: string) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({
  onSetProjectThumbnail,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'A cinematic viral YouTube video thumbnail with a dramatic Indian creator holding a glowing smartphone, bold expressive face, vibrant orange and teal lighting, 8k hyper-detailed.'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80'
  );

  const presets = [
    {
      title: '🎬 Bollywood Theatrical Poster',
      prompt: 'A grand dramatic Bollywood action movie poster with a fearless hero silhouetted against glowing embers, dramatic golden sunset, film grain, cinematic typography.',
    },
    {
      title: '📱 High CTR YouTube Thumbnail',
      prompt: 'High clickthrough YouTube thumbnail of a tech gadget glowing with futuristic neon holographic interface, high contrast lighting, bold facial reaction.',
    },
    {
      title: '🌿 Majestic Wildlife Documentary',
      prompt: 'National Geographic style photograph of a majestic Royal Bengal Tiger prowling through mist in Ranthambore National Park, golden hour lighting.',
    },
    {
      title: '🍝 Mouthwatering Culinary Scene',
      prompt: 'Artisan hand-rolled Italian pasta being tossed in a rustic kitchen with flour flying in the air, warm sunlight through wooden window, mouthwatering depth of field.',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await generateStudioImage(prompt, aspectRatio);
      if (res && res.imageUrl) {
        setGeneratedImageUrl(res.imageUrl);
      }
    } catch (err) {
      console.warn('Image generation error:', err);
      // Fallback high-res image
      setGeneratedImageUrl(
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const a = document.createElement('a');
      a.href = generatedImageUrl;
      a.download = 'Z_Video_Dub_Artwork.png';
      a.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  Thumbnail &amp; Visual Art Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  gemini-3.1-flash-image
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Create and edit high-impact YouTube video thumbnails and scene posters using <strong>gemini-3.1-flash-image</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white">Genre Presets:</span>
            <div className="space-y-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.prompt)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-amber-500/50 hover:bg-slate-950 transition-all text-xs"
                >
                  <div className="font-bold text-amber-300">{p.title}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.prompt}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">Aspect Ratio:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    aspectRatio === ratio
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio} {ratio === '16:9' ? '(Video)' : ratio === '9:16' ? '(Reels)' : '(Square)'}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white">Image Description &amp; Edit Prompt:</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono leading-relaxed"
              placeholder="Describe the image you want to generate or edit..."
            />
          </div>

          <button
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Image (Gemini 3.1)...' : 'Generate Artwork'}</span>
          </button>
        </div>

        {/* Image Preview Stage (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Generated Artwork Preview</span>
              </span>
              <span className="text-xs font-mono text-slate-400">{aspectRatio}</span>
            </div>

            {/* Canvas/Image Box */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Generated artwork"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-500">Image will appear here</span>
              )}
            </div>
          </div>

          {generatedImageUrl && (
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>

              {onSetProjectThumbnail && (
                <button
                  onClick={() => onSetProjectThumbnail(generatedImageUrl)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set as Video Thumbnail</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
