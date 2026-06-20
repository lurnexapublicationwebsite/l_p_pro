import React from 'react';
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { Scale, ShieldCheck, AlertCircle, FileText, Globe, Gavel } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Terms of Service | Lurnexa Publications',
  description: 'Read the terms and conditions governing the use of Lurnexa Publications services and websites.',
};

const sections = [
  {
    title: "Acceptance of Terms",
    icon: <CheckCircleIcon />,
    content: "By accessing or using the LURNEXA PUBLICATIONS website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
  },
  {
    title: "Intellectual Property",
    icon: <Scale className="text-blue-500" size={24} />,
    content: "All content published by Lurnexa, including journals, articles, logos, and graphics, is the intellectual property of LURNEXA PUBLICATIONS or its licensors. Unauthorized reproduction, distribution, or modification of this content is strictly prohibited without prior written consent."
  },
  {
    title: "User Obligations",
    icon: <ShieldCheck className="text-emerald-500" size={24} />,
    content: "Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to provide accurate and complete information during registration and to use the services only for lawful purposes."
  },
  {
    title: "Publication Policies",
    icon: <FileText className="text-orange-500" size={24} />,
    content: "All submissions to Lurnexa Journals are subject to our Editorial and Peer Review policies. Authors retain certain rights to their work under the Creative Commons licenses specified at the time of publication."
  },
  {
    title: "Limitation of Liability",
    icon: <AlertCircle className="text-rose-500" size={24} />,
    content: "LURNEXA PUBLICATIONS shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services, even if we have been advised of the possibility of such damages."
  },
  {
    title: "Governing Law",
    icon: <Gavel className="text-slate-500" size={24} />,
    content: "These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts located in Andhra Pradesh, India."
  }
];

function CheckCircleIcon() {
  return (
    <svg className="text-indigo-500 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationPage />
      
      <main className="pt-32 pb-20">
        <section className="max-w-4xl mx-auto px-6 mb-16">
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">
            <Globe size={16} /> Legal Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 tracking-tight">Terms of <span className="text-orange-500">Service</span></h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Last Updated: May 1, 2026. These terms govern your relationship with LURNEXA PUBLICATIONS.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 gap-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{index + 1}. {section.title}</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact info for legal */}
        <section className="max-w-4xl mx-auto px-6 mt-16 pt-16 border-t border-slate-200">
           <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Have questions about our terms?</h3>
                <p className="text-slate-400">Our legal team is here to help you understand your rights.</p>
              </div>
              <a href="mailto:lurnexapublication@gmail.com" className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg whitespace-nowrap">
                Contact Legal Dept
              </a>
           </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
