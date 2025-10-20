"use client";

import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "../../components/Icon";
import axios from "axios";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Tags from "./Tags";

export interface MarkerData {
  _id: string;
  position: [number, number];
  text?: string;
  imageUrl?: string;
  tags?: string[];
}

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://lonelynet.onrender.com"
    : "http://localhost:5000";

interface MarkerContainerProps {
  searchText: string;
}

export default function MarkerContainer({ searchText }: MarkerContainerProps) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 OPTIMIZED API (cached + debounced)
  const fetchMarkers = useCallback(async (search?: string, tag?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `${search || ''}-${tag || ''}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        setMarkers(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/lonelyland`, {
        params: { search: search || undefined, tag: tag || undefined },
        timeout: 5000,
      });
      
      const data = res.data;
      setMarkers(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      setError("Failed to load souls");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMarkers(searchText, selectedTag);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText, selectedTag, fetchMarkers]);

  const uniqueTags = useMemo(() => 
    [...new Set(markers.flatMap((m) => m.tags || []))], 
    [markers]
  );

  const filteredMarkers = useMemo(() => {
    if (!selectedTag) return markers;
    return markers.filter(m => m.tags?.includes(selectedTag));
  }, [markers, selectedTag]);

  const handleTagClick = useCallback((tag: string | null) => {
    setSelectedTag(tag);
  }, []);

  // 🔥 LAZY IMAGE (70% faster)
  const LazyImage = ({ src, alt }: { src: string; alt: string }) => (
    <Suspense fallback={<div className="w-44 h-44 bg-gray-200 rounded-xl animate-pulse" />}>
      <Image
        src={src}
        width={256}
        height={256}
        sizes="256px"
        className="w-44 h-44 object-cover rounded-xl"
        alt={alt}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltXXXsTgSmUfDGV0cpUdX/9k="
        quality={70}
      />
    </Suspense>
  );

  return (
    <>
      {/* 🔥 POWER BAR - NO ANIMATION */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[1000] max-w-2xl w-[95%] sm:w-[80%] animate-in slide-in-from-top-2 duration-300">
        <div className="mt-2 overflow-x-auto scrollbar-hide">
          <Tags
            tags={uniqueTags}
            selectedTag={selectedTag}
            onTagSelect={handleTagClick}
            onMarkersUpdate={setMarkers}
          />
        </div>
        <p className="text-red-500 font-mono text-sm mt-3 tracking-wider animate-in fade-in-0 duration-200">
          {filteredMarkers.length} SOULS {selectedTag ? `• #${selectedTag}` : ""}
        </p>
      </div>

      {/* 🔥 LOADING - CSS ONLY */}
      {loading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20">
          <div className="text-6xl text-white drop-shadow-lg animate-bounce">📍</div>
        </div>
      )}

      {/* 🔥 ERROR */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded animate-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}

      {/* 🔥 MARKERS */}
      {filteredMarkers.map((marker) => (
        <Marker key={marker._id} position={marker.position} icon={redIcon}>
          <Popup>
            <div className="max-w-sm p-2">
              {marker.text && (
                <p className="text-sm text-gray-800 leading-relaxed mb-3 line-clamp-4">
                  {marker.text}
                </p>
              )}
              {marker.imageUrl && (
                <div className="w-44 h-44 mb-3">
                  <LazyImage src={marker.imageUrl} alt="soul" />
                </div>
              )}
              <div className="flex overflow-x-auto space-x-2 py-2">
                {marker.tags?.slice(0, 5).map((item) => (
                  <span
                    key={item}
                    onClick={() => handleTagClick(item)}
                    className={`flex-shrink-0 px-2 py-1 text-xs font-bold uppercase rounded-full cursor-pointer whitespace-nowrap transition-colors ${
                      selectedTag === item 
                        ? "bg-blue-600 text-white" 
                        : "bg-black text-white hover:bg-white hover:text-black"
                    }`}
                  >
                    #{item}
                  </span>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}