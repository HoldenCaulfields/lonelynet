"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import { socket as s } from "@/components/utils/socket";
import Image from "next/image";

/* ---------------------------
  Types
----------------------------*/
interface GroupChatProps {
  roomId: string | null;
  userId: string;
  onClose: () => void;
  showChat: boolean;
}

interface Message {
  id: string;
  _id?: string;
  userId: string;
  text: string;
  timestamp: number;
  type: "user" | "system";
}

interface Post {
  _id: string;
  text?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt?: string;
}

/* ---------------------------
  Constants
----------------------------*/
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const API_SOUL = `${API_URL}/api/lonelyland`;
const MESSAGES_API_URL = `${API_URL}/api/messages`;

const CHAT_EVENTS = {
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  NEW_MESSAGE: "newMessage",
  RECEIVE_MESSAGE: "receiveMessage",
  TYPING: "typing",
  STOP_TYPING: "stopTyping",
  ROOM_MEMBERS: "roomMembers",
  USER_JOINED: "userJoined",
  USER_LEFT: "userLeft",
} as const;

const TYPING_TIMEOUT_MS = 1500;

/* ---------------------------
  Simple RoomImage
----------------------------*/
const RoomImage: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => (
  <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
    <Image
      src={src || "/placeholderimg.jpg"}
      alt={alt || "room"}
      width={40}
      height={40}
      className="object-cover w-full h-full"
    />
  </div>
);

