const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide the phone number'],
    trim: true
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: [true, 'Please specify call direction']
  },
  status: {
    type: String,
    enum: ['answered', 'declined', 'missed'],
    required: [true, 'Please specify call status']
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide call start time'],
    default: Date.now
  },
  endTime: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
CallSchema.index({ user: 1, startTime: -1 });
CallSchema.index({ phoneNumber: 1 });
CallSchema.index({ status: 1 });

module.exports = mongoose.model('Call', CallSchema); 