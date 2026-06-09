import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, BellRing } from 'lucide-react';
import { SliderImage } from '../types';

interface SliderProps {
  images: SliderImage[];
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

  const currentSlider = images[index];

  return (
    <div className="relative w-full h-[180px] md:h-[280px] overflow-hidden rounded-[24px] md:rounded-[40px] shadow-2xl mt-4 group">
      <a 
        href={currentSlider.link || '#'} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full h-full"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={currentSlider.url}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
      </a>
      
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); setIndex((prev) => (prev - 1 + images.length) % images.length); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setIndex((prev) => (prev + 1) % images.length); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-2 bg-black/20 backdrop-blur-md rounded-full">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); setIndex(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-5' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const NoticeBoard: React.FC<{ notice: string }> = ({ notice }) => {
  if (!notice) return null;
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 p-6 md:p-8 my-8 rounded-[32px] md:rounded-[40px] shadow-sm">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-blue-600">
        <BellRing size={120} />
      </div>
      <div className="flex items-start md:items-center gap-6 relative z-10">
        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100 flex-shrink-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <BellRing className="text-white" size={20} />
          </motion.div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">Official Update</span>
          <p className="text-gray-900 font-bold text-base md:text-xl leading-tight md:leading-relaxed">
            {notice}
          </p>
        </div>
      </div>
    </div>
  );
};
