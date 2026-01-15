import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean; // alias to keep backwards compatibility
  children?: React.ReactNode;
  icon?: React.ElementType | React.ReactNode;
}

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  success: 'btn-success',
  warning: 'btn-warning',
  outline: 'btn-secondary', // alias para secondary
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading,
      disabled,
      children,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const loadingState = isLoading || loading;
    const hasIconComponent = icon && typeof icon === 'function';
    const contentClass = (hasIconComponent || loadingState) ? 'flex items-center gap-2' : '';

    // Renderizar ícone se for um componente React
    const renderedIcon = React.isValidElement(icon)
      ? React.cloneElement(icon, {
          className: `${icon.props?.className ?? ''} w-4 h-4`.trim(),
        })
      : hasIconComponent
        ? React.createElement(icon as React.ComponentType<any>, {
            className: 'w-4 h-4',
          })
        : null;

    return (
      <button
        ref={ref}
        disabled={disabled || loadingState}
        className={`${variantClasses[variant]} ${sizeClasses[size]} ${contentClass} ${className}`}
        {...props}
      >
        {loadingState ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          <>
            {renderedIcon}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
