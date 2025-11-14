"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

type ThemeMarkerProps = {
    theme: "webdev" | "findjob" | "lover" | "art" | "business" | "cooperate";
    center: [number, number];
    pixelSize?: number;
};

// =====================
// CUSTOM ICON CREATOR
// =====================

const createCustomIcon = (emoji: string, color: string) => {
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
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
                transition: transform 0.2s;
            " class="custom-marker">
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
// THEME ICONS
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
        { emoji: '💼', label: 'Job', color: '#3B82F6' },
        { emoji: '📝', label: 'CV', color: '#10B981' },
        { emoji: '🎯', label: 'Target', color: '#F59E0B' },
        { emoji: '📊', label: 'Analytics', color: '#8B5CF6' },
        { emoji: '🚀', label: 'Startup', color: '#EF4444' },
        { emoji: '💡', label: 'Idea', color: '#F59E0B' },
        { emoji: '📈', label: 'Growth', color: '#10B981' },
        { emoji: '🔍', label: 'Search', color: '#06B6D4' },
    ],
    lover: [
        { emoji: '❤️', label: 'Love', color: '#EF4444' },
        { emoji: '💕', label: 'Hearts', color: '#F472B6' },
        { emoji: '💖', label: 'Sparkle', color: '#EC4899' },
        { emoji: '💗', label: 'Growing', color: '#F43F5E' },
        { emoji: '💝', label: 'Gift', color: '#E11D48' },
        { emoji: '💘', label: 'Arrow', color: '#DC2626' },
        { emoji: '💞', label: 'Revolving', color: '#F87171' },
        { emoji: '💓', label: 'Beating', color: '#FB7185' },
    ],
    art: [
        { emoji: '🎨', label: 'Palette', color: '#A855F7' },
        { emoji: '🖌️', label: 'Brush', color: '#8B5CF6' },
        { emoji: '🖍️', label: 'Crayon', color: '#C084FC' },
        { emoji: '✏️', label: 'Pencil', color: '#D8B4FE' },
        { emoji: '🎭', label: 'Theater', color: '#9333EA' },
        { emoji: '🌈', label: 'Rainbow', color: '#A78BFA' },
        { emoji: '✨', label: 'Sparkles', color: '#DDD6FE' },
        { emoji: '🎪', label: 'Circus', color: '#7C3AED' },
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
    ],
};

// =====================
// PIXEL ART DEFINITIONS
// =====================

const webdevPixels = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0],
    [0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0],
    [0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const findjobPixels = [
    [0,0,0,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,1,0],
    [0,0,0,0,0,0,1,0,1,1,1,1,1,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,1,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,1,0],
    [0,0,0,1,0,0,0,0,1,1,1,1,1,0],
];

const loverPixels = [
    [0,0,1,1,1,0,0,0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0,0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0],
];

const artPixels = [
    [0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0],
    [0,1,1,1,1,1,1,1,0,0,0,0],
    [1,0,1,0,1,0,1,0,1,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0],
    [1,0,1,0,1,0,1,0,0,1,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0],
    [0,1,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
];

const businessPixels = [
    [0,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,0,0,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,1,1,0,0,0,1],
    [1,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,1,1,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [0,1,1,1,1,1,1,1,1,1,1,0],
];

const cooperatePixels = [
    [0,0,1,1,0,0,0,0,0,1,1,0,0],
    [0,1,0,0,1,0,0,0,1,0,0,1,0],
    [0,1,0,0,1,0,0,0,1,0,0,1,0],
    [0,1,0,0,0,1,0,1,0,0,0,1,0],
    [0,0,1,0,0,1,1,1,0,0,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,1,1,0,1,1,0],
    [1,1,0,0,0,1,1,1,0,0,0,1,1],
];

const pixelMaps: Record<string, number[][]> = {
    webdev: webdevPixels,
    findjob: findjobPixels,
    lover: loverPixels,
    art: artPixels,
    business: businessPixels,
    cooperate: cooperatePixels,
};

// =====================
// COMPONENT
// =====================

export default function ThemeMarker({ 
    theme, 
    center, 
    pixelSize = 1
}: ThemeMarkerProps) {
    const pixelMap = pixelMaps[theme];
    const icons = themeIcons[theme];
    
    if (!pixelMap || !icons) return null;

    const markers: React.ReactNode[] = [];
    const rows = pixelMap.length;
    const cols = pixelMap[0]?.length || 0;

    let iconIndex = 0;

    pixelMap.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell === 1) {
                const lat = center[0] + (rIdx - rows / 2) * pixelSize;
                const lng = center[1] + (cIdx - cols / 2) * pixelSize;

                // Rotate through icons
                const iconData = icons[iconIndex % icons.length];
                const customIcon = createCustomIcon(iconData.emoji, iconData.color);
                iconIndex++;

                markers.push(
                    <Marker 
                        key={`${theme}-${rIdx}-${cIdx}`} 
                        position={[lat, lng]} 
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <div className="text-3xl mb-2">{iconData.emoji}</div>
                                <div className="font-bold text-lg" style={{ color: iconData.color }}>
                                    {iconData.label}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 capitalize">
                                    Theme: {theme}
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
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