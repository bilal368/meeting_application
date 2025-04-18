const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class spGetUserAllBundlePlans {
    static bundlepurshasehistoryPhone = async function (email, timezone, inPageNumber, inRecordsPerPage) {
        try {
            const data = await dbQueryPromise('CALL spGetUserAllBundlePlans(?,?,?,?);', [email, timezone, inPageNumber, inRecordsPerPage]);
            if (data.length >= 1) {
                return data[0];
            } else {
                return [];
            }
        } catch (err) {
            console.error(err);
            return [];
        }
    }
}

module.exports = { spGetUserAllBundlePlans:spGetUserAllBundlePlans }