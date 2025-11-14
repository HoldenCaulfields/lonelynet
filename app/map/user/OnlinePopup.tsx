"use client";

import React from "react";
import { MessageCircle, Music, Smile } from "lucide-react";
import { socket } from "@/app/components/utils/socket";

interface Props {
  user: {
    userId: string;
    lat: number;
    lng: number;
    musicUrl?: string | null;
    status?: "online" | "idle" | "offline";
  };
  myUserId: string;
  setRoomId: (id: string) => void;
  setShowChat: (v: boolean) => void;
}

export default function OnlinePopup({
  user,
  myUserId,
  setRoomId,
  setShowChat,
}: Props) {
  const getEmbedUrl = (url: string | null) => {
    if (!url) return null;

    if (url.includes("youtube.com/watch")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("spotify.com/track/")) {
      const id = url.split("track/")[1]?.split("?")[0];
      return `https://open.spotify.com/embed/track/${id}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(user.musicUrl || null);

  const handleChat = () => {
    const from = myUserId;
    const to = user.userId;
    const room = [from, to].sort().join("_");

    socket.emit("start_chat", { from, to });
    setRoomId(room);
    setShowChat(true);
  };

  return (
    <div className="relative flex flex-col items-center bg-neutral-900/70 text-white rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.08)] p-5 animate-fadeIn">
      {/* Status */}
      <div className="absolute top-3 left-3 flex items-center gap-2 text-xs text-neutral-300">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            user.status === "online"
              ? "bg-green-500"
              : user.status === "idle"
              ? "bg-yellow-400"
              : "bg-gray-500"
          }`}
        ></div>
        <span>{user.status}</span>
      </div>

      {/* Media */}
      <div className="w-72 mt-7 rounded-xl overflow-hidden border border-white/10 bg-neutral-800/40 backdrop-blur-sm">
        {embedUrl ? (
          <div
            className={`relative ${
              user.musicUrl?.includes("spotify.com") ? "h-21" : "h-40"
            }`}
          >
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[120px] text-sm text-white/50">
            No media
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-between w-full mt-5 gap-3">
        <button
          onClick={handleChat}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-b from-sky-500 to-sky-600 text-white font-medium shadow-lg hover:shadow-sky-400/30 hover:scale-105 active:scale-95 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">Chat</span>
        </button>

        <button
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-b from-green-500 to-green-600 text-white font-medium shadow-lg hover:shadow-green-400/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Music className="w-5 h-5" />
          <span className="text-xs">Info</span>
        </button>
      </div>
    </div>
  );
}
