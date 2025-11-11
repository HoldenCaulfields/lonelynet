"use client";
import { useState } from "react";
import { Music2 } from "lucide-react";
import { socket } from "@/app/components/utils/socket";

interface Props {
    setMusicUrl: (url: string | null) => void;
}

export default function MusicBox({ setMusicUrl}: Props) {
  const [showBox, setShowBox] = useState(false);
  const [inputUrl, setInputUrl] = useState("");

  return (
    <div>
      <button
        onClick={() => setShowBox(!showBox)} 
        className="flex items-center gap-2 hover:text-blue-400 transition-colors duration-200 cursor-pointer"
      >
        <Music2 className="w-4 h-4" />
        <span>Music</span>
      </button>

      {showBox && (
        <div className="absolute top-16 right-4 bg-white/20 border border-white/30 rounded-xl shadow-lg p-4 w-80">
          <p className="text-sm font-semibold text-white mb-2">🎧 Add YouTube / Spotify link</p>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-md bg-white/70 text-black focus:outline-none"
          />
          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={() => setShowBox(false)}
              className="px-3 py-1 rounded-md bg-gray-400/30 text-white hover:bg-gray-400/50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setMusicUrl(inputUrl);
                setShowBox(false);
              }}
              className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium shadow"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
