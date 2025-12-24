import React from 'react';
import { TshirtItem } from '../types'; // Import TshirtItem specifically
import Button from '../Button';

interface TshirtSelectionProps {
  tshirts: TshirtItem[]; // tshirts prop now expects TshirtItem[]
  selectedTshirt?: TshirtItem; // selectedTshirt is now TshirtItem
  onSelectTshirt: (tshirt: TshirtItem) => void; // Callback expects TshirtItem
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
    <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800 text-gray-100 min-h-[calc(100vh-64px)]">
      <h2 className="text-3xl font-bold text-purple-400 mb-4 md:text-4xl">Escolha a camiseta do Jubileu</h2>
      <p className="text-gray-300 text-lg mb-6">Selecione uma camiseta para experimentar:</p>

      {errorMessage && (
        <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded-md relative mb-6 w-full max-w-sm md:max-w-md" role="alert">
          <strong className="font-bold">Ops!</strong>
          <span className="block sm:inline ml-2">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm md:max-w-md lg:max-w-lg">
        {tshirts.map((tshirt) => (
          <div
            key={tshirt.id}
            className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200
              ${selectedTshirt?.id === tshirt.id ? 'border-4 border-purple-600 shadow-lg scale-105 bg-gray-700' : 'border-2 border-gray-600 hover:border-purple-400 bg-gray-800'}`}
            onClick={() => !isLoading && onSelectTshirt(tshirt)}
          >
            {/* Use mockupUrl for display */}
            <img src={tshirt.mockupUrl} alt={tshirt.name} className="w-24 h-24 object-contain mb-2 md:w-32 md:h-32" />
            <span className="text-gray-100 font-semibold text-sm md:text-base">{tshirt.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 w-full max-w-sm md:max-w-md">
        {virtualTryonImageBase64 ? (
          <>
            <h3 className="text-xl font-semibold text-purple-300 mb-4">Seu look com a camiseta:</h3>
            <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg mb-6">
              <img src={virtualTryonImageBase64} alt="Virtual Try-On" className="w-full h-full object-contain bg-gray-700" />
            </div>
            <Button onClick={onContinue} fullWidth size="lg" disabled={isLoading}>
              Ver Look Final
            </Button>
          </>
        ) : (
          <p className="text-gray-400 mt-8 text-base">
            Selecione uma camiseta para ver a pré-visualização.
          </p>
        )}
      </div>
    </div>
  );
};

export default TshirtSelection;