"use client";

import { useState } from "react";
import { MessageCircle, Edit, MapPin } from "lucide-react";
import GroupList from "./chatbox/GroupList";
import UserLocationCard from "./chatbox/UserLocationCard";

interface ControlsProps {
    setRoomId: (roomId: string) => void;
    togglePost: () => void;
    showPost: boolean;
}

export default function Controls({ setRoomId, togglePost, showPost }: ControlsProps) {
    const [active, setActive] = useState<"chat" | "post" | "location" | null>(
        null
    );

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
            action: () => togglePost(),
        },
        {
            id: "location",
            label: "Location",
            icon: <MapPin size={22} />,
            gradient: "from-black via-gray-900 to-black",
            hover: "hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:bg-gray-800",
            text: "text-white",
            action: () => setActive("location"),
        },
    ];

    return (
        <>
            {/* ⚪ Floating Buttons */}
            {!showPost && (
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
            </div>)}

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
