const axios = require("axios");
const { deleteMeeting } = require('../models/deleteMeeting');
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { generateZoomAccessToken } = require('../auth/zoomtoken');

let accessToken;

// Helper function to get Zoom API access token
async function getAccessToken() {
	try {
		// Generate and return a new Zoom access token
		return await generateZoomAccessToken();
	} catch (error) {
		logger.error('Error generating Zoom access token:', error);
		throw new Error('Failed to generate Zoom access token');
	}
}

// Controller to handle deletion of a Zoom meeting both on Zoom and in local DB
exports.deleteMeeting = async (req, res) => {
	try {
		// Fetch the Zoom access token
		accessToken = await getAccessToken();

		logger.info('deletemeeting');

		// Extract meetingId from request body
		const { meetingId } = req.body;

		// Validate meetingId
		if (!meetingId) {
			return res.status(400).json({ status: false, message: "Invalid meetingId" });
		}

		// Send DELETE request to Zoom's API to remove the meeting
		const result = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`
			}
		});

		// If Zoom API returns 204 (No Content), deletion was successful
		if (result.status === 204) {
			// Delete the meeting from local DB as well
			const data = await deleteMeeting.mtnDeleteMeetingWithZoomMeetingId(meetingId);

			if (data) {
				// Meeting was found and deleted from DB
				return res.json({ status: true, message: "Meeting successfully deleted" });
			} else {
				// Meeting not found in the local DB
				return res.status(404).json({ status: false, message: "Meeting ID not found in the database" });
			}
		} else {
			// Zoom did not return a successful deletion status
			return res.status(404).json({ status: false, message: "Meeting ID not found on Zoom" });
		}

	} catch (error) {
		logger.error('An error occurred during meeting deletion:', error);

		// Extract status code from Zoom API response or default to 500
		const statusCode = error?.response?.status || 500;

		// If meeting not found on Zoom
		if (statusCode == 404) {
			const message = error.response.data.message;
			return res.status(404).json({ status: false, message: message });
		}

		// For all other errors
		res.status(500).json({ status: false, message: "Internal Server Error", error: statusCode });
	}
};
