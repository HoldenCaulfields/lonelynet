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
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch markers
  const fetchMarkers = useCallback(async (search?: string, tag?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`, {
        params: { search: search || undefined, tag: tag || undefined },
        timeout: 5000,
      });
      setMarkers(res.data);
    } catch (err) {
      setError("Failed to load souls");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all tags once
  const fetchAllTags = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`);
      const souls = res.data;
      const uniqueTags = Array.from(
        new Set(
          (souls as MarkerData[]).flatMap((soul) => soul.tags ?? [])
        )
      );
      setAllTags(uniqueTags);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  // Debounce marker fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMarkers(searchText, selectedTag);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText, selectedTag, fetchMarkers]);

  const filteredMarkers = useMemo(() => {
    if (!selectedTag) return markers;
    return markers.filter((m) => m.tags?.includes(selectedTag));
  }, [markers, selectedTag]);

  const handleTagClick = useCallback((tag: string | null) => {
    setSelectedTag(tag);
  }, []);

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

  return (
    <>
      {/* Power Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[1000] max-w-2xl w-[95%] sm:w-[80%] animate-in slide-in-from-top-2 duration-300">
        <div className="mt-2 overflow-x-auto scrollbar-hide">
          <Tags
            tags={allTags}
            selectedTag={selectedTag}
            onTagSelect={handleTagClick}
          />
        </div>
        <p className="text-red-500 font-mono text-sm mt-3 tracking-wider animate-in fade-in-0 duration-200">
          {filteredMarkers.length} SOULS {selectedTag ? `• #${selectedTag}` : ""}
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
      {filteredMarkers.map((marker) => (
        <Marker key={marker._id} position={marker.position} icon={redIcon}>
          <Popup
            className="custom-popup"
            maxWidth={320}
            minWidth={200}
          >
            <div className="p-4 bg-white rounded-lg shadow-lg max-w-[320px] font-sans">
              {marker.text && (
                <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-4">
                  {marker.text}
                </p>
              )}
              {marker.imageUrl && (
                <div className="mb-3 w-full h-48">
                  <LazyImage src={marker.imageUrl} alt="soul" />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {marker.tags?.slice(0, 5).map((item) => (
                  <span
                    key={item}
                    onClick={() => handleTagClick(item)}
                    className={`inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full cursor-pointer transition-all duration-200 ${
                      selectedTag === item
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-white hover:bg-blue-500 hover:text-white"
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