"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

//custom icon
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

//user location
import UserLocation from "../component/UserLocation";


export default function MapComponent() {
    return (
        <div className="h-full w-full">
            <MapContainer
                center={[10.7769, 106.7009]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <Marker position={[10.7769, 106.7009]} icon={redIcon}>
                    <Popup>Xin chào từ TP. Hồ Chí Minh 🇻🇳
                        <img src="https://asiapata.com/vn/wp-content/uploads/2024/08/meme-con-meo-1.jpg" alt="icon" />
                    </Popup>
                </Marker>

                <Marker position={[21.0245, 105.841]} icon={redIcon}>
                    <Popup>Xin chào từ Hà Nội 🇻🇳</Popup>
                </Marker>

                <UserLocation icon={redIcon} />
            </MapContainer>
        </div>
    );
}
