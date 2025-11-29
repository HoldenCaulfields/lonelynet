"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useMemo, memo } from "react";

type ThemeMarkerProps = {
  theme: "webdev" | "findjob" | "lover" | "art" | "business" | "cooperate";
  center: [number, number];
  pixelSize?: number;
  socket?: any;
  currentUserId?: string;
  setShowChat: (v: boolean) => void;
  setRoomId: (v: string) => void;
};

// =====================
// OPTIMIZED ICON CREATOR - Simplified animations
// =====================

const createAnimatedIcon = (emoji: string, color: string, isActive: boolean = false) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: ${isActive ? `0 0 15px ${color}` : '0 2px 6px rgba(0,0,0,0.2)'};
        border: 2px solid ${isActive ? '#FFD700' : 'white'};
        cursor: pointer;
        ${isActive ? 'transform: scale(1.15);' : ''}
        transition: transform 0.2s ease;
      " class="theme-marker">
        ${emoji}
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// =====================
// OPTIMIZED: Reduced icon data for better performance
// =====================

const themeIcons = {
  webdev: [
    { emoji: '⚛️', label: 'React', color: '#61DAFB' },
    { emoji: '📦', label: 'Node.js', color: '#68A063' },
    { emoji: '🐍', label: 'Python', color: '#3776AB' },
    { emoji: '☕', label: 'JavaScript', color: '#F7DF1E' },
    { emoji: '🎨', label: 'CSS', color: '#1572B6' },
    { emoji: '🔷', label: 'TypeScript', color: '#3178C6' },
    { emoji: '🤖', label: 'AI/ML', color: '#FF6F00' },
    { emoji: '⚡', label: 'Frontend', color: '#FF4154' },
    { emoji: '🔧', label: 'Backend', color: '#10B981' },
    { emoji: '🗄️', label: 'Database', color: '#336791' },
  ],
  findjob: [
    { emoji: '👷‍♂️', label: 'Construction', color: '#F97316' },
    { emoji: '💻', label: 'Coder', color: '#3B82F6' },
    { emoji: '🧑‍💻', label: 'Web Dev', color: '#2563EB' },
    { emoji: '🛠️', label: 'Technician', color: '#525252' },
    { emoji: '👨‍⚕️', label: 'Doctor', color: '#10B981' },
    { emoji: '🌱', label: 'Farmer', color: '#84CC16' },
    { emoji: '🍳', label: 'Chef', color: '#F43F5E' },
    { emoji: '🎥', label: 'Film Maker', color: '#A855F7' },
    { emoji: '🎨', label: 'Designer', color: '#F59E0B' },
    { emoji: '📚', label: 'Tutor', color: '#16A34A' },
    { emoji: '🛍️', label: 'Sales', color: '#EA580C' },
    { emoji: '🏗️', label: 'Builder', color: '#DC2626' },
  ],
  lover: [
    { emoji: '❤️', label: 'Love', color: '#EF4444' },
    { emoji: '😍', label: 'Crush', color: '#F43F5E' },
    { emoji: '😘', label: 'Kiss', color: '#FB7185' },
    { emoji: '🥰', label: 'Affection', color: '#EC4899' },
    { emoji: '💑', label: 'Dating', color: '#F87171' },
    { emoji: '💘', label: 'Match', color: '#E11D48' },
    { emoji: '🔥', label: 'Hot', color: '#EA580C' },
    { emoji: '🌹', label: 'Romantic', color: '#E11D48' },
    { emoji: '💋', label: 'Kissing', color: '#DB2777' },
    { emoji: '💕', label: 'Sweet', color: '#F472B6' },
  ],
  art: [
    { emoji: '🎨', label: 'Palette', color: '#A855F7' },
    { emoji: '🖌️', label: 'Brush', color: '#8B5CF6' },
    { emoji: '🎭', label: 'Theater', color: '#9333EA' },
    { emoji: '🎬', label: 'Film', color: '#7C3AED' },
    { emoji: '🎧', label: 'Music', color: '#4F46E5' },
    { emoji: '📚', label: 'Books', color: '#8B5CF6' },
    { emoji: '🚀', label: 'SciFi', color: '#0EA5E9' },
    { emoji: '🌌', label: 'Cosmos', color: '#1E40AF' },
    { emoji: '📸', label: 'Photo', color: '#818CF8' },
    { emoji: '✏️', label: 'Drawing', color: '#D8B4FE' },
  ],
  business: [
    { emoji: '💼', label: 'Briefcase', color: '#F59E0B' },
    { emoji: '💰', label: 'Money', color: '#10B981' },
    { emoji: '📊', label: 'Chart', color: '#3B82F6' },
    { emoji: '☕', label: 'Coffee', color: '#A16207' },
    { emoji: '🍔', label: 'FastFood', color: '#DC2626' },
    { emoji: '🏨', label: 'Hotel', color: '#2563EB' },
    { emoji: '🛒', label: 'Store', color: '#0EA5E9' },
    { emoji: '🚀', label: 'Startup', color: '#8B5CF6' },
    { emoji: '💳', label: 'Payment', color: '#6366F1' },
    { emoji: '📈', label: 'Growth', color: '#22C55E' },
  ],
  cooperate: [
    { emoji: '🤝', label: 'Handshake', color: '#06B6D4' },
    { emoji: '👥', label: 'Team', color: '#0891B2' },
    { emoji: '🔗', label: 'Link', color: '#0E7490' },
    { emoji: '💬', label: 'Chat', color: '#22D3EE' },
    { emoji: '🎬', label: 'Film', color: '#0284C7' },
    { emoji: '💻', label: 'Coding', color: '#0891B2' },
    { emoji: '📈', label: 'Investment', color: '#0EA5E9' },
    { emoji: '🔄', label: 'Trade', color: '#38BDF8' },
    { emoji: '🎯', label: 'Goal', color: '#06B6D4' },
    { emoji: '🚀', label: 'Launch', color: '#0891B2' },
  ],
};

