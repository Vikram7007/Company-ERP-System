const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initializeStore, persistStore } = require('./utils/store');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const startServer = async () => {
  if (process.env.MONGO_URI) {
    await connectDB();
  }
  await initializeStore();
};

// System Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Websums Software Pvt. Ltd. Enterprise Internship Management System API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes mutate the shared store synchronously; persist the latest state after each response.
app.use((req, res, next) => {
  res.on('finish', () => persistStore().catch((error) => console.error('Database save failed:', error.message)));
  next();
});

// Complete REST API
app.use('/api', apiRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start Express Server
startServer()
  .then(() => app.listen(PORT, () => {
    console.log(`🚀 Enterprise Internship Backend API Server listening on http://localhost:${PORT}`);
  }))
  .catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  });
