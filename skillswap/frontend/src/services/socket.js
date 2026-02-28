import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  s.connect();
  s.emit('join', userId);
  return s;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};
