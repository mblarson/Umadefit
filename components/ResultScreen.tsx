import React from 'react';
import Button from './Button';

interface ResultScreenProps {
  finalLookBase64: string;
  onTryAgain: () => void;
  // onSaveImage: () => void; // Implemented directly
  // onShare: () => void; // Placeholder
}

const ResultScreen: React.FC<ResultScreenProps> = ({ finalLookBase64, onTryAgain }) => {
  const handleSaveImage = () => {
    const link = document.createElement('a');
    link.href = finalLookBase64;
    link.download = 'meu-look-virtual.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Convert base64 to Blob for sharing API
        const response = await fetch(finalLookBase64);
        const blob = await response.blob();
        const file = new File([blob], 'meu-look-virtual.png', { type: 'image/png' });

        await navigator.share({
          files: [file],
          title: 'Meu Look Virtual!',
          text: 'Olha o look que montei no provador virtual! #ProvadorVirtualIA',
        });
      } else {
        alert('Seu navegador não suporta o recurso de compartilhamento nativo. Você pode salvar a imagem e compartilhar manualmente!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Erro ao compartilhar o look.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800 text-gray-100 min-h-[calc(100vh-64px)]">
      <h2 className="text-3xl font-bold text-purple-400 mb-4 md:text-4xl">Seu Look UMADEFIT!</h2>
      <p className="text-gray-300 text-lg mb-6">"Seu estilo também fala sobre quem você é"</p>

      <div className="relative w-full max-w-md h-[450px] md:h-[550px] lg:h-[650px] rounded-lg overflow-hidden border-4 border-purple-600 shadow-2xl mb-8 flex items-center justify-center bg-gray-700">
        <img
          src={finalLookBase64}
          alt="Virtual Try-On Final Look"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="space-y-4 w-full max-w-xs md:max-w-sm bg-gray-800 pt-4 pb-2 z-10 border-t border-gray-700 shadow-top">
        <Button onClick={handleSaveImage} fullWidth size="lg">
          Salvar imagem
        </Button>
        <Button onClick={handleShare} variant="secondary" fullWidth size="lg">
          Compartilhar
        </Button>
        <Button onClick={onTryAgain} variant="outline" fullWidth size="lg">
          Testar outro look
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;