import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Post, Category, AppSettings } from '../types';
import { ImageSlider, NoticeBoard } from '../components/HomeUi';
import { CategoryList, PostCard } from '../components/ContentUi';
import { AnnouncementPopup } from '../components/AnnouncementPopup';
import { BannerAd } from '../components/Adsterra';
import { motion } from 'motion/react';
import { Search, Loader2 } from 'lucide-react';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Categories
    const qCats = query(collection(db, 'categories'));
    const unsubCats = onSnapshot(qCats, (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'categories'));

    // Fetch Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/general'));

    // Fetch Posts
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'posts'));

    return () => {
      unsubCats();
      unsubSettings();
      unsubPosts();
    };
  }, []);

  const filteredPosts = posts.filter(post => {
    if (activeCategory === 'all') return post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Find category obj to match against both slug and name for robustness
    const categoryObj = categories.find(c => c.slug === activeCategory);
    const matchesCategory = post.category && (
      post.category.toLowerCase() === activeCategory.toLowerCase() || 
      (categoryObj && post.category.toLowerCase() === categoryObj.name.toLowerCase())
    );
    
    const matchesSearch = post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      <AnnouncementPopup config={settings?.popup} />
      {/* Visual Identity Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 md:mb-12"
      >
        <ImageSlider images={settings?.sliderImages || []} />
        <NoticeBoard notice={settings?.notice || ''} />
      </motion.div>

      {/* Ad Space */}
      <div className="my-6 md:my-10">
        <BannerAd />
      </div>

      {/* Main Content Area */}
      <div className="mt-8 bg-gray-50/50 rounded-[24px] md:rounded-[40px] p-5 md:p-10 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Exclusive Resources</h2>
            <p className="text-gray-400 font-bold mt-1 text-[10px] md:text-xs uppercase tracking-widest">Premium quality downloads and tools</p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={20} />
            <input
              type="text"
              placeholder="Search everything..."
              className="w-full bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <CategoryList 
          categories={categories} 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-medium">No resources found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Bottom Ad */}
      <div className="mt-12">
        <BannerAd />
      </div>
    </div>
  );
};

export default Home;
