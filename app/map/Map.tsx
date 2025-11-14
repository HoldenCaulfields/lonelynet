"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import MarkerContainer from "./marker/MarkerContainer";
import Navbar from "../navbar/NavBar";
import { useState } from "react";
import ChatView from "../components/chatbox/ChatView";
import Controls from "../components/Controls";
import UserLocationNew from "./user/UserLocationNew";

export default function Map() {
    const [searchText, setSearchText] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [showPost, setShowPost] = useState(false);

    const [userId] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("socigo_user_id");
            if (stored) return stored;
            const newId = Math.floor(Math.random() * 1_000_000).toString();
            localStorage.setItem("socigo_user_id", newId);
            return newId;
        }
        return "anonymous";
    });

    return (
        <div className="flex flex-col h-screen w-full bg-gray-100">
            {/* Navbar ở trên */}
            <Navbar setSearchText={setSearchText} />

            {/* Map chiếm toàn bộ phần còn lại */}
            <div className="flex-1 relative">
                <MapContainer
                    center={[16, 107]} 
                    zoom={6}
                    minZoom={2}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    worldCopyJump={false}
                    maxBounds={[
                        [-85, -180],
                        [85, 180],
                    ]}
                    maxBoundsViscosity={1.0}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    />

                    <ZoomControl position="bottomleft" />

                    <MarkerContainer
                        searchText={searchText}
                        setShowChat={setShowChat}
                        setRoomId={setRoomId}
                    />

                    <UserLocationNew setShowChat={setShowChat} setRoomId={setRoomId} 
                        showPost={showPost} setShowPost={setShowPost}/>

                    {/* <ThemeMarker theme="webdev" shape="circle" center={[37.7749, -122.4194]} /> */}

                </MapContainer>

                <Controls
                    setRoomId={(id) => {
                        setRoomId(id);
                        setShowChat(true);
                    }}
                    togglePost={() => setShowPost((prev) => !prev)}
                    showPost={showPost}
                />
            </div>

            {/* CHAT BOX */}
            {roomId && (
                <ChatView
                    roomId={roomId}
                    userId={userId}
                    showChat={showChat}
                    onClose={() => setShowChat(false)}
                />
            )}

        </div>
    );
}
