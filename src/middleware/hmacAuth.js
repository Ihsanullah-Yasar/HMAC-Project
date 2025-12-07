// src/middleware/hmacAuth.js
const SimpleHMAC = require("../utils/hmacGenerator");
const security = require("../utils/security");
const constants = require("../config/constants");

// Create HMAC instance with environment secret
const hmac = new SimpleHMAC();

/**
 * Simple HMAC Authentication Middleware
 * Use this to protect your API routes
 */
const hmacAuth = (req, res, next) => {
  try {
    // Get headers
    const timestamp = req.headers[constants.SECURITY.TIMESTAMP_HEADER];
    const signature = req.headers[constants.SECURITY.SIGNATURE_HEADER];

    // Check if headers exist
    if (!timestamp || !signature) {
      return res.status(401).json({
        error: "Missing authentication headers",
        requiredHeaders: [
          constants.SECURITY.TIMESTAMP_HEADER,
          constants.SECURITY.SIGNATURE_HEADER,
        ],
      });
    }

    // Check timestamp (prevent replay attacks)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - requestTime);

    if (timeDiff > constants.SECURITY.MAX_TOKEN_AGE) {
      return res.status(401).json({
        error: "Request expired",
        receivedTime: new Date(requestTime).toISOString(),
        serverTime: new Date(now).toISOString(),
        timeDiff: timeDiff,
        maxAllowed: constants.SECURITY.MAX_TOKEN_AGE,
      });
    }

    // Create string to sign
    const stringToSign = security.createStringToSign(
      req.method,
      req.path,
      req.body,
      timestamp
    );

    // Verify signature
    const isValid = hmac.verify(stringToSign, signature);

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid signature",
        details: "HMAC verification failed",
      });
    }

    // Authentication successful
    console.log(`✓ Authenticated request to ${req.path}`);
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({
      error: "Authentication error",
      details: error.message,
    });
  }
};

module.exports = hmacAuth;
