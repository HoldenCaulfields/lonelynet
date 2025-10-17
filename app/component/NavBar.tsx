"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const categories = ["All", "Findjob", "Lover", "Music", "Tech", "Games", "Movies"];

// 🔹 Reusable Button
function CategoryButton({
  cat,
  selected,
  onClick,
}: {
  cat: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-white/20 
                  bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 
                  transform hover:scale-105 shadow-md
                  ${selected ? "bg-gradient-to-r from-blue-500/30 to-purple-500/20 text-white border-white/50 shadow-white/30" : ""}`}
    >
      {cat}
    </button>
  );
}

export default function Navbar() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const searchRef = useRef<HTMLInputElement>(null);

  // 🔹 Persist category
  useEffect(() => {
    const saved = localStorage.getItem("selectedCategory");
    if (saved) setSelectedCategory(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("selectedCategory", selectedCategory);
  }, [selectedCategory]);

  // 🔹 ⌘K / Ctrl+K → focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900 via-black to-slate-900 shadow-lg border-b border-white/10 backdrop-blur-xl px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto">
        {/* DESKTOP */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-black text-2xl tracking-tight hover:scale-105 transition-all duration-300 group">
            <Image src="/logo.png" width={40} height={40} alt="logo" className="group-hover:rotate-6 transition-transform duration-300" />
            <Image src="/LonelyNet.png" width={95} height={45} alt="logo" className="group-hover:rotate-6 transition-transform duration-300" />
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-blue-400 text-lg animate-pulse">🔍</span>
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="What's on your mind..."
                className="w-full pl-12 pr-10 py-3 bg-white/15 backdrop-blur-xl rounded-full border-2 border-white/30 
                           text-white placeholder-gray-200 font-medium text-lg focus:outline-none 
                           focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-500 shadow-xl hover:shadow-blue-500/20"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <kbd className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full text-blue-300 font-bold border border-blue-500/30">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2">
            {categories.map((cat) => (
              <CategoryButton
                key={cat}
                cat={cat}
                selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* TABLET */}
        <div className="hidden md:flex lg:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white font-black text-xl hover:scale-105 transition-all">
              <Image src="/LonelyNet.png" width={40} height={40} alt="logo" className="rounded-full" />
            </Link>
            <div className="flex gap-1">
              {categories.slice(0, 4).map((cat) => (
                <CategoryButton
                  key={cat}
                  cat={cat}
                  selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                />
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="w-full max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-blue-400 text-lg animate-pulse">🔍</span>
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="What's on your mind..."
                className="w-full pl-10 pr-8 py-3 bg-white/15 rounded-full border-2 border-white/30 text-white placeholder-gray-300 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="flex flex-col md:hidden gap-3">
          {/* Logo */}
          <Link href="/" className="flex justify-center text-white font-black text-xl hover:scale-105 transition-all">
            <Image src="/LonelyNet.png" width={60} height={40} alt="logo" className="rounded-full" />
          </Link>

          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-blue-400 text-lg animate-pulse">🔍</span>
            </div>
            <input
              ref={searchRef}
              type="text"
              placeholder="What's on your mind..."
              className="w-full pl-10 pr-8 py-3 bg-white/15 rounded-full border-2 border-white/30 text-white placeholder-gray-300 font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/20"
            />
          </div>

          {/* Scrollable Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {categories.map((cat) => (
              <CategoryButton
                key={cat}
                cat={cat}
                selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
