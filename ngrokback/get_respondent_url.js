const axios = require("axios");

// Replace with your SurveyMonkey API token
const SURVEYMONKEY_API_TOKEN = "tykS.Qjan62bnVNaoCgI4G0XnWhx813H9yPuR0VNZm5nG52DaRj93F3W9rlBqXKZJ3kWhMSTO-81j14VB7Pd2wIjDrz4ggk9vEJz64.gzj.SXOjPJvGXNOlHAghP6oVp";

// Function to fetch the shareable URL for a given survey ID
async function getRespondentUrl(surveyId) {
  try {
    // Call SurveyMonkey API to create a web link collector
    const response = await axios.post(
      `https://api.surveymonkey.com/v3/surveys/${surveyId}/collectors`,
      {
        type: "weblink",
        name: "Web Link Collector", // Customize collector name if needed
      },
      {
        headers: {
          Authorization: `Bearer ${SURVEYMONKEY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract and log the shareable URL
    const { url } = response.data;
    console.log(`Shareable URL for Survey ID ${surveyId}: ${url}`);
    return url; // Return the URL for further use if needed
  } catch (error) {
    console.error("Error fetching respondent URL:", error.response?.data || error.message);
    process.exit(1); // Exit with an error code
  }
}

// Get the survey ID from the command-line arguments
const surveyId = process.argv[2];

if (!surveyId) {
  console.error("Error: Survey ID is required as an argument.");
  console.log("Usage: node get_respondent_url.js <survey_id>");
  process.exit(1); // Exit with an error code
}

// Call the function
getRespondentUrl(surveyId);