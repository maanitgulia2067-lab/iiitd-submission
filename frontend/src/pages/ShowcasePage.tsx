import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../services/api';

export const ShowcasePage: React.FC = () => {
  const [showcaseProjects, setShowcaseProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    api.getShowcase().then(setShowcaseProjects).finally(() => setLoading(false));
  }, []);

  const filtered = showcaseProjects.filter((p) => {
    if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Shipped Telemetry Banner */}
      <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-bold tracking-wider">[TELEMETRY_LOGS // SHIPPED_BUILDS]</span>
          <span className="text-slate-400 hidden sm:inline">&bull; Verifiable Student Artifacts</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-300 dark:text-slate-400">
          <span>BENCHMARKS: <strong className="text-white">VERIFIED</strong></span>
          <span>REPOSITORIES: <strong className="text-white">OPEN SOURCE</strong></span>
          <span>CITATIONS: <strong className="text-white">FR-029</strong></span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Project Showcase</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Section 4.3 (FR-029): Completed and shipped multi-college student innovations with verifiable contributions and live demos.
          </p>
        </div>

        <div className="flex gap-2 font-mono">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Domains</option>
            <option value="ai/ml">AI / Machine Learning</option>
            <option value="web">Web & Cloud</option>
            <option value="iot">IoT & Robotics</option>
            <option value="social impact">Social Impact</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">Loading showcase...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 pixel-box">
          No projects featured in this domain yet. Submit your completed BuildSpace project to be featured!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <div
              key={p.project_id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 pixel-box flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {p.category}
                  </span>
                  <span className="pixel-chip bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    Completed & Shipped
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Led by {p.creator_name}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">{p.title}</h3>
                {p.tagline && <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">{p.tagline}</p>}

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{p.description}</p>

                {/* Team contributors */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Collaborators</span>
                  <div className="mt-2 space-y-1.5 font-mono">
                    {p.members?.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <span className="font-semibold">{m.name} ({m.college_name})</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono">
                {p.repository_url ? (
                  <a
                    href={p.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Code Repository &rarr;
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Open Source</span>
                )}
                {p.demo_url ? (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-bold pixel-box transition"
                  >
                    View Live Demo &rarr;
                  </a>
                ) : (
                  <span className="pixel-chip bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Live Demo Ready
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
