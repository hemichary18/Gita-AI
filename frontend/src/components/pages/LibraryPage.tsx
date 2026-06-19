import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import gitaVerses from '../../data/bhagavad_gita.json';

const AVAILABLE_GRANTHS = [
  {
    id: 'gita',
    title: 'Bhagavad Gita',
    subtitle: 'श्रीमद्भगवद्गीता',
    description: 'The eternal song of God, spanning 18 chapters and 700 verses of divine dialogue.',
    coverColor: 'from-amber-800 to-amber-950',
    borderColor: 'border-orange-600/30',
  },
  {
    id: 'upanishad',
    title: 'Principal Upanishads',
    subtitle: 'उपनिषद्',
    description: 'Philosophical texts exploring the ultimate nature of reality and the absolute soul. (Coming Soon)',
    coverColor: 'from-stone-800 to-stone-950',
    borderColor: 'border-amber-700/20',
  }
];

export function LibraryPage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [currentSheet, setCurrentSheet] = useState(0);

  const activeBookData = AVAILABLE_GRANTHS.find(b => b.id === selectedBook);

  // Parse chapters from JSON
  const gitaChapters = useMemo(() => {
    const chapters: { id: number, verses: any[] }[] = [];
    (gitaVerses as any[]).forEach(v => {
      let chapter = chapters.find(c => c.id === v.chapter_id);
      if (!chapter) {
        chapter = { id: v.chapter_id, verses: [] };
        chapters.push(chapter);
      }
      chapter.verses.push(v);
    });
    return chapters;
  }, []);

  // Generate dynamic sheets
  const { sheets, chapterMap } = useMemo(() => {
    if (selectedBook !== 'gita') return { sheets: [], chapterMap: {} };
    
    const generatedSheets: any[] = [];
    const chMap: Record<number, number> = {};

    // 1. Compile pages sequentially
    const pages: any[] = [];
    gitaChapters.forEach((chapter) => {
      pages.push({ type: 'chapter_title', chapterId: chapter.id });
      chapter.verses.forEach(verse => {
        pages.push({ type: 'verse', data: verse });
      });
    });

    // We know Sheet 0 is the Cover + Index
    // So the actual text pages start at Sheet 1.
    for (let i = 0; i < pages.length; i += 2) {
      const sheetIndex = Math.floor(i / 2) + 1;
      
      const p1 = pages[i];
      const p2 = pages[i + 1] || null;

      if (p1.type === 'chapter_title') chMap[p1.chapterId] = sheetIndex;
      else if (p2 && p2.type === 'chapter_title') chMap[p2.chapterId] = sheetIndex;
    }

    // Sheet 0: Cover & Index
    generatedSheets.push({
      frontClass: `bg-gradient-to-br ${activeBookData?.coverColor} rounded-r shadow-2xl border-l-4 border-orange-500 p-5 flex flex-col justify-between text-center`,
      frontContent: (
        <div className="border border-amber-500/20 rounded-lg h-full w-full flex flex-col justify-between p-4">
          <div className="text-xs text-orange-400 tracking-widest font-bold">{activeBookData?.subtitle}</div>
          <div className="text-4xl drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] text-orange-500 font-serif my-auto">ॐ</div>
          <span className="text-[10px] text-neutral-400 font-medium tracking-wider animate-pulse">TAP TO FLIP OPEN</span>
        </div>
      ),
      backClass: "bg-[#f2e7c9] text-neutral-900 rounded-l p-4 sm:p-6 shadow-inner border-r border-neutral-300",
      backContent: (
        <div className="h-full flex flex-col pb-4">
          <div className="text-[10px] font-bold tracking-wider text-orange-800 bg-orange-800/10 px-2 py-0.5 rounded inline-block mb-4 w-max">INDEX</div>
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pr-2">
            {gitaChapters.map(c => (
              <div 
                key={c.id} 
                onClick={(e) => { e.stopPropagation(); setCurrentSheet(chMap[c.id]); }}
                className="flex items-center justify-between hover:text-orange-700 cursor-pointer border-b border-orange-800/10 pb-1 text-xs font-serif font-medium"
              >
                <span>Chapter {c.id}</span>
                <span className="text-[9px] text-neutral-500">Go ➔</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-neutral-500 text-center italic mt-4">Page 1</p>
        </div>
      )
    });

    // Render helper
    const renderPage = (page: any, pageNum: number) => {
      if (!page) return <div className="h-full flex flex-col"><div className="flex-1"></div><p className="text-[9px] text-neutral-500 text-center italic mt-auto">Page {pageNum}</p></div>;
      
      if (page.type === 'chapter_title') {
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 relative">
            <div className="w-12 h-12 rounded-full border border-orange-800/20 flex items-center justify-center mb-6">
              <span className="text-xl text-orange-800 font-serif">ॐ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-orange-800 mb-2">Chapter {page.chapterId}</h2>
            <div className="w-16 h-px bg-orange-800/30 mt-4"></div>
            <p className="text-[9px] text-neutral-500 text-center italic absolute bottom-4">Page {pageNum}</p>
          </div>
        );
      }
      
      if (page.type === 'verse') {
        return (
          <div className="h-full flex flex-col p-2 sm:p-4">
            <div className="text-[10px] font-bold text-orange-800 mb-3 border-b border-orange-800/10 pb-1 w-max">
              CH {page.data.chapter_id} • VERSE {page.data.verse_number}
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
              <div className="text-base sm:text-lg font-serif text-neutral-900 text-center leading-relaxed">
                {page.data.sanskrit.split('\n').map((line: string, idx: number) => <div key={idx}>{line}</div>)}
              </div>
              <div className="text-[10px] sm:text-xs text-neutral-600 italic text-center font-medium bg-orange-800/[0.03] p-2 rounded">
                {page.data.transliteration}
              </div>
              <div className="text-xs text-neutral-800 leading-relaxed font-serif text-justify">
                {page.data.translation}
              </div>
            </div>
            <p className="text-[9px] text-neutral-500 text-center italic mt-3 pt-2 border-t border-neutral-300">Page {pageNum}</p>
          </div>
        );
      }
    };

    // Subsequent Sheets (Verses)
    for (let i = 0; i < pages.length; i += 2) {
      generatedSheets.push({
        frontClass: "bg-[#f4ebc9] text-neutral-900 rounded-r shadow-inner border-l border-neutral-300",
        frontContent: renderPage(pages[i], i + 2),
        backClass: "bg-[#f2e7c9] text-neutral-900 rounded-l shadow-inner border-r border-neutral-300",
        backContent: renderPage(pages[i + 1], i + 3)
      });
    }

    return { sheets: generatedSheets, chapterMap: chMap };
  }, [selectedBook, gitaChapters, activeBookData]);


  return (
    <div className="w-full h-full flex flex-col pt-4 pb-24 overflow-y-auto hide-scrollbar">
      {!selectedBook ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-serif text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">Sacred Granths</h2>
            <p className="text-sm text-neutral-400 mt-1">Select a text to open the eternal vault of wisdom.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {AVAILABLE_GRANTHS.map((granth) => (
              <div 
                key={granth.id}
                onClick={() => { 
                  if (granth.id === 'gita') {
                    setSelectedBook(granth.id); 
                    setCurrentSheet(0); 
                  }
                }}
                className={`group relative flex gap-5 bg-neutral-900/40 backdrop-blur-sm p-5 rounded-2xl border border-neutral-800/60 transition-all duration-300 ${granth.id === 'gita' ? 'hover:border-orange-500/30 cursor-pointer hover:shadow-xl hover:shadow-orange-500/[0.05]' : 'opacity-50 grayscale cursor-not-allowed'}`}
              >
                <div className={`w-24 h-36 flex-shrink-0 bg-gradient-to-br ${granth.coverColor} rounded-r-lg border-l-4 border-orange-500 shadow-2xl flex flex-col justify-between p-3 text-center transition-transform group-hover:scale-[1.03]`}>
                  <div className="text-[10px] font-bold text-orange-400/80 tracking-widest">{granth.subtitle}</div>
                  <div className="text-amber-100/20 text-xl font-serif">ॐ</div>
                  <BookOpen className="h-4 w-4 mx-auto text-amber-500/40" />
                </div>

                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-base font-medium text-neutral-200 group-hover:text-orange-400 transition-colors">
                      {granth.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed line-clamp-3">
                      {granth.description}
                    </p>
                  </div>
                  <div className="flex items-center text-[11px] text-orange-500 font-medium tracking-wide mt-3">
                    {granth.id === 'gita' ? 'Open Text' : 'Locked'} <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="space-y-6 flex-1 flex flex-col h-full"
        >
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setSelectedBook(null); setCurrentSheet(0); }}
              className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200 transition-colors bg-neutral-900/60 border border-neutral-800 px-3 py-1.5 rounded-xl"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Vault
            </button>
            <span className="text-xs font-bold tracking-widest text-orange-500">{activeBookData?.title.toUpperCase()}</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-10 perspective-1000 bg-neutral-900/20 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-inner overflow-hidden relative min-h-[500px]">
            
            <div 
              className={`relative w-[280px] sm:w-[320px] h-[400px] sm:h-[480px] transition-transform duration-700 ${
                currentSheet > 0 ? 'translate-x-1/4 sm:translate-x-40' : ''
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-[#f4ebc9] rounded-r-lg shadow-inner border-l border-neutral-300 z-0"></div>

              {sheets.map((sheet, i) => {
                // VIRTUAL PAGINATION LOGIC (Render only nearby sheets for 60FPS)
                const distance = Math.abs(currentSheet - i);
                const isVisible = distance <= 2 || i === 0 || i === sheets.length - 1;
                if (!isVisible) return null;

                const isFlipped = currentSheet > i;
                const zIndex = isFlipped ? i : sheets.length - i;
                
                return (
                  <div 
                    key={i}
                    className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-3d origin-left ${isFlipped ? 'rotate-y-180' : ''}`}
                    style={{ zIndex }}
                  >
                    <div 
                      onClick={() => { if (!isFlipped) setCurrentSheet(i + 1); }}
                      className={`absolute inset-0 w-full h-full backface-hidden cursor-pointer ${sheet.frontClass}`}
                    >
                      {sheet.frontContent}
                    </div>
                    
                    <div 
                      onClick={() => { if (isFlipped) setCurrentSheet(i); }}
                      className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 cursor-pointer ${sheet.backClass}`}
                    >
                      {sheet.backContent}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentSheet > 0 && (
              <div className="absolute bottom-4 flex items-center justify-center gap-8 w-full">
                <button 
                  onClick={() => setCurrentSheet(Math.max(0, currentSheet - 1))}
                  className="px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all text-xs flex items-center gap-2 backdrop-blur-md"
                >
                  <ArrowLeft className="h-3 w-3" /> Prev Page
                </button>
                <div className="text-[10px] text-neutral-500 font-mono tracking-widest">{currentSheet} / {sheets.length - 1}</div>
                <button 
                  onClick={() => setCurrentSheet(Math.min(sheets.length, currentSheet + 1))}
                  className="px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-orange-500 hover:border-orange-500/50 transition-all text-xs flex items-center gap-2 backdrop-blur-md"
                >
                  Next Page <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
