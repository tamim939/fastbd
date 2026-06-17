import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

interface AuthContextType {
  user: { uid: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      const tgUser = tg.initDataUnsafe?.user;
      
      if (tgUser) {
        const uid = `tg_${tgUser.id}`;
        setUser({ uid });
        
        // Auto-fetch or create profile
        const userRef = doc(db, 'users', uid);
        
        const unsubscribe = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create profile automatically
            const newProfile: UserProfile = {
              uid,
              displayName: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
              photoURL: tgUser.photo_url || '',
              role: 'user',
              joinedAt: serverTimestamp(),
              telegramId: tgUser.id,
              username: tgUser.username || '',
              email: '', // Not available from telegram basic user data
              downloadCount: 0
            };
            
            // Hardcoded admins based on request history
            const adminUsernames = ['rsjonayed07', 'jonayed', 'TRADER_TAMIM_3'];
            if (tgUser.username && adminUsernames.includes(tgUser.username)) {
              newProfile.role = 'admin';
            }

            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        }, (err) => {
          console.error("Telegram Profile Init Error:", err);
          setLoading(false);
        });

        return () => unsubscribe();
      } else {
        // Not running in Telegram or user data missing
        console.warn("Telegram data missing. Running in browser mode?");
        setLoading(false);
      }
    } else {
      console.warn("Telegram WebApp script not detected.");
      setLoading(false);
    }
  }, []);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
