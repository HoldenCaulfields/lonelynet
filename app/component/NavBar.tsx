import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const categories = ["All", "Music", "Movies", "Books", "Tech", "Games", "News"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 shadow-xl border-b border-gray-700 px-4 py-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-7xl mx-auto">
        {/* Logo + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tight cursor-pointer justify-center sm:justify-start hover:text-gray-300 transition-colors duration-300"
            aria-label="LonelyNet Home"
          >
            <Image src="/logo.png" width={50} height={70} className="rounded-full" alt="logo" />
            LonelyNet
          </a>

          {/* Search box */}
          <div className="flex items-center w-full sm:w-72 md:w-96 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-md focus-within:ring-2 focus-within:ring-gray-400 transition-all duration-300 mx-auto sm:mx-0 border border-gray-600/50">
            <span className="mr-2 text-gray-400" aria-hidden="true">
              🔍
            </span>
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search..."
              className="flex-1 outline-none bg-transparent text-white placeholder-gray-500 focus:placeholder-gray-400 transition-colors duration-200"
              aria-label="Search content"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide md:overflow-visible md:flex-wrap md:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`whitespace-nowrap text-sm px-5 py-2 rounded-full border border-gray-600/50 bg-white/5 text-gray-200 hover:bg-gray-700 hover:text-white transition-all duration-300 shadow-md transform hover:scale-105 ${
                selectedCategory === cat ? "bg-gray-700 text-white shadow-inner" : ""
              }`}
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}