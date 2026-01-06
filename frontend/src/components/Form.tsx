import React, { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200 hover:border-slate-300'
          } disabled:bg-slate-50 disabled:cursor-not-allowed`}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            ⚠️
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-shake">
          <span className="font-medium">{error}</span>
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <span>💡</span>
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
};

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  error,
  ...props
}) => {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200 hover:border-slate-300 bg-white'
          } disabled:bg-slate-50 disabled:cursor-not-allowed`}
        >
          <option value="" disabled>Selecione uma opção...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {error ? '⚠️' : '▼'}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-shake">
          <span className="font-medium">{error}</span>
        </p>
      )}
    </div>
  );
};

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  error,
  ...props
}) => {
  const currentLength = (props.value as string)?.length || 0;
  const maxLength = props.maxLength;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-bold text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {maxLength && (
          <span className="text-xs text-slate-500 font-medium">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative">
        <textarea
          {...props}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200 hover:border-slate-300'
          } disabled:bg-slate-50 disabled:cursor-not-allowed`}
        />
        {error && (
          <div className="absolute right-3 top-3 text-red-500">
            ⚠️
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-shake">
          <span className="font-medium">{error}</span>
        </p>
      )}
    </div>
  );
};
