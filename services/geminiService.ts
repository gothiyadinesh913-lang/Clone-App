
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables.
// In a real application, this would be handled securely and not hardcoded.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("API_KEY environment variable not set. Using a mock response.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const systemInstruction = `You are a helpful and friendly support assistant for the 'Multiple App Cloner' Android app. 
Your goal is to answer user questions about the app's features, limitations, and usage. 
Be concise and clear. Do not provide information about real Android development or code. 
Only talk about the features of this specific app. 
Known features include: app cloning, isolated data storage for each clone, separate notifications, custom naming for clones, home screen shortcuts, security lock for the main app and individual clones, and a Pro version for unlimited clones and ad removal.
Known limitations: some apps like banking or DRM-protected apps might not work when cloned due to their own security measures, and the app warns users about this before cloning. The app does not and will not bypass these security measures.`;


export const getHelpResponse = async (prompt: string): Promise<string> => {
  if (!ai) {
    // Return a mock response if the API key is not available
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("This is a mock response. To use the AI assistant, please provide a valid API key. You asked: '" + prompt + "'");
      }, 1000);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 1,
        topK: 32,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get response from AI assistant.");
  }
};
