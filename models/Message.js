const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: [true, 'Please specify message direction']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide the phone number'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    trim: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  attachments: [
    {
      type: String, // URL or path to attachment
      trim: true
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
MessageSchema.index({ user: 1, timestamp: -1 });
MessageSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model('Message', MessageSchema); 