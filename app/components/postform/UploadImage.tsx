"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Camera, Trash2, UploadCloud } from "lucide-react";

interface UploadProps {
  onImageChange: (image: File | null) => void;
  value: File | null;
}

export default function UploadImage({ onImageChange, value }: UploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value) {
      // Clean up previous object URL to prevent memory leaks
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(value));
    } else {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    }
    // Cleanup function runs on unmount
    return () => {
        if (preview) URL.revokeObjectURL(preview);
    };
  }, [value]); // Added 'preview' to dependency array only for cleanup logic

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
      // Reset file input value to allow uploading the same file again
      e.target.value = ''; 
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
    <div className="w-full animate-in fade-in-0 duration-200">
      {preview ? (
        <div className="relative w-[120px] group animate-in zoom-in-95 duration-200">
          {/* Image Container */}
          <div className="relative w-[120px] h-[100px] rounded-xl overflow-hidden shadow-2xl border-2 border-green-500/50">
            <Image
              src={preview}
              alt="Preview"
              width={120}
              height={100}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          </div>

          {/* Remove Button - Deep Red, Glowing Effect */}
          <button
            type="button"
            onClick={removeImage}
            className="
              absolute -top-3 -right-3 w-8 h-8 
              bg-gradient-to-br from-red-600 to-red-800 text-white rounded-full 
              shadow-xl shadow-red-700/70 border-2 border-gray-900
              flex items-center justify-center font-extrabold text-sm
              hover:from-red-500 hover:to-red-700 hover:shadow-2xl hover:scale-110
              active:scale-90 transition-all duration-200 z-10
            "
            aria-label="Remove image"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className={`
            flex flex-col justify-center items-center 
            w-[120px] h-[100px] 
            rounded-xl cursor-pointer transition-all duration-300 ease-in-out
            relative overflow-hidden group border-2 border-dashed
            
            ${isDragging
              ? "border-green-400 bg-gray-800/80 shadow-green-500/40 shadow-xl scale-105 text-green-400" // Dragging: Active green border/shadow
              : "border-gray-700 bg-gray-900/70 hover:border-green-500 hover:shadow-lg text-gray-400 hover:text-green-400" // Default: Dark gray
            }
          `}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {/* Icon */}
          <span className={`transition-transform duration-500 mb-1 ${isDragging ? "scale-110" : ""}`}>
            {isDragging 
                ? <UploadCloud size={28} className="text-green-400" /> 
                : <Camera size={28} />
            }
          </span>

          {/* Text */}
          <span className={`text-xs font-semibold px-1 transition-colors duration-200 ${isDragging ? "text-green-300" : "text-gray-400"}`}>
            {isDragging ? "Drop to Upload" : "Add Image"}
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