const Mission = require('../models/Mission');
const User = require('../models/User');

// Create a new mission
exports.createMission = async (req, res) => {
  const { name, context, demand, uiLibrary, dueDate, credits } = req.body;

  try {
    // Check if user has a role
    const user = await User.findById(req.user.id);
    if (!user.role) {
      return res.status(403).json({ msg: 'You must select a role before creating missions' });
    }

    const newMission = new Mission({
      name,
      context,
      demand,
      uiLibrary,
      dueDate,
      credits,
      creatorId: req.user.id,
      creatorRole: user.role
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
    // Populate creator information
    const missions = await Mission.find()
      .populate('creatorId', 'username profile.avatar')
      .populate('applications.applicantId', 'username profile.avatar')
      .sort({ createdAt: -1 });
    
    res.json(missions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get mission by ID
exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('creatorId', 'username profile.avatar profile.bio')
      .populate('applications.applicantId', 'username profile.avatar profile.bio');
    
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
    
    // Check if user has the opposite role of the creator
    const user = await User.findById(req.user.id);
    if (user.role === mission.creatorRole) {
      return res.status(403).json({ 
        msg: `${mission.creatorRole === 'developer' ? 'Developers' : 'Designers'} cannot apply for ${mission.creatorRole} missions` 
      });
    }
    
    // Check if mission is open
    if (mission.status !== 'open') {
      return res.status(400).json({ msg: 'This mission is not open for applications' });
    }
    
    // Check if user already applied
    if (mission.applications.some(app => app.applicantId.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'You have already applied for this mission' });
    }
    
    // Add application
    mission.applications.unshift({
      applicantId: req.user.id,
      note: req.body.note || '',
      status: 'pending'
    });
    
    await mission.save();
    
    // Populate the user info before returning
    const updatedMission = await Mission.findById(mission._id)
      .populate('creatorId', 'username profile.avatar')
      .populate('applications.applicantId', 'username profile.avatar');
      
    res.json(updatedMission);
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
    
    // Check if user is the creator of this mission
    if (mission.creatorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Find the application
    const applicationIndex = mission.applications.findIndex(
      app => app._id.toString() === req.params.applicationId
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    // Update application status
    mission.applications[applicationIndex].status = status;
    
    // If accepting, update mission status and reject other applications
    if (status === 'accepted') {
      mission.status = 'in-progress';
      mission.applications.forEach((app, index) => {
        if (index !== applicationIndex && app.status === 'pending') {
          app.status = 'rejected';
        }
      });
    }
    
    await mission.save();
    
    // Populate user info before returning
    const updatedMission = await Mission.findById(mission._id)
      .populate('creatorId', 'username profile.avatar')
      .populate('applications.applicantId', 'username profile.avatar');
      
    res.json(updatedMission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Submit work
exports.submitWork = async (req, res) => {
  const { submittedLink } = req.body;
  
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Find the user's application
    const application = mission.applications.find(
      app => app.applicantId.toString() === req.user.id && app.status === 'accepted'
    );
    
    if (!application) {
      return res.status(403).json({ msg: 'You are not the accepted applicant for this mission' });
    }
    
    // Update application with submitted link
    application.submittedLink = submittedLink;
    application.submittedAt = Date.now();
    
    await mission.save();
    
    // Populate user info before returning
    const updatedMission = await Mission.findById(mission._id)
      .populate('creatorId', 'username profile.avatar')
      .populate('applications.applicantId', 'username profile.avatar');
      
    res.json(updatedMission);
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
    
    // Check if user is the creator of this mission
    if (mission.creatorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Check if mission is in progress
    if (mission.status !== 'in-progress') {
      return res.status(400).json({ msg: 'Mission must be in progress to provide feedback' });
    }
    
    // Check if there's an accepted applicant who submitted work
    const acceptedApplication = mission.applications.find(
      app => app.status === 'accepted' && app.submittedLink
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
    
    // Populate user info before returning
    const updatedMission = await Mission.findById(mission._id)
      .populate('creatorId', 'username profile.avatar')
      .populate('applications.applicantId', 'username profile.avatar');
      
    res.json(updatedMission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 