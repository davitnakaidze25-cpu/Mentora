import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  bookingId: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: { fullName: string };
}

interface MessengerProps {
  initialBookingId?: string | null;
  initialOtherUserId?: string | null;
}

export const Messenger: React.FC<MessengerProps> = ({ initialBookingId, initialOtherUserId }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/messages/conversations/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.data || []);
      }
    } catch {}
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/messages/${currentUser.id}/${otherUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv.otherUserId);
    const interval = setInterval(() => fetchMessages(activeConv.otherUserId), 3000);
    return () => clearInterval(interval);
  }, [activeConv, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If we arrive with a pre-selected other user, select or create that conversation
  useEffect(() => {
    if (initialOtherUserId) {
      const conv = conversations.find((c) => c.otherUserId === initialOtherUserId);
      if (conv) {
        setActiveConv(conv);
        setIsMobileViewingChat(true);
      } else {
        // Fetch the user details directly to open a fresh conversation
        fetch(`/api/auth/users/${initialOtherUserId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data) {
              const u = data.data;
              const newConv: Conversation = {
                otherUserId: u.id,
                otherUserName: u.fullName,
                otherUserAvatar: u.avatarUrl || '',
                bookingId: null,
                lastMessage: 'Start a conversation...',
                lastMessageAt: new Date().toISOString(),
                unreadCount: 0,
              };
              setActiveConv(newConv);
              setIsMobileViewingChat(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [initialOtherUserId, conversations]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeConv) return;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: activeConv.otherUserId,
          content: newMessage.trim(),
          bookingId: activeConv.bookingId || null,
        }),
      });
      setNewMessage('');
      fetchMessages(activeConv.otherUserId);
      fetchConversations();
    } catch {}
  };

  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
    setIsMobileViewingChat(true);
  };

  const filteredConversations = conversations.filter((c) =>
    c.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-72px)] flex bg-[#f7f9fb]">
      {/* LEFT SIDEBAR */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col ${
          isMobileViewingChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-900 font-['Geist'] mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Book a session to start chatting with a mentor</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.otherUserId}
                onClick={() => handleSelectConv(conv)}
                className={`w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100/70 ${
                  activeConv?.otherUserId === conv.otherUserId ? 'bg-indigo-50 border-l-2 border-l-indigo-600' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {conv.otherUserAvatar ? (
                    <img
                      src={conv.otherUserAvatar}
                      alt={conv.otherUserName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                      {conv.otherUserName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {conv.otherUserName}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT CHAT PANEL */}
      <div
        className={`flex-1 flex flex-col ${
          isMobileViewingChat ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <button
                onClick={() => setIsMobileViewingChat(false)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              {activeConv.otherUserAvatar ? (
                <img
                  src={activeConv.otherUserAvatar}
                  alt={activeConv.otherUserName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                  {activeConv.otherUserName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="font-bold text-slate-900 font-['Geist'] text-sm">{activeConv.otherUserName}</h2>
                <p className="text-xs text-slate-500">Active conversation</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No messages yet. Say hello! 👋</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-slate-400 mb-1 px-1">
                      {msg.sender?.fullName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Form */}
            <div className="bg-white border-t border-slate-200 p-4">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-['Geist']">Your Messages</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">
              Select a conversation from the sidebar, or book a session with a mentor to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
