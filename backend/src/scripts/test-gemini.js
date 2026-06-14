const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

async function test() {
  console.log("Using API Key:", process.env.GEMINI_API_KEY ? "FOUND (starts with " + process.env.GEMINI_API_KEY.substring(0, 7) + "...)" : "NOT FOUND");
  if (!process.env.GEMINI_API_KEY) {
    console.log("No API Key found in env!");
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Sending test prompt...");
    const result = await model.generateContent("Hello! Respond with 'OK' if you can read this.");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("Error from Gemini API:", err);
    if (err.cause) {
      console.error("Error cause:", err.cause);
    }
  }
}

test();
