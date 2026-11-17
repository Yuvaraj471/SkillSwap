const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
