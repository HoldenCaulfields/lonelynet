"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";

type ThemeMarkerProps = {
  theme: "webdev" | "findjob" | "lover" | "art" | "business" | "cooperate";
  center: [number, number];
  pixelSize?: number;
  socket?: any; // Socket.io instance
  currentUserId?: string;
  setShowChat: (v: boolean) => void;
  setRoomId: (v: string) => void;
};

// =====================
// ANIMATED ICON CREATOR
// =====================

const createAnimatedIcon = (emoji: string, color: string, isActive: boolean = false) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: ${isActive ? `0 0 20px ${color}` : '0 2px 8px rgba(0,0,0,0.3)'};
        border: 3px solid ${isActive ? '#FFD700' : 'white'};
        transition: all 0.3s ease;
        animation: ${isActive ? 'pulse 2s infinite' : 'float 3s ease-in-out infinite'};
        cursor: pointer;
      " class="custom-marker">
        ${emoji}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .custom-marker:hover {
          transform: scale(1.3) !important;
          filter: brightness(1.2);
        }
      </style>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// =====================
// THEME ICONS (same as before)
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
    { emoji: '👷‍♂️', label: 'Construction Worker', color: '#F97316' },
    { emoji: '💻', label: 'Coder', color: '#3B82F6' },
    { emoji: '🧑‍💻', label: 'Web Developer', color: '#2563EB' },
    { emoji: '🛠️', label: 'Technician', color: '#525252' },
    { emoji: '🧪', label: 'Lab Technician', color: '#7C3AED' },
    { emoji: '🧠', label: 'Data Engineer', color: '#0EA5E9' },
    { emoji: '👨‍⚕️', label: 'Doctor', color: '#10B981' },
    { emoji: '💊', label: 'Pharmacist', color: '#14B8A6' },
    { emoji: '🩺', label: 'Nurse', color: '#06B6D4' },
    { emoji: '🌱', label: 'Farmer', color: '#84CC16' },
    { emoji: '🍳', label: 'Chef', color: '#F43F5E' },
    { emoji: '☕', label: 'Barista', color: '#A16207' },
    { emoji: '🚚', label: 'Delivery Driver', color: '#475569' },
    { emoji: '🎥', label: 'Film Maker', color: '#A855F7' },
    { emoji: '🎬', label: 'Video Editor', color: '#8B5CF6' },
    { emoji: '📸', label: 'Photographer', color: '#F87171' },
    { emoji: '🎵', label: 'Music Producer', color: '#1D4ED8' },
    { emoji: '🎤', label: 'Singer', color: '#DB2777' },
    { emoji: '🎨', label: 'Graphic Designer', color: '#F59E0B' },
    { emoji: '✍️', label: 'Copywriter', color: '#E11D48' },
    { emoji: '📚', label: 'Tutor', color: '#16A34A' },
    { emoji: '🛍️', label: 'Sales', color: '#EA580C' },
    { emoji: '📦', label: 'Warehouse Staff', color: '#6B7280' },
    { emoji: '🧹', label: 'Housekeeper', color: '#64748B' },
    { emoji: '👨‍🍳', label: 'Food Prep', color: '#EF4444' },
    { emoji: '🧑‍🎨', label: 'Freelance Artist', color: '#D946EF' },
    { emoji: '💼', label: 'Co-Founder', color: '#0EA5E9' },
    { emoji: '📱', label: 'Social Media Manager', color: '#3B82F6' },
    { emoji: '🛒', label: 'Shop Owner', color: '#F97316' },
    { emoji: '🏪', label: 'Store Staff', color: '#EAB308' },
    { emoji: '📈', label: 'Marketer', color: '#22C55E' },
    { emoji: '⚙️', label: 'Mechanical Engineer', color: '#6B7280' },
    { emoji: '🔧', label: 'Auto Repair', color: '#737373' },
    { emoji: '👨‍🏫', label: 'Teacher', color: '#14B8A6' },
    { emoji: '🧑‍🌾', label: 'Gardener', color: '#65A30D' },
    { emoji: '🧑‍💼', label: 'Office Admin', color: '#475569' },
    { emoji: '🏗️', label: 'Builder', color: '#DC2626' },
    { emoji: '🧑‍🚀', label: 'Innovator', color: '#0284C7' },
  ],

  lover: [
    { emoji: '❤️', label: 'Love', color: '#EF4444' },
    { emoji: '😍', label: 'Crush', color: '#F43F5E' },
    { emoji: '😘', label: 'Kiss', color: '#FB7185' },
    { emoji: '🥰', label: 'Affection', color: '#EC4899' },
    { emoji: '💋', label: 'Kissing', color: '#DB2777' },
    { emoji: '💑', label: 'Dating', color: '#F87171' },
    { emoji: '💞', label: 'Connection', color: '#F472B6' },
    { emoji: '💘', label: 'Match', color: '#E11D48' },
    { emoji: '💖', label: 'Spark', color: '#F9A8D4' },
    { emoji: '🔥', label: 'Hot', color: '#EA580C' },        // vibe Tinder
    { emoji: '👀', label: 'Looking', color: '#8B5CF6' },
    { emoji: '🌹', label: 'Romantic', color: '#E11D48' },
    { emoji: '🎀', label: 'Cute', color: '#F9A8D4' },
    { emoji: '💌', label: 'Message', color: '#F87171' },
    { emoji: '💕', label: 'Sweet', color: '#F472B6' },
    { emoji: '😘', label: 'Heart Hands', color: '#F43F5E' },
    { emoji: '🔗', label: 'Bond', color: '#A855F7' },
    { emoji: '⚡', label: 'Sparked', color: '#F59E0B' },    // sparks flying
    { emoji: '💓', label: 'Heartbeat', color: '#FB7185' },
    { emoji: '🌟', label: 'Attraction', color: '#FACC15' },
  ],
  art: [
    { emoji: '🎨', label: 'Palette', color: '#A855F7' },
    { emoji: '🖌️', label: 'Brush', color: '#8B5CF6' },
    { emoji: '🖍️', label: 'Crayon', color: '#C084FC' },
    { emoji: '✏️', label: 'Pencil', color: '#D8B4FE' },
    { emoji: '🎭', label: 'Theater', color: '#9333EA' },
    { emoji: '🎬', label: 'Film', color: '#7C3AED' },
    { emoji: '🎧', label: 'Music', color: '#4F46E5' },
    { emoji: '🎹', label: 'Composer', color: '#6366F1' },
    { emoji: '📚', label: 'Books', color: '#8B5CF6' },
    { emoji: '📖', label: 'Novel', color: '#A78BFA' },
    { emoji: '📝', label: 'Writing', color: '#C4B5FD' },
    { emoji: '📜', label: 'Philosophy', color: '#DDD6FE' },
    { emoji: '🗿', label: 'Sculpture', color: '#6D28D9' },
    { emoji: '🎨', label: 'Illustration', color: '#A78BFA' },
    { emoji: '🖼️', label: 'Gallery', color: '#9F7AEA' },
    { emoji: '📸', label: 'Photography', color: '#818CF8' },

    // Fiction / Fantasy / Sci-fi
    { emoji: '🚀', label: 'SciFi', color: '#0EA5E9' },
    { emoji: '🛸', label: 'UFO', color: '#22D3EE' },
    { emoji: '🌌', label: 'Cosmos', color: '#1E40AF' },
    { emoji: '🤖', label: 'Future', color: '#3B82F6' },
    { emoji: '🧬', label: 'Cyberpunk', color: '#2563EB' },
    { emoji: '🔥', label: 'PostApocalypse', color: '#EF4444' },

    // Abstract creative vibes
    { emoji: '🌀', label: 'Imagination', color: '#60A5FA' },
    { emoji: '🌙', label: 'Dream', color: '#64748B' },
    { emoji: '🧠', label: 'Ideas', color: '#94A3B8' },
  ],
  business: [
    { emoji: '💼', label: 'Briefcase', color: '#F59E0B' },
    { emoji: '💰', label: 'Money', color: '#10B981' },
    { emoji: '📊', label: 'Chart', color: '#3B82F6' },
    { emoji: '💳', label: 'Card', color: '#6366F1' },
    { emoji: '🏢', label: 'Office', color: '#64748B' },
    { emoji: '📈', label: 'Growth', color: '#22C55E' },
    { emoji: '💻', label: 'Work', color: '#0EA5E9' },
    { emoji: '🤝', label: 'Deal', color: '#8B5CF6' },

    // Food & Drinks
    { emoji: '☕', label: 'Coffee', color: '#A16207' },
    { emoji: '🥤', label: 'MilkTea', color: '#D97706' },
    { emoji: '🍗', label: 'FriedChicken', color: '#EA580C' },
    { emoji: '🍔', label: 'FastFood', color: '#DC2626' },
    { emoji: '🍜', label: 'Noodles', color: '#B91C1C' },
    { emoji: '🍱', label: 'Restaurant', color: '#F97316' },
    { emoji: '🍕', label: 'Pizza', color: '#FB923C' },
    { emoji: '🥤', label: 'Drinks', color: '#F59E0B' },

    // Accommodation / Hospitality
    { emoji: '🏨', label: 'Hotel', color: '#2563EB' },
    { emoji: '🏡', label: 'Homestay', color: '#3B82F6' },
    { emoji: '🏠', label: 'Guesthouse', color: '#60A5FA' },
    { emoji: '🛏️', label: 'Room', color: '#1D4ED8' },

    // Shops & Retail
    { emoji: '🛒', label: 'Store', color: '#0EA5E9' },
    { emoji: '🏪', label: 'Convenience', color: '#0284C7' },
    { emoji: '👟', label: 'Fashion', color: '#14B8A6' },
    { emoji: '💍', label: 'Jewelry', color: '#EC4899' },

    // Service Business
    { emoji: '💇', label: 'Salon', color: '#D946EF' },
    { emoji: '💅', label: 'Nails', color: '#DB2777' },
    { emoji: '🏋️‍♂️', label: 'Gym', color: '#4ADE80' },
    { emoji: '🧼', label: 'Laundry', color: '#3B82F6' },
    { emoji: '🛠️', label: 'Repair', color: '#0EA5E9' },
    { emoji: '🧰', label: 'Workshop', color: '#64748B' },

    // Transport / Mobility
    { emoji: '🚕', label: 'Taxi', color: '#FACC15' },
    { emoji: '🛵', label: 'Motorbike', color: '#FDE047' },

    // Modern Business / Startup
    { emoji: '🚀', label: 'Startup', color: '#8B5CF6' },
    { emoji: '🏷️', label: 'Brand', color: '#6366F1' },
  ],
  cooperate: [
    { emoji: '🤝', label: 'Handshake', color: '#06B6D4' },
    { emoji: '👥', label: 'Team', color: '#0891B2' },
    { emoji: '🔗', label: 'Link', color: '#0E7490' },
    { emoji: '🌐', label: 'Global', color: '#155E75' },
    { emoji: '💬', label: 'Chat', color: '#22D3EE' },
    { emoji: '🎯', label: 'Goal', color: '#06B6D4' },
    { emoji: '⚡', label: 'Power', color: '#67E8F9' },
    { emoji: '🚀', label: 'Launch', color: '#0891B2' },

    // Creative collaboration
    { emoji: '🎬', label: 'FilmMaking', color: '#0284C7' },
    { emoji: '🎧', label: 'MusicMaking', color: '#06B6D4' },
    { emoji: '🎤', label: 'SingerCollab', color: '#38BDF8' },
    { emoji: '🎨', label: 'ArtDesign', color: '#0EA5E9' },
    { emoji: '📝', label: 'Writing', color: '#22D3EE' },

    // Tech / Startup collaboration
    { emoji: '💻', label: 'Coding', color: '#0891B2' },
    { emoji: '🧠', label: 'TechIdea', color: '#0E7490' },
    { emoji: '🧩', label: 'Project', color: '#06B6D4' },
    { emoji: '🛠️', label: 'BuildTogether', color: '#14B8A6' },
    { emoji: '📦', label: 'Product', color: '#2DD4BF' },

    // Business collaboration
    { emoji: '📈', label: 'Investment', color: '#0EA5E9' },
    { emoji: '💼', label: 'BizPartner', color: '#0891B2' },
    { emoji: '🏢', label: 'Company', color: '#155E75' },
    { emoji: '📊', label: 'Research', color: '#06B6D4' },

    // Exchange / Sharing
    { emoji: '🔄', label: 'Trade', color: '#38BDF8' },
    { emoji: '♻️', label: 'Recycle', color: '#2DD4BF' },
    { emoji: '📦', label: 'ExchangeItems', color: '#0EA5E9' },
    { emoji: '📮', label: 'SendReceive', color: '#0891B2' },

    // Networking
    { emoji: '📞', label: 'Contact', color: '#22D3EE' },
    { emoji: '🤗', label: 'Connect', color: '#67E8F9' },
    { emoji: '🏷️', label: 'CollabTag', color: '#38BDF8' },
    { emoji: '🗂️', label: 'PartnerPool', color: '#06B6D4' },
  ],
};

