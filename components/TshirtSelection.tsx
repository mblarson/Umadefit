import React from 'react';
import { TshirtItem } from '../types';
import Button from '../Button';

interface TshirtSelectionProps {
  tshirts: TshirtItem[];
  selectedTshirt?: TshirtItem;
  onSelectTshirt: (tshirt: TshirtItem) => void;
  onContinue: () => void;
  isLoading: boolean;
  virtualTryonImageBase64?: string;
  errorMessage?: string;
}

const TshirtSelection: React.FC<TshirtSelectionProps> = ({
  tshirts,
  selectedTshirt,
  onSelectTshirt,
  onContinue,
  isLoading,
  virtualTryonImageBase64,
  errorMessage,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-950 text-white min-h-[calc(100vh-64px)]">
      <div className="mb-8">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-1">ESCOLHA SEU MANTO</h2>
        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.3em]">Jubileu de Ouro 50 Anos</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
        {tshirts.map((tshirt) => (
          <button
            key={tshirt.id}
            disabled={isLoading}
            className={`relative flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all duration-500 overflow-hidden
              ${selectedTshirt?.id === tshirt.id 
                ? 'bg-yellow-500/10 border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]' 
                : 'bg-white/5 border border-white/10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
            onClick={() => onSelectTshirt(tshirt)}
          >
            {selectedTshirt?.id === tshirt.id && (
              <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-500 rounded-full animate-ping"></div>
            )}
            <img src={tshirt.mockupUrl} alt={tshirt.name} className="w-24 h-24 object-contain mb-3 drop-shadow-2xl" />
            <span className="text-[10px] font-black uppercase tracking-widest">{tshirt.name}</span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm">
        {virtualTryonImageBase64 ? (
          <div className="animate-in fade-in zoom-in duration-1000">
            <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4">Prévia do Visual</h3>
            <div className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-yellow-500/30 shadow-2xl mb-8 bg-gray-900">
              <img src={virtualTryonImageBase64} alt="Virtual Try-On" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                 <div className="bg-black/40 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest">Simulação via IA</div>
              </div>
            </div>
            <Button onClick={onContinue} fullWidth size="lg" disabled={isLoading}>
              Ver Detalhes do Look
            </Button>
          </div>
        ) : (
          <div className="py-10 border-t border-white/5">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
              Selecione uma cor para gerar a prévia
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TshirtSelection;