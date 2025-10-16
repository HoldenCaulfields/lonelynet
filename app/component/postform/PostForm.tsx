"use client";

import { useState } from "react";
import axios from "axios";
import UploadImage from "./UploadImage";
import Tags from "./Tags";

interface Address {
  lat: number;
  lng: number;
}

export default function PostForm({ address }: { address: Address }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (error: any) {
      console.error("Error posting:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full sticky top-4 max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-5 flex flex-col gap-4"
    >
      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
      />

      {/* Upload */}
      <UploadImage value={image} onImageChange={setImage} />

      {/* Categories */}
      <Tags
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        } text-white font-semibold py-2 rounded-xl transition-colors shadow-sm`}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
