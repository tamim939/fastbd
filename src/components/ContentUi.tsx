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
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
    >
      <Link to={`/post/${post.id}`} className="block relative aspect-video overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
            {post.category}
          </span>
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center gap-3 text-gray-400 text-xs mb-3 font-medium">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString()}
          </div>
        </div>

        <Link to={`/post/${post.id}`}>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-3 line-clamp-2 leading-tight">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">
          {post.description}
        </p>

        <div className="flex items-center justify-between border-t border-gray-50 pt-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Download size={14} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{post.views || 0} Downloads</span>
          </div>
          
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-2 bg-gray-50 group-hover:bg-blue-600 text-gray-900 group-hover:text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-blue-200"
          >
            Details
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
