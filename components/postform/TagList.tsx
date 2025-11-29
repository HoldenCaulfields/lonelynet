import { Tooltip } from "react-leaflet";
import React from "react";
import { Briefcase, Heart, Film, Book, Music, Dumbbell, Gamepad2, Ghost} from "lucide-react";

export const TagList = [
    { name: "lonely", icon: <span>🌌</span>, color: "bg-purple-400" },
    { name: "findjob", icon: <span>💼</span>, color: "bg-green-400" },
    { name: "lover", icon: <span>❤️</span>, color: "bg-pink-400" },
    { name: "music", icon: <span>🎵</span>, color: "bg-red-400" },
    { name: "books", icon: <span>📚</span>, color: "bg-yellow-400" },
];

export const tagIcons: Record<string, React.ElementType> = {
  findjob: Briefcase,
  lover: Heart,
  movies: Film,
  books: Book,
  music: Music,
  sport: Dumbbell,
  game: Gamepad2,
  lonely: Ghost,
};

const TagTooltip = ({ tag }: { tag: string | null }) => {
  // IMAGE MAP ====================================================
  const imageMap: Record<string, string> = {
    lonely: "/icons/logo.png",
    findjob: "/icons/findjob.png",
    lover: "/icons/lover.png",
    music: "/icons/music.png",
    books: "/icons/books.png",
    movie: "/icons/movie.png",
    game: "/icons/game.png",
    sport: "/icons/sport.png",
  };

  // COLOR MAP ===================================================
  const bgColorMap: Record<string, string> = {
    lonely: "bg-purple-100",
    findjob: "bg-green-100",
    lover: "bg-pink-100",
    music: "bg-red-100",
    books: "bg-yellow-100",
    movie: "bg-indigo-100",
    game: "bg-orange-100",
    sport: "bg-sky-100",
  };

  // SHADOW / GLOW ===============================================
  const glowMap: Record<string, string> = {
    lonely: "shadow-purple-300/40",
    findjob: "shadow-green-300/40",
    lover: "shadow-pink-300/40",
    music: "shadow-red-300/40",
    books: "shadow-yellow-300/40",
    movie: "shadow-indigo-300/40",
    game: "shadow-orange-300/40",
    sport: "shadow-sky-300/40",
  };

  // FINAL PROPS =================================================
  const safeTag = tag && imageMap[tag] ? tag : "lonely";
  const imgSrc = imageMap[safeTag];
  const bgColor = bgColorMap[safeTag];
  const glow = glowMap[safeTag];

  // RENDER ======================================================
  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColor} border border-black/50 shadow-lg ${glow}  transition-transform hover:scale-150 duration-200`}
    >
      <img
        src={imgSrc}
        alt={safeTag}
        className="w-8 h-8 object-contain"
      />
    </div>
  );
};


export const CustomTooltip = ({ marker }: { marker: any }) => {
  const tag = marker.tags?.[0]?.toLowerCase() || "lonely";

  return (
    <Tooltip
      direction="top"
      offset={[2, -45]}
      permanent
      opacity={0.95}
      className="!bg-transparent !border-none !p-0 !shadow-none !backdrop-blur-none"
    >
      <TagTooltip tag={tag} />
    </Tooltip>
  );
};
