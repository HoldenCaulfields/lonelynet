import { Coffee } from "lucide-react";
import Link from "next/link";

export default function BuyMeCoffee() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-black">
      {/* Left side: Logo & links */}
      <div className="flex items-center gap-6 text-white font-semibold text-lg">
        <Link href="/lonelyland" className="hover:text-blue-400 transition-colors duration-200">
          LonelyLand
        </Link>
      </div>

      {/* Desktop “Buy me a coffee” (in navbar) */}
      <div className="hidden lg:flex items-center">
        <a
          href="https://www.buymeacoffee.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-400 hover:bg-blue-500 text-black font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Coffee className="w-5 h-5" />
          <span>Buy me a coffee</span>
        </a>
      </div>

      {/* Floating button (mobile only) */}
      <a
        href="https://www.buymeacoffee.com/yourusername"
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden fixed bottom-4 right-4 bg-blue-400 hover:bg-blue-500 text-black font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
      >
        <Coffee className="w-5 h-5" />
        <span>Buy me a coffee</span>
      </a>
    </nav>
  );
}
