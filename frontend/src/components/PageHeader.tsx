import React, { ReactNode } from 'react';

interface PageHeaderProps {
  emoji: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  emoji, 
  title, 
  description, 
  actions 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{emoji}</span>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
          {description && (
            <p className="text-gray-600 text-lg ml-14">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
