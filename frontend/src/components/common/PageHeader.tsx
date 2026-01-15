import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-4xl font-bold text-secondary-900">{title}</h1>
        {subtitle && <p className="mt-2 text-secondary-600">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
