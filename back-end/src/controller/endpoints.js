const log4js = require('log4js');
const logger = log4js.getLogger("db.js");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { endpoints } = require('../models/endpoints');
const uuid = require('uuid');
const { Client } = require('@elastic/elasticsearch');
const axios = require("axios");
const utils = require('../utils/utils');
require('../config/apiConfig');
const { JwtToken } = require('../utils/jwttoken');
const moment = require('moment');
require('moment-timezone');

const client = new Client({
    node: process.env.nodeurl,
    auth: {
        username: process.env.elasticusername,
        password: process.env.elasticpassword,
    },
});

const apiSecret = process.env.apiSecret;
let token = "";
JwtToken.genToken();

// Create user with Bundle purchase
exports.bundlepurchaseupdate = async (req, res) => {
    try {
        logger.info('Request Headers:', req.headers);
        logger.info('Request Body:', req.body);
        logger.info('Request query:', req.query);

        const email = req.query.email.toLowerCase();
        const email_id = utils.toMTNEmail(email);
        const { MTNTransactionId, bundlePlan } = req.query;

        // Validate email
        if (!isValidEmail(email)) return res.status(400).send({ error: 'Invalid email format.' });

        // Validate MTNTransactionId
        if (!MTNTransactionId || MTNTransactionId === 'null') {
            return res.status(400).send({ error: 'MTNTransactionId does not exist.' });
        }

        // Check if user exists
        const mailData = await endpoints.validateMail(email_id);
        if (mailData.length > 0) {
            await handleExistingUser(mailData[0], MTNTransactionId, bundlePlan, email, res);
        } else {
            await handleNewUser(req, email, email_id, MTNTransactionId, bundlePlan, res);
        }
    } catch (error) {
        logger.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};
// Email Validation
const isValidEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};
// Handle Existing User
const handleExistingUser = async (userData, MTNTransactionId, bundlePlan, email, res) => {
    const { userType } = userData;
    const { inBundleDurationDays, inExpiryDays } = getBundlePlanDetails(bundlePlan);

    const userBundlePlan = await endpoints.userBundlePlan(email, inBundleDurationDays, inExpiryDays, MTNTransactionId);
    if (userBundlePlan.error) {
        return res.status(409).json({ status: false, error: userBundlePlan.error.sqlMessage });
    }

    // Handle Elasticsearch indexing
    try {
            const response = await indexElasticsearch('mtn_development', userBundlePlan.insertId, {
            code: 201,
            description: "Bundle Purchased",
            data: { email, bundlePlan, date: new Date(), userType },
        });
        // Log the response from Elasticsearch to check the details
    console.log("Elasticsearch response:", response);
    } catch (error) {
        console.error("Error indexing to Elasticsearch:", error.message);
        // Log or handle the error as needed, but continue with the rest of the logic
        convertedemail = utils.toMTNEmail(email);
        elasticErrorsendMail(convertedemail, error.message);
    }

    let bundleStartDate = userBundlePlan.bundleStartDate;
    let bundleExpiryDateAndTIme = userBundlePlan.bundleExpiryDateAndTIme;

    if (bundleStartDate == null || bundleExpiryDateAndTIme == null) {
        bundleStartDate = "Activation date as the current date/time when the meeting is started";
        bundleExpiryDateAndTIme = `<ul>If the meeting has started, the expiration is 24 hours from the activation time.</ul>
                                    <ul>If the meeting hasn't started yet, the expiration will be 7 days from the activation date.</ul>`;
    } else {
        // Convert the UTC time to Africa/Algiers time
        bundleStartDate = moment.tz(bundleStartDate, 'UTC').tz('Africa/Algiers').format('ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)');
        bundleExpiryDateAndTIme = moment.tz(bundleExpiryDateAndTIme, 'UTC').tz('Africa/Algiers').format('ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)');

    }

    // Send email notification to the user about the bundle purchase
    await sendBundlePurchaseEmail(email, bundlePlan, bundleStartDate, bundleExpiryDateAndTIme);

    res.status(200).send({ status: true, message: "Subscription purchased successfully", subscription: { id: userBundlePlan.insertId, Email: email, bundleDurationDays: inBundleDurationDays, expiryDays: inExpiryDays } });
};
// Handle New User
const handleNewUser = async (req, email, email_id, MTNTransactionId, bundlePlan, res) => {
    const { firstName, lastName, phone, timezone } = req.body;
    const userType = req.body.userType || 1;

    // if (!isValidUserDetails(firstName, lastName, phone)) return;

    if (!isValidTimezone(timezone)) return res.status(400).send({ error: 'Invalid timezone.' });

    token = jwt.sign({ email: email }, apiSecret);
    const loginId = await endpoints.createUserLogin(email_id, token);

    if (loginId > 1) {
        const userId = await endpoints.createUser(firstName, lastName, phone, email_id, email, timezone, 1, loginId, 1, userType);
        console.log("UserID", userId);
        if (userId > 1) {
            await handleSuccessfulUserCreation(userId, loginId, email, MTNTransactionId, bundlePlan, res);
        } else {
            res.status(404).json({ status: false, message: "Data not inserted in user table" });
        }
    } else {
        res.status(404).json({ status: false, message: "Data not inserted in login table" });
    }
};
// Handle Successfull User Creation
const handleSuccessfulUserCreation = async (userId, loginId, email, MTNTransactionId, bundlePlan, res) => {
    const userDetails = await endpoints.getUserWithId(userId);
    console.log("userDetails", userDetails);
    const userData = {
        id: loginId,
        firstName: userDetails[0].firstName,
        lastName: userDetails[0].lastName,
        email: userDetails[0].userMail,
        phone: userDetails[0].phone,
        timezone: userDetails[0].timezone,
        userType: userDetails[0].userType
    };

    sendMail(loginId, userDetails[0].userMail, token);
    try {
        await indexElasticsearch('mtn_development', userId, {
            code: 201,
            description: "User Created",
            data: userData,
            date: new Date(),
            userType: userData.userType,
        });
    } catch (error) {
        console.error("Error indexing to Elasticsearch:", error.message);
        // Log or handle the error as needed, but continue with the rest of the logic
        convertedemail = utils.toMTNEmail(email);
        elasticErrorsendMail(convertedemail, error.message);
    }
    await handleBundlePurchase(email, MTNTransactionId, bundlePlan, userData, res);
};
// Handle Bundle Purchase
const handleBundlePurchase = async (email, MTNTransactionId, bundlePlan, userData, res) => {
    const { inBundleDurationDays, inExpiryDays } = getBundlePlanDetails(bundlePlan);
    const userBundlePlan = await endpoints.userBundlePlan(email, inBundleDurationDays, inExpiryDays, MTNTransactionId);
    if (userBundlePlan.error) {
        return res.status(409).json({ status: false, error: userBundlePlan.error.sqlMessage });
    }
    const userType = userData.userType
    // Handle Elasticsearch indexing
    try {
        await indexElasticsearch('mtn_development', userBundlePlan.insertId, {
            code: 201,
            description: "Bundle Purchased",
            data: { email, bundlePlan, date: new Date(), userType },
        });
    } catch (error) {
        console.error("Error indexing to Elasticsearch:", error.message);
        // Log or handle the error as needed, but continue with the rest of the logic
        convertedemail = utils.toMTNEmail(email);
        elasticErrorsendMail(convertedemail, error.message);
    }

    let bundleStartDate = userBundlePlan.bundleStartDate;
    let bundleExpiryDateAndTIme = userBundlePlan.bundleExpiryDateAndTIme;

    if (bundleStartDate == null || bundleExpiryDateAndTIme == null) {
        bundleStartDate = "Activation date as the current date/time when the meeting is started";
        bundleExpiryDateAndTIme = `<p>Note:</p>
    <ul>
        <li>If the meeting has started, the expiration will be 24 hours from the activation time.</li>
        <li>If the meeting hasn't started yet, the expiration will be 7 days from the activation date.</li>
    </ul>`;
    } else {
        // Convert the UTC time to Africa/Algiers time
        bundleStartDate = moment.tz(bundleStartDate, 'UTC').tz('Africa/Algiers').format('ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)');
        bundleExpiryDateAndTIme = moment.tz(bundleExpiryDateAndTIme, 'UTC').tz('Africa/Algiers').format('ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)');

    }
    // Send email notification to the user about the bundle purchase
    await sendBundlePurchaseEmail(email, bundlePlan, bundleStartDate, bundleExpiryDateAndTIme);

    res.status(200).send({ status: true, message: "Subscription purchased successfully", subscription: { id: userBundlePlan.insertId, Email: email, bundleDurationDays: inBundleDurationDays, expiryDays: inExpiryDays } });
};
// Function to send email notification for bundle purchase
const sendBundlePurchaseEmail = async (email, bundlePlan, activationDate, expiryDate) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
			port: '587',
			secure: false,
            auth: {
                user: 'speechlogixemailalert@gmail.com',
                pass: 'wzza epbk lalk xyqq', // Use app-specific password for better security
            },
     tls: { rejectUnauthorized: false }
});

        await transporter.sendMail({
            from: '"Meetings+" <speechlogixemailalert@gmail.com>',
            to: email,
            subject: `Bundle Purchase Confirmation: ${bundlePlan}`,
            html: `
            <p>Hi ${email},</p>
            <br>
            <p>Congratulations on purchasing the <strong>${bundlePlan}.</strong></p>
            <br>
            <p>Your plan will be activated on <strong>${activationDate}</strong> and expires on <strong>${expiryDate}</strong></p>
            <br>
            <p>If you have any questions or need help, please don’t hesitate to reach out to us.</p>
            <p>Best regards,</p>
            <p>The Meetings+ team</p>
        `,
        });
    }
    catch (error) {
        console.error("Error Mail sending", error.message);
        return
    }
};
// Get Bundle Plan Details
const getBundlePlanDetails = (bundlePlan) => {
    switch (bundlePlan) {
        case 'OneDayPlan':
            return { inBundleDurationDays: 1, inExpiryDays: 7 };
        case 'WeeklyPlan':
            return { inBundleDurationDays: 7, inExpiryDays: 0 };
        default:
            return { inBundleDurationDays: 30, inExpiryDays: 0 };
    }
};
// Valid Timezone
const isValidTimezone = (timezone) => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
};
// Send Mail
const sendMail = async (loginId, email, token) => {
    try {
        const data = await endpoints.fetch_namewithemail(email);
        const first_name = data[0].firstName;
        const last_name = data[0].lastName;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
			port: '587',
			secure: false,
            auth: {
                user: 'speechlogixemailalert@gmail.com',
                pass: 'wzza epbk lalk xyqq', // Use app-specific password for better security
            },
     tls: { rejectUnauthorized: false }
});
        await transporter.sendMail({
            from: '"Meetings+" <speechlogixemailalert@gmail.com>',
            to: email,
            subject: "Generate Meetings+ password",
            html: `
            <p>Hi ${first_name} ${last_name},</p>
            <p>Thank you for registering for Meetings+!</p>
            <p>To complete your registration, please click on the following link to set your new password:</p>
            <p><a href="https://mtnzoom.xlogix.ca/generatePassword/${token}">Set password</a></p>
            <p>Once you have set your password, you will be able to log in to Meetings+ and start using all of our features.</p>
            <p>If you have any questions, please do not hesitate to contact us.</p>
            <p>Thanks,</p>
            <p>Meetings+ team</p>
        `,
        });
    }
    catch (error) {
        console.error("Error Mail sending", error.message);

    }

};
// Elastic Error Send Mail
const elasticErrorsendMail = async (email, errorMessage) => {
    const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
			port: '587',
			secure: false,
            auth: {
                user: 'speechlogixemailalert@gmail.com',
                pass: 'wzza epbk lalk xyqq', // Use app-specific password for better security
            },
     tls: { rejectUnauthorized: false }
});

    await transporter.sendMail({
        from: '"Meetings+" <speechlogixemailalert@gmail.com>',
        to: ['bilal@speechlogix.com', 'niran@speechlogix.com', 'rasheed@speechlogix.com', 'shabeeb@speechlogix.com', 'jamal@speechlogix.com'],
        subject: "Elastic Search Error Alert - Immediate Attention Required",
        html: `
    <h2 style="color: #d9534f;">⚠️ Urgent: Elasticsearch Error Detected</h2>
    <p>Dear Team,</p>
    <p>We have encountered an error while attempting to index data in Elasticsearch. This issue is affecting the proper functioning of the system, and we need to resolve it as soon as possible.</p>
    <p><strong>Error Details:</strong></p>
    <ul>
        <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>Service:</strong> Meetings+ Application</li>
        <li><strong>Issue:</strong> Failed to index data into Elasticsearch</li>
        <li><strong>Error Message as</strong> : ${errorMessage}</li>
        <listrong>Username</strong> : ${email}</li>
        <li><strong>Action Required:</strong> Immediate investigation and fix of the Elasticsearch service</li>
    </ul>
    <p>Please prioritize this issue and provide updates once it has been resolved.</p>
    <p>Thank you for your attention.</p>
    <p>Best regards,<br/>Meetings+ Support Team</p>
`,
    });
};
// Update in Elastic Search
const indexElasticsearch = async (index, documentId, body) => {
    return await client.index({
        index,
        id: documentId,
        body,
    });
};

