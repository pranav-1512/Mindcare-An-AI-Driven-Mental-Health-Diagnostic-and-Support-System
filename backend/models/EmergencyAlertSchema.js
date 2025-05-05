const mongoose = require('mongoose');

const EmergencyAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    crisisLevel: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        required: true
    },
    indicators: {
        type: [String],
        default: []
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    resolved: {
        type: Boolean,
        default: false
    }
});

const EmergencyAlert = mongoose.model('EmergencyAlert', EmergencyAlertSchema);

module.exports = EmergencyAlert;