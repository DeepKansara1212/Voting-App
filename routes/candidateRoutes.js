const express = require('express')
const router = express.Router()

// Import Candidate from the models folder
const User = require('../models/User') 

// Import the jwt middleware & token to get the token value
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/Candidate');


const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID)
        console.log('User found:', user)
        if(user && user.role === 'admin')
            return true
        return false
    } catch(err) {
        console.error('Error checking admin role:', err)
        return false
    }
}


// Post route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) {
            return res.status(403).json({message: 'User does not have candidate role'})
        }
        const data = req.body   // Assuming the request body contains the candidate data

        // create a new candidate document using the Mongoose model
        const newCandidate = new Candidate(data)

        // Save the new person to the database
        const response = await newCandidate.save()
        console.log('Data Saved');
        res.status(200).json({response: response})

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }         
});


router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) {
            return res.status(403).json({message: 'User does not have candidate role'})
        }
        const candidateID = req.params.candidateID   // Extract the id from the URL parameter
        const updatedCanidateData = req.body  // Updated data for the candidate

        const response = await Person.findByIdAndUpdate(candidateID, updatedCanidateData, {
            new: true,              // Return the updated document
            runValidators: true     // Run Mongoose Validations
        });

        if(!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate Data Updated');
        res.status(200).json(response);

    } catch(err) { 
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
})


router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if(! await checkAdminRole(req.user.id)) {
            return res.status(403).json({message: 'User does not have candidate role'})
        }
        const candidateID = req.params.candidateID   // Extract the id from the URL parameter

        const response = await Person.findByIdAndDelete(candidateID, updatedCanidateData, {
            new: true,              // Return the updated document
            runValidators: true     // Run Mongoose Validations
        });

        if(!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate Deleted');
        res.status(200).json(response);

    } catch(err) { 
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
})


// let's start the voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    // No admin can vote
    // User can only vote once

    candidateID = req.params.candidateID
    userId = req.user.id

    try {
        // Find the candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID)
        if(!candidate) {
            return res.status(404).json({message: 'Candidate not found'})
        }

        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message: 'User not found'})
        }

        if(user.isVoted) {
            return res.status(400).json({message: "You have already voted"})
        }

        if(user.role == 'admin') {
            return res.status(403).json({message: 'Admin is not allowed'})
        }

        // Update the candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++
        await candidate.save()

        // Update the user document
        user.isVoted = true
        await user.save()


        res.status(200).json({message: 'Vote recorded successfully...'})

    } catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


// Vote Count
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'})

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
        return res.status(200).json(voteRecord)

    } catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;