
import { Dispatch, SetStateAction, useEffect, useState, useCallback, Suspense } from "react";
import { Marker, Popup } from "react-leaflet";
import UserLocationNew from "../user/UserLocationNew";
import axios from "axios";
import { getTagIcon } from "../marker/Icon";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import Links from "../marker/Links";

interface MarkerData {
    _id: string;
    position: [number, number];
    text?: string;
    imageUrl?: string;
    tags?: string[];
    loves: number;
    links?: { type: string; url: string }[];
    icon?: string;
}

interface AllMarkersAndUserProps {
    searchText: string;
    setShowChat: Dispatch<SetStateAction<boolean>>;
    setRoomId: Dispatch<SetStateAction<string | null>>;
    userId: string; // Thêm userId từ component cha
    showPost: boolean;
    setShowPost: Dispatch<SetStateAction<boolean>>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AllMarkers({
    searchText,
    setShowChat,
    setRoomId,
    userId,
    showPost,
    setShowPost,
}: AllMarkersAndUserProps) {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [center, setCenter] = useState<MarkerData | null>(null); //center marker khi click

    // --- API Calls ---
    const fetchAllMarkers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/api/lonelyland`, { timeout: 5000 });
            setMarkers(res.data);
        } catch {
            setError("Failed to load souls");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllMarkers();
    }, [fetchAllMarkers]);

    const handleTagClick = useCallback((tag: string | null) => setSelectedTag(tag), []);

    const handleLovePress = useCallback(async (markerId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.put(`${API_URL}/api/lonelyland/${markerId}/love`);
            const updatedMarker = res.data;
            setMarkers(prev => prev.map(marker => marker._id === markerId ? updatedMarker : marker));
        } catch {
            setError("Failed to love soul");
        } finally {
            setLoading(false);
        }
    }, []);

    const formatLoveCount = (count: number): string => {
        if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return count.toString();
    };

    const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string; }) => (
        <Suspense fallback={<div className="w-full h-48 bg-gradient-to-br from-gray-900 to-black rounded-lg animate-pulse" />}>
            <Image
                src={src}
                width={256}
                height={256}
                sizes="(max-width: 768px) 100vw, 256px"
                className={`${className} w-full h-48 object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105`}
                alt={alt}
                quality={60}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR42mN8//8AAwAB/ALr5gAAAABJRU5ErkJggg=="
            />
        </Suspense>
    );

    return (
        <>
            {markers.map((marker) => {
                const tag = marker.tags?.[0]?.toLowerCase() || "lonely";
                const dynamicIcon = getTagIcon(marker.icon || tag);

                return (
                    <Marker key={marker._id} position={marker.position} icon={dynamicIcon} eventHandlers={{ click: () => setCenter(marker) }}>
                        <Popup className="custom-popup" maxWidth={320} minWidth={240}>
                            <div
                                className="
                bg-gradient-to-b from-white to-gray-50 rounded-xl overflow-hidden shadow-xl 
                group transition-transform duration-300
                w-[280px] sm:w-[320px] 
                max-h-[420px] flex flex-col"
                            >
                                {/* IMAGE */}
                                {marker.imageUrl && (
                                    <div className="relative w-full h-32 sm:h-40 flex-shrink-0 overflow-hidden">
                                        <LazyImage
                                            src={marker.imageUrl}
                                            alt="soul"
                                            className="object-cover w-full h-full"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    </div>
                                )}

                                {/* CONTENT */}
                                <div className="p-3 flex flex-col justify-between flex-1 overflow-y-auto">
                                    {/* TEXT */}
                                    {marker.text && (
                                        <p
                                            className="
                      text-sm text-gray-800 leading-relaxed mb-2
                      line-clamp-3 sm:line-clamp-4 font-medium
                      max-h-[5.5rem] sm:max-h-[6.5rem] overflow-hidden
                      text-ellipsis"
                                            title={marker.text} // hover hiển thị full text
                                        >
                                            {marker.text}
                                        </p>
                                    )}

                                    {/* TAGS */}
                                    <div className="flex overflow-x-auto gap-2 mb-3 py-1 scrollbar-hide">
                                        {marker.tags?.slice(0, 5).map((item) => (
                                            <button
                                                key={item}
                                                onClick={() => handleTagClick(item)}
                                                className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase rounded-full border transition-all duration-200 ${selectedTag === item
                                                    ? "bg-black text-white border-black shadow-md"
                                                    : "bg-gray-100 text-gray-800 border-black hover:border-black hover:bg-gray-200"
                                                    }`}
                                            >
                                                #{item}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-200 ">
                                        {/* LOVE BUTTON */}
                                        <button
                                            className="flex-1 flex hover:scale-110 hover:-rotate-6 items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                            onClick={() => handleLovePress(marker._id)}
                                        >
                                            <Heart
                                                className="w-4 h-4 hover:animate-bounce text-white transition-transform duration-150 group-hover:scale-110"
                                                fill="white"
                                            />
                                            <span className="font-semibold text-white text-sm">
                                                {formatLoveCount(marker.loves)}
                                            </span>
                                        </button>

                                        {/* CHAT BUTTON */}
                                        <button
                                            className="flex-1 hover:scale-110 hover:rotate-6 flex items-center justify-center px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                            onClick={() => {
                                                setShowChat(true);
                                                setRoomId(marker._id);
                                            }}
                                            aria-label="Open chat"
                                        >
                                            <MessageCircle className="w-4 h-4 text-white" />
                                        </button>

                                        {/*   LINKS */}
                                        <Links marker={marker} />
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            <UserLocationNew
                setShowChat={setShowChat}
                setRoomId={setRoomId}
                showPost={showPost}
                setShowPost={setShowPost}
            // Các props khác (ví dụ: userId) nếu cần
            />
        </>
    );
}