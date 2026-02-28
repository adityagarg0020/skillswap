import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft, Image } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import useAuthStore from '../context/authStore'
import api from '../services/api'
import { getSocket } from '../services/socket'
import { format, isToday, isYesterday } from 'date-fns'

const EMOJIS = ['😊', '👍', '🔥', '❤️', '😂', '🎉', '💯', '🚀', '👏', '✨']

export default function ChatPage() {
  const { userId } = useParams()
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const socket = getSocket()

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data } = await api.get('/chat/conversations')
        setConversations(data.conversations)
        
        if (userId) {
          const { data: convData } = await api.get(`/chat/conversations/${userId}`)
          setActiveConversation(convData.conversation)
        } else if (data.conversations.length > 0) {
          setActiveConversation(data.conversations[0])
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadConversations()
  }, [userId])

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversation?._id) return
    
    const loadMessages = async () => {
      const { data } = await api.get(`/chat/${activeConversation._id}/messages`)
      setMessages(data.messages)
    }
    loadMessages()
    
    // Join socket room
    if (socket) {
      socket.emit('chat:join', activeConversation._id)
    }
    
    return () => {
      if (socket) socket.emit('chat:leave', activeConversation._id)
    }
  }, [activeConversation?._id])

  // Socket listeners
  useEffect(() => {
    if (!socket) return
    
    const handleMessage = (message) => {
      if (message.conversation === activeConversation?._id) {
        setMessages(prev => [...prev, message])
      }
      // Update conversation list
      setConversations(prev => prev.map(c => 
        c._id === message.conversation ? { ...c, lastMessage: message, lastMessageAt: message.createdAt } : c
      ))
    }
    
    const handleTyping = ({ userId: typerId, isTyping }) => {
      if (typerId !== user?._id) setOtherTyping(isTyping)
    }
    
    socket.on('chat:message', handleMessage)
    socket.on('chat:typing', handleTyping)
    
    return () => {
      socket.off('chat:message', handleMessage)
      socket.off('chat:typing', handleTyping)
    }
  }, [socket, activeConversation?._id, user?._id])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !activeConversation) return
    
    if (socket) {
      socket.emit('chat:send', {
        conversationId: activeConversation._id,
        content: input.trim()
      })
    } else {
      // Fallback to REST
      api.post(`/chat/${activeConversation._id}/messages`, { content: input.trim() })
        .then(({ data }) => setMessages(prev => [...prev, data.message]))
    }
    
    setInput('')
  }

  const handleTyping = () => {
    if (!socket || !activeConversation) return
    socket.emit('chat:typing', { conversationId: activeConversation._id, isTyping: true })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { conversationId: activeConversation._id, isTyping: false })
    }, 1500)
  }

  const otherParticipant = activeConversation?.participants?.find(p => p._id !== user?._id)
  
  const formatMessageTime = (date) => {
    const d = new Date(date)
    if (isToday(d)) return format(d, 'h:mm a')
    if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
    return format(d, 'MMM d, h:mm a')
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-120px)] rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Conversations sidebar */}
        <div className={`w-80 flex-shrink-0 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}
          style={{ background: '#0d1424', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-4 border-b border-white/5">
            <h2 className="font-display font-semibold">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No conversations yet.<br />Find a mentor and start chatting!
              </div>
            ) : conversations.map(conv => {
              const other = conv.otherParticipant || conv.participants?.find(p => p._id !== user?._id)
              const isActive = activeConversation?._id === conv._id
              return (
                <button key={conv._id} onClick={() => setActiveConversation(conv)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                  style={{ background: isActive ? 'rgba(0,255,135,0.06)' : 'transparent' }}>
                  <div className="relative flex-shrink-0">
                    {other?.avatar ? (
                      <img src={other.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>
                        {other?.name?.[0] || '?'}
                      </div>
                    )}
                    {other?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{other?.name || 'User'}</span>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold"
                          style={{ background: '#00ff87', color: '#0a0f1e' }}>{conv.unreadCount}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col" style={{ background: '#0a0f1e' }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-shrink-0"
              style={{ background: '#0d1424' }}>
              <button className="md:hidden mr-1 text-slate-400" onClick={() => setActiveConversation(null)}>
                <ArrowLeft size={18} />
              </button>
              <div className="relative">
                {otherParticipant?.avatar ? (
                  <img src={otherParticipant.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>
                    {otherParticipant?.name?.[0] || '?'}
                  </div>
                )}
                {otherParticipant?.isOnline && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{otherParticipant?.name}</div>
                <div className="text-xs text-slate-500">
                  {otherParticipant?.isOnline ? '🟢 Online' : 'Offline'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <Phone size={16} />
                </button>
                <button
                  onClick={() => window.location.href = `/video/skillswap_${Date.now()}`}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <Video size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map((msg, i) => {
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id
                return (
                  <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-auto"
                        style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>
                        {msg.sender?.name?.[0] || '?'}
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md ${isMine ? 'bubble-sent' : 'bubble-received'} px-4 py-2.5`}>
                      {msg.type === 'image' ? (
                        <img src={msg.fileUrl} className="rounded-lg max-w-full" alt="shared" />
                      ) : msg.type === 'file' ? (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" 
                          className="flex items-center gap-2 text-sm" style={{ color: '#00d4ff' }}>
                          📎 {msg.fileName || msg.content}
                        </a>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <div className={`text-xs mt-1 ${isMine ? 'text-right' : ''} text-slate-500`}>
                        {formatMessageTime(msg.createdAt)}
                        {isMine && msg.readBy?.length > 1 && ' ✓✓'}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {otherTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full" style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)' }} />
                  <div className="bubble-received px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce bg-slate-400"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 p-4 border-t border-white/5" style={{ background: '#0d1424' }}>
              {showEmojis && (
                <div className="mb-2 p-3 rounded-xl flex flex-wrap gap-2"
                  style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => { setInput(p => p + emoji); setShowEmojis(false) }}
                      className="text-xl hover:scale-125 transition-transform">{emoji}</button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <button onClick={() => setShowEmojis(!showEmojis)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-yellow-400 hover:bg-white/5 transition-all flex-shrink-0">
                  <Smile size={18} />
                </button>
                <textarea
                  className="input flex-1 resize-none text-sm"
                  rows={1}
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => { setInput(e.target.value); handleTyping() }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  style={{ maxHeight: '120px', overflowY: 'auto' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl transition-all flex-shrink-0"
                  style={{
                    background: input.trim() ? 'linear-gradient(135deg, #00ff87, #00d4ff)' : 'rgba(255,255,255,0.06)',
                    color: input.trim() ? '#0a0f1e' : '#6b7280'
                  }}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
