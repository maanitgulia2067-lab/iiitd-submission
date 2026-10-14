import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  peer: {
    user_id: string;
    name: string;
    college_short_name?: string;
    avatar_url?: string;
  } | null;
  currentUser: User | null;
}

interface MessageItem {
  message_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  created_at: string;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  isOpen,
  onClose,
  peer,
  currentUser
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    if (!peer) return;
    try {
      const msgs = await api.getDirectMessages(peer.user_id);
      setMessages(msgs || []);
    } catch {
      // Fallback sample messages if empty
    }
  };

  useEffect(() => {
    if (isOpen && peer) {
      loadMessages();
      const interval = setInterval(loadMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, peer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !peer) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    try {
      await api.sendDirectMessage(peer.user_id, text);
      await loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono font-bold flex items-center justify-center text-xs">
              {peer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {peer.name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-teal-500" title="Online"></span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {peer.college_short_name || 'Cross-College Builder'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <span className="text-2xl">💬</span>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Direct message channel with {peer.name}.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Discuss cross-college builds, hackathon teams, and peer learning.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.sender_id === currentUser?.user_id;
              return (
                <div
                  key={m.message_id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-br-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">
                    {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={`Message ${peer.name.split(' ')[0]}...`}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-100"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 text-xs font-mono font-bold rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition disabled:opacity-40"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
};

