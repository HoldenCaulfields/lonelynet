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

  // Toggle select/unselect
  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  // Add custom category
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newCategoryName = tagInput.trim();

      if (!categories.find((c) => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
        const newCategory: Category = {
          name: newCategoryName,
          icon: <span>🏷️</span>,
          color: "bg-gray-400",
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

  return (
    <div className="flex gap-3 overflow-x-auto py-2">
      {categories.map((cat) => {
        const isSelected = selectedCategories.includes(cat.name);
        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => toggleCategory(cat.name)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors select-none flex-shrink-0
              ${isSelected ? `${cat.color} text-white border-transparent` : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"}`}
          >
            {cat.icon} {cat.name}
          </button>
        );
      })}

      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleTagKeyDown}
        placeholder="Add category..."
        className="flex-shrink-0 outline-none border-none px-3 py-1 rounded-full bg-gray-100 text-sm placeholder-gray-500"
      />
    </div>
  );
}
