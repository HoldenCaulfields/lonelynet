import React, { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Image from "next/image";

// =========================================================================
// 1. INTERFACE DEFINITIONS
// =========================================================================
interface GroupChatProps {
    roomId: string | null;
    userId: string;
    onClose: () => void;
    showChat: boolean;
}

// 💡 ENHANCEMENT: Added 'type' to distinguish between 'user' and 'system' messages.
interface Message {
    id: string; // Client-side temporary ID (e.g., Date.now().toString())
    _id?: string; // Server-side MongoDB ID
    userId: string;
    text: string;
    timestamp: number;
    type: 'user' | 'system'; // New property: 'user' for chat, 'system' for join/leave
}

interface Post {
    _id: string;
    text: string;
    imageUrl: string;
    tags: string[];
    location: {
        latitude: number;
        longitude: number;
    };
    createdAt: string;
    loves: number;
}

interface Member {
    userId: string;
    socketId: string;
}

// =========================================================================
// 2. CONSTANTS
// =========================================================================
const API_URL =
    process.env.NODE_ENV === "production"
        ? "https://lonelynet.onrender.com"
        : "http://localhost:5000";

const SOCKET_URL = API_URL;
const API_SOUL = `${API_URL}/api/lonelyland`;
const MESSAGES_API_URL = `${API_URL}/api/messages`;

const CHAT_EVENTS = {
    JOIN_ROOM: 'joinRoom',
    LEAVE_ROOM: 'leaveRoom',
    NEW_MESSAGE: 'newMessage',
    RECEIVE_MESSAGE: 'receiveMessage',
    ROOM_MEMBERS: 'roomMembers',
    USER_JOINED: 'userJoined', // 💡 NEW: Event for user join notification
    USER_LEFT: 'userLeft',     // 💡 NEW: Event for user leave notification
    TYPING: 'typing',
    STOP_TYPING: 'stopTyping'
};

const TYPING_TIMEOUT_MS = 1500;

// =========================================================================
// 3. UTILITY COMPONENTS
// =========================================================================

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-16 flex-1 text-center">
        <div className="w-10 h-10 border-4 border-white border-t-green-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-base text-white font-medium">Establishing connection...</p>
    </div>
);

const RoomImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <div className="w-12 h-12 rounded-full mr-3 bg-white border-2 border-green-400 overflow-hidden shadow-lg flex-shrink-0">
        <Image
            src={src || "/placeholderimg.jpg"}
            alt={alt}
            width={48}
            height={48}
            className="object-cover w-full h-full"
        />
    </div>
);

// 💡 ENHANCEMENT: MessageBubble to handle system messages (join/leave)
const MessageBubble: React.FC<{ item: Message; userId: string; formatTime: (t: number) => string }> = ({ item, userId, formatTime }) => {
    // --- System Message Logic ---
    if (item.type === 'system') {
        return (
            <div className="flex justify-center my-3 mx-auto max-w-[90%]">
                <p className="text-xs font-medium text-center text-gray-500 bg-gray-100 rounded-xl px-3 py-1 shadow-sm italic">
                    {item.text}
                </p>
            </div>
        );
    }

    // --- User Message Logic (Original) ---
    const isMe = item.userId === userId;

    const wrapperClasses = `flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`;
    const bubbleClasses = `rounded-2xl px-3.5 py-2 max-w-[80%] shadow-md transform transition-all duration-300 ${isMe
        ? 'bg-green-500 text-white rounded-br-lg rounded-tr-sm'
        : 'bg-gray-100 text-gray-900 rounded-tl-lg rounded-bl-sm'
        }`;
    const timestampClasses = `block mt-1 text-[10px] font-medium text-right ${isMe ? 'text-green-200 opacity-90' : 'text-gray-500'
        }`;
    const senderNameClasses = 'text-xs text-gray-600 font-bold mb-1 uppercase tracking-wider overflow-hidden truncate max-w-full';

    return (
        <div className={wrapperClasses}>
            <div className={bubbleClasses}>
                {!isMe && (
                    <p className={senderNameClasses}>
                        User {item.userId.slice(0, 8)}
                    </p>
                )}
                <p className="text-sm leading-snug break-words whitespace-pre-wrap">{item.text}</p>
                <span className={timestampClasses}>
                    {formatTime(item.timestamp)}
                </span>
            </div>
        </div>
    );
};

