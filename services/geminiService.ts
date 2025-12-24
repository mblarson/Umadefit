
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Modelo Gemini 2.5 Flash: Eficiente e sem custo elevado
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
  
  // A chave é obtida exclusivamente do ambiente conforme regra do sistema
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Serviço temporariamente indisponível. Tente novamente em instantes.");
  }

  // Inicializa o cliente diretamente na função para garantir acesso à chave atualizada
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
    throw new Error("Não foi possível gerar a prévia. Tente uma foto com fundo mais limpo.");
  } catch (error: any) {
    console.error("Erro Gemini:", error.message);
    throw new Error("Erro na IA: Verifique sua conexão e tente novamente.");
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
