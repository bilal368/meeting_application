// Importing the custom logger utility
const { Logger } = require('../utils/logger');

// Importing the model function that fetches user details using an authentication token
const { fetchUserWithId } = require('../models/fetchUserWithId');

// Initializing the logger instance
const logger = Logger.logger;

// Controller function to handle fetching a user by authentication token
exports.fetchUserWithId = async (req, res) => {
    try {
        // Logging the request reception
        logger.info('fetchUserWithId request received');

        // Extracting authentication token from the request body
        const authenticationToken = req.body.authenticationToken;

        // Validate that the token is present
        if (!authenticationToken) {
            logger.warn('Missing authentication token');
            return res.status(400).send({ message: "Missing authentication token" });
        }

        // Calling the model function to fetch user using the token
        const user = await fetchUserWithId.fetchUserWithId(authenticationToken);

        // Check if user was found
        if (user.length > 0) {
            // Return user data if found
            res.json(user);
        } else {
            // Handle case when token is invalid or user is not found
            logger.warn('Invalid authentication token');
            res.status(400).send({ message: "Invalid authentication token" });
        }

    } catch (e) {
        // Catch and log any errors during the process
        logger.error('Error fetching user: ', e);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
