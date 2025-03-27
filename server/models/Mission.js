const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const missionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  context: {
    type: String,
    required: true
  },
  demand: {
    type: String,
    required: true
  },
  uiLibrary: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  developerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed'],
    default: 'open'
  },
  designerApplications: [
    {
      designerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      note: String,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      },
      submittedFigmaLink: String,
      submittedAt: Date
    }
  ],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mission', missionSchema); 