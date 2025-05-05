const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phq9Responses: { type: [Number], required: true },
    gad7Responses: { type: [Number], required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    depressionSeverity: { type: String, required: true },
    anxietySeverity: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Assessment", AssessmentSchema);
