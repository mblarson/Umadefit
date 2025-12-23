import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedImagePart } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image'; // Using flash-image for good balance of speed and capability
const GENERATE_CONTENT_TIMEOUT_MS = 60000; // 60 seconds

const initGemini = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not defined. Please ensure it's set in your environment variables.");
    throw new Error("API_KEY is not defined.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to extract MIME type and base64 data from a data URL (e.g., "data:image/png;base64,...")
const parseDataUrl = (dataUrl: string) => {
  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    throw new Error('Invalid data URL format.');
  }
  const meta = parts[0].split(';');
  const mimeType = meta[0].split(':')[1]; // Extracts "image/png" from "data:image/png"
  const data = parts[1]; // The actual base64 encoded data
  return { mimeType, data };
};

// Helper to fetch an image URL and convert it to a base64 data URL
export const imageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read blob as data URL.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const applyClothingItem = async (
  currentImageBase64: string,
  clothingItemImageBase64: string,
  promptText: string,
  flatArtImageBase64?: string, // Novo parâmetro opcional para a arte da estampa
): Promise<string | undefined> => {
  const ai = initGemini();

  // Dynamically extract MIME type and data from the data URLs
  const { mimeType: userImageMimeType, data: userImageData } = parseDataUrl(currentImageBase64);
  const { mimeType: clothingImageMimeType, data: clothingImageData } = parseDataUrl(clothingItemImageBase64);

  const contentsParts: any[] = [ // Usar 'any[]' para flexibilidade ao adicionar partes
    {
      inlineData: {
        mimeType: userImageMimeType,
        data: userImageData,
      },
    },
    {
      inlineData: {
        mimeType: clothingImageMimeType,
        data: clothingImageData,
      },
    },
    { text: promptText },
  ];

  if (flatArtImageBase64) {
    const { mimeType: flatArtMimeType, data: flatArtData } = parseDataUrl(flatArtImageBase64);
    contentsParts.push({
      inlineData: {
        mimeType: flatArtMimeType,
        data: flatArtData,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await Promise.race([
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: contentsParts,
        },
        config: {
          // No responseMimeType or responseSchema for image models
          // No thinkingConfig needed unless very complex reasoning is required, prioritize speed
        },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('API request timed out')), GENERATE_CONTENT_TIMEOUT_MS))
    ]);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image found in Gemini response.');
  } catch (error) {
    console.error("Error applying clothing item:", error);
    throw error;
  }
};

// Helper for image upload, just converts to base64
export const processUploadedImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};