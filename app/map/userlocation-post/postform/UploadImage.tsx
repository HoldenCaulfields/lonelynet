"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      const file = e.target.files[0];
      onImageChange(file);
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
    <motion.div
      className="flex justify-center w-full" // ✅ FULL WIDTH RESPONSIVE
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            className="relative w-full max-w-[144px] sm:max-w-[160px] md:max-w-[176px] group" // ✅ RESPONSIVE SIZES
            initial={{ scale: 0.9, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Image Container */}
            <div className="relative w-full h-[120px] sm:h-[140px] md:h-[160px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-md"> {/* ✅ RESPONSIVE HEIGHT */}
              <Image
                src={preview}
                alt="Preview"
                width={176}
                height={160}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />

            </div>
            {/* Remove Button */}
            <motion.button
              type="button"
              onClick={removeImage}
              className="
                absolute -top-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 
                bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full 
                shadow-lg shadow-red-500/40 border-2 border-white/30
                flex items-center justify-center font-bold text-sm sm:text-base
                hover:from-red-600 hover:to-red-700 hover:shadow-xl
                active:scale-95 transition-all duration-200
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕
            </motion.button>

            {/* Success Ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-green-400/60"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            />
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            htmlFor="image-upload"
            className={`
              flex flex-col justify-center items-center 
              w-full max-w-[144px] sm:max-w-[160px] md:max-w-[160px] /* ✅ RESPONSIVE WIDTH */
              h-[120px] sm:h-[120px] md:h-[120px] /* ✅ RESPONSIVE HEIGHT */
              rounded-2xl p-1 sm:p-1  text-center cursor-pointer transition-all duration-300
              relative overflow-hidden group
              ${isDragging 
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/50 scale-105" 
                : "bg-white/70 backdrop-blur-md border-2 border-dashed border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg"
              }
            `}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated Icon */}
            <motion.div
              animate={isDragging ? { rotate: 360, scale: 1.2 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="mb-1 sm:mb-2 text-2xl sm:text-3xl md:text-4xl" // ✅ RESPONSIVE ICON
            >
              {isDragging ? "✨" : "📷"}
            </motion.div>

            {/* Text */}
            <motion.span className="text-xs sm:text-sm md:text-base font-medium text-gray-700 group-hover:text-gray-900 px-1">
              {isDragging ? "Drop here!" : "Upload Image"}
            </motion.span>
            <motion.span className="text-xs text-gray-400 mt-0.5 sm:mt-1 px-1">
              {isDragging ? "PNG, JPG up to 5MB" : "Click or drag"}
            </motion.span>

            {/* Hidden Input */}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            {/* Glow / Shimmer */}
            <motion.div
              className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-blue-400/50"
              animate={{ 
                boxShadow: isDragging 
                  ? "0px 0px 20px rgba(59,130,246,0.6)" 
                  : "0px 0px 0px rgba(0,0,0,0)" 
              }}
              transition={{ duration: 0.4 }}
            />

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.label>
        )}
      </AnimatePresence>
    </motion.div>
  );
}