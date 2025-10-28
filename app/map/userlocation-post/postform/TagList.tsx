

import { Briefcase, Heart, Film, Book, Music, Dumbbell, Gamepad2, Ghost } from "lucide-react";

export const TagList = [
    { name: "lonely", icon: <span>😔</span>, color: "bg-purple-400" },
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