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
      const shown = sessionStorage.getItem('popup_shown');
      if (!shown) {
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [config]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('popup_shown', 'true');
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
            className="relative bg-[#1a1a1a] w-full max-w-4xl rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden"
          >
            {/* Aspect Video Container */}
            <div className="relative aspect-[21/9] md:aspect-video w-full overflow-hidden group">
              <img 
                src={config.imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Update"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                  <span className="inline-block bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 shadow-lg shadow-blue-500/20">
                    Official Update
                  </span>
                  <h3 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase mb-2">
                    {config.title || 'Official Announcement'}
                  </h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Global Synchronization Node Active</p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <a 
                    href={config.telegramLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-[#1877F2] text-white py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-[#115cc1] active:scale-95 transition-all"
                  >
                    Join Telegram
                    <ChevronRight size={16} strokeWidth={3} />
                  </a>
                  
                  <button 
                    onClick={handleClose}
                    className="py-4 text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
                  >
                    Close Announcement
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
