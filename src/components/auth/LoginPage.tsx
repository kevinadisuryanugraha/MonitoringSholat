import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mosque } from '../common/MosqueIcon';
import { LogIn, Eye, EyeOff, KeyRound, User, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Harap isi email dan kata sandi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Redirect ke dashboard setelah login berhasil
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Gagal masuk. Periksa kembali email dan kata sandi.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        setError('Email atau kata sandi salah. Silakan coba lagi.');
      } else if (msg.includes('auth/invalid-email')) {
        setError('Format email tidak valid.');
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-800 border-2 border-amber-400/40 mb-4 shadow-lg shadow-teal-950/50">
            <Mosque className="w-10 h-10 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SholTrack</h1>
          <p className="text-xs text-teal-200 mt-1 uppercase tracking-wider font-semibold">
            Sistem Monitoring Ibadah Sholat 5 Waktu
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-teal-950/40 p-8 border border-teal-100">
          <h2 className="text-lg font-bold text-teal-950 mb-1">Masuk ke Sistem</h2>
          <p className="text-xs text-gray-500 mb-6">Silakan login menggunakan akun yang terdaftar</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="nama@pesantren.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm transition-all outline-hidden"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm transition-all outline-hidden"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-amber-300 font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Akun Demo</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-3">
              Gunakan akun demo berikut untuk eksplorasi. <strong>Password:</strong> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-teal-700 font-mono">demo123</code>
            </p>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between bg-teal-50/60 px-3 py-1.5 rounded-lg border border-teal-100">
                <span className="font-semibold text-teal-900">Musyrif</span>
                <code className="text-teal-700 font-mono">musyrif@pesantren.sch.id</code>
              </div>
              <div className="flex items-center justify-between bg-sky-50/60 px-3 py-1.5 rounded-lg border border-sky-100">
                <span className="font-semibold text-sky-900">Wali Kelas</span>
                <code className="text-sky-700 font-mono">walikelas@pesantren.sch.id</code>
              </div>
              <div className="flex items-center justify-between bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-100">
                <span className="font-semibold text-amber-900">Kepala Sekolah</span>
                <code className="text-amber-700 font-mono">kepala@pesantren.sch.id</code>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-teal-300/70 mt-6">
          &copy; {new Date().getFullYear()} SholTrack — Pondok Pesantren & Islamic School
        </p>
      </div>
    </div>
  );
};
