import React from 'react';
import { Badge } from '@components/ui';
import { Tag, ExternalLink } from 'lucide-react';

interface CouponCardProps {
  id: string;
  title: string;
  description: string;
  code: string;
  platform: string;
  discount?: string;
  expiryDate?: string;
  isActive: boolean;
  onCopy?: () => void;
  onVisit?: () => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  id,
  title,
  description,
  code,
  platform,
  discount,
  expiryDate,
  isActive,
  onCopy,
  onVisit,
}) => {
  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-secondary-900 text-lg">{title}</h3>
          <p className="text-sm text-secondary-500 mt-1">{description}</p>
        </div>
        <Badge variant={isActive ? 'success' : 'secondary'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
        <p className="text-xs text-primary-600 font-medium mb-1">CÓDIGO</p>
        <div className="flex items-center justify-between">
          <code className="text-lg font-bold text-primary-900">{code}</code>
          <button
            onClick={onCopy}
            className="px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-100 rounded transition-colors"
          >
            Copiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-secondary-500 text-xs">Plataforma</p>
          <p className="font-semibold text-secondary-900">{platform}</p>
        </div>
        {discount && (
          <div>
            <p className="text-secondary-500 text-xs">Desconto</p>
            <p className="font-semibold text-success-600">{discount}</p>
          </div>
        )}
        {expiryDate && (
          <div className="col-span-2">
            <p className="text-secondary-500 text-xs">Válido até</p>
            <p className="font-semibold text-secondary-900">
              {new Date(expiryDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCopy}
          className="flex-1 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm hover:bg-primary-200 transition-colors flex items-center justify-center gap-2"
        >
          <Tag className="h-4 w-4" />
          Copiar Código
        </button>
        {onVisit && (
          <button
            onClick={onVisit}
            className="flex-1 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg font-medium text-sm hover:bg-secondary-200 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Visitar
          </button>
        )}
      </div>
    </div>
  );
};
