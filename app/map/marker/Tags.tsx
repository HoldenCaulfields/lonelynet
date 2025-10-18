"use client";

import axios from "axios";

interface TagsProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void; // update selectedTag in parent
  onMarkersUpdate: (markers: any[]) => void; // update markers in parent
}

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://lonelynet.onrender.com"
    : "http://localhost:5000";

export default function Tags({ tags, selectedTag, onTagSelect, onMarkersUpdate }: TagsProps) {
  const fetchMarkersByTag = async (tag: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland?tag=${tag}`);
      onMarkersUpdate(res.data);
      onTagSelect(tag);
    } catch (err) {
      console.error("Error fetching by tag:", err);
    }
  };

  return (
    <div className="flex overflow-x-auto space-x-2 py-2">
      {tags.map((tag) => (
        <span
          key={tag}
          onClick={() => fetchMarkersByTag(tag)}
          className={`flex-shrink-0 px-3 py-1 text-xs font-bold uppercase rounded-full cursor-pointer ${
            selectedTag === tag
              ? "bg-blue-600 text-white"
              : "bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
