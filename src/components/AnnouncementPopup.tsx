import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface PopupProps {
  config?: {
    isEnabled: boolean;
    title: string;
    imageUrl: string;
    telegramLink: string;
  };
}

export const AnnouncementPopup: React.FC<PopupProps> = ({ config }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (config?.isEnabled) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [config]);

  const handleClose = () => {
    setShow(false);
  };

  if (!config || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative bg-[#0d0d0d] w-full max-w-5xl rounded-[40px] shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-white/5 overflow-hidden ring-1 ring-white/10"
          >
            {/* Extended Cinematic Slider-like Container */}
            <div className="relative aspect-[21/9] w-full overflow-hidden group">
              <img 
                src={config.imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000'} 
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                alt="System Update"
              />
              
              {/* Dynamic Gradients */}
              <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0d0d0d] to-transparent hidden md:block" />
              
              {/* Refined Content Architecture */}
              <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="flex-1 max-w-2xl">
                    <motion.span 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-6 shadow-2xl shadow-blue-500/30"
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Welcome to Website
                    </motion.span>
                    <h3 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-4 drop-shadow-2xl">
                      {config.title || 'Official Announcement'}
                    </h3>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.4em] opacity-60">High Quality Downloads • Free Access</p>
                  </div>

                  <div className="flex flex-col gap-4 min-w-[240px]">
                    <a 
                      href={config.telegramLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-4 bg-white text-black py-6 px-10 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:text-white active:scale-95 transition-all group"
                    >
                      Action Button
                      <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    
                    <button 
                      onClick={handleClose}
                      className="py-4 text-gray-400 font-black text-[9px] uppercase tracking-[0.5em] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
