const express = require("express");
const router = express.Router();
// const { submitAssessment, getAssessmentHistory } = require("../controllers/assessmentController");
const { createAssessment, getUserAssessments, getAssessmentById } = require("../controllers/assessmentController");
const authMiddleware = require("../middleware/authMiddleware");

// Routes
// router.post("/submit", authMiddleware, submitAssessment);
// router.get("/history", authMiddleware, getAssessmentHistory);


// Route to create a new assessment and get predictions
router.post('/create', authMiddleware, createAssessment);

// Route to get all assessments for a user
router.get('/', authMiddleware, getUserAssessments);

// Route to get a specific assessment by ID
router.get('/:id', authMiddleware, getAssessmentById);

module.exports = router;
