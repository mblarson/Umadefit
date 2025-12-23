import React, { useState, ChangeEvent } from 'react';
import Button from './Button';

interface ImageUploadProps {
  onPhotoUpload: (base64Image: string, file: File) => void;
  currentPhotoBase64?: string;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onPhotoUpload, currentPhotoBase64, isLoading }) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoBase64);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (previewUrl && selectedFile) {
      onPhotoUpload(previewUrl, selectedFile);
    }
  };

  const handleTrocarFoto = () => {
    setPreviewUrl(undefined);
    setSelectedFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800 text-gray-100 min-h-[calc(100vh-64px)]">
      <h2 className="text-3xl font-bold text-purple-400 mb-4 md:text-4xl">UMADEFIT - Teste Seu Look</h2>
      <p className="text-gray-300 text-lg mb-6 max-w-sm">Com as camisetas do Jubileu de Ouro da UMADEMATS!</p>

      <div className="bg-gray-700 p-4 rounded-xl shadow-inner mb-6 w-full max-w-xs md:max-w-sm">
        <h3 className="text-md font-semibold text-gray-200 mb-3">Regras da foto:</h3>
        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
          <li>Pessoa em pé</li>
          <li>Corpo inteiro visível</li>
          <li>Fundo preferencialmente neutro</li>
          <li>Iluminação clara</li>
        </ul>
      </div>

      {!previewUrl ? (
        <label
          htmlFor="file-upload"
          className="relative flex flex-col items-center justify-center w-full max-w-xs h-48 border-2 border-dashed border-purple-500 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors duration-200 p-4 md:max-w-sm md:h-64"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" />
          </svg>
          <p className="text-purple-300 font-semibold text-center text-sm">Clique para fazer upload</p>
          <p className="text-gray-400 text-xs mt-1">PNG, JPG, JPEG</p>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isLoading}
          />
        </label>
      ) : (
        <div className="relative w-full max-w-xs h-64 md:max-w-sm md:h-80 rounded-lg overflow-hidden border-2 border-purple-500 shadow-md">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-gray-700" />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Button onClick={handleTrocarFoto} variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100" disabled={isLoading}>
              Trocar foto
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4 w-full max-w-xs md:max-w-sm">
        {previewUrl && (
          <Button onClick={handleContinue} fullWidth size="lg" disabled={isLoading}>
            Continuar
          </Button>
        )}
        {previewUrl && (
          <Button onClick={handleTrocarFoto} variant="outline" fullWidth disabled={isLoading}>
            Trocar foto
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;