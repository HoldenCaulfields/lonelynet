"use client";

import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "../../components/Icon";
import axios from "axios";
import { useState, useEffect } from "react";
import Tags from "./Tags";
import { motion, AnimatePresence } from "framer-motion";

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

  const fetchMarkers = async (search?: string, tag?: string | null) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`, {
        params: {
          search: search || undefined,
          tag: tag || undefined,
        },
      });
      setMarkers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch markers on mount and whenever searchText or selectedTag changes
  useEffect(() => {
    fetchMarkers(searchText, selectedTag);
  }, [searchText, selectedTag]);

  const handleTagClick = (tag: string | null) => {
    setSelectedTag(tag);
  };

  return (
    <>
      {/* POWER BAR */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-[1000] max-w-2xl w-[95%] sm:w-[80%]"
      >
        <div className="mt-2 overflow-x-auto scrollbar-hide">
          <Tags
            tags={[...new Set(markers.flatMap((m) => m.tags || []))]}
            selectedTag={selectedTag}
            onTagSelect={handleTagClick}
            onMarkersUpdate={setMarkers}
          />
        </div>
        <motion.p
          className="text-red-500 font-mono text-sm mt-3 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {markers.length} SOULS {selectedTag ? `• #${selectedTag}` : ""}
        </motion.p>
      </motion.div>

      {/* LOADING PIN */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-center"
            >
              <div className="text-6xl mb-2 text-white drop-shadow-lg">📍</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MARKERS */}
      {markers.map((marker) => (
        <Marker key={marker._id} position={marker.position} icon={redIcon}>
          <Popup>
            <div className="max-w-sm">
              {marker.text && (
                <p
                  className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3 max-w-full break-words"
                  style={{ wordBreak: "break-word", overflowWrap: "break-word", hyphens: "auto" }}
                >
                  {marker.text}
                </p>
              )}
              {marker.imageUrl && (
                <div className="w-44 h-44"> {/* 256x256px */}
                  <Image
                    src={marker.imageUrl}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover rounded-xl"
                    alt="popup"
                  />
                </div>

              )}
              <div className="flex overflow-x-auto space-x-2 py-2">
                {marker.tags?.map((item) => (
                  <span
                    key={item}
                    onClick={() => handleTagClick(item)}
                    className={`flex-shrink-0 px-3 py-1 text-xs font-bold uppercase rounded-full cursor-pointer ${selectedTag === item ? "bg-blue-600 text-white" : "bg-black text-white hover:bg-white hover:text-black"
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
