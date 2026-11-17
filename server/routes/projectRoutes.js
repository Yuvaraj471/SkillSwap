const express = require('express');
const router = express.Router();
const { 
  getProjects, getProjectById, createProject, updateProject, 
  deleteProject, requestToJoinProject, inviteToProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getProjects);

router.post('/', protect, createProject);

router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getProjectById);

router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/join', protect, requestToJoinProject);
router.post('/:id/invite', protect, inviteToProject);

module.exports = router;
