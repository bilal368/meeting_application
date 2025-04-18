const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class meetingHistoryUser {
    static async mtnGetMeetingHistory(username,userTimezone) {
        try {
            const [data] = await dbQueryPromise("CALL spGetMeetingHistory(?,?);", [username, userTimezone])
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }
}
module.exports = { meetingHistoryUser: meetingHistoryUser }