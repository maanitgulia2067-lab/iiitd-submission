import React, { useState } from 'react';
import { User } from '../types';

interface LandingPageProps {
  onNavigate: (tab: string, entityId?: string) => void;
  currentUser: User | null;
  onUserSwitch: (user: User) => void;
  demoUsers: User[];
  mode?: 'landing' | 'simulator';
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onUserSwitch,
  demoUsers,
  mode = 'landing'
}) => {
  // Glimpse console active tab on landing page
  const [activeGlimpse, setActiveGlimpse] = useState<'talent' | 'builds' | 'skills' | 'radar'>('talent');

  // Simulator State
  const [selectedCandidate, setSelectedCandidate] = useState<'aarav' | 'priya' | 'rohan' | 'vikram'>('aarav');
  const [selectedProject, setSelectedProject] = useState<'medscan' | 'campuscred' | 'agrirover'>('medscan');
  const [commitmentHours, setCommitmentHours] = useState<number>(12);
  const [collabMode, setCollabMode] = useState<'Remote' | 'Hybrid' | 'In-person'>('Remote');
  const [activeStep, setActiveStep] = useState<number>(0);

  // Candidate Data Matrix
  const candidateMatrix = {
    aarav: {
      name: 'Aarav Sharma',
      college: 'DTU',
      role: 'Backend Architect',
      skills: ['FastAPI', 'Java', 'PostgreSQL', 'Docker'],
      learning: ['PyTorch', 'MLOps'],
      interests: ['AI', 'HealthTech', 'FinTech'],
      avatar: 'A'
    },
    priya: {
      name: 'Priya Patel',
      college: 'IIT Delhi',
      role: 'AI/ML Researcher',
      skills: ['PyTorch', 'Computer Vision', 'Python'],
      learning: ['React', 'FastAPI'],
      interests: ['AI', 'HealthTech', 'ClimateTech'],
      avatar: 'P'
    },
    rohan: {
      name: 'Rohan Mehta',
      college: 'BITS Pilani',
      role: 'Frontend Architect',
      skills: ['React', 'TypeScript', 'Tailwind', 'UI/UX'],
      learning: ['Docker', 'WebAssembly'],
      interests: ['EdTech', 'Accessibility', 'Startups'],
      avatar: 'R'
    },
    vikram: {
      name: 'Vikram Joshi',
      college: 'NSUT Delhi',
      role: 'DevOps & Cloud Lead',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      learning: ['Go', 'Rust'],
      interests: ['Cloud', 'Robotics', 'Security'],
      avatar: 'V'
    }
  };

  // Projects Matrix
  const projectMatrix = {
    medscan: {
      id: 'prj_medscan_01',
      title: 'MedScan AI',
      subtitle: 'Preliminary Radiograph Screening',
      lead: 'Priya Patel (IIT Delhi)',
      neededRoles: ['Backend Engineer (FastAPI)', 'React Frontend'],
      stack: ['PyTorch', 'FastAPI', 'React'],
      domain: ['AI', 'HealthTech'],
      recommendedCandidate: 'aarav',
      preferredMode: 'Remote',
      baseCommitment: 10
    },
    campuscred: {
      id: 'prj_campuscred_02',
      title: 'CampusCred',
      subtitle: 'Verifiable Student Micro-Credentials',
      lead: 'Aarav Sharma (DTU)',
      neededRoles: ['Frontend Architect (React)', 'UI/UX Designer'],
      stack: ['FastAPI', 'TypeScript', 'Tailwind'],
      domain: ['FinTech', 'Web3', 'EdTech'],
      recommendedCandidate: 'rohan',
      preferredMode: 'Hybrid',
      baseCommitment: 8
    },
    agrirover: {
      id: 'prj_agrirover_03',
      title: 'AgriRover Autonomous',
      subtitle: 'Edge Vision Field Scouting Bot',
      lead: 'Kabir Verma (IIT Delhi)',
      neededRoles: ['DevOps / Telemetry Engineer', 'Vision Model Optimizer'],
      stack: ['ROS2', 'Docker', 'PyTorch'],
      domain: ['Robotics', 'ClimateTech', 'Cloud'],
      recommendedCandidate: 'vikram',
      preferredMode: 'Remote',
      baseCommitment: 12
    }
  };

  // Mathematical Calculation based on SRS 4.4 Formula
  // M = 100 * (0.50 * R + 0.20 * I + 0.15 * L + 0.15 * A)
  const candidate = candidateMatrix[selectedCandidate];
  const project = projectMatrix[selectedProject];

  // R: Role & Skill Fit (50%)
  let roleFit = 0.50;
  if (selectedProject === 'medscan') {
    if (selectedCandidate === 'aarav') roleFit = 0.98;
    else if (selectedCandidate === 'rohan') roleFit = 0.88;
    else if (selectedCandidate === 'vikram') roleFit = 0.70;
    else roleFit = 0.60;
  } else if (selectedProject === 'campuscred') {
    if (selectedCandidate === 'rohan') roleFit = 0.98;
    else if (selectedCandidate === 'aarav') roleFit = 0.65;
    else if (selectedCandidate === 'vikram') roleFit = 0.80;
    else roleFit = 0.55;
  } else {
    if (selectedCandidate === 'vikram') roleFit = 0.96;
    else if (selectedCandidate === 'priya') roleFit = 0.90;
    else roleFit = 0.65;
  }

  // I: Shared Domain Interest (20%)
  const sharedInterests = candidate.interests.filter(i => project.domain.includes(i));
  const interestFit = sharedInterests.length > 0 ? (sharedInterests.length >= 2 ? 0.95 : 0.85) : 0.40;

  // L: Learning Goals Alignment (15%)
  const learningOverlap = candidate.learning.filter(l => project.stack.includes(l));
  const learningFit = learningOverlap.length > 0 ? 0.95 : 0.75;

  // A: Availability & Mode Fit (15%)
  const hoursRatio = Math.min(1.0, commitmentHours / project.baseCommitment);
  const modeMatch = collabMode === project.preferredMode ? 1.0 : (collabMode === 'Hybrid' || project.preferredMode === 'Hybrid' ? 0.85 : 0.65);
  const availabilityFit = 0.5 * hoursRatio + 0.5 * modeMatch;

  // Final Match Score
  const matchScore = Math.round(100 * (0.50 * roleFit + 0.20 * interestFit + 0.15 * learningFit + 0.15 * availabilityFit));

  const journeySteps = [
    {
      num: '01',
      title: 'DISCOVER',
      tagline: 'Who shares my interests across universities?',
      desc: 'Browse student profiles across 28+ partner colleges. Filter by verified institution, technical skills, learning aspirations, and availability.',
      badge: '[SEARCH & DIRECTORY]'
    },
    {
      num: '02',
      title: 'CONNECT',
      tagline: 'Who has the skills I need, and who needs mine?',
      desc: 'Our rule-based matching engine pairs complementary skill sets using the SRS 4.4 formula with transparent, human-readable explanations.',
      badge: '[EXPLAINABLE MATCH]'
    },
    {
      num: '03',
      title: 'BUILD',
      tagline: 'What real-world projects can we build together?',
      desc: 'Publish project ideas in BuildSpace, define required open roles, review applicant pitches, and manage shared kanbans, milestones, and repositories.',
      badge: '[WORKSPACES & TEAMS]'
    },
    {
      num: '04',
      title: 'GROW',
      tagline: 'What can we learn, ship, and demonstrate?',
      desc: 'Exchange skills 1-on-1 through SkillShare peer mentorship, coordinate joint collegiate club initiatives, and showcase completed software.',
      badge: '[SKILLSHARE & SHOWCASE]'
    }
  ];

  // -------------------------------------------------------------
  // VIEW A: DEDICATED FULL SIMULATOR (mode === 'simulator')
  // -------------------------------------------------------------
  if (mode === 'simulator') {
    return (
      <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            <span>&larr;</span>
            <span>BACK TO OVERVIEW</span>
          </button>
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ENGINE STATUS: ONLINE • DETERMINISTIC
          </span>
        </div>

        {/* Top Metric Banner */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">28+</span>
            <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">COLLEGES CONNECTED</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">14+</span>
            <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ACTIVE BUILDS</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">85+</span>
            <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">VERIFIED BUILDERS</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">94.2%</span>
            <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">MATCH ACCURACY</p>
          </div>
        </section>

        {/* Simulator Box */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold uppercase text-slate-500 dark:text-slate-400">[SRS SECTION 4.4]</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                  WEIGHTED MATCH ENGINE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                Rule-Based Compatibility Simulator
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Formula: M = 100(0.50R + 0.20I + 0.15L + 0.15A)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Step 1 */}
              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                  1. Select Candidate Builder (R & L Fit)
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {(Object.keys(candidateMatrix) as Array<keyof typeof candidateMatrix>).map(k => {
                    const c = candidateMatrix[k];
                    const isSelected = selectedCandidate === k;
                    return (
                      <button
                        key={k}
                        onClick={() => setSelectedCandidate(k)}
                        className={`p-3 rounded-xl border text-left transition flex items-start space-x-2.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <span className="w-7 h-7 rounded bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {c.avatar}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{c.name}</p>
                          <p className={`text-[11px] font-mono truncate ${isSelected ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                            {c.college} &bull; {c.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                  2. Select Target Project Build (I & R Fit)
                </label>
                <div className="space-y-2">
                  {(Object.keys(projectMatrix) as Array<keyof typeof projectMatrix>).map(k => {
                    const p = projectMatrix[k];
                    const isSelected = selectedProject === k;
                    return (
                      <button
                        key={k}
                        onClick={() => setSelectedProject(k)}
                        className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold">{p.title}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                              {p.domain.join(', ')}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                            {p.subtitle} &bull; Lead: {p.lead}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold">&rarr;</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  3. Adjust Availability & Mode Parameters (A Fit)
                </span>
                
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1 text-slate-700 dark:text-slate-300">
                    <span>Weekly Commitment:</span>
                    <span className="font-bold">{commitmentHours} hours / week</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="20"
                    step="2"
                    value={commitmentHours}
                    onChange={e => setCommitmentHours(Number(e.target.value))}
                    className="w-full accent-slate-900 dark:accent-slate-100 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                    <span>4 hrs (Casual)</span>
                    <span>10-12 hrs (Recommended)</span>
                    <span>20 hrs (Sprint)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-700 dark:text-slate-300 block mb-1.5">Collaboration Mode:</label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    {(['Remote', 'Hybrid', 'In-person'] as const).map(modeOpt => (
                      <button
                        key={modeOpt}
                        onClick={() => setCollabMode(modeOpt)}
                        className={`py-1.5 rounded-lg border font-semibold transition ${
                          collabMode === modeOpt
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {modeOpt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Gauge */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Calculated Match Score
                </span>
                <span className="font-mono text-2xl font-black text-slate-900 dark:text-slate-100">
                  {matchScore}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-300"
                  style={{ width: `${matchScore}%` }}
                ></div>
              </div>

              {/* 4 Weights Breakdown */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>R: Role & Skill Fit (50% weight)</span>
                    <span className="font-bold">{Math.round(roleFit * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                    <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: `${roleFit * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>I: Domain Interest Fit (20% weight)</span>
                    <span className="font-bold">{Math.round(interestFit * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                    <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: `${interestFit * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>L: Learning Goals Alignment (15% weight)</span>
                    <span className="font-bold">{Math.round(learningFit * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                    <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: `${learningFit * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>A: Availability & Mode Fit (15% weight)</span>
                    <span className="font-bold">{Math.round(availabilityFit * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                    <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: `${availabilityFit * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Rationale Box */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">
                  [EXPLANATION &bull; SRS FR-014]
                </span>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Direct Skill Fit: </strong>
                  {candidate.name} offers <span className="font-mono font-semibold">{candidate.skills.slice(0, 3).join(', ')}</span> matching the open positions in <span className="font-semibold">{project.title}</span>.
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Cross-Campus Value: </strong>
                  Connects <span className="font-mono">{candidate.college}</span> with <span className="font-mono">{project.lead}</span> with compatible commitment of {commitmentHours} hrs/wk ({collabMode}).
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  const targetUser = demoUsers.find(u => u.name.startsWith(candidate.name.split(' ')[0]));
                  if (targetUser) onUserSwitch(targetUser);
                  onNavigate('workspace', project.id);
                }}
                className="w-full py-2.5 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold tracking-wide transition shadow-sm"
              >
                LAUNCH WORKSPACE AS THIS BUILDER &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* 4-Step Collaborative Journey Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              The 4-Step Collaborative Journey (SRS 1.5)
            </h2>
            <span className="text-xs font-mono text-slate-400">Student-First Design</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {journeySteps.map((step, idx) => (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  activeStep === idx
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div>
                  <span className="font-mono text-xl font-black block opacity-40">{step.num}</span>
                  <h3 className="text-base font-bold font-mono tracking-tight mt-1">{step.title}</h3>
                  <p className={`text-xs mt-1 font-medium ${activeStep === idx ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                    {step.tagline}
                  </p>
                  <p className={`text-xs mt-2.5 leading-relaxed ${activeStep === idx ? 'text-slate-200 dark:text-slate-800' : 'text-slate-600 dark:text-slate-400'}`}>
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/20 dark:border-slate-700/20">
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold block ${activeStep === idx ? 'text-slate-300 dark:text-slate-700' : 'text-slate-400 dark:text-slate-500'}`}>
                    {step.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: CLEAN DYNAMIC LANDING PAGE (mode === 'landing')
  // -------------------------------------------------------------
  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 sm:px-6 py-4 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Uncluttered, High-Impact)                */}
      {/* ========================================================= */}
      <section className="text-center max-w-3xl mx-auto pt-6 pb-2 space-y-5">
        
        {/* Monospace Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-100"></span>
          <span>▲ GROUNDUP // CROSS-COLLEGE COLLABORATION PLATFORM</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          Build from the ground up with student peers across any college.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Break campus silos. Discover complementary teammates, publish collaborative project blueprints, exchange peer skills, and ship verifiable software together.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('feed')}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-mono font-bold tracking-wide transition shadow-sm flex items-center space-x-2"
          >
            <span>Launch Builder Center</span>
            <span>&rarr;</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold tracking-wide transition shadow-xs"
          >
            <span>Run Match Simulator [SRS §4.4]</span>
          </button>

          <button
            onClick={() => onNavigate('buildspace')}
            className="px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-mono font-medium transition"
          >
            Explore Active Builds &rarr;
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. DYNAMIC LIVE GLIMPSE CONSOLE (Interactive Switcher)    */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              PLATFORM AT A GLANCE &bull; LIVE PREVIEW
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Explore GroundUp Capabilities in Real-Time
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            Click tabs below to preview modules
          </span>
        </div>

        {/* Glimpse Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          {[
            { id: 'talent', label: '01. Talent Match', icon: '🔍' },
            { id: 'builds', label: '02. Project Blueprints', icon: '🛠️' },
            { id: 'skills', label: '03. Peer SkillShare', icon: '⇄' },
            { id: 'radar', label: '04. Sprint Radar', icon: '🏆' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveGlimpse(tab.id as any)}
              className={`p-2.5 rounded-xl border text-center transition font-semibold flex items-center justify-center space-x-1.5 ${
                activeGlimpse === tab.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Talent Matching Live Preview */}
        {activeGlimpse === 'talent' && (
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                [RECOMMENDED COMPLEMENTARY PAIR &bull; 94% MATCH SCORE]
              </span>
              <button
                onClick={() => onNavigate('builders')}
                className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline"
              >
                Browse All Builders &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Aarav */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Aarav Sharma</h4>
                    <p className="text-[11px] font-mono text-slate-500">DTU &bull; Backend Architect</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono space-y-1 pt-1">
                  <div className="text-slate-600 dark:text-slate-400">Offers: <span className="font-bold text-slate-900 dark:text-slate-100">FastAPI, Docker, PostgreSQL</span></div>
                  <div className="text-slate-600 dark:text-slate-400">Wants to Learn: <span className="font-bold text-slate-900 dark:text-slate-100">PyTorch, Computer Vision</span></div>
                </div>
              </div>

              {/* Card 2: Priya */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Priya Patel</h4>
                    <p className="text-[11px] font-mono text-slate-500">IIT Delhi &bull; AI/ML Researcher</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono space-y-1 pt-1">
                  <div className="text-slate-600 dark:text-slate-400">Offers: <span className="font-bold text-slate-900 dark:text-slate-100">PyTorch, Vision Transformers</span></div>
                  <div className="text-slate-600 dark:text-slate-400">Wants to Learn: <span className="font-bold text-slate-900 dark:text-slate-100">FastAPI, Production Docker</span></div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <strong>Algorithm Rationale: </strong> Aarav offers the exact backend skills Priya requires for MedScan AI, while Priya provides mentorship in PyTorch which Aarav has targeted as a learning goal.
            </div>
          </div>
        )}

        {/* Tab 2: BuildSpace Projects Live Preview */}
        {activeGlimpse === 'builds' && (
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                [ACTIVE COLLABORATIVE BLUEPRINT &bull; RECRUITING]
              </span>
              <button
                onClick={() => onNavigate('buildspace')}
                className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline"
              >
                View BuildSpace Directory &rarr;
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      HEALTHCARE &bull; AI/ML
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold">
                      PROTOTYPE
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    MedScan AI — Vision Transformers for Preliminary Radiograph Screening
                  </h3>
                </div>
                <span className="font-mono text-xs text-slate-500">Led by Priya Patel (IIT Delhi)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Role 1 Needed</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">Backend Architect (FastAPI)</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">1 Position Open &bull; Remote</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Role 2 Needed</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">Frontend Engineer (React / Tailwind)</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">1 Position Open &bull; Remote</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('workspace', 'prj_medscan_01')}
                className="w-full py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-mono font-bold hover:opacity-90 transition text-center"
              >
                OPEN WORKSPACE BLUEPRINT &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Peer SkillShare Live Preview */}
        {activeGlimpse === 'skills' && (
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                [RECIPROCAL EXCHANGE PROTOCOL &bull; ZERO MONETARY FEE]
              </span>
              <button
                onClick={() => onNavigate('skillshare')}
                className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline"
              >
                Explore SkillShare &rarr;
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">Student Builder A</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Priya Patel (IIT Delhi)</h4>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mt-1 inline-block">
                  Offers: PyTorch &amp; CV
                </span>
              </div>

              <div className="font-mono text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <span>⇄</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  MUTUAL RECIPROCITY
                </span>
                <span>⇄</span>
              </div>

              <div className="text-center sm:text-right">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">Student Builder B</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Aarav Sharma (DTU)</h4>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mt-1 inline-block">
                  Offers: FastAPI &amp; Docker
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 text-center">
              Co-learning without paywalls. Peer guidance requests are matched directly via complementary learning targets.
            </p>
          </div>
        )}

        {/* Tab 4: Sprint Radar Live Preview */}
        {activeGlimpse === 'radar' && (
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                [UPCOMING SPRINT CALENDAR &bull; RECRUITING TEAMS]
              </span>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline"
              >
                View Opportunity Hub &rarr;
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                      HACKATHON
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Nov 20-21, 2026 &bull; Hybrid</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    HackShift 2026 — 24-Hour Cross-College Hackathon
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Theme: Inter-Campus Innovation. Open to cross-institutional teams of 2-4 builders.
                  </p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 shrink-0">
                  T-MINUS 36 DAYS
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                <span className="text-slate-500">Eligibility: All verified college students</span>
                <button
                  onClick={() => onNavigate('buildspace')}
                  className="font-bold text-slate-900 dark:text-slate-100 hover:underline"
                >
                  Assemble Team in BuildSpace &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ========================================================= */}
      {/* 3. PLATFORM TELEMETRY STATS                               */}
      {/* ========================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">28+</span>
          <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">COLLEGES CONNECTED</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">14+</span>
          <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ACTIVE BUILDS</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">85+</span>
          <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">VERIFIED BUILDERS</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">94.2%</span>
          <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">MATCH ACCURACY</p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. THE 4-STEP COLLABORATIVE JOURNEY (SRS 1.5)             */}
      {/* ========================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              ARCHITECTURE &bull; SRS SECTION 1.5
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              The 4-Step Student Collaborative Journey
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Student-First Design</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {journeySteps.map((step, idx) => (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                activeStep === idx
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              <div>
                <span className="font-mono text-xl font-black block opacity-40">{step.num}</span>
                <h3 className="text-base font-bold font-mono tracking-tight mt-1">{step.title}</h3>
                <p className={`text-xs mt-1 font-medium ${activeStep === idx ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                  {step.tagline}
                </p>
                <p className={`text-xs mt-2.5 leading-relaxed ${activeStep === idx ? 'text-slate-200 dark:text-slate-800' : 'text-slate-600 dark:text-slate-400'}`}>
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/20 dark:border-slate-700/20">
                <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold block ${activeStep === idx ? 'text-slate-300 dark:text-slate-700' : 'text-slate-400 dark:text-slate-500'}`}>
                  {step.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. QUICK TRY-IT-OUT COMPATIBILITY TEASER                  */}
      {/* ========================================================= */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ALGORITHM IN ACTION &bull; SRS SECTION 4.4
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              Test Compatibility Formula: M = 100(0.50R + 0.20I + 0.15L + 0.15A)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 hover:underline shrink-0"
          >
            Launch Full Mathematical Simulator &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <label className="text-slate-500 block mb-1">Pick Candidate:</label>
            <select
              value={selectedCandidate}
              onChange={e => setSelectedCandidate(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="aarav">Aarav Sharma (DTU - Backend)</option>
              <option value="priya">Priya Patel (IIT Delhi - AI/ML)</option>
              <option value="rohan">Rohan Mehta (BITS - Frontend)</option>
              <option value="vikram">Vikram Joshi (NSUT - DevOps)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Pick Target Build:</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="medscan">MedScan AI (HealthTech)</option>
              <option value="campuscred">CampusCred (Web3 / FinTech)</option>
              <option value="agrirover">AgriRover Autonomous (Robotics)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Calculated Compatibility</span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">{matchScore}% Match</span>
            </div>
            <button
              onClick={() => onNavigate('simulator')}
              className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
            >
              Tune &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. BOTTOM CTA BANNER                                      */}
      {/* ========================================================= */}
      <section className="p-8 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to build with students across 28+ colleges?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-700 max-w-xl mx-auto leading-relaxed font-medium">
          Create your profile, publish a project idea, or recruit your dream hackathon team today on GroundUp.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('feed')}
            className="px-6 py-2.5 rounded-xl bg-white text-slate-900 dark:bg-slate-900 dark:text-white text-xs font-mono font-bold hover:opacity-90 transition shadow-sm"
          >
            Enter Builder Center &rarr;
          </button>
          <button
            onClick={() => onNavigate('buildspace')}
            className="px-5 py-2.5 rounded-xl border border-slate-700 dark:border-slate-300 text-xs font-mono font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
          >
            Browse Active Projects
          </button>
        </div>
      </section>

    </div>
  );
};
