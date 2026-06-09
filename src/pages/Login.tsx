import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, Loader2, Download } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-2xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100 rotate-6">
            <Download className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Welcome Back</h2>
          <p className="text-gray-500 font-medium mt-1">Log in to your premium account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            Login
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-gray-400 bg-white px-2">OR</div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>

        <p className="text-center text-gray-500 font-medium mt-8">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
