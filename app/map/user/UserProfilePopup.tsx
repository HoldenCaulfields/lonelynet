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

import { Phone, Globe, Camera, Loader2, Send, Plus, X } from "lucide-react";
import Tags from "./Tags";
import { useMap } from "react-leaflet";

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

export default function UserProfilePopup({ address }: { address: Address }) {
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [links, setLinks] = useState<{ type: string; url: string }[]>([]);
    const [newLinkType, setNewLinkType] = useState("facebook");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const map = useMap();
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

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

        const formData = new FormData();
        if (imageFile) formData.append("image", imageFile);
        formData.append("text", text);
        selectedCategories.forEach((tag) => formData.append("tags[]", tag));
        formData.append("links", JSON.stringify(links));
        formData.append("position", JSON.stringify([address.lat, address.lng]));

        try {
            setLoading(true);
            
            // 1. Gửi form data tới backend
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/lonelyland`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!res.ok) throw new Error("Failed to save");

            // 2. Reload page (chờ 100ms cho backend xử lý xong)
            await new Promise((resolve) => setTimeout(resolve, 100));
            window.location.reload();
            
            // 3. Fly to vị trí mới sau khi page reload xong (sẽ tự động chạy sau reload)
            // Lưu vị trí vào sessionStorage để fly to sau khi reload
            sessionStorage.setItem('flyToPosition', JSON.stringify({
                lat: address.lat,
                lng: address.lng,
                timestamp: Date.now()
            }));

        } catch (err) {
            console.error(err);
            alert("❌ Failed to save profile");
            setLoading(false);
        }
    };
    return (
        <div className="w-[300px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Image Upload Section */}
            <div className="relative group">
                {image ? (
                    <label className="block cursor-pointer relative overflow-hidden">
                        <img
                            src={image}
                            alt="upload"
                            className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 text-white font-medium">
                                <Camera size={20} />
                                <span className="text-sm">Change Image</span>
                            </div>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                ) : (
                    <label className="w-full h-44 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border-b border-gray-200">
                        {imageLoading ? (
                            <Loader2 size={32} className="animate-spin text-gray-400" />
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-3 transform transition-transform duration-300 hover:scale-110">
                                    <Camera size={28} className="text-gray-700" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Add a Photo</span>
                                <span className="text-xs text-gray-500 mt-1">Click to upload</span>
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
                <Tags selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />

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
                        className="px-1 py-2 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-black transition-all text-sm font-medium cursor-pointer hover:bg-gray-50"
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
    );
}