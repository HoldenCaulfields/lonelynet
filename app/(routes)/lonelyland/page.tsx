"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Heart, MessageCircle, Send, Users, MapPin, Ghost, Search, Filter, X, Share2, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Soul {
  _id: string;
  text: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  position?: { lat: number; lng: number };
  loves?: number;
  links?: Array<string | { type?: string; url: string; _id?: string }>;
  icon?: string;
}

interface OnlineUser {
  userId: string;
  status: string;
  mood?: string;
  musicUrl?: string;
  lat: number;
  lng: number;
}

let socket: any = null;

export default function LonelylandPage() {
  const router = useRouter();
  const [souls, setSouls] = useState<Soul[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'feed'>('grid');
  const [selectedSoul, setSelectedSoul] = useState<Soul | null>(null);
  const [comment, setComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const chatRef = useRef<HTMLDivElement>(null);
  const currentUserId = useRef(`user_${Math.random().toString(36).substr(2, 9)}`);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Initialize Socket.IO
  useEffect(() => {
    // Dynamic import for socket.io-client
    import('socket.io-client').then((io) => {
      socket = io.default(API_URL);

      socket.on("connect", () => {
        console.log("🟢 Connected to Socket.IO");
        socket.emit("userOnline", currentUserId.current);
      });

      socket.on("onlineUsers", (users: Record<string, OnlineUser>) => {
        setOnlineUsers(users);
      });

      socket.on("receive_reaction", ({ from, reaction }: { from: string; reaction: string }) => {
        setReactions(prev => ({ ...prev, [from]: reaction }));
        setTimeout(() => {
          setReactions(prev => {
            const newReactions = { ...prev };
            delete newReactions[from];
            return newReactions;
          });
        }, 3000);
      });
    });

    return () => {
      socket?.disconnect();
    };
  }, [API_URL]);

  // Fetch souls from API
  const fetchSouls = useCallback(async (tag?: string, search?: string) => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/lonelyland`;
      const params = new URLSearchParams();
      if (tag) params.append('tag', tag);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setSouls(data);
    } catch (err) {
      console.error("Error fetching souls:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSouls();
  }, [fetchSouls]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      fetchSouls(undefined, searchQuery);
    } else {
      fetchSouls();
    }
  }, [searchQuery, fetchSouls]);

  // Handle tag filter
  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag(tag);
    fetchSouls(tag);
  }, [fetchSouls]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedTag("");
    setSearchQuery("");
    fetchSouls();
  }, [fetchSouls]);

  // Handle love/like
  const handleLove = useCallback(async (soulId: string, authorId?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/lonelyland/${soulId}/love`, {
        method: 'PUT'
      });
      const updatedSoul = await res.json();

      setSouls(prev => prev.map(s =>
        s._id === soulId ? { ...s, loves: updatedSoul.loves } : s
      ));

      if (selectedSoul?._id === soulId) {
        setSelectedSoul(prev => prev ? { ...prev, loves: updatedSoul.loves } : null);
      }

      // Send reaction via Socket.IO
      if (authorId && socket) {
        socket.emit("send_reaction", {
          from: currentUserId.current,
          to: authorId,
          reaction: "❤️",
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error("Error loving soul:", err);
    }
  }, [selectedSoul, API_URL]);

  // Handle comment (via Socket.IO)
  const handleComment = useCallback(() => {
    if (!comment.trim() || !selectedSoul || !socket) return;

    socket.emit("newMessage", {
      roomId: `soul_${selectedSoul._id}`,
      message: {
        text: comment,
        userId: currentUserId.current,
        timestamp: Date.now()
      }
    });
    setComment("");
  }, [comment, selectedSoul]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    souls.forEach(soul => soul.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [souls]);

  // Time ago formatter
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Get link URL safely
  const getLinkUrl = (link: string | { type?: string; url: string; _id?: string }): string => {
    return typeof link === 'string' ? link : link.url;
  };

  // Get link type safely
  const getLinkType = (link: string | { type?: string; url: string; _id?: string }): string => {
    return typeof link === 'object' && link.type ? link.type : 'link';
  };

  if (loading && souls.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Ghost className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
          <p className="text-white/60 text-sm tracking-widest">CONNECTING TO THE VOID...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              width={36}
              height={36}
              alt="logo"
              priority
              className="rounded-3xl"
            />
            <h1
              className="text-2xl font-black tracking-tighter cursor-pointer hover:text-white/80 transition-colors"
              onClick={() => router.push('/')}
            >
              LONELYLAND
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Home Button */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Home</span>
            </button>

            {/* Online Users */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">{Object.keys(onlineUsers).length}</span>
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${view === 'grid' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
              >
                GRID
              </button>
              <button
                onClick={() => setView('feed')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${view === 'feed' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
              >
                FEED
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search souls by text or tags..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:scale-105 transition-transform"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Active Filters */}
          {(selectedTag || searchQuery) && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/40">Filters:</span>
              {selectedTag && (
                <span className="text-xs px-3 py-1 bg-white/10 rounded-full flex items-center gap-1">
                  #{selectedTag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => { setSelectedTag(""); fetchSouls(); }} />
                </span>
              )}
              {searchQuery && (
                <span className="text-xs px-3 py-1 bg-white/10 rounded-full flex items-center gap-1">
                  &quot;{searchQuery}&quot;
                  <X className="w-3 h-3 cursor-pointer" onClick={() => { setSearchQuery(""); fetchSouls(); }} />
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-white/60 hover:text-white underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Tag Pills */}
          {showFilters && allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTag === tag
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-36 pb-20 px-4 max-w-7xl mx-auto">
        {souls.length === 0 ? (
          <div className="text-center py-20">
            <Ghost className="w-24 h-24 mx-auto mb-6 text-white/20" />
            <h2 className="text-2xl font-bold text-white/60 mb-2">The void is empty</h2>
            <p className="text-white/40">No souls found. Try different search terms.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {souls.map((soul, idx) => (
              <div
                key={soul._id}
                onClick={() => setSelectedSoul(soul)}
                className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Image */}
                {soul.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={soul.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    {/* Stats Overlay */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {soul.loves !== undefined && (
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                          <Heart className="w-3 h-3 text-red-400" />
                          {soul.loves}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Icon */}
                  {soul.icon && (
                    <div className="text-2xl mb-2">{soul.icon}</div>
                  )}

                  {/* Text */}
                  <p className="text-sm text-white/80 leading-relaxed mb-3 line-clamp-3">
                    {soul.text}
                  </p>

                  {/* Tags */}
                  {soul.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {soul.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTagClick(tag);
                          }}
                          className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 font-mono hover:bg-white/10 hover:text-white transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{timeAgo(soul.createdAt)}</span>
                    {soul.position && (
                      <MapPin className="w-3 h-3" />
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {souls.map((soul) => (
              <div
                key={soul._id}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Image */}
                {soul.imageUrl && (
                  <img src={soul.imageUrl} alt="" className="w-full max-h-96 object-cover" />
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Icon & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {soul.icon && <span className="text-2xl">{soul.icon}</span>}
                      <span className="text-xs text-white/40">{timeAgo(soul.createdAt)}</span>
                    </div>
                    {soul.position && (
                      <MapPin className="w-4 h-4 text-white/40" />
                    )}
                  </div>

                  <p className="text-base leading-relaxed mb-4">{soul.text}</p>

                  {/* Links */}
                  {soul.links && soul.links.length > 0 && (
                    <div className="mb-4 space-y-1">
                      {soul.links.map((link, i) => {
                        const linkUrl = getLinkUrl(link);
                        const linkType = getLinkType(link);
                        return (
                          <a
                            key={i}
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-400 hover:text-cyan-300 underline block"
                          >
                            {linkType !== 'link' ? `[${linkType}] ` : ''}{linkUrl}
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Tags */}
                  {soul.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {soul.tags.map((tag, i) => (
                        <span
                          key={i}
                          onClick={() => handleTagClick(tag)}
                          className="text-sm px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 font-mono hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleLove(soul._id)}
                        className="flex items-center gap-2 text-sm hover:text-red-400 transition-colors group"
                      >
                        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{soul.loves || 0}</span>
                      </button>
                      <button
                        onClick={() => setSelectedSoul(soul)}
                        className="flex items-center gap-2 text-sm hover:text-cyan-400 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Connect</span>
                      </button>
                    </div>
                    <button className="text-white/40 hover:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Soul Detail Modal */}
      {selectedSoul && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSoul(null)}
        >
          <div
            className="bg-black border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedSoul(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto max-h-[90vh]" ref={chatRef}>
              {/* Image */}
              {selectedSoul.imageUrl && (
                <img
                  src={selectedSoul.imageUrl}
                  alt=""
                  className="w-full max-h-96 object-cover"
                />
              )}

              {/* Content */}
              <div className="p-6">
                {/* Icon & Time */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {selectedSoul.icon && <span className="text-3xl">{selectedSoul.icon}</span>}
                    <span className="text-sm text-white/40">{timeAgo(selectedSoul.createdAt)}</span>
                  </div>
                  {selectedSoul.position && selectedSoul.position.lat !== undefined && selectedSoul.position.lng !== undefined && (
                    <div className="flex items-center gap-1 text-white/40">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">
                        {selectedSoul.position.lat.toFixed(2)}, {selectedSoul.position.lng.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Text */}
                <p className="text-lg leading-relaxed mb-6">{selectedSoul.text}</p>

                {/* Links */}
                {selectedSoul.links && selectedSoul.links.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Links</h3>
                    {selectedSoul.links.map((link, i) => {
                      const linkUrl = getLinkUrl(link);
                      const linkType = getLinkType(link);
                      return (
                        <a
                          key={i}
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-400 hover:text-cyan-300 underline block"
                        >
                          {linkType !== 'link' ? `[${linkType}] ` : ''}{linkUrl}
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* Tags */}
                {selectedSoul.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedSoul.tags.map((tag, i) => (
                      <span
                        key={i}
                        onClick={() => {
                          handleTagClick(tag);
                          setSelectedSoul(null);
                        }}
                        className="text-sm px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 font-mono hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
                  <button
                    onClick={() => handleLove(selectedSoul._id)}
                    className="flex items-center gap-2 hover:text-red-400 transition-colors group"
                  >
                    <Heart className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                    <span className="font-bold">{selectedSoul.loves || 0}</span>
                  </button>
                </div>

                {/* Comment Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <button
                    onClick={handleComment}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                    disabled={!comment.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Reactions */}
      {Object.entries(reactions).map(([from, reaction]) => (
        <div
          key={from}
          className="fixed bottom-20 right-8 text-6xl animate-bounce z-50"
          style={{ animation: 'bounce 1s ease-in-out' }}
        >
          {reaction}
        </div>
      ))}

      {/* Online Users Sidebar (Desktop) */}
      <div className="hidden xl:block fixed right-4 top-32 w-64 bg-white/5 border border-white/10 rounded-2xl p-4 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" />
          <h3 className="font-bold text-sm">ONLINE NOW</h3>
        </div>
        {Object.keys(onlineUsers).length === 0 ? (
          <p className="text-xs text-white/40">No one online yet...</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(onlineUsers).map(([id, user]) => (
              <div key={id} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user.userId}</p>
                  {user.musicUrl && (
                    <p className="text-xs text-white/40 truncate">{user.musicUrl}</p>
                  )}
                </div>
                {user.mood && <span>{user.mood}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}