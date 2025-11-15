const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // Adjust path if needed
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- ADD THIS IMPORT AT THE TOP
const { authenticateJWT } = require('../middleware/auth.middleware');
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
    // 1. Get loginId and password from request body
    const { loginId, password } = req.body;

    // 2. Check if user exists by rollNo, teacherId, or email
    const user = await User.findOne({
      $or: [
        { rollNo: loginId },
        { teacherId: loginId },
        { email: loginId }
      ]
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (login ID)' });
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

    // Include teacher-specific fields in the payload only if assigned
    if (user.role === 'teacher') {
      if (user.assignedSection) payload.user.assignedSection = user.assignedSection;
      if (user.assignedYear) payload.user.assignedYear = user.assignedYear;
      payload.user.department = user.department;
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' }, // Token expires in 3 hours
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            rollno: user.rollno,
            department: user.department,
            role: user.role,
            passwordChanged: user.passwordChanged
          }
        });
      }
    );

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// --- Change Password Route ---
// POST /api/auth/change-password
router.post('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Assuming user ID is available from middleware

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and set passwordChanged to true
    user.password = hashedPassword;
    user.passwordChanged = true;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
