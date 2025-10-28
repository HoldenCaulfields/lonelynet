"use client";

import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "../../components/Icon";
import axios from "axios";
import { useState, useEffect, useCallback, Suspense } from "react";
import Tags from "./Tags";
import { Zap, MessageCircle, Heart } from "lucide-react";

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
    : "http://localhost:5000";

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

  const fetchAllTags = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`);
      const souls = res.data as MarkerData[];
      const uniqueTags = Array.from(new Set(souls.flatMap((soul) => soul.tags ?? [])));
      setAllTags(uniqueTags);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllMarkers();
    fetchAllTags();
  }, [fetchAllMarkers, fetchAllTags]);

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

  const LazyImage = ({ src, alt }: { src: string; alt: string }) => (
    <Suspense fallback={<div className="w-full h-48 bg-gradient-to-br from-gray-900 to-black rounded-lg animate-pulse" />}>
      <Image
        src={src}
        width={256}
        height={256}
        sizes="(max-width: 768px) 100vw, 256px"
        className="w-full h-48 object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105"
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
        <div className="mt-2 overflow-x-auto">
          <Tags selectedTag={selectedTag} onTagSelect={handleTagClick} />
        </div>

        <div className="mt-3 flex items-center gap-3 animate-in fade-in-0 duration-200">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-4 py-2 rounded-full border-2 border-white shadow-lg animate-pulse">
            <Zap className="w-4 h-4 text-white" fill="white" />
            <span className="text-white font-bold text-sm tracking-wider">{markers.length}</span>
            <span className="text-white text-xs uppercase tracking-widest">Souls</span>
          </div>
          {selectedTag && (
            <div className="bg-white px-4 py-2 rounded-full border-2 border-black shadow-lg">
              <span className="text-black font-semibold text-xs uppercase tracking-widest">
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
        <Marker key={marker._id} position={marker.position} icon={redIcon}>
          <Popup className="custom-popup" maxWidth={320} minWidth={200}>
            <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl overflow-hidden shadow-xl group  transition-transform duration-300">
              {marker.imageUrl && (
                <div className="w-full h-48 relative">
                  <LazyImage src={marker.imageUrl} alt="soul" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300" />
                </div>
              )}

              <div className="p-4">
                {marker.text && (
                  <p className="text-sm text-gray-800 leading-relaxed mb-4 line-clamp-4 font-medium">
                    {marker.text}
                  </p>
                )}

                <div className="flex overflow-x-auto gap-2 mb-4 py-1">
                  {marker.tags?.slice(0, 5).map((item) => (
                    <button
                      key={item}
                      onClick={() => handleTagClick(item)}
                      className={`flex-shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase rounded-full cursor-pointer transition-all duration-200 border-2 tracking-wide ${selectedTag === item
                          ? "bg-black text-white border-black shadow-lg scale-105"
                          : "bg-gray-200 text-gray-800 border-gray-300 hover:border-black hover:bg-gray-300 hover:scale-105 hover:shadow-md"
                        }`}
                    >
                      #{item}
                    </button>
                  ))}
                </div>


                <div className="flex gap-3 pt-3 border-t-2 border-gray-100">
                  <button
                    className="flex-1 group relative overflow-hidden px-4 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    onClick={() => handleLovePress(marker._id)}
                  >
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Heart
                        className="w-5 h-5 text-white group-hover:scale-125 transition-transform duration-200"
                        fill="white"
                      />
                      <span className="font-bold text-base text-white whitespace-nowrap">
                        {formatLoveCount(marker.loves)}
                      </span>
                    </div>
                  </button>

                  <button
                    className="flex-1 group relative overflow-hidden px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    onClick={() => {
                      setShowChat(true);
                      setRoomId(marker._id);
                    }}
                    aria-label="Open chat"
                  >
                    <div className="flex items-center justify-center relative z-10">
                      <MessageCircle className="w-5 h-5 text-white hover:scale-120 transition-colors duration-200" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
