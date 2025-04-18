const log4js = require('log4js');
const logger = log4js.getLogger("db.js");
const util = require('util');
const axios = require("axios");
const request = require('request');
require("../config/apiConfig")
const smsapiSecret = process.env.smsapiSecret;
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

const { generateZoomAccessToken } = require('../auth/zoomtoken');
let accessToken;

// Get the Zoom API access token
async function main() {
    try {
        // Get the Zoom API access token by awaiting the asynchronous function
        accessToken = await generateZoomAccessToken();
        console.log('list Zoom token:', accessToken);
        // Now you can use the accessToken in your code

    } catch (error) {
        console.error('Error:', error);
    }
}


class endpoints {

    // Validating email
    static async validateMail(email) {
        try {
            const data = await dbQueryPromise("SELECT email_id,userType FROM tb_users WHERE email_id=?", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return -1;
        }
    }

    static validateEmailPhone = async function (email, phone) {
        try {
            const data = await dbQueryPromise("SELECT email_id,userMail FROM tb_users WHERE email_id=? AND phone = ?;", [email, phone]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
        }
    }

    // Validating phone number
    static async validatePhone1(phone) {
        try {
            const data = await dbQueryPromise("SELECT phone, loginId FROM tb_users WHERE phone=?", [phone]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    // Check if user is active
    static async validateloginId(validloginId) {
        try {
            const data = await dbQueryPromise("SELECT isActive FROM tb_userLogin WHERE loginId=?", [validloginId]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    // Create user login
    static async createUserLogin(email_id, token) {
        try {
            let zoom_user_id = 'null';
            const data = await dbQueryPromise("INSERT INTO tb_userLogin(zoomUserId, username, autheticationToken, type, status) VALUES (?, ?, ?, 'user', '0')", [zoom_user_id, email_id, token]);
            logger.info(`createUser  ${data.insertId}`);
            return data.insertId;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    // Create user in tb_users
    static async createUser(firstName, lastName, phone, email_id, usermail, timezone, type, loginId, orgId, userType) {
        try {
            console.log("working createuser");
            const data = await dbQueryPromise("INSERT INTO tb_users (zoom_user_id, firstName, lastName, phone, email_id, userMail, timezone, type, loginId, orgId, date_created, userType) VALUES ('null', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(),?)", [firstName, lastName, phone, email_id, usermail, timezone, type, loginId, orgId, userType]);
            logger.info(`createUser  ${data.insertId}`);
            return data.insertId;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    // Fetch user details using userId
    static async getUserWithId(userId) {
        try {
            const data = await dbQueryPromise("SELECT * FROM tb_users WHERE user_id=?", [userId]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    //Sent user creation SMS
    static async sentSMS(phone, email) {
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
                    `${phone}`
                ],
                "message": "Thanks for joining! Your Meeting+ registration is confirmed.",
                "clientCorrelatorId": "MTN",
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
                return body
            });
        } catch (err) {
            console.error("An error occurred:", err.message);
            // You can perform error handling here, such as calling the callback with an error or taking other appropriate actions.
        }
    }

    // user suspension
    static suspendUser = async function (PhoneNumber) {
        try {
            const results = await dbQueryPromise("SELECT COUNT(*) as userCount, isActive FROM tb_userLogin WHERE loginId = (SELECT loginId FROM tb_users WHERE userMail = ?)GROUP BY isActive;", [email]);

            if (results.length > 0) {
                if (results[0].userCount > 0) {
                    if (results[0].isActive == 2) {
                        return { status: false, message: "User exists But Already Suspended" };
                    } else {
                        const data = await dbQueryPromise("UPDATE tb_userLogin SET isActive = 2 WHERE loginId = (SELECT loginId FROM tb_users WHERE userMail = ?)", [email]);
                        console.log("suspend user data: %o", data);
                        if (data.affectedRows == 1) {
                            return { status: true };
                        } else {
                            return { status: false };
                        }
                    }
                } else if (results[0].isActive == null) {
                    return { status: false, message: "The customer with the provided Phone Number has not logged in yet. Please ensure that the user has successfully logged in before proceeding." };
                } else {
                    return { status: false, message: "The customer with the provided Phone Number does not exist." };
                }
            } else {
                return { status: false, message: "The customer with the provided Phone Number does not exist." };
            }
        } catch (err) {
            console.error(err);
            return { status: false };
        }
    };

    static validatePhone = async function (phone) {
        try {
            const data = await dbQueryPromise("SELECT phone,userMail FROM tb_users WHERE phone=?", [phone]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }


    static userBundlePlan = async function (email, inBundleDurationDays, inExpiryDays, inMTNTransactionId) {
        try {
            // Call the stored procedure
            const data = await dbQueryPromise("CALL spAddUserBundlePlan(?,?,?,?,?);", [
                email, 
                inBundleDurationDays, 
                inExpiryDays, 
                inMTNTransactionId, 
                null
            ]);
            
            // Extract values from the returned data
            const { userBundlePlanId: insertId, bundleStartDate, bundleExpiryDateAndTIme } = data[0][0];
        
            // Return the results
            return { 
                error: "", 
                insertId, 
                bundleStartDate, 
                bundleExpiryDateAndTIme 
            };
        } catch (err) {
            // Log the error and return it in the response
            console.error("Error executing spAddUserBundlePlan:", err);
            return { 
                error: err || err, 
                insertId: "" 
            };
        }        
    }

    //Sent bundlepurchase SMS
    static sentbundleSMS = async function (inMobile, bundlePlan) {
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
                    `${inMobile}`
                ],
                "message": `Thank you for selecting the ${bundlePlan} bundle. We look forward to exceeding your expectations.`,
                "clientCorrelatorId": "MTN Plan",
                "keyword": "ACTIVATE",
                "serviceCode": "1001",
                "requestDeliveryReceipt": false
            },
            json: true
        };

        try {
            const body = await axios.post(process.env.SMSURL, options);
            console.log("bundlepurchase sms", body.data);
            return body.data;
        } catch (error) {
            console.error("sms error", error);
        }
    }

    //fetch name from users using email
    static fetch_namewithemail = async function (email) {
        try {
            const data = await dbQueryPromise("SELECT firstName, lastName FROM tb_users WHERE userMail = ?;", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    };

    //user Account Balance
    static checkAccountBalance = async function (email) {
        try {
            return await dbQueryPromise("CALL spGetUserBundlePlans(?);", [email]);
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    //validating email
    static validateEmail = async function (email) {
        try {
            return await dbQueryPromise("SELECT userMail,phone FROM tb_users WHERE userMail=?;", [email]);
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    //delete users
    static deleteusers = async function (email) {
        try {
            await main();
            const data = await dbQueryPromise("SELECT loginId, email_id FROM tb_users WHERE userMail = ?;", [email]);

            if (data.length > 0) {
                const loginId = data[0].loginId;
                const email = data[0].email_id;

                // Define a separate function to perform the deletion
                const deleteZoomUser = async (email) => {
                    try {
                        const response = await axios.delete(`https://api.zoom.us/v2/users/${email}`, {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            },
                            params: {
                                action: 'delete'
                            }
                        });

                        console.log("Zoom User Deletion Response:", response.data);
                        return response;
                    } catch (error) {
                        console.error('Error deleting Zoom user:', error.message);
                        return null;
                    }
                };

                try {
                    // Call the deleteZoomUser function and await the result
                    const zoomDeletionResponse = await deleteZoomUser(email);

                    // User successfully deleted from Zoom, now you can delete from your database
                    const deletionResults = await Promise.all([
                        dbQueryPromise("DELETE FROM tb_users WHERE loginId = ?;", [loginId]),
                        dbQueryPromise("DELETE FROM tb_userLogin WHERE loginId = ?;", [loginId])
                    ]);

                    return deletionResults;
                } catch (innerError) {
                    console.error("Error deleting Zoom user:", innerError);
                    throw innerError;
                }
            } else {
                console.log("No data found for the specified phone number");
                return [];
            }
        } catch (outerError) {
            console.error("Error querying user data:", outerError);
            throw outerError;
        }
    };
}

module.exports = { endpoints: endpoints }