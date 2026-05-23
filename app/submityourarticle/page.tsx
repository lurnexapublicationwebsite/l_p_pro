"use client";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { Upload, CreditCard, Send, Info, UserPlus } from 'lucide-react';
export default function Page() {
  return (
    <>
      <NavigationPage />
<div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Article Submission Portal</h1>
          <p className="mt-2 text-slate-600">Please fill in the details below to submit your research paper.</p>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Author & Article Basics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800">
                <Info size={20} className="" /> General Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input type="text" placeholder="Enter your name" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <input type="email" placeholder="john@university.edu" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Designation</label>
                  <input type="text" placeholder="Assistant Professor" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Organization</label>
                  <input type="text" placeholder="University Name" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Title of Article</label>
                  <input type="text" placeholder="Enter the full title of your research" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Abstract</label>
                    <span className="text-xs text-slate-400 font-normal">250 - 350 words</span>
                  </div>
                  <textarea rows={6} placeholder="Paste your abstract here..." className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800">
                <Upload size={20} className="" /> Article Upload
              </h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="" size={24} />
                </div>
                <p className="text-sm font-medium text-slate-700">Drop your article here or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Supports PDF or Word documents (Max 10MB)</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar (Author Info & Payment) */}
          <div className="space-y-6">
            
            {/* Authors Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <UserPlus size={18} className="" /> Authors Info
              </h2>
              <textarea 
                placeholder="Enter details for additional authors..." 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-sm h-32 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

                        {/* Fee Structure Card */}



              {/* <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-400" /> Payement Structure
              </h2>
              <div className="space-y-4 text-sm">
                <div className="border-b border-slate-700 pb-2">
                  <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">COMING SOON ...</p>
                  <div className="flex justify-between"><span></span>COMING SOON... <span className="font-mono text-blue-400">COMING SOON ...</span></div>
              {/* Economics/Mgmt */}
                  {/* <div className="flex justify-between"><span></span>COMING SOON ... <span className="font-mono text-blue-400">COMING SOON ...</span></div> */}
                  {/* CSE/Engineering */}
                {/* </div> */}
               {/* " <div>
                  <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">COMING SOON ......</p>
                  <div className="flex justify-between"><span></span>COMING SOON ... <span className="font-mono text-green-400">COMING SOON ...</span></div>
                  {/* CSE/Engineering */}
                  {/* <div className="flex justify-between"><span></span>COMING SOON ... <span className="font-mono text-green-400">COMING SOON ...</span></div> */}
                  {/* Economics/Mgmt */}
                {/* </div>
              </div>
              <button type="button" className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-95">
                Proceed to Payment
              </button>
            </div>" */} 

            {/* Remarks and Submit */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-sm font-medium text-slate-700 block mb-2">Remarks</label>
              <input type="text" placeholder="Additional notes..." className="w-full px-4 py-2 rounded-lg border border-slate-300 mb-6 outline-none focus:ring-2 focus:ring-blue-500" />
              <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                <Send size={18} />
                Submit Article
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>

      <FooterSection />
      </>
     
  
)
};
