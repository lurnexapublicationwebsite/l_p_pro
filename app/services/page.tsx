import React from 'react';
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { BookOpen, Edit3, Shield, Globe, Award, Zap, CheckCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Our Services | Professional Scholarly Publishing & Editorial Support',
  description: 'Explore Lurnexa\'s comprehensive academic services: High-impact peer-reviewed publishing, professional editorial review, digital preservation, and global research dissemination.',
  keywords: ['Journal Publishing Services', 'Editorial Review', 'Academic Manuscript Formatting', 'Digital DOI Assignment', 'Scholarly Research Support'],
};

const services = [
  {
    title: "Scholarly Publishing",
    description: "We provide high-impact, peer-reviewed publishing platforms for researchers across technology, management, and social sciences.",
    icon: <BookOpen className="w-10 h-10 text-orange-500" />,
    features: ["Double-blind Peer Review", "Global Indexing", "Digital DOI Assignment"]
  },
  {
    title: "Editorial Excellence",
    description: "Our professional editorial team ensures that your research meets the highest standards of clarity, structure, and academic rigor.",
    icon: <Edit3 className="w-10 h-10 text-blue-500" />,
    features: ["Manuscript Formatting", "Language Proofreading", "Structural Review"]
  },
  {
    title: "Digital Preservation",
    description: "Secure, long-term archiving of all published content ensures that research remains accessible to future generations of scholars.",
    icon: <Shield className="w-10 h-10 text-emerald-500" />,
    features: ["Permanent Archiving", "Redundant Backups", "Cross-Platform Access"]
  },
  {
    title: "Global Dissemination",
    description: "We leverage advanced digital infrastructure to ensure your work reaches a worldwide audience of academics and practitioners.",
    icon: <Globe className="w-10 h-10 text-indigo-500" />,
    features: ["Open Access Model", "Social Media Promotion", "Institutional Reach"]
  },
  {
    title: "Institutional Collaboration",
    description: "Partnerships with universities and research centers to support local publishing initiatives and academic development.",
    icon: <Award className="w-10 h-10 text-amber-500" />,
    features: ["Conference Proceedings", "White Label Solutions", "Training Workshops"]
  },
  {
    title: "Accelerated Publication",
    description: "Optimized editorial workflows that reduce the time from submission to publication without compromising on quality.",
    icon: <Zap className="w-10 h-10 text-purple-500" />,
    features: ["Rapid Peer Review", "Online First Publishing", "Continuous Updates"]
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationPage />
      
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            <Zap size={12} className="text-orange-400" /> Professional Excellence
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-950 mb-6 tracking-tight leading-none">
            Empowering Scholarly <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Innovation.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Lurnexa Publications offers a comprehensive suite of services designed to support the modern academic lifecycle, from initial submission to global impact.
          </p>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-500 flex flex-col h-full"
              >
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-white transition-all duration-500">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-8 flex-grow">
                  {service.description}
                </p>
                <ul className="space-y-3 pt-6 border-t border-slate-50">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <CheckCircle size={16} className="text-orange-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>


      </main>

      <FooterSection />
    </div>
  );
}
