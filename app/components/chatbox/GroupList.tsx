"use client";
import React, { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.12:5000";
const API_URL = "http://192.168.1.12:5000/api/lonelyland";

interface Room {
  roomId: string;
  memberCount: number;
  postPreview?: { text: string; imageUrl: string; tags: string[] };
}

interface GroupListProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoom?: (roomId: string) => void;
}

export default function GroupList({ visible, onClose, onSelectRoom }: GroupListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch all posts (potential chat rooms)
  const scanActiveRooms = async (): Promise<Room[]> => {
    try {
      const res = await fetch(API_URL);
      const posts = await res.json();
      return posts.map((post: any) => ({
        roomId: post._id,
        memberCount: 0,
        postPreview: {
          text: post.text,
          imageUrl: post.imageUrl,
          tags: post.tags || [],
        },
      }));
    } catch (err) {
      console.error("Error scanning rooms:", err);
      return [];
    }
  };

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", async () => {
      console.log("✅ Connected to server for room list");

      const potentialRooms = await scanActiveRooms();
      setRooms(potentialRooms);
      setFilteredRooms(potentialRooms);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [visible]);

  // Filter search
  useEffect(() => {
    const searchLower = searchQuery.toLowerCase();
    const filtered = rooms.filter((room) => {
      if (!searchQuery) return true;

      const matchesId = room.roomId.toLowerCase().includes(searchLower);
      const matchesTags = room.postPreview?.tags?.some((t) =>
        t.toLowerCase().includes(searchLower)
      );
      const matchesText = room.postPreview?.text
        ?.toLowerCase()
        .includes(searchLower);
      return matchesId || matchesTags || matchesText;
    });
    setFilteredRooms(filtered);
  }, [searchQuery, rooms]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const updated = await scanActiveRooms();
    setRooms(updated);
    setFilteredRooms(updated);
    setRefreshing(false);
  };

  const handleSelectRoom = (roomId: string) => {
    console.log("📍 Selected room:", roomId);
    onSelectRoom?.(roomId);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed w-full bottom-0 right-0 z-1000 flex flex-col justify-end sm:w-120">
      {/* Overlay click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 h-[80vh] w-full rounded-t-2xl bg-[#121212] p-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-xl font-bold">🔥 Join Group Chats</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-bold"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by tags or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-3 text-white text-sm mb-4 placeholder-gray-500"
        />

        {/* Loading / Empty / List */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-white">
            <span className="animate-pulse">Loading...</span>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-white px-10">
            <span className="text-6xl mb-3">💬</span>
            <p className="text-lg font-semibold mb-1">
              {searchQuery ? "No rooms match your search" : "No posts available yet"}
            </p>
            <p className="text-gray-400 text-sm">
              {searchQuery
                ? "Try a different search"
                : "Create a post on the map to start chatting!"}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <button
              onClick={handleRefresh}
              className="w-full text-sm text-gray-400 mb-2 hover:text-white"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            {filteredRooms.map((item) => (
              <div
                key={item.roomId}
                onClick={() => handleSelectRoom(item.roomId)}
                className="flex bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden hover:bg-[#2a2a2a] cursor-pointer transition-colors p-3"
              >
                {item.postPreview?.imageUrl && (
                  <img
                    src={item.postPreview.imageUrl}
                    alt="preview"
                    className="w-20 h-20 rounded-md object-cover mr-3"
                  />
                )}

                <div className="flex flex-col flex-1 justify-between">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white text-sm font-semibold truncate mr-2">
                      {item.postPreview?.tags?.length
                        ? item.postPreview.tags.map((t) => `#${t}`).join(" • ")
                        : `Room ${item.roomId.slice(0, 8)}...`}
                    </h3>
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      JOIN
                    </span>
                  </div>

                  {item.postPreview?.text && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-1">
                      {item.postPreview.text}
                    </p>
                  )}

                  <span className="text-green-400 text-xs font-semibold">
                    Tap to join this chat 💬
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
