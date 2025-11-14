"use client";

import React, { useState, useEffect } from "react";
import {
    MessageCircle,
    Smile,
    Heart,
    ThumbsUp,
    Zap,
    Coffee,
    Music,
    Search,
} from "lucide-react";
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
    setOpenChat: (v: boolean | null) => void;
}

export default function UserPopup({
    user,
    myUserId,
    setOpenChat,
}: Props) {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(
        user.musicUrl || null
    );
    const [loading, setLoading] = useState(false);

    // 🎵 Parse media URL
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
        return null;
    };

    const embedUrl = currentMediaUrl ? getEmbedUrl(currentMediaUrl) : null;

    const moods = [
        { icon: <Smile className="w-5 h-5" />, label: "Happy" },
        { icon: <Heart className="w-5 h-5" />, label: "Love" },
        { icon: <ThumbsUp className="w-5 h-5" />, label: "Cool" },
        { icon: <Zap className="w-5 h-5" />, label: "Energy" },
        { icon: <Coffee className="w-5 h-5" />, label: "Chill" },
    ];


    // 🔍 Search YouTube
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        // Nếu là link -> xử lý trực tiếp
        if (searchTerm.includes("youtube.com") || searchTerm.includes("youtu.be") || searchTerm.includes("spotify.com")) {
            setCurrentMediaUrl(searchTerm);
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY; // 👈 đặt trong .env.local
            const res = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
                    searchTerm
                )}&key=${apiKey}`
            );
            const data = await res.json();
            setSearchResults(data.items || []);
        } catch (e) {
            console.error("YouTube search error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectVideo = (videoId: string) => {
        setCurrentMediaUrl(`https://www.youtube.com/watch?v=${videoId}`);
        setSearchResults([]);
    };

    useEffect(() => {
        if (!currentMediaUrl) return;
        socket.emit("update_music", {
            userId: myUserId,
            musicUrl: currentMediaUrl
        });
    }, [currentMediaUrl, myUserId]);


    return (
        <>
            <div className="relative flex flex-col items-center bg-neutral-900/70 text-white rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.08)] p-5 animate-fadeIn">
                {/* 🟢 Status */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-xs text-neutral-300">
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${user.status === "online"
                            ? "bg-green-500"
                            : user.status === "idle"
                                ? "bg-yellow-400"
                                : "bg-gray-500"
                            }`}
                    ></div>
                    <span className="text-green-400">{selectedMood ?? "your feelings..."}</span>
                </div>

                {/* 🎵 Media Section */}
                <div className="w-72 mt-7 rounded-xl overflow-hidden border border-white/10 bg-neutral-800/40 backdrop-blur-sm">
                    {embedUrl ? (
                        <div
                            className={`relative ${currentMediaUrl?.includes("spotify.com") ? "h-21" : "h-40"
                                }`}
                        >
                            <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[120px] text-sm text-white/50">
                            Show music / video here
                        </div>
                    )}
                </div>

                {/* 🔍 Search Input */}
                <div className="w-full mt-4 flex items-center gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                        placeholder="Search YouTube or paste link..."
                        className="flex-1 px-3 text-[16px] md:text-sm py-2 rounded-lg bg-neutral-800 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                    <button
                        onClick={handleSearch}
                        className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 transition"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>

                {/* 📺 Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-3 w-full max-h-52 overflow-y-auto border border-white/10 rounded-xl bg-neutral-800/70 backdrop-blur-md">
                        {loading ? (
                            <div className="p-3 text-center text-sm text-white/60">Searching...</div>
                        ) : (
                            searchResults.map((v, index) => (
                                <button
                                    key={v.id?.videoId ?? index}
                                    onClick={() => handleSelectVideo(v.id.videoId)}
                                    className="flex items-center gap-3 w-full p-2 hover:bg-white/10 text-left"
                                >
                                    <img
                                        src={v.snippet.thumbnails.default.url}
                                        alt={v.snippet.title}
                                        className="w-14 h-9 rounded-md object-cover"
                                    />
                                    <div className="flex-1 text-xs text-white line-clamp-2">
                                        {v.snippet.title}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* 😊 Mood selector */}
                <div className="flex flex-wrap justify-center gap-3 mt-5">
                    {moods.map((mood, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedMood(mood.label)}
                            className={`p-2 rounded-xl border backdrop-blur-sm transition-all duration-200 ${selectedMood === mood.label
                                ? "bg-white text-black border-white"
                                : "border-white/20 text-white hover:bg-white/10"
                                }`}
                            title={mood.label}
                        >
                            {mood.icon}
                        </button>
                    ))}
                </div>

                {/* 🔘 Buttons */}
                <div className="flex justify-between w-full mt-5 gap-3">
                    <button
                        onClick={() => { }}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-b from-yellow-400 to-yellow-500 text-white font-medium shadow-lg hover:shadow-yellow-400/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Smile className="w-5 h-5" />
                        <span className="text-xs">Icon</span>
                    </button>

                    <button
                        onClick={() => setOpenChat(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-b from-sky-500 to-sky-600 text-white font-medium shadow-lg hover:shadow-sky-400/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs">Chat</span>
                    </button>

                    <button
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-b from-green-500 to-green-600 text-white font-medium shadow-lg hover:shadow-green-400/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Music className="w-5 h-5" />
                        <span className="text-xs">Infomation</span>
                    </button>
                </div>

            </div>
        </>
    );
}
