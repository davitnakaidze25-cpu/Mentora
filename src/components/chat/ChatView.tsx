import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/utils';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: {
    fullName: string;
  };
}

interface ChatViewProps {
  bookingId: string;
  booking: Booking | null;
  onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ bookingId, booking, onBack }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setMessages(data.data);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [bookingId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !booking) return;

    const receiverId = currentUser.role === 'TUTOR' ? booking.studentId : booking.tutorId;
    if (!receiverId) return;

    try {
      await fetch(`/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: receiverId,
          content: newMessage
        })
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {}
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto bg-white border-x border-slate-200">
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 bg-slate-50">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="font-bold text-slate-900 font-['Geist']">
            Chat {booking ? `with ${currentUser?.role === 'TUTOR' ? booking.studentName : booking.tutorName}` : ''}
          </h2>
          {booking && (
            <p className="text-xs text-slate-500">
              {booking.subjectName} • {booking.date} {booking.timeSlot}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className="text-[10px] text-slate-400 mb-1 px-1">
                {msg.sender?.fullName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div
                className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
