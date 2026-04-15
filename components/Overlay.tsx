import React, { useEffect } from 'react';
import { PortfolioItem, Project, Publication, Music, Thesis, ThesisPaper } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { AnalyzerDemo } from './AnalyzerDemo';
import { KitchenDemo } from './KitchenDemo';
import { ViewpointDemo } from './ViewpointDemo';

const SCHOLAR_URL = 'https://scholar.google.se/citations?hl=en&user=h2on66wAAAAJ&view_op=list_works&sortby=pubdate';

interface OverlayProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ item, onClose }) => {

  useEffect(() => {
    if (!item) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [item, onClose]);

  const isProject = (data: any): data is Project =>
    (data as Project).description !== undefined && (data as Project).youtube !== undefined;

  const isPub = (data: any): data is Publication =>
    (data as Publication).journal !== undefined && (data as Publication).authors !== undefined;

  const isMusic = (data: any): data is Music =>
    (data as Music).spotifyEmbedUrl !== undefined;

  const isThesis = (data: any): data is Thesis =>
    (data as Thesis).abstract !== undefined && (data as Thesis).papers !== undefined;

  const isPaper = (data: any): data is ThesisPaper =>
    (data as ThesisPaper).number !== undefined && (data as ThesisPaper).pdfFile !== undefined && !isThesis(data);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative bg-[#0f0f0f] border border-white/10 shadow-2xl p-8 md:p-12 w-full max-w-2xl max-h-[85vh] overflow-y-auto font-typewriter"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors text-white/60 hover:text-white text-lg leading-none"
            >
              &times;
            </button>

            <div className="flex flex-col gap-6 mt-4">
              {/* Type Label */}
              <div className="text-[10px] font-mono uppercase tracking-widest text-orange-500 mb-2">
                {item.type === 'paper' ? 'Appended Paper' : item.type}
              </div>

              {/* Project */}
              {isProject(item.data) && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                    {item.data.title}
                  </h2>
                  <div className="w-12 h-[1px] bg-white/20" />
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                    {item.data.description}
                  </p>

                  <div className="flex flex-col gap-3 mt-4">
                    {item.data.youtube && (
                      <a href={item.data.youtube} target="_blank" rel="noreferrer"
                        className="group flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">Watch Video</span>
                        <span className="text-white/40 group-hover:text-white transition-colors">→</span>
                      </a>
                    )}
                  </div>

                  {(item.data as any).demo === 'analyzer' && <AnalyzerDemo />}
                  {(item.data as any).demo === 'kitchen' && <KitchenDemo />}
                  {(item.data as any).demo === 'viewpoint' && <ViewpointDemo />}
                </>
              )}

              {/* Publication */}
              {isPub(item.data) && (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white/20">{item.data.year}</span>
                    <span className="text-[10px] font-mono uppercase border border-white/15 px-2 py-0.5 text-white/50">
                      {item.data.type}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug mt-2">
                    {item.data.title}
                  </h2>
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-white/50 uppercase tracking-wider font-bold">{item.data.journal}</p>
                    <p className="text-sm text-white/60 italic">{item.data.authors}</p>
                  </div>
                  <div className="mt-4">
                    {item.data.doi && (
                      <a href={item.data.doi} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-orange-500 transition-colors border-b border-white/40 hover:border-orange-500 pb-0.5">
                        VIEW PUBLICATION (DOI) ↗
                      </a>
                    )}
                  </div>
                </>
              )}

              {/* Music */}
              {isMusic(item.data) && (
                <>
                  <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">My Music</h2>
                  <div className="w-12 h-[1px] bg-white/20" />
                  <p className="text-sm text-white/70 leading-relaxed">{item.data.role}</p>
                  <div className="mt-2 bg-white/5 p-2 rounded-xl">
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src={item.data.spotifyEmbedUrl}
                      width="100%" height="352"
                      frameBorder="0" allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-2 font-mono text-center">{item.data.description}</p>
                </>
              )}

              {/* Thesis */}
              {isThesis(item.data) && (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white/20">{item.data.year}</span>
                    <span className="text-[10px] font-mono uppercase border border-white/15 px-2 py-0.5 text-white/50">PhD Thesis</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
                    {item.data.title}
                  </h2>
                  <p className="text-xs text-white/40 font-mono">{item.data.university}</p>
                  <div className="w-12 h-[1px] bg-white/20" />
                  <p className="text-sm text-white/70 leading-relaxed">{item.data.abstract}</p>
                  <div className="mt-2">
                    <a href={SCHOLAR_URL} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest border border-white/20 text-white/60 hover:border-white hover:text-white transition-colors">
                      Google Scholar ↗
                    </a>
                  </div>
                </>
              )}

              {/* Appended Paper */}
              {isPaper(item.data) && (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-mono uppercase text-orange-500 font-bold">{item.data.number}</span>
                    <span className="text-4xl font-bold text-white/20">{item.data.year}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
                    {item.data.title}
                  </h2>
                  <p className="text-xs text-white/40 italic">{item.data.journal}</p>
                  {item.data.description && (
                    <>
                      <div className="w-12 h-[1px] bg-white/20" />
                      <p className="text-sm text-white/70 leading-relaxed">{item.data.description}</p>
                    </>
                  )}
                  {item.data.doi && (
                    <div className="mt-2">
                      <a href={item.data.doi} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-orange-500 transition-colors border-b border-white/40 hover:border-orange-500 pb-0.5">
                        VIEW PUBLICATION (DOI) ↗
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
