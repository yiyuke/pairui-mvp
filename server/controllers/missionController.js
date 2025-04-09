const Mission = require('../models/Mission');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new mission
exports.createMission = async (req, res) => {
  const { name, context, demand, uiLibrary, dueDate, credits, figmaLink } = req.body;

  try {
    // Check if user has a role
    const user = await User.findById(req.user.id);
    if (!user.role) {
      return res.status(403).json({ msg: 'You must select a role before creating missions' });
    }

    // Check if user has enough credits
    if (user.credits < credits) {
      return res.status(400).json({ 
        msg: `Insufficient credits. You have ${user.credits} credits, but this mission requires ${credits} credits.` 
      });
    }

    // Deduct credits from user
    user.credits -= credits;
    await user.save();

    const newMission = new Mission({
      name,
      context,
      demand,
      uiLibrary,
      dueDate,
      credits,
      creatorId: req.user.id,
      creatorRole: user.role,
      figmaLink: figmaLink || null
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
    // Check if req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User authentication failed' });
    }

    // Populate creator information
    const missions = await Mission.find()
      .populate('creatorId', 'username profile.avatar')
      .populate('applications.applicantId', 'username profile.avatar')
      .sort({ createdAt: -1 });
    
    // Get the user's role
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // If user is a developer, include all missions created by designers
    // If user is a designer, include all missions created by developers
    // Always include missions created by the user themselves
    let filteredMissions;
    if (user.role === 'developer') {
      filteredMissions = missions.filter(mission => 
        (mission.creatorId && mission.creatorId._id && mission.creatorId._id.toString() === req.user.id) || 
        mission.creatorRole === 'designer'
      );
    } else if (user.role === 'designer') {
      filteredMissions = missions.filter(mission => 
        (mission.creatorId && mission.creatorId._id && mission.creatorId._id.toString() === req.user.id) || 
        mission.creatorRole === 'developer'
      );
    } else {
      filteredMissions = missions;
    }
    
    res.json(filteredMissions);
  } catch (err) {
    console.error('Error in getAllMissions:', err.message);
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
    
    console.log('Mission applications:', mission.applications);
    res.json(mission);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    res.status(500).send('Server error');
  }
};

// Add this helper function to create notifications
const createNotification = async (recipientId, message, missionId) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      message,
      missionId
    });
    
    await notification.save();
  } catch (err) {
    console.error('Error creating notification:', err);
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
      
    // After saving the mission, create a notification for the mission creator
    await createNotification(
      mission.creatorId,
      `A new application has been received for your mission "${mission.name}"`,
      mission._id
    );
    
    res.json(updatedMission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Accept or reject an application
exports.respondToApplication = async (req, res) => {
  const { status, rejectionNote } = req.body;
  
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
    
    // Add rejection note if provided
    if (status === 'rejected' && rejectionNote) {
      console.log('Setting rejection note:', rejectionNote);
      mission.applications[applicationIndex].rejectionNote = rejectionNote;
    }
    
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
      
    // After updating the application status
    const applicantId = mission.applications[applicationIndex].applicantId;
    const statusText = status === 'accepted' ? 'accepted' : 'rejected';
    
    let notificationMessage = `Your application for the mission "${mission.name}" has been ${statusText}`;
    if (status === 'rejected' && rejectionNote) {
      notificationMessage += `. Reason: ${rejectionNote}`;
    }
    
    await createNotification(
      applicantId,
      notificationMessage,
      mission._id
    );
    
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
      
    // After saving the mission
    await createNotification(
      mission.creatorId,
      `The work for your mission "${mission.name}" has been submitted`,
      mission._id
    );
    
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
    
    // Transfer credits from creator to applicant
    const applicant = await User.findById(acceptedApplication.applicantId);
    
    if (!applicant) {
      return res.status(404).json({ msg: 'Applicant not found' });
    }
    
    // Add credits to applicant
    applicant.credits += mission.credits;
    await applicant.save();
    
    await mission.save();
    
    // Populate user info before returning
    const updatedMission = await Mission.findById(mission._id)
      .populate('creatorId', 'username profile.avatar')
      .populate('applications.applicantId', 'username profile.avatar');
      
    // After saving the mission
    await createNotification(
      acceptedApplication.applicantId,
      `Feedback has been provided for your work on the mission "${mission.name}". You received ${mission.credits} credits!`,
      mission._id
    );
    
    res.json(updatedMission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a mission
exports.updateMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Check if user is the mission creator
    if (mission.creatorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Only allow editing if mission is still open
    if (mission.status !== 'open') {
      return res.status(400).json({ msg: 'Cannot edit missions that are in progress or completed' });
    }
    
    const { name, context, demand, uiLibrary, dueDate, credits, figmaLink } = req.body;
    
    // Update mission fields
    if (name) mission.name = name;
    if (context) mission.context = context;
    if (demand) mission.demand = demand;
    if (uiLibrary) mission.uiLibrary = uiLibrary;
    if (dueDate) mission.dueDate = dueDate;
    if (credits) mission.credits = credits;
    if (figmaLink !== undefined) mission.figmaLink = figmaLink;
    
    await mission.save();
    
    // Notify applicants about the mission update
    if (mission.applications && mission.applications.length > 0) {
      for (const application of mission.applications) {
        await createNotification(
          application.applicantId,
          `A mission you applied for "${mission.name}" has been updated`,
          mission._id
        );
      }
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

// Delete a mission
exports.deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    
    // Check if user is the mission creator
    if (mission.creatorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Only allow deletion if mission is still open
    if (mission.status !== 'open') {
      return res.status(400).json({ msg: 'Cannot delete missions that are in progress or completed' });
    }
    
    // Return credits to the creator
    const user = await User.findById(req.user.id);
    user.credits += mission.credits;
    await user.save();
    
    // Notify applicants about the mission deletion before deleting
    if (mission.applications && mission.applications.length > 0) {
      for (const application of mission.applications) {
        await createNotification(
          application.applicantId,
          `A mission you applied for "${mission.name}" has been deleted`,
          null // No mission ID since it's being deleted
        );
      }
    }
    
    await Mission.deleteOne({ _id: mission._id });
    res.json({ msg: 'Mission removed', creditsReturned: mission.credits });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Mission not found' });
    }
    res.status(500).send('Server error');
  }
};

// Request revisions for submitted work
exports.requestRevision = async (req, res) => {
  const { comments } = req.body;
  
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
      return res.status(400).json({ msg: 'Mission must be in progress to request revisions' });
    }
    
    // Check if there's an accepted applicant who submitted work
    const acceptedApplication = mission.applications.find(
      app => app.status === 'accepted' && app.submittedLink
    );
    
    if (!acceptedApplication) {
      return res.status(400).json({ msg: 'No submitted work found to request revisions for' });
    }
    
    // Create a notification for the applicant
    await createNotification(
      acceptedApplication.applicantId,
      `The creator has requested revisions for your work on "${mission.name}": ${comments}`,
      mission._id
    );
    
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