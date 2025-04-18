const utils = require('../utils/utils');
const axios = require("axios");
const moment = require('moment');
require('moment-timezone');
const KJUR = require('jsrsasign');
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { JwtToken } = require('../utils/jwttoken');
const { instantMeeting } = require('../models/instantMeeting');
const { generateZoomAccessToken } = require('../auth/zoomtoken');

let accessToken;

// Function to generate and store Zoom access token
async function main() {
    try {
        accessToken = await generateZoomAccessToken();
    } catch (error) {
        logger.error('Error getting Zoom access token:', error);
        throw new Error('Could not get Zoom access token');
    }
}

// Fetch Zoom user by email
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

// Create an instant Zoom meeting
async function createZoomMeeting(email, payload) {
    try {
        const result = await axios.post(`https://api.zoom.us/v2/users/${email}/meetings`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return result.data;
    } catch (error) {
        logger.error('Error creating Zoom meeting:', error);
        throw new Error('Error creating Zoom meeting');
    }
}

// Get Zoom Access Token (ZAK) for user to start meeting as host
async function getZoomUserToken(email) {
    try {
        const result = await axios.get(`https://api.zoom.us/v2/users/${email}/token?type=zak`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return result.data.token;
    } catch (error) {
        logger.error('Error getting Zoom user token:', error);
        throw new Error('Error getting Zoom user token');
    }
}

// Controller: Create an instant meeting and return meeting details with JWT
exports.instantMeeting = async (req, res) => {
    try {
        // Initialize access token
        await main();
        logger.info('instanMeeting');

        const { timezone, topic } = req.body.payload;
        const { email: userEmail } = req.body;

        // Convert user email to MTN Zoom format
        const formattedEmail = utils.toMTNEmail(userEmail.toLowerCase());

        // Generate random 5-character passcode for meeting
        const passcode = Math.random().toString(36).substring(2, 7);

        const payload = {
            topic: topic,
            password: passcode,
            type: 1, // 1 = instant meeting
            timezone: timezone
        };

        // Fetch Zoom user data
        const user = await getZoomUser(formattedEmail);
        const userId = user.id || "";
        const pmi = user.pmi;

        // Create Zoom meeting
        const meetingData = await createZoomMeeting(formattedEmail, payload);

        // Get Zoom Authorization Key (ZAK) to start meeting
        const zak = await getZoomUserToken(formattedEmail);

        // Format meeting times
        const createdDate = moment(meetingData.created_at).format('YYYY/MM/DD HH:mm:ss');
        const scheduledDate = moment(payload.start_time).format('YYYY/MM/DD HH:mm:ss');

        // Save meeting details to the database
        await instantMeeting.saveMeeting(
            meetingData.start_url,
            meetingData.join_url,
            meetingData.id,
            meetingData.host_id,
            meetingData.host_email,
            meetingData.topic,
            meetingData.type,
            scheduledDate,
            createdDate,
            meetingData.timezone,
            meetingData.password,
            pmi
        );

        // Generate JWT token for Zoom Meeting SDK
        const iat = Math.round(new Date().getTime() / 1000) - 30;
        const exp = iat + 60 * 60 * 2; // valid for 2 hours

        const oHeader = { alg: 'HS256', typ: 'JWT' };
        const oPayload = {
            sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
            mn: meetingData.id,
            role: 1, // 1 = host, 0 = participant
            iat: iat,
            exp: exp,
            appKey: process.env.ZOOM_MEETING_SDK_KEY,
            tokenExp: exp
        };

        const sHeader = JSON.stringify(oHeader);
        const sPayload = JSON.stringify(oPayload);
        const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.ZOOM_MEETING_SDK_SECRET);

        // Get user's full name for display in the meeting
        const fullname = await instantMeeting.fetch_fullnamewithemail(userEmail);

        if (fullname && fullname.length > 0) {
            const firstName = fullname[0].firstName;
            const lastName = fullname[0].lastName;
            const username = `${firstName} ${lastName}`;

            // Send response with all required meeting data
            res.json({
                type: "start",
                email: formattedEmail,
                userId: userId,
                zak: zak,
                zoom_meeting_id: meetingData.id,
                password: meetingData.password,
                signature: signature,
                username: username,
                pmi: pmi
            });
        } else {
            logger.info("No username found");
            res.json({ status: false, message: "No username found" });
        }
    } catch (error) {
        // Log error and send error response
        logger.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
};

// Controller: Generate a JWT token (used for generic purposes like licensing etc.)
exports.generateJWT = async (req, res) => {
    try {
        logger.info("Generate JWT");

        // Generate token using custom utility
        const token = JwtToken.genToken24();

        if (token) {
            res.status(200).send({ status: true, Token: token });    
        } else {
            res.status(400).send({ status: false, message: "Internal error" });    
        }             
    } catch (e) {
        logger.error(e);
        res.status(500).send({ status: false, message: e.message });
    }
};
