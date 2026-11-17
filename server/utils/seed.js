const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const CollaborationRequest = require('../models/CollaborationRequest');
const SkillSwap = require('../models/SkillSwap');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Report = require('../models/Report');
const getSeedData = require('./seedData');

const seedDB = async () => {
  try {
    console.log('🌱 Seeding SkillSwap database with initial data (Yuvaraj D & Gowri D)...');
    
    // Clear collections
    await User.deleteMany({});
    await Project.deleteMany({});
    await Skill.deleteMany({});
    await CollaborationRequest.deleteMany({});
    await SkillSwap.deleteMany({});
    await Notification.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});

    // Seed Skills
    const skillList = [
      { name: 'Python', category: 'Programming', proficiency: 90 },
      { name: 'React', category: 'Frontend', proficiency: 85 },
      { name: 'Node.js', category: 'Backend', proficiency: 85 },
      { name: 'MongoDB', category: 'Database', proficiency: 80 },
      { name: 'Machine Learning', category: 'AI & Data', proficiency: 88 },
      { name: 'UI/UX', category: 'Design', proficiency: 90 },
      { name: 'Figma', category: 'Design', proficiency: 90 },
      { name: 'Tailwind CSS', category: 'Frontend', proficiency: 85 },
      { name: 'HTML/CSS', category: 'Frontend', proficiency: 90 }
    ];
    await Skill.insertMany(skillList);

    // Seed Users & Projects
    const { users, projects } = await getSeedData();
    const createdUsers = await User.insertMany(users);
    
    const yuvaraj = createdUsers.find(u => u.username === 'yuvaraj');
    const gowri = createdUsers.find(u => u.username === 'gowrid');

    // Create bidirectional connections between Yuvaraj and Gowri
    if (yuvaraj && gowri) {
      yuvaraj.connections = [gowri._id];
      gowri.connections = [yuvaraj._id];

      await yuvaraj.save();
      await gowri.save();
    }

    // Link Projects to Owners and Members
    const createdProjects = [];
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      let owner = yuvaraj;
      let members = [yuvaraj._id, gowri._id];

      if (i === 2) {
        owner = gowri;
        members = [gowri._id, yuvaraj._id];
      }

      const projectDoc = await Project.create({
        ...p,
        owner: owner._id,
        members
      });
      createdProjects.push(projectDoc);
    }

    // Seed Collaboration Requests between Gowri & Yuvaraj
    const colReq1 = await CollaborationRequest.create({
      sender: gowri._id,
      receiver: yuvaraj._id,
      project: createdProjects[0]._id,
      message: "Hi Yuvaraj! I'd love to collaborate on UI/UX for the Smart Attendance System.",
      status: 'accepted'
    });

    const colReq2 = await CollaborationRequest.create({
      sender: yuvaraj._id,
      receiver: gowri._id,
      project: createdProjects[1]._id,
      message: "Hey Gowri! Would love your React & Figma skills on Smart Campus Assistant.",
      status: 'pending'
    });

    // Seed Skill Swaps
    const swap1 = await SkillSwap.create({
      sender: gowri._id,
      receiver: yuvaraj._id,
      offeredSkill: 'UI/UX',
      requestedSkill: 'Python',
      message: 'Hi Yuvaraj! I can teach you Figma & UI/UX design if you can teach me Python basics for data analysis.',
      status: 'pending'
    });

    // Seed Notifications for Yuvaraj
    await Notification.create([
      {
        user: yuvaraj._id,
        type: 'skill_swap_proposal',
        message: 'Gowri D proposed a Skill Swap: Teach Python ⇄ Learn UI/UX.',
        referenceId: swap1._id,
        isRead: false
      },
      {
        user: yuvaraj._id,
        type: 'new_connection',
        message: 'You are now connected with Gowri D.',
        referenceId: gowri._id,
        isRead: true
      },
      {
        user: yuvaraj._id,
        type: 'collaboration_request',
        message: 'Gowri D accepted your request for Smart Attendance System.',
        referenceId: colReq1._id,
        isRead: false
      }
    ]);

    // Seed Notifications for Gowri
    await Notification.create([
      {
        user: gowri._id,
        type: 'new_connection',
        message: 'You are now connected with Yuvaraj D.',
        referenceId: yuvaraj._id,
        isRead: true
      },
      {
        user: gowri._id,
        type: 'collaboration_request',
        message: 'Yuvaraj D sent you a collaboration request for Smart Campus Assistant.',
        referenceId: colReq2._id,
        isRead: false
      }
    ]);

    // Seed Messages between Yuvaraj and Gowri D
    await Message.create([
      {
        sender: gowri._id,
        receiver: yuvaraj._id,
        message: 'Hey Yuvaraj! Checked out your AI Study Planner project, looks super cool!'
      },
      {
        sender: yuvaraj._id,
        receiver: gowri._id,
        message: 'Thanks Gowri! We really need your UI/UX skills to design the interface components.'
      },
      {
        sender: gowri._id,
        receiver: yuvaraj._id,
        message: 'Count me in! Let\'s set up the Figma board this afternoon.'
      }
    ]);

    console.log('✅ SkillSwap Database auto-seeded successfully with Yuvaraj & Gowri!');
  } catch (error) {
    console.error('❌ Database Seeding Failed:', error.message);
  }
};

if (require.main === module) {
  const dotenv = require('dotenv');
  const connectDB = require('../config/db');
  dotenv.config();
  connectDB().then(async () => {
    await seedDB();
    process.exit(0);
  });
}

module.exports = seedDB;
