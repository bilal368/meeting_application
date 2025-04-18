const apiKey = 'zla5-nDsT_WWrGZw17EdTA';
const apiSecret = 'Yhs0mguwCewsrKwtyrR87ZIu4BbFAYv180h0';
require('../config/env')
const jwt = require('jsonwebtoken');
let token = "";
const RefreshKey = process.env.RefreshKey
class JwtToken {

    static genToken() {

        const payload = {
            iss: apiKey,
            exp: ((new Date()).getTime() + 5000)
        };
        token = jwt.sign(payload, apiSecret);  
        return token;
    }

    static genToken24() {
        const oneYearInSeconds = 365.25 * 24 * 60 * 60;
        const payload = {
            appKey: "D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU",
            sdkKey: "D7zBwX1tZtEYCYKaHpXksV40RDYtDg5G3NhU",
            iat: Math.floor(Date.now() / 1000), 
            exp: Math.floor(Date.now() / 1000) + oneYearInSeconds,
            tokenExp: Math.floor(Date.now() / 1000) + oneYearInSeconds
        };
        token = jwt.sign(payload, RefreshKey);  
        return token;
    }
}

module.exports = { JwtToken: JwtToken }