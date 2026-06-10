import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Navbar, Footer } from './components/Layout';
import { PopunderAd, SocialBarAd, BannerAd } from './components/Adsterra';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

// Pages
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import Profile from './pages/Profile';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  useEffect(() => {
    const trackVisit = async () => {
      const statsRef = doc(db, 'stats', 'global');
      try {
        const statsDoc = await getDoc(statsRef);
        if (statsDoc.exists()) {
          await updateDoc(statsRef, { totalVisitors: increment(1) });
        } else {
          await setDoc(statsRef, { totalVisitors: 1 });
        }
      } catch (err) {
        console.error('Visit tracking failed:', err);
      }
    };
    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <ScrollToTop />
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-white -z-10 pointer-events-none" />
      
      <Navbar />
      
      {/* Top Banner Ad */}
      <div className="flex justify-center py-4 bg-gray-50/30">
        <BannerAd />
      </div>
      
      <main className="min-h-[calc(100vh-16rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Bottom Banner Ad */}
      <div className="flex justify-center py-10 border-t border-gray-100 bg-white">
        <BannerAd />
      </div>

      <Footer />

      {/* Persistence Ads */}
      <PopunderAd />
      <SocialBarAd />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
