"use client";

import Image from "next/image";
import Link from "next/link";
import { Coffee } from "lucide-react";

export default function BuyMeACoffeePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white px-6">
      {/* Card Container */}
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-white/10">
        <div className="flex justify-center mb-4">
          <Coffee className="w-12 h-12 text-yellow-400" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Buy Me a Coffee ☕</h1>
        <p className="text-gray-300 mb-6">
          If you enjoy <span className="text-blue-400 font-semibold">LonelyNet</span>  
          and want to support my work, you can scan the QR code below to send me a coffee through PayPal.
        </p>

        {/* QR CODE */}
        <div className="bg-white p-3 rounded-xl inline-block shadow-md hover:scale-105 transition-transform duration-300">
          <Image
            src="/vcb.jpg" // put your PayPal QR image in /public
            alt="PayPal QR Code"
            width={220}
            height={220}
            className="rounded-lg"
          />
        </div>

        <p className="mt-6 text-gray-400 italic">
          Every coffee means a lot. Thank you for keeping this small dream alive 💙
        </p>

        {/* Back Button */}
        <Link
          href="/"
          className="inline-block mt-8 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Back to Home
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-500">
        Made with ❤️ by <span className="text-blue-400 font-medium">you</span>
      </p>
    </main>
  );
}
