"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import UserLocation from "./userlocation-post/UserLocation";
import MarkerContainer from "./marker/MarkerContainer";
import Navbar from "../navbar/NavBar";
import { useState } from "react";
import ChatBox from "../components/chatbox/ChatBox";
import ChatView from "../components/chatbox/ChatView";



export default function Map() {
    const [searchText, setSearchText] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);

    const handleCreateSoul = () => setShowForm(true);

    const [userId] = useState(() => Math.floor(Math.random() * 1_000_000).toString());

    return (
        <div className="flex flex-col h-screen w-full">
            <Navbar searchText={searchText} setSearchText={setSearchText} setOnClick={handleCreateSoul} />

            <MapContainer
                center={[16.45568, 107.59315]}
                zoom={8}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <ZoomControl position="bottomleft" />

                <MarkerContainer searchText={searchText} setShowChat={setShowChat} setRoomId={setRoomId} />

                <UserLocation showForm={showForm} setShowForm={setShowForm} />
            </MapContainer>

            <ChatBox setRoomId={(id) => {
                setRoomId(id);
                setShowChat(true);
            }} />

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
