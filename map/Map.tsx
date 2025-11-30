"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import MarkerContainer from "./marker/MarkerContainer";
import Navbar from "../components/navbar/NavBar";
import { useState } from "react";
import ChatView from "../components/chatbox/ChatView";
import UserLocationNew from "./user/UserLocationNew";
import SearchModal from "@/components/searchMagicBox/SearchModal"; // Import SearchModal

export default function Map() {
    const [searchText, setSearchText] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [showPost, setShowPost] = useState(false);
    
    // State mới cho Search Modal
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [userId] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("lonelynet_user_id");
            if (stored) return stored;
            const newId = Math.floor(Math.random() * 1_000_000).toString();
            localStorage.setItem("lonelynet_user_id", newId);
            return newId;
        }
        return "anonymous";
    });

    // Handler khi search từ Navbar
    const handleSearch = (query: string) => {
        setSearchText(query);
        if (query.trim()) {
            setSearchQuery(query);
            setShowSearchModal(true);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-100">
            {/* Navbar ở trên - truyền handleSearch thay vì setSearchText */}
            <Navbar setSearchText={handleSearch} />

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
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <ZoomControl position="bottomleft" />

                    <MarkerContainer
                        searchText={searchText}
                        setShowChat={setShowChat}
                        setRoomId={setRoomId}
                    />

                    <UserLocationNew 
                        setShowChat={setShowChat} 
                        setRoomId={setRoomId}
                        showPost={showPost} 
                        setShowPost={setShowPost} 
                    />
                </MapContainer>
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

            {/* SEARCH MODAL - Knowledge Graph */}
            <SearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                query={searchQuery}
            />
        </div>
    );
}