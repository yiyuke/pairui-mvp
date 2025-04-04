const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Set user role
exports.setUserRole = async (req, res) => {
  const { role } = req.body;

  // Check if role is valid
  if (role !== 'designer' && role !== 'developer') {
    return res.status(400).json({ msg: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.user.id);
    user.role = role;
    
    // Set default avatar based on role if user doesn't have a custom avatar
    if (!user.profile.avatar || user.profile.avatar === 'https://via.placeholder.com/150') {
      // Use absolute URLs that will work in both development and production
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com' 
        : 'http://localhost:5001';
        
      if (role === 'developer') {
        user.profile.avatar = `${baseUrl}/api/uploads/default-developer-avatar.png`;
      } else {
        user.profile.avatar = `${baseUrl}/api/uploads/default-designer-avatar.png`;
      }
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { bio, avatar, skills, portfolio } = req.body;
  
  try {
    // Build profile object
    const profileFields = {};
    if (bio !== undefined) profileFields.bio = bio;
    if (avatar !== undefined) {
      // If it's a base64 image, you might want to:
      // 1. Validate it's a proper image
      // 2. Potentially resize/compress it
      // 3. Consider storing in a service like AWS S3 instead of the database
      profileFields.avatar = avatar;
    }
    if (skills !== undefined) profileFields.skills = skills.split(',').map(skill => skill.trim());
    if (portfolio !== undefined) profileFields.portfolio = portfolio;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile: profileFields } },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Update user data (username and role)
exports.updateUser = async (req, res) => {
  const { username, role } = req.body;
  
  try {
    // Validate role if provided
    if (role && role !== 'designer' && role !== 'developer') {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    
    // Build update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (role) updateFields.role = role;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// module.exports = exports; 