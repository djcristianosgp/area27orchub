import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
}

const variantConfig = {
  info: {
    bgClass: 'bg-primary-50',
    borderClass: 'border-primary-200',
    titleClass: 'text-primary-900',
    messageClass: 'text-primary-800',
    icon: Info,
  },
  success: {
    bgClass: 'bg-success-50',
    borderClass: 'border-success-200',
    titleClass: 'text-success-900',
    messageClass: 'text-success-800',
    icon: CheckCircle,
  },
  warning: {
    bgClass: 'bg-warning-50',
    borderClass: 'border-warning-200',
    titleClass: 'text-warning-900',
    messageClass: 'text-warning-800',
    icon: AlertTriangle,
  },
  danger: {
    bgClass: 'bg-danger-50',
    borderClass: 'border-danger-200',
    titleClass: 'text-danger-900',
    messageClass: 'text-danger-800',
    icon: AlertCircle,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  closable = false,
  onClose,
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={`rounded-lg border ${config.borderClass} ${config.bgClass} p-4 animate-slide-up`}
    >
      <div className="flex gap-3">
        <IconComponent className={`h-5 w-5 ${config.titleClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <h4 className={`font-semibold ${config.titleClass}`}>{title}</h4>}
          <p className={`text-sm ${config.messageClass}`}>{message}</p>
        </div>
        {closable && (
          <button
            onClick={onClose}
            className={`text-secondary-400 hover:text-secondary-600 transition-colors flex-shrink-0`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
