"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import UserLocation from "./userlocation-post/UserLocation";
import MarkerContainer from "./marker/MarkerContainer";
import Navbar from "../navbar/NavBar";
import { useState } from "react";

export default function Map() {
    const [searchText, setSearchText] = useState("");

    return (
        <div className="h-full w-full">
            <Navbar searchText={searchText} setSearchText={setSearchText} />

            <MapContainer
                center={[16.45568, 107.59315]} 
                zoom={8}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <MarkerContainer searchText={searchText} />

                <UserLocation />
            </MapContainer>
        </div>
    );
}
