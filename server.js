const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { initSocket } = require('./utils/socket');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const calls = require('./routes/calls');
const messages = require('./routes/messages');
const health = require('./routes/health');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Apply rate limiting to all routes
app.use(apiLimiter);

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/calls', calls);
app.use('/api/v1/messages', messages);
app.use('/api/v1/health', health);


app.get('/', (req, res) => res.send('Server is running'));

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5010;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 
