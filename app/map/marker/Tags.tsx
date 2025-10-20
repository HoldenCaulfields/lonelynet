"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { tagIcons } from "../userlocation-post/postform/TagList";
import { Ghost } from "lucide-react";

interface TagsProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function Tags({ tags, selectedTag, onTagSelect }: TagsProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden py-2 bg-transparent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => setPaused(true)} // stop moving when clicked
    >
      <div
        className={`flex space-x-2 whitespace-nowrap ${paused ? "animate-none" : "animate-marquee"
          }`}
      >
        {/* duplicate tags to make smooth infinite scroll */}
        {[...tags, ...tags].map((tag, i) => (
          <span
            key={i}
            onClick={() => onTagSelect(tag)}
            className={`flex items-center gap-1 flex-shrink-0 px-3 py-1 text-xs font-semibold uppercase rounded-full cursor-pointer transition-all duration-300 ${selectedTag === tag
                ? "bg-white text-black border border-gray-300 shadow-md"
                : "bg-black text-white hover:bg-gray-800 hover:shadow-md"
              }`}
          >
            {tagIcons[tag] ?? <Ghost size={14} />} {/* fallback icon */}
            {tag}
          </span>
        ))}
        {selectedTag && (
          <span
            onClick={() => onTagSelect(null)}
            className="flex-shrink-0 px-3 py-1 text-xs font-bold uppercase rounded-full cursor-pointer bg-gray-500 text-white"
          >
            ✕ Clear
          </span>
        )}
      </div>
    </div>
  );
}
