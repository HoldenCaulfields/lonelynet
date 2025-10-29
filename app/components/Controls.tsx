"use client";

import { useState } from "react";
import { MessageCircle, Edit, MapPin, XCircle } from "lucide-react";
import GroupList from "./chatbox/GroupList";
import PostForm from "../map/userlocation-post/postform/PostForm";
import UserLocationCard from "./chatbox/UserLocationCard";

interface ControlsProps {
    onLocationClick: (coords: { lat: number; lng: number }) => void;
    setRoomId: (roomId: string) => void;
    openForm: boolean;
    setOpenForm: (value: boolean) => void;
}

export default function Controls({ onLocationClick, setRoomId, openForm, setOpenForm }: ControlsProps) {
    const [active, setActive] = useState<"chat" | "post" | "location" | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
        lat: 0,
        lng: 0,
    });

    const fetchLocation = (callback?: (coords: { lat: number; lng: number }) => void) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(coords);
                    callback?.(coords);
                    onLocationClick(coords);
                },
                () => {
                    const fallback = { lat: 0, lng: 0 };
                    setUserLocation(fallback);
                    callback?.(fallback);
                    onLocationClick(fallback);
                }
            );
        }
    };

    const buttons = [
        {
            id: "chat",
            label: "Group Chat",
            icon: <MessageCircle size={22} />,
            gradient: "from-green-400 via-emerald-500 to-green-600",
            hover: "hover:shadow-[0_0_20px_#22c55e90]",
            action: () => setActive("chat"),
        },
        {
            id: "post",
            label: "Create Soul",
            icon: <Edit size={22} />,
            gradient: "from-cyan-400 via-blue-500 to-indigo-500",
            hover: "hover:shadow-[0_0_20px_#06b6d490]",
            action: () => fetchLocation(() => setActive("post")),
        },
        {
            id: "location",
            label: "Location",
            icon: <MapPin size={22} />,
            gradient: "from-amber-400 via-orange-500 to-red-500",
            hover: "hover:shadow-[0_0_20px_#f9731690]",
            action: () => fetchLocation(() => setActive("location")),
        },
    ];

    return (
        <>
            {/* 🌌 Floating Glass Panel of Buttons */}
            <div className="fixed bottom-6 right-0 z-[1000] flex flex-col gap-4 md:bottom-8 md:right-8">
                {buttons.map((btn) => (
                    <button
                        key={btn.id}
                        onClick={btn.action}
                        className={`
              group flex items-center gap-3
              bg-gradient-to-br ${btn.gradient}
              text-white font-semibold rounded-full
              px-3 py-3 sm:px-7 sm:py-4 shadow-xl ${btn.hover}
              transition-all duration-300 ease-in-out
              hover:scale-105 active:scale-95
              border border-white/10
            `}
                    >
                        <div className="flex items-center justify-center w-9 h-9 bg-white/10 rounded-full backdrop-blur-md">
                            {btn.icon}
                        </div>
                        <span className="hidden sm:inline text-sm tracking-wide drop-shadow-md">
                            {btn.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* ⚡ Panels */}
            <div className="fixed bottom-24 right-6 w-[90vw] max-w-sm md:max-w-md z-[1100]">
                {/* 💬 Group Chat */}
                {active === "chat" && (
                    <GroupList
                        visible={true}
                        onClose={() => setActive(null)}
                        onSelectRoom={(roomId) => setRoomId(roomId)}
                    />
                )}

                {/* 🧠 Post Form */}
                {(active === "post" || openForm) && (
                    <div
                        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
                        onClick={() => {setActive(null); setOpenForm(false)}}
                    >
                        <div
                            className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#202020] to-[#0f0f0f] border border-white/10 shadow-[0_0_40px_#0ff5] overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 🔴 Close Button */}
                            <button
                                className="absolute top-4 right-4 z-[900] p-2 rounded-full text-red-400 hover:text-red-500 bg-black/40 hover:bg-black/60 transition-colors duration-200"
                                onClick={() => {setActive(null); setOpenForm(false)}}
                            >
                                <XCircle size={24} />
                            </button>

                            {/* 🧩 Post Form */}
                            <PostForm address={userLocation} />
                        </div>
                    </div>
                )}

                {/* 📍 Location Info */}
                {active === "location" && (
                    <div
                        className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 animate-in fade-in duration-200"
                        onClick={() => setActive(null)}
                    >
                        <UserLocationCard />
                    </div>
                )}
            </div>
        </>
    );
}
