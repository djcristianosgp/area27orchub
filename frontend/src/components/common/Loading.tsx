import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="h-8 w-8 text-primary-600 animate-spin mb-4" />
      <p className="text-secondary-600 text-sm">{message}</p>
    </div>
  );
};
