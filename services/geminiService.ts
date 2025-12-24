import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Modelo Flash 2.5: Rápido, eficiente e ideal para evitar custos elevados
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
  
  // Inicializa o SDK com a chave do ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
          // imageSize não é suportado no modelo 2.5 Flash, removido para evitar erros
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
    throw new Error("Não foi possível gerar a prévia. Tente uma foto com fundo mais simples.");
  } catch (error: any) {
    console.error("Erro Gemini 2.5:", error);
    
    // Se a chave não for encontrada ou der erro de entidade, solicita re-autenticação
    if (error.message?.includes("entity was not found") || error.message?.includes("API key")) {
      throw new Error("REAUTH_NEEDED");
    }
    
    throw new Error("O sistema de IA está processando muitas requisições. Aguarde um instante.");
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
