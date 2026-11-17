const express = require('express');
const router = express.Router();
const { getRecommendedPartners, calculateProjectMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRecommendedPartners);
router.post('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, calculateProjectMatches);

module.exports = router;
