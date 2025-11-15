const jwt = require('jsonwebtoken');

// This middleware function will protect our routes
const authenticateJWT = async (req, res, next) => {
  // 1. Get the token from the request header
  const authHeader = req.headers.authorization;

  // 2. Check if it exists and is in the correct 'Bearer <token>' format
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Get just the token part

    try {
      // 3. Verify the token
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Token is valid! Attach the user's info to the request object
      req.user = payload.user;

      // For teachers, ensure assignedSection and assignedYear are populated from DB if missing
      if (req.user.role === 'teacher' && (!req.user.assignedSection || !req.user.assignedYear)) {
        const User = require('../models/user.model');
        const dbUser = await User.findById(req.user.id).select('assignedSection assignedYear department');
        if (dbUser) {
          req.user.assignedSection = dbUser.assignedSection;
          req.user.assignedYear = dbUser.assignedYear;
          req.user.department = dbUser.department;
        }
      }

      next(); // Move on to the next function (the actual route)
    } catch (err) {
      // Token is not valid (e.g., expired or tampered with)
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
  } else {
    // 5. No token was provided
    res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};

module.exports = { authenticateJWT };
