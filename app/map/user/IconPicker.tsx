import { useState, useEffect, useRef } from "react";

const emojiCategories = {
    lovers: ["💞", "💘", "💖", "💋", "😍", "😘", "❤️", "💍", "👩‍❤️‍👨", "💌", "🥰", "💑"],
    job: ["💼", "👨‍💼", "👩‍💼", "👷‍♂️", "👩‍🏫", "👨‍⚕️", "🧑‍🚀", "🧑‍💻", "🧑‍🔧"],
    music: ["🎵", "🎶", "🎧", "🎤", "🎹", "🎸", "🥁", "🎷", "🎺", "🪗"],
    movie: ["🎬", "🍿", "📽️", "🎞️", "🎥", "🎭", "🎦", "💃", "🕺", "🧑‍🎤"],
    sport: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🥊", "🏋️", "🚴‍♂️"],
    hotel: ["🏨", "🛏️", "🛎️", "🏩", "🧳", "🚪", "🪞", "🪟", "🧼", "🧴"],
    spa: ["💆‍♀️", "💅", "🧖‍♀️", "🧴", "🌸", "🕯️", "🛀", "🧘‍♀️", "🫧", "🍵"],
    grab: ["🚗", "🚕", "🚙", "🛵", "🚴", "🚦", "🅿️", "🛞", "⛽", "📍"],
    restaurant: ["🍔", "🍕", "🍣", "🥗", "🍜", "🍰", "☕", "🍹", "🍱", "🥂"],
};

interface IconPickerProps {
  onSelect?: (icon: string) => void;
}

export default function IconPicker({ onSelect }: IconPickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [selected, setSelected] = useState("⚙️");
    const [activeTab, setActiveTab] = useState<keyof typeof emojiCategories>("lovers");
    const pickerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex" ref={pickerRef}>
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="px-2 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-600 
                   hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg
                   font-medium flex items-center gap-2 text-white"
            >
                <span className="text-2xl">{selected}</span>
            </button>

            {showPicker && (
                <div onClick={(e) => e.stopPropagation()}
                    className="
                        absolute left-1/2 -translate-x-1/2 bottom-60
                        z-50 w-[90vw] max-w-sm 
                        bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-900/90 dark:to-gray-800/80
                        border border-gray-200/40 dark:border-white/10
                        backdrop-blur-xl rounded-xl shadow-2xl p-4 sm:p-5
                        transition-all duration-300 ease-out
                        animate-in fade-in-0 zoom-in-95
                    "
                >
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-3 justify-center">
                        {Object.keys(emojiCategories).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat as keyof typeof emojiCategories)}
                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm capitalize font-semibold transition-all duration-200
                                    ${activeTab === cat
                                        ? "bg-blue-500 text-white shadow-md scale-105"
                                        : "bg-white/30 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/20"
                                    }
                            `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Emoji grid */}
                    <div
                        className="
                            grid grid-cols-6 gap-2 sm:gap-3 justify-items-center overflow-hidden
                            max-h-[40vh] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
                            "
                    >
                        {emojiCategories[activeTab].map((icon, i) => (
                            <button
                                key={i} 
                                onClick={() => {
                                    setSelected(icon);
                                    setShowPicker(false);
                                    onSelect?.(icon);
                                }}
                                className="
                                    text-2xl sm:text-3xl hover:scale-125 active:scale-95 transition-transform duration-150
                                    focus:outline-none focus:ring-2 focus:ring-blue-400/40 rounded-md
                                    "
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

            )}
        </div>
    );
}
