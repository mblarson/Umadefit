import React from 'react';
import Button from '../Button';

interface ResultScreenProps {
  finalLookBase64: string;
  onTryAgain: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ finalLookBase64, onTryAgain }) => {
  const handleSaveImage = () => {
    const link = document.createElement('a');
    link.href = finalLookBase64;
    link.download = 'umadefit-look-50anos.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const response = await fetch(finalLookBase64);
        const blob = await response.blob();
        const file = new File([blob], 'meu-look-umadefit.png', { type: 'image/png' });

        await navigator.share({
          files: [file],
          title: 'Meu Look UMADEFIT!',
          text: 'Vejam só como ficou meu look para o Jubileu de Ouro! #UMADEFIT50ANOS',
        });
      } else {
        alert('Salve a imagem e compartilhe no seu Instagram!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-950 text-white min-h-[calc(100vh-64px)]">
      <div className="mb-6 animate-in slide-in-from-top duration-700">
        <h2 className="text-3xl font-black italic tracking-tighter mb-1 uppercase">ESTILO & UNÇÃO</h2>
        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em]">O Look do seu Jubileu está pronto</p>
      </div>

      <div className="relative w-full max-w-sm aspect-[3/4] rounded-[3rem] overflow-hidden border-2 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)] mb-10 bg-gray-900 group">
        <img
          src={finalLookBase64}
          alt="Virtual Try-On Final Look"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">UMADEFIT 50 ANOS</div>
        </div>
      </div>

      <div className="space-y-4 w-full max-w-xs">
        <Button onClick={handleSaveImage} fullWidth size="lg">
          Baixar Meu Look
        </Button>
        <div className="grid grid-cols-2 gap-3">
           <Button onClick={handleShare} variant="secondary" fullWidth size="md">
             Compartilhar
           </Button>
           <Button onClick={onTryAgain} variant="outline" fullWidth size="md">
             Reiniciar
           </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;