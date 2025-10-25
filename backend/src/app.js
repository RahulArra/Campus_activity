// app.js or server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const uploadsRouter = require('./routes/upload.routes');
const reportsRouter = require('./routes/report.routes');
const exportsRouter = require('./routes/export.routes');

const app = express();
app.use(express.json());

// connect to MongoDB (example)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('Mongo connected'))
  .catch(console.error);

// routes
app.use('/api/uploads', uploadsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/reports', exportsRouter); // exports share base path

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Server listening ${PORT}`));
module.exports = app;