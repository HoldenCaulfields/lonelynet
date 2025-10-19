"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Soul {
  _id: string;
  text: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
}

export default function Lonelyland() {
  const [souls, setSouls] = useState<Soul[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSouls = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/lonelyland`);
        setSouls(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchSouls();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const handleTitleClick = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-gray-400 font-medium">Connecting to Lonelyland...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-gray-300 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden relative">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 
            onClick={handleTitleClick}
            className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight mb-4 cursor-pointer hover:scale-105 transition-transform duration-300 select-none"
          >
            LONELYLAND
          </h1>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
        </div>

        {/* MOBILE: 1 COLUMN → Tablet: 2 → Small Desktop: 3 → Large Desktop: 4 */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {souls.map((soul, index) => (
            <div
              key={soul._id}
              className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] animate-[fadeInUp_0.6s_ease-out_forwards] animate-delay-[50ms]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20  to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Image Container */}
              {soul.imageUrl && (
                <div className="relative h-40 md:h-48 overflow-hidden">
                  <Image
                    src={soul.imageUrl}
                    alt="Soul image"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
              )}

              {/* Content */}
              <div className="p-4 md:p-6 relative z-10 flex flex-col h-full">
                {/* Text */}
                <p className="text-white text-xs md:text-sm leading-relaxed mb-3 md:mb-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {soul.text}
                </p>

                {/* Tags */}
                {soul.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                    {soul.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-700/50 backdrop-blur-sm text-cyan-300 text-xs px-2 md:px-3 py-1 rounded-full border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors duration-200 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date & Hover Effect */}
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-gray-500 text-xs font-mono tracking-wider uppercase">
                    {formatDate(soul.createdAt)}
                  </p>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {souls.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-4xl text-gray-500">👻</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">The void is silent</h2>
            <p className="text-gray-500">No souls have whispered yet...</p>
          </div>
        )}
      </div>
    </div>
  );
}