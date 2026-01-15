import React from 'react';
import { Input as UIInput } from '@components/ui';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children?: React.ReactNode;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  inputType?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'tel' | 'url' | 'textarea' | 'select';
  options?: Array<{ value: string | number; label: string }>;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      description,
      error,
      required = false,
      hint,
      children,
      value,
      onChange,
      type = 'text',
      placeholder,
      disabled = false,
      readOnly = false,
      inputType = 'text',
      options = [],
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {label && (
          <label className="block text-sm font-medium text-secondary-900 mb-2">
            {label}
            {required && <span className="text-danger-600 ml-1">*</span>}
          </label>
        )}

        {description && <p className="text-xs text-secondary-600 mb-2">{description}</p>}

        {children ? (
          <div>{children}</div>
        ) : inputType === 'textarea' ? (
          <textarea
            value={value}
            onChange={onChange as any}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={4}
            className="input-base w-full"
          />
        ) : inputType === 'select' ? (
          <select
            value={value}
            onChange={onChange as any}
            disabled={disabled}
            className="input-base w-full"
          >
            <option value="">Selecione uma opção</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={onChange as any}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className="input-base w-full"
          />
        )}

        {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-secondary-600">{hint}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
