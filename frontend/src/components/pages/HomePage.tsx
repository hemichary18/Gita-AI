import { motion } from 'framer-motion';
import { Play, MessageCircle, Library as LibraryIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function HomePage() {
  const { user, setTab } = useAuthStore();
  const name = user?.name || (user?.gender === 'female' ? 'Sakhi' : 'Parth');

  return (
    <div className="flex flex-col gap-6 pt-4 pb-24 h-full overflow-y-auto hide-scrollbar">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 px-2"
      >
        <h1 className="text-3xl font-serif text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          Welcome back, {name}.
        </h1>
        <p className="text-neutral-400 font-medium">Your daily verse awaits.</p>
      </motion.div>

      {/* Verse of the Day Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-neutral-900/50 backdrop-blur-md border border-orange-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.05)] overflow-hidden"
      >
        {/* Subtle background glow inside card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-500/80">Verse of the Day • Ch 2, Sh 47</span>
          <button className="p-2 rounded-full bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-all">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </button>
        </div>

        <p className="text-xl sm:text-2xl font-serif text-amber-50 mb-4 leading-relaxed">
          कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।<br/>
          मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
        </p>
        
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed border-l-2 border-orange-500/30 pl-4">
          "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction."
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <button 
          onClick={() => setTab('chat')}
          className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/60 transition-all group"
        >
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
            <MessageCircle size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-neutral-200">Start New Dialogue</h3>
            <p className="text-xs text-neutral-500">Speak with Krishna</p>
          </div>
        </button>

        <button 
          onClick={() => setTab('library')}
          className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-800/60 transition-all group"
        >
          <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
            <LibraryIcon size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-neutral-200">Explore the Granth</h3>
            <p className="text-xs text-neutral-500">Read the chapters</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
