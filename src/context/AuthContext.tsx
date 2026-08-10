import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserAccount, UserRole } from '../types';
import { DEMO_USERS, seedInitialData } from '../lib/seedData';
import { clearAllCache } from '../lib/queryCache';

interface AuthContextType {
  currentUser: UserAccount | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  demoRole: UserRole | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchDemoUser: (role: UserRole) => void;
  seedData: () => Promise<boolean>;
  updateUserProfile: (profile: Partial<UserAccount>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SEED_COMPLETE_KEY = 'sholtrack_seed_complete_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Inisialisasi seed data sekali saja (menggunakan localStorage sebagai flag)
  useEffect(() => {
    const initApp = async () => {
      try {
        const alreadySeeded = localStorage.getItem(SEED_COMPLETE_KEY) === 'true';
        if (!alreadySeeded) {
          const seeded = await seedInitialData(false);
          if (seeded) {
            localStorage.setItem(SEED_COMPLETE_KEY, 'true');
          }
        }
      } catch (err) {
        console.warn('Pengecekan seed awal:', err);
      }
    };
    initApp();
  }, []);

  // Pantau perubahan state Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Ambil data user dari Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as UserAccount);
          } else {
            // Buat dokumen user baru jika belum ada di Firestore
            const newUser: UserAccount = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna',
              email: fbUser.email || '',
              role: 'musyrif',
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', fbUser.uid), newUser);
            setCurrentUser(newUser);
          }
          setIsAuthenticated(true);
          setDemoRole(null);
        } catch (error) {
          console.error('Gagal mengambil profil pengguna:', error);
        }
      } else {
        // Tidak ada user Firebase yang login
        setCurrentUser(null);
        setIsAuthenticated(false);
        
        // Demo mode hanya untuk development — fallback jika tidak ada auth
        if (!demoRole) {
          const defaultDemo = DEMO_USERS[0];
          setCurrentUser(defaultDemo);
          setDemoRole('musyrif');
          setIsAuthenticated(true); // Izinkan akses demo tanpa login
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [demoRole]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setDemoRole(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      clearAllCache(); // Bersihkan cache saat user berganti
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    if (firebaseUser) {
      await firebaseSignOut(auth);
    }
    clearAllCache();
    // Reset ke demo musyrif
    setDemoRole('musyrif');
    setCurrentUser(DEMO_USERS[0]);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    await firebaseSendPasswordResetEmail(auth, email);
  };

  const switchDemoUser = (role: UserRole) => {
    setDemoRole(role);
    const target = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(target);
    clearAllCache();
  };

  const seedData = async () => {
    setLoading(true);
    const res = await seedInitialData(true);
    if (res) {
      localStorage.setItem(SEED_COMPLETE_KEY, 'true');
    }
    clearAllCache();
    setLoading(false);
    return res;
  };

  const updateUserProfile = async (profileUpdates: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profileUpdates };
    setCurrentUser(updated);
    try {
      await setDoc(doc(db, 'users', currentUser.id), updated, { merge: true });
    } catch (err) {
      console.error('Gagal menyinkronkan profil pengguna:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      loading,
      isAuthenticated,
      demoRole,
      login,
      logout,
      resetPassword,
      switchDemoUser,
      seedData,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
