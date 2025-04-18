const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class mtnUpdateMeeting {
    static async UpdateMeeting(topic, password, timezone, startTime, meetingId, autoRecording, meeting_start_date, type) {
        try {
            const data = await dbQueryPromise("UPDATE tb_meetings SET meeting_topic=?,password=?,timezone=?,scheduled_date=?, autoRecording=?, meeting_start_date=?, type=? WHERE zoom_meeting_id=?",
                [topic, password, timezone, startTime, autoRecording, meeting_start_date, type, meetingId]);
            return data.insertId;
        } catch (err) {
            console.error("Error updating meeting:", err);
            return -1;
        }
    }
}

module.exports = { mtnUpdateMeeting:mtnUpdateMeeting }