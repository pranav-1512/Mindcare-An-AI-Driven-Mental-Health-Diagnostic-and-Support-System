// controllers/chatbotController.js
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Define the system prompt for the mental health chatbot
const SYSTEM_PROMPT = `
You are a compassionate and empathetic mental health counselor. Your goal is to provide support, encouragement, and guidance to users who may be experiencing emotional distress, anxiety, or other mental health concerns.

Guidelines:
- Always respond with empathy and kindness.
- Validate the user's feelings.
- Offer practical suggestions, coping strategies, or mindfulness exercises if appropriate.
- Avoid diagnosing or prescribing medication.
- Encourage seeking professional help if the situation warrants it.

Example interactions:
User: I feel overwhelmed with everything going on.
Assistant: I'm sorry to hear you're feeling this way. It's okay to feel overwhelmed sometimes. Try to take things one step at a time, and remember to be kind to yourself. Have you tried taking a short break or practicing deep breathing?

User: I'm struggling to sleep lately.
Assistant: That sounds really tough. Sleep issues can make everything feel harder. Sometimes, creating a calming bedtime routine or journaling before bed can help. If this continues, it might be a good idea to talk to a healthcare professional.
`;

exports.getChatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Make a request to OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    // Extract the AI's response
    const botResponse = response.data.choices[0].message.content.trim();
    
    // Return the bot's response
    return res.status(200).json({ response: botResponse });
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to get response from the chatbot',
      details: error.message
    });
  }
};