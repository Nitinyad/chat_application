const mongoose = require('mongoose');

const scheduledMessageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        scheduledTime: { type: Date, required: true },
        status: { 
            type: String, 
            enum: ['pending', 'sent', 'failed'], 
            default: 'pending' 
        },
        sentAt: { type: Date },
        errorMessage: { type: String }
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying of pending messages
scheduledMessageSchema.index({ scheduledTime: 1, status: 1 });

const ScheduledMessage = mongoose.model("ScheduledMessage", scheduledMessageSchema);

module.exports = ScheduledMessage; 