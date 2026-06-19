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
  async sendMessage(_message: string, _language: SupportedLanguage): Promise<ChatResponse> {
    try {
      // Stub implementation until FastAPI is ready
      // const res = await fetch(`${API_BASE_URL}/chat`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message, language })
      // });
      // if (!res.ok) throw new Error('Failed to send message');
      // return await res.json();

      // Simulated network delay for testing frontend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        response: "Do not let the temporary nature of this world disturb your peace. Focus on your duty, and leave the results to me.",
        emotion_detected: "Anxiety",
        shloka: {
          chapter: 2,
          verse: 47,
          sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
          translation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action."
        }
      };
    } catch (error) {
      console.error("Chat API Error:", error);
      throw error;
    }
  }
};
