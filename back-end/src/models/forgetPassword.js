const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');
const smsapiSecret = process.env.smsapiKey;

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class forgetPassword {
    static forgetpassword_validateMail = async function (email) {
        try {
            const data = await dbQueryPromise("SELECT email_id,loginId,phone FROM tb_users WHERE email_id=?;", [email]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    static updatetoken = async function (loginId, token) {
        try {
            const data = await dbQueryPromise(
                "UPDATE tb_userLogin SET forgetToken = ? WHERE loginId = ?",
                [token, loginId]
            );

            logger.info(`Updated autheticationToken for loginId: ${loginId}`);
            console.log(`Updated autheticationToken for loginId: ${loginId}`);

            return data.affectedRows;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    //fetch name from users using email
    static fetch_namewithemail = async function (email) {
        try {
            const data = await dbQueryPromise(
                "SELECT firstName, lastName FROM tb_users WHERE userMail = ?;",
                [email]
            );

            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    };

    static updatetokenotp = async function (loginId, token, keytoken) {
        try {
            const data = await dbQueryPromise(
                "UPDATE tb_userLogin SET forgetToken = ?, otpToken = ? WHERE loginId = ?",
                [token, keytoken, loginId]
            );
    
            logger.info(`Updated autheticationToken for loginId: ${loginId}`);
            console.log(`Updated autheticationToken for loginId: ${loginId}`);
    
            return data.affectedRows;
        } catch (error) {
            console.error("Error querying user data:", error);
            return -1;
        }
    };
    

    //Sent bundlepurchase SMS
    static sentOTPSMS = function (OTP, phone) {
        const options = {
            method: 'POST',
            url: process.env.SMSURL,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': smsapiSecret
            },
            body: {
                "senderAddress": "MTN speechlogix",
                "receiverAddress": [
                    phone
                ],
                "message": `You've requested a password reset for your account. To proceed, please use the following One-Time Password (OTP):

			${OTP}`,
                "clientCorrelatorId": "Password reset",
                "keyword": "ACTIVATE",
                "serviceCode": "1001",
                "requestDeliveryReceipt": false
            },
            json: true
        };

        try {
            request(options, function (error, response, body) {
                if (error) {
                    console.log("sms error", error);
                    logger.error(error);
                }

                console.log("OTP sms", body);
                logger.info("OTP send ::");
            });
        } catch (err) {
            console.error("An error occurred:", err.message);
            logger.error(err);
        }
    }
}

module.exports = { forgetPassword: forgetPassword }