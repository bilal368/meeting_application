// Import required modules
const axios = require("axios");
const { Logger } = require('../utils/logger');
const moment = require('moment-timezone');
const logger = Logger.logger;

const { mtnGetMeetingWithId } = require('../models/mtnGetMeetingWithId');
const { generateZoomAccessToken } = require('../auth/zoomtoken');

// Store Zoom access token
let accessToken;

/**
 * Fetch Zoom API access token using client credentials.
 * Called once before making requests to Zoom API.
 */
async function main() {
    try {
        accessToken = await generateZoomAccessToken();
    } catch (error) {
        console.error('Error generating Zoom access token:', error);
        logger.error('Error generating Zoom access token:', error);
        throw new Error('Failed to generate Zoom access token');
    }
}

/**
 * Fetch Zoom meeting details.
 * - Calls Zoom API using the access token.
 * - If an occurrence_id is provided, fetches the occurrence-specific meeting data.
 * - Ensures that settings (like auto-recording) are preserved from the original request.
 * 
 * @param {string} meetingId - Zoom meeting ID.
 * @param {string} occurrence_id - (Optional) Specific occurrence of a recurring meeting.
 * @returns {Promise<Object>} - Axios response object containing meeting data.
 */
async function fetchMeetingFromZoom(meetingId, occurrence_id) {
    try {
        // Get base meeting details
        const firstApiResponse = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (occurrence_id) {
            // If a specific occurrence is requested, fetch that occurrence
            const secondApiResponse = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}?occurrence_id=${occurrence_id}&show_previous_occurrences=true`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Retain the original settings (Zoom sometimes changes them in occurrence call)
            firstApiResponse.data.settings = secondApiResponse.data.settings;

            return firstApiResponse;
        } else {
            return firstApiResponse;
        }
    } catch (error) {
        logger.error('Error fetching meeting from Zoom:', error);
        throw error;
    }
}

/**
 * Fetch meeting information from internal database for editing.
 * 
 * @param {string} meetingId - ID of the meeting.
 * @returns {Promise<Array>} - Meeting record(s) from DB.
 */
async function fetchMeetingForEdit(meetingId) {
    try {
        return await mtnGetMeetingWithId.mtnGetMeetingForEdit(meetingId);
    } catch (error) {
        console.error('Error fetching meeting for edit:', error);
        logger.error('Error fetching meeting for edit:', error);
        throw new Error('Failed to fetch meeting for edit');
    }
}

/**
 * Convert meeting and occurrence times to a specific timezone.
 * Handles single-instance (non-recurring) and recurring meetings.
 * 
 * @param {Object} result - Zoom API response.
 * @param {string} timezone - Target timezone for formatting.
 */
function formatNormalMeetingTimes(result, timezone) {
    if (result.data.start_time) {
        const startDateTime = moment.tz(result.data.start_time, 'UTC').clone().tz(timezone);
        result.data.start_time = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");
    } else if (result.data.occurrences) {
        result.data.occurrences.forEach(occurrence => {
            const startDateTime = moment.tz(occurrence.start_time, 'UTC').clone().tz(timezone);
            occurrence.start_time = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");
        });
    }
}

/**
 * Special timezone formatting, including handling of 'Asia/Almaty' with fixed offset.
 * 
 * @param {Object} result - Zoom API response.
 * @param {string} timezone - Timezone string.
 */
function formatMeetingTimes(result, timezone) {
    if (result.data.start_time) {
        if (timezone === "Asia/Almaty") {
            const startDateTime = moment.utc(result.data.start_time).utcOffset('+05:00');
            result.data.start_time = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");

            result.data.occurrences.forEach(occurrence => {
                const startDateTime = moment.utc(occurrence.start_time).utcOffset('+05:00');
                occurrence.start_time = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");
            });

        } else {
            const startDateTime = moment.tz(result.data.start_time, 'UTC').clone().tz(timezone);
            result.data.start_time = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");

            result.data.occurrences.forEach(occurrence => {
                const startDateTime = moment.tz(occurrence.start_time, 'UTC').clone().tz(timezone);
                occurrence.start_time = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");
            });
        }
    }
}

/**
 * Main route handler: GET meeting info from Zoom and database and respond.
 * - Requires: meetingId, optional occurrence_id in req.body
 * - Returns: Meeting data in user's timezone with additional metadata
 */
exports.mtnGetMeetingWithId = async (req, res) => {
    try {
        // Generate access token before making Zoom API calls
        await main();

        const { meetingId, occurrence_id } = req.body;
        logger.info('mtnGetMeetingWithId');

        // Fetch Zoom meeting from API
        const result = await fetchMeetingFromZoom(meetingId, occurrence_id);

        if (result.status === 200) {
            // Get meeting metadata from internal DB
            const meeting = await fetchMeetingForEdit(meetingId);

            // Construct join URL with encrypted password
            const zainJoinUrl = `https://mtnzoom.xlogix.ca/?type=join&meetingNo=${result.data.id}&pwd=${result.data.encrypted_password}`;
            result.data.zainJoinUrl = zainJoinUrl;

            if (meeting.length > 0) {
                if (meeting[0].type == 8) {
                    // If it's a recurring meeting

                    const timeZone = meeting[0].timezone;
                    const utcStartTime = meeting[0].meeting_start_date;
                    let userTime;

                    // Handle Almaty timezone manually (Zoom does not handle it properly sometimes)
                    if (timeZone === "Asia/Almaty") {
                        userTime = moment.utc(utcStartTime).utcOffset('+05:00').format('YYYY-MM-DDTHH:mm:ssZ');
                    } else {
                        userTime = moment.utc(utcStartTime).tz(timeZone).format('YYYY-MM-DDTHH:mm:ssZ');
                    }

                    result.data.start_time = userTime;

                    // Set additional custom fields
                    result.data.settings.auto_recording = meeting[0].autoRecording;
                    result.data.zainTimezone = meeting[0].timezone;

                    // Format meeting and occurrences to the correct timezone
                    formatMeetingTimes(result, result.data.zainTimezone);

                } else {
                    // Non-recurring meeting formatting
                    result.data.settings.auto_recording = meeting[0].autoRecording;
                    result.data.zainTimezone = meeting[0].timezone;
                    formatNormalMeetingTimes(result, result.data.zainTimezone);
                }
            }

            // Respond with enriched meeting data
            res.json({ status: true, meeting: result.data });

        } else {
            // Zoom API did not return valid meeting
            res.status(404).json({ status: false, message: "Meeting not found" });
        }

    } catch (error) {
        console.log('Error in mtnGetMeetingWithId:', error);
        logger.error('Error in mtnGetMeetingWithId:', error);

        // Handle 404 specifically if Zoom API gives not found
        const statusCode = error?.response?.status || 500;
        if (statusCode == 404) {
            return res.status(404).json({ status: false, message: "MeetingId not found" });
        }

        // Generic internal server error
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
