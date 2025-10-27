"use client";

import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "../../components/Icon";
import axios from "axios";
import { useState, useEffect, useCallback, Suspense } from "react";
import Tags from "./Tags";
import ChatBox from "@/app/components/chatbox/ChatBox";

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
}

export default function MarkerContainer({
  searchText,
}: MarkerContainerProps) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch all markers ---
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

  // --- Fetch markers by text ---
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

  // --- Fetch markers by tag ---
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

  // --- Fetch all tags ---
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

  // 1️⃣ On first load: fetch all
  useEffect(() => {
    fetchAllMarkers();
    fetchAllTags();
  }, [fetchAllMarkers, fetchAllTags]);

  // 2️⃣ When search changes
  useEffect(() => {
    if (searchText.trim()) {
      setSelectedTag(null); // clear tag when typing
      const timeoutId = setTimeout(() => {
        fetchMarkersByText(searchText);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchAllMarkers(); // show all when cleared
    }
  }, [searchText, fetchMarkersByText, fetchAllMarkers]);

  // 3️⃣ When tag changes
  useEffect(() => {
    if (selectedTag) {
      fetchMarkersByTag(selectedTag);
    } else {
      fetchAllMarkers();
    }
  }, [selectedTag, fetchMarkersByTag, fetchAllMarkers]);

  // --- Handle tag click ---
  const handleTagClick = useCallback((tag: string | null) => {
    setSelectedTag(tag);
  }, []);

  // --- Lazy Image ---
  const LazyImage = ({ src, alt }: { src: string; alt: string }) => (
    <Suspense fallback={<div className="w-full h-48 bg-gray-100 rounded-lg animate-pulse" />}>
      <Image
        src={src}
        width={256}
        height={256}
        sizes="(max-width: 768px) 100vw, 256px"
        className="w-full h-48 object-cover rounded-lg"
        alt={alt}
        quality={60}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mN8//8AAwAB/ALr5gAAAABJRU5ErkJggg=="
      />
    </Suspense>
  );

  /** Handles love (like) button press */
  const handleLovePress = useCallback(async (markerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.put(`${API_URL}/api/lonelyland/${markerId}/love`);
      const updatedMarker = res.data; 
      console.log("❤️ Loved:", updatedMarker.loves);
      setMarkers(prevMarkers =>
        prevMarkers.map(marker =>
          marker._id === markerId ? updatedMarker : marker
        ));
      
    } catch {
      setError("Failed to load souls");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {/* Power Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[1000] max-w-2xl w-[95%] sm:w-[80%] animate-in slide-in-from-top-2 duration-300">
        <div className="mt-2 overflow-x-auto">
          <Tags tags={allTags} selectedTag={selectedTag} onTagSelect={handleTagClick} />
        </div>
        <p className="text-red-500 font-mono text-sm mt-3 tracking-wider animate-in fade-in-0 duration-200">
          {markers.length} SOULS {selectedTag ? `• #${selectedTag}` : ""}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20">
          <div className="text-6xl text-white drop-shadow-lg animate-bounce">📍</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded animate-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}

      {/* Markers */}
      {markers.map((marker) => (
        <Marker key={marker._id} position={marker.position} icon={redIcon}>
          <Popup className="custom-popup" maxWidth={320} minWidth={200}>
            <div >

              {marker.imageUrl && (
                <div className="mb-3 w-full h-48">
                  <LazyImage src={marker.imageUrl} alt="soul" />
                </div>
              )}
              {marker.text && (
                <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-4">
                  {marker.text}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {marker.tags?.slice(0, 5).map((item) => (
                  <span
                    key={item}
                    onClick={() => handleTagClick(item)}
                    className={`inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full cursor-pointer transition-all duration-200 ${selectedTag === item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-white hover:bg-blue-500 hover:text-white"
                      }`}
                  >
                    #{item}
                  </span>
                ))}
              </div>

              <div className="flex space-x-4 w-full p-4 border-t border-slate-200 bg-white rounded-b-xl">
                <button
                  className="flex-1 p-3 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
                  onClick={() => handleLovePress(marker._id)}
                /* aria-label={`Love count: ${marker.loves}`} */
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">❤️</span>
                    <span className="font-bold text-lg text-red-600">{marker.loves}</span>
                  </div>
                </button>

                <button
                  className="flex-1 p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-all duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
                  /* onClick={handleChat} */
                  aria-label="Open chat"
                >
                  <div className="flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
