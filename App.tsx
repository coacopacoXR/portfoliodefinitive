import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { projectsData, publicationsData, musicData, scholarData } from './data';
import { ScholarVisualizer } from './components/ScholarVisualizer';
import { PortfolioItem } from './types';
import { AnimatePresence, motion } from 'framer-motion';

// --- Subcomponents for Robust Image Handling ---

interface PartnerLogoProps {
  name: string;
  url: string;
}

const PartnerLogo: React.FC<PartnerLogoProps> = ({ name, url }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span className="text-[10px] font-bold text-gray-400 uppercase border border-gray-300 px-2 py-1 whitespace-nowrap bg-white/50">
        {name}
      </span>
    );
  }

  return (
    <div className="group relative h-8 md:h-10 transition-all duration-500">
      <img 
        src={url} 
        alt={name}
        onError={() => setError(true)}
        className="h-full w-auto object-contain opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
      />
    </div>
  );
};

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
  cueTrackpad?: string; // shown below cue when on trackpad
  action: string;
  skippable?: boolean;
}

const STEPS: StepDef[] = [
  {
    highlight: 'left',
    title: 'Rotate the scene',
    cue: 'Left-click and drag anywhere in the background.',
    action: 'Keep dragging…',
  },
  {
    highlight: 'right',
    title: 'Zoom in & out',
    cue: 'Right-click and drag up or down.',
    action: 'Keep dragging…',
  },
  {
    highlight: 'middle',
    title: 'Pan / move around',
    cue: 'Press the scroll wheel (middle button) and drag.',
    cueTrackpad: 'On a trackpad: swipe sideways with two fingers.',
    action: 'Middle-drag or swipe sideways…',
    skippable: true,
  },
  {
    highlight: 'wheel',
    title: 'Browse items',
    cue: 'Scroll your mouse wheel to flip through the cards.',
    cueTrackpad: 'On a trackpad: scroll vertically with two fingers.',
    action: 'Scroll now…',
  },
  {
    highlight: 'click',
    title: 'Open an item',
    cue: 'Left-click any cube to see its details.',
    action: 'Click a cube…',
  },
];

