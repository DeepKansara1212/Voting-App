const mongoose = require('mongoose')
const bcrypt = require('bcrypt') 


// Define User Schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [
        {
            user: {
                // We get the object id which is generated when the user enters/login into the system, So this is we get it from the MongoDB
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount: {
        type: Number,
        default: 0
    }
});


// create user model
const Candidate = mongoose.model('Candidate', candidateSchema)
module.exports = Candidate; 