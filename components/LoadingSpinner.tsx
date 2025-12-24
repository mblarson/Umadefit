import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Processando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="relative mb-8">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-yellow-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 bg-gradient-to-tr from-yellow-500 to-orange-600 rounded-2xl rotate-45 animate-pulse shadow-xl shadow-orange-500/20"></div>
        </div>
      </div>
      <p className="text-yellow-500 text-xl font-black tracking-widest uppercase animate-pulse">{message}</p>
      <p className="text-gray-500 text-xs mt-3 font-medium tracking-[0.2em]">CRIANDO SUA EXPERIÊNCIA VIRTUAL</p>
    </div>
  );
};

export default LoadingSpinner;