import { CaretDown, X } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  label?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  label,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={`bg-white h-[42px] px-3 border border-gray-300 rounded flex items-center justify-between cursor-pointer ${
          isOpen || isFocused ? "ring-2 ring-[#14A800] border-transparent" : ""
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsFocused(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
            setIsFocused(true);
          }
        }}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center flex-1">
          {selectedOption ? (
            <span>{selectedOption.label}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="hover:bg-gray-100 rounded-full p-1"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
          <CaretDown size={20} className="text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2 cursor-pointer ${
                option.value === value
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
