// test.js - Run this to test everything!
console.log("🔐 HMAC Authentication System - Test Script\n");

// Load environment variables
require("dotenv").config();

// Import modules
const SimpleHMAC = require("./src/utils/hmacGenerator");
const APIClient = require("./src/client/apiClient");

async function runTests() {
  console.log("=".repeat(50));
  console.log("🧪 TESTING HMAC FUNCTIONALITY");
  console.log("=".repeat(50) + "\n");

  try {
    // Test 1: Basic HMAC
    console.log("1. Testing Basic HMAC Generation:");
    const hmac = new SimpleHMAC();

    const testMessage = "Hello, this is a test message!";
    const testHmac = hmac.create(testMessage);

    console.log("   Message:", testMessage);
    console.log("   HMAC:", testHmac);
    console.log("   Length:", testHmac.length, "characters");
    console.log("   Verified:", hmac.verify(testMessage, testHmac));

    // Test 2: Different data types
    console.log("\n2. Testing Different Data Types:");

    const objects = [
      { userId: 1, name: "John" },
      ["apple", "banana", "cherry"],
      12345,
      null,
    ];

    objects.forEach((data, index) => {
      try {
        const result = hmac.create(data);
        console.log(
          `   Data ${index + 1} (${typeof data}):`,
          JSON.stringify(data).substring(0, 30) + "...",
          "→ HMAC:",
          result.substring(0, 20) + "..."
        );
      } catch (error) {
        console.log(`   Data ${index + 1}: ERROR - ${error.message}`);
      }
    });

    // Test 3: Timestamp tokens
    console.log("\n3. Testing Timestamp Tokens:");
    const tokenData = { action: "login", username: "testuser" };
    const token = hmac.createWithTimestamp(tokenData);

    console.log("   Token created:", token.fullToken.substring(0, 50) + "...");

    const verifyResult = hmac.verifyWithTimestamp(token.fullToken);
    console.log("   Verification:", verifyResult);

    // Test 4: Test with API Client
    console.log("\n4. Testing API Client:");
    console.log("   Starting server test in 2 seconds...\n");

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const client = new APIClient("http://localhost:3000");

    // Test public endpoint
    console.log("   Testing public endpoint:");
    try {
      const publicData = await client.get("/public");
      console.log("   ✓ Public endpoint:", publicData.message);
    } catch (error) {
      console.log("   ✗ Make sure server is running! Error:", error.message);
    }

    // Run client tests
    await client.testHMACFunctions();

    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL TESTS COMPLETED!");
    console.log("=".repeat(50));
    console.log("\n📝 Next Steps:");
    console.log("   1. Start the server: npm start");
    console.log("   2. Test protected endpoints with the API client");
    console.log("   3. Check the console for examples");
    console.log("\n🚀 Happy coding!\n");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
}

// Run tests
runTests();
