"use client";

import { useState } from "react";
import { Mail, Phone, User, MessageSquare, Navigation, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
      } else {
        alert("Error: " + (data.message || "Something went wrong"));
      }
    } catch (error) {
      alert("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavigationPage />
      <div className="min-h-screen bg-slate-50">
        {/* Hero Section with Before-style Colours */}
        <div 
          className="relative h-[450px] w-full flex flex-col items-center justify-center text-white px-4 overflow-hidden" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
          
          <div className="relative z-10 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-500 drop-shadow-md">
              Get in touch with us for more information
            </h1>
            <div className="inline-block bg-white/90 px-6 py-2 rounded-lg shadow-sm">
              <p className="text-lg font-semibold text-slate-800">
                If you need help or have a question, we're here for you
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-6xl mx-auto px-4 -mt-32 pb-20 relative z-20">
          <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-white">
            <CardContent className="p-0 flex flex-col lg:flex-row">
              
              {/* Left Side: Form */}
              <div className="flex-[1.4] p-8 md:p-12 bg-white">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900">Message Sent Successfully!</h2>
                      <p className="text-slate-500 font-medium">Thank you for reaching out. We have received your message and will get back to you at lurnexapublication@gmail.com.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSubmitted(false)}
                      className="rounded-xl px-8"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Say hello!</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <input type="hidden" name="access_key" value="560afe87-5068-4bc0-aee0-7454c412488f" />
                      <input type="hidden" name="subject" value="New Contact Form Submission - Lurnexa" />
                      <input type="hidden" name="from_name" value="Lurnexa Website" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Your Name</label>
                          <div className="relative">
                            <Input 
                              name="name"
                              required 
                              placeholder="Enter your name here..." 
                              className="pl-4 pr-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" 
                              suppressHydrationWarning
                            />
                            <User className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Your Email</label>
                          <div className="relative">
                            <Input 
                              name="email"
                              required 
                              type="email" 
                              placeholder="Enter your email here.." 
                              className="pl-4 pr-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" 
                              suppressHydrationWarning
                            />
                            <Mail className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                        <div className="relative">
                          <Input 
                            name="phone"
                            type="tel"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            required 
                            placeholder="Enter 10-digit phone number" 
                            className="pl-4 pr-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" 
                            title="Please enter exactly 10 digits"
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                            suppressHydrationWarning
                          />
                          <Phone className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Message</label>
                        <Textarea 
                          name="message"
                          required
                          placeholder="Enter your message" 
                          className="min-h-[150px] bg-slate-50 border-none rounded-xl resize-none p-4 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-black text-white hover:bg-zinc-800 rounded-xl text-lg font-semibold transition-all active:scale-95 shadow-lg shadow-slate-200"
                        suppressHydrationWarning
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : "Send Your Message"}
                      </Button>
                    </form>
                  </>
                )}
              </div>

              {/* Right Side: Contact Info (Restored Colours) */}
              <div className="flex-1 p-8 md:p-12 bg-linear-to-br from-slate-50 to-white border-l border-slate-200 flex flex-col gap-6">
                
                {/* Mail Us Card */}
                <div className="group rounded-3xl p-8 bg-white shadow-sm ring-1 ring-slate-200/60 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Mail Us</h3>
                  <p className="mt-2 text-sm text-slate-500">We reply within 24 hours</p>
                  <p className="mt-4 font-medium text-slate-700 break-all">
                    lurnexapublication@gmail.com
                  </p>
                </div>

                {/* Call Us Card */}
                <div className="group rounded-3xl p-8 bg-white shadow-sm ring-1 ring-slate-200/60 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Phone size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Call Us</h3>
                  <p className="mt-2 text-sm text-slate-500">Mon to Fri · 9am – 6pm</p>
                  <div className="mt-4 space-y-1">
                    <p className="font-medium text-slate-700">+91 91335 21829</p>
                    <p className="font-medium text-slate-700">+91 93473 75817</p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FooterSection/>
    </>
  );
}