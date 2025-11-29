import { useState } from "react";
import {
    SiFacebook,
    SiInstagram,
    SiX,
    SiReddit,
    SiGithub,
    SiLinkedin,
    SiGmail,
    SiYoutube
} from "react-icons/si";

import { Phone, Globe, Camera, Loader2, Send, X, Sparkles } from "lucide-react";
import Tags from "./Tags";
import axios from 'axios';

const linkOptions = [
    { id: "facebook", label: "Facebook", icon: <SiFacebook className="w-4 h-4 text-blue-600" /> },
    { id: "instagram", label: "Instagram", icon: <SiInstagram className="w-4 h-4 text-pink-500" /> },
    { id: "x", label: "X (Twitter)", icon: <SiX className="w-4 h-4 text-black" /> },
    { id: "reddit", label: "Reddit", icon: <SiReddit className="w-4 h-4 text-orange-500" /> },
    { id: "github", label: "GitHub", icon: <SiGithub className="w-4 h-4 text-gray-800" /> },
    { id: "linkedin", label: "LinkedIn", icon: <SiLinkedin className="w-4 h-4 text-blue-700" /> },
    { id: "email", label: "Email", icon: <SiGmail className="w-4 h-4 text-red-500" /> },
    { id: "phone", label: "Phone", icon: <Phone className="w-4 h-4 text-green-600" /> },
    { id: "website", label: "Website", icon: <Globe className="w-4 h-4 text-gray-600" /> },
    { id: "youtube", label: "YouTube", icon: <SiYoutube className="w-4 h-4 text-red-600" /> },
];

interface Address {
    lat: number;
    lng: number;
}

interface CreateSoulModalProps {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    address: Address;
}

