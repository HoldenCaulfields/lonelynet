
import type { ReactElement } from 'react';
import { Briefcase, Heart, Film, Book, Music, Dumbbell, Gamepad2, Ghost } from "lucide-react";

export const TagList = [
    { name: "lonely", icon: <span>😔</span>, color: "bg-purple-400" },
    { name: "findjob", icon: <span>💼</span>, color: "bg-green-400" },
    { name: "lover", icon: <span>❤️</span>, color: "bg-pink-400" },
    { name: "music", icon: <span>🎵</span>, color: "bg-red-400" },
    { name: "books", icon: <span>📚</span>, color: "bg-yellow-400" },
];

export const tagIcons: Record<string, ReactElement> = {
  findjob: <Briefcase size={14} className="text-blue-500"/>,
  lover: <Heart size={14} className="text-red-500" />,
  movies: <Film size={14} className="text-green-500"/>,
  books: <Book size={14} className="text-yellow-500"/>,
  music: <Music size={14} className="text-pink-500"/>,
  sport: <Dumbbell size={14} className="text-blue-500"/>,
  game: <Gamepad2 size={14} className="text-indigo-500"/>,
  lonely: <Ghost size={14} className="text-gray-400" />,
};