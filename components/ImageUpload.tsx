import React, { useState, ChangeEvent } from 'react';
import Button from '../Button';

interface ImageUploadProps {
  onPhotoUpload: (base64Image: string) => void;
  currentPhotoBase64?: string;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onPhotoUpload, currentPhotoBase64, isLoading }) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoBase64);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (previewUrl) {
      onPhotoUpload(previewUrl);
    }
  };

  const handleTrocarFoto = () => {
    setPreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-950 text-white flex-1">
      <div className="mb-10 animate-in slide-in-from-top duration-700">
        <h2 className="text-3xl font-black italic tracking-tighter mb-2">PROVADOR VIRTUAL</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-yellow-500 to-orange-600 mx-auto rounded-full"></div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-2xl mb-10 w-full max-w-xs backdrop-blur-sm">
        <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4">Dicas para o Look Perfeito</h3>
        <ul className="text-[11px] text-gray-400 space-y-3 font-medium">
          <li className="flex items-center gap-3">
            <span className="w-5 h-5 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">1</span>
            Fique em pé com os braços relaxados
          </li>
          <li className="flex items-center gap-3">
            <span className="w-5 h-5 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">2</span>
            Garanta que todo o seu corpo apareça
          </li>
          <li className="flex items-center gap-3">
            <span className="w-5 h-5 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">3</span>
            Use um lugar bem iluminado
          </li>
        </ul>
      </div>

      {!previewUrl ? (
        <label
          htmlFor="file-upload"
          className="relative flex flex-col items-center justify-center w-full max-w-xs aspect-[3/4] border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/0 to-yellow-500/5 group-hover:to-yellow-500/10 transition-all"></div>
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-yellow-500 font-black text-sm uppercase tracking-widest">Tirar Foto</p>
          <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Ou selecione na galeria</p>
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
        <div className="relative w-full max-w-xs aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button onClick={handleTrocarFoto} variant="secondary" size="sm" disabled={isLoading}>
              Trocar foto
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-4 w-full max-w-xs">
        {previewUrl && (
          <Button onClick={handleContinue} fullWidth size="lg" disabled={isLoading}>
            Avançar
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;