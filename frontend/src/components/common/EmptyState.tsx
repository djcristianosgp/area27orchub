import React from 'react';
import { Package } from 'lucide-react';
import { Button } from '@components/ui';

interface EmptyStateProps {
  icon?: React.ElementType | React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Package className="h-16 w-16" />,
  title,
  description,
  action,
}) => {
  const renderIcon = React.isValidElement(icon)
    ? icon
    : typeof icon === 'function'
      ? React.createElement(icon as React.ComponentType<any>, {
          className: 'h-16 w-16',
        })
      : null;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-secondary-300 mb-4">{renderIcon}</div>
      <h3 className="text-xl font-semibold text-secondary-900 mb-2">{title}</h3>
      <p className="text-secondary-500 max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
};
