"use client";

import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import { MessageCircle } from "lucide-react";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://lonelynet.onrender.com"
    : "http://192.168.1.12:5000";

const socket = io(API_URL, { transports: ["websocket"] });

interface Props {
  setShowChat: (v: boolean) => void;
  setRoomId: (id: string) => void;
}

export default function UserOnlineMarkers({ setShowChat, setRoomId }: Props) {
  const [onlineUsers, setOnlineUsers] = useState<
    Record<string, { userId: string; lat: number; lng: number }>
  >({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [myUserId] = useState(() => Math.floor(Math.random() * 1_000_000).toString());

  const map = useMap();

  // 🧭 Lấy vị trí hiện tại
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        map.setView(coords, 8);
        socket.emit("update_location", coords);
      },
      () => console.warn("⚠️ Không lấy được vị trí người dùng.")
    );
  }, [map]);

  // 🔌 Kết nối socket
  useEffect(() => {
    socket.on("connect", () => {
      setMySocketId(socket.id || null);
      console.log("🟢 Connected:", socket.id, "User:", myUserId);
      socket.emit("userOnline", myUserId);
    });

    socket.on("onlineUsers", (users) => {
      console.log("📡 Nhận danh sách online:", users);
      setOnlineUsers(users || {});
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected");
      setOnlineUsers({});
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [myUserId]);

  // ⏱ Cập nhật vị trí định kỳ
  useEffect(() => {
    if (!userLocation) return;
    const interval = setInterval(() => {
      socket.emit("update_location", userLocation);
    }, 10000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // 🧍 Biểu tượng người dùng
  const userIcon = (isSelf: boolean) =>
    L.divIcon({
      className: "flex flex-col items-center",
      html: `
        <div class="relative flex flex-col items-center">
          <div class="${
            isSelf
              ? "w-4 h-4 bg-green-500 ring-4 ring-green-300"
              : "w-4 h-4 bg-blue-500 ring-2 ring-blue-200"
          } rounded-full shadow-md"></div>
          ${!isSelf ? `<span class="absolute -bottom-5 text-xs bg-white/70 px-1 rounded">Online</span>` : ""}
        </div>
      `,
      iconAnchor: [12, 24],
      popupAnchor: [0, -10],
    });

  // 🗺 Render marker user khác
  return (
    <>
      {Object.entries(onlineUsers)
        .filter(([socketId]) => socketId !== mySocketId)
        .map(([socketId, user]) => (
          <Marker
            key={socketId}
            position={[user.lat, user.lng]}
            icon={userIcon(socketId === mySocketId)}
          >
            <Popup>
              <div className="flex flex-col items-center space-y-2">
                <p className="font-medium text-sm text-gray-800">
                  👤 {user.userId} is online
                </p>
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-md hover:shadow-lg transition-all"
                  onClick={() => {
                    const chatRoomId =
                      myUserId < user.userId
                        ? `chat_${myUserId}_${user.userId}`
                        : `chat_${user.userId}_${myUserId}`;
                    setRoomId(chatRoomId);
                    setShowChat(true);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
}
