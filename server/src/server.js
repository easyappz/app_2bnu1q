require('module-alias/register');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const apiRoutes = require('@src/routes/main');
const errorHandler = require('@src/middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  return res.status(200).json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res, next) => {
  return res.status(404).json({ ok: false, error: 'Route not found' });
});

// Centralized error handler
app.use(errorHandler);

async function start() {
  const PORT = process.env.PORT || 4000;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Keep server running even if DB is not connected to allow basic routes/testing
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();
