import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Post, Category, AppSettings, UserProfile } from '../../types';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Settings, FileText, Tag, Users, 
  Save, X, Image as ImageIcon, Link as LinkIcon, Info,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'settings' | 'users'>('posts');
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ notice: '', sliderImages: [] });
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
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

    return () => {
      unsubPosts();
      unsubCats();
      unsubSettings();
      unsubUsers();
    };
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

  if (authLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading Admin...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-4">Admin Panel</h2>
          <button
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition ${activeTab === 'posts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileText size={20} /> Posts
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Tag size={20} /> Categories
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Settings size={20} /> Settings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users size={20} /> Users
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-[32px] border border-gray-100 p-6 md:p-8 shadow-sm">
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-green-50 text-green-600 p-4 rounded-2xl flex items-center gap-3 border border-green-100 font-bold">
              <CheckCircle2 size={20} /> {success}
            </motion.div>
          )}

          {activeTab === 'posts' && <PostsPanel posts={posts} categories={categories} />}
          {activeTab === 'categories' && <CategoriesPanel categories={categories} />}
          {activeTab === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} onSave={handleSaveSettings} />}
          {activeTab === 'users' && <UsersPanel users={users} />}
        </main>
      </div>
    </div>
  );
};

// --- Sub-Panels ---

const PostsPanel: React.FC<{ posts: Post[], categories: Category[] }> = ({ posts, categories }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '', imageUrl: '', description: '', downloadLink: '', category: ''
  });

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      imageUrl: post.imageUrl,
      description: post.description,
      downloadLink: post.downloadLink,
      category: post.category
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'posts'), {
          ...formData,
          createdAt: serverTimestamp(),
          authorId: user.uid,
          views: 0
        });
      }
      setShowModal(false);
      setEditingPost(null);
      setFormData({ title: '', imageUrl: '', description: '', downloadLink: '', category: '' });
    } catch (err) { alert(err); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) await deleteDoc(doc(db, 'posts', id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Post Management</h3>
        <button
          onClick={() => { setEditingPost(null); setFormData({ title: '', imageUrl: '', description: '', downloadLink: '', category: '' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> New Post
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <img src={post.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                </td>
                <td className="px-6 py-4 font-bold text-gray-900 line-clamp-1">{post.title}</td>
                <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{post.category}</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(post)} className="p-2 text-gray-400 hover:text-blue-600 transition"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[32px] p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black uppercase tracking-tight">{editingPost ? 'Edit Post' : 'Create New Post'}</h4>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Title</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Thumbnail URL</label>
                    <input type="url" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Category</label>
                    <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Download Link</label>
                  <input type="url" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" required value={formData.downloadLink} onChange={e => setFormData({...formData, downloadLink: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Description</label>
                  <textarea rows={5} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-medium" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-widest text-sm hover:bg-blue-700">Save Post</button>
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
  const handleDelete = async (id: string) => {
    if (confirm('Delete category?')) await deleteDoc(doc(db, 'categories', id));
  };
  return (
    <div>
      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Categories</h3>
      <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <input type="text" placeholder="Category Name" className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold" value={name} onChange={e => setName(e.target.value)} />
        <button type="submit" className="bg-blue-600 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs">Add</button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center group">
            <span className="font-bold text-gray-700">{cat.name}</span>
            <button onClick={() => handleDelete(cat.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPanel: React.FC<{ settings: AppSettings, setSettings: any, onSave: any }> = ({ settings, setSettings, onSave }) => {
  const [newUrl, setNewUrl] = useState('');
  const addImage = () => { if (newUrl) { setSettings({...settings, sliderImages: [...settings.sliderImages, newUrl]}); setNewUrl(''); } };
  const removeImage = (i: number) => { setSettings({...settings, sliderImages: settings.sliderImages.filter((_, idx) => idx !== i)}); };
  return (
    <form onSubmit={onSave}>
      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">App Settings</h3>
      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Global Notice</label>
          <textarea rows={3} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold" value={settings.notice} onChange={e => setSettings({...settings, notice: e.target.value})} />
        </div>
        <div className="space-y-4">
          <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Slider Images</label>
          <div className="flex gap-4">
            <input type="url" placeholder="New Image URL" className="flex-1 bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            <button type="button" onClick={addImage} className="bg-gray-100 text-gray-600 px-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition">Add</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {settings.sliderImages.map((url, i) => (
              <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100">
                <img src={url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-widest text-sm hover:bg-blue-700">Save Global Settings</button>
      </div>
    </form>
  );
};

const UsersPanel: React.FC<{ users: UserProfile[] }> = ({ users }) => {
  return (
    <div>
       <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">User Directory</h3>
       <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">{u.displayName?.[0]}</div>
                  <span className="font-bold text-gray-900">{u.displayName}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm font-medium">{u.email}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${u.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}`}>{u.role}</span></td>
                <td className="px-6 py-4 text-gray-400 text-xs">{u.joinedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
    </div>
  );
};

export default AdminDashboard;
