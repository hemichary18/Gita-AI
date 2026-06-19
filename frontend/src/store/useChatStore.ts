import { create } from 'zustand';

export interface Shloka {
  chapter: number;
  verse: number;
  sanskrit: string;
  translation: string;
}

export interface Message {
  id: string;
  role: 'user' | 'krishna';
  content: string;
  shloka?: Shloka;
  isStreaming?: boolean;
}

export type SupportedLanguage = 'en' | 'hi' | 'sa' | 'gu' | 'ta';

interface ChatState {
  messages: Message[];
  detectedEmotion: string | null;
  language: SupportedLanguage;
  isListening: boolean;
  isProcessing: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string, isStreaming?: boolean) => void;
  setEmotion: (emotion: string) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setIsListening: (listening: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  initializeGreeting: (name: string, gender: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [], // Starts empty, populated by initializeGreeting
  detectedEmotion: null,
  language: 'en',
  isListening: false,
  isProcessing: false,

  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (content, isStreaming = false) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1].content = content;
        messages[messages.length - 1].isStreaming = isStreaming;
      }
      return { messages };
    }),

  setEmotion: (emotion) => set({ detectedEmotion: emotion }),
  setLanguage: (lang) => set({ language: lang }),
  setIsListening: (listening) => set({ isListening: listening }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  initializeGreeting: (name, gender) => {
    // Thematic title if they didn't provide a name, or append to name
    const title = name ? name : (gender === 'male' ? 'Parth' : 'Sakhi');
    const greeting = `Welcome, ${title}. Speak to Me; what weighs heavy upon your heart?`;
    set({
      messages: [
        {
          id: '1',
          role: 'krishna',
          content: greeting,
        }
      ]
    });
  },

  clearChat: () => set({ 
    messages: [], // Should ideally re-initialize, but leaving empty for now
    detectedEmotion: null 
  }),
}));
