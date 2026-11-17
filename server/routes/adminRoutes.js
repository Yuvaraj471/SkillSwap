const express = require('express');
const router = express.Router();
const { 
  getAdminStats, getAdminUsers, toggleDisableUser, 
  deleteUser, getAdminProjects, deleteAdminProject 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/disable', toggleDisableUser);
router.delete('/users/:id', deleteUser);
router.get('/projects', getAdminProjects);
router.delete('/projects/:id', deleteAdminProject);

module.exports = router;
