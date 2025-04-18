const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class fetchUserWithId {
    static fetchUserWithId = async function (autheticationToken) {
        try {
            const data = await dbQueryPromise("SELECT TU.userMail, TU.firstName, TU.lastName, TU.timezone FROM tb_userLogin UL JOIN tb_users TU ON UL.loginId = TU.loginId WHERE UL.autheticationToken = ?", [autheticationToken]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            logger.error(error);
            return [];
        }
    }
}

module.exports = { fetchUserWithId : fetchUserWithId}