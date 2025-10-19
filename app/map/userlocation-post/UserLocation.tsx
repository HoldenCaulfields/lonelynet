"use client";
import { useEffect, useState } from "react";
import { Marker, Tooltip, useMapEvents, Popup } from "react-leaflet";
import { userIcon } from "../../components/Icon";
import PostForm from "./postform/PostForm";

type Latlng = { lat: number; lng: number };

type UserLocationProps = {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
};

export default function UserLocation({ showForm, setShowForm }: UserLocationProps) {
  const [position, setPosition] = useState<Latlng | null>(null);
  //const [showForm, setShowForm] = useState(false);

  const map = useMapEvents({
    click() {
      map.locate({ enableHighAccuracy: true });
    },
    locationfound(e) {
      const coords = e.latlng;
      setPosition(coords);
      localStorage.setItem("userLocation", JSON.stringify(coords));
      map.flyTo(coords, map.getZoom());
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("userLocation");
    if (saved) {
      const coords = JSON.parse(saved) as Latlng;
      setPosition(coords);
      map.flyTo(coords, map.getZoom());
    } else {
      map.locate({ enableHighAccuracy: true });
    }
  }, [map]);

  if (!position) return null;

  return (
    <>

      {/* Marker with Popup */}
      <Marker
        position={position}
        icon={userIcon}

      >
        <Tooltip direction="top" offset={[2, -58]} permanent>
          You are here
        </Tooltip>
        {/* Optional: Popup version */}
        <Popup>
          <PostForm address={position} />
        </Popup>
      </Marker>

      {/* Floating PostForm Modal (for button click) */}
      {showForm && (
        <div
          className="fixed inset-0 z-2000 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)} // click on backdrop closes modal
        >
          <div
            className="relative w-full max-w-xl"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
              onClick={() => setShowForm(false)}
            >
              &times;
            </button>
            <PostForm address={position} />
          </div>
        </div>
      )}

    </>
  );
}
