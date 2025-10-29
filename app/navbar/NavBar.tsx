"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, PlusCircle, Coffee } from "lucide-react";
import SearchBox from "./SearchBox";

interface NavbarProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

export default function Navbar({ searchText, setSearchText }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-[1100] w-full bg-gradient-to-r from-slate-900 via-black to-slate-900 border-b border-white/10 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        {/* Mobile: Logo + Icons */}
        <div className="flex items-center justify-between lg:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            onClick={() => window.location.reload()}
          >
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
            <Link
              href="/lonelyland"
              className="hover:text-blue-400 transition-colors duration-200"
            >
              <Globe size={26} />
            </Link>
            <Link
              className="hover:text-red-400 transition-colors duration-200 cursor-pointer"
              href="/support" target="_blank"
            >
              <Coffee size={26} />
            </Link>
          </div>
        </div>

        {/* Desktop: Logo */}
        <Link
          href="/"
          className="hidden lg:flex items-center gap-2 text-white font-black text-2xl tracking-tight hover:scale-105 transition-transform duration-200"
          onClick={() => window.location.reload()}
        >
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

        {/* SearchBox */}
        <SearchBox searchText={searchText} setSearchText={setSearchText} />

        {/* Desktop: Right Links */}
        <div className="hidden lg:flex items-center gap-6 text-white font-semibold text-lg">
          <Link
            href="/lonelyland"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            LonelyLand
          </Link>

          {/* Buy Me a Coffee (navbar version for desktop) */}
          <Link
            href="/support"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-400 hover:bg-blue-500 text-black font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Coffee className="w-5 h-5" />
          </Link>
        </div>
      </div>

    </nav>
  );
}
