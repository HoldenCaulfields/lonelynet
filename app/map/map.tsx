"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import images correctly
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet's default icon paths
type ImageImport = string | { src: string };

function getImageSrc(img: ImageImport): string {
  return typeof img === "string" ? img : img.src;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: getImageSrc(markerIcon2x),
  iconUrl: getImageSrc(markerIcon),
  shadowUrl: getImageSrc(markerShadow),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

//custom icon
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapComponent() {
    return (
        <div className="h-[500px] w-full">
            <MapContainer
                center={[10.7769, 106.7009]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <Marker position={[10.7769, 106.7009]}>
                    <Popup>Xin chào từ TP. Hồ Chí Minh 🇻🇳</Popup>
                </Marker>

                <Marker position={[21.0245, 105.841]} icon={redIcon}>
                    <Popup>Xin chào từ Hà Nội 🇻🇳</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
