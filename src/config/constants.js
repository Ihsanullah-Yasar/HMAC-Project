// src/config/constants.js
module.exports = {
  // HMAC Algorithms supported
  ALGORITHMS: {
    SHA256: "sha256",
    SHA512: "sha512",
    SHA1: "sha1",
  },

  // Output formats
  OUTPUT_FORMATS: {
    HEX: "hex",
    BASE64: "base64",
    BUFFER: "buffer",
  },

  // Security settings
  SECURITY: {
    MIN_SECRET_LENGTH: 32,
    MAX_TOKEN_AGE: 5 * 60 * 1000, // 5 minutes
    TIMESTAMP_HEADER: "x-timestamp",
    SIGNATURE_HEADER: "x-signature",
    API_KEY_HEADER: "x-api-key",
  },
};
