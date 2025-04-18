const axios = require("axios");

const { Logger } = require('../utils/logger');
const logger = Logger.logger;

const { generateZoomAccessToken } = require('../auth/zoomtoken');

let accessToken; // Variable to store Zoom API access token

// Function to generate and assign the Zoom API access token
async function main() {
    try {
        // Generate the Zoom API access token using the auth utility
        accessToken = await generateZoomAccessToken();
    } catch (error) {
        // Log any error that occurs during token generation
        console.error('Error:', error);
    }
}

// Controller to get the total number of active Zoom users
exports.Zoomusercount = async (req, res) => {
    // Generate or fetch the latest access token
    await main();
    console.log("accessToken Zoomusercount", accessToken);

    try {
        // Make a GET request to Zoom API to fetch active users
        let result = await axios.get(`https://api.zoom.us/v2/users?status=active&page_size=30&page_number=1`, {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Pass the token in Authorization header
            }
        });

        // Check if response is successful and contains user data
        if (result.status === 200 && result.data) {
            const userCount = result.data.total_records; // Extract total active users
            res.json({ count: userCount }); // Respond with the user count
        } else {
            // Respond with failure if no data is returned
            res.json({ status: false, error: "Failed to fetch user count" });
        }
    } catch (error) {
        // Catch and respond with any error during API request
        res.json({ status: false, error: "Error fetching user count" });
    }
}
