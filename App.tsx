import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { projectsData, publicationsData, musicData } from './data';
import { PortfolioItem } from './types';
import { AnimatePresence, motion } from 'framer-motion';

// --- Subcomponents for Robust Image Handling ---

const PartnerLogo = ({ name, url }: { name: string; url: string }) => {
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

// --- 2D View Component ---

const TwoDimensionalView = ({ items, onSelect }: { items: PortfolioItem[], onSelect: (id: string) => void }) => {
    // Separate items by type
    const projects = items.filter(i => i.type === 'project');
    const publications = items.filter(i => i.type === 'publication');
    const music = items.filter(i => i.type === 'music')[0]; // Assuming single artist entry for now

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
    
    // Easter egg for console watchers
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

  // Initial Choice Handler
  const handleEnter = (mode: '3d' | '2d') => {
      setViewMode(mode);
      setIntroComplete(true);
      // Trigger the tutorial overlay after entering
      setShowTutorial(true);
  }

  // Transform raw data into positioned 3D items
  const items: PortfolioItem[] = useMemo(() => {
    const result: PortfolioItem[] = [];
    
    // Layout Projects (Tall Monoliths)
    projectsData.forEach((project, index) => {
      result.push({
        id: `project-${index}`,
        type: 'project',
        data: project,
        position: [(index - 1) * 3.5, 1.5, (index % 2) * 2], // Stagger depth slightly for parallax
        scale: [1.2, 3, 0.4] 
      });
    });

    // Layout Publications (Flat Tiles/Slabs)
    const cols = 4;
    publicationsData.forEach((pub, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      result.push({
        id: `pub-${index}`,
        type: 'publication',
        data: pub,
        position: [
          (col - 1.5) * 2.5, 
          0.15, 
          6 + (row * 3.5) // More z-depth
        ],
        scale: [1.8, 0.3, 1.8] 
      });
    });

    // Layout Music (Distinct Object)
    result.push({
        id: 'music-1',
        type: 'music',
        data: musicData,
        position: [6, 1, -2], // Background right
        scale: [1.5, 1.5, 1.5] // Cubic / Boxy "Hardware" feel
    });

    return result;
  }, []);

  const selectedItem = useMemo(() => 
    items.find(item => item.id === selectedId) || null
  , [selectedId, items]);

  return (
    <div className={`relative w-full h-screen ${isHackerMode ? 'bg-black text-green-500' : 'bg-[#f0f0f0] text-[#1a1a1a]'} overflow-hidden font-typewriter selection:bg-gray-300 transition-colors duration-500`}>
      
      {/* 
          ====================================
          ANIMATED HEADER / INTRO LANDING
          ====================================
          Moves to TOP-RIGHT corner after intro
      */}
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
      >
        <div className={`flex flex-col ${introComplete ? 'items-end' : 'items-start'}`}>
          <h1 className={`font-bold tracking-tighter uppercase transition-all duration-700 
            ${introComplete ? 'text-sm leading-tight md:text-2xl' : 'text-3xl md:text-4xl'} 
            ${isHackerMode ? 'text-green-500' : 'text-gray-900'}`}>
            Francisco García Rivera
          </h1>
          
          {/* Roles Tagline - Hidden on mobile when docked to reduce clutter */}
          <p className={`font-bold mt-2 tracking-wider uppercase mb-3 transition-all duration-700 ${introComplete ? 'hidden md:block text-xs' : 'text-sm md:text-base'} ${isHackerMode ? 'text-green-400 animate-pulse' : 'text-orange-600'}`}>
            Creative / Researcher / Technologist / Producer / Designer
          </p>
          
          {/* Education List - Hidden on mobile to be cleaner */}
          <div className={`mb-4 space-y-1 leading-snug transition-all duration-700 ${introComplete ? 'hidden md:block text-[11px]' : 'text-xs'} ${isHackerMode ? 'text-green-700' : 'text-gray-600'}`}>
            <p>PhD Informatics / Product Design & Dev.</p>
            <p>MSc Intelligent Automation</p>
            <p>BSc Mechanical Engineering</p>
          </div>
          
          {/* Contact Info Icons with Popouts */}
          <div ref={contactContainerRef} className={`flex gap-3 mt-1 ${introComplete ? 'justify-end' : 'justify-start'}`}>
            {/* Email Icon & Popup */}
            <div className="relative">
              <button 
                onClick={() => togglePopup('email')}
                className={`group p-2 border rounded-full transition-all duration-300 shadow-sm relative z-50
                  ${activePopup === 'email' ? (isHackerMode ? 'bg-green-900 border-green-500' : 'bg-orange-50 border-orange-500 text-orange-600') : ''}
                  ${isHackerMode 
                    ? 'border-green-600 hover:bg-green-900 text-green-500' 
                    : 'border-gray-300 hover:border-orange-500 hover:text-orange-600 bg-white'}`}
                title="Email Me"
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

            {/* Phone Icon & Popup */}
            <div className="relative">
              <button 
                onClick={() => togglePopup('phone')}
                className={`group p-2 border rounded-full transition-all duration-300 shadow-sm relative z-50
                  ${activePopup === 'phone' ? (isHackerMode ? 'bg-green-900 border-green-500' : 'bg-orange-50 border-orange-500 text-orange-600') : ''}
                  ${isHackerMode 
                    ? 'border-green-600 hover:bg-green-900 text-green-500' 
                    : 'border-gray-300 hover:border-orange-500 hover:text-orange-600 bg-white'}`}
                title="Call Me"
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

          {/* INTRO BUTTONS - Only visible when not complete */}
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
      
      {/* Nav Toggle (Switched to TOP LEFT) */}
      <div className={`absolute top-4 left-4 md:top-6 md:left-8 z-30 pointer-events-auto flex flex-col items-start transition-opacity duration-700 ${introComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
        {viewMode === '3d' && (
            <div className={`hidden md:block text-[9px] tracking-wider mt-2 animate-pulse uppercase ${isHackerMode ? 'text-green-700' : 'text-gray-400'}`}>
                [Interactive Scene]
            </div>
        )}
      </div>

      {/* Contact Float Button (Hidden during intro) */}
      <div className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 z-40 pointer-events-auto transition-opacity duration-700 ${introComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
            onClick={() => setShowContactForm(true)}
            className={`px-5 py-2 md:px-6 md:py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg
            ${isHackerMode ? 'bg-green-800 text-black hover:bg-green-600' : 'bg-[#1a1a1a] text-white hover:bg-orange-600'}`}
        >
            Get In Touch
        </button>
      </div>

      {/* Trusted Partners Strip (Visible in 3D, HIDDEN ON MOBILE) */}
      {viewMode === '3d' && !isHackerMode && introComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-0 left-0 w-full z-20 pointer-events-none p-6 md:p-10 bg-gradient-to-t from-[#f0f0f0] via-[#f0f0f0] to-transparent hidden md:block"
          >
              <div className="flex flex-col items-center md:items-start gap-4 pointer-events-auto">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold ml-1 border-b border-gray-300 pb-1">Collaborators</span>
                  <div className="flex flex-wrap gap-x-8 gap-y-6 items-center justify-center md:justify-start">
                      {logos.map((logo) => (
                          <PartnerLogo key={logo.name} name={logo.name} url={logo.url} />
                      ))}
                  </div>
              </div>
          </motion.div>
      )}

      {/* 2D Content View */}
      <AnimatePresence mode="wait">
        {viewMode === '2d' && introComplete && (
             <TwoDimensionalView items={items} onSelect={setSelectedId} />
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      {/* Always render Canvas to avoid re-mounts, but blur it during intro or if 2D mode covers it */}
      {(viewMode === '3d' || !introComplete) && (
          <div className={`absolute inset-0 transition-all duration-1000 ${!introComplete ? 'blur-md scale-105 grayscale opacity-50' : 'blur-0 scale-100 grayscale-0 opacity-100'}`}>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [10, 5, 10], fov: 35 }} // General angled perspective
                className="touch-none"
                onPointerMissed={() => setSelectedId(null)}
            >
                <Scene 
                items={items} 
                selectedId={selectedId} 
                onSelect={setSelectedId}
                onHover={setHoveredId}
                isHackerMode={isHackerMode}
                />
            </Canvas>
          </div>
      )}

      {/* UI Overlay for Items (Works for both 2D and 3D) */}
      <Overlay item={selectedItem} onClose={() => setSelectedId(null)} />

      {/* Tutorial Overlay (Highlighting the View Toggle) */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTutorial(false)}
            className="fixed inset-0 z-[60] bg-black/60 cursor-pointer"
          >
            <div className="absolute top-4 left-4 md:top-6 md:left-8 pointer-events-none">
              {/* Highlighting Box */}
              <div className="relative px-3 py-2 md:px-4 md:py-2">
                <div className="absolute -inset-2 border-2 border-orange-500 rounded-lg animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.5)]"></div>
                {/* Invisible placeholder to match button size */}
                <div className="opacity-0 text-xs font-bold uppercase tracking-wider border px-3 py-2 md:px-4 md:py-2 flex items-center gap-2">
                   <span>3D View</span>
                   <span>/</span>
                   <span>2D View</span>
                </div>
              </div>
              
              {/* Explainer Text */}
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute left-full top-1/2 -translate-y-1/2 ml-6 w-48"
              >
                <div className="h-[1px] w-4 bg-orange-500 absolute right-full top-1/2 mr-2"></div>
                <p className="text-white text-xs font-bold uppercase tracking-wider text-shadow">
                  Switch Interface Here
                </p>
                <p className="text-gray-300 text-[10px] leading-tight mt-1">
                  Click anywhere to continue
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[#f9f9f9] p-8 w-full max-w-md shadow-2xl border border-white relative"
                >
                    <button 
                        onClick={() => setShowContactForm(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold"
                    >✕</button>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight border-b border-black/10 pb-4">CONTACT ME</h2>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Send me a message regarding collaborations, projects, or research.
                        </p>
                        
                        <div className="flex flex-col gap-3 pt-4">
                            <a 
                                href={`mailto:${email}`}
                                className="w-full text-center bg-[#1a1a1a] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors"
                            >
                                Launch Email App
                            </a>
                            <div className="text-center text-[10px] text-gray-400 font-mono">- OR -</div>
                             <div className="bg-white p-4 border border-gray-200 text-xs text-gray-500 select-all font-mono text-center">
                                {email}
                             </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;