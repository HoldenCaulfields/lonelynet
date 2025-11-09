import { useState, useRef, useEffect } from "react";
import { Globe, Phone } from "lucide-react";
import {
    SiFacebook,
    SiInstagram,
    SiX,
    SiReddit,
    SiGithub,
    SiLinkedin,
    SiGmail, SiYoutube
} from "react-icons/si";

type Link = { type: string; url: string };

export default function Links({ marker }: { marker: { links?: Link[] } }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const links = marker.links ?? [];

    // click ngoài để đóng menu
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenLink = (url: string, type: string) => {
        if (!url) return;

        let finalUrl = url.trim();

        switch (type?.toLowerCase()) {
            case "phone":
                finalUrl = finalUrl.startsWith("tel:") ? finalUrl : `tel:${finalUrl}`;
                window.location.href = finalUrl;
                return;

            case "email":
                finalUrl = finalUrl.startsWith("mailto:") ? finalUrl : `mailto:${finalUrl}`;
                window.location.href = finalUrl;
                return;

            default:
                window.open(url, "_blank");
                return;
        }
    };

    // Map type → icon
    const getIcon = (type: string) => {
        const map: Record<string, React.ReactNode> = {
            facebook: <SiFacebook className="w-4 h-4 text-blue-600" />,
            instagram: <SiInstagram className="w-4 h-4 text-pink-500" />,
            x: <SiX className="w-4 h-4 text-sky-500" />,
            youtube: <SiYoutube className="w-4 h-4 text-red-600" />,
            linkedin: <SiLinkedin className="w-4 h-4 text-blue-700" />,
            website: <Globe className="w-4 h-4 text-gray-600" />,
            reddit: <SiReddit className="w-4 h-4 text-orange-500" />,
            phone: <Phone className="w-4 h-4 text-green-600" />,
            github: <SiGithub className="w-4 h-4 text-gray-800" />,
            email: <SiGmail className="w-4 h-4 text-rose-500" />
        };
        return map[type.toLowerCase()] ?? <Globe className="w-4 h-4" />;
    };

    return (
        <button
            ref={btnRef}
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center gap-1 flex-1 px-3 py-2 rounded-full bg-gray-800 text-white text-xs cursor-pointer hover:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 relative"
        >
            <Globe className="w-4 h-4" />

            {open && (
                <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-full shadow-lg px-3 py-2 flex gap-3 items-center justify-center animate-fade-up z-50">
                    {links.length > 0 ? (
                        links.map((link, idx) => (
                            <div key={idx} className="relative group">
                                <div
                                    key={idx}
                                    onClick={() => handleOpenLink(link.url, link.type)}
                                    className="cursor-pointer text-gray-700 hover:scale-110 transition-transform"
                                >
                                    {getIcon(link.type)}
                                </div>
                                {link.type.toLowerCase() === "phone" && (
                                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        {link.url}
                                    </span>
                                )}
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm px-2">No links</span>
                    )}
                </div>
            )}
        </button>
    );
}
