import React from 'react';
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { Users, Target, Rocket, History, Award, Building2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'About Lurnexa Publications | Bridging Academics & Technology',
  description: 'Discover the Lurnexa Publications. We are a multidisciplinary powerhouse driving innovation through scholarly publishing (Lurnexa Publications) and advanced software engineering (Lurnexa Technologies).',
  keywords: ['Lurnexa Publications History', 'Academic Publishing India', 'Software Engineering Services', 'Lurnexa Leadership', 'Techno-Management Innovation'],
};

const values = [
  {
    title: "Our Mission",
    description: "To bridge the gap between technology and management through high-quality scholarly research and innovative publishing solutions.",
    icon: <Target className="text-orange-500" size={32} />
  },
  {
    title: "Our Vision",
    description: "To become a globally recognized hub for multidisciplinary research that drives real-world impact and sustainable progress.",
    icon: <Rocket className="text-blue-500" size={32} />
  },
  {
    title: "Academic Integrity",
    description: "Upholding the highest standards of ethics and rigor in every piece of work we publish and every partnership we form.",
    icon: <Award className="text-emerald-500" size={32} />
  }
];

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased">
      <NavigationPage />
      
      <main className="pt-32 pb-20">
        {/* HERO SECTION - Premium Corporate Look */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="relative">
            {/* Background Decorative Elements */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm transition-all hover:border-orange-200">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Techno-Management Synergy</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.85]">
                  Lurnexa <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-700 to-slate-900 italic">Group.</span>
                </h1>
                
                <p className="text-slate-600 text-xl md:text-2xl leading-relaxed max-w-xl font-medium tracking-tight">
                  A multi-sector innovation powerhouse bridging the frontier of <span className="text-slate-950 border-b-2 border-orange-500/20">academic publishing</span> and <span className="text-slate-950 border-b-2 border-blue-500/20">software engineering.</span>
                </p>
                
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img src="/founder.jpeg" alt="Founder" className="object-cover h-full w-full" />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img src="/co-founder.jpg" alt="Co-Founder" className="object-cover h-full w-full" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                    Led by visionaries
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-slate-950 rounded-[3rem] rotate-2 scale-105 opacity-5 blur-2xl group-hover:rotate-1 transition-all duration-700" />
                <div className="relative overflow-hidden rounded-[3rem] border border-slate-200 bg-white p-4 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                    alt="Lurnexa Publications HQ" 
                    className="rounded-[2.2rem] grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 object-cover aspect-[4/3]"
                  />
                  {/* Glassmorphic Overlay Card */}
                  <div className="absolute bottom-10 left-10 right-10 backdrop-blur-xl bg-white/80 border border-white/50 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-900 font-black text-lg mb-1 tracking-tight">Innovation Hub</p>
                    <p className="text-slate-500 text-sm font-medium">Headquartered in Guntur, AP, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DIVISION SHOWCASE - The Strategic Split */}
        <section className="py-32 relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Strategic Divisions</h2>
                <p className="text-slate-400 text-lg max-w-md">Dual engines of growth driving excellence in knowledge and technology.</p>
              </div>
              <div className="h-px flex-1 bg-white/10 mx-8 hidden md:block" />
              <div className="flex gap-4">
                <div className="px-6 py-3 rounded-full border border-white/10 text-white font-bold text-sm tracking-widest uppercase">Operational Excellence</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Publications - The Legacy Card */}
              <div className="group relative overflow-hidden bg-[#FFF9F5] p-12 rounded-[3.5rem] border border-orange-100 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(251,146,60,0.15)] hover:-translate-y-2">
                <div className="flex justify-between items-start mb-12">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-orange-50 flex items-center justify-center text-orange-500 group-hover:rotate-6 transition-all duration-500">
                    <History size={40} />
                  </div>
                  <span className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Academic Core</span>
                </div>
                
                <h3 className="text-4xl font-black text-slate-950 mb-6 tracking-tighter">Lurnexa <br />Publications</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-sm">
                  The scholarly foundation of our group, empowering the academic community through rigorous peer-review and global knowledge dissemination.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {['Scholarly Journals', 'Technical Textbooks', 'Open Access Repository'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-800 font-bold text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies - The Future Card */}
              <div className="group relative overflow-hidden bg-slate-900 p-12 rounded-[3.5rem] border border-white/5 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.2)] hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center text-blue-400 group-hover:-rotate-6 transition-all duration-500">
                    <Rocket size={40} />
                  </div>
                  <span className="px-4 py-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Next-Gen Tech</span>
                </div>
                
                <h3 className="text-4xl font-black text-white mb-6 tracking-tighter relative z-10">Lurnexa <br />Technologies</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm relative z-10">
                  The engineering heart of Lurnexa, crafting sophisticated software ecosystems and delivering mission-critical technical services.
                </p>
                
                <div className="space-y-8 relative z-10">
                  <ul className="space-y-4">
                    {['Enterprise Software', 'Cloud Architecture', 'Strategic IT Consulting'].map(item => (
                      <li key={item} className="flex items-center gap-3 text-slate-300 font-bold text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <a 
                    href="https://lurnexatechnologies.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-xl"
                  >
                    Explore Platform
                    <Rocket size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE PILLARS - Sophisticated Minimalist Cards */}
        <section className="py-32 max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">Foundation of Trust</h2>
            <p className="text-slate-500 text-lg">The values that define our professional integrity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-slate-200 rounded-[2.5rem] translate-y-2 transition-transform group-hover:translate-y-4 -z-10" />
                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 h-full space-y-8 transition-transform group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-slate-950 group-hover:text-white duration-500">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight">{value.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PHILOSOPHY - Large Impact Text */}
        <section className="bg-white py-32 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-950">
              <History size={24} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter leading-tight">
              Transforming raw potential into <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-600">Global Impact.</span>
            </h2>
            <p className="text-slate-500 text-xl leading-relaxed font-medium italic">
              "Our philosophy is simple: we provide the tools, the platforms, and the rigor required for excellence to flourish in an increasingly complex world."
            </p>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
