# Call Management Application API

A RESTful API for managing phone calls and SMS messages.

## Features

- User authentication with JWT
- CRUD operations for call logs
- CRUD operations for SMS messages
- Real-time updates using Socket.IO
- Secure API with rate limiting and security headers
- Comprehensive error handling

## Tech Stack

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Socket.IO for real-time communication
- Secure middleware (helmet, cors, rate-limiting)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5010
     MONGODB_URI=mongodb+srv://vrkhcdev:qwerty123@cluster0.m4vh1s0.mongodb.net
     JWT_SECRET=your_jwt_secret_key_change_in_production
     JWT_EXPIRE=30d
     JWT_COOKIE_EXPIRE=30
     NODE_ENV=development
     ```

### Running the Server

Development:
```
npm run dev
```

Production:
```
npm start
```

### Seeding the Database

To seed the database with sample data:
```
npm run seed
```

To remove all data:
```
npm run seed -- -d
```

## API Documentation

### Authentication

#### Register a User
- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Auth required**: No
- **Body**: 
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Body**: 
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
- **URL**: `/api/v1/auth/me`
- **Method**: `GET`
- **Auth required**: Yes (Bearer Token)
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Update User Details
- **URL**: `/api/v1/auth/updatedetails`
- **Method**: `PUT`
- **Auth required**: Yes (Bearer Token)
- **Body**: 
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "9876543210"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "phone": "9876543210",
    "role": "user",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Update Password
- **URL**: `/api/v1/auth/updatepassword`
- **Method**: `PUT`
- **Auth required**: Yes (Bearer Token)
- **Body**: 
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Call Management

#### Get All Calls
- **URL**: `/api/v1/calls`
- **Method**: `GET`
- **Auth required**: Yes (Bearer Token)
- **Query Parameters**: 
  - `select` - Fields to select (comma-separated)
  - `sort` - Fields to sort by (comma-separated)
  - `page` - Page number
  - `limit` - Results per page
  - `status` - Filter by status
  - `direction` - Filter by direction
- **Success Response**: 
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": { "page": 2, "limit": 25 },
    "prev": { "page": 1, "limit": 25 }
  },
  "data": [
    {
      "_id": "5f7c...",
      "user": "5f7c...",
      "phoneNumber": "+1234567890",
      "direction": "incoming",
      "status": "answered",
      "duration": 120,
      "startTime": "2023-05-10T12:00:00.000Z",
      "endTime": "2023-05-10T12:02:00.000Z",
      "notes": "Regular check-in call",
      "createdAt": "2023-05-10T12:00:00.000Z"
    },
    ...
  ]
}
```

#### Get Single Call
- **URL**: `/api/v1/calls/:id`
- **Method**: `GET`
- **Auth required**: Yes (Bearer Token)
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "user": "5f7c...",
    "phoneNumber": "+1234567890",
    "direction": "incoming",
    "status": "answered",
    "duration": 120,
    "startTime": "2023-05-10T12:00:00.000Z",
    "endTime": "2023-05-10T12:02:00.000Z",
    "notes": "Regular check-in call",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Create Call
