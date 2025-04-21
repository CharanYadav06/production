const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Call = require('../models/Call');
const Message = require('../models/Message');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '1234567890',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0987654321',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1122334455',
    password: 'password123',
    role: 'user'
  }
];

// Create sample data function
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Call.deleteMany();
    await Message.deleteMany();

    console.log('Data cleared...');

    // Create users with hashed passwords
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    const createdUsers = await User.create(hashedUsers);
    console.log('Users created...');

    // Create calls for each user
    const calls = [];
    for (const user of createdUsers) {
      // Generate some calls for this user
      const userCalls = [
        {
          user: user._id,
          phoneNumber: '+1234567890',
          direction: 'incoming',
          status: 'answered',
          duration: 120,
          startTime: new Date(Date.now() - 7200000), // 2 hours ago
          endTime: new Date(Date.now() - 7080000), // 2 hours ago + 2 minutes
          notes: 'Regular check-in call'
        },
        {
          user: user._id,
          phoneNumber: '+9876543210',
          direction: 'outgoing',
          status: 'answered',
          duration: 300,
          startTime: new Date(Date.now() - 3600000), // 1 hour ago
          endTime: new Date(Date.now() - 3300000), // 1 hour ago + 5 minutes
          notes: 'Follow-up call about project'
        },
        {
          user: user._id,
          phoneNumber: '+5556667777',
          direction: 'incoming',
          status: 'missed',
          duration: 0,
          startTime: new Date(Date.now() - 1800000) // 30 minutes ago
        }
      ];
      calls.push(...userCalls);
    }

    await Call.create(calls);
    console.log('Calls created...');

    // Create messages for each user
    const messages = [];
    for (const user of createdUsers) {
      // Generate some messages for this user
      const userMessages = [
        {
          user: user._id,
          direction: 'incoming',
          phoneNumber: '+1234567890',
          content: 'Hey, calling about the meeting tomorrow.',
          status: 'read',
          timestamp: new Date(Date.now() - 7200000) // 2 hours ago
        },
        {
          user: user._id,
          direction: 'outgoing',
          phoneNumber: '+1234567890',
          content: "Yes, I'll be there at 10am. See you then!",
          status: 'delivered',
          timestamp: new Date(Date.now() - 7100000) // 2 hours ago - 1.6 minutes
        },
        {
          user: user._id,
          direction: 'incoming',
          phoneNumber: '+9876543210',
          content: 'Can you send me the project documents?',
          status: 'read',
          timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          user: user._id,
          direction: 'outgoing',
          phoneNumber: '+9876543210',
          content: "Sure, I'll email them to you shortly.",
          status: 'sent',
          timestamp: new Date(Date.now() - 3500000) // 1 hour ago - 1.6 minutes
        }
      ];
      messages.push(...userMessages);
    }

    await Message.create(messages);
    console.log('Messages created...');

    console.log('Sample data imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Call.deleteMany();
    await Message.deleteMany();

    console.log('All data destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Determine action based on command line args
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}