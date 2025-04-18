const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class scheduleMeeting {
    static async validateMail(email) {
        try {
            const data = await dbQueryPromise("SELECT email_id FROM tb_users WHERE userMail=?", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }

    static async fetch_zoomidwithemail(email) {
        try {
            const data = await dbQueryPromise("SELECT zoom_user_id, firstName, lastName, timezone, phone FROM tb_users WHERE userMail = ?", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }

    static async update_zoomid_User(zoomid, email_id) {
        try {
            const data = await dbQueryPromise("UPDATE tb_userLogin SET zoomUserId = ? WHERE username = ?", [zoomid, email_id]);
            logger.info(`createUser  ${data.insertId}`);
            console.log("createUser %o %o", zoomid, data.insertId);
            return data.insertId;
        } catch (err) {
            console.error("Error updating user login:", err);
            return -1;
        }
    }
    static async update_pmi(email, pmi) {
        try {
            const data = await dbQueryPromise("UPDATE tb_users SET pmi = ? WHERE email_id = ?", [pmi, email]);
            return data.insertId;
        } catch (err) {
            console.error("Error updating user login:", err);
            return -1;
        }
    }
    static async update_zoomid_Userlogin(zoomid, email_id) {
        try {
            const data = await dbQueryPromise("UPDATE tb_users SET zoom_user_id = ? WHERE email_id = ?", [zoomid, email_id]);
            logger.info(`createUser  ${data.insertId}`);
            console.log("createUser %o %o", zoomid, data.insertId);
            return data.insertId;
        } catch (err) {
            console.error("Error updating user:", err);
            return -1;
        }
    }

    static async saveMeeting(start_url, join_url, id, host_id, host_email, topic, type, start_time, created_at, timezone, password, autoRecording, meeting_start_date) {
        try {        
            const data = await dbQueryPromise("INSERT INTO tb_meetings (zoom_start_url, zoom_join_url, zoom_meeting_id, zoom_user_id, email, meeting_topic, type, scheduled_date, date_created, timezone, password, autoRecording, meeting_start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [start_url, join_url, id, host_id, host_email, topic, type, start_time, created_at, timezone, password, autoRecording, meeting_start_date]);
            logger.info(`saveMeeting ${id} ${data.insertId}`);
            console.log("saveMeeting %o %o", id, data.insertId);
            return data.insertId;
        } catch (err) {
            console.error("Error saving meeting:", err);
            return -1;
        }
    }
}
module.exports = { scheduleMeeting: scheduleMeeting }