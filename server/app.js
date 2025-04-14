const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in the current directory
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add this middleware to serve static files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the PairUI API',
    endpoints: {
      users: '/api/users',
      missions: '/api/missions'
    }
  });
});

// Simple test route
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.send('Server is running');
});

// Get MongoDB URI from environment variables
const mongoURI = process.env.MONGO_URI;
console.log('Attempting to connect to MongoDB with URI:', mongoURI);

// Connect to MongoDB with options
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 10000, // 10 seconds
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 5
})
  .then(() => {
    console.log('MongoDB Connected');
    
    try {
      // Routes
      app.use('/api/users', require('./routes/users'));
      app.use('/api/missions', require('./routes/missions'));
      app.use('/api/notifications', require('./routes/notifications'));
      
      // Start server
      const PORT = process.env.PORT || 5001;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
      });
    } catch (err) {
      console.error('Error setting up routes or starting server:', err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Connection details:', {
      uri: mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials in logs
      options: mongoose.connection.options
    });
    console.log('Server will not start due to database connection failure');
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Add this at the end of your middleware setup
app.use((err, req, res, next) => {
  console.error('Global error handler caught:');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  
  // Send a more detailed error response
  res.status(500).json({
    message: 'Something broke!',
    error: err.message,
    path: req.path
  });
});

module.exports = app; 