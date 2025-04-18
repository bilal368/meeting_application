const axios = require("axios");
const utils = require('../utils/utils');
const nodemailer = require("nodemailer");
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { generateZoomAccessToken } = require('../auth/zoomtoken');
const { mtnUpdateUserLicense } = require('../models/mtnUpdateUserLicense');

let accessToken;

/**
 * Generates Zoom API access token and assigns it to global accessToken variable
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
 * Sends an email notification when Zoom user creation limit (10,000 users) is reached
 */
async function sendDatabaseFullEmail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: '587',
        secure: false,
        auth: {
            user: 'speechlogixemailalert@gmail.com',
            pass: 'wedc rtlv xwtg ywva', // App password
        },
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
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
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info("Database full email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        logger.error("Error sending email:", error);
    }
}

/**
 * Creates a new Zoom user using the custCreate API
 * @param {*} email - Email of the user
 * @param {*} firstName - First name
 * @param {*} lastName - Last name
 * @param {*} phone - Phone number
 * @returns Zoom user data
 */
async function createZoomUser(email, firstName, lastName, phone) {
    const createPayload = {
        action: "custCreate",
        user_info: {
            email,
            type: "1", // Basic user type
            first_name: firstName,
            last_name: lastName,
            phone_number: phone
        }
    };

    try {
        const result = await axios.post('https://api.zoom.us/v2/users', createPayload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const user = await getZoomUser(result.data.email);
        return result.data, user;
    } catch (error) {
        // Check if error code indicates user creation limit reached
        if (error.response && error.response.data && error.response.data.code === 3412) {
            await sendDatabaseFullEmail();
            throw new Error("Your account has reached the maximum number of basic users. Please remove some users before adding another.");
        } else {
            throw new Error('Error creating Zoom user');
        }
    }
}

/**
 * Updates a user's license type on Zoom
 * @param {*} email - Email of the user
 * @param {*} payload - License update payload
 * @returns true if successful
 */
async function updateZoomUserLicense(email, payload) {
    try {
        const result = await axios.patch(`https://api.zoom.us/v2/users/${email}`, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return result.status === 204;
    } catch (error) {
        throw new Error('Error updating Zoom user license');
    }
}

/**
 * Handles full license update flow including database update
 * @param {*} email - Email of the user
 * @param {*} type - License type
 * @param {*} payload - Zoom API payload
 * @returns true if update is successful
 */
async function processUserLicenseUpdate(email, type, payload) {
    const users = await mtnUpdateUserLicense.mtnGetUserForWebHook(email);

    if (users.length === 0) {
        throw new Error("User not found");
    }

    const isLicenseUpdated = await updateZoomUserLicense(email, payload);

    if (isLicenseUpdated) {
        const updateStatus = await mtnUpdateUserLicense.mtnUpdateUserType(type, email);
        return updateStatus === 0;
    } else {
        throw new Error("User license update failed");
    }
}

/**
 * Fetches Zoom user details using email
 * @param {*} email - User email
 * @returns Zoom user object
 */
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

/**
 * Main endpoint to create or update a Zoom user license
 */
exports.mtnUpdateUserLicense = async (req, res) => {
    try {
        await main(); // Generate Zoom access token
        logger.info('mtnUpdateUserLicense');

        const { email, timezone } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const formattedEmail = utils.toMTNEmail(lowercaseEmail); // Formats MTN-style email
        const payload = { type: "2" }; // Set license type to Pro (2)
        const type = 2;

        // Check if user exists in DB
        const userData = await mtnUpdateUserLicense.fetch_zoomidwithemail(email);
        
        if (userData.length === 0) {
            return res.status(400).json({ status: false, message: "Invalid email provided" });
        }

        const { zoom_user_id, firstName, lastName, phone } = userData[0];

        if (zoom_user_id === 'null') {
            // User does not yet have a Zoom ID, so create and update DB
            try {
                const zoomUserData = await createZoomUser(formattedEmail, firstName, lastName, phone);             
                await mtnUpdateUserLicense.update_zoomid_User(zoomUserData.id, zoomUserData.email);
                await mtnUpdateUserLicense.update_zoomid_Userlogin(zoomUserData.id, zoomUserData.email, zoomUserData.pmi);

                const isSuccess = await processUserLicenseUpdate(formattedEmail, type, payload);
                res.json({ status: isSuccess });
            } catch (error) {
                logger.error('Error in user creation process:', error);
                res.status(400).json({ status: false, message: error.message });
            }
        } else {
            // Zoom user ID exists, so just update license
            try {
                const isSuccess = await processUserLicenseUpdate(formattedEmail, type, payload);
                res.json({ status: isSuccess });
            } catch (error) {
                logger.error('Error in user update process:', error);
                res.status(400).json({ status: false, message: error.message });
            }
        }
    } catch (error) {
        logger.error('Error in mtnUpdateUserLicense:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
