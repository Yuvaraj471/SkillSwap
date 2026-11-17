const CollaborationRequest = require('../models/CollaborationRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send collaboration request
// @route   POST /api/requests
// @access  Private
const sendRequest = async (req, res, next) => {
  try {
    const { receiverId, projectId, message } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required' });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send a collaboration request to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Target student profile not found' });
    }

    // Check existing request
    const existing = await CollaborationRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending collaboration request with this user' });
    }

    const colReq = await CollaborationRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      project: projectId || null,
      message: message || `Hi ${receiver.name}, I would like to collaborate with you on SkillSwap!`,
      status: 'pending'
    });

    // Create Notification
    await Notification.create({
      user: receiverId,
      type: 'collaboration_request',
      message: `${req.user.name} wants to collaborate with you.`,
      referenceId: colReq._id
    });

    res.status(201).json({
      success: true,
      message: 'Collaboration request sent successfully!',
      data: colReq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get received requests
// @route   GET /api/requests/received
// @access  Private
const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await CollaborationRequest.find({ receiver: req.user._id })
      .populate('sender', 'name username email profileImage department year skills bio availability')
      .populate('project', 'title category description')
      .sort('-createdAt');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent requests
// @route   GET /api/requests/sent
// @access  Private
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await CollaborationRequest.find({ sender: req.user._id })
      .populate('receiver', 'name username email profileImage department year skills bio availability')
      .populate('project', 'title category description')
      .sort('-createdAt');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (Accept / Reject)
// @route   PUT /api/requests/:id
// @access  Private
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be accepted or rejected.' });
    }

    const colReq = await CollaborationRequest.findById(req.params.id);
    if (!colReq) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (colReq.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    colReq.status = status;
    await colReq.save();

    if (status === 'accepted') {
      // Add mutual connection
      await User.findByIdAndUpdate(colReq.sender, { $addToSet: { connections: colReq.receiver } });
      await User.findByIdAndUpdate(colReq.receiver, { $addToSet: { connections: colReq.sender } });

      // Create Notification for sender
      await Notification.create({
        user: colReq.sender,
        type: 'request_accepted',
        message: `${req.user.name} accepted your collaboration request!`,
        referenceId: colReq._id
      });
    }

    res.json({
      success: true,
      message: `Collaboration request ${status}`,
      data: colReq
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus
};
