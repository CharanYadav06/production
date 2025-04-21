const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { 
  registerValidation, 
  loginValidation,
  processValidationErrors 
} = require('../middleware/validate');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post(
  '/register', 
  authLimiter, 
  registerValidation,
  processValidationErrors,
  register
);

router.post(
  '/login', 
  authLimiter, 
  loginValidation,
  processValidationErrors,
  login
);

router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;