const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class instantMeeting {
     //save Meetings
     static async saveMeeting(start_url, join_url, id, host_id, host_email, topic, type, start_time, created_at, timezone, password, pmi) {
        try {
            const data = await dbQueryPromise("INSERT INTO tb_meetings (zoom_start_url, zoom_join_url, zoom_meeting_id, zoom_user_id, email, meeting_topic, type, scheduled_date, date_created, timezone, password) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                [start_url, join_url, id, host_id, host_email, topic, "1", start_time, created_at, timezone, password]);
            logger.info(`saveMeeting`);
            return data.insertId;
        } catch (err) {
            console.error(err);
            return -1;
        }
    }

    static async fetch_fullnamewithemail(useremail) {
        try {
            const data = await dbQueryPromise("SELECT firstName, lastName FROM tb_users WHERE userMail = ?;", [useremail]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }
    
}

module.exports = { instantMeeting:instantMeeting }