const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserProfile, addSkill, removeSkill } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Pass protect optionally so getUsers can compute match scores for logged in user
router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getUsers);

router.post('/skills', protect, addSkill);
router.delete('/skills/:skillName', protect, removeSkill);

router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getUserById);

router.put('/:id', protect, updateUserProfile);

module.exports = router;
