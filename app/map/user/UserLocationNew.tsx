"use client";

import { useEffect, useRef, useState } from "react";
import { Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { MessageCircle } from "lucide-react";
import { socket, connectSocket } from "@/app/components/utils/socket";
import userIconImg from "@/public/red-icon.png";
import otherIconImg from "@/public/online.png";
import UserProfilePopup from "./UserProfilePopup";

interface Props {
  setShowChat: (v: boolean) => void;
  setRoomId: (v: string) => void;
  showPost: boolean;
  setShowPost: (v: boolean) => void;
}

interface UserData {
  userId: string;
  lat: number;
  lng: number;
}

export default function UserOnlineMarkers({ setShowChat, setRoomId, showPost, setShowPost }: Props) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserData>>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [myUserId] = useState(() => Math.floor(Math.random() * 1_000_000).toString());
  const [wavingUsers, setWavingUsers] = useState<Record<string, boolean>>({});
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  // canvas overlay cho pháo hoa
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // ====== GEOLOCATION ======
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

  // ====== POPUP CONTROL FOR SHOWPOST ======
  useEffect(() => {
    if (!mySocketId) return;
    const marker = markerRefs.current[mySocketId];
    if (!marker) return;

    console.log("📍 showPost changed:", showPost);

    if (showPost) {
      // Mở popup
      marker.openPopup();
    } else {
      // Đóng popup
      marker.closePopup();
    }

    // Khi popup bị đóng (người dùng click ra ngoài), đồng bộ lại state
    const handlePopupClose = () => {
      console.log("❌ Popup closed, updating showPost=false");
      setShowPost(false);
    };

    marker.on("popupclose", handlePopupClose);
    return () => {
      marker.off("popupclose", handlePopupClose);
    };
  }, [showPost, mySocketId, setShowPost]);


  // ====== SOCKET.IO ======
  useEffect(() => {
    connectSocket();

    socket.on("connect", () => {
      setMySocketId(socket.id || null);
      socket.emit("userOnline", myUserId);
      if (userLocation) socket.emit("update_location", userLocation);
    });

    socket.on("onlineUsers", (users) => setOnlineUsers(users || {}));
    socket.on("disconnect", () => setOnlineUsers({}));

    // nhận wave / fireworks
    socket.on("wave_signal", ({ from, lat, lng }) => {
      setWavingUsers((prev) => ({ ...prev, [from]: true }));
      // bắn pháo hoa tại vị trí người đó
      if (lat && lng) {
        const point = map.latLngToContainerPoint([lat, lng]);
        fireworksAt(point.x, point.y);
      }
      setTimeout(() => {
        setWavingUsers((prev) => {
          const u = { ...prev };
          delete u[from];
          return u;
        });
      }, 3000);
    });

    socket.on("chat_invite", ({ roomId }) => {
      socket.emit("joinRoom", { roomId, userId: myUserId });
      setRoomId(roomId);
      setShowChat(true);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat_invite");
      socket.off("wave_signal");
    };
  }, [myUserId, userLocation, setRoomId, setShowChat, map, fireworksAt]);

  // gửi vị trí định kỳ
  useEffect(() => {
    if (!userLocation) return;
    const interval = setInterval(() => {
      socket.emit("update_location", userLocation);
    }, 10000);
    return () => clearInterval(interval);
  }, [userLocation]);

  // ====== CANVAS FIREWORKS ======
  function ensureCanvas(): HTMLCanvasElement {
    if (canvasRef.current) return canvasRef.current;
    const container = map.getContainer();
    const c = document.createElement("canvas");
    c.style.position = "absolute";
    c.style.left = "0";
    c.style.top = "0";
    c.style.pointerEvents = "none";
    c.style.zIndex = "400"; // trên marker
    c.width = container.clientWidth;
    c.height = container.clientHeight;
    c.className = "leaflet-fireworks-overlay";
    container.appendChild(c);
    canvasRef.current = c;
    const ro = new ResizeObserver(() => {
      if (!canvasRef.current) return;
      canvasRef.current.width = container.clientWidth;
      canvasRef.current.height = container.clientHeight;
    });
    ro.observe(container);
    return c;
  }

  function removeCanvas() {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.remove();
    } catch { }
    canvasRef.current = null;
  }

  function fireworksAt(x: number, y: number) {
    const canvas = ensureCanvas();
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;
    const particles: any[] = [];
    const bursts = 3;
    for (let b = 0; b < bursts; b++) {
      const n = 25 + Math.floor(Math.random() * 30);
      const hue = Math.floor(Math.random() * 360);
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4 + b * 0.6;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 40,
          size: 1 + Math.random() * 3,
          color: `hsl(${hue + Math.floor(Math.random() * 40) - 20}deg, 90%, ${50 + Math.random() * 20}%)`,
        });
      }
    }
    const grav = 0.06;
    function frame() {
      const w = canvas.width,
        h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.vy += grav;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.beginPath();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life >= particles[i].maxLife) particles.splice(i, 1);
      }
      if (particles.length > 0) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTimeout(removeCanvas, 300);
        animRef.current = null;
      }
    }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(frame);
  }

  // ====== ICON MAKER ======
  const makeIcon = (isSelf: boolean, isWaving: boolean) => {
    const imgSrc = isSelf ? userIconImg.src : otherIconImg.src;

    return L.divIcon({
      className: "flex flex-col items-center",
      html: `
        <div class="relative flex flex-col items-center">
          <div class="relative">
            <img
            src="${imgSrc}"
            alt="user-icon"
            class="w-12 h-12 rounded-full  shadow-md object-cover"
          />
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
      iconAnchor: [24, 48],
      popupAnchor: [-20, -35],
    })
  };

  // ====== RENDER MARKERS ======
  if (!userLocation) return null;

  return (
    <>
      {Object.entries(onlineUsers).map(([socketId, user]) => {
        const isSelf = socketId === mySocketId;
        const isWaving = wavingUsers[user.userId];
        return (
          <Marker key={socketId} position={[user.lat, user.lng]} icon={makeIcon(isSelf, isWaving)} ref={(ref) => {
            if (ref) markerRefs.current[socketId] = ref;
          }}>
            {isSelf ? (
              <Tooltip direction="top" offset={[-16, -40]} permanent interactive>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!userLocation) return;
                    const point = map.latLngToContainerPoint([userLocation.lat, userLocation.lng]);
                    fireworksAt(point.x, point.y);
                    socket.emit("wave", { from: myUserId, lat: userLocation.lat, lng: userLocation.lng });
                  }}
                  className="
                    flex items-center gap-1
                    text-sm font-semibold cursor-pointer select-none
                    rounded-full shadow-md 
                    transition-all duration-200 active:scale-[1.03]
                    hover:bg-yellow-50 hover:shadow-lg hover:scale-[1.03]
                  "
                  role="button"
                >
                  <span>👋 </span>
                  <span> Hey there 💥</span>
                </div>
              </Tooltip>
            ) : null}

            <Popup>
              {!isSelf ? (
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
              ) : (
                <div>
                  <UserProfilePopup address={userLocation}/>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
