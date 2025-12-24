import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Processando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500 border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 bg-purple-600 rounded-full animate-pulse opacity-50"></div>
        </div>
      </div>
      <p className="text-purple-300 text-lg font-medium animate-pulse">{message}</p>
      <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos...</p>
    </div>
  );
};

export default LoadingSpinner;