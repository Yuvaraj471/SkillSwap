const bcrypt = require('bcryptjs');

const getSeedData = async () => {
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const users = [
    {
      name: 'Yuvaraj D',
      username: 'yuvaraj',
      email: 'yuvaraj@skillswap.edu',
      password: defaultPasswordHash,
      college: 'National Institute of Technology',
      department: 'AI & DS',
      year: '3rd Year',
      bio: 'Full-stack AI developer passionate about machine learning, React apps, and scalable node backends.',
      location: 'Block A, Hostel 4',
      profileImage: '',
      availability: 'Available',
      role: 'student',
      skills: [
        { name: 'Python', category: 'Programming', proficiency: 90 },
        { name: 'React', category: 'Frontend', proficiency: 85 },
        { name: 'MongoDB', category: 'Database', proficiency: 80 },
        { name: 'Machine Learning', category: 'AI', proficiency: 88 },
        { name: 'Node.js', category: 'Backend', proficiency: 75 }
      ],
      teachSkills: [
        { name: 'Python', level: 'Advanced' },
        { name: 'React', level: 'Intermediate' }
      ],
      learnSkills: [
        { name: 'UI/UX', level: 'Beginner' },
        { name: 'Cybersecurity', level: 'Beginner' }
      ],
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        portfolio: 'https://yuvaraj.dev'
      },
      achievements: ['1st Place Hackathon 2025', 'AWS Certified Cloud Practitioner']
    },
    {
      name: 'Gowri D',
      username: 'gowrid',
      email: 'gowri@skillswap.edu',
      password: defaultPasswordHash,
      college: 'National Institute of Technology',
      department: 'CSE',
      year: '3rd Year',
      bio: 'UI/UX designer and Frontend developer focused on intuitive human-centered design systems.',
      location: 'Block C, Hostel 2',
      profileImage: '',
      availability: 'Available',
      role: 'student',
      skills: [
        { name: 'UI/UX', category: 'Design', proficiency: 95 },
        { name: 'Figma', category: 'Design', proficiency: 92 },
        { name: 'React', category: 'Frontend', proficiency: 80 },
        { name: 'HTML/CSS', category: 'Frontend', proficiency: 90 },
        { name: 'Tailwind CSS', category: 'Frontend', proficiency: 85 }
      ],
      teachSkills: [
        { name: 'UI/UX', level: 'Advanced' },
        { name: 'Figma', level: 'Advanced' }
      ],
      learnSkills: [
        { name: 'React', level: 'Intermediate' },
        { name: 'Python', level: 'Beginner' }
      ],
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        portfolio: 'https://gowridesign.io'
      },
      achievements: ['Figma Community Creator', 'Best Mobile Design 2025']
    },
    {
      name: 'Platform Administrator',
      username: 'admin',
      email: 'admin@skillswap.edu',
      password: adminPasswordHash,
      college: 'System Administration',
      department: 'IT Services',
      year: 'Staff',
      bio: 'SkillSwap Platform Lead Administrator.',
      location: 'Admin HQ',
      profileImage: '',
      availability: 'Available',
      role: 'admin',
      skills: [],
      teachSkills: [],
      learnSkills: [],
      socialLinks: {},
      achievements: []
    }
  ];

  const projects = [
    {
      title: 'Smart Attendance System',
      description: 'AI-powered facial recognition campus attendance system built with React, Node.js, MongoDB, and Computer Vision.',
      category: 'Artificial Intelligence',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'Python'],
      maxTeamSize: 4,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      progressStep: 2
    },
    {
      title: 'Smart Campus Assistant',
      description: 'Real-time chatbot and interactive campus map for new college students navigation and timetable alerts.',
      category: 'Web Application',
      requiredSkills: ['React', 'Node.js', 'UI/UX', 'Python'],
      maxTeamSize: 4,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'Planning',
      progressStep: 1
    },
    {
      title: 'AI Study Planner',
      description: 'Personalized study schedule optimizer powered by machine learning algorithms and calendar sync.',
      category: 'Machine Learning',
      requiredSkills: ['Python', 'Machine Learning', 'React', 'UI/UX'],
      maxTeamSize: 3,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      progressStep: 2
    }
  ];

  return { users, projects };
};

module.exports = getSeedData;
