const Redis = require('ioredis');
// Define the Redis server IP address and port
const redisHost = '65.108.88.254'; // Replace with your Redis server IP
const redisPort = 6379; // Replace with your Redis server port

// Create a Redis client with authentication
const Client = new Redis({
  host: redisHost,
  port: redisPort,
});

// Set a key-value pair in Redis
Client.set('globalEmailData', JSON.stringify(global.emailData))
  .then(() => {
    console.log('Value has been set in Redis');
  })
  .catch((err) => {
    console.error('Error setting value in Redis:', err);
  });

module.exports = Client; // Export the Redis Client

