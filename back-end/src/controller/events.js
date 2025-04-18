// Import required modules and dependencies
const { Logger } = require('../utils/logger');
const { Client } = require('@elastic/elasticsearch');
const nodemailer = require("nodemailer");
const { events } = require('../models/events');
const io = require('socket.io-client');
const socket = io(process.env.elasticurl); // Connect to the socket server

// Elasticsearch configuration from environment variables
const node = process.env.nodeurl;
const username = process.env.elasticusername;
const password = process.env.elasticpassword;

// Create Elasticsearch client instance with basic auth
const client = new Client({
    node,
    auth: {
        username: username,
        password: password,
    },
});

const moment = require('moment');
require('moment-timezone'); // Enable timezone support for moment
const axios = require("axios");
const crypto = require('crypto');
const logger = Logger.logger; // Initialize custom logger
const { JwtToken } = require('../utils/jwttoken');
const { generateZoomAccessToken } = require('../auth/zoomtoken');

let accessToken;

// Generate Zoom API access token
async function main() {
    try {
        accessToken = await generateZoomAccessToken();
        console.log('Zoom token:', accessToken);
    } catch (error) {
        console.error('Error generating Zoom token:', error);
    }
}

// Webhook handler for Zoom meeting events
exports.startMeetingWebhook = async (req, res) => {
    try {
        logger.info("Start meeting webhook triggered");

        // Handle Zoom endpoint validation request
        if (req.body.event === 'endpoint.url_validation') {
            // Generate encrypted token using Zoom's validation process
            const hashForValidate = crypto
                .createHmac('sha256', "KqMFwkHhSiKbuSIIEXPZgA") // Shared secret
                .update(req.body.payload.plainToken)
                .digest('hex');

            // Return plainToken and encryptedToken to Zoom
            return res.status(200).json({
                plainToken: req.body.payload.plainToken,
                encryptedToken: hashForValidate
            });
        }

        // Handle meeting started event
        else if (req.body.event === 'meeting.started') {
            res.status(200).json({ message: 'Meeting started' });
        }

        // Prepare data to be indexed in Elasticsearch
        const json_data = {
            code: 201,
            description: "Start meeting",
            data: req.body
        };

        const index_name = 'mtn_development'; // Elasticsearch index name
        const document_id = req.body.payload.object.id; // Use meeting ID as document ID

        // Emit socket event if needed
        // socket.emit('meetingUpdate', { status: 1, message: 'Meeting has started', meetingId: document_id });

        // Index document into Elasticsearch
        async function indexDocument() {
            try {
                const response = await client.index({
                    index: index_name,
                    id: document_id,
                    body: json_data,
                });

                if (response.result) {
                    console.log('Document indexed successfully');
                } else {
                    console.log('Failed to index document');
                    throw new Error('Failed to index document');
                }
            } catch (error) {
                console.error('Error indexing document:', error);
                throw error;
            }
        }

        // Wait for document indexing to complete
        await indexDocument();
    } catch (e) {
        console.log("Error in webhook:", e);
        logger.error(e); // Log error using logger
        // (Optional) send a failure response
        res.status(500).json({ error: e.message });
    }
}
// Webhook handler for Zoom 'meeting.ended' event
exports.endMeetingWebhook = async (req, res) => {
    // Generate Zoom API access token
    await main();

    logger.info('end event', req.body);
    console.log("end event", req.body);

    // Handle Zoom endpoint validation request
    if (req.body.event === 'endpoint.url_validation') {
        const hashForValidate = crypto
            .createHmac('sha256', "KqMFwkHhSiKbuSIIEXPZgA")
            .update(req.body.payload.plainToken)
            .digest('hex');

        // Respond with validation tokens
        res.status(200).json({
            plainToken: req.body.payload.plainToken,
            encryptedToken: hashForValidate
        });
    }

    // Handle actual meeting.ended event
    else if (req.body.event === 'meeting.ended') {
        res.status(200).json({ message: 'Meeting ended' });

        const data = req.body;
        console.log("end meeting", data);

        // Prepare data for Elasticsearch indexing
        const json_data = {
            code: 201,
            description: "End meeting",
            data: data
        };

        const index_name = 'mtn_development';
        const document_id = req.body.payload.object.id;

        // Function to index meeting data in Elasticsearch
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
                console.error('Error indexing document:', error);
            }
        }

        // Call the indexing function
        await indexDocument();

        // Extract relevant details from the payload
        const response = req.body;
        logger.info('End meeting');

        const event = response.event;
        const uuid = req.body.payload.object.uuid;
        const meetingTopic = response.payload.object.topic;
        const meetingId = response.payload.object.id;
        const userId = response.payload.object.host_id;
        const timezone = response.payload.object.timezone;
        const startTime = response.payload.object.start_time;
        const endTime = response.payload.object.end_time;

        // Calculate meeting duration
        const formattedStartTime = moment(startTime, moment.ISO_8601);
        const formattedEndTime = moment(endTime, moment.ISO_8601);
        const difference = formattedEndTime.diff(formattedStartTime);
        const duration = moment.utc(difference).format('HH:mm:ss');

        const payload = { type: "1" }; // Payload to update user type
        const type = 1;
        let result;

        try {
            await main(); // Refresh access token if needed

            // Get user data based on host_id
            const user = await events.getUserForWebHookWithUserId(userId);

            if (user.length !== 0) {
                // Update Zoom user type
                result = await axios.patch(`https://api.zoom.us/v2/users/${userId}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                // If user type update successful
                if (result.status === 204) {
                    // Insert meeting record into database
                    const event = await events.insertMeetingHistory(meetingId, userId, meetingTopic, startTime, endTime, duration, timezone, uuid);

                    if (event) {
                        // Update user type in DB
                        const result = await events.updateUserTypeWithUserId(type, userId);

                        if (result) {
                            // Fetch meeting summary from Zoom API
                            const summary = await axios.get(`https://api.zoom.us/v2/meetings/${uuid}/meeting_summary`, {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            });

                            // Update summary status in DB
                            if (summary.status === 200) {
                                const result = await events.updateSummaryStatus(uuid);
                            }
                        }
                    }
                } else {
                    logger.info("User update failed");
                    return res.json({ status: false, message: "User update failed" });
                }
            } else {
                // If user not found in DB
                return res.json({ message: "User not found" });
            }

        } catch (e) {
            console.log("error: " + e);
            logger.error(e);
        }
    }
}
// Webhook handler for Zoom Recording Started event
exports.recordingStarted = async (req, res) => {
    try {
        await main() // Establish database or other service connection
        logger.info("recordingStarted")
        console.log("body>>>>>>", req.body);

        // Handle Zoom URL validation request
        if (req.body.event === 'endpoint.url_validation') {
            const hashForValidate = crypto.createHmac('sha256', "KqMFwkHhSiKbuSIIEXPZgA")
                .update(req.body.payload.plainToken)
                .digest('hex')
            res.status(200)
            res.json({
                "plainToken": req.body.payload.plainToken,
                "encryptedToken": hashForValidate
            })
        } 
        // Handle recording started event
        else if (req.body.event === 'recording.started') {
            res.status(200).json({ message: 'Recording started' });
        } 
        // Handle recording stopped event
        else if (req.body.event === 'recording.stopped') {
            res.status(200).json({ message: 'Recording stopped' });

            const recordingFile = req.body.payload.object.recording_file;
            console.log("recordingFile>>>>>>", recordingFile);

            const hostId = req.body.payload.object.host_id
            const meetingId = req.body.payload.object.id
            const uuid = req.body.payload.object.uuid
            const meetingTopic = req.body.payload.object.topic
            const timezone = req.body.payload.object.timezone

            // Extract recording start and end time
            let startTime = recordingFile.recording_start;
            let endTime = recordingFile.recording_end;

            // Calculate duration using moment
            let formattedStartTime = moment(startTime, moment.ISO_8601);
            let formattedEndTime = moment(endTime, moment.ISO_8601);
            let difference = formattedEndTime.diff(formattedStartTime);
            let duration = moment.utc(difference).format('HH:mm:ss');

            // Insert recording info into DB
            const event = await events.insertMeetingrecord(
                meetingId,
                hostId,
                meetingTopic,
                startTime,
                endTime,
                duration,
                timezone,
                uuid
            );
            console.log("event", event);
        } 
        // Handle recording completed event
        else if (req.body.event === 'recording.completed') {
            res.status(200).json({ message: 'Recording completed' });
            let flag = 1;

            const meetingId = req.body.payload.object.id
            const zoom_user_id = req.body.payload.object.host_id
            const topic = req.body.payload.object.topic
            const start_time = req.body.payload.object.start_time
            const timezone = req.body.payload.object.timezone
            const share_url = req.body.payload.object.share_url

            // Convert UTC time to local timezone
            const startTimeUTC = new Date(start_time);
            const targetTimezone = timezone;

            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: targetTimezone
            };

            const startTimeLocal = startTimeUTC.toLocaleString('en-US', options);
            console.log("startTimeLocal", startTimeLocal);

            // Fetch recording files from Zoom API
            const recording = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const recordingFiles = recording.data.recording_files;
            const password = recording.data.password;

            // Loop through each file and update DB + send email
            recordingFiles.forEach(async file => {
                console.log(file);
                const startTime = file.recording_start;
                const type = file.recording_type;
                const url = file.play_url;

                let urls = [{ play_url: file.play_url, download_url: file.download_url }];

                // Update the meeting record with recording info
                const updateMeetingrecord = await events.updateMeetingrecord(
                    meetingId,
                    startTime,
                    type,
                    urls,
                    password
                );

                if (updateMeetingrecord) {
                    // Fetch user email from database
                    const fetch_email = await events.fetch_email(zoom_user_id);
                    if (fetch_email.length > 0) {
                        const { phone: phoneNumber, userMail, firstName, lastName } = fetch_email[0];

                        // Send notification email once per event
                        async function sendMail() {
                            if (flag === 1) {
                                flag = 0;

                                // Configure email transporter
                                const transporter = nodemailer.createTransport({
                                    host: 'smtp.gmail.com',
                                    port: '587',
                                    secure: false,
                                    auth: {
                                        user: 'speechlogixemailalert@gmail.com',
                                        pass: 'wedc rtlv xwtg ywva', // App-specific password
                                    },
                                    tls: { rejectUnauthorized: false }
                                });

                                try {
                                    // Send mail
                                    let info = await transporter.sendMail({
                                        from: '"Meetings+" <speechlogixemailalert@gmail.com>',
                                        to: userMail,
                                        subject: `Cloud Recording - ${topic} is now available`,
                                        text: "Cloud Recording",
                                        html: `
                                            <p>Hi ${firstName + " " + lastName},</p>
                                            <p>Your cloud recording is now available.</p>

                                            <p>Topic: ${topic}</p>
                                            <p>Date: ${startTimeLocal}</p>

                                            <p>You can copy the recording information below and share with others</p>
                                            <p>${file.play_url}</p>
                                            <p>Passcode: ${password}</p>

                                            <p>If you have any questions, please do not hesitate to contact us.</p>
                                            <p>Thanks,</p>
                                            <p>Meetings+ team</p>`
                                    });

                                    console.log("Message sent: %s", info);
                                    return true;
                                } catch (error) {
                                    console.error("Error sending email:", error);
                                    return false;
                                }
                            }
                        }

                        await sendMail();
                    } else {
                        console.log("User is not in this App", zoom_user_id);
                    }
                }
            })
        }
    }
    catch (e) {
        // Global error logging
        console.log("error: " + e)
        logger.error(e);
        data = e.message;
    }
}
// Webhook handler for Zoom Summary Completed event
exports.summaryCompleted = async (req, res) => {
    try {
        // Initialize connection or setup (possibly DB, logger, etc.)
        await main();
        logger.info("recordingStarted");
        // Handle Zoom's endpoint validation (for webhook verification)
        if (req.body.event === 'endpoint.url_validation') {
            const hashForValidate = crypto.createHmac('sha256', "KqMFwkHhSiKbuSIIEXPZgA")
                .update(req.body.payload.plainToken)
                .digest('hex');
            
            // Return the plain and encrypted token as per Zoom's requirement
            res.status(200);
            res.json({
                "plainToken": req.body.payload.plainToken,
                "encryptedToken": hashForValidate
            });

        } else if (req.body.event === 'meeting.summary_completed') {
            // Send immediate response to Zoom webhook
            res.status(200).json({ message: 'summary completed ' });

            // Extract data from webhook payload
            let summary_details = req.body.payload.object.summary_details;
            let summary_overview = req.body.payload.object.summary_overview;
            let next_steps = req.body.payload.object.next_steps;
            const meeting_host_email = req.body.payload.object.meeting_host_email;
            const meetingId = req.body.payload.object.meeting_id;
            const uuid = req.body.payload.object.meeting_uuid;
            const meetingTopic = req.body.payload.object.meeting_topic;
            const meeting_start_time = req.body.payload.object.meeting_start_time;
            const meeting_end_time = req.body.payload.object.meeting_end_time;
            const summary_start_time = req.body.payload.object.summary_start_time;
            const summary_end_time = req.body.payload.object.summary_end_time;
            const summary_title = req.body.payload.object.summary_title;
            const zoom_user_id = req.body.payload.object.meeting_host_id;

            let nextStepsHTML;
            let summaryDetailsHTML;

            // Helper function to send a fallback email when no summary is available
            async function emptysendMail(userMail, firstName, lastName) {
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: '587',
                    secure: false,
                    auth: {
                        user: 'speechlogixemailalert@gmail.com',
                        pass: 'wedc rtlv xwtg ywva',
                    },
                    tls: { rejectUnauthorized: false }
                });

                try {
                    let info = await transporter.sendMail({
                        from: '"Meetings+" <speechlogixemailalert@gmail.com>',
                        to: userMail,
                        subject: `${summary_title}`,
                        text: "Meeting Summary",
                        html: `
                            <p>Hi ${firstName + " " + lastName},</p>
                            <p>A summary and next steps for ${summary_title} could not be generated due to insufficient transcript.</p>
                            <p>If you have any questions, please do not hesitate to contact us.</p>
                            <p>Thanks,</p>
                            <p>Meetings+ team</p>`
                    });

                    console.log("Message sent: %s", info);
                    return true;
                } catch (error) {
                    console.error("Error sending email:", error);
                    return false;
                }
            }

            // If summary overview is missing, assume summary couldn't be generated
            if (summary_overview == undefined) {
                summary_details = null;
                summary_overview = null;

                const fetch_email = await events.fetch_email(zoom_user_id);
                if (fetch_email.length > 0) {
                    const { userMail, firstName, lastName } = fetch_email[0];
                    const summaryProcess = await events.updatesummaryProcess(uuid); // Mark process as handled
                    await emptysendMail(userMail, firstName, lastName); // Send fallback notification
                    return res.status(200);
                } else {
                    console.log("User is not in this App", zoom_user_id);
                }

            } else {
                // Format summary details into HTML
                summaryDetailsHTML = summary_details.map(detail => `
                    <p><strong>${detail.label}</strong></p>
                    <p>${detail.summary}</p>`).join('');

                // Handle case where next_steps is an empty string
                if (next_steps == '') {
                    next_steps = null;
                }

                // Create meeting summary object to insert into DB
                const meetingSummary = {
                    meeting_host_email,
                    meetingId,
                    uuid,
                    summary_details,
                    summary_overview,
                    next_steps,
                    meeting_start_time,
                    meeting_end_time,
                    summary_start_time,
                    summary_end_time,
                    summary_title,
                    meetingTopic
                };

                // Save meeting summary in DB
                const event = await events.insertMeetingsummary(meetingSummary);

                // Helper function to send full meeting summary email
                async function sendMail(userMail, firstName, lastName) {
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: '587',
                        secure: false,
                        auth: {
                            user: 'speechlogixemailalert@gmail.com',
                            pass: 'wedc rtlv xwtg ywva',
                        },
                        tls: { rejectUnauthorized: false }
                    });

                    try {
                        let info = await transporter.sendMail({
                            from: '"Meetings+" <speechlogixemailalert@gmail.com>',
                            to: userMail,
                            subject: `${summary_title}`,
                            text: "Meeting Summary",
                            html: `
                                <p>Hi ${firstName + " " + lastName},</p>
                                <p><strong>${summary_title}</strong></p>
                                <p><strong>Quick recap</strong></p>
                                <p><strong>${summary_overview ?? ''}</strong></p>
                                <p><strong>Next steps</strong></p>
                                <ul>
                                    ${next_steps ?? 'Next steps were not generated due to insufficient transcript.'}
                                </ul>
                                <p><strong>Summary</strong></p>
                                <p>${summaryDetailsHTML ?? ''}</p>
                                <p>AI-generated content may be inaccurate or misleading. Always check for accuracy.</p>
                                <p>Please rate the accuracy of this summary.</p>
                                <p>If you have any questions, please do not hesitate to contact us.</p>
                                <p>Thanks,</p>
                                <p>Meetings+ team</p>`
                        });

                        console.log("Message sent: %s", info);
                        return true;
                    } catch (error) {
                        console.error("Error sending email:", error);
                        return false;
                    }
                }

                // If insertion was successful, send summary email to host
                if (event > 0) {
                    const fetch_email = await events.fetch_email(zoom_user_id);
                    if (fetch_email.length > 0) {
                        const { userMail, firstName, lastName } = fetch_email[0];
                        await sendMail(userMail, firstName, lastName);
                    } else {
                        console.log("User is not in this App", zoom_user_id);
                    }
                }
            }
        }

    } catch (e) {
        // Handle and log any errors
        console.log("error: " + e);
        logger.error(e);
        data = e.message;
    }
}
// This function handles the "participant role changed" webhook event from Zoom
exports.participantRoleChanged = async (req, res) => {
    try {
        // Log the entry into this endpoint
        logger.info("participantRoleChanged")

        // Extract the payload from the request body
        const payload = req.body.payload;

        // Extract the object containing meeting and participant details
        const object = payload.object;

        // Extract the participant whose role changed
        const participant = object.participant;

        // Handle the Zoom endpoint URL validation event
        if (req.body.event === 'endpoint.url_validation') {
            // Generate the encrypted token using HMAC with SHA256 and the shared secret
            const hashForValidate = crypto
                .createHmac('sha256', "KqMFwkHhSiKbuSIIEXPZgA")
                .update(req.body.payload.plainToken)
                .digest('hex');

            // Respond with the plain token and its HMAC-encrypted counterpart
            res.status(200);
            res.json({
                "plainToken": req.body.payload.plainToken,
                "encryptedToken": hashForValidate
            });
        }
    } catch (e) {
        // Log any error that occurs during the process
        console.log("error: " + e);
        logger.error(e);
        data = e.message; // This assignment is not used, can be removed if unnecessary
    }
}



