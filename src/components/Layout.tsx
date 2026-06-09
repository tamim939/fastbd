import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { LogOut, LayoutDashboard, User, Home, Download, Facebook, Send } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 md:h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
              <Download className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-lg md:text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase">
              FAST BD
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link 
                  to="/profile" 
                  className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-blue-600/5 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-sm overflow-hidden uppercase"
                >
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="P" className="w-full h-full object-cover" />
                  ) : (
                    profile?.displayName?.[0] || user.displayName?.[0] || 'U'
                  )}
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-blue-50 transition border border-transparent hover:border-blue-100"
                  >
                    <LayoutDashboard size={14} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl transition border border-transparent hover:border-red-100"
                >
                  <LogOut size={14} className="md:w-[18px] md:h-[18px]" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 md:gap-3">
                <Link to="/login" className="text-gray-900 font-bold text-xs uppercase tracking-widest px-4 py-2 hover:text-blue-600 transition">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-4 md:px-6 py-2.5 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition whitespace-nowrap">Join Now</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-12 md:mt-24 py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-6 mb-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Download className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">FAST BD</span>
          </Link>
          <p className="text-gray-400 text-xs md:text-sm max-w-sm font-medium leading-relaxed">
            Premium quality digital resources hub. Fast, secure, and always updated for the community.
          </p>
        </div>
        
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Design & Architecture</span>
            <span className="text-gray-900 font-extrabold text-xl tracking-tight">Developer: Tamim Hasan</span>
            <div className="flex gap-3 mb-10">
              <a 
                href="https://www.facebook.com/share/18hoWUC59f/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#1877F2] p-2.5 rounded-2xl text-white hover:scale-110 active:scale-95 transition-all shadow-xl shadow-blue-100"
                title="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://t.me/Tamim_Hasan10" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#229ED9] p-2.5 rounded-2xl text-white hover:scale-110 active:scale-95 transition-all shadow-xl shadow-blue-100"
                title="Telegram"
              >
                <Send size={20} />
              </a>
            </div>
          </div>

        <div className="flex justify-center gap-8 text-[10px] font-black text-gray-400 tracking-widest uppercase mb-12">
          <a href="#" className="hover:text-blue-600 transition">Terms</a>
          <a href="#" className="hover:text-blue-600 transition">Privacy</a>
          <a href="#" className="hover:text-blue-600 transition">Support</a>
        </div>
        
        <div className="text-gray-400 text-[9px] font-bold tracking-[0.2em] uppercase opacity-60">
          © {new Date().getFullYear()} FAST BD • Built for Performance
        </div>
      </div>
    </footer>
  );
};
