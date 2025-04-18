const express = require('express');
const router = express.Router();
const userLoginController = require('../controller/userLogin');
const generatePasswordController = require('../controller/generatedPassword');
const forgetPasswordController = require('../controller/forgetPassword');
const instantMeetingController = require('../controller/instantMeeting');
const scheduleMeetingController = require('../controller/scheduleMeeting');
const listMeetingController = require('../controller/listMeeting');
const deleteMeetingController = require('../controller/deleteMeeting');
const deleteReccurrenceController = require('../controller/deleteReccurrence');
const mtnGetMeetingWithIdController = require('../controller/mtnGetMeetingWithId');
const mtnUpdateMeetingController = require('../controller/mtnUpdateMeeting');
const updateReccuringMeetingController = require('../controller/updateReccuringMeeting');
const mtnUpdateUserLicenseController = require('../controller/mtnUpdateUserLicense');
const checkBundleBalanceController = require('../controller/checkBundleBalance');
const eventsController = require('../controller/events');
const fetchTimezoneController = require('../controller/fetchTimeZone');
const fetchUserWithIdController = require('../controller/fetchUserWithId');
const updateUserWithIdController = require('../controller/updateUserWithId');
const meetingHistoryUserController = require('../controller/meetingHistoryUser');
const bundlePlanController = require('../controller/bundleplan');
const passwordChangeController = require('../controller/passwordchange');
const versionController = require('../controller/version');
const getAllUserBundlePlanController = require('../controller/getAlluserBundleplan');
const editSummaryController = require('../controller/editSummary');

const auth = require('../auth/middleware');
const userAuth = auth.UserAuth;
const constAuth = auth.constAuth;

// API Routes for MTN application

// User management routes
router.post("/fetchUserWithId", constAuth, fetchUserWithIdController.fetchUserWithId); // Fetch user details after creation
router.post("/updateUserWithId", constAuth, updateUserWithIdController.updateUserWithId); // First-time update of user password
router.post("/userLogin", userLoginController.userlogin); // User login

// Meeting-related routes
router.post("/checkHostbalance",  checkBundleBalanceController.checkHostBalance); // Check user balance for instant meeting
router.post("/mtnUpdateUserLicense", userAuth, mtnUpdateUserLicenseController.mtnUpdateUserLicense); // Update user Zoom license
router.post("/instantMeeting", userAuth, instantMeetingController.instantMeeting); // Start an instant meeting

// Check user bundle balance for joining a meeting
router.post("/checkUserBundleBalance", userAuth, checkBundleBalanceController.checkUserBundleBalance);

// Generate JWT token for SDK
router.post("/generateJWT", constAuth, instantMeetingController.generateJWT);

// Get signature for SDK
router.post("/signature", constAuth, fetchTimezoneController.signature);

// User password management routes
router.post("/passwordchange", userAuth, passwordChangeController.passwordChange); // Change password after login
router.post("/forgetpassword", constAuth, forgetPasswordController.forgetPassword); // Request password reset via token
router.post("/generatePassword", constAuth, generatePasswordController.generatePassword); // Set new password via token
router.post("/forgotpasswordmobile", constAuth, forgetPasswordController.forgotPasswordMobile); // Request password reset via OTP
router.post("/generatePasswordotp", constAuth, generatePasswordController.generatePasswordOtp); // Set new password via OTP

// Meeting scheduling and management routes
router.post("/scheduleMeeting", userAuth, scheduleMeetingController.scheduleMeeting); // Schedule a new meeting
router.post("/mtnGetMeetingWithId", userAuth, mtnGetMeetingWithIdController.mtnGetMeetingWithId); // Fetch meeting details by ID
router.post("/mtnUpdateMeeting", userAuth, mtnUpdateMeetingController.mtnUpdateMeeting); // Update scheduled meeting
router.post("/updateReccuringMeeting", userAuth, updateReccuringMeetingController.updateReccuringMeeting); // Update ReccuringMeeting meeting
router.post("/mtnDeleteMeeting", userAuth, deleteMeetingController.deleteMeeting); // Delete scheduled meeting
router.post("/DeleteReccurence", userAuth, deleteReccurrenceController.deleteReccurrence); // Delete occurrence meeting

// List meetings
router.post("/listMeetings", userAuth, listMeetingController.listMeetings); // List all meetings (normal and recurrence)
router.post("/listMeeting", userAuth, listMeetingController.listMeetingPost); // List normal meetings
router.post("/listRecurringMeeting", userAuth, listMeetingController.listRecurringMeeting); // List recurrence meetings

// Fetch timezones
router.post("/fetchTimezone", userAuth, fetchTimezoneController.fetchTimezone); // Fetch timezone list

// User meeting history
router.post("/mtnMeetingHistoryForUser", userAuth, meetingHistoryUserController.meetingHistoryUser); // User meeting history

// User bundle plan routes
router.post("/bundleplan", userAuth, bundlePlanController.bundlePlan); // User bundle plan
router.post("/userplan_history", userAuth, getAllUserBundlePlanController.userPlanHistory); // User plan history

// App version and maintenance
router.post("/Version", constAuth, versionController.version); // App version and maintenance info

// Edit and manage meeting summary
router.post("/updateMeetingSummary", userAuth, editSummaryController.editMeetingSummary); // Edit meeting summary
router.post("/sendMail_summaryReport", userAuth, editSummaryController.sendMailSummaryReport); // Forward meeting summary
router.delete("/delete-summaryReport", userAuth, editSummaryController.deleteSummaryReport); // Deactivate meeting summary

// Zoom event webhooks
router.post("/mtn/start-meeting-webhook", eventsController.startMeetingWebhook); // Start meeting webhook
router.post("/mtn/end-meeting-webhook", eventsController.endMeetingWebhook); // End meeting webhook
router.post("/mtn/recording-started", eventsController.recordingStarted); // Recording started webhook
router.post("/mtn/summary_completed", eventsController.summaryCompleted); // Summary completed webhook
router.post("/mtn/participant_role_changed", eventsController.participantRoleChanged); // Participant role changed webhook

module.exports = router;
