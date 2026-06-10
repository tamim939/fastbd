import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import { useAuth } from '../lib/AuthContext';
import { BannerAd } from '../components/Adsterra';
import { motion } from 'motion/react';
import { Download, Calendar, Tag, ArrowLeft, Share2, Eye, ShieldCheck, Loader2 } from 'lucide-react';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(location.state?.post || null);
  const [loading, setLoading] = useState(!location.state?.post);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const docRef = doc(db, 'posts', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() } as Post);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleDownloadClick = async (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/register');
      return;
    }
    if (!id || !post) return;
    try {
      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, { views: increment(1) });
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { downloadCount: increment(1) });

      setPost(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700">Resource Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-medium hover:underline">Go Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-8 transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-2xl shadow-blue-500/5"
      >
        <div className="relative aspect-video max-h-[500px]">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-8">
             <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
              {post.category}
            </span>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-6 border-b border-gray-50 pb-6">
            <div className="flex items-center gap-2 font-medium">
              <Calendar size={18} className="text-blue-500/50" />
              {new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Eye size={18} className="text-blue-500/50" />
              {post.views || 0} Views
            </div>
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck size={18} className="text-green-500/50" />
              Verified Safe
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight leading-tight uppercase">
            {post.title}
          </h1>
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-8">Fast BD • Premium Content</p>

          <div className="prose prose-blue max-w-none text-gray-600 text-lg leading-relaxed mb-12 whitespace-pre-line border-t border-gray-50 pt-10">
            {post.description}
          </div>

          <div className="space-y-4 mb-10">
            {post.buttons?.map((btn, idx) => (
              <div key={idx} className="flex justify-center">
                <a
                  href={btn.link}
                  onClick={handleDownloadClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-6 rounded-2xl font-black text-sm shadow-2xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all w-full uppercase tracking-[0.2em] group"
                >
                  <Download size={24} className="group-hover:translate-y-0.5 transition-transform" />
                  {btn.label || 'Download File'}
                </a>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12 pt-12 border-t border-gray-50">
            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold uppercase tracking-widest text-xs transition">
              <Share2 size={16} />
              Share this resource
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm">
          Having trouble with the download? <a href="#" className="text-blue-600 underline">Report an issue</a>
        </p>
      </div>
    </div>
  );
};

export default PostDetail;
