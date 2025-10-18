"use client";

import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "../../components/Icon";
import axios from "axios";
import { useState, useEffect } from "react";
import Tags from "./Tags";
import { motion, AnimatePresence } from "framer-motion";

interface MarkerData {
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

export default function MarkerContainer() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ LOAD ALL on start
  useEffect(() => {
    fetchAllMarkers();
  }, []);

  const fetchAllMarkers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland`);
      setMarkers(res.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER BY TAG
  const fetchMarkersByTag = async (tag: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lonelyland?tag=${tag}`);
      setMarkers(res.data);
      setSelectedTag(tag);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string | null) => {
    if (tag === null) {
      // clear filter and reload all markers
      setSelectedTag(null);
      fetchAllMarkers();
      return;
    }
    fetchMarkersByTag(tag);
  };

  // ✅ FILTERED MARKERS
  const filteredMarkers = selectedTag
    ? markers.filter((m) => m.tags?.includes(selectedTag))
    : markers;

  return (
    <>
      {/* 🌟 POWER BAR - LUXURY BLACK BAR */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-[1000]  max-w-2xl w-[95%] sm:w-[80%]"
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
          {filteredMarkers.length} PINS {selectedTag ? `• #${selectedTag}` : ""}
        </motion.p>
      </motion.div>

      {/* ⚡ MINIMAL LOADING - FLOATING PIN */}
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

      {/* Marker popup */}
      {markers.map((marker) => (
        <Marker key={marker._id} position={marker.position} icon={redIcon}>
          <Popup>
            <div className="max-w-sm">
              {marker.text && (
                <p
                  className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3 max-w-full overflow-hidden break-words"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                >
                  {marker.text}
                </p>
              )}
              {marker.imageUrl && (
                <div className="mt-2">
                  <Image
                    src={marker.imageUrl}
                    width={200}
                    height={100}
                    className="w-full h-34 object-cover rounded-xl"
                    alt="popup"
                  />
                </div>
              )}
              <div className="flex overflow-x-auto space-x-2 py-2">
                {marker.tags?.map((item) => (
                  <span
                    key={item}
                    onClick={() => handleTagClick(item)}
                    className={`flex-shrink-0 px-3 py-1 text-xs font-bold uppercase rounded-full cursor-pointer ${selectedTag === item
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