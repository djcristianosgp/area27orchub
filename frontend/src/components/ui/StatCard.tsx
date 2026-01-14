import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`container-base cursor-pointer transition-all hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-secondary-900">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-secondary-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-primary-600">{icon}</div>}
      </div>
      {trend && (
        <div
          className={`mt-4 text-xs font-semibold ${
            trend.isPositive ? 'text-success-600' : 'text-danger-600'
          }`}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs período anterior
        </div>
      )}
    </div>
  );
};
