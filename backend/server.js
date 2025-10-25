// 1. Import all your packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Import Mongoose

// 2. Load environment variables from .env file
dotenv.config();

// 3. Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Use middleware
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // Allows your server to read JSON data from requests

// --- NEW: CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
// ------------------------------

// // 5. Create a simple test route
// app.get('/', (req, res) => {
//   res.send('Backend API is running!');
// });

// 6. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});