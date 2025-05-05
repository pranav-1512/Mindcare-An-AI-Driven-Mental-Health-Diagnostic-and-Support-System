const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/generate-plan", async (req, res) => {
    try {
        const { depressionSeverity, anxietySeverity } = req.body;

        const prompt = `
        Based on the user's mental health assessment results:
        - Depression Severity: ${depressionSeverity}
        - Anxiety Severity: ${anxietySeverity}

        Generate a structured JSON output with the following fields:
        {
          "personalized_plan": "A short summary of the plan",
          "daily_goals": ["List of daily goals"],
          "coping_strategies": ["List of coping strategies"]
        }
        Ensure all sections are brief and actionable.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500
        });

        const parsedResponse = JSON.parse(response.choices[0].message.content.trim());

        res.json(parsedResponse);
    } catch (error) {
        console.error("Error generating plan:", error);
        res.status(500).json({ error: "Failed to generate plan" });
    }
});

module.exports = router;
