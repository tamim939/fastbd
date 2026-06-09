import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderProps {
  images: string[];
}

export const ImageSlider: React.FC<SliderProps> = ({ images }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl shadow-xl mt-4">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition ${i === index ? 'bg-white scale-125' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const NoticeBoard: React.FC<{ notice: string }> = ({ notice }) => {
  if (!notice) return null;
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500 p-1 rounded-full">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-white text-xs font-bold">!</span>
          </motion.div>
        </div>
        <p className="text-amber-900 font-medium text-sm md:text-base leading-relaxed">
          {notice}
        </p>
      </div>
    </div>
  );
};
