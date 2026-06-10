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
        <div className="fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="relative pointer-events-auto bg-[#1a1a1a]/95 backdrop-blur-xl w-full max-w-lg rounded-3xl overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 p-3 flex gap-4 pr-6"
          >
            {/* Notification Badge */}
            <div className="absolute -top-1.5 -right-1.5 bg-[#FF0000] text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#1a1a1a] shadow-lg animate-pulse">
              1
            </div>

            {/* Thumbnail Image */}
            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-800 rounded-2xl overflow-hidden border border-white/5">
              <img 
                src={config.imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000'} 
                className="w-full h-full object-cover"
                alt="Popup"
              />
            </div>

            {/* Content Segment */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <a 
                href={config.telegramLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <h3 className="text-white text-sm md:text-base font-black leading-tight tracking-tight mb-1 line-clamp-2 italic">
                  "{config.title}"
                </h3>
                <span className="text-[#1877F2] text-[10px] font-black uppercase tracking-widest group-hover:underline flex items-center gap-1.5">
                  Click Here
                  <ChevronRight size={12} strokeWidth={3} />
                </span>
              </a>
            </div>

            {/* Hide Indicator */}
            <button 
              onClick={handleClose}
              className="flex items-center text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest h-fit mt-1"
            >
              Hide
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
