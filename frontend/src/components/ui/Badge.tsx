import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  secondary: 'badge-secondary',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  icon,
  className = '',
}) => {
  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </div>
  );
};
