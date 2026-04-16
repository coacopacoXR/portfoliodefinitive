import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { projectsData, publicationsData, musicData, scholarData, thesisData, cvData } from './data';
import { ScholarVisualizer } from './components/ScholarVisualizer';
import { PortfolioItem } from './types';
import { AnimatePresence, motion } from 'framer-motion';

// --- SVG Icons ---

const MailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// --- Tutorial ---

type TutorialHighlight = 'left' | 'right' | 'middle' | 'wheel' | 'click';

const TutorialMouse = ({ highlight, done }: { highlight: TutorialHighlight; done: boolean }) => {
  const orange = done ? '#16a34a' : '#ea580c';
  const purple = done ? '#16a34a' : '#8b5cf6';
  const leftOn   = highlight === 'left'   || highlight === 'click';
  const rightOn  = highlight === 'right';
  const middleOn = highlight === 'middle';
  const wheelOn  = highlight === 'wheel';
  return (
    <svg width="56" height="80" viewBox="0 0 40 60" fill="none" strokeLinecap="round">
      <rect x="2" y="2" width="36" height="56" rx="12" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="20" y1="2" x2="20" y2="25" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="2" y1="25" x2="38" y2="25" stroke="#9ca3af" strokeWidth="1.5" />
      <path d="M 2 14 A 12 12 0 0 1 20 2 L 20 25 L 2 25 Z" stroke="none"
        fill={leftOn ? orange : '#e5e7eb'} opacity={leftOn ? 1 : 0.4} />
      <path d="M 20 2 A 12 12 0 0 1 38 14 L 38 25 L 20 25 Z" stroke="none"
        fill={rightOn ? orange : '#e5e7eb'} opacity={rightOn ? 1 : 0.4} />
      <rect x="18" y="6" width="4" height="10" rx="2" stroke="none"
        fill={middleOn ? orange : wheelOn ? purple : '#9ca3af'}
        opacity={middleOn || wheelOn ? 1 : 0.4} />
    </svg>
  );
};

interface StepDef {
  highlight: TutorialHighlight;
  title: string;
  cue: string;
  cueTrackpad?: string;
  action: string;
  skippable?: boolean;
}

const STEPS: StepDef[] = [
  { highlight: 'left',   title: 'Rotate the scene',  cue: 'Left-click and drag anywhere in the background.', action: 'Keep dragging…' },
  { highlight: 'right',  title: 'Zoom in & out',      cue: 'Right-click and drag up or down.', action: 'Keep dragging…' },
  { highlight: 'middle', title: 'Pan / move around',  cue: 'Press the scroll wheel (middle button) and drag.', cueTrackpad: 'On a trackpad: swipe sideways with two fingers.', action: 'Middle-drag or swipe sideways…', skippable: true },
  { highlight: 'wheel',  title: 'Browse items',       cue: 'Scroll your mouse wheel to flip through the cards.', cueTrackpad: 'On a trackpad: scroll vertically with two fingers.', action: 'Scroll now…' },
  { highlight: 'click',  title: 'Open an item',       cue: 'Left-click any cube to see its details.', action: 'Click a cube…' },
];

const Tutorial = ({ isHackerMode, selectedId, onClose }: { isHackerMode: boolean; selectedId: string | null; onClose: () => void; }) => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [device, setDevice] = useState<'mouse' | 'trackpad' | null>(null);
  const total = STEPS.length;

  useEffect(() => {
    if (device !== null) return;
    const detect = (e: WheelEvent) => { setDevice(e.deltaMode !== 0 || Math.abs(e.deltaY) > 30 ? 'mouse' : 'trackpad'); };
    window.addEventListener('wheel', detect, { capture: true, passive: true });
    return () => window.removeEventListener('wheel', detect, { capture: true } as EventListenerOptions);
  }, [device]);

  const advance = () => {
    if (step < total - 1) { setStep(s => s + 1); setDone(false); }
    else onClose();
  };

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(advance, 750);
    return () => clearTimeout(t);
  }, [done, step]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  useEffect(() => {
    if (step !== 0 || done) return;
    let down = false, sx = 0, sy = 0;
    const onDown = (e: PointerEvent) => { if (e.button === 0) { down = true; sx = e.clientX; sy = e.clientY; } };
    const onMove = (e: PointerEvent) => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > 40) setDone(true); };
    const onUp = () => { down = false; };
    window.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [step, done]);

  useEffect(() => {
    if (step !== 1 || done) return;
    let down = false, sx = 0, sy = 0;
    const noCtx = (e: MouseEvent) => e.preventDefault();
    const onDown = (e: PointerEvent) => { if (e.button === 2) { down = true; sx = e.clientX; sy = e.clientY; } };
    const onMove = (e: PointerEvent) => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > 40) setDone(true); };
    const onUp = () => { down = false; };
    window.addEventListener('contextmenu', noCtx); window.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('contextmenu', noCtx); window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [step, done]);

  useEffect(() => {
    if (step !== 2 || done) return;
    let down = false, sx = 0, sy = 0;
    const onDown = (e: PointerEvent) => { if (e.button === 1) { down = true; sx = e.clientX; sy = e.clientY; } };
    const onMove = (e: PointerEvent) => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > 30) setDone(true); };
    const onUp = () => { down = false; };
    window.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [step, done]);

  useEffect(() => {
    if (step !== 3 || done) return;
    let accumulated = 0;
    // Use capture phase so we receive the event before CameraRig's stopPropagation on the canvas
    const onWheel = (e: WheelEvent) => { accumulated += Math.abs(e.deltaY); if (accumulated > 100) setDone(true); };
    window.addEventListener('wheel', onWheel, { passive: true, capture: true });
    return () => window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
  }, [step, done]);

  useEffect(() => {
    if (step !== 4 || done) return;
    if (selectedId) setDone(true);
  }, [step, done, selectedId]);

  const cur = STEPS[step];
  const bg = isHackerMode ? 'bg-[#050505] border-green-900' : 'bg-white border-gray-100';
  const tx = isHackerMode ? 'text-green-400' : 'text-gray-900';
  const sub = isHackerMode ? 'text-green-700' : 'text-gray-500';
  const dot = isHackerMode ? 'bg-green-500' : 'bg-orange-500';
  const dotOff = isHackerMode ? 'bg-green-900' : 'bg-gray-200';
  const doneBg = isHackerMode ? 'border-green-600 bg-green-950' : 'border-green-400 bg-green-50';
  const doneTx = isHackerMode ? 'text-green-400' : 'text-green-700';
  const waitBg = isHackerMode ? 'border-green-900 bg-[#050505]' : 'border-orange-200 bg-orange-50';
  const waitTx = isHackerMode ? 'text-green-500' : 'text-orange-600';
  const skip   = isHackerMode ? 'text-green-800 hover:text-green-500' : 'text-gray-400 hover:text-gray-700';

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[340px] border shadow-2xl ${bg}`}
      >
        <div className={`flex items-start gap-5 p-5 ${isHackerMode ? 'border-b border-green-900' : 'border-b border-gray-100'}`}>
          <TutorialMouse highlight={cur.highlight} done={done} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className={`text-xs font-bold uppercase tracking-widest ${tx}`}>{cur.title}</p>
              <span className={`text-[9px] font-mono ${sub}`}>{step + 1}/{total}</span>
            </div>
            <p className={`text-xs leading-relaxed ${sub}`}>{cur.cue}</p>
            {device === 'trackpad' && cur.cueTrackpad && (
              <p className={`text-[10px] mt-1 leading-relaxed italic ${isHackerMode ? 'text-green-800' : 'text-blue-500'}`}>{cur.cueTrackpad}</p>
            )}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`flex items-center gap-3 px-4 py-3 border-2 ${doneBg}`}>
              <span className="text-xl leading-none">✓</span>
              <span className={`text-sm font-bold uppercase tracking-widest ${doneTx}`}>Nice! Moving on…</span>
            </motion.div>
          ) : (
            <div className={`flex items-center justify-between px-4 py-3 border-2 ${waitBg}`}>
              <div className="flex items-center gap-3">
                <span className={`text-base leading-none animate-pulse ${waitTx}`}>●</span>
                <span className={`text-xs font-semibold uppercase tracking-widest ${waitTx}`}>{cur.action}</span>
              </div>
              {cur.skippable && (
                <button onClick={advance} className={`text-xs font-bold uppercase tracking-wider transition-colors ${skip}`}>Skip →</button>
              )}
            </div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-center gap-2.5 pb-5 pt-4">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? `w-6 ${dot}` : i < step ? `w-2 ${dot} opacity-40` : `w-2 ${dotOff}`}`} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Category Legend ---
