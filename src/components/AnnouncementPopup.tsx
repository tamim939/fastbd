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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden text-center"
          >
            {/* Top Graphics or Logo Area */}
            <div className="pt-10 pb-6 px-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-[32px] overflow-hidden shadow-2xl mb-6 bg-gray-50 border border-gray-100 p-2">
                <img 
                  src={config.imageUrl || '/logo.png'} 
                  className="w-full h-full object-contain"
                  alt="Official Logo"
                />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tighter mb-2">
                {config.title || 'Official Announcement'}
              </h3>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">Global Synchronization Update</p>

              <div className="w-full space-y-3">
                <a 
                  href={config.telegramLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#1877F2] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-[#115cc1] active:scale-95 transition-all"
                >
                  Join Telegram
                  <ChevronRight size={16} strokeWidth={3} />
                </a>
                
                <button 
                  onClick={handleClose}
                  className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-gray-900 transition-colors"
                >
                  Close & Continue
                </button>
              </div>
            </div>

            {/* Subtle Footer Accent */}
            <div className="h-2 bg-blue-600 w-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
