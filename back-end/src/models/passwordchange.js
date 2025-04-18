const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class passwordchange {
    static async getpassword_with_loginId(loginId) {
        try {
            const data = await dbQueryPromise("SELECT password, username, encryptionKey, iv FROM tb_userLogin WHERE loginId = ?;", [loginId]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return false;
        }
    }

    static async updatepassword_with_loginid(newpassword, encryptionKey, iv, loginId) {
        try {
            const data = await dbQueryPromise("UPDATE tb_userLogin SET password=?, encryptionKey=?, iv=? WHERE loginId=?", [newpassword, encryptionKey, iv, loginId]);
            logger.info("Update User data");
            if (data.affectedRows === 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error updating password:", err);
            return false;
        }
    }
}

module.exports = { passwordchange:passwordchange}