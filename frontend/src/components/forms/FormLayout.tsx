import React from 'react';
import { Card } from '@components/ui';

interface FormLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

export const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  description,
  children,
  footer,
  columns = 1,
  gap = 'md',
}) => {
  return (
    <Card>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-secondary-200">
          {title && <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-secondary-600">{description}</p>}
        </div>
      )}

      <div className="p-6">
        <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
          {children}
        </div>
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-secondary-200 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </Card>
  );
};

// Componente para agrupar campos relacionados
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  columns = 1,
  gap = 'md',
}) => {
  return (
    <div className="col-span-full">
      {(title || description) && (
        <div className="mb-4">
          {title && <h4 className="text-base font-semibold text-secondary-900">{title}</h4>}
          {description && <p className="mt-1 text-sm text-secondary-600">{description}</p>}
        </div>
      )}

      <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
        {children}
      </div>
    </div>
  );
};
