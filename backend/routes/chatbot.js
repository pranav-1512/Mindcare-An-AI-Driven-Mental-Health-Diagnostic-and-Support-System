// routes/chatbot.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route to get a response from the mental health chatbot
router.post('/chat', chatbotController.getChatbotResponse);

module.exports = router;