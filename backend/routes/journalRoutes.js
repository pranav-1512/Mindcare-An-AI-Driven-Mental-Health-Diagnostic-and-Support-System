const express = require('express');
// const { addJournalEntry, analyzeJournals } = require('../controllers/journalController');
const journalController = require('../controllers/journalController')
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// router.post('/add', authMiddleware, addJournalEntry);
// router.get('/analyze', authMiddleware, analyzeJournals);
router.get('/alljournals',  journalController.getAllJournals);
router.post('/entry',  journalController.addJournalEntry);
router.post('/analyze',  journalController.analyzeJournals);

router.get('/support/:journalId', journalController.getPersonalizedSupport);

// New routes for progress tracking
router.get('/progress',  journalController.getProgressAnalysis);
router.get('/analysis-history',  journalController.getAnalysisHistory);
// router.get('/compare/:previousAnalysisId',  journalController.compareWithPrevious);
router.get('/compare',  journalController.compareWithPrevious);

module.exports = router;

