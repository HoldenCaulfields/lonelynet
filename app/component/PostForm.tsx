"use client";

import { useState, KeyboardEvent } from "react";

interface Category {
  name: string;
  icon: React.ReactElement;
  color: string;
  isCustom?: boolean;
}

interface Address {
    lat: number;
    lng: number;
}

export default function PostForm({ address }: { address: Address }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { name: "lonely", icon: <span>😔</span>, color: "bg-purple-400" },
    { name: "find job", icon: <span>💼</span>, color: "bg-green-400" },
    { name: "lover", icon: <span>❤️</span>, color: "bg-pink-400" },
    { name: "music", icon: <span>🎵</span>, color: "bg-red-400" },
    { name: "books", icon: <span>📚</span>, color: "bg-yellow-400" },
  ]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Toggle selection
  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  // Add custom category from input
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newCategoryName = tagInput.trim();
      // check if already exists
      if (!categories.find((c) => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
        const newCategory: Category = {
          name: newCategoryName,
          icon: <span>🏷️</span>,
          color: "bg-gray-400",
          isCustom: true,
        };
        setCategories([...categories, newCategory]);
      }
      // select the new/existing category
      if (!selectedCategories.includes(newCategoryName)) {
        setSelectedCategories([...selectedCategories, newCategoryName]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput) {
      setSelectedCategories(selectedCategories.slice(0, -1));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };


  //handle submit:
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("address", JSON.stringify(address)); // send as string
    selectedCategories.forEach((tag) => formData.append("tags[]", tag));
    images.forEach((img) => formData.append("images", img));

    const response = await fetch("http://localhost:5000/api/lonelyland", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to post");
    }

    const data = await response.json();
    console.log("Post successful:", data);

    // Reset form
    setText("");
    setImages([]);
    setPreviews([]);
    setSelectedCategories([]);
    setTagInput("");
  } catch (error) {
    console.error("Error posting:", error);
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="w-full sticky top-4 max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4"
    >
      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
      />

      {/* Images Preview */}
      {previews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {previews.map((src, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={src}
                alt={`Preview ${index}`}
                className="w-28 h-28 object-cover rounded-xl shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Images */}
      <label className="cursor-pointer flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-2 font-medium transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-2a4 4 0 014-4h8a4 4 0 014 4v2m-4 4h4m-4 0h-4m-4-4v4m0 0v-4m0 0H8m0 0h4" />
        </svg>
        Upload Images
        <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
      </label>

      {/* Categories */}
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

        {/* Add new category input */}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add category..."
          className="flex-shrink-0 outline-none border-none px-3 py-1 rounded-full bg-gray-100 text-sm placeholder-gray-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
      >
        Post
      </button>
    </form>
  );
}
