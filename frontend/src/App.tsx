import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/useAuthStore';
import { SplashAnimation } from './components/SplashAnimation';
import { AuthPage } from './components/AuthPage';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  const { isAuthenticated, isInitialized, initAuth } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashAnimation onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className={`transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        {!showSplash && <MainLayout />}
      </div>
    </>
  );
}

export default App;
