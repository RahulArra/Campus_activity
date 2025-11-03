const jwt = require('jsonwebtoken');

// This middleware function will protect our routes
const authenticateJWT = (req, res, next) => {
  // 1. Get the token from the request header
  const authHeader = req.headers.authorization;

  // 2. Check if it exists and is in the correct 'Bearer <token>' format
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Get just the token part

    // 3. Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        // Token is not valid (e.g., expired or tampered with)
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
      }

      // 4. Token is valid! Attach the user's info to the request object
      // The 'payload' is what we put in when we signed the token (user id and role)
      req.user = payload.user; 
      next(); // Move on to the next function (the actual route)
    });
  } else {
    // 5. No token was provided
    res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};

module.exports = { authenticateJWT };