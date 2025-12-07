# HMAC Authentication Project

A complete HMAC (Hash-based Message Authentication Code) authentication system implementation in Node.js. This project demonstrates how to secure API endpoints using HMAC signatures, providing a practical example for learning authentication mechanisms.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [How to Run](#how-to-run)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Project Components](#project-components)
- [Security Features](#security-features)
- [Testing](#testing)

## ✨ Features

- **HMAC Generation**: Create HMAC signatures for messages and API requests
- **HMAC Verification**: Verify HMAC signatures to ensure data integrity
- **Timestamp-based Tokens**: Generate time-limited tokens to prevent replay attacks
- **Express Middleware**: Easy-to-use middleware for protecting API routes
- **API Client**: Ready-to-use client library for making authenticated requests
- **Security Best Practices**: Implements timing-safe comparisons and request expiration

## 📁 Project Structure

```
HMAC-Project/
├── src/
│   ├── server.js              # Express server with API endpoints
│   ├── middleware/
│   │   └── hmacAuth.js        # HMAC authentication middleware
│   ├── utils/
│   │   ├── hmacGenerator.js   # HMAC generation and verification utilities
│   │   └── security.js        # Security helper functions
│   ├── client/
│   │   └── apiClient.js       # API client for authenticated requests
│   └── config/
│       └── constants.js       # Configuration constants
├── test.js                    # Test script for HMAC functionality
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🔧 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)

## 📦 Installation

1. **Clone or download the project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory:
   ```env
   HMAC_SECRET=your-secret-key-here
   API_PORT=3000
   ```

4. **Generate a secure secret key** (optional):
   ```bash
   npm run generate-secret
   ```
   Copy the generated secret and add it to your `.env` file as `HMAC_SECRET`.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

- **`HMAC_SECRET`** (required): A secret key used for HMAC generation. Should be at least 32 characters long.
- **`API_PORT`** (optional): Port number for the server (default: 3000)

### Example `.env` file:
```env
HMAC_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
API_PORT=3000
```

## 🚀 How to Run

### 1. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### 2. Run Tests

In a separate terminal, run the test script:

```bash
npm test
```

This will test HMAC generation, verification, and API client functionality.

### 3. Test API Client

If you have a test client file, you can run:

```bash
npm run client
```

## 📡 API Endpoints

### Public Endpoints

#### `GET /`
Welcome endpoint that lists all available endpoints.

**Response:**
```json
{
  "message": "Welcome to HMAC Authentication API",
  "endpoints": {
    "public": "/public",
    "protected": "/api/protected",
    "createHMAC": "/api/create-hmac",
    "verifyHMAC": "/api/verify-hmac"
  }
}
```

#### `GET /public`
Public endpoint that doesn't require authentication.

**Response:**
```json
{
  "message": "This is a public endpoint",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "note": "No authentication required"
}
```

### HMAC Endpoints

#### `POST /api/create-hmac`
Creates an HMAC signature for a given message.

**Request Body:**
```json
{
  "message": "Hello, HMAC!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "HMAC created successfully",
  "data": {
    "originalMessage": "Hello, HMAC!",
    "simpleHMAC": "abc123...",
    "timestampToken": "abc123:1234567890:Hello, HMAC!"
  },
  "verification": {
    "simple": true,
    "timestamp": { "isValid": true }
  }
}
```

#### `POST /api/verify-hmac`
Verifies an HMAC signature.

**Request Body:**
```json
{
  "message": "Hello, HMAC!",
  "hmac": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "HMAC is valid",
  "isValid": true,
  "details": {
    "receivedMessage": "Hello, HMAC!",
    "receivedHMAC": "abc123...",
    "calculatedHMAC": "abc123..."
  }
}
```

### Protected Endpoints

#### `GET /api/protected`
Protected endpoint that requires HMAC authentication.

**Required Headers:**
- `x-timestamp`: Current timestamp (milliseconds)
- `x-signature`: HMAC signature

**Response:**
```json
{
  "message": "🎉 Congratulations! You accessed a protected route!",
  "status": "Authenticated",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "secretInfo": "This data is protected by HMAC authentication",
    "serverTime": 1234567890
  }
}
```

#### `POST /api/protected/data`
Protected POST endpoint that requires HMAC authentication.

**Required Headers:**
- `x-timestamp`: Current timestamp (milliseconds)
- `x-signature`: HMAC signature

**Request Body:**
```json
{
  "data": "any data here"
}
```

**Response:**
```json
{
  "message": "Data received and authenticated",
  "receivedData": { "data": "any data here" },
  "status": "success",
  "authenticatedAt": "2024-01-01T12:00:00.000Z"
}
```

## 💡 Usage Examples

### Using the API Client

```javascript
const APIClient = require('./src/client/apiClient');

// Create client instance
const client = new APIClient('http://localhost:3000');

// Make authenticated GET request
const data = await client.get('/api/protected');

// Make authenticated POST request
const result = await client.post('/api/protected/data', {
  userId: 123,
  action: 'update'
});
```

### Using HMAC Generator Directly

```javascript
const SimpleHMAC = require('./src/utils/hmacGenerator');

// Create HMAC instance
const hmac = new SimpleHMAC();

// Generate HMAC
const message = "Hello, World!";
const signature = hmac.create(message);
console.log('HMAC:', signature);

// Verify HMAC
const isValid = hmac.verify(message, signature);
console.log('Valid:', isValid);

// Create timestamp token
const token = hmac.createWithTimestamp({ userId: 123 });
console.log('Token:', token.fullToken);

// Verify timestamp token
const verification = hmac.verifyWithTimestamp(token.fullToken);
console.log('Verification:', verification);
```

### Using HMAC Middleware

```javascript
const express = require('express');
const hmacAuth = require('./src/middleware/hmacAuth');

const app = express();
app.use(express.json());

// Protect a route
app.get('/api/secret', hmacAuth, (req, res) => {
  res.json({ message: 'This is a protected route' });
});
```

## 🧩 Project Components

### 1. **SimpleHMAC Class** (`src/utils/hmacGenerator.js`)
- `create(message)`: Generates HMAC for a message
- `verify(message, hmac)`: Verifies HMAC signature
- `createWithTimestamp(message)`: Creates time-limited token
- `verifyWithTimestamp(token)`: Verifies timestamp token

### 2. **HMAC Middleware** (`src/middleware/hmacAuth.js`)
- Validates `x-timestamp` and `x-signature` headers
- Prevents replay attacks by checking request age
- Verifies HMAC signature before allowing access

### 3. **API Client** (`src/client/apiClient.js`)
- Automatically generates authentication headers
- Provides `get()` and `post()` methods for authenticated requests
- Handles errors gracefully

### 4. **Security Utilities** (`src/utils/security.js`)
- `generateSecret()`: Generates random secret keys
- `getTimestamp()`: Gets current timestamp
- `createStringToSign()`: Creates signature string for requests

### 5. **Constants** (`src/config/constants.js`)
- Algorithm definitions (SHA256, SHA512, SHA1)
- Security settings (token age, header names)
- Output format options

## 🔒 Security Features

1. **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual()` to prevent timing attacks
2. **Request Expiration**: Requests expire after 5 minutes (configurable)
3. **Timestamp Validation**: Prevents replay attacks by validating request timestamps
4. **Secret Validation**: Ensures secret keys meet minimum length requirements
5. **String-to-Sign**: Creates consistent signature strings including method, path, body, and timestamp

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The test script will:
- Test basic HMAC generation and verification
- Test different data types
- Test timestamp-based tokens
- Test API client functionality (requires server to be running)

## 📝 Notes

- The HMAC secret should be kept secure and never committed to version control
- Requests to protected endpoints must include both `x-timestamp` and `x-signature` headers
- The signature is calculated from: `timestamp.method.path.body`
- Tokens expire after 5 minutes by default (configurable in `constants.js`)

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

Ahsanullah

---

**Happy Coding! 🚀**
