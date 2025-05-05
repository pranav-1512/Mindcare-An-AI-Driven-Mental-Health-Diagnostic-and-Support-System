const openai = require('../config/openai');

class OpenAIService {
    static async generateInsights(context) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system", 
                        content: "You are a compassionate mental health assistant providing insights from a mood journal."
                    },
                    {
                        role: "user", 
                        content: `Analyze the following mood journal context and provide insights from the mood journal context to analyze the trends in the pattern of the user's mental health\n${context}`
                    }
                ],
                temperature: 0.7
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI Insights Generation Error:', error);
            return "Unable to generate AI insights at this time.";
        }
    }
}

module.exports = OpenAIService;