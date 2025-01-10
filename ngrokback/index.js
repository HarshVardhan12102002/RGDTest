const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Webhook endpoint
app.post("/webhook-endpoint", (req, res) => {
  console.log("Received Webhook Data:", req.body); // Log the incoming data for debugging

  // Ensure we send a 200 OK response
  res.status(200).send("Webhook received successfully");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running locally on port 3000");
});