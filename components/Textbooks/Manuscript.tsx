// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
// import { Button } from "@/components/uii/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/uii/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/uii/radio-group";
// import { Textarea } from "@/components/uii/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/uii/select";
// import { Checkbox } from "@/components/uii/checkbox";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

// const steps = [
//   { id: "personal", title: "Personal Info" },
//   { id: "authors", title: "Authors" },
//   { id: "upload", title: "Upload Book" },
// ];

// interface FormData {
//   [x: string]: string | number | readonly string[] | File | undefined;
//   name: string;
//   email: string;
//   company: string;
//   authors: string;
//   experience: string;
//   industry: string;
//   primaryGoal: string;
//   targetAudience: string;
//   contentTypes: string[];
//   additionalInfo: string;
//   designation: string;
//   authorsInfo: string;
//   book?: File;
// }

// const fadeInUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
// };

// const contentVariants = {
//   hidden: { opacity: 0, x: 50 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
//   exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
// };

// const OnboardingForm = () => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     company: "",
//     authors: "",
//     experience: "",
//     industry: "",
//     primaryGoal: "",
//     targetAudience: "",
//     contentTypes: [],
//     additionalInfo: "",
//     designation: "",
//     authorsInfo: "",
//   });

//   const updateFormData = (field: keyof FormData, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

 


//   const nextStep = () => {
//     if (currentStep < steps.length - 1) {
//       setCurrentStep((prev) => prev + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 0) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   };

//   const handleSubmit = () => {
//     setIsSubmitting(true);

//     // Simulate API call
//     setTimeout(() => {
//       toast.success("Form submitted successfully!");
//       setIsSubmitting(false);
//     }, 1500);
//   };

//   // Check if step is valid for next button
//   const isStepValid = () => {
//     switch (currentStep) {
//     case 0:
//       return formData.name.trim() !== "" && formData.email.trim() !== "";
//     case 1:
//       return formData.authors.trim() !== ""; // keep simple
//     case 2:
//       return true; // allow submit
//     default:
//       return true;
//     }
//   };

//   const preventDefault = (e: React.MouseEvent) => {
//     e.preventDefault();
//   };

//   return (
//     <div className="w-full max-w-lg mx-auto py-8">
//       {/* Progress indicator */}
//       <motion.div
//         className="mb-8"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="flex justify-between mb-2">
//           {steps.map((step, index) => (
//             <motion.div
//               key={index}
//               className="flex flex-col items-center"
//               whileHover={{ scale: 1.1 }}
//             >
//               <motion.div
//                 className={cn(
//                   "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
//                   index < currentStep
//                     ? "bg-primary"
//                     : index === currentStep
//                       ? "bg-primary ring-4 ring-primary/20"
//                       : "bg-muted",
//                 )}
//                 onClick={() => {
//                   // Only allow going back or to completed steps
//                   if (index <= currentStep) {
//                     setCurrentStep(index);
//                   }
//                 }}
//                 whileTap={{ scale: 0.95 }}
//               />
//               <motion.span
//                 className={cn(
//                   "text-xs mt-1.5 hidden sm:block",
//                   index === currentStep
//                     ? "text-primary font-medium"
//                     : "text-muted-foreground",
//                 )}
//               >
//                 {step.title}
//               </motion.span>
//             </motion.div>
//           ))}
//         </div>
//         <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
//           <motion.div
//             className="h-full bg-primary"
//             initial={{ width: 0 }}
//             animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
//             transition={{ duration: 0.3 }}
//           />
//         </div>
//       </motion.div>

//       {/* Form card */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//       >
//         <Card className="border shadow-md rounded-3xl overflow-hidden">
//           <div>
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={currentStep}
//                 initial="hidden"
//                 animate="visible"
//                 exit="exit"
//                 variants={contentVariants}
//               >
//                 {/* Step 1: Personal Info */}
//                 {currentStep === 0 && (
//                   <>
//                     <CardHeader>
//                       <CardDescription>
//                         Let&apos;s start with some basic information
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <motion.div variants={fadeInUp} className="space-y-2">
//                         <Label htmlFor="name">Full Name</Label>
//                         <Input
//                           id="name"
//                           placeholder="John Doe"
//                           value={formData.name}
//                           onChange={(e) =>
//                             updateFormData("name", e.target.value)
//                           }
//                           className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         />
//                       </motion.div>
//                       <motion.div variants={fadeInUp} className="space-y-2">
//                         <Label htmlFor="email">Email Address</Label>
//                         <Input
//                           id="email"
//                           type="email"
//                           placeholder="john@example.com"
//                           value={formData.email}
//                           onChange={(e) =>
//                             updateFormData("email", e.target.value)
//                           }
//                           className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         />
//                       </motion.div>
//                       <motion.div variants={fadeInUp} className="space-y-2">
//                         <Label htmlFor="company">
//                          Organization
//                         </Label>
//                         <Input
//                           id="company"
//                           placeholder="Your Company"
//                           value={formData.company}
//                           onChange={(e) =>
//                             updateFormData("company", e.target.value)
//                           }
//                           className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         />
//                       </motion.div>

