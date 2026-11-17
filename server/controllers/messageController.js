const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get conversation between logged-in user and target user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name username profileImage')
    .populate('receiver', 'name username profileImage')
    .sort('createdAt');

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message to user
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver ID and non-empty message are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const newMsg = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message: message.trim()
    });

    const populatedMsg = await Message.findById(newMsg._id)
      .populate('sender', 'name username profileImage')
      .populate('receiver', 'name username profileImage');

    res.status(201).json({
      success: true,
      data: populatedMsg
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage
};
