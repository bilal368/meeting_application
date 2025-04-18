const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class updateUserWithId {
    static async authenticateUserWithToken(token) {
        try {
            const data = await dbQueryPromise("SELECT username FROM tb_userLogin WHERE autheticationToken=?", [token]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            return [];
        }
    }

    static async updateUserLoginWithId(password, encryptionKey, iv, token) {
        try {
            const data = await dbQueryPromise("UPDATE tb_userLogin SET password=?, encryptionKey=?, iv=? WHERE autheticationToken=?", [password, encryptionKey, iv, token]);
            logger.info("Update User data:", data);
            if (data.affectedRows == 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error updating user data:", err);
            return false;
        }
    }

    static async updateUserWithId(firstName, lastName, timezone, updatetoken, token) {
        try {
            const data = await dbQueryPromise(`UPDATE tb_userLogin UL
                JOIN tb_users TU ON UL.loginId = TU.loginId
                SET TU.firstName = ?,
                    TU.lastName = ?,
                    TU.timezone = ?,
                    UL.autheticationToken = ?
                WHERE UL.autheticationToken = ?`, [firstName, lastName, timezone, updatetoken, token]);
            logger.info("Update User data:", data);
            if (data.affectedRows == 2) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error updating user data:", err);
            return false;
        }
    }
}

module.exports = { updateUserWithId:updateUserWithId }