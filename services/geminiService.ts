import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Generate a witty caption for a photo
export const generateSnapCaption = async (base64Image: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Cool Snap! (No API Key)";

  try {
    // Clean base64 string if it contains metadata
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Generate a short, funny, Gen-Z style caption for this Snapchat photo. Use emojis. Keep it under 10 words. Respond in French."
          }
        ]
      }
    });

    return response.text || "Just vibing ✨";
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Error generating caption 🤖";
  }
};

// Chat with "My AI"
export const chatWithGemini = async (message: string, history: string[] = []): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "I need an API key to talk! 🤐";

  try {
    // For simplicity in this demo, we are doing a single turn generation, 
    // but in a real app you'd use chat.sendMessage with history.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful and fun Snapchat AI assistant named "My AI". 
      Keep responses brief and conversational. Language: French.
      User said: ${message}`
    });

    return response.text || "Je ne sais pas quoi dire 🤷‍♂️";
  } catch (error) {
    console.error("Error chatting:", error);
    return "J'ai un petit problème de connexion 🔌";
  }
};
