const express = require('express');
const {
  getCalls,
  getCall,
  createCall,
  updateCall,
  deleteCall,
  syncCalls,
  testCallStorage
} = require('../controllers/calls');
const {
  callValidation, 
  processValidationErrors
} = require('../middleware/validate');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getCalls)
  .post(
    protect, 
    callValidation,
    processValidationErrors,
    createCall
  );

router
  .route('/:id')
  .get(protect, getCall)
  .put(
    protect, 
    callValidation,
    processValidationErrors,
    updateCall
  )
  .delete(protect, deleteCall);

router.post('/sync', protect, syncCalls);

// Test endpoint for MongoDB verification
router.get('/test', protect, testCallStorage);

module.exports = router; 