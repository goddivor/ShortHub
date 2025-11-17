// src/components/ui/CustomSelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown2, User as UserIcon, Youtube } from 'iconsax-react';

export interface CustomSelectOption {
  id: string;
  name: string;
  profileImage?: string | null;
  imageUrl?: string | null;
  type?: 'user' | 'channel';
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  disabled = false,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const renderOptionContent = (option: CustomSelectOption, isSelected: boolean = false) => {
    const image = option.profileImage || option.imageUrl || option.profileImageUrl;
    const optionType = option.type || 'user';

    return (
      <div className="flex items-center gap-3">
        {/* Image or Fallback */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={option.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {optionType === 'user' ? (
                <UserIcon size={16} color="white" variant="Bold" />
              ) : (
                <Youtube size={16} color="white" variant="Bold" />
              )}
            </>
          )}
        </div>

        {/* Name */}
        <span className={`flex-1 truncate ${isSelected ? 'font-medium' : ''}`}>
          {option.name}
        </span>
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg
          flex items-center justify-between gap-2
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'}
          ${isOpen ? 'border-red-500 ring-2 ring-red-500' : ''}
        `}
      >
        {selectedOption ? (
          renderOptionContent(selectedOption, true)
        ) : (
          <span className="text-gray-400 flex-1 text-left">{placeholder}</span>
        )}

        <ArrowDown2
          size={18}
          color="#6B7280"
          className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              Aucune option disponible
            </div>
          ) : (
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`
                    w-full px-4 py-2.5 text-left transition-colors
                    ${option.id === value
                      ? 'bg-red-50 text-red-900'
                      : 'hover:bg-gray-50 text-gray-900'
                    }
                  `}
                >
                  {renderOptionContent(option, option.id === value)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="absolute opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default CustomSelect;
