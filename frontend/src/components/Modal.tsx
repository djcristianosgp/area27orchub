import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  }[];
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  actions = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">{children}</div>

        {actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 justify-end">
            {actions.map((action, idx) => {
              const variants = {
                primary: 'bg-blue-500 hover:bg-blue-600 text-white',
                secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
                danger: 'bg-red-500 hover:bg-red-600 text-white',
              };

              return (
                <button
                  key={idx}
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={`px-4 py-2 rounded font-medium transition ${variants[action.variant || 'primary']} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.loading ? '...' : action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
