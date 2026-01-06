import React from 'react';
import { Card, CardBody } from './Card';

interface StatCardProps {
  emoji: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  emoji, 
  title, 
  value, 
  subtitle,
  trend,
  onClick 
}) => {
  return (
    <Card hover={!!onClick} onClick={onClick}>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
