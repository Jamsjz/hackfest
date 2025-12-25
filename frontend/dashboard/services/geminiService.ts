import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. AI features will use mock responses.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateChatResponse = async (
  history: { role: string; text: string }[],
  lastMessage: string,
  context?: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return new Promise((resolve) =>
      setTimeout(() => resolve("नमस्ते! I am running in demo mode. Please configure your API Key to chat with me properly. (कृषिबिद)"), 1000)
    );
  }

  try {
    const model = 'gemini-3-flash-preview';
    let systemInstruction = `You are "कृषिबिद" (Krishibid), a helpful, friendly, and knowledgeable Nepali farming assistant AI (AgriBot). 
    You speak in a mix of English and Nepali (Romanized or Devanagari) to help farmers.
    You provide advice on crops, weather, diseases, and irrigation.
    Keep answers concise and actionable.`;

    if (context) {
      systemInstruction += `\n\nCURRENT CONTEXT (The user is looking at this analysis/report right now):\n${context}\n\nAnswer the user's questions specifically about this context if applicable.`;
    }

    const contents = [
      ...history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] })),
      { role: 'user', parts: [{ text: lastMessage }] }
    ];

    const response = await ai.models.generateContent({
      model,
      contents: contents as any, 
      config: {
        systemInstruction,
      }
    });

    return response.text || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I am having trouble connecting to the satellite. Please try again.";
  }
};

export const analyzeImage = async (
  imageBase64: string,
  type: 'disease' | 'soil'
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(JSON.stringify({
        title: type === 'disease' ? "Leaf Blight (Demo)" : "Sandy Loam (Demo)",
        description: "This is a simulated analysis result because the API Key is missing.",
        recommendation: "Please add a valid API key to get real AI analysis."
      })), 2000)
    );
  }

  try {
    const model = 'gemini-2.5-flash-image';
    const prompt = type === 'disease' 
      ? "Analyze this plant image for diseases. Return a JSON object with keys: title (disease name), description (severity and visual signs), recommendation (treatment). Do not use markdown formatting."
      : "Analyze this soil image. Return a JSON object with keys: title (soil type), description (moisture and texture), recommendation (crops suitable and improvements). Do not use markdown formatting.";

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze image.");
  }
};