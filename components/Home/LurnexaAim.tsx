import React from 'react';

const LurnexaAim = () => {
  return (
    <section className="relative w-full py-20 px-6 bg-slate-50 overflow-hidden">
      
      {/* AIM Heading */}
      <h2 className="relative z-10 text-4xl md:text-5xl font-bold text-slate-900 text-center mb-14 tracking-tight">
        Our Aim
      </h2>

      {/* Optional: Subtle background decorative blur (Modern Touch) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100/50 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        
        {/* Decorative Top Accent */}
        <div className="w-16 h-1.5 bg-blue-600 mx-auto mb-8 rounded-full" />

        {/* The Content */}
        <div className="space-y-6">
          <p className="text-2xl md:text-3xl font-serif text-slate-900 leading-normal">
            The aim of <span className="text-blue-700 font-semibold">Lurnexa Publications</span> is to empower the academic community by fostering a culture of inquiry, innovation, and excellence in research.
          </p>

          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-sans">
            We aspire to provide a <span className="text-slate-900 font-medium">trustworthy platform</span> where students, scholars, and educators can publish original work, access meaningful knowledge, and engage in transformative learning. Through rigorous review processes, interdisciplinary collaboration, and global-quality publishing standards, we aim to elevate the value of research and make knowledge creation accessible to all.
          </p>
        </div>

        {/* Decorative Bottom quotation mark */}
        <div className="mt-8 text-6xl text-slate-200 font-serif leading-none select-none">
          ”
        </div>

      </div>
    </section>
  );
};

export default LurnexaAim;
