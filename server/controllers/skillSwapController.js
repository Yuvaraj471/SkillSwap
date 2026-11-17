const SkillSwap = require('../models/SkillSwap');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { checkSkillSwapCompatibility } = require('../utils/matchCalculator');

// @desc    Propose a skill swap
// @route   POST /api/skill-swaps
// @access  Private
const proposeSkillSwap = async (req, res, next) => {
  try {
    const { receiverId, offeredSkill, requestedSkill, message } = req.body;

    if (!receiverId || !offeredSkill || !requestedSkill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Receiver ID, offered skill, and requested skill are required' 
      });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot propose a skill swap to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    const swap = await SkillSwap.create({
      sender: req.user._id,
      receiver: receiverId,
      offeredSkill,
      requestedSkill,
      message: message || `Hi ${receiver.name}, I can help you learn ${offeredSkill} if you can help me learn ${requestedSkill}!`,
      status: 'pending'
    });

    // Notify receiver
    await Notification.create({
      user: receiverId,
      type: 'skill_swap_proposal',
      message: `${req.user.name} proposed a Skill Swap: Teach ${offeredSkill} ⇄ Learn ${requestedSkill}.`,
      referenceId: swap._id
    });

    res.status(201).json({
      success: true,
      message: 'Skill Swap proposal sent successfully!',
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's skill swap proposals and mutual opportunities
// @route   GET /api/skill-swaps
// @access  Private
const getSkillSwaps = async (req, res, next) => {
  try {
    const incoming = await SkillSwap.find({ receiver: req.user._id })
      .populate('sender', 'name username profileImage department year skills teachSkills learnSkills bio')
      .sort('-createdAt');

    const outgoing = await SkillSwap.find({ sender: req.user._id })
      .populate('receiver', 'name username profileImage department year skills teachSkills learnSkills bio')
      .sort('-createdAt');

    // Calculate mutual skill swap matches across the student network!
    const allUsers = await User.find({ 
      _id: { $ne: req.user._id }, 
      role: 'student', 
      isDisabled: false 
    }).select('name username profileImage department year teachSkills learnSkills bio');

    const mutualMatches = [];
    allUsers.forEach(otherUser => {
      const compat = checkSkillSwapCompatibility(req.user, otherUser);
      if (compat.aTeachesB.length > 0 || compat.bTeachesA.length > 0) {
        mutualMatches.push({
          user: otherUser,
          isMutual: compat.isMutual,
          youTeach: compat.aTeachesB,
          youLearn: compat.bTeachesA,
          score: compat.score
        });
      }
    });

    // Sort mutual matches: perfect mutual first
    mutualMatches.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      incoming,
      outgoing,
      mutualMatches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Skill Swap status (Accept / Reject)
// @route   PUT /api/skill-swaps/:id
// @access  Private
const updateSkillSwapStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
    }

    const swap = await SkillSwap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ success: false, message: 'Skill swap proposal not found' });
    }

    if (swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this proposal' });
    }

    swap.status = status;
    await swap.save();

    if (status === 'accepted') {
      // Connect users
      await User.findByIdAndUpdate(swap.sender, { $addToSet: { connections: swap.receiver } });
      await User.findByIdAndUpdate(swap.receiver, { $addToSet: { connections: swap.sender } });

      // Notify sender
      await Notification.create({
        user: swap.sender,
        type: 'skill_swap_accepted',
        message: `${req.user.name} accepted your Skill Swap proposal (${swap.offeredSkill} ⇄ ${swap.requestedSkill})!`,
        referenceId: swap._id
      });
    }

    res.json({
      success: true,
      message: `Skill swap proposal ${status}`,
      data: swap
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  proposeSkillSwap,
  getSkillSwaps,
  updateSkillSwapStatus
};
