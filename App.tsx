import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, TshirtItem, Outfit } from './types';
import { applyClothingItem, imageUrlToBase64 } from './services/geminiService';
import ImageUpload from './components/ImageUpload';
import TshirtSelection from './components/TshirtSelection';
import ResultScreen from './components/ResultScreen';
import LoadingSpinner from './components/LoadingSpinner';
import Button from './Button';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
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
  "Ajustando o caimento...",
  "Sincronizando iluminação...",
  "Aplicando estampa Dourada...",
  "Finalizando seu visual...",
];

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD_PHOTO);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | undefined>(undefined);
  const [virtualTryonImageBase64, setVirtualTryonImageBase64] = useState<string | undefined>(undefined);
  const [outfit, setOutfit] = useState<Outfit>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

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

  const handleConfigKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
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

      // Prompt "Turbinado" para o Flash focar em realismo
      const prompt = `Virtual Try-On Ultra-Realistic Simulation:
        1. PERSPECTIVE: Anatomically correct placement of the t-shirt on the person's body. 
        2. PHYSICS: Match the cloth folds and wrinkles to the person's pose and arm positions.
        3. INTEGRATION: Seamlessly blend the edges of the t-shirt with the person's skin and hair.
        4. COLOR & FABRIC: The t-shirt is ${selectedTshirt.name.includes('Laranja') ? 'Bright Orange' : 'Deep Forest Green'} with a premium cotton texture.
        5. LOGO: The 'Jubileu de Ouro' print must follow the torso's curvature and show a subtle metallic gold reflection.
        6. LIGHTING: Adjust the global illumination of the new t-shirt to perfectly match the light source, shadows, and highlights of the original background.
        7. KEEP: Do not change the face, hair, or original background of the person.`;

      const result = await applyClothingItem(userPhotoBase64, mockupBase64, prompt, flatArtBase64);
      if (result) setVirtualTryonImageBase64(result);
    } catch (error: any) {
      setErrorMessage(error.message);
      if (error.message.includes("chave") || error.message.includes("API")) {
        setHasApiKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center">
      <header className="w-full max-w-2xl px-6 py-5 flex items-center justify-between border-b border-white/5 bg-gray-950/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-yellow-500 via-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-600/30">U</div>
          <div>
            <h1 className="text-xl font-black leading-none tracking-tighter italic">UMADEFIT</h1>
            <p className="text-[10px] text-yellow-500 uppercase tracking-[0.3em] font-bold mt-1">Jubileu de Ouro</p>
          </div>
        </div>
        
        <button 
          onClick={handleConfigKey}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black tracking-widest uppercase transition-all
            ${hasApiKey ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' : 'bg-orange-500/20 border-orange-500/50 text-orange-400 animate-pulse'}`}
        >
          {hasApiKey ? '● MOTOR ESTÁVEL' : '⚠️ CONECTAR API'}
        </button>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-950/90 z-[100] backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
            <LoadingSpinner message={loadingMessage} />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {errorMessage && (
            <div className="mx-6 mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-sm flex gap-4 items-center">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold leading-snug">{errorMessage}</p>
              </div>
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

      <footer className="w-full max-w-2xl py-10 px-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold tracking-widest">
          <span className="text-green-500">OPTIMIZED EVENT MODE</span>
          <span className="w-1 h-1 rounded-full bg-gray-800"></span>
          <span>GEMINI 2.5 FLASH</span>
        </div>
        <p className="text-[10px] text-gray-700 uppercase tracking-[0.5em] font-black text-center">
          UMADEMATS • 50 ANOS • EDIÇÃO COLETIVA
        </p>
      </footer>
    </div>
  );
}

export default App;