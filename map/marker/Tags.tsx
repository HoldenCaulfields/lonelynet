"use client";

import { useRef, useEffect } from "react";
import { Ghost } from "lucide-react";

interface TagItem {
  name: string;
  icon: string;
  color: string;
}

interface TagsProps {
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function Tags({ selectedTag, onTagSelect }: TagsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Internal list of tags
 const tagList: TagItem[] = [
    { name: "lonely", icon: "😔", color: "#000000" },   // Black
    { name: "findjob", icon: "💼", color: "#000000" },  // Black
    { name: "lover", icon: "❤️", color: "#000000" },    // Black
    { name: "music", icon: "🎵", color: "#000000" },    // Black
    { name: "books", icon: "📚", color: "#000000" },    // Black
    { name: "sport", icon: "🏋️", color: "#000000" },    // Black
    { name: "games", icon: "🎮", color: "#000000" },    // Black
    { name: "tech", icon: "💻", color: "#000000" },     // Black
    { name: "study", icon: "📖", color: "#000000" },    // Black
    { name: "art", icon: "🎨", color: "#000000" },      // Black
    { name: "bored", icon: "😴", color: "#000000" },    // Black
    { name: "just4fun", icon: "🎉", color: "#000000" }, // Black
    { name: "trending", icon: "🔥", color: "#000000" }, // Black
];


  const isPausedRef = useRef(false);

  // Marquee scrolling
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationFrame: number;
    const speed = 0.6;

    const scrollStep = () => {
      if (!isPausedRef.current && container) {
        container.scrollLeft += speed;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }
      animationFrame = requestAnimationFrame(scrollStep);
    };

    animationFrame = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleTagClick = (tag: string | null) => {
    onTagSelect(tag);
    // pause while user clicks
    isPausedRef.current = true;
    setTimeout(() => (isPausedRef.current = false), 800); // resume after small delay
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  return (
    <div
      className="relative w-full overflow-hidden py-2 select-none"
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollRef}
        // 👇 The class below has been changed to 'hide-scrollbar'
        className="flex gap-2 px-2 whitespace-nowrap overflow-x-auto hide-scrollbar cursor-pointer"
      >
        {/* ... Tag rendering logic remains the same ... */}
        {[...tagList, ...tagList].map((tag, i) => {
          const isSelected = selectedTag === tag.name;
          return (
            <button
              key={i}
              onClick={() => handleTagClick(tag.name)}
              className={`flex items-center text-white gap-2 flex-shrink-0 px-4 py-1 rounded-full font-bold uppercase transition-all duration-300 transform border shadow-md text-sm sm:text-base
               ${isSelected ? "scale-70 ring-offset-2" : "hover:scale-105 hover:shadow-lg"}`}
              style={{
                background: `linear-gradient(135deg, ${tag.color}AA, ${tag.color})`,
              }}
            >
              <span className="text-sm">{tag.icon ?? <Ghost size={18} />}</span>
              <span>{tag.name}</span>
            </button>
          );
        })}

        {selectedTag && (
          <button
            onClick={() => handleTagClick(null)}
            className="flex items-center justify-center flex-shrink-0 px-5 py-2.5 text-sm sm:text-base font-bold uppercase rounded-full bg-gradient-to-r from-gray-700 to-gray-500 text-white shadow-lg active:scale-90 hover:from-gray-600 hover:to-gray-400"
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}