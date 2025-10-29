"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import UserLocation from "./userlocation-post/UserLocation";
import MarkerContainer from "./marker/MarkerContainer";
import Navbar from "../navbar/NavBar";
import { useState } from "react";
import ChatView from "../components/chatbox/ChatView";
import Controls from "../components/Controls";

export default function Map() {
    const [searchText, setSearchText] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [userId] = useState(() => Math.floor(Math.random() * 1_000_000).toString());
    const [openForm, setOpenForm] = useState(false);

    return (
        <div className="flex flex-col h-screen w-full">
            <Navbar searchText={searchText} setSearchText={setSearchText} />

            <MapContainer
                center={[16.45568, 107.59315]}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <ZoomControl position="bottomleft" />

                <MarkerContainer searchText={searchText} setShowChat={setShowChat} setRoomId={setRoomId} />

                {userLocation && (
                    <UserLocation setOpenForm={setOpenForm} targetPosition={userLocation} />
                )}
            </MapContainer>

            {roomId && (
                <ChatView
                    roomId={roomId}
                    userId={userId}
                    showChat={showChat}
                    onClose={() => setShowChat(false)}
                />
            )}

            <Controls openForm={openForm} setOpenForm={setOpenForm} onLocationClick={(coords) => {setUserLocation(coords)}} 
                setRoomId={(id) => {setRoomId(id); setShowChat(true);}}/>
        </div>
    );
}
