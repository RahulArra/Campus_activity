const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // Adjust path if needed
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- ADD THIS IMPORT AT THE TOP
// --- Signup Route ---
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    // 1. Get user data from request body
    const { name, email, password, rollno, department, role } = req.body;
console.log(req.body);

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      rollno,
      department,
      role,
    });

    // 5. Save user to database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.post('/login', async (req, res) => {
  try {
    // 1. Get email and password from request body
    const { email, password } = req.body;

    // 2. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (email)' });
    }

    // 3. Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password)' });
    }

    // 4. Create and send a JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Include teacher-specific fields in the payload
    if (user.role === 'teacher') {
      payload.user.assignedSection = user.assignedSection;
      payload.user.assignedYear = user.assignedYear;
      payload.user.department = user.department;
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }, // Token expires in 3 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, rollno: user.rollno, department: user.department, role: user.role } });
      }
    );

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;