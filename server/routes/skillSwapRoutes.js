const express = require('express');
const router = express.Router();
const { proposeSkillSwap, getSkillSwaps, updateSkillSwapStatus } = require('../controllers/skillSwapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, proposeSkillSwap);
router.get('/', protect, getSkillSwaps);
router.put('/:id', protect, updateSkillSwapStatus);

module.exports = router;
