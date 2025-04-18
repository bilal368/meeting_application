const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class checkUserBundleBalance{
    static checkUserWithId = async function (userId) {
        try {
            const data = await dbQueryPromise("SELECT loginId FROM tb_userLogin WHERE isActive=1 and loginId=?;", [userId]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    static checkHostUserId = async function (userId, inZoomMeetingId) {
        try {
            const data = await dbQueryPromise("CALL spCheckUserBundleBalance(?,?)", [userId, inZoomMeetingId]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }

    static checkUserAccountBalance = async function (userId) {
        try {
            const data = await dbQueryPromise("CALL spCheckNewMeetingBalance(?);", [userId]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
}

module.exports = { checkUserBundleBalance: checkUserBundleBalance }