import { Minus, Plus, X } from "@phosphor-icons/react";
import React, { useState, useRef, useEffect } from "react";

interface Tag {
  id: string;
  label: string;
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  label?: string;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  placeholder = "Ajouter des tags...",
  label,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [visibleTags, setVisibleTags] = useState<Tag[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMore, setShowMore] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    const calculateVisibleTags = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      let currentWidth = 0;
      const tempTags: Tag[] = [];
      let hidden = 0;

      selectedTags.forEach((tag) => {
        // Estimation approximative de la largeur du tag
        const tagWidth = tag.label.length * 8 + 50; // 50px pour les marges et l'icône

        if (currentWidth + tagWidth < containerWidth - 100) {
          // 100px pour le input
          currentWidth += tagWidth;
          tempTags.push(tag);
        } else {
          hidden++;
        }
      });

      setVisibleTags(tempTags);
      setHiddenCount(hidden);
      setShowMore(hidden > 0);
    };

    calculateVisibleTags();
    window.addEventListener("resize", calculateVisibleTags);
    return () => window.removeEventListener("resize", calculateVisibleTags);
  }, [selectedTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleAddTag = () => {
    if (inputValue.trim()) {
      const newTag = {
        id: Math.random().toString(36).substr(2, 9),
        label: inputValue.trim(),
      };
      onTagsChange([...selectedTags, newTag]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: Tag) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagToRemove.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className="min-h-[42px] bg-white p-1 border border-gray-300 rounded flex flex-wrap items-center gap-2 cursor-text px-2 focus-within:ring-2 focus-within:ring-[#14A800] focus-within:border-transparent"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {visibleTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            {tag.label}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        {showMore && (
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
          >
            +{hiddenCount} more
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] outline-none bg-transparent px-2"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            {inputValue && (
              <div
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={handleAddTag}
              >
                <span>Add "{inputValue}"</span>
                <div className="p-[2px] rounded-full bg-blue-500">
                  <Plus color="white" size={8} className="text-white" />
                </div>
              </div>
            )}
            {selectedTags.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">Selected tags</div>
                {selectedTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <span>{tag.label}</span>
                    <div className="p-[2px] rounded-full bg-red-500">
                      <Minus color="white" size={8} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
