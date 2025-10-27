import React, { useState, useEffect, useRef } from 'react';

// --- TypeScript Interfaces ---

interface Contact {
  id: number;
  name: string;
  status: 'Online' | 'Away' | 'Offline';
  lastMessage: string;
  time: string;
  avatar: string;
}

interface Message {
  id: number;
  text: string;
  sender: string;
  time: string;
  self: boolean;
}

type ChatViewType = 'Contacts' | 'Chat';

interface ContactItemProps {
  contact: Contact;
  setActiveChat: React.Dispatch<React.SetStateAction<Contact>>;
  setView: React.Dispatch<React.SetStateAction<ChatViewType>>;
}

interface ContactsViewProps {
  setView: React.Dispatch<React.SetStateAction<ChatViewType>>;
  setActiveChat: React.Dispatch<React.SetStateAction<Contact>>;
}

interface ChatViewProps {
  activeChat: Contact;
  setView: React.Dispatch<React.SetStateAction<ChatViewType>>;
}

interface MessageBubbleProps {
  message: Message;
}

// Mock Data Structure (Typed)
const mockContacts: Contact[] = [
  { id: 1, name: 'Nova', status: 'Online', lastMessage: 'See you tomorrow...', time: '10:30 AM', avatar: 'https://placehold.co/40x40/6366f1/ffffff?text=N' },
  { id: 2, name: 'Echo', status: 'Away', lastMessage: 'Got it. Thanks!', time: 'Yesterday', avatar: 'https://placehold.co/40x40/a855f7/ffffff?text=E' },
  { id: 3, name: 'Drifter', status: 'Offline', lastMessage: 'Need to talk about the project.', time: '2 days ago', avatar: 'https://placehold.co/40x40/3b82f6/ffffff?text=D' },
];

const mockMessages: Message[] = [
  { id: 1, text: 'Hey there, how is the lonelynet coming along?', sender: 'Nova', time: '10:01 AM', self: false },
  { id: 2, text: 'It is taking shape! Focusing on the desktop responsiveness now.', sender: 'User', time: '10:05 AM', self: true },
  { id: 3, text: 'That sounds like a challenge. The mobile view should be the priority, though.', sender: 'Nova', time: '10:08 AM', self: false },
  { id: 4, text: 'Agreed. Going for a full-screen modal feel on smaller screens.', sender: 'User', time: '10:15 AM', self: true },
];

// Reusable Icon Components (using simple SVG for no external library dependency)
const MessageSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
);

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

// --- Individual Components ---

