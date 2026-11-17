const User = require('../models/User');
const Project = require('../models/Project');
const CollaborationRequest = require('../models/CollaborationRequest');
const SkillSwap = require('../models/SkillSwap');
const Report = require('../models/Report');

// @desc    Get admin platform analytics statistics
// @route   GET /api/admin/stats
// @access  Private / Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeUsers = await User.countDocuments({ role: 'student', isDisabled: false });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: { $ne: 'Completed' } });
    const collaborationRequests = await CollaborationRequest.countDocuments();
    const skillSwaps = await SkillSwap.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        totalStudents,
        activeUsers,
        totalProjects,
        activeProjects,
        collaborationRequests,
        skillSwaps,
        pendingReports
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for Admin
// @route   GET /api/admin/users
// @access  Private / Admin
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle disable user account
// @route   PUT /api/admin/users/:id/disable
// @access  Private / Admin
const toggleDisableUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot disable admin user' });
    }

    user.isDisabled = !user.isDisabled;
    await user.save();

    res.json({
      success: true,
      message: `User account ${user.isDisabled ? 'disabled' : 'enabled'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private / Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for Admin
// @route   GET /api/admin/projects
// @access  Private / Admin
const getAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email department')
      .populate('members', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (Admin)
// @route   DELETE /api/admin/projects/:id
// @access  Private / Admin
const deleteAdminProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully by admin'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  toggleDisableUser,
  deleteUser,
  getAdminProjects,
  deleteAdminProject
};
