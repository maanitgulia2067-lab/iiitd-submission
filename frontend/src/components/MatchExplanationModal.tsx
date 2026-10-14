import React from 'react';

interface MatchExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  targetName: string;
  matchScore: number;
  roleFit?: number;
  interestFit?: number;
  learningFit?: number;
  availabilityFit?: number;
  explanations?: string[];
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  isOpen,
  onClose,
  title,
  targetName,
  matchScore,
  roleFit = 0.5,
  interestFit = 0.5,
  learningFit = 0.4,
  availabilityFit = 0.8,
  explanations = []
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 pixel-box">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mb-1 border border-slate-200 dark:border-slate-700">
              <span>Section 4.4 Matching Engine</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compatibility breakdown with <span className="font-semibold text-slate-800 dark:text-slate-200">{targetName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Total Score Badge */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Overall Match Compatibility
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              M = 100 × (0.50R + 0.20I + 0.15L + 0.15A)
            </p>
          </div>
          <div className="flex items-baseline space-x-1 font-mono">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{matchScore}%</span>
          </div>
        </div>

        {/* 4 Factor Breakdown */}
        <div className="space-y-3.5 mb-5 font-mono">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700 dark:text-slate-300">Role & Skill Fit (R · 50%)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{Math.round(roleFit * 100)}%</span>
            </div>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-slate-900 dark:bg-slate-100 rounded transition-all" style={{ width: `${Math.round(roleFit * 100)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700 dark:text-slate-300">Shared Domain Interests (I · 20%)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{Math.round(interestFit * 100)}%</span>
            </div>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-slate-700 dark:bg-slate-300 rounded transition-all" style={{ width: `${Math.round(interestFit * 100)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700 dark:text-slate-300">Learning Goals Alignment (L · 15%)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{Math.round(learningFit * 100)}%</span>
            </div>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-slate-600 dark:bg-slate-400 rounded transition-all" style={{ width: `${Math.round(learningFit * 100)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-700 dark:text-slate-300">Availability & Mode (A · 15%)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{Math.round(availabilityFit * 100)}%</span>
            </div>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-slate-500 dark:bg-slate-400 rounded transition-all" style={{ width: `${Math.round(availabilityFit * 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Human-Readable Reasons (SRS FR-014, FR-033) */}
        <div className="mb-5">
          <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-2">
            Why You Were Recommended
          </p>
          <ul className="space-y-2">
            {explanations.map((exp, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold shrink-0">✓</span>
                <span className="leading-relaxed">{exp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-mono font-semibold transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
