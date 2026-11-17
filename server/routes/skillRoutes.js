const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

// @desc Get list of predefined skills
// @route GET /api/skills
router.get('/', async (req, res, next) => {
  try {
    const skills = await Skill.find().sort('name');
    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
