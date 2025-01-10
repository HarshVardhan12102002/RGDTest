const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const axios = require("axios");

const app = express();

// Middleware for CORS
app.use(
  cors({
    origin: "http://localhost:3001",
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Middleware to parse custom Content-Type
app.use((req, res, next) => {
  if (req.headers["content-type"] === "application/vnd.surveymonkey.survey.v1+json") {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk.toString();
    });
    req.on("end", () => {
      try {
        req.body = JSON.parse(rawBody);
      } catch (error) {
        console.error("Error parsing webhook payload:", error.message);
        req.body = {}; // Fallback to empty object
      }
      next();
    });
  } else {
    express.json()(req, res, next); // Fallback to default JSON parser
  }
});

// Variable to store the latest survey URL
let latestSurveyUrl = null;

// Root route to test the server
app.get("/", (req, res) => {
  res.send("Hello, Node.js server is running!");
});

// Webhook endpoint
app.post("/webhook-endpoint", (req, res) => {
  console.log("Webhook Headers:", req.headers);
  console.log("Raw Webhook Body:", req.body);

  const webhookData = req.body;

  if (webhookData.event_type === "survey_created" && webhookData.object_id) {
    const surveyId = webhookData.object_id;
    console.log("New survey created. Triggering get_respondent_url.js for Survey ID:", surveyId);

    const getRespondentUrl = spawn("node", ["get_respondent_url.js", surveyId]);

    getRespondentUrl.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`get_respondent_url.js Output: ${output}`);

      const match = output.match(/Shareable URL for Survey ID.*:\s(https:\/\/www\.surveymonkey\.com\/r\/\S+)/);
      if (match && match[1]) {
        latestSurveyUrl = match[1];
        console.log("Latest Survey URL:", latestSurveyUrl);
      }
    });

    getRespondentUrl.stderr.on("data", (error) => {
      console.error(`get_respondent_url.js Error: ${error}`);
    });

    getRespondentUrl.on("close", (code) => {
      console.log(`get_respondent_url.js exited with code ${code}`);
    });

    // After storing the Survey URL, send it to the second server (3005)
    axios.post('http://localhost:3005/webhook-endpoint-3000', {
      survey_id: surveyId,
    })
    .then(response => {
      console.log("Survey ID passed to second webhook server:", response.data);
    })
    .catch(error => {
      console.error("Error passing Survey ID to second webhook server:", error.message);
    });

    res.status(200).send("Webhook received successfully");
  } else {
    res.status(400).send("Unhandled webhook event type or missing data.");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running locally on port ${PORT}`);
});