export default function CreateSoulModal({
    showModal,
    setShowModal,
    address
}: CreateSoulModalProps) {
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [links, setLinks] = useState<{ type: string; url: string }[]>([]);
    const [newLinkType, setNewLinkType] = useState("facebook");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<string>("");

    if (!showModal) return null;

    const handleClose = () => {
        setShowModal(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
            setImageFile(file);
            setImageLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleAddLink = () => {
        let url = newLinkUrl.trim();
        if (!url) return;

        const isValidUrl = /^https?:\/\/[\w.-]+\.[a-z]{2,}([\/\w .-]*)*\/?$/i.test(url);
        const allowedTypes = ["phone", "email", "instagram"];

        if (!isValidUrl && !allowedTypes.includes(newLinkType.toLowerCase())) {
            alert("The link you entered is invalid — will be redirected to LonelyNet 🏝️");
            const encoded = encodeURIComponent(url);
            url = `/url/${encoded}`;
        }

        setLinks([...links, { type: newLinkType, url }]);
        setNewLinkUrl("");
    };

    const getIcon = (type: string) => {
        const found = linkOptions.find((i) => i.id === type);
        return found ? found.icon : <Globe className="w-4 h-4" />;
    };

    const handleRemoveLink = (index: number) => {
        setLinks((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!text.trim()) {
            alert("⚠️ Please share your story!");
            return;
        }

        const formData = new FormData();
        if (imageFile) formData.append("image", imageFile);
        formData.append("text", text);
        selectedCategories.forEach((tag) => formData.append("tags[]", tag));
        formData.append("links", JSON.stringify(links));
        formData.append("position", JSON.stringify([address.lat, address.lng]));
        formData.append("icon", selectedIcon);

        try {
            setLoading(true);

            // Debug: Log data trước khi gửi
            console.log("Submitting data:", {
                hasImage: !!imageFile,
                imageSize: imageFile?.size,
                text: text.substring(0, 50),
                tags: selectedCategories,
                linksCount: links.length,
                position: [address.lat, address.lng],
                icon: selectedIcon
            });

            // 1. Lưu vị trí vào sessionStorage TRƯỚC KHI gửi request
            sessionStorage.setItem('flyToPosition', JSON.stringify({
                lat: address.lat,
                lng: address.lng,
                timestamp: Date.now()
            }));

            // 2. Gửi form data tới backend
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/lonelyland`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (res.status !== 200 && res.status !== 201) {
                throw new Error("Failed to save");
            }

            // 3. Đợi backend xử lý xong (tăng lên 300ms để chắc chắn)
            await new Promise((resolve) => setTimeout(resolve, 300));

            // 4. Reload page
            window.location.reload();

        } catch (err: any) {
            console.error("Submit error:", err);
            
            // Log chi tiết lỗi từ backend
            if (err.response) {
                console.error("Backend error status:", err.response.status);
                console.error("Backend error data:", err.response.data);
                alert(`❌ Server error: ${err.response.data?.message || err.response.data || 'Unknown error'}`);
            } else if (err.request) {
                console.error("No response from server:", err.request);
                alert("❌ No response from server. Please check your connection!");
            } else {
                console.error("Error:", err.message);
                alert(`❌ Error: ${err.message}`);
            }
            
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center 
                 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={handleClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-md 
                   animate-slideUp relative"
            >
                {/* Nút đóng */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 z-100 bg-red-500 rounded-2xl font-bold text-white 
                     hover:rotate-90 hover:scale-110 transition-all duration-200 p-1"
                >
                    <X size={24} />
                </button>

                <div className=" bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Image Upload Section */}
                    <div className="relative">
                        {image ? (
                            <label className="block cursor-pointer relative overflow-hidden group">
                                <div className="relative h-56">
                                    <img
                                        src={image}
                                        alt="upload"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105 flex flex-col items-center gap-2 text-white">
                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                            <Camera size={26} strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm font-medium tracking-wide">Change Photo</span>
                                    </div>
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        ) : (
                            <label className="w-full h-56 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 cursor-pointer hover:from-white hover:via-gray-50 hover:to-white transition-all duration-700 relative overflow-hidden group border-b border-gray-100">
                                {/* Animated dots */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-black/10 rounded-full animate-ping" />
                                    <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-black/10 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
                                    <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-black/10 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
                                </div>

                                {imageLoading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 size={40} className="animate-spin text-black" strokeWidth={1.5} />
                                        <span className="text-sm text-gray-400 tracking-wide">Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative mb-4">
                                            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                                                <Camera size={34} className="text-white" strokeWidth={1.5} />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Sparkles size={14} className="text-black" />
                                            </div>
                                        </div>
                                        <span className="text-base font-bold text-black mb-1 tracking-wide">Add Your Photo</span>
                                        <span className="text-sm text-gray-400">Click anywhere to upload</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-4">
                        {/* Textarea */}
                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Share your story... maybe someone will find you ✨"
                                className="w-full text-[16px] md:text-sm p-3 rounded-2xl border-2 border-gray-200 focus:border-black focus:ring-4 focus:ring-gray-100 outline-none transition-all duration-200 resize-none bg-gray-50 focus:bg-white"
                                rows={3}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                {text.length}/500
                            </div>
                        </div>

                        {/* Tags */}
                        <Tags selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                            onSelect={(icon) => setSelectedIcon(icon)} />

                        {/* Links Display */}
                        {links.length > 0 && (
                            <div className="flex gap-2 flex-wrap p-1 bg-gray-50 rounded-2xl border border-gray-200">
                                {links.map((link, idx) => {
                                    let href = link.url;

                                    switch (link.type.toLowerCase()) {
                                        case "phone":
                                            href = link.url.startsWith("tel:") ? link.url : `tel:${link.url}`;
                                            break;
                                        case "email":
                                            href = link.url.startsWith("mailto:") ? link.url : `mailto:${link.url}`;
                                            break;
                                        case "instagram":
                                            href = link.url.includes("instagram.com")
                                                ? link.url
                                                : `https://instagram.com/${link.url.replace("@", "")}`;
                                            break;
                                        default:
                                            if (!/^https?:\/\//i.test(link.url) && !link.url.startsWith("/url/")) {
                                                href = `/url/${encodeURIComponent(link.url)}`;
                                            }
                                            break;
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className="relative flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm hover:shadow-md transition-all group border border-gray-200 animate-in zoom-in duration-200"
                                        >
                                            <a
                                                href={href}
                                                target={link.type === "phone" || link.type === "email" ? "_self" : "_blank"}
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center w-full h-full"
                                            >
                                                {getIcon(link.type)}
                                            </a>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRemoveLink(idx);
                                                }}
                                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
                                                title="Remove"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Add Link Section */}
                        <div className="flex items-center gap-2 w-full bg-white/60 border border-neutral-300 rounded-xl p-1 shadow-sm overflow-visible">
                            {/* Select */}
                            <select
                                value={newLinkType}
                                onChange={(e) => setNewLinkType(e.target.value)}
                                className="px-1 py-3 md:py-2 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-black transition-all text-sm font-medium cursor-pointer hover:bg-gray-50"
                            >
                                {linkOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            {/* Input */}
                            <input
                                type="text"
                                value={newLinkUrl} onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddLink();
                                    }
                                }}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                placeholder="Enter URL or contact..."
                                className="flex-1 min-w-0 text-[16px] md:text-xs py-1 bg-transparent text-neutral-800 placeholder:text-neutral-400 outline-none"
                            />

                            {/* Add button */}
                            <button
                                onClick={handleAddLink}
                                className="flex-shrink-0 text-xs px-3 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-all"
                            >
                                Add
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="w-full mt-2 py-3.5 rounded-2xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Casting Soul...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Send size={20} />
                                    <span>Create Soul</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
