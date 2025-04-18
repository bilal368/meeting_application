const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class userLogin {
    static async checkUserwithemail(email) {
        try {
            const rows = await dbQueryPromise("SELECT password, encryptionKey, iv, loginId FROM tb_userLogin WHERE username=? AND isActive=1;", [email]);
            if (rows.length > 0) {
                const row = rows[0];
                let password = rows[0].password;
                const encryptionKeyHex = row.encryptionKey;
                const ivHex = row.iv;
                const loginId = row.loginId;
                if (encryptionKeyHex === null || ivHex === null || password === null) {
                    password = 'invalid';
                    return { encryptionKeyHex, ivHex, password, loginId };
                }
                return { encryptionKeyHex, ivHex, password, loginId };
            } else {
                console.log('No matching rows found.');
                return { encryptionKeyHex: null, ivHex: null, password: null, loginId: null };
            }
        } catch (err) {
            console.error("Error querying user data:", err);
        }
    }

    static async checkUserForLogin(email) {
        try {
            const data = await dbQueryPromise("SELECT loginId FROM tb_userLogin WHERE username=?  AND isActive=1;", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    static async fetch_fullnamewithloginId(loginIduser) {
        try {
            const data = await dbQueryPromise("SELECT firstName, lastName, timezone, phone, pmi FROM tb_users WHERE loginId = ?;", [loginIduser]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }

    static async updateUserToken(token, email) {
        try {
            const data = await dbQueryPromise("UPDATE tb_userLogin SET autheticationToken=? WHERE username=?", [token, email]);
            return token;
        } catch (err) {
            console.error("Error updating user token:", err);
            throw err;
        }
    }
    
    static async fetch_zoomidwithemail(email) {
        try {
            const data = await dbQueryPromise("SELECT zoom_user_id, firstName, lastName, timezone, phone FROM tb_users WHERE userMail = ?;", [email]);
            return data;
        } catch (err) {
            console.error("Error querying user data:", err);
            throw err;
        }
    }


    static async validateMail(email) {
        try {
            const data = await dbQueryPromise("SELECT email_id FROM tb_users WHERE email_id=?;", [email]);
            return data;
        } catch (err) {
            console.error("Error validating email:", err);
            throw err;
        }
    }

    static async failed_attempt(loginId, email, currentDate) {
        try {
            const data = await dbQueryPromise("INSERT INTO tb_attempt_date (loginId,email, attempt_date) VALUES (?,?, ?)", [loginId, email, currentDate]);
            return data;
        } catch (err) {
            console.error("Error recording failed attempt:", err);
            throw err;
        }
    }

    static async fetch_attempt(email) {
        try {
            const data = await dbQueryPromise(`SELECT loginId, email, DATE_FORMAT(attempt_date, '%Y-%m-%d %H:%i:%s') AS formatted_attempt_date 
            FROM tb_attempt_date 
            WHERE email=?
            ORDER BY attempt_date DESC 
            LIMIT 1`, [email]);
            return data;
        } catch (err) {
            console.error("Error fetching login attempt:", err);
            throw err;
        }
    }
}

module.exports = { userLogin:userLogin }