const Tutorial = ({
  isHackerMode,
  selectedId,
  onClose,
}: {
  isHackerMode: boolean;
  selectedId: string | null;
  onClose: () => void;
}) => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  // 'mouse' = physical scroll wheel detected, 'trackpad' = small pixel-mode deltas
  const [device, setDevice] = useState<'mouse' | 'trackpad' | null>(null);
  const total = STEPS.length;

  // Detect mouse vs trackpad from the first wheel event
  useEffect(() => {
    if (device !== null) return;
    const detect = (e: WheelEvent) => {
      setDevice(e.deltaMode !== 0 || Math.abs(e.deltaY) > 30 ? 'mouse' : 'trackpad');
    };
    window.addEventListener('wheel', detect, { capture: true, passive: true });
    return () => window.removeEventListener('wheel', detect, { capture: true } as EventListenerOptions);
  }, [device]);

  const advance = () => {
    if (step < total - 1) { setStep(s => s + 1); setDone(false); }
    else onClose();
  };

  // Auto-advance after success flash
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(advance, 750);
    return () => clearTimeout(t);
  }, [done, step]);

  // ESC to skip all
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Step 0 — left drag (rotate)
  useEffect(() => {
    if (step !== 0 || done) return;
    let down = false, sx = 0, sy = 0;
    const onDown = (e: PointerEvent) => { if (e.button === 0) { down = true; sx = e.clientX; sy = e.clientY; } };
    const onMove = (e: PointerEvent) => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > 40) setDone(true); };
    const onUp = () => { down = false; };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [step, done]);

  // Step 1 — right drag (zoom)
  useEffect(() => {
    if (step !== 1 || done) return;
    let down = false, sx = 0, sy = 0;
    const noCtx = (e: MouseEvent) => e.preventDefault();
    const onDown = (e: PointerEvent) => { if (e.button === 2) { down = true; sx = e.clientX; sy = e.clientY; } };
    const onMove = (e: PointerEvent) => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > 40) setDone(true); };
    const onUp = () => { down = false; };
    window.addEventListener('contextmenu', noCtx);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('contextmenu', noCtx);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [step, done]);

  // Step 2 — middle drag (pan) OR trackpad horizontal swipe
  useEffect(() => {
    if (step !== 2 || done) return;
    let down = false, sx = 0, sy = 0;
    const onDown = (e: PointerEvent) => { if (e.button === 1) { down = true; sx = e.clientX; sy = e.clientY; } };
    const onMove = (e: PointerEvent) => { if (down && Math.hypot(e.clientX - sx, e.clientY - sy) > 30) setDone(true); };
    const onUp = () => { down = false; };
    const onWheel = (e: WheelEvent) => { if (Math.abs(e.deltaX) > 15 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.5) setDone(true); };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('wheel', onWheel, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('wheel', onWheel, { capture: true } as EventListenerOptions);
    };
  }, [step, done]);

  // Step 3 — vertical scroll (browse deck)
  useEffect(() => {
    if (step !== 3 || done) return;
    const fn = (e: WheelEvent) => { if (Math.abs(e.deltaY) > 5) setDone(true); };
    window.addEventListener('wheel', fn, { capture: true, passive: true });
    return () => window.removeEventListener('wheel', fn, { capture: true } as EventListenerOptions);
  }, [step, done]);

  // Step 4 — click a cube
  useEffect(() => {
    if (step === 4 && !done && selectedId !== null) setDone(true);
  }, [step, done, selectedId]);

  const cur = STEPS[step];
  const hk  = isHackerMode;
  const card   = hk ? 'bg-black/95 border-green-800'       : 'bg-white/95 border-gray-200';
  const lbl    = hk ? 'text-green-600'                     : 'text-gray-400';
  const ttl    = hk ? 'text-green-300'                     : 'text-gray-900';
  const bdy    = hk ? 'text-green-700'                     : 'text-gray-500';
  const alt    = hk ? 'text-green-900'                     : 'text-gray-300';
  const skip   = hk ? 'text-green-800 hover:text-green-400': 'text-gray-300 hover:text-gray-600';
  const dot    = hk ? 'bg-green-400'                       : 'bg-gray-900';
  const dotOff = hk ? 'bg-green-900'                       : 'bg-gray-200';
  const waitBg = hk ? 'bg-green-950 border-green-900'      : 'bg-gray-50 border-gray-100';
  const waitTx = hk ? 'text-green-600'                     : 'text-gray-400';
  const doneBg = hk ? 'bg-green-900 border-green-700'      : 'bg-green-50 border-green-200';
  const doneTx = hk ? 'text-green-300'                     : 'text-green-700';

  const showTrackpadHint = cur.cueTrackpad && (device === 'trackpad' || device === null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[420px] border-2 shadow-2xl pointer-events-auto font-typewriter ${card}`}
      style={{ boxShadow: hk ? '0 0 40px rgba(74,222,128,0.2), 0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-inherit">
        <span className={`text-xs font-bold uppercase tracking-widest ${lbl}`}>
          Step {step + 1} of {total} — How to navigate
        </span>
        <button onClick={onClose} className={`text-xs font-bold uppercase tracking-widest transition-colors ${skip}`}>
          Skip [Esc]
        </button>
      </div>

      {/* body — keyed on step so it animates on change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-6 py-5 flex flex-col gap-5"
        >
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <TutorialMouse highlight={cur.highlight} done={done} />
            </div>
            <div className="flex flex-col gap-2">
              <span className={`text-sm font-bold uppercase tracking-widest ${ttl}`}>
                {cur.title}
              </span>
              <p className={`text-sm leading-relaxed ${bdy}`}>{cur.cue}</p>
              {showTrackpadHint && (
                <p className={`text-xs leading-relaxed italic ${alt}`}>{cur.cueTrackpad}</p>
              )}
            </div>
          </div>

          {/* action feedback */}
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
                  <button
                    onClick={advance}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${skip}`}
                  >
                    Skip step →
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* progress dots */}
      <div className="flex items-center justify-center gap-2.5 pb-5">
        {STEPS.map((_, i) => (
          <div key={i}
            className={`h-2 rounded-full transition-all duration-300
              ${i === step ? `w-6 ${dot}` : i < step ? `w-2 ${dot} opacity-40` : `w-2 ${dotOff}`}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

// --- Category Legend ---
const CATEGORIES = [
  { label: 'Project',     type: 'project',     bg: '#dbeafe', border: '#60a5fa' },
  { label: 'Publication', type: 'publication', bg: '#fef3c7', border: '#f59e0b' },
  { label: 'Music',       type: 'music',       bg: '#111111', border: '#404040' },
];

const CategoryLegend = ({
  isHackerMode,
  activeFilter,
  onFilterChange
}: {
  isHackerMode: boolean;
  activeFilter: string | null;
  onFilterChange: (type: string | null) => void;
}) => (
  <div className={`flex items-center gap-1 p-1 border backdrop-blur-md shadow-md
    ${isHackerMode ? 'bg-black/80 border-green-900' : 'bg-white/80 border-white/50'}`}>
    {CATEGORIES.map(({ label, type, bg, border }) => {
      const isActive = activeFilter === type;
      const isDimmed = activeFilter !== null && !isActive;
      return (
        <button
          key={type}
          onClick={() => onFilterChange(isActive ? null : type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 cursor-pointer
            ${isHackerMode
              ? isActive ? 'bg-green-900/60' : 'hover:bg-green-900/30'
              : isActive ? 'bg-black/8 shadow-inner' : 'hover:bg-gray-100'}
            ${isDimmed ? 'opacity-35' : 'opacity-100'}`}
        >
          <div
            className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-125' : ''}`}
            style={isHackerMode
              ? { background: isActive ? '#22c55e' : 'transparent', border: '1px solid #22c55e' }
              : { background: bg, border: `1.5px solid ${border}` }}
          />
          <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors
            ${isHackerMode
              ? isActive ? 'text-green-300' : 'text-green-600'
              : isActive ? 'text-gray-900' : 'text-gray-500'}`}>
            {label}
          </span>
        </button>
      );
    })}
  </div>
);

// --- Controls Help Component (Persistent Legend) ---
const ControlsHelp = ({ isHackerMode, isHovering }: { isHackerMode: boolean; isHovering: boolean }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [activeButton, setActiveButton] = useState<'left' | 'right' | 'middle' | 'wheel' | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'h') setIsVisible(prev => !prev);
        };
        
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) setActiveButton('left');
            if (e.button === 2) setActiveButton('right');
            if (e.button === 1) setActiveButton('middle');
        };

        const handleMouseUp = () => setActiveButton(null);
        
        const handleWheel = () => {
             setActiveButton('wheel');
             setTimeout(() => setActiveButton(null), 300);
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('wheel', handleWheel);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);

    if (!isVisible) return null;

    // Colors
    const leftColor = isHackerMode ? 'text-green-500' : 'text-orange-500';
    const rightColor = isHackerMode ? 'text-green-300' : 'text-blue-500';
    const wheelColor = isHackerMode ? 'text-green-700' : 'text-purple-500';
    
    const leftFill = isHackerMode ? 'fill-green-500' : 'fill-orange-500';
    const rightFill = isHackerMode ? 'fill-green-300' : 'fill-blue-500';
    const wheelFill = isHackerMode ? 'fill-green-700' : 'fill-purple-500';

    return (
        <div className={`hidden md:flex absolute bottom-8 left-8 z-40 flex-row items-center gap-6 transition-all duration-500 p-4 rounded-xl border backdrop-blur-md shadow-lg
             ${isHackerMode ? 'bg-black/80 border-green-900' : 'bg-white/80 border-white/50'}`}>
            
            {/* Mouse SVG */}
            <div className="relative">
                <svg width="40" height="60" viewBox="0 0 40 60" className={`${isHackerMode ? 'stroke-green-500' : 'stroke-gray-800'} fill-none stroke-[1.5]`}>
                    {/* Body */}
                    <rect x="2" y="2" width="36" height="56" rx="12" />
                    {/* Divider */}
                    <line x1="20" y1="2" x2="20" y2="25" />
                    <line x1="2" y1="25" x2="38" y2="25" />
                    
                    {/* Left Button (Rotate) */}
                    <path d="M 2 14 A 12 12 0 0 1 20 2 L 20 25 L 2 25 Z" 
                        className={`${activeButton === 'left' ? 'opacity-100' : 'opacity-40'} ${leftFill} transition-opacity stroke-none`} />
                    
                    {/* Right Button (Zoom) */}
                    <path d="M 20 2 A 12 12 0 0 1 38 14 L 38 25 L 20 25 Z" 
                        className={`${activeButton === 'right' ? 'opacity-100' : 'opacity-40'} ${rightFill} transition-opacity stroke-none`} />
                    
                    {/* Wheel (Scroll) */}
                    <rect x="18" y="6" width="4" height="10" rx="2" 
                        className={`${activeButton === 'wheel' || activeButton === 'middle' ? 'opacity-100' : 'opacity-40'} ${wheelFill} stroke-none transition-opacity`} />
                </svg>
            </div>

            {/* Legend Text */}
            <div className="flex flex-col gap-1.5">
                 <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeButton === 'left' ? 'opacity-100 scale-105' : 'opacity-70'}`}>
                    <div className={`w-2 h-2 rounded-full ${isHackerMode ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className={isHackerMode ? 'text-green-400' : 'text-gray-800'}>
                        Left: {isHovering ? 'Select' : 'Rotate'}
                    </span>
                 </div>

                 <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeButton === 'right' ? 'opacity-100 scale-105' : 'opacity-70'}`}>
                    <div className={`w-2 h-2 rounded-full ${isHackerMode ? 'bg-green-300' : 'bg-blue-500'}`}></div>
                    <span className={isHackerMode ? 'text-green-400' : 'text-gray-800'}>
                        Right: Zoom
                    </span>
                 </div>

                 <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeButton === 'wheel' ? 'opacity-100 scale-105' : 'opacity-70'}`}>
                    <div className={`w-2 h-2 rounded-full ${isHackerMode ? 'bg-green-700' : 'bg-purple-500'}`}></div>
                    <span className={isHackerMode ? 'text-green-400' : 'text-gray-800'}>
                        Wheel: Scroll Deck
                    </span>
                 </div>

                 <div className="h-[1px] w-full bg-gray-300/50 my-1"></div>
                 <div className="text-[8px] text-gray-400 font-mono uppercase">
                     Press [H] to Hide
                 </div>
            </div>
        </div>
    );
};

// --- 2D View Component ---

const SCHOLAR_URL = 'https://scholar.google.se/citations?hl=en&user=h2on66wAAAAJ&view_op=list_works&sortby=pubdate';

const TwoDimensionalView = ({ items, onSelect }: { items: PortfolioItem[], onSelect: (id: string) => void }) => {
    // Separate items by type
    const projects = items.filter(i => i.type === 'project');
    const publications = items.filter(i => i.type === 'publication');
    const music = items.filter(i => i.type === 'music')[0];

    const articleCount = publicationsData.filter(p => p.type === 'Article').length;
    const confCount    = publicationsData.length - articleCount;
    const oaCount      = publicationsData.filter(p => p.open_access).length;
    const years        = publicationsData.map(p => p.year);
    const yearSpan     = `${Math.min(...years)} – ${Math.max(...years)}`;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 pt-48 pb-40 px-6 md:px-16 overflow-y-auto bg-[#f0f0f0] z-0 scroll-smooth"
        >
            <div className="max-w-6xl mx-auto">
                {/* Projects Section */}
                <div className="mb-16">
                    <div className="flex items-baseline justify-between border-b border-gray-300 mb-6 pb-2">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">Selected Projects</h2>
                        <span className="text-xs font-mono text-gray-500">[01]</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projects.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className="bg-white border border-gray-200 p-6 hover:border-orange-500 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                            >
                                <div className="text-[10px] text-gray-400 uppercase mb-4 tracking-wider group-hover:text-orange-600">Project</div>
                                <h3 className="text-lg font-bold leading-tight mb-3 group-hover:underline decoration-1 underline-offset-4">
                                    {item.data.title}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-4 leading-relaxed">
                                    {(item.data as any).description}
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <span className="text-[10px] font-mono uppercase text-gray-400 group-hover:text-black transition-colors">Read Details →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Publications Section */}
                <div className="mb-16">
                    <div className="flex items-baseline justify-between border-b border-gray-300 mb-6 pb-2">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">Publications</h2>
                        <span className="text-xs font-mono text-gray-500">[02]</span>
                    </div>

                    <div className="flex flex-col border-t border-gray-200">
                        {publications.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className="flex flex-col md:flex-row gap-4 md:items-baseline py-4 border-b border-gray-200 hover:bg-white transition-colors cursor-pointer group px-2"
                            >
                                <div className="w-16 flex-shrink-0">
                                    <span className="font-bold text-sm text-gray-400 group-hover:text-orange-600 transition-colors">
                                        {(item.data as any).year}
                                    </span>
                                </div>
                                <div className="w-32 flex-shrink-0">
                                    <span className="text-[9px] uppercase tracking-wider border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                                        {(item.data as any).type}
                                    </span>
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm font-bold text-gray-800 mb-1 group-hover:underline decoration-1 underline-offset-4">
                                        {item.data.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 italic">
                                        {(item.data as any).journal}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px]">↗</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Music Section */}
                 {music && (
                    <div>
                        <div className="flex items-baseline justify-between border-b border-gray-300 mb-6 pb-2">
                            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">Sonic Experiments</h2>
                            <span className="text-xs font-mono text-gray-500">[03]</span>
                        </div>

                        <div className="bg-zinc-900 p-6 text-white max-w-2xl">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-full">
                                    <div className="flex justify-between items-baseline mb-4">
                                        <h3 className="text-lg font-bold text-white">My Music</h3>
                                        <span className="text-[10px] font-mono text-orange-500 uppercase">Spotify Artist</span>
                                    </div>
                                    <iframe 
                                        style={{ borderRadius: '12px' }} 
                                        src={(music.data as any).spotifyEmbedUrl}
                                        width="100%" 
                                        height="152" 
                                        frameBorder="0" 
                                        allowFullScreen 
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                        loading="lazy"
                                        className="mb-4"
                                    />
                                    <p className="text-xs text-gray-400 font-mono">
                                        {(music.data as any).description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
                {/* Google Scholar Section */}
                <div className="mb-16">
                  <div className="flex items-baseline justify-between border-b border-gray-300 mb-6 pb-2">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">Research Profile</h2>
                    <span className="text-xs font-mono text-gray-500">[04]</span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 mb-8">
                    {[
                      { value: publicationsData.length, label: 'Publications' },
                      { value: articleCount,            label: 'Journal Articles' },
                      { value: confCount,               label: 'Conf. Papers' },
                      { value: oaCount,                 label: 'Open Access' },
                    ].map(({ value, label }) => (
                      <div key={label} className="bg-[#f0f0f0] px-6 py-5">
                        <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{value}</p>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Publication list grouped by year */}
                  <div className="flex flex-col gap-8 mb-8">
                    {Array.from(new Set(publicationsData.map(p => p.year))).sort((a, b) => b - a).map(year => (
                      <div key={year}>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">{year}</p>
                        <div className="flex flex-col border-t border-gray-200">
                          {publicationsData.filter(p => p.year === year).map((pub, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 py-3 border-b border-gray-100">
                              <div className="flex-shrink-0">
                                <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${pub.type === 'Article' ? 'border-orange-300 text-orange-600 bg-orange-50' : 'border-indigo-200 text-indigo-500 bg-indigo-50'}`}>
                                  {pub.type === 'Article' ? 'Article' : 'Conf.'}
                                </span>
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-sm font-semibold text-gray-800 leading-snug mb-0.5">
                                  {pub.doi ? (
                                    <a href={pub.doi} target="_blank" rel="noreferrer" className="hover:text-orange-600 hover:underline underline-offset-2 transition-colors">
                                      {pub.title}
                                    </a>
                                  ) : pub.title}
                                </p>
                                <p className="text-xs text-gray-500 italic truncate">{pub.journal}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {pub.open_access && (
                                  <span className="text-[8px] font-mono uppercase tracking-wider text-green-600 border border-green-200 px-1.5 py-0.5 bg-green-50">OA</span>
                                )}
                                {pub.doi && (
                                  <a href={pub.doi} target="_blank" rel="noreferrer" className="text-[10px] text-gray-400 hover:text-orange-600 transition-colors">↗</a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scholar CTA */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-300 p-6 bg-white">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1">Active {yearSpan}</p>
                      <p className="text-sm font-bold text-gray-800">Full citation metrics &amp; co-author network</p>
                    </div>
                    <a
                      href={SCHOLAR_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-orange-600 transition-colors whitespace-nowrap"
                    >
                      View on Google Scholar <span>↗</span>
                    </a>
                  </div>
                </div>

            </div>
        </motion.div>
    );
}

// --- Main Application ---

const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [activePopup, setActivePopup] = useState<'email' | 'phone' | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [introComplete, setIntroComplete] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Deck Mode State (Cards Scrolling)
  const [deckMode, setDeckMode] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Category Filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Easter Egg State
  const [isHackerMode, setIsHackerMode] = useState(false);
  const contactContainerRef = useRef<HTMLDivElement>(null);

  // Konami Code Listener
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let cursor = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[cursor]) {
        cursor++;
        if (cursor === konamiCode.length) {
          setIsHackerMode(prev => !prev);
          cursor = 0;
        }
      } else {
        cursor = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log("%c Looking for bugs? 🐛 \n Try the Konami Code for a different perspective.", "color: #ea580c; font-weight: bold; font-size: 12px;");

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click Outside Listener for Contact Popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactContainerRef.current && !contactContainerRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopup]);

  // Contact Data
  const email = "fgarciarivera94@gmail.com";
  const phone = "+46734663148";

  // Logos
  const logos = [
    { name: "Scania", url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Scania_Logo_2000.svg" },
    { name: "Volvo Trucks", url: "https://upload.wikimedia.org/wikipedia/commons/b/be/Volvo_Trucks_Logo.svg" },
    { name: "Ericsson", url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Ericsson_logo.svg" },
    { name: "Zeekr", url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Zeekr_logo.svg" },
    { name: "GKN Aerospace", url: "https://upload.wikimedia.org/wikipedia/commons/7/72/GKN_Aerospace_logo.svg" },
    { name: "Politecnico Milano", url: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Politecnico_di_Milano_logo.svg" },
    { name: "RISE", url: "https://upload.wikimedia.org/wikipedia/commons/3/31/RISE_Logo.svg" },
    { name: "University of Skövde", url: "https://upload.wikimedia.org/wikipedia/en/e/e3/University_of_Sk%C3%B6vde_logo.svg" },
  ];

  const togglePopup = (type: 'email' | 'phone') => {
    if (activePopup === type) {
      setActivePopup(null);
    } else {
      setActivePopup(type);
    }
  };

  const handleEnter = (mode: '3d' | '2d') => {
      setViewMode(mode);
      setIntroComplete(true);
      if (mode === '3d') setShowTutorial(true);
  }

  // Transform raw data into positioned 3D items (Rotated Voxel Cube Layout)
  const items: PortfolioItem[] = useMemo(() => {
    const result: PortfolioItem[] = [];
    let globalIndex = 0;
    
    // Combine all data into a linear sequence
    const allData = [
        ...projectsData.map(d => ({ type: 'project' as const, data: d })),
        { type: 'music' as const, data: musicData },
        ...publicationsData.map(d => ({ type: 'publication' as const, data: d }))
    ];
    
    // Grid Configuration: 3x3x2 (18 items) fits perfectly
    const cols = 3;
    const rows = 3;
    // Layers will auto-expand if data grows, but for 18 items it's 2 layers.
    const size = 1.5; // Size of each cube
    const gap = 0.5; // Gap between cubes
    const spacing = size + gap;
    
    // Center offsets (based on 3x3x2 approx dims)
    const totalLayers = Math.ceil(allData.length / (cols * rows));
    const offsetX = ((cols - 1) * spacing) / 2;
    const offsetY = ((rows - 1) * spacing) / 2;
    const offsetZ = ((totalLayers - 1) * spacing) / 2;

    // Rotation Angles (45 deg on X, 45 deg on Y for "Corner Standing" look)
    const rad = Math.PI / 4;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    allData.forEach((item, i) => {
        // Map index to 3D grid (x, y, z)
        const ix = i % cols;
        const iy = Math.floor(i / cols) % rows;
        const iz = Math.floor(i / (cols * rows));
        
        // Base Position centered in grid
        const x = ix * spacing - offsetX;
        const y = iy * spacing - offsetY;
        const z = iz * spacing - offsetZ;

        // Identify corners (outermost positions of the bounding box)
        // x is 0 or 2, y is 0 or 2, z is 0 or 1
        const isCorner = (ix === 0 || ix === cols - 1) && 
                         (iy === 0 || iy === rows - 1) && 
                         (iz === 0 || iz === totalLayers - 1);

        // Apply Rotation to the GRID Position (rotate the whole cluster)
        // 1. Rotate around X axis
        // y' = y*cos - z*sin
        // z' = y*sin + z*cos
        const y_rotX = y * cos - z * sin;
        const z_rotX = y * sin + z * cos;
        const x_rotX = x; 

        // 2. Rotate around Y axis
        // x'' = x'*cos + z'*sin
        // z'' = -x'*sin + z'*cos
        const x_final = x_rotX * cos + z_rotX * sin;
        const z_final = -x_rotX * sin + z_rotX * cos;
        const y_final = y_rotX; 

        const pos: [number, number, number] = [x_final, y_final, z_final];
        
        result.push({
            id: `${item.type}-${i}`,
            index: globalIndex++,
            type: item.type,
            data: item.data,
            position: pos,
            scale: [size, size, size], // Uniform Cubes
            isCorner: isCorner
        });
    });

    return result;
  }, []);

  // Scholar cube — manually positioned outside the grid so the cluster stays intact
  const allItems = useMemo(() => [
    ...items,
    {
      id: 'scholar-link',
      index: items.length,
      type: 'scholar' as const,
      data: scholarData,
      position: [4.8, 2.2, 0.5] as [number, number, number],
      scale: [1.5, 1.5, 1.5] as [number, number, number],
      isCorner: false,
    },
  ], [items]);

  const selectedItem = useMemo(() =>
    allItems.find(item => item.id === selectedId) || null
  , [selectedId, allItems]);

  return (
    <div className={`relative w-full h-screen ${isHackerMode ? 'bg-black text-green-500' : 'bg-[#f0f0f0] text-[#1a1a1a]'} overflow-hidden font-typewriter selection:bg-gray-300 transition-colors duration-500`}>
      
      {/* HEADER & INTRO */}
      <motion.div 
        initial={false}
        animate={{
            top: introComplete ? '1.5rem' : '50%',
            right: introComplete ? '1rem' : '50%',
            x: introComplete ? '0%' : '50%',
            y: introComplete ? '0%' : '-50%',
            scale: introComplete ? 1 : 1.1
        }}
        transition={{ duration: 0.8, type: "spring", bounce: 0 }}
        className={`absolute z-50 flex gap-4 md:gap-6 items-start pointer-events-auto max-w-[90%] md:max-w-lg transition-all duration-700 ${introComplete ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
        style={{ opacity: showTutorial ? 0 : 1, pointerEvents: showTutorial ? 'none' : undefined, transition: 'opacity 0.5s' }}
      >
        <div className={`flex flex-col ${introComplete ? 'items-end' : 'items-start'}`}>
          <h1 className={`font-bold tracking-tighter uppercase transition-all duration-700 
            ${introComplete ? 'text-sm leading-tight md:text-2xl' : 'text-3xl md:text-4xl'} 
            ${isHackerMode ? 'text-green-500' : 'text-gray-900'}`}>
            Francisco García Rivera
          </h1>
          
          <p className={`font-bold mt-2 tracking-wider uppercase mb-3 transition-all duration-700 ${introComplete ? 'hidden md:block text-xs' : 'text-sm md:text-base'} ${isHackerMode ? 'text-green-400 animate-pulse' : 'text-orange-600'}`}>
            Creative / Researcher / Technologist / Producer / Designer
          </p>
          
          <div className={`mb-4 space-y-1 leading-snug transition-all duration-700 ${introComplete ? 'hidden md:block text-[11px]' : 'text-xs'} ${isHackerMode ? 'text-green-700' : 'text-gray-600'}`}>
            <p>PhD Informatics / Product Design & Dev.</p>
            <p>MSc Intelligent Automation</p>
            <p>BSc Mechanical Engineering</p>
          </div>
          
          {/* Contacts */}
          <div ref={contactContainerRef} className={`flex gap-3 mt-1 ${introComplete ? 'justify-end' : 'justify-start'}`}>
            <div className="relative">
              <button 
                onClick={() => togglePopup('email')}
                className={`group p-2 border rounded-full transition-all duration-300 shadow-sm relative z-50
                  ${activePopup === 'email' ? (isHackerMode ? 'bg-green-900 border-green-500' : 'bg-orange-50 border-orange-500 text-orange-600') : ''}
                  ${isHackerMode 
                    ? 'border-green-600 hover:bg-green-900 text-green-500' 
                    : 'border-gray-300 hover:border-orange-500 hover:text-orange-600 bg-white'}`}
              >
                <MailIcon className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activePopup === 'email' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={`absolute top-full mt-3 ${introComplete ? 'right-0' : 'left-0'} p-5 shadow-2xl border min-w-[260px] flex flex-col gap-4 z-[60] rounded-sm
                        ${isHackerMode ? 'bg-black border-green-500 shadow-green-900/20' : 'bg-white border-gray-200'}`}
                  >
                    <div className={`text-xs font-mono select-all text-center tracking-wide ${isHackerMode ? 'text-green-300' : 'text-gray-600'}`}>
                        {email}
                    </div>
                    <a 
                        href={`mailto:${email}`}
                        className={`w-full py-3 text-xs font-bold uppercase tracking-widest text-center border transition-all shadow-sm
                        ${isHackerMode 
                            ? 'border-green-600 text-green-500 hover:bg-green-900' 
                            : 'bg-black text-white hover:bg-orange-600 border-transparent hover:shadow-md'}`}
                    >
                        Contact Me
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => togglePopup('phone')}
                className={`group p-2 border rounded-full transition-all duration-300 shadow-sm relative z-50
                  ${activePopup === 'phone' ? (isHackerMode ? 'bg-green-900 border-green-500' : 'bg-orange-50 border-orange-500 text-orange-600') : ''}
                  ${isHackerMode 
                    ? 'border-green-600 hover:bg-green-900 text-green-500' 
                    : 'border-gray-300 hover:border-orange-500 hover:text-orange-600 bg-white'}`}
              >
                <PhoneIcon className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activePopup === 'phone' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={`absolute top-full mt-3 ${introComplete ? 'right-0' : 'left-0'} p-5 shadow-2xl border min-w-[260px] flex flex-col gap-4 z-[60] rounded-sm
                        ${isHackerMode ? 'bg-black border-green-500 shadow-green-900/20' : 'bg-white border-gray-200'}`}
                  >
                    <div className={`text-xs font-mono select-all text-center tracking-wide ${isHackerMode ? 'text-green-300' : 'text-gray-600'}`}>
                        {phone}
                    </div>
                    <a 
                        href={`tel:${phone}`}
                        className={`w-full py-3 text-xs font-bold uppercase tracking-widest text-center border transition-all shadow-sm
                        ${isHackerMode 
                            ? 'border-green-600 text-green-500 hover:bg-green-900' 
                            : 'bg-black text-white hover:bg-orange-600 border-transparent hover:shadow-md'}`}
                    >
                        Call Me
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!introComplete && (
              <div className="mt-8 flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <button 
                    onClick={() => handleEnter('3d')}
                    className="px-6 py-3 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 hover:border-orange-600 transition-colors shadow-lg"
                  >
                    Initialize 3D Experience
                  </button>
                  <button 
                    onClick={() => handleEnter('2d')}
                    className="px-6 py-3 border-2 border-gray-300 bg-white text-gray-800 text-xs font-bold uppercase tracking-widest hover:border-black hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    Access 2D Archive
                  </button>
              </div>
          )}
        </div>
      </motion.div>
      
      {/* Controls Overlay (Bottom Left) */}
      {viewMode === '3d' && introComplete && (
        <div className={`transition-opacity duration-500 ${showTutorial ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <ControlsHelp
              isHackerMode={isHackerMode}
              isHovering={hoveredId !== null}
          />
        </div>
      )}

      {/* Nav Toggle (TOP LEFT) */}
      <div className={`absolute top-4 left-4 md:top-6 md:left-8 z-30 pointer-events-auto flex flex-col items-start transition-opacity duration-500 ${introComplete && !showTutorial ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="mb-3 hidden md:block">
             <p className={`text-[10px] font-mono text-left max-w-[200px] leading-4 ${isHackerMode ? 'text-green-600' : 'text-gray-500 opacity-80'}`}>
                We inhabit a 3D world, yet consume 2D data. Select your interface.
            </p>
        </div>
        <button 
            onClick={() => setViewMode(prev => prev === '3d' ? '2d' : '3d')}
            className={`text-xs font-bold uppercase tracking-wider border px-3 py-2 md:px-4 md:py-2 rounded-sm shadow-sm flex items-center gap-2 transition-all
            ${isHackerMode 
                ? 'bg-black border-green-500 text-green-500 hover:bg-green-900' 
                : 'bg-white border-gray-300 hover:bg-black hover:text-white'}`}
        >
            <span className={viewMode === '2d' ? "opacity-50" : (isHackerMode ? 'text-green-400' : "text-orange-600")}>3D View</span>
            <span className="opacity-30">/</span>
            <span className={viewMode === '3d' ? "opacity-50" : (isHackerMode ? 'text-green-400' : "text-orange-600")}>2D View</span>
        </button>
      </div>

      {/* Contact Float */}
      <div className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 z-40 pointer-events-auto transition-opacity duration-500 ${introComplete && !showTutorial ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
            onClick={() => setShowContactForm(true)}
            className={`px-5 py-2 md:px-6 md:py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg
            ${isHackerMode ? 'bg-green-800 text-black hover:bg-green-600' : 'bg-[#1a1a1a] text-white hover:bg-orange-600'}`}
        >
            Get In Touch
        </button>
      </div>

      {/* Left context panel — shown when an item is selected */}
      <AnimatePresence>
        {selectedItem && selectedItem.type !== 'scholar' && viewMode === '3d' && (() => {
          const siblings = allItems.filter(i => i.type === selectedItem.type);
          const idx      = siblings.findIndex(i => i.id === selectedItem.id);
          const prev     = siblings[idx - 1] ?? null;
          const next     = siblings[idx + 1] ?? null;
          const typeLabel = selectedItem.type.toUpperCase();
          return (
            <motion.div
              key="ctx-panel"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col gap-1 max-w-[200px] font-typewriter`}
            >
              {/* Type + counter */}
              <p className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-2 ${isHackerMode ? 'text-green-600' : 'text-gray-400'}`}>
                {typeLabel} · {idx + 1} / {siblings.length}
              </p>

              {/* Prev */}
              {prev ? (
                <button
                  onClick={() => setSelectedId(prev.id)}
                  className={`group flex items-start gap-2 text-left transition-opacity opacity-50 hover:opacity-100`}
                >
                  <span className={`text-[10px] mt-0.5 ${isHackerMode ? 'text-green-700' : 'text-gray-400'}`}>↑</span>
                  <span className={`text-[10px] font-mono leading-snug line-clamp-2 ${isHackerMode ? 'text-green-700 group-hover:text-green-400' : 'text-gray-400 group-hover:text-gray-700'}`}>
                    {prev.data.title}
                  </span>
                </button>
              ) : (
                <div className="h-8" />
              )}

              {/* Current */}
              <div className={`flex items-start gap-2 my-1 pl-4 border-l-2 ${isHackerMode ? 'border-green-500' : 'border-orange-500'}`}>
                <span className={`text-[11px] font-bold leading-snug line-clamp-3 ${isHackerMode ? 'text-green-300' : 'text-gray-800'}`}>
                  {selectedItem.data.title}
                </span>
              </div>

              {/* Next */}
              {next ? (
                <button
                  onClick={() => setSelectedId(next.id)}
                  className={`group flex items-start gap-2 text-left transition-opacity opacity-50 hover:opacity-100`}
                >
                  <span className={`text-[10px] mt-0.5 ${isHackerMode ? 'text-green-700' : 'text-gray-400'}`}>↓</span>
                  <span className={`text-[10px] font-mono leading-snug line-clamp-2 ${isHackerMode ? 'text-green-700 group-hover:text-green-400' : 'text-gray-400 group-hover:text-gray-700'}`}>
                    {next.data.title}
                  </span>
                </button>
              ) : (
                <div className="h-8" />
              )}

              {/* Close */}
              <button
                onClick={() => setSelectedId(null)}
                className={`mt-4 text-[9px] font-mono uppercase tracking-widest transition-colors ${isHackerMode ? 'text-green-800 hover:text-green-500' : 'text-gray-300 hover:text-gray-600'}`}
              >
                ← back
              </button>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Category Legend (Bottom Center) — 3D only */}
      {introComplete && viewMode === '3d' && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-opacity duration-500 ${showTutorial || selectedId ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <CategoryLegend
            isHackerMode={isHackerMode}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      )}

      {/* 3D Scene */}
      <AnimatePresence>
        {viewMode === '3d' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-10"
          >
            <Canvas shadows camera={{ position: [0, 0, 14], fov: 45, near: 0.01 }}>
              <Scene
                items={allItems}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onHover={setHoveredId}
                isHackerMode={isHackerMode}
                introComplete={introComplete}
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
      
      {/* 2D View */}
      <AnimatePresence>
        {viewMode === '2d' && (
            <TwoDimensionalView items={allItems} onSelect={setSelectedId} />
        )}
      </AnimatePresence>

      {/* Tutorial */}
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

      {/* Detail Overlay (non-scholar items only) */}
      <Overlay
        item={selectedItem?.type !== 'scholar' ? selectedItem : null}
        onClose={() => setSelectedId(null)}
      />
      
      {/* Partner Logos Footer */}
      {introComplete && viewMode === '2d' && (
         <div className="absolute bottom-0 left-0 w-full p-6 bg-[#f0f0f0] z-10 pointer-events-none flex justify-center opacity-50 grayscale hover:grayscale-0 transition-all">
             <div className="flex gap-8 items-center overflow-hidden">
                 {logos.map((l, i) => (
                    <PartnerLogo key={i} name={l.name} url={l.url} />
                 ))}
             </div>
         </div>
      )}
    </div>
  );
};

export default App;