import { ReactNode } from 'react';
import { Home, MessageCircle, Library as LibraryIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { HomePage } from '../pages/HomePage';
import { LibraryPage } from '../pages/LibraryPage';
import { ChatInterface } from '../ChatInterface';
import { DynamicBackground } from '../DynamicBackground';
import { motion, AnimatePresence } from 'framer-motion';

export function MainLayout() {
  const { user, currentTab, setTab, logout } = useAuthStore();

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <HomePage />;
      case 'library': return <LibraryPage />;
      case 'chat': return <ChatInterface />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 overflow-hidden">
      <DynamicBackground />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="font-serif font-bold text-lg text-white">G</span>
            </div>
            <span className="font-bold tracking-widest text-sm text-neutral-200">GITA AI</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={logout} className="text-neutral-500 hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
            <div className="w-10 h-10 rounded-full border border-amber-500/30 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center text-amber-500">
              {user?.gender === 'female' ? (
                // Minimal Lotus SVG for Seeker
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c-4-4-8-9-8-14 0-2 2-4 4-4s4 2 4 4c0-2 2-4 4-4s4 2 4 4c0 5-4 10-8 14z" />
                  <path d="M12 22V12" />
                  <path d="M12 22c-2-3-4-6-4-10 0-1 1-2 2-2s2 1 2 2" />
                  <path d="M12 22c2-3 4-6 4-10 0-1-1-2-2-2s-2 1-2 2" />
                </svg>
              ) : (
                // Minimal Bow SVG for Warrior
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 18 0" />
                  <path d="M3 12c0 2.5 4 4.5 9 4.5s9-2 9-4.5" />
                  <line x1="12" y1="3" x2="12" y2="16.5" />
                  <path d="M10 3l2 -2 2 2" />
                </svg>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content Area */}
        <main className="flex-1 overflow-hidden px-4 sm:px-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Bottom Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[280px] z-50">
          <div className="flex items-center justify-between px-6 py-3 rounded-full bg-neutral-950/60 backdrop-blur-xl border border-neutral-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setTab('home')}
              className={`p-2 transition-all duration-300 ${currentTab === 'home' ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Home size={22} />
            </button>
            <button 
              onClick={() => setTab('chat')}
              className={`p-2 transition-all duration-300 ${currentTab === 'chat' ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <MessageCircle size={22} />
            </button>
            <button 
              onClick={() => setTab('library')}
              className={`p-2 transition-all duration-300 ${currentTab === 'library' ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <LibraryIcon size={22} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
