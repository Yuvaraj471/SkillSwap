const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requiredSkills: [{ type: String }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxTeamSize: { type: Number, default: 4 },
  deadline: { type: Date },
  status: { 
    type: String, 
    enum: ['Planning', 'In Progress', 'Completed'], 
    default: 'Planning' 
  },
  progressStep: { type: Number, default: 1 } // 1: Planning, 2: Development, 3: Testing, 4: Completed
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
