const { Notification } = require('../models/ReviewNotificationBooking');

const createNotification = async (userId, type, title, body, data = {}) => {
  try {
    const notification = await Notification.create({ user: userId, type, title, body, data });
    
    // Emit via socket if available
    const { getSocketInstance } = require('../socket');
    const io = getSocketInstance();
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { ids } = req.body; // array of notification IDs, or 'all'
    
    if (ids === 'all') {
      await Notification.updateMany({ user: req.user._id }, { isRead: true });
    } else {
      await Notification.updateMany({ _id: { $in: ids }, user: req.user._id }, { isRead: true });
    }
    
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createNotification, getNotifications, markAsRead };
