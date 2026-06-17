import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Post, Category, AppSettings, UserProfile } from '../../types';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Settings, FileText, Tag, Users, 
  Save, X, Image as ImageIcon, Link as LinkIcon, Info,
  CheckCircle2, AlertCircle, Loader2, BarChart3, TrendingUp, Eye, Download, Camera, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'settings' | 'users'>('posts');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    notice: '', 
    sliderImages: [],
    popup: { isEnabled: false, title: '', imageUrl: '', telegramLink: '' }
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'posts'));

    const unsubCats = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'categories'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as AppSettings;
        setSettings({
          ...data,
          sliderImages: data.sliderImages || [],
          popup: data.popup || { isEnabled: false, title: '', imageUrl: '', telegramLink: '' }
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/general'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsersList(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    });

    return () => { unsubPosts(); unsubCats(); unsubSettings(); unsubUsers(); };
  }, [isAdmin]);

  const [publishing, setPublishing] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      setSuccess('All changes published to users!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2 text-blue-600" /> Preparing Admin Deck...</div>;
  if (!isAdmin) return null;

  return (
    <div className="w-full px-4 lg:px-8 py-10 min-h-screen bg-gray-50/30">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 space-y-4">
          <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-2xl shadow-blue-100 mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Workspace</h2>
            <p className="text-2xl font-black tracking-tighter">FAST BD ADMIN</p>
          </div>
          
          <nav className="bg-white p-3 rounded-[32px] border border-gray-100 shadow-sm space-y-1">
            {[
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'users', label: 'User Index', icon: Users },
              { id: 'settings', label: 'Home UI', icon: Settings },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                {activeTab === item.id && <motion.div layoutId="pill" className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-green-50 text-green-700 p-5 rounded-3xl flex items-center gap-3 border border-green-100 font-bold shadow-sm">
              <CheckCircle2 size={24} className="text-green-500" /> {success}
            </motion.div>
          )}

          <div className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-12 shadow-sm min-h-[700px]">
            <SummaryStats posts={posts} usersCount={usersList.length} />
            
            {activeTab === 'posts' && <PostsPanel posts={posts} categories={categories} />}
            {activeTab === 'categories' && <CategoriesPanel categories={categories} />}
            {activeTab === 'users' && <UsersPanel users={usersList} />}
            {activeTab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} onSave={handleSaveSettings} publishing={publishing} />}
          </div>
        </main>
      </div>
    </div>
  );
};

