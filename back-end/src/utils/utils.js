const crypto = require("crypto");
const ical = require('ical-generator');
const utils = {};

utils.sha256 = function (txt) {
	return crypto.createHash('sha256').update(txt).digest('hex');
}

utils.aes256= function(txt,encryptionKey, iv) {
	const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
	let encrypted = cipher.update(txt, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return encrypted;
  }
// Function to decrypt the password
utils.deaes256 = function (encryptionKey, iv, encryptedPassword) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decryptedPassword = decipher.update(encryptedPassword, 'hex', 'utf8');
    decryptedPassword += decipher.final('utf8');
    return decryptedPassword;
}

utils.toMTNEmail = function (email) {
 function generateEncryptedEmail(email, additionalText) {
	// Create a random salt
	const salt = 'wCewsrKwtyrR87ZIu4';
	// const salt = crypto.randomBytes(12).toString('hex');

	// Create a hash of the email with the salt
	let hashedEmail = crypto
		.pbkdf2Sync(email, salt, 1000, 64, 'sha512')
		.toString('hex');

	// Check if the hash starts with a number, and if it does, add 'a' at the beginning
	if (/^\d/.test(hashedEmail)) {
		hashedEmail = 'a' + hashedEmail.slice(1);
	}

	// Take the first 12 characters of the hashed email
	const truncatedHash = hashedEmail.slice(0, 12);

	// Combine the truncated hash with the additional text
	const encryptedEmail = truncatedHash + additionalText;

	return encryptedEmail;
}

// Test with an email and additional text
//   const email = 'email@mtn.speechlogix.com';
const additionalText = '@devmtn.com';
const encryptedEmail = generateEncryptedEmail(email, additionalText);

userEmail = encryptedEmail
return userEmail;
}

utils.fromMTNEmail = function (encryptedEmail) {
    // Extract the truncated hash from the encrypted email
    const truncatedHash = encryptedEmail.substring(0, 12);

    const salt = 'wCewsrKwtyrR87ZIu4';
    const emailBuffer = Buffer.from(encryptedEmail.substring(12), 'hex');
    const hashedEmail = crypto.pbkdf2Sync(emailBuffer, salt, 1000, 64, 'sha512').toString('hex');

    const email= hashedEmail;
	return email;
}


utils.getIcalObjectInstance = function (starttime, endtime, summary, description, location, url, name, email) {
	const cal = ical({ domain: "mytestwebsite.com", name: 'My test calendar event' });
	cal.domain("mytestwebsite.com");
	cal.createEvent({
		start: starttime,         // eg : moment()
		end: endtime,             // eg : moment(1,'days')
		summary: summary,         // 'Summary of your event'
		description: description, // 'More description'
		location: location,       // 'Delhi'
		url: url,                 // 'event url'
		organizer: {              // 'organizer details'
			name: name,
			email: email
		},
	});
	console.log('ICAL',cal);
	return cal;
}
utils.convertTimetoUtc = function (scheduledDate) {
    var d = new Date(scheduledDate);
    var utcDate = d.getUTCDate();
    var utcMonth = d.getUTCMonth() + 1;
    var utcYear = d.getUTCFullYear();
    var utcHour = d.getUTCHours();
    var utcMinutes = d.getUTCMinutes();
    var utcSeconds = d.getUTCSeconds();
    if (utcDate < 10) {
        utcDate = '0' + utcDate
    }
    if (utcMonth < 10) {
        utcMonth = '0' + utcMonth
    }
    if (utcHour < 10) {
        utcHour = '0' + utcHour
    }
    if (utcMinutes < 10) {
        utcMinutes = '0' + utcMinutes
    }
    if (utcSeconds < 10) {
        utcSeconds = '0' + utcSeconds
    }
    var utcScheduledDate = utcYear + '-' + utcMonth + '-' + utcDate + ' ' + utcHour + ':' + utcMinutes + ':' + utcSeconds;
    return utcScheduledDate;
}
module.exports = utils;
