import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Download, Settings, Camera, Save, Loader2, X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', photoURL: '', bio: '' });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setFormData({ 
          displayName: data.displayName || '', 
          photoURL: data.photoURL || '', 
          bio: data.bio || '' 
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setEditMode(false);
    } catch (err) {
      alert('Failed to update profile');
    }
    setSaving(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large. Max 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!profile) return <div className="text-center py-20">Profile not found. Please log in.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-blue-500/5 overflow-hidden">
        {/* Header/Cover */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-16 left-8 md:left-12">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] border-4 border-white bg-white shadow-2xl overflow-hidden">
                <img 
                  src={formData.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.uid} 
                  className="w-full h-full object-cover"
                  alt={profile.displayName}
                />
              </div>
              {editMode && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={32} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>
          <div className="absolute bottom-6 right-8 md:right-12">
            <button 
              onClick={() => setEditMode(!editMode)}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
            >
              {editMode ? <X size={14} /> : <Settings size={14} />}
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="pt-24 pb-12 px-8 md:px-12">
          {!editMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                    {profile.displayName || 'Anonymous User'}
                  </h1>
                  <p className="text-gray-400 font-medium text-lg leading-relaxed">
                    {profile.bio || 'Exploring premium resources on FAST BD.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                      <Mail size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Contact</span>
                      <span className="text-gray-900 font-bold">{profile.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-100">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Member Since</span>
                      <span className="text-gray-900 font-bold">{profile.joinedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-2xl shadow-indigo-100 text-center">
                  <Download className="mx-auto mb-4" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-1">Impact Assets</span>
                  <p className="text-5xl font-black tracking-tighter">{profile.downloadCount || 0}</p>
                  <p className="text-xs font-bold mt-4 opacity-80 uppercase tracking-widest">Resources Acquired</p>
                </div>
                <div className="bg-gray-900 p-8 rounded-[32px] text-white text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1">Membership</span>
                  <p className="text-xl font-black tracking-widest uppercase">{profile.role}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-black transition"
                    value={formData.displayName}
                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                    placeholder="Enter your name"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Short Biography</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-blue-500 font-bold transition"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
               </div>
               <button 
                 type="submit" 
                 disabled={saving}
                 className="flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all w-full md:w-auto"
               >
                 {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                 Synchronize Identity
               </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
