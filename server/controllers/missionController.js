const Mission = require('../models/Mission');
const User = require('../models/User');

// Create a new mission
exports.createMission = async (req, res) => {
  const { name, context, demand, uiLibrary, dueDate, credits } = req.body;

  try {
    // Check if user is a developer
    const user = await User.findById(req.user.id);
    if (user.role !== 'developer') {
      return res.status(403).json({ msg: 'Only developers can create missions' });
    }

    const newMission = new Mission({
      name,
      context,
      demand,
      uiLibrary,
      dueDate,
      credits,
      developerId: req.user.id
    });

    const mission = await newMission.save();
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all missions
exports.getAllMissions = async (req, res) => {
  try {
    const missions = await Mission.find().sort({ createdAt: -1 });
    res.json(missions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get mission by ID
exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    res.status(500).send('Server error');
  }
};

// Apply for a mission
exports.applyForMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Check if user is a designer
    const user = await User.findById(req.user.id);
    if (user.role !== 'designer') {
      return res.status(403).json({ msg: 'Only designers can apply for missions' });
    }
    
    // Check if mission is open
    if (mission.status !== 'open') {
      return res.status(400).json({ msg: 'This mission is not open for applications' });
    }
    
    // Check if user already applied
    if (mission.designerApplications.some(app => app.designerId.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'You have already applied for this mission' });
    }
    
    // Add application
    mission.designerApplications.unshift({
      designerId: req.user.id,
      note: req.body.note || '',
      status: 'pending'
    });
    
    await mission.save();
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Accept or reject an application
exports.respondToApplication = async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ msg: 'Status must be accepted or rejected' });
  }
  
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Check if user is the developer who created this mission
    if (mission.developerId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Find the application
    const applicationIndex = mission.designerApplications.findIndex(
      app => app._id.toString() === req.params.applicationId
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    // Update application status
    mission.designerApplications[applicationIndex].status = status;
    
    // If accepting, update mission status and reject other applications
    if (status === 'accepted') {
      mission.status = 'in-progress';
      mission.designerApplications.forEach((app, index) => {
        if (index !== applicationIndex && app.status === 'pending') {
          app.status = 'rejected';
        }
      });
    }
    
    await mission.save();
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Submit Figma design
exports.submitDesign = async (req, res) => {
  const { figmaLink } = req.body;
  
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Find the designer's application
    const application = mission.designerApplications.find(
      app => app.designerId.toString() === req.user.id && app.status === 'accepted'
    );
    
    if (!application) {
      return res.status(403).json({ msg: 'You are not the accepted designer for this mission' });
    }
    
    // Update application with Figma link
    application.submittedFigmaLink = figmaLink;
    application.submittedAt = Date.now();
    
    await mission.save();
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Provide feedback and complete mission
exports.provideFeedback = async (req, res) => {
  const { rating, comments } = req.body;
  
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Check if user is the developer who created this mission
    if (mission.developerId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Check if mission is in progress
    if (mission.status !== 'in-progress') {
      return res.status(400).json({ msg: 'Mission must be in progress to provide feedback' });
    }
    
    // Check if there's an accepted designer who submitted work
    const acceptedApplication = mission.designerApplications.find(
      app => app.status === 'accepted' && app.submittedFigmaLink
    );
    
    if (!acceptedApplication) {
      return res.status(400).json({ msg: 'No submitted work found to provide feedback on' });
    }
    
    // Add feedback and complete mission
    mission.feedback = {
      rating,
      comments
    };
    mission.status = 'completed';
    
    await mission.save();
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 