const PostsPanel: React.FC<{ posts: Post[], categories: Category[] }> = ({ posts, categories }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [publishing, setPublishing] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', imageUrl: '', description: '', category: '', buttons: [{ label: 'DOWNLOAD', link: '' }] });

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({ 
      title: post.title, 
      imageUrl: post.imageUrl, 
      description: post.description, 
      category: post.category, 
      buttons: post.buttons || [{ label: 'DOWNLOAD', link: '' }] 
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPublishing(true);
    try {
      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'posts'), { ...formData, createdAt: serverTimestamp(), authorId: user.uid, views: 0, downloads: 0 });
      }
      setShowModal(false);
      alert('SUCCESS: Post synchronized to Global Index!');
    } catch (err: any) { 
      console.error(err);
      alert('PUBLISH FAILED: ' + (err.message || 'Check connection or permissions')); 
    } finally {
      setPublishing(false);
    }
  };

  const handleFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert('File too large (Max 2MB)');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this resource permanently?')) await deleteDoc(doc(db, 'posts', id));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Content Library</h3>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1 uppercase">Manage your premium resources</p>
        </div>
        <button onClick={() => { setEditingPost(null); setFormData({ title: '', imageUrl: '', description: '', category: '', buttons: [{ label: 'DOWNLOAD', link: '' }] }); setShowModal(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition shadow-xl shadow-blue-100 uppercase tracking-widest text-[10px]">
          <Plus size={18} /> New Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white border border-gray-100 p-5 rounded-[32px] group relative shadow-sm hover:shadow-xl transition-all duration-500">
             <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
               <img src={post.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
               <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-black uppercase text-blue-600 shadow-sm">{post.category}</div>
             </div>
             <h4 className="font-black text-gray-900 mb-6 line-clamp-1 text-sm uppercase tracking-tight">{post.title}</h4>
             <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Eye size={12} className="text-gray-400" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{post.views || 0} VIEWS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download size={12} className="text-blue-600" />
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{post.downloads || 0} DOWNLOADS</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleEdit(post)} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 size={14} /></button>
                   <button onClick={() => handleDelete(post.id)} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                </div>
             </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-xl rounded-[40px] p-8 md:p-10 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight">{editingPost ? 'Edit Resource' : 'Publish Resource'}</h4>
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Global Synchronization</p>
                </div>
                <button onClick={() => setShowModal(false)} className="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-gray-900 transition"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Title</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-bold text-sm" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Resource Title" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Hero Image Link</label>
                    <div className="space-y-4">
                      <div className="group relative aspect-video rounded-3xl overflow-hidden bg-gray-900 border border-white/5 shadow-2xl">
                         {formData.imageUrl ? (
                           <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-[#0f0f0f]">
                             <ImageIcon size={32} />
                             <span className="text-[8px] font-black mt-2 uppercase tracking-[0.3em]">Link Required</span>
                           </div>
                         )}
                      </div>
                      <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                        <input 
                          type="url" 
                          placeholder="PASTE IMAGE URL HERE..." 
                          className="w-full bg-white border border-blue-100 p-5 pl-12 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-xs uppercase" 
                          required
                          value={formData.imageUrl} 
                          onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                        />
                      </div>
                      <p className="text-[8px] font-bold text-blue-400 italic px-2">
                        * Image will be synchronized from this remote URL across the global content network.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Taxonomy</label>
                      <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-bold text-sm" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="">Category</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Download Nodes</label>
                         <button 
                          type="button" 
                          onClick={() => setFormData({...formData, buttons: [...formData.buttons, { label: 'MIRROR', link: '' }]})}
                          className="text-[9px] font-black text-blue-600 uppercase hover:underline"
                        >
                          + Add Button
                        </button>
                      </div>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {formData.buttons.map((btn, idx) => (
                          <div key={idx} className="flex gap-2 items-start bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                            <div className="flex-1 space-y-2">
                              <input 
                                type="text" 
                                placeholder="Button Label (e.g. DOWNLOAD)" 
                                className="w-full bg-gray-50 border-none p-2 rounded-lg font-black text-[9px] uppercase outline-none focus:bg-white" 
                                value={btn.label} 
                                onChange={e => {
                                  const newBtns = [...formData.buttons];
                                  newBtns[idx].label = e.target.value;
                                  setFormData({...formData, buttons: newBtns});
                                }}
                              />
                              <input 
                                type="url" 
                                placeholder="https://..." 
                                className="w-full bg-gray-100 border-none p-2 rounded-lg font-bold text-[9px] outline-none focus:bg-white" 
                                value={btn.link} 
                                onChange={e => {
                                  const newBtns = [...formData.buttons];
                                  newBtns[idx].link = e.target.value;
                                  setFormData({...formData, buttons: newBtns});
                                }}
                              />
                            </div>
                            {formData.buttons.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => setFormData({...formData, buttons: formData.buttons.filter((_, i) => i !== idx)})}
                                className="p-2 text-red-300 hover:text-red-500 transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Documentation</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl outline-none focus:bg-white focus:border-blue-500 font-medium text-sm" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Features, installation steps, etc..." />
                </div>
                <button 
                  type="submit" 
                  disabled={publishing}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 uppercase tracking-[0.2em] text-[10px] hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {publishing ? <Loader2 className="animate-spin" size={16} /> : null}
                  {publishing ? 'Synchronizing Content...' : 'Publish to Global Index'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoriesPanel: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const [name, setName] = useState('');
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await addDoc(collection(db, 'categories'), { name, slug: name.toLowerCase().replace(/ /g, '-') });
      setName('');
    } catch (err) { alert(err); }
  };
  return (
    <div className="max-w-2xl">
      <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-12">Taxonomy</h3>
      <form onSubmit={handleAdd} className="flex gap-4 mb-12 bg-gray-50 p-8 rounded-[32px] border border-gray-100">
        <input type="text" placeholder="Category Name" className="flex-1 bg-white border border-gray-100 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold transition" value={name} onChange={e => setName(e.target.value)} />
        <button type="submit" className="bg-blue-600 text-white px-10 rounded-2xl font-black uppercase tracking-widest text-[10px]">Add</button>
      </form>
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-gray-100 p-6 rounded-2xl flex justify-between items-center group hover:bg-gray-50 transition shadow-sm">
            <span className="font-bold text-gray-800 text-lg uppercase tracking-tight">{cat.name}</span>
            <button onClick={async () => { if(confirm('Delete?')) await deleteDoc(doc(db, 'categories', cat.id)) }} className="text-gray-200 hover:text-red-500 transition"><Trash2 size={22} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPanel: React.FC<{ settings: AppSettings, setSettings: any, onSave: any, publishing: boolean }> = ({ settings, setSettings, onSave, publishing }) => {
  const [newSlide, setNewSlide] = useState({ url: '', link: '' });

  const handleFileUpload = (type: 'slider' | 'popup', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert('File too large (Max 2MB)');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'slider') {
          setNewSlide({ ...newSlide, url: result });
        } else if (type === 'popup') {
          setSettings({
            ...settings,
            popup: { ...settings.popup!, imageUrl: result }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={onSave} className="max-w-4xl">
      <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-12">HOME INTERFACE</h3>
      
      <div className="space-y-16">
        {/* Notice Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Scrolling Notice Board</label>
            {settings.notice && (
              <button 
                type="button"
                onClick={() => setSettings({...settings, notice: ''})}
                className="text-red-500 font-bold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear Notice
              </button>
            )}
          </div>
          <textarea 
            rows={4} 
            placeholder="Write your scrolling notice here..."
            className="w-full bg-gray-50 border border-gray-100 p-6 rounded-[32px] outline-none focus:bg-white focus:border-blue-500 font-bold transition text-lg" 
            value={settings.notice} 
            onChange={e => setSettings({...settings, notice: e.target.value})} 
          />
        </div>

        {/* Popup Settings Section */}
        <div className="bg-blue-50/50 p-8 md:p-10 rounded-[40px] border border-blue-100/50 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Announcement Popup</h4>
              <p className="text-blue-700/60 font-bold text-xs">Global Modal (Appears 1 per session)</p>
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setSettings({...settings, popup: { ...settings.popup!, isEnabled: !settings.popup?.isEnabled }})}
                className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${settings.popup?.isEnabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-200 text-gray-500'}`}
              >
                {settings.popup?.isEnabled ? 'PUBLISHED' : 'HIDDEN'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  if(confirm('Delete entire popup content?')) {
                    setSettings({...settings, popup: { isEnabled: false, title: '', imageUrl: '', telegramLink: '' }});
                  }
                }}
                className="bg-red-50 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title="Delete Popup Content"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-blue-900/40 tracking-[0.2em] ml-1">Popup Headline</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-blue-100/50 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold"
                  value={settings.popup?.title}
                  onChange={e => setSettings({...settings, popup: { ...settings.popup!, title: e.target.value }})}
                  placeholder="e.g. JOIN OUR PREMIUM CHANNEL"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-blue-900/40 tracking-[0.2em] ml-1">Popup Banner Source</label>
                <div className="space-y-4">
                  <div className="group relative aspect-video rounded-[32px] overflow-hidden bg-white border border-blue-100/50 shadow-sm">
                    <img 
                      src={settings.popup?.imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000'} 
                      className="w-full h-full object-cover"
                      alt="Popup Preview"
                    />
                  </div>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition" size={16} />
                    <input 
                      type="url" 
                      className="w-full bg-white border border-blue-100/50 p-4 pl-12 rounded-xl outline-none focus:border-blue-500 font-bold text-[10px]"
                      value={settings.popup?.imageUrl}
                      onChange={e => setSettings({...settings, popup: { ...settings.popup!, imageUrl: e.target.value }})}
                      placeholder="Or paste direct image URL here..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-blue-900/40 tracking-[0.2em] ml-1">Action Link (Telegram)</label>
                <div className="relative group">
                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition" size={18} />
                  <input 
                    type="url" 
                    className="w-full bg-white border border-blue-100/50 p-6 pl-14 rounded-3xl outline-none focus:border-blue-500 font-bold text-sm"
                    value={settings.popup?.telegramLink}
                    onChange={e => setSettings({...settings, popup: { ...settings.popup!, telegramLink: e.target.value }})}
                    placeholder="https://t.me/your_channel"
                  />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-[32px] border border-blue-100/30">
                <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 block">Visual Architecture Preview</h5>
                <div className="w-full aspect-[21/9] rounded-2xl relative overflow-hidden bg-gray-900 mb-4 border border-white/5 shadow-2xl">
                   <img src={settings.popup?.imageUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000'} className="w-full h-full object-cover opacity-40" />
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <div className="bg-blue-600 text-white text-[6px] px-2 py-0.5 rounded-full mb-1">LIVE PREVIEW</div>
                      <div className="text-white text-[12px] md:text-sm font-black uppercase truncate w-full tracking-tighter">{settings.popup?.title || 'Announcement Headline'}</div>
                      <div className="bg-[#1877F2] text-white text-[8px] font-black py-2 px-6 rounded-full mt-4 shadow-lg shadow-blue-500/20 uppercase tracking-widest">Action Button</div>
                   </div>
                </div>
                <button 
                  type="button" 
                  onClick={onSave}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                >
                  <Save size={18} />
                  Save Global Popup Configuration
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Hero Slider Configuration</label>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Live Sync Active</span>
          </div>
          
          <div className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-100 pb-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-900/60 tracking-wider">Slide Image</label>
                <div className="space-y-4">
                  <div className="group relative aspect-video rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                    {newSlide.url ? (
                      <img src={newSlide.url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                        <ImageIcon size={32} />
                        <span className="text-[10px] font-bold mt-2 uppercase tracking-widest text-[8px]">Paste Link Below</span>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition" size={16} />
                    <input 
                      type="url" 
                      placeholder="Or paste direct image URL here..." 
                      className="w-full bg-white border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-blue-500 font-bold text-[10px] transition" 
                      value={newSlide.url} 
                      onChange={e => setNewSlide({...newSlide, url: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-900/60 tracking-wider">Click Destination (Optional)</label>
                <div className="space-y-4">
                  <div className="relative group">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition" size={18} />
                    <input 
                      type="url" 
                      placeholder="https://t.me/your_channel" 
                      className="w-full bg-white border border-gray-100 p-5 pl-12 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm transition" 
                      value={newSlide.link} 
                      onChange={e => setNewSlide({...newSlide, link: e.target.value})} 
                    />
                  </div>
                  <button 
                    type="button" 
                    disabled={!newSlide.url}
                    onClick={() => { 
                      if(newSlide.url){ 
                        setSettings({
                          ...settings, 
                          sliderImages: [...(settings.sliderImages || []), newSlide]
                        }); 
                        setNewSlide({ url: '', link: '' }); 
                      } 
                    }} 
                    className={`w-full py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] uppercase transition-all shadow-xl ${newSlide.url ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                  >
                    ADD TO STACK
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Current Active Slides ({settings.sliderImages?.length || 0})</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {settings.sliderImages?.map((slide, i) => (
                  <div key={i} className="relative group aspect-video rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                    <img src={slide.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-3 text-center">
                       <p className="text-white text-[8px] font-bold truncate w-full mb-2">{slide.link || 'Internal Link'}</p>
                       <button 
                        type="button" 
                        onClick={() => setSettings({...settings, sliderImages: settings.sliderImages.filter((_, idx) => idx !== i)})} 
                        className="bg-red-500 text-white p-2 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                       >
                        <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))}
                {(!settings.sliderImages || settings.sliderImages.length === 0) && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white border border-dashed border-gray-200 rounded-[32px]">
                    <ImageIcon className="text-gray-200 mb-2" size={32} />
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No active slides</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={publishing}
          className={`w-full bg-blue-600 text-white font-black py-6 rounded-[24px] shadow-2xl shadow-blue-100 uppercase tracking-[0.2em] text-xs hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${publishing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {publishing ? <Loader2 className="animate-spin" size={18} /> : null}
          {publishing ? 'Synchronizing with Live Server...' : 'Publish Global Updates'}
        </button>
      </div>
    </form>
  );
};

export default AdminDashboard;

const SummaryStats: React.FC<{ posts: Post[], usersCount: number }> = ({ posts, usersCount }) => {
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalDownloads = posts.reduce((acc, p) => acc + (p.downloads || 0), 0);

  const stats = [
    { label: 'Total Resources', value: posts.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Downloads', value: totalDownloads, icon: Download, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Registered Users', value: usersCount, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center">
          <div className={`${stat.bg} p-3 rounded-2xl mb-4`}>
            <stat.icon size={24} className={stat.color} />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tighter mb-1">{stat.value.toLocaleString()}</div>
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

const UsersPanel: React.FC<{ users: UserProfile[] }> = ({ users }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">User Directory</h3>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Information for {users.length} registered members</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-6 pb-2">User</th>
              <th className="px-6 pb-2">Email</th>
              <th className="px-6 pb-2">Role</th>
              <th className="px-6 pb-2">Downloads</th>
              <th className="px-6 pb-2 text-right">Joined At</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.uid} className="bg-gray-50/50 hover:bg-gray-50 transition group transition-all duration-300">
                <td className="px-6 py-4 rounded-l-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-xs overflow-hidden">
                      {user.photoURL ? <img src={user.photoURL} alt="" /> : user.displayName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{user.displayName || 'Anonymous User'}</div>
                      <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">ID: {user.uid.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-medium text-gray-600">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${user.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Download size={12} className="text-blue-600" />
                    <span className="text-xs font-black text-gray-900">{user.downloadCount || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 rounded-r-[24px] text-right">
                  <div className="text-[10px] font-bold text-gray-400">
                    {user.joinedAt?.toDate ? user.joinedAt.toDate().toLocaleDateString() : 'N/A'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
             <Users className="text-gray-200 mx-auto mb-4" size={48} />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No users found in database</p>
          </div>
        )}
      </div>
    </div>
  );
};

