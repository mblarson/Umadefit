import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

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
  
  // Acessa a chave diretamente conforme a regra do SDK
  // Criamos a instância sempre dentro da função para pegar o valor mais atualizado
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
    throw new Error("Não conseguimos processar o seu look. Tente tirar uma foto mais clara e de corpo inteiro.");
  } catch (error: any) {
    console.error("Erro técnico:", error);
    
    // Se a chave estiver vazia no erro do SDK
    if (error.message?.includes("API key") || !process.env.API_KEY) {
      throw new Error("O sistema está sincronizando as configurações. Por favor, recarregue a página e tente novamente.");
    }
    
    throw new Error("O servidor de IA está muito ocupado. Tente novamente em 5 segundos.");
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
