const express = require('express');
const router = express.Router();

// This is our sample (mock) data.
// Later, Laxman will build the API to get this from the database.
const mockTemplates = [
  { 
    "_id": "67f89ab123",
    "name": "Seminar Attended", 
    "description": "For attending any seminar or workshop.",
    "fields": [
      { "fieldId": "title", "label": "Seminar Title", "type": "text", "required": true },
      { "fieldId": "speaker", "label": "Speaker Name", "type": "text", "required": false },
      { "fieldId": "eventDate", "label": "Date of Event", "type": "date", "required": true },
      { "fieldId": "venue", "label": "Venue", "type": "text", "required": true }
    ]
  },
  { 
    "_id": "67f89ab456",
    "name": "Hackathon", 
    "description": "For participating in a hackathon.",
    "fields": [
      { "fieldId": "hackathonName", "label": "Hackathon Name", "type": "text", "required": true },
      { "fieldId": "teamName", "label": "Team Name", "type": "text", "required": false },
      { "fieldId": "position", "label": "Position (e.g., 1, 2, 3)", "type": "number", "required": false },
      { "fieldId": "eventType", "label": "Event Type", "type": "select", "required": true, "options": ["Internal", "External"] }
    ]
  },
  { 
    "_id": "67f89ab789",
    "name": "Sports Activity", 
    "description": "For participating in sports.",
    "fields": [
      { "fieldId": "sportName", "label": "Sport Name", "type": "text", "required": true },
      { "fieldId": "eventName", "label": "Event Name (e.g., Inter-college)", "type": "text", "required": true },
      { "fieldId": "achievement", "label": "Achievement (e.g., Winner, Participant)", "type": "textarea", "required": false }
    ]
  }
];

// --- Get All Templates Route ---
// GET /api/templates
router.get('/', (req, res) => {
  try {
    // Just send the hard-coded mock data
    res.json(mockTemplates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;