import { useState } from "react";
import {
    SiFacebook,
    SiInstagram,
    SiX,
    SiReddit,
    SiGithub,
    SiLinkedin,
    SiGmail, SiYoutube
} from "react-icons/si";

import { Phone, Globe, Camera } from "lucide-react";
import Tags from "./Tags";
import axios from "axios";

const linkOptions = [
    { id: "facebook", label: "Facebook", icon: <SiFacebook className="w-4 h-4 text-blue-600" /> },
    { id: "instagram", label: "Instagram", icon: <SiInstagram className="w-4 h-4 text-pink-500" /> },
    { id: "x", label: "X (Twitter)", icon: <SiX className="w-4 h-4 text-sky-500" /> },
    { id: "reddit", label: "Reddit", icon: <SiReddit className="w-4 h-4 text-orange-500" /> },
    { id: "github", label: "GitHub", icon: <SiGithub className="w-4 h-4 text-gray-800" /> },
    { id: "linkedin", label: "LinkedIn", icon: <SiLinkedin className="w-4 h-4 text-blue-700" /> },
    { id: "email", label: "Email", icon: <SiGmail className="w-4 h-4 text-rose-500" /> },
    { id: "phone", label: "Phone", icon: <Phone className="w-4 h-4 text-green-600" /> },
    { id: "website", label: "Website", icon: <Globe className="w-4 h-4 text-gray-600" /> },
    { id: "youtube", label: "youtube", icon: <SiYoutube className="w-4 h-4 text-red-600" /> },
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(URL.createObjectURL(file));
        setImageFile(file);
    };

    const handleAddLink = () => {
        let url = newLinkUrl.trim();
        if (!url) return;

        // Regex kiểm tra URL hợp lệ cơ bản
        const isValidUrl = /^https?:\/\/[\w.-]+\.[a-z]{2,}([\/\w .-]*)*\/?$/i.test(url);

        // Loại link "đặc biệt" (chấp nhận không cần http)
        const allowedTypes = ["phone", "email", "instagram"];

        // Nếu link không hợp lệ và không thuộc loại đặc biệt
        if (!isValidUrl && !allowedTypes.includes(newLinkType.toLowerCase())) {
            alert("The link you entered is invalid — will be redirected to LonelyNet 🏝️");
            const encoded = encodeURIComponent(url);
            url = `/url/${encoded}`; // Route riêng trong app của bạn
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


    return (
        <div className="w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* 🖼 Image Upload */}
            <div className="relative">
                {image ? (
                    <label className="block cursor-pointer">
                        <img src={image} alt="lonelynet-upload" className="w-full h-36 object-cover rounded-md" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                ) : (
                    <label className="w-full h-36 flex items-center justify-center text-neutral-500 bg-gray-200 cursor-pointer hover:bg-gray-300 hover:text-black rounded-md border border-neutral-300">
                        <Camera size={28} />
                        <span className={`text-xs font-semibold px-1 transition-colors duration-200  "text-green-300" : "text-gray-400"}`}>
                            Add Image
                        </span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                )}
            </div>

            {/* ✍️ Text + Tags */}
            <div className="p-3 space-y-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write something... maybe one day, someone will find you..."
                    className="w-full text-sm p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                    rows={3}
                />

                {/* 🏷  tags */}
                <Tags selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />

                {/* 🔗 Links Section */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {links.map((link, idx) => {
                        // 🔹 Tùy chỉnh URL theo loại
                        let href = link.url;

                        switch (link.type.toLowerCase()) {
                            case "phone":
                                href = link.url.startsWith("tel:") ? link.url : `tel:${link.url}`;
                                break;
                            case "email":
                                href = link.url.startsWith("mailto:") ? link.url : `mailto:${link.url}`;
                                break;
                            case "instagram":
                                // Nếu người dùng chỉ nhập username, tự thêm prefix
                                href = link.url.includes("instagram.com")
                                    ? link.url
                                    : `https://instagram.com/${link.url.replace("@", "")}`;
                                break;
                            default:
                                // Nếu không phải link hợp lệ -> route custom
                                if (!/^https?:\/\//i.test(link.url) && !link.url.startsWith("/url/")) {
                                    href = `/url/${encodeURIComponent(link.url)}`;
                                }
                                break;
                        }

                        return (
                            <div
                                key={idx}
                                className="relative flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200 flex-shrink-0 group"
                            >
                                <a
                                    href={href}
                                    target={link.type === "phone" || link.type === "email" ? "_self" : "_blank"}
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full h-full"
                                >
                                    {getIcon(link.type)}
                                </a>

                                {/* Nút xóa */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveLink(idx);
                                    }}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                    title="remove it"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}

                </div>

                {/* 🧩 Add link with select */}
                <div className="flex items-center gap-2 w-full bg-white/60 border border-neutral-300 rounded-xl p-1 shadow-sm overflow-visible">
                    {/* Select */}
                    <select
                        value={newLinkType}
                        onChange={(e) => setNewLinkType(e.target.value)}
                        className="text-xs py-1 bg-transparent outline-none border-none text-neutral-800 flex-shrink-0"
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
                        className="flex-1 min-w-0 text-xs px-2 py-1 bg-transparent text-neutral-800 placeholder:text-neutral-400 outline-none"
                    />

                    {/* Add button */}
                    <button
                        onClick={handleAddLink}
                        className="flex-shrink-0 text-xs px-3 py-1.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-all"
                    >
                        Add
                    </button>
                </div>

                {/* 💾 Save button */}
                <button
                    onClick={async () => {
                        const formData = new FormData();
                        if (imageFile) formData.append("image", imageFile);
                        formData.append("text", text);
                        /* formData.append("tags", JSON.stringify(selectedCategories)); */
                        selectedCategories.forEach((tag) => formData.append("tags[]", tag));
                        formData.append("links", JSON.stringify(links));
                        formData.append("position", JSON.stringify([address.lat, address.lng])); // nếu có

                        try {
                            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/lonelyland`, formData, {
                                headers: { "Content-Type": "multipart/form-data" },
                            });
                            alert("✅ Profile saved successfully!");
                        } catch (err) {
                            console.error(err);
                            alert("❌ Failed to save profile");
                        }
                    }}
                    className="w-full mt-3 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-all"
                >
                    Create Soul
                </button>

            </div>
        </div>
    );
}
