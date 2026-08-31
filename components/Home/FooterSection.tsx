import React from 'react';
import { Linkedin, Instagram, Youtube, Mail, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "About Us", href: "/aboutus" },
    { label: "Company", href: "/company" },
    { label: "Services", href: "/services" },
    { label: "Articles", href: "/Articles" },
    { label: "Text Books", href: "/textbooks" },
    { label: "Book Store", href: "/textbooks/store" },
    { label: "Access Portal", href: "/textbooks/portal" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Refund and Cancellation Policy", href: "/refund-policy" },
    { label: "Shipping Policy", href: "/shipping-policy" },
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
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">LURNEXA PUBLICATIONS</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs text-sm md:text-base">
                Empowering technology, innovation, and creativity through professional scholarly publishing.
              </p>
              <div className="pt-3">
                <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md max-w-[280px]">
                  {/* Top accent gradient bar */}
                  <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f97316, #fb923c, #fdba74)' }} />
                  
                  <div className="p-4 space-y-3">
                    {/* ISO Certification */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                          <path d="M9 12l2 2 4-4" />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 tracking-wider uppercase block leading-tight">
                          ISO 9001:2015
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                          Certified
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Official ISSN Number */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block leading-tight">
                          ISSN
                        </span>
                        <span className="font-mono font-extrabold text-sm text-slate-800 tracking-[0.15em]">
                          3139-9126
                        </span>
                      </div>
                    </div>
                  </div>
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
                    LURNEXA PUBLICATIONS, <br />
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
            © {currentYear} LURNEXA PUBLICATIONS. All rights reserved.
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
            <a 
              href="https://www.instagram.com/lurnexa_publications" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-500 transition-all shadow-lg hover:-translate-y-1"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="https://youtube.com/@lurnexapublications?si=zzDaH1o8s8p5YQyg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-500 transition-all shadow-lg hover:-translate-y-1"
            >
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}