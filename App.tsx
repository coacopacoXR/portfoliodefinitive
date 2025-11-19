import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { projectsData, publicationsData, musicData } from './data';
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

const TwoDimensionalView = ({ items, onSelect }: { items: PortfolioItem[], onSelect: (id: string) => void }) => {
    // Separate items by type
    const projects = items.filter(i => i.type === 'project');
    const publications = items.filter(i => i.type === 'publication');
    const music = items.filter(i => i.type === 'music')[0]; 

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
  
  // Deck Mode State (Cards Scrolling)
  const [deckMode, setDeckMode] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

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
      setShowTutorial(true);
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

  const selectedItem = useMemo(() => 
    items.find(item => item.id === selectedId) || null
  , [selectedId, items]);

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
        <ControlsHelp 
            isHackerMode={isHackerMode} 
            isHovering={hoveredId !== null} 
        />
      )}

      {/* Nav Toggle (TOP LEFT) */}
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
      </div>

      {/* Contact Float */}
      <div className={`absolute bottom-6 right-6 md:bottom-8 md:right-8 z-40 pointer-events-auto transition-opacity duration-700 ${introComplete ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
            onClick={() => setShowContactForm(true)}
            className={`px-5 py-2 md:px-6 md:py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg
            ${isHackerMode ? 'bg-green-800 text-black hover:bg-green-600' : 'bg-[#1a1a1a] text-white hover:bg-orange-600'}`}
        >
            Get In Touch
        </button>
      </div>

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
                items={items} 
                selectedId={selectedId} 
                onSelect={setSelectedId}
                onHover={setHoveredId}
                isHackerMode={isHackerMode}
                introComplete={introComplete}
                deckMode={deckMode}
                setDeckMode={setDeckMode}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
              />
            </Canvas>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 2D View */}
      <AnimatePresence>
        {viewMode === '2d' && (
            <TwoDimensionalView items={items} onSelect={setSelectedId} />
        )}
      </AnimatePresence>

      {/* Detail Overlay */}
      <Overlay item={selectedItem} onClose={() => setSelectedId(null)} />
      
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