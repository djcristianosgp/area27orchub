import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@components/ui';

interface MultiSelectOption {
  value: string | number;
  label: string;
}

interface MultiSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  options: MultiSelectOption[];
  value?: (string | number)[];
  onChange?: (values: (string | number)[]) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      placeholder = 'Selecione...',
      searchable = true,
      clearable = true,
      disabled = false,
      error,
      label,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    const handleSelect = (optionValue: string | number) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange?.(newValue);
    };

    const handleRemove = (optionValue: string | number) => {
      const newValue = value.filter((v) => v !== optionValue);
      onChange?.(newValue);
    };

    const handleClear = () => {
      onChange?.([]);
      setSearchTerm('');
    };

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {label && (
          <label className="block text-sm font-medium text-secondary-900 mb-2">
            {label}
            {required && <span className="text-danger-600 ml-1">*</span>}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Display Area */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between gap-2 bg-white text-left transition-all ${
              error
                ? 'border-danger-500 focus:ring-danger-100'
                : 'border-secondary-300 focus:ring-primary-100'
            } ${disabled ? 'bg-secondary-100 cursor-not-allowed opacity-50' : 'hover:border-secondary-400'}`}
          >
            <div className="flex-1 flex flex-wrap gap-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((opt) => (
                  <Badge key={opt.value} variant="primary">
                    <span className="text-xs">{opt.label}</span>
                  </Badge>
                ))
              ) : (
                <span className="text-secondary-600">{placeholder}</span>
              )}
            </div>

            <div className="flex items-center gap-1 ml-2">
              {clearable && selectedOptions.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 hover:bg-secondary-100 rounded"
                >
                  <X className="w-4 h-4 text-secondary-600" />
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-secondary-600 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 border border-secondary-200 rounded-lg bg-white shadow-lg">
              {searchable && (
                <div className="p-2 border-b border-secondary-200">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-base w-full text-sm"
                    autoFocus
                  />
                </div>
              )}

              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-primary-50 transition-colors ${
                        value.includes(option.value)
                          ? 'bg-primary-50 text-primary-900'
                          : 'text-secondary-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={value.includes(option.value)}
                        readOnly
                        className="w-4 h-4 rounded border-secondary-300"
                      />
                      <span className="flex-1">{option.label}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-secondary-600 text-sm">
                    Nenhuma opção encontrada
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
