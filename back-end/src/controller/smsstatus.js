const { Logger } = require('../utils/logger');
const logger = Logger.logger;

// Load environment variables (e.g., SMSURL, smsapiSecret)
require('../config/apiConfig')

// Send SMS
exports.smsstatus = async (req, res) => {
    try {
        // Get the SMS API secret from environment variables
        const smsapiSecret = process.env.smsapiSecret;
        logger.info('smsstatus');

        // Define the HTTP request options for sending SMS
        const options = {
            method: 'POST',
            url: process.env.SMSURL, // SMS API endpoint
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': smsapiSecret // Authentication key for SMS API
            },
            body: {
                "senderAddress": "MTN speechlogix",       // Sender identifier
                "receiverAddress": [                       // Receiver's phone number(s)
                    "2348032000300"
                ],
                "message": "string",                       // Message content (replace with actual text)
                "clientCorrelatorId": "string",            // Unique ID to correlate client requests (replace if needed)
                "keyword": "ACTIVATE",                     // SMS keyword for the service
                "serviceCode": "1001",                     // Service code provided by the SMS provider
                "requestDeliveryReceipt": false            // Flag to indicate if delivery report is needed
            },
            json: true
        };

        // Make the HTTP request to the SMS API
        request(options, function (error, response, body) {
            if (error) throw new Error(error);  // Throw error if request fails
            console.log('error', error);        // Log the error to console (will be null if successful)
            logger.error(error);                // Log the error using custom logger
        });
    } catch (err) {
        // Log any unexpected error that occurs during the try block
        logger.error(err);
    }
}
