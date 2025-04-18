const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class fetchTimeZone {
    static getTimezone = async function () {
        try {
            const data = await dbQueryPromise("SELECT * FROM tb_timezone;");
            return data;
        } catch (error) {
            console.error("Error querying user data:", error);
            return [];
        }
    }
}

module.exports = { fetchTimeZone: fetchTimeZone }