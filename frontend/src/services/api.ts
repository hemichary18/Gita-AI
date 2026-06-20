import type { SupportedLanguage } from '../store/useChatStore';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'; 


export interface ChatResponse {
  response: string;
  emotion_detected: string;
  shloka?: {
    chapter: number;
    verse: number;
    sanskrit: string;
    translation: string;
  };
}

export const api = {
  async sendMessage(message: string, language: SupportedLanguage): Promise<ChatResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message, language })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return await res.json();
    } catch (error) {
      console.error("Chat API Error:", error);
      throw error;
    }
  }
};
