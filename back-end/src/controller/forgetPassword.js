// Import utility functions, logger, JWT, and nodemailer
const utils = require('../utils/utils');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { Logger } = require('../utils/logger');
const { forgetPassword } = require('../models/forgetPassword');

// Secret key used to sign JWTs
const apiSecret = 'Yhs0mguwCewsrKwtyrR87ZIu4BbFAYv180h0';

// Initialize logger instance
const logger = Logger.logger;

// Controller for web: Handles password reset email sending
exports.forgetPassword = async (req, res) => {
    try {
        logger.info('forgetPassword request received');

        // Extract email from request body
        const email = req.body.email;
        if (!email) {
            logger.warn('Missing email in request');
            return res.status(400).send({ message: "Missing email" });
        }

        // Convert email to lowercase and format to MTN format
        const usermail = email.toLowerCase();
        const mtnEmail = utils.toMTNEmail(usermail);

        // Validate if the user exists with the given email
        const mailData = await forgetPassword.forgetpassword_validateMail(mtnEmail);
        if (mailData.length === 0) {
            return res.status(404).send({ error: "Username does not exist" });
        }

        // Generate JWT token using loginId
        const loginId = mailData[0].loginId;
        const token = generateToken(loginId);

        // Save the token to the database
        if (await forgetPassword.updatetoken(loginId, token)) {
            // Send reset password email
            const emailSent = await sendEmail(loginId, usermail, token);

            if (emailSent) {
                return res.status(200).send({ status: "Mail sent successfully" });
            }
        }

        // If any of the above steps fail
        res.status(405).send({ status: "error", message: "An unexpected error occurred while sending the email." });

    } catch (error) {
        logger.error(error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
};

// Controller for mobile: Handles password reset via email + OTP
exports.forgotPasswordMobile = async (req, res) => {
    try {
        logger.info('forgotpasswordmobile request received');

        const { email, otp } = req.body;
        if (!email || !otp) {
            logger.warn('Missing email or OTP in request');
            return res.status(400).send({ message: "Missing email or OTP" });
        }

        // Normalize and validate the email
        const usermail = email.toLowerCase();
        const mtnEmail = utils.toMTNEmail(usermail);

        const mailData = await forgetPassword.forgetpassword_validateMail(mtnEmail);
        if (mailData.length === 0) {
            return res.status(404).send({ error: "Username does not exist" });
        }

        // Prepare token and key for verification
        const loginId = mailData[0].loginId;
        const phone = mailData[0].phone;
        const keytoken = `${loginId}${otp}`;
        const token = generateToken(loginId);

        // Save OTP token in DB
        if (await forgetPassword.updatetokenotp(loginId, token, keytoken)) {
            // Send email and OTP SMS
            const emailSent = await sendOtpEmail(loginId, usermail, token, otp);
            if (emailSent) {
                await forgetPassword.sentOTPSMS(otp, phone);
                return res.status(200).send({ status: "mail send successfully", token });
            }
        }

        res.status(405).send({ status: "error", message: "An unexpected error occurred while sending the email." });

    } catch (error) {
        logger.error(error);
        res.status(500).send({ error: "An internal server error occurred" });
    }
};

// Generates JWT token with 30 minutes expiry
function generateToken(loginId) {
    const expirationTime = Math.floor(Date.now() / 1000) + 1800; // 30 minutes from now
    return jwt.sign({ loginId, exp: expirationTime }, apiSecret);
}

// Sends password reset email (for web)
async function sendEmail(loginId, email, token) {
    try {
        const { firstName, lastName } = await fetchUserNameByEmail(email);

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

        const info = await transporter.sendMail({
            from: '"Meetings+" <speechlogixemailalert@gmail.com>',
            to: email,
            subject: "Reset password",
            text: "Reset password",
            html: `
                <p><strong>Hi ${firstName} ${lastName},</strong></p>
                <p>We have received a request to regenerate your password for Meetings+.</p>
                <p>To proceed with the password regeneration process, please click on the following link:</p>
                <p><a href="https://mtnzoom.xlogix.ca/resetPassword/${token}">Reset password</a></p>
                <p>Once you click the link, you will be directed to a page where you can reset your new password.</p>
                <p><strong>Note: If you did not initiate this request or believe it was a mistake, you can safely ignore this email.</strong></p>
                <p>If you have any questions or need further assistance, please feel free to reach out to us.</p>
                <p>Thanks,</p>
                <p>Meetings+ Team</p>
            `,
        });

        logger.info(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('Error sending email:', error);
        return false;
    }
}

// Sends OTP email (for mobile)
async function sendOtpEmail(loginId, email, token, otp) {
    try {
        const { firstName, lastName } = await fetchUserNameByEmail(email);

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

        const info = await transporter.sendMail({
            from: '"Meetings+" <speechlogixemailalert@gmail.com>',
            to: email,
            subject: "Reset password",
            text: "Reset password",
            html: `
                <p><strong>Hi ${firstName} ${lastName},</strong></p>
                <p>We have received a request to regenerate your password for Meetings+.</p>
                <p>To proceed with the password reset, please use the following one-time passcode (OTP):</p>
                <p>OTP: ${otp}</p>
                <p><strong>Note: If you did not initiate this request, please ignore this email.</strong></p>
                <p>If you have any questions or need further assistance, please feel free to reach out to us.</p>
                <p>Thanks,</p>
                <p>Meetings+ Team</p>
            `,
        });

        logger.info(`OTP email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('Error sending OTP email:', error);
        return false;
    }
}

// Fetches user's first and last name using their email
async function fetchUserNameByEmail(email) {
    try {
        const data = await forgetPassword.fetch_namewithemail(email);
        return { firstName: data[0].firstName, lastName: data[0].lastName };
    } catch (error) {
        logger.error('Error fetching user name by email:', error);
        throw error;
    }
}
