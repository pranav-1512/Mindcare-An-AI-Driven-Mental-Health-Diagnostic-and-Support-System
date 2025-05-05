const { spawn } = require('child_process');
const JournalEntry = require('../models/JournalEntry');
const AnalysisResult = require('../models/AnalysisResult'); // New model
const EmergencyAlert = require('../models/EmergencyAlertSchema')

const path = require('path');
const axios = require('axios'); // You'll need to install this


// Add these imports at the top of your file
const twilio = require('twilio');
const User = require('../models/User');

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { VoiceResponse } = require('twilio').twiml;

let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.warn("Twilio client initialization failed:", error.message);
}



exports.getAllJournals = async(req,res) => {
    try {
        const journals = await JournalEntry.find({ userId: req.user.id }).sort({ timestamp:-1});
        res.status(201).json(journals) 
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// WORKING(Before SOS)
// exports.addJournalEntry = async (req, res) => {
//     try {
//         const { text } = req.body;
//         const newEntry = new JournalEntry({ userId: req.user.id, text });

//         // Auto-analyze the entry
//         try {
//             const analysis = await analyzeText(text);
//             console.log("analysis", analysis);

//             // Extract dominant emotion (highest score)
//             if (Array.isArray(analysis.mood) && analysis.mood.length > 0) {
//                 const dominant = analysis.mood.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), analysis.mood[0]);
//                 newEntry.dominantEmotion = dominant.label;  // Store only the label (string)
//             } else {
//                 newEntry.dominantEmotion = "unknown";  // Default if no emotions detected
//             }

//             newEntry.emotionScores = analysis.mood; // Store full emotion analysis
//             console.log('new entry',newEntry)
//         } catch (analysisError) {
//             console.error("Failed to analyze entry:", analysisError);
//             newEntry.dominantEmotion = "error"; // Handle error case
//             newEntry.emotionScores = [];
//         }

//         await newEntry.save();
//         res.status(201).json({ message: "Journal entry saved successfully.", entry: newEntry });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// TRIAL (SOS)
exports.addJournalEntry = async (req, res) => {
    try {
        const { text } = req.body;
        const newEntry = new JournalEntry({ userId: req.user.id, text });

        // Auto-analyze the entry
        try {
            const analysis = await analyzeText(text);
            console.log("analysis", analysis);

            // Extract dominant emotion (highest score)
            if (Array.isArray(analysis.mood) && analysis.mood.length > 0) {
                const dominant = analysis.mood.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), analysis.mood[0]);
                newEntry.dominantEmotion = dominant.label;  // Store only the label (string)
            } else {
                newEntry.dominantEmotion = "unknown";  // Default if no emotions detected
            }

            newEntry.emotionScores = analysis.mood; // Store full emotion analysis
            
            // Check for crisis indicators
            if (analysis.crisis_assessment && analysis.crisis_assessment.crisis_detected) {
                newEntry.crisisDetected = true;
                newEntry.crisisLevel = analysis.crisis_assessment.emergency_level;
                newEntry.crisisIndicators = analysis.crisis_assessment.indicators_found;
                
                // Handle emergency situation if detected
                if (analysis.crisis_assessment.emergency_level === "high" || 
                    analysis.crisis_assessment.emergency_level === "moderate") {
                    await handleEmergencyAlert(req.user.id, analysis.crisis_assessment);
                }
            } else {
                newEntry.crisisDetected = false;
            }
            
            console.log('new entry', newEntry);
        } catch (analysisError) {
            console.error("Failed to analyze entry:", analysisError);
            newEntry.dominantEmotion = "error"; // Handle error case
            newEntry.emotionScores = [];
        }

        await newEntry.save();
        
        // Prepare response with appropriate message
        let responseMessage = "Journal entry saved successfully.";
        let alertInfo = null;
        
        if (newEntry.crisisDetected) {
            if (newEntry.crisisLevel === "high") {
                responseMessage = "We've noticed concerning content in your entry. ";
                
                // Check if emergency contact was notified
                const contactNotified = await checkEmergencyContactStatus(req.user.id);
                if (contactNotified) {
                    responseMessage += "Your emergency contact has been notified. ";
                } else {
                    responseMessage += "Please consider reaching out to a trusted person or using the crisis resources below. ";
                }
                
                responseMessage += "Help is available.";
                
                alertInfo = {
                    level: "emergency",
                    contactNotified: contactNotified,
                    resources: [
                        { name: "National Suicide Prevention Lifeline", contact: "988" },
                        { name: "Crisis Text Line", contact: "Text HOME to 741741" }
                    ]
                };
            } else if (newEntry.crisisLevel === "moderate") {
                responseMessage = "We've noticed some concerning patterns in your writing. ";
                
                const contactNotified = await checkEmergencyContactStatus(req.user.id);
                if (contactNotified) {
                    responseMessage += "Your emergency contact has been alerted as a precaution.";
                } else {
                    responseMessage += "Please consider talking to someone you trust about how you're feeling.";
                }
                
                alertInfo = {
                    level: "warning",
                    contactNotified: contactNotified,
                    resources: [
                        { name: "National Suicide Prevention Lifeline", contact: "988" },
                        { name: "Crisis Text Line", contact: "Text HOME to 741741" }
                    ]
                };
            } else {
                responseMessage = "Your journal has been saved. We've noticed some challenging emotions in your entry.";
                alertInfo = {
                    level: "concern",
                    resources: [
                        { name: "National Suicide Prevention Lifeline", contact: "988" }
                    ]
                };
            }
        }
        
        res.status(201).json({ 
            message: responseMessage, 
            entry: newEntry,
            alert: alertInfo
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Check if user has emergency contacts set up
 */
async function checkEmergencyContactStatus(userId) {
    try {
        const user = await User.findById(userId).select('emergencyContacts');
        return user && user.emergencyContacts && user.emergencyContacts.length > 0;
    } catch (error) {
        console.error("Failed to check emergency contacts:", error);
        return false;
    }
}

/**
 * Handle emergency alerts by notifying emergency contacts
 */
async function handleEmergencyAlert(userId, crisisData) {
    try {
        // Fetch user data including emergency contacts
                const user = await User.findById(userId).select('name emergencyContacts');
        
        if (!user || !user.emergencyContacts || user.emergencyContacts.length === 0) {
            console.warn("No emergency contacts found for user. Crisis alert not sent.");
            
            // Log the alert even without sending
            await new EmergencyAlert({
                userId,
                contactName: "No contact available",
                contactPhone: "N/A",
                crisisLevel: crisisData.emergency_level,
                indicators: crisisData.indicators_found,
                timestamp: new Date(),
                notificationSent: false
            }).save();
            
            return false;
        }
        
        // Get primary emergency contact (first in the list)
        const contact = user.emergencyContacts[0];
        
        // Check if Twilio is configured
        if (!twilioClient) {
            console.warn("Twilio client not configured. Alert not sent to contact.");
            
            // Log the alert
            await new EmergencyAlert({
                userId,
                contactName: contact.name,
                contactPhone: contact.phone,
                crisisLevel: crisisData.emergency_level,
                indicators: crisisData.indicators_found,
                timestamp: new Date(),
                notificationSent: false
            }).save();
            
            return false;
        }
        
        // Prepare message for SMS
        const smsMessage = `ALERT: ${user.name} has written a journal entry that indicates they may be experiencing a mental health crisis. Please check on them as soon as possible.`;
        
        // Send SMS via Twilio
        await twilioClient.messages.create({
            body: smsMessage,
            to: contact.phone,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        
        console.log(`Emergency SMS alert sent to ${contact.name} (${contact.phone})`);
        
        // Create a TwiML response for the call
        // VoiceResponse needs to be imported separately at the top of your file
        const twiml = new VoiceResponse();
        twiml.say(`This is an emergency alert regarding ${user.name}. Our system has detected concerning content in their recent journal entry that may indicate they are experiencing a mental health crisis. Please check on them as soon as possible.`);
        
        // Make a phone call using Twilio
        await twilioClient.calls.create({
            twiml: twiml.toString(),
            to: contact.phone,
            from: process.env.TWILIO_PHONE_NUMBER
        });
        
        console.log(`Emergency phone call made to ${contact.name} (${contact.phone})`);
        
        // Log the alert with both SMS and call notification
        await new EmergencyAlert({
            userId,
            contactName: contact.name,
            contactPhone: contact.phone,
            crisisLevel: crisisData.emergency_level,
            indicators: crisisData.indicators_found,
            timestamp: new Date(),
            notificationSent: true,
            notificationMethods: ['sms', 'call']
        }).save();
        
        return true;
        
    } catch (error) {
        console.error("Failed to send emergency alert:", error);
        return false;
    }
}


/* Get AI-generated support content for a specific journal entry
*/
exports.getPersonalizedSupport = async (req, res) => {
   try {
       const journalId = req.params.journalId;
       const userId = req.user.id;
       
       // Fetch the journal entry
       const journalEntry = await JournalEntry.findOne({ _id: journalId, userId });
       
       if (!journalEntry) {
           return res.status(404).json({ error: "Journal entry not found" });
       }
       
       // Get additional user context if available
       const user = await User.findById(userId).select('name age gender interests pastJournalThemes');
       
       // Generate personalized support using OpenAI
       const supportContent = await generateAISupport(journalEntry, user);
       
       res.status(200).json({
           supportContent
       });
       
   } catch (error) {
       console.error("Error getting personalized support:", error);
       res.status(500).json({ error: "Failed to generate personalized support" });
   }
};

/**
* Generate AI support content using OpenAI
*/
async function generateAISupport(journalEntry, user) {
   try {
       // Extract relevant information
       const { text, dominantEmotion, crisisLevel, crisisIndicators } = journalEntry;
       console.log("journal entry in ai support", journalEntry)
       
       // Build context for the AI
    //    const userContext = user ? 
    //        `The user is ${user.name}, ${user.age || 'unknown age'}, ${user.gender || 'unknown gender'}.` : 
    //        'Limited user profile information is available.';
           
       // Create prompt for OpenAI
       const prompt = `
You are a compassionate mental health support system speaking directly to someone in distress. 
The user has written the following journal entry that our system has flagged as concerning:

"${text}"

Context:
- Dominant emotion detected: ${dominantEmotion || 'unknown'}
- Crisis level: ${crisisLevel || 'unknown'}
- Crisis indicators: ${crisisIndicators ? crisisIndicators.join(', ') : 'none specified'}

Please provide a compassionate, supportive response that:
1. Acknowledges their feelings with empathy and without judgment
2. Offers 3-5 specific, personalized coping strategies tailored to their situation
3. Provides a simple step-by-step exercise they can do right now to help regulate their emotions
4. Gently encourages professional help if appropriate
5. Ends with words of hope and support

Format your response in HTML with appropriate headers, paragraphs, and bullet points for readability.
Keep your tone warm and human, avoiding clinical language.
`;

       // Call OpenAI API
       const completion = await openai.chat.completions.create({
           model: "gpt-4-turbo", // Use the appropriate model
           messages: [
               { role: "system", content: "You are a compassionate mental health support assistant. Your purpose is to provide emotional support and practical coping strategies to someone in distress." },
               { role: "user", content: prompt }
           ],
           temperature: 0.7,
       });
       
       // Get the generated content
       const supportContent = completion.choices[0].message.content;
       
       // Log the support for auditing purposes (consider privacy implications)
       console.log("Generated support content for journal:", journalEntry._id);
       
       return supportContent;
       
   } catch (error) {
       console.error("Error generating AI support:", error);
       return `<p>We're experiencing technical difficulties generating personalized support content. Please try again later.</p>
               <p>Remember that support is available through the crisis resources listed above.</p>`;
   }
}


exports.analyzeJournals = async (req, res) => {
    const inputText = req.body.text;
    console.log("Input text:", inputText);

    if (!inputText) {
        return res.status(400).json({ error: "Text input is required" });
    }

    // Spawn Python process
    const pythonProcess = spawn('python', [path.join(__dirname, '../../ml_model/mood_analysis.py')]);

    let result = "";
    let errorResult = "";

    // Send JSON input to Python
    try {
        pythonProcess.stdin.write(JSON.stringify({ text: inputText }));
        pythonProcess.stdin.end();
    } catch (writeError) {
        console.error("Error writing to Python process:", writeError);
        return res.status(500).json({ error: "Failed to send input to Python script" });
    }

    // Collect stdout data
    pythonProcess.stdout.on("data", (data) => {
        result += data.toString();
    });

    // Collect stderr data (errors)
    pythonProcess.stderr.on("data", (data) => {
        errorResult += data.toString();
    });

    // Handle process exit
    pythonProcess.on("close", (code) => {
        // Log exit information for debugging
        console.log(`Python process exited with code ${code}`);
        console.log("Result:", result);

        // If result exists, prioritize parsing the result
        if (result) {
            try {
                // Trim and parse the JSON response
                const cleanResult = result.trim();
                const jsonResponse = JSON.parse(cleanResult);
                
                // Validate the response structure
                if (!jsonResponse.mood) {
                    return res.status(500).json({ error: "Invalid response format" });
                }

                return res.json(jsonResponse);
            } catch (err) {
                console.error("JSON parsing error:", err);
                return res.status(500).json({ 
                    error: "Invalid JSON response from Python",
                    rawResult: result
                });
            }
        }

        // If no result, check for error
        if (errorResult) {
            console.warn("Stderr output:", errorResult);
            return res.status(500).json({ 
                error: "Python script generated warnings",
                details: errorResult.trim()
            });
        }

        // Fallback error response
        res.status(500).json({ 
            error: "Unknown error occurred in mood analysis",
            code: code 
        });
    });

    // Handle any process errors
    pythonProcess.on("error", (err) => {
        console.error("Python process error:", err);
        res.status(500).json({ error: "Failed to spawn Python process" });
    });
};


// WORKING(Before SOS)
// Utility function to analyze text using Python script
// const analyzeText = async (text) => {
//     return new Promise((resolve, reject) => {
//         const pythonProcess = spawn('python', [path.join(__dirname, '../../ml_model/mood_analysis.py')]);
        
//         let result = "";
//         let errorResult = "";

//         // Send JSON input to Python
//         try {
//             pythonProcess.stdin.write(JSON.stringify({ text }));
//             pythonProcess.stdin.end();
//         } catch (writeError) {
//             reject(writeError);
//             return;
//         }

//         // Collect stdout data
//         pythonProcess.stdout.on("data", (data) => {
//             result += data.toString();
//         });

//         // Collect stderr data (errors)
//         pythonProcess.stderr.on("data", (data) => {
//             errorResult += data.toString();
//         });

//         // Handle process exit
//         pythonProcess.on("close", (code) => {
//             if (code !== 0) {
//                 reject(new Error(`Python process exited with code ${code}: ${errorResult}`));
//                 return;
//             }

//             try {
//                 const cleanResult = result.trim();
//                 const jsonResponse = JSON.parse(cleanResult);
//                 resolve(jsonResponse);
//             } catch (err) {
//                 reject(err);
//             }
//         });

//         pythonProcess.on("error", reject);
//     });
// };

const analyzeText = async (text) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, '../../ml_model/mood_analysis.py')]);
        
        let result = "";
        let errorResult = "";

        // Send JSON input to Python
        try {
            pythonProcess.stdin.write(JSON.stringify({ text }));
            pythonProcess.stdin.end();
        } catch (writeError) {
            reject(writeError);
            return;
        }

        // Collect stdout data
        pythonProcess.stdout.on("data", (data) => {
            result += data.toString();
        });

        // Collect stderr data (errors)
        pythonProcess.stderr.on("data", (data) => {
            errorResult += data.toString();
        });

        // Handle process exit
        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorResult}`));
                return;
            }

            try {
                const cleanResult = result.trim();
                const jsonResponse = JSON.parse(cleanResult);
                resolve(jsonResponse);
            } catch (err) {
                reject(err);
            }
        });

        pythonProcess.on("error", reject);
    });
};


// Get previous analysis results
exports.getAnalysisHistory = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const analysisHistory = await AnalysisResult.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-rawData'); // Exclude the raw data to keep response size down
            
        res.json(analysisHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getProgressAnalysis = async (req, res) => {
    try {
        const { entries = 5 } = req.query; // Default to last 5 entries
        const limit = parseInt(entries);
        
        // Get the user's recent journal entries
        const recentEntries = await JournalEntry.find({ userId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(limit);
            
        if (recentEntries.length === 0) {
            return res.status(404).json({ message: 'No journal entries found for analysis' });
        }
        
        // Get timeframe boundaries for these entries
        const startTime = new Date(Math.min(...recentEntries.map(e => new Date(e.timestamp).getTime())));
        const endTime = new Date(Math.max(...recentEntries.map(e => new Date(e.timestamp).getTime())));
        
        // Check if we already have an analysis for exactly these entries
        // Using timeframe and entry count as a fingerprint
        const existingAnalysis = await AnalysisResult.findOne({
            userId: req.user.id,
            'timeframe.start': startTime,
            'timeframe.end': endTime,
            entriesAnalyzed: recentEntries.length
        }).sort({ createdAt: -1 });
        
        // If we have an existing analysis for exactly this set of entries, return it
        if (existingAnalysis) {
            return res.json({
                analysisId: existingAnalysis._id,
                timeframe: existingAnalysis.timeframe,
                entriesAnalyzed: existingAnalysis.entriesAnalyzed,
                trends: existingAnalysis.trends,
                insights: existingAnalysis.insights,
                isExisting: true // Flag to indicate this is a cached result
            });
        }
        
        // Check if we have enough analyzed entries or need to analyze them now
        const unanalyzedEntries = recentEntries.filter(entry => !entry.dominantEmotion);
        
        // Analyze any entries that don't have emotion data
        for (const entry of unanalyzedEntries) {
            try {
                const analysis = await analyzeText(entry.text);
                entry.dominantEmotion = analysis.mood;
                entry.emotionScores = analysis.scores;
                await entry.save();
            } catch (error) {
                console.error(`Failed to analyze entry ${entry._id}:`, error);
            }
        }
        
        // Prepare data for time series analysis
        const timeSeriesData = recentEntries.map(entry => ({
            date: entry.timestamp,
            dominantEmotion: entry.dominantEmotion,
            emotionScores: entry.emotionScores,
            text: entry.text
        })).reverse(); // Chronological order
        
        // Perform basic trend analysis
        const trends = analyzeTrends(timeSeriesData);
        
        // Get deeper insights using OpenAI if available
        let insights = {};
        try {
            insights = await generateAIInsights(timeSeriesData);
        } catch (error) {
            console.error("Failed to generate AI insights:", error);
            insights = { error: "Could not generate AI insights", basic: trends };
        }
        
        // Save the analysis result
        const analysisResult = new AnalysisResult({
            userId: req.user.id,
            timeframe: {
                start: startTime,
                end: endTime
            },
            entriesAnalyzed: timeSeriesData.length,
            trends,
            insights,
            rawData: timeSeriesData
        });
        
        await analysisResult.save();
        
        // Return the analysis with a cleaner structure
        res.json({
            analysisId: analysisResult._id,
            timeframe: {
                start: startTime,
                end: endTime
            },
            entriesAnalyzed: timeSeriesData.length,
            trends,
            insights
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modified compare function to ensure we're comparing different sets of entries
exports.compareWithPrevious = async (req, res) => {
    try {
        // Get the most recent analysis
        const currentAnalysis = await AnalysisResult.findOne({ userId: req.user.id })
            .sort({ createdAt: -1 });
            
        if (!currentAnalysis) {
            return res.status(404).json({ message: 'No recent analysis found' });
        }
        
        // Find a previous analysis with different timestamps
        // This ensures we're comparing different sets of entries
        const previousAnalysis = await AnalysisResult.findOne({ 
            userId: req.user.id,
            _id: { $ne: currentAnalysis._id },
            // At least one of start or end time should be different to ensure different analysis periods
            $or: [
                { 'timeframe.start': { $ne: currentAnalysis.timeframe.start } },
                { 'timeframe.end': { $ne: currentAnalysis.timeframe.end } }
            ]
        }).sort({ createdAt: -1 });
        
        if (!previousAnalysis) {
            return res.status(404).json({ message: 'No previous analysis with different timeframe found' });
        }
        
        console.log('Comparing analyses:');
        console.log('Current:', {
            id: currentAnalysis._id,
            timeframe: currentAnalysis.timeframe
        });
        console.log('Previous:', {
            id: previousAnalysis._id,
            timeframe: previousAnalysis.timeframe
        });
        
        // Compare the analyses
        const comparison = compareAnalyses(currentAnalysis, previousAnalysis);
        
        res.json(comparison);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to determine if two sets of entries are meaningfully different
// You can add this to validate comparison is meaningful
function areAnalysesComparable(analysis1, analysis2) {
    // Different number of entries is meaningful
    if (analysis1.entriesAnalyzed !== analysis2.entriesAnalyzed) {
        return true;
    }
    
    // Different timeframes are meaningful
    if (analysis1.timeframe.start.getTime() !== analysis2.timeframe.start.getTime() || 
        analysis1.timeframe.end.getTime() !== analysis2.timeframe.end.getTime()) {
        return true;
    }
    
    // Check for at least X days difference between analyses
    const minDaysDiff = 1; // Require at least 1 day difference
    const daysDiff = Math.abs(
        (new Date(analysis1.createdAt).getTime() - new Date(analysis2.createdAt).getTime()) / 
        (1000 * 60 * 60 * 24)
    );
    
    return daysDiff >= minDaysDiff;
}

// Utility function to get time difference in a readable format
function getTimeDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
        days: diffDays,
        text: diffDays === 1 ? '1 day' : `${diffDays} days`
    };
}

// Your existing compareAnalyses function remains unchanged
function compareAnalyses(currentAnalysis, previousAnalysis) {
    const changes = {
        timeDifference: getTimeDifference(currentAnalysis.timeframe.end, previousAnalysis.timeframe.end),
        emotionalShift: {},
        overallChange: 'stable'
    };
    
    // Compare dominant emotions
    if (currentAnalysis.trends.dominantEmotion !== previousAnalysis.trends.dominantEmotion) {
        changes.emotionalShift.dominantEmotion = {
            from: previousAnalysis.trends.dominantEmotion,
            to: currentAnalysis.trends.dominantEmotion
        };
    }
    
    // Compare overall trends
    if (currentAnalysis.trends.overallTrend !== previousAnalysis.trends.overallTrend) {
        changes.emotionalShift.overallTrend = {
            from: previousAnalysis.trends.overallTrend,
            to: currentAnalysis.trends.overallTrend
        };
    }
    
    // Compare scores for common emotions
    const currentScores = currentAnalysis.trends.scoreTrends || {};
    const previousScores = previousAnalysis.trends.scoreTrends || {};
    const sharedEmotions = new Set([
        ...Object.keys(currentScores),
        ...Object.keys(previousScores)
    ]);
    
    changes.emotionalShift.emotions = {};
    
    sharedEmotions.forEach(emotion => {
        const current = currentScores[emotion]?.end || 0;
        const previous = previousScores[emotion]?.end || 0;
        
        if (current !== previous) {
            const change = current - previous;
            changes.emotionalShift.emotions[emotion] = {
                change,
                trend: change > 0 ? 'increased' : 'decreased',
                previousValue: previous,
                currentValue: current
            };
        }
    });
    
    // Calculate overall change - Updated with broader emotion categories and improved logic
    const positiveEmotions = ['happy', 'joy', 'excited', 'content', 'optimistic', 'love'];
    const negativeEmotions = ['sad', 'sadness', 'angry', 'anger', 'anxious', 'stressed', 'fear', 'depressed', 'surprise'];
    
    // New approach: calculate net emotional health change
    let emotionalHealth = 0;
    
    Object.entries(changes.emotionalShift.emotions || {}).forEach(([emotion, data]) => {
        if (positiveEmotions.includes(emotion.toLowerCase())) {
            emotionalHealth += data.change;
        } else if (negativeEmotions.includes(emotion.toLowerCase())) {
            emotionalHealth -= data.change;
        }
    });
    
    // Determine overall change based on the magnitude of emotional health change
    if (emotionalHealth > 0.5) {
        changes.overallChange = 'improving';
    } else if (emotionalHealth < -0.5) {
        changes.overallChange = 'declining'; // Changed from 'worsening' to match your UI terminology
    } else if (emotionalHealth > 0.1) {
        changes.overallChange = 'slightly improving';
    } else if (emotionalHealth < -0.1) {
        changes.overallChange = 'slightly declining'; // Changed from 'slightly worsening'
    }
    // If emotionalHealth is between -0.1 and 0.1, keep the default 'stable'
    
    return {
        previous: {
            id: previousAnalysis._id,
            timeframe: previousAnalysis.timeframe,
            dominantEmotion: previousAnalysis.trends.dominantEmotion,
            overallTrend: previousAnalysis.trends.overallTrend
        },
        current: {
            id: currentAnalysis._id,
            timeframe: currentAnalysis.timeframe,
            dominantEmotion: currentAnalysis.trends.dominantEmotion,
            overallTrend: currentAnalysis.trends.overallTrend
        },
        changes
    };
}

// Revised analyzeTrends function
function analyzeTrends(timeSeriesData) {
    // Skip if no data
    if (!timeSeriesData.length) return {};
    
    // Count emotions
    const emotionCounts = {};
    timeSeriesData.forEach(entry => {
        if (entry.dominantEmotion) {
            emotionCounts[entry.dominantEmotion] = (emotionCounts[entry.dominantEmotion] || 0) + 1;
        }
    });
    
    // Find most frequent emotion
    let mostFrequentEmotion = null;
    let highestCount = 0;
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > highestCount) {
            mostFrequentEmotion = emotion;
            highestCount = count;
        }
    });
    
    // Track emotion changes over time
    const emotionChanges = [];
    for (let i = 1; i < timeSeriesData.length; i++) {
        const prevEmotion = timeSeriesData[i-1].dominantEmotion;
        const currEmotion = timeSeriesData[i].dominantEmotion;
        
        if (prevEmotion && currEmotion && prevEmotion !== currEmotion) {
            emotionChanges.push({
                from: prevEmotion,
                to: currEmotion,
                date: timeSeriesData[i].date
            });
        }
    }
    
    // Calculate emotion score trends if available
    const scoreTrends = {};
    
    // First, identify all unique emotion labels across all entries
    const allEmotions = new Set();
    timeSeriesData.forEach(entry => {
        if (entry.emotionScores && Array.isArray(entry.emotionScores)) {
            entry.emotionScores.forEach(emotion => {
                if (emotion.label) {
                    allEmotions.add(emotion.label);
                }
            });
        }
    });
    
    // For each unique emotion, track its trend over time
    allEmotions.forEach(emotionLabel => {
        // Get scores for this emotion from each entry
        const emotionData = [];
        
        timeSeriesData.forEach(entry => {
            if (entry.emotionScores && Array.isArray(entry.emotionScores)) {
                const emotionScore = entry.emotionScores.find(e => e.label === emotionLabel);
                if (emotionScore) {
                    emotionData.push({
                        date: entry.date,
                        score: emotionScore.score
                    });
                }
            }
        });
        
        // Calculate trend if we have enough data points
        if (emotionData.length >= 2) {
            const firstScore = emotionData[0].score;
            const lastScore = emotionData[emotionData.length - 1].score;
            const change = lastScore - firstScore;
            
            scoreTrends[emotionLabel] = {
                start: firstScore,
                end: lastScore,
                change: change,
                trend: change > 0.05 ? 'increasing' : 
                       change < -0.05 ? 'decreasing' : 'stable'
            };
        }
    });
    
    // Overall emotional trajectory
    let overallTrend = 'stable';
    
    // Simplistic approach: look at positive vs negative emotions
    const positiveEmotions = ['happy', 'joy', 'excited', 'content', 'optimistic', 'love'];
    const negativeEmotions = ['sad', 'sadness', 'angry', 'anger', 'anxious', 'stressed', 'fear', 'depressed'];
    
    // Extract positive and negative emotion scores for each entry
    const emotionalTrajectory = timeSeriesData.map(entry => {
        if (!entry.emotionScores || !Array.isArray(entry.emotionScores)) return { positive: 0, negative: 0 };
        
        const positiveScore = entry.emotionScores
            .filter(e => positiveEmotions.includes(e.label))
            .reduce((sum, emotion) => sum + emotion.score, 0);
            
        const negativeScore = entry.emotionScores
            .filter(e => negativeEmotions.includes(e.label))
            .reduce((sum, emotion) => sum + emotion.score, 0);
            
        return { positive: positiveScore, negative: negativeScore };
    });
    
    // Calculate overall trend if we have enough data
    if (emotionalTrajectory.length >= 2) {
        const firstEntry = emotionalTrajectory[0];
        const lastEntry = emotionalTrajectory[emotionalTrajectory.length - 1];
        
        const positiveChange = lastEntry.positive - firstEntry.positive;
        const negativeChange = lastEntry.negative - firstEntry.negative;
        
        if (positiveChange > 0.1 && negativeChange < -0.1) {
            overallTrend = 'improving';
        } else if (positiveChange < -0.1 && negativeChange > 0.1) {
            overallTrend = 'declining';
        } else if (positiveChange > 0.1) {
            overallTrend = 'slightly improving';
        } else if (negativeChange > 0.1) {
            overallTrend = 'slightly declining';
        }
    }
    
    return {
        dominantEmotion: mostFrequentEmotion,
        emotionCounts,
        emotionChanges,
        scoreTrends,
        overallTrend
    };
}


// function getTimeDifference(date1, date2) {
//     const d1 = new Date(date1);
//     const d2 = new Date(date2);
//     const diffTime = Math.abs(d1 - d2);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     return {
//         days: diffDays,
//         text: diffDays === 1 ? '1 day' : `${diffDays} days`
//     };
// }

async function generateAIInsights(timeSeriesData) {
    // Skip if OpenAI API key is not configured or no data
    if (!process.env.OPENAI_API_KEY || !timeSeriesData.length) {
        return { message: "OpenAI integration not available" };
    }
    
    try {
        // Prepare data for the API request
        const entries = timeSeriesData.map(entry => ({
            date: entry.date,
            dominantEmotion: entry.dominantEmotion,
            emotionScores: entry.emotionScores,
            text: entry.text.substring(0, 300) // Limit text length
        }));
        
        // Call OpenAI API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4", // or another appropriate model
            messages: [
                {
                    role: "system",
                    content: "You are a mental health insights assistant. Analyze the journal entries and emotion data to provide constructive insights about mental health patterns and suggestions for improvement. Be supportive and empathetic. Focus on trends and patterns rather than individual entries. Provide actionable advice when appropriate."
                },
                {
                    role: "user",
                    content: `Here are the recent journal entries and their emotional analysis data. Please analyze this data and provide insights about the mental health trends, patterns, and potential actionable advice: ${JSON.stringify(entries)}`
                }
            ],
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        return {
            source: "OpenAI",
            content: response.data.choices[0].message.content,
            timestamp: new Date()
        };
    } catch (error) {
        console.error("OpenAI API error:", error.response?.data || error.message);
        throw new Error("Failed to generate AI insights");
    }
}