const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class bundleplan{
    
    //fetch user emailId
    static validateEmail = async function (username) {
        logger.info('checkUserbundleplan')
        try {
            const data = await dbQueryPromise("SELECT email_id,userMail FROM tb_users WHERE userMail=?;", [username]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            logger.error(error);
            return [];
        }
    }

    // user Account Balance
    static checkAccountBalance = async function (email) {
        try {
            const data = await dbQueryPromise("CALL spGetUserAllBundlePlans(?,'Africa/Algiers',1,100);", [email]);
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            logger.error(error);
            return [];
        }
    }
}

module.exports = { bundleplan: bundleplan }