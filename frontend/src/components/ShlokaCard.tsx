import { motion } from 'framer-motion';

interface ShlokaCardProps {
  chapter: number;
  verse: number;
  sanskrit: string;
  translation: string;
  explanation: string;
}

export function ShlokaCard({ chapter, verse, sanskrit, translation, explanation }: ShlokaCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/50 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-amber-500 font-semibold tracking-wide text-sm uppercase">
          Chapter {chapter}, Verse {verse}
        </h3>
        <button className="text-neutral-500 hover:text-amber-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        <p className="text-2xl font-serif text-neutral-200 leading-relaxed text-center">
          {sanskrit}
        </p>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
        
        <p className="text-neutral-300 italic leading-relaxed">
          "{translation}"
        </p>

        <div className="bg-neutral-950/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-sm text-neutral-400 leading-relaxed">
            <span className="font-semibold text-neutral-300 block mb-1">Krishna's Guidance:</span>
            {explanation}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
