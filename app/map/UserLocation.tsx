import { useEffect, useState } from "react";
import { Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
import { userIcon } from "../components/Icon";
import PostForm from "../components/postform/PostForm";

type Latlng = {
  lat: number;
  lng: number;
};

export default function UserLocation() {
  const [position, setPosition] = useState<Latlng | null>(null);

  const map = useMapEvents({
    click() {
      // manually request location again
      map.locate({ enableHighAccuracy: true });
    },
    locationfound(e) {
      const coords = e.latlng;
      setPosition(coords);
      localStorage.setItem("userLocation", JSON.stringify(coords)); // ✅ save for next reload
      map.flyTo(coords, map.getZoom());
    },
  });

  // Load saved location on first render
  useEffect(() => {
    const saved = localStorage.getItem("userLocation");
    if (saved) {
      const coords = JSON.parse(saved) as Latlng;
      setPosition(coords);
      map.flyTo(coords, map.getZoom());
    } else {
      // first time: locate automatically
      map.locate({ enableHighAccuracy: true });
    }
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Tooltip direction="top" offset={[2, -38]} permanent>
        You are here
      </Tooltip>

      <Popup>
        <div className="w-64 md:w-80">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            ✏️ Someone out there will find you
          </h3>
          <PostForm address={position} />
        </div>
      </Popup>
    </Marker>
  );
}
