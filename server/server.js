const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDB = require('./utils/seed');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Auto-seed sample students, admin & projects if empty
  seedDB();
});

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Welcome Route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'SkillSwap API Platform v1.0 is running!',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/skill-swaps', require('./routes/skillSwapRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve built frontend assets
const path = require('path');
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.json({
        success: true,
        message: 'SkillSwap API Platform v1.0 is running!',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Central Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SkillSwap Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
