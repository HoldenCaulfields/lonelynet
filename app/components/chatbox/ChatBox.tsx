"use client";
import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import GroupList from "./GroupList";

interface ChatBoxProp {
  setRoomId: (roomId: string) => void;
}

export default function ChatBox({setRoomId}: ChatBoxProp) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed bottom-6 right-6 z-1000
          flex items-center gap-2
          bg-gradient-to-r from-red-500 to-red-600
          text-white font-semibold
          rounded-full shadow-lg shadow-emerald-500/30
          px-5 py-3
          transition-all duration-300
          hover:scale-110 hover:shadow-emerald-400/50
          focus:outline-none active:scale-95
        "
      >
        <MessageCircle size={22} />
        <span className="hidden sm:inline">Chat</span>
      </button>

      {open && (
        <GroupList visible={open} onClose={() => setOpen(false)} onSelectRoom={(roomId) => setRoomId(roomId)}/>
      )}
    </>
  );
}