// =========================================================================
// 4. MAIN COMPONENT
// =========================================================================
export default function ChatView({ roomId, userId, onClose, showChat }: GroupChatProps) {
    // --- State & Refs ---
    const [socket, setSocket] = useState<Socket | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [post, setPost] = useState<Post | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [showMembers, setShowMembers] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [messagesToPersist, setMessagesToPersist] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false); // 💡 NEW: Typing indicator state
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Utilities ---

    // 💡 ENHANCEMENT: Auto-scroll smoothed and only when needed
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    useEffect(() => {
        if (!loading && messages.length > 0) {
            const timeout = setTimeout(() => {
                scrollToBottom();
            }, 150); // small delay ensures DOM is painted
            return () => clearTimeout(timeout);
        }
    }, [loading]);
    // Scroll effect cleanup: only scroll if the user is near the bottom
    useEffect(() => {
        const chatElement = messagesEndRef.current?.parentElement;
        if (chatElement) {
            const isNearBottom = chatElement.scrollHeight - chatElement.scrollTop - chatElement.clientHeight < 200;
            if (isNearBottom || messages.length <= 1) {
                scrollToBottom();
            }
        }
    }, [messages.length, scrollToBottom]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const getRoomName = () => {
        if (!post?.tags || post.tags.length === 0) return "Global Chat Room";
        return post.tags.map(tag => `#${tag}`).join(" • ");
    };

    // 💡 NEW: Debounced typing handler
    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        if (!socket || !roomId) return;

        if (!typingTimeoutRef.current) {
            socket.emit(CHAT_EVENTS.TYPING, { roomId, userId });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit(CHAT_EVENTS.STOP_TYPING, { roomId, userId });
            typingTimeoutRef.current = null;
        }, TYPING_TIMEOUT_MS);
    };


    const sendMessage = () => {
        if (!message.trim() || !socket || !roomId || sending) return;

        setSending(true);
        const newMessage: Message = {
            id: Date.now().toString(), // Client-side unique ID
            userId: userId,
            text: message.trim(),
            timestamp: Date.now(),
            type: 'user', // Set type to 'user'
        };

        // 1. Optimistic UI Update
        setMessages(prev => [...prev, newMessage]);
        setMessage("");

        // 2. Queue for Persistence (API Call)
        setMessagesToPersist(prev => [...prev, newMessage]);

        // 3. Emit Real-time Message
        socket.emit(CHAT_EVENTS.NEW_MESSAGE, {
            roomId: roomId,
            message: newMessage,
        });

        // 4. Emit stop typing if a message is sent
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        socket.emit(CHAT_EVENTS.STOP_TYPING, { roomId, userId });


        // Small delay to prevent double-click issues
        setTimeout(() => setSending(false), 300);
    };

    // --- EFFECT: Handle Message Persistence (API POST) ---
    useEffect(() => {
        if (messagesToPersist.length === 0 || !roomId) return;

        // Take the latest message from the queue
        const messageToSave = messagesToPersist[messagesToPersist.length - 1];

        const saveMessageToDatabase = async (msg: Message) => {
            if (msg.type !== 'user') { // Only persist user messages
                setMessagesToPersist(prev => prev.filter(m => m.id !== msg.id));
                return;
            }

            try {
                const response = await fetch(MESSAGES_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId: roomId,
                        userId: msg.userId,
                        text: msg.text,
                        timestamp: msg.timestamp,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error saving message: Status ${response.status}`);
                }

                const savedMessage: Message = await response.json();

                // Replace the temporary client-side ID with the real server _id
                setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, _id: savedMessage._id } : m)));

            } catch (error) {
                console.error("❌ Failed to save message to database:", error);
            } finally {
                // Remove the message from the persistence queue regardless of success/failure
                setMessagesToPersist(prev => prev.filter(m => m.id !== msg.id));
            }
        };

        // Only save the latest one, the rest will be handled by the next render cycle
        saveMessageToDatabase(messageToSave);

    }, [messagesToPersist, roomId]);

    // ---------------------------------------------------------------------
    // --- CONSOLIDATED SOCKET AND DATA FETCHING LOGIC ---
    // ---------------------------------------------------------------------
    useEffect(() => {
        // 1. Exit/Cleanup Logic (When chat closes or props are invalid)
        if (!showChat || !roomId || !userId) {
            if (socket) {
                socket.emit(CHAT_EVENTS.LEAVE_ROOM, { roomId, userId });
                socket.disconnect();
            }
            setSocket(null);
            setLoading(false);
            return;
        }

        // --- 2. Data Fetching Functions (Combined) ---
        setLoading(true);

        const fetchData = async () => {
            try {
                const [postResponse, messagesResponse] = await Promise.all([
                    fetch(`${API_SOUL}/${roomId}`),
                    fetch(`${MESSAGES_API_URL}/${roomId}`)
                ]);

                // Handle Post Data
                if (postResponse.ok) {
                    const postData: Post = await postResponse.json();
                    setPost(postData);
                } else {
                    setPost({
                        _id: roomId, text: "Failed to load post details", imageUrl: "", tags: ["Error"],
                        location: { latitude: 0, longitude: 0 }, createdAt: new Date().toISOString(), loves: 0,
                    } as Post);
                }

                // Handle Messages Data
                if (messagesResponse.ok) {
                    const data = await messagesResponse.json();
                    const messagesArray: Message[] = Array.isArray(data)
                        ? data.map((m: any) => ({ ...m, type: 'user' })) // Ensure fetched messages are 'user' type
                        : Array.isArray(data.messages)
                            ? data.messages.map((m: any) => ({ ...m, type: 'user' }))
                            : [];
                    setMessages(messagesArray);
                } else {
                    setMessages([]);
                }
            } catch (error) {
                console.error("❌ Failed to fetch initial data:", error);
                setPost(prev => prev || { _id: roomId, text: "Failed to load post details", imageUrl: "", tags: ["Error"], location: { latitude: 0, longitude: 0 }, createdAt: new Date().toISOString(), loves: 0 } as Post);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // --- 3. Setup Socket Connection ---
        const s: Socket = io(SOCKET_URL, {
            query: { roomId, userId },
            transports: ['websocket'],
            autoConnect: true
        });
        setSocket(s);

        s.on("connect", () => {
            s.emit(CHAT_EVENTS.JOIN_ROOM, { roomId, userId });
        });

        // 4. Handle Incoming Events

        // 💡 NEW: Handle incoming user messages
        s.on(CHAT_EVENTS.RECEIVE_MESSAGE, (msg: Message & { senderSocketId?: string }) => {
            // Ignore the message if it came from our own socket
            if (msg.senderSocketId === s.id) return;

            setMessages((prev) => {
                const isDuplicate = prev.some(m => m._id === msg._id && m._id);
                if (isDuplicate) return prev;
                // Ensure received message is 'user' type by default
                const messageToAdd: Message = { ...msg, type: 'user' };

                return [...prev, messageToAdd];
            });
        });

        // 💡 NEW: Handle user joining
        s.on(CHAT_EVENTS.USER_JOINED, (user: { userId: string }) => {
            const systemMessage: Message = {
                id: Date.now().toString() + Math.random(),
                userId: 'system',
                text: `✨ User ${user.userId.slice(0, 8)} has joined the chat.`,
                timestamp: Date.now(),
                type: 'system',
            };
            setMessages(prev => [...prev, systemMessage]);
        });

        // 💡 NEW: Handle user leaving
        s.on(CHAT_EVENTS.USER_LEFT, (user: { userId: string }) => {
            const systemMessage: Message = {
                id: Date.now().toString() + Math.random(),
                userId: 'system',
                text: `🚪 User ${user.userId.slice(0, 8)} has left the chat.`,
                timestamp: Date.now(),
                type: 'system',
            };
            setMessages(prev => [...prev, systemMessage]);
        });

        // 💡 NEW: Handle member list update
        s.on(CHAT_EVENTS.ROOM_MEMBERS, (memberList: Member[]) => {
            setMembers(memberList);
        });

        // 💡 NEW: Typing indicator listener
        s.on(CHAT_EVENTS.TYPING, (user: { userId: string }) => {
            if (user.userId !== userId) {
                setIsTyping(true);
            }
        });

        s.on(CHAT_EVENTS.STOP_TYPING, (user: { userId: string }) => {
            if (user.userId !== userId) {
                setIsTyping(false);
            }
        });

        // 5. Cleanup on dismount
        return () => {
            if (s.connected) {
                s.emit(CHAT_EVENTS.LEAVE_ROOM, { roomId, userId });
            }
            s.disconnect();
            // Clear all event listeners for clean dismount
            s.offAny();
        };

    }, [showChat, roomId, userId]);


    // ---------------------------------------------------------------------
    // --- ANIMATION CONTROLLER ---
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (showChat) {
            const timeoutId = setTimeout(() => {
                setIsAnimating(true);
            }, 50);
            return () => clearTimeout(timeoutId);
        } else {
            setIsAnimating(false);
        }
    }, [showChat]);

    // --- CLOSING LOGIC ---
    const handleClose = () => {
        setIsAnimating(false);

        setTimeout(() => {
            // Cleanup local state
            setMessages([]);
            setMembers([]);
            setShowMembers(false);
            setPost(null);
            onClose();
        }, 300);
    };

    useEffect(() => {
        const handleResize = () => {
            document.body.style.height = `${window.innerHeight}px`;
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    if (!showChat && !isAnimating) return null;

    return (
        <div
            className={`fixed inset-x-0 top-30 bottom-0 sm:top-auto sm:bottom-8 sm:right-8 z-[1200] flex justify-center sm:justify-end overflow-hidden transition-all duration-300 ${showChat && isAnimating ? '' : 'pointer-events-none'
                }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
        >

            {/* Backdrop */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 ${showChat && isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Chat Container (The Modal Itself) */}
            <div
                className={`relative bg-[#161616] w-full sm:w-[90%] md:w-[70%] lg:w-[45%] xl:w-[35%]
      h-[80dvh] sm:h-[80vh] md:h-[75vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col 
      transition-all duration-500 ease-in-out overflow-hidden 
      ${isAnimating ? 'translate-y-0 scale-100' : 'translate-y-full scale-95'}`}
            >
                {/* 💡 NEW: Gradient Header for Cool Look */}
                <div className="flex items-center justify-between p-4 bg-[#1e1e1e] border-b border-[#2a2a2a] rounded-t-2xl">
                    <div className="flex items-center flex-1 min-w-0">
                        {post && <RoomImage src={post.imageUrl} alt="Room" />}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white text-base sm:text-lg font-bold truncate" title={getRoomName()}>
                                {getRoomName()}
                            </h2>
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className="text-xs text-green-400 hover:text-white transition"
                            >
                                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                                {members.length} online
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#333] text-white"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    // 💡 IMPROVED: Loading spinner background
                    <div className="flex-1 bg-gray-900/90 flex justify-center items-center rounded-b-3xl md:rounded-b-xl">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {/* Members List (Collapsed/Expanded) */}
                        <div
                            className={`relative bg-[#202020]/90 backdrop-blur-md shadow-inner transition-all duration-500 ease-in-out overflow-hidden
  ${showMembers ? "max-h-40 sm:max-h-48 opacity-100" : "max-h-0 opacity-0"}
  border-b border-gray-800`}
                            aria-expanded={showMembers}
                        >
                            <div className="px-4 py-2">
                                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                                    👥 <span>Active Members:</span>
                                </p>

                                {members.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar-thin">
                                        {members.map((member) => (
                                            <div
                                                key={member.userId}
                                                className={`flex items-center py-1 px-3 rounded-full text-xs font-medium border
              transition-all duration-200 hover:scale-105 hover:shadow-[0_0_6px_#22c55e]
              ${member.userId === userId
                                                        ? "bg-green-100 text-green-800 border-green-300"
                                                        : "bg-gray-50 text-gray-700 border-gray-200"
                                                    }`}
                                            >
                                                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                                                User {member.userId.slice(0, 6)}
                                                {member.userId === userId && (
                                                    <span className="ml-1 text-[10px] text-green-600">(You)</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No one’s online yet...</p>
                                )}
                            </div>
                        </div>


                        {/* Messages Area */}
                        <div className="flex-1 bg-[#0f0f0f] overflow-y-auto px-3 sm:px-4 py-2 sm:py-4 flex flex-col justify-end custom-scrollbar-thin">
                            {messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                                    <p className="text-6xl mb-4 animate-bounce">👋</p>
                                    <p className="text-lg font-bold text-gray-800 mb-2">Welcome to the Group!</p>
                                    <p className="text-sm text-gray-500">Be the first to say hello and break the ice.</p>
                                </div>
                            ) : (
                                <div className="flex-1 bg-[#121212] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {messages.map((item) => (
                                        <MessageBubble
                                            key={item._id || item.id || `${item.userId}-${item.timestamp}-${Math.random().toString(36).slice(2, 7)}`}
                                            item={item}
                                            userId={userId}
                                            formatTime={formatTime}
                                        />
                                    ))}
                                    {/* The anchor div for auto-scrolling */}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* 💡 NEW: Typing Indicator */}
                        {isTyping && (
                            <div className="px-4 py-1 text-[11px] text-gray-400 flex items-center flex-shrink-0 bg-[#161616]">
                                <div className="dot-pulse-wrapper mr-2">
                                    <div className="dot-pulse"></div>
                                </div>
                                Someone is typing...
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-2 sm:p-3 bg-[#1e1e1e]/95 border-t border-[#2a2a2a] flex items-center gap-2 sm:gap-3 pb-[env(safe-area-inset-bottom)]">
                            <textarea
                                value={message}
                                onChange={handleTyping}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Type something..."
                                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm sm:text-base resize-none outline-none leading-snug max-h-32 overflow-y-auto"
                                maxLength={500}
                                rows={1}
                            />
                            <button
                                onClick={sendMessage}
                                className={`min-w-[44px] h-11 sm:w-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg 
      ${!message.trim() || sending
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                        : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/50 active:scale-90'
                                    }`}
                                disabled={!message.trim() || sending}
                            >
                                <span className="text-xl sm:text-2xl leading-none font-bold">
                                    {sending ? "📤" : "🚀"}
                                </span>
                            </button>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
}