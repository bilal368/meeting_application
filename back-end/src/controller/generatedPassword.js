// Import required modules
const utils = require('../utils/utils');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const { Logger } = require('../utils/logger');
const { generatePassword } = require('../models/generatedPassword');
const logger = Logger.logger;

// Secret key for JWT verification
const apiSecret = process.env.AUTHORIZATION_USER;

// ---------------- Helper Functions ----------------

// Validate password strength and structure
function validatePassword(password) {
    if (password.length < 8) {
        return 'Password must have at least 8 characters';
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return 'Password must have at least 1 letter and 1 number';
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        return 'Password must include both uppercase and lowercase characters';
    }
    if (/(\w)\1{3}/.test(password)) {
        return 'Password must not contain 4 consecutive characters';
    }
    return null;
}

// Encrypt password using AES-256 with random key and IV
function encryptPassword(password) {
    const encryptionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const encryptedPassword = utils.aes256(password, encryptionKey, iv);
    return { encryptedPassword, encryptionKey, iv };
}

// Verify JWT token and check expiration
function verifyToken(token) {
    try {
        const decodedToken = jwt.verify(token, apiSecret);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp > currentTime) {
            return decodedToken;
        }
        return null;
    } catch (error) {
        logger.error('Token verification error:', error);
        return null;
    }
}

// ---------------- Controllers ----------------

/**
 * Controller to handle password reset with OTP
 */
exports.generatePasswordOtp = async (req, res) => {
    try {
        logger.info('generatePasswordotp request received');

        const { email, password, otp, token } = req.body;

        // Validate required fields
        if (!email || !password || !otp || !token) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate password format
        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            return res.status(400).json({ error: passwordValidationError });
        }

        const lowercaseEmail = email.toLowerCase();
        const mtnEmail = utils.toMTNEmail(lowercaseEmail);

        // Encrypt the new password
        const { encryptedPassword, encryptionKey, iv } = encryptPassword(password);

        // Verify token
        const decodedToken = verifyToken(token);
        if (!decodedToken) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Check if email exists in the system
        const mailData = await generatePassword.forgetpassword_validateMail(mtnEmail);
        if (mailData.length === 0) {
            return res.status(404).json({ error: "User email not found" });
        }

        const loginId = mailData[0].loginId;
        const keytoken = `${loginId}${otp}`;

        // Update user login credentials with OTP
        const loginUpdateStatus = await generatePassword.forgetupdateUserLoginWithotp(encryptedPassword, encryptionKey, iv, keytoken);

        if (loginUpdateStatus) {
            return res.json({ status: true, message: "User updated successfully" });
        } else {
            return res.status(500).json({ error: "User update failed" });
        }
    } catch (error) {
        logger.error('Error in generatePasswordotp:', error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};

/**
 * Controller to handle password reset with token only
 */
exports.generatePassword = async (req, res) => {
    try {
        logger.info('generatePassword request received');

        const { password, token } = req.body;

        // Validate required fields
        if (!password || !token) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate password structure
        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            return res.status(400).json({ error: passwordValidationError });
        }

        // Encrypt the new password
        const { encryptedPassword, encryptionKey, iv } = encryptPassword(password);

        // Verify token
        const decodedToken = verifyToken(token);
        if (!decodedToken) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Authenticate token from DB (ensure it's not replaced by a newer one)
        const autheticateUserStatus = await generatePassword.forgetauthenticateUserWithToken(token);
        if (!autheticateUserStatus.length) {
            return res.status(404).json({ status: false, error: "Token has expired as a new token created" });
        }

        const loginId = autheticateUserStatus[0].loginId;
        const emailFromToken = utils.fromMTNEmail(autheticateUserStatus[0].username.trim());

        // Flag email as processed
        global.emailData[emailFromToken] = 1;

        // Generate new token after password change
        const updatetoken = jwt.sign({ email: emailFromToken, password: loginId }, apiSecret);

        // Update user login credentials in DB
        const loginUpdateStatus = await generatePassword.forgetupdateUserLoginWithId(encryptedPassword, encryptionKey, iv, token, updatetoken);

        if (loginUpdateStatus.success) {
            return res.json({ status: true, message: "User updated successfully" });
        } else {
            return res.status(500).json({ error: loginUpdateStatus.message });
        }
    } catch (error) {
        logger.error('Error in generatePassword:', error);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};
