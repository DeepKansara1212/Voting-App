const jwt = require('jsonwebtoken')

const jwtAuthMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    
    // Extract the jwt token from the request headers
    const token = authHeader.split(' ')[1];

    if(!token) return res.status(401).json({ error: "Unauthorized" }) 

    try {
        // verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // attach user information to the request object
        req.user = decoded
        next()

    } catch(err) {
        console.error(err)
        res.status(401).json({ error: 'Invalid Token' });
    }
}


// Function to generate JWT token
const generateToken = (payload) => {
    try {
        // Generate a new JWT token using user data
        return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '30d'});
    } catch(err) {
        console.error('Error generating token:', err);
        throw err;
    }
}

module.exports = {jwtAuthMiddleware, generateToken} 