const User = require('../models/User');
const Project = require('../models/Project');
const { calculateMatch } = require('../utils/matchCalculator');

// @desc    Get recommended partners for current user
// @route   GET /api/matches
// @access  Private
const getRecommendedPartners = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const userSkills = (currentUser.skills || []).map(s => s.name);

    // Fetch other active students
    const candidates = await User.find({
      _id: { $ne: currentUser._id },
      role: 'student',
      isDisabled: false
    }).select('-password');

    const matchedUsers = candidates.map(candidate => {
      const candidateSkills = (candidate.skills || []).map(s => s.name);
      
      // Calculate match score
      const matchResult = calculateMatch(candidateSkills, userSkills);
      
      // Also calculate complementary match (what candidate has that user doesn't)
      const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));
      const complementarySkills = candidateSkills.filter(s => !userSkillSet.has(s.toLowerCase()));

      return {
        ...candidate.toObject(),
        matchPercentage: Math.max(matchResult.matchPercentage, Math.round((matchResult.matchedCount / (candidateSkills.length || 1)) * 100)),
        matchedSkills: matchResult.matchedSkills,
        complementarySkills,
        matchedCount: matchResult.matchedCount
      };
    });

    // Rank by highest match percentage
    matchedUsers.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      data: matchedUsers.slice(0, 10) // Top recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate project partner compatibility match scores
// @route   POST /api/matches
// @access  Private / Public
const calculateProjectMatches = async (req, res, next) => {
  try {
    const { requiredSkills, projectTitle, category, preferredDepartment, preferredYear } = req.body;

    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide at least one required skill for matching' 
      });
    }

    let query = { role: 'student', isDisabled: false };
    if (preferredDepartment && preferredDepartment !== 'All') {
      query.department = preferredDepartment;
    }
    if (preferredYear && preferredYear !== 'All') {
      query.year = preferredYear;
    }

    const students = await User.find(query).select('-password');

    const results = students.map(student => {
      const studentSkills = student.skills || [];
      const matchRes = calculateMatch(requiredSkills, studentSkills);

      return {
        _id: student._id,
        name: student.name,
        username: student.username,
        email: student.email,
        profileImage: student.profileImage,
        department: student.department,
        year: student.year,
        college: student.college,
        bio: student.bio,
        availability: student.availability,
        skills: student.skills,
        matchPercentage: matchRes.matchPercentage,
        matchedSkills: matchRes.matchedSkills,
        missingSkills: matchRes.missingSkills,
        matchedCount: matchRes.matchedCount,
        totalRequired: matchRes.totalRequired
      };
    });

    // Rank descending by match score
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      projectTitle: projectTitle || 'Custom Project Requirement',
      requiredSkills,
      matchCount: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendedPartners,
  calculateProjectMatches
};
