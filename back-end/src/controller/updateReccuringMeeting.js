// Import required modules
const axios = require("axios");
const utils = require('../utils/utils');
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { generateZoomAccessToken } = require('../auth/zoomtoken');

let accessToken; // Will hold the Zoom JWT access token

// Generate Zoom API access token using the utility function
async function main() {
    try {
        accessToken = await generateZoomAccessToken(); // Fetch Zoom access token (JWT or OAuth)
    } catch (error) {
        console.error('Error generating Zoom access token:', error);
        logger.error('Error generating Zoom access token:', error);
    }
}

// Function to update a specific occurrence of a recurring Zoom meeting
async function updateZoomMeeting(meetingId, payload, occurrence_id) {
    try {
        // Make a PATCH request to Zoom’s API for the specified meeting occurrence
        return await axios.patch(`https://api.zoom.us/v2/meetings/${meetingId}?occurrence_id=${occurrence_id}`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Pass the access token in the Authorization header
            }
        });
    } catch (error) {
        // Let the caller handle the error
        throw error;
    }
}

// Express route to handle the Zoom recurring meeting update request
exports.updateReccuringMeeting = async (req, res) => {
    try {
        // Generate Zoom access token
        await main();
        logger.info('mtnUpdateMeeting'); // Log the update operation

        // Destructure expected data from the request body
        const { meetingId, payload, occurrence_id } = req.body;
        let { topic, password, timezone, start_time: startTime } = payload;

        // Validate occurrence_id presence
        if (!occurrence_id) {
            return res.status(400).json({ status: false, message: "Invalid occurrence_id" });
        }

        // Replace space with '+' for Zoom-compatible datetime if needed
        if (startTime.includes(' ')) {
            startTime = startTime.replace(' ', '+');
            payload.start_time = startTime; // Update payload with corrected format
        }

        // Convert start time to UTC format for Zoom API
        startTime = utils.convertTimetoUtc(startTime);
        // payload.start_time = startTime; // Optional: uncomment if Zoom expects UTC explicitly

        // Send the update request to Zoom
        const zoomResult = await updateZoomMeeting(meetingId, payload, occurrence_id);

        // If successful, Zoom returns status code 204 (No Content)
        if (zoomResult.status === 204) {
            return res.json({ status: true, message: "Meeting Occurrence Updated Successfully" });
        } else {
            return res.json({ status: false, message: 'Failed to update meeting on Zoom' });
        }
    } catch (error) {
        // Log and handle any errors during the update process
        console.error('Error in mtnUpdateMeeting:', error);
        logger.error('Error in mtnUpdateMeeting:', error);

        // Extract Zoom-specific error information if available
        const statusCode = error?.response?.status || 500;
        const errorCode = error?.response?.data?.code;

        // Return detailed error responses based on Zoom API response
        if (statusCode === 404) {
            return res.status(404).json({ status: false, message: "MeetingId not found" });
        } else if (errorCode === 3000) {
            // Typically means invalid occurrence_id or time format
            return res.status(400).json({ status: false, message: error.response.data.message });
        } else {
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    }
};
