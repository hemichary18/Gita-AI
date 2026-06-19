import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShlokaCard } from './ShlokaCard';
import { useChatStore } from '../store/useChatStore';
import { api } from '../services/api';
import { Send, Mic, StopCircle } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

export function ChatInterface() {
  const { messages, addMessage, updateLastMessage, setIsProcessing, language, isProcessing } = useChatStore();
  const [inputText, setInputText] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechToText(language);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]); // also scroll if transcript updates

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        submitUserMessage(transcript.trim());
      }
      resetTranscript();
    } else {
      startListening();
    }
  };

  const submitUserMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text
    });

    setIsProcessing(true);

    const krishnaId = (Date.now() + 1).toString();
    addMessage({
      id: krishnaId,
      role: 'krishna',
      content: '',
      isStreaming: true
    });

    try {
      const response = await api.sendMessage(text, language);
      useChatStore.getState().updateLastMessage(response.response, false);
      useChatStore.setState(state => {
        const newMsgs = [...state.messages];
        newMsgs[newMsgs.length - 1].shloka = response.shloka;
        return { messages: newMsgs, detectedEmotion: response.emotion_detected };
      });
    } catch (err) {
      useChatStore.getState().updateLastMessage("I am having trouble hearing you through the noise of the world. Please try again.", false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      submitUserMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-end pb-24 pt-4">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-6 px-2 scroll-smooth hide-scrollbar">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id + index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-3`}>
                <div 
                  className={`p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-amber-600/90 backdrop-blur-sm text-white rounded-br-sm shadow-md shadow-amber-900/20' 
                      : 'bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 text-neutral-200 rounded-bl-sm shadow-md'
                  }`}
                >
                  {msg.isStreaming ? (
                    <div className="flex space-x-2 h-6 items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150" />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-300" />
                    </div>
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>

                {msg.shloka && (
                  <div className="mt-2 w-full max-w-md">
                    <ShlokaCard 
                      chapter={msg.shloka.chapter}
                      verse={msg.shloka.verse}
                      sanskrit={msg.shloka.sanskrit}
                      translation={msg.shloka.translation}
                      explanation=""
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Transcript Preview */}
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full justify-end"
          >
            <div className="max-w-[85%] items-end flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-amber-600/50 backdrop-blur-sm text-white/80 rounded-br-sm border border-amber-500/30">
                <p className="leading-relaxed italic">"{transcript}"</p>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center gap-2">
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Speak to Krishna..."
            disabled={isProcessing || isListening}
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-4 pr-12 py-4 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 backdrop-blur-md transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isProcessing}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-amber-500 hover:text-amber-400 disabled:text-neutral-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
        
        <button 
          onClick={handleToggleMic}
          disabled={isProcessing}
          className={`p-4 rounded-xl flex items-center justify-center transition-all border ${
            isListening 
              ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
              : 'bg-neutral-900/80 text-amber-500 border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800'
          }`}
        >
          {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
        </button>
      </div>
    </div>
  );
}
