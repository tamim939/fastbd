import React from 'react';
import { Link } from 'react-router-dom';
import { Post, Category } from '../types';
import { motion } from 'motion/react';
import { Download, Calendar, Tag, ChevronRight } from 'lucide-react';

export const CategoryList: React.FC<{ 
  categories: Category[], 
  activeCategory: string,
  onSelect: (slug: string) => void 
}> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3 my-6 md:my-8">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition shadow-sm text-xs md:text-base ${
          activeCategory === 'all'
            ? 'bg-blue-600 text-white shadow-blue-200'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
        }`}
      >
        All Items
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition shadow-sm text-xs md:text-base ${
            activeCategory === cat.slug
              ? 'bg-blue-600 text-white shadow-blue-200'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[16px] md:rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] md:aspect-video overflow-hidden">
        <Link to={`/post/${post.id}`} state={{ post }} className="block h-full">
          <img
            src={post.imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-2">
            <span className="bg-[#1877F2]/90 backdrop-blur-md text-white px-2 md:px-5 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black shadow-xl uppercase tracking-[0.1em] md:tracking-[0.2em] border border-white/20 w-fit">
              {post.category || 'Global'}
            </span>
          </div>
        </Link>
      </div>

      <div className="p-3 md:p-6 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-[8px] md:text-[10px] mb-2 md:mb-3 font-black uppercase tracking-[0.1em]">
          <Calendar size={10} className="text-blue-600 md:hidden" />
          <Calendar size={14} className="text-blue-600 hidden md:block" />
          {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString('hi-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>

        <Link to={`/post/${post.id}`} state={{ post }} className="mb-2 md:mb-4 block flex-1">
          <h3 className="text-xs md:text-xl font-black text-gray-900 group-hover:text-blue-600 transition leading-[1.3] uppercase tracking-tight line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Download size={10} className="text-blue-600 md:hidden" />
              <Download size={12} className="text-blue-600 hidden md:block" />
            </div>
            <span className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">
              {post.downloads || 0} <br className="md:hidden" /> downloads
            </span>
          </div>
          
          <Link
            to={`/post/${post.id}`}
            state={{ post }}
            className="flex items-center justify-center gap-1 md:gap-2 bg-[#1877F2] text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full font-black text-[8px] md:text-[9px] transition-all shadow-lg shadow-blue-200 group-hover:bg-[#115cc1] active:scale-95 uppercase tracking-widest w-full md:w-auto"
          >
            Open
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
