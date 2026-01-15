import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Pesquisar...',
}) => {
  const [query, setQuery] = React.useState(value ?? '');

  React.useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    onSearch?.(newValue);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
      <input
        type="text"
        value={value ?? query}
        onChange={handleChange}
        placeholder={placeholder}
        className="input-base pl-10"
      />
    </div>
  );
};
