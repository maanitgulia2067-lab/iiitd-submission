import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">GroundUp</span>
            <span>•</span>
            <span>HackShift 2026</span>
            <span>•</span>
            <span className="pixel-chip bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              SRS v0.2 Compliant
            </span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Student-First Cross-College Collaboration & Team Formation Platform
          </div>
        </div>
      </div>
    </footer>
  );
};
