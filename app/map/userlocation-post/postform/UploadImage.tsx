"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface UploadProps {
  onImageChange: (image: File | null) => void;
  value: File | null;
}

export default function UploadImage({ onImageChange, value }: UploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(URL.createObjectURL(value));
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragging(false);
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex justify-center w-full animate-in fade-in-0 duration-200">
      {preview ? (
        <div className="relative w-full max-w-[120px] group animate-in zoom-in-95 duration-200">
          {/* Image Container */}
          <div className="relative w-full h-[100px] rounded-xl overflow-hidden shadow-xl border-4 border-transparent p-0.5">
            <div className="w-full h-full rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                width={120}
                height={100}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
            </div>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={removeImage}
            className="
              absolute -top-2 -right-2 w-7 h-7 
              bg-gradient-to-br from-red-400 to-red-600 text-white rounded-full 
              shadow-lg shadow-red-500/50 border border-white/40
              flex items-center justify-center font-bold text-sm
              hover:from-red-500 hover:to-red-700 hover:shadow-xl hover:scale-110
              active:scale-95 transition-all duration-200
            "
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className={`
            flex flex-col justify-center items-center 
            w-full max-w-[120px] h-[100px] 
            rounded-xl cursor-pointer transition-all duration-300
            relative overflow-hidden group
            ${isDragging
              ? "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl scale-105 animate-pulse"
              : "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border-2 border-dashed border-blue-400 hover:border-pink-500 shadow-md hover:shadow-lg hover:-translate-y-1"
            }
          `}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {/* Icon */}
          <span className={`text-2xl transition-transform duration-700 ${isDragging ? "rotate-180 scale-125" : ""}`}>
            {isDragging ? "🌈" : "📷"}
          </span>

          {/* Text */}
          <span className="text-xs font-semibold text-gray-700 px-1 transition-colors duration-200">
            {isDragging ? "Drop it!" : "Upload"}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5 px-1">
            PNG / JPG
          </span>

          {/* Hidden Input */}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </label>
      )}
    </div>
  );
}