import React, { ReactNode } from 'react';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  emoji, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <span className="text-6xl mb-4 block">{emoji}</span>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 mb-6 max-w-md">{description}</p>
        )}
        {action && (
          <div>{action}</div>
        )}
      </div>
    </div>
  );
};
