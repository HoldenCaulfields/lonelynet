"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { useChat as useChatContext } from "@/context/chat";
import { chatAPI } from "@/services/api/chat";
import { Room } from "@/types/types";

interface GroupListProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
}

export default function GroupList({ visible, onClose, onSelectRoom }: GroupListProps) {
  const { rooms } = useChat();
  const { setCurrentRoom } = useChatContext();
  const [loading, setLoading] = useState(false);

  const handleSelectRoom = (room: Room) => {
    setCurrentRoom(room);
    onSelectRoom(room._id);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end">
      <div className="w-full bg-white rounded-t-2xl p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chat Groups</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {rooms.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No groups yet</p>
          ) : (
            rooms.map(room => (
              <div
                key={room._id}
                onClick={() => handleSelectRoom(room)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-gray-500">{room.members.length} members</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}