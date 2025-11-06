"use client";

import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://lonelynet.onrender.com"
    : "http://192.168.1.12:5000";

const socket = io(API_URL, { transports: ["websocket"] });

export default function UserOnlineMarkers() {
  const [onlineUsers, setOnlineUsers] = useState<
    Record<string, { userId: string; lat: number; lng: number }>
  >({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mySocketId, setMySocketId] = useState<string | null>(null);

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

      const generatedUserId = Math.floor(Math.random() * 1_000_000).toString();
      console.log("🟢 Connected:", socket.id, "User:", generatedUserId);

      socket.emit("userOnline", generatedUserId); // ✅ gửi userId thật
    });

    socket.on("onlineUsers", (users) => {
      // ✅ users là object dạng { socketId: { userId, lat, lng } }
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
  }, []);

  // ⏱ Gửi cập nhật vị trí định kỳ
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
              ? "w-10 h-10 bg-green-500 ring-4 ring-green-300"
              : "w-8 h-8 bg-blue-500 ring-2 ring-blue-200"
          } rounded-full shadow-md"></div>
          <span class="absolute -bottom-5 text-xs text-black font-semibold bg-white/70 rounded-md px-1">
            ${isSelf ? "Bạn" : "Online"}
          </span>
        </div>
      `,
      iconAnchor: [12, 24],
      popupAnchor: [0, -10],
    });

  // 🗺 Render các marker
  return (
    <>
      {Object.entries(onlineUsers).map(([socketId, user]) => (
        <Marker
          key={socketId}
          position={[user.lat, user.lng]}
          icon={userIcon(socketId === mySocketId)}
        >
          <Popup>
            {socketId === mySocketId
              ? "✨ Đây là bạn"
              : `👤 ${user.userId || socketId.slice(0, 6)} đang online`}
          </Popup>
        </Marker>
      ))}
    </>
  );
}
