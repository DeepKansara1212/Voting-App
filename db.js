const mongoose = require('mongoose')
require('dotenv').config();


// This URL is connect to the database locally
const mongoURL = process.env.MONGODB_URL_LOCAL

// Connect the database globally
// const mongoURL = process.env.MONGODB_URL

// Set up MongoDB connection
mongoose.connect(mongoURL);


// Get the default connection
// Mongoose maintains a default connection object representiing the MongoDB connection
const db = mongoose.connection


// Define event listeners for database connection
db.on('connected', () => {
    console.log('Connected to MongoDB server successfully');
});
db.on('disconnected', () => {
    console.log('MongoDB Disonnected');
});
db.on('error', (err) => {
    console.log('MongoDB connection error:', err);
});


// Export the database connection
module.exports = db;