import React from 'react';
import { Linkedin, Mail, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "About Us", href: "/aboutus" },
    { label: "Company", href: "/company" },
    { label: "Services", href: "/services" },
    { label: "Articles", href: "/Articles" },
    { label: "Textbook", href: "/textbooks" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Plagiarism Policy", href: "/plagiarism-policy" },
    { label: "Submission Guidelines", href: "/submission_guidelines.pdf" },
  ];

  return (
    <footer 
      className="border-t border-slate-200 pt-16 pb-8"
      style={{ backgroundColor: "#FFF0E6" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col space-y-6">
            <Link href="/" className="inline-block">
              <img
                src="/Logo.png"
                alt="Lurnexa Logo"
                className="h-10 w-auto"
              />
            </Link>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Lurnexa Publications</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs text-sm md:text-base">
                Empowering technology, innovation, and creativity through professional scholarly publishing.
              </p>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-orange-200 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-700 tracking-wider">
                    ISO 9001:2015 Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Explore</h4>
            <ul className="flex flex-col space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-600 hover:text-orange-500 transition-colors font-medium text-sm md:text-base flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Information</h4>
            <ul className="flex flex-col space-y-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-600 hover:text-orange-500 transition-colors font-medium text-sm md:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/contact" 
                  className="text-slate-600 hover:text-orange-500 transition-colors font-medium text-sm md:text-base"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Contact</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                  <Mail size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Email</p>
                  <a href="mailto:lurnexapublication@gmail.com" className="text-sm font-bold text-slate-900 hover:text-orange-500 transition-colors">
                    lurnexapublication@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                  <MapPin size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Address</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    Lurnexa Publications, <br />
                    130–187, Ramulavari Gudi Centre, Gorantla, Guntur – 522034, AP, India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-400 font-medium order-2 md:order-1">
            © {currentYear} Lurnexa Publications. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 order-1 md:order-2">
            <a 
              href="https://www.linkedin.com/company/lurnexa-publications/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-500 transition-all shadow-lg hover:-translate-y-1"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}