- **URL**: `/api/v1/calls`
- **Method**: `POST`
- **Auth required**: Yes (Bearer Token)
- **Body**: 
```json
{
  "phoneNumber": "+1234567890",
  "direction": "outgoing",
  "status": "answered",
  "duration": 180,
  "startTime": "2023-05-10T12:00:00.000Z",
  "endTime": "2023-05-10T12:03:00.000Z",
  "notes": "Business call"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "user": "5f7c...",
    "phoneNumber": "+1234567890",
    "direction": "outgoing",
    "status": "answered",
    "duration": 180,
    "startTime": "2023-05-10T12:00:00.000Z",
    "endTime": "2023-05-10T12:03:00.000Z",
    "notes": "Business call",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Update Call
- **URL**: `/api/v1/calls/:id`
- **Method**: `PUT`
- **Auth required**: Yes (Bearer Token)
- **Body**: 
```json
{
  "status": "declined",
  "notes": "Updated notes"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "user": "5f7c...",
    "phoneNumber": "+1234567890",
    "direction": "outgoing",
    "status": "declined",
    "duration": 180,
    "startTime": "2023-05-10T12:00:00.000Z",
    "endTime": "2023-05-10T12:03:00.000Z",
    "notes": "Updated notes",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Delete Call
- **URL**: `/api/v1/calls/:id`
- **Method**: `DELETE`
- **Auth required**: Yes (Bearer Token)
- **Success Response**: 
```json
{
  "success": true,
  "data": {}
}
```

### Message Management

#### Get All Messages
- **URL**: `/api/v1/messages`
- **Method**: `GET`
- **Auth required**: Yes (Bearer Token)
- **Query Parameters**: 
  - `select` - Fields to select (comma-separated)
  - `sort` - Fields to sort by (comma-separated)
  - `page` - Page number
  - `limit` - Results per page
  - `status` - Filter by status
  - `direction` - Filter by direction
- **Success Response**: 
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": { "page": 2, "limit": 25 },
    "prev": { "page": 1, "limit": 25 }
  },
  "data": [
    {
      "_id": "5f7c...",
      "user": "5f7c...",
      "direction": "incoming",
      "phoneNumber": "+1234567890",
      "content": "Hey, calling about the meeting tomorrow.",
      "status": "read",
      "timestamp": "2023-05-10T12:00:00.000Z",
      "createdAt": "2023-05-10T12:00:00.000Z"
    },
    ...
  ]
}
```

#### Get Single Message
- **URL**: `/api/v1/messages/:id`
- **Method**: `GET`
- **Auth required**: Yes (Bearer Token)
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "user": "5f7c...",
    "direction": "incoming",
    "phoneNumber": "+1234567890",
    "content": "Hey, calling about the meeting tomorrow.",
    "status": "read",
    "timestamp": "2023-05-10T12:00:00.000Z",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Create Message
- **URL**: `/api/v1/messages`
- **Method**: `POST`
- **Auth required**: Yes (Bearer Token)
- **Body**: 
```json
{
  "direction": "outgoing",
  "phoneNumber": "+1234567890",
  "content": "This is a new message",
  "status": "sent"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "user": "5f7c...",
    "direction": "outgoing",
    "phoneNumber": "+1234567890",
    "content": "This is a new message",
    "status": "sent",
    "timestamp": "2023-05-10T12:00:00.000Z",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Update Message
- **URL**: `/api/v1/messages/:id`
- **Method**: `PUT`
- **Auth required**: Yes (Bearer Token)
- **Body**: 
```json
{
  "status": "delivered"
}
```
- **Success Response**: 
```json
{
  "success": true,
  "data": {
    "_id": "5f7c...",
    "user": "5f7c...",
    "direction": "outgoing",
    "phoneNumber": "+1234567890",
    "content": "This is a new message",
    "status": "delivered",
    "timestamp": "2023-05-10T12:00:00.000Z",
    "createdAt": "2023-05-10T12:00:00.000Z"
  }
}
```

#### Delete Message
- **URL**: `/api/v1/messages/:id`
- **Method**: `DELETE`
- **Auth required**: Yes (Bearer Token)
- **Success Response**: 
```json
{
  "success": true,
  "data": {}
}
```

## Real-time Updates with Socket.IO

Socket.IO is used to provide real-time updates for calls and messages. Clients need to authenticate before connecting:

```javascript
// Client-side connection example
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

// Listen for call updates
socket.on('call_update', (call) => {
  console.log('Call updated:', call);
});

// Listen for message updates
socket.on('message_update', (message) => {
  console.log('Message updated:', message);
});

// Send a new call event
socket.emit('new_call', callData);

// Send a call update event
socket.emit('update_call', updatedCallData);

// Send a new message event
socket.emit('new_message', messageData);

// Send a message update event
socket.emit('update_message', updatedMessageData);
```

## Security Measures

- JWT authentication for protected routes
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration for API access
- Secure HTTP headers with Helmet
- Input validation and sanitization

## Error Handling

Comprehensive error handling for:
- Invalid MongoDB IDs
- Duplicate fields
- Validation errors
- Authentication errors
- Authorization errors 