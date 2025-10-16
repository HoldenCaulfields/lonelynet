import { Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { redIcon } from "./Icon";
import axios from "axios";
import { useState, useEffect } from "react";

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
      const res = await axios.get(
        `${API_URL}/api/lonelyland?tag=${tag}`
      );
      setMarkers(res.data); // ONLY this tag!
      setSelectedTag(tag);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    fetchMarkersByTag(tag);
  };

  return (
    <>
      {selectedTag && (
        <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
          <span className="text-sm">#{selectedTag}</span>
        </div>
      )}

      {loading && (
        <div className="absolute top-1/2 left-1/2 z-[1000] bg-white p-3 rounded-lg shadow-lg">
          Loading...
        </div>
      )}

      {markers.map((marker) => (
        <Marker key={marker._id} position={marker.position} icon={redIcon}>
          <Popup>
            <div className="max-w-sm">
              {marker.text}
              {marker.imageUrl && (
                <div className="mt-2">
                  <Image
                    src={marker.imageUrl}
                    width={200}
                    height={100}
                    className="w-full h-24 object-cover rounded-xl"
                    alt="popup"
                  />
                </div>
              )}
              <div className="flex overflow-x-auto space-x-2 py-2">
                {marker.tags?.map((item) => (
                  <span
                    key={item}
                    onClick={() => handleTagClick(item)}
                    className={`flex-shrink-0 px-3 py-1 text-xs font-bold uppercase rounded-full cursor-pointer ${
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