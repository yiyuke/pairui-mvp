const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const auth = require('../middleware/auth');
const Mission = require('../models/Mission');
const User = require('../models/User');

// @route   POST api/missions
// @desc    Create a new mission
// @access  Private
router.post('/', auth, missionController.createMission);

// @route   GET api/missions
// @desc    Get all missions
// @access  Public
router.get('/', missionController.getAllMissions);

// @route   GET api/missions/:id
// @desc    Get mission by ID
// @access  Public
router.get('/:id', missionController.getMissionById);

// @route   POST api/missions/:id/apply
// @desc    Apply for a mission
// @access  Private
router.post('/:id/apply', auth, missionController.applyForMission);

// @route   PUT api/missions/:id/applications/:applicationId
// @desc    Accept or reject an application
// @access  Private
router.put('/:id/applications/:applicationId', auth, missionController.respondToApplication);

// @route   PUT api/missions/:id/submit
// @desc    Submit work for a mission
// @access  Private
router.put('/:id/submit', auth, missionController.submitWork);

// @route   PUT api/missions/:id/feedback
// @desc    Provide feedback and complete mission
// @access  Private
router.put('/:id/feedback', auth, missionController.provideFeedback);

// @route   PUT api/missions/:id
// @desc    Update a mission
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Check if user is the mission creator
    if (mission.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const { title, description, requirements, budget, deadline, status } = req.body;
    
    // Update mission fields
    if (title) mission.title = title;
    if (description) mission.description = description;
    if (requirements) mission.requirements = requirements;
    if (budget) mission.budget = budget;
    if (deadline) mission.deadline = deadline;
    if (status) mission.status = status;
    
    await mission.save();
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/missions/:id
// @desc    Delete a mission
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Check if user is the mission creator
    if (mission.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await mission.remove();
    res.json({ msg: 'Mission removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 