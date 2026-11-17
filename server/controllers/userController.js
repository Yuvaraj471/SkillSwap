const User = require('../models/User');
const Project = require('../models/Project');
const { calculateMatch } = require('../utils/matchCalculator');

// @desc    Get all users with search, filtering, and sorting
// @route   GET /api/users
// @access  Private / Public
const getUsers = async (req, res, next) => {
  try {
    const { search, skill, department, year, availability, sortBy } = req.query;

    let query = { role: 'student', isDisabled: false };

    // Search by name, username, department, bio
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { department: searchRegex },
        { bio: searchRegex },
        { 'skills.name': searchRegex }
      ];
    }

    // Filter by specific skill
    if (skill && skill !== 'All') {
      query['skills.name'] = new RegExp(`^${skill}$`, 'i');
    }

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by year
    if (year && year !== 'All') {
      query.year = year;
    }

    // Filter by availability
    if (availability && availability !== 'All') {
      query.availability = availability;
    }

    let users = await User.find(query).select('-password');

    // Attach match score relative to current logged in user (if authenticated)
    if (req.user) {
      const loggedInUserSkills = (req.user.skills || []).map(s => s.name);
      
      users = users.map(u => {
        const uObj = u.toObject();
        if (u._id.toString() === req.user._id.toString()) {
          uObj.isSelf = true;
          uObj.matchPercentage = 100;
        } else {
          // Calculate skill overlap match percentage
          const targetSkills = (u.skills || []).map(s => s.name);
          const matchRes = calculateMatch(targetSkills, loggedInUserSkills);
          uObj.matchPercentage = targetSkills.length > 0 ? matchRes.matchPercentage : 50;
          uObj.matchedSkills = matchRes.matchedSkills;
        }
        return uObj;
      });

      // Exclude self from discovery list if desired, or mark isSelf
      users = users.filter(u => u._id.toString() !== req.user._id.toString());
    }

    // Sorting
    if (sortBy === 'Most Skills') {
      users.sort((a, b) => (b.skills?.length || 0) - (a.skills?.length || 0));
    } else if (sortBy === 'Newest Users') {
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Best Match' && req.user) {
      users.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID with projects
// @route   GET /api/users/:id
// @access  Public / Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name username email profileImage department year skills availability');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch projects owned or participated in by this user
    const projects = await Project.find({
      $or: [
        { owner: user._id },
        { members: user._id }
      ]
    }).populate('owner', 'name username profileImage');

    const userObj = user.toObject();
    userObj.projects = projects;

    if (req.user) {
      const mySkills = (req.user.skills || []).map(s => s.name);
      const userSkills = (user.skills || []).map(s => s.name);
      const matchRes = calculateMatch(userSkills, mySkills);
      userObj.matchPercentage = matchRes.matchPercentage;
      userObj.matchedSkills = matchRes.matchedSkills;
    }

    res.json({
      success: true,
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { 
      name, bio, location, college, department, year, 
      availability, skills, teachSkills, learnSkills, socialLinks, achievements 
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (college) user.college = college;
    if (department) user.department = department;
    if (year) user.year = year;
    if (availability) user.availability = availability;
    if (skills) user.skills = skills;
    if (teachSkills) user.teachSkills = teachSkills;
    if (learnSkills) user.learnSkills = learnSkills;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (achievements) user.achievements = achievements;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add skill to profile
// @route   POST /api/users/skills
// @access  Private
const addSkill = async (req, res, next) => {
  try {
    const { name, category, proficiency } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if skill exists
    const exists = user.skills.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Skill already added to your profile' });
    }

    user.skills.push({
      name,
      category: category || 'Technical',
      proficiency: proficiency !== undefined ? Number(proficiency) : 80
    });

    await user.save();

    res.json({
      success: true,
      message: 'Skill added successfully',
      data: user.skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove skill from profile
// @route   DELETE /api/users/skills/:skillName
// @access  Private
const removeSkill = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const user = await User.findById(req.user._id);

    user.skills = user.skills.filter(s => s.name.toLowerCase() !== decodeURIComponent(skillName).toLowerCase());
    await user.save();

    res.json({
      success: true,
      message: 'Skill removed successfully',
      data: user.skills
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  addSkill,
  removeSkill
};
