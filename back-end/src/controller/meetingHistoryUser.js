// Import utility functions and logger module
const utils = require('../utils/utils');
const { Logger } = require('../utils/logger');
const logger = Logger.logger;

// Import the model that interfaces with the meeting history database
const { meetingHistoryUser } = require('../models/meetingHistoryUser');

/**
 * Fetch meeting history for a user, formatted with their time zone.
 * 
 * @param {string} username - The email or username of the user.
 * @param {string} userTimezone - Time zone in which to return the data.
 * @returns {Promise<Array>} - Resolves to an array of meeting history records.
 */
async function fetchMeetingHistory(username, userTimezone) {
    try {
        // Convert to MTN formatted email (e.g. adds MTN domain if missing)
        const formattedUsername = utils.toMTNEmail(username.toLowerCase());

        // Call the model method to get meeting history for the user
        return await meetingHistoryUser.mtnGetMeetingHistory(formattedUsername, userTimezone);
    } catch (error) {
        // Log any errors and throw a descriptive message
        logger.error('Error fetching meeting history:', error);
        throw new Error('Failed to fetch meeting history');
    }
}

/**
 * Express route handler to return Zoom meeting history for a user.
 * 
 * Expected input (req.body):
 *  - username: String (required) – user identifier or email
 *  - timezone: String (required) – timezone to return meeting dates in
 * 
 * Response:
 *  - On success: status: true, meetingHistory: [meeting data]
 *  - On failure or no data: status: false, message: error or empty result
 */
exports.meetingHistoryUser = async (req, res) => {
    try {
        logger.info('MeetingHistoryUser endpoint hit');

        const username = req.body.username;
        const userTimezone = req.body.timezone;

        // Validate required parameters
        if (!username) {
            return res.status(400).json({ status: false, message: 'Username is required' });
        }

        if (!userTimezone) {
            return res.status(400).json({ status: false, message: 'User Time Zone is required' });
        }

        // Fetch the user's meeting history from the database
        const history = await fetchMeetingHistory(username, userTimezone);

        // Return the result if records are found
        if (history.length > 0) {
            res.json({ status: true, meetingHistory: history });
        } else {
            // Return no data message if history array is empty
            res.json({ status: false, message: "No data to display" });
        }
    } catch (error) {
        // Log unexpected server errors and return 500 response
        logger.error('Error in MeetingHistoryUser:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
