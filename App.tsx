import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, ClothingItem, Outfit, TshirtItem, OtherClothingItem } from './types';
import { applyClothingItem, imageUrlToBase64, processUploadedImage } from './services/geminiService';
import ImageUpload from './components/ImageUpload';
import TshirtSelection from './components/TshirtSelection';
import ResultScreen from './components/ResultScreen';
import LoadingSpinner from './components/LoadingSpinner';

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

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD_PHOTO);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | undefined>(undefined);
  const [userPhotoFile, setUserPhotoFile] = useState<File | undefined>(undefined); // Keep the file object
  const [virtualTryonImageBase64, setVirtualTryonImageBase64] = useState<string | undefined>(undefined);
  const [outfit, setOutfit] = useState<Outfit>({}); // Outfit state still tracks selected items even if not all displayed
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const resetAppState = useCallback(() => {
    setCurrentStep(AppStep.UPLOAD_PHOTO);
    setUserPhotoBase64(undefined);
    setUserPhotoFile(undefined);
    setVirtualTryonImageBase64(undefined);
    setOutfit({});
    setIsLoading(false);
    setErrorMessage(undefined);
  }, []);

  const handlePhotoUpload = useCallback(async (base64Image: string, file: File) => {
    setIsLoading(true);
    setErrorMessage(undefined);
    try {
      setUserPhotoBase64(base64Image);
      setUserPhotoFile(file);
      setCurrentStep(AppStep.SELECT_T_SHIRT);
    } catch (error) {
      console.error("Error processing photo:", error);
      setErrorMessage("Não foi possível processar a foto. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectTshirt = useCallback(async (selectedTshirt: TshirtItem) => {
    if (!userPhotoBase64) {
      setErrorMessage("Foto do usuário não encontrada. Por favor, recarregue a página.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(undefined);
    setOutfit(prev => ({ ...prev, tshirt: selectedTshirt }));

    const selectedTshirtMockupBase64 = await imageUrlToBase64(selectedTshirt.mockupUrl);
    const selectedTshirtFlatArtBase64 = await imageUrlToBase64(selectedTshirt.flatArtUrl); // Buscar a flat art

    // Aprimorando o prompt para mais realismo e instruindo sobre as três imagens
    const prompt = `Você recebeu três imagens:
1. A foto de corpo inteiro do usuário.
2. Uma imagem de mockup da camiseta (para sua forma, cor e caimento).
3. Uma imagem da arte/estampa da camiseta (flat art).

Sua tarefa é sobrepor a camiseta do mockup (imagem 2) na pessoa da foto do usuário (imagem 1). Integre a camiseta perfeitamente ao corpo da pessoa, fazendo parecer que ela realmente está usando. Garanta ajustes realistas à forma e pose únicas do corpo da pessoa, incluindo dobras e rugas naturais do tecido e ajuste proporcional. Crucialmente, incorpore o design/estampa da imagem de flat art (imagem 3) na camiseta, fazendo-o se conformar realisticamente às curvas do tecido e à iluminação. Aplique sombras e realces apropriados com base na iluminação existente na foto do usuário para criar profundidade e realismo. Mantenha a cabeça, braços e pernas da pessoa claramente visíveis.`;

    try {
      const resultImage = await applyClothingItem(
        userPhotoBase64,
        selectedTshirtMockupBase64,
        prompt,
        selectedTshirtFlatArtBase64 // Passar a flat art como a terceira imagem
      );
      if (resultImage) {
        setVirtualTryonImageBase64(resultImage);
      } else {
        throw new Error("Resposta da IA não contém imagem.");
      }
    } catch (error) {
      console.error("Error applying t-shirt:", error);
      setErrorMessage("Vamos tentar de novo com outra foto? A IA não conseguiu aplicar a camiseta. Tente uma foto com fundo mais neutro ou melhor iluminação.");
    } finally {
      setIsLoading(false);
    }
  }, [userPhotoBase64]);

  // Removed handleUpdateOutfit as OutfitCustomization is no longer present

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case AppStep.UPLOAD_PHOTO:
        return (
          <ImageUpload
            onPhotoUpload={handlePhotoUpload}
            currentPhotoBase64={userPhotoBase64}
            isLoading={isLoading}
          />
        );
      case AppStep.SELECT_T_SHIRT:
        return (
          <TshirtSelection
            tshirts={mockTshirts} 
            selectedTshirt={outfit.tshirt}
            onSelectTshirt={handleSelectTshirt}
            onContinue={() => setCurrentStep(AppStep.SHOW_RESULT)} // Direct to result
            isLoading={isLoading}
            virtualTryonImageBase64={virtualTryonImageBase64}
            errorMessage={errorMessage}
          />
        );
      case AppStep.SHOW_RESULT:
        if (!virtualTryonImageBase64) return <p className="text-red-500 p-4">Erro: Imagem do look não carregada.</p>;
        return (
          <ResultScreen
            finalLookBase64={virtualTryonImageBase64}
            onTryAgain={resetAppState}
          />
        );
      default:
        return null;
    }
  }, [currentStep, userPhotoBase64, isLoading, virtualTryonImageBase64, outfit, errorMessage, handlePhotoUpload, handleSelectTshirt, resetAppState]);

  // Handle potential API key selection for premium models (if used)
  useEffect(() => {
    // This part is commented out as we are using gemini-2.5-flash-image which doesn't
    // require the explicit API key selection dialog.
    // If you were to upgrade to 'gemini-3-pro-image-preview' or Veo, you would uncomment this.

    // const checkApiKey = async () => {
    //   if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
    //     await window.aistudio.openSelectKey();
    //   }
    // };
    // checkApiKey();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start py-8">
      <div className="relative w-full max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden md:max-w-xl lg:max-w-2xl min-h-[calc(100vh-64px)] flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <LoadingSpinner />
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
}

export default App;