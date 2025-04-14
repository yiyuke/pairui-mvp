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
    console.log('Profile update request received');
    console.log('Bio length:', bio ? bio.length : 0);
    console.log('Avatar data length:', avatar ? avatar.length : 0);
    console.log('Skills:', skills);
    console.log('Portfolio:', portfolio);
    
    // Build profile object
    const profileFields = {};
    
    // Add bio field
    if (bio !== undefined) {
      console.log('Adding bio to profile fields');
      profileFields.bio = bio;
    }
    
    // Add avatar field if provided
    if (avatar !== undefined) {
      console.log('Processing avatar data');
      // Check if avatar is too large
      if (avatar && avatar.length > 1000000) {
        console.log('Avatar is too large:', avatar.length);
        return res.status(400).json({ msg: 'Avatar image is too large. Please use a smaller image (less than 1MB).' });
      }
      
      // If avatar is empty string, keep it as is
      if (avatar === '') {
        profileFields.avatar = '';
      } else if (avatar) {
        // Only process non-empty avatar data
        console.log('Adding avatar to profile fields');
        profileFields.avatar = avatar;
      }
    }
    
    // Add skills field if provided
    if (skills !== undefined) {
      console.log('Processing skills');
      try {
        if (skills === '') {
          profileFields.skills = [];
        } else {
          profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        console.log('Skills processed:', profileFields.skills);
      } catch (error) {
        console.error('Error processing skills:', error);
        return res.status(400).json({ msg: 'Invalid skills format. Please provide comma-separated skills.' });
      }
    }
    
    // Add portfolio field if provided
    if (portfolio !== undefined) {
      console.log('Processing portfolio URL');
      // Allow empty portfolio URL
      if (portfolio === '') {
        profileFields.portfolio = '';
      } else if (portfolio && !portfolio.startsWith('http')) {
        console.log('Invalid portfolio URL:', portfolio);
        return res.status(400).json({ msg: 'Portfolio URL must start with http:// or https://' });
      } else {
        profileFields.portfolio = portfolio;
      }
    }
    
    console.log('Final profile fields:', JSON.stringify(profileFields));
    
    // Update user
    try {
      console.log('Updating user profile in database');
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { profile: profileFields } },
        { new: true }
      ).select('-password');
      
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ msg: 'User not found' });
      }
      
      console.log('Profile updated successfully');
      res.json(user);
    } catch (dbError) {
      console.error('Database error during update:', dbError);
      return res.status(500).json({ 
        msg: 'Database error during update', 
        error: dbError.message,
        code: dbError.code
      });
    }
  } catch (err) {
    console.error('Profile update error:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
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