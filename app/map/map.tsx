"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
//user location
import UserLocation from "../component/UserLocation";

//custom icon
const redIcon = new L.Icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


export default function MapComponent() {
    return (
        <div className="h-full w-full">
            <MapContainer
                center={[16.45568, 107.59315]}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <Marker position={[10.7769, 106.7009]} icon={redIcon}>
                    <Popup>Xin chào từ TP. Hồ Chí Minh 🇻🇳
                        <Image width={200} height={100} src="/meo.jpg" alt="icon" />
                    </Popup>
                </Marker>

                <Marker position={[21.0245, 105.841]} icon={redIcon}>
                    <Popup>Xin chào từ Hà Nội 🇻🇳</Popup>
                </Marker>

                {/* <Marker position={[16.83494, 112.33855]} icon={redIcon}>
                    <Popup>Hoàng Sa (Viet Nam)</Popup>
                </Marker>

                <Marker position={[8.644541, 111.920321]} icon={redIcon}>
                    <Popup>Trường Sa (Viet Nam)</Popup>
                </Marker> */}

                <UserLocation icon={redIcon} />
            </MapContainer>
        </div>
    );
}
