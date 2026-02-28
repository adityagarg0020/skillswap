import Notification from '../models/Notification.js';

export const createNotification = async (io, { userId, type, title, message, data }) => {
  const notification = await Notification.create({ user: userId, type, title, message, data });
  // Emit real-time notification
  io?.to(userId.toString()).emit('notification', notification);
  return notification;
};
