const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class deleteMeeting {
     // Delete data with meetingId from tb_meetings
     static mtnDeleteMeetingWithZoomMeetingId = async function (meetingNumber) {
        try {
            const data = await dbQueryPromise("DELETE FROM tb_meetings WHERE zoom_meeting_id = ?;", [meetingNumber]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
}

module.exports = { deleteMeeting: deleteMeeting }