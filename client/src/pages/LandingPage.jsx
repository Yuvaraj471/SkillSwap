import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, ArrowRight, Users, Sparkles, FolderKanban, 
  Repeat, ShieldCheck, CheckCircle2, Search, Code, Brain, Palette
} from 'lucide-react';

export const LandingPage = () => {
  const steps = [
    { number: '01', title: 'Create Your Profile', desc: 'Set up your academic profile, department, and bio.' },
    { number: '02', title: 'Add Your Skills', desc: 'List technical and non-technical skills with proficiency levels.' },
    { number: '03', title: 'Discover People', desc: 'Search peers or calculate skill compatibility matching scores.' },
    { number: '04', title: 'Build Your Team', desc: 'Collaborate on projects, exchange skills, and create together.' },
  ];

  const popularSkills = [
    'Python', 'React', 'Machine Learning', 'UI/UX', 'Java', 
    'Node.js', 'MongoDB', 'Data Science', 'Cybersecurity', 'Cloud'
  ];

  const features = [
    {
      icon: Search,
      title: 'Skill Discovery',
      desc: 'Find college peers based on exact technical stack, department, year, and availability.'
    },
    {
      icon: Sparkles,
      title: 'Smart Matching',
      desc: 'Calculate exact mathematical compatibility percentages between skills and project requirements.'
    },
    {
      icon: FolderKanban,
      title: 'Project Collaboration',
      desc: 'Build multi-disciplinary student teams, track milestones, and manage project members.'
    },
    {
      icon: Repeat,
      title: 'Skill Exchange',
      desc: 'Teach what you know and learn what you need through mutual Skill Swap proposals.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-8 animate-bounce">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>The #1 Student Collaboration Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Find the Right Skills. <br />
            <span className="gradient-text">Build the Right Team.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            SkillSwap helps students discover talented peers, exchange knowledge, and build meaningful academic and capstone projects together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white gradient-bg shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/discover"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Skills</span>
            </Link>
          </div>

          {/* Interactive Hero Skill Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">YD</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Yuvaraj D</h4>
                  <p className="text-xs text-slate-500">AI & DS • 3rd Year</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">✓ Python</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-medium">✓ React</span>
                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded font-medium">✓ ML</span>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">95% Match</span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">GD</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Gowri D</h4>
                  <p className="text-xs text-slate-500">CSE • 3rd Year</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-medium">✓ UI/UX</span>
                <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded font-medium">✓ Figma</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-medium">✓ React</span>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">Swap Partner</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">How SkillSwap Works</h2>
            <p className="text-sm text-slate-600">Four straightforward steps to building your dream project team.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
                <span className="text-3xl font-black text-indigo-600 block mb-4 font-mono">{step.number}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR SKILLS */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Skills on Campus</h2>
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {popularSkills.map((skill) => (
              <Link
                key={skill}
                to={`/discover?skill=${encodeURIComponent(skill)}`}
                className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all"
              >
                {skill}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SKILLSWAP (FEATURES) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Why SkillSwap?</h2>
            <p className="text-sm text-slate-600">Built specifically for student networking, team formation, and peer learning.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-6 fill-current" />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Your next project partner could be one skill away.</h2>
          <p className="text-slate-400 text-sm mb-8">Join hundreds of college students building real projects on SkillSwap.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold gradient-bg text-white shadow-xl shadow-indigo-500/30 hover:opacity-95 transition-all"
          >
            <span>Join SkillSwap Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
};
