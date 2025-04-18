const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { editMeetingSummary } = require('../models/editSummary');
const nodemailer = require("nodemailer");

// ===============================
// Update AI Meeting Summary
// ===============================
exports.editMeetingSummary = async (req, res) => {
    try {
        // Destructure fields from request body
        const { uuid, summary_overview, summary_Details, next_steps } = req.body;

        // Prepare summary object to be updated
        const editSummary = { uuid, summary_Details, summary_overview, next_steps };

        logger.info('MeetingSummary');

        // Call model method to update the summary in DB
        const result = await editMeetingSummary.UpdateMeetingSummary(editSummary);

        // If update was successful
        if (result.affectedRows > 0) {
            res.status(200).json({ status: true, message: "Summary updated successfully" });
        } else {
            // No rows affected — possibly wrong UUID or no change in data
            res.status(400).json({ status: false, message: "Fail in Summary update" });
        }
    } catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};

// ===============================
// Send AI Summary Report via Email
// ===============================
exports.sendMailSummaryReport = async (req, res) => {
    try {
        logger.info('MeetingSummary-Mailforwards');

        const { uuid, emails } = req.body;

        // Fetch the meeting summary based on UUID
        const fetchSummary = await editMeetingSummary.fetchSummary(uuid);

        // Handle invalid UUID case
        if (fetchSummary.length === 0) {
            return res.status(404).json({ status: false, message: "Given UUID wrong" });
        }

        // Destructure fields from summary record
        let { summary_overview, summary_title, summary_Details, next_steps } = fetchSummary[0];

        // Handle case where next_steps are insufficient or malformed
        if (next_steps !== "Next steps were not generated due to insufficient transcript.") {
            const parsedNextSteps = JSON.parse(next_steps);
            if (parsedNextSteps[0].next_steps == null) {
                next_steps = "Next steps were not generated due to insufficient transcript.";
            } else {
                next_steps = parsedNextSteps[0].next_steps;
            }
        }

        // Parse the summary details (array of sections)
        const summary_details = JSON.parse(summary_Details);

        // Build HTML content for each detail
        const summaryDetailsHTML = summary_details.map(detail => `
            <p><strong>${detail.label}</strong></p>
            <p>${detail.summary}</p>`).join('');

        // Configure the mail transporter (Gmail with app password)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'speechlogixemailalert@gmail.com',
                pass: 'wedc rtlv xwtg ywva',  // App password
            },
            tls: { rejectUnauthorized: false }
        });

        // Function to send mail to each individual email
        const sendMail = async (email) => {
            try {
                const info = await transporter.sendMail({
                    from: '"Meetings+" <speechlogixemailalert@gmail.com>',
                    to: email,
                    subject: summary_title,
                    text: "Meeting Summary",
                    html: `
                        <p>Hi ${email},</p>
                        <p><strong>${summary_title}</strong></p>
                        <p><strong>Quick recap</strong></p>
                        <p><strong>${summary_overview ?? ''}</strong></p>
                        <p><strong>Next steps</strong></p>
                        <ul>${next_steps ?? ''}</ul>
                        <p><strong>Summary</strong></p>
                        <p>${summaryDetailsHTML ?? ''}</p>
                        <p>AI-generated content may be inaccurate or misleading. Always check for accuracy.</p>
                        <p>Please rate the accuracy of this summary.</p>
                        <p>If you have any questions, please do not hesitate to contact us.</p>
                        <p>Thanks,</p>
                        <p>Meetings+ team</p>`
                });

                console.log("Message sent: %s", info.messageId);
                return true;
            } catch (error) {
                console.error("Error sending email:", error);
                return false;
            }
        };

        // Send emails in parallel to all addresses
        const emailResults = await Promise.all(emails.map(email => sendMail(email)));

        // Respond with the results of all email attempts
        res.status(200).json({ status: true, emailResults });
    } catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};

// ===============================
// Delete (Deactivate) AI Summary
// ===============================
exports.deleteSummaryReport = async (req, res) => {
    try {
        logger.info('Deactivating MeetingSummary');

        const { uuid } = req.body;

        // Call model function to deactivate the summary
        const deactiveSummary = await editMeetingSummary.delete_summaryReport(uuid);

        // If summary is already deactivated
        if (!deactiveSummary.status) {
            const status = deactiveSummary.message === 'The summary is already deactivated.' ? 200 : 500;
            return res.status(status).json({ status: false, message: deactiveSummary.message });
        }

        // If the deactivation query affected any rows
        if (deactiveSummary.data.affectedRows > 0) {
            res.status(200).json({ status: true, message: "Summary successfully deactivated" });
        } else {
            res.status(404).json({ status: false, message: "Summary not found" });
        }
    } catch (err) {
        logger.error(err);
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};
