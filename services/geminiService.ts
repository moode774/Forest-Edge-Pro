import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const polishText = async (text: string): Promise<string> => {
  if (!text || text.trim().length === 0) return "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Rewrite the following construction submittal remarks to be highly professional, concise, and formal engineering English. Do not add introductory or concluding conversational text, just the polished content: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini enhancement failed:", error);
    return text;
  }
};
