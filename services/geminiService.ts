import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Modelo 2.5 Flash: Focado em velocidade e baixo custo
const MODEL_NAME = 'gemini-2.5-flash-image';

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
  
  if (!apiKey) {
    throw new Error("REAUTH_NEEDED");
  }

  // Sempre cria uma nova instância para garantir que usa a chave mais atual do ambiente
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
    throw new Error("A IA não retornou uma imagem válida. Tente outra foto.");
  } catch (error: any) {
    console.error("Erro no provador 2.5:", error);
    
    // Erros específicos que exigem re-seleção da chave
    if (
      error.message?.includes("API key") || 
      error.message?.includes("Requested entity was not found") ||
      error.message?.includes("not found")
    ) {
      throw new Error("REAUTH_NEEDED");
    }
    
    throw new Error("O servidor está processando muitas imagens. Tente novamente em alguns segundos.");
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
