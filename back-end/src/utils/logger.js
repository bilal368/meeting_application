const log4js = require('log4js');
class Logger {

    static loggerConfig() {
        log4js.configure({

            appenders: {
                access: {
                    type: 'dateFile',
                    filename: __dirname + '/log/access.log',
                    pattern: '-yyyy-MM-dd',
                    category: 'http'
                },
                app: {
                    type: 'file',
                    filename: __dirname + '/log/app.log',
                    maxLogSize: 10485760,
                    numBackups: 3
                },
                createcustomer: {
                    type: 'file',
                    filename: __dirname + '/log/createcustomer.log',
                    maxLogSize: 10485760,
                    numBackups: 3
                },
                errorFile: {
                    type: 'file',
                    filename: __dirname + '/log/errors.log'
                },
                errors: {
                    type: 'logLevelFilter',
                    level: 'ERROR',
                    appender: 'errorFile'
                }
            },
            categories: {
                default: { appenders: ["app", "errors", "createcustomer"], level: "ALL" },
                http: { appenders: ["access"], level: "ALL" }
            }
        });
    }
    static logger = log4js.getLogger("app.js");

}
module.exports = { Logger: Logger }