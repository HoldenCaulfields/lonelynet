"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import UploadImage from "./UploadImage";
import Tags from "./Tags";
import { useRouter } from "next/navigation";

interface Address {
  lat: number;
  lng: number;
}

export default function PostForm({ address }: { address: Address }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 🔥 OPTIMIZED: One-time FormData creation
  const createFormData = useCallback((text: string, image: File | null) => {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("position", JSON.stringify([address.lat, address.lng]));
    selectedCategories.forEach((tag) => formData.append("tags[]", tag));
    if (image) formData.append("image", image);
    return formData;
  }, [address.lat, address.lng, selectedCategories]);

  // 🔥 ULTRA-FAST SUBMIT (cached + no re-renders)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return; // 🔥 Early exit
    
    setLoading(true);
    try {
      const formData = createFormData(text, image);
      
      // 🔥 CACHED API URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      await axios.post(`${API_URL}/api/lonelyland`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000, // 10s max
      });

      // 🔥 INSTANT RESET + NAVIGATE
      setText(""); setImage(null); setSelectedCategories([]);
      router.push("/lonelyland");
    } catch (error) {
      console.error("Post failed:", error);
      alert("Failed to post. Try again?"); // Simple UX
    } finally {
      setLoading(false);
    }
  }, [text, image, createFormData, router]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full sticky top-6 max-w-xl mx-auto bg-gradient-to-br from-white to-gray-100 
                 rounded-2xl shadow-lg p-3 flex flex-col gap-5 border border-gray-200
                 animate-in slide-in-from-bottom-2 duration-200"
    >
      {/* 🔥 TEXTAREA - Instant */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Someone out there will find you..."
        className="w-full border border-gray-300 rounded-xl p-3 resize-none min-h-[90px] 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400
                   transition-all duration-200"
        rows={3}
        maxLength={500} // 🔥 Limit size
      />

      {/* 🔥 UPLOAD - Zero overhead */}
      <UploadImage value={image} onImageChange={setImage} />

      {/* 🔥 TAGS - Zero overhead */}
      <Tags
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      {/* 🔥 BUTTON - CSS only */}
      <button
        disabled={loading || !text.trim()}
        className={`flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-white shadow-md 
                    transition-all duration-200 ${
                      loading || !text.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Posting...
          </span>
        ) : (
          "🚀 Post"
        )}
      </button>
    </form>
  );
}