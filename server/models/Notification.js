const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: [
      'collaboration_request', 
      'request_accepted', 
      'request_rejected',
      'project_invitation', 
      'project_join_request', 
      'skill_swap_proposal', 
      'skill_swap_accepted', 
      'new_connection', 
      'project_update'
    ],
    required: true 
  },
  message: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
