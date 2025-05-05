const express = require('express');
const router = express.Router();
const { submitAssessment } = require('../controllers/selfAssessmentController');

router.post('/submit', submitAssessment);

module.exports = router;
