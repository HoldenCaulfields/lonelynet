"use client";

import { useState } from "react";
import axios from "axios";
import { Mail, Phone, Coffee } from "lucide-react";
import { FaLinkedin, FaRedditAlien } from "react-icons/fa";
import Link from "next/link";

export default function SuggestionBoxPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setStatus("loading");
      await axios.post("/api/suggestions", { name: name || "Anonymous", message });
      setStatus("success");
      setName("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white px-6">
      {/* CARD */}
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-white/10">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">💌 LonelyNet Suggestion Box</h1>
        <p className="text-gray-300 mb-6 text-sm">
          Share your thoughts, ideas, or kind words to make LonelyNet a warmer place 🌿
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
          ></textarea>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send feedback 💭"}
          </button>
        </form>

        {/* STATUS */}
        {status === "success" && (
          <p className="text-green-400 text-center text-sm mt-3">
            Thank you for your kind message 💚
          </p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-center text-sm mt-3">
            Something went wrong — please try again 😢
          </p>
        )}

        {/* CONTACT */}
        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="text-sm text-gray-300 mb-3 font-medium">📬 Contact me</p>
          <div className="flex items-center justify-center gap-5 text-gray-300">
            <a href="tel:+84793784133" className="hover:text-blue-400 transition-colors" title="Phone">
              <Phone size={18} />
            </a>
            <a href="mailto:thucmath2000@gmail.com" className="hover:text-blue-400 transition-colors" title="Email">
              <Mail size={18} />
            </a>
            <a href="https://www.linkedin.com/in/trung-th%E1%BB%B1c-870463133" target="_blank" className="hover:text-blue-400 transition-colors" title="LinkedIn">
              <FaLinkedin size={18} />
            </a>
            <a href="https://www.reddit.com/user/Only-Recognition7783" target="_blank" className="hover:text-blue-400 transition-colors" title="Reddit">
              <FaRedditAlien size={18} />
            </a>
          </div>
        </div>

        {/* BUY ME A COFFEE */}
        <div className="mt-8">
          <p className="text-xs text-gray-400 mb-2 italic">Support my little project ☕</p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-black font-medium px-4 py-2 rounded-full shadow-md transition-transform hover:scale-105"
          >
            <Coffee size={16} /> Buy me a coffee
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <Link href={"/"} className="mt-8 text-sm text-gray-500">
        Made with 💙 by <span className="text-blue-400 font-medium">LonelyNet</span>
      </Link>
    </main>
  );
}
