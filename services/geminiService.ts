import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Modelo Flash: Ideal para alta demanda, rápido e estável
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
    throw new Error("Conecte sua chave do Google AI Studio para ativar o motor de teste.");
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
          // imageSize removido para compatibilidade com o modelo Flash
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
    throw new Error("A IA não conseguiu processar a imagem. Tente uma foto mais clara e de frente.");
  } catch (error: any) {
    console.error("Erro na geração Flash:", error);
    throw new Error("Falha no processamento: " + (error.message || "Tente novamente em instantes."));
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
