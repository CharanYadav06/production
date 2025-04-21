const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Initialize Socket.IO
const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*', // In production, restrict to your allowed domains
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Join a personal room for targeted messages
    socket.join(`user:${socket.user._id}`);

    // Handle new call
    socket.on('new_call', (call) => {
      // Emit to current user's room
      io.to(`user:${socket.user._id}`).emit('call_update', call);
    });

    // Handle call status update
    socket.on('update_call', (call) => {
      // Emit to current user's room
      io.to(`user:${socket.user._id}`).emit('call_update', call);
    });

    // Handle new message
    socket.on('new_message', (message) => {
      // Emit to current user's room
      io.to(`user:${socket.user._id}`).emit('message_update', message);
    });

    // Handle message status update
    socket.on('update_message', (message) => {
      // Emit to current user's room
      io.to(`user:${socket.user._id}`).emit('message_update', message);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
    });
  });

  return io;
};

module.exports = { initSocket }; 