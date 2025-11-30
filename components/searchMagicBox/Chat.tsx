import React, { useState, useEffect, useRef } from 'react';
import { GraphNode, NodeType } from '@/types/types';
import { Send, X, MoreVertical, Smile, Paperclip, ThumbsUp } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// Message type theo backend
interface Message {
  _id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: string;
  // UI fields
  sender?: string;
  isMe?: boolean;
  avatar?: string;
  role?: 'mod' | 'user';
}

interface ChatOverlayProps {
  node: GraphNode;
  onClose: () => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ node, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [roomMembers, setRoomMembers] = useState<Array<{ userId: string, socketId: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const isGroup = node.type === NodeType.GROUP;
  
  // Get current user ID
  const currentUserId = typeof window !== 'undefined' 
    ? localStorage.getItem('lonelynet_user_id') || 'anonymous'
    : 'anonymous';

  // Room ID - 1-on-1: sorted user IDs, Group: node.id
  const roomId = isGroup 
    ? `group_${node.id}`
    : [currentUserId, node.id].sort().join('_');

  useEffect(() => {
    // Connect to Socket.io
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    socketRef.current = io(SOCKET_URL);

    // System welcome message
    const systemMsg: Message = {
      _id: 'sys_' + Date.now(),
      roomId,
      userId: 'system',
      content: isGroup ? `Joined ${node.label}. Be kind.` : `Start of private chat with ${node.label}`,
      timestamp: new Date().toISOString(),
      sender: 'HxI System',
      isMe: false,
      role: 'mod'
    };
    setMessages([systemMsg]);

    // Join room
    socketRef.current.emit('joinRoom', { roomId, userId: currentUserId });

    // Listen for room members
    socketRef.current.on('roomMembers', (members: Array<{ userId: string, socketId: string }>) => {
      setRoomMembers(members);
      console.log(`👥 Room ${roomId} members:`, members);
    });

    // Listen for new messages
    socketRef.current.on('receiveMessage', (data: any) => {
      const newMessage: Message = {
        _id: data._id || Date.now().toString(),
        roomId: data.roomId,
        userId: data.userId,
        content: data.text || data.content,
        timestamp: data.timestamp || new Date().toISOString(),
        sender: data.userId === currentUserId ? 'Me' : (data.sender || data.userId),
        isMe: data.userId === currentUserId,
        avatar: data.userId !== currentUserId 
          ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userId}` 
          : undefined
      };
      
      setMessages(prev => [...prev, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.emit('leaveRoom', { roomId, userId: currentUserId });
      socketRef.current?.disconnect();
    };
  }, [node.id, roomId, currentUserId, isGroup, node.label]);

  const handleSend = () => {
    if (!inputText.trim() || !socketRef.current) return;
    
    const messageData = {
      roomId,
      message: {
        _id: Date.now().toString(),
        userId: currentUserId,
        text: inputText,
        timestamp: new Date().toISOString()
      }
    };

    // Send via socket
    socketRef.current.emit('newMessage', messageData);

    // Add to local state immediately (optimistic update)
    setMessages(prev => [...prev, {
      _id: messageData.message._id,
      roomId,
      userId: currentUserId,
      content: inputText,
      timestamp: messageData.message.timestamp,
      sender: 'Me',
      isMe: true
    }]);

    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
     if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingUsers]);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-gray-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col z-50 animate-[slideDown_0.3s_ease-out]">
       
       {/* Header */}
       <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
          <div className="flex items-center gap-3">
             <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                   {isGroup ? '#' : node.label[0]}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
             </div>
             <div>
                <h3 className="text-white font-bold text-sm">{node.label}</h3>
                <p className="text-xs text-gray-400">
                  {isGroup 
                    ? `${roomMembers.length} member${roomMembers.length !== 1 ? 's' : ''} online` 
                    : 'Active now'}
                </p>
             </div>
          </div>
          <div className="flex gap-2">
             <button className="p-2 text-gray-400 hover:text-white"><MoreVertical size={18}/></button>
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-400"><X size={18}/></button>
          </div>
       </div>

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((msg) => (
             <div key={msg._id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                {!msg.isMe && msg.role !== 'mod' && (
                   <img src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`} className="w-8 h-8 rounded-full bg-white/10" alt=""/>
                )}
                <div className={`max-w-[75%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                   {!msg.isMe && msg.role !== 'mod' && <span className="text-[10px] text-gray-500 ml-1 mb-1">{msg.sender}</span>}
                   
                   {msg.role === 'mod' ? (
                      <div className="w-full text-center text-[10px] text-gray-500 my-2 uppercase tracking-widest">{msg.content}</div>
                   ) : (
                      <div className={`px-4 py-2 rounded-2xl text-sm relative group ${
                         msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'
                      }`}>
                         {msg.content}
                         {!msg.isMe && <button className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-pink-500 transition-all"><ThumbsUp size={12}/></button>}
                      </div>
                   )}
                </div>
             </div>
          ))}
          {typingUsers.length > 0 && (
             <div className="text-xs text-gray-500 italic ml-12">{typingUsers.join(', ')} is typing...</div>
          )}
       </div>

       {/* Input */}
       <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="flex items-center gap-2">
             <button type="button" className="text-gray-400 hover:text-white"><Paperclip size={20}/></button>
             <div className="flex-1 relative">
                <input 
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-black/50 text-white rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Type a message..."
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400"><Smile size={16}/></button>
             </div>
             <button 
               onClick={handleSend}
               disabled={!inputText.trim()} 
               className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 transition-all"
             >
                <Send size={18} />
             </button>
          </div>
       </div>

    </div>
  );
};

export default ChatOverlay;