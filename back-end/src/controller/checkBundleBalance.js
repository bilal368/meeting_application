const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { checkUserBundleBalance } = require('../models/checkUserBundleBalance');

// Controller to check if a user has a valid bundle balance for a specific Zoom meeting
exports.checkUserBundleBalance = async (req, res) => {
    try {
        logger.info('checkUserBundleBalance');

        // Extracting userId and Zoom meetingId from request body
        const { loginId: userId, meetingId: inZoomMeetingId } = req.body;

        // Validate required fields
        if (!userId || !inZoomMeetingId) {
            return res.status(400).json({ status: false, message: "Invalid input data" });
        }

        // Check if user exists by ID
        const user = await checkUserBundleBalance.checkUserWithId(userId);

        // If user not found
        if (user.length === 0) {
            return res.status(404).json({ status: false, message: "User ID not found" });
        }

        // Check if user is host of the Zoom meeting and has an associated plan
        const plan = await checkUserBundleBalance.checkHostUserId(userId, inZoomMeetingId);

        // If plan is not found
        if (plan.length === 0) {
            return res.status(404).json({ status: false, message: "User ID or Zoom Meeting ID not found" });
        }

        // Extract and send the plan data (usually first row, first object)
        const data = plan[0][0];
        res.status(200).json({ status: true, data });

    } catch (err) {
        // Log and handle any unexpected errors
        logger.error(err);
        console.error(err);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

// Controller to check the current balance or plan status of a host user
exports.checkHostBalance = async (req, res) => {
    try {
        logger.info('checkHostbalance');

        // Extract userId from request body
        const { loginId: userId } = req.body;

        // Validate required input
        if (!userId) {
            return res.status(400).json({ status: false, message: "Invalid input data" });
        }

        // Fetch account balance or bundle info for the given user
        const plan = await checkUserBundleBalance.checkUserAccountBalance(userId);

        // If no balance/plan data found
        if (plan.length === 0) {
            return res.status(404).json({ status: false, message: "User balance not found" });
        }

        // Extract and return the data
        const data = plan[0][0];
        res.json({ status: true, data });

    } catch (error) {
        // Log and handle unexpected errors
        logger.error(error);
        console.error("Error in checkHostbalance:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};
