const jwt = require('jsonwebtoken');
const utils = require('../utils/utils');
const moment = require('moment');
const Client = require('../redis');
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
require("../config/env");
const apiSecret = process.env.AUTHORIZATION_USER;
const { userLogin } = require('../models/userLogin');

// Main user login function
exports.userlogin = async (req, res) => {
    try {
        logger.info('userlogin:');

        const email_user = req.body.email;
        const email = utils.toMTNEmail(req.body.email.toLowerCase()); // Normalize and convert email
        const password = req.body.password;

        const hashname = 'password'; // Redis hash key
        const value = await Client.hget(hashname, email); // Get failed login attempt count from Redis

        if (value > 5) {
            // If failed attempts > 5, check for lockout
            const users = await userLogin.fetch_attempt(email);
            
            if (users.length > 0) {
                const formattedAttemptDate = new Date(users[0].formatted_attempt_date);
                const currentDate = new Date();
                const loginId = users[0].loginId;

                // Check time difference to apply lockout
                const timeDifferenceInSeconds = Math.floor((currentDate - formattedAttemptDate) / 1000);
                if (timeDifferenceInSeconds > 0 && timeDifferenceInSeconds <= 180) {
                    const remainingTime = 180 - timeDifferenceInSeconds;
                    return res.status(429).json({ status: false, message: `Time remaining: ${remainingTime} seconds`, seconds: remainingTime });
                } else {
                    // Lockout expired: reset attempt count
                    await Client.hset(hashname, email, 1);
                    await handleUserLogin(email, email_user, password, hashname, res);
                }
            } else {
                // No attempt record: allow login
                await handleUserLogin(email, email_user, password, hashname, res);
            }
        } else {
            // Less than 5 failed attempts: allow login
            await handleUserLogin(email, email_user, password, hashname, res);
        }
    } catch (error) {
        logger.error("4334", error);
        res.status(500).json({ status: "Error occurred" });
    }
};

// Handles login logic: validate credentials and authenticate
const handleUserLogin = async (email, email_user, password, hashname, res) => {
    try {
        const checkUserwithemail = await userLogin.checkUserwithemail(email); // Get user details by email

        // Invalid or unregistered user
        if (!checkUserwithemail || checkUserwithemail.password === 'invalid') {
            const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await Client.hincrby(hashname, email, 1);
            await userLogin.failed_attempt(checkUserwithemail.loginId, email, currentDate);
            return res.status(404).json({ status: "User not found", message: "Password is not generated or invalid" });
        }

        // Missing encrypted data
        if (checkUserwithemail.encryptionKeyHex === null || checkUserwithemail.ivHex === null || checkUserwithemail.password === null || email === null) {
            return res.status(404).json({ status: "User not found", message: "Invalid email. Please try again" });
        }

        // Decrypt stored password and compare
        const { encryptionKeyHex: encryptionKey, ivHex: iv, password: encryptedPassword, loginId } = checkUserwithemail;
        const decryptedPassword = utils.deaes256(encryptionKey, iv, encryptedPassword);

        // Validate password
        if (password !== decryptedPassword) {
            await handleInvalidPassword(email, loginId, hashname, res); // Wrong password handler
        } else {
            await processValidUser(email, email_user, password, hashname, res); // Successful login
        }
    } catch (error) {
        logger.error("Error in handleUserLogin:", error);
        res.status(500).json({ status: "Internal Server Error" });
    }
};

// Handles invalid login attempts
const handleInvalidPassword = async (email, loginId, hashname, res) => {
    try {
        const value = await Client.hget(hashname, email);

        if (value == 5) {
            // Trigger lockout after 5th failure
            const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await userLogin.failed_attempt(loginId, email, currentDate);
            await Client.hincrby(hashname, email, 1);
            return res.status(429).json({ status: false, message: `Time remaining: 180 seconds`, seconds: 180 });
        } else {
            // Just increment failed attempt
            const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            await Client.hincrby(hashname, email, 1);
            await userLogin.failed_attempt(loginId, email, currentDate);
            return res.status(404).json({ status: "User not found", message: "Password is incorrect" });
        }
    } catch (error) {
        logger.error("Error in handleInvalidPassword:", error);
        res.status(500).json({ status: "Error occurred" });
    }
};

// Finalizes valid user login and returns token and profile info
const processValidUser = async (email, email_user, password, hashname, res) => {
    try {
        const users = await userLogin.checkUserForLogin(email);
        if (users.length > 0) {
            const loginIduser = users[0].loginId;

            if (loginIduser) {
                // Fetch profile details
                const fullnameData = await userLogin.fetch_fullnamewithloginId(loginIduser);
                const { firstName, lastName, timezone, phone, pmi } = fullnameData[0];
                const username = `${firstName} ${lastName}`;

                // Generate JWT token
                const token = jwt.sign({ email, password }, apiSecret);
                await userLogin.updateUserToken(token, email);

                // Send response to client
                res.status(200).json({
                    status: "User found",
                    token,
                    Data: users,
                    username,
                    timezone,
                    email_user,
                    phone,
                    pmi
                });

                // Reset Redis attempts
                const trimmedEmail = email.trim();
                global.emailData[trimmedEmail] = 0;
                await Client.hset('mtn', trimmedEmail, 0);
                await Client.hset(hashname, email, 1);
            }
        } else {
            res.status(404).json({ status: "User not found", message: "Invalid email. Please try again" });
        }
    } catch (error) {
        logger.error("Error in processValidUser:", error);
        res.status(500).json({ status: "Error occurred" });
    }
};
