"use client";

import { useState } from "react";

export default function PostForm() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // send to backend later
    console.log({ text, image });

    setText("");
    setImage(null);
    setPreview(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full sticky top-0 max-w-lg mx-auto bg-white rounded-2xl shadow-md p-4 flex flex-col gap-4"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border rounded-xl p-3 focus:outline-none focus:ring focus:ring-blue-300"
      />

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-xl shadow-sm"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setImage(null);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      <label className="cursor-pointer bg-gray-100 rounded-xl p-2 text-center hover:bg-gray-200">
        Upload Image
        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700"
      >
        Post
      </button>
    </form>
  );
}
