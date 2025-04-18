const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { spGetUserAllBundlePlans } = require('../models/getAlluserBundleplan');

// User Plan History
exports.userPlanHistory = async (req, res) => {
    try {
        // Log the incoming request
        logger.info('userplan_history');

        // Extract values from the request body
        const email = req.body.email;
        const timezone = req.body.timezone;
        const inRecordsPerPage = req.body.limit || 50; // Default to 50 records per page if not provided
        const inPageNumber = 1; // Always fetch the first page

        // Basic input validation
        if (!email || !timezone) {
            return res.status(400).json({ 
                status: false, 
                message: "Email and timezone are required" 
            });
        }

        // Call the stored procedure to get the user's bundle plan purchase history
        const plan = await spGetUserAllBundlePlans.bundlepurshasehistoryPhone(
            email, 
            timezone, 
            inPageNumber, 
            inRecordsPerPage
        );

        // If data is returned, respond with the bundle plans
        if (plan.length > 0) {
            return res.json({
                status: true,
                Bundleplans: plan
            });
        } else {
            // If no data is found for the user
            return res.status(404).json({
                status: false,
                message: "Data not found"
            });
        }
    } catch (error) {
        // Log any unexpected error and return an error response
        logger.error("An error occurred:", error);
        return res.status(500).json({
            status: false,
            message: "An internal error occurred"
        });
    }
};
