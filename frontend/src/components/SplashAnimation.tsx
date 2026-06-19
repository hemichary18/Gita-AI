import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { DynamicBackground } from './DynamicBackground';

interface SplashAnimationProps {
  onComplete: () => void;
}

export function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const user = useAuthStore(state => state.user);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show the button after the text finishes rendering (about 4 seconds)
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    if (user?.gender === 'female') {
      const name = user.name || 'Sakhi';
      return `Welcome, ${name}. The journey inward requires courage, and your quest for truth begins now. Speak to Me; what clouds your vision?`;
    } else {
      const name = user.name || 'Parth';
      return `Welcome, ${name}. The battlefield of the mind is vast, but you do not stand alone. Speak to Me; what weighs heavy upon your heart?`;
    }
  };

  const text = getGreeting();
  // Split text into words for a staggered blur fade-in
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.5 },
    },
  };

  const wordAnim = {
    hidden: { opacity: 0, filter: 'blur(10px)', y: 10 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 1.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 px-6 sm:px-12"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <DynamicBackground />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-2xl sm:text-4xl font-serif leading-relaxed text-amber-100 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          {words.map((word, index) => (
            <motion.span key={index} variants={wordAnim} className="inline-block mr-[0.3em]">
              {word}
            </motion.span>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          onClick={onComplete}
          disabled={!showButton}
          className={`mt-16 px-8 py-3 rounded-full border border-amber-500/50 text-amber-400 font-medium tracking-wide transition-all duration-500 ${showButton ? 'hover:bg-amber-500 hover:text-neutral-950 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer' : 'cursor-default pointer-events-none'}`}
        >
          Seek Guidance
        </motion.button>
      </div>
    </motion.div>
  );
}
