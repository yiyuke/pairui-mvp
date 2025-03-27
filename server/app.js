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

// Connect to MongoDB with a fallback connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pairui';
console.log('Attempting to connect to MongoDB with URI:', mongoURI);

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB Connected');
    
    // Routes
    app.use('/api/users', require('./routes/users'));
    app.use('/api/missions', require('./routes/missions'));
    
    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will not start due to database connection failure');
  });

module.exports = app; 