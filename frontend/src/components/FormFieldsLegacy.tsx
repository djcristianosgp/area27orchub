import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  isTextArea?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helpText,
  className = '',
  isTextArea = false,
  ...props
}) => {
  const Component = isTextArea ? 'textarea' : 'input';
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Component
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          error ? 'border-danger-500' : 'border-gray-300'
        } ${className}`}
        {...(props as any)}
      />
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options?: Array<{ value: string | number; label: string }>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  helpText,
  className = '',
  options = [],
  children,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          error ? 'border-danger-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

export const TextAreaField: React.FC<FormFieldProps> = (props) => {
  return <FormField {...props} isTextArea />;
};
