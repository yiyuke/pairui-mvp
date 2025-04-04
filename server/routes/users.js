const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/register', userController.registerUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', userController.loginUser);

// @route   GET api/users/current
// @desc    Get current user
// @access  Private
router.get('/current', auth, userController.getCurrentUser);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, userController.getUserProfile);

// @route   PUT api/users/role
// @desc    Set user role
// @access  Private
router.put('/role', auth, userController.setUserRole);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @route   PUT api/users
// @desc    Update user data (username and role)
// @access  Private
router.put('/', auth, userController.updateUser);

module.exports = router; 