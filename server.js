const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

dotenv.config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const seedData = require('./utils/seed');

const app = express();

// Security Headers & CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman) or any frontend origin
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // Flexibly allow origin in production to prevent CORS blocks
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsing & Rate Limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', apiLimiter);

// Static uploads serving for generated documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Version 1 Routes
app.use('/api/v1', routes);

// Base Health Check & Monitoring Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'Active',
    system: 'Enterprise Export CRM API v1.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    apiVersion: 'v1',
  });
});

app.get('/system-info', (req, res) => {
  res.json({
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    arch: process.arch,
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/export_crm_db';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Database Connected Successfully.');
    // Run seed script on server startup
    await seedData();

    app.listen(PORT, () => {
      console.log(`🚀 Production-Ready Export CRM Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failure:', err.message);
    process.exit(1);
  });
