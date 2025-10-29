"use client";

import { useState } from "react";
import axios from "axios";
import UploadImage from "./UploadImage";
import Tags from "./Tags";
import { useRouter } from "next/navigation";
import { Send, Image as ImageIcon, Tag, Loader2 } from "lucide-react"; // Import Lucide icons

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
      // ✨ More sophisticated dark background with a subtle radial gradient, deeper shadow
      className="w-full sticky top-6 max-w-xl mx-auto bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900
                 rounded-2xl shadow-glow-lg p-6 flex flex-col gap-6 border border-gray-800 animate-in fade-in-0 duration-300"
    >
      <h2 className="text-2xl font-extrabold text-white mb-2 tracking-wide flex items-center gap-3">
        <Send size={28} className="text-green-400" /> Create a New Soul
      </h2>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts, maybe someone out there will find you..."
          // ✨ Darker input, subtle inner shadow, more prominent green focus
          className="w-full border border-gray-700 rounded-xl p-4 resize-none min-h-[120px]
                     focus:outline-none focus:ring-3 focus:ring-green-500/60 placeholder-gray-500
                     bg-gray-800 text-gray-100 shadow-inner shadow-black/30 transition-all duration-200
                     text-base font-medium"
        />
      </div>

      {/* Upload Image Section */}
      <div className="flex items-center gap-3 text-gray-300">
        <ImageIcon size={20} className="text-green-400" />
        <span className="font-semibold">Add a Memory:</span>
        <UploadImage value={image} onImageChange={setImage} />
      </div>

      {/* Tags Section */}
      <div className="flex items-center gap-3 text-gray-300">
        <Tag size={20} className="text-green-400" />
        <span className="font-semibold"></span>
        <Tags
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
      </div>


      {/* Submit Button */}
      <button
        disabled={loading}
        className={`flex items-center justify-center gap-3 py-3 rounded-full 
          font-extrabold text-gray-900 shadow-lg transition-all duration-300 ease-in-out
          text-lg tracking-wider
          ${loading
            // ✨ Loading state: Subtle pulse, lighter gray for contrast
            ? "bg-gray-700 text-gray-400 cursor-not-allowed animate-pulse"
            // ✨ Active state: Vibrant gradient green, prominent glowing shadow
            : "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 active:scale-98 shadow-green-500/50 hover:shadow-green-500/70"
          }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 size={20} className="animate-spin text-gray-100" />
            <span className="text-gray-100">Casting Soul...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Send size={20} /> Post Soul
          </div>
        )}
      </button>
    </form>
  );
}