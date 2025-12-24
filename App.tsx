import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, TshirtItem, Outfit } from './types';
import { applyClothingItem, imageUrlToBase64 } from './services/geminiService';
import ImageUpload from './components/ImageUpload';
import TshirtSelection from './components/TshirtSelection';
import ResultScreen from './components/ResultScreen';
import LoadingSpinner from './components/LoadingSpinner';
import Button from './Button';

// O ambiente fornece o objeto aistudio para gerenciar chaves de forma segura
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const mockTshirts: TshirtItem[] = [
  { 
    id: 'tshirt-1', 
    name: 'Camiseta Laranja', 
    type: 'tshirt',
    mockupUrl: 'https://raw.githubusercontent.com/mblarson/sistemapresenca/main/laranjamockpfrente.png',
    flatArtUrl: 'https://raw.githubusercontent.com/mblarson/sistemapresenca/main/laranjaartefrente.png',
  },
  { 
    id: 'tshirt-2', 
    name: 'Camiseta Verde', 
    type: 'tshirt',
    mockupUrl: 'https://raw.githubusercontent.com/mblarson/sistemapresenca/main/frenteverde.png',
    flatArtUrl: 'https://raw.githubusercontent.com/mblarson/sistemapresenca/main/imagemfrenteverde (1).png',
  },
];

const LOADING_MESSAGES = [
  "Conectando ao Gemini 2.5 Flash...",
  "Tecendo o manto do Jubileu...",
  "Ajustando reflexos dourados...",
  "Finalizando sua simulação...",
];

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD_PHOTO);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | undefined>(undefined);
  const [virtualTryonImageBase64, setVirtualTryonImageBase64] = useState<string | undefined>(undefined);
  const [outfit, setOutfit] = useState<Outfit>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isKeySelected, setIsKeySelected] = useState<boolean>(true);

  // Verifica a chave ao carregar e quando houver erro de autenticação
  const checkApiKeyStatus = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(hasKey);
      return hasKey;
    }
    return true; // Se não houver helper, assume que process.env.API_KEY está disponível
  }, []);

  useEffect(() => {
    checkApiKeyStatus();
  }, [checkApiKeyStatus]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      let i = 0;
      interval = window.setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[i]);
      }, 2000); 
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Após abrir o seletor, assumimos sucesso para prosseguir
      setIsKeySelected(true);
      setErrorMessage(undefined);
    }
  };

  const resetAppState = useCallback(() => {
    setCurrentStep(AppStep.UPLOAD_PHOTO);
    setUserPhotoBase64(undefined);
    setVirtualTryonImageBase64(undefined);
    setOutfit({});
    setIsLoading(false);
    setErrorMessage(undefined);
  }, []);

  const handleSelectTshirt = async (selectedTshirt: TshirtItem) => {
    if (!userPhotoBase64) return;

    setIsLoading(true);
    setErrorMessage(undefined);
    setOutfit(prev => ({ ...prev, tshirt: selectedTshirt }));

    try {
      const mockupBase64 = await imageUrlToBase64(selectedTshirt.mockupUrl);
      const flatArtBase64 = await imageUrlToBase64(selectedTshirt.flatArtUrl);

      const prompt = `Virtual Clothing Try-On Simulation using Gemini 2.5 Flash:
        1. Identify the person in the user photo.
        2. Replace their upper body clothing with the provided t-shirt mockup.
        3. Match the pose, body shape, and shadows perfectly.
        4. Ensure the gold logo from the art is clearly visible on the chest.
        5. Photorealistic output only.`;

      const result = await applyClothingItem(userPhotoBase64, mockupBase64, prompt, flatArtBase64);
      if (result) setVirtualTryonImageBase64(result);
    } catch (error: any) {
      if (error.message === "REAUTH_NEEDED") {
        setIsKeySelected(false);
        setErrorMessage("A conexão com o Google Cloud precisa ser renovada.");
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isKeySelected) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-tr from-yellow-500 to-orange-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-orange-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter mb-4 uppercase leading-none">ATIVAR ACESSO GOOGLE</h2>
          <p className="text-gray-400 text-sm mb-10 leading-relaxed">
            Para usar o motor <strong>Gemini 2.5 Flash</strong> sem custos, você precisa autorizar a conexão com sua chave de API do Google Cloud.
          </p>
          <Button onClick={handleOpenKeySelector} fullWidth size="lg">
            Sincronizar Chave de API
          </Button>
          <p className="mt-8 text-[9px] text-gray-700 uppercase tracking-widest font-black">UMADEMATS • EDIÇÃO DE OURO</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center">
      <header className="w-full max-w-2xl px-6 py-5 flex items-center justify-center border-b border-white/5 bg-gray-950/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-yellow-500 via-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-600/30">U</div>
          <div className="text-center">
            <h1 className="text-xl font-black leading-none tracking-tighter italic">UMADEFIT</h1>
            <p className="text-[10px] text-yellow-500 uppercase tracking-[0.3em] font-bold mt-1">Jubileu de Ouro</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-950/90 z-[100] backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
            <LoadingSpinner message={loadingMessage} />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {errorMessage && (
            <div className="mx-6 mt-6 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center animate-in slide-in-from-top duration-500">
              <span className="text-3xl block mb-3">⚠️</span>
              <p className="font-bold text-red-400">{errorMessage}</p>
              <Button onClick={() => checkApiKeyStatus()} variant="outline" size="sm" className="mt-4">Tentar Reconectar</Button>
            </div>
          )}

          {currentStep === AppStep.UPLOAD_PHOTO && (
            <ImageUpload 
              onPhotoUpload={(img) => { setUserPhotoBase64(img); setCurrentStep(AppStep.SELECT_T_SHIRT); }} 
              isLoading={isLoading} 
            />
          )}
          {currentStep === AppStep.SELECT_T_SHIRT && (
            <TshirtSelection 
              tshirts={mockTshirts}
              selectedTshirt={outfit.tshirt}
              onSelectTshirt={handleSelectTshirt}
              onContinue={() => setCurrentStep(AppStep.SHOW_RESULT)}
              isLoading={isLoading}
              virtualTryonImageBase64={virtualTryonImageBase64}
              errorMessage={errorMessage}
            />
          )}
          {currentStep === AppStep.SHOW_RESULT && virtualTryonImageBase64 && (
            <ResultScreen 
              finalLookBase64={virtualTryonImageBase64} 
              onTryAgain={resetAppState} 
            />
          )}
        </div>
      </main>

      <footer className="w-full max-w-2xl py-10 px-8 flex flex-col items-center gap-2">
        <p className="text-[10px] text-gray-800 uppercase tracking-[0.5em] font-black text-center">
          UMADEMATS • 50 ANOS • EDIÇÃO COLETIVA
        </p>
        <div className="w-12 h-[1px] bg-gray-900"></div>
      </footer>
    </div>
  );
}

export default App;
