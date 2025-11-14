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
    X,
    Users,
    TrendingUp,
    MapPin,
    Briefcase,
    HeartHandshake,
    Gamepad2,
    BookOpen,
    PartyPopper,
    Sparkles,
    Radio,
    Eye,
    Flame
} from "lucide-react";

interface Props {
    user: {
        userId: string;
        lat: number;
        lng: number;
        musicUrl?: string | null;
        status?: "online" | "idle" | "offline";
        mood?: string;
        userStatus?: string;
    };
    myUserId: string;
    setOpenChat: (v: boolean | null) => void;
    socket?: any;
    onlineUsers?: Record<string, any>; // { socketId: userData }
}

export default function UserPopup({ user, myUserId, setOpenChat, socket, onlineUsers = {} }: Props) {
    const [selectedMood, setSelectedMood] = useState<string | null>(user.mood || null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(user.userStatus || null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(user.musicUrl || null);
    const [loading, setLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<"mood" | "info" | null>(null);
    const [nearbyStats, setNearbyStats] = useState({
        total: 0,
        statuses: [] as any[],
        topSongs: [] as any[]
    });

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (!onlineUsers || Object.keys(onlineUsers).length === 0) return;

        const RADIUS_KM = 50;
        const statusCount: Record<string, number> = {};
        const songCount: Record<string, number> = {};
        let nearbyCount = 0;

        // Iterate through socketId -> userData
        Object.entries(onlineUsers).forEach(([socketId, otherUser]: [string, any]) => {
            if (otherUser.userId === myUserId) return;

            const distance = calculateDistance(
                user.lat,
                user.lng,
                otherUser.lat,
                otherUser.lng
            );

            if (distance <= RADIUS_KM) {
                nearbyCount++;

                if (otherUser.userStatus) {
                    statusCount[otherUser.userStatus] = (statusCount[otherUser.userStatus] || 0) + 1;
                }

                if (otherUser.musicUrl) {
                    songCount[otherUser.musicUrl] = (songCount[otherUser.musicUrl] || 0) + 1;
                }
            }
        });

        const statusesArray = [
            { label: "Finding Lover", icon: <HeartHandshake className="w-4 h-4" />, color: "text-pink-400", count: statusCount["Finding Lover"] || 0 },
            { label: "Finding Job", icon: <Briefcase className="w-4 h-4" />, color: "text-blue-400", count: statusCount["Finding Job"] || 0 },
            { label: "Gaming", icon: <Gamepad2 className="w-4 h-4" />, color: "text-purple-400", count: statusCount["Gaming"] || 0 },
            { label: "Studying", icon: <BookOpen className="w-4 h-4" />, color: "text-green-400", count: statusCount["Studying"] || 0 },
            { label: "Listening Music", icon: <Music className="w-4 h-4" />, color: "text-orange-400", count: statusCount["Listening Music"] || 0 },
            { label: "Chilling", icon: <Coffee className="w-4 h-4" />, color: "text-amber-400", count: statusCount["Chilling"] || 0 }
        ].filter(s => s.count > 0);

        const topSongs = Object.entries(songCount)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([url, count]) => ({
                title: url.includes("youtube") ? "YouTube Video" : url.includes("spotify") ? "Spotify Track" : "Media",
                listeners: count,
                url
            }));

        setNearbyStats({
            total: nearbyCount,
            statuses: statusesArray,
            topSongs
        });
    }, [onlineUsers, myUserId, user.lat, user.lng]);

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
        { icon: <Heart className="w-5 h-5" />, label: "Love", emoji: "❤️" },
        { icon: <ThumbsUp className="w-5 h-5" />, label: "Cool", emoji: "😎" },
        { icon: <Zap className="w-5 h-5" />, label: "Energy", emoji: "⚡" },
        { icon: <Coffee className="w-5 h-5" />, label: "Chill", emoji: "☕" },
        { icon: <PartyPopper className="w-5 h-5" />, label: "Party", emoji: "🎉" }
    ];

    const statuses = [
        { icon: <HeartHandshake className="w-5 h-5" />, label: "Finding Lover", color: "from-pink-500 to-rose-500" },
        { icon: <Briefcase className="w-5 h-5" />, label: "Finding Job", color: "from-blue-500 to-cyan-500" },
        { icon: <Gamepad2 className="w-5 h-5" />, label: "Gaming", color: "from-purple-500 to-indigo-500" },
        { icon: <BookOpen className="w-5 h-5" />, label: "Studying", color: "from-green-500 to-emerald-500" },
        { icon: <Music className="w-5 h-5" />, label: "Listening Music", color: "from-orange-500 to-amber-500" },
        { icon: <Coffee className="w-5 h-5" />, label: "Chilling", color: "from-yellow-500 to-orange-500" }
    ];

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        if (searchTerm.includes("youtube.com") || searchTerm.includes("youtu.be") || searchTerm.includes("spotify.com")) {
            setCurrentMediaUrl(searchTerm);
            setSearchResults([]);
            setSearchTerm("");
            return;
        }

        setLoading(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
            if (!apiKey) {
                console.warn("YouTube API key not found");
                setLoading(false);
                return;
            }
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
        setSearchTerm("");
    };

    const handleSelectMood = (mood: string) => {
        setSelectedMood(mood);
        if (socket) {
            socket.emit("update_mood", { userId: myUserId, mood });
        }
    };

    const handleSelectStatus = (status: string) => {
        setSelectedStatus(status);
        if (socket) {
            socket.emit("update_status", { userId: myUserId, userStatus: status });
        }
        setActiveModal(null);
    };

    useEffect(() => {
        if (!currentMediaUrl || !socket) return;
        socket.emit("update_music", {
            userId: myUserId,
            musicUrl: currentMediaUrl
        });
    }, [currentMediaUrl, myUserId, socket]);

    return (
        <>
            <div className="relative flex flex-col items-center bg-gradient-to-br from-neutral-900/95 via-neutral-900/90 to-neutral-800/95 text-white rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 min-w-[340px]">
                
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                        user.status === "online" ? "bg-green-400 shadow-lg shadow-green-400/50" :
                        user.status === "idle" ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" :
                        "bg-gray-400"
                    }`}></div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                        {selectedMood && <span>{moods.find(m => m.label === selectedMood)?.emoji}</span>}
                        <span>{selectedMood || "Select mood..."}</span>
                    </div>
                </div>

                {selectedStatus && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5">
                            <Radio className="w-3 h-3 text-purple-300 animate-pulse" />
                            <span className="text-xs font-medium text-purple-200">{selectedStatus}</span>
                        </div>
                    </div>
                )}

                <div className="w-80 mt-10 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 backdrop-blur-md shadow-xl">
                    {embedUrl ? (
                        <div className={`relative ${currentMediaUrl?.includes("spotify.com") ? "h-24" : "h-48"}`}>
                            <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-sm text-white/40">
                            <Music className="w-8 h-8 mb-2 opacity-30" />
                            <span>No media playing</span>
                        </div>
                    )}
                </div>

                <div className="w-full mt-5 flex items-center gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search YouTube or paste link..."
                        className="flex-1 px-4 text-sm py-2.5 rounded-xl bg-neutral-800/60 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/20"
                    >
                        <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-3 w-full max-h-52 overflow-y-auto border border-white/10 rounded-xl bg-neutral-800/70 backdrop-blur-md">
                        {searchResults.map((v, index) => (
                            <button
                                key={v.id?.videoId ?? index}
                                onClick={() => handleSelectVideo(v.id.videoId)}
                                className="flex items-center gap-3 w-full p-2.5 hover:bg-white/10 text-left transition-all"
                            >
                                <img
                                    src={v.snippet.thumbnails.default.url}
                                    alt={v.snippet.title}
                                    className="w-16 h-9 rounded-md object-cover"
                                />
                                <div className="flex-1 text-xs text-white line-clamp-2">
                                    {v.snippet.title}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 w-full mt-6">
                    <button
                        onClick={() => setActiveModal("mood")}
                        className="group flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-yellow-500/90 to-orange-500/90 text-white font-medium shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-yellow-400/20"
                    >
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-semibold">Mood</span>
                    </button>

                    <button
                        onClick={() => setOpenChat(true)}
                        className="group flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-sky-500/90 to-blue-600/90 text-white font-medium shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-sky-400/20"
                    >
                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Chat</span>
                    </button>

                    <button
                        onClick={() => setActiveModal("info")}
                        className="group flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 text-white font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-green-400/20 relative"
                    >
                        {nearbyStats.total > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse shadow-lg">
                                {nearbyStats.total}
                            </div>
                        )}
                        <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Insights</span>
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-5 pt-5 border-t border-white/5 w-full">
                    {moods.map((mood, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectMood(mood.label)}
                            className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                                selectedMood === mood.label
                                    ? "bg-white text-black border-white shadow-lg scale-110"
                                    : "border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                            }`}
                            title={mood.label}
                        >
                            <span className="text-xl">{mood.emoji}</span>
                        </button>
                    ))}
                </div>
            </div>

            {activeModal === "mood" && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setActiveModal(null)}>
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 w-96 border border-white/10 shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                                Choose Your Vibe
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-2 rounded-full hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
                                    <Radio className="w-4 h-4" />
                                    Broadcast Your Status
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {statuses.map((status, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectStatus(status.label)}
                                            className={`flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r ${status.color} hover:scale-105 transition-all border ${
                                                selectedStatus === status.label
                                                    ? "border-white shadow-lg ring-2 ring-white/50"
                                                    : "border-white/20"
                                            }`}
                                        >
                                            {status.icon}
                                            <span className="text-xs font-medium text-white">
                                                {status.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === "info" && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setActiveModal(null)}>
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 w-[28rem] border border-white/10 shadow-2xl animate-scaleIn max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Eye className="w-6 h-6 text-green-400" />
                                Nearby Insights
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-2 rounded-full hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {nearbyStats.total === 0 ? (
                            <div className="text-center py-8 text-white/40">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No one nearby right now</p>
                                <p className="text-xs mt-1">Be the first to explore!</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-8 h-8 text-green-400" />
                                            <div>
                                                <p className="text-sm text-white/60">Within 50km</p>
                                                <p className="text-3xl font-bold text-white">{nearbyStats.total}</p>
                                            </div>
                                        </div>
                                        <div className="text-green-400">
                                            <Flame className="w-8 h-8 animate-pulse" />
                                        </div>
                                    </div>
                                </div>

                                {nearbyStats.statuses.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            What People Are Doing
                                        </h4>
                                        <div className="space-y-2">
                                            {nearbyStats.statuses.map((status, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={status.color}>{status.icon}</div>
                                                        <span className="text-sm text-white">{status.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${(status.count / nearbyStats.total) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-bold text-white w-8 text-right">
                                                            {status.count}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {nearbyStats.topSongs.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                                            <Music className="w-4 h-4" />
                                            Trending Nearby
                                        </h4>
                                        <div className="space-y-2">
                                            {nearbyStats.topSongs.map((song, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 hover:border-purple-400/40 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-sm text-white/90">{song.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                                        <Users className="w-3 h-3" />
                                                        <span>{song.listeners}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
            `}</style>
        </>
    );
}