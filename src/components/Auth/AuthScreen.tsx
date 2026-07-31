import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth, authErrorMessage } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-darker bg-white/40 backdrop-blur-2xl shadow-2xl border border-white/50 rounded-[2.5rem] p-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-accent-purple/30 mb-5 overflow-hidden">
            <img src="/files/pennywise-owl-mark.svg" alt="PennyWise" className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">PennyWise</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">
            {mode === 'login' ? 'Sign in to your ledger' : 'Create your ledger account'}
          </p>
        </div>

        <div className="flex p-1.5 glass bg-white/40 rounded-2xl mb-8">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                mode === m ? "bg-white text-accent-purple shadow-lg" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 bg-rose-500/10 text-rose-600 border border-rose-200/50 rounded-xl px-4 py-3 mb-6 text-xs font-bold"
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-400"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-accent-purple text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent-purple/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/40" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Or</span>
          <div className="flex-1 h-px bg-white/40" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full py-4 bg-white/70 hover:bg-white text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 border border-white/50 shadow-sm transition-all disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
};

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
