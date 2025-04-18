const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class listMeeting {
    static async fetch_zoomidwithemail(email) {
        try {
            const data = await dbQueryPromise("SELECT zoom_user_id, firstName, lastName, timezone, phone FROM tb_users WHERE userMail = ?;", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }
    
    static async fetch_timezone_with_zoomMeetingId(zoomMeetingId) {
        try {
            const timezone = await dbQueryPromise("SELECT timezone FROM tb_users WHERE zoom_user_id = ?;", [zoomMeetingId]);
            return timezone;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }
}

module.exports = { listMeeting:listMeeting}