// =====================
// OPTIMIZED: Smaller, cleaner pixel maps
// =====================

const pixelMaps: Record<string, number[][]> = {
  webdev: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
  ],
  findjob: [
    [0, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0],
  ],
  lover: [
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
  ],
  art: [
    [0, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0],
  ],
  business: [
    [1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 1, 0],
  ],
  cooperate: [
    [1, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 1, 1, 0, 0],
  ],
};

// =====================
// MEMOIZED SINGLE MARKER COMPONENT
// =====================

const SingleMarker = memo(({ 
  lat, 
  lng, 
  iconData, 
  isActive, 
  theme, 
  onlineCount,
  onMarkerClick, 
  onGroupChat,
  onMouseEnter,
  onMouseLeave 
}: any) => {
  const icon = useMemo(
    () => createAnimatedIcon(iconData.emoji, iconData.color, isActive),
    [iconData.emoji, iconData.color, isActive]
  );

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{
        click: () => onMarkerClick(lat, lng, iconData),
        mouseover: onMouseEnter,
        mouseout: onMouseLeave
      }}
    >
      <Popup>
        <div className="bg-white p-3 rounded-lg shadow-md min-w-[180px]">
          <div className="text-center mb-2">
            <div className="text-3xl mb-1">{iconData.emoji}</div>
            <div className="font-bold text-lg" style={{ color: iconData.color }}>
              {iconData.label}
            </div>
            <div className="text-xs text-gray-500 uppercase">{theme}</div>
          </div>

          <div className="bg-gray-50 rounded p-2 mb-2 text-sm">
            <div className="flex justify-between">
              <span>🟢 Online</span>
              <span className="font-bold text-green-600">{onlineCount}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => onGroupChat(iconData.label)}
              className="w-full px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition"
            >
              💬 Join Chat
            </button>

            <button
              onClick={() => onMarkerClick(lat, lng, iconData)}
              className="w-full px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium transition"
            >
              👋 Wave
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

SingleMarker.displayName = 'SingleMarker';

// =====================
// MAIN COMPONENT
// =====================

export default function ThemeMarker({
  theme,
  center,
  pixelSize = 5,
  socket,
  currentUserId,
  setShowChat,
  setRoomId
}: ThemeMarkerProps) {
  const [activeMarkers, setActiveMarkers] = useState<Set<string>>(new Set());
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [onlineUsersInTheme, setOnlineUsersInTheme] = useState<number>(0);

  const pixelMap = pixelMaps[theme];
  const icons = themeIcons[theme];

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users: any) => {
      const count = Object.values(users).filter(
        (user: any) => user.userStatus === theme
      ).length;
      setOnlineUsersInTheme(count);
    };

    const handleWaveSignal = (data: any) => {
      const key = `${data.lat}-${data.lng}`;
      setActiveMarkers(prev => new Set(prev).add(key));
      setTimeout(() => {
        setActiveMarkers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("wave_signal", handleWaveSignal);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("wave_signal", handleWaveSignal);
    };
  }, [socket, theme]);

  const handleMarkerClick = (lat: number, lng: number, iconData: any) => {
    if (socket && currentUserId) {
      socket.emit("wave", { from: currentUserId, lat, lng });
      socket.emit("update_status", { userId: currentUserId, userStatus: theme });
    }
  };

  const handleGroupChat = (iconLabel: string) => {
    if (socket && currentUserId) {
      const themeRoomId = `theme_${theme}_${iconLabel}`;
      setRoomId(themeRoomId);
      setShowChat(true);
      socket.emit("joinRoom", { themeRoomId, userId: currentUserId });
    }
  };

  // ✅ Memoize markers to prevent re-renders
  const markers = useMemo(() => {
    if (!pixelMap || !icons) return [];

    const result: React.ReactNode[] = [];
    const rows = pixelMap.length;
    const cols = pixelMap[0]?.length || 0;
    let iconIndex = 0;

    pixelMap.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell === 1) {
          const lat = center[0] + (rIdx - rows / 2) * pixelSize;
          const lng = center[1] + (cIdx - cols / 2) * pixelSize;
          const key = `${theme}-${rIdx}-${cIdx}`;
          const markerKey = `${lat}-${lng}`;
          const iconData = icons[iconIndex % icons.length];
          const isActive = activeMarkers.has(markerKey) || hoveredMarker === key;
          iconIndex++;

          result.push(
            <SingleMarker
              key={key}
              markerKey={markerKey}
              lat={lat}
              lng={lng}
              iconData={iconData}
              isActive={isActive}
              theme={theme}
              onlineCount={onlineUsersInTheme}
              onMarkerClick={handleMarkerClick}
              onGroupChat={handleGroupChat}
              onMouseEnter={() => setHoveredMarker(key)}
              onMouseLeave={() => setHoveredMarker(null)}
            />
          );
        }
      });
    });

    return result;
  }, [pixelMap, icons, center, pixelSize, theme, activeMarkers, hoveredMarker, onlineUsersInTheme]);

  if (!pixelMap || !icons) return null;

  return <>{markers}</>;
}