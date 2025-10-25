const express = require('express');
const router = express.Router();
// 1. Import the real model
const ActivityTemplate = require('../models/activityTemplate.model');

// --- Get All Templates Route (Now fetches from DB) ---
// GET /api/templates
// GET /api/templates
router.get('/', async (req, res) => {
  try {
    // Debug: log current DB name and collection
    try {
      console.log('Mongoose DB:', require('mongoose').connection.name);
      console.log('ActivityTemplate collection name:', ActivityTemplate.collection.name);
      const count = await ActivityTemplate.countDocuments();
      console.log('ActivityTemplate count:', count);
    } catch (dbgErr) {
      console.warn('Debug info failed:', dbgErr.message);
    }

    const templates = await ActivityTemplate.find();
    res.json(templates);
    console.log('Templates fetched:', templates.length);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;