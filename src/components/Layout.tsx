import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { LogOut, LayoutDashboard, User, Home, Download, Facebook } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
              <Download className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FAST BD
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium hidden md:block">Home</Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 hover:bg-red-50 font-medium px-3 py-2 rounded-lg transition"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white font-medium px-5 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition">Register</Link>
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
    <footer className="bg-gray-50 border-t border-gray-100 mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Download className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-black text-gray-900 tracking-tighter">FAST BD</span>
        </div>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
          The ultimate source for premium quality downloads and resources. Safe, secure, and fast.
        </p>
        
        <div className="flex flex-col items-center gap-4 py-8 border-y border-gray-200/50 mb-8">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Developed By</span>
          <div className="flex items-center gap-4">
             <span className="text-gray-900 font-bold text-lg">Tamim Hasan</span>
             <a 
               href="https://www.facebook.com/share/18hoWUC59f/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-blue-600 p-2 rounded-full text-white hover:scale-110 transition shadow-lg shadow-blue-100"
             >
               <Facebook size={18} />
             </a>
          </div>
        </div>

        <div className="flex justify-center gap-8 text-sm font-bold text-gray-400">
          <a href="#" className="hover:text-blue-600 transition">TERMS</a>
          <a href="#" className="hover:text-blue-600 transition">PRIVACY</a>
          <a href="#" className="hover:text-blue-600 transition">REPORTS</a>
        </div>
        
        <div className="mt-12 text-gray-400 text-[10px] font-medium tracking-widest uppercase">
          © 2026 FAST BD. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};
