"use client";

import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MessageCircle } from "lucide-react";
import { socket, connectSocket } from "@/app/components/utils/socket";

interface Props {
  setShowChat: (v: boolean) => void;
  setRoomId: (v: string) => void;
}

export default function UserOnlineMarkers({ setShowChat, setRoomId }: Props) {
  const [onlineUsers, setOnlineUsers] = useState<
    Record<string, { userId: string; lat: number; lng: number }>
  >({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [myUserId] = useState(() => Math.floor(Math.random() * 1_000_000).toString());
  const [wavingUsers, setWavingUsers] = useState<Record<string, boolean>>({});
  const map = useMap();

  // 🧭 Lấy vị trí người dùng
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        map.setView(coords, 8);
      },
      () => console.warn("⚠️ Không lấy được vị trí người dùng.")
    );
  }, [map]);

  // 🔌 Kết nối socket
  useEffect(() => {
    connectSocket();

    socket.on("connect", () => {
      setMySocketId(socket.id || null);
      socket.emit("userOnline", myUserId);
      if (userLocation) socket.emit("update_location", userLocation);
    });

    socket.on("onlineUsers", (users) => setOnlineUsers(users || {}));
    socket.on("disconnect", () => setOnlineUsers({}));

    socket.on("chat_invite", ({ from, roomId }) => {
      socket.emit("joinRoom", { roomId, userId: myUserId });
      setRoomId(roomId);
      setShowChat(true);
    });

    // 👋 Lắng nghe tín hiệu wave từ người khác
    socket.on("wave_signal", ({ from }) => {
      setWavingUsers((prev) => ({ ...prev, [from]: true }));
      setTimeout(() => {
        setWavingUsers((prev) => {
          const updated = { ...prev };
          delete updated[from];
          return updated;
        });
      }, 4000);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat_invite");
      socket.off("wave_signal");
      socket.disconnect();
    };
  }, [myUserId, userLocation, setRoomId, setShowChat]);

  // ⏱ Gửi vị trí định kỳ
  useEffect(() => {
    if (!userLocation) return;
    const interval = setInterval(() => {
      socket.emit("update_location", userLocation);
    }, 10000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // 🧍‍♂️ Tạo icon có hiệu ứng 👋 nếu đang vẫy
  const userIcon = (isSelf: boolean, isWaving: boolean) =>
    L.divIcon({
      className: "flex flex-col items-center",
      html: `
        <div class="relative flex flex-col items-center">
          <div class="relative">
            <div class="${isSelf
          ? "w-6 h-6 bg-green-500 ring-4 ring-green-300 shadow-md"
          : "w-4 h-4 bg-blue-500 ring-2 ring-blue-200"
        } rounded-full"></div>

            ${isWaving
          ? `
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="absolute text-2xl animate-wave">👋</span>
                <span class="absolute w-10 h-10 rounded-full border-2 border-yellow-400 animate-ping-slow"></span>
              </div>
              `
          : ""
        }
          </div>
          <span class="absolute -bottom-5 text-xs text-black font-semibold bg-white/70 rounded-md px-1">
            ${isSelf ? "Me" : "Online"}
          </span>
        </div>
      `,
      iconAnchor: [12, 24],
      popupAnchor: [0, -10],
    });

  return (
    <>
      {Object.entries(onlineUsers).map(([socketId, user]) => {
        const isSelf = socketId === mySocketId;
        const isWaving = wavingUsers[user.userId];

        return (
          <Marker
            key={socketId}
            position={[user.lat, user.lng]}
            icon={userIcon(isSelf, isWaving)}
          >
            <Popup>
              {isSelf ? (
                <div
                  className="text-center cursor-pointer"
                  onClick={() => {
                    // 👋 Emit sự kiện wave để broadcast toàn hệ thống
                    socket.emit("wave", { from: myUserId });
                    setWavingUsers((prev) => ({ ...prev, [myUserId]: true }));
                    setTimeout(() => {
                      setWavingUsers((prev) => {
                        const updated = { ...prev };
                        delete updated[myUserId];
                        return updated;
                      });
                    }, 5000);
                  }}
                >
                  <p className="font-semibold">✨ It's you!</p>
                  <p className="text-sm text-gray-600">Click to wave 👋 to everyone</p>
                </div>

              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="font-semibold">👤 {user.userId}</p>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md text-white"
                    onClick={() => {
                      const from = myUserId;
                      const to = user.userId;
                      const room = [from, to].sort().join("_");
                      socket.emit("start_chat", { from, to });
                      setRoomId(room);
                      setShowChat(true);
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
