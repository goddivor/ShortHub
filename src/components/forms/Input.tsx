import { X } from "@phosphor-icons/react";
import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", onClear, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full h-[42px] px-3 
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
          {onClear && props.value && (
            <button
              type="button"
              onClick={onClear}
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
