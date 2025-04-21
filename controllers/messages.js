const Message = require('../models/Message');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all messages for a user
// @route     GET /api/v1/messages
// @access    Private
exports.getMessages = asyncHandler(async (req, res, next) => {
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
  let query = Message.find(JSON.parse(queryStr));

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
    query = query.sort('-timestamp');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Message.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const messages = await query;

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
    count: messages.length,
    pagination,
    data: messages
  });
});

// @desc      Get single message
// @route     GET /api/v1/messages/:id
// @access    Private
exports.getMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Message not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the message
  if (message.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this message`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc      Create new message
// @route     POST /api/v1/messages
// @access    Private
exports.createMessage = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const message = await Message.create(req.body);

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc      Update message
// @route     PUT /api/v1/messages/:id
// @access    Private
exports.updateMessage = asyncHandler(async (req, res, next) => {
  let message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Message not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the message
  if (message.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this message`,
        401
      )
    );
  }

  message = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc      Delete message
// @route     DELETE /api/v1/messages/:id
// @access    Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Message not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the message
  if (message.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this message`,
        401
      )
    );
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Sync messages
 * @route   POST /api/v1/messages/sync
 * @access  Private
 */
exports.syncMessages = async (req, res, next) => {
  try {
    const messages = req.body;
    
    // Keep track of added/updated messages
    const results = {
      added: 0,
      updated: 0,
      total: messages.length
    };
    
    // Process each message
    for (const message of messages) {
      // Check if message exists by ID
      const existingMessage = await Message.findOne({ id: message.id });
      
      if (existingMessage) {
        // Update existing message
        await Message.findByIdAndUpdate(existingMessage._id, message, {
          new: true,
          runValidators: true
        });
        results.updated++;
      } else {
        // Create new message
        await Message.create({
          ...message,
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
    console.error('Sync messages error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Test message data storage in MongoDB
 * @route   GET /api/v1/messages/test
 * @access  Private
 */
exports.testMessageStorage = async (req, res, next) => {
  try {
    // Get counts
    const totalCount = await Message.countDocuments();
    const userMessageCount = await Message.countDocuments({ user: req.user.id });
    
    // Get latest 5 messages for this user
    const recentMessages = await Message.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);
    
    // Get stats by message direction
    const incomingCount = await Message.countDocuments({ 
      user: req.user.id,
      direction: 'incoming'
    });
    
    const outgoingCount = await Message.countDocuments({ 
      user: req.user.id,
      direction: 'outgoing'
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalMessagesInDB: totalCount,
        userMessageCount,
        incomingCount,
        outgoingCount,
        recentMessages,
        timestamp: new Date(),
        message: 'MongoDB connection and message data retrieval successful'
      }
    });
  } catch (err) {
    console.error('Test message storage error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 