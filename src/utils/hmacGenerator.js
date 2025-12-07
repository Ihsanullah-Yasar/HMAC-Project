// src/utils/hmacGenerator.js
const crypto = require("crypto");
require("dotenv").config();
const constants = require("../config/constants");

class SimpleHMAC {
  constructor(secret, algorithm = constants.ALGORITHMS.SHA256) {
    // Get secret from environment if not provided
    this.secret = secret || process.env.HMAC_SECRET;

    // Validate secret exists
    if (!this.secret) {
      throw new Error("HMAC secret is required. Set HMAC_SECRET in .env file");
    }

    // Validate secret length
    if (this.secret.length < constants.SECURITY.MIN_SECRET_LENGTH) {
      console.warn(
        `Warning: Secret is shorter than ${constants.SECURITY.MIN_SECRET_LENGTH} characters`
      );
    }

    this.algorithm = algorithm;

    // Show user what algorithm is being used
    console.log(
      `✓ HMAC Generator initialized with ${this.algorithm} algorithm`
    );
  }

  /**
   * Simple method to create HMAC
   * @param {string} message - The message to hash
   * @returns {string} HMAC in hex format
   */
  create(message) {
    try {
      // Convert object to string if needed
      const data =
        typeof message === "string" ? message : JSON.stringify(message);

      // Create HMAC
      const hmac = crypto.createHmac(this.algorithm, this.secret);
      hmac.update(data);

      // Return as hex string
      return hmac.digest("hex");
    } catch (error) {
      console.error("Error creating HMAC:", error.message);
      throw error;
    }
  }

  /**
   * Verify if HMAC is valid
   * @param {string} message - Original message
   * @param {string} receivedHmac - HMAC to verify
   * @returns {boolean} True if valid
   */
  verify(message, receivedHmac) {
    try {
      // Create HMAC for the message
      const calculatedHmac = this.create(message);

      // Compare using timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(calculatedHmac, "hex"),
        Buffer.from(receivedHmac, "hex")
      );
    } catch (error) {
      console.error("Error verifying HMAC:", error.message);
      return false;
    }
  }

  /**
   * Create HMAC with timestamp (prevents replay attacks)
   * @param {any} message - Message/data
   * @returns {object} Contains HMAC, timestamp, and full token
   */
  createWithTimestamp(message) {
    const timestamp = Date.now();
    const dataToSign = {
      message: message,
      timestamp: timestamp,
    };

    // Create HMAC
    const hmac = this.create(JSON.stringify(dataToSign));

    return {
      hmac: hmac,
      timestamp: timestamp,
      data: message,
      fullToken: `${hmac}:${timestamp}:${JSON.stringify(message)}`,
    };
  }

  /**
   * Verify HMAC with timestamp
   * @param {string} fullToken - Token from createWithTimestamp
   * @returns {object} Verification result
   */
  verifyWithTimestamp(fullToken) {
    try {
      // Split token into parts
      const [receivedHmac, timestampStr, messageStr] = fullToken.split(":");

      // Parse data
      const timestamp = parseInt(timestampStr);
      const message = JSON.parse(messageStr);

      // Check if token is expired
      const now = Date.now();
      const tokenAge = now - timestamp;
      const maxAge = constants.SECURITY.MAX_TOKEN_AGE;

      if (tokenAge > maxAge) {
        return {
          isValid: false,
          reason: "Token expired",
          age: tokenAge,
          maxAge: maxAge,
        };
      }

      // Recreate data object
      const originalData = {
        message: message,
        timestamp: timestamp,
      };

      // Verify HMAC
      const calculatedHmac = this.create(JSON.stringify(originalData));
      const isValid = this.verify(JSON.stringify(originalData), receivedHmac);

      return {
        isValid: isValid,
        reason: isValid ? "Valid token" : "Invalid HMAC",
        data: isValid ? message : null,
        age: tokenAge,
      };
    } catch (error) {
      return {
        isValid: false,
        reason: "Invalid token format: " + error.message,
      };
    }
  }
}

// Export for easy use
module.exports = SimpleHMAC;
