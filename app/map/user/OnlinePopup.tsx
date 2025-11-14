"use client";

import React, { useState, useEffect } from "react";
import {
    MessageCircle,
    Music,
    Smile,
    Heart,
    ThumbsUp,
    Hand,
    MapPin,
    Clock,
    Zap,
    Star,
    Send,
    X,
    Radio,
    Eye,
    Sparkles,
    Gift,
    Coffee,
    Headphones
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
    myLocation?: { lat: number; lng: number };
    setRoomId: (id: string) => void;
    setShowChat: (v: boolean) => void;
    socket?: any;
}

export default function OnlinePopup({
    user,
    myUserId,
    myLocation,
    setRoomId,
    setShowChat,
    socket
}: Props) {
    const [activeModal, setActiveModal] = useState<"info" | "poke" | null>(null);
    const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Calculate distance
    useEffect(() => {
        if (!myLocation) return;
        const R = 6371; // Earth radius in km
        const dLat = (user.lat - myLocation.lat) * Math.PI / 180;
        const dLon = (user.lng - myLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(myLocation.lat * Math.PI / 180) * Math.cos(user.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setDistance(Math.round(R * c * 10) / 10);
    }, [myLocation, user.lat, user.lng]);

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

        if (socket) {
            socket.emit("start_chat", { from, to });
        }
        setRoomId(room);
        setShowChat(true);
    };

    const reactions = [
        { icon: "👋", label: "Wave", color: "from-yellow-400 to-orange-400" },
        { icon: "❤️", label: "Love", color: "from-pink-500 to-rose-500" },
        { icon: "👍", label: "Like", color: "from-blue-500 to-cyan-500" },
        { icon: "😊", label: "Smile", color: "from-green-500 to-emerald-500" },
        { icon: "🔥", label: "Fire", color: "from-red-500 to-orange-600" },
        { icon: "⚡", label: "Zap", color: "from-purple-500 to-pink-500" }
    ];

    const handleSendReaction = (reaction: string) => {
        if (socket) {
            socket.emit("send_reaction", {
                from: myUserId,
                to: user.userId,
                reaction,
                timestamp: Date.now()
            });
        }
        setSelectedReaction(reaction);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setActiveModal(null);
        }, 1500);
    };

    const getMoodEmoji = (mood?: string) => {
        const moodMap: Record<string, string> = {
            "Happy": "😊",
            "Love": "❤️",
            "Cool": "😎",
            "Energy": "⚡",
            "Chill": "☕",
            "Party": "🎉"
        };
        return mood ? moodMap[mood] || "😊" : null;
    };

    const getStatusColor = (status?: string) => {
        const colors: Record<string, string> = {
            "Finding Lover": "from-pink-500/20 to-rose-500/20 border-pink-400/30",
            "Finding Job": "from-blue-500/20 to-cyan-500/20 border-blue-400/30",
            "Gaming": "from-purple-500/20 to-indigo-500/20 border-purple-400/30",
            "Studying": "from-green-500/20 to-emerald-500/20 border-green-400/30",
            "Listening Music": "from-orange-500/20 to-amber-500/20 border-orange-400/30",
            "Chilling": "from-yellow-500/20 to-orange-500/20 border-yellow-400/30"
        };
        return status ? colors[status] || "from-gray-500/20 to-gray-600/20 border-gray-400/30" : "";
    };

    return (
        <div className="relative">
            <div className="relative flex flex-col items-center bg-gradient-to-br from-neutral-900/95 via-neutral-900/90 to-neutral-800/95 text-white rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 min-w-[340px]">
                
                {/* Status & Info Header */}
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                            user.status === "online" ? "bg-green-400 shadow-lg shadow-green-400/50" :
                            user.status === "idle" ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" :
                            "bg-gray-400"
                        }`}></div>
                        <span className="text-xs font-medium text-white/80 capitalize">{user.status}</span>
                    </div>
                    {user.mood && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <span>{getMoodEmoji(user.mood)}</span>
                            <span className="text-white/70">{user.mood}</span>
                        </div>
                    )}
                </div>

                {/* Distance Badge */}
                {distance !== null && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-400/30 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-sky-300" />
                            <span className="text-xs font-medium text-sky-200">{distance}km</span>
                        </div>
                    </div>
                )}

                {/* User Status Tag */}
                {user.userStatus && (
                    <div className={`mt-10 px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(user.userStatus)} border backdrop-blur-sm`}>
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 animate-pulse" />
                            <span className="text-sm font-medium">{user.userStatus}</span>
                        </div>
                    </div>
                )}

                {/* Media Section */}
                <div className="w-80 mt-4 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 backdrop-blur-md shadow-xl">
                    {embedUrl ? (
                        <div className={`relative ${user.musicUrl?.includes("spotify.com") ? "h-24" : "h-48"}`}>
                            <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center gap-1">
                                <Headphones className="w-3 h-3 text-green-400" />
                                <span className="text-xs text-white/80">Listening</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-sm text-white/40">
                            <Music className="w-8 h-8 mb-2 opacity-30" />
                            <span>Not playing anything</span>
                        </div>
                    )}
                </div>

                {/* Quick Reactions */}
                <div className="w-full mt-5 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60 font-medium">Quick Reactions</span>
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                    </div>
                    <div className="flex justify-center gap-2">
                        {reactions.slice(0, 4).map((reaction, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendReaction(reaction.icon)}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:scale-110 active:scale-95 transition-all"
                                title={reaction.label}
                            >
                                <span className="text-xl">{reaction.icon}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3 w-full mt-5">
                    <button
                        onClick={() => setActiveModal("poke")}
                        className="group flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-yellow-500/90 to-orange-500/90 text-white font-medium shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-yellow-400/20"
                    >
                        <Hand className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-semibold">Poke</span>
                    </button>

                    <button
                        onClick={handleChat}
                        className="group flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-sky-500/90 to-blue-600/90 text-white font-medium shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-sky-400/20"
                    >
                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Chat</span>
                    </button>

                    <button
                        onClick={() => setActiveModal("info")}
                        className="group flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 text-white font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-green-400/20"
                    >
                        <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold">Info</span>
                    </button>
                </div>

                {/* User ID */}
                <div className="mt-4 text-xs text-white/40 flex items-center gap-1">
                    <span>ID:</span>
                    <code className="px-2 py-0.5 rounded bg-white/5 font-mono">{user.userId}</code>
                </div>
            </div>

            {/* Poke Modal */}
            {activeModal === "poke" && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setActiveModal(null)}>
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 w-96 border border-white/10 shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Hand className="w-6 h-6 text-yellow-400" />
                                Send a Reaction
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-2 rounded-full hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {showSuccess ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mb-4 animate-bounce">
                                    <span className="text-4xl">{selectedReaction}</span>
                                </div>
                                <p className="text-white font-medium">Reaction sent!</p>
                                <p className="text-white/60 text-sm mt-1">They'll see it soon</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {reactions.map((reaction, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendReaction(reaction.icon)}
                                        className={`group flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${reaction.color} hover:scale-105 transition-all shadow-lg border border-white/20 hover:border-white/40`}
                                    >
                                        <span className="text-4xl group-hover:scale-125 transition-transform">{reaction.icon}</span>
                                        <span className="text-xs font-medium text-white">{reaction.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {activeModal === "info" && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setActiveModal(null)}>
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 w-96 border border-white/10 shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Eye className="w-6 h-6 text-green-400" />
                                User Details
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-2 rounded-full hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Status */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        user.status === "online" ? "bg-green-400" :
                                        user.status === "idle" ? "bg-yellow-400" : "bg-gray-400"
                                    }`}></div>
                                    <span className="text-sm font-semibold text-white/80">Status</span>
                                </div>
                                <p className="text-white capitalize">{user.status || "Offline"}</p>
                            </div>

                            {/* Distance */}
                            {distance !== null && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-400/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-sky-400" />
                                        <span className="text-sm font-semibold text-white/80">Distance</span>
                                    </div>
                                    <p className="text-white text-lg font-bold">{distance} km away</p>
                                </div>
                            )}

                            {/* Current Activity */}
                            {user.userStatus && (
                                <div className={`p-4 rounded-xl bg-gradient-to-r ${getStatusColor(user.userStatus)} border`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Radio className="w-4 h-4 animate-pulse" />
                                        <span className="text-sm font-semibold text-white/80">Activity</span>
                                    </div>
                                    <p className="text-white">{user.userStatus}</p>
                                </div>
                            )}

                            {/* Mood */}
                            {user.mood && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm font-semibold text-white/80">Mood</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getMoodEmoji(user.mood)}</span>
                                        <p className="text-white">{user.mood}</p>
                                    </div>
                                </div>
                            )}

                            {/* Coordinates */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4 text-white/60" />
                                    <span className="text-sm font-semibold text-white/80">Location</span>
                                </div>
                                <p className="text-white/60 text-xs font-mono">
                                    {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setActiveModal(null);
                                    handleChat();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm font-semibold">Start Chat</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveModal("poke");
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
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
        </div>
    );
}