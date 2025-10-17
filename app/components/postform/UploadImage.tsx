import Image from "next/image";
import { useState } from "react";

interface UploadProps {
  onImageChange: (image: File | null) => void; // callback
  value: File | null; // controlled state from parent
}

export default function UploadImage({ onImageChange, value }: UploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onImageChange(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <>
      {preview && (
        <div className="relative w-28 h-28">
          <Image
            src={preview}
            alt="Preview"
            width={112}
            height={112}
            className="w-28 h-28 object-cover rounded-xl shadow-sm"
            unoptimized
          />

          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {!preview && (
        <label className="cursor-pointer flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-2 font-medium transition-colors">
          Upload Image
          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
        </label>
      )}
    </>
  );
}
