"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import {
  Heart, Search, Filter, X, Activity, Monitor, Terminal, Ghost
} from "lucide-react";
import Image from "next/image";
import { socket, connectSocket } from "@/utils/socket";
import { Soul, ChatMessage } from "@/types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function App() {
  const [souls, setSouls] = useState<Soul[]>([]);
  const [filteredSouls, setFilteredSouls] = useState<Soul[]>([]); // ← MỚI: danh sách đang hiển thị
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "feed">("grid");
  const [selectedSoul, setSelectedSoul] = useState<Soul | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [reactions, setReactions] = useState<any[]>([]);

  const currentUserId = useRef(`user_${Math.random().toString(36).substr(2, 9)}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Socket
  useEffect(() => {
    connectSocket();
    socket.on("connect", () => socket.emit("userOnline", currentUserId.current));
    socket.on("newMessage", (data: { roomId: string; message: ChatMessage }) => {
      if (selectedSoul?._id === data.roomId) {
        setChatMessages(prev => [...prev, data.message]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    });
    return () => { socket.off(); };
  }, [selectedSoul]);

  // Fetch tất cả souls (chỉ 1 lần)
  useEffect(() => {
    const controller = new AbortController();
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/lonelyland?limit=100`, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSouls(data);
        setFilteredSouls(data);
      } catch {
        const mock = generateMockSouls();
        setSouls(mock);
        setFilteredSouls(mock);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    return () => controller.abort();
  }, []);

  // SEARCH + FILTER REAL-TIME (đây là phần quan trọng bạn cần!)
  useEffect(() => {
    let result = souls;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.text.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedTag) {
      result = result.filter(s => s.tags.includes(selectedTag));
    }

    setFilteredSouls(result);
  }, [searchQuery, selectedTag, souls]);

  // Handlers
  const handleLove = useCallback((e: React.MouseEvent, soulId: string) => {
    e.stopPropagation();
    setSouls(prev => prev.map(s => s._id === soulId ? { ...s, loves: (s.loves || 0) + 1 } : s));
    setFilteredSouls(prev => prev.map(s => s._id === soulId ? { ...s, loves: (s.loves || 0) + 1 } : s));
    if (selectedSoul?._id === soulId) {
      setSelectedSoul(prev => prev ? { ...prev, loves: (prev.loves || 0) + 1 } : null);
    }
    triggerFloatingReaction("❤️");
    socket.emit("send_reaction", { roomId: soulId, reaction: "❤️" });
  }, [selectedSoul]);

  const triggerFloatingReaction = (emoji: string) => {
    const r = { id: Date.now(), emoji, x: Math.random() * 70 + 15 };
    setReactions(prev => [...prev, r]);
    setTimeout(() => setReactions(prev => prev.filter(x => x.id !== r.id)), 2000);
  };

  const openSoul = useCallback((soul: Soul) => {
    setSelectedSoul(soul);
    socket.emit("joinRoom", soul._id);
    setChatMessages([
      { id: "sys", userId: "SYSTEM", text: `Locked onto signal ${soul._id.slice(-8)}`, timestamp: Date.now(), isSystem: true }
    ]);
  }, []);

  const closeSoul = useCallback(() => {
    if (selectedSoul) socket.emit("leaveRoom", selectedSoul._id);
    setSelectedSoul(null);
  }, [selectedSoul]);

  const sendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedSoul) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUserId.current,
      text: messageInput,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, msg]);
    socket.emit("newMessage", { roomId: selectedSoul._id, message: msg });
    setMessageInput("");
  }, [messageInput, selectedSoul]);

  // Tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    souls.forEach(s => s.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [souls]);

  if (loading) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center text-cyan-500 font-mono animate-pulse">
        SCANNING THE VOID...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-950 text-zinc-300 relative overflow-hidden">
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
        backgroundSize: "50px 50px"
      }} />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-zinc-800 bg-void-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Image
                src="/logo.png"
                width={36}
                height={36}
                alt="logo"
                priority
                className="rounded-3xl"
              />
            </div>
            <h1 className="text-xl font-bold text-white">LONELYLAND</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView("grid")} className={`p-2 rounded ${view === "grid" ? "bg-cyan-900/50 text-cyan-400" : "text-zinc-500"}`}>
              <Activity className="w-5 h-5" />
            </button>
            <button onClick={() => setView("feed")} className={`p-2 rounded ${view === "feed" ? "bg-cyan-900/50 text-cyan-400" : "text-zinc-500"}`}>
              <Monitor className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search + Filter */}
      <div className="fixed top-16 inset-x-0 z-40 bg-void-950/90 backdrop-blur-xl pt-6 pb-10 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search signals, tags, souls..."
              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-cyan-500/60 backdrop-blur"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-3 p-1.5"
            >
              <Filter className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Tags */}
          {(showFilters || selectedTag) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {allTags.slice(0, 15).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  className={`px-4 py-1.5 text-xs rounded-full transition-all ${selectedTag === tag
                      ? "bg-cyan-900/80 text-cyan-400 border border-cyan-700 shadow-lg shadow-cyan-900/20"
                      : "bg-zinc-900/60 border border-zinc-800 hover:border-cyan-900/60"
                    }`}
                >
                  #{tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => { setSelectedTag(""); setSearchQuery(""); }}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-56 pb-24 px-4 max-w-7xl mx-auto">
        {filteredSouls.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <Ghost className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-mono text-sm">NO SIGNALS MATCH YOUR QUERY</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSouls.map(soul => (
              <SoulCard key={soul._id} soul={soul} onOpen={openSoul} onLove={handleLove} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-5">
            {filteredSouls.map(soul => (
              <div
                key={soul._id}
                onClick={() => openSoul(soul)}
                className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:bg-zinc-900/60 transition"
              >
                <div className="flex gap-5">
                  <div className="text-4xl">{soul.icon || "Ghost"}</div>
                  <div className="flex-1">
                    <p className="text-zinc-200 mb-3">{soul.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {soul.tags.map(t => (
                        <span key={t} className="text-xs text-cyan-400">#{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Heart className={`w-5 h-5 ${soul.loves ? "fill-cyan-500 text-cyan-500" : "text-zinc-600"}`} />
                    <span className="text-xs block">{soul.loves || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedSoul && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur" onClick={closeSoul}>
          <div className="bg-void-950 border border-zinc-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              {selectedSoul.imageUrl && (
                <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
                  <Image src={selectedSoul.imageUrl} alt="" fill className="object-cover" />
                </div>
              )}
              <h2 className="text-2xl font-light mb-6 leading-relaxed">{selectedSoul.text}</h2>
              <div className="flex flex-wrap gap-3 mb-8">
                {selectedSoul.tags.map(t => (
                  <span key={t} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs">{'#'+t}</span>
                ))}
              </div>
              <button
                onClick={e => handleLove(e, selectedSoul._id)}
                className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-cyan-600 transition"
              >
                <Heart className={`w-8 h-8 ${selectedSoul.loves ? "fill-cyan-500 text-cyan-500" : "text-zinc-500"}`} />
                <span className="text-lg">{selectedSoul.loves} Loves</span>
              </button>
            </div>

            {/* Chat */}
            <div className="w-full md:w-96 border-t md:border-l border-zinc-800 flex flex-col bg-black">
              <div className="h-12 border-b border-zinc-800 flex items-center px-5 justify-between">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> COMMS_LINK
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm font-mono">
                {chatMessages.map((m, i) => m.isSystem ? (
                  <div key={i} className="text-center text-xs text-zinc-600">&lt;&lt; {m.text} &gt;&gt;</div>
                ) : (
                  <div key={i} className={m.userId === currentUserId.current ? "text-right" : ""}>
                    <div className={`inline-block max-w-[85%] p-3 rounded-lg ${m.userId === currentUserId.current ? "bg-zinc-800" : "bg-cyan-900/40 text-cyan-300"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800">
                <input
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder="Transmit message..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
                />
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hearts */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {reactions.map(r => (
          <div
            key={r.id}
            className="absolute text-6xl animate-float-up"
            style={{ left: `${r.x}%`, bottom: "10%" }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float-up {
          to { transform: translateY(-100vh) rotate(20deg); opacity: 0; }
        }
        .animate-float-up { animation: float-up 2s forwards; }
      `}</style>
    </div>
  );
}

// Card component (memo + lazy image)
const SoulCard = memo(({ soul, onOpen, onLove }: { soul: Soul; onOpen: (s: Soul) => void; onLove: any }) => {
  const stopProp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLove(e, soul._id);
  };

  return (
    <div
      onClick={() => onOpen(soul)}
      className="group relative bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-900/20"
    >
      {soul.imageUrl && (
        <div className="aspect-[4/3] relative overflow-hidden bg-black">
          <Image
            src={soul.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-110 transition duration-700"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/OhpfQAJJAPeFww4OQAAAABJRU5ErkJggg=="
          />
        </div>
      )}
      <div className="p-6">
        <div className="text-4xl mb-4">{soul.icon || "Ghost"}</div>
        <p className="text-sm text-zinc-400 line-clamp-3 mb-4">{soul.text}</p>
        <div className="flex justify-between items-center text-xs text-zinc-500">
          <span>{timeAgo(soul.createdAt)}</span>
          <button onClick={stopProp} className="flex items-center gap-1 hover:text-cyan-400 transition">
            <Heart className={`w-4 h-4 ${soul.loves ? "fill-cyan-500 text-cyan-500" : ""}`} />
            {soul.loves || 0}
          </button>
        </div>
      </div>
    </div>
  );
});
SoulCard.displayName = "SoulCard";

// Mock data
function generateMockSouls(): Soul[] {
  const texts = [
    "The silence here is louder than any scream.",
    "Anyone else feel like a ghost in their own life?",
    "I built walls of code just to feel safe.",
    "Looking for a soul that speaks in static.",
    "The city is asleep. I never learned how.",
  ];
  return Array.from({ length: 20 }, (_, i) => ({
    _id: `soul-${Date.now()}-${i}`,
    text: texts[i % texts.length],
    tags: ["void", "cyber", "alone", "signal", "glitch", "echo", "neon"].filter((_, j) => Math.random() > 0.5 || j < 2),
    loves: Math.floor(Math.random() * 120),
    createdAt: new Date(Date.now() - Math.random() * 8.64e7 * 10).toISOString(),
    icon: ["Ghost", "Robot", "Eye", "Heart", "Skull"][i % 5],
    imageUrl: i % 3 === 0 ? `https://picsum.photos/seed/lonely${i}/800/600` : undefined,
  }));
}

function timeAgo(date: string) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  return mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
}