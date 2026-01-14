import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`${sizeClasses[size]} w-full mx-4 rounded-2xl bg-white shadow-2xl animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="border-b border-secondary-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-secondary-900">{title}</h2>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="border-t border-secondary-200 px-6 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
