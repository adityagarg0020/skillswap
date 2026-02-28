import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { Send, Smile, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { motion } from 'framer-motion';

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConvo, setCurrentConvo] = useState(null);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) loadMessages(conversationId);
  }, [conversationId]);

  useEffect(() => {
    socket.on('new_message', (msg) => {
      if (msg.conversation === (currentConvo?._id || conversationId)) {
        setMessages(p => [...p, msg]);
        scrollToBottom();
      }
      loadConversations();
    });
    socket.on('typing', ({ userId, isTyping, conversationId: cid }) => {
      setTypingUsers(p => ({ ...p, [cid]: isTyping ? userId : null }));
    });
    return () => { socket.off('new_message'); socket.off('typing'); };
  }, [currentConvo, conversationId]);

  const loadConversations = async () => {
    const { data } = await api.get('/chat/conversations');
    setConversations(data.conversations || []);
    if (conversationId && !currentConvo) {
      const c = data.conversations?.find(c => c._id === conversationId);
      if (c) setCurrentConvo(c);
    }
  };

  const loadMessages = async (cid) => {
    const { data } = await api.get(`/chat/messages/${cid}`);
    setMessages(data.messages || []);
    socket.emit('join_conversation', cid);
    scrollToBottom();
  };

  const sendMessage = () => {
    if (!input.trim() || !conversationId) return;
    socket.emit('send_message', { conversationId, content: input.trim() });
    setInput('');
    setShowEmoji(false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { conversationId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false });
    }, 1500);
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const otherUser = (convo) => convo.participants?.find(p => p._id !== user._id);

  return (
    <div className="flex h-[calc(100vh-8rem)] glass-card overflow-hidden">
      {/* Conversations List */}
      <div className="w-72 border-r border-dark-border flex flex-col">
        <div className="p-4 border-b border-dark-border">
          <h2 className="font-display text-lg font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-white/40 text-sm">No conversations yet.<br/>Find a mentor and start chatting!</div>
          ) : conversations.map(c => {
            const other = otherUser(c);
            const isActive = c._id === conversationId;
            return (
              <a key={c._id} href={`/chat/${c._id}`}
                className={`flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-dark-border/50 ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
                onClick={e => { e.preventDefault(); setCurrentConvo(c); loadMessages(c._id); window.history.pushState({}, '', `/chat/${c._id}`); }}>
                <div className="relative">
                  <img src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name}`}
                    alt={other?.name} className="w-10 h-10 rounded-full" />
                  {other?.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-dark-card"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{other?.name}</p>
                  <p className="text-xs text-white/40 truncate">{c.lastMessage?.content || 'Start chatting'}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      {conversationId && currentConvo ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {(() => { const other = otherUser(currentConvo); return (
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name}`}
                    alt={other?.name} className="w-10 h-10 rounded-full" />
                  {other?.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-dark-card"></span>}
                </div>
                <div>
                  <p className="font-medium text-sm">{other?.name}</p>
                  <p className="text-xs text-white/40">{other?.isOnline ? 'Online' : `Last seen ${other?.lastSeen ? formatDistanceToNow(new Date(other.lastSeen), {addSuffix:true}) : 'recently'}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/users/${other?._id}`} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </a>
              </div>
            </div>
          );})()}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => {
              const isMine = msg.sender?._id === user._id;
              return (
                <motion.div key={msg._id || i} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
                  className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {!isMine && <img src={msg.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.name}`}
                    alt={msg.sender?.name} className="w-7 h-7 rounded-full flex-shrink-0" />}
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-md' : 'bg-dark-surface border border-dark-border text-white rounded-bl-md'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-white/50' : 'text-white/30'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                      {isMine && msg.seenBy?.length > 1 && ' ✓✓'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {typingUsers[conversationId] && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-dark-surface"></div>
                <div className="bg-dark-surface border border-dark-border px-4 py-2.5 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    {[0,1,2].map(j => <div key={j} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{animationDelay:`${j*0.15}s`}}></div>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-dark-border">
            {showEmoji && (
              <div className="mb-2">
                <EmojiPicker theme="dark" onEmojiClick={e => setInput(p => p + e.emoji)} />
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-white/40 hover:text-white transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <input value={input} onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message..."
                className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60" />
              <button onClick={sendMessage} disabled={!input.trim()}
                className="p-2.5 bg-primary rounded-xl text-white hover:bg-primary-dark transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">💬</p>
            <h3 className="font-display text-xl font-semibold mb-2">Select a conversation</h3>
            <p className="text-white/40 text-sm">Choose from your existing conversations or start a new one by visiting a mentor profile</p>
          </div>
        </div>
      )}
    </div>
  );
}
