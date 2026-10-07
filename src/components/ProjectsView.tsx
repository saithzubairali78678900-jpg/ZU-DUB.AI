import React from 'react';
import { DubProject } from '../types/dubbing';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';
import { Video, Clock, Mic2, Sparkles, Upload, Play, Check } from 'lucide-react';

interface ProjectsViewProps {
  currentProjectId: string;
  onSelectProject: (project: DubProject) => void;
  onOpenUpload: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  currentProjectId,
  onSelectProject,
  onOpenUpload,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Demo Projects &amp; Templates
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Choose from ready-to-test multi-genre video samples with pre-synchronized Hindi dialogue, or upload your own video for instant AI dubbing.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Custom Video</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_PROJECTS.map((proj) => {
          const isSelected = currentProjectId === proj.id;

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className={`rounded-2xl border overflow-hidden transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-slate-900 shadow-2xl shadow-amber-500/15 ring-2 ring-amber-400/40'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-black overflow-hidden group">
                <img
                  src={proj.thumbnailUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{proj.duration.toFixed(1)}s</span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[10px] font-bold shadow">
                  {proj.category}
                </div>

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white hover:text-amber-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{proj.segments.length} Dialogue Segments</span>
                  </div>

                  {isSelected ? (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Check className="w-4 h-4" /> Active in Studio
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-semibold transition-all"
                    >
                      Load into Studio
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
