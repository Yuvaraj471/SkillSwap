const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, default: 'Technical' },
  proficiency: { type: Number, default: 80 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
