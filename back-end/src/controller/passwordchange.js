const utils = require('../utils/utils');
const Client = require('../redis');
const crypto = require("crypto");
const { Logger } = require('../utils/logger');
const logger = Logger.logger;
const { passwordchange } = require('../models/passwordchange');

// Function to validate password rules
function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must have at least 8 characters';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must have at least 1 letter and 1 number';
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return 'Password must include both uppercase and lowercase characters';
  }
  if (/(\w)\1{3}/.test(password)) {
    return 'Password must not contain 4 consecutive characters';
  }
  return null;
}

// Update global object to indicate email password has changed
function updateGlobalEmailData(email) {
  const trimmedEmail = email.trim();
  if (global.emailData.hasOwnProperty(trimmedEmail)) {
    global.emailData[trimmedEmail] = 1;
  } else {
    global.emailData[trimmedEmail] = 1;
  }
}

// Main handler for password change request
exports.passwordChange = async (req, res) => {
  try {
    const { loginId, password: oldPassword, newpassword: newPassword } = req.body;

    // Validate presence of loginId
    if (!loginId) {
      return res.json({ error: 'Login ID is null' });
    }

    // Validate new password format
    const validationError = validatePassword(newPassword);
    if (validationError) {
      return res.json({ error: validationError });
    }

    // Fetch stored password and credentials from DB
    const loginUpdateStatus = await passwordchange.getpassword_with_loginId(loginId);
    if (!loginUpdateStatus) {
      return res.json({ status: false, error: "Password update failed" });
    }

    // Extract necessary fields from DB response
    const { password: storedPassword, encryptionKey, iv, username: email } = loginUpdateStatus[0];

    // Decrypt stored password
    const decryptedPassword = utils.deaes256(encryptionKey, iv, storedPassword);

    // Check if old password entered by user matches decrypted password
    if (decryptedPassword !== oldPassword) {
      return res.json({ status: false, error: "Old password is incorrect" });
    }

    // Prevent using the same password again
    if (decryptedPassword === newPassword) {
      return res.json({ status: false, error: "Old password and new password cannot be the same" });
    }

    // Generate new encryption key and IV for the new password
    const newEncryptionKey = crypto.randomBytes(32); // 256-bit key
    const newIv = crypto.randomBytes(16); // 128-bit IV

    // Encrypt new password using AES-256
    const encryptedNewPassword = utils.aes256(newPassword, newEncryptionKey, newIv);

    // Update password in the database
    const updateStatus = await passwordchange.updatepassword_with_loginid(
      encryptedNewPassword,
      newEncryptionKey,
      newIv,
      loginId
    );

    // If update is successful, update Redis and global object
    if (updateStatus) {
      updateGlobalEmailData(email); // Mark global flag for the updated email

      const hashName = 'mtn';
      await Client.hset(hashName, email, 1); // Store update flag in Redis

      return res.json({ status: true, message: "User password updated successfully" });
    } else {
      return res.json({ status: false, error: "User password update failed" });
    }

  } catch (error) {
    // Log and handle unexpected errors
    logger.error(error);
    console.error("Error in passwordchange:", error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
};
