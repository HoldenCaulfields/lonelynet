"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";

interface SearchBoxProps {
  setSearchText: (text: string) => void;
};


export default function SearchBox({setSearchText }: SearchBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchText(inputValue);
    }
  };

  return (
    <div className="flex-1 w-full lg:max-w-xl order-2 lg:order-none">
      <div className="relative group">
        {/* Icon trái */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search
            size={20}
            className="text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-300"
          />
        </div>

        {/* Input */}
        <input
          ref={searchRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="What's on your mind..."
          className="w-full pl-12 pr-20 py-3 bg-white/10 backdrop-blur-2xl
                     border border-white/20 rounded-2xl text-white placeholder-gray-300
                     font-medium text-base sm:text-lg shadow-lg transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                     hover:bg-white/15 hover:shadow-blue-500/20 "
        />

        {/* Nút Search */}
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => setSearchText(inputValue)}
        >
          <button
            className="flex items-center gap-1 text-sm font-semibold text-blue-300 bg-gradient-to-r 
                       from-blue-600/20 to-purple-600/20 px-3 py-1.5 rounded-xl 
                       border border-blue-500/30 backdrop-blur-sm transition-all duration-200
                       hover:scale-105 hover:from-blue-500/30 hover:to-purple-500/30"
          >
            ⌘ Search
          </button>
        </div>
      </div>
    </div>
  );
}
