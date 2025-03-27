const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const auth = require('../middleware/auth');

// @route   POST api/missions
// @desc    Create a new mission
// @access  Private
router.post('/', auth, missionController.createMission);

// @route   GET api/missions
// @desc    Get all missions
// @access  Private
router.get('/', auth, missionController.getAllMissions);

// @route   GET api/missions/:id
// @desc    Get mission by ID
// @access  Private
router.get('/:id', auth, missionController.getMissionById);

// @route   POST api/missions/:id/apply
// @desc    Apply for a mission
// @access  Private
router.post('/:id/apply', auth, missionController.applyForMission);

// @route   PUT api/missions/:id/applications/:applicationId
// @desc    Accept or reject an application
// @access  Private
router.put('/:id/applications/:applicationId', auth, missionController.respondToApplication);

// @route   PUT api/missions/:id/submit
// @desc    Submit Figma design
// @access  Private
router.put('/:id/submit', auth, missionController.submitDesign);

// @route   PUT api/missions/:id/feedback
// @desc    Provide feedback and complete mission
// @access  Private
router.put('/:id/feedback', auth, missionController.provideFeedback);

module.exports = router; 