"use client";

import { useRef, useEffect, useState } from "react";

interface SearchBoxProps {
    searchText: string;
    setSearchText: (text: string) => void;
};

export default function SearchBox({ searchText, setSearchText }: SearchBoxProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(searchText);

  // ⌘K / Ctrl+K → focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Update parent searchText only on Enter
      setSearchText(inputValue);
    }
  };

  return (
    <div className="flex-1 w-full lg:max-w-xl order-2 lg:order-none">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-blue-400 text-lg animate-pulse">🔍</span>
        </div>
        <input
          ref={searchRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress} // trigger on Enter
          placeholder="What's on your mind..."
          className="w-full pl-12 pr-10 py-2 sm:py-3 bg-white/15 backdrop-blur-xl rounded-full 
                     border border-white/20 text-white placeholder-gray-300 font-medium text-base sm:text-lg 
                     focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 
                     transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
        />
        <div className="absolute inset-y-0 right-0 pr-1.5 py-1.5 sm:flex items-center cursor-pointer" 
          onClick={() => setSearchText(inputValue)}>
          <kbd className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm 
                          text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-full text-blue-300 
                          font-bold border border-blue-500/30">
            ⌘ Search
          </kbd>
        </div>
      </div>
    </div>
  );
}
