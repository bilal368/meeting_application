const axios = require("axios");
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { generateZoomAccessToken } = require('../auth/zoomtoken');

let accessToken;

// Function to fetch Zoom API access token
async function getAccessToken() {
	try {
		// Call the token generator utility
		return await generateZoomAccessToken();
	} catch (error) {
		logger.error('Error generating Zoom access token:', error);
		throw new Error('Failed to generate Zoom access token');
	}
}

// Controller to delete a specific occurrence from a recurring Zoom meeting
exports.deleteReccurrence = async (req, res) => {
	try {
		// Generate the Zoom API token before making the API request
		accessToken = await getAccessToken();

		logger.info('deletemeeting');  // Log the entry to the function

		// Extract meetingId and occurrence_id from the request body
		const { meetingId, occurrence_id } = req.body;

		// Validate presence of meetingId
		if (!meetingId) {
			return res.status(400).json({ status: false, message: "Invalid meetingId" });
		}

		// Validate presence of occurrence_id
		if (!occurrence_id) {
			return res.status(400).json({ status: false, message: "Invalid occurrence_id" });
		}

		// Make DELETE request to Zoom API to remove the specific occurrence from a recurring meeting
		const result = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}?occurrence_id=${occurrence_id}`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`
			}
		});

		// If Zoom successfully deleted the occurrence (204 No Content)
		if (result.status === 204) {
			// Respond with success message
			return res.status(200).json({ status: true, message: "Occurrence deleted successfully" });

			// (Optional) Code below is commented out in case you want to handle local DB deletion
			// const data = await deleteMeeting.mtnDeleteMeetingWithZoomMeetingId(meetingId);
			// if (data) {
			// 	return res.json({ status: true, message: "Meeting successfully deleted" });
			// } else {
			// 	return res.status(404).json({ status: false, message: "Meeting ID not found in the database" });
			// }
		} else {
			// Zoom API responded with an unexpected status
			return res.status(404).json({ status: false, message: "Meeting ID not found on Zoom" });
		}

	} catch (error) {
		// Catch and handle errors (e.g., network, Zoom API errors)
		logger.error('An error occurred during meeting deletion:', error);

		// Extract status code or default to 500
		const statusCode = error?.response?.status || 500;

		// Handle 404 errors specifically
		if (statusCode == 404) {
			const message = error.response.data.message;
			return res.status(404).json({ status: false, message: message });
		}

		// Handle all other server-side errors
		res.status(500).json({ status: false, message: "Internal Server Error", error: statusCode });
	}
};
