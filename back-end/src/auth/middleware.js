const jwt = require('jsonwebtoken');
const utils = require('../utils/utils');
const Client = require('../redis');
require('../config/env');
const constSecret = process.env.AUTHORIZATION_CONSTSECRET;
const apiSecret = process.env.AUTHORIZATION_ENDPOINTS;
const userApiSecret = process.env.AUTHORIZATION_USER;
const auth = {};

auth.endPointsAuth = (req, res, next) => {
  try {

    let postmanheader = req.headers.authorization;
    let token = req.headers.header;
    if (token || postmanheader) {
      if (!token) {
        token = postmanheader
      }
      token = token.replace("Bearer ", ""); // Remove the "Bearer " prefix
      if (token == apiSecret) {
        next()
      }
      else {
        res.status(401).json({ message: 'Invalid Token ID' });
      }
    } else {
      res.status(401).json({ message: 'Invalid Token ID' });
    }
  } catch (e) {
    // console.log("error: " + e);
    // logger.error(e);
    res.status(401).json({ message: 'Invalid Token ID' });
  }
};

auth.UserAuth = async (req, res, next) => {
  try {
    // Get the globalEmailData object from Redis
    const globalEmailData = await Client.get('globalEmailData');

    // if (!globalEmailData) {
    //   // If the globalEmailData object does not exist in Redis, return a 401 error
    //   return res.status(401).json({ message: 'Invalid Token ID' });
    // }

    // Check if trimmedEmail exists in trimmedEmailData
    let trimmedEmail = req.headers.email.trim();
    trimmedEmail = utils.toMTNEmail(trimmedEmail);
    const hashName = 'mtn';
    const fieldToRetrieve = trimmedEmail;
    const value = await Client.hget(hashName, fieldToRetrieve);

    if (value == 1) {
      return res.status(401).json({ message: 'Password has been changed.' });
    }

    const authheader = req.headers.authorization;
    token = authheader.replace("Bearer ", ""); 
    // Verify the JWT
    jwt.verify(token, userApiSecret, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        res.status(401).json({ status: "Bearer Token used invalid", message: "Invalid Token ID" });
      } else {
        next()
      }
    });
  } catch (e) {
    // console.log('error: ' + e);
    res.status(401).json({ message: 'Invalid Token ID' });
  }
};


auth.constAuth = (req, res, next) => {
  try {
    //for post man header 
    let postmanheader = req.headers.authorization;

    //for swagger header
    let token = req.headers.header;
    if (!postmanheader) {
      res.status(401).json({ token, message: 'Unauthorized access. The authentication token is either missing or expired. Please provide a valid token to access this API' });
    }
    if (token || postmanheader) {
      if (!token) {
        token = postmanheader
      }
      token = token.replace("Bearer ", ""); // Remove the "Bearer " prefix
      if (token == constSecret) {
        next()
      } else {
        res.status(401).json({ message: 'Invalid Bearer Token' });
      }
    };

  } catch (e) {
    // console.log('error: ' + e);
    res.status(401).json({ message: 'Invalid Token ID' });
  }
};

module.exports = auth;
