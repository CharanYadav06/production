const express = require('express');
const {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  syncMessages,
  testMessageStorage
} = require('../controllers/messages');
const {
  messageValidation, 
  processValidationErrors
} = require('../middleware/validate');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getMessages)
  .post(
    protect, 
    messageValidation,
    processValidationErrors,
    createMessage
  );

router
  .route('/:id')
  .get(protect, getMessage)
  .put(
    protect, 
    messageValidation,
    processValidationErrors,
    updateMessage
  )
  .delete(protect, deleteMessage);

router.post('/sync', protect, syncMessages);

// Test endpoint for MongoDB verification
router.get('/test', protect, testMessageStorage);

module.exports = router; 