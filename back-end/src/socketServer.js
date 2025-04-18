const express = require('express');
const app = express();
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling'],
  },
  secure: false,
  allowUpgrades: true,
  path: '/socket.io',
});

const port2 = process.env.PORT || 4400;
server.listen(port2, () => {
  console.log('A client connected');
  console.log(`Socket Server running on PORT :${port2}`);
});

// socket connection
io.on('connection',  (socket) => {
    
	console.log(`A client connected1111111111111111111111111111111111111`);
  
	// Send data to the connected client
	socket.emit('message', `Hello from the server! You are ${socket.id}`); 
      // meetingStarted
      socket.on('meetingStarted',(data)=>{
        console.log('meetingStarted',data);
        io.emit('meetingStartedResult',data)
    })
  
	// Handle disconnections
	socket.on('disconnect', () => {
	  console.log('A client disconnected');
	});
});
// Export the io instance
module.exports = { io, server };



// const io = require('socket.io-client');

// // Replace 'http://localhost:4400' with the actual URL where the receiving server is running
// const socket = io(process.env.elasticurl);

// console.log("2334");
// // Emit an event with data to the receiving server
// socket.emit('meetingStarted', { message: 'Meeting has started' })
