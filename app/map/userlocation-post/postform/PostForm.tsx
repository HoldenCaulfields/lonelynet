"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("position", JSON.stringify([address.lat, address.lng]));
      selectedCategories.forEach((tag) => formData.append("tags[]", tag));
      if (image) formData.append("image", image);

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lonelyland`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Post successful:", data);

      // reset
      setText("");
      setImage(null);
      setSelectedCategories([]);

      router.push("/lonelyland");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error posting:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full sticky top-6 max-w-xl mx-auto bg-gradient-to-br from-white to-gray-100 
                 rounded-2xl shadow-lg p-3 flex flex-col gap-5 border border-gray-200"
    >
      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full border border-gray-300 rounded-xl p-3 resize-none min-h-[90px] 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400
                   transition-all"
      />

      {/* Upload */}
      <UploadImage value={image} onImageChange={setImage} />

      {/* Tags */}
      <Tags
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      {/* Submit */}
      <button
        disabled={loading}
        className={`flex items-center justify-center gap-2 py-2 rounded-xl 
          font-semibold text-white shadow-md transition-all 
          ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Posting...
          </div>
        ) : (
          <div className="flex items-center gap-2">🚀 Post</div>
        )}
      </button>
    </form>
  );
}
