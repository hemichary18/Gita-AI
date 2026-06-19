import { motion } from 'framer-motion';

export function DynamicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex flex-col items-center justify-center opacity-30 mix-blend-screen">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />

      <div className="relative flex flex-col items-center justify-center w-full h-full scale-[1.5] sm:scale-[2]">
        
        {/* Floating Flute & Peacock Feather */}
        <motion.div 
          animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute z-0 origin-center text-amber-500/50 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]"
        >
          <svg width="400" height="400" viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(-30 100 100)">
              {/* Flute (Bansuri) */}
              <rect x="20" y="90" width="160" height="12" rx="6" fill="currentColor" opacity="0.8" />
              <line x1="30" y1="90" x2="30" y2="102" stroke="#171717" strokeWidth="2" opacity="0.5"/>
              <line x1="35" y1="90" x2="35" y2="102" stroke="#171717" strokeWidth="1" opacity="0.3"/>
              
              {/* Flute Holes */}
              <circle cx="100" cy="96" r="3" fill="#171717" opacity="0.8" />
              <circle cx="120" cy="96" r="3" fill="#171717" opacity="0.8" />
              <circle cx="140" cy="96" r="3" fill="#171717" opacity="0.8" />
              <circle cx="160" cy="96" r="3" fill="#171717" opacity="0.8" />

              {/* Tassels/Strings wrapping flute */}
              <path d="M 45 102 C 50 120, 40 140, 45 150" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 50 102 C 60 115, 50 135, 55 145" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />

              {/* Peacock Feather */}
              <g transform="translate(60, 40) rotate(45)">
                {/* Stem */}
                <path d="M 0 60 Q -5 30, 0 0" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
                {/* Feather Body */}
                <path d="M 0 0 C -25 -20, -15 -45, 0 -60 C 15 -45, 25 -20, 0 0 Z" fill="currentColor" opacity="0.6" />
                {/* Inner Eye (Blue/Green hint, but keeping monochromatic amber here for theme) */}
                <path d="M 0 -15 C -10 -25, -8 -35, 0 -45 C 8 -35, 10 -25, 0 -15 Z" fill="#171717" opacity="0.4" />
                <path d="M 0 -22 C -4 -28, -3 -33, 0 -38 C 3 -33, 4 -28, 0 -22 Z" fill="currentColor" opacity="0.9" />
                {/* Feather Wisps */}
                <path d="M -15 -25 Q -30 -30, -25 -40" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                <path d="M 15 -25 Q 30 -30, 25 -40" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                <path d="M -10 -15 Q -25 -15, -20 -5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
                <path d="M 10 -15 Q 25 -15, 20 -5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
              </g>
            </g>
          </svg>
        </motion.div>

      </div>
    </div>
  );
}
