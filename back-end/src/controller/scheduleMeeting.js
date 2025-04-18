// Required modules and utilities
const axios = require("axios");
const utils = require('../utils/utils');
const moment = require('moment');
const nodemailer = require("nodemailer");
require('moment-timezone');
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { scheduleMeeting } = require('../models/scheduleMeeting');
const { generateZoomAccessToken } = require('../auth/zoomtoken');

let accessToken;

// Generate Zoom API access token
async function main() {
    try {
        accessToken = await generateZoomAccessToken();
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to get Zoom API access token');
    }
}

// Retrieve Zoom user details using email
async function getZoomUser(email) {
    try {
        const result = await axios.get(`https://api.zoom.us/v2/users/${email}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return result.data;
    } catch (error) {
        logger.error('Error getting Zoom user:', error);
        throw new Error('User email not found');
    }
}

// Create Zoom user if they don’t exist and then schedule a meeting
async function createUserAndScheduleMeeting(email, firstName, lastName, phone, payload, password, timezone, res) {
    const lowercaseEmail = email.toLowerCase();
    const mtnEmail = utils.toMTNEmail(lowercaseEmail);
    
    const createpayload = {
        action: "custCreate",
        user_info: {
            email: mtnEmail,
            type: "1", // Basic user
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
        },
    };

    try {
        const result = await axios.post('https://api.zoom.us/v2/users', createpayload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const user = await getZoomUser(result.data.email);
        const email = user.email;
        const pmi = user.pmi;

        // Save PMI for the user
        await scheduleMeeting.update_pmi(email, pmi);

        // Proceed to handle user and schedule meeting
        await handleZoomUserCreation(result, mtnEmail, payload, password, timezone, res);
    } catch (error) {
        // Handle errors related to user creation
        await handleZoomUserCreationError(error, res);
    }
}

// Handles Zoom user creation success: updates DB and schedules the meeting
async function handleZoomUserCreation(result, email, payload, password, timezone, res) {
    if (result.status !== 201) {
        throw new Error('Failed to create Zoom user');
    }

    const { id: zoomUserId, email: zoomEmail } = result.data;

    // Update Zoom user ID in DB
    await scheduleMeeting.update_zoomid_User(zoomUserId, zoomEmail);
    await scheduleMeeting.update_zoomid_Userlogin(zoomUserId, zoomEmail);

    // Schedule the meeting
    await scheduleMeetingForExistingUser(email, payload, password, timezone, res, zoomUserId);
}

// Handles specific error scenarios like user creation limit reached
async function handleZoomUserCreationError(error, res) {
    if (error.response && error.response.data && error.response.data.code === 3412) {
        // If user creation limit reached, send alert email
        await sendZoomLimitAlertEmail();
        res.status(400).send({
            error: "Thank you for choosing our meeting platform. We've noticed you might be facing a unique situation. To ensure a swift resolution, we encourage you to reach out to our dedicated customer support team. They are ready to assist you and provide the necessary guidance."
        });
    } else {
        console.error('Error creating user:', error.message);
        res.status(400).send({ error: "An error occurred." });
    }
}

// Sends email to alert support team that Zoom user limit has been reached
async function sendZoomLimitAlertEmail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: '587',
        secure: false,
        auth: {
            user: 'speechlogixemailalert@gmail.com',
            pass: 'wedc rtlv xwtg ywva',
        },
        tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.sendMail({
            from: '"Meetings+" <speechlogixemailalert@gmail.com>',
            to: 'appnotifications@speechlogix.com',
            cc: ['speechlogix@gmail.com', 'rasheed@speechlogix.com', 'shabeeb@speechlogix.com', 'jamal@speechlogix.com', 'bilal@speechlogix.com'],
            subject: "Zoom Database Full with 10,000 Users",
            text: "Zoom Database is full with 10,000 users. Please take action.",
            html: `
                <p></p>
                <p>Import Alert: User Creation Limit Reached</p>
                <p>We regret to inform you that our Zoom user creation limit has been reached. We are unable to create new user accounts at this time.</p>
                <p>If you require additional user accounts or have any questions, please take the necessary action to address this matter as soon as possible.</p>
                <p>Thank you for your understanding,</p>
                <p>Meetings+ Team</p>
            `,
        });
        console.log("Alert email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

// Schedules Zoom meeting for an existing user
async function scheduleMeetingForExistingUser(email, payload, password, timezone, res, zoomUserId) {
    if (payload.start_time.includes(' ')) {
        payload.start_time = payload.start_time.replace(' ', '+');
    }

    const mtnEmail = email;

    try {
        // Get Zoom user details
        const userDetails = await axios.get(`https://api.zoom.us/v2/users/${mtnEmail}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        zoomUserId = zoomUserId || userDetails.data.id;
        const displayName = userDetails.data.display_name;

        // Schedule the meeting
        const meetingResult = await axios.post(`https://api.zoom.us/v2/users/${mtnEmail}/meetings`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // Get Zoom ZAK token (used for starting meeting)
        const tokenResult = await axios.get(`https://api.zoom.us/v2/users/${mtnEmail}/token?type=zak`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const {
            id: meetingId,
            encrypted_password: encryptedPassword,
            start_url: startUrl,
            join_url: joinUrl,
            host_id: hostId,
            host_email: hostEmail,
            topic,
            type,
            created_at: createdAt
        } = meetingResult.data;

        const zak = tokenResult.data.token;

        // Custom URLs for joining and starting meeting via white-label solution
        const zainStartUrl = `https://mtnzoom.xlogix.ca/?type=start&username=${mtnEmail}&pwd=${encryptedPassword}&userId=${zoomUserId}&meetingNo=${meetingId}&zak=${zak}`;
        const zainJoinUrl = `https://mtnzoom.xlogix.ca/?type=join&meetingNo=${meetingId}&pwd=${encryptedPassword}`;

        const createdDate = moment(createdAt).format('YYYY/MM/DD HH:mm:ss');
        const scheduledDate = moment(payload.start_time).format('YYYY/MM/DD HH:mm:ss');
        const meeting_start_date = moment(payload.start_time).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

        if (startUrl && joinUrl) {
            const autoRecording = payload.settings.auto_recording;

            // Save meeting details in DB
            const insertId = await scheduleMeeting.saveMeeting(
                startUrl,
                joinUrl,
                meetingId,
                hostId,
                hostEmail,
                topic,
                type,
                scheduledDate,
                createdDate,
                timezone,
                password,
                autoRecording,
                meeting_start_date
            );

            if (insertId > 0) {
                return res.json({
                    status: true,
                    type: "start",
                    displayName: displayName,
                    email: email,
                    userId: zoomUserId,
                    zak: zak,
                    zoom_meeting_id: meetingId,
                    joinUrl: joinUrl,
                    zainStartUrl: zainStartUrl,
                    zainJoinUrl: zainJoinUrl,
                    scheduled_date: scheduledDate
                });
            }
            res.json({ status: false, message: "Meeting not inserted in database" });
        } else {
            res.json({ status: false });
        }
    } catch (error) {
        console.error("Error scheduling meeting:", error.message);
        logger.error(error);
        res.json({ status: false, data: error.message });
    }
}

// Main controller: validate email, create user if needed, and schedule meeting
exports.scheduleMeeting = async (req, res) => {
    try {
        await main(); // Get access token
        logger.info('schedulemeeting');

        console.log("payload", req.body.payload);

        const { email, payload } = req.body;
        const { password, type: meetingType, start_time: startTime, recurrence, timezone } = payload;

        // For recurring meetings, set end time
        if (meetingType == 8 && recurrence) {
            const endDateTime = recurrence.end_date_time;
            if (endDateTime) {
                const datePortion = endDateTime.split('T')[0];
                payload.recurrence.end_date_time = `${datePortion}T23:59:59Z`;
            }
        }

        // Check if email exists in DB
        const mailData = await scheduleMeeting.validateMail(email);
        if (mailData.length == 0) {
            return res.status(404).send({ status: false, message: "Email id not exists" });
        }

        // Fetch Zoom user ID by email
        const data = await scheduleMeeting.fetch_zoomidwithemail(email);
        if (data.length === 0) {
            return res.status(404).json({ status: "Email given in Schedulemeeting Invalid" });
        }

        const { zoom_user_id, firstName, lastName, phone } = data[0];

        // If no Zoom ID, create user
        if (zoom_user_id === 'null') {
            await createUserAndScheduleMeeting(email, firstName, lastName, phone, payload, password, timezone, res);
        } else {
            const lowercaseEmail = email.toLowerCase();
            const mtnEmail = utils.toMTNEmail(lowercaseEmail);
            await scheduleMeetingForExistingUser(mtnEmail, payload, password, timezone, res);
        }
    } catch (error) {
        logger.error(error);
        console.error("An error occurred:", error);
        res.status(500).send({ error: "An internal server error occurred." });
    }
};
