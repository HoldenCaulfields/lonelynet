"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, PlusCircle } from "lucide-react";
import SearchBox from "./SearchBox";

interface NavbarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  setOnClick: () => void;
}

export default function Navbar({ searchText, setSearchText, setOnClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-[1100] w-full bg-gradient-to-r from-slate-900 via-black to-slate-900 border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Mobile: Logo + Icons */}
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            onClick={() => window.location.reload()}>
            <Image 
              src="/logo.png" 
              width={36} 
              height={36} 
              alt="logo" 
              priority 
              className="rounded-3xl"
              quality={80}
            />
            <Image 
              src="/LonelyNet.png" 
              width={80} 
              height={38} 
              alt="LonelyNet" 
              priority 
              
              quality={80}
            />
          </Link>

          <div className="flex items-center gap-5 text-white">
            <Link href="/lonelyland" className="hover:text-blue-400 transition-colors duration-200">
              <Globe size={26} />
            </Link>
            <span className="hover:text-red-400 transition-colors duration-200 cursor-pointer" onClick={setOnClick}>
              <PlusCircle size={26} />
            </span>
          </div>
        </div>

        {/* Desktop: Logo */}
        <Link
          href="/"
          className="hidden lg:flex items-center gap-2 text-white font-black text-2xl tracking-tight hover:scale-105 transition-transform duration-200"
          onClick={() => window.location.reload()}>
          <Image 
            src="/logo.png" 
            width={50} 
            height={50} 
            alt="logo" 
            priority 
            className="rounded-3xl"
            quality={80}
          />
          <Image 
            src="/LonelyNet.png" 
            width={95} 
            height={45} 
            alt="LonelyNet" 
            priority 
            
            quality={80}
          />
        </Link>

        {/* SearchBox Component */}
        <SearchBox searchText={searchText} setSearchText={setSearchText} />

        {/* Desktop: Right Links */}
        <div className="hidden lg:flex items-center gap-6 text-white font-semibold text-lg">
          <Link href="/lonelyland" className="hover:text-blue-400 transition-colors duration-200">
            LonelyLand
          </Link>
          <span 
            className="hover:text-red-400 bg-blue-800 p-2 rounded-3xl transition-all duration-200 cursor-pointer hover:scale-105" 
            onClick={setOnClick}
          >
            Create Soul
          </span>
        </div>
      </div>
    </nav>
  );
}