import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, 
  Clock, Wallet, Users, Maximize2, MessageSquare, Code
} from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../context/authStore'
import { getSocket } from '../services/socket'
import toast from 'react-hot-toast'

export default function VideoCallPage() {
  const { channelName } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const socket = getSocket()
  
  const mentorId = searchParams.get('mentorId')
  const sessionId = searchParams.get('sessionId')
  const skill = searchParams.get('skill') || 'Session'
  
  const [session, setSession] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [balance, setBalance] = useState(user?.walletBalance || 0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [codeContent, setCodeContent] = useState('// Collaborative code editor\n// Start typing your code here\n\n')
  const [isEnding, setIsEnding] = useState(false)
  const [remoteUser, setRemoteUser] = useState(null)
  const [agoraClient, setAgoraClient] = useState(null)
  const [localTrack, setLocalTrack] = useState(null)
  const [showLowBalance, setShowLowBalance] = useState(false)
  
  const timerRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const costPerSec = (user?.pricePerMinute || 5) / 60

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Get Agora token
        const { data } = await api.post('/video/token', { channelName })
        
        // Try to init Agora (requires SDK)
        if (window.AgoraRTC) {
          await initAgora(data.token, data.uid, data.appId)
        } else {
          // Simulate video for demo
          initDemoVideo()
        }
        
        // Start billing timer
        timerRef.current = setInterval(() => {
          setElapsed(prev => {
            const newElapsed = prev + 1
            // Check balance every 5 seconds
            if (newElapsed % 5 === 0) {
              const cost = newElapsed / 60 * (user?.pricePerMinute || 5)
              const remaining = (user?.walletBalance || 0) - cost
              setBalance(Math.max(0, remaining))
              
              if (remaining < 50) setShowLowBalance(true)
              if (remaining <= 0) handleEndCall()
            }
            return newElapsed
          })
        }, 1000)
        
      } catch (err) {
        toast.error('Failed to join video call')
        navigate(-1)
      }
    }
    
    initSession()
    
    return () => {
      clearInterval(timerRef.current)
      if (localTrack) {
        localTrack.forEach(t => t.close?.())
      }
    }
  }, [])

  const initDemoVideo = async () => {
    // Use browser's getUserMedia for demo purposes
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err) {
      console.log('Camera access denied:', err)
    }
  }

  const initAgora = async (token, uid, appId) => {
    const AgoraRTC = window.AgoraRTC
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    setAgoraClient(client)
    
    client.on('user-published', async (remoteUser, mediaType) => {
      await client.subscribe(remoteUser, mediaType)
      if (mediaType === 'video') {
        setRemoteUser(remoteUser)
        remoteUser.videoTrack?.play(remoteVideoRef.current)
      }
      if (mediaType === 'audio') {
        remoteUser.audioTrack?.play()
      }
    })
    
    await client.join(appId, channelName, token, uid)
    
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
    setLocalTrack([audioTrack, videoTrack])
    videoTrack.play(localVideoRef.current)
    await client.publish([audioTrack, videoTrack])
  }

  const handleMute = () => {
    setIsMuted(prev => !prev)
    if (localTrack) localTrack[0]?.setEnabled?.(isMuted)
  }

  const handleVideoOff = () => {
    setIsVideoOff(prev => !prev)
    if (localTrack) localTrack[1]?.setEnabled?.(isVideoOff)
  }

  const handleEndCall = async () => {
    if (isEnding) return
    setIsEnding(true)
    clearInterval(timerRef.current)
    
    try {
      if (sessionId) {
        const { data } = await api.post(`/sessions/${sessionId}/end`)
        updateUser({ walletBalance: user.walletBalance - data.summary.totalCost })
        toast.success(`Session ended. Duration: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s | Cost: ₹${data.summary.totalCost}`)
      }
    } catch (err) {
      console.error(err)
    }
    
    // Close tracks
    if (localTrack) localTrack.forEach(t => t.close?.())
    if (agoraClient) await agoraClient.leave?.()
    
    navigate('/dashboard')
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const estimatedCost = ((elapsed / 60) * (user?.pricePerMinute || 5)).toFixed(2)

  return (
    <div className="fixed inset-0 bg-[#070c1a] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0 z-10"
        style={{ background: 'rgba(7,12,26,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff87' }} />
            <span style={{ color: '#00ff87' }}>{skill}</span>
          </div>
        </div>
        
        {/* Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Clock size={14} style={{ color: '#00d4ff' }} />
            <span className="font-mono font-bold">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
            style={{ background: showLowBalance ? 'rgba(239,68,68,0.1)' : 'rgba(0,255,135,0.06)', border: `1px solid ${showLowBalance ? 'rgba(239,68,68,0.3)' : 'rgba(0,255,135,0.2)'}` }}>
            <Wallet size={14} style={{ color: showLowBalance ? '#ef4444' : '#00ff87' }} />
            <span className="font-mono font-bold" style={{ color: showLowBalance ? '#ef4444' : '#00ff87' }}>₹{balance.toFixed(0)}</span>
          </div>
          <div className="text-xs text-slate-500">₹{estimatedCost} spent</div>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Remote video (main) */}
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: '#0d1424' }}>
          <video ref={remoteVideoRef} autoPlay playsInline
            className="w-full h-full object-cover" />
          {!remoteUser && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-3xl"
                  style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)', color: '#0a0f1e' }}>
                  {user?.name?.[0] || 'U'}
                </div>
                <p className="text-slate-400 text-sm">Waiting for the other participant...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local video (PiP) */}
        <div className="absolute top-4 right-4 w-40 h-28 rounded-xl overflow-hidden z-10"
          style={{ border: '2px solid rgba(0,255,135,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: '#0d1424' }}>
              <VideoOff size={20} className="text-slate-500" />
            </div>
          )}
        </div>

        {/* Low balance warning */}
        {showLowBalance && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium animate-pulse z-10"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
            ⚠️ Low balance! Add money to continue the session
          </div>
        )}

        {/* Collaborative Code Editor */}
        {showCode && (
          <div className="absolute inset-4 z-20 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <span className="text-sm font-mono">Collaborative Code Editor</span>
              <button onClick={() => setShowCode(false)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
            </div>
            <textarea
              className="flex-1 p-4 text-sm font-mono resize-none outline-none"
              style={{ background: 'transparent', color: '#e2e8f0' }}
              value={codeContent}
              onChange={e => setCodeContent(e.target.value)}
              placeholder="// Start coding together..."
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-6 flex-shrink-0"
        style={{ background: 'rgba(7,12,26,0.9)', backdropFilter: 'blur(10px)' }}>
        
        {[
          { icon: isMuted ? MicOff : Mic, onClick: handleMute, active: isMuted, label: isMuted ? 'Unmute' : 'Mute', danger: false },
          { icon: isVideoOff ? VideoOff : Video, onClick: handleVideoOff, active: isVideoOff, label: isVideoOff ? 'Start Video' : 'Stop Video', danger: false },
          { icon: Monitor, onClick: () => toast.success('Screen sharing - requires Agora SDK in production'), active: isSharing, label: 'Screen', danger: false },
          { icon: Code, onClick: () => setShowCode(!showCode), active: showCode, label: 'Code Editor', danger: false },
        ].map(({ icon: Icon, onClick, active, label, danger }) => (
          <button key={label} onClick={onClick}
            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-xs"
            style={{
              background: active ? (danger ? 'rgba(239,68,68,0.15)' : 'rgba(0,255,135,0.1)') : 'rgba(255,255,255,0.06)',
              border: `1px solid ${active ? (danger ? 'rgba(239,68,68,0.3)' : 'rgba(0,255,135,0.3)') : 'rgba(255,255,255,0.1)'}`,
              color: active ? (danger ? '#ef4444' : '#00ff87') : '#94a3b8',
              minWidth: '60px'
            }}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
        
        {/* End call */}
        <button onClick={handleEndCall}
          className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-xs"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', minWidth: '60px' }}>
          <PhoneOff size={20} />
          <span>End Call</span>
        </button>
      </div>
    </div>
  )
}
