import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { SaarthiLogo } from './SaarthiLogo';
import { X, Mail, Lock, User, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  onSuccess: (userId: string) => void;
  theme?: 'dark' | 'light';
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, theme = 'dark' }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        onSuccess(userCredential.user.uid);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user.uid);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-1000",
      theme === 'dark' ? "bg-black" : "bg-slate-50"
    )}>
      {/* Ambience */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className={cn("absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]", theme === 'dark' ? "bg-emerald-500/30" : "bg-emerald-200/50")} />
        <div className={cn("absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]", theme === 'dark' ? "bg-blue-500/20" : "bg-blue-200/40")} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <SaarthiLogo size={80} className="mx-auto mb-6" />
          <h2 className={cn("text-3xl font-black italic uppercase tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
            {mode === 'login' ? 'Welcome Back' : 'Join Saarthi'}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-2">Personal Decision Intelligence</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full pl-12 pr-4 py-4 rounded-2xl border bg-transparent font-bold transition-all outline-none",
                    theme === 'dark' ? "border-white/10 text-white focus:border-emerald-500/50" : "border-slate-200 text-slate-900 focus:border-emerald-500"
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-4 rounded-2xl border bg-transparent font-bold transition-all outline-none",
                theme === 'dark' ? "border-white/10 text-white focus:border-emerald-500/50" : "border-slate-200 text-slate-900 focus:border-emerald-500"
              )}
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-4 rounded-2xl border bg-transparent font-bold transition-all outline-none",
                theme === 'dark' ? "border-white/10 text-white focus:border-emerald-500/50" : "border-slate-200 text-slate-900 focus:border-emerald-500"
              )}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold italic px-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-5 rounded-2xl font-black italic uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50",
              theme === 'dark' ? "bg-white text-black hover:bg-emerald-400" : "bg-slate-900 text-white hover:bg-emerald-600"
            )}
          >
            {loading ? <RefreshCw className="w-6 h-6 animate-spin mx-auto" /> : mode === 'login' ? 'INITIALIZE SESSION' : 'CREATE PROTOCOL'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-6">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors block w-full",
              theme === 'dark' ? "text-zinc-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
            )}
          >
            {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>

          <div className="pt-6 border-t dark:border-white/5 border-slate-200">
             <button
               onClick={() => {
                 setEmail('test@saarthi.ai');
                 setPassword('123456');
                 setMode('login');
               }}
               className={cn(
                 "w-full py-4 rounded-2xl border bg-emerald-500/5 text-emerald-500 font-black italic uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 transition-all border-emerald-500/20",
               )}
             >
               Start Demo Protocol (test@saarthi.ai)
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
