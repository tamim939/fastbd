import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Post, Category, AppSettings, UserProfile } from '../../types';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Settings, FileText, Tag, Users, 
  Save, X, Image as ImageIcon, Link as LinkIcon, Info,
  CheckCircle2, AlertCircle, Loader2, BarChart3, TrendingUp, Eye, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'posts' | 'categories' | 'settings' | 'users'>('stats');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ notice: '', sliderImages: [] });
  const [users, setUsers] = useState<UserProfile[]>([]);
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
      if (doc.exists()) setSettings(doc.data() as AppSettings);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/general'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return () => { unsubPosts(); unsubCats(); unsubSettings(); unsubUsers(); };
  }, [isAdmin]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
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
              { id: 'stats', label: 'Analytics', icon: BarChart3 },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'settings', label: 'Theme', icon: Settings },
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
            {activeTab === 'stats' && <StatsPanel posts={posts} users={users} />}
            {activeTab === 'posts' && <PostsPanel posts={posts} categories={categories} />}
            {activeTab === 'categories' && <CategoriesPanel categories={categories} />}
            {activeTab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} onSave={handleSaveSettings} />}
            {activeTab === 'users' && <UsersPanel users={users} />}
          </div>
        </main>
      </div>
    </div>
  );
};

const StatsPanel: React.FC<{ posts: Post[], users: UserProfile[] }> = ({ posts, users }) => {
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const topPost = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100">
          <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
            <TrendingUp size={24} />
          </div>
          <p className="text-blue-900/60 font-black uppercase text-[10px] tracking-widest mb-1">Total Downloads</p>
          <h4 className="text-4xl font-black text-blue-900 tracking-tighter">{totalViews}</h4>
        </div>
        <div className="bg-amber-50 p-8 rounded-[32px] border border-amber-100">
          <div className="bg-amber-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-200">
            <Users size={24} />
          </div>
          <p className="text-amber-900/60 font-black uppercase text-[10px] tracking-widest mb-1">Active Users</p>
          <h4 className="text-4xl font-black text-amber-900 tracking-tighter">{users.length}</h4>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100">
          <div className="bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-200">
            <FileText size={24} />
          </div>
          <p className="text-emerald-900/60 font-black uppercase text-[10px] tracking-widest mb-1">Total Content</p>
          <h4 className="text-4xl font-black text-emerald-900 tracking-tighter">{posts.length}</h4>
        </div>
      </div>

      {topPost && (
        <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
          <h5 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-6">Top Performing Resource</h5>
          <div className="flex items-center gap-6">
            <img src={topPost.imageUrl} className="w-24 h-24 rounded-3xl object-cover shadow-xl" />
            <div>
              <h6 className="text-2xl font-black text-gray-900 mb-2">{topPost.title}</h6>
              <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                <span className="flex items-center gap-1.5"><Eye size={16} /> {topPost.views || 0} VIEWS</span>
                <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase text-[10px]">{topPost.category}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PostsPanel: React.FC<{ posts: Post[], categories: Category[] }> = ({ posts, categories }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', imageUrl: '', description: '', downloadLink: '', category: '' });

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({ title: post.title, imageUrl: post.imageUrl, description: post.description, downloadLink: post.downloadLink, category: post.category });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'posts'), { ...formData, createdAt: serverTimestamp(), authorId: user.uid, views: 0 });
      }
      setShowModal(false);
    } catch (err) { alert(err); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this resource permanently?')) await deleteDoc(doc(db, 'posts', id));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">RESOURCES</h3>
        <button onClick={() => { setEditingPost(null); setFormData({ title: '', imageUrl: '', description: '', downloadLink: '', category: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition shadow-xl shadow-blue-100 uppercase tracking-widest text-xs">
          <Plus size={20} /> CREATE NEW POST
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-50 border border-gray-100 p-6 rounded-[32px] group relative">
             <img src={post.imageUrl} className="w-full h-40 rounded-2xl object-cover mb-4 grayscale group-hover:grayscale-0 transition duration-500" />
             <h4 className="font-bold text-gray-900 mb-4 line-clamp-1">{post.title}</h4>
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">{post.category}</span>
                <div className="flex gap-1">
                   <button onClick={() => handleEdit(post)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 shadow-sm transition"><Edit2 size={16} /></button>
                   <button onClick={() => handleDelete(post.id)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 shadow-sm transition"><Trash2 size={16} /></button>
                </div>
             </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[40px] p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-2xl font-black uppercase tracking-tight">{editingPost ? 'Edit Post' : 'New Content'}</h4>
                <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-900 transition"><X size={28} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Core Title</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-bold transition" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Asset URL</label>
                    <input type="url" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-bold text-sm" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Category</label>
                    <select className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-bold" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="">Choose One</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Secure Download Path</label>
                  <input type="url" className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-bold text-sm" required value={formData.downloadLink} onChange={e => setFormData({...formData, downloadLink: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Content Details</label>
                  <textarea rows={5} className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-medium" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-blue-100 uppercase tracking-[0.2em] text-xs hover:bg-blue-700 active:scale-95 transition-all">Synchronize Content</button>
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

const SettingsPanel: React.FC<{ settings: AppSettings, setSettings: any, onSave: any }> = ({ settings, setSettings, onSave }) => {
  const [newUrl, setNewUrl] = useState('');
  return (
    <form onSubmit={onSave} className="max-w-4xl">
      <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-12">UI ARCHITECTURE</h3>
      <div className="space-y-12">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Landing Page Notice</label>
          <textarea rows={4} className="w-full bg-gray-50 border border-gray-100 p-6 rounded-[32px] outline-none focus:bg-white focus:border-blue-500 font-bold transition text-lg" value={settings.notice} onChange={e => setSettings({...settings, notice: e.target.value})} />
        </div>
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Carousel Assets</label>
          <div className="flex gap-4">
            <input type="url" placeholder="Direct Image URL" className="flex-1 bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-bold text-sm transition" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            <button type="button" onClick={() => { if(newUrl){ setSettings({...settings, sliderImages: [...settings.sliderImages, newUrl]}); setNewUrl(''); } }} className="bg-gray-100 text-gray-900 px-8 rounded-2xl font-black tracking-widest text-[10px] uppercase hover:bg-gray-200 transition">PUSH</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {settings.sliderImages.map((url, i) => (
              <div key={i} className="relative group aspect-video rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setSettings({...settings, sliderImages: settings.sliderImages.filter((_, idx) => idx !== i)})} className="absolute top-4 right-4 bg-red-600 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-100 uppercase tracking-[0.2em] text-xs hover:bg-blue-700 active:scale-[0.98] transition-all">Publish Global Updates</button>
      </div>
    </form>
  );
};

const UsersPanel: React.FC<{ users: UserProfile[] }> = ({ users }) => {
  const handleDeleteUser = async (uid: string) => {
    if (confirm('Permanently delete this user profile? The Auth account will remain but their app data will be gone.')) {
      try { await deleteDoc(doc(db, 'users', uid)); } catch (err) { alert(err); }
    }
  };

  return (
    <div className="w-full overflow-hidden">
       <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-12">User Directory</h3>
       <div className="overflow-x-auto -mx-8 md:-mx-12 px-8 md:px-12">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
              <th className="pb-8 pl-4">Account Profile</th>
              <th className="pb-8">Email Identifier</th>
              <th className="pb-8">Permission Role</th>
              <th className="pb-8">Joined On</th>
              <th className="pb-8 pr-4 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.uid} className="hover:bg-gray-50/50 transition">
                <td className="py-6 pl-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center font-black text-blue-600 text-sm">{u.displayName?.[0] || 'U'}</div>
                      <span className="font-black text-gray-900 tracking-tight">{u.displayName || 'Anonymous'}</span>
                   </div>
                </td>
                <td className="py-6 text-gray-400 text-sm font-bold tracking-tight">{u.email}</td>
                <td className="py-6">
                   <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                   </span>
                </td>
                <td className="py-6 text-gray-400 text-[11px] font-bold uppercase tracking-widest">{u.joinedAt?.toDate?.()?.toLocaleDateString() || 'PRE-RELEASE'}</td>
                <td className="py-6 pr-4 text-right">
                   <button onClick={() => handleDeleteUser(u.uid)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
    </div>
  );
};

export default AdminDashboard;