// =====================
// PIXEL ART (same as before)
// =====================

const pixelMaps: Record<string, number[][]> = {
  webdev: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  findjob: [
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
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
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  ],
  business: [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  ],
  cooperate: [
    [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  ],
};

// =====================
// COMPONENT
// =====================

export default function ThemeMarker({
  theme,
  center,
  pixelSize = 5,
  socket,
  currentUserId, setShowChat, setRoomId
}: ThemeMarkerProps) {
  const [activeMarkers, setActiveMarkers] = useState<Set<string>>(new Set());
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [onlineUsersInTheme, setOnlineUsersInTheme] = useState<number>(0);

  const pixelMap = pixelMaps[theme];
  const icons = themeIcons[theme];

  useEffect(() => {
    if (!socket) return;

    // Listen for online users
    socket.on("onlineUsers", (users: any) => {
      // Count users interested in this theme
      const count = Object.values(users).filter(
        (user: any) => user.userStatus === theme
      ).length;
      setOnlineUsersInTheme(count);
    });

    // Listen for waves
    socket.on("wave_signal", (data: any) => {
      const key = `${data.lat}-${data.lng}`;
      setActiveMarkers(prev => new Set(prev).add(key));

      // Remove after animation
      setTimeout(() => {
        setActiveMarkers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("wave_signal");
    };
  }, [socket, theme]);

  if (!pixelMap || !icons) return null;

  const handleMarkerClick = (lat: number, lng: number, iconData: any) => {
    if (socket && currentUserId) {
      // Send wave
      socket.emit("wave", { from: currentUserId, lat, lng });

      // Update user status to this theme
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

  const markers: React.ReactNode[] = [];
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
        const customIcon = createAnimatedIcon(iconData.emoji, iconData.color, isActive);
        iconIndex++;

        markers.push(
          <Marker
            key={key}
            position={[lat, lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(lat, lng, iconData),
              mouseover: () => setHoveredMarker(key),
              mouseout: () => setHoveredMarker(null)
            }}
          >
            <Popup>
              <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-lg min-w-[200px]">
                {/* Header */}
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2 animate-bounce">{iconData.emoji}</div>
                  <div
                    className="font-bold text-xl mb-1"
                    style={{ color: iconData.color }}
                  >
                    {iconData.label}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Theme: {theme}
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg p-2 mb-3 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">🟢 Online</span>
                    <span className="font-bold text-green-600">
                      {onlineUsersInTheme}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() =>handleGroupChat(iconData.label)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 font-medium text-sm shadow-md"
                  >
                    💬 Join Group Chat
                  </button>

                  <button
                    onClick={() => handleMarkerClick(lat, lng, iconData)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-500 text-white rounded-lg hover:from-green-600 hover:to-green-600 transition-all transform hover:scale-105 font-medium text-sm shadow-md"
                  >
                    👋 Send Wave
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Click marker to interact • Hover to highlight
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      }
    });
  });

  return <>{markers}</>;
}