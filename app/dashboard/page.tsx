"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Save,
  LogOut,
  Upload,
  User,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const router = useRouter();
  const { accessToken, logout, isAuthenticated } = useAuth();

  const SUB_ID = "21634dda-10d1-70a2-c1ab-07a0a7b8d721";

  /* 🔐 ROUTE PROTECTION */
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/EditoralLogins");
    }
  }, [isAuthenticated, router]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subid: "",
    id: "",
    email: "",
    name: "",
    role: "",
    created_at: "",
    college_id: "",
    organization_name: "",
    contact_no: "",
    list_of_items: "",
    recent_work: "",
    ongoing_work: "",
    description: "",
    resume: "",
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!accessToken) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/get_users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ subid: SUB_ID }),
          }
        );

        const result = await res.json();
        if (result?.data?.length > 0) {
          const user = result.data[0];
          setFormData({
            subid: user.subid || "",
            id: user.id || "",
            email: user.email || "",
            name: user.name || "",
            role: user.role || "",
            created_at: user.created_at || "",
            college_id: user.college_id || "",
            organization_name: user.organisation_name || "",
            contact_no: user.contact_no || "",
            list_of_items: user.area_of_expertise?.[0] || "",
            recent_work: user.recent_work || "",
            ongoing_work: user.ongoing_work || "",
            description: user.description || "",
            resume: user.resume || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [accessToken]);

  /* ================= FETCH IMAGE ================= */
  useEffect(() => {
    if (!formData.id || !accessToken) return;

    const fetchImage = async () => {
      try {
        const res = await fetch("https://api.lurnexa.in/get-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ id: formData.id }),
        });

        if (!res.ok) return;
        const blob = await res.blob();
        setImageUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error(err);
      }
    };

    fetchImage();
  }, [formData.id, accessToken]);

  /* ================= INPUT ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    logout(); // ✅ CONTEXT LOGOUT
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleProfileImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.id) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("id", formData.id);

    try {
      const res = await fetch("https://api.lurnexa.in/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });

      if (!res.ok) throw new Error();

      setImageUrl(
        `https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/${formData.id}.jpg?t=${Date.now()}`
      );
      alert("Profile picture updated!");
    } catch {
      alert("Image upload failed");
    }
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    try {
      const payload = {
        data: {
          college_id: formData.college_id,
          organisation_name: formData.organization_name,
          contact_no: formData.contact_no,
          area_of_expertise: formData.list_of_items
            ? [formData.list_of_items]
            : [],
          recent_work: formData.recent_work,
          ongoing_work: formData.ongoing_work,
          description: formData.description,
        },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/update_users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();
      alert("Profile updated successfully");
      setIsEditing(false);
    } catch {
      alert("Update failed");
    }
  };

  /* ================= RESUME UPLOAD ================= */
  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.id) return;

    try {
      const fd = new FormData();
      const renamed = new File([file], `${formData.id}.pdf`, {
        type: "application/pdf",
      });

      fd.append("file", renamed);
      fd.append("id", formData.id);

      const res = await fetch("https://api.lurnexa.in/upload-cv", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });

      if (!res.ok) throw new Error();

      setResumeUrl(URL.createObjectURL(file));
      setFormData((p) => ({ ...p, resume: "uploaded" }));
      alert("Resume uploaded successfully!");
    } catch {
      alert("Resume upload failed");
    }
  };

  /* ================= FETCH RESUME ================= */
  useEffect(() => {
    if (!formData.id || !accessToken) return;

    const fetchResume = async () => {
      try {
        const res = await fetch("https://api.lurnexa.in/get-cv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ id: formData.id }),
        });

        if (res.ok) {
          const blob = await res.blob();
          setResumeUrl(URL.createObjectURL(blob));
          setFormData((p) => ({ ...p, resume: "uploaded" }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchResume();
  }, [formData.id, accessToken]);

  if (loading) return <div className="p-6">Loading...</div>;

  /* ================= UI (UNCHANGED) ================= */
  return (
   <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-50 via-white to-blue-50/30 flex flex-col">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 select-none transition-opacity hover:opacity-80">
            <a href="/" className="flex items-center gap-2">
              <img src="/Logo.png" alt="Lurnexa" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <span className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">Lurnexa</span>
            </a>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-red-600" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm font-medium">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 w-full">
        <main className="flex flex-col lg:flex-row gap-6 md:gap-8 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {/* LEFT PROFILE CARD */}
          <aside className="w-full lg:w-1/3 xl:w-1/4 h-fit bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 md:p-8 text-center shadow-sm">
            <div className="relative w-fit mx-auto mb-6">
              <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white shadow-xl">
                <AvatarImage src={imageUrl || `https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/${formData.id}.jpg`} className="object-cover" />
                <AvatarFallback className="bg-blue-500 text-white text-xl">{formData.name?.[0]}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-1 -right-1">
                  <Button size="icon" className="h-9 w-9 rounded-full bg-indigo-600 border-2 border-white" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 text-white" />
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 truncate px-2">{formData.name}</h3>
              <p className="text-xs md:text-sm font-medium text-slate-500 break-all bg-slate-50 py-1 px-3 rounded-full inline-block max-w-full">{formData.email}</p>
              <div className="pt-2">
                <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-slate-400 uppercase bg-white border border-slate-100 px-2 py-0.5 rounded">ID: {formData.id}</span>
              </div>
            </div>

            {!isEditing && (
              <Button variant="outline" className="mt-6 md:mt-8 w-full py-5 md:py-6 rounded-2xl font-semibold" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            )}
          </aside>

          {/* RIGHT FORM SECTION */}
          <section className="flex-1 bg-white border border-slate-200/60 rounded-3xl p-5 md:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-100 pb-4 md:pb-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 md:gap-3">
                <div className={`p-2 rounded-lg ${isEditing ? "bg-indigo-50" : "bg-slate-50"}`}>{isEditing ? <Pencil size={18} className="text-indigo-600" /> : <User size={18} className="text-slate-600" />}</div>
                {isEditing ? "Edit Account Details" : "Profile Overview"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6">
              {[
                ["name", "Full Name"],
                ["role", "Professional Role"],
                ["college_id", "Institutional ID"],
                ["organization_name", "Organization"],
                ["contact_no", "Phone Number"],
                ["list_of_items", "Area of Expertise"],
                ["recent_work", "Latest Projects"],
                ["ongoing_work", "Active Research"],
                ["description", "Biography / Summary"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
                  <Input name={key} value={(formData as any)[key]} onChange={handleChange} disabled={!isEditing} className={`h-10 md:h-12 px-4 rounded-xl transition-all ${isEditing ? "bg-white border-slate-200" : "bg-slate-50/50 border-transparent cursor-not-allowed"}`} />
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8 space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Expertise Areas (List of Items)</label>
              <textarea name="list_of_items" value={(formData as any).list_of_items || ""} onChange={(e) => e.target.value.length <= 500 && handleChange(e as any)} disabled={!isEditing} rows={4} className={`w-full px-4 py-3 rounded-xl transition-all resize-none text-sm md:text-base ${isEditing ? "bg-white border-slate-200" : "bg-slate-50/50 border-transparent cursor-not-allowed"}`} />
              <div className="text-right text-[10px] md:text-xs text-slate-400">{(formData as any).list_of_items?.length || 0} / 500</div>
            </div>

            <div className="mt-8 md:mt-10 p-4 md:p-6 rounded-2xl bg-slate-50/50 border border-slate-200/60">
              <label className="text-xs md:text-sm font-bold text-slate-800 block mb-4">Curriculum Vitae (CV)</label>
              <div className="flex flex-col gap-4">
                {formData.resume && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-white border border-slate-200 rounded-xl gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-10 w-10 md:h-12 md:w-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">My_Uploaded_CV.pdf</p>
                        <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase">PDF DOCUMENT</p>
                      </div>
                    </div>
                    {/* UPDATED VIEW BUTTON */}
                    <a href={resumeUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      <Button variant="ghost" size="sm" className="w-full text-indigo-600 text-xs md:text-sm" disabled={!resumeUrl}>
                        <ExternalLink size={14} className="mr-2" /> View PDF
                      </Button>
                    </a>
                  </div>
                )}
                {isEditing && (
                  <div className="flex flex-wrap items-center gap-3">
                    <input ref={resumeInputRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                    <Button variant="outline" className="w-full sm:w-auto text-xs md:text-sm rounded-xl h-10 md:h-11" onClick={() => resumeInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> {formData.resume ? "Change" : "Upload"} PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-100">
                <Button onClick={handleSave} className="w-full sm:w-auto px-8 h-12 md:h-14 rounded-2xl bg-slate-900 text-white font-semibold">
                  <Save className="h-4 w-4 md:h-5 md:w-5 mr-2" /> Save Profile
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="w-full sm:w-auto px-6 h-12 md:h-14 rounded-2xl text-slate-500">
                  Discard
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
      );

}