import React from 'react';
import { ShoppingCart, ExternalLink, Tag } from 'lucide-react';
import { Button, Badge } from '@components/ui';

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  affiliateLink: string;
}

interface ProductMarketplaceCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: string;
  brand: string;
  lowestPrice: number;
  variations: ProductVariation[];
  onViewDetails?: () => void;
}

export const ProductMarketplaceCard: React.FC<ProductMarketplaceCardProps> = ({
  id,
  name,
  description,
  image,
  category,
  brand,
  lowestPrice,
  variations,
  onViewDetails,
}) => {
  const cheapestVariation = variations.reduce((prev, current) =>
    prev.price < current.price ? prev : current
  );

  return (
    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative w-full h-48 bg-secondary-100 overflow-hidden group">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-secondary-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="primary">{category}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h4 className="font-semibold text-secondary-900 line-clamp-2">{name}</h4>
          <p className="text-xs text-secondary-500 mt-1">{brand}</p>
        </div>

        <p className="text-sm text-secondary-600 line-clamp-2 mb-4">{description}</p>

        <div className="mb-4 p-3 bg-success-50 rounded-lg border border-success-200">
          <p className="text-xs text-success-600 font-medium">Melhor Preço</p>
          <p className="text-2xl font-bold text-success-700">
            R$ {lowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {variations.length > 1 && (
          <p className="text-xs text-secondary-500 mb-4">{variations.length} variações disponíveis</p>
        )}

        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 px-4 py-2 text-secondary-700 bg-secondary-100 rounded-lg font-medium text-sm hover:bg-secondary-200 transition-colors"
            >
              Detalhes
            </button>
          )}
          <a
            href={cheapestVariation.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </a>
        </div>
      </div>
    </div>
  );
};
