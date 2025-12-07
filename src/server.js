// src/server.js
const express = require("express");
require("dotenv").config();

// Import modules
const hmacAuth = require("./middleware/hmacAuth");
const SimpleHMAC = require("./utils/hmacGenerator");
const APIClient = require("./client/apiClient");

// Initialize
const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HMAC instance for server-side use
const hmac = new SimpleHMAC();

// Welcome route (no authentication)
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to HMAC Authentication API",
    endpoints: {
      public: "/public",
      protected: "/api/protected",
      createHMAC: "/api/create-hmac",
      verifyHMAC: "/api/verify-hmac",
    },
    instructions:
      "Use x-timestamp and x-signature headers for protected routes",
  });
});

// Public route (no authentication needed)
app.get("/public", (req, res) => {
  res.json({
    message: "This is a public endpoint",
    timestamp: new Date().toISOString(),
    note: "No authentication required",
  });
});

// Create HMAC endpoint
app.post("/api/create-hmac", (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const hmacResult = hmac.create(message);
    const token = hmac.createWithTimestamp(message);

    res.json({
      success: true,
      message: "HMAC created successfully",
      data: {
        originalMessage: message,
        simpleHMAC: hmacResult,
        timestampToken: token,
      },
      verification: {
        simple: hmac.verify(message, hmacResult),
        timestamp: hmac.verifyWithTimestamp(token.fullToken),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify HMAC endpoint
app.post("/api/verify-hmac", (req, res) => {
  try {
    const { message, hmac: receivedHmac } = req.body;

    if (!message || !receivedHmac) {
      return res.status(400).json({
        error: "Both message and hmac are required",
      });
    }

    const isValid = hmac.verify(message, receivedHmac);

    res.json({
      success: true,
      message: isValid ? "HMAC is valid" : "HMAC is invalid",
      isValid: isValid,
      details: {
        receivedMessage: message,
        receivedHMAC: receivedHmac,
        calculatedHMAC: hmac.create(message),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route (requires HMAC authentication)
app.get("/api/protected", hmacAuth, (req, res) => {
  res.json({
    message: "🎉 Congratulations! You accessed a protected route!",
    status: "Authenticated",
    timestamp: new Date().toISOString(),
    data: {
      secretInfo: "This data is protected by HMAC authentication",
      serverTime: Date.now(),
    },
  });
});

// Protected POST route
app.post("/api/protected/data", hmacAuth, (req, res) => {
  res.json({
    message: "Data received and authenticated",
    receivedData: req.body,
    status: "success",
    authenticatedAt: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("=".repeat(50));
  console.log("\n📋 Available endpoints:");
  console.log(`   GET  http://localhost:${PORT}/              - Welcome page`);
  console.log(
    `   GET  http://localhost:${PORT}/public        - Public endpoint`
  );
  console.log(
    `   GET  http://localhost:${PORT}/api/protected - Protected endpoint (requires auth)`
  );
  console.log(`   POST http://localhost:${PORT}/api/create-hmac - Create HMAC`);
  console.log(`   POST http://localhost:${PORT}/api/verify-hmac - Verify HMAC`);
  console.log("\n🔐 To access protected routes, you need:");
  console.log("   - x-timestamp header (current timestamp)");
  console.log("   - x-signature header (HMAC signature)");
  console.log("\n💡 Run the test client to see it in action!");
  console.log("=".repeat(50) + "\n");
});

// Export for testing
module.exports = app;