const isValidUserDetails = (firstName, lastName, phone) => {
    const scriptTagRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
    const sqlInjectionRegex = /\'|"|;|\*|#|%/gi;
    const phoneRegex = /^\d{10,15}$/;

    if (!firstName || firstName.length > 50 || scriptTagRegex.test(firstName) || sqlInjectionRegex.test(firstName)) {
        return false;
    }
    if (!lastName || lastName.length > 50 || scriptTagRegex.test(lastName) || sqlInjectionRegex.test(lastName)) {
        return false;
    }
    if (phone && !phoneRegex.test(phone)) {
        return false;
    }
    return true;
};

// Create User
exports.createcustomer = async (req, res) => {
    try {
       
        
        logger.info('createcustomer');
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let phone = req.body.phone;
        let userType = req.body.userType;
        if (userType == undefined) {
            userType = 1
        }
        let email = req.body.email;
        let usermail = email;
        usermail = usermail.toLowerCase()
        let type = 1;

        const scriptTagRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
        const sqlInjectionRegex = /\'|"|;|\*|#|%/gi; // or /[^a-zA-Z0-9!@#$%^&*()_+-=<>,;./?:{}\[\] ]/gi
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        const phoneRegex = /^\d{10,15}$/;// 15-digit phone number regex
        let timezone = req.body.timezone;
        let flag = 0
        if (timezone == "Africa/Nigeria") {
            flag = 1
            timezone = "Africa/Bangui"
        }
        function isValidTimezone(timezone) {
            try {
                Intl.DateTimeFormat(undefined, { timeZone: timezone });
                return true;
            } catch (error) {
                return false;
            }
        }

        if (scriptTagRegex.test(firstName) || scriptTagRegex.test(lastName)) {
            res.status(400).send({ error: 'First or last name cannot contain script tags.' });
            return;
        }

        if (sqlInjectionRegex.test(lastName) || sqlInjectionRegex.test(firstName)) {
            res.status(400).send({ error: 'First or last name cannot contain SQL injection characters.' });
            return;
        }

        if (!firstName) {
            res.status(400).send({ error: 'First name is required.' });
            return;
        }

        if (!lastName) {
            res.status(400).send({ error: 'Last name is required.' });
            return;
        }

        if (!phone) {
            res.status(400).send({ error: 'Phone number is required.' });
            return;
        }

        if (!emailRegex.test(email)) {
            res.status(400).send({ error: 'Invalid email format.' });
            return;
        }

        if (firstName.length > 50) {
            res.status(400).send({ error: 'First name is too long.' });
            return;
        }

        if (lastName.length > 50) {
            res.status(400).send({ error: 'Last name is too long.' });
            return;
        }

        if (!phoneRegex.test(phone)) {
            res.status(400).send({ error: 'Phone number must be minimum 10 digits and maximum 15 digits and should only contain integers' });
            return;
        }
        if (!isValidTimezone(timezone)) {
            res.status(400).send({ error: 'Invalid timezone.' });
            return;
        }

        let lowercaseEmail = email.toLowerCase();
        email = utils.toMTNEmail(lowercaseEmail);
        let orgId = "1";
        console.log("email",email);
        
        const mailData = await endpoints.validateMail(email);
        console.log("mailData",mailData);

        if (mailData.length > 0) {
            // Case 1: Email already exists
            // Now, let's check if the phone number also exists
            const checksameaccount = await endpoints.validateEmailPhone(email, phone)
            if (checksameaccount.length > 0) {
                const phoneData = await endpoints.validatePhone(phone)
                if (phoneData.length > 0) {
                    // Case 1: Email and Phone number both exist
                    if (phoneData[0].loginId) {
                        let validloginId = phoneData[0].loginId;
                        // Check if the user is suspended
                        const isActive = await endpoints.validateloginId(validloginId)
                        if (isActive[0].isActive == 2) {
                            // Case 1: User is suspended
                            res.status(408).send({
                                error: "User is already suspended",
                                message: "Your account has been suspended. Please contact support for further assistance."
                            });
                        } else {
                            // Case 1: Email and Phone number both exist but user is not suspended
                            res.status(409).send({ "error": "Email and Phone number already exist" });
                        }
                        // });
                    } else {
                        // Case 1: Email and Phone number both exist
                        res.status(409).send({ "error": "Email and Phone number already exist" });
                    }
                } else {
                    // Case 2: Email exists but Phone number doesn't
                    res.status(410).send({ "error": "Email already exists" });
                }
                // });
            } else {
                res.status(410).send({ "error": "User Phone number and email does not match" });
            }
        }
        else {
            // Case 3: Email doesn't exist, check if Phone number exists
            const phoneData = await endpoints.validatePhone1(phone)
            console.log("phoneData",phoneData);
            
            if (phoneData.length > 0) {
                if (phoneData[0].loginId) {
                    let validloginId = phoneData[0].loginId;
                    // Check if the user is suspended
                    const isActive = await endpoints.validateloginId(validloginId)
                    if (isActive[0].isActive == 2) {
                        // Case 4: Email doesn't exist, Phone number exists, and user is suspended
                        res.status(408).send({
                            error: "User is already suspended",
                            message: "Your account has been suspended. Please contact support for further assistance."
                        });
                    } else {
                        // Case 3: Email doesn't exist, Phone number exists, and user is not suspended
                        res.status(410).send({ "error": "Phone number already exists" });
                    }
                    // });
                } else {
                    // Case 3: Email doesn't exist, Phone number exists
                    res.status(410).send({ "error": "Phone number already exists" });
                }
            } else {

                // Case 4: Email and Phone number both don't exist
                token = jwt.sign({ email: usermail }, apiSecret);
                const loginId = await endpoints.createUserLogin(email, token)
                if (loginId > 1) {
                    const userId = await endpoints.createUser(firstName, lastName, phone, email, usermail, timezone, type, loginId, orgId, userType)
                    if (userId > 1) {
                        const userDetails = await endpoints.getUserWithId(userId)
                        let timezone_text = userDetails[0].timezone
                        if (timezone_text == "Africa/Bangui") {
                            if (flag == 1) {
                                timezone_text = "Africa/Nigeria"
                            }
                        }
                        let userData = {
                            id: loginId,
                            firstName: userDetails[0].firstName,
                            lastName: userDetails[0].lastName,
                            email: userDetails[0].userMail,
                            phone: userDetails[0].phone,
                            timezone: timezone_text
                        }
                        // prov.sentMail(loginId, userDetails[0].userMail, token);
                        sendMail(loginId, userDetails[0].userMail, token)
                        const sms = endpoints.sentSMS(phone, userDetails[0].userMail);
                        // Define the JSON data to be indexed
                        const json_data = {
                            code: 201,
                            description: "User Created",
                            data: userData,
                            date: new Date()
                        };
                        // Define the index name and document ID
                        const index_name = 'mtn_production';
                        const document_id = phone;

                        // Perform the Elasticsearch indexing
                        async function indexDocument() {
                            try {
                                const response = await client.index({
                                    index: index_name,
                                    id: document_id,
                                    body: json_data,
                                });
                                if (response.result === 'updated') {
                                    console.log('Document indexed successfully');
                                } else {
                                    console.log('Failed to index document');
                                }
                            } catch (error) {
                                console.error('Error:', error);
                            }
                        }

                        // Call the indexing function
                        indexDocument();
                        // socket.emit('userCountUpdate', {status:1, message: 'User registered successfully'})
                        res.status(201).json({
                            code: 201,
                            description: "User registered successfully",
                            data: userData,
                        });
                    } else {
                        res.json({ status: false, message: "Data not inserted in user table" });
                    }
                } else {
                    res.json({ status: false, message: "Data not inserted in login table" });
                }
            }
        }
    } catch (e) {
        res.json({ "error": e.message })
        logger.error(e);
        data = e.message;
        status = false
    }
    async function sendMail(id, email, token) {
        let first_name = "";
        let last_name = "";
        try {
            const data = await endpoints.fetch_namewithemail(email);
            first_name = data[0].firstName
            last_name = data[0].lastName
            // Further processing of the data

        } catch (error) {
            console.error(error);
        }
        // `<p><a href="https://meetings.mtn.com/generatePassword/${token}">Set password</a></p><br>`;       
        var fieldheader = `<p><a href="https://mtnzoom.xlogix.ca/generatePassword/${token}">Set password</a></p><br>`;
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
			port: '587',
			secure: false,
            auth: {
                user: 'speechlogixemailalert@gmail.com',
                pass: 'wzza epbk lalk xyqq', // Use app-specific password for better security
            },
     tls: { rejectUnauthorized: false }
			
        });

        try {
            let info = await transporter.sendMail({
                from: '"Meetings+" <speechlogixemailalert@gmail.com>',
                to: email,
                subject: "Generate Meetings+ password",
                text: "Generate Meetings+ password",
                html: `
			<p>Hi ${first_name + " " + last_name},</p>
			<p>Thank you for registering for Meetings+!</p>
			<p>To complete your registration, please click on the following link to set your new password:</p>
			${fieldheader}
			<p>Once you have set your password, you will be able to log in to Meetings+ and start using all of our features.</p>
			<p>If you have any questions, please do not hesitate to contact us.</p>
			<p>Thanks,</p>
			<p>Meetings+ team</p>
		  `
            });

            console.log("Message sent: %s", info);
            return true;
        } catch (error) {
            console.error("Error sending email:", error);
            return false;
        }
    }
}
// Suspend User
exports.suspendcustomer = async (req, res) => {
    try {
        logger.info('suspendcustomer');
        const email = req.query.email;

        if (!email) {
            res.status(400).send('Email is required.');
            return;
        }

        const code = await endpoints.suspendUser(email)
        console.log(code);
        if (code) {

            res.status(200).send(code);
        }
        else {
            res.status(404).send({ status: false, "error": message });
        }
    }
    catch (e) {
        console.log("error: " + e)
        logger.error(e);
        data = e.message;
    }

}
// Bundle Purchase
exports.bundlepurchase = async (req, res) => {
    try {
        logger.info('bundlepurchase')
        let inBundleDurationDays
        let inExpiryDays
        bundlePlan = req.query.bundlePlan
        let inMobile = req.query.email;
        const MTNTransactionId = req.query.MTNTransactionId
        if (bundlePlan == 'OneDayPlan') {
            inBundleDurationDays = 1;
            inExpiryDays = 7;
        }
        else if (bundlePlan == 'WeeklyPlan') {
            inBundleDurationDays = 7;
            inExpiryDays = 0;
        }
        else {
            inBundleDurationDays = 30;
            inExpiryDays = 0;
        }
        const user = await endpoints.validateEmail(inMobile)
        if (user.length > 0) {
            // Generate a unique document ID using UUID
            const unique_id = uuid.v4();
            const userBundlePlan = await endpoints.userBundlePlan(inMobile, inBundleDurationDays, inExpiryDays, MTNTransactionId)
            logger.info('Plan status', userBundlePlan);
            if (userBundlePlan.error == "") {
                // Emit an event with data to the receiving server
                // socket.emit('BundlePurchase', {status:1,message: 'Bundle has purchased'})

                const sms = endpoints.sentbundleSMS(inMobile, bundlePlan);
                const data = {
                    inMobile: inMobile,
                    bundlePlan: bundlePlan,
                    date: new Date()
                };
                //Sending data to elastic 
                // Define the JSON data to be indexed
                const json_data = {
                    code: 201,
                    description: "Bundle Purchased",
                    data: data
                };
                // Define the index name and document ID
                const index_name = 'mtn_meeting';
                const document_id = unique_id;

                // Perform the Elasticsearch indexing
                async function indexDocument() {
                    try {
                        const response = await client.index({
                            index: index_name,
                            id: document_id,
                            body: json_data,
                        });
                        if (response.result === 'created') {
                            console.log('Document indexed successfully');
                        } else {
                            console.log('Failed to index document');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }

                // Call the indexing function
                indexDocument();
                res.status(200).send({ status: true, message: "Subscription purchased successfully", subscription: { "id": userBundlePlan.insertId, "Phone": inMobile, "bundleDurationDays": inBundleDurationDays, "expiryDays": inExpiryDays } });
            }
            else if (userBundlePlan.insertId == "") {
                res.status(409).json({ status: false, error: userBundlePlan.error.sqlMessage })
            }
        }
        else {
            res.status(404).send({ error: "The provided Phone Number does not exist" })
        }
    }
    catch (e) {
        console.log("error: " + e)
        logger.error(e);
        data = e.message;
    }

}
// Account Balance
exports.accountbalance = async (req, res) => {
    try {
        logger.info('accountbalance')
        const email = req.query.email;
        const email_id = utils.toMTNEmail(email);
        const user = await endpoints.validateMail(email_id)

        if (user.length > 0) {
            const plan = await endpoints.checkAccountBalance(email)
            if (plan?.length > 0 && plan[0]?.length > 0) {
                let expdate = moment(plan[0][0].bundleExpiryDateTime).format("DD-MM-YYYY HH:MM:SS")
                const RemainingDays = plan[0][0].RemainingDays
                if (expdate == 'Invalid date') {
                    expdate = 'No Active Plan'
                }
                res.status(200).send({ status: true, "Email id": email, "ExpiryDateTime": expdate });
            }
            else {
                res.status(402).send({ message: "User has no balance" })
            }
        }
        else {
            res.status(404).send({ status: false, "error": "The customer with the provided Email id does not exist." })
        }
    }
    catch (e) {
        console.log("error: " + e)
        logger.error(e);
        data = e.message;
    }
}
// Account Search
exports.accountsearch = async (req, res) => {
    try {
        logger.info('accountbalance')
        let inMobile
        let email
        let key = req.query.Key

        if (key == 'email') {
            email = req.query.Value;
        } else {
            inMobile = req.query.Value;
        }
        if (inMobile) {
            const user = await endpoints.validatePhone(inMobile)
            if (user.length > 0) {
                res.status(200).send({ status: true, "Phone Number": inMobile, email: user[0].userMail });
            }
            else {
                res.status(404).send({ "error": "The customer with the provided phone number does not exist." })
            }
        } else {
            const user = await endpoints.validateEmail(email)
            if (user.length > 0) {

                res.status(200).send({ status: true, Email: email, phone: user[0].phone });
            }
            else {
                res.status(404).send({ "error": "The customer with the provided email does not exist." })
            }
        }

    }
    catch (e) {
        console.log("error: " + e)
        logger.error(e);
        data = e.message;
    }
}
// Delete User
exports.delete = async (req, res) => {
    try {
        logger.info("deleteuser working");
        const email = req.query.email;
        let lowercaseEmail = email.toLowerCase();
        const email_id = utils.toMTNEmail(lowercaseEmail);
        const user = await endpoints.validateMail(email_id)
        if (user.length > 0) {
            const plan = await endpoints.deleteusers(email)
            if (plan) {
                // socket.emit('userCountUpdate', {status:1,message: 'User deleted Successfullyy'})
                res.json({ "status": 200, "message": "Data deleted Successfully" });
            }
            else {
                res.status(402).send({ "Status": "No data found for the specified phone number" })
            }
        }
        else {
            res.status(404).send({ "error": "The customer with the provided UserNumber does not exist." })
        }
    }
    catch (e) {
        console.log("error: " + e)
        logger.error(e);
        data = e.message;
    }
}

