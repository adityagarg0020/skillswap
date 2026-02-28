import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on('join', async (userId) => {
      socket.userId = userId;
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('user_online', userId);
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type, fileUrl, fileName } = data;
        
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          content,
          type: type || 'text',
          fileUrl,
          fileName,
          seenBy: [socket.userId]
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date()
        });

        const populated = await message.populate('sender', 'name avatar');
        
        io.to(`conv_${conversationId}`).emit('new_message', populated);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        userId: socket.userId,
        isTyping,
        conversationId
      });
    });

    // Video call signaling
    socket.on('call_request', ({ targetUserId, sessionId, channelName }) => {
      io.to(targetUserId).emit('incoming_call', {
        from: socket.userId,
        sessionId,
        channelName
      });
    });

    socket.on('call_accepted', ({ targetUserId, channelName }) => {
      io.to(targetUserId).emit('call_accepted', { channelName });
    });

    socket.on('call_rejected', ({ targetUserId }) => {
      io.to(targetUserId).emit('call_rejected');
    });

    socket.on('call_ended', ({ targetUserId }) => {
      io.to(targetUserId).emit('call_ended');
    });

    // Balance check during session (server-side)
    socket.on('balance_update', (data) => {
      io.to(data.targetUserId).emit('balance_update', data);
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
        io.emit('user_offline', socket.userId);
      }
    });
  });
};
