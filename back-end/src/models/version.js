const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class version {
    static async maintenance() {
        try {
            const data = await dbQueryPromise(`
                SELECT 
                    status,
                    CONVERT_TZ(start_date,  @@session.time_zone, '+00:00') AS start_date,
                    CONVERT_TZ(end_date,  @@session.time_zone, '+00:00') AS end_date,
                    CONVERT_TZ(created_Date,  @@session.time_zone, '+00:00') AS created_Date,
                    CASE
                        WHEN TIMESTAMPDIFF(SECOND, NOW(), start_date) > 0 THEN TIMESTAMPDIFF(SECOND, NOW(), start_date)
                        ELSE 0
                    END AS seconds_tostart,
                    CASE
                        WHEN TIMESTAMPDIFF(SECOND, NOW(), start_date) < 0 THEN TIMESTAMPDIFF(SECOND, NOW(), end_date) 
                        ELSE 0
                    END AS seconds_left,
                    CONVERT_TZ(date_show,  @@session.time_zone, '+00:00') AS date_show
                FROM 
                    tb_maintenance_status 
                WHERE 
                    status = 'true' 
                ORDER BY 
                    created_Date;
            `);
            const len = data.length;
            if (len >= 1) {
                return data;
            } else {
                return { message: "no data found", status: false };
            }
        } catch (err) {
            console.error("Error querying maintenance data:", err);
            throw err;
        }
    }

    static async version(system, appversion) {
        try {
            const data = await dbQueryPromise("SELECT os, version, update_date, compulsory, url FROM tb_app_updates WHERE os = ? AND version > ? ORDER BY version DESC;", [system, appversion]);
            const len = data.length;
            if (len >= 1) {
                let lateststatus = data[0].compulsory;
                if (lateststatus == 'false') {
                    for (const update of data) {                        
                        if (update.compulsory == 'true') {
                            data.value = true;
                            return data;
                        } else {
                            data.value = false
                        }
                        
                    }
                    return data;
                } else {
                    data.value = true;
                    return data;
                }
            } else {
                return { message: "no data found", status: false };
            }
        } catch (err) {
            console.error("Error querying version data:", err);
            throw err;
        }
    }
}

module.exports = { version:version}