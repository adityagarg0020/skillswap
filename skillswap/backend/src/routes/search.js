const express = require('express');
const router = express.Router();
const { searchMentors, getSkillSuggestions } = require('../controllers/searchController');

router.get('/mentors', searchMentors);
router.get('/skills', getSkillSuggestions);

module.exports = router;