//                        <motion.div variants={fadeInUp} className="space-y-2">
//                         <Label htmlFor="designation">
//                         Designation
//                         </Label>
//                         <Input
//                           id="designation"
//                           placeholder="Your Designation"
//                           value={formData.designation}

//                           onChange={(e) =>
//                             updateFormData("designation", e.target.value)
//                           }
//                           className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         />
//                       </motion.div>
//                     </CardContent>
//                   </>
//                 )}

//                 {/* Step 2: Authors */}
//                 {currentStep === 1 && (
//                   <>
//                     <CardHeader>
//                       <CardTitle>Authors</CardTitle>
          
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <motion.div variants={fadeInUp} className="space-y-2">
//                         <Label htmlFor="authors">
//                          who are the authors of the book? (if multiple, separate by commas)
//                         </Label>
//                         <Input
//                           id="authors"
//                           value={formData.authors}
//                           onChange={(e) =>
//                             updateFormData("authors", e.target.value)
//                           }
//                           className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         />
//                       </motion.div>
//                     <motion.div variants={fadeInUp} className="space-y-2">
//                         <Label htmlFor="authorsInfo">
//                          About the Authors 
//                         </Label>
//                         <Input
//                           id="authorsInfo"
//                           value={formData.authorsInfo}
//                           onChange={(e) =>
//                             updateFormData("authorsInfo", e.target.value)
//                           }
//                           className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         />
//                       </motion.div>
                      
//                     </CardContent>
//                   </>
//                 )}

              

              
          
//                 {/* Step 6: Additional Requirements */}
//                 {currentStep === 2 && (
//                   <>
                    

//       <CardHeader>
//       <CardTitle>Upload Your Book</CardTitle>
//       <CardDescription>
//         Upload the book you want to use
//       </CardDescription>
//     </CardHeader>

//     <CardContent className="space-y-4">
//       <motion.div variants={fadeInUp} className="space-y-2">
//         <Label htmlFor="book">Upload Book</Label>

//         <Input
//           id="book"
//           type="file"
//           accept=".pdf,.doc,.docx"
//           onChange={(e) =>
//             setFormData((prev) => ({
//               ...prev,
//               book: e.target.files?.[0],
//             }))
//           }
//           className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//         />
//       </motion.div>
//     </CardContent>


// <CardHeader>
                      
//                     </CardHeader>
//                     <CardContent className="space-y-4">
                     
//                       <motion.div variants={fadeInUp} className="space-y-2">
//                         <Label htmlFor="additionalInfo">
//                           About Textbook
//                         </Label>
//                         <Textarea
//                           id="additionalInfo"
//                           placeholder="textbook description, subject, or any specific requirements you have"
//                           value={formData.additionalInfo}
//                           onChange={(e) =>
//                             updateFormData("additionalInfo", e.target.value)
//                           }
//                           className="min-h-20 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                         />
//                       </motion.div>
//                     </CardContent>



//                   </>
//                 )}
//               </motion.div>
//             </AnimatePresence>

//             <CardFooter className="flex justify-between pt-6 pb-4">
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={prevStep}
//                   disabled={currentStep === 0}
//                   className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
//                 >
//                   <ChevronLeft className="h-4 w-4" /> Back
//                 </Button>
//               </motion.div>
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button
//                   type="button"
//                   onClick={
//                     currentStep === steps.length - 1 ? handleSubmit : nextStep
//                   }
//                   disabled={!isStepValid() || isSubmitting}
//                   className={cn(
//                     "flex items-center gap-1 transition-all duration-300 rounded-2xl",
//                     currentStep === steps.length - 1 ? "" : "",
//                   )}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
//                     </>
//                   ) : (
//                     <>
//                       {currentStep === steps.length - 1 ? "Submit" : "Next"}
//                       {currentStep === steps.length - 1 ? (
//                         <Check className="h-4 w-4" />
//                       ) : (
//                         <ChevronRight className="h-4 w-4" />
//                       )}
//                     </>
//                   )}
//                 </Button>
//               </motion.div>
//             </CardFooter>
//           </div>
//         </Card>
//       </motion.div>

//       {/* Step indicator */}
//       <motion.div
//         className="mt-4 text-center text-sm text-muted-foreground"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.4 }}
//       >
//         Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
//       </motion.div>
//     </div>
//   );
// };

// export default OnboardingForm;
"use client";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { Upload, Send, Info, UserPlus } from 'lucide-react';
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
export default function Page() {
   const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };
  return (
    <>
      <NavigationPage />
<div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Article Submission Portal</h1>
          {/* <p className="mt-2 text-slate-600">Please fill in the details below to submit your research paper.</p> */}
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
          <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-gray-100  rounded-lg">
      <FileUpload onChange={handleFileUpload} />
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

      </>
     
  
)
};
