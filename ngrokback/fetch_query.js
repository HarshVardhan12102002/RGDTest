const axios = require("axios");

// Replace with your SurveyMonkey API token
const SURVEYMONKEY_API_TOKEN = "tykS.Qjan62bnVNaoCgI4G0XnWhx813H9yPuR0VNZm5nG52DaRj93F3W9rlBqXKZJ3kWhMSTO-81j14VB7Pd2wIjDrz4ggk9vEJz64.gzj.SXOjPJvGXNOlHAghP6oVp";

// Get the survey ID from the command-line arguments
const surveyId = process.argv[2];

if (!surveyId) {
  console.error("Survey ID is required.");
  process.exit(1);
}

async function fetchSurveyDetails(surveyId) {
  try {
    // Fetch survey details
    const response = await axios.get(`https://api.surveymonkey.com/v3/surveys/${surveyId}`, {
      headers: {
        Authorization: `Bearer ${SURVEYMONKEY_API_TOKEN}`,
      },
    });

    const { id, title, href } = response.data;
    console.log(`Survey Details:
      - ID: ${id}
      - Title: ${title}
      - Embedded URL: ${href}`);
  } catch (error) {
    console.error("Error fetching survey details:", error.response?.data || error.message);
  }
}

// Fetch the survey details
fetchSurveyDetails(surveyId);