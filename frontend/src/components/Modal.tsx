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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            title="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {children}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-b-2xl justify-end">
            {actions.map((action, idx) => {
              const variants = {
                primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg',
                secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200',
                danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg',
              };

              return (
                <button
                  key={idx}
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 inline-flex items-center gap-2 ${variants[action.variant || 'primary']} disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {action.loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      <span>Processando...</span>
                    </>
                  ) : (
                    action.label
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
