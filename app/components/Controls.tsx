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

export default function Controls({
    onLocationClick,
    setRoomId,
    openForm,
    setOpenForm,
}: ControlsProps) {
    const [active, setActive] = useState<"chat" | "post" | "location" | null>(
        null
    );
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

    // 🎨 Tông trắng đen hiện đại, đơn giản
    const buttons = [
        {
            id: "chat",
            label: "Group Chat",
            icon: <MessageCircle size={22} />,
            gradient: "from-black via-gray-900 to-black",
            hover: "hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:bg-gray-800",
            text: "text-white",
            action: () => setActive("chat"),
        },
        {
            id: "post",
            label: "Create Soul",
            icon: <Edit size={22} />,
            gradient: "from-black via-gray-900 to-black",
            hover: "hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:bg-gray-800",
            text: "text-white",
            action: () => fetchLocation(() => setActive("post")),
        },
        {
            id: "location",
            label: "Location",
            icon: <MapPin size={22} />,
            gradient: "from-black via-gray-900 to-black",
            hover: "hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:bg-gray-800",
            text: "text-white",
            action: () => fetchLocation(() => setActive("location")),
        },
    ];

    return (
        <>
            {/* ⚪ Floating Buttons */}
            <div className="fixed bottom-6 right-0 z-[1000] flex flex-col gap-4 md:bottom-8 md:right-8">
                {buttons.map((btn) => (
                    <button
                        key={btn.id}
                        onClick={btn.action}
                        className={`
                            group flex items-center gap-3
                            bg-gradient-to-br ${btn.gradient} ${btn.text}
                            font-medium rounded-full
                            px-4 py-3 sm:px-7 sm:py-4 shadow-md ${btn.hover}
                            transition-all duration-300 ease-in-out
                            hover:scale-105 active:scale-95 border border-gray-200/50
                        `}>
                        {btn.icon}
                        <span className="hidden sm:inline text-sm tracking-wide">
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
                        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
                        onClick={() => {
                            setActive(null);
                            setOpenForm(false);
                        }}
                    >
                        <div
                            className="relative w-full max-w-xl rounded-2xl bg-white text-black border shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 🔴 Close */}
                            <button
                                className="absolute top-4 right-4 z-[900] p-2 rounded-full text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 transition-colors"
                                onClick={() => {
                                    setActive(null);
                                    setOpenForm(false);
                                }}
                            >
                                <XCircle size={24} />
                            </button>

                            <PostForm address={userLocation} />
                        </div>
                    </div>
                )}

                {/* 📍 Location Info */}
                {active === "location" && (
                    <div
                        className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2"
                        onClick={() => setActive(null)}
                    >
                        <UserLocationCard />
                    </div>
                )}
            </div>
        </>
    );
}