const CATEGORIES = [
  { label: 'Project',  type: 'project',  bg: '#dbeafe', border: '#60a5fa' },
  { label: 'Research', type: 'research', bg: '#fef3c7', border: '#f59e0b' },
  { label: 'Music',    type: 'music',    bg: '#111111', border: '#404040' },
];

const CategoryLegend = ({ isHackerMode, activeFilter, onFilterChange }: { isHackerMode: boolean; activeFilter: string | null; onFilterChange: (type: string | null) => void; }) => (
  <div className={`flex items-center gap-1 p-1 border backdrop-blur-md shadow-md ${isHackerMode ? 'bg-black/80 border-green-900' : 'bg-white/80 border-white/50'}`}>
    {CATEGORIES.map(({ label, type, bg, border }) => {
      const isActive = activeFilter === type;
      const isDimmed = activeFilter !== null && !isActive;
      return (
        <button key={type} onClick={() => onFilterChange(isActive ? null : type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 cursor-pointer
            ${isHackerMode ? isActive ? 'bg-green-900/60' : 'hover:bg-green-900/30' : isActive ? 'bg-black/8 shadow-inner' : 'hover:bg-gray-100'}
            ${isDimmed ? 'opacity-35' : 'opacity-100'}`}>
          <div className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-125' : ''}`}
            style={isHackerMode ? { background: isActive ? '#22c55e' : 'transparent', border: '1px solid #22c55e' } : { background: bg, border: `1.5px solid ${border}` }} />
          <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isHackerMode ? isActive ? 'text-green-300' : 'text-green-600' : isActive ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
        </button>
      );
    })}
  </div>
);

// --- Controls Help ---
const ControlsHelp = ({ isHackerMode, isHovering }: { isHackerMode: boolean; isHovering: boolean }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeButton, setActiveButton] = useState<'left' | 'right' | 'middle' | 'wheel' | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'h') setIsVisible(prev => !prev); };
    const handleMouseDown = (e: MouseEvent) => { if (e.button === 0) setActiveButton('left'); if (e.button === 2) setActiveButton('right'); if (e.button === 1) setActiveButton('middle'); };
    const handleMouseUp = () => setActiveButton(null);
    const handleWheel = () => { setActiveButton('wheel'); setTimeout(() => setActiveButton(null), 300); };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('mousedown', handleMouseDown); window.addEventListener('mouseup', handleMouseUp); window.addEventListener('wheel', handleWheel);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('mousedown', handleMouseDown); window.removeEventListener('mouseup', handleMouseUp); window.removeEventListener('wheel', handleWheel); };
  }, []);

  if (!isVisible) return null;

  const leftFill  = isHackerMode ? 'fill-green-500' : 'fill-orange-500';
  const rightFill = isHackerMode ? 'fill-green-300' : 'fill-blue-500';
  const wheelFill = isHackerMode ? 'fill-green-700' : 'fill-purple-500';

  return (
    <div className={`hidden md:flex absolute bottom-8 left-8 z-40 flex-row items-center gap-6 transition-all duration-500 p-4 border backdrop-blur-md shadow-lg ${isHackerMode ? 'bg-black/80 border-green-900' : 'bg-white/80 border-white/50'}`}>
      <div className="relative">
        <svg width="40" height="60" viewBox="0 0 40 60" className={`${isHackerMode ? 'stroke-green-500' : 'stroke-gray-800'} fill-none stroke-[1.5]`}>
          <rect x="2" y="2" width="36" height="56" rx="12" />
          <line x1="20" y1="2" x2="20" y2="25" />
          <line x1="2" y1="25" x2="38" y2="25" />
          <path d="M 2 14 A 12 12 0 0 1 20 2 L 20 25 L 2 25 Z" className={`${activeButton === 'left' ? 'opacity-100' : 'opacity-40'} ${leftFill} transition-opacity stroke-none`} />
          <path d="M 20 2 A 12 12 0 0 1 38 14 L 38 25 L 20 25 Z" className={`${activeButton === 'right' ? 'opacity-100' : 'opacity-40'} ${rightFill} transition-opacity stroke-none`} />
          <rect x="18" y="6" width="4" height="10" rx="2" className={`${activeButton === 'wheel' || activeButton === 'middle' ? 'opacity-100' : 'opacity-40'} ${wheelFill} stroke-none transition-opacity`} />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeButton === 'left' ? 'opacity-100 scale-105' : 'opacity-70'}`}>
          <div className={`w-2 h-2 rounded-full ${isHackerMode ? 'bg-green-500' : 'bg-orange-500'}`} />
          <span className={isHackerMode ? 'text-green-400' : 'text-gray-800'}>Left: {isHovering ? 'Select' : 'Rotate'}</span>
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeButton === 'right' ? 'opacity-100 scale-105' : 'opacity-70'}`}>
          <div className={`w-2 h-2 rounded-full ${isHackerMode ? 'bg-green-300' : 'bg-blue-500'}`} />
          <span className={isHackerMode ? 'text-green-400' : 'text-gray-800'}>Right: Zoom</span>
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeButton === 'wheel' ? 'opacity-100 scale-105' : 'opacity-70'}`}>
          <div className={`w-2 h-2 rounded-full ${isHackerMode ? 'bg-green-700' : 'bg-purple-500'}`} />
          <span className={isHackerMode ? 'text-green-400' : 'text-gray-800'}>Wheel: Scroll Deck</span>
        </div>
        <div className="h-[1px] w-full bg-gray-300/50 my-1" />
        <div className="text-[8px] text-gray-400 font-mono uppercase">Press [H] to Hide</div>
      </div>
    </div>
  );
};

// --- Top Navigation ---

type ViewTab = 'work' | 'research' | 'cv' | 'music';

interface TopNavProps {
  viewMode: '2d' | '3d';
  onEnter3D: () => void;
  onExit3D: () => void;
  activeTab: ViewTab;
  setActiveTab: (t: ViewTab) => void;
  isHackerMode: boolean;
  activePopup: 'email' | 'phone' | null;
  togglePopup: (t: 'email' | 'phone') => void;
  email: string;
  phone: string;
  navRef: React.RefObject<HTMLDivElement>;
}

const TopNav: React.FC<TopNavProps> = ({ viewMode, onEnter3D, onExit3D, activeTab, setActiveTab, isHackerMode, activePopup, togglePopup, email, phone, navRef }) => {
  const tabs: { id: ViewTab; label: string }[] = [
    { id: 'work',     label: 'Work'     },
    { id: 'research', label: 'Research' },
    { id: 'cv',       label: 'CV'       },
    { id: 'music',    label: 'Music'    },
  ];

  const base = isHackerMode
    ? 'bg-[#050505]/95 border-green-900 text-green-400'
    : 'bg-[#f0f0f0]/95 border-gray-200 text-[#1a1a1a]';

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md ${base}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
        {/* Name */}
        <div className={`font-typewriter font-bold text-xs uppercase tracking-widest whitespace-nowrap select-none ${isHackerMode ? 'text-green-400' : 'text-[#1a1a1a]'}`}>
          Francisco García Rivera
        </div>

        {/* Tabs (2D mode only) */}
        {viewMode === '2d' && (
          <div className="hidden md:flex items-center gap-0">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? (isHackerMode ? 'border-green-500 text-green-400' : 'border-orange-500 text-orange-600')
                    : (isHackerMode ? 'border-transparent text-green-700 hover:text-green-400' : 'border-transparent text-gray-400 hover:text-[#1a1a1a]')}`}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Right: contacts + mode toggle */}
        <div className="flex items-center gap-2">
          {/* Email */}
          <div className="relative">
            <button onClick={() => togglePopup('email')}
              className={`p-2 border transition-all ${activePopup === 'email'
                ? (isHackerMode ? 'bg-green-900 border-green-500 text-green-400' : 'bg-orange-50 border-orange-400 text-orange-600')
                : (isHackerMode ? 'border-green-900 text-green-700 hover:text-green-400 hover:border-green-600' : 'border-gray-300 text-gray-500 hover:border-gray-600 hover:text-[#1a1a1a]')}`}>
              <MailIcon className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {activePopup === 'email' && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className={`absolute top-full right-0 mt-2 p-4 border shadow-xl min-w-[240px] flex flex-col gap-3 z-[60] ${isHackerMode ? 'bg-[#050505] border-green-800' : 'bg-white border-gray-200'}`}>
                  <div className={`text-xs font-mono select-all text-center tracking-wide ${isHackerMode ? 'text-green-300' : 'text-gray-600'}`}>{email}</div>
                  <a href={`mailto:${email}`} className={`w-full py-2 text-[10px] font-bold uppercase tracking-widest text-center border transition-all ${isHackerMode ? 'border-green-700 text-green-500 hover:bg-green-900' : 'bg-[#1a1a1a] text-white hover:bg-orange-600 border-transparent'}`}>
                    Send Email →
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Phone */}
          <div className="relative">
            <button onClick={() => togglePopup('phone')}
              className={`p-2 border transition-all ${activePopup === 'phone'
                ? (isHackerMode ? 'bg-green-900 border-green-500 text-green-400' : 'bg-orange-50 border-orange-400 text-orange-600')
                : (isHackerMode ? 'border-green-900 text-green-700 hover:text-green-400 hover:border-green-600' : 'border-gray-300 text-gray-500 hover:border-gray-600 hover:text-[#1a1a1a]')}`}>
              <PhoneIcon className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {activePopup === 'phone' && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className={`absolute top-full right-0 mt-2 p-4 border shadow-xl min-w-[240px] flex flex-col gap-3 z-[60] ${isHackerMode ? 'bg-[#050505] border-green-800' : 'bg-white border-gray-200'}`}>
                  <div className={`text-xs font-mono select-all text-center tracking-wide ${isHackerMode ? 'text-green-300' : 'text-gray-600'}`}>{phone}</div>
                  <a href={`tel:${phone}`} className={`w-full py-2 text-[10px] font-bold uppercase tracking-widest text-center border transition-all ${isHackerMode ? 'border-green-700 text-green-500 hover:bg-green-900' : 'bg-[#1a1a1a] text-white hover:bg-orange-600 border-transparent'}`}>
                    Call →
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/francisco-garc%C3%ADa-rivera/"
            target="_blank"
            rel="noreferrer"
            className={`p-2 border transition-all ${isHackerMode ? 'border-green-900 text-green-700 hover:text-green-400 hover:border-green-600' : 'border-gray-300 text-gray-500 hover:border-gray-600 hover:text-[#1a1a1a]'}`}>
            <LinkedInIcon className="w-3.5 h-3.5" />
          </a>

          {/* 3D / 2D Toggle */}
          <button
            onClick={viewMode === '3d' ? onExit3D : onEnter3D}
            className={`text-[9px] font-mono font-bold uppercase tracking-widest border px-3 py-2 transition-all whitespace-nowrap
              ${viewMode === '3d'
                ? (isHackerMode ? 'bg-green-900 border-green-500 text-green-400' : 'bg-[#1a1a1a] text-white border-[#1a1a1a]')
                : (isHackerMode ? 'border-green-900 text-green-700 hover:border-green-600 hover:text-green-400' : 'border-gray-300 text-gray-500 hover:border-[#1a1a1a] hover:text-[#1a1a1a]')}`}>
            {viewMode === '3d' ? '← 2D' : '3D ↗'}
          </button>
        </div>
      </div>

      {/* Mobile tabs (2D mode) */}
      {viewMode === '2d' && (
        <div className={`md:hidden flex border-t ${isHackerMode ? 'border-green-900' : 'border-gray-200'}`}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all
                ${activeTab === tab.id
                  ? (isHackerMode ? 'text-green-400 bg-green-900/20' : 'text-orange-600 bg-orange-50')
                  : (isHackerMode ? 'text-green-800' : 'text-gray-400')}`}>
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

// --- Work Tab ---

const PARTNER_LOGOS = [
  { name: 'Scania',             url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Scania_Logo_2000.svg' },
  { name: 'Volvo Trucks',       url: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Volvo_Trucks_Logo.svg' },
  { name: 'Ericsson',           url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Ericsson_logo.svg' },
  { name: 'Zeekr',              url: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Zeekr_logo.svg' },
  { name: 'GKN Aerospace',      url: 'https://upload.wikimedia.org/wikipedia/commons/7/72/GKN_Aerospace_logo.svg' },
  { name: 'Politecnico Milano', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Politecnico_di_Milano_logo.svg' },
];

const COLLABORATORS = [
  'University of Antwerp',
  'Hospital de Antequera',
  'OptimaChef',
  'Cogesa Consulting',
];

const PartnerLogo = ({ name, url }: { name: string; url: string }) => {
  const [err, setErr] = useState(false);
  if (err) return <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 border border-gray-300 px-2 py-1 whitespace-nowrap">{name}</span>;
  return (
    <div className="h-7 transition-all duration-500">
      <img src={url} alt={name} onError={() => setErr(true)} className="h-full w-auto object-contain opacity-40 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-500" />
    </div>
  );
};

const WorkTab = ({ items, onSelect, isHackerMode }: { items: PortfolioItem[]; onSelect: (id: string) => void; isHackerMode: boolean }) => {
  const projects = items.filter(i => i.type === 'project');

  const card = isHackerMode ? 'bg-[#0a0a0a] border-green-900 hover:border-green-500' : 'bg-white border-gray-200 hover:border-orange-400';
  const title = isHackerMode ? 'text-green-300 group-hover:text-green-100' : 'text-[#1a1a1a] group-hover:text-orange-600';
  const meta  = isHackerMode ? 'text-green-800' : 'text-gray-400';
  const body  = isHackerMode ? 'text-green-700' : 'text-gray-500';
  const tag   = isHackerMode ? 'bg-green-950 border-green-900 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-500';
  const link  = isHackerMode ? 'text-green-800 hover:text-green-500' : 'text-gray-400 hover:text-[#1a1a1a]';
  const arrow = isHackerMode ? 'text-green-900 group-hover:text-green-500' : 'text-gray-300 group-hover:text-orange-500';

  return (
    <div>
      {/* Hero */}
      <div className="mb-12 pt-4">
        <p className={`text-[9px] font-mono uppercase tracking-widest mb-3 ${meta}`}>Portfolio · 2026</p>
        <h1 className={`text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none mb-4 ${isHackerMode ? 'text-green-400' : 'text-[#1a1a1a]'}`}>
          Francisco<br />García Rivera
        </h1>
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 ${isHackerMode ? 'text-green-600' : 'text-gray-600'}`}>
          {['Creative Researcher', 'Technologist', 'Designer', 'Producer'].map((t, i, arr) => (
            <React.Fragment key={t}>
              <span className="text-xs font-bold uppercase tracking-wide">{t}</span>
              {i < arr.length - 1 && <span className={isHackerMode ? 'text-green-900' : 'text-gray-300'}>·</span>}
            </React.Fragment>
          ))}
        </div>
        <div className={`h-px mb-5 ${isHackerMode ? 'bg-green-900' : 'bg-gray-200'}`} />
        <p className={`text-sm leading-relaxed max-w-xl ${isHackerMode ? 'text-green-700' : 'text-gray-500'}`}>
          PhD Informatics · MSc Intelligent Automation · BSc Mechanical Engineering<br />
          Building at the intersection of XR research, product design, and interactive technology.<br />
          Turning complex systems into working products.
        </p>
      </div>

      {/* Collaborators */}
      <div className={`mb-12 pb-6 border-b ${isHackerMode ? 'border-green-900/40' : 'border-gray-200'}`}>
        <p className={`text-[8px] font-mono uppercase tracking-widest mb-3 ${meta}`}>Collaborators</p>
        <div className="flex flex-wrap items-center gap-2">
          {[...PARTNER_LOGOS.map(l => l.name), ...COLLABORATORS].map(name => (
            <span key={name} className={`text-[9px] font-mono uppercase tracking-widest border px-3 py-1.5 ${isHackerMode ? 'border-green-900 text-green-700' : 'border-gray-300 text-gray-500'}`}>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className={`flex items-baseline justify-between border-b pb-3 mb-8 ${isHackerMode ? 'border-green-900' : 'border-gray-200'}`}>
        <h2 className={`text-xs font-bold uppercase tracking-widest ${isHackerMode ? 'text-green-500' : 'text-[#1a1a1a]'}`}>Selected Work</h2>
        <span className={`text-[9px] font-mono ${meta}`}>[0{projects.length}]</span>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((item, idx) => {
          const p = item.data as any;
          return (
            <div key={item.id} onClick={() => onSelect(item.id)}
              className={`border transition-all cursor-pointer group flex flex-col p-6 hover:shadow-md ${card}`}>
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[8px] font-mono uppercase tracking-widest ${isHackerMode ? 'text-green-600' : 'text-orange-500'}`}>Project</span>
                <span className={`text-[8px] font-mono ${meta}`}>[{String(idx + 1).padStart(2, '0')}]</span>
              </div>
              {/* Title */}
              <h3 className={`font-bold text-base leading-tight mb-3 transition-colors ${title}`}>{item.data.title}</h3>
              {/* Tagline */}
              <p className={`text-xs leading-relaxed mb-4 flex-grow ${body}`}>{p.tagline || p.description?.slice(0, 120) + '…'}</p>
              {/* Divider */}
              <div className={`h-px mb-4 ${isHackerMode ? 'bg-green-900/40' : 'bg-gray-100'}`} />
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4 min-h-[24px]">
                {(p.tags as string[] | undefined)?.slice(0, 5).map((t: string) => (
                  <span key={t} className={`text-[8px] font-mono uppercase tracking-wider px-2 py-1 border ${tag}`}>{t}</span>
                ))}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${link}`}>
                      GitHub ↗
                    </a>
                  )}
                  {p.youtube && (
                    <a href={p.youtube} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                      className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${link}`}>
                      Video ↗
                    </a>
                  )}
                  {p.demo && !p.github && !p.youtube && (
                    <span className={`text-[8px] font-mono uppercase tracking-wider border px-1.5 py-0.5 ${isHackerMode ? 'border-green-900 text-green-800' : 'border-gray-200 text-gray-400'}`}>Live Demo</span>
                  )}
                </div>
                <span className={`text-[9px] font-mono uppercase tracking-widest transition-colors ${arrow}`}>
                  View →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Research Tab ---

const SCHOLAR_URL = 'https://scholar.google.se/citations?hl=en&user=h2on66wAAAAJ&view_op=list_works&sortby=pubdate';

const ResearchTab = ({ isHackerMode }: { isHackerMode: boolean }) => {

  const articleCount = publicationsData.filter(p => p.type === 'Article').length;
  const confCount    = publicationsData.length - articleCount;
  const oaCount      = publicationsData.filter(p => p.open_access).length;
  const years        = publicationsData.map(p => p.year);
  const yearSpan     = `${Math.min(...years)} – ${Math.max(...years)}`;

  const section = isHackerMode ? 'border-green-900' : 'border-gray-200';
  const meta    = isHackerMode ? 'text-green-800' : 'text-gray-400';
  const body    = isHackerMode ? 'text-green-700' : 'text-gray-500';
  const h2      = isHackerMode ? 'text-green-400' : 'text-[#1a1a1a]';

  return (
    <div>
      {/* PhD Thesis — Featured */}
      <div className={`border p-8 mb-10 ${isHackerMode ? 'bg-[#0a0a0a] border-green-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between mb-2">
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isHackerMode ? 'text-green-600' : 'text-orange-500'}`}>
            PhD Thesis · {thesisData.year}
          </span>
          <span className={`text-[9px] font-mono ${meta}`}>[Kappa]</span>
        </div>
        <h2 className={`text-2xl md:text-3xl font-bold leading-tight mb-2 ${isHackerMode ? 'text-green-300' : 'text-[#1a1a1a]'}`}>
          {thesisData.title}
        </h2>
        <p className={`text-sm font-mono mb-6 ${meta}`}>{thesisData.university}</p>
        <p className={`text-base leading-relaxed mb-8 max-w-3xl ${body}`}>{thesisData.abstract}</p>

        {/* Papers */}
        <div className="mb-6">
          <p className={`text-[9px] font-mono uppercase tracking-widest mb-3 ${meta}`}>
            Appended Papers ({thesisData.papers.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {thesisData.papers.map(paper => (
                <div key={paper.number}
                  className={`flex items-start gap-3 p-4 border ${isHackerMode ? 'border-green-900 bg-[#050505]' : 'border-gray-200 bg-gray-50'}`}>
                  <span className={`text-[9px] font-mono uppercase whitespace-nowrap mt-0.5 flex-shrink-0 ${isHackerMode ? 'text-green-600' : 'text-orange-500'}`}>{paper.number}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold leading-snug mb-1 ${isHackerMode ? 'text-green-400' : 'text-gray-700'}`}>{paper.title}</p>
                    <p className={`text-[10px] font-mono mb-2 ${meta}`}>{paper.year} · {paper.journal}</p>
                    {paper.description && (
                      <p className={`text-[10px] leading-relaxed mb-2 ${body}`}>{paper.description}</p>
                    )}
                    {paper.doi && (
                      <a href={paper.doi} target="_blank" rel="noreferrer"
                        className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${isHackerMode ? 'text-green-700 hover:text-green-400' : 'text-gray-400 hover:text-orange-600'}`}>
                        DOI ↗
                      </a>
                    )}
                  </div>
                </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={SCHOLAR_URL} target="_blank" rel="noreferrer"
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest border transition-colors ${isHackerMode ? 'border-green-800 text-green-700 hover:border-green-600 hover:text-green-400' : 'border-gray-300 text-gray-500 hover:border-[#1a1a1a] hover:text-[#1a1a1a]'}`}>
            Google Scholar ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className={`flex items-baseline justify-between border-b pb-3 mb-6 ${section}`}>
        <h2 className={`text-xs font-bold uppercase tracking-widest ${h2}`}>Publications</h2>
        <span className={`text-[9px] font-mono ${meta}`}>{yearSpan}</span>
      </div>
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-px mb-8 ${isHackerMode ? 'bg-green-900/30' : 'bg-gray-200'} border ${section}`}>
        {[
          { value: publicationsData.length, label: 'Total' },
          { value: articleCount,            label: 'Journal Articles' },
          { value: confCount,               label: 'Conf. Papers' },
          { value: oaCount,                 label: 'Open Access' },
        ].map(({ value, label }) => (
          <div key={label} className={`px-6 py-5 ${isHackerMode ? 'bg-[#050505]' : 'bg-[#f0f0f0]'}`}>
            <p className={`text-3xl font-bold leading-none mb-1 ${isHackerMode ? 'text-green-400' : 'text-[#1a1a1a]'}`}>{value}</p>
            <p className={`text-[9px] font-mono uppercase tracking-widest ${meta}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Publication list by year */}
      <div className="flex flex-col gap-8 mb-8">
        {Array.from(new Set(publicationsData.map(p => p.year))).sort((a, b) => b - a).map(year => (
          <div key={year}>
            <p className={`text-[9px] font-mono uppercase tracking-widest mb-3 ${meta}`}>{year}</p>
            <div className={`flex flex-col border-t ${section}`}>
              {publicationsData.filter(p => p.year === year).map((pub, i) => (
                <div key={i} className={`flex flex-col md:flex-row md:items-baseline gap-2 md:gap-5 py-3 border-b ${section}`}>
                  <div className="flex-shrink-0">
                    <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 border
                      ${pub.type === 'Article'
                        ? (isHackerMode ? 'border-orange-800 text-orange-600 bg-orange-950/30' : 'border-orange-300 text-orange-600 bg-orange-50')
                        : (isHackerMode ? 'border-indigo-900 text-indigo-400 bg-indigo-950/20' : 'border-indigo-200 text-indigo-500 bg-indigo-50')}`}>
                      {pub.type === 'Article' ? 'Article' : 'Conf.'}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm font-semibold leading-snug mb-0.5 ${isHackerMode ? 'text-green-300' : 'text-[#1a1a1a]'}`}>
                      {pub.doi
                        ? <a href={pub.doi} target="_blank" rel="noreferrer" className={`hover:underline underline-offset-2 transition-colors ${isHackerMode ? 'hover:text-green-100' : 'hover:text-orange-600'}`}>{pub.title}</a>
                        : pub.title}
                    </p>
                    <p className={`text-xs italic truncate ${body}`}>{pub.journal}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {pub.open_access && (
                      <span className={`text-[8px] font-mono uppercase tracking-wider border px-1.5 py-0.5 ${isHackerMode ? 'border-green-900 text-green-700' : 'border-green-200 text-green-600 bg-green-50'}`}>OA</span>
                    )}
                    {pub.doi && (
                      <a href={pub.doi} target="_blank" rel="noreferrer" className={`text-[10px] transition-colors ${meta} hover:${isHackerMode ? 'text-green-400' : 'text-orange-600'}`}>↗</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scholar CTA */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border p-6 ${isHackerMode ? 'bg-[#0a0a0a] border-green-900' : 'bg-white border-gray-200'}`}>
        <div>
          <p className={`text-[9px] font-mono uppercase tracking-widest mb-1 ${meta}`}>Active {yearSpan}</p>
          <p className={`text-sm font-bold ${isHackerMode ? 'text-green-300' : 'text-[#1a1a1a]'}`}>Full citation metrics &amp; co-author network</p>
        </div>
        <a href={SCHOLAR_URL} target="_blank" rel="noreferrer"
          className={`flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors whitespace-nowrap ${isHackerMode ? 'bg-green-900 text-green-400 hover:bg-green-800' : 'bg-[#1a1a1a] text-white hover:bg-orange-600'}`}>
          View on Google Scholar ↗
        </a>
      </div>
    </div>
  );
};

// --- CV Tab ---

const CVTab = ({ isHackerMode }: { isHackerMode: boolean }) => {
  const experience = cvData.filter(e => e.type === 'experience');
  const education  = cvData.filter(e => e.type === 'education');

  const skillGroups = [
    { label: 'Game Engines & XR',          items: ['Unity', 'Unreal Engine'] },
    { label: 'Programming',                items: ['C#', 'C++', 'Python', 'JavaScript', 'TypeScript', 'LUA'] },
    { label: 'Web & Data',                 items: ['React', 'Three.js', 'React Three Fiber', 'Vite', 'Tailwind CSS', 'Zustand', 'Recharts', 'Flask', 'Express', 'Pandas', 'Plotly', 'SQLite'] },
    { label: '3D & Design Tools',          items: ['Blender', 'SolidWorks', 'Inventor', 'Gravity Sketch', 'Figma', 'Adobe XD', 'Shapes XR'] },
    { label: 'Motion Capture & Ergonomics',items: ['Xsens', 'IPS IMMA', 'Jack', 'Santos', 'Qualisys', 'Move 4D'] },
    { label: 'Version Control & DevOps',   items: ['Git', 'DevOps for XR'] },
    { label: 'Creative Production',        items: ['Ableton Live', 'Logic Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Adobe Premiere', 'Adobe Audition'] },
  ];

  const professionalService = [
    { role: 'Chair of PhD Council', detail: '4× elected leader — coordinated PhD representatives across all university bodies, University of Skövde' },
    { role: 'Symposium Co-Organizer', detail: '6th Digital Human Modelling Symposium (2020) · 10th Swedish Production Symposium (2022)' },
    { role: 'Industrial Demonstrator Leader', detail: 'ASSAR Industrial Innovation Arena, Skövde (2020–2022)' },
  ];

  const languages = [
    { lang: 'Spanish', level: 'Native'        },
    { lang: 'English', level: 'Professional'  },
    { lang: 'Swedish', level: 'Intermediate'  },
    { lang: 'Italian', level: 'Intermediate'  },
  ];

  const section = isHackerMode ? 'border-green-900' : 'border-gray-200';
  const meta    = isHackerMode ? 'text-green-800' : 'text-gray-400';
  const body    = isHackerMode ? 'text-green-700' : 'text-gray-500';
  const h2      = isHackerMode ? 'text-green-400' : 'text-[#1a1a1a]';
  const h3      = isHackerMode ? 'text-green-300' : 'text-[#1a1a1a]';
  const card    = isHackerMode ? 'bg-[#0a0a0a] border-green-900' : 'bg-white border-gray-200';
  const tag     = isHackerMode ? 'bg-green-950 border-green-900 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-500';

  const SectionHeader = ({ label, index }: { label: string; index: string }) => (
    <div className={`flex items-baseline justify-between border-b pb-3 mb-6 ${section}`}>
      <h2 className={`text-xs font-bold uppercase tracking-widest ${h2}`}>{label}</h2>
      <span className={`text-[9px] font-mono ${meta}`}>[{index}]</span>
    </div>
  );

  return (
    <div>
      {/* Experience */}
      <div className="mb-10">
        <SectionHeader label="Experience" index="01" />
        <div className="flex flex-col gap-6">
          {experience.map((entry, i) => (
            <div key={i} className={`border p-5 ${card}`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-3">
                <div>
                  <h3 className={`font-bold text-sm ${h3}`}>{entry.role}</h3>
                  <p className={`text-xs font-mono ${isHackerMode ? 'text-green-600' : 'text-orange-600'}`}>{entry.org}</p>
                </div>
                <div className={`text-[9px] font-mono text-right flex-shrink-0 ${meta}`}>
                  <p>{entry.period}</p>
                  {entry.location && <p>{entry.location}</p>}
                </div>
              </div>
              {entry.bullets && (
                <ul className="flex flex-col gap-1.5">
                  {entry.bullets.map((b, j) => (
                    <li key={j} className={`flex items-start gap-2 text-xs leading-relaxed ${body}`}>
                      <span className={`mt-1.5 flex-shrink-0 w-1 h-1 ${isHackerMode ? 'bg-green-700' : 'bg-orange-400'}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-10">
        <SectionHeader label="Education" index="02" />
        <div className="flex flex-col gap-4">
          {education.map((entry, i) => (
            <div key={i} className={`border p-5 ${card}`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-2">
                <div>
                  <h3 className={`font-bold text-sm ${h3}`}>{entry.role}</h3>
                  <p className={`text-xs font-mono ${isHackerMode ? 'text-green-600' : 'text-orange-600'}`}>{entry.org}</p>
                </div>
                <div className={`text-[9px] font-mono text-right flex-shrink-0 ${meta}`}>
                  <p>{entry.period}</p>
                  {entry.location && <p>{entry.location}</p>}
                </div>
              </div>
              {entry.details && <p className={`text-xs leading-relaxed ${body}`}>{entry.details}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-10">
        <SectionHeader label="Technical Skills" index="03" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skillGroups.map(group => (
            <div key={group.label} className={`border p-4 ${card}`}>
              <p className={`text-[8px] font-mono uppercase tracking-widest mb-2.5 ${isHackerMode ? 'text-green-600' : 'text-orange-500'}`}>{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map(s => (
                  <span key={s} className={`text-[8px] font-mono uppercase tracking-wider px-2 py-1 border ${tag}`}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Service */}
      <div className="mb-10">
        <SectionHeader label="Professional Service" index="04" />
        <div className="flex flex-col gap-3">
          {professionalService.map((s, i) => (
            <div key={i} className={`flex gap-4 border p-4 ${card}`}>
              <span className={`text-[9px] font-mono uppercase tracking-widest whitespace-nowrap mt-0.5 ${isHackerMode ? 'text-green-600' : 'text-orange-500'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className={`text-xs font-bold mb-0.5 ${h3}`}>{s.role}</p>
                <p className={`text-xs leading-relaxed ${body}`}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <SectionHeader label="Languages" index="05" />
        <div className={`flex gap-px border ${section} ${isHackerMode ? 'bg-green-900/20' : 'bg-gray-200'}`}>
          {languages.map(({ lang, level }) => (
            <div key={lang} className={`flex-1 px-4 py-4 ${isHackerMode ? 'bg-[#050505]' : 'bg-[#f0f0f0]'}`}>
              <p className={`text-sm font-bold mb-0.5 ${h3}`}>{lang}</p>
              <p className={`text-[8px] font-mono uppercase tracking-widest ${isHackerMode ? 'text-green-600' : 'text-orange-500'}`}>{level}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Music Tab ---

const MusicTab = ({ items, isHackerMode }: { items: PortfolioItem[]; isHackerMode: boolean }) => {
  const music = items.find(i => i.type === 'music');
  if (!music) return null;
  const m = music.data as any;

  const meta = isHackerMode ? 'text-green-800' : 'text-gray-400';
  const body = isHackerMode ? 'text-green-700' : 'text-gray-500';

  return (
    <div>
      <div className={`flex items-baseline justify-between border-b pb-3 mb-8 ${isHackerMode ? 'border-green-900' : 'border-gray-200'}`}>
        <h2 className={`text-xs font-bold uppercase tracking-widest ${isHackerMode ? 'text-green-400' : 'text-[#1a1a1a]'}`}>Sonic Experiments</h2>
        <span className={`text-[9px] font-mono ${meta}`}>[Side Project]</span>
      </div>

      <div className={`border p-8 max-w-2xl ${isHackerMode ? 'bg-[#0a0a0a] border-green-900' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/60">Artist Profile</span>
          <span className="text-[9px] font-mono text-orange-500/80">Spotify</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{m.title || 'My Music'}</h3>
        <p className="text-xs text-white/40 font-mono mb-6">{m.role}</p>
        <iframe
          style={{ borderRadius: '8px' }}
          src={m.spotifyEmbedUrl}
          width="100%" height="152"
          frameBorder="0" allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="mb-5"
        />
        <p className="text-xs text-white/40 font-mono leading-relaxed">{m.description}</p>
      </div>
    </div>
  );
};

// --- 2D View (tab router) ---

const TwoDimensionalView = ({ items, onSelect, isHackerMode, activeTab }: { items: PortfolioItem[]; onSelect: (id: string) => void; isHackerMode: boolean; activeTab: ViewTab; }) => {
  const bg = isHackerMode ? 'bg-[#050505]' : 'bg-[#f0f0f0]';
  const dotColor = isHackerMode ? 'rgba(0,255,0,0.06)' : 'rgba(0,0,0,0.07)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`absolute inset-0 z-0 overflow-y-auto ${bg}`}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        paddingTop: '56px',
      }}>
      {/* Mobile sub-nav spacer (mobile tabs adds ~40px) */}
      <div className="md:hidden h-10" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}>
            {activeTab === 'work'     && <WorkTab     items={items} onSelect={onSelect} isHackerMode={isHackerMode} />}
            {activeTab === 'research' && <ResearchTab isHackerMode={isHackerMode} />}
            {activeTab === 'cv'       && <CVTab       isHackerMode={isHackerMode} />}
            {activeTab === 'music'    && <MusicTab    items={items} isHackerMode={isHackerMode} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [hoveredId,    setHoveredId]    = useState<string | null>(null);
  const [activePopup,  setActivePopup]  = useState<'email' | 'phone' | null>(null);
  const [viewMode,     setViewMode]     = useState<'2d' | '3d'>('2d');
  const [activeTab,    setActiveTab]    = useState<ViewTab>('work');
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  const [showTutorial, setShowTutorial] = useState(false);
  const [deckMode,     setDeckMode]     = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isHackerMode, setIsHackerMode] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Konami Code easter egg
  useEffect(() => {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let cur = 0;
    const fn = (e: KeyboardEvent) => {
      if (e.key === seq[cur]) { cur++; if (cur === seq.length) { setIsHackerMode(p => !p); cur = 0; } }
      else cur = 0;
    };
    window.addEventListener('keydown', fn);
    console.log('%c Looking for bugs? 🐛 \n Try the Konami Code for a different perspective.', 'color: #ea580c; font-weight: bold; font-size: 12px;');
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // Click outside for contact popups
  useEffect(() => {
    if (!activePopup) return;
    const fn = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActivePopup(null);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [activePopup]);

  const togglePopup = (t: 'email' | 'phone') => setActivePopup(p => p === t ? null : t);

  const email = 'fgarciarivera94@gmail.com';
  const phone = '+46734663148';

  // Build 3D items
  const items: PortfolioItem[] = useMemo(() => {
    const result: PortfolioItem[] = [];
    let globalIndex = 0;
    const allData = [
      ...projectsData.map(d => ({ type: 'project' as const, data: d })),
      { type: 'music' as const, data: musicData },
      { type: 'thesis' as const, data: thesisData },
      ...thesisData.papers.map(d => ({ type: 'paper' as const, data: d })),
    ];
    const cols = 3, rows = 3, size = 1.5, gap = 0.5, spacing = size + gap;
    const totalLayers = Math.ceil(allData.length / (cols * rows));
    const offsetX = ((cols - 1) * spacing) / 2;
    const offsetY = ((rows - 1) * spacing) / 2;
    const offsetZ = ((totalLayers - 1) * spacing) / 2;
    const rad = Math.PI / 4, cos = Math.cos(rad), sin = Math.sin(rad);
    allData.forEach((item, i) => {
      const ix = i % cols, iy = Math.floor(i / cols) % rows, iz = Math.floor(i / (cols * rows));
      const x = ix * spacing - offsetX, y = iy * spacing - offsetY, z = iz * spacing - offsetZ;
      const isCorner = (ix === 0 || ix === cols - 1) && (iy === 0 || iy === rows - 1) && (iz === 0 || iz === totalLayers - 1);
      const y_rotX = y * cos - z * sin, z_rotX = y * sin + z * cos, x_rotX = x;
      const x_final = x_rotX * cos + z_rotX * sin, z_final = -x_rotX * sin + z_rotX * cos, y_final = y_rotX;
      result.push({ id: `${item.type}-${i}`, index: globalIndex++, type: item.type, data: item.data, position: [x_final, y_final, z_final], scale: [size, size, size], isCorner });
    });
    return result;
  }, []);

  const allItems = useMemo(() => [
    ...items,
    { id: 'scholar-link', index: items.length, type: 'scholar' as const, data: scholarData, position: [4.8, 2.2, 0.5] as [number, number, number], scale: [1.5, 1.5, 1.5] as [number, number, number], isCorner: false },
  ], [items]);

  const selectedItem = useMemo(() => allItems.find(i => i.id === selectedId) || null, [selectedId, allItems]);

  const handleEnter3D = () => { setViewMode('3d'); if (!isTouchDevice) setShowTutorial(true); };
  const handleExit3D  = () => { setViewMode('2d'); setSelectedId(null); };

  return (
    <div className={`relative w-full h-screen overflow-hidden font-typewriter selection:bg-gray-300 transition-colors duration-500 ${isHackerMode ? 'bg-[#050505] text-green-500' : 'bg-[#f0f0f0] text-[#1a1a1a]'}`}>

      {/* Top Nav */}
      <TopNav
        viewMode={viewMode}
        onEnter3D={handleEnter3D}
        onExit3D={handleExit3D}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isHackerMode={isHackerMode}
        activePopup={activePopup}
        togglePopup={togglePopup}
        email={email}
        phone={phone}
        navRef={navRef}
      />

      {/* 2D Portfolio */}
      <AnimatePresence>
        {viewMode === '2d' && (
          <TwoDimensionalView
            items={allItems}
            onSelect={setSelectedId}
            isHackerMode={isHackerMode}
            activeTab={activeTab}
          />
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      <AnimatePresence>
        {viewMode === '3d' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-10"
            style={{ paddingTop: '56px' }}>
            <Canvas shadows camera={{ position: [0, 0, 14], fov: 45, near: 0.01 }}>
              <Scene
                items={allItems}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onHover={setHoveredId}
                isHackerMode={isHackerMode}
                introComplete={true}
                deckMode={deckMode}
                setDeckMode={setDeckMode}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
                activeFilter={activeFilter}
              />
            </Canvas>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D-only UI */}
      {viewMode === '3d' && (
        <>
          <ControlsHelp isHackerMode={isHackerMode} isHovering={hoveredId !== null} />
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-opacity duration-500 ${selectedId ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <CategoryLegend isHackerMode={isHackerMode} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>
          {/* Item context panel */}
          <AnimatePresence>
            {selectedItem && selectedItem.type !== 'scholar' && (() => {
              const siblings = allItems.filter(i => i.type === selectedItem.type);
              const idx  = siblings.findIndex(i => i.id === selectedItem.id);
              const prev = siblings[idx - 1] ?? null;
              const next = siblings[idx + 1] ?? null;
              return (
                <motion.div key="ctx-panel"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col gap-1 max-w-[200px] font-typewriter">
                  <p className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-2 ${isHackerMode ? 'text-green-600' : 'text-gray-400'}`}>
                    {selectedItem.type.toUpperCase()} · {idx + 1} / {siblings.length}
                  </p>
                  {prev ? (
                    <button onClick={() => setSelectedId(prev.id)} className="group flex items-start gap-2 text-left opacity-50 hover:opacity-100 transition-opacity">
                      <span className={`text-[10px] mt-0.5 ${isHackerMode ? 'text-green-700' : 'text-gray-400'}`}>↑</span>
                      <span className={`text-[10px] font-mono leading-snug line-clamp-2 ${isHackerMode ? 'text-green-700 group-hover:text-green-400' : 'text-gray-400 group-hover:text-gray-700'}`}>{prev.data.title}</span>
                    </button>
                  ) : <div className="h-8" />}
                  <div className={`flex items-start gap-2 my-1 pl-4 border-l-2 ${isHackerMode ? 'border-green-500' : 'border-orange-500'}`}>
                    <span className={`text-[11px] font-bold leading-snug line-clamp-3 ${isHackerMode ? 'text-green-300' : 'text-gray-800'}`}>{selectedItem.data.title}</span>
                  </div>
                  {next ? (
                    <button onClick={() => setSelectedId(next.id)} className="group flex items-start gap-2 text-left opacity-50 hover:opacity-100 transition-opacity">
                      <span className={`text-[10px] mt-0.5 ${isHackerMode ? 'text-green-700' : 'text-gray-400'}`}>↓</span>
                      <span className={`text-[10px] font-mono leading-snug line-clamp-2 ${isHackerMode ? 'text-green-700 group-hover:text-green-400' : 'text-gray-400 group-hover:text-gray-700'}`}>{next.data.title}</span>
                    </button>
                  ) : <div className="h-8" />}
                  <button onClick={() => setSelectedId(null)} className={`mt-4 text-[9px] font-mono uppercase tracking-widest transition-colors ${isHackerMode ? 'text-green-800 hover:text-green-500' : 'text-gray-300 hover:text-gray-600'}`}>← back</button>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </>
      )}

      {/* Tutorial (3D only) */}
      <AnimatePresence>
        {showTutorial && viewMode === '3d' && (
          <Tutorial isHackerMode={isHackerMode} selectedId={selectedId} onClose={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>

      {/* Scholar Visualizer */}
      <AnimatePresence>
        {selectedItem?.type === 'scholar' && (
          <ScholarVisualizer onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>

      {/* Detail Overlay */}
      <Overlay
        item={selectedItem?.type !== 'scholar' ? selectedItem : null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
};

export default App;
