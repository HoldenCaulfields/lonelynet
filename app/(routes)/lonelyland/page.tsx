"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

  // 🔥 CACHED API CALL (no re-fetch!)
  const fetchSouls = useCallback(async () => {
    const cacheKey = "lonelyland_souls";
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      setSouls(JSON.parse(cached));
      setLoading(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.get(`${API_URL}/api/lonelyland`, { timeout: 5000 });
      const data = res.data;
      setSouls(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      setError("Failed to connect to Lonelyland");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSouls();
  }, [fetchSouls]);

  // 🔥 MEMOIZED DATE FORMATTING
  const formattedSouls = useMemo(() => 
    souls.map(soul => ({
      ...soul,
      formattedDate: new Date(soul.createdAt).toLocaleDateString("en-US", { 
        year: "numeric", month: "short", day: "numeric" 
      })
    })), 
    [souls]
  );

  const handleTitleClick = useCallback(() => {
    router.push("/");
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-gray-400 font-medium">Connecting...</span>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative">
      {/* 🔥 LIGHTER Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 
            onClick={handleTitleClick}
            className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight mb-4 cursor-pointer hover:scale-105 transition-transform duration-200 select-none"
          >
            LONELYLAND
          </h1>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
        </div>

        {/* 🔥 RESPONSIVE GRID + VIRTUALIZED */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {formattedSouls.map((soul, index) => (
            <div
              key={soul._id}
              className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.005] animate-in fade-in-up duration-300"
              style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }} // 🔥 Cap delay
            >
              {/* Simplified border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              
              {/* Image */}
              {soul.imageUrl && (
                <div className="relative h-40 md:h-48 overflow-hidden">
                  <Image
                    src={soul.imageUrl}
                    alt="Soul"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    quality={70}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>
              )}

              {/* Content */}
              <div className="p-4 relative z-10 flex flex-col h-full">
                <p className="text-white text-xs md:text-sm leading-relaxed mb-3 line-clamp-3 transition-all duration-200">
                  {soul.text}
                </p>

                {/* Tags - Limited */}
                {soul.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {soul.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-700/50 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30 transition-colors duration-200 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-gray-500 text-xs font-mono tracking-wider uppercase">
                    {soul.formattedDate}
                  </p>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {formattedSouls.length === 0 && (
          <div className="text-center py-20 animate-in fade-in-0">
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