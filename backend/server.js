// 1. Import all necessary packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// --- IMPORT ROUTE FILES --- *** CORRECT VARIABLE NAMES ***
const authRoutes = require('./routes/auth.routes');
const templateRoutes = require('./routes/template.routes');
const submissionRoutes = require('./routes/submission.routes');
const uploadsRouter = require('./routes/upload.routes');
const reportRoutes = require('./routes/report.routes');   // <-- CORRECTED VARIABLE NAME
const exportRoutes = require('./routes/export.routes'); // <-- CORRECTED VARIABLE NAME (ensure filename matches)

// 2. Load environment variables from .env file
dotenv.config();

// 3. Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Use middleware
app.use(cors());
app.use(express.json());

// --- CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// --- DEFINE MAIN API ROUTES --- *** USING CORRECT VARIABLES ***
app.use('/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/uploads', uploadsRouter);
app.use('/api/reports', reportRoutes);   // <-- CORRECTED VARIABLE NAME
app.use('/api/exports', exportRoutes); // <-- CORRECTED VARIABLE NAME


// --- Basic Error Handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});


// 6. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});