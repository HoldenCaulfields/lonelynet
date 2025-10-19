"use client";

import Image from "next/image";
import Link from "next/link";
import Router from "next/router";
import { Globe, PlusCircle } from "lucide-react";
import SearchBox from "./SearchBox"; // import component

interface NavbarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  setOnClick: () => void;
};

export default function Navbar({searchText, setSearchText, setOnClick}: NavbarProps) {

  return (
    <nav className="sticky top-0 z-1000 w-full bg-gradient-to-r from-slate-900 via-black to-slate-900 border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Mobile: Logo + Icons */}
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2" onClick={() => Router.push("/")}>
            <Image src="/logo.png" width={36} height={36} alt="logo" />
            <Image src="/LonelyNet.png" width={80} height={38} alt="LonelyNet" />
          </Link>

          <div className="flex items-center gap-5 text-white">
            <Link href="/lonelyland" className="hover:text-blue-400 transition-colors">
              <Globe size={26} />
            </Link>
            <span  className="hover:text-red-400 transition-colors cursor-pointer" onClick={setOnClick}>
              <PlusCircle size={26} />
            </span>
          </div>
        </div>

        {/* Desktop: Logo */}
        <Link
          href="/" onClick={() => Router.push("/")}
          className="hidden lg:flex items-center gap-2 text-white font-black text-2xl tracking-tight hover:scale-105 transition-all duration-300"
        >
          <Image src="/logo.png" width={40} height={40} alt="logo" />
          <Image src="/LonelyNet.png" width={95} height={45} alt="LonelyNet" />
        </Link>

        {/* SearchBox Component */}
        <SearchBox searchText={searchText} setSearchText={setSearchText} />

        {/* Desktop: Right Links */}
        <div className="hidden lg:flex items-center gap-6 text-white font-semibold text-lg">
          <Link href="/lonelyland" className="hover:text-blue-400 transition-colors">
            LonelyLand
          </Link>
          <span className="hover:text-red-400 bg-blue-800 p-2 rounded-3xl transition-colors cursor-pointer" onClick={setOnClick}>
            Create Soul
          </span>
        </div>
      </div>
    </nav>
  );
}
