"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Marker, Tooltip, Popup, useMap } from "react-leaflet";
import { userIcon } from "../../components/Icon";
import PostForm from "./postform/PostForm";

type Latlng = { lat: number; lng: number };

type UserLocationProps = {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
};

export default function UserLocation({ showForm, setShowForm }: UserLocationProps) {
  const [position, setPosition] = useState<Latlng | null>(null);
  const map = useMap(); // 🔥 GET MAP INSTANCE

  // 🔥 CACHED LOCATION
  const getCachedLocation = useCallback(() => {
    const saved = localStorage.getItem("userLocation");
    return saved ? JSON.parse(saved) as Latlng : null;
  }, []);

  const savedPosition = useMemo(() => getCachedLocation(), [getCachedLocation]);

  useEffect(() => {
    if (savedPosition) {
      setPosition(savedPosition);
      // 🔥 AUTO-FOCUS: Center map on cached location IMMEDIATELY
      map.setView(savedPosition, 13);
      return;
    }

    // 🔥 FAST GEO
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        localStorage.setItem("userLocation", JSON.stringify(coords));
        // 🔥 AUTO-FOCUS: Center map on NEW location
        map.setView(coords, 13);
      },
      () => {
        // 🔥 FALLBACK: Default to world center if geo fails
        const defaultPos = { lat: 0, lng: 0 };
        setPosition(defaultPos);
        map.setView(defaultPos, 2);
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  }, [savedPosition, map]);

  const handleClose = useCallback(() => setShowForm(false), [setShowForm]);

  if (!position) return null;

  return (
    <>
      {/* 🔥 MARKER - Always visible & centered */}
      <Marker position={position} icon={userIcon}>
        <Tooltip direction="top" offset={[2, -58]} permanent>
          You are here
        </Tooltip>
        <Popup>
          <PostForm address={position} />
        </Popup>
      </Marker>

      {/* 🔥 MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl z-10"
              onClick={handleClose}
            >
              ×
            </button>
            <PostForm address={position} />
          </div>
        </div>
      )}
    </>
  );
}