const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateMatch } = require('../utils/matchCalculator');

// @desc    Get all projects with search, filter, and match scores
// @route   GET /api/projects
// @access  Public / Private
const getProjects = async (req, res, next) => {
  try {
    const { search, category, status, skill } = req.query;

    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { requiredSkills: searchRegex }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (skill && skill !== 'All') {
      query.requiredSkills = new RegExp(`^${skill}$`, 'i');
    }

    const projects = await Project.find(query)
      .populate('owner', 'name username email profileImage department year skills')
      .populate('members', 'name username profileImage department year skills')
      .populate('joinRequests', 'name username profileImage department year skills')
      .sort('-createdAt');

    const result = projects.map(p => {
      const pObj = p.toObject();
      if (req.user) {
        const userSkills = (req.user.skills || []).map(s => s.name);
        const matchRes = calculateMatch(p.requiredSkills, userSkills);
        pObj.matchPercentage = matchRes.matchPercentage;
        pObj.matchedSkills = matchRes.matchedSkills;
        pObj.missingSkills = matchRes.missingSkills;
      }
      return pObj;
    });

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public / Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name username email profileImage department year skills bio socialLinks')
      .populate('members', 'name username email profileImage department year skills bio availability')
      .populate('joinRequests', 'name username email profileImage department year skills bio availability');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const pObj = project.toObject();
    if (req.user) {
      const userSkills = (req.user.skills || []).map(s => s.name);
      const matchRes = calculateMatch(project.requiredSkills, userSkills);
      pObj.matchPercentage = matchRes.matchPercentage;
      pObj.matchedSkills = matchRes.matchedSkills;
      pObj.missingSkills = matchRes.missingSkills;
    }

    res.json({
      success: true,
      data: pObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { title, description, category, requiredSkills, maxTeamSize, deadline } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, and category' });
    }

    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills 
      : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []);

    const project = await Project.create({
      title,
      description,
      category,
      owner: req.user._id,
      requiredSkills: skillsArray,
      members: [req.user._id],
      maxTeamSize: Number(maxTeamSize) || 4,
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Planning',
      progressStep: 1
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name username profileImage department year');

    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      data: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project details / status
// @route   PUT /api/projects/:id
// @access  Private (Owner or Admin)
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this project' });
    }

    const { title, description, category, requiredSkills, maxTeamSize, deadline, status, progressStep } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (requiredSkills) project.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim());
    if (maxTeamSize) project.maxTeamSize = Number(maxTeamSize);
    if (deadline) project.deadline = new Date(deadline);
    if (status) project.status = status;
    if (progressStep !== undefined) project.progressStep = Number(progressStep);

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name username profileImage')
      .populate('members', 'name username profileImage');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request to join project
// @route   POST /api/projects/:id/join
// @access  Private
const requestToJoinProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You are already a member of this project' });
    }

    if (project.joinRequests.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already requested to join this project' });
    }

    project.joinRequests.push(req.user._id);
    await project.save();

    // Notify project owner
    await Notification.create({
      user: project.owner,
      type: 'project_join_request',
      message: `${req.user.name} requested to join your project "${project.title}".`,
      referenceId: project._id
    });

    res.json({
      success: true,
      message: 'Join request sent to project owner',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite student to project
// @route   POST /api/projects/:id/invite
// @access  Private (Owner)
const inviteToProject = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owner can invite members' });
    }

    if (project.members.includes(studentId)) {
      return res.status(400).json({ success: false, message: 'Student is already a member of this project' });
    }

    // Add directly or send invitation notification
    if (!project.members.includes(studentId)) {
      project.members.push(studentId);
      await project.save();
    }

    await Notification.create({
      user: studentId,
      type: 'project_invitation',
      message: `${req.user.name} added you to the project "${project.title}".`,
      referenceId: project._id
    });

    res.json({
      success: true,
      message: 'Student successfully invited and added to project',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  requestToJoinProject,
  inviteToProject
};
