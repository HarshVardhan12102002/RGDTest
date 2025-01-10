require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Enable CORS for all origins (use specific URLs in production for security)
app.use(cors({
    origin: '*',  // Allow requests from all domains
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Store the latest Survey ID globally
let latestSurveyId = null;

// Route to handle the first webhook (running on port 3000) that provides the latest survey ID
app.post('/webhook-endpoint-3000', (req, res) => {
    console.log('Received survey info:', JSON.stringify(req.body, null, 2));

    // Check if survey_id is coming from the payload
    if (req.body.survey_id) {
        latestSurveyId = req.body.survey_id;
        console.log('Stored Latest Survey ID:', latestSurveyId);
    } else {
        console.error('No survey ID found in the webhook payload');
    }

    res.status(200).json({ message: 'Survey ID received successfully' });
});

// Route to handle SurveyMonkey webhook (running on port 3005)
app.post('/webhook-endpoint', async (req, res) => {
    console.log('Webhook received from SurveyMonkey:', JSON.stringify(req.body, null, 2));

    const eventType = req.body.event_type;
    const responseId = req.body.resources?.response_id;

    // Ensure that the Survey ID is available from the first webhook
    if (!latestSurveyId) {
        console.error('No Survey ID available, please ensure the first webhook has provided it.');
        return res.status(400).send('No Survey ID available');
    }

    // Validate if it's a response event and response_id is present
    if (eventType === 'response_completed' && responseId) {
        try {
            // Get detailed response from SurveyMonkey API using the latest Survey ID
            const responseDetails = await axios.get(
                `https://api.surveymonkey.com/v3/surveys/${latestSurveyId}/responses/${responseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.SURVEYMONKEY_API_TOKEN}`,
                    },
                }
            );

            const responseData = responseDetails.data;
            const customVariables = responseData.custom_variables;

            console.log('Custom Variables:', customVariables);

            // Process custom variables (e.g., update wallet, etc.)
            if (customVariables && customVariables.email) {
                console.log(`Survey completed by: ${customVariables.email}`);
                // Add your logic to update the wallet or any other processing here
            }
        } catch (error) {
            console.error('Error fetching survey response details:', error.response ? error.response.data : error.message);
            return res.status(500).send('Error fetching survey response');
        }
    } else {
        console.log('Invalid event type or missing response ID');
        return res.status(400).send('Invalid data');
    }

    // Respond with 200 OK to acknowledge receipt of the webhook
    res.status(200).json({ message: 'OK' });
});

// Start the server on port 3005
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});