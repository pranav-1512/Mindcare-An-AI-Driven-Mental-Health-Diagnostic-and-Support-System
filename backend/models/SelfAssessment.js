const mongoose = require('mongoose');

const SelfAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [Number], required: true },  // User quiz responses
  prediction: { type: String, required: true }, // AI-generated result
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SelfAssessment', SelfAssessmentSchema);
