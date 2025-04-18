// Required external modules
const axios = require("axios");
const utils = require('../utils/utils');
let moment = require('moment');
require('moment-timezone');

// Logger utility
const { Logger } = require('../utils/logger');
const logger = Logger.logger;

// Database model for fetching Zoom-related user data
const { listMeeting } = require('../models/listMeeting');

// Import Zoom token generator
const { generateZoomAccessToken } = require('../auth/zoomtoken');

// Declare a global variable to hold the Zoom access token
let accessToken;

// Get Zoom API Access Token
async function main() {
    try {
        accessToken = await generateZoomAccessToken(); // Fetch and set Zoom access token
    } catch (error) {
        console.error('Error:', error);
    }
}

// List all meetings for a given user
exports.listMeetings = async (req, res) => {
    try {
        await main(); // Ensure accessToken is set before making API calls

        logger.info('listMeetings');
        let email = req.body.email;
        let email_user = email; // Keep original email for DB lookup
        let lowercaseEmail = email.toLowerCase();
        email = utils.toMTNEmail(lowercaseEmail); // Convert email to MTN domain format

        // Fetch zoom user details from DB using original email
        const data = await listMeeting.fetch_zoomidwithemail(email_user);

        if (data.length === 0) {
            res.json({ Status: "email given in listMeetings Invalid" });
            return;
        }

        // Extract relevant user info
        let userTimeZone = data[0].timezone;
        let zoom_user_id = data[0].zoom_user_id;
        let displayName = `${data[0].firstName} ${data[0].lastName}`;

        // If the user has no Zoom user ID, return an empty meeting list
        if (zoom_user_id === 'null') {
            console.log("user has to create");
            res.json({ status: true, normalMeeting: [], recurrenceMeeting: [] });
            return;
        }

        /**
         * Fetch all upcoming meetings using Zoom pagination
         * Supports large number of meetings using next_page_token
         */
        async function getAllMeetings(email, accessToken) {
            let meetings = [];
            let nextPageToken;

            do {
                const url = `https://api.zoom.us/v2/users/${email}/meetings?page_size=300&type=upcoming_meetings${nextPageToken ? `&next_page_token=${nextPageToken}` : ''}`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (response.status !== 200) {
                    throw new Error(`Failed to fetch meetings: ${response.statusText}`);
                }

                meetings = meetings.concat(response.data.meetings);
                nextPageToken = response.data.next_page_token;
            } while (nextPageToken); // Continue if there are more pages

            return meetings;
        }

        // Make parallel API calls: one to fetch ZAK token, another to get all meetings
        const [zakResponse, meetingsResponse] = await Promise.all([
            axios.get(`https://api.zoom.us/v2/users/${email}/token?type=zak`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            getAllMeetings(email, accessToken)
        ]);

        // If failed to fetch either, return error
        if (meetingsResponse.length < 0 || zakResponse.status !== 200) {
            res.json({ status: false });
            return;
        }

        const meetings = meetingsResponse;
        const zak = zakResponse.data.token; // ZAK token used to start meeting

        // Fetch timezone info for all meetings in parallel
        const meetingIds = meetings.filter(meeting => meeting.type === 2 || meeting.type === 8).map(meeting => meeting.host_id);
        const timezones = await Promise.all(meetingIds.map(id => listMeeting.fetch_timezone_with_zoomMeetingId(id)));

        // Map host_id to timezone
        const timezoneMap = {};
        timezones.forEach((timezone, index) => {
            timezoneMap[meetingIds[index]] = timezone.length > 0 ? timezone[0].timezone : null;
        });

        const normalMeeting = [];      // Type 2 meetings
        const recurrenceMeeting = [];  // Type 8 meetings (Recurring)

        // Loop through each meeting and format data
        for (const meeting of meetings) {
            if (meeting.type !== 2 && meeting.type !== 8) continue; // Skip other types

            const usertimezone = timezoneMap[meeting.host_id];
            if (!usertimezone) {
                normalMeeting.push({ status: "User timezone not Found", valid: false });
                continue;
            }

            // Convert and format time from UTC to user's timezone
            const startDateTime = moment.tz(meeting.start_time, 'UTC').clone().tz(usertimezone || 'Africa/Algiers');
            const formattedStartTime = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");
            const scheduledDate = startDateTime.format("YYYY/MM/DD HH:mm:ss");

            // Extract meeting password from join URL
            const password = meeting.join_url.split("=")[1];

            // Create a custom join URL
            const zainJoinUrl = `https://mtnzoom.xlogix.ca?type=join&meetingNo=${meeting.id}&pwd=${password}`;

            const meetingDetails = {
                ...meeting,
                start_time: formattedStartTime,
                scheduledDate,
                zak,
                displayName,
                zainJoinUrl,
                valid: true
            };

            // Categorize meeting based on type
            if (meeting.type === 2) {
                normalMeeting.push(meetingDetails);
            } else if (meeting.type === 8) {
                const meetingGroup = recurrenceMeeting.find(group => group[0].id === meeting.id);
                if (meetingGroup) {
                    meetingGroup.push(meetingDetails);
                } else {
                    recurrenceMeeting.push([meetingDetails]);
                }
            }
        }

        // Handle edge case: invalid meeting due to timezone issue
        const invalidMeeting = normalMeeting.find(meeting => !meeting.valid);
        if (invalidMeeting) {
            res.json(invalidMeeting);
        } else {
            res.status(200).json({
                status: true,
                normalMeeting: normalMeeting.filter(meeting => meeting.valid),
                recurrenceMeeting
            });
        }
    } catch (e) {
        console.log("error: " + e);
        logger.error(e);
        res.json({ status: false, message: e.message });
    }
};
// List Normal Meetings
exports.listMeetingPost = async (req, res) => {
    try {
        await main();

        let email = req.body.email;
        logger.info('listmeetingpost');
        let email_user = req.body.email;
        let lowercaseEmail = email.toLowerCase();
        email = utils.toMTNEmail(lowercaseEmail);

        const data = await listMeeting.fetch_zoomidwithemail(email_user);


        if (data.length === 0) {
            res.json({ Status: "email given in listmeeting Invalid" });
            return;
        }

        let zoom_user_id = data[0].zoom_user_id;
        let displayName = `${data[0].firstName} ${data[0].lastName}`;

        if (zoom_user_id === 'null') {
            console.log("user has to create");
            res.json({ status: true, scheduledMeeting: [] });
            return;
        }

        // Make Zoom API calls in parallel
        const [meetingsResponse, zakResponse] = await Promise.all([
            axios.get(`https://api.zoom.us/v2/users/${email}/meetings?page_size=300&&type=upcoming_meetings`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            axios.get(`https://api.zoom.us/v2/users/${email}/token?type=zak`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        ]);

        if (meetingsResponse.status !== 200 || zakResponse.status !== 200) {
            res.json({ status: false });
            return;
        }

        const meetings = meetingsResponse.data.meetings;
        const zak = zakResponse.data.token;

        // Fetch timezones in parallel and map them to their respective meeting IDs
        const meetingIds = meetings.filter(meeting => meeting.type === 2).map(meeting => meeting.host_id);
        const timezones = await Promise.all(meetingIds.map(id => listMeeting.fetch_timezone_with_zoomMeetingId(id)));

        // Create a mapping of host_id to timezone
        const timezoneMap = {};
        timezones.forEach((timezone, index) => {
            timezoneMap[meetingIds[index]] = timezone.length > 0 ? timezone[0].timezone : null;
        });

        const scheduledMeeting = meetings.map((meeting, index) => {
            if (meeting.type !== 2) return null;

            const usertimezone = timezoneMap[meeting.host_id];
            if (!usertimezone) {
                return { status: "User timezone not Found", valid: false };
            }

            const startDateTime = moment.tz(meeting.start_time, 'UTC').clone().tz(usertimezone || 'Africa/Algiers');
            const formattedStartTime = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");
            const scheduledDate = startDateTime.format("YYYY/MM/DD HH:mm:ss");
            const password = meeting.join_url.split("=")[1];
            const zainJoinUrl = `https://mtnzoom.xlogix.ca?type=join&meetingNo=${meeting.id}&pwd=${password}`;

            return {
                ...meeting,
                start_time: formattedStartTime,
                scheduledDate,
                zak,
                displayName,
                zainJoinUrl,
                valid: true
            };
        }).filter(meeting => meeting !== null);

        const invalidMeeting = scheduledMeeting.find(meeting => !meeting.valid);
        if (invalidMeeting) {
            res.json(invalidMeeting);
        } else {
            res.json({ status: true, scheduledMeeting: scheduledMeeting.filter(meeting => meeting.valid) });
        }

    } catch (e) {
        console.log("error: " + e);
        logger.error(e);
        res.json({ status: false, message: e.message });
    }
}
// List Recurring Meetings
exports.listRecurringMeeting = async (req, res) => {
    try {
        await main();
        let email = req.body.email;
        logger.info('listRecurringMeeting');
        let email_user = req.body.email;
        let lowercaseEmail = email.toLowerCase();
        email = utils.toMTNEmail(lowercaseEmail);

        const data = await listMeeting.fetch_zoomidwithemail(email_user);

        if (data.length > 0) {
            let zoom_user_id = data[0].zoom_user_id;
            let firstName = data[0].firstName;
            let lastName = data[0].lastName;
            let phone = data[0].phone;

            if (zoom_user_id === 'null') {
                console.log("user has to create");
                res.json({ status: true, recurrenceMeeting: [] });
                return;
            }
            const [meetingsResponse, zakResponse] = await Promise.all([
                axios.get(`https://api.zoom.us/v2/users/${email}/meetings?page_size=300&&type=upcoming_meetings`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }),
                axios.get(`https://api.zoom.us/v2/users/${email}/token?type=zak`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                })
            ]);
            if (meetingsResponse.status !== 200 || zakResponse.status !== 200) {
                res.json({ status: false });
                return;
            }

            const meetings = meetingsResponse.data.meetings;
            const zak = zakResponse.data.token;

            // Fetch timezones in parallel
            const timezonePromises = meetings
                .filter(meeting => meeting.type === 2 || meeting.type === 8)
                .map(meeting => listMeeting.fetch_timezone_with_zoomMeetingId(meeting.host_id));

            const timezones = await Promise.all(timezonePromises);

            const recurrenceMeeting = meetings.reduce((acc, meeting, index) => {
                if (meeting.type === 2 || meeting.type === 8) {
                    const timezone = timezones[index];
                    if (!timezone || timezone.length === 0) {
                        res.json({ Status: "User timezone not Found" });
                        return acc;
                    }

                    const usertimezone = timezone[0].timezone;
                    const startDateTime = moment.tz(meeting.start_time, 'UTC').clone().tz(usertimezone || 'Asia/Kolkata');
                    const formattedStartTime = startDateTime.format("YYYY-MM-DDTHH:mm:ss[Z]");
                    const scheduledDate = startDateTime.format('YYYY/MM/DD HH:mm:ss');

                    const password = meeting.join_url.split("=")[1];
                    const zainJoinUrl = `https://mtnzoom.xlogix.ca?type=join&meetingNo=${meeting.id}&pwd=${password}`;

                    acc.push({
                        ...meeting,
                        start_time: formattedStartTime,
                        scheduledDate,
                        zak,
                        zainJoinUrl
                    });
                }
                return acc;
            }, []);

            // Group meetings by their 'id'
            const groupedMeetings = recurrenceMeeting.reduce((acc, meeting) => {
                if (!acc[meeting.id]) {
                    acc[meeting.id] = [];
                }
                acc[meeting.id].push(meeting);
                return acc;
            }, {});

            const groupedMeetingSets = Object.values(groupedMeetings);
            res.json({ status: true, recurrenceMeeting: groupedMeetingSets });
        } else {
            res.json({ Status: "email given in listRecurringMeeting Invalid" });
        }
    } catch (err) {
        logger.error(err);
        console.log(err);
        res.json({ status: false, message: err.message });
    }
}



