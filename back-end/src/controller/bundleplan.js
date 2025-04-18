const moment = require('moment');
const { bundleplan } = require('../models/bundleplan');
const { Logger } = require('../utils/logger');
const logger = Logger.logger;

// Mapping of plan display names based on internal bundle plan names
const PLAN_NAMES = {
    '7 day plan': '(Week)',
    'One day plan': '(Day)',
    '30 day plan': '(Month)',
};

// Main controller to check user's bundle plan
exports.bundlePlan = async (req, res) => {
    try {
        logger.info('checkUser Bundleplan');

        const { email } = req.body;
        let expiryDate;

        // Validate if email is provided
        if (!email) {
            return res.status(400).json({ status: false, message: "Invalid username" });
        }

        // Fetch account balance and bundle plan details for the user
        const [accountBalance] = await bundleplan.checkAccountBalance(email);

        // If plans are found
        if (accountBalance && accountBalance.length > 0) {
            let hasActivePlan = false;
            let No_UpcomingPlan = 0;

            // Loop through plans to identify active and upcoming ones
            for (let i = 0; i < accountBalance.length; i++) {
                if (accountBalance[i].BundleStatus === 'Active') {
                    hasActivePlan = true;
                    break; // Stop if active plan is found
                }
                if (accountBalance[i].BundleStatus === 'Upcoming') {
                    No_UpcomingPlan++; // Count upcoming plans
                }
            }

            // Set status message for upcoming plans
            let upcomingStatus = "You have no upcoming plans.";
            if (No_UpcomingPlan > 0) {
                upcomingStatus = `You have ${No_UpcomingPlan} upcoming plan(s).`;
            }

            // If active plan exists, respond with its details
            if (hasActivePlan) {
                const activePlan = accountBalance.find(plan => plan.BundleStatus === 'Active');
                const planName = PLAN_NAMES[activePlan.bundlePlanName] || activePlan.bundlePlanName;
                expiryDate = moment(activePlan.bundleExpiryDateAndTIme).format("DD/MM/YYYY");

                return res.json({
                    status: true,
                    plan_name: planName,
                    date: expiryDate,
                    message: `Meetings⁺ ${planName} expires on ${expiryDate}`,
                    No_UpcomingPlan: No_UpcomingPlan,
                    upcomingStatus: upcomingStatus
                });
            } else {
                // No active plan but maybe upcoming ones exist
                return res.json({
                    status: false,
                    plan_name: '(No active plans)',
                    date: '',
                    message: 'No active plans available.'
                });
            }
        } else {
            // No plans found for the user
            return res.json({
                status: false,
                plan_name: '(No active plans)',
                date: '',
                message: 'No active plans available.'
            });
        }
    } catch (error) {
        // Handle unexpected errors
        logger.error(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};
