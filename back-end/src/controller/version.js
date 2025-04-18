const { Logger } = require('../utils/logger');
var moment = require('moment');
require('moment-timezone');
const logger = Logger.logger;
const { version } = require('../models/version');

// Gets the versions
exports.version = async (req, res) => {
    try {
        logger.info('version');

        // Extract system and version info from request body
        const { system, version: appVersion } = req.body;

        // Default response values
        let MAINTENANCE_value = false;
        let UPDATES_value = false;
        let maintenanceMessage = 'No Updates available';
        let compulsory = false;
        let latestVersion = null;
        let link = null;
        let updateMessage = 'No Updates available';
        let start_date = null;
        let end_date = null;
        let url = null;
        let date_show = null;
        let seconds_tostart = 0;
        let seconds_left = 0;

        // Fetch maintenance data from the database
        const maintenanceData = await version.maintenance();

        // Check if maintenance mode is active
        if (maintenanceData.length >= 1 && maintenanceData[0].status === 'true') {
            const {
                start_date: startDate,
                end_date: endDate,
                seconds_tostart: secondsToStart,
                seconds_left: secondsLeft,
                date_show: dateShow
            } = maintenanceData[0];

            // Set maintenance variables
            MAINTENANCE_value = true;
            start_date = startDate;
            end_date = endDate;
            seconds_tostart = secondsToStart;
            seconds_left = secondsLeft;
            date_show = dateShow;

            // Convert maintenance time to local timezone and format
            const startDateTime = moment.tz(startDate, 'UTC').clone().tz('Africa/Algiers');
            const endDateTime = moment.tz(endDate, 'UTC').clone().tz('Africa/Algiers');
            const formattedstartDateTime = startDateTime.format('DD-MM-YYYY h:mm A');
            const formattedendDateTime = endDateTime.format('DD-MM-YYYY h:mm A');

            maintenanceMessage = `There will be a maintenance of application from ${formattedstartDateTime} to ${formattedendDateTime} (Africa/Algiers).`;

            // If maintenance period is expired, disable it
            if (secondsToStart === 0 && secondsLeft === 0) {
                MAINTENANCE_value = false;
                maintenanceMessage = 'No Updates available';
            }
        }

        // Fetch version information from DB based on system and current version
        const versionData = await version.version(system, appVersion);

        if (versionData.length > 0) {
            // Extract version-related information
            compulsory = versionData.value;
            latestVersion = versionData[0].version;
            url = versionData[0].url;
        } else if (
            system !== 'Windows' &&
            system !== 'IOS' &&
            system !== 'Mac' &&
            system !== 'Android' &&
            system !== 'Angular'
        ) {
            // Return error for unsupported system type
            res.status(400).json({ status: false, message: "Given Operating system is wrong" });
            return;
        }

        // Compare user app version with the latest system version
        const compareVersions = (appVersion, systemVersion) => {
            if (appVersion && systemVersion) {
                const appVersionComponents = appVersion.split('.').map(Number);
                const systemVersionComponents = systemVersion.split('.').map(Number);

                // Compare each part (major, minor, patch)
                for (let i = 0; i < Math.max(appVersionComponents.length, systemVersionComponents.length); i++) {
                    const appComponent = appVersionComponents[i] || 0;
                    const systemComponent = systemVersionComponents[i] || 0;

                    if (appComponent > systemComponent) {
                        updateMessage = "App version is greater than System version";
                        return 'App version is greater than System version';
                    } else if (appComponent < systemComponent) {
                        // Update is available
                        UPDATES_value = true;
                        latestVersion = systemVersion;
                        link = url;
                        updateMessage = 'A new version is available!';
                        return 'System version is greater than App version';
                    }
                }
                return 'App version is equal to System version';
            } else {
                return 'App version is greater than System version';
            }
        };

        // Run the version comparison logic
        const comparisonResult = compareVersions(appVersion, latestVersion);

        // Construct update response object
        const updatesObject = {
            status: UPDATES_value,
            message: updateMessage,
            ...(latestVersion && { latestVersion }),
            ...(link && { link }),
            compulsory: compulsory  
        };

        // Construct maintenance response object
        const maintenanceObject = {
            status: MAINTENANCE_value,
            message: maintenanceMessage,
            title: "Maintenance",
            ...(start_date && { start_date }),
            ...(end_date && { end_date }),
            ...(seconds_tostart && { seconds_tostart }),
            ...(seconds_left && { seconds_left }),
            ...(date_show && { date_show })
        };

        // Send final response
        res.status(200).json({
            status: true,
            MAINTENANCE: maintenanceObject,
            UPDATES: updatesObject,
        });
    } catch (error) {
        // Log and return internal error
        logger.error("An error occurred:", error);
        res.status(500).json({ status: false, message: "An error occurred" });
    }
};
