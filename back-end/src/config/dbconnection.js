const mysql = require('mysql');
let db = {};
require('../config/env');
db = mysql.createPool({
	connectionLimit: 50,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	debug: false
});
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected successfully!');
        connection.release(); // Release the connection back to the pool
    }
});


module.exports = db;