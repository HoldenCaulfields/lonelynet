"use client";

import { MapContainer, TileLayer} from "react-leaflet";
import UserLocation from "../component/UserLocation"; //user location
import MarkerContainer from "../component/MarkerContainer";


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

                <MarkerContainer />

                <UserLocation />
            </MapContainer>
        </div>
    );
}
