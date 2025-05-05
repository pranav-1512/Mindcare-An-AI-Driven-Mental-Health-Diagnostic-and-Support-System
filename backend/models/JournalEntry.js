// const mongoose = require('mongoose');

// const JournalEntrySchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     text: { type: String, required: true },
//     timestamp: { type: Date, default: Date.now },
//     dominantEmotion: { type: String },
//     emotionScores: { type: Object }
// });

// module.exports = mongoose.model('JournalEntry', JournalEntrySchema);


const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    dominantEmotion: { type: String },
    emotionScores: { type: Object },
    // Add new fields for crisis detection
    crisisDetected: { type: Boolean, default: false },
    crisisLevel: { type: String, enum: ['low', 'moderate', 'high', null], default: null },
    crisisIndicators: { type: [String], default: [] }
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);