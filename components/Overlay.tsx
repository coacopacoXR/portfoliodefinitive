import React from 'react';
import { PortfolioItem, Project, Publication, Music } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { AnalyzerDemo } from './AnalyzerDemo';
import { KitchenDemo } from './KitchenDemo';
import { ViewpointDemo } from './ViewpointDemo';

interface OverlayProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ item, onClose }) => {
  
  const isProject = (data: any): data is Project => {
    return (data as Project).description !== undefined && (data as Project).youtube !== undefined;
  };

  const isPub = (data: any): data is Publication => {
    return (data as Publication).journal !== undefined;
  };

  const isMusic = (data: any): data is Music => {
      return (data as Music).spotifyEmbedUrl !== undefined;
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="absolute top-0 right-0 h-full w-full md:w-[750px] bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl p-12 flex flex-col justify-center pointer-events-auto overflow-y-auto"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-500 text-lg leading-none">&times;</span>
            </button>

            <div className="flex flex-col gap-6 mt-10 md:mt-0">
              {/* Type Label */}
              <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-2">
                {item.type}
              </div>

              {/* Content Logic */}
              {isProject(item.data) && (
                <>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                    {item.data.title}
                  </h2>
                  <div className="w-12 h-[1px] bg-gray-300 my-2"></div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                    {item.data.description}
                  </p>
                  
                  <div className="flex flex-col gap-3 mt-8">
                    {item.data.youtube && (
                      <a
                        href={item.data.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
                      >
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Watch Video</span>
                        <span className="text-gray-400 group-hover:text-gray-900 transition-colors">→</span>
                      </a>
                    )}
                    {(item.data as any).github && (
                      <a
                        href={(item.data as any).github}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
                      >
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">View on GitHub</span>
                        <span className="text-gray-400 group-hover:text-gray-900 transition-colors">→</span>
                      </a>
                    )}
                    {item.data.linked_paper && (
                      <div className="px-4 py-3 border border-dashed border-gray-300 text-xs text-gray-500">
                        Attached Paper: {item.data.linked_paper}
                      </div>
                    )}
                  </div>

                  {(item.data as any).demo === 'analyzer' && <AnalyzerDemo />}
                  {(item.data as any).demo === 'kitchen' && <KitchenDemo />}
                  {(item.data as any).demo === 'viewpoint' && <ViewpointDemo />}
                </>
              )}

              {isPub(item.data) && (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gray-300">{item.data.year}</span>
                    <span className="text-[10px] font-mono uppercase border border-gray-200 px-2 py-0.5 rounded text-gray-500">
                      {item.data.type}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-snug mt-2">
                    {item.data.title}
                  </h2>

                  <div className="space-y-1 mt-2">
                     <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                      {item.data.journal}
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      {item.data.authors}
                    </p>
                  </div>

                  <div className="mt-8">
                    {item.data.doi && (
                      <a 
                        href={item.data.doi} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-900 hover:text-orange-600 transition-colors border-b border-gray-900 hover:border-orange-600 pb-0.5"
                      >
                        VIEW PUBLICATION (DOI) ↗
                      </a>
                    )}
                  </div>
                </>
              )}

              {isMusic(item.data) && (
                  <>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                        My Music
                    </h2>
                    <div className="w-12 h-[1px] bg-gray-300 my-2"></div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {item.data.role}
                    </p>
                    <div className="mt-6 bg-black/5 p-2 rounded-xl">
                         <iframe 
                            style={{ borderRadius: '12px' }} 
                            src={item.data.spotifyEmbedUrl} 
                            width="100%" 
                            height="352" 
                            frameBorder="0" 
                            allowFullScreen 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                        ></iframe>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 font-mono text-center">
                        {item.data.description}
                    </p>
                  </>
              )}
            </div>
            
            {/* Footer Decorative */}
            <div className="absolute bottom-8 left-12 text-[10px] text-gray-300 font-mono">
              ID: {item.id.toUpperCase()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};