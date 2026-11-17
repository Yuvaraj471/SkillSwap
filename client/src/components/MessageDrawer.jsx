import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Send, MessageSquare, User } from 'lucide-react';

export const MessageDrawer = ({ targetUser, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (targetUser) {
      fetchMessages();
    }
  }, [targetUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/messages/${targetUser._id}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post('/api/messages', {
        receiverId: targetUser._id,
        message: newMessage.trim()
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!targetUser) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={targetUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name)}`}
              alt={targetUser.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{targetUser.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{targetUser.department} • {targetUser.year}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {loading ? (
            <p className="text-center text-xs text-slate-400 py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">Start the conversation with {targetUser.name}</p>
              <p className="text-[11px] text-slate-400 mt-1">Discuss projects, skill swaps, or schedule a session.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender._id === user._id || msg.sender === user._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      isMine
                        ? 'gradient-bg text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.message}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isMine ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${targetUser.name}...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 gradient-bg text-white rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
