import { X } from "@phosphor-icons/react";
import { SearchNormal1 } from "iconsax-react";
import React, { forwardRef, useEffect } from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onClear?: () => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  showSearchIcon?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      label,
      error,
      className = "",
      onClear,
      onSearch,
      debounceMs = 300,
      showSearchIcon = true,
      ...props
    },
    ref
  ) => {
    // Debounce the search calls, not the value
    useEffect(() => {
      const timer = setTimeout(() => {
        if (onSearch && props.value) {
          onSearch(props.value as string);
        }
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [props.value, onSearch, debounceMs]);

    // Remove handleChange - use props.onChange directly

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {showSearchIcon && (
            <SearchNormal1
              color="gray"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          )}
          <input
            ref={ref}
            className={`
              w-full h-[42px] ${showSearchIcon ? "pl-10" : "pl-3"} pr-10
              border border-gray-300 
              rounded
              focus:outline-none focus:ring-2 focus:ring-[#14A800] focus:border-transparent
              bg-white
              disabled:bg-gray-50 disabled:text-gray-500
              ${error ? "border-red-500" : ""}
              ${className}
            `}
            {...props}
          />
          {props.value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full p-1"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
