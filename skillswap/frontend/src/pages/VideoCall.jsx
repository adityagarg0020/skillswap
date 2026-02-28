import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Clock } from 'lucide-react';

export default function VideoCall() {
  const { channelName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, wallet } = useAuthStore();
  const sessionId = searchParams.get('sessionId');
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [balance, setBalance] = useState(wallet?.balance || 0);
  const [agoraClient, setAgoraClient] = useState(null);
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Price: ₹5 per minute (configurable)
  const pricePerMin = 5;

  useEffect(() => {
    initAgora();
    startTimer();
    return () => {
      cleanup();
    };
  }, []);

  const initAgora = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      
      const { data } = await api.post('/video/token', {
        channelName,
        uid: 0
      });

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers(p => [...p, remoteUser]);
          setTimeout(() => remoteUser.videoTrack?.play(remoteVideoRef.current), 100);
        }
        if (mediaType === 'audio') remoteUser.audioTrack?.play();
      });

      client.on('user-unpublished', (remoteUser) => {
        setRemoteUsers(p => p.filter(u => u.uid !== remoteUser.uid));
      });

      await client.join(data.appId, channelName, data.token, null);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks({ audio: audioTrack, video: videoTrack });
      videoTrack.play(localVideoRef.current);
      await client.publish([audioTrack, videoTrack]);
    } catch (err) {
      toast.error('Failed to join call. Check camera/mic permissions.');
      console.error(err);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
      setBalance(b => {
        const newBalance = b - pricePerMin / 60;
        if (newBalance <= 0) {
          toast.error('Balance depleted! Session ending.');
          endCall();
        }
        return Math.max(0, newBalance);
      });
    }, 1000);
  };

  const cleanup = () => {
    clearInterval(timerRef.current);
    localTracks.audio?.stop(); localTracks.audio?.close();
    localTracks.video?.stop(); localTracks.video?.close();
    agoraClient?.leave();
  };

  const toggleMic = () => {
    localTracks.audio?.setEnabled(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  const toggleCam = () => {
    localTracks.video?.setEnabled(!isCamOn);
    setIsCamOn(!isCamOn);
  };

  const shareScreen = async () => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
      await agoraClient?.unpublish(localTracks.video);
      await agoraClient?.publish(screenTrack);
      toast.success('Screen sharing started');
    } catch (err) {
      toast.error('Screen sharing failed or cancelled');
    }
  };

  const endCall = async () => {
    cleanup();
    if (sessionId) {
      try {
        await api.post(`/sessions/${sessionId}/end`);
      } catch {}
    }
    navigate('/dashboard');
    toast.success('Session ended');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Remote Video */}
      <div className="flex-1 relative bg-dark-surface">
        {remoteUsers.length > 0 ? (
          <div ref={remoteVideoRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-dark-card flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-white/30" />
              </div>
              <p className="text-white/50">Waiting for other participant...</p>
            </div>
          </div>
        )}

        {/* Local video (PiP) */}
        <div className="absolute top-4 right-4 w-36 h-24 bg-dark-card rounded-xl overflow-hidden ring-2 ring-white/10">
          {isCamOn ? <div ref={localVideoRef} className="w-full h-full" /> : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-white/40" />
            </div>
          )}
        </div>

        {/* Timer & Balance */}
        <div className="absolute top-4 left-4 flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-gold" />
            <span className="font-mono font-bold">{formatTime(duration)}</span>
          </div>
          <div className="glass px-4 py-2 rounded-xl">
            <span className="text-accent-gold font-bold">₹{balance.toFixed(0)}</span>
            <span className="text-white/40 text-sm ml-1">remaining</span>
          </div>
        </div>

        {/* Cost per minute indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-full text-xs text-white/60">
          ₹{pricePerMin}/min • {((duration / 60) * pricePerMin).toFixed(1)} spent
        </div>
      </div>

      {/* Controls */}
      <div className="bg-dark-card border-t border-dark-border p-6 flex items-center justify-center gap-4">
        <button onClick={toggleMic}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMicOn ? 'bg-dark-surface hover:bg-white/10' : 'bg-accent/20 text-accent'}`}>
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        <button onClick={toggleCam}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isCamOn ? 'bg-dark-surface hover:bg-white/10' : 'bg-accent/20 text-accent'}`}>
          {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        <button onClick={shareScreen}
          className="w-14 h-14 rounded-2xl bg-dark-surface hover:bg-white/10 flex items-center justify-center transition-all">
          <Monitor className="w-6 h-6" />
        </button>
        <button onClick={endCall}
          className="w-14 h-14 rounded-2xl bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all">
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
