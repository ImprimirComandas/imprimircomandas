
import React from 'react';
import { Search, X } from 'lucide-react';

interface ProductFiltersProps {
  selectedCategory: string;
  searchTerm: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
}

export function ProductFilters({
  selectedCategory,
  searchTerm,
  categories,
  onCategoryChange,
  onSearchChange
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <div className="w-full sm:w-48">
        <label htmlFor="category-select" className="block text-sm font-medium text-foreground mb-1">
          Categoria
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
        >
          <option value="Todas">Todas</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div className="relative w-full sm:w-64">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={20}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
          placeholder="Buscar produto..."
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
