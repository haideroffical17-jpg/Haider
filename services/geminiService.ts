import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image using Gemini 2.5 Flash Image model.
 * 
 * @param prompt The text description for the image.
 * @param settings Configuration for the generation.
 * @returns A promise that resolves to the base64 image URL or throws an error.
 */
export const generateImage = async (
  prompt: string,
  settings: GenerationSettings
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
        },
      },
    });

    // Iterate through parts to find the image data
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64EncodeString = part.inlineData.data;
            // Assuming PNG based on typical Gemini output, but it could vary.
            // The MIME type is usually provided in inlineData.mimeType
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${base64EncodeString}`;
          }
        }
      }
    }

    throw new Error("No image data found in the response.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};
