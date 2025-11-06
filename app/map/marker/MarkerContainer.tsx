"use client";

import { Marker, Popup, useMap } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "../../components/Icon";
import axios from "axios";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Zap, MessageCircle, Heart } from "lucide-react";
import { CustomTooltip } from "../userlocation-post/postform/TagList";

export interface MarkerData {
  _id: string;
  position: [number, number];
  text?: string;
  imageUrl?: string;
  tags?: string[];
  loves: number;
}

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://lonelynet.onrender.com"
    : "http://192.168.1.12:5000";

interface MarkerContainerProps {
  searchText: string;
  setShowChat: (value: boolean) => void;
  setRoomId: (value: string | null) => void;
}

export default function MarkerContainer({
  searchText,
  setShowChat,
  setRoomId,
}: MarkerContainerProps) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<MarkerData | null>(null); //center marker khi click

  /* handle center marker when click */
  const map = useMap(); // ✅ truy cập instance của bản đồ
  // Center map on new location whenever targetPosition changes
  useEffect(() => {
    if (center) {
      const targetLatLng = center.position;
      const zoom = map.getZoom();

      // Tính offset (đơn vị pixel)
      const offsetY = 220; // 👉 điều chỉnh tùy chiều cao navbar (px)

      // Chuyển vị trí thật sang pixel
      const point = map.project(targetLatLng, zoom).subtract([0, offsetY]);
      const newLatLng = map.unproject(point, zoom);

      // Pan tới vị trí có offset
      map.setView(newLatLng, zoom, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [center, map]);

  // --- API Calls ---
  const fetchAllMarkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`, { timeout: 5000 });
      setMarkers(res.data);
    } catch {
      setError("Failed to load souls");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMarkersByText = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`, {
        params: { search },
        timeout: 5000,
      });
      setMarkers(res.data);
    } catch {
      setError("Failed to load souls");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMarkersByTag = useCallback(async (tag: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`, {
        params: { tag },
        timeout: 5000,
      });
      setMarkers(res.data);
    } catch {
      setError("Failed to load souls");
    } finally {
      setLoading(false);
    }
  }, []);
/* 
  const fetchAllTags = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`);
      const souls = res.data as MarkerData[];
      const uniqueTags = Array.from(new Set(souls.flatMap((soul) => soul.tags ?? [])));
      setAllTags(uniqueTags);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  }, []); */

  useEffect(() => {
    fetchAllMarkers();
  }, [fetchAllMarkers]);

  useEffect(() => {
    if (searchText.trim()) {
      setSelectedTag(null);
      const timeoutId = setTimeout(() => fetchMarkersByText(searchText), 300);
      return () => clearTimeout(timeoutId);
    } else fetchAllMarkers();
  }, [searchText, fetchMarkersByText, fetchAllMarkers]);

  useEffect(() => {
    if (selectedTag) fetchMarkersByTag(selectedTag);
    else fetchAllMarkers();
  }, [selectedTag, fetchMarkersByTag, fetchAllMarkers]);

  const handleTagClick = useCallback((tag: string | null) => setSelectedTag(tag), []);

  const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string; }) => (
    <Suspense fallback={<div className="w-full h-48 bg-gradient-to-br from-gray-900 to-black rounded-lg animate-pulse" />}>
      <Image
        src={src}
        width={256}
        height={256}
        sizes="(max-width: 768px) 100vw, 256px"
        className={`${className} w-full h-48 object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105`}
        alt={alt}
        quality={60}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mN8//8AAwAB/ALr5gAAAABJRU5ErkJggg=="
      />
    </Suspense>
  );

  const handleLovePress = useCallback(async (markerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.put(`${API_URL}/api/lonelyland/${markerId}/love`);
      const updatedMarker = res.data;
      setMarkers(prev => prev.map(marker => marker._id === markerId ? updatedMarker : marker));
    } catch {
      setError("Failed to love soul");
    } finally {
      setLoading(false);
    }
  }, []);

  const formatLoveCount = (count: number): string => {
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  };

  return (
    <>
      {/* Tag Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[1000] max-w-2xl w-[95%] sm:w-[80%] animate-in slide-in-from-top-2 duration-300">
        
        <div className="mt-1 flex items-center gap-3 animate-in fade-in-0 duration-200">
          {/* Souls Counter */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-700 via-green-800 to-green-900 px-3 py-1 rounded-full border border-green-400/50 shadow-[0_0_10px_rgba(0,255,0,0.4)]">
            <Zap className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-green-300 font-bold text-sm tracking-wider">
              {markers.length}
            </span>
            <span className="text-gray-200 text-xs uppercase tracking-widest">
              Souls
            </span>
          </div>

          {/* Selected Tag */}
          {selectedTag && (
            <div className="bg-gradient-to-r from-black via-gray-900 to-black px-4 py-1 rounded-full border border-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)]">
              <span className="text-red-400 font-semibold text-xs uppercase tracking-widest">
                #{selectedTag}
              </span>
            </div>
          )}
        </div>
      </div>


      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white animate-bounce" fill="white" />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-black text-white px-6 py-3 rounded-full border-2 border-red-500 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <span className="font-semibold tracking-wide">{error}</span>
        </div>
      )}

      {/* Markers */}
      {markers.map((marker) => (
        <Marker key={marker._id} position={marker.position} icon={redIcon} eventHandlers={{ click: () => setCenter(marker) }}>
          <Popup className="custom-popup" maxWidth={320} minWidth={240}>
            <div
              className="
                bg-gradient-to-b from-white to-gray-50 rounded-xl overflow-hidden shadow-xl 
                group transition-transform duration-300
                w-[280px] sm:w-[320px] 
                max-h-[420px] flex flex-col"
            >
              {/* IMAGE */}
              {marker.imageUrl && (
                <div className="relative w-full h-32 sm:h-40 flex-shrink-0 overflow-hidden">
                  <LazyImage
                    src={marker.imageUrl}
                    alt="soul"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}

              {/* CONTENT */}
              <div className="p-3 flex flex-col justify-between flex-1 overflow-y-auto">
                {/* TEXT */}
                {marker.text && (
                  <p
                    className="
                      text-sm text-gray-800 leading-relaxed mb-2
                      line-clamp-3 sm:line-clamp-4 font-medium
                      max-h-[5.5rem] sm:max-h-[6.5rem] overflow-hidden
                      text-ellipsis"
                    title={marker.text} // hover hiển thị full text
                  >
                    {marker.text}
                  </p>
                )}

                {/* TAGS */}
                <div className="flex overflow-x-auto gap-2 mb-3 py-1 scrollbar-hide">
                  {marker.tags?.slice(0, 5).map((item) => (
                    <button
                      key={item}
                      onClick={() => handleTagClick(item)}
                      className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase rounded-full border transition-all duration-200 ${selectedTag === item
                        ? "bg-black text-white border-black shadow-md"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:border-black hover:bg-gray-200"
                        }`}
                    >
                      #{item}
                    </button>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {/* LOVE BUTTON */}
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    onClick={() => handleLovePress(marker._id)}
                  >
                    <Heart
                      className="w-4 h-4 text-white transition-transform duration-150 group-hover:scale-110"
                      fill="white"
                    />
                    <span className="font-semibold text-white text-sm">
                      {formatLoveCount(marker.loves)}
                    </span>
                  </button>

                  {/* CHAT BUTTON */}
                  <button
                    className="flex-1 flex items-center justify-center px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    onClick={() => {
                      setShowChat(true);
                      setRoomId(marker._id);
                    }}
                    aria-label="Open chat"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </Popup>

          <CustomTooltip marker={marker} />
        </Marker>
      ))}
    </>
  );
}
