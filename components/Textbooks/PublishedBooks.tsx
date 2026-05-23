import { Rocket, Clock, Mail } from 'lucide-react';

export default function PublishedBooks() {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Rocket className="h-10 w-10 text-orange-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Books Launching Soon</h2>
      
      <div className="max-w-md space-y-4">
        <p className="text-slate-600 text-lg">
          We are currently finalizing our first set of academic textbooks. Our inaugural collection is undergoing rigorous editorial review to ensure the highest quality.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold bg-orange-50 py-2 px-4 rounded-full inline-flex">
          <Clock size={18} />
          <span>Expected Launch: Q3 2026</span>
        </div>
      </div>
    </div>
  );
}
