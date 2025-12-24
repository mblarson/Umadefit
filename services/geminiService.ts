import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

// Silent check for the developer only
const isConfigured = () => typeof process !== 'undefined' && !!process.env.API_KEY;

const toPart = (dataUrl: string) => {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.split(':')[1].split(';')[0];
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
};

export const applyClothingItem = async (
  userImageBase64: string,
  mockupImageBase64: string,
  prompt: string,
  flatArtBase64?: string
): Promise<string | undefined> => {
  
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.error("ERRO CRÍTICO: API_KEY não configurada no ambiente.");
    throw new Error("INTERNAL_CONFIG_ERROR");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [
    toPart(userImageBase64),
    toPart(mockupImageBase64),
    { text: prompt }
  ];

  if (flatArtBase64) {
    parts.push(toPart(flatArtBase64));
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });
    
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Não foi possível processar a imagem. Certifique-se de que você aparece por inteiro na foto.");
  } catch (error: any) {
    if (error.message === "INTERNAL_CONFIG_ERROR") {
      throw new Error("O provador está em manutenção técnica rápida. Tente novamente em alguns minutos.");
    }
    throw new Error("Estamos recebendo muitos acessos! Por favor, tente novamente em alguns segundos.");
  }
};

export const imageUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
