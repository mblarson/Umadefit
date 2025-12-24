import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

// Diagnóstico silencioso para o desenvolvedor validar no console (F12)
if (typeof process !== 'undefined' && process.env.API_KEY) {
  console.info("UMADEFIT: Motor de IA configurado com sucesso.");
} else {
  console.warn("UMADEFIT: Chave de API não detectada no ambiente. Verifique as variáveis de ambiente do projeto.");
}

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
  
  // Se a chave não existir, lançamos um erro interno que será mascarado na UI
  if (!apiKey || apiKey === "undefined") {
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
    throw new Error("Não foi possível detectar as peças na foto. Tente uma foto com fundo mais claro.");
  } catch (error: any) {
    console.error("Erro na operação:", error);

    // Se for erro de chave/configuração, o usuário vê "Manutenção"
    if (error.message === "INTERNAL_CONFIG_ERROR" || error.message?.includes("API key")) {
      throw new Error("O provador está passando por uma atualização rápida. Por favor, tente novamente em instantes.");
    }
    
    // Para outros erros (timeout, rede, IA ocupada)
    throw new Error("O sistema está processando muitos looks agora. Tente novamente em alguns segundos.");
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
