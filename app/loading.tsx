import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="relative flex flex-col items-center">
        {/* Professional Spinner */}
        <div className="w-16 h-16 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
        
        {/* Logo/Brand Shadow */}
        <div className="mt-8">
            <img 
                src="/Logo.png" 
                alt="Lurnexa" 
                className="h-6 w-auto opacity-40 grayscale"
            />
        </div>
        
        {/* Animated Loading Text */}
        <div className="mt-4 flex gap-1">
            {[0, 1, 2].map((i) => (
                <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
      </div>
    </div>
  );
}
