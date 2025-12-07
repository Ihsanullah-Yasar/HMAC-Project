// src/utils/security.js
const crypto = require("crypto");
const constants = require("../config/constants");

module.exports = {
  /**
   * Generate a strong random secret
   * @param {number} length - Length in bytes (default: 32)
   * @returns {string} Random hex string
   */
  generateSecret: function (length = 32) {
    return crypto.randomBytes(length).toString("hex");
  },

  /**
   * Simple validation for messages
   * @param {any} message - Message to validate
   * @returns {boolean} True if valid
   */
  validateMessage: function (message) {
    if (message === null || message === undefined) {
      throw new Error("Message cannot be null or undefined");
    }
    return true;
  },

  /**
   * Get current timestamp
   * @returns {string} Current timestamp
   */
  getTimestamp: function () {
    return Date.now().toString();
  },

  /**
   * Create signature string for requests
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {object} body - Request body
   * @param {string} timestamp - Timestamp
   * @returns {string} String to sign
   */
  createStringToSign: function (method, path, body, timestamp) {
    return `${timestamp}.${method.toUpperCase()}.${path}.${JSON.stringify(
      body || {}
    )}`;
  },
};
