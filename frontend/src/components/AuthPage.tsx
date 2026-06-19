import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import type { Gender } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { DynamicBackground } from './DynamicBackground';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        const userMeta = data.user.user_metadata;
        const finalName = userMeta.name || email.split('@')[0];
        const finalGender = userMeta.gender || 'male';

        login({ id: data.user.id, name: finalName, email, gender: finalGender });
        useChatStore.getState().initializeGreeting(finalName, finalGender);
      } else {
        // --- SIGNUP ---
        const finalName = name.trim() === '' ? (gender === 'male' ? 'Parth' : 'Sakhi') : name;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: finalName,
              gender
            }
          }
        });
        if (error) throw error;

        // Ensure user is created
        if (!data.user) throw new Error("Could not create user account.");

        // Insert into public.users table
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              preferred_language: 'en',
              voice_enabled: true,
              notification_enabled: true
            }
          ]);
        
        if (dbError) {
          console.warn("Failed to insert into public users table:", dbError.message);
          // We won't block login if this fails, but it's good to log.
        }

        login({ id: data.user.id, name: finalName, email, gender });
        useChatStore.getState().initializeGreeting(finalName, gender);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-neutral-950 overflow-hidden font-sans text-neutral-200">
      <DynamicBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-2xl flex flex-col justify-center p-6 sm:p-12"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <span className="font-serif font-bold text-3xl text-white">G</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
            {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
          </h2>
          <p className="text-sm font-medium text-amber-500/80 uppercase tracking-widest mt-1">
            GitaAI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                {/* Gender Toggle */}
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`px-6 py-2 rounded-full border transition-all ${
                      gender === 'male' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    O Warrior
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`px-6 py-2 rounded-full border transition-all ${
                      gender === 'female' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    O Seeker
                  </button>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400">
                    {gender === 'male' ? 'Enter your name, O warrior...' : 'Enter your name, O seeker...'}
                  </label>
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={gender === 'male' ? 'e.g., Parth' : 'e.g., Sakhi'}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">
              Where shall I send my eternal echo? (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., seeker@world.com"
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">
              Your secret key to mindfulness (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-medium tracking-wide shadow-lg shadow-amber-500/25 transition-all transform flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Resume Dialogue' : 'Enter the Chariot'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-neutral-500 hover:text-amber-500 transition-colors"
          >
            {isLogin ? 'New to this realm? Sign up instead' : 'Already journeying? Login here'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
