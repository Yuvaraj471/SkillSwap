const mongoose = require('mongoose');

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  proficiency: { type: Number, default: 80, min: 0, max: 100 }
}, { _id: false });

const swapSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, default: 'Intermediate' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  profileImage: { type: String, default: '' },
  college: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [skillItemSchema],
  teachSkills: [swapSkillSchema],
  learnSkills: [swapSkillSchema],
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  achievements: [{ type: String }],
  availability: { 
    type: String, 
    enum: ['Available', 'Busy', 'Looking for Team'], 
    default: 'Available' 
  },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isDisabled: { type: Boolean, default: false },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