const ContactItem: React.FC<ContactItemProps> = ({ contact, setActiveChat, setView }) => {
  const handleOpenChat = () => {
    setActiveChat(contact);
    setView('Chat');
  };

  return (
    <div
      className="flex items-center p-3 cursor-pointer hover:bg-indigo-700/50 transition duration-150 rounded-lg"
      onClick={handleOpenChat}
    >
      <div className="relative">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-900 rounded-full ${
            contact.status === 'Online' ? 'bg-green-500' : contact.status === 'Away' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}
        ></span>
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-white truncate">{contact.name}</p>
          <p className="text-xs text-gray-400 min-w-max">{contact.time}</p>
        </div>
        <p className="text-sm text-gray-300 truncate">{contact.lastMessage}</p>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => (
  <div className={`flex ${message.self ? 'justify-end' : 'justify-start'} mb-3`}>
    <div
      className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl text-white shadow-lg ${
        message.self
          ? 'bg-indigo-600 rounded-br-none'
          : 'bg-slate-700 rounded-tl-none'
      }`}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
    >
      <p className="text-sm">{message.text}</p>
      <span className={`block text-xs mt-1 ${message.self ? 'text-indigo-200' : 'text-gray-400'} text-right`}>
        {message.time}
      </span>
    </div>
  </div>
);

// --- Main Views ---

const ContactsView: React.FC<ContactsViewProps> = ({ setView, setActiveChat }) => (
  <div className="p-4 flex flex-col h-full overflow-y-auto">
    <h2 className="text-2xl font-bold text-white mb-4 border-b border-indigo-500/30 pb-2">Conversations</h2>
    <div className="space-y-2 flex-1">
      {mockContacts.map((contact: Contact) => (
        <ContactItem
          key={contact.id}
          contact={contact}
          setActiveChat={setActiveChat}
          setView={setView}
        />
      ))}
    </div>
  </div>
);

const ChatView: React.FC<ChatViewProps> = ({ activeChat, setView }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages load/update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-indigo-500/30 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          className="text-white mr-3 sm:hidden p-1 rounded-full hover:bg-indigo-600 transition"
          onClick={() => setView('Contacts')}
          aria-label="Back to contacts"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <img
          src={activeChat.avatar}
          alt={activeChat.name}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div>
          <h3 className="font-semibold text-white">{activeChat.name}</h3>
          <p className={`text-sm ${activeChat.status === 'Online' ? 'text-green-400' : 'text-gray-400'}`}>
            {activeChat.status}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {mockMessages.map((message: Message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-indigo-500/30 bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-full bg-slate-700/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          />
          <button
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-200 shadow-lg shadow-indigo-500/50"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // 'Contacts' or 'Chat'
  const [view, setView] = useState<ChatViewType>('Contacts');
  const [activeChat, setActiveChat] = useState<Contact>(mockContacts[0]);

  const handleToggleChat = () => {
    setIsOpen((prev) => {
      // Reset view to contacts when opening if it was closed
      if (!prev) {
          setView('Contacts');
      }
      return !prev;
    });
  };

  // Custom Scrollbar style injection (for a cooler look on the chat area)
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(99, 102, 241, 0.5); /* indigo-500 with opacity */
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.5); /* slate-800 with opacity */
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    // FIX: Set a very high inline zIndex to ensure visibility over Leaflet/React Leaflet maps.
    <div className="fixed bottom-4 right-4" style={{ zIndex: 1000 }}>
      {/* 1. Chat Toggle Button (Always visible unless chat is open on mobile) */}
      {(!isOpen || window.innerWidth >= 640) && (
        <button
          className={`
            fixed bottom-4 right-4
            p-4 rounded-full bg-indigo-600 text-white shadow-xl
            hover:bg-indigo-700 transition duration-300
            ${isOpen && window.innerWidth >= 640 ? 'opacity-0 invisible sm:opacity-100 sm:visible' : ''}
            ${isOpen && window.innerWidth < 640 ? 'hidden' : 'block'}
          `}
          onClick={handleToggleChat}
          aria-label={isOpen ? "Close Chat" : "Open Chat"}
          style={{ filter: 'drop-shadow(0 4px 10px rgba(99, 102, 241, 0.7))' }}
        >
          {isOpen ? <XIcon className="w-6 h-6" /> : <MessageSquareIcon className="w-6 h-6" />}
        </button>
      )}

      {/* 2. Chat Window */}
      <div
        className={`
          fixed transform transition-all duration-500 ease-in-out
          bg-slate-900/90 backdrop-blur-sm text-white rounded-xl shadow-2xl
          flex flex-col

          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}

          /* Mobile Styling (Full Screen Modal) */
          inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-80 sm:h-[500px]
          w-full h-full
          
          /* Desktop Styling (Bottom Right Box) */
          sm:bottom-4 sm:right-4 sm:w-96 sm:h-[600px]
        `}
        style={{
          boxShadow: isOpen ? '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99, 102, 241, 0.2)' : 'none',
        }}
      >
        {/* Header/Close Button (Mobile: top right corner of the modal) */}
        <div className="absolute top-4 right-4 z-20 sm:hidden">
            <button
                className="p-2 rounded-full bg-slate-700/50 text-white hover:bg-slate-600 transition"
                onClick={handleToggleChat}
                aria-label="Close Chat"
            >
                <XIcon className="w-5 h-5" />
            </button>
        </div>

        {/* Content Area - FIX APPLIED HERE */}
        <div className="flex-1 min-h-0 overflow-hidden pt-12 sm:pt-0">
          {view === 'Contacts' ? (
            <ContactsView setView={setView} setActiveChat={setActiveChat} />
          ) : (
            <ChatView activeChat={activeChat} setView={setView} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
