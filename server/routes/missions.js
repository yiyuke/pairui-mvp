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
router.get('/', auth, missionController.getAllMissions);

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
router.put('/:id', auth, missionController.updateMission);

// @route   DELETE api/missions/:id
// @desc    Delete a mission
// @access  Private
router.delete('/:id', auth, missionController.deleteMission);

module.exports = router; 