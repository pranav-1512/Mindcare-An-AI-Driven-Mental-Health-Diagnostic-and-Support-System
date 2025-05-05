// models/AnalysisResult.js

const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    timeframe: {
        start: { type: Date },
        end: { type: Date }
    },
    entriesAnalyzed: { 
        type: Number, 
        required: true 
    },
    trends: {
        dominantEmotion: { type: String },
        emotionCounts: { type: Object },
        emotionChanges: [{ 
            from: String,
            to: String,
            date: Date
        }],
        scoreTrends: { type: Object },
        overallTrend: { 
            type: String,
            enum: ['improving', 'declining', 'stable']
        }
    },
    insights: {
        source: { type: String },
        content: { type: String },
        timestamp: { type: Date },
        error: { type: String }
    },
    rawData: [{
        date: Date,
        dominantEmotion: String,
        emotionScores: Object,
        text: String
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);