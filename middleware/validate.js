const { validationResult, check } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Process validation results
exports.processValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

// User Registration Validation Rules
exports.registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Phone number is required').not().isEmpty(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
];

// User Login Validation Rules
exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Call Validation Rules
exports.callValidation = [
  check('phoneNumber', 'Phone number is required').not().isEmpty(),
  check('direction', 'Direction must be either incoming or outgoing').isIn(['incoming', 'outgoing']),
  check('status', 'Status must be either answered, declined, or missed').isIn(['answered', 'declined', 'missed']),
  check('duration', 'Duration must be a number').optional().isNumeric(),
  check('startTime', 'Start time is required').optional().isISO8601()
];

// Message Validation Rules
exports.messageValidation = [
  check('phoneNumber', 'Phone number is required').not().isEmpty(),
  check('direction', 'Direction must be either incoming or outgoing').isIn(['incoming', 'outgoing']),
  check('content', 'Message content is required').not().isEmpty(),
  check('status', 'Status must be valid').optional().isIn(['sent', 'delivered', 'read', 'failed'])
];