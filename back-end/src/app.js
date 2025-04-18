const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger_output.json');
const io = require('socket.io-client');
const { Logger } = require('./utils/logger');
const { JwtToken } = require('./utils/jwttoken');
const rds = require('./redis');
const { generateZoomAccessToken } = require('../src/auth/zoomtoken');
const indexrouter = require('./routes/index');
const endpointsrouter = require('./routes/endpoints');
require('./config/apiConfig');
require('moment-timezone');
// const {script} = require('../generateUsers')
// Initialize the Express app
const app = express();

// Set the port
const port = process.env.PORT || 3000;

// Setup Socket.io client connection
const socket = io(process.env.elasticurl);

socket.on('connect', () => {
	console.log('Connected to the Socket server');
});

socket.on('connect_error', (error) => {
	console.error('Connection error:', error.message);
});

// Use Helmet to secure HTTP headers
app.use(helmet.hidePoweredBy());

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Configure logging
Logger.loggerConfig();

// Parse incoming request bodies in a middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Protect the /doc endpoint with basic authentication
const username = process.env.username;
const password = process.env.password;
app.use('/doc', basicAuth({
	users: { [username]: password },
	challenge: true
}));

// Serve Swagger API documentation
app.get('/doc', (req, res, next) => {
	req.swaggerDoc = swaggerFile;
	next();
});
app.use('/doc', swaggerUi.serve, swaggerUi.setup());

// Register route handlers
app.use('/api', endpointsrouter);
app.use('/api', indexrouter);

// Generate the Zoom API access token and start the server
async function main() {
	try {
		const accessToken = await generateZoomAccessToken();
		// Start the server
		app.listen(port, () => {
			console.log(`App listening on port ${port}`);
		});
	} catch (error) {
		console.error('Error generating Zoom token:', error);
	}
}

// Call the async function
main();
