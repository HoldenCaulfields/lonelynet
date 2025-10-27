"use client";

import { useState, useRef } from "react";
import { tagIcons } from "../userlocation-post/postform/TagList";
import { Ghost } from "lucide-react";

interface TagsProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function Tags({ tags, selectedTag, onTagSelect }: TagsProps) {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag scroll manually
  const handleScrollDrag = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    const startX = e.pageX - scrollRef.current.offsetLeft;
    const scrollLeft = scrollRef.current.scrollLeft;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - scrollRef.current!.offsetLeft;
      const walk = (x - startX) * 1.2;
      scrollRef.current!.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleTagClick = (tag: string | null) => {
    onTagSelect(tag);
    // Smoothly scroll back to start
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className="relative w-full py-2 overflow-hidden bg-transparent cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onMouseDown={handleScrollDrag}
    >
      <div
        ref={scrollRef}
        className={`flex space-x-2 whitespace-nowrap overflow-x-auto scrollbar-hide scroll-smooth ${
          paused ? "animate-none" : "animate-marquee"
        }`}
      >
        {[...tags, ...tags].map((tag, i) => (
          <span
            key={i}
            onClick={() => handleTagClick(tag)}
            className={`flex items-center gap-1 flex-shrink-0 px-3 py-1 text-xs font-semibold uppercase rounded-full cursor-pointer transition-all duration-300 transform active:scale-90 ${
              selectedTag === tag
                ? "bg-white text-black border border-gray-300 shadow-md"
                : "bg-black text-white hover:bg-gray-800 hover:shadow-md"
            }`}
          >
            {tagIcons[tag] ?? <Ghost size={14} />}
            {tag}
          </span>
        ))}

        {selectedTag && (
          <span
            onClick={() => handleTagClick(null)}
            className="flex-shrink-0 px-3 py-1 text-xs font-bold uppercase rounded-full cursor-pointer bg-gray-500 text-white active:scale-90"
          >
            ✕ Clear
          </span>
        )}
      </div>
    </div>
  );
}
