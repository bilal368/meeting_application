const log4js = require('log4js');
const util = require('util');
const logger = log4js.getLogger("db.js");
const db = require('../config/dbconnection');

// Promisify the db.query function
const dbQueryPromise = util.promisify(db.query).bind(db);

class editMeetingSummary {
    // Update AI Summary
    static UpdateMeetingSummary = async function (editSummary) {
        try {
            const uuid = editSummary.uuid
            const summary_overview = editSummary.summary_overview
            const summary_Details = editSummary.summary_Details
            const next_steps = editSummary.next_steps
            const data = await dbQueryPromise(`
            UPDATE tb_meeting_summary
            SET 
                summary_overview = ?,
                summary_Details = ?,
                next_steps = ?
            WHERE 
                uuid = ?;
            `, [summary_overview, JSON.stringify(summary_Details), next_steps ? next_steps : 'Next steps were not generated due to insufficient transcript.', uuid]);
            return data;
        } catch (error) {
            console.error("Error querying UPDATE meeting summary:", error);
            return [];
        }
    }
    // Fetch AI summary
    static fetchSummary = async function (uuid) {
        try {
            const data = await dbQueryPromise(`
            SELECT summary_overview,summary_Details,next_steps,summary_title FROM tb_meeting_summary WHERE uuid = ?;
            `, [uuid]);
            return data;
        } catch (error) {
            console.error("Error querying UPDATE meeting summary:", error);
            return [];
        }
    }
    // Delete AI summary
    static delete_summaryReport = async function (uuid) {
        try {
            // Check the current status of the summary
            const currentStatus = await dbQueryPromise(`SELECT isActive FROM tb_meeting_summary WHERE uuid = ?`, [uuid]);
            
            // If the summary is already deactivated, return a specific message
            if (currentStatus.length > 0 && currentStatus[0].isActive === 0) {
                return { status: false, message: 'The summary is already deactivated.' };
            }
    
            // Proceed to deactivate the summary
            const data = await dbQueryPromise(`UPDATE tb_meeting_summary SET isActive = 0 WHERE uuid = ?`, [uuid]);
            
            // Return a success message
            return { status: true, data };
        } catch (error) {
            console.error("Error querying UPDATE meeting summary:", error);
            return { status: false, message: 'Error deactivating the summary.', error };
        }
    }   
}

module.exports = { editMeetingSummary: editMeetingSummary }