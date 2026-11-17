/**
 * Calculate skill compatibility match percentage and detailed breakdown.
 * @param {Array<string>} requiredSkills - Array of required skill names
 * @param {Array<Object|string>} candidateSkills - Array of user skills (objects with .name or strings)
 * @returns {Object} { matchPercentage, matchedSkills, missingSkills }
 */
const calculateMatch = (requiredSkills = [], candidateSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: []
    };
  }

  // Normalize candidate skill names to lowercase strings
  const candidateSkillNames = candidateSkills.map(s => {
    if (typeof s === 'string') return s.toLowerCase().trim();
    if (s && s.name) return s.name.toLowerCase().trim();
    return '';
  }).filter(Boolean);

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach(req => {
    const reqClean = req.trim();
    const reqLower = reqClean.toLowerCase();
    
    // Check exact or partial match
    const isMatched = candidateSkillNames.some(cs => 
      cs === reqLower || cs.includes(reqLower) || reqLower.includes(cs)
    );

    if (isMatched) {
      matchedSkills.push(reqClean);
    } else {
      missingSkills.push(reqClean);
    }
  });

  const matchedCount = matchedSkills.length;
  const totalRequired = requiredSkills.length;
  const matchPercentage = Math.round((matchedCount / totalRequired) * 100);

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    matchedCount,
    totalRequired
  };
};

/**
 * Find Skill Swap mutual matches between user A and user B
 * User A can teach -> User B wants to learn
 * AND User B can teach -> User A wants to learn
 */
const checkSkillSwapCompatibility = (userA, userB) => {
  const aTeach = (userA.teachSkills || []).map(s => (s.name || s).toLowerCase());
  const aLearn = (userA.learnSkills || []).map(s => (s.name || s).toLowerCase());

  const bTeach = (userB.teachSkills || []).map(s => (s.name || s).toLowerCase());
  const bLearn = (userB.learnSkills || []).map(s => (s.name || s).toLowerCase());

  // A teaches what B wants to learn
  const aTeachesB = aTeach.filter(t => bLearn.some(l => l.includes(t) || t.includes(l)));
  // B teaches what A wants to learn
  const bTeachesA = bTeach.filter(t => aLearn.some(l => l.includes(t) || t.includes(l)));

  const isMutual = aTeachesB.length > 0 && bTeachesA.length > 0;

  return {
    isMutual,
    aTeachesB,
    bTeachesA,
    score: (aTeachesB.length > 0 ? 50 : 0) + (bTeachesA.length > 0 ? 50 : 0)
  };
};

module.exports = {
  calculateMatch,
  checkSkillSwapCompatibility
};
