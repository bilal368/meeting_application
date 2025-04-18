const utils = require('../utils/utils');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Logger } = require('../utils/logger');
const { updateUserWithId } = require('../models/updateUserWithId');

const apiSecret = process.env.AUTHORIZATION_USER;
const logger = Logger.logger;

/**
 * Updates a user’s information (name, timezone, and password) and sends a confirmation email.
 */
exports.updateUserWithId = async (req, res) => {
    try {
        logger.info('updateUserWithId');

        const { email, firstName, lastName, timezone, password, token, userId } = req.body;

        // -------------------- PASSWORD VALIDATION --------------------

        // Ensure password is at least 8 characters long
        if (password.length < 8) {
            return res.status(400).json({ status: false, error: 'Password must have at least 8 characters' });
        }

        // Ensure password has both letters and numbers
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).json({ status: false, error: 'Password must have at least 1 letter and 1 number' });
        }

        // Ensure password includes both uppercase and lowercase letters
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
            return res.status(400).json({ status: false, error: 'Password must include both uppercase and lowercase characters' });
        }

        // Prevent password from containing 4 consecutive identical characters
        if (/(\w)\1{3}/.test(password)) {
            return res.status(400).json({ status: false, error: 'Password must not contain 4 consecutive characters' });
        }

        // -------------------- ENCRYPT PASSWORD --------------------

        const encryptionKey = crypto.randomBytes(32); // Create a random 256-bit encryption key
        const iv = crypto.randomBytes(16); // Generate initialization vector
        const encryptedPassword = utils.aes256(password, encryptionKey, iv); // Encrypt the password

        // -------------------- AUTHENTICATE USER BY TOKEN --------------------

        const authenticateUserStatus = await updateUserWithId.authenticateUserWithToken(token);
        if (authenticateUserStatus.length === 0) {
            return res.status(404).json({ status: false, error: "User not found" });
        }

        // -------------------- UPDATE USER LOGIN --------------------

        const loginUpdateStatus = await updateUserWithId.updateUserLoginWithId(encryptedPassword, encryptionKey, iv, token);
        if (!loginUpdateStatus) {
            return res.status(500).json({ status: false, error: "User update failed" });
        }

        // -------------------- GENERATE NEW TOKEN AND UPDATE USER INFO --------------------

        const updateToken = jwt.sign({ email, userId }, apiSecret); // Create a new JWT token for user
        const userUpdateStatus = await updateUserWithId.updateUserWithId(firstName, lastName, timezone, updateToken, token);
        if (!userUpdateStatus) {
            return res.status(500).json({ status: false, error: "User update failed" });
        }

        // -------------------- SEND CONFIRMATION EMAIL --------------------

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: '587',
            secure: false,
            auth: {
                user: 'speechlogixemailalert@gmail.com',
                pass: 'wedc rtlv xwtg ywva', // App-specific password
            },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: '"Meetings+" <speechlogixemailalert@gmail.com>',
            to: email,
            subject: "Welcome to MTN",
            text: "Welcome to MTN",
            html: `
                <p>Hi ${firstName} ${lastName},</p>
                <p>Thank you for registering for Meetings+!</p>
                <p>Getting Started with Meetings+</p>
                <p>To begin using Meetings+, you can choose from a variety of platforms:</p>
                <ul>
                    <li>Web Portal: <a href="https://mtnzoom.xlogix.ca/">Open Web portal</a></li>
                    <li>Android App: <a href="https://play.google.com/store/apps/details?id=com.mtn.mtnmeetings.android">Download the Android app</a></li>
                    <li>iOS App: <a href="https://apps.apple.com/us/app/mtn-meetings-app/id6483723877">Download the iOS app</a></li>
                    <li>Windows Application: <a href="https://meetings.mtn.com/downloads/windows/Meetings.msixbundle">Download the Windows app</a></li>
                    <li>Note: Compatible with Windows 11 and Newer Versions.</li>
                </ul>
                <p>Logging In</p>
                <p>Once you have chosen your preferred platform, log in using the email address and password you created during registration.</p>
                <p>We hope you enjoy using Meetings+!</p>
                <p>Thanks,</p>
                <p>Meetings+ team</p>
            `
        };

        // Try sending email
        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ status: true, message: "User updated" });
        } catch (error) {
            logger.error("Error sending email:", error);
            res.status(500).json({ status: false, error: "Failed to send email" });
        }

    } catch (error) {
        // Catch any unhandled errors and respond
        logger.error("An error occurred:", error);
        res.status(500).json({ status: false, error: "An error occurred" });
    }
};
