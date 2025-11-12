"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { socket, connectSocket } from "@/app/components/utils/socket";
import userIconImg from "@/public/red-icon.png";
import otherIconImg from "@/public/online.png";
import UserProfilePopup from "./UserProfilePopup";
import OnlinePopup from "./OnlinePopup";
import { Hand, Pencil, Gamepad, Rocket, Star, Sword, Trophy, Zap, X, Sparkles } from "lucide-react";

interface Props {
  setShowChat: (v: boolean) => void;
  setRoomId: (v: string) => void;
  showPost: boolean;
  setShowPost: (v: boolean) => void;
  musicUrl: string | null;
}

interface UserData {
  userId: string;
  lat: number;
  lng: number;
  musicUrl?: string | null;
}

export default function UserOnlineMarkers({ setShowChat, setRoomId, showPost, setShowPost, musicUrl }: Props) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserData>>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [myUserId] = useState(() => Math.floor(Math.random() * 1_000_000).toString());
  const [wavingUsers, setWavingUsers] = useState<Record<string, boolean>>({});
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const [showModal, setShowModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [submenuVisible, setSubmenuVisible] = useState<number | null>(null);
  const [showGameMenu, setShowGameMenu] = useState(false);

  // Ẩn menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowGameMenu(false);
        setSubmenuVisible(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

    const savedPosition = sessionStorage.getItem('flyToPosition');
    if (savedPosition) {
      try {
        const { lat, lng, timestamp } = JSON.parse(savedPosition);
        if (Date.now() - timestamp < 5000) {
          setTimeout(() => {
            map.flyTo([lat, lng], 14, { duration: 1.2 });
          }, 500);
        }
        sessionStorage.removeItem('flyToPosition');
      } catch (e) {
        console.error('Failed to parse saved position:', e);
      }
    }
  }, [map]);

  // ====== POPUP CONTROL FOR SHOWPOST ======
  useEffect(() => {
    if (!mySocketId) return;
    const marker = markerRefs.current[mySocketId];
    if (!marker) return;

    if (showPost) {
      marker.openPopup();
    } else {
      marker.closePopup();
    }

    const handlePopupClose = () => {
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

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users || {});
    });

    socket.on("disconnect", () => setOnlineUsers({}));

    socket.on("wave_signal", ({ from, lat, lng }) => {
      setWavingUsers((prev) => ({ ...prev, [from]: true }));
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
  }, [myUserId, userLocation, setRoomId, setShowChat, map]);

  // gửi vị trí định kỳ
  useEffect(() => {
    if (!userLocation) return;
    const interval = setInterval(() => {
      socket.emit("update_location", userLocation);
    }, 10000);
    return () => clearInterval(interval);
  }, [userLocation]);

  useEffect(() => {
    if (!musicUrl) return;
    socket.emit("update_music", { userId: myUserId, musicUrl });
  }, [musicUrl, myUserId]);

  // ====== CANVAS FIREWORKS ======
  function ensureCanvas(): HTMLCanvasElement {
    if (canvasRef.current) return canvasRef.current;
    const container = map.getContainer();
    const c = document.createElement("canvas");
    c.style.position = "absolute";
    c.style.left = "0";
    c.style.top = "0";
    c.style.pointerEvents = "none";
    c.style.zIndex = "400";
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
      const w = canvas.width, h = canvas.height;
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
              class="w-12 h-12 rounded-full shadow-lg object-cover ring-2 ${isSelf ? 'ring-red-400' : 'ring-green-400'}"
            />
            ${isWaving
          ? `
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="absolute text-2xl animate-wave">👋</span>
                  <span class="absolute w-14 h-14 rounded-full border-2 border-yellow-400 animate-ping-slow"></span>
                </div>
              `
          : ""
        }
          </div>
          <span class="absolute -bottom-6 text-xs font-bold px-2 py-0.5 rounded-full ${isSelf ? 'bg-red-500 text-white' : 'bg-green-500 text-white'} shadow-md">
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

  const games = [
    { type: "Trophy", color: "from-green-500 to-emerald-500", label: "Tournament", icon: Trophy },
    { type: "Sword", color: "from-blue-500 to-cyan-500", label: "Sword Fight", icon: Sword },
    { type: "Star", color: "from-yellow-500 to-amber-500", label: "Star Quest", icon: Star },
    { type: "Zap", color: "from-purple-500 to-pink-500", label: "Lightning", icon: Zap },
    { type: "Rocket", color: "from-red-500 to-orange-500", label: "Rocket Race", icon: Rocket }
  ];

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
              <>
                <Tooltip direction="top" offset={[-16, -40]} permanent interactive>
                  <div
                    ref={tooltipRef}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col gap-2 p-3 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white rounded-2xl shadow-2xl w-48 select-none backdrop-blur-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* 👋 Vẫy tay */}
                      <button
                        onClick={() => {
                          if (!userLocation) return;
                          const point = map.latLngToContainerPoint([userLocation.lat, userLocation.lng]);
                          fireworksAt(point.x, point.y);
                          socket.emit("wave", {
                            from: myUserId,
                            lat: userLocation.lat,
                            lng: userLocation.lng,
                          });
                        }}
                        className="group relative bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-xl p-3 hover:scale-110 hover:-rotate-6 shadow-lg transition-all duration-300 flex-1"
                        title="Vẫy tay"
                      >
                        <Hand size={20} className="mx-auto group-hover:animate-bounce" />
                      </button>

                      {/* 📝 Tạo bài */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowModal(true);
                        }}
                        className="group relative bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-xl p-3 hover:scale-110 hover:rotate-6 shadow-lg transition-all duration-300 flex-1"
                        title="Tạo bài viết"
                      >
                        <Pencil size={20} className="mx-auto" />
                      </button>

                      {/* 🎮 Game */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowGameMenu((prev) => !prev);
                          setSubmenuVisible(null);
                        }}
                        className={`group relative bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl p-3 hover:scale-110 shadow-lg transition-all duration-300 flex-1 ${showGameMenu ? 'rotate-180' : 'hover:rotate-6'
                          }`}
                        title="Mini Games"
                      >
                        <Gamepad size={20} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </Tooltip>

                {/* Menu Game vòng tròn */}
                {showGameMenu && (
                  <div className="absolute z-[900] pointer-events-none">
                    {games.map((item, idx) => {
                      const Icon = item.icon;
                      const angle = idx * 72 - 90;
                      const radius = 110;
                      const offsetX = radius * Math.cos((angle * Math.PI) / 180);
                      const offsetY = radius * Math.sin((angle * Math.PI) / 180);

                      return (
                        <div key={item.type}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubmenuVisible(submenuVisible === idx ? null : idx);
                            }}
                            style={{
                              position: "absolute",
                              left: `calc(${map.latLngToContainerPoint([userLocation.lat, userLocation.lng]).x}px + ${offsetX}px)`,
                              top: `calc(${map.latLngToContainerPoint([userLocation.lat, userLocation.lng]).y}px + ${offsetY}px)`,
                              transform: "translate(-50%, -50%)",
                              animationDelay: `${idx * 0.05}s`,
                            }}
                            className={`group animate-popIn bg-gradient-to-br ${item.color} pointer-events-auto text-white rounded-2xl p-4 hover:scale-125 hover:rotate-12 shadow-2xl transition-all duration-300 border-2 border-white/30 relative`}
                          >
                            <Icon size={22} />
                            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black/90 text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-semibold shadow-lg">
                              {item.label}
                            </span>
                          </button>

                          {/* Submenu cho mỗi game */}
                          {submenuVisible === idx && (
                            <div
                              style={{
                                position: "absolute",
                                left: `calc(${map.latLngToContainerPoint([userLocation.lat, userLocation.lng]).x}px + ${offsetX}px)`,
                                top: `calc(${map.latLngToContainerPoint([userLocation.lat, userLocation.lng]).y}px + ${offsetY}px + 60px)`,
                                transform: "translate(-50%, 0)",
                              }}
                              className="pointer-events-auto bg-white text-gray-800 rounded-2xl shadow-2xl p-4 w-40 animate-slideUp border border-gray-200"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <Icon size={16} className={`text-${item.color.split('-')[1]}-500`} />
                                <div className="text-sm font-bold">{item.label}</div>
                              </div>
                              <button className={`w-full bg-gradient-to-r ${item.color} text-white text-sm font-semibold py-2.5 rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}>
                                <Sparkles size={14} />
                                Chơi ngay
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Modal Đăng bài nâng cao */}
                {showModal && (
                  <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
                    onClick={() => {
                      setShowModal(false);
                      setPostContent("");
                    }}
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-md animate-slideUp relative"
                    >
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setPostContent("");
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:rotate-90 hover:scale-110 transition-all duration-200 p-1"
                      >
                        <X size={24} />
                      </button>

                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-purple-100">
                          {myUserId.slice(0, 1)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Tạo bài viết</h2>
                          <p className="text-sm text-gray-500">Chia sẻ khoảnh khắc của bạn</p>
                        </div>
                      </div>

                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-2xl p-4 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none min-h-[120px]"
                        placeholder="Bạn đang nghĩ gì? ✨"
                        rows={5}
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowModal(false);
                            setPostContent("");
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl py-3 hover:bg-gray-200 transition-all duration-200"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => {
                            // Xử lý đăng bài ở đây
                            console.log("Posted:", postContent);
                            setShowModal(false);
                            setPostContent("");
                          }}
                          disabled={!postContent.trim()}
                          className={`flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl py-3 transition-all duration-200 ${postContent.trim()
                              ? 'hover:scale-105 hover:shadow-lg'
                              : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                          Đăng bài
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            <Popup eventHandlers={{ add: () => { if (isSelf) setShowPost(true) } }}>
              {!isSelf ? (
                <OnlinePopup
                  user={user}
                  myUserId={myUserId}
                  setRoomId={setRoomId}
                  setShowChat={setShowChat}
                />
              ) : (
                <div>
                  <UserProfilePopup address={userLocation} />
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}

    </>
  );
}