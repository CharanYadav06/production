const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @desc    Check MongoDB connection health
 * @route   GET /api/v1/health
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection state
    const dbState = mongoose.connection.readyState;
    
    // Connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const status = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Get connection details
    const dbInfo = {
      state: status[dbState],
      connected: dbState === 1,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      // Remove sensitive info from response
      atlas: mongoose.connection.host.includes('mongodb.net'),
      timestamp: new Date()
    };
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        mongodb: dbInfo
      }
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({
      success: false,
      error: 'Database connection error'
    });
  }
});

module.exports = router; 