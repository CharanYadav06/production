const Call = require('../models/Call');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all calls for a user
// @route     GET /api/v1/calls
// @access    Private
exports.getCalls = asyncHandler(async (req, res, next) => {
  // Add user filter based on authenticated user
  req.query.user = req.user.id;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Call.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-startTime');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Call.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const calls = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: calls.length,
    pagination,
    data: calls
  });
});

// @desc      Get single call
// @route     GET /api/v1/calls/:id
// @access    Private
exports.getCall = asyncHandler(async (req, res, next) => {
  const call = await Call.findById(req.params.id);

  if (!call) {
    return next(
      new ErrorResponse(`Call not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the call
  if (call.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this call`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: call
  });
});

// @desc      Create new call
// @route     POST /api/v1/calls
// @access    Private
exports.createCall = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const call = await Call.create(req.body);

  res.status(201).json({
    success: true,
    data: call
  });
});

// @desc      Update call
// @route     PUT /api/v1/calls/:id
// @access    Private
exports.updateCall = asyncHandler(async (req, res, next) => {
  let call = await Call.findById(req.params.id);

  if (!call) {
    return next(
      new ErrorResponse(`Call not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the call
  if (call.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this call`,
        401
      )
    );
  }

  call = await Call.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: call
  });
});

// @desc      Delete call
// @route     DELETE /api/v1/calls/:id
// @access    Private
exports.deleteCall = asyncHandler(async (req, res, next) => {
  const call = await Call.findById(req.params.id);

  if (!call) {
    return next(
      new ErrorResponse(`Call not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the call
  if (call.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this call`,
        401
      )
    );
  }

  await call.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Sync call logs
 * @route   POST /api/v1/calls/sync
 * @access  Private
 */
exports.syncCalls = async (req, res, next) => {
  try {
    const calls = req.body;
    
    // Keep track of added/updated calls
    const results = {
      added: 0,
      updated: 0,
      total: calls.length
    };
    
    // Process each call
    for (const call of calls) {
      // Check if call exists by ID
      const existingCall = await Call.findOne({ id: call.id });
      
      if (existingCall) {
        // Update existing call
        await Call.findByIdAndUpdate(existingCall._id, call, {
          new: true,
          runValidators: true
        });
        results.updated++;
      } else {
        // Create new call
        await Call.create({
          ...call,
          user: req.user.id
        });
        results.added++;
      }
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Sync calls error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Test call data storage in MongoDB
 * @route   GET /api/v1/calls/test
 * @access  Private
 */
exports.testCallStorage = async (req, res, next) => {
  try {
    // Get counts
    const totalCount = await Call.countDocuments();
    const userCallCount = await Call.countDocuments({ user: req.user.id });
    
    // Get latest 5 calls for this user
    const recentCalls = await Call.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);
    
    // Get stats by call direction
    const incomingCount = await Call.countDocuments({ 
      user: req.user.id,
      direction: 'incoming'
    });
    
    const outgoingCount = await Call.countDocuments({ 
      user: req.user.id,
      direction: 'outgoing'
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalCallsInDB: totalCount,
        userCallCount,
        incomingCount,
        outgoingCount,
        recentCalls,
        timestamp: new Date(),
        message: 'MongoDB connection and call data retrieval successful'
      }
    });
  } catch (err) {
    console.error('Test call storage error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 