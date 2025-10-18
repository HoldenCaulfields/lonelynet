"use client";

import { useState } from "react";
import axios from "axios";
import UploadImage from "./UploadImage";
import Tags from "./Tags";
import { motion } from "framer-motion";
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

  const router = useRouter(); // ✅ use Next.js router

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

      // ✅ smooth client-side navigation
      router.push("/post");
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
    <motion.form
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="w-full sticky top-6 max-w-xl mx-auto bg-gradient-to-br from-white to-gray-50 
                 rounded-2xl shadow-lg p-6 flex flex-col gap-5 border border-gray-200"
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


      <Tags
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />


      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={loading}
        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl 
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
          <div className="flex items-center gap-2">
            🚀 Post
          </div>
        )}
      </motion.button>
    </motion.form>
  );
}
