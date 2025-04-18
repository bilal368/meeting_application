const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class mtnUpdateUserLicense {
    static async fetch_zoomidwithemail(email) {
        try {
            const data = await dbQueryPromise("SELECT zoom_user_id, firstName, lastName, timezone, phone FROM tb_users WHERE userMail = ?;", [email]);
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

    static async update_zoomid_Userlogin(zoomid, email_id, pmi) {
        try {
            const data = await dbQueryPromise("UPDATE tb_users SET zoom_user_id = ?, pmi = ? WHERE email_id = ?", [zoomid, pmi, email_id]);
            logger.info(`createUser  ${data.insertId}`);
            console.log("createUser %o %o", zoomid, data.insertId);
            return data.insertId;
        } catch (err) {
            console.error("Error updating user:", err);
            return -1;
        }
    }

    static async mtnGetUserForWebHook(email) {
        try {
            const data = await dbQueryPromise("SELECT zoom_user_id FROM tb_users WHERE email_id=?", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }

    static async mtnUpdateUserType(type, email) {
        try {
            const data = await dbQueryPromise("UPDATE tb_users SET type=?  WHERE email_id=?", [type, email]);
            return data.insertId;
        } catch (err) {
            console.error("Error updating user type:", err);
            return -1;
        }
    }
}

module.exports = { mtnUpdateUserLicense: mtnUpdateUserLicense }