/* ---------------------------
  ChatView Component
----------------------------*/
export default function ChatView({ roomId, userId, onClose, showChat }: GroupChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [members, setMembers] = useState<{ userId: string; socketId?: string }[]>([]);

  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const innerContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    // scroll on messages update
    const t = setTimeout(() => scrollToBottom(), 120);
    return () => clearTimeout(t);
  }, [messages.length, scrollToBottom]);

  // Fetch messages + post + setup socket listeners
  useEffect(() => {
    if (!showChat || !roomId) {
      try {
        s.emit(CHAT_EVENTS.LEAVE_ROOM, { roomId, userId });
      } catch {}
      setSocket(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    // fetch post metadata and messages
    (async () => {
      try {
        const [postRes, msgsRes] = await Promise.all([
          fetch(`${API_SOUL}/${roomId}`),
          fetch(`${MESSAGES_API_URL}/${roomId}`),
        ]);

        if (postRes.ok) {
          const pd = await postRes.json();
          if (mounted) setPost(pd);
        }

        if (msgsRes.ok) {
          const data = await msgsRes.json();
          const arr: Message[] = Array.isArray(data) ? data : data.messages || [];
          if (mounted) setMessages(arr);
        } else {
          if (mounted) setMessages([]);
        }
      } catch (err) {
        console.error("[ChatView] fetch error", err);
        if (mounted) setMessages([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // socket connect
    try {
      if (!s.connected) s.connect();
      setSocket(s);
    } catch (err) {
      console.error("[ChatView] socket init error", err);
    }

    // handlers
    const onReceive = (msg: Message & { senderSocketId?: string }) => {
      if ((msg as any).senderSocketId && s.id && (msg as any).senderSocketId === s.id) return;
      setMessages((prev) => {
        const exists = msg._id ? prev.some((m) => m._id === msg._id) : false;
        return exists ? prev : [...prev, { ...msg, type: "user" }];
      });
    };

    const onTyping = (u: { userId: string }) => {
      if (u?.userId !== userId) setIsTyping(true);
    };

    const onStopTyping = (u: { userId: string }) => {
      if (u?.userId !== userId) setIsTyping(false);
    };

    const onRoomMembers = (list: { userId: string; socketId?: string }[]) => {
      setMembers(list || []);
    };

    try {
      s.on(CHAT_EVENTS.RECEIVE_MESSAGE, onReceive);
      s.on(CHAT_EVENTS.TYPING, onTyping);
      s.on(CHAT_EVENTS.STOP_TYPING, onStopTyping);
      s.on(CHAT_EVENTS.ROOM_MEMBERS, onRoomMembers);

      // join room after listeners registered
      s.emit(CHAT_EVENTS.JOIN_ROOM, { roomId, userId });
    } catch (err) {
      console.warn("[ChatView] socket listeners error", err);
    }

    return () => {
      mounted = false;
      try {
        s.emit(CHAT_EVENTS.LEAVE_ROOM, { roomId, userId });
        s.off(CHAT_EVENTS.RECEIVE_MESSAGE, onReceive);
        s.off(CHAT_EVENTS.TYPING, onTyping);
        s.off(CHAT_EVENTS.STOP_TYPING, onStopTyping);
        s.off(CHAT_EVENTS.ROOM_MEMBERS, onRoomMembers);
      } catch (err) {
        console.warn("[ChatView] cleanup error", err);
      }
    };
  }, [showChat, roomId, userId]);

  // typing emit
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (!socket || !roomId) return;
    try {
      socket.emit(CHAT_EVENTS.TYPING, { roomId, userId });
    } catch {}
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      try {
        socket.emit(CHAT_EVENTS.STOP_TYPING, { roomId, userId });
      } catch {}
      typingRef.current = null;
    }, TYPING_TIMEOUT_MS);
  };

  // send message
  const sendMessage = async () => {
    if (!message.trim() || !socket || !roomId || sending) return;
    setSending(true);
    const newMsg: Message = {
      id: Date.now().toString(),
      userId,
      text: message.trim(),
      timestamp: Date.now(),
      type: "user",
    };

    setMessages((p) => [...p, newMsg]);
    setMessage("");

    try {
      socket.emit(CHAT_EVENTS.NEW_MESSAGE, { roomId, message: newMsg });
    } catch (err) {
      console.error("[ChatView] emit error", err);
    }

    // persist
    (async () => {
      try {
        const res = await fetch(MESSAGES_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newMsg, roomId }),
        });
        if (res.ok) {
          const saved = await res.json();
          if (saved?._id) {
            setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, _id: saved._id } : m)));
          }
        } else {
          console.warn("[ChatView] save non-ok", res.status);
        }
      } catch (err) {
        console.error("[ChatView] save error", err);
      } finally {
        setSending(false);
      }
    })();
  };

  // prevent body scroll while typing + adjust inner padding with visualViewport (if available)
  useEffect(() => {
    const ta = textareaRef.current;
    const inner = innerContainerRef.current;
    if (!ta) return;

    const onFocus = () => {
      try {
        document.body.style.overflow = "hidden";
      } catch {}
      const vv = window.visualViewport;
      if (vv && inner) {
        const adjust = () => {
          const kbHeight = window.innerHeight - vv.height - (vv.offsetTop || 0);
          inner.style.paddingBottom = `${Math.max(16, kbHeight + 80)}px`;
        };
        adjust();
        vv.addEventListener("resize", adjust);
        vv.addEventListener("scroll", adjust);
        const cleanup = () => {
          try {
            document.body.style.overflow = "";
            inner.style.paddingBottom = "";
          } catch {}
          vv.removeEventListener("resize", adjust);
          vv.removeEventListener("scroll", adjust);
          ta.removeEventListener("blur", cleanup);
        };
        ta.addEventListener("blur", cleanup, { once: true });
      } else {
        if (inner) inner.style.paddingBottom = "110px";
        const cleanup = () => {
          try {
            document.body.style.overflow = "";
            if (inner) inner.style.paddingBottom = "";
          } catch {}
          ta.removeEventListener("blur", cleanup);
        };
        ta.addEventListener("blur", cleanup, { once: true });
      }
    };

    ta.addEventListener("focus", onFocus);
    return () => {
      ta.removeEventListener("focus", onFocus);
    };
  }, [textareaRef, innerContainerRef]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!showChat) return null;

  const getRoomName = () => {
    if (!post?.tags || post.tags.length === 0) return "Global Chat Room";
    return post.tags.map((t) => `#${t}`).join(" • ");
  };

  return (
    <div
      className={` fixed w-full sm:w-120 bottom-0 sm:top-auto  sm:right-8 z-[1200] flex justify-center sm:justify-end`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
    >
      <div
        className="w-full max-w-md  sm:mx-0 bg-[#161616] text-white rounded-t-3xl shadow-2xl border border-[#252525] flex flex-col overflow-hidden"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#2a2a2a] sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <RoomImage src={post?.imageUrl} alt={post?.text || "room"} />
            <div className="min-w-0">
              <h3 id="chat-title" className="text-sm font-semibold truncate">
                {post ? getRoomName() : "Group Chat"}
              </h3>
              <p className="text-xs text-green-400 truncate">
                {members.length} online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMembers((prev) => prev)}
              className="text-xs text-green-400 hover:text-white"
              title="Members"
            >
              👥
            </button>
            <button onClick={onClose} aria-label="Close chat" className="w-8 h-8 rounded-full font-bold bg-red-500 flex items-center justify-center">
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={innerContainerRef}
          className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 custom-scrollbar min-h-0"
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="text-gray-400">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className="text-2xl mb-2">👋</div>
              <div className="font-semibold">Welcome to the Group</div>
              <div className="text-xs text-gray-400">Start the conversation</div>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.userId === userId;
              return (
                <div key={m._id || m.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? "bg-green-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div className="text-[10px] opacity-60 mt-1 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Typing */}
        {isTyping && (
          <div className="px-4 py-1 text-xs text-gray-400 bg-[#161616] border-t border-[#222]">
            Someone is typing...
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-3 bg-[#1e1e1e] border-t border-[#2a2a2a] sticky bottom-0 z-10">
          <div className="flex items-center gap-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTyping}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
              rows={1}
              inputMode="text"
              enterKeyHint="send"
              className="flex-1 resize-none bg-transparent text-white placeholder-gray-400 text-sm outline-none text-[16px] leading-snug max-h-32"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${!message.trim() ? "bg-gray-600 text-gray-300" : "bg-green-500 hover:bg-green-600"}`}
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
