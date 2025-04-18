const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class events {
    static getUserForWebHookWithUserId = async function (userId) {
        try {
            const data = await dbQueryPromise("SELECT zoom_user_id FROM tb_users WHERE zoom_user_id=?;", [userId]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    // insert meeting history
    static insertMeetingHistory = async function (meetingId, userId, meetingTopic, startTime, endTime, duration, timezone,uuid) {
        try {
            const data = await dbQueryPromise("INSERT INTO tb_meetinghistory (meetingId, hostId, meetingTopic, startTime, endTime, duration, timezone,uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [meetingId, userId, meetingTopic, startTime, endTime, duration, timezone, uuid]);
            return data.insertId;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    // insert meeting record
    static insertMeetingrecord = async function (meetingId, hostId, meetingTopic, startTime, endTime, duration, timezone,uuid) {
        try {
            const data = await dbQueryPromise("INSERT INTO tb_recordings (meetingId, hostId, meetingTopic, startTime, endTime, duration, timezone,uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [meetingId, hostId, meetingTopic, startTime, endTime, duration, timezone, uuid]);
            return data.insertId;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
    //update meeting record 
    static updateMeetingrecord = async function (meetingId, startTime, type, urls, password) {
        try {
            const sharedScreenUrls = JSON.stringify(urls);
            if (type == 'shared_screen_with_speaker_view') {
                const data = await dbQueryPromise("UPDATE tb_recordings SET shared_screen_with_speaker_view = ?, password = ? WHERE meetingId = ? AND startTime = ?;",
                    [sharedScreenUrls, password, meetingId, startTime]);
                return data;
            }else if (type == 'audio_only') {
                const data = await dbQueryPromise("UPDATE tb_recordings SET audio_only = ?, password = ? WHERE meetingId = ? AND startTime = ?;",
                    [sharedScreenUrls, password, meetingId, startTime]);
                return data;
            }
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
    // updatesummaryProcess  
    static updatesummaryProcess = async function (uuid) {
        try {
            // Update summaryProcess_status in tb_meetinghistory
            const summaryProcess = await dbQueryPromise(`UPDATE tb_meetinghistory SET summaryProcess_status = 0 WHERE uuid = ?`,
                [uuid]);
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
    // insert Meeting summary 
    static insertMeetingsummary = async function (meetingSummary) {
        try {
            const hostId = meetingSummary.meeting_host_email;
            const meetingId = meetingSummary.meetingId;
            const meetingTopic = meetingSummary.meetingTopic
            const uuid = meetingSummary.uuid;
            const next_steps = meetingSummary.next_steps;
            const nextSteps = JSON.stringify([
                {
                    next_steps
                }
              ]);
            const summary_details = meetingSummary.summary_details;
            const summary_start_time = meetingSummary.summary_start_time;
            const summary_end_time = meetingSummary.summary_end_time;
            const summary_overview = meetingSummary.summary_overview;
            const summary_title = meetingSummary.summary_title;
            const meeting_start_time = meetingSummary.meeting_start_time;
            const meeting_end_time = meetingSummary.meeting_end_time;
            console.log("next_steps",next_steps);
            const data = await dbQueryPromise(`INSERT INTO tb_meeting_summary (meeting_host_email, meeting_id, meeting_topic, next_steps, summary_Details,
                summary_start_time, summary_end_time, summary_overview,summary_title, uuid, meeting_start_time, meeting_end_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [hostId, meetingId, meetingTopic, nextSteps ? nextSteps : 'Next steps were not generated due to insufficient transcript.',JSON.stringify(summary_details), summary_start_time, summary_end_time, summary_overview, summary_title, uuid, meeting_start_time,meeting_end_time]);
            
            // Update summaryProcess_status in tb_meetinghistory
            const summaryProcess = await dbQueryPromise(`UPDATE tb_meetinghistory SET summaryProcess_status = 0 WHERE uuid = ?`,
            [uuid]);   
                
            return data.insertId;

        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
    //fetch email id
    static fetch_email = async function (zoom_user_id) {
        try {
                const data = await dbQueryPromise("SELECT userMail,phone,firstName,lastName FROM tb_users where zoom_user_id = ?",
                    [zoom_user_id]);
                return data;
          
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
 
    static updateUserTypeWithUserId = async function (type, userId) {
        try {
            const data = await dbQueryPromise("UPDATE tb_users SET type=? WHERE zoom_user_id=?;", [type, userId]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
    static updateSummaryStatus = async function (uuid) {
        try {
            const data = await dbQueryPromise("UPDATE tb_meetinghistory SET summaryProcess_status=1 WHERE uuid=?;", [uuid]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
}

module.exports = { events: events }