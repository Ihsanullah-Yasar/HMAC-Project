// src/client/apiClient.js
const axios = require("axios");
const SimpleHMAC = require("../utils/hmacGenerator");
const security = require("../utils/security");
const constants = require("../config/constants");

// Create HMAC instance
const hmac = new SimpleHMAC();

class APIClient {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`✓ API Client initialized for ${baseURL}`);
  }

  /**
   * Generate authentication headers
   * @param {string} method - HTTP method
   * @param {string} path - API endpoint
   * @param {object} data - Request data
   * @returns {object} Headers object
   */
  generateAuthHeaders(method, path, data = {}) {
    const timestamp = security.getTimestamp();

    // Create string to sign
    const stringToSign = security.createStringToSign(
      method,
      path,
      data,
      timestamp
    );

    // Create signature
    const signature = hmac.create(stringToSign);

    return {
      [constants.SECURITY.TIMESTAMP_HEADER]: timestamp,
      [constants.SECURITY.SIGNATURE_HEADER]: signature,
    };
  }

  /**
   * Make authenticated GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Response data
   */
  async get(endpoint) {
    try {
      const headers = this.generateAuthHeaders("GET", endpoint);

      console.log(`↗️  GET ${endpoint}`);
      const response = await this.client.get(endpoint, { headers });

      console.log(`✓ Response from ${endpoint}:`, response.status);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Make authenticated POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @returns {Promise} Response data
   */
  async post(endpoint, data) {
    try {
      const headers = this.generateAuthHeaders("POST", endpoint, data);

      console.log(`↗️  POST ${endpoint}`, data);
      const response = await this.client.post(endpoint, data, { headers });

      console.log(`✓ Response from ${endpoint}:`, response.status);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Error handler
   * @param {Error} error - Axios error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      console.error("❌ Server Error:", {
        status: error.response.status,
        data: error.response.data,
      });
      throw new Error(
        `Server Error ${error.response.status}: ${JSON.stringify(
          error.response.data
        )}`
      );
    } else if (error.request) {
      // No response received
      console.error("❌ No response:", error.message);
      throw new Error("No response from server");
    } else {
      // Request setup error
      console.error("❌ Request error:", error.message);
      throw error;
    }
  }

  /**
   * Test HMAC functions (for learning)
   */
  async testHMACFunctions() {
    console.log("\n🔐 Testing HMAC Functions:\n");

    // Test 1: Simple HMAC
    const message = "Hello, HMAC!";
    const hmacResult = hmac.create(message);
    console.log("1. Simple HMAC:");
    console.log("   Message:", message);
    console.log("   HMAC:", hmacResult);
    console.log("   Verified:", hmac.verify(message, hmacResult));

    // Test 2: HMAC with timestamp
    console.log("\n2. HMAC with Timestamp:");
    const token = hmac.createWithTimestamp({ userId: 123, action: "test" });
    console.log("   Token:", token.fullToken);
    const verification = hmac.verifyWithTimestamp(token.fullToken);
    console.log("   Verification:", verification);

    // Test 3: Expired token test
    console.log("\n3. Testing expired token:");
    const oldToken = hmac.createWithTimestamp({ test: "expired" });
    // Simulate old timestamp
    const expiredToken = `${oldToken.hmac}:${
      Date.now() - 600000
    }:${JSON.stringify({ test: "expired" })}`;
    const expiredCheck = hmac.verifyWithTimestamp(expiredToken);
    console.log("   Expired token check:", expiredCheck);
  }
}

module.exports = APIClient;
