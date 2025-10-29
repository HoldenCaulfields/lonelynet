"use client";

import { useState, KeyboardEvent } from "react";
import { TagList } from "./TagList";

interface Category {
  name: string;
  icon: React.ReactElement;
  color: string;
  isCustom?: boolean;
}

interface Props {
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
}

export default function Tags({
  selectedCategories,
  setSelectedCategories,
}: Props) {
  const [categories, setCategories] = useState<Category[]>(TagList);
  const [tagInput, setTagInput] = useState("");

  // 🔥 Toggle select/unselect
  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  // 🔥 Add custom category
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newCategoryName = tagInput.trim();

      if (!categories.find((c) => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
        const newCategory: Category = {
          name: newCategoryName,
          icon: <span>🏷️</span>,
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
          isCustom: true,
        };
        setCategories([...categories, newCategory]);
      }

      if (!selectedCategories.includes(newCategoryName)) {
        setSelectedCategories([...selectedCategories, newCategoryName]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput) {
      setSelectedCategories(selectedCategories.slice(0, -1));
    }
  };

  // 🔥 Add custom category
  const handleTagInput = (value: string) => {
    setTagInput(value);
  };

  const handleTagSubmit = () => {
    const newCategoryName = tagInput.trim();
    if (!newCategoryName) return;

    if (!categories.find((c) => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
      const newCategory: Category = {
        name: newCategoryName,
        icon: <span>🏷️</span>,
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        isCustom: true,
      };
      setCategories([...categories, newCategory]);
    }

    if (!selectedCategories.includes(newCategoryName)) {
      setSelectedCategories([...selectedCategories, newCategoryName]);
    }

    setTagInput("");
  };

  return (
    <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
      {categories.map((cat) => {
        const isSelected = selectedCategories.includes(cat.name);
        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => toggleCategory(cat.name)}
            className={`
              flex items-center px-1 rounded-full border-2 font-medium text-sm select-none flex-shrink-0
              backdrop-blur-sm transition-all duration-200 ease-out group
              ${isSelected
                ? `${cat.color} text-white border-transparent shadow-lg shadow-[${cat.color}/0.3] hover:shadow-xl hover:shadow-[${cat.color}/0.4] scale-105 active:scale-95`
                : "bg-white/80 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-white/90 hover:shadow-md active:scale-95"
              }
            `}
          >
            <span className={`flex-shrink-0 w-5 h-5 ${isSelected ? "animate-spin-once" : ""}`}>
              {cat.icon}
            </span>
            <span className="tracking-wide">{cat.name}</span>
            {isSelected && (
              <span className="w-2 h-2 rounded-full bg-white/80 ml-1 animate-in fade-in-0 scale-100" />
            )}
          </button>
        );
      })}

      <div className="flex-shrink-0 w-[140px]">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => handleTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleTagSubmit();
            }
          }}
          onBlur={() => {
            if (tagInput.trim()) handleTagSubmit();
          }}
          placeholder="✨ Add category..."
          inputMode="text"
          enterKeyHint="done"
          className="
      w-full px-4 py-2.5 rounded-full font-medium text-sm outline-none
      bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700
      border-2 border-gray-200 hover:border-gray-300 
      focus:border-purple-300 focus:ring-4 focus:ring-purple-100/50
      transition-all duration-200 shadow-sm hover:shadow-md
      placeholder-gray-400 placeholder:font-normal
      text-[16px]  /* ✅ prevents Safari zoom */
    "
        />
      </div>

    </div>
  );
}