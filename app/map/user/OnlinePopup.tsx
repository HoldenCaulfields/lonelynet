"use client";

import { MessageCircle } from "lucide-react";
import React, { useEffect } from "react";
import { socket } from "@/app/components/utils/socket";

interface Props {
    user: {
        userId: string;
        lat: number;
        lng: number;
        musicUrl?: string | null;
    };
    myUserId: string;
    setRoomId: (id: string) => void;
    setShowChat: (v: boolean) => void;
    /* musicUrl: string | null; */
}

export default function OnlinePopup({
    user,
    myUserId,
    setRoomId,
    setShowChat,
}: Props) {

    const musicUrl = user.musicUrl;
    // 🔧 Helper: convert youtube/spotify link to embed
    const getEmbedUrl = (url: string) => {
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
        return url;
    };

   console.log("🎼 OnlinePopup gotgffffffffffff:", musicUrl);


    const embedUrl = musicUrl ? getEmbedUrl(musicUrl) : null;


    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-105 hover:bg-white/20 duration-300">

            {/* 🎵 Music / Video Section */}
            {embedUrl && (
                <div className={`w-74 overflow-hidden rounded-xl shadow-lg border border-white/30 transition-all duration-300
                    ${musicUrl?.includes("spotify.com") ? "h-21" : "h-40"}`}>
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
            )}

            {/* 💬 Chat Button */}
            <button
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-medium hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition-all duration-200 shadow-md"
                onClick={() => {
                    const from = myUserId;
                    const to = user.userId;
                    const room = [from, to].sort().join("_");
                    socket.emit("start_chat", { from, to });
                    setRoomId(room);
                    setShowChat(true);
                }}
            >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Chat</span>
            </button>
        </div>
    );
}
