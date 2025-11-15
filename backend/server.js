// 1. Import all your packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// --- IMPORT YOUR ROUTES ---
const authRoutes = require('./routes/auth.routes'); 
const templateRoutes = require('./routes/template.routes');
const submissionRoutes = require('./routes/submission.routes'); // <-- ADD THIS LINE
const uploadsRouter = require('./routes/upload.routes');
const reportsRouter = require('./routes/report.routes');
const exportsRouter = require('./routes/export.routes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const deptAdminRoutes = require('./routes/deptAdminRoutes');
// 2. Load environment variables from .env file
dotenv.config();

// 3. Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Use middleware
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // Allows your server to read JSON data from requests

// --- CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
// ------------------------------

// --- USE YOUR ROUTES ---
// All auth routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes); 
// All template routes will be prefixed with /api/templates
app.use('/api/templates', templateRoutes); 
// All submission routes will be prefixed with /api/submissions
app.use('/api/submissions', submissionRoutes); // <-- ADD THIS LINE
app.use('/api/uploads', uploadsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/exports', exportsRouter);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/dept', deptAdminRoutes);
app.use((err, req, res, next) => {
  // Multer fileFilter will call next(err)
  if (err.message && err.message.includes('Unsupported file type')) {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max 5MB.' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});


// // 5. Create a simple test route
// app.get('/', (req, res) => {
//   res.send('Backend API is running!');
// });

// 6. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});