import Navbar from '@/components/layout/Navbar';
import { PawPrint, Heart, Target, Users, Globe, ArrowRight, ExternalLink, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Priya Sharma', role: 'Founder & CEO', initials: 'PS', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  { name: 'Rahul Verma', role: 'CTO & IoT Lead', initials: 'RV', color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
  { name: 'Anika Patel', role: 'Head of Operations', initials: 'AP', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  { name: 'Vikram Singh', role: 'AI & ML Engineer', initials: 'VS', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-ink">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        {/* Hero */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-moss-100 dark:bg-moss-700/20 px-4 py-1.5 text-sm font-medium text-moss-600 dark:text-moss-300">
            <PawPrint className="h-4 w-4" /> About ResQPet
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-ink dark:text-bone">
            Building a <span className="text-moss-600">Safer World</span><br />for Every Pet
          </h1>
          <p className="text-lg text-ink/70 dark:text-bone/70">
            ResQPet is an AI & IoT powered platform founded with a single mission — to ensure no pet goes lost or unrescued. We connect pet owners, rescuers, NGOs, vets, and foster homes on one unified platform.
          </p>
        </div>

        {/* Mission cards */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: <Target className="h-7 w-7 text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-900/20', title: 'Our Mission', desc: 'To leverage technology for animal welfare — making pet rescue faster, smarter, and more coordinated across India.' },
            { icon: <Globe className="h-7 w-7 text-green-600" />, bg: 'bg-green-100 dark:bg-green-900/20', title: 'Our Vision', desc: 'A world where every lost pet can be found, every stray can be rescued, and every animal has access to care and love.' },
            { icon: <Heart className="h-7 w-7 text-red-500" />, bg: 'bg-red-100 dark:bg-red-900/20', title: 'Our Values', desc: 'Compassion, innovation, transparency, and community. We believe technology and kindness together can change the world for animals.' },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-ink/5 dark:border-bone/5 bg-white dark:bg-ink-soft p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${c.bg}`}>
                {c.icon}
              </div>
              <h3 className="mb-3 font-display text-xl font-bold text-ink dark:text-bone">{c.title}</h3>
              <p className="text-ink/60 dark:text-bone/60 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-16 rounded-2xl bg-gradient-to-r from-moss-600 to-blue-600 p-10">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-white">Our Impact So Far</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center text-white">
            {[
              { value: '1,248', label: 'Pets Rescued' },
              { value: '892', label: 'Active Users' },
              { value: '346', label: 'Successful Adoptions' },
              { value: '6', label: 'Cities Covered' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl font-bold">{s.value}</p>
                <p className="mt-1 text-white/70 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-ink dark:text-bone">Meet the Team</h2>
        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="rounded-2xl border border-ink/5 dark:border-bone/5 bg-white dark:bg-ink-soft p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${member.color}`}>
                {member.initials}
              </div>
              <h3 className="mb-1 font-bold text-ink dark:text-bone">{member.name}</h3>
              <p className="mb-4 text-sm text-ink/60 dark:text-bone/60">{member.role}</p>
              <div className="flex justify-center gap-3 text-ink/40 dark:text-bone/40">
                <ExternalLink className="h-4 w-4 cursor-pointer hover:text-blue-500 transition-colors" />
                <Globe className="h-4 w-4 cursor-pointer hover:text-sky-400 transition-colors" />
                <Mail className="h-4 w-4 cursor-pointer hover:text-red-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="mb-16 rounded-2xl border border-ink/5 dark:border-bone/5 bg-white dark:bg-ink-soft p-8 shadow-sm">
          <h2 className="mb-4 font-display text-2xl font-bold text-ink dark:text-bone">Powered by Technology</h2>
          <p className="mb-6 text-ink/60 dark:text-bone/60">
            ResQPet uses cutting-edge AI and IoT technology to deliver real-time pet safety solutions.
          </p>
          <div className="flex flex-wrap gap-3">
            {['AI Image Recognition', 'IoT GPS Tracking', 'Real-time Notifications', 'Geo-fencing', 'Machine Learning', 'React Native App', 'WebSocket Live Updates', 'Cloud Infrastructure'].map((tech) => (
              <span key={tech} className="rounded-full border border-ink/10 dark:border-bone/10 bg-ink/5 dark:bg-bone/5 px-4 py-1.5 text-sm font-medium text-ink/80 dark:text-bone/80">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-moss-600 to-teal-600 p-10 text-center text-white">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="mb-3 font-display text-3xl font-bold">Join the ResQPet Community</h2>
          <p className="mb-6 text-white/70">Whether you're a pet owner, rescuer, NGO, vet, or just an animal lover — there's a place for you in our community.</p>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-moss-700 hover:bg-green-50 transition-colors">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <footer className="mt-12 border-t border-ink/10 dark:border-bone/10 bg-white dark:bg-ink-soft px-6 py-8">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 text-sm text-ink/60 dark:text-bone/60 md:flex-row">
          <span className="flex items-center gap-2 font-bold text-ink dark:text-bone">
            <PawPrint className="h-4 w-4 text-moss-600" /> ResQPet
          </span>
          <span>© {new Date().getFullYear()} ResQPet. Built for pets who wander.</span>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
