const express = require('express')
const router = express.Router()

// Import person from the models folder
const User = require('../models/User')

// Import the jwt middleware & token to get the token value
const { jwtAuthMiddleware, generateToken } = require('../jwt')

// POST route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        // create a new user document using the Mongoose model
        const newUser = new User(data)

        // Save the new person to the database
        const response = await newUser.save()
        console.log('Data Saved');

        // For Payload
        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));

        // For Token
        const token = generateToken(payload)
        console.log('Token is:', token);


        res.status(200).json({ response: response, token: token })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
});


// Login Route
router.post('/login', async (req, res) => {
    try {
        // Extract the username and password from request body
        const { aadharCardNumber, password } = req.body;

        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber })

        // If user does not exist or password does not match, throw error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        // Generate token
        const payload = {
            id: user.id
        }
        const token = generateToken(payload)

        // Return token as response
        res.json({ token })


    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        // Extract user id & data from decoded token
        const userData = req.user
        const userId = req.user.id

        // Find the user by id
        const user = await User.findById(userId)

        // If user does not exists, return error
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Send user profile as JSON response
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id   // Extract the id from the token

        // Extract current & new passwords from request body
        const { currentPassword, newPassword } = req.body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Find the user by id
        const user = await User.findById(userId)

         // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        // Update the user's password
        user.password = newPassword
        await user.save()


        console.log('Password Updated');
        res.status(200).json({ message: "Password Updated" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


// Get List of all users with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const users = await User.find({});

        // Return the list of users
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;