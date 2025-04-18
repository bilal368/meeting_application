const axios = require('axios');
const accountID = 'QtrfF-fvQCe23TpZQgpZnA';
const basicAuthUsername = 'jX6pKKpRleWcGW3ZfAZIA';
const basicAuthPassword = 'oR1l1yxL30kVS1Lmn3KP9a4fE4FYV1Jo';
const apiUrl = 'https://zoom.us/oauth/token?grant_type=account_credentials&account_id=QtrfF-fvQCe23TpZQgpZnA';
const payload = {
  grant_type: 'account_credentials',
  account_id: accountID,
};

// Encode the Basic Authentication credentials
const basicAuth = Buffer.from(`${basicAuthUsername}:${basicAuthPassword}`).toString('base64');

let zoomAccessToken = ''; // Variable to store the Zoom API access token

// Function to generate the Zoom API access token
async function generateZoomAccessToken() {
  try {
    // Make the POST request to obtain the Access Token
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      },
    });

    const accessToken = response.data.access_token;
    // Store the generated token globally
    zoomAccessToken = accessToken;

    return accessToken;
  } catch (error) {
    console.error('Error generating Zoom token:', error);
    throw error;
  }
}

// Function to get the stored Zoom token
function getZoomAccessToken() {
  return zoomAccessToken;
}

// Generate the initial token and start the interval
generateZoomAccessToken();
setInterval(generateZoomAccessToken, 3300000); // Refresh token every 55 min

module.exports = {
  getZoomAccessToken,
  generateZoomAccessToken, // Export the function to generate the token
};