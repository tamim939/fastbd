import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send } from 'lucide-react';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl shadow-blue-500/20"
          >
            <div className="relative aspect-[4/5]">
              <img 
                src={config.imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop'} 
                className="w-full h-full object-cover"
                alt="Update"
              />
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 bg-black/20 backdrop-blur-md text-white p-2 rounded-xl hover:bg-black/40 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
            </div>

            <div className="p-8 text-center -mt-16 relative z-10">
              <span className="inline-block bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 shadow-lg shadow-blue-200">
                New Announcement
              </span>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-6 leading-tight uppercase">
                {config.title}
              </h3>
              
              <div className="flex flex-col gap-3">
                <a 
                  href={config.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Send size={16} /> Join Telegram
                </a>
                <button 
                  onClick={handleClose}
                  className="py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-900 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
