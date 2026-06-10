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
    <div className="flex flex-wrap gap-3 my-8">
      <button
        onClick={() => onSelect('all')}
        className={`px-6 py-2.5 rounded-full font-medium transition shadow-sm ${
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
          className={`px-6 py-2.5 rounded-full font-medium transition shadow-sm ${
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
      className="group bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative aspect-video overflow-hidden">
        <Link to={`/post/${post.id}`} className="block h-full">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-[#1877F2] text-white px-5 py-1.5 rounded-full text-[10px] font-black shadow-lg uppercase tracking-[0.2em] border border-white/20">
              {post.category}
            </span>
          </div>
        </Link>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-3 font-black uppercase tracking-[0.1em]">
          <Calendar size={14} className="text-blue-600" />
          {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString('en-GB')}
        </div>

        <Link to={`/post/${post.id}`} className="mb-8 block flex-1">
          <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition leading-[1.3] uppercase tracking-tight">
            {post.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Download size={14} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.views || 0} Downloads</span>
          </div>
          
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-3 bg-[#1877F2] text-white px-7 py-3 rounded-full font-black text-[10px] transition-all shadow-xl shadow-blue-200 group-hover:bg-[#115cc1] active:scale-95 uppercase tracking-widest"
          >
            Open
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
