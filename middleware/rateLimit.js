const rateLimit = require('express-rate-limit');

// Rate limit for authentication routes
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many login attempts from this IP, please try again after 15 minutes'
  }
});

// Rate limit for API routes
exports.apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 10 minutes'
  }
});