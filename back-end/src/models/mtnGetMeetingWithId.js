const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class mtnGetMeetingWithId {
    //fetch data with meeting id 
    static async mtnGetMeetingForEdit(meetingNumber) {
        try {
            const data = await dbQueryPromise("SELECT date_created, email, meeting_id, meeting_topic, orgId, password, scheduled_date, timezone, type, zoom_join_url, zoom_start_url, zoom_user_id, zoom_meeting_id, autoRecording, meeting_start_date FROM tb_meetings WHERE zoom_meeting_id = ?;", [meetingNumber]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }
}

module.exports = { mtnGetMeetingWithId: mtnGetMeetingWithId }