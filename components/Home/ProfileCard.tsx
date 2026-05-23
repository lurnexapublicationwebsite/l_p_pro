"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdEmail } from "react-icons/md";

interface ProfileCardProps {
  id: number | string;
  image: string;
  name: string;
  role: string;
  college: string;
  linkedinUrl?: string;
  Desgination: string;
  collegeUrl?: string;
  mail?: string;
  department?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  image,
  name,
  role,
  college,
  linkedinUrl,
  Desgination,
  collegeUrl,
  mail,
  department
}) => {
  // Prevent router errors by checking if the component is mounted
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-center p-4 font-sans bg-transparent">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Roboto+Slab:wght@700;800&display=swap');
          .texture-noise {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          }
        `}
      </style>

      <div className="relative w-full max-w-[350px] h-[580px] flex flex-col items-center shadow-xl rounded-lg overflow-hidden bg-transparent transition-transform duration-300 hover:scale-[1.02]">
        
        {/* --- TOP HALF: DYNAMIC IMAGE (Linked to College/External Profile) --- */}
        <a 
          href={collegeUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-[80%] relative z-0 bg-gray-300 cursor-pointer"
        >
          <img 
            src={image || ''} 
            alt={name} 
            className="w-full h-full object-cover object-top"
          />
        </a>

        {/* --- BOTTOM HALF: CONTENT CARD --- */}
        <div 
            className="absolute bottom-0 w-full h-[44%] bg-gray-50 z-20 texture-noise flex flex-col justify-between"
            style={{
                clipPath: 'polygon(0 12%, 12% 0, 100% 0, 100% 100%, 0 100%)',
                backgroundColor: '#f9fafb' 
            }}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            
            <a href={collegeUrl || '#'} target="_blank" rel="noopener noreferrer" className="group/name mb-1">
              <h1 className="text-[#D96C36] text-lg sm:text-xl font-extrabold tracking-tight group-hover/name:text-orange-600 transition-colors leading-tight" style={{ fontFamily: '"Roboto Slab", serif' }}>
                {name}
              </h1>
            </a>
            
            {/* Role Badge - Simple High Contrast Text */}
            <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {role}
            </span>

            {/* Designation/College - Simple High Contrast Text */}
            <div className="text-slate-800 text-xs font-bold leading-tight mb-1 px-2 text-center" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {Desgination}
            </div>

            {/* Department - Simple High Contrast Text */}
            {department && (
              <div className="text-slate-700 text-xs font-extrabold uppercase tracking-wide mb-1 text-center" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                {department}
              </div>
            )}

            {/* Email - Simple High Contrast Link with Envelope Logo */}
            {mail && (
              <a
                href={`mailto:${mail.trim()}`}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#D96C36] transition-colors duration-200 text-xs font-semibold mb-1"
                style={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                <MdEmail className="text-slate-500 text-sm shrink-0" />
                <span>{mail}</span>
              </a>
            )}
            
            {/* Icons Container */}
            <div className="flex items-center gap-4 mt-1 mb-1 relative z-30">
                {linkedinUrl && (
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group p-1.5 rounded-full border border-gray-200 hover:border-[#D96C36] hover:bg-[#D96C36] transition-all duration-300 shadow-xs"
                    aria-label="LinkedIn Profile"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                
                {collegeUrl && (
                  <a 
                    href={collegeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title={college}
                    className="group p-1.5 rounded-full border border-gray-200 hover:border-[#D96C36] hover:bg-[#D96C36] transition-all duration-300 shadow-xs"
                  >
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 0 6 0 9 5 3-5 6-5 9-5v-5"/>
                    </svg>
                  </a>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;