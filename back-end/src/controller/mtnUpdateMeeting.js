// Import required modules
const axios = require("axios");
const moment = require('moment');
require('moment-timezone'); // Required for time zone conversion
const utils = require('../utils/utils'); // Utility functions
const { Logger } = require('../utils/logger'); // Logger for application logging
const logger = Logger.logger;
const { generateZoomAccessToken } = require('../auth/zoomtoken'); // Function to generate Zoom access token
const { mtnUpdateMeeting } = require('../models/mtnUpdateMeeting'); // DB operation to update meeting details

let accessToken; // Store access token globally

// Function to generate and assign Zoom access token
async function main() {
    try {
        accessToken = await generateZoomAccessToken();
    } catch (error) {
        console.error('Error generating Zoom access token:', error);
        logger.error('Error generating Zoom access token:', error);
        throw new Error('Failed to generate Zoom access token');
    }
}

// Function to send PATCH request to Zoom to update meeting details
async function updateZoomMeeting(meetingId, payload) {
    try {
        return await axios.patch(`https://api.zoom.us/v2/meetings/${meetingId}`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Add token to request header
            }
        });
    } catch (error) {
        console.error('Error updating Zoom meeting:', error);
        logger.error('Error updating Zoom meeting:', error);
        throw error;
    }
}

// Function to update meeting record in the database
async function updateMeetingInDatabase(topic, password, timezone, startTime, meetingId, autoRecording, meeting_start_date, type) {
    try {
        const id = await mtnUpdateMeeting.UpdateMeeting(
            topic,
            password,
            timezone,
            startTime,
            meetingId,
            autoRecording,
            meeting_start_date,
            type
        );

        // Return true if the database update was successful
        return id !== -1;
    } catch (error) {
        console.error('Error updating meeting in database:', error);
        logger.error('Error updating meeting in database:', error);
        return false;
    }
}

// Main API controller to update meeting both in Zoom and local DB
exports.mtnUpdateMeeting = async (req, res) => {
    try {
        await main(); // Generate Zoom access token

        logger.info('mtnUpdateMeeting'); // Log entry point

        // Destructure input data from request body
        const { meetingId, payload } = req.body;
        let { topic, password, timezone, start_time: startTime, type, recurrence } = payload;

        // If recurring meeting (type 8), ensure end date is formatted correctly
        if (type == 8 && recurrence) {
            const endDateTime = recurrence.end_date_time;
            if (endDateTime) {
                const datePortion = endDateTime.split('T')[0];
                payload.recurrence.end_date_time = `${datePortion}T23:59:59Z`; // Ensure full-day coverage
            }
        }

        // Replace space with "+" if present in start time (URL-safe)
        if (startTime.includes(' ')) {
            startTime = startTime.replace(' ', '+');
            payload.start_time = startTime; // Update payload
        }

        // Convert the start time to UTC for consistent storage
        startTime = utils.convertTimetoUtc(startTime);

        // Update the meeting on Zoom using the modified payload
        const zoomResult = await updateZoomMeeting(meetingId, payload);

        // Zoom API returns 204 status for successful update
        if (zoomResult.status === 204) {
            const type = payload.type;
            const autoRecording = payload.settings.auto_recording;

            // Convert start time into UTC format for DB update
            const meeting_start_date = moment(payload.start_time).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

            // Update meeting info in our local database
            const dbUpdateSuccess = await updateMeetingInDatabase(
                topic,
                password,
                timezone,
                startTime,
                meetingId,
                autoRecording,
                meeting_start_date,
                type
            );

            if (dbUpdateSuccess) {
                return res.json({ status: true }); // Success response
            } else {
                return res.json({ status: false, message: 'Failed to update meeting in database' });
            }
        } else {
            // Zoom did not return expected success status
            return res.json({ status: false, message: 'Failed to update meeting on Zoom' });
        }
    } catch (error) {
        console.error('Error in mtnUpdateMeeting:', error);
        logger.error('Error in mtnUpdateMeeting:', error);

        // Determine if error was due to not found meeting
        const statusCode = error?.response?.status || 500;
        if (statusCode == 404) {
            return res.status(404).json({ status: false, message: "MeetingId not found" });
        }

        // Internal server error fallback
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
