// Importing the jsrsasign library for JWT creation
const KJUR = require('jsrsasign');

// Importing custom logger
const { Logger } = require('../utils/logger');
const logger = Logger.logger;

// Importing the fetchTimeZone model method
const { fetchTimeZone } = require('../models/fetchTimeZone');

// Controller to fetch timezone data
exports.fetchTimezone = async (req, res) => {
    logger.info('fetchTimezone');
    try {
        // Fetch the timezone list from the model
        const timezone = await fetchTimeZone.getTimezone();

        // If timezone data is found, send it in the response
        if (timezone.length > 0) {
            res.status(200).json({ timezone, status: true });
        } else {
            // If no data is found, respond with a 404 status
            res.status(404).json({ status: false, message: 'No timezones found' });
        }
    } catch (e) {
        // Log and return a 500 error in case of failure
        logger.error('Error fetching timezones', e);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Controller to generate a Zoom Meeting SDK signature
exports.signature = async (req, res) => {
    logger.info('signature');
    try {
        // Destructure the meetingNumber and role from the request body
        const { meetingNumber, role } = req.body;

        // Validate required fields
        if (!meetingNumber || !role) {
            return res.status(400).json({ status: false, message: 'Meeting number and role are required' });
        }

        // Calculate the issued at time (iat) and expiration time (exp)
        const iat = Math.floor(Date.now() / 1000) - 30; // start 30 seconds earlier to account for latency
        const exp = iat + 60 * 60 * 2; // valid for 2 hours

        // Header and payload objects for the JWT
        const oHeader = { alg: 'HS256', typ: 'JWT' };
        const oPayload = {
            sdkKey: process.env.ZOOM_MEETING_SDK_KEY, // Zoom SDK Key
            mn: meetingNumber,                        // Meeting number
            role: role,                               // Role: 0 for participant, 1 for host
            iat: iat,                                 // Issued at timestamp
            exp: exp,                                 // Expiration timestamp
            appKey: process.env.ZOOM_MEETING_SDK_KEY, // Required by Zoom SDK
            tokenExp: exp                             // Token expiration
        };

        // Convert header and payload to JSON strings
        const sHeader = JSON.stringify(oHeader);
        const sPayload = JSON.stringify(oPayload);

        // Sign the JWT using HS256 algorithm and secret
        const signature = KJUR.jws.JWS.sign(
            'HS256',
            sHeader,
            sPayload,
            process.env.ZOOM_MEETING_SDK_SECRET
        );

        // Respond with the generated signature
        res.status(200).json({ signature });

    } catch (err) {
        // Log and return a 500 error in case of signature generation failure
        logger.error('Error generating signature', err);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
