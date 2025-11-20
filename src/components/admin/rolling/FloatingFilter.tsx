import { useState } from 'react';
import { Filter, ArrowDown2, ArrowUp2, TickCircle } from 'iconsax-react';
import { FilterState } from '@/lib/filterHelpers';

interface FloatingFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function FloatingFilter({ onFilterChange }: FloatingFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    language: 'ALL',
    edit: 'ALL',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFiltersCount =
    (filters.language !== 'ALL' ? 1 : 0) +
    (filters.edit !== 'ALL' ? 1 : 0);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Menu dépliable */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 w-80 mb-2 animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter size={24} color="#6366F1" variant="Bold" />
                <h3 className="font-bold text-gray-900 text-lg">Filtres</h3>
              </div>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Filtre Langue */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Langue
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'ALL', label: 'Tous' },
                  { value: 'VF', label: 'VF' },
                  { value: 'VA', label: 'VA' },
                  { value: 'VO', label: 'VO' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleFilterChange('language', value)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      filters.language === value
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filters.language === value && (
                      <TickCircle size={16} color="currentColor" variant="Bold" />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre Édition */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Édition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ALL', label: 'Tous' },
                  { value: 'AVEC', label: 'Avec' },
                  { value: 'SANS', label: 'Sans' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleFilterChange('edit', value)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      filters.edit === value
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filters.edit === value && (
                      <TickCircle size={16} color="currentColor" variant="Bold" />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  const resetFilters = { language: 'ALL' as const, edit: 'ALL' as const };
                  setFilters(resetFilters);
                  onFilterChange(resetFilters);
                }}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bouton flottant principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
          activeFiltersCount > 0
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
            : 'bg-white text-gray-700 border-2 border-gray-300'
        }`}
      >
        <Filter
          size={24}
          color={activeFiltersCount > 0 ? 'white' : '#6366F1'}
          variant="Bold"
        />
        <span>Filtres</span>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
            {activeFiltersCount}
          </span>
        )}
        {isOpen ? (
          <ArrowDown2 size={20} color={activeFiltersCount > 0 ? 'white' : '#6366F1'} />
        ) : (
          <ArrowUp2 size={20} color={activeFiltersCount > 0 ? 'white' : '#6366F1'} />
        )}
      </button>
    </div>
  );
}
