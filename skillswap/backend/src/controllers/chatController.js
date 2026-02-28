import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    let convo = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    }).populate('participants', 'name avatar isOnline');

    if (!convo) {
      convo = await Conversation.create({ participants: [req.user._id, userId] });
      convo = await convo.populate('participants', 'name avatar isOnline');
    }

    res.json({ success: true, conversation: convo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    // Mark as seen
    await Message.updateMany(
      { conversation: conversationId, seenBy: { $ne: req.user._id }, sender: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
