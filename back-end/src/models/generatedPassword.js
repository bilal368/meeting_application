const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class generatePassword {
    static forgetpassword_validateMail = async function (email) {
        try {
            const data = await dbQueryPromise("SELECT email_id, loginId, phone FROM tb_users WHERE email_id=?;", [email]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    static forgetupdateUserLoginWithotp = async function (password, encryptionKey, iv, keytoken) {
        try {
            const data = await dbQueryPromise(
                "UPDATE tb_userLogin SET password = ?, encryptionKey = ?, iv = ? WHERE otpToken = ?",
                [password, encryptionKey, iv, keytoken]
            );

            if (data.affectedRows === 1) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error updating user data:", error);
            return false;
        }
    }
    static forgetauthenticateUserWithToken = async function (token) {
        try {
            const data = await dbQueryPromise("SELECT loginId, username FROM tb_userLogin WHERE forgetToken=?;", [token]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    static forgetupdateUserLoginWithId = async function (password, encryptionKey, iv, token, updatetoken) {
        try {
            const data = await dbQueryPromise("UPDATE tb_userLogin SET password=?, autheticationToken=?, encryptionKey=?, iv=?, forgetToken=? WHERE forgetToken=?", [password, updatetoken, encryptionKey, iv, updatetoken, token]);
            
            logger.info("Update User data");
            
            if (data.affectedRows === 1) {
                return { success: true, message: "Password update successful" };
            } else {
                return { success: false, message: "Password update failed" };
            }
        } catch (error) {
            console.error("Error updating user data:", error);
            return { success: false, message: "An error occurred while updating user data" };
        }
    }
}

module.exports = { generatePassword:generatePassword }