"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import NavigationPage from "@/components/Home/nav/page";
import { safeClearClipboard, copyToClipboard } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});
import FooterSection from "@/components/Home/FooterSection";
import RentalBadge from "@/components/Textbooks/RentalBadge";
import RenewModal from "@/components/Textbooks/RenewModal";
import {
  getUser,
  createUser,
  getAllUsers,
  updateUserStatus,
  updateUser,
  deleteUser,
  getQuestionsByBook,
  addQuestionToBank,
  deleteQuestionFromBank,
  getQuizByCode,
  getQuizzesByCreator,
  initDb,
  createQuiz,
  submitAttempt,
  getAttemptsForQuiz,
  getAttemptsForStudent,
  getAllAccessIds,
  validateAccessId,
  generateAccessId,
  generateAccessIdsBulk,
  getBookCode,
  gradeAttempt,
  getBookChapters,
  updateBookChapters,
  getPracticeConfig,
  updatePracticeConfig,
  getAllTextbooks,
  addTextbook,
  deleteTextbook,
  getPracticeAttempts,
  getAllPracticeAttempts,
  savePracticeAttempt,
  toggleQuestionPracticeSelection,
  TextbookUser,
  TextbookQuiz,
  QuizAttempt,
  AllowedAccessId,
  Textbook,
  PracticeAttempt,
  PracticeTest,
  getPracticeTests,
  savePracticeTest,
  deletePracticeTest,
  updatePracticeTest,
  getColleges,
  addCollege,
  deleteCollege,
  College,
  getStorageItem,
  setStorageItem,
  getInterviewQuestions,
  saveInterviewQuestion,
  deleteInterviewQuestion,
  getCompanyUpdates,
  saveCompanyUpdate,
  deleteCompanyUpdate,
  InterviewQuestion,
  CompanyUpdate,
  getCoupons,
  saveCoupon,
  deleteCoupon,
  Coupon,
  getAllPurchases,
  PurchaseRecord,
  syncFromServer
} from "@/lib/dbClient";
import { Question } from "@/lib/data/practice_questions";
import {
  User,
  Lock,
  BookOpen,
  Plus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Shield,
  Activity,
  Info,
  List,
  Play,
  CheckCircle2,
  Trash2,
  Settings,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Users,
  BookOpenCheck,
  Sparkles,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckSquare,
  LogOut,
  Clipboard,
  FileSpreadsheet,
  Key,
  Clock,
  Camera,
  ShoppingBag,
  Upload,
  Download,
  GraduationCap,
  Briefcase,
  Newspaper,
  Search,
  Filter,
  Tag,
  Edit,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Package,
  MapPin,
  Home,
  FileText,
  CreditCard,
  RefreshCw
} from "lucide-react";

const getQuizTotalMarks = (quiz: TextbookQuiz | null | undefined): number => {
  if (!quiz) return 0;
  return quiz.questions.reduce((acc, q) => acc + (q.maxMarks || (quiz.type === 'written' ? 5 : 1)), 0);
};

const getSoftCopyPrice = (plan: string, bookId?: string): number => {
  if (bookId === "8" || bookId === "9") {
    return 299;
  }
  if (bookId === "6") {
    if (plan === "book_only") return 259;
    if (plan === "caselet") return 60;
    if (plan === "book_caselet") return 295;
    if (plan === "book_portal") return 259;
    if (plan === "book_caselet_portal") return 329;
    if (plan === "complete") return 200;
    if (plan === "placements") return 150;
    if (plan === "practice") return 80;
    return 259;
  }
  if (bookId === "5") {
    if (plan === "book_only") return 370;
    if (plan === "caselet") return 80;
    if (plan === "book_caselet") return 405;
    if (plan === "book_portal") return 539;
    if (plan === "book_caselet_portal") return 589;
    if (plan === "complete") return 200;
    if (plan === "placements") return 150;
    if (plan === "practice") return 80;
  }
  let price = 399;
  switch (plan) {
    case "book_only": price = 230; break;
    case "caselet": price = 60; break;
    case "book_caselet": price = 265; break;
    case "book_portal": price = 399; break;
    case "book_caselet_portal": price = 449; break;
    case "complete": price = 200; break;
    case "placements": price = 150; break;
    case "practice": price = 80; break;
    default: price = 399;
  }
  if (bookId === "2" || bookId === "3") {
    if (bookId === "3") {
      if (plan === "book_only") return 300;
      if (plan === "book_caselet") return 335;
      if (plan === "book_portal") return 469;
      if (plan === "book_caselet_portal") return 519;
    }
    return price + 20;
  }
  return price;
};

const ALL_PLANS = [
  { key: "book_only", label: "Book Only", desc: "Digital textbook reading access" },
  { key: "caselet", label: "Caselet Only", desc: "Access to business case studies & caselets" },
  { key: "book_caselet", label: "Book + Caselet", desc: "Digital textbook and business case studies" },
];

// Portal plans removed from upgrade options for digital copy buyers
const PORTAL_PLAN_KEYS = ["practice", "placements", "complete", "book_portal", "book_caselet_portal"];

const SOFTCOPY_PLANS = ["book_only", "book_caselet"];

const isPlanAllowedForBook = (planKey: string, bookId?: string): boolean => {
  if (PORTAL_PLAN_KEYS.includes(planKey)) return false;
  if (["1", "2", "6", "7", "8", "9"].includes(bookId || "")) {
    const caseletPlans = ["caselet", "book_caselet"];
    if (caseletPlans.includes(planKey)) return false;
  }
  return true;
};

const bookHasSoftcopy = (bookId?: string): boolean => {
  return isPlanAllowedForBook("book_only", bookId);
};

const getPlanLabel = (planKey?: string) => {
  const match = ALL_PLANS.find(p => p.key === planKey);
  if (match) return match.label;
  if (planKey === "book_portal") return "Book + Portal Access";
  if (planKey === "book_caselet_portal") return "Book + Caselet + Portal";
  if (planKey === "complete") return "Complete Portal Access";
  if (planKey === "practice") return "Practice Feature Only";
  if (planKey === "placements") return "Placements Feature Only";
  return planKey || "N/A";
};


const PORTAL_PUBLISHED_BOOKS = [
  { id: "1", title: "INDIAN MINERAL IMPORT POLICY OPTIONS: AN ECONOMYWIDE ANALYSIS", pdfFileName: "minerals.pdf", coverImg: "/portal_coverpages/minerals.jpeg", author: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar", price: 699 },
  { id: "2", title: "MACHINE LEARNING: A STRUCTURED APPROACH TO ALGORITHMS AND INTELLIGENT SYSTEMS", pdfFileName: "ml.pdf", coverImg: "/portal_coverpages/ml.jpeg", author: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B", price: 599 },
  { id: "3", title: "DATABASE MANAGEMENT SYSTEMS: CONCEPTS, DESIGN AND IMPLEMENTATION", pdfFileName: "dbms.pdf", coverImg: "/portal_coverpages/dbms.jpeg", author: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B", price: 649 },
  { id: "5", title: "PRINCIPLES OF MICROECONOMICS FOR BUSINESS AND MANAGEMENT", pdfFileName: "microeconomics.pdf", coverImg: "/portal_coverpages/microeconomics.jpeg", author: "Dr. Aruna Kumar Dash", price: 599 },
  { id: "6", title: "FOUNDATIONS OF ARTIFICIAL INTELLIGENCE: CONCEPTS, TECHNIQUES AND APPLICATIONS", pdfFileName: "ai.pdf", coverImg: "/portal_coverpages/ai.jpeg", author: "Dr. P. Manikandan, Dr. P. Renukadevi, Dr. J. Nashreen Begum, Dr. D. Banumathy", price: 399 },
  { id: "7", title: "DATA STREAMING AND ANALYSIS", pdfFileName: "data_streaming.pdf", coverImg: "/portal_coverpages/data_streaming.jpeg", author: "Dr. P. Renukadevi, Dr. Chinmaya Kumar Swain, Dr. Archana Sasi, Mr. Shahad P", price: 449 },
  { id: "8", title: "PYTHON PROGRAMMING: PRINCIPLES AND PRACTICE", pdfFileName: "python_programming.pdf", coverImg: "/portal_coverpages/python_programming.jpeg", author: "Dr. Prakash Shanmurthy, Dr. J. Somasekar, Mr. Vaibhav Prabhakar Raibole, Mr. Shiva Prasad Munukuntla", price: 599 },
  { id: "9", title: "NOSQL DATABASES USING MONGODB", pdfFileName: "nosql.pdf", coverImg: "/portal_coverpages/nosql.jpeg", author: "Dr. Sujeet S. Jagtap", price: 299 }
];

interface Caselet {
  title: string;
  scenario: string;
  questions: string[];
  pdfFileName?: string;
}

// Only books that actually sell a Caselet plan (see isPlanAllowedForBook / store purchase options)
// should have entries here. Minerals (id "1") and AI (id "6") do not offer a caselet product.
const BOOK_CASELETS: Record<string, Caselet[]> = {
  "3": [
    {
      title: "Caselet",
      scenario: `A fast-growing e-commerce platform experiences severe write contention on its central PostgreSQL database during flash sales. Read replicas are not solving the write performance issues.

Based on database scaling principles:
- Propose a horizontal sharding architecture based on customer regions or order IDs.
- Highlight the challenges of cross-shard joins and distributed transactions (e.g., 2-Phase Commit).`,
      questions: [
        "What are the trade-offs between range-based sharding and hash-based sharding?",
        "How does the CAP theorem apply to distributed transactional database scaling?"
      ],
      pdfFileName: "dbms_caselet.pdf"
    }
  ],
  "5": [
    {
      title: "Caselet",
      scenario: `A leading consumer electronics firm is planning to adjust pricing strategies for its flagship smartphone model ahead of a festive season. Market analysis indicates elastic demand in urban markets and price inelasticity in tier-2 markets.

Based on microeconomics principles:
- Evaluate the consumer surplus and price elasticity of demand across market segments.
- Formulate an optimal pricing strategy to maximize total revenue.`,
      questions: [
        "How does price elasticity affect total revenue under different market demand structures?",
        "Explain the concept of price discrimination in different customer segments."
      ],
      pdfFileName: "microeconomics_caselet.pdf"
    }
  ]
};

const getEffectiveQuestionLimit = (bookId: string): number => {
  const tests = getPracticeTests(bookId);
  if (tests.length > 0) {
    return Math.max(...tests.map(t => t.questionLimit));
  }
  return getPracticeConfig(bookId).questionLimit;
};

const isCollegeEmail = (email: string): boolean => {
  if (!email || !email.includes("@")) return false;
  return email.trim().length >= 5;
};

// Change Password card — shared across the student, faculty, and admin profile tabs (same
// account/logic regardless of which dashboard it's opened from). Deliberately hoisted to
// module scope, taking all its state as props, rather than declared as a nested function
// inside TextbookPortal: a component defined inside another component's render body gets a
// brand-new function identity on every parent re-render, so React treats it as a different
// component type each time and unmounts + remounts its DOM — which was silently kicking
// focus out of these inputs after every single keystroke.
interface ChangePasswordCardProps {
  showChangePassword: boolean;
  onOpen: () => void;
  oldPasswordInput: string;
  setOldPasswordInput: (v: string) => void;
  newPasswordInput: string;
  setNewPasswordInput: (v: string) => void;
  confirmPasswordInput: string;
  setConfirmPasswordInput: (v: string) => void;
  showOldPasswordInput: boolean;
  setShowOldPasswordInput: (v: boolean) => void;
  showNewPasswordInput: boolean;
  setShowNewPasswordInput: (v: boolean) => void;
  changePasswordError: string;
  changePasswordSuccess: string;
  isChangingPassword: boolean;
  resetChangePasswordForm: () => void;
  handleChangePassword: (e: React.FormEvent) => void;
}

const ChangePasswordCard: React.FC<ChangePasswordCardProps> = ({
  showChangePassword, onOpen,
  oldPasswordInput, setOldPasswordInput,
  newPasswordInput, setNewPasswordInput,
  confirmPasswordInput, setConfirmPasswordInput,
  showOldPasswordInput, setShowOldPasswordInput,
  showNewPasswordInput, setShowNewPasswordInput,
  changePasswordError, changePasswordSuccess,
  isChangingPassword,
  resetChangePasswordForm, handleChangePassword
}) => {
  const passwordsMatch = confirmPasswordInput.length > 0 && newPasswordInput === confirmPasswordInput;
  const passwordsMismatch = confirmPasswordInput.length > 0 && newPasswordInput !== confirmPasswordInput;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock size={18} className="text-fuchsia-600" />
            Change Password
          </h4>
          {!showChangePassword && (
            <p className="text-xs text-slate-500 mt-1">Update your account password using your current password.</p>
          )}
        </div>
        {!showChangePassword ? (
          <button
            type="button"
            onClick={onOpen}
            className="bg-slate-950 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0"
          >
            Change Password
          </button>
        ) : (
          <button
            type="button"
            onClick={resetChangePasswordForm}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showChangePassword && (
        <form onSubmit={handleChangePassword} className="space-y-4 mt-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showOldPasswordInput ? "text" : "password"}
                value={oldPasswordInput}
                onChange={(e) => setOldPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pr-11 focus:outline-none focus:border-fuchsia-500 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPasswordInput(!showOldPasswordInput)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPasswordInput ? "text" : "password"}
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 pr-11 focus:outline-none focus:border-fuchsia-500 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPasswordInput(!showNewPasswordInput)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Eye size={16} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              At least 8 characters, with uppercase, lowercase, a number, and a special character.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input
              type={showNewPasswordInput ? "text" : "password"}
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 focus:outline-none font-medium text-slate-900 ${
                passwordsMismatch ? "border-red-300 focus:border-red-500" :
                passwordsMatch ? "border-emerald-300 focus:border-emerald-500" :
                "border-slate-200 focus:border-fuchsia-500"
              }`}
              required
            />
            {/* Live match feedback — updates as the user types, ahead of the on-submit check. */}
            {passwordsMatch && (
              <p className="text-[10px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                <Check size={12} /> Passwords match
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-[10px] font-bold text-red-500 mt-1.5 flex items-center gap-1">
                <X size={12} /> Passwords do not match
              </p>
            )}
          </div>

          {changePasswordError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{changePasswordError}</p>
          )}
          {changePasswordSuccess && (
            <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{changePasswordSuccess}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetChangePasswordForm}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default function TextbookPortal({
  defaultSignup = false,
  initialView = "",
  initialQuizCode = "",
  appMode = false
}: {
  defaultSignup?: boolean;
  initialView?: string;
  initialQuizCode?: string;
  // True for the installable reading-app entry point (/textbooks/app): hides the marketing
  // nav/footer chrome and restricts the experience to login/signup + the reading library —
  // no admin/faculty tooling, no store/journal browsing.
  appMode?: boolean;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Install-to-home-screen prompt for the app-mode PWA. Chrome/Android fires
  // beforeinstallprompt and lets us trigger it programmatically; iOS Safari never fires it,
  // so isIOS drives a static "Add to Home Screen" instruction instead.
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Auth State
  const [user, setUser] = useState<TextbookUser | null>(null);
  const [isSignup, setIsSignup] = useState(defaultSignup);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Email & Password Auth State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMobile, setAuthMobile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Forgot Password — self-service recovery for any textbooks_users account (email-code
  // based, two steps: request a code, then submit it alongside a new password).
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "code">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotCode("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setShowForgotNewPassword(false);
    setForgotError("");
    setForgotSuccess("");
  };

  const handleForgotPasswordRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch("/api/textbooks/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Failed to send reset code. Please try again.");
        return;
      }
      setForgotSuccess("A 6-digit reset code has been sent to your email.");
      setForgotStep("code");
    } catch (err) {
      setForgotError("Network error. Please check your connection and try again.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotCode.trim() || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError("Please fill in all fields.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("New password and confirmation do not match.");
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(forgotNewPassword)) {
      setForgotError("New password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(forgotNewPassword)) {
      setForgotError("New password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(forgotNewPassword)) {
      setForgotError("New password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forgotNewPassword)) {
      setForgotError("New password must contain at least one special character (!@#$%^&* etc.).");
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await fetch("/api/textbooks/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), code: forgotCode.trim(), newPassword: forgotNewPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Failed to reset password. Please try again.");
        return;
      }
      setForgotSuccess("Password reset successfully! You can now log in with your new password.");
      setForgotCode("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setTimeout(() => {
        resetForgotPasswordFlow();
        setAuthEmail(forgotEmail.trim());
      }, 2000);
    } catch (err) {
      setForgotError("Network error. Please check your connection and try again.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Login inputs (legacy / access ID)
  const [loginAccessId, setLoginAccessId] = useState("");
  const [loginMobile, setLoginMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");

  // Signup inputs & workflow
  const [signupAccessId, setSignupAccessId] = useState("");
  const [isAccessIdVerified, setIsAccessIdVerified] = useState(false);
  const [detectedRole, setDetectedRole] = useState<'student' | 'faculty' | null>(null);
  const [detectedBookId, setDetectedBookId] = useState("");
  const [detectedPlan, setDetectedPlan] = useState<string | null>(null);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpInput, setSignupOtpInput] = useState("");
  const [twilioValidationCode, setTwilioValidationCode] = useState("");
  

  const [signupForm, setSignupForm] = useState({
    name: "",
    mobileNumber: "",
    collegeName: "",
    collegeId: "",
    department: "",
    facultyRole: "",
    subjectTeaching: "",
    facultyId: "",
    collegeEmail: "",
    teachingFacultyAccessId: ""
  });

  // --- COLLEGES STATE ---
  const [colleges, setColleges] = useState<College[]>([]);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeCode, setNewCollegeCode] = useState("");
  const [genIdCollege, setGenIdCollege] = useState("others");
  const [isCollegeAutoFilled, setIsCollegeAutoFilled] = useState(false);

  // --- COUPON STATE ---
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [newCouponSoftDiscount, setNewCouponSoftDiscount] = useState("");
  const [newCouponHardDiscount, setNewCouponHardDiscount] = useState("");
  const [newCouponBookId, setNewCouponBookId] = useState("");
  const [newCouponBookIds, setNewCouponBookIds] = useState<string[]>([]);
  const [newCouponFormat, setNewCouponFormat] = useState<'soft' | 'physical' | 'both'>('both');
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [deleteConfirmationCouponCode, setDeleteConfirmationCouponCode] = useState<string | null>(null);

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("lurnexa_portal_active_tab") || initialView || "";
    }
    return initialView || "";
  });


  // Save active tab to sessionStorage
  useEffect(() => {
    if (activeTab && typeof window !== "undefined") {
      sessionStorage.setItem("lurnexa_portal_active_tab", activeTab);
    }
  }, [activeTab]);

  // Secure e-Reader & Plan Upgrade States
  const [readingBookId, setReadingBookId] = useState<string | null>(null);
  // Rentals read through the same in-portal secure reader as purchased books — this holds
  // which rental is open and the access-validated data (pdf url + watermark) needed to load it.
  const [readingRentalId, setReadingRentalId] = useState<string | null>(null);
  const [activeRentalReadData, setActiveRentalReadData] = useState<{ bookTitle: string; pdfUrl: string } | null>(null);
  const [isReaderBlurred, setIsReaderBlurred] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      document.documentElement.classList.add("force-secure-blur");
      setIsReaderBlurred(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length <= 1) {
      // Keep blurred if multi-touch was active, unblur on single touch interaction
      if (document.visibilityState === "visible") {
        document.documentElement.classList.remove("force-secure-blur");
        setIsReaderBlurred(false);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      document.documentElement.classList.add("force-secure-blur");
      setIsReaderBlurred(true);
    }
  };

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeCost, setUpgradeCost] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<string>("");

  const [adminUsers, setAdminUsers] = useState<TextbookUser[]>([]);
  const [adminCollegeFilter, setAdminCollegeFilter] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("");
  // User Profile Control tab: search + status filter, layered on top of the shared
  // college/role filters above (same pattern as purchaseSearch on the Payments tab).
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  // Bookstore Payments Dashboard state
  const [adminPurchases, setAdminPurchases] = useState<PurchaseRecord[]>([]);
  // Rentals live in a separate table (book_rentals) from regular purchases, so they're
  // fetched separately and merged with adminPurchases wherever the payments table reads
  // its data — see adminAllOrders below.
  const [adminRentals, setAdminRentals] = useState<PurchaseRecord[]>([]);
  const fetchAdminRentals = () => {
    fetch("/api/rentals/admin-list")
      .then(res => res.json())
      .then(data => setAdminRentals(data.rentals || []))
      .catch(err => console.error("Failed to fetch admin rentals:", err));
  };
  const adminAllOrders = React.useMemo(
    () => [...adminPurchases, ...adminRentals].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }),
    [adminPurchases, adminRentals]
  );
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("all");
  const [purchaseFormatFilter, setPurchaseFormatFilter] = useState("all");
  const [purchaseBookFilter, setPurchaseBookFilter] = useState("all");

  const [usersPage, setUsersPage] = useState(1);
  const [accessIdsPage, setAccessIdsPage] = useState(1);
  const [collegesPage, setCollegesPage] = useState(1);
  const [qbankPage, setQbankPage] = useState(1);
  const [textbooksPage, setTextbooksPage] = useState(1);
  const [adminQBankBook, setAdminQBankBook] = useState("1");
  const [portalRentals, setPortalRentals] = useState<any[]>([]);
  // Expired rentals are tracked separately so the portal can surface a "Renew" prompt for
  // them, instead of just letting them silently vanish once their access window closes.
  const [expiredPortalRentals, setExpiredPortalRentals] = useState<any[]>([]);
  const [renewalRental, setRenewalRental] = useState<{ rentalId: string; bookTitle: string; expiresAt?: string; planCode: string } | null>(null);
  // Which category is shown in My Books / My Caselets — null means "auto-pick based on
  // what the account actually has" until the user explicitly toggles one.
  const [myBooksFilter, setMyBooksFilter] = useState<'rental' | 'purchased' | null>(null);
  const [myCaseletsFilter, setMyCaseletsFilter] = useState<'rental' | 'purchased' | null>(null);

  const fetchPortalRentals = () => {
    if (!user) return;
    const targetQuery = user.email || user.collegeEmail || user.mobileNumber || user.accessId || "";
    if (!targetQuery) return;
    fetch(`/api/rentals/my-rentals?email=${encodeURIComponent(targetQuery.trim())}&phone=${encodeURIComponent(user.mobileNumber || "")}&accessId=${encodeURIComponent(user.accessId || "")}`)
      .then(res => res.json())
      .then(data => {
        if (data.rentals) {
          // Only "active" rentals should grant reading/caselet access or show under
          // "Active eBook Rentals" — expired/pending ones were previously included here.
          setPortalRentals(data.grouped?.active || data.rentals.filter((r: any) => r.status === 'active'));
          setExpiredPortalRentals(data.grouped?.expired || data.rentals.filter((r: any) => r.status === 'expired'));
        }
      })
      .catch(err => console.error("Failed to fetch portal rentals:", err));
  };

  useEffect(() => {
    if (user) {
      const targetQuery = user.email || user.collegeEmail || user.mobileNumber || user.accessId || "";
      if (targetQuery) {
        fetchPortalRentals();
      }
      // Needed here (not just on the Orders sub-tab) so we know which exact plan
      // (book_only / caselet / book_caselet) was paid for per book — used to gate
      // the Caselets tab and to show the Permanent/Rental access badge on My Books.
      fetchUserOrders();
    }
  }, [user]);

  useEffect(() => {
    setUsersPage(1);
    setAccessIdsPage(1);
    setCollegesPage(1);
    setQbankPage(1);
    setTextbooksPage(1);
  }, [adminCollegeFilter, adminRoleFilter, adminQBankBook]);

  const matchesCollegeFilter = (userCollegeName: string | undefined, userAccessId: string | undefined) => {
    if (!adminCollegeFilter) return true;
    const matchedCollege = colleges.find(c => c.code === adminCollegeFilter);
    if (!matchedCollege) return true;
    
    // Match by college name
    if (userCollegeName && userCollegeName.toLowerCase() === matchedCollege.name.toLowerCase()) {
      return true;
    }
    
    // Match by accessId prefix/pattern if mapped
    if (userAccessId) {
      const idClean = userAccessId.toUpperCase();
      if (idClean.includes(matchedCollege.code.toUpperCase())) {
        return true;
      }
    }
    
    return false;
  };

  const [adminAccessIds, setAdminAccessIds] = useState<AllowedAccessId[]>([]);
  const [genIdBook, setGenIdBook] = useState("1");
  const [genIdRole, setGenIdRole] = useState<"student" | "faculty">("student");
  const [genIdCount, setGenIdCount] = useState<number>(1);
  
  const [selectedPracticeTestId, setSelectedPracticeTestId] = useState<string>("");
  const [adminQuestions, setAdminQuestions] = useState<Question[]>([]);
  const [adminChaptersConfig, setAdminChaptersConfig] = useState<Record<string, number>>({});
  const [configBookId, setConfigBookId] = useState("1");
  const [configChaptersCount, setConfigChaptersCount] = useState(5);
  const [configPracticeDuration, setConfigPracticeDuration] = useState(10);
  const [configPracticeQuestionLimit, setConfigPracticeQuestionLimit] = useState(5);

  // Dynamic Textbooks state
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [newBookId, setNewBookId] = useState("");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookCode, setNewBookCode] = useState("");
  const [adminNewQuestion, setAdminNewQuestion] = useState({
    type: "mcq" as "mcq" | "written",
    chapter: 1,
    category: "practice" as "practice" | "quiz",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A" as "A" | "B" | "C" | "D"
  });

  // --- FACULTY STATE ---
  const [facultyQuizzes, setFacultyQuizzes] = useState<TextbookQuiz[]>([]);
  const [selectedFacultyQuiz, setSelectedFacultyQuiz] = useState<TextbookQuiz | null>(null);
  const [selectedQuizAttempts, setSelectedQuizAttempts] = useState<QuizAttempt[]>([]);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizBookId, setNewQuizBookId] = useState("1");
  const [newQuizQuestions, setNewQuizQuestions] = useState<TextbookQuiz["questions"]>([]);
  const [newQuizType, setNewQuizType] = useState<'mcq' | 'written'>('mcq');
  const [newQuizChapters, setNewQuizChapters] = useState<number[]>([1]);
  const [newQuizDuration, setNewQuizDuration] = useState<number>(0);
  const [newQuizQuestionsLimit, setNewQuizQuestionsLimit] = useState<number>(5);
  const [newQuizStartTime, setNewQuizStartTime] = useState("");
  const [newQuizEndTime, setNewQuizEndTime] = useState("");
  const [gradingAttempt, setGradingAttempt] = useState<QuizAttempt | null>(null);
  const [gradingScore, setGradingScore] = useState<string>("");
  const [gradingQuestionScores, setGradingQuestionScores] = useState<number[]>([]);
  
  // Custom manual question builder
  const [manualQuestion, setManualQuestion] = useState({
    questionText: "",
    maxMarks: 5,
    chapter: 1,
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A" as "A" | "B" | "C" | "D"
  });
  // Import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingStudentProfile, setIsEditingStudentProfile] = useState(false);
  const [studentProfileName, setStudentProfileName] = useState("");
  const [studentProfileMobile, setStudentProfileMobile] = useState("");
  const [studentTeachingFacultyEdit, setStudentTeachingFacultyEdit] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    collegeName: "",
    facultyId: "",
    facultyRole: "",
    subjectTeaching: "",
    collegeEmail: ""
  });
  const [profileOtpSent, setProfileOtpSent] = useState(false);
  const [profileOtpInput, setProfileOtpInput] = useState("");
  const [profileGeneratedOtp, setProfileGeneratedOtp] = useState("");
  const [pendingProfileUpdates, setPendingProfileUpdates] = useState<Partial<TextbookUser> | null>(null);
  const [importQBankQuestions, setImportQBankQuestions] = useState<Question[]>([]);
  const [selectedImportIds, setSelectedImportIds] = useState<string[]>([]);
  const [publishedQuizCode, setPublishedQuizCode] = useState("");
  const [notifiedStudents, setNotifiedStudents] = useState<string[]>([]);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<TextbookUser | null>(null);
  const [selectedTemplateFormat, setSelectedTemplateFormat] = useState<string>("");

  const [adminProfileEdit, setAdminProfileEdit] = useState({
    name: "Administrator",
    accessId: "LURNEXA",
    mobileNumber: "9347834904",
    email: "lurnexapublication@gmail.com"
  });

  // Change Password — shared across the student, faculty, and admin profile tabs, since
  // it's the exact same account/logic regardless of which dashboard it's opened from.
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showOldPasswordInput, setShowOldPasswordInput] = useState(false);
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const resetChangePasswordForm = () => {
    setShowChangePassword(false);
    setOldPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    setShowOldPasswordInput(false);
    setShowNewPasswordInput(false);
    setChangePasswordError("");
    setChangePasswordSuccess("");
  };

  const openChangePassword = () => {
    setChangePasswordError("");
    setChangePasswordSuccess("");
    setShowChangePassword(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (!oldPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setChangePasswordError("Please fill in all fields.");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPasswordInput.length < 8) {
      setChangePasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPasswordInput)) {
      setChangePasswordError("New password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(newPasswordInput)) {
      setChangePasswordError("New password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPasswordInput)) {
      setChangePasswordError("New password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPasswordInput)) {
      setChangePasswordError("New password must contain at least one special character (!@#$%^&* etc.).");
      return;
    }
    if (newPasswordInput === oldPasswordInput) {
      setChangePasswordError("New password must be different from your current password.");
      return;
    }

    const userEmail = user?.email || user?.collegeEmail;
    if (!userEmail) {
      setChangePasswordError("Unable to identify your account email. Please log in again.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/textbooks/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, oldPassword: oldPasswordInput, newPassword: newPasswordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        setChangePasswordError(data.error || "Failed to change password. Please try again.");
        return;
      }
      setChangePasswordSuccess("Password changed successfully!");
      setOldPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      setTimeout(() => resetChangePasswordForm(), 2000);
    } catch (err) {
      setChangePasswordError("Network error. Please check your connection and try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getAdminCredentials = () => {
    if (typeof window === 'undefined') return { accessId: "LURNEXA", mobileNumber: "9347834904", name: "Administrator", email: "lurnexapublication@gmail.com" };
    const saved = getStorageItem<any>("lurnexa_admin_custom_profile", null);
    if (saved) {
      return {
        email: "lurnexapublication@gmail.com",
        ...saved
      };
    }
    return { accessId: "LURNEXA", mobileNumber: "9347834904", name: "Administrator", email: "lurnexapublication@gmail.com" };
  };

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Student Anti-cheat/Anti-tab-switch state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Admin Practice Test States
  const [practiceTests, setPracticeTests] = useState<PracticeTest[]>([]);
  const [newPracticeTitle, setNewPracticeTitle] = useState("");
  const [newPracticeDuration, setNewPracticeDuration] = useState(15);
  const [newPracticeLimit, setNewPracticeLimit] = useState(5);
  const [newPracticeStartTime, setNewPracticeStartTime] = useState("");
  const [newPracticeEndTime, setNewPracticeEndTime] = useState("");

  // Student Practice Test States
  const [activePracticeTest, setActivePracticeTest] = useState<PracticeTest | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'warning') => {
    setActiveToast({ message, type });
  };

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // ─── USER PROFILE: ORDER HISTORY & ADDRESS BOOK STATE ───
  const [profileSubTab, setProfileSubTab] = useState<'account' | 'orders' | 'addresses'>('account');
  const [userOrdersList, setUserOrdersList] = useState<any[]>([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [selectedOrderInvoice, setSelectedOrderInvoice] = useState<any | null>(null);

  const [userAddressesList, setUserAddressesList] = useState<any[]>([]);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressObj, setEditingAddressObj] = useState<any | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "Home" as "Home" | "Work" | "College" | "Other",
    isDefault: false
  });

  const fetchUserOrders = async () => {
    if (!user) return;
    setIsFetchingOrders(true);
    try {
      const userIdent = user.email || user.collegeEmail || user.mobileNumber;
      const res = await fetch(`/api/textbooks/user/orders?user=${encodeURIComponent(userIdent)}`);
      const data = await res.json();
      setUserOrdersList(data.orders || []);
    } catch (e) {
      console.error("Error fetching user orders:", e);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  // The exact plan (book_only / caselet / book_caselet) paid for a given book — orders come
  // back newest-first, so the most recent paid order for that book wins. userOrdersList also
  // contains rentals (folded in for a unified Order History), which must be excluded here —
  // otherwise a rental's plan code (e.g. "1 Month") can outrank a real purchase and get shown
  // on the permanent "Purchased Digital Editions" card instead of the actual purchase plan.
  const getLatestPaidPlanForBook = (bookId: string): string | null => {
    // Exclude both real rentals (isRental, sourced from book_rentals) and any legacy order
    // that was recorded with purchaseFormat "rental" — neither represents a permanent plan.
    const match = userOrdersList.find((o: any) =>
      String(o.bookId) === String(bookId) && !o.isRental && o.purchaseFormat !== "rental"
    );
    return match?.purchasePlan || null;
  };

  const fetchUserAddresses = async () => {
    if (!user) return;
    setIsFetchingAddresses(true);
    try {
      const userIdent = user.email || user.collegeEmail || user.mobileNumber;
      const res = await fetch(`/api/textbooks/user/addresses?user=${encodeURIComponent(userIdent)}`);
      const data = await res.json();
      setUserAddressesList(data.addresses || []);
    } catch (e) {
      console.error("Error fetching user addresses:", e);
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  useEffect(() => {
    if (user && (activeTab === "studentProfile" || activeTab === "profile")) {
      if (profileSubTab === "orders") {
        fetchUserOrders();
      } else if (profileSubTab === "addresses") {
        fetchUserAddresses();
      }
    }
  }, [activeTab, profileSubTab, user]);

  const handleSaveAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const userIdent = user.email || user.collegeEmail || user.mobileNumber;

    if (
      !addressFormData.fullName.trim() ||
      !addressFormData.phoneNumber.trim() ||
      !addressFormData.addressLine1.trim() ||
      !addressFormData.city.trim() ||
      !addressFormData.state.trim() ||
      !addressFormData.pincode.trim()
    ) {
      showToast("Please fill in all required address fields.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/textbooks/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAddressObj?.id,
          userIdentifier: userIdent,
          ...addressFormData
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to save address", "error");
        return;
      }
      showToast(editingAddressObj ? "Address updated successfully!" : "New address added to Address Book!", "success");
      setIsAddressModalOpen(false);
      setEditingAddressObj(null);
      fetchUserAddresses();
    } catch (err) {
      showToast("Error connecting to server", "error");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!user) return;
    const userIdent = user.email || user.collegeEmail || user.mobileNumber;
    try {
      const res = await fetch(`/api/textbooks/user/addresses?id=${id}&user=${encodeURIComponent(userIdent)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Address deleted from Address Book.", "success");
        fetchUserAddresses();
      }
    } catch (e) {
      showToast("Failed to delete address", "error");
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!user) return;
    const userIdent = user.email || user.collegeEmail || user.mobileNumber;
    try {
      const res = await fetch(`/api/textbooks/user/addresses?id=${id}&user=${encodeURIComponent(userIdent)}`, {
        method: "PUT"
      });
      if (res.ok) {
        showToast("Default delivery address updated!", "success");
        fetchUserAddresses();
      }
    } catch (e) {
      showToast("Failed to set default address", "error");
    }
  };

  // --- STUDENT STATE ---
  const [studentQuizCode, setStudentQuizCode] = useState("");
  const [activeStudentQuiz, setActiveStudentQuiz] = useState<TextbookQuiz | null>(null);
  const [studentCurrentQuestionIndex, setStudentCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<string[]>([]);
  const [studentQuizResult, setStudentQuizResult] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [readingCaseletInfo, setReadingCaseletInfo] = useState<{ bookId: string; index: number } | null>(null);

  const requestFullscreenSafe = () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } catch (e) {}
  };

  // Each of these three "open a reader" actions must be authoritative and clear the other
  // two reading modes — otherwise a reader left open via a path that skips closeSecureReader
  // (e.g. fullscreen never actually activated, so the ESC/fullscreenchange reset never fires)
  // leaves stale state that outranks a fresh request: the PDF-loading effect checks
  // book > rental > caselet in that order, so a stuck readingRentalId would keep loading the
  // book even after the user just clicked "Read Caselet PDF".
  const openSecureBook = (bookId: string) => {
    setReadingRentalId(null);
    setActiveRentalReadData(null);
    setReadingCaseletInfo(null);
    setReadingBookId(bookId);
    requestFullscreenSafe();
  };

  // Validates the rental (ownership + not expired) and grabs its PDF url, then opens it in the
  // exact same secure reader used for purchased books — same UI, same protections, no separate tab.
  const openSecureRental = async (rentalId: string) => {
    const userEmail = user?.email || user?.collegeEmail;
    if (!userEmail) {
      setErrorMessage("Please log in again to access your rental.");
      return;
    }
    try {
      const res = await fetch("/api/rentals/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId, userEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Unable to access this rental right now.");
        return;
      }
      setReadingBookId(null);
      setReadingCaseletInfo(null);
      setActiveRentalReadData({
        bookTitle: data.rental?.bookTitle || "Rented eBook",
        pdfUrl: data.pdfUrl
      });
      setReadingRentalId(rentalId);
      requestFullscreenSafe();
    } catch (e) {
      setErrorMessage("Failed to load the rented eBook. Please check your connection and try again.");
    }
  };

  const openSecureCaselet = (bookId: string, index: number) => {
    setReadingBookId(null);
    setReadingRentalId(null);
    setActiveRentalReadData(null);
    setReadingCaseletInfo({ bookId, index });
    requestFullscreenSafe();
  };

  // Lazily loads the Cashfree JS SDK on demand (only when a renewal is actually
  // attempted) rather than on every portal page load.
  const ensureCashfreeLoaded = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Cashfree) {
        resolve((window as any).Cashfree);
        return;
      }
      const scriptId = "cashfree-sdk-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;
        document.body.appendChild(script);
      }
      const checkLoaded = setInterval(() => {
        if ((window as any).Cashfree) {
          clearInterval(checkLoaded);
          resolve((window as any).Cashfree);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!(window as any).Cashfree) reject(new Error("Cashfree SDK failed to load."));
      }, 10000);
    });
  };

  // Creates a renewal order via /api/rentals/renew (extends from the current expiry if
  // renewed early, otherwise starts fresh from now) and hands off to Cashfree — same
  // payment flow as a brand-new rental, just triggered from inside the portal instead of
  // the store checkout page. Cashfree's own return_url (set server-side) sends the
  // customer back to /textbooks/store/checkout, which already knows how to verify and
  // activate a rental by its rentalId.
  const handleConfirmRenewal = async (rentalId: string, newPlanCode: string) => {
    setErrorMessage("");
    try {
      const res = await fetch("/api/rentals/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId, newPlanCode })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Unable to start the renewal right now. Please try again.");
        return;
      }

      const Cashfree = await ensureCashfreeLoaded();
      const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
      const cashfree = Cashfree({ mode: isProduction ? "production" : "sandbox" });
      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self"
      });
    } catch (e) {
      setErrorMessage("Failed to reach the payment gateway. Please check your connection and try again.");
    }
  };

  const closeSecureReader = () => {
    setReadingBookId(null);
    setReadingRentalId(null);
    setActiveRentalReadData(null);
    setReadingCaseletInfo(null);
    setPdfError(null);
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (e) {}
  };

  // Native Fullscreen API Escape / Change Sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement && !(document as any).mozFullScreenElement && !(document as any).msFullscreenElement) {
        setReadingBookId(null);
        setReadingRentalId(null);
        setActiveRentalReadData(null);
        setReadingCaseletInfo(null);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // PDF.js secure rendering state
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInputVal, setPageInputVal] = useState("1");
  const [pdfZoom, setPdfZoom] = useState<number>(1.0); // 1.0 = 100% fit-to-screen scale
  const [pageFlipAnim, setPageFlipAnim] = useState<"flip-next" | "flip-prev" | "">("");
  const activeRenderTaskRef = useRef<any>(null);

  const triggerNextPage = () => {
    if (pdfCurrentPage < pdfTotalPages && !pdfLoading) {
      setPageFlipAnim("flip-next");
      setPdfCurrentPage(prev => Math.min(pdfTotalPages, prev + 1));
      setTimeout(() => setPageFlipAnim(""), 450);
    }
  };

  const triggerPrevPage = () => {
    if (pdfCurrentPage > 1 && !pdfLoading) {
      setPageFlipAnim("flip-prev");
      setPdfCurrentPage(prev => Math.max(1, prev - 1));
      setTimeout(() => setPageFlipAnim(""), 450);
    }
  };

  const handleZoomIn = () => {
    setPdfZoom(prev => Math.min(3.0, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = () => {
    setPdfZoom(prev => Math.max(0.5, Math.round((prev - 0.25) * 100) / 100));
  };

  const handleResetZoom = () => {
    setPdfZoom(1.0);
  };

  useEffect(() => {
    setPageInputVal(String(pdfCurrentPage));
  }, [pdfCurrentPage]);

  const handlePageSubmit = () => {
    setIsEditingPage(false);
    const parsedPage = parseInt(pageInputVal, 10);
    if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= pdfTotalPages) {
      setPdfCurrentPage(parsedPage);
    } else {
      setPageInputVal(String(pdfCurrentPage));
    }
  };

  const loadPdfFile = async (url: string) => {
    setPdfLoading(true);
    setPdfError(null);
    setPdfZoom(1.0);
    try {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        document.head.appendChild(script);
        await new Promise((res) => { script.onload = res; });
      }
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

      // No silent fallback to a different document here — a caselet that fails to load
      // must never quietly substitute the unrelated full textbook (that's exactly what
      // used to make "Read Caselet PDF" open the book instead). Surface a clear error
      // via the catch block below instead.
      const loadedPdf = await pdfjsLib.getDocument(url).promise;

      setPdfDocument(loadedPdf);
      setPdfTotalPages(loadedPdf.numPages);
      setPdfCurrentPage(1);
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      setPdfError("Unable to load the PDF document. Please ensure the file exists or try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const renderPdfPage = async (pdfDoc: any, pageNum: number, currentZoom: number = 1.0) => {
    if (!pdfDoc) return;

    if (activeRenderTaskRef.current) {
      try {
        activeRenderTaskRef.current.cancel();
      } catch (e) {}
      activeRenderTaskRef.current = null;
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = document.getElementById("secure-reader-canvas") as HTMLCanvasElement;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      // Calculate dynamic fit-to-screen scale based on available container dimensions & zoom level
      const container = canvas.parentElement;
      const rectH = container ? container.getBoundingClientRect().height : (window.innerHeight - 80);
      const rectW = container ? container.getBoundingClientRect().width : window.innerWidth;
      
      const availH = Math.max(150, rectH - (currentZoom > 1.0 ? 24 : 8));
      const availW = Math.max(150, rectW - (currentZoom > 1.0 ? 24 : 8));

      const baseViewport = page.getViewport({ scale: 1.0 });
      const scaleX = availW / baseViewport.width;
      const scaleY = availH / baseViewport.height;
      const fitScale = Math.min(scaleX, scaleY);

      const displayWidth = Math.round(baseViewport.width * fitScale * currentZoom);
      const displayHeight = Math.round(baseViewport.height * fitScale * currentZoom);

      const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
      const renderScale = fitScale * currentZoom * Math.max(dpr, 2.0);

      const viewport = page.getViewport({ scale: renderScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Set explicit inline CSS dimensions so zooming visually resizes canvas element in DOM
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      activeRenderTaskRef.current = renderTask;

      await renderTask.promise;
      if (activeRenderTaskRef.current === renderTask) {
        activeRenderTaskRef.current = null;
      }
    } catch (err: any) {
      if (err?.name === "RenderingCancelledException" || err?.message?.includes("cancelled")) {
        return;
      }
      console.error("Error rendering PDF page:", err);
    }
  };

  useEffect(() => {
    const isReadingBook = !!readingBookId;
    const isReadingRental = !!readingRentalId;
    const isReadingCaselet = readingCaseletInfo !== null;

    if (isReadingBook) {
      const book = PORTAL_PUBLISHED_BOOKS.find(b => String(b.id) === String(readingBookId));
      if (book) {
        loadPdfFile(`/portal_textbooks/${book.pdfFileName}`);
      }
    } else if (isReadingRental) {
      if (activeRentalReadData?.pdfUrl) {
        loadPdfFile(activeRentalReadData.pdfUrl);
      }
    } else if (isReadingCaselet) {
      const caselets = BOOK_CASELETS[readingCaseletInfo.bookId] || [];
      const currentCaselet = caselets[readingCaseletInfo.index];
      if (currentCaselet) {
        loadPdfFile(`/portal_caselets/${currentCaselet.pdfFileName}`);
      }
    } else {
      setPdfDocument(null);
      setPdfTotalPages(0);
      setPdfCurrentPage(1);
      setPdfZoom(1.0);
      setPdfError(null);
    }
  }, [readingBookId, readingRentalId, activeRentalReadData, readingCaseletInfo]);

  useEffect(() => {
    if (pdfDocument) {
      renderPdfPage(pdfDocument, pdfCurrentPage, pdfZoom);
    }

    const handleResize = () => {
      if (pdfDocument) {
        renderPdfPage(pdfDocument, pdfCurrentPage, pdfZoom);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch (e) {}
        activeRenderTaskRef.current = null;
      }
    };
  }, [pdfCurrentPage, pdfDocument, pdfZoom]);

  // Practice State
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<string[]>([]);
  const [practiceCurrentIndex, setPracticeCurrentIndex] = useState(0);
  const [practiceResultScore, setPracticeResultScore] = useState<number | null>(null);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState<number>(0);
  const [pastPracticeAttempts, setPastPracticeAttempts] = useState<PracticeAttempt[]>([]);
  const [selectedPastAttempt, setSelectedPastAttempt] = useState<PracticeAttempt | null>(null);

  // Career Hub State
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [companyUpdates, setCompanyUpdates] = useState<CompanyUpdate[]>([]);
  
  // Search / filter / expand states for Student
  const [careerSubTab, setCareerSubTab] = useState<"interviews" | "updates">("interviews");
  const [interviewSearch, setInterviewSearch] = useState("");
  const [interviewDiffFilter, setInterviewDiffFilter] = useState("all");
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);

  // Plan tab allowance helper
  const isTabAllowed = (tab: string) => {
    if (user?.role !== "student") return true;

    // Options removed for student users: Join Active Quiz, Practice Questions, My Quiz History, Career Hub
    if (["join", "practice", "history", "studentCareerHub"].includes(tab)) {
      return false;
    }

    if (tab === "studentProfile" || tab === "mybooks" || tab === "caselets") {
      return true;
    }

    return false;
  };

  const [adminCareerSubTab, setAdminCareerSubTab] = useState<"interviews" | "updates">("interviews");
  // Interview Question form
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [iqCompany, setIqCompany] = useState("");
  const [iqRole, setIqRole] = useState("");
  const [iqQuestion, setIqQuestion] = useState("");
  const [iqAnswer, setIqAnswer] = useState("");
  const [iqDifficulty, setIqDifficulty] = useState("Medium");
  // Company Update form
  const [editingUpdate, setEditingUpdate] = useState<CompanyUpdate | null>(null);
  const [cuCompany, setCuCompany] = useState("");
  const [cuBullets, setCuBullets] = useState(""); // newline separated

  // Reading-app PWA setup: register the service worker, detect standalone/iOS, and capture
  // the native install prompt so any "Download App" button — on this page or the login/store
  // pages, wherever the browser is showing the reading-app manifest — can trigger the real
  // install directly instead of just linking to /textbooks/app.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent || "";
    setIsIOS(/iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream);
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
    );

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/textbook-app-sw.js", { scope: "/textbooks/app/" }).catch(err => {
        console.error("Reading app service worker registration failed:", err);
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  // Shared by every "Download App" button on the site: install right where the click
  // happened when the browser has a captured prompt ready, instead of always bouncing to
  // /textbooks/app first. Falls back to opening the app (which shows install/iOS
  // instructions once there) only when no native prompt is available yet.
  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
    } else {
      router.push("/textbooks/app");
    }
  };

  // Safe window mount check
  useEffect(() => {
    setMounted(true);
    setTextbooks(getAllTextbooks());
    setColleges(getColleges());
    setInterviewQuestions(getInterviewQuestions());
    setCompanyUpdates(getCompanyUpdates());

    // Load Cashfree Javascript SDK dynamically
    const scriptId = "cashfree-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const savedUser = sessionStorage.getItem("lurnexa_current_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "admin") {
          const identifier = (parsed.role === "faculty" || parsed.role === "student") ? (parsed.collegeEmail || parsed.email || parsed.mobileNumber) : parsed.mobileNumber;
          const fresh = identifier ? getUser(identifier, parsed.accessId) : null;
          if (fresh) {
            if (parsed.plan && parsed.plan !== fresh.plan) {
              fresh.plan = parsed.plan;
              updateUser(fresh.mobileNumber, { plan: parsed.plan });
              if (fresh.accessId) updateUser(fresh.accessId, { plan: parsed.plan });
            }
            setUser(fresh);
            sessionStorage.setItem("lurnexa_current_user", JSON.stringify(fresh));
          } else {
            setUser(parsed);
          }
        } else {
          setUser(parsed);
        }

        // Set default tab based on role (unless already saved in sessionStorage)
        const savedTab = sessionStorage.getItem("lurnexa_portal_active_tab");
        if (savedTab) {
          setActiveTab(savedTab);
        } else {
          if (parsed.role === "admin") setActiveTab(initialView || "users");
          else if (parsed.role === "faculty") setActiveTab(initialView || "create");
          else {
            const plan = parsed.plan || "complete";
            if (plan === "caselet") {
              setActiveTab(initialView || "caselets");
            } else {
              setActiveTab(initialView || "mybooks");
            }
          }
        }
      } catch (e) {
        sessionStorage.removeItem("lurnexa_current_user");
      }
    }
    return () => {};
  }, []);

  // Screen protection / anti-screenshot effect
  useEffect(() => {
    const isReading = !!readingBookId || !!readingRentalId || readingCaseletInfo !== null;
    if (!isReading) {
      document.documentElement.classList.remove("force-secure-blur");
      setIsReaderBlurred(false);
      return;
    }

    // Always start reader in unblurred state so content is readable
    setIsReaderBlurred(false);
    document.documentElement.classList.remove("force-secure-blur");

    // Inject high-speed blur stylesheet (without blocking pointer-events)
    const styleEl = document.createElement("style");
    styleEl.id = "secure-blur-styles";
    styleEl.innerHTML = `
      .force-secure-blur {
        filter: blur(50px) !important;
        opacity: 0 !important;
        transition: opacity 0.01s ease-out, filter 0.01s ease-out !important;
      }
      #secure-reader-canvas {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Create a hidden audio element to capture volume button events
    const audioEl = document.createElement("audio");
    audioEl.id = "secure-volume-detector";
    audioEl.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="; // Tiny silent WAV
    audioEl.loop = true;
    audioEl.volume = 0.5;
    document.body.appendChild(audioEl);
    
    // Attempt playback so it is tied to media keys
    audioEl.play().catch(() => {});

    const handleVolumeChange = () => {
      applyBlur();
    };

    audioEl.addEventListener("volumechange", handleVolumeChange);

    const preventDefault = (e: Event) => e.preventDefault();

    const applyBlur = () => {
      document.documentElement.classList.add("force-secure-blur");
      setIsReaderBlurred(true);
    };

    const removeBlur = () => {
      document.documentElement.classList.remove("force-secure-blur");
      setIsReaderBlurred(false);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        triggerNextPage();
        return;
      }
      if (e.key === "ArrowLeft") {
        triggerPrevPage();
        return;
      }

      // Preemptively blur on Windows / Meta key press or PrintScreen key
      if (
        e.key === "PrintScreen" || 
        e.keyCode === 44 ||
        e.key === "Meta" || 
        e.keyCode === 91 || 
        e.keyCode === 92
      ) {
        applyBlur();
        safeClearClipboard();
        return;
      }

      if (
        e.key === "VolumeUp" ||
        e.key === "VolumeDown" ||
        e.keyCode === 174 ||
        e.keyCode === 175 ||
        e.keyCode === 24 || // Android Volume Up keycode
        e.keyCode === 25 || // Android Volume Down keycode
        (e.ctrlKey && (e.key === "p" || e.key === "P" || e.key === "s" || e.key === "S" || e.key === "u" || e.key === "U")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I" || e.key === "c" || e.key === "C" || e.key === "j" || e.key === "J")) ||
        (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S" || e.key === "3" || e.key === "4")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        safeClearClipboard();
        applyBlur();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44 || e.key === "Meta" || e.keyCode === 91 || e.keyCode === 92) {
        safeClearClipboard();
        applyBlur();
      }
    };

    const handleWindowBlur = () => {
      // Instantly blur screen and clear clipboard whenever window loses focus (Snipping tool, PrtScn, Win key, OS capture)
      applyBlur();
      safeClearClipboard();
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        removeBlur();
      }, 150);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        applyBlur();
        safeClearClipboard();
      } else {
        removeBlur();
      }
    };

    const handleUserInteraction = () => {
      if (document.visibilityState === "visible") {
        removeBlur();
      }
    };

    window.addEventListener("contextmenu", preventDefault);
    window.addEventListener("selectstart", preventDefault);
    window.addEventListener("copy", preventDefault);
    window.addEventListener("paste", preventDefault);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("click", handleUserInteraction);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.documentElement.classList.remove("force-secure-blur");
      const el = document.getElementById("secure-blur-styles");
      if (el) el.remove();

      audioEl.removeEventListener("volumechange", handleVolumeChange);
      audioEl.remove();

      window.removeEventListener("contextmenu", preventDefault);
      window.removeEventListener("selectstart", preventDefault);
      window.removeEventListener("copy", preventDefault);
      window.removeEventListener("paste", preventDefault);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [readingBookId, readingRentalId, readingCaseletInfo]);

  // Tab restriction redirect effect for students
  useEffect(() => {
    if (user && user.role === "student") {
      if (!isTabAllowed(activeTab)) {
        const allTabs = ["mybooks", "caselets", "join", "practice", "history", "studentCareerHub"];
        const redirectTab = allTabs.find(t => isTabAllowed(t)) || "studentProfile";
        setActiveTab(redirectTab);
      }
    }
  }, [user, activeTab]);

  // Verify plan upgrade from Cashfree redirect
  useEffect(() => {
    if (!mounted) return;
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");
    if (orderId && !sessionStorage.getItem(`verified_upgrade_${orderId}`)) {
      setIsUpgrading(true);
      showToast("Verifying your payment status...", "info");
      
      fetch("/api/payments/cashfree/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      })
      .then(async res => {
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return res.json();
      })
      .then(data => {
        if (data.success && data.status === "PAID") {
          sessionStorage.setItem(`verified_upgrade_${orderId}`, "true");
          showToast("Success! Plan upgraded to Complete Access successfully.", "success");
          
          // Retrieve current user dynamically from sessionStorage to avoid React state closure bugs
          const savedUserStr = sessionStorage.getItem("lurnexa_current_user");
          if (savedUserStr) {
            try {
              const currentUserObj = JSON.parse(savedUserStr);
              const targetPlan = data.order?.purchase_plan || "complete";
              const updatedUser: TextbookUser = { ...currentUserObj, plan: targetPlan };
              sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updatedUser));
              setUser(updatedUser);
              
              // Sync with local memory database and server DB
              updateUser(currentUserObj.mobileNumber, { plan: targetPlan });
              if (currentUserObj.accessId) {
                updateUser(currentUserObj.accessId, { plan: targetPlan });
                const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
                const idx = allowedIds.findIndex(item => item.accessId.toUpperCase() === currentUserObj.accessId.toUpperCase());
                if (idx !== -1) {
                  allowedIds[idx].plan = targetPlan;
                  setStorageItem('lurnexa_allowed_access_ids', allowedIds);
                }
              }
            } catch (jsonErr) {
              console.error("Error parsing logged-in user for plan upgrade sync:", jsonErr);
            }
          }
        } else {
          showToast(data.message || "Payment verification failed or was declined.", "error");
        }
      })
      .catch(err => {
        console.error("Verification error:", err);
        showToast("Error connecting to payment verification server.", "error");
      })
      .finally(() => {
        setIsUpgrading(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      });
    }
  }, [mounted, user]);

  // Scan for expired quizzes and send results to teachers
  useEffect(() => {
    if (!mounted) return;

    const checkExpiredQuizzes = async () => {
      try {
        const quizzes = getStorageItem<any[]>('lurnexa_quizzes', []);
        const sentEmails = getStorageItem<string[]>('lurnexa_sent_quiz_emails', []);
        const now = new Date();

        const expiredUnsent = quizzes.filter((q: any) => {
          if (!q.endTime) return false;
          const isExpired = new Date(q.endTime) <= now;
          const isSent = sentEmails.includes(q.quizCode.toUpperCase());
          return isExpired && !isSent;
        });

        for (const quiz of expiredUnsent) {
          // Find the teacher details
          const users = getStorageItem<any[]>('lurnexa_users', []);
          const teacher = users.find((u: any) => u.role === "faculty" && u.mobileNumber === quiz.createdBy);
          
          if (!teacher || !teacher.collegeEmail) {
            console.warn(`[Quiz Email Scanner] No teacher email found for quiz ${quiz.quizCode}`);
            // Add to sent emails to avoid scanning repeatedly if no teacher email exists
            sentEmails.push(quiz.quizCode.toUpperCase());
            setStorageItem('lurnexa_sent_quiz_emails', sentEmails);
            continue;
          }

          // Get attempts
          const attempts = getAttemptsForQuiz(quiz.quizCode);

          // Send POST request
          const res = await fetch("/api/textbooks/quiz/send-results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quizCode: quiz.quizCode,
              quizTitle: quiz.title,
              teacherEmail: teacher.collegeEmail,
              teacherName: teacher.name,
              attempts: attempts
            })
          });

          if (res.ok) {
            sentEmails.push(quiz.quizCode.toUpperCase());
            setStorageItem('lurnexa_sent_quiz_emails', sentEmails);
            console.log(`[Quiz Email Scanner] Results email triggered successfully for ${quiz.quizCode}`);
          } else {
            console.error(`[Quiz Email Scanner] Failed to send email for quiz ${quiz.quizCode}`);
          }
        }
      } catch (err) {
        console.error("[Quiz Email Scanner] Error scanning expired quizzes:", err);
      }
    };

    checkExpiredQuizzes();
    const interval = setInterval(checkExpiredQuizzes, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Fetch Admin Data & Periodically Refresh to keep in sync
  useEffect(() => {
    if (user?.role !== "admin") return;

    const refreshData = () => {
      if (activeTab === "users") {
        setAdminUsers(getAllUsers());
      }
      if (activeTab === "accessIds") {
        setAdminAccessIds(getAllAccessIds());
        setColleges(getColleges());
      }
      if (activeTab === "colleges") {
        setColleges(getColleges());
      }
      if (activeTab === "coupons") {
        setCoupons(getCoupons());
      }
      if (activeTab === "payments") {
        setAdminPurchases(getAllPurchases());
        fetchAdminRentals();
      }
      if (activeTab === "qbank") {
        setAdminQuestions(getQuestionsByBook(adminQBankBook));
        const chaptersMap: Record<string, number> = {};
        const books = getAllTextbooks();
        books.forEach(b => {
          chaptersMap[b.id] = getBookChapters(b.id);
        });
        setAdminChaptersConfig(chaptersMap);
        const tests = getPracticeTests(adminQBankBook);
        setPracticeTests(tests);
        if (tests.length > 0 && !selectedPracticeTestId) {
          setSelectedPracticeTestId(tests[0].id);
        }
      }
    };

    refreshData();
    const intervalId = setInterval(refreshData, 2000); // Refresh every 2 seconds
    return () => clearInterval(intervalId);
  }, [user, activeTab, adminQBankBook, selectedPracticeTestId]);

  // Periodically fetch database from server to keep IN_MEMORY_DB fresh
  useEffect(() => {
    if (user?.role !== "admin") return;
    const interval = setInterval(async () => {
      const synced = await syncFromServer();
      if (synced) {
        // Trigger state updates with newly synced data
        if (activeTab === "users") {
          setAdminUsers(getAllUsers());
        }
        if (activeTab === "accessIds") {
          setAdminAccessIds(getAllAccessIds());
          setColleges(getColleges());
        }
        if (activeTab === "colleges") {
          setColleges(getColleges());
        }
        if (activeTab === "coupons") {
          setCoupons(getCoupons());
        }
        if (activeTab === "payments") {
          setAdminPurchases(getAllPurchases());
          fetchAdminRentals();
        }
        if (activeTab === "qbank") {
          setAdminQuestions(getQuestionsByBook(adminQBankBook));
          const chaptersMap: Record<string, number> = {};
          const books = getAllTextbooks();
          books.forEach(b => {
            chaptersMap[b.id] = getBookChapters(b.id);
          });
          setAdminChaptersConfig(chaptersMap);
          const tests = getPracticeTests(adminQBankBook);
          setPracticeTests(tests);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, activeTab, adminQBankBook]);

  // Periodically refresh Career Hub data to keep in sync
  useEffect(() => {
    if (!mounted || !user) return;
    const refreshCareerData = () => {
      setInterviewQuestions(getInterviewQuestions());
      setCompanyUpdates(getCompanyUpdates());
    };
    refreshCareerData();
    const intervalId = setInterval(refreshCareerData, 2000);
    return () => clearInterval(intervalId);
  }, [mounted, user]);

  // Sync Admin Textbook Settings Form
  useEffect(() => {
    if (configBookId) {
      const config = getPracticeConfig(configBookId);
      setConfigPracticeDuration(config.duration);
      setConfigPracticeQuestionLimit(config.questionLimit);
      setPracticeTests(getPracticeTests(configBookId));
    }
  }, [configBookId]);

  // Fetch Faculty Data
  useEffect(() => {
    if (user?.role === "faculty") {
      const quizzes = getQuizzesByCreator(user.mobileNumber);
      setFacultyQuizzes(quizzes);
      // Force their default textbook to their assigned textbook
      setNewQuizBookId(user.bookId);

      // Auto-select quiz from initialQuizCode if present
      if (initialQuizCode && activeTab === "results") {
        const matched = quizzes.find(q => q.quizCode.toUpperCase() === initialQuizCode.toUpperCase());
        if (matched) {
          setSelectedFacultyQuiz(matched);
          setSelectedQuizAttempts(getAttemptsForQuiz(matched.quizCode));
        }
      }
    }
  }, [user, activeTab, initialQuizCode]);

  // Sync profileForm state with logged-in user
  useEffect(() => {
    if (user && user.role === "faculty") {
      setProfileForm({
        name: user.name || "",
        collegeName: user.collegeName || "",
        facultyId: user.facultyId || "",
        facultyRole: user.facultyRole || "",
        subjectTeaching: user.subjectTeaching || "",
        collegeEmail: user.collegeEmail || ""
      });
    } else if (user && user.role === "student") {
      setStudentProfileName(user.name || "");
    }
  }, [user]);

  // Fetch Student Practice Questions & Attempts History
  useEffect(() => {
    if (user?.role === "student" && activeTab === "practice") {
      const allQ = getQuestionsByBook(user.bookId);
      let selectedQ = allQ.filter(item => item.selectedForPractice === true);
      if (selectedQ.length === 0) {
        const fallbackQ = allQ.filter(item => item.category === 'practice' || !item.category);
        const config = getPracticeConfig(user.bookId);
        selectedQ = fallbackQ.slice(0, config.questionLimit);
      }
      setPracticeQuestions(selectedQ);
      setPracticeAnswers(new Array(selectedQ.length).fill(""));
      setPracticeCurrentIndex(0);
      setPracticeResultScore(null);
      setPracticeStarted(false);
      const attempts = getPracticeAttempts(user.mobileNumber, user.bookId);
      setPastPracticeAttempts(attempts);
      setSelectedPastAttempt(null);
      setPracticeTests(getPracticeTests(user.bookId));
    }
  }, [user, activeTab]);

  // Fullscreen Helper Functions
  const requestFullScreen = () => {
    if (typeof window === 'undefined') return;
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {});
    } else if ((docEl as any).mozRequestFullScreen) {
      (docEl as any).mozRequestFullScreen().catch(() => {});
    } else if ((docEl as any).webkitRequestFullscreen) {
      (docEl as any).webkitRequestFullscreen().catch(() => {});
    } else if ((docEl as any).msRequestFullscreen) {
      (docEl as any).msRequestFullscreen().catch(() => {});
    }
  };

  const exitFullScreen = () => {
    if (typeof window === 'undefined') return;
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen().catch(() => {});
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen().catch(() => {});
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen().catch(() => {});
    }
  };

  // Refs to avoid stale closures in visibilitychange listener
  const quizQuestionMappingRef = useRef<{ originalIndex: number; optionMapping: Record<string, string> }[]>([]);
  const practiceQuestionMappingRef = useRef<{ originalIndex: number; optionMapping: Record<string, string> }[]>([]);
  const handleSubmitStudentQuizRef = useRef<(() => void) | null>(null);
  const handleSubmitPracticeRef = useRef<(() => void) | null>(null);
  const activeStudentQuizRef = useRef(activeStudentQuiz);
  const practiceStartedRef = useRef(practiceStarted);
  const activePracticeTestRef = useRef(activePracticeTest);



  useEffect(() => {
    activeStudentQuizRef.current = activeStudentQuiz;
  }, [activeStudentQuiz]);

  useEffect(() => {
    practiceStartedRef.current = practiceStarted;
  }, [practiceStarted]);

  useEffect(() => {
    activePracticeTestRef.current = activePracticeTest;
  }, [activePracticeTest]);

  // Anti-cheat Visibility & Focus change listener
  useEffect(() => {
    const isExamActive = !!activeStudentQuiz || (practiceStarted && !!activePracticeTest);
    if (!isExamActive) {
      setTabSwitchCount(0);
      return;
    }

    const lastViolationRef = { current: 0 };

    const triggerViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastViolationRef.current < 1000) {
        return;
      }
      lastViolationRef.current = now;

      setTabSwitchCount((prev) => {
        const nextCount = prev + 1;
        if (nextCount === 1) {
          showToast(`Warning: ${reason}. If you switch tabs or exit fullscreen one more time, your test will submit automatically!`, "error");
          // Attempt to restore fullscreen immediately
          setTimeout(() => {
            requestFullScreen();
          }, 100);
        } else if (nextCount >= 2) {
          showToast(`Test submitted automatically due to: ${reason}.`, "error");
          exitFullScreen();
          if (activeStudentQuizRef.current && handleSubmitStudentQuizRef.current) {
            handleSubmitStudentQuizRef.current();
          } else if (practiceStartedRef.current && activePracticeTestRef.current && handleSubmitPracticeRef.current) {
            handleSubmitPracticeRef.current();
          }
        }
        return nextCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("switching tabs");
      }
    };

    const handleWindowBlur = () => {
      triggerViolation("window unfocused");
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isFullscreen) {
        triggerViolation("exiting fullscreen");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Escape
      if (e.key === "Escape") {
        e.preventDefault();
        requestFullScreen();
        triggerViolation("exiting fullscreen (Escape key pressed)");
        return;
      }
      
      // Prevent PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        showToast("Screenshots are disabled during the test!", "error");
        return;
      }

      // Prevent Command/Windows Key combinations for screenshots/snippets (Win+Shift+S or Cmd+Shift+3/4)
      if (
        (e.metaKey && e.shiftKey && (e.key === "S" || e.key === "s" || e.key === "3" || e.key === "4")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "S" || e.key === "s"))
      ) {
        e.preventDefault();
        showToast("Screenshot shortcuts are disabled during the test!", "error");
        return;
      }

      // Prevent Ctrl+P or Cmd+P (print)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        showToast("Printing/saving PDF is disabled during the test!", "error");
        return;
      }
    };

    const preventCopyPaste = (e: Event) => {
      e.preventDefault();
      showToast("Copy, cut, and paste are disabled during the test!", "error");
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Append anti-screenshot & selection styling dynamically
    const styleEl = document.createElement("style");
    styleEl.id = "anti-screenshot-style";
    styleEl.innerHTML = `
      @media print {
        body {
          display: none !important;
        }
      }
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("contextmenu", preventContextMenu);

      const existingStyle = document.getElementById("anti-screenshot-style");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [activeStudentQuiz, practiceStarted, activePracticeTest]);

  const checkAndPerformRedirect = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("redirect") === "checkout") {
        const bookId = urlParams.get("bookId");
        const format = urlParams.get("format");
        const plan = urlParams.get("plan");
        let target = "/textbooks/store/checkout";
        const paramsList: string[] = [];
        if (bookId) paramsList.push(`bookId=${encodeURIComponent(bookId)}`);
        if (format) paramsList.push(`format=${encodeURIComponent(format)}`);
        if (plan) paramsList.push(`plan=${encodeURIComponent(plan)}`);
        if (paramsList.length > 0) target += `?${paramsList.join("&")}`;
        window.location.href = target;
        return true;
      }
    } catch (e) {}
    return false;
  };

  // Email & Password Login Handler
  async function handleEmailLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!authEmail.trim() || !authPassword) {
      setErrorMessage("Please enter your Gmail / Email address and password.");
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch("/api/textbooks/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim(), password: authPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Login failed. Please check your credentials.");
        setIsAuthLoading(false);
        return;
      }

      const loggedUser = data.user;
      setUser(loggedUser);
      sessionStorage.setItem("lurnexa_session_token", data.token);
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(loggedUser));
      localStorage.setItem("lurnexa_user_email", loggedUser.email);
      localStorage.setItem("user_email", loggedUser.email);
      localStorage.setItem("lurnexa_user", JSON.stringify(loggedUser));

      setSuccessMessage("");
      setErrorMessage("");
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthMobile("");
      if (!checkAndPerformRedirect()) {
        setActiveTab("mybooks");
      }
    } catch (err) {
      setErrorMessage("Network error connecting to login server.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  // Email & Password Signup Handler
  async function handleEmailSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!authEmail.trim() || !authPassword || !authName.trim()) {
      setErrorMessage("Full Name, Gmail / Email, and Password are required.");
      return;
    }

    if (authPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(authPassword)) {
      setErrorMessage("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(authPassword)) {
      setErrorMessage("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(authPassword)) {
      setErrorMessage("Password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(authPassword)) {
      setErrorMessage("Password must contain at least one special character (!@#$%^&* etc.).");
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch("/api/textbooks/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          mobileNumber: authMobile.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Signup failed. Please try again.");
        setIsAuthLoading(false);
        return;
      }

      const loggedUser = data.user;
      setUser(loggedUser);
      sessionStorage.setItem("lurnexa_session_token", data.token);
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(loggedUser));
      localStorage.setItem("lurnexa_user_email", loggedUser.email);
      localStorage.setItem("user_email", loggedUser.email);
      localStorage.setItem("lurnexa_user", JSON.stringify(loggedUser));

      setSuccessMessage("");
      setErrorMessage("");
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthMobile("");
      if (!checkAndPerformRedirect()) {
        setActiveTab("mybooks");
      }
    } catch (err) {
      setErrorMessage("Network error connecting to registration server.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLogin) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmittingLogin(true);

    const isFacultyLogin = loginAccessId.trim().toUpperCase().startsWith("LF");
    const isStudentLogin = loginAccessId.trim().toUpperCase().startsWith("LS") || loginAccessId.trim().toUpperCase().startsWith("LURN") || loginAccessId.trim().toUpperCase().startsWith("LR");
    const isAdminAccess = loginAccessId.trim().toUpperCase() === "ADMIN" || loginAccessId.trim().toUpperCase() === "LURNEXA";
    const isEmailLogin = isFacultyLogin || isStudentLogin || isAdminAccess;

    if (!loginAccessId || !loginMobile) {
      setErrorMessage(
        isEmailLogin 
          ? "Please enter both your Access ID and College Email ID." 
          : "Please enter both your Access ID and Mobile Number."
      );
      setSuccessMessage("");
      setIsSubmittingLogin(false);
      return;
    }

    const cleanAccessId = loginAccessId.trim();
    const cleanMobile = loginMobile.trim();

    const adminCreds = getAdminCredentials();
    const isLoginAdminAccess = (cleanAccessId.toUpperCase() === "LURNEXA" || cleanAccessId.toUpperCase() === "ADMIN" || cleanAccessId.toUpperCase() === adminCreds.accessId.trim().toUpperCase());

    const isAdminLogin = isLoginAdminAccess && (
      cleanMobile.toLowerCase() === adminCreds.email.trim().toLowerCase() ||
      cleanMobile.toLowerCase() === "lurnexapublication@gmail.com" ||
      (cleanMobile.replace(/\D/g, "") === adminCreds.mobileNumber.replace(/\D/g, "") && cleanMobile.replace(/\D/g, "") === "9347834904")
    );

    let targetCoordinate = cleanMobile;
    let matchedUser: TextbookUser | null = null;

    if (isAdminLogin) {
      targetCoordinate = cleanMobile.includes("@") ? adminCreds.email : adminCreds.mobileNumber;
    } else {
      matchedUser = getUser(cleanMobile, cleanAccessId);
      if (!matchedUser) {
        setErrorMessage(
          isEmailLogin
            ? "No account registered with this Access ID and College Email ID. Please double check, or click Sign Up below."
            : "No account registered with this Access ID and Mobile Number. Please double check, or click Sign Up below."
        );
        setSuccessMessage("");
        setIsSubmittingLogin(false);
        return;
      }
      
      targetCoordinate = isEmailLogin ? (matchedUser.collegeEmail || matchedUser.mobileNumber) : matchedUser.mobileNumber;
    }

    try {
      const res = await fetch("/api/textbooks/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: cleanAccessId, target: targetCoordinate }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (isAdminLogin) {
          setOtpSent(true);
          setSuccessMessage("Admin offline login ready. Use your master verification bypass code (783490).");
          setErrorMessage("");
          setIsSubmittingLogin(false);
          return;
        }
        setErrorMessage(data.error || "Failed to send verification OTP.");
        setSuccessMessage("");
        setIsSubmittingLogin(false);
        return;
      }

      setOtpSent(true);
      if (isAdminLogin) {
        setSuccessMessage(`OTP sent successfully to Admin's registered email (${targetCoordinate}).`);
      } else if (isEmailLogin) {
        setSuccessMessage(`OTP sent successfully to your college email address (${targetCoordinate}).`);
      } else {
        setSuccessMessage(`OTP sent successfully to your mobile number (${targetCoordinate}).`);
      }
      setErrorMessage("");
    } catch (err) {
      if (isAdminLogin) {
        setOtpSent(true);
        setSuccessMessage("Admin offline login ready. Use your master verification bypass code (783490).");
        setErrorMessage("");
      } else {
        setErrorMessage("Network error: Failed to contact authentication server.");
        setSuccessMessage("");
      }
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle Login Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanAccessId = loginAccessId.trim();
    const cleanMobile = loginMobile.trim();
    const cleanOtpInput = otpInput.trim();

    const adminCreds = getAdminCredentials();
    const isLoginAdminAccess = (cleanAccessId.toUpperCase() === "LURNEXA" || cleanAccessId.toUpperCase() === "ADMIN" || cleanAccessId.toUpperCase() === adminCreds.accessId.trim().toUpperCase());
    const isAdminLogin = isLoginAdminAccess && (
      cleanMobile.toLowerCase() === adminCreds.email.trim().toLowerCase() ||
      cleanMobile.toLowerCase() === "lurnexapublication@gmail.com" ||
      (cleanMobile.replace(/\D/g, "") === adminCreds.mobileNumber.replace(/\D/g, "") && cleanMobile.replace(/\D/g, "") === "9347834904")
    );

    if (isAdminLogin && cleanOtpInput === "783490") {
      // Direct offline bypass for Admin
      const loggedInUser: TextbookUser = {
        name: adminCreds.name,
        bookId: "ADMIN",
        mobileNumber: adminCreds.mobileNumber,
        collegeEmail: adminCreds.email || "lurnexapublication@gmail.com",
        role: "admin",
        collegeName: "Lurnexa Publications Admin HQ",
        isActive: true,
        accessId: adminCreds.accessId
      };
      sessionStorage.setItem("lurnexa_session_token", "admin_offline_token");
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setOtpSent(false);
      setSuccessMessage("Logged in successfully (Admin Offline Mode)!");
      setActiveTab("users");
      return;
    }

    let targetCoordinate = cleanMobile;
    let matchedUser: TextbookUser | null = null;

    if (isAdminLogin) {
      targetCoordinate = cleanMobile.includes("@") ? adminCreds.email : adminCreds.mobileNumber;
    } else {
      matchedUser = getUser(cleanMobile, cleanAccessId);
      if (!matchedUser) {
        setErrorMessage("Error retrieving user profile.");
        return;
      }
      targetCoordinate = (cleanAccessId.toUpperCase().startsWith("LF") || cleanAccessId.toUpperCase().startsWith("LS") || cleanAccessId.toUpperCase().startsWith("LURN") || cleanAccessId.toUpperCase().startsWith("LR")) ? (matchedUser.collegeEmail || matchedUser.mobileNumber) : matchedUser.mobileNumber;
    }

    try {
      const res = await fetch("/api/textbooks/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: cleanAccessId, target: targetCoordinate, code: cleanOtpInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "OTP verification failed.");
        return;
      }

      // Success login
      let loggedInUser: TextbookUser;
      if (isAdminLogin && !matchedUser) {
        loggedInUser = {
          name: adminCreds.name,
          bookId: "ADMIN",
          mobileNumber: adminCreds.mobileNumber,
          collegeEmail: adminCreds.email || "lurnexapublication@gmail.com",
          role: "admin",
          collegeName: "Lurnexa Publications Admin HQ",
          isActive: true,
          accessId: adminCreds.accessId
        };
      } else if (matchedUser) {
        loggedInUser = matchedUser;
      } else {
        setErrorMessage("Could not retrieve user account profile.");
        return;
      }

      sessionStorage.setItem("lurnexa_session_token", data.token);
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(loggedInUser));
      localStorage.setItem("lurnexa_user", JSON.stringify(loggedInUser));
      localStorage.setItem("lurnexa_user_email", loggedInUser.collegeEmail || loggedInUser.email || "");
      setUser(loggedInUser);
      setOtpSent(false);
      setSuccessMessage("Logged in successfully!");
      
      if (checkAndPerformRedirect()) return;

      if (loggedInUser.role === "admin") setActiveTab("users");
      else if (loggedInUser.role === "faculty") setActiveTab("create");
      else {
        const plan = loggedInUser.plan || "complete";
        if (plan === "placements") {
          setActiveTab("studentCareerHub");
        } else if (plan === "caselet") {
          setActiveTab("caselets");
        } else if (plan === "practice") {
          setActiveTab("practice");
        } else {
          setActiveTab("mybooks");
        }
      }
    } catch (err) {
      setErrorMessage("Network error: OTP verification failed.");
    }
  };

  // Verify Access ID during signup
  const handleVerifyAccessId = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signupAccessId) {
      setErrorMessage("Please enter an Access ID to verify.");
      return;
    }

    const res = validateAccessId(signupAccessId);
    if (!res.isValid) {
      setErrorMessage(res.error || "Invalid Access ID.");
      return;
    }

    if (res.isAssigned) {
      setErrorMessage("This Access ID is already registered! If you purchased a book, your account is active—please click 'Log In' above to access your account.");
      return;
    }

    setIsAccessIdVerified(true);
    setDetectedRole(res.role || null);
    setDetectedBookId(res.bookId || "");
    setDetectedPlan((res as any).plan || null);
    if (res.collegeName) {
      setSignupForm(prev => ({ ...prev, collegeName: res.collegeName! }));
      setIsCollegeAutoFilled(true);
    } else {
      setSignupForm(prev => ({ ...prev, collegeName: "" }));
      setIsCollegeAutoFilled(false);
    }
    setSuccessMessage(`Access ID verified successfully! Role resolved: ${res.role?.toUpperCase()}, textbook mapping identified.`);
  };

  // Handle Signup Submit - triggers OTP request first
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { name, mobileNumber, collegeName, collegeId, department, facultyRole, subjectTeaching, facultyId, collegeEmail, teachingFacultyAccessId } = signupForm;

    if (!name || !mobileNumber || !collegeName) {
      setErrorMessage("Please fill in all mandatory fields.");
      return;
    }

    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    if (cleanedMobile.length !== 10) {
      setErrorMessage("Mobile number must be exactly 10 digits and contain only numbers.");
      return;
    }

    if (collegeEmail && !isCollegeEmail(collegeEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Role specific fields
    if (detectedRole === "student" && (!collegeId || !department || !collegeEmail)) {
      setErrorMessage("Please fill in your College ID, Department, and College Email.");
      return;
    }
    if (detectedRole === "faculty" && (!facultyRole || !subjectTeaching || !facultyId || !collegeEmail)) {
      setErrorMessage("Please fill in all faculty registration details (Faculty ID, College Email, Designation, Subject).");
      return;
    }

    let verifiedFacultyAccessId = "";

    // Instead of creating the user directly, dispatch OTP for verification
    const targetCoordinate = (detectedRole === "faculty" || detectedRole === "student") ? collegeEmail : mobileNumber;
    try {
      const res = await fetch("/api/textbooks/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: signupAccessId, target: targetCoordinate }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to send signup verification OTP.");
        return;
      }

      setSignupOtpSent(true);
      setSuccessMessage(
        (detectedRole === "faculty" || detectedRole === "student")
          ? `Verification OTP sent to your college email address (${collegeEmail}).`
          : `Verification OTP sent to your mobile number (${mobileNumber}).`
      );
    } catch (err) {
      setErrorMessage("Failed to send signup verification code. Please try again.");
    }
  };

  // Handle Verify OTP & Create User
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signupOtpInput) {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    const { name, mobileNumber, collegeName, collegeId, department, facultyRole, subjectTeaching, facultyId, collegeEmail, teachingFacultyAccessId } = signupForm;
    const targetCoordinate = (detectedRole === "faculty" || detectedRole === "student") ? collegeEmail : mobileNumber;

    try {
      const verifyRes = await fetch("/api/textbooks/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: signupAccessId, target: targetCoordinate, code: signupOtpInput }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setErrorMessage(verifyData.error || "Verification failed. Please check the code.");
        return;
      }

      const newUser: TextbookUser = {
        name,
        bookId: detectedBookId,
        mobileNumber,
        role: detectedRole!,
        collegeName,
        isActive: true,
        accessId: signupAccessId,
        plan: (detectedPlan as any) || 'complete',
        purchasedBooks: [detectedBookId],
        ...(detectedRole === "student" 
          ? { collegeId, department, teachingFacultyAccessId: "", collegeEmail } 
          : { facultyRole, subjectTeaching, facultyId, collegeEmail })
      };

      const dbRes = createUser(newUser);
      if (!dbRes.success) {
        setErrorMessage(dbRes.error || "Signup failed.");
        return;
      }

      // If it is a student signup (uses mobile number), trigger Twilio verification request to add caller ID
      let twilioNotice = "";
      if (detectedRole === "student") {
        try {
          const callerIdRes = await fetch("/api/textbooks/auth/add-caller-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobileNumber, name }),
          });
          const callerIdData = await callerIdRes.json();
          if (callerIdRes.ok && callerIdData.validationCode) {
            setTwilioValidationCode(callerIdData.validationCode);
            twilioNotice = ` Twilio verification call initiated. When you receive a call from Twilio on ${mobileNumber}, please enter this validation code: ${callerIdData.validationCode} to verify your phone number.`;
          }
        } catch (err) {
          console.error("Failed to add caller ID to Twilio:", err);
        }
      }

      setSuccessMessage(`Account registered successfully for ${name}!${twilioNotice} Please use your Access ID to log in.`);
      setIsSignup(false);
      setIsAccessIdVerified(false);
      setIsCollegeAutoFilled(false);
      setSignupAccessId("");
      setSignupOtpSent(false);
      setSignupOtpInput("");
      
      // Auto-fill login fields
      setLoginAccessId(signupAccessId);
      if (detectedRole === "faculty" || detectedRole === "student") {
        setLoginMobile(collegeEmail);
      } else {
        setLoginMobile(mobileNumber);
      }
    } catch (err) {
      setErrorMessage("Verification failed due to a server error. Please try again.");
    }
  };

  // Career Hub action handlers
  const handleSaveInterviewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iqCompany.trim() || !iqQuestion.trim()) {
      setErrorMessage("Company and Question are required.");
      return;
    }
    const target: InterviewQuestion = {
      id: editingQuestion ? editingQuestion.id : Date.now().toString(),
      company: iqCompany.trim(),
      role: iqRole.trim() || undefined,
      questionText: iqQuestion.trim(),
      answerText: iqAnswer.trim() || undefined,
      difficulty: iqDifficulty || "Medium",
      createdAt: editingQuestion ? editingQuestion.createdAt : new Date().toISOString()
    };
    saveInterviewQuestion(target);
    setSuccessMessage(editingQuestion ? "Interview Question updated successfully." : "Interview Question added successfully.");
    setErrorMessage("");
    // reset form
    setEditingQuestion(null);
    setIqCompany("");
    setIqRole("");
    setIqQuestion("");
    setIqAnswer("");
    setIqDifficulty("Medium");
    setInterviewQuestions(getInterviewQuestions());
  };

  const handleEditInterviewQuestion = (q: InterviewQuestion) => {
    setEditingQuestion(q);
    setIqCompany(q.company);
    setIqRole(q.role || "");
    setIqQuestion(q.questionText);
    setIqAnswer(q.answerText || "");
    setIqDifficulty(q.difficulty || "Medium");
  };

  const handleDeleteInterviewQuestion = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to permanently delete this interview question?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      isDanger: true,
      onConfirm: () => {
        deleteInterviewQuestion(id);
        showToast("Interview Question deleted successfully.", "success");
        setInterviewQuestions(getInterviewQuestions());
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveCompanyUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuCompany.trim() || !cuBullets.trim()) {
      setErrorMessage("Company name and updates are required.");
      return;
    }
    const bulletList = cuBullets.split("\n").map(b => b.trim()).filter(b => b.length > 0);
    if (bulletList.length === 0) {
      setErrorMessage("At least one update point is required.");
      return;
    }
    const target: CompanyUpdate = {
      id: editingUpdate ? editingUpdate.id : Date.now().toString(),
      company: cuCompany.trim(),
      updates: bulletList,
      createdAt: editingUpdate ? editingUpdate.createdAt : new Date().toISOString()
    };
    saveCompanyUpdate(target);
    setSuccessMessage(editingUpdate ? "Company update updated successfully." : "Company update added successfully.");
    setErrorMessage("");
    // reset form
    setEditingUpdate(null);
    setCuCompany("");
    setCuBullets("");
    setCompanyUpdates(getCompanyUpdates());
  };

  const handleEditCompanyUpdate = (u: CompanyUpdate) => {
    setEditingUpdate(u);
    setCuCompany(u.company);
    setCuBullets(u.updates.join("\n"));
  };

  const handleDeleteCompanyUpdate = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to permanently delete this company update?",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      isDanger: true,
      onConfirm: () => {
        deleteCompanyUpdate(id);
        showToast("Company update deleted successfully.", "success");
        setCompanyUpdates(getCompanyUpdates());
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("lurnexa_current_user");
    sessionStorage.removeItem("lurnexa_session_token");
    sessionStorage.removeItem("lurnexa_portal_active_tab");
    localStorage.removeItem("lurnexa_user");
    localStorage.removeItem("lurnexa_user_email");
    localStorage.removeItem("user_email");
    setUser(null);
    setActiveTab("");
    setOtpSent(false);
    setOtpInput("");
    setGeneratedOtp("");
    setLoginAccessId("");
    setLoginMobile("");
    setSignupAccessId("");
    setSignupOtpSent(false);
    setSignupOtpInput("");
    setTwilioValidationCode("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    setAuthMobile("");
    setSuccessMessage("");
    setErrorMessage("");
    // Reset other screens
    setActiveStudentQuiz(null);
    setStudentQuizResult(null);
    setPracticeResultScore(null);
  };

  // --- ADMIN ACTIONS ---
  const handleToggleUserStatus = (mobile: string, currentStatus: boolean) => {
    if (currentStatus) {
      // Deactivating - show custom confirm modal
      const targetUser = adminUsers.find(u => u.mobileNumber === mobile);
      setConfirmModal({
        isOpen: true,
        title: "Confirm Deactivation",
        message: `Are you sure you want to deactivate ${targetUser ? targetUser.name : "this user"}'s profile? Doing so will prevent them from logging in.`,
        confirmText: "Yes, Deactivate",
        cancelText: "Cancel",
        isDanger: true,
        onConfirm: () => {
          const success = updateUserStatus(mobile, false);
          if (success) {
            setAdminUsers(getAllUsers());
            showToast("User status updated to Inactive.", "success");
          } else {
            showToast("Cannot modify admin account status.", "error");
          }
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      // Activating - do directly
      const success = updateUserStatus(mobile, true);
      if (success) {
        setAdminUsers(getAllUsers());
        showToast("User status updated to Active.", "success");
      } else {
        showToast("Cannot modify admin account status.", "error");
      }
    }
  };

  const handleAdminDeleteUser = (mobile: string) => {
    const targetUser = adminUsers.find(u => u.mobileNumber === mobile);
    setConfirmModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to permanently delete ${targetUser ? targetUser.name : "this user"}'s profile? All data and their access ID registration will be reset.`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      isDanger: true,
      onConfirm: () => {
        const success = deleteUser(mobile);
        if (success) {
          setAdminUsers(getAllUsers());
          showToast("User deleted successfully.", "success");
        } else {
          showToast("Cannot delete admin account.", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAdminAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { type, chapter, category, questionText, optionA, optionB, optionC, optionD, correctOption } = adminNewQuestion;
    if (!questionText) {
      setErrorMessage("Please enter the question text.");
      return;
    }

    const chapterNum = parseInt(chapter.toString()) || 1;

    if (type === "mcq") {
      if (!optionA || !optionB || !optionC || !optionD) {
        setErrorMessage("Please enter all MCQ option fields.");
        return;
      }

      addQuestionToBank({
        bookId: adminQBankBook,
        type: "mcq",
        chapter: chapterNum,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        category
      });
    } else {
      addQuestionToBank({
        bookId: adminQBankBook,
        type: "written",
        chapter: chapterNum,
        questionText,
        category
      });
    }

    setSuccessMessage("Question added to bank successfully!");
    setAdminQuestions(getQuestionsByBook(adminQBankBook));
    setAdminNewQuestion({
      type: "mcq",
      chapter: 1,
      category: "practice",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A"
    });
  };

  const handleAdminDeleteQuestion = (id: string) => {
    const success = deleteQuestionFromBank(id);
    if (success) {
      setAdminQuestions(getQuestionsByBook(adminQBankBook));
      setSuccessMessage("Question deleted successfully.");
    }
  };


  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
          if (!(window as any).pdfjsLib) {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
            document.head.appendChild(script);
            await new Promise((res) => {
              script.onload = res;
            });
          }
          
          const pdfjsLib = (window as any).pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
          
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            text += pageText + "\n";
          }
          resolve(text);
        } catch (err) {
          reject(err);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!(window as any).mammoth) {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.21/mammoth.browser.min.js";
            document.head.appendChild(script);
            await new Promise((res) => {
              script.onload = res;
            });
          }
          
          const mammoth = (window as any).mammoth;
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          resolve(result.value);
        } catch (err) {
          reject(err);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  const parseQuestionsFromPlainText = (text: string): Omit<Question, 'id'>[] => {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const questions: Omit<Question, 'id'>[] = [];
    
    let currentBlock: string[] = [];
    
    const isQuestionStart = (line: string): boolean => {
      const clean = line.replace(/^\s+/, "");
      return /^(q\s*\d+|\[\d+\]|\d+\s*[\.\)]+)/i.test(clean);
    };
    
    for (const line of lines) {
      if (isQuestionStart(line)) {
        if (currentBlock.length > 0) {
          processBlock(currentBlock, questions);
          currentBlock = [];
        }
      }
      currentBlock.push(line);
    }
    
    if (currentBlock.length > 0) {
      processBlock(currentBlock, questions);
    }
    
    return questions;
  };

  const processBlock = (block: string[], questions: Omit<Question, 'id'>[]) => {
    let type: 'mcq' | 'written' = 'mcq';
    let questionText = "";
    let optionA = "";
    let optionB = "";
    let optionC = "";
    let optionD = "";
    let correctOption: 'A' | 'B' | 'C' | 'D' = 'A';
    let category: 'practice' | 'quiz' = 'practice';
    let chapter = 1;
    
    let firstLine = block[0] || "";
    questionText = firstLine.replace(/^(q\s*\d+|\[\d+\]|\d+\s*[\.\)]+)\s*[:\.\-]?\s*/i, "").trim();
    
    for (let i = 1; i < block.length; i++) {
      const line = block[i];
      const upperLine = line.toUpperCase();
      
      if (/^A[\.\)\:]\s*/i.test(line)) {
        optionA = line.replace(/^A[\.\)\:]\s*/i, "").trim();
      } else if (/^B[\.\)\:]\s*/i.test(line)) {
        optionB = line.replace(/^B[\.\)\:]\s*/i, "").trim();
      } else if (/^C[\.\)\:]\s*/i.test(line)) {
        optionC = line.replace(/^C[\.\)\:]\s*/i, "").trim();
      } else if (/^D[\.\)\:]\s*/i.test(line)) {
        optionD = line.replace(/^D[\.\)\:]\s*/i, "").trim();
      } else if (upperLine.startsWith("CORRECT:") || upperLine.startsWith("ANSWER:")) {
        const ans = upperLine.replace(/^(CORRECT:|ANSWER:)\s*/i, "").trim();
        if (["A", "B", "C", "D"].includes(ans)) {
          correctOption = ans as 'A' | 'B' | 'C' | 'D';
        }
      } else if (upperLine.startsWith("TYPE:")) {
        const t = upperLine.replace(/^TYPE:\s*/i, "").trim().toLowerCase();
        if (t === "written") {
          type = "written";
        } else {
          type = "mcq";
        }
      } else if (upperLine.startsWith("CATEGORY:")) {
        const cat = upperLine.replace(/^CATEGORY:\s*/i, "").trim().toLowerCase();
        if (cat === "quiz") {
          category = "quiz";
        } else {
          category = "practice";
        }
      } else if (upperLine.startsWith("CHAPTER:")) {
        const chap = parseInt(upperLine.replace(/^CHAPTER:\s*/i, "").trim());
        if (!isNaN(chap)) {
          chapter = chap;
        }
      } else {
        if (!optionA && !optionB && !optionC && !optionD) {
          questionText += " " + line;
        }
      }
    }
    
    if (!optionA && !optionB && !optionC && !optionD && type === 'mcq') {
      type = 'written';
    }
    
    if (questionText) {
      questions.push({
        bookId: adminQBankBook,
        questionText,
        type,
        chapter,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        category
      });
    }
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let questionsToImport: Omit<Question, 'id'>[] = [];
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          showToast("JSON format must be a list of questions.", "error");
          return;
        }
        for (const item of parsed) {
          if (!item.questionText) {
            showToast("Each question must contain 'questionText'.", "error");
            return;
          }
          questionsToImport.push({
            bookId: adminQBankBook,
            questionText: item.questionText,
            type: item.type === "written" ? "written" : "mcq",
            chapter: parseInt(item.chapter) || 1,
            optionA: item.optionA || "",
            optionB: item.optionB || "",
            optionC: item.optionC || "",
            optionD: item.optionD || "",
            correctOption: (item.correctOption || "A") as "A" | "B" | "C" | "D",
            category: item.category === "quiz" ? "quiz" : "practice"
          });
        }
      } else if (fileNameLower.endsWith(".csv")) {
        const text = await file.text();
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          showToast("CSV file is empty.", "error");
          return;
        }

        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const typeIdx = headers.indexOf("type");
        const chapterIdx = headers.indexOf("chapter");
        const textIdx = headers.indexOf("questionText");
        const optAIdx = headers.indexOf("optionA");
        const optBIdx = headers.indexOf("optionB");
        const optCIdx = headers.indexOf("optionC");
        const optDIdx = headers.indexOf("optionD");
        const correctIdx = headers.indexOf("correctOption");
        const catIdx = headers.indexOf("category");

        if (textIdx === -1) {
          showToast("CSV must contain a 'questionText' column.", "error");
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cells = parseCSVLine(line);
          if (cells.length < headers.length) continue;

          const qText = cells[textIdx];
          if (!qText) continue;

          questionsToImport.push({
            bookId: adminQBankBook,
            questionText: qText,
            type: (cells[typeIdx]?.toLowerCase() === "written") ? "written" : "mcq",
            chapter: parseInt(cells[chapterIdx]) || 1,
            optionA: cells[optAIdx] || "",
            optionB: cells[optBIdx] || "",
            optionC: cells[optCIdx] || "",
            optionD: cells[optDIdx] || "",
            correctOption: (cells[correctIdx] || "A") as "A" | "B" | "C" | "D",
            category: (cells[catIdx]?.toLowerCase() === "quiz") ? "quiz" : "practice"
          });
        }
      } else if (fileNameLower.endsWith(".pdf")) {
        const text = await extractTextFromPDF(file);
        questionsToImport = parseQuestionsFromPlainText(text);
      } else if (fileNameLower.endsWith(".docx") || fileNameLower.endsWith(".doc")) {
        const text = await extractTextFromDOCX(file);
        questionsToImport = parseQuestionsFromPlainText(text);
      } else if (fileNameLower.endsWith(".txt")) {
        const text = await file.text();
        questionsToImport = parseQuestionsFromPlainText(text);
      } else {
        showToast("Unsupported file format. Please upload PDF, Word, CSV, JSON, or TXT.", "error");
        return;
      }

      if (questionsToImport.length === 0) {
        showToast("No valid questions found to import.", "warning");
        return;
      }

      questionsToImport.forEach(q => addQuestionToBank(q));
      setAdminQuestions(getQuestionsByBook(adminQBankBook));
      showToast(`Successfully imported ${questionsToImport.length} questions to Book ${adminQBankBook}!`, "success");
      if (e.target) {
        e.target.value = "";
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to parse file. Please verify file integrity and try again.", "error");
    }
  };

  const handleGenerateAccessId = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const collegeParam = genIdCollege || undefined;

    if (genIdCount > 1) {
      const codes = generateAccessIdsBulk(genIdBook, genIdRole, genIdCount, collegeParam);
      setAdminAccessIds(getAllAccessIds());
      setSuccessMessage(`Successfully generated ${genIdCount} Access IDs: ${codes.join(", ")}`);
      setGenIdCount(1);
    } else {
      const code = generateAccessId(genIdBook, genIdRole, collegeParam);
      setAdminAccessIds(getAllAccessIds());
      setSuccessMessage(`Access ID generated successfully: ${code}`);
      setGenIdCount(1);
    }
  };

  const handleAddTextbook = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newBookId.trim() || !newBookTitle.trim() || !newBookCode.trim()) {
      setErrorMessage("Please fill out all textbook fields.");
      return;
    }

    if (newBookCode.trim().length !== 2) {
      setErrorMessage("Prefix code must be exactly 2 letters.");
      return;
    }

    const res = addTextbook({
      id: newBookId.trim(),
      title: newBookTitle.trim(),
      code: newBookCode.trim().toUpperCase()
    });

    if (!res.success) {
      setErrorMessage(res.error || "Failed to add textbook.");
      return;
    }

    // Refresh textbooks list
    const updatedList = getAllTextbooks();
    setTextbooks(updatedList);

    setSuccessMessage(`Textbook "${newBookTitle.trim()}" added successfully!`);
    setNewBookId("");
    setNewBookTitle("");
    setNewBookCode("");
  };

  const handleDeleteTextbook = (bookId: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    const targetBook = textbooks.find(b => b.id === bookId);
    if (!targetBook) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Textbook",
      message: `WARNING: Deleting "${targetBook.title}" will also permanently delete all practice questions, Access IDs, quizzes, and student attempts mapped to this book. This action cannot be undone.`,
      confirmText: "Yes, Delete Permanently",
      cancelText: "Cancel",
      isDanger: true,
      onConfirm: () => {
        deleteTextbook(bookId);

        // Refresh state
        const updatedTextbooks = getAllTextbooks();
        setTextbooks(updatedTextbooks);
        
        // Reset/update related dependent admin states if they were viewing this book
        if (adminQBankBook === bookId) {
          const defaultId = updatedTextbooks[0]?.id || "1";
          setAdminQBankBook(defaultId);
          setAdminQuestions(getQuestionsByBook(defaultId));
        } else {
          setAdminQuestions(getQuestionsByBook(adminQBankBook));
        }

        if (configBookId === bookId) {
          const defaultId = updatedTextbooks[0]?.id || "1";
          setConfigBookId(defaultId);
        }

        if (genIdBook === bookId) {
          const defaultId = updatedTextbooks[0]?.id || "1";
          setGenIdBook(defaultId);
        }

        setAdminAccessIds(getAllAccessIds());
        showToast(`Textbook "${targetBook.title}" and related data have been removed.`, "success");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- FACULTY ACTIONS ---
  // Add manual question to building list
  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuizQuestions.length >= newQuizQuestionsLimit) {
      showToast(`Limit reached. You can only add up to ${newQuizQuestionsLimit} questions.`, 'warning');
      return;
    }
    const { questionText, maxMarks, chapter, optionA, optionB, optionC, optionD, correctOption } = manualQuestion;
    
    // Default manual question chapter to first selected chapter if not in newQuizChapters
    const actualChapter = newQuizChapters.includes(chapter) ? chapter : (newQuizChapters[0] || 1);

    if (newQuizType === 'written') {
      if (!questionText) {
        showToast("Please enter the question text.", 'warning');
        return;
      }
      setNewQuizQuestions([
        ...newQuizQuestions,
        { questionText, maxMarks, chapter: actualChapter }
      ]);
    } else {
      if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        showToast("Please fill out all question fields.", 'warning');
        return;
      }
      setNewQuizQuestions([...newQuizQuestions, { ...manualQuestion, chapter: actualChapter }]);
    }

    setManualQuestion({
      questionText: "",
      maxMarks: 5,
      chapter: newQuizChapters[0] || 1,
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A" as "A" | "B" | "C" | "D"
    });
  };

  // Open import modal
  const handleOpenImportModal = () => {
    const bank = getQuestionsByBook(newQuizBookId);
    // Filter questions: MCQ quiz shows only bank questions with type 'mcq' or undefined, Written Test shows only type 'written'
    // Also filter by selected chapters: q.chapter must be in newQuizChapters
    const filteredBank = bank.filter(q => {
      const qType = q.type || 'mcq';
      const qChapter = q.chapter || 1;
      const typeMatches = qType === newQuizType;
      const chapterMatches = newQuizChapters.includes(qChapter);
      const categoryMatches = true; // Allow importing all types of questions from the bank
      return typeMatches && chapterMatches && categoryMatches;
    });
    setImportQBankQuestions(filteredBank);
    setSelectedImportIds([]);
    setIsImportModalOpen(true);
  };

  // Toggle question selection in import modal
  const handleToggleImportSelect = (id: string) => {
    if (selectedImportIds.includes(id)) {
      setSelectedImportIds(selectedImportIds.filter(x => x !== id));
    } else {
      setSelectedImportIds([...selectedImportIds, id]);
    }
  };

  // Confirm import from bank
  const handleConfirmImport = () => {
    const selected = importQBankQuestions.filter(q => selectedImportIds.includes(q.id));
    const formatted = selected.map(q => {
      if (newQuizType === 'written') {
        return {
          questionText: q.questionText,
          chapter: q.chapter || 1,
          maxMarks: 5
        };
      } else {
        return {
          questionText: q.questionText,
          chapter: q.chapter || 1,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption
        };
      }
    });

    setNewQuizQuestions([...newQuizQuestions, ...formatted]);
    setIsImportModalOpen(false);
  };

  // Remove question from building list
  const handleRemoveBuildingQuestion = (index: number) => {
    setNewQuizQuestions(newQuizQuestions.filter((_, idx) => idx !== index));
  };

  // Publish faculty quiz
  const handlePublishQuiz = () => {
    setErrorMessage("");
    if (!newQuizTitle) {
      setErrorMessage("Please enter a Quiz Title.");
      return;
    }
    if (newQuizQuestions.length !== newQuizQuestionsLimit) {
      setErrorMessage(`Please add exactly ${newQuizQuestionsLimit} questions as specified in the Questions Count.`);
      return;
    }
    if (!newQuizStartTime || !newQuizEndTime) {
      setErrorMessage("Please specify both Start Time and End Time for the quiz.");
      return;
    }
    if (new Date(newQuizEndTime) <= new Date(newQuizStartTime)) {
      setErrorMessage("Quiz End Time must be after the Start Time.");
      return;
    }

    // Generate unique code: LRN-XXXX
    const codeSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const quizCode = `LRN-${codeSuffix}`;

    const newQuiz: TextbookQuiz = {
      quizCode,
      title: newQuizTitle,
      bookId: newQuizBookId,
      createdBy: user!.mobileNumber,
      type: newQuizType,
      duration: newQuizDuration,
      questions: newQuizQuestions,
      chapters: newQuizChapters,
      createdAt: new Date().toISOString(),
      startTime: new Date(newQuizStartTime).toISOString(),
      endTime: new Date(newQuizEndTime).toISOString()
    };

    const res = createQuiz(newQuiz);
    if (!res.success) {
      setErrorMessage(res.error || "Failed to publish quiz.");
      return;
    }

    // Identify only this teacher's assigned students for notifications
    const allUsers = getAllUsers();
    const assignedStudents = allUsers.filter(
      u => u.role === 'student' && u.teachingFacultyAccessId?.toUpperCase() === (user?.accessId || "").toUpperCase()
    );

    // Trigger email notifications to all assigned students
    if (assignedStudents.length > 0) {
      fetch("/api/textbooks/quiz/notify-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizCode,
          quizTitle: newQuizTitle,
          teacherName: user!.name,
          startTime: newQuizStartTime,
          endTime: newQuizEndTime,
          students: assignedStudents.map(s => ({
            name: s.name,
            email: s.collegeEmail || ""
          }))
        })
      }).catch(err => console.error("[Quiz Notification] Failed to send student email alerts:", err));
    }

    const studentInfo = assignedStudents.map(s => {
      const email = s.collegeEmail || "(no email)";
      const formattedTime = `${new Date(newQuizStartTime).toLocaleString()} to ${new Date(newQuizEndTime).toLocaleString()}`;
      return `${s.name} (${email}) - Email Notification Triggered.`;
    });
    setNotifiedStudents(studentInfo);

    setPublishedQuizCode(quizCode);
    setFacultyQuizzes(getQuizzesByCreator(user!.mobileNumber));
    // Clear form
    setNewQuizTitle("");
    setNewQuizQuestions([]);
    setNewQuizDuration(0);
    setNewQuizQuestionsLimit(5);
    setNewQuizType("mcq");
    setNewQuizChapters([1]);
    setNewQuizStartTime("");
    setNewQuizEndTime("");
  };

  // Select quiz to view student scores
  const handleViewQuizAttempts = (quiz: TextbookQuiz) => {
    setSelectedFacultyQuiz(quiz);
    setSelectedQuizAttempts(getAttemptsForQuiz(quiz.quizCode));
  };

  // --- INSTRUCTOR PROFILE ACTIONS ---
  // Handle profile image upload
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("File is too large. Limit is 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const success = updateUser(user!.mobileNumber, { profilePicture: base64Data });
      if (success) {
        const updatedUser = { ...user!, profilePicture: base64Data };
        setUser(updatedUser);
        sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updatedUser));
        showToast("Profile photo updated successfully!", "success");
      } else {
        showToast("Failed to upload photo. Please try again.", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle delete profile image
  const handleDeleteProfileImage = () => {
    const success = updateUser(user!.mobileNumber, { profilePicture: "" });
    if (success) {
      const updatedUser = { ...user! };
      delete updatedUser.profilePicture;
      setUser(updatedUser);
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updatedUser));
      showToast("Profile photo removed successfully!", "success");
    } else {
      showToast("Failed to delete photo. Please try again.", "error");
    }
  };

  // Handle initiate profile details update
  const handleInitiateProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { name, collegeName, facultyId, facultyRole, subjectTeaching, collegeEmail } = profileForm;

    if (!name || !collegeName || !facultyId || !facultyRole || !subjectTeaching || !collegeEmail) {
      showToast("Please fill in all profile fields.", "warning");
      return;
    }

    if (collegeEmail && !isCollegeEmail(collegeEmail)) {
      showToast("Please enter a valid college email ID. Generic emails are not allowed.", "error");
      return;
    }

    // Check if anything actually changed
    const isUnchanged = 
      name === user!.name &&
      collegeName === user!.collegeName &&
      facultyId === user!.facultyId &&
      facultyRole === user!.facultyRole &&
      subjectTeaching === user!.subjectTeaching &&
      collegeEmail === user!.collegeEmail;

    if (isUnchanged) {
      setIsEditingProfile(false);
      showToast("Instructor profile details remain unchanged.", "warning");
      return;
    }

    try {
      const res = await fetch("/api/textbooks/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: user!.accessId, target: collegeEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to send verification code.", "error");
        return;
      }

      setPendingProfileUpdates({ name, collegeName, facultyId, facultyRole, subjectTeaching, collegeEmail });
      setProfileOtpInput("");
      setProfileOtpSent(true);
      showToast(`Verification code sent successfully to your college email address.`, "success");
    } catch (err) {
      showToast("Network error: Failed to request verification code.", "error");
    }
  };

  // Handle verify details update
  const handleVerifyProfileUpdate = async () => {
    if (!pendingProfileUpdates) return;

    try {
      const res = await fetch("/api/textbooks/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          accessId: user!.accessId, 
          target: pendingProfileUpdates.collegeEmail, 
          code: profileOtpInput 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Verification failed.", "error");
        return;
      }

      const success = updateUser(user!.mobileNumber, pendingProfileUpdates);
      if (success) {
        const updatedUser = { ...user!, ...pendingProfileUpdates };
        setUser(updatedUser);
        sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updatedUser));
        
        setIsEditingProfile(false);
        setProfileOtpSent(false);
        setProfileOtpInput("");
        setProfileGeneratedOtp("");
        setPendingProfileUpdates(null);
        showToast("Instructor profile details verified and updated successfully!", "success");
      } else {
        showToast("Failed to update profile. Please try again.", "error");
      }
    } catch (err) {
      showToast("Network error: Verification failed.", "error");
    }
  };

  const handleStudentNameUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfileName.trim()) {
      showToast("Name cannot be empty.", "warning");
      return;
    }
    
    // Validate faculty assignment changes if any
    let targetFaculty = user!.teachingFacultyAccessId || "";
    if (studentTeachingFacultyEdit !== (user!.teachingFacultyAccessId || "")) {
      // Check if user already had a faculty assigned (limit editing to once / only set once)
      if (user!.teachingFacultyAccessId) {
        showToast("Access Denied: You can only edit or select your teaching faculty once inside the portal.", "error");
        return;
      }

      const input = studentTeachingFacultyEdit.trim();
      if (input) {
        const allUsers = getAllUsers();
        const matchedFaculty = allUsers.find(
          u => u.role === "faculty" && 
          ((u.accessId?.toUpperCase() || "") === input.toUpperCase() || 
           u.mobileNumber === input || 
           u.collegeEmail?.toLowerCase() === input.toLowerCase())
        );

        if (matchedFaculty) {
          if (matchedFaculty.bookId !== user!.bookId) {
            showToast(`Access Denied: The selected faculty teaches a different textbook than yours. Both must be assigned to the same book code prefix.`, "error");
            return;
          }
          targetFaculty = matchedFaculty.accessId || "";
        } else {
          const allowedIds = getAllAccessIds();
          const preApprovedFaculty = allowedIds.find(
            item => item.role === "faculty" && item.accessId.toUpperCase() === input.toUpperCase()
          );
          if (preApprovedFaculty) {
            if (preApprovedFaculty.bookId !== user!.bookId) {
              showToast(`Access Denied: The selected faculty teaches a different textbook.`, "error");
              return;
            }
            targetFaculty = preApprovedFaculty.accessId;
          } else {
            showToast("Teaching Faculty not found. Please enter a valid pre-approved Faculty Access ID or registered Faculty details.", "error");
            return;
          }
        }
      }
    }

    if (studentProfileName.trim() === user!.name && targetFaculty === (user!.teachingFacultyAccessId || "")) {
      setIsEditingStudentProfile(false);
      return;
    }
    
    const cleanedMobile = studentProfileMobile.trim();
    const updatedFields: Partial<TextbookUser> = { 
      name: studentProfileName.trim(),
      teachingFacultyAccessId: targetFaculty 
    };

    if (cleanedMobile && !cleanedMobile.includes("@")) {
      updatedFields.mobileNumber = cleanedMobile;
    }

    const success = updateUser(user!.mobileNumber, updatedFields);
    if (success) {
      const updatedUser = { ...user!, ...updatedFields };
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingStudentProfile(false);
      showToast("Profile details updated successfully!", "success");
    } else {
      showToast("Failed to update profile details.", "error");
    }
  };

  const handleUpgradePlan = async (targetPlan: string, cost: number) => {
    if (!user) return;
    setIsUpgrading(true);
    
    const planLabel = ALL_PLANS.find(p => p.key === targetPlan)?.label || "Complete Portal Access";

    const gstVal = Math.round(cost * 0.18);
    const onlineFeeVal = Math.round((cost + gstVal) * 0.02);
    const totalCost = cost + gstVal + onlineFeeVal;

    try {
      const res = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: user.bookId || "1",
          bookTitle: `Plan Upgrade to ${planLabel}`,
          price: totalCost,
          subtotal: cost,
          gstAmount: gstVal,
          shippingAmount: 0,
          customerName: user.name,
          customerEmail: user.collegeEmail || `${user.mobileNumber}@lurnexa.in`,
          customerPhone: user.mobileNumber,
          shippingAddress: "Soft Copy Access",
          postalCode: "000000",
          format: "upgrade",
          plan: targetPlan,
          collegeCode: "others",
          accessId: user.accessId
        })
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = "Failed to initialize payment.";
        try {
          const errData = JSON.parse(text);
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        showToast(errorMsg, "error");
        setIsUpgrading(false);
        return;
      }

      const orderData = await res.json();

      if (!(window as any).Cashfree) {
        showToast("Cashfree Payment SDK failed to load. Please refresh the page.", "error");
        setIsUpgrading(false);
        return;
      }

      const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
      const cashfree = (window as any).Cashfree({
        mode: isProduction ? "production" : "sandbox"
      });

      cashfree.checkout({
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      console.error(err);
      showToast("Checkout connection failed. Please check your network connection.", "error");
      setIsUpgrading(false);
    }
  };

  const handleInitiateAdminProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { name, accessId, mobileNumber, email } = adminProfileEdit;
    if (!name || !accessId || !mobileNumber || !email) {
      showToast("Please fill in all admin profile fields.", "warning");
      return;
    }

    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    if (cleanedMobile.length !== 10) {
      showToast("Mobile number must be exactly 10 digits.", "error");
      return;
    }

    if (!email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    try {
      const res = await fetch("/api/textbooks/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: adminProfileEdit.accessId, target: email }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to send verification code.", "error");
        return;
      }

      setProfileOtpInput("");
      setProfileOtpSent(true);
      showToast(`Verification code sent successfully to your registered email address.`, "success");
    } catch (err) {
      showToast("Network error: Failed to request verification code.", "error");
    }
  };

  const handleVerifyAdminProfileUpdate = async () => {
    try {
      const res = await fetch("/api/textbooks/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          accessId: adminProfileEdit.accessId, 
          target: adminProfileEdit.email, 
          code: profileOtpInput 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Verification failed.", "error");
        return;
      }

      const updatedUser = {
        ...user!,
        name: adminProfileEdit.name,
        accessId: adminProfileEdit.accessId,
        mobileNumber: adminProfileEdit.mobileNumber,
        collegeEmail: adminProfileEdit.email
      };

      // Update the admin user record in the simulated database
      updateUser(user!.mobileNumber, {
        name: adminProfileEdit.name,
        accessId: adminProfileEdit.accessId,
        mobileNumber: adminProfileEdit.mobileNumber,
        collegeEmail: adminProfileEdit.email
      });

      setStorageItem("lurnexa_admin_custom_profile", {
        name: adminProfileEdit.name,
        accessId: adminProfileEdit.accessId,
        mobileNumber: adminProfileEdit.mobileNumber,
        email: adminProfileEdit.email
      });

      setUser(updatedUser);
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updatedUser));

      setIsEditingProfile(false);
      setProfileOtpSent(false);
      setProfileOtpInput("");
      setProfileGeneratedOtp("");
      showToast("Admin profile details updated successfully!", "success");
    } catch (err) {
      showToast("Network error: Verification failed.", "error");
    }
  };


  // --- STUDENT ACTIONS ---
  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setActiveStudentQuiz(null);
    setStudentQuizResult(null);

    if (!studentQuizCode) {
      setErrorMessage("Please enter a quiz code.");
      return;
    }

    const quiz = getQuizByCode(studentQuizCode);
    if (!quiz) {
      setErrorMessage("Quiz code not found. Please verify the code and try again.");
      return;
    }

    // Validation: Enforce that the student can only attempt quizzes designed for their book!
    if (quiz.bookId !== user!.bookId) {
      setErrorMessage(`Access Denied: This quiz is created for a different textbook than the one assigned to your Access ID.`);
      return;
    }

    // Validation: Enforce that the student is assigned to the faculty who created this quiz!
    const creatorFaculty = getAllUsers().find(
      u => u.role === "faculty" && u.mobileNumber === quiz.createdBy
    );
    if (!creatorFaculty || user!.teachingFacultyAccessId?.toUpperCase() !== (creatorFaculty.accessId || "").toUpperCase()) {
      setErrorMessage(`Access Denied: You are not assigned to the faculty who created this quiz (${creatorFaculty?.name || 'Unknown Faculty'}). Only their assigned students can join.`);
      return;
    }

    // Validation: Enforce active start/end time window
    const now = new Date();
    if (quiz.startTime && now < new Date(quiz.startTime)) {
      setErrorMessage("Access Denied: still time is there for quizz");
      return;
    }
    if (quiz.endTime && now > new Date(quiz.endTime)) {
      setErrorMessage("Access Denied: the quizz is completed");
      return;
    }

    const quizCopy = JSON.parse(JSON.stringify(quiz)) as TextbookQuiz;
    const pairedQuestions = quizCopy.questions.map((q, idx) => ({ q, originalIndex: idx }));
    const shuffledPairs = shuffleArray(pairedQuestions);

    const mapping: { originalIndex: number; optionMapping: Record<string, string> }[] = [];

    const randomizedQuestions = shuffledPairs.map((pair) => {
      const q = pair.q;
      const isWritten = quizCopy.type === 'written';

      if (isWritten) {
        mapping.push({
          originalIndex: pair.originalIndex,
          optionMapping: {}
        });
        return q;
      }

      const optionKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      const originalOptionsList = [
        { key: 'A', text: q.optionA || "" },
        { key: 'B', text: q.optionB || "" },
        { key: 'C', text: q.optionC || "" },
        { key: 'D', text: q.optionD || "" }
      ];

      const shuffledOptionsList = shuffleArray(originalOptionsList);

      q.optionA = shuffledOptionsList[0].text;
      q.optionB = shuffledOptionsList[1].text;
      q.optionC = shuffledOptionsList[2].text;
      q.optionD = shuffledOptionsList[3].text;

      const origCorrectKey = q.correctOption || 'A';
      const newCorrectIndex = shuffledOptionsList.findIndex(opt => opt.key === origCorrectKey);
      q.correctOption = optionKeys[newCorrectIndex] || 'A';

      const optionMapping: Record<string, string> = {};
      shuffledOptionsList.forEach((opt, idx) => {
        optionMapping[optionKeys[idx]] = opt.key;
      });

      mapping.push({
        originalIndex: pair.originalIndex,
        optionMapping
      });

      return q;
    });

    quizCopy.questions = randomizedQuestions;
    quizQuestionMappingRef.current = mapping;

    setActiveStudentQuiz(quizCopy);
    setStudentCurrentQuestionIndex(0);
    setStudentAnswers(new Array(quizCopy.questions.length).fill(""));
    if (quiz.duration > 0) {
      setTimeRemaining(quiz.duration * 60);
    } else {
      setTimeRemaining(0);
    }
    setTabSwitchCount(0);
    requestFullScreen();
  };

  // Answer selection
  const handleSelectStudentAnswer = (option: string) => {
    const updated = [...studentAnswers];
    updated[studentCurrentQuestionIndex] = option;
    setStudentAnswers(updated);
  };

  // Student Quiz Submission
  const handleSubmitStudentQuiz = () => {
    if (!activeStudentQuiz) return;
    exitFullScreen();

    const isWritten = activeStudentQuiz.type === 'written';
    const originalOrderedAnswers = new Array(activeStudentQuiz.questions.length).fill("");

    studentAnswers.forEach((ans, idx) => {
      const mapItem = quizQuestionMappingRef.current[idx];
      if (mapItem) {
        const origIdx = mapItem.originalIndex;
        if (isWritten) {
          originalOrderedAnswers[origIdx] = ans;
        } else {
          const originalAns = mapItem.optionMapping[ans] || ans;
          originalOrderedAnswers[origIdx] = originalAns;
        }
      }
    });

    let score = 0;
    if (!isWritten) {
      const dbQuiz = getQuizByCode(activeStudentQuiz.quizCode);
      if (dbQuiz) {
        dbQuiz.questions.forEach((q, idx) => {
          if (originalOrderedAnswers[idx] === q.correctOption) {
            score++;
          }
        });
      } else {
        activeStudentQuiz.questions.forEach((q, idx) => {
          if (studentAnswers[idx] === q.correctOption) {
            score++;
          }
        });
      }
    }

    const attempt = submitAttempt({
      quizCode: activeStudentQuiz.quizCode,
      studentMobile: user!.mobileNumber,
      studentName: user!.name,
      answers: originalOrderedAnswers,
      score: isWritten ? 0 : score,
      totalQuestions: activeStudentQuiz.questions.length,
      type: activeStudentQuiz.type,
      status: isWritten ? 'pending' : 'graded'
    });

    setStudentQuizResult(attempt);
    setActiveStudentQuiz(null);
  };

  // Student Practice Actions
  const handleSelectPracticeAnswer = (option: string) => {
    const updated = [...practiceAnswers];
    updated[practiceCurrentIndex] = option;
    setPracticeAnswers(updated);
  };

  const handleSubmitPractice = () => {
    exitFullScreen();
    let score = 0;
    practiceQuestions.forEach((q, idx) => {
      if (practiceAnswers[idx] === q.correctOption) {
        score++;
      }
    });

    const originalOrderedAnswers = new Array(practiceQuestions.length).fill("");
    practiceAnswers.forEach((ans, idx) => {
      const mapItem = practiceQuestionMappingRef.current[idx];
      if (mapItem) {
        const origIdx = mapItem.originalIndex;
        const originalAns = mapItem.optionMapping[ans] || ans;
        originalOrderedAnswers[origIdx] = originalAns;
      } else {
        originalOrderedAnswers[idx] = ans;
      }
    });

    const newAttempt: PracticeAttempt = {
      id: `prac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentMobile: user!.mobileNumber,
      bookId: user!.bookId,
      practiceTestId: activePracticeTest?.id || "",
      answers: originalOrderedAnswers,
      score: score,
      totalQuestions: practiceQuestions.length,
      completedAt: new Date().toISOString()
    };
    savePracticeAttempt(newAttempt);

    setPracticeResultScore(score);
    setPracticeStarted(false);
    setSelectedPastAttempt(null);
    setPastPracticeAttempts(getPracticeAttempts(user!.mobileNumber, user!.bookId));
  };

  // Sync submission functions with their refs to avoid temporal dead zone warnings
  useEffect(() => {
    handleSubmitStudentQuizRef.current = handleSubmitStudentQuiz;
    handleSubmitPracticeRef.current = handleSubmitPractice;
  }, [handleSubmitStudentQuiz, handleSubmitPractice]);

  // Practice Timer Countdown Effect
  useEffect(() => {
    if (!practiceStarted || practiceTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setPracticeTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [practiceStarted, practiceTimeRemaining]);

  // Auto-submit practice when time runs out
  useEffect(() => {
    if (practiceStarted && practiceTimeRemaining === 0) {
      handleSubmitPractice();
    }
  }, [practiceTimeRemaining, practiceStarted]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeStudentQuiz || activeStudentQuiz.duration <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeStudentQuiz]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (activeStudentQuiz && activeStudentQuiz.duration > 0 && timeRemaining === 0) {
      handleSubmitStudentQuiz();
    }
  }, [timeRemaining, activeStudentQuiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Load student question scores when manual grading begins
  useEffect(() => {
    if (gradingAttempt) {
      const quiz = getQuizByCode(gradingAttempt.quizCode);
      if (quiz) {
        const initialScores = quiz.questions.map((q, idx) => {
          return gradingAttempt.questionScores?.[idx] ?? 0;
        });
        setGradingQuestionScores(initialScores);
      }
    } else {
      setGradingQuestionScores([]);
    }
  }, [gradingAttempt]);

  const handleGradeSubmission = (attemptId: string) => {
    if (!gradingAttempt) return;
    const totalScore = gradingQuestionScores.reduce((a, b) => a + b, 0);
    const quiz = getQuizByCode(gradingAttempt.quizCode);
    const totalMaxMarks = quiz 
      ? quiz.questions.reduce((acc, q) => acc + (q.maxMarks || 5), 0)
      : gradingAttempt.totalQuestions * 5;

    if (totalScore < 0 || totalScore > totalMaxMarks) {
      showToast(`Invalid total score. Must be between 0 and ${totalMaxMarks}.`, 'error');
      return;
    }

    const success = gradeAttempt(attemptId, totalScore, gradingQuestionScores);
    if (success) {
      setSuccessMessage("Attempt graded successfully!");
      if (selectedFacultyQuiz) {
        setSelectedQuizAttempts(getAttemptsForQuiz(selectedFacultyQuiz.quizCode));
      }
      setGradingAttempt(null);
      setGradingScore("");
      setGradingQuestionScores([]);
    } else {
      setErrorMessage("Failed to submit grades. Please try again.");
    }
  };

  if (!mounted) {
    return (
      <div className={inter.className}>
        {!appMode && <NavigationPage />}
        <div className={`min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 ${appMode ? "" : "pt-24"}`}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-bold">Initializing Portal...</p>
          </div>
        </div>
        {!appMode && <FooterSection />}
      </div>
    );
  }

  const isExamActive = !!activeStudentQuiz || (practiceStarted && !!activePracticeTest);

  if (mounted && isExamActive) {
    const title = activeStudentQuiz ? activeStudentQuiz.title : activePracticeTest?.title || "Practice Test";
    const totalQ = activeStudentQuiz ? activeStudentQuiz.questions.length : practiceQuestions.length;
    
    const attemptedQ = activeStudentQuiz 
      ? studentAnswers.filter(ans => ans && ans.trim() !== "").length
      : practiceAnswers.filter(ans => ans && ans.trim() !== "").length;
      
    const remainingQ = totalQ - attemptedQ;
    const isQuiz = !!activeStudentQuiz;
    const curIdx = isQuiz ? studentCurrentQuestionIndex : practiceCurrentIndex;
    const currentQ = isQuiz ? activeStudentQuiz.questions[curIdx] : practiceQuestions[curIdx];
    const answersList = isQuiz ? studentAnswers : practiceAnswers;
    const timeVal = isQuiz ? timeRemaining : practiceTimeRemaining;
    const hasDuration = isQuiz ? activeStudentQuiz.duration > 0 : (activePracticeTest?.duration || 0) > 0;

    return (
      <div className={`${inter.className} min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-6 select-none`}>
        {/* Header containing Exam Name, Timer, and Question Stats */}
        <header className="max-w-4xl mx-auto w-full border-b border-slate-200 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
            <span className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-widest">
              {isQuiz ? "Official Quiz Assessment" : "Scheduled Practice Test"}
            </span>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {/* Questions Stats */}
            <div className="flex gap-4 text-xs font-semibold">
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                Attempted: <span className="font-bold text-green-600">{attemptedQ}</span>
              </div>
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                Remaining: <span className="font-bold text-amber-600">{remainingQ}</span>
              </div>
            </div>

            {hasDuration && timeVal > 0 && (
              <div className="bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100 px-3.5 py-1.5 rounded-xl flex items-center gap-2 font-mono font-black text-sm shadow-sm animate-pulse">
                <Clock size={16} />
                <span>Time Left: {formatTime(timeVal)}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Body */}
        <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center max-w-3xl">
          {/* Question Text */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 font-bold text-slate-900 text-lg md:text-xl leading-relaxed mb-6 shadow-sm">
            <div className="text-xs text-fuchsia-600 font-bold uppercase tracking-widest mb-3">
              Question {curIdx + 1} of {totalQ}
            </div>
            {currentQ.questionText}
          </div>

          {/* Question Answer Panel */}
          {isQuiz && activeStudentQuiz?.type === 'written' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Your Written Response
              </label>
              <textarea
                placeholder="Type your detailed answer here..."
                value={answersList[curIdx] || ""}
                onChange={(e) => {
                  const updated = [...studentAnswers];
                  updated[curIdx] = e.target.value;
                  setStudentAnswers(updated);
                }}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl p-5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all shadow-sm focus:ring-1 focus:ring-fuchsia-500 animate-fadeIn"
                rows={10}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {[
                { key: "A", text: currentQ.optionA },
                { key: "B", text: currentQ.optionB },
                { key: "C", text: currentQ.optionC },
                { key: "D", text: currentQ.optionD }
              ].map(opt => {
                const isSelected = answersList[curIdx] === opt.key;

                let btnClasses = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm";
                let spanClasses = "bg-slate-100 text-slate-500";

                if (isSelected) {
                  btnClasses = "bg-fuchsia-50 border-fuchsia-500 text-fuchsia-700 shadow-sm font-bold";
                  spanClasses = "bg-fuchsia-600 text-white";
                }

                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (isQuiz) {
                        handleSelectStudentAnswer(opt.key);
                      } else {
                        handleSelectPracticeAnswer(opt.key);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left font-semibold transition-all duration-200 flex items-center gap-4 ${btnClasses}`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${spanClasses}`}>
                      {opt.key}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer Navigation Controls */}
        <footer className="max-w-4xl mx-auto w-full border-t border-slate-200 pt-6 mt-8 flex justify-between items-center">
          <button
            onClick={() => {
              if (isQuiz) {
                setStudentCurrentQuestionIndex(curIdx - 1);
              } else {
                setPracticeCurrentIndex(curIdx - 1);
              }
            }}
            disabled={curIdx === 0}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-20 disabled:pointer-events-none transition-all"
          >
            Previous Question
          </button>

          {curIdx < totalQ - 1 ? (
            <button
              onClick={() => {
                if (isQuiz) {
                  setStudentCurrentQuestionIndex(curIdx + 1);
                } else {
                  setPracticeCurrentIndex(curIdx + 1);
                }
              }}
              disabled={isQuiz && activeStudentQuiz?.type === 'written' ? !answersList[curIdx]?.trim() : !answersList[curIdx]}
              className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={() => {
                if (isQuiz) {
                  handleSubmitStudentQuiz();
                } else {
                  handleSubmitPractice();
                }
              }}
              disabled={answersList.some(ans => !ans || (isQuiz && activeStudentQuiz?.type === 'written' && !ans.trim()))}
              className="px-7 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-40"
            >
              {isQuiz ? "Submit Quiz" : "Complete Practice"}
            </button>
          )}
        </footer>

        {/* Toast popup in focus mode */}
        {activeToast && (
          <div className="fixed top-6 right-6 z-50 animate-scaleIn max-w-sm w-full bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3.5">
            <div className={`p-2 rounded-xl shrink-0 ${
              activeToast.type === 'success' 
                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                : activeToast.type === 'error'
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20'
            }`}>
              {activeToast.type === 'success' ? (
                <CheckCircle2 size={20} />
              ) : activeToast.type === 'error' ? (
                <AlertCircle size={20} />
              ) : (
                <Info size={20} />
              )}
            </div>
            <div className="flex-1 space-y-0.5 pt-0.5">
              <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                {activeToast.type === 'success' ? 'Success' : activeToast.type === 'error' ? 'Alert Error' : 'System Notice'}
              </h5>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{activeToast.message}</p>
            </div>
            <button 
              onClick={() => setActiveToast(null)} 
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={inter.className}>
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-hide {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />
      {!appMode && <NavigationPage />}

      <main className={`min-h-screen bg-slate-50 text-slate-800 pb-16 px-4 md:px-8 ${appMode ? "pt-6" : "pt-28"}`}>
        <div className="max-w-7xl mx-auto">

          {/* Install-to-home-screen banner — app mode only, hidden once already installed */}
          {appMode && !isStandalone && (deferredInstallPrompt || isIOS) && (
            <div className="mb-6 bg-slate-950 text-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Download size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Install Lurnexa Textbooks</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {isIOS ? "Tap Share, then \"Add to Home Screen\"" : "Add it to your home screen for one-tap access"}
                  </p>
                </div>
              </div>
              {deferredInstallPrompt ? (
                <button
                  onClick={handleInstallApp}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0"
                >
                  Install
                </button>
              ) : (
                <button
                  onClick={() => setIsIOS(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* Header section (Logged-in view) */}
          {user && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-8 mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 text-fuchsia-600 font-bold mb-2">
                  <BookOpen size={18} />
                  <span>Academic Bookstore & Digital Library</span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  Reader Portal
                </h1>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

                <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-lg">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-fuchsia-600/20 text-fuchsia-500 font-black shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 capitalize">
                      {user.role === "admin" && <Shield size={12} className="text-red-400" />}
                      {user.role === "faculty" && <BookOpenCheck size={12} className="text-blue-400" />}
                      {user.role === "student" && <Users size={12} className="text-green-400" />}
                      {user.role === "student" ? "Reader Portal" : `${user.role} Portal`}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-4 p-2 bg-slate-100 hover:bg-red-950/40 text-slate-600 hover:text-red-400 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-4 rounded-2xl mb-6 flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5 text-red-400" />
              <div>{errorMessage}</div>
            </div>
          )}
          {successMessage && !errorMessage && (
            <div className="bg-green-950/40 border border-green-500/30 text-green-300 p-4 rounded-2xl mb-6 flex items-start gap-3">
              <CheckCircle2 className="shrink-0 mt-0.5 text-green-400" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* --- LOGGED OUT VIEW (SIMPLE CENTERED LOGIN CARD) --- */}
          {!user && (
            <div className="max-w-md mx-auto py-8 sm:py-12 px-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 rounded-full blur-2xl pointer-events-none" />

                {/* Brand Header */}
                <div className="text-center space-y-2 mb-6">
                  <div className="w-14 h-14 bg-fuchsia-50 rounded-2xl flex items-center justify-center mx-auto text-fuchsia-600 border border-fuchsia-100 shadow-sm">
                    <BookOpen size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isSignup ? "Create Lurnexa Account" : "Sign In to Lurnexa"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {isSignup ? "Enter your details to access purchased books & rentals" : "Access your digital textbook library & reader"}
                  </p>
                </div>

                {twilioValidationCode && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-4 mb-6 relative animate-pulse">
                    <button
                      onClick={() => setTwilioValidationCode("")}
                      className="absolute top-2 right-2 text-amber-700 hover:text-amber-900 font-bold text-xs"
                    >
                      ✕ Dismiss
                    </button>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Twilio Verification</h4>
                    </div>
                    <p className="text-xs text-amber-800 mb-2.5">
                      Enter verification code on your keypad:
                    </p>
                    <div className="flex justify-center">
                      <span className="font-mono text-2xl font-black bg-amber-500 text-white px-4 py-1.5 rounded-xl tracking-widest shadow-inner">
                        {twilioValidationCode}
                      </span>
                    </div>
                  </div>
                )}

                {showForgotPassword ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-1 mb-2">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Reset Your Password</h3>
                      <p className="text-xs text-slate-500">
                        {forgotStep === "email"
                          ? "Enter your account email — we'll send a 6-digit reset code."
                          : `Enter the code sent to ${forgotEmail} and choose a new password.`}
                      </p>
                    </div>

                    {forgotStep === "email" ? (
                      <form onSubmit={handleForgotPasswordRequestCode} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Gmail / Email Address
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                            <input
                              type="email"
                              placeholder="your.email@gmail.com"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              required
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                            />
                          </div>
                        </div>

                        {forgotError && (
                          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{forgotError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isForgotLoading}
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isForgotLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>Send Reset Code</span>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleForgotPasswordReset} className="space-y-4">
                        {forgotSuccess && (
                          <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{forgotSuccess}</p>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            6-Digit Reset Code
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={forgotCode}
                            onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            required
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 font-bold text-center text-lg tracking-[0.4em] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                            <input
                              type={showForgotNewPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={forgotNewPassword}
                              onChange={(e) => setForgotNewPassword(e.target.value)}
                              required
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-11 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            At least 8 characters, with uppercase, lowercase, a number, and a special character.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Confirm New Password
                          </label>
                          <input
                            type={showForgotNewPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={forgotConfirmPassword}
                            onChange={(e) => setForgotConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                          />
                        </div>

                        {forgotError && (
                          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{forgotError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isForgotLoading}
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isForgotLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>Reset Password</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => { setForgotStep("email"); setForgotError(""); setForgotSuccess(""); }}
                          className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          Didn't get a code? Send again
                        </button>
                      </form>
                    )}

                    <button
                      type="button"
                      onClick={resetForgotPasswordFlow}
                      className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors pt-2"
                    >
                      ← Back to Login
                    </button>
                  </div>
                ) : (
                <>
                {/* Switch Login/Signup Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 shadow-inner border border-slate-200">
                  <button
                    onClick={() => {
                      setIsSignup(false);
                      setErrorMessage("");
                      setSuccessMessage("");
                      setAuthEmail("");
                      setAuthPassword("");
                      setAuthName("");
                      setAuthMobile("");
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs uppercase font-black tracking-wider transition-all ${!isSignup ? "bg-fuchsia-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsSignup(true);
                      setErrorMessage("");
                      setSuccessMessage("");
                      setAuthEmail("");
                      setAuthPassword("");
                      setAuthName("");
                      setAuthMobile("");
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs uppercase font-black tracking-wider transition-all ${isSignup ? "bg-fuchsia-600 text-white shadow-md" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* EMAIL & PASSWORD LOGIN FORM */}
                {!isSignup && (
                  <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Gmail / Email Address
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                        <input
                          type="email"
                          placeholder="your.email@gmail.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-11 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      <div className="text-right mt-1.5">
                        <button
                          type="button"
                          onClick={() => { setForgotEmail(authEmail); setShowForgotPassword(true); setForgotStep("email"); setForgotError(""); setForgotSuccess(""); }}
                          className="text-[11px] font-bold text-fuchsia-600 hover:text-fuchsia-800 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
                    >
                      {isAuthLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Log In to Account</span>
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* EMAIL & PASSWORD SIGNUP FORM */}
                {isSignup && (
                  <form onSubmit={handleEmailSignupSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Gmail / Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                        <input
                          type="email"
                          placeholder="your.email@gmail.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Password (Min 8 chars, with uppercase, lowercase, number & special char)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          required
                          minLength={8}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-11 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={authMobile}
                          onChange={(e) => setAuthMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
                    >
                      {isAuthLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Account & Start Reading</span>
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}
                </>
                )}

                {/* Download App promo — installs directly when the browser has already
                    offered the native prompt; only falls back to opening /textbooks/app
                    (for iOS instructions, or if Chrome hasn't fired the prompt yet) otherwise.
                    appMode already shows its own install banner, so this is main-site only. */}
                {!appMode && !isStandalone && (
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="mt-6 w-full flex items-center gap-3 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl px-4 py-3.5 transition-all group"
                  >
                    <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Download size={16} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold">Get the Lurnexa Textbooks App</p>
                      <p className="text-[11px] text-slate-400">
                        {isIOS ? "Tap Share, then \"Add to Home Screen\"" : "Install for one-tap access to your library"}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                )}

                {/* Return to Bookstore Link */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <Link
                    href="/textbooks/store"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Return to Academic Bookstore</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* The reading app is scoped to login/signup + the library — admin tooling doesn't
              belong there, so admins get pointed back to the full portal instead. */}
          {appMode && user?.role === "admin" && (
            <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                <Shield size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Admin Tools Aren't in the App</h2>
              <p className="text-sm text-slate-500">This installed app is for reading purchased and rented textbooks. Manage the store and users from the full portal instead.</p>
              <div className="flex flex-col gap-2 pt-2">
                <a href="/textbooks/portal/login" className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm px-5 py-3 rounded-xl transition">Open Full Portal</a>
                <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 font-bold text-xs py-2 transition">Logout</button>
              </div>
            </div>
          )}

          {/* --- ADMIN DASHBOARD --- */}
          {!appMode && user?.role === "admin" && (
            <div className="space-y-6">
              {/* Admin Tabs */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-4">
                <div className="flex flex-wrap w-full sm:w-auto pb-1 sm:pb-0 gap-1">
                  <button
                    onClick={() => { setActiveTab("users"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "users" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Users size={16} />
                    User Profile Control
                  </button>

                  <button
                    onClick={() => { setActiveTab("qbank"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "qbank" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen size={16} />
                    Practice Question Bank
                  </button>
                  <button
                    onClick={() => { setActiveTab("textbooks"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "textbooks" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpenCheck size={16} />
                    Textbooks Manager
                  </button>
                  <button
                    onClick={() => { setActiveTab("colleges"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "colleges" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <GraduationCap size={16} />
                    Colleges Manager
                  </button>
                  <button
                    onClick={() => { setActiveTab("coupons"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "coupons" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Tag size={16} />
                    Coupons Manager
                  </button>
                   <button
                    onClick={() => { setActiveTab("practiceResults"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "practiceResults" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileSpreadsheet size={16} />
                    Practice Results
                  </button>
                  <button
                    onClick={() => { setActiveTab("adminCareerHub"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "adminCareerHub" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Briefcase size={16} />
                    Career Hub
                  </button>
                  <button
                    onClick={() => { setActiveTab("payments"); setExpandedOrderId(null); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "payments" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShoppingBag size={16} />
                    Bookstore Payments
                  </button>
                  <button
                    onClick={() => { setActiveTab("adminProfile"); setErrorMessage(""); setSuccessMessage(""); setIsEditingProfile(false); setProfileOtpSent(false); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "adminProfile" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <User size={16} />
                    Admin Profile
                  </button>
                </div>

                {activeTab !== "adminProfile" && activeTab !== "qbank" && activeTab !== "textbooks" && activeTab !== "adminCareerHub" && activeTab !== "coupons" && activeTab !== "payments" && (
                  <div className="flex flex-wrap items-center gap-4 pr-4 pb-2 sm:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by College:</span>
                      <select
                        value={adminCollegeFilter}
                        onChange={(e) => {
                          setAdminCollegeFilter(e.target.value);
                          if (!e.target.value) {
                            setAdminRoleFilter("");
                          }
                        }}
                        className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-bold text-xs shadow-sm"
                      >
                        <option value="">-- All Colleges --</option>
                        {colleges.map(c => (
                          <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>

                    {adminCollegeFilter && (
                      <div className="flex items-center gap-2 animate-fadeIn">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role:</span>
                        <select
                          value={adminRoleFilter}
                          onChange={(e) => setAdminRoleFilter(e.target.value)}
                          className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-bold text-xs shadow-sm"
                        >
                          <option value="">-- All Roles --</option>
                          <option value="student">Student (LS)</option>
                          <option value="faculty">Faculty (LF)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tab 1: Users Control */}
              {activeTab === "users" && (() => {
                // Scoped by the shared college/role filters above; search + status layer on top,
                // same pattern as adminAllOrders' filtering on the Bookstore Payments tab.
                const collegeRoleScoped = adminUsers.filter(u => matchesCollegeFilter(u.collegeName, u.accessId) && (!adminRoleFilter || u.role === adminRoleFilter));
                const term = userSearchQuery.toLowerCase().trim();
                const filteredUsers = collegeRoleScoped.filter(u => {
                  const matchesSearch = !term ||
                    (u.name || "").toLowerCase().includes(term) ||
                    (u.accessId || "").toLowerCase().includes(term) ||
                    (u.mobileNumber || "").toLowerCase().includes(term) ||
                    (u.email || u.collegeEmail || "").toLowerCase().includes(term);
                  const matchesStatus = userStatusFilter === "all" || (userStatusFilter === "active" ? u.isActive : !u.isActive);
                  return matchesSearch && matchesStatus;
                });

                const totalCount = collegeRoleScoped.length;
                const activeCount = collegeRoleScoped.filter(u => u.isActive).length;
                const studentCount = collegeRoleScoped.filter(u => u.role === "student").length;
                const facultyCount = collegeRoleScoped.filter(u => u.role === "faculty").length;

                const itemsPerPage = 5;
                const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
                const startIdx = (usersPage - 1) * itemsPerPage;
                const paginatedItems = filteredUsers.slice(startIdx, startIdx + itemsPerPage);

                const handleExportUsersCsv = () => {
                  if (filteredUsers.length === 0) {
                    showToast("No profiles to export with the current filters.", "error");
                    return;
                  }
                  const escapeCsv = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
                  const headers = ["Name", "Access ID", "Mobile", "Email", "Role", "College", "Plan", "Status"];
                  const rows = filteredUsers.map(u => [
                    u.name,
                    u.accessId || "",
                    u.mobileNumber || "",
                    u.email || u.collegeEmail || "",
                    u.role,
                    u.collegeName || "",
                    u.role === "student" ? getPlanLabel(u.plan) : "N/A",
                    u.isActive ? "Active" : "Inactive"
                  ].map(escapeCsv).join(","));
                  const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `lurnexa_profiles_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                };

                return (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/50 border border-fuchsia-200/60 rounded-3xl p-6 shadow-md flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-fuchsia-600/10 text-fuchsia-600 flex items-center justify-center shrink-0">
                          <Users size={24} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Total Profiles</span>
                          <span className="text-2xl font-black text-slate-900">{totalCount}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 rounded-3xl p-6 shadow-md flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Active Profiles</span>
                          <span className="text-2xl font-black text-slate-900">{activeCount}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/60 rounded-3xl p-6 shadow-md flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                          <GraduationCap size={24} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Students</span>
                          <span className="text-2xl font-black text-slate-900">{studentCount}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 rounded-3xl p-6 shadow-md flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-600/10 text-amber-700 flex items-center justify-center shrink-0">
                          <Briefcase size={24} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Faculty</span>
                          <span className="text-2xl font-black text-slate-900">{facultyCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Search & Status Filter */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <Search size={16} />
                          </span>
                          <input
                            type="text"
                            placeholder="Search by name, access ID, mobile, or email..."
                            value={userSearchQuery}
                            onChange={(e) => { setUserSearchQuery(e.target.value); setUsersPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all text-slate-900 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <select
                            value={userStatusFilter}
                            onChange={(e) => { setUserStatusFilter(e.target.value); setUsersPage(1); }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all text-slate-900"
                          >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Registered Profiles Management</h3>
                          <p className="text-xs text-slate-600 mt-1">Activate or deactivate profiles. Deactivated profiles are denied login capability.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleExportUsersCsv}
                          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0"
                        >
                          <Download size={14} />
                          Export CSV
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                          <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                            <tr>
                              <th className="p-4 rounded-l-xl">Profile</th>
                              <th className="p-4">Access ID</th>
                              <th className="p-4">Role</th>
                              <th className="p-4">College</th>
                              <th className="p-4">Plan</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 rounded-r-xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedItems.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-10 text-center">
                                  <div className="flex flex-col items-center gap-2 text-slate-500">
                                    <Users size={28} className="text-slate-300" />
                                    <span className="font-bold text-sm">No profiles found</span>
                                    <span className="text-xs">Try adjusting your search or filters.</span>
                                  </div>
                                </td>
                              </tr>
                            ) : paginatedItems.map(u => (
                              <tr key={u.mobileNumber} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                      u.role === "admin" ? "bg-red-100 text-red-600" :
                                      u.role === "faculty" ? "bg-blue-100 text-blue-600" :
                                      "bg-fuchsia-100 text-fuchsia-600"
                                    }`}>
                                      {(u.name || "?").trim().charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-900 truncate">{u.name}</div>
                                      <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                        <Phone size={11} className="shrink-0" />
                                        {u.mobileNumber || "—"}
                                      </div>
                                      {(u.email || u.collegeEmail) && (
                                        <div className="text-xs text-slate-400 flex items-center gap-1 truncate">
                                          <Mail size={11} className="shrink-0" />
                                          {u.email || u.collegeEmail}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 font-mono font-semibold text-fuchsia-600">{u.accessId}</td>
                                <td className="p-4 capitalize">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    u.role === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                    u.role === "faculty" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                    "bg-green-500/10 text-green-400 border border-green-500/20"
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-4 max-w-xs truncate">{u.collegeName || "—"}</td>
                                <td className="p-4 text-xs font-bold text-slate-800">
                                  {u.role === "student" ? getPlanLabel(u.plan) : "N/A"}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.isActive ? "text-emerald-600" : "text-slate-500"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                    {u.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end items-center gap-2">
                                    {u.role !== "admin" ? (
                                      <>
                                        <button
                                          onClick={() => handleToggleUserStatus(u.mobileNumber, u.isActive)}
                                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                            u.isActive
                                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                              : "bg-green-600 hover:bg-green-500 text-white"
                                          }`}
                                        >
                                          {u.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                        <button
                                          onClick={() => handleAdminDeleteUser(u.mobileNumber)}
                                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl font-bold text-xs transition-all"
                                        >
                                          Delete
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-xs text-slate-500 font-medium">Protected</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {filteredUsers.length > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 animate-fadeIn">
                          <span className="text-xs text-slate-500 font-bold">
                            Showing Page {usersPage} of {totalPages} ({filteredUsers.length} matching profile{filteredUsers.length === 1 ? "" : "s"})
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                              disabled={usersPage === 1}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                            >
                              Prev
                            </button>
                            <button
                              onClick={() => setUsersPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={usersPage === totalPages}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tab 2: Access ID Registry Generator */}
              {activeTab === "accessIds" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Generator panel */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Generate Allowed ID</h3>
                    <p className="text-xs text-slate-600">Generate unique codes mapped to a book and role. Give these codes to users to let them register.</p>

                    <form onSubmit={handleGenerateAccessId} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Textbook Mapping</label>
                        <select
                          value={genIdBook}
                          onChange={(e) => setGenIdBook(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                        >
                          {textbooks.map(b => (
                            <option key={b.id} value={b.id}>Book {b.id}: {b.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Role Target</label>
                        <div className="flex gap-4">
                          <label className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:border-fuchsia-500 transition-colors">
                            <input
                              type="radio"
                              name="genRole"
                              checked={genIdRole === "student"}
                              onChange={() => setGenIdRole("student")}
                              className="accent-fuchsia-500"
                            />
                            <div className="text-xs font-bold text-slate-900">Student</div>
                          </label>

                          <label className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:border-fuchsia-500 transition-colors">
                            <input
                              type="radio"
                              name="genRole"
                              checked={genIdRole === "faculty"}
                              onChange={() => setGenIdRole("faculty")}
                              className="accent-fuchsia-500"
                            />
                            <div className="text-xs font-bold text-slate-900">Faculty</div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">College Mapping</label>
                        <select
                          value={genIdCollege}
                          onChange={(e) => setGenIdCollege(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                        >
                          <option value="others">Others</option>
                          {colleges.map(c => (
                            <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Quantity to Generate</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={genIdCount}
                          onChange={(e) => setGenIdCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={18} />
                        {genIdCount > 1 ? `Generate ${genIdCount} IDs` : "Generate ID"}
                      </button>
                    </form>
                  </div>

                  {/* List allowed IDs */}
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Access ID Registry</h3>
                    <div className="overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                          <tr>
                            <th className="p-4 rounded-l-xl">Access ID</th>
                            <th className="p-4">Textbook Mapping</th>
                            <th className="p-4">Role Target</th>
                            <th className="p-4 rounded-r-xl">Assignment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {(() => {
                            const filtered = adminAccessIds.filter(item => matchesCollegeFilter(undefined, item.accessId) && (!adminRoleFilter || item.role === adminRoleFilter || (adminRoleFilter === 'student' && item.accessId.toUpperCase().includes('LS')) || (adminRoleFilter === 'faculty' && item.accessId.toUpperCase().includes('LF'))));
                            const itemsPerPage = 5;
                            const totalPages = Math.ceil(filtered.length / itemsPerPage);
                            const startIdx = (accessIdsPage - 1) * itemsPerPage;
                            const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage);

                            return paginatedItems.map(item => (
                              <tr key={item.accessId} className="hover:bg-slate-50">
                                <td className="p-4 font-mono font-black text-fuchsia-500 text-sm tracking-wide">{item.accessId}</td>
                                <td className="p-4 text-xs">
                                  {textbooks.find(b => b.id === item.bookId)?.title || `Book ${item.bookId}`}
                                </td>
                                <td className="p-4 capitalize">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.role === 'student' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  }`}>
                                    {item.role}
                                  </span>
                                </td>
                                <td className="p-4 text-xs font-semibold">
                                  {item.assignedTo ? (
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <Check size={14} className="text-green-400" />
                                      Assigned to mobile {item.assignedTo}
                                    </span>
                                  ) : (
                                    <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20 font-bold text-[10px] uppercase tracking-wider">
                                      Unassigned / Available
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {(() => {
                      const filtered = adminAccessIds.filter(item => matchesCollegeFilter(undefined, item.accessId) && (!adminRoleFilter || item.role === adminRoleFilter || (adminRoleFilter === 'student' && item.accessId.toUpperCase().includes('LS')) || (adminRoleFilter === 'faculty' && item.accessId.toUpperCase().includes('LF'))));
                      const itemsPerPage = 5;
                      const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                      if (filtered.length === 0) return null;

                      return (
                        <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 animate-fadeIn">
                          <span className="text-xs text-slate-500 font-bold">
                            Showing Page {accessIdsPage} of {totalPages} ({filtered.length} total access IDs)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAccessIdsPage(prev => Math.max(1, prev - 1))}
                              disabled={accessIdsPage === 1}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                            >
                              Prev
                            </button>
                            <button
                              onClick={() => setAccessIdsPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={accessIdsPage === totalPages}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Tab 3: Question Bank Manager */}
              {activeTab === "qbank" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Forms */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Add Question Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">Add Question to Bank</h3>
                      <p className="text-xs text-slate-600">Questions added here populate student practice tests and can be imported by teachers.</p>

                      <form onSubmit={handleAdminAddQuestion} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Map to Textbook</label>
                          <select
                            value={adminQBankBook}
                            onChange={(e) => setAdminQBankBook(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                          >
                            {textbooks.map(b => (
                              <option key={b.id} value={b.id}>Book {b.id}: {b.title}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Question Type</label>
                          <select
                            value={adminNewQuestion.type}
                            onChange={(e) => {
                              const val = e.target.value as "mcq" | "written";
                              setAdminNewQuestion({ ...adminNewQuestion, type: val });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          >
                            <option value="mcq">Multiple Choice Question (MCQ)</option>
                            <option value="written">Written / Theoretical Question</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Chapter Mapping</label>
                          <select
                            value={adminNewQuestion.chapter}
                            onChange={(e) => setAdminNewQuestion({ ...adminNewQuestion, chapter: parseInt(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm animate-fadeIn"
                          >
                            {Array.from({ length: adminChaptersConfig[adminQBankBook] || 5 }, (_, i) => i + 1).map(ch => (
                              <option key={ch} value={ch}>Chapter {ch}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Question Category</label>
                          <select
                            value={adminNewQuestion.category || "practice"}
                            onChange={(e) => {
                              const val = e.target.value as "practice" | "quiz";
                              setAdminNewQuestion({ ...adminNewQuestion, category: val });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm animate-fadeIn"
                          >
                            <option value="practice">Practice Question (Student Practice)</option>
                            <option value="quiz">Quiz Question (Faculty Assessments)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Question Text</label>
                          <textarea
                            placeholder="What is the time complexity of..."
                            rows={3}
                            value={adminNewQuestion.questionText}
                            onChange={(e) => setAdminNewQuestion({ ...adminNewQuestion, questionText: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          />
                        </div>

                        {adminNewQuestion.type === "mcq" && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Option A</label>
                                <input
                                  type="text"
                                  placeholder="Option A"
                                  value={adminNewQuestion.optionA}
                                  onChange={(e) => setAdminNewQuestion({ ...adminNewQuestion, optionA: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Option B</label>
                                <input
                                  type="text"
                                  placeholder="Option B"
                                  value={adminNewQuestion.optionB}
                                  onChange={(e) => setAdminNewQuestion({ ...adminNewQuestion, optionB: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Option C</label>
                                <input
                                  type="text"
                                  placeholder="Option C"
                                  value={adminNewQuestion.optionC}
                                  onChange={(e) => setAdminNewQuestion({ ...adminNewQuestion, optionC: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Option D</label>
                                <input
                                  type="text"
                                  placeholder="Option D"
                                  value={adminNewQuestion.optionD}
                                  onChange={(e) => setAdminNewQuestion({ ...adminNewQuestion, optionD: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Correct Answer</label>
                              <select
                                value={adminNewQuestion.correctOption}
                                onChange={(e) => setAdminNewQuestion({ ...adminNewQuestion, correctOption: e.target.value as "A" | "B" | "C" | "D" })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-fuchsia-500 font-medium"
                              >
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                              </select>
                            </div>
                          </>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={18} />
                          Add to Bank
                        </button>
                      </form>
                    </div>

                    {/* Bulk Import Questions Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Bulk Import Questions</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Upload questions in bulk via CSV, JSON, PDF, Word, or TXT file mapped to Book <b>{adminQBankBook}</b>.
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-fuchsia-500 transition-colors relative">
                        <input
                          type="file"
                          accept=".csv,.json,.pdf,.docx,.doc,.txt"
                          onChange={handleBulkImport}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                        <span className="block text-xs font-bold text-slate-600">Click or drag file to upload</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Supports PDF, Word, CSV, JSON, TXT</span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Download Sample Template</label>
                        <div className="flex gap-2">
                          <select
                            value={selectedTemplateFormat}
                            onChange={(e) => setSelectedTemplateFormat(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-fuchsia-500 cursor-pointer"
                          >
                            <option value="">-- Choose format --</option>
                            <option value="csv">CSV Template (.csv)</option>
                            <option value="json">JSON Template (.json)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedTemplateFormat) {
                                showToast("Please select a template format first.", "error");
                                return;
                              }
                              if (selectedTemplateFormat === "csv") {
                                const headers = "type,chapter,questionText,optionA,optionB,optionC,optionD,correctOption,category\n";
                                const row1 = 'mcq,1,"What is the capital of India?","Mumbai","New Delhi","Kolkata","Chennai",B,practice\n';
                                const row2 = 'written,1,"Explain the concept of Database Management Systems.",,,,,,,practice\n';
                                const blob = new Blob([headers + row1 + row2], { type: "text/csv;charset=utf-8;" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", "questions_template.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } else if (selectedTemplateFormat === "json") {
                                const data = [
                                  {
                                    type: "mcq",
                                    chapter: 1,
                                    questionText: "What is the capital of India?",
                                    optionA: "Mumbai",
                                    optionB: "New Delhi",
                                    optionC: "Kolkata",
                                    optionD: "Chennai",
                                    correctOption: "B",
                                    category: "practice"
                                  },
                                  {
                                    type: "written",
                                    chapter: 1,
                                    questionText: "Explain the concept of Database Management Systems.",
                                    category: "practice"
                                  }
                                ];
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", "questions_template.json");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-4 py-2 rounded-xl shadow transition-colors text-xs flex items-center gap-1 shrink-0"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Practice Tests Manager Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5 animate-fadeIn">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Manage Practice Tests</h3>
                        <p className="text-xs text-slate-600">Configure multiple active practice tests with scheduled time windows.</p>
                      </div>

                      {/* Subject / Textbook Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Select Subject / Textbook</label>
                        <select
                          value={configBookId}
                          onChange={(e) => {
                            setConfigBookId(e.target.value);
                            setPracticeTests(getPracticeTests(e.target.value));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                        >
                          {textbooks.map(b => (
                            <option key={b.id} value={b.id}>Book {b.id}: {b.title}</option>
                          ))}
                        </select>
                      </div>

                      {/* Config & Active/Scheduled Tests Table */}
                      <div className="space-y-4 pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Scheduled practice tests</h4>
                        </div>
                        {practiceTests.length === 0 ? (
                          <div className="text-center text-slate-500 py-6 text-xs bg-slate-50 border border-slate-200 rounded-2xl">
                            No scheduled tests yet for this book.
                          </div>
                        ) : (
                          <div className="overflow-x-auto max-h-[220px] custom-scrollbar">
                            <table className="w-full text-left text-xs text-slate-700">
                              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider">
                                <tr>
                                  <th className="p-3 rounded-l-xl">Title</th>
                                  <th className="p-3">Duration</th>
                                  <th className="p-3">Limit</th>
                                  <th className="p-3">Schedule Window</th>
                                  <th className="p-3 rounded-r-xl text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {practiceTests.map(t => {
                                  const now = new Date();
                                  const start = new Date(t.startTime);
                                  const end = new Date(t.endTime);
                                  const isActive = now >= start && now <= end;
                                  return (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                      <td className="p-3 font-semibold text-slate-900">{t.title}</td>
                                      <td className="p-3 font-medium">{t.duration} mins</td>
                                      <td className="p-3 font-semibold text-fuchsia-600">{t.questionLimit} Qs</td>
                                      <td className="p-3 font-medium text-[10px] text-slate-600">
                                        <div className="flex flex-col">
                                          <span>Start: {start.toLocaleString()}</span>
                                          <span>End: {end.toLocaleString()}</span>
                                          <span className={`font-bold mt-0.5 ${isActive ? "text-green-500" : "text-amber-500"}`}>
                                            {isActive ? "● Active Now" : "○ Scheduled"}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="p-3 text-right">
                                        <button
                                          onClick={() => {
                                            deletePracticeTest(t.id);
                                            setPracticeTests(getPracticeTests(configBookId));
                                            setSuccessMessage(`Practice test "${t.title}" deleted.`);
                                          }}
                                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                                          title="Delete Scheduled Test"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Create New Practice Test Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setErrorMessage("");
                          setSuccessMessage("");
                          if (!newPracticeTitle.trim()) {
                            setErrorMessage("Please enter a practice test title.");
                            return;
                          }
                          const start = new Date(newPracticeStartTime);
                          const end = new Date(newPracticeEndTime);
                          if (start >= end) {
                            setErrorMessage("End date & time must be after the start date & time.");
                            return;
                          }
                          const test = savePracticeTest({
                            id: `test-${Date.now()}`,
                            bookId: configBookId,
                            title: newPracticeTitle,
                            duration: newPracticeDuration,
                            questionLimit: newPracticeLimit,
                            startTime: newPracticeStartTime,
                            endTime: newPracticeEndTime,
                            createdAt: new Date().toISOString(),
                            selectedQuestionIds: adminQuestions.filter(q => q.selectedForPractice).map(q => q.id)
                          });
                          if (test) {
                            setSuccessMessage(`Practice test "${newPracticeTitle}" successfully scheduled.`);
                            setNewPracticeTitle("");
                            setPracticeTests(getPracticeTests(configBookId));
                          } else {
                            setErrorMessage("Failed to schedule practice test.");
                          }
                        }}
                        className="space-y-4 pt-3 border-t border-slate-200"
                      >
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Schedule New Practice Test</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Test Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Unit 1 Practice Test"
                              value={newPracticeTitle}
                              onChange={(e) => setNewPracticeTitle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-inner"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Question Limit</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={newPracticeLimit}
                              onChange={(e) => setNewPracticeLimit(Math.max(1, parseInt(e.target.value) || 5))}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-inner"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Duration (minutes)</label>
                            <input
                              type="number"
                              min="1"
                              value={newPracticeDuration}
                              onChange={(e) => setNewPracticeDuration(Math.max(1, parseInt(e.target.value) || 15))}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-inner"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Start Date & Time</label>
                            <input
                              type="datetime-local"
                              value={newPracticeStartTime}
                              onChange={(e) => setNewPracticeStartTime(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-inner"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">End Date & Time</label>
                            <input
                              type="datetime-local"
                              value={newPracticeEndTime}
                              onChange={(e) => setNewPracticeEndTime(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-inner"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 rounded-xl shadow transition-colors text-xs"
                        >
                          Schedule Practice Test
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Column: List and Configs */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* List Question Bank Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                      {(() => {
                        const currentTest = practiceTests.find(t => t.id === selectedPracticeTestId);
                        return (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">Current Question Bank</h3>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                {currentTest ? (
                                  <>
                                    Selected for <span className="font-bold text-fuchsia-600">{currentTest.title}</span>:{" "}
                                    <span className="font-bold text-fuchsia-600">{(currentTest.selectedQuestionIds || []).length}</span> /{" "}
                                    <span className="font-semibold text-slate-700">{currentTest.questionLimit}</span> questions
                                  </>
                                ) : (
                                  <>
                                    Practice Selection: <span className="font-bold text-fuchsia-600">{adminQuestions.filter(q => q.selectedForPractice).length}</span> / <span className="font-semibold text-slate-700">{configBookId === adminQBankBook ? newPracticeLimit : getEffectiveQuestionLimit(adminQBankBook)}</span> questions
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <select
                                value={adminQBankBook}
                                onChange={(e) => {
                                  const newBook = e.target.value;
                                  setAdminQBankBook(newBook);
                                  const tests = getPracticeTests(newBook);
                                  setPracticeTests(tests);
                                  if (tests.length > 0) {
                                    setSelectedPracticeTestId(tests[0].id);
                                  } else {
                                    setSelectedPracticeTestId("");
                                  }
                                }}
                                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none font-semibold text-xs shadow-sm"
                              >
                                {textbooks.map(b => (
                                  <option key={b.id} value={b.id}>Book {b.id}</option>
                                ))}
                              </select>

                              <select
                                value={selectedPracticeTestId}
                                onChange={(e) => setSelectedPracticeTestId(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none font-semibold text-xs shadow-sm"
                              >
                                <option value="">-- Choose Practice Test --</option>
                                {practiceTests.map(t => (
                                  <option key={t.id} value={t.id}>{t.title} (Limit: {t.questionLimit})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="space-y-4 max-h-[1325px] overflow-y-auto pr-2 custom-scrollbar">
                        {adminQuestions.length === 0 ? (
                          <div className="text-center text-slate-500 py-12 text-sm">
                            No questions registered under this textbook yet. Use the form to add one.
                          </div>
                        ) : (
                          (() => {
                            const currentTest = practiceTests.find(t => t.id === selectedPracticeTestId);
                            const itemsPerPage = 5;
                            const totalPages = Math.max(1, Math.ceil(adminQuestions.length / itemsPerPage));
                            const startIdx = (qbankPage - 1) * itemsPerPage;
                            const paginatedQuestions = adminQuestions.slice(startIdx, startIdx + itemsPerPage);

                            return (
                              <>
                                {paginatedQuestions.map((q, idx) => {
                                  const isChecked = currentTest
                                    ? (currentTest.selectedQuestionIds || []).includes(q.id)
                                    : !!q.selectedForPractice;

                                  return (
                                    <div key={q.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl relative group animate-fadeIn">
                                      <button
                                        onClick={() => handleAdminDeleteQuestion(q.id)}
                                        className="absolute top-4 right-4 p-1.5 bg-white hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Question"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="font-bold text-slate-900 pr-6">
                                          Q{startIdx + idx + 1}. {q.questionText}
                                        </span>
                                        <div className="flex gap-1.5">
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                            q.type === 'written' 
                                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                          }`}>
                                            {q.type === 'written' ? 'Written' : 'MCQ'}
                                          </span>
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                            q.category === 'quiz'
                                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                          }`}>
                                            {q.category === 'quiz' ? 'Quiz' : 'Practice'}
                                          </span>
                                          <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 bg-slate-100 text-slate-600 border border-slate-200">
                                            Chapter {q.chapter || 1}
                                          </span>
                                        </div>
                                      </div>
                                      {q.type !== 'written' ? (
                                        <>
                                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                                            <div>A: {q.optionA}</div>
                                            <div>B: {q.optionB}</div>
                                            <div>C: {q.optionC}</div>
                                            <div>D: {q.optionD}</div>
                                          </div>
                                          <div className="text-xs text-green-400 font-bold">
                                            Correct: {q.correctOption}
                                          </div>
                                        </>
                                      ) : (
                                        <div className="text-xs text-slate-500 italic">
                                          Written response question
                                        </div>
                                      )}

                                      {/* Practice Test Selection Switch */}
                                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          disabled={!!currentTest}
                                          onChange={(e) => {
                                            const isCheckedVal = e.target.checked;
                                            if (currentTest) {
                                              return;
                                            } else {
                                              if (isCheckedVal) {
                                                const limit = configBookId === adminQBankBook ? newPracticeLimit : getEffectiveQuestionLimit(adminQBankBook);
                                                const selectedCount = adminQuestions.filter(item => item.selectedForPractice).length;
                                                if (selectedCount >= limit) {
                                                  showToast(`Limit reached. You can only select up to ${limit} questions for the practice test of Book ${adminQBankBook}.`, 'warning');
                                                  return;
                                                }
                                              }
                                              toggleQuestionPracticeSelection(q.id, isCheckedVal);
                                              setAdminQuestions(getQuestionsByBook(adminQBankBook));
                                            }
                                          }}
                                          id={`prac-sel-${q.id}`}
                                          className={`accent-fuchsia-600 rounded w-3.5 h-3.5 ${!!currentTest ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                                        />
                                        <label htmlFor={`prac-sel-${q.id}`} className={`font-bold select-none text-[11px] ${!!currentTest ? "cursor-not-allowed text-slate-400" : "cursor-pointer"}`}>
                                          {currentTest ? `Included in ${currentTest.title}` : "Include in Practice Test"}
                                        </label>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Pagination Controls */}
                                <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 animate-fadeIn">
                                  <span className="text-xs text-slate-500 font-bold">
                                    Showing Page {qbankPage} of {totalPages} ({adminQuestions.length} total questions)
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setQbankPage(prev => Math.max(1, prev - 1))}
                                      disabled={qbankPage === 1}
                                      className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                                    >
                                      Prev
                                    </button>
                                    <button
                                      onClick={() => setQbankPage(prev => Math.min(totalPages, prev + 1))}
                                      disabled={qbankPage === totalPages}
                                      className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                                    >
                                      Next
                                    </button>
                                  </div>
                                </div>
                              </>
                            );
                          })()
                        )}
                      </div>
                    </div>

                    {/* Configure Textbook Chapters Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                      <h3 className="text-lg font-bold text-slate-900">Configure Chapters Count</h3>
                      <p className="text-xs text-slate-600">Configure how many chapters each textbook has.</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Select Textbook</label>
                          <select
                            value={configBookId}
                            onChange={(e) => {
                              setConfigBookId(e.target.value);
                              setConfigChaptersCount(adminChaptersConfig[e.target.value] || 5);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          >
                            {textbooks.map(b => (
                              <option key={b.id} value={b.id}>Book {b.id}: {b.title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Number of Chapters</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={configChaptersCount}
                            onChange={(e) => setConfigChaptersCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateBookChapters(configBookId, configChaptersCount);
                            const updated = { ...adminChaptersConfig, [configBookId]: configChaptersCount };
                            setAdminChaptersConfig(updated);
                            setSuccessMessage(`Updated Book ${configBookId} to have ${configChaptersCount} chapters.`);
                          }}
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 rounded-xl shadow transition-all text-sm"
                        >
                          Save Chapters Configuration
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "practiceResults" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Student Practice Results</h3>
                    <p className="text-xs text-slate-600">
                      View and track performance of students on scheduled practice tests, divided and grouped by their assigned teaching faculty.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {(() => {
                      const allUsersList = getAllUsers();
                      const teachers = allUsersList.filter(u => u.role === "faculty").filter(u => matchesCollegeFilter(u.collegeName, u.accessId) && (!adminRoleFilter || adminRoleFilter === "faculty"));
                      const students = allUsersList.filter(u => u.role === "student").filter(u => matchesCollegeFilter(u.collegeName, u.accessId) && (!adminRoleFilter || adminRoleFilter === "student"));
                      const allPracticeAttempts = getAllPracticeAttempts();
                      const allTextbooksList = getAllTextbooks();

                      return (
                        <>
                          {teachers.map(teacher => {
                            const assignedStudents = students.filter(
                              s => s.teachingFacultyAccessId?.toUpperCase() === teacher.accessId?.toUpperCase()
                            );

                            return (
                              <div key={teacher.mobileNumber} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl animate-fadeIn">
                                {/* Teacher Info Header Bar */}
                                <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-fuchsia-500/20 shadow-sm flex items-center justify-center bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white text-base font-black shrink-0">
                                      {teacher.profilePicture ? (
                                        <img
                                          src={teacher.profilePicture}
                                          alt={teacher.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        teacher.name ? teacher.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "T"
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        {teacher.name}
                                        <span className="text-[10px] bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                          Faculty
                                        </span>
                                      </h4>
                                      <p className="text-xs text-slate-600 font-medium">
                                        ID: <span className="font-mono font-bold text-slate-800">{teacher.accessId}</span> | Email: <span className="text-slate-800">{teacher.collegeEmail || "N/A"}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-500/20 text-xs font-bold px-4 py-2 rounded-2xl shrink-0 font-mono">
                                    Assigned Students: {assignedStudents.length}
                                  </div>
                                </div>

                                {/* Assigned Students Practice Performance Table */}
                                <div className="p-6">
                                  {assignedStudents.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8 text-sm border border-dashed border-slate-200 rounded-2xl font-medium">
                                      No students registered under this teaching faculty yet.
                                    </div>
                                  ) : (
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                      <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                            <th className="px-5 py-3">Student Name</th>
                                            <th className="px-5 py-3">Book ID / Prefix</th>
                                            <th className="px-5 py-3">Practice Test</th>
                                            <th className="px-5 py-3 text-center">Score / Marks</th>
                                            <th className="px-5 py-3 text-right">Completed At</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                          {assignedStudents.map(student => {
                                            const studentAttempts = allPracticeAttempts.filter(
                                              a => a.studentMobile === student.mobileNumber
                                            );

                                            if (studentAttempts.length === 0) {
                                              return (
                                                <tr key={student.mobileNumber} className="hover:bg-slate-50/20 transition">
                                                  <td className="px-5 py-3.5">
                                                    <div className="font-bold text-slate-900">{student.name}</div>
                                                    <div className="text-[10px] text-slate-500">{student.mobileNumber} | {student.collegeEmail || "No Email"}</div>
                                                  </td>
                                                  <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-slate-500">Book {student.bookId}</td>
                                                  <td colSpan={3} className="px-5 py-3.5 text-center text-slate-400 italic">
                                                    No practice tests attempted yet
                                                  </td>
                                                </tr>
                                              );
                                            }

                                            return studentAttempts.map((attempt, attIdx) => {
                                              const bookTitle = allTextbooksList.find(b => b.id === attempt.bookId)?.title || "Unknown Textbook";
                                              const practiceTestTitle = attempt.practiceTestId 
                                                ? (getPracticeTests(attempt.bookId).find(t => t.id === attempt.practiceTestId)?.title || "Scheduled Practice Test")
                                                : "Self-Paced Practice";

                                              return (
                                                <tr key={`${student.mobileNumber}-${attempt.id}-${attIdx}`} className="hover:bg-slate-50/20 transition">
                                                  {attIdx === 0 ? (
                                                    <td rowSpan={studentAttempts.length} className="px-5 py-3.5 align-top border-r border-slate-100">
                                                      <div className="font-bold text-slate-900">{student.name}</div>
                                                      <div className="text-[10px] text-slate-500">{student.mobileNumber}</div>
                                                      <div className="text-[10px] text-slate-500">{student.collegeEmail || "No Email"}</div>
                                                    </td>
                                                  ) : null}
                                                  <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-slate-800">
                                                    Book {attempt.bookId}
                                                    <span className="block font-sans text-[9px] text-slate-400 font-normal truncate max-w-[120px]" title={bookTitle}>
                                                      {bookTitle}
                                                    </span>
                                                  </td>
                                                  <td className="px-5 py-3.5 text-slate-900 font-semibold">{practiceTestTitle}</td>
                                                  <td className="px-5 py-3.5 text-center">
                                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-500/20">
                                                      {attempt.score} / {attempt.totalQuestions}
                                                    </span>
                                                  </td>
                                                  <td className="px-5 py-3.5 text-right text-[10px] text-slate-500 font-mono">
                                                    {new Date(attempt.completedAt).toLocaleString()}
                                                  </td>
                                                </tr>
                                              );
                                            });
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Unassigned Students Group */}
                          {(() => {
                            const unassignedStudents = students.filter(
                              s => !s.teachingFacultyAccessId || 
                                   !teachers.some(t => t.accessId?.toUpperCase() === s.teachingFacultyAccessId?.toUpperCase())
                            );

                            if (unassignedStudents.length === 0) return null;

                            return (
                              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl border-dashed animate-fadeIn">
                                <div className="bg-slate-50/50 border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div>
                                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                      Unassigned Students
                                      <span className="text-[10px] bg-slate-500/10 text-slate-600 border border-slate-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        No Faculty Linked
                                      </span>
                                    </h4>
                                    <p className="text-xs text-slate-500">Students who are not linked to any registered teacher profile.</p>
                                  </div>
                                  <div className="bg-slate-500/10 text-slate-600 border border-slate-500/20 text-xs font-bold px-4 py-2 rounded-2xl shrink-0 font-mono">
                                    Total: {unassignedStudents.length}
                                  </div>
                                </div>

                                <div className="p-6">
                                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                          <th className="px-5 py-3">Student Name</th>
                                          <th className="px-5 py-3">Book ID</th>
                                          <th className="px-5 py-3">Practice Test</th>
                                          <th className="px-5 py-3 text-center">Score / Marks</th>
                                          <th className="px-5 py-3 text-right">Completed At</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {unassignedStudents.map(student => {
                                          const studentAttempts = allPracticeAttempts.filter(
                                            a => a.studentMobile === student.mobileNumber
                                          );

                                          if (studentAttempts.length === 0) {
                                            return (
                                              <tr key={student.mobileNumber} className="hover:bg-slate-50/20 transition">
                                                <td className="px-5 py-3.5">
                                                  <div className="font-bold text-slate-900">{student.name}</div>
                                                  <div className="text-[10px] text-slate-500">{student.mobileNumber} | {student.collegeEmail || "No Email"}</div>
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-slate-500">Book {student.bookId}</td>
                                                <td colSpan={3} className="px-5 py-3.5 text-center text-slate-400 italic">
                                                  No practice tests attempted yet
                                                </td>
                                              </tr>
                                            );
                                          }

                                          return studentAttempts.map((attempt, attIdx) => {
                                            const bookTitle = allTextbooksList.find(b => b.id === attempt.bookId)?.title || "Unknown Textbook";
                                            const practiceTestTitle = attempt.practiceTestId 
                                              ? (getPracticeTests(attempt.bookId).find(t => t.id === attempt.practiceTestId)?.title || "Scheduled Practice Test")
                                              : "Self-Paced Practice";

                                            return (
                                              <tr key={`${student.mobileNumber}-${attempt.id}-${attIdx}`} className="hover:bg-slate-50/20 transition">
                                                {attIdx === 0 ? (
                                                  <td rowSpan={studentAttempts.length} className="px-5 py-3.5 align-top border-r border-slate-100">
                                                    <div className="font-bold text-slate-900">{student.name}</div>
                                                    <div className="text-[10px] text-slate-500">{student.mobileNumber}</div>
                                                    <div className="text-[10px] text-slate-500">{student.collegeEmail || "No Email"}</div>
                                                  </td>
                                                ) : null}
                                                <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-slate-800">
                                                  Book {attempt.bookId}
                                                  <span className="block font-sans text-[9px] text-slate-400 font-normal truncate max-w-[120px]" title={bookTitle}>
                                                    {bookTitle}
                                                  </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-900 font-semibold">{practiceTestTitle}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-500/20">
                                                    {attempt.score} / {attempt.totalQuestions}
                                                  </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-[10px] text-slate-500 font-mono">
                                                  {new Date(attempt.completedAt).toLocaleString()}
                                                </td>
                                              </tr>
                                            );
                                          });
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {activeTab === "textbooks" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Add New Textbook</h3>
                    <p className="text-xs text-slate-600">Introduce new books to the portal. This updates access code prefix allocation and quiz assignment dynamically.</p>

                    <form onSubmit={handleAddTextbook} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Book ID</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5"
                          value={newBookId}
                          onChange={(e) => setNewBookId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Textbook Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Compiler Design & Engineering"
                          value={newBookTitle}
                          onChange={(e) => setNewBookTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">2-Letter Access Prefix Code</label>
                        <input
                          type="text"
                          required
                          maxLength={2}
                          placeholder="e.g. CD"
                          value={newBookCode}
                          onChange={(e) => setNewBookCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-mono text-sm uppercase font-bold"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Used for textbook catalog mapping.</p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={18} />
                        Add Textbook
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of books */}
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Available Textbooks Registry</h3>
                    <div className="overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                      {textbooks.length === 0 ? (
                        <div className="text-center text-slate-500 py-12 text-sm">
                          No textbooks registered yet.
                        </div>
                      ) : (
                        (() => {
                          const itemsPerPage = 5;
                          const totalPages = Math.max(1, Math.ceil(textbooks.length / itemsPerPage));
                          const startIdx = (textbooksPage - 1) * itemsPerPage;
                          const paginatedTextbooks = textbooks.slice(startIdx, startIdx + itemsPerPage);

                          return (
                            <>
                              <table className="w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                                  <tr>
                                    <th className="p-4 rounded-l-xl">Book ID</th>
                                    <th className="p-4">Prefix Code</th>
                                    <th className="p-4">Textbook Title</th>
                                    <th className="p-4 rounded-r-xl text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {paginatedTextbooks.map(b => (
                                    <tr key={b.id} className="hover:bg-slate-50">
                                      <td className="p-4 font-bold text-slate-900 font-mono">{b.id}</td>
                                      <td className="p-4 font-mono font-black text-fuchsia-500 text-sm tracking-wider">{b.code}</td>
                                      <td className="p-4 text-xs font-semibold">{b.title}</td>
                                      <td className="p-4 text-right">
                                        <button
                                          onClick={() => handleDeleteTextbook(b.id)}
                                          className="p-1.5 bg-slate-50 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded-lg border border-slate-200 hover:border-red-900/50 transition-colors"
                                          title="Remove Textbook"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {/* Pagination Controls */}
                              <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 animate-fadeIn">
                                <span className="text-xs text-slate-500 font-bold">
                                  Showing Page {textbooksPage} of {totalPages} ({textbooks.length} total textbooks)
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setTextbooksPage(prev => Math.max(1, prev - 1))}
                                    disabled={textbooksPage === 1}
                                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                                  >
                                    Prev
                                  </button>
                                  <button
                                    onClick={() => setTextbooksPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={textbooksPage === totalPages}
                                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </>
                          );
                        })())}
                      </div>
                    </div>
                  </div>
                )}

              {activeTab === "colleges" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Add New College</h3>
                    <p className="text-xs text-slate-600">Register new colleges to enable unique mapped Access ID generation and automatic college assignment.</p>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setErrorMessage("");
                        setSuccessMessage("");
                        if (!newCollegeName.trim() || !newCollegeCode.trim()) {
                          setErrorMessage("Please fill out all college fields.");
                          return;
                        }
                        const res = addCollege({ name: newCollegeName, code: newCollegeCode });
                        if (!res.success) {
                          setErrorMessage(res.error || "Failed to add college.");
                          return;
                        }
                        setColleges(getColleges());
                        setNewCollegeName("");
                        setNewCollegeCode("");
                        setSuccessMessage(`College "${newCollegeName}" added successfully.`);
                      }} 
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">College Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Narayana College"
                          value={newCollegeName}
                          onChange={(e) => setNewCollegeName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Unique Abbreviation Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. NC"
                          value={newCollegeCode}
                          onChange={(e) => setNewCollegeCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-mono text-sm uppercase font-bold"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Used to generate unique mapped Access IDs (e.g., NC for Narayana College will produce LURNNCSC26001).</p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={18} />
                        Add College
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of Colleges */}
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Registered Colleges Registry</h3>
                    <div className="overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                          <tr>
                            <th className="p-4 rounded-l-xl">College Code</th>
                            <th className="p-4">College Name</th>
                            <th className="p-4 rounded-r-xl text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {(() => {
                            const filtered = colleges.filter(c => !adminCollegeFilter || c.code === adminCollegeFilter);
                            const itemsPerPage = 5;
                            const totalPages = Math.ceil(filtered.length / itemsPerPage);
                            const startIdx = (collegesPage - 1) * itemsPerPage;
                            const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage);

                            return paginatedItems.map(c => (
                              <tr key={c.code} className="hover:bg-slate-50">
                                <td className="p-4 font-bold text-slate-900 font-mono">{c.code}</td>
                                <td className="p-4 text-xs font-semibold">{c.name}</td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => {
                                      deleteCollege(c.code);
                                      setColleges(getColleges());
                                      setSuccessMessage(`College "${c.name}" deleted successfully.`);
                                    }}
                                    className="p-1.5 bg-slate-50 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded-lg border border-slate-200 hover:border-red-900/50 transition-colors"
                                    title="Remove College"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {(() => {
                      const filtered = colleges.filter(c => !adminCollegeFilter || c.code === adminCollegeFilter);
                      const itemsPerPage = 5;
                      const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                      if (filtered.length === 0) return null;

                      return (
                        <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 animate-fadeIn">
                          <span className="text-xs text-slate-500 font-bold">
                            Showing Page {collegesPage} of {totalPages} ({filtered.length} total colleges)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCollegesPage(prev => Math.max(1, prev - 1))}
                              disabled={collegesPage === 1}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                            >
                              Prev
                            </button>
                            <button
                              onClick={() => setCollegesPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={collegesPage === totalPages}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {activeTab === "coupons" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      {editingCouponCode ? `Edit Coupon: ${editingCouponCode}` : "Create New Coupon"}
                    </h3>
                    <p className="text-xs text-slate-600">Configure dynamic discount codes for specific textbooks and format requirements.</p>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setErrorMessage("");
                        setSuccessMessage("");
                        const cleanCode = newCouponCode.trim().toUpperCase();
                        if (!cleanCode) {
                          setErrorMessage("Coupon code cannot be empty.");
                          return;
                        }

                        let finalDiscount = 0;
                        let softPct: number | undefined = undefined;
                        let hardPct: number | undefined = undefined;

                        if (newCouponFormat === "both") {
                          softPct = parseInt(newCouponSoftDiscount);
                          hardPct = parseInt(newCouponHardDiscount);
                          if (isNaN(softPct) || softPct < 1 || softPct > 100) {
                            setErrorMessage("Soft Copy discount percentage must be between 1 and 100.");
                            return;
                          }
                          if (isNaN(hardPct) || hardPct < 1 || hardPct > 100) {
                            setErrorMessage("Hard Copy discount percentage must be between 1 and 100.");
                            return;
                          }
                          finalDiscount = softPct;
                        } else {
                          const percentage = parseInt(newCouponDiscount);
                          if (isNaN(percentage) || percentage < 1 || percentage > 100) {
                            setErrorMessage("Discount percentage must be between 1 and 100.");
                            return;
                          }
                          finalDiscount = percentage;
                          if (newCouponFormat === "soft") {
                            softPct = percentage;
                          } else {
                            hardPct = percentage;
                          }
                        }

                        if (newCouponBookIds.length === 0) {
                          setErrorMessage("Please select at least one applicable textbook.");
                          return;
                        }
                        
                        // Check duplicate (only if not editing)
                        if (!editingCouponCode && coupons.some(c => c.code.toUpperCase() === cleanCode)) {
                          setErrorMessage(`Coupon "${cleanCode}" already exists.`);
                          return;
                        }

                        saveCoupon({
                          code: cleanCode,
                          discountPercentage: finalDiscount,
                          bookId: newCouponBookIds.join(","),
                          applicableFormat: newCouponFormat,
                          softDiscountPercentage: softPct,
                          hardDiscountPercentage: hardPct
                        });

                        setNewCouponCode("");
                        setNewCouponDiscount("");
                        setNewCouponSoftDiscount("");
                        setNewCouponHardDiscount("");
                        setNewCouponBookIds([]);
                        setNewCouponFormat("both");
                        setEditingCouponCode(null);
                        setSuccessMessage(editingCouponCode ? `Coupon "${cleanCode}" updated successfully.` : `Coupon "${cleanCode}" created successfully.`);
                        setCoupons(getCoupons());
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Coupon Code</label>
                        <input
                          type="text"
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value)}
                          placeholder="e.g. SUMMER25"
                          disabled={!!editingCouponCode}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-955 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Applicable Format</label>
                        <select
                          value={newCouponFormat}
                          onChange={(e) => setNewCouponFormat(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-955 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 font-bold"
                        >
                          <option value="both">Both (Soft & Hard Copy)</option>
                          <option value="soft">Soft Copy Only</option>
                          <option value="physical">Hard Copy Only</option>
                        </select>
                      </div>

                      {newCouponFormat === "both" ? (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Soft Copy Discount (%)</label>
                            <input
                              type="number"
                              value={newCouponSoftDiscount}
                              onChange={(e) => setNewCouponSoftDiscount(e.target.value)}
                              placeholder="e.g. 15"
                              min="1"
                              max="100"
                              className="w-full bg-slate-50 border border-slate-200 text-slate-955 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Hard Copy Discount (%)</label>
                            <input
                              type="number"
                              value={newCouponHardDiscount}
                              onChange={(e) => setNewCouponHardDiscount(e.target.value)}
                              placeholder="e.g. 10"
                              min="1"
                              max="100"
                              className="w-full bg-slate-50 border border-slate-200 text-slate-955 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 font-medium"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Discount Percentage (%)</label>
                          <input
                            type="number"
                            value={newCouponDiscount}
                            onChange={(e) => setNewCouponDiscount(e.target.value)}
                            placeholder="e.g. 15"
                            min="1"
                            max="100"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-955 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 font-medium"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Applicable Textbooks / Subjects</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                          {textbooks.map(b => (
                            <label key={b.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-slate-950">
                              <input
                                type="checkbox"
                                checked={newCouponBookIds.includes(b.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewCouponBookIds([...newCouponBookIds, b.id]);
                                  } else {
                                    setNewCouponBookIds(newCouponBookIds.filter(id => id !== b.id));
                                  }
                                }}
                                className="rounded text-fuchsia-600 focus:ring-fuchsia-500 border-slate-300"
                              />
                              <span>{b.title} ({b.code})</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-grow bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          {editingCouponCode ? <Check size={14} /> : <Plus size={14} />}
                          <span>{editingCouponCode ? "Update Coupon" : "Create Coupon"}</span>
                        </button>
                        {editingCouponCode && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewCouponCode("");
                              setNewCouponDiscount("");
                              setNewCouponSoftDiscount("");
                              setNewCouponHardDiscount("");
                              setNewCouponBookIds([]);
                              setNewCouponFormat("both");
                              setEditingCouponCode(null);
                            }}
                            className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl transition active:scale-98"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Coupons List */}
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Active Coupons</h3>
                        <p className="text-xs text-slate-600">List of registered store discount coupons.</p>
                      </div>
                      <span className="bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 text-[10px] font-extrabold px-3 py-1 rounded-xl">
                        {coupons.length} Active
                      </span>
                    </div>

                    {coupons.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
                        <Tag className="mx-auto text-slate-300 mb-3" size={40} />
                        <p className="text-sm font-bold text-slate-700">No coupons registered yet.</p>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Use the form on the left to create dynamic promotional coupon codes.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-5 py-3">Code</th>
                              <th className="px-5 py-3">Discount</th>
                              <th className="px-5 py-3">Subject / Textbook</th>
                              <th className="px-5 py-3">Format</th>
                              <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {coupons.map((c) => {
                              const bookId = c.bookId || (c as any).book_id;
                              const discountPercentage = c.discountPercentage || (c as any).discount_percentage;
                              const applicableFormat = c.applicableFormat || (c as any).applicable_format || 'both';
                              
                              const allowedBookIds = bookId ? bookId.split(",").map((s: string) => s.trim()) : [];
                              const matchedBooks = textbooks.filter(b => allowedBookIds.includes(b.id));
                              const bookDisplayText = matchedBooks.length > 0
                                ? matchedBooks.map(b => `${b.title} (${b.code})`).join(", ")
                                : `Book ID: ${bookId}`;

                              return (
                                <tr key={c.code} className="hover:bg-slate-50/55 transition-colors">
                                  <td className="px-5 py-3.5 font-bold text-slate-900">{c.code}</td>
                                  <td className="px-5 py-3.5">
                                    {applicableFormat === 'both' ? (
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-slate-500 font-bold">Soft: <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 font-extrabold px-1 py-0.2 rounded">{c.softDiscountPercentage || (c as any).soft_discount_percentage || discountPercentage}% OFF</span></span>
                                        <span className="text-[10px] text-slate-500 font-bold">Hard: <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 font-extrabold px-1 py-0.2 rounded">{c.hardDiscountPercentage || (c as any).hard_discount_percentage || discountPercentage}% OFF</span></span>
                                      </div>
                                    ) : (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2 py-0.5 rounded text-[11px]">
                                        {discountPercentage}% OFF
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 max-w-[200px] truncate" title={bookDisplayText}>
                                    {bookDisplayText}
                                  </td>
                                  <td className="px-5 py-3.5 capitalize font-semibold text-slate-600">
                                    {applicableFormat === 'both' ? 'Soft & Hard' : applicableFormat === 'soft' ? 'Soft Copy' : 'Hard Copy'}
                                  </td>
                                  <td className="px-5 py-3.5 text-right space-x-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCouponCode(c.code);
                                        setNewCouponCode(c.code);
                                        setNewCouponFormat(applicableFormat);
                                        setNewCouponBookIds(allowedBookIds);
                                        if (applicableFormat === 'both') {
                                          setNewCouponSoftDiscount(String(c.softDiscountPercentage || (c as any).soft_discount_percentage || discountPercentage));
                                          setNewCouponHardDiscount(String(c.hardDiscountPercentage || (c as any).hard_discount_percentage || discountPercentage));
                                          setNewCouponDiscount("");
                                        } else {
                                          setNewCouponDiscount(String(discountPercentage));
                                          setNewCouponSoftDiscount("");
                                          setNewCouponHardDiscount("");
                                        }
                                        setErrorMessage("");
                                        setSuccessMessage("");
                                      }}
                                      className="text-fuchsia-600 hover:text-fuchsia-850 p-1.5 rounded-lg hover:bg-fuchsia-50 transition-colors"
                                      title="Edit Coupon"
                                    >
                                      <Edit size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: "Delete Coupon",
                                          message: `Are you sure you want to delete coupon code "${c.code}"? This will immediately remove this discount option in the bookstore checkout.`,
                                          confirmText: "Yes, Delete",
                                          cancelText: "Cancel",
                                          isDanger: true,
                                          onConfirm: () => {
                                            deleteCoupon(c.code);
                                            setCoupons(getCoupons());
                                            if (editingCouponCode === c.code) {
                                              setNewCouponCode("");
                                              setNewCouponDiscount("");
                                              setNewCouponSoftDiscount("");
                                              setNewCouponHardDiscount("");
                                              setNewCouponBookIds([]);
                                              setNewCouponFormat("both");
                                              setEditingCouponCode(null);
                                            }
                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                            setSuccessMessage(`Coupon "${c.code}" deleted successfully.`);
                                          }
                                        });
                                      }}
                                      className="text-red-500 hover:text-red-750 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                      title="Delete Coupon"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "adminCareerHub" && (
                <div className="space-y-6">
                  {/* Internal Tab Navigation */}
                  <div className="flex border-b border-slate-200 gap-1 pb-1">
                    <button
                      onClick={() => setAdminCareerSubTab("interviews")}
                      className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${
                        adminCareerSubTab === "interviews"
                          ? "bg-fuchsia-600 text-white shadow"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Interview Questions
                    </button>
                    <button
                      onClick={() => setAdminCareerSubTab("updates")}
                      className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${
                        adminCareerSubTab === "updates"
                          ? "bg-fuchsia-600 text-white shadow"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Company Updates
                    </button>
                  </div>

                  {adminCareerSubTab === "interviews" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left side form to add/edit interview question */}
                      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">
                          {editingQuestion ? "Edit Interview Question" : "Add Interview Question"}
                        </h3>
                        <p className="text-xs text-slate-600">
                          Provide student-facing career preparation material by detailing interview questions asked by top recruiters.
                        </p>
                        
                        <form onSubmit={handleSaveInterviewQuestion} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Company *</label>
                            <input
                              type="text"
                              placeholder="e.g. Google, Microsoft"
                              value={iqCompany}
                              onChange={(e) => setIqCompany(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Role / Designation</label>
                            <input
                              type="text"
                              placeholder="e.g. Frontend Engineer, Analyst"
                              value={iqRole}
                              onChange={(e) => setIqRole(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Difficulty</label>
                            <select
                              value={iqDifficulty}
                              onChange={(e) => setIqDifficulty(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-bold text-xs"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Question Text *</label>
                            <textarea
                              placeholder="Describe the coding challenge, logic puzzle, or behavioral question..."
                              value={iqQuestion}
                              onChange={(e) => setIqQuestion(e.target.value)}
                              rows={4}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs resize-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Suggested Answer / Explanation</label>
                            <textarea
                              placeholder="Optional solution code, notes or guidelines..."
                              value={iqAnswer}
                              onChange={(e) => setIqAnswer(e.target.value)}
                              rows={5}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-mono text-xs resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            {editingQuestion && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestion(null);
                                  setIqCompany("");
                                  setIqRole("");
                                  setIqQuestion("");
                                  setIqAnswer("");
                                  setIqDifficulty("Medium");
                                }}
                                className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="submit"
                              className="flex-1 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                            >
                              {editingQuestion ? "Update Question" : "Save Question"}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Right side list of questions */}
                      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="font-extrabold text-slate-900 text-base">Registered Interview Questions</h4>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                            {interviewQuestions.length} Questions
                          </span>
                        </div>
                        {interviewQuestions.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 space-y-2">
                            <Briefcase size={36} className="mx-auto text-slate-300 animate-pulse" />
                            <p className="text-xs font-semibold">No questions added yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {interviewQuestions.map((q) => (
                              <div key={q.id} className="border border-slate-200 rounded-2xl p-5 hover:border-fuchsia-500/30 transition-all space-y-3 bg-slate-50/50">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <span className="bg-fuchsia-100 text-fuchsia-700 text-[10px] font-black px-2.5 py-0.5 rounded-full mr-2">
                                      {q.company}
                                    </span>
                                    {q.role && (
                                      <span className="text-xs text-slate-500 font-bold mr-2">
                                        ({q.role})
                                      </span>
                                    )}
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                      q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>
                                      {q.difficulty || "Medium"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditInterviewQuestion(q)}
                                      className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 px-2 py-1 bg-fuchsia-50 rounded-lg border border-fuchsia-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteInterviewQuestion(q.id)}
                                      className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1 bg-red-50 rounded-lg border border-red-100"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-800 text-xs font-semibold whitespace-pre-wrap">{q.questionText}</p>
                                {q.answerText && (
                                  <div className="pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Answer / Explanation</span>
                                    <pre className="bg-slate-100 p-3 rounded-xl text-[10px] font-mono overflow-x-auto text-slate-700 max-h-40 whitespace-pre-wrap">{q.answerText}</pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left side form for updates */}
                      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">
                          {editingUpdate ? "Edit Company Update" : "Add Company Update"}
                        </h3>
                        <p className="text-xs text-slate-600">
                          Publish corporate news, hiring drives, internship announcements or technological updates in bullet points.
                        </p>
                        
                        <form onSubmit={handleSaveCompanyUpdate} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Company Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Amazon, Infosys"
                              value={cuCompany}
                              onChange={(e) => setCuCompany(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Updates (One per line) *</label>
                            <textarea
                              placeholder="Enter updates. Press Enter for each new bullet point..."
                              value={cuBullets}
                              onChange={(e) => setCuBullets(e.target.value)}
                              rows={8}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs resize-none"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            {editingUpdate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUpdate(null);
                                  setCuCompany("");
                                  setCuBullets("");
                                }}
                                className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="submit"
                              className="flex-1 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                            >
                              {editingUpdate ? "Update News" : "Publish News"}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Right side list of updates */}
                      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h4 className="font-extrabold text-slate-900 text-base">Published Updates</h4>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                            {companyUpdates.length} Updates
                          </span>
                        </div>
                        {companyUpdates.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 space-y-2">
                            <Newspaper size={36} className="mx-auto text-slate-300 animate-pulse" />
                            <p className="text-xs font-semibold">No company updates published yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {companyUpdates.map((u) => (
                              <div key={u.id} className="border border-slate-200 rounded-2xl p-5 hover:border-fuchsia-500/30 transition-all space-y-3 bg-slate-50/50">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <h5 className="font-black text-slate-950 text-sm">{u.company}</h5>
                                    <span className="text-[10px] text-slate-400 font-semibold block">
                                      Published: {new Date(u.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditCompanyUpdate(u)}
                                      className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 px-2 py-1 bg-fuchsia-50 rounded-lg border border-fuchsia-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCompanyUpdate(u.id)}
                                      className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1 bg-red-50 rounded-lg border border-red-100"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                                  {u.updates.map((bullet, idx) => (
                                    <li key={idx} className="font-medium leading-relaxed">{bullet}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "payments" && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  {(() => {
                    const paidOnly = adminAllOrders.filter(p => p.status === "PAID");
                    const totalRevenueAmt = paidOnly.reduce((sum, p) => sum + p.amount, 0);
                    const paidOrders = paidOnly.length;
                    const pendingOrders = adminAllOrders.filter(p => p.status === "PENDING" || p.status === "PENDING_PAYMENT").length;
                    const totalOrders = adminAllOrders.length;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
                            ₹
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Total Revenue</span>
                            <span className="text-2xl font-black text-slate-900">₹{totalRevenueAmt.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/60 rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-650/10 text-indigo-600 flex items-center justify-center">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Paid Orders</span>
                            <span className="text-2xl font-black text-slate-900">{paidOrders}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-amber-600/10 text-amber-700 flex items-center justify-center">
                            <Clock size={24} />
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Pending Orders</span>
                            <span className="text-2xl font-black text-slate-900">{pendingOrders}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/50 border border-fuchsia-200/60 rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-fuchsia-600/10 text-fuchsia-600 flex items-center justify-center">
                            <List size={24} />
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider block">Total Orders</span>
                            <span className="text-2xl font-black text-slate-900">{totalOrders}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Filter and Search Section */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Search */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Search size={16} />
                        </span>
                        <input
                          type="text"
                          placeholder="Search name, email, order ID..."
                          value={purchaseSearch}
                          onChange={(e) => { setPurchaseSearch(e.target.value); setPaymentsPage(1); }}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all text-slate-900 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Status Filter */}
                      <div>
                        <select
                          value={purchaseStatusFilter}
                          onChange={(e) => { setPurchaseStatusFilter(e.target.value); setPaymentsPage(1); }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all text-slate-900"
                        >
                          <option value="all">All Payment Statuses</option>
                          <option value="PAID">PAID</option>
                          <option value="PENDING">PENDING</option>
                          <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                        </select>
                      </div>

                      {/* Format Filter */}
                      <div>
                        <select
                          value={purchaseFormatFilter}
                          onChange={(e) => { setPurchaseFormatFilter(e.target.value); setPaymentsPage(1); }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all text-slate-900"
                        >
                          <option value="all">All Formats</option>
                          <option value="soft">Soft Copy (Digital)</option>
                          <option value="physical">Hard Copy (Physical)</option>
                          <option value="rental">Rental (Digital)</option>
                          <option value="upgrade">Upgrade</option>
                        </select>
                      </div>

                      {/* Book Filter */}
                      <div>
                        <select
                          value={purchaseBookFilter}
                          onChange={(e) => { setPurchaseBookFilter(e.target.value); setPaymentsPage(1); }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all text-slate-900"
                        >
                          <option value="all">All Textbooks</option>
                          <option value="1">Indian Mineral Import Policy Options</option>
                          <option value="2">Machine Learning</option>
                          <option value="3">Database Management Systems</option>
                          <option value="5">Principles of Microeconomics for Business and Management</option>
                          <option value="6">Foundations of Artificial Intelligence</option>
                          <option value="7">Data Streaming and Analysis</option>
                          <option value="8">Python Programming</option>
                          <option value="9">NoSQL Databases Using MongoDB</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Bookstore Payment Orders</h3>
                    <p className="text-xs text-slate-500 mb-6">List of verified payments and pending checkouts processed via Cashfree Payment Gateway.</p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                          <tr>
                            <th className="p-4 rounded-l-xl">Order Date</th>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer Details</th>
                            <th className="p-4">Textbook Details</th>
                            <th className="p-4">Format / Plan</th>
                            <th className="p-4">Amount Paid</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 rounded-r-xl text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const filtered = adminAllOrders.filter(p => {
                              const term = purchaseSearch.toLowerCase().trim();
                              const matchesSearch = !term ||
                                (p.customerName || "").toLowerCase().includes(term) ||
                                (p.customerEmail || "").toLowerCase().includes(term) ||
                                (p.customerPhone || "").toLowerCase().includes(term) ||
                                (p.orderId || "").toLowerCase().includes(term) ||
                                (p.cashfreePaymentId || "").toLowerCase().includes(term);

                              const matchesStatus = purchaseStatusFilter === "all" || p.status === purchaseStatusFilter;
                              const matchesFormat = purchaseFormatFilter === "all" || p.purchaseFormat === purchaseFormatFilter;
                              const matchesBook = purchaseBookFilter === "all" || p.bookId === purchaseBookFilter;

                              return matchesSearch && matchesStatus && matchesFormat && matchesBook;
                            }).sort((a, b) => {
                              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                              return dateB - dateA; // newest first
                            });

                            const itemsPerPage = 8;
                            const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                            const startIdx = (paymentsPage - 1) * itemsPerPage;
                            const paginated = filtered.slice(startIdx, startIdx + itemsPerPage);

                            if (paginated.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                                    No payment records found matching the filters.
                                  </td>
                                </tr>
                              );
                            }

                            const bookTitlesMap: Record<string, string> = {
                              "1": "Mineral Policy",
                              "2": "Machine Learning",
                              "3": "DBMS",
                              "5": "Microeconomics",
                              "6": "AI",
                              "7": "Data Streaming",
                              "8": "Python Programming",
                              "9": "NoSQL"
                            };

                            return paginated.map(p => {
                              const isExpanded = expandedOrderId === p.orderId;
                              const orderDateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              }) : "N/A";

                              // Soft copy, upgrade, and rental orders are all digital (no shipping) and
                              // are all priced the same way: subtotal + 18% GST + 2% online fee.
                              const isSoftOrUpgrade = p.purchaseFormat === "soft" || p.purchaseFormat === "upgrade";
                              const isRental = p.purchaseFormat === "rental";
                              const isDigitalDelivery = isSoftOrUpgrade || isRental;
                              const computedTotal = isDigitalDelivery
                                ? ((p.subtotal || 0) - (p.discountAmount || 0) + (p.gstAmount || 0) + Math.round(((p.subtotal || 0) - (p.discountAmount || 0) + (p.gstAmount || 0)) * 0.02))
                                : ((p.subtotal || 0) - (p.discountAmount || 0) + (p.shippingAmount || 0));

                              return (
                                <React.Fragment key={p.id}>
                                  <tr className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setExpandedOrderId(isExpanded ? null : p.orderId)}>
                                    <td className="p-4 text-xs font-semibold text-slate-500">{orderDateStr}</td>
                                    <td className="p-4 font-mono font-bold text-xs text-slate-900">{p.orderId}</td>
                                    <td className="p-4">
                                      <div className="font-bold text-slate-900">{p.customerName || "N/A"}</div>
                                      <div className="text-xs text-slate-500">{p.customerPhone || p.userIdentifier}</div>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-slate-800">
                                      {p.bookId === "CART" ? "Multiple Items (Cart)" : (bookTitlesMap[p.bookId] || `Book ID: ${p.bookId}`)}
                                    </td>
                                    <td className="p-4 capitalize text-xs">
                                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                        isRental
                                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                          : isSoftOrUpgrade ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                      }`}>
                                        {isRental ? "Rental" : isSoftOrUpgrade ? (p.purchaseFormat === "upgrade" ? "Upgrade" : "Soft Copy") : "Hard Copy"}
                                      </span>
                                      {p.purchasePlan && p.purchasePlan !== "physical" && (
                                        <div className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">{(p.purchasePlan || "").replace(/_/g, " ")}</div>
                                      )}
                                    </td>
                                    <td className="p-4 font-bold text-slate-900">₹{computedTotal}</td>
                                    <td className="p-4">
                                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                        p.status === "PAID" ? "text-emerald-600" : "text-amber-500"
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === "PAID" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                        {p.status}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right text-fuchsia-600 font-bold text-xs">
                                      {isExpanded ? <ChevronUp size={16} className="inline" /> : <ChevronDown size={16} className="inline" />}
                                    </td>
                                  </tr>

                                  {isExpanded && (
                                    <tr className="bg-slate-50/50">
                                      <td colSpan={8} className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
                                          {/* Customer Details Box */}
                                          <div className="space-y-3">
                                            <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Customer & Shipping Information</h4>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-slate-400 font-bold">Email:</span>
                                              <span className="col-span-2 text-slate-800 font-semibold"><a href={`mailto:${p.customerEmail}`} className="underline hover:text-fuchsia-600">{p.customerEmail || "N/A"}</a></span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-slate-400 font-bold">Phone:</span>
                                              <span className="col-span-2 text-slate-800 font-mono font-semibold">{p.customerPhone || "N/A"}</span>
                                            </div>
                                            {!isDigitalDelivery ? (
                                              <>
                                                <div className="grid grid-cols-3 gap-1">
                                                  <span className="text-slate-400 font-bold">Address:</span>
                                                  <span className="col-span-2 text-slate-800 font-semibold leading-relaxed">{p.shippingAddress || "N/A"}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-1">
                                                  <span className="text-slate-400 font-bold">City/State:</span>
                                                  <span className="col-span-2 text-slate-800 font-semibold">{p.city}, {p.state} - {p.shippingPincode}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-1">
                                                  <span className="text-slate-400 font-bold">Country:</span>
                                                  <span className="col-span-2 text-slate-800 font-semibold">{p.country || "India"}</span>
                                                </div>
                                              </>
                                            ) : (
                                              <div className={`p-3 rounded-xl border font-bold flex items-center gap-2 ${
                                                isRental ? "bg-indigo-50/50 text-indigo-700 border-indigo-100/50" : "bg-fuchsia-50/50 text-fuchsia-700 border-fuchsia-100/50"
                                              }`}>
                                                <span>{isRental ? "⏱️" : "💻"}</span>
                                                <span>{isRental ? "Digital Rental. Time-limited access activated instantly." : "Digital Delivery. Student Access Activated instantly."}</span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Payment Details Box */}
                                          <div className="space-y-3">
                                            <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Order Pricing & Transaction</h4>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-slate-400 font-bold">Subtotal:</span>
                                              <span className="col-span-2 text-slate-800 font-semibold">₹{p.subtotal}</span>
                                            </div>
                                            {p.discountAmount ? (
                                              <div className="grid grid-cols-3 gap-1">
                                                <span className="text-slate-400 font-bold">Discount:</span>
                                                <span className="col-span-2 text-red-500 font-bold">-₹{p.discountAmount} {p.couponCode && `(${p.couponCode})`}</span>
                                              </div>
                                            ) : null}
                                            {isDigitalDelivery ? (
                                              <>
                                                <div className="grid grid-cols-3 gap-1">
                                                  <span className="text-slate-400 font-bold">GST (18%):</span>
                                                  <span className="col-span-2 text-slate-800 font-semibold">₹{p.gstAmount || 0}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-1">
                                                  <span className="text-slate-400 font-bold">Online Charges (2%):</span>
                                                  <span className="col-span-2 text-slate-800 font-semibold">₹{Math.round(((p.subtotal || 0) - (p.discountAmount || 0) + (p.gstAmount || 0)) * 0.02)}</span>
                                                </div>
                                              </>
                                            ) : (
                                              <div className="grid grid-cols-3 gap-1">
                                                <span className="text-slate-400 font-bold">Shipping:</span>
                                                <span className="col-span-2 text-slate-800 font-semibold">₹{p.shippingAmount || 0}</span>
                                              </div>
                                            )}
                                            <div className="grid grid-cols-3 gap-1 border-t border-slate-100 pt-2 font-bold">
                                              <span className="text-slate-900">Total Price:</span>
                                              <span className="col-span-2 text-fuchsia-600 text-sm">₹{computedTotal}</span>
                                            </div>
                                            
                                            <div className="border-t border-slate-100 pt-2 space-y-1.5">
                                              <div className="grid grid-cols-3 gap-1">
                                                <span className="text-slate-400 font-bold">Cashfree Pay ID:</span>
                                                <span className="col-span-2 text-slate-600 font-mono select-all font-semibold">{p.cashfreePaymentId || "N/A"}</span>
                                              </div>
                                              {p.accessId && (
                                                <div className="grid grid-cols-3 gap-1">
                                                  <span className="text-indigo-550 font-extrabold">Student Access ID:</span>
                                                  <span className="col-span-2 text-indigo-600 font-mono select-all font-black bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md inline-block w-fit">{p.accessId}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {(() => {
                      const filtered = adminAllOrders.filter(p => {
                        const term = purchaseSearch.toLowerCase().trim();
                        const matchesSearch = !term ||
                          (p.customerName || "").toLowerCase().includes(term) ||
                          (p.customerEmail || "").toLowerCase().includes(term) ||
                          (p.customerPhone || "").toLowerCase().includes(term) ||
                          (p.orderId || "").toLowerCase().includes(term) ||
                          (p.cashfreePaymentId || "").toLowerCase().includes(term);

                        const matchesStatus = purchaseStatusFilter === "all" || p.status === purchaseStatusFilter;
                        const matchesFormat = purchaseFormatFilter === "all" || p.purchaseFormat === purchaseFormatFilter;
                        const matchesBook = purchaseBookFilter === "all" || p.bookId === purchaseBookFilter;

                        return matchesSearch && matchesStatus && matchesFormat && matchesBook;
                      });

                      const itemsPerPage = 8;
                      const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                      if (filtered.length === 0) return null;

                      return (
                        <div className="flex items-center justify-between border-t border-slate-150 pt-4 mt-4">
                          <span className="text-xs text-slate-500 font-bold">
                            Showing page {paymentsPage} of {totalPages} ({filtered.length} total orders)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={paymentsPage === 1}
                              onClick={() => setPaymentsPage(prev => Math.max(1, prev - 1))}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                              Prev
                            </button>
                            <button
                              disabled={paymentsPage === totalPages}
                              onClick={() => setPaymentsPage(prev => Math.min(totalPages, prev + 1))}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              {activeTab === "adminProfile" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xl font-bold text-slate-900">Admin Account Details</h4>
                      {!isEditingProfile && !profileOtpSent && (
                        <button
                          type="button"
                          onClick={() => {
                            const adminCreds = getAdminCredentials();
                            setAdminProfileEdit({
                              name: user?.name || adminCreds.name || "Administrator",
                              accessId: user?.accessId || adminCreds.accessId || "LURNEXA",
                              mobileNumber: user?.mobileNumber || adminCreds.mobileNumber || "9347834904",
                              email: user?.collegeEmail || adminCreds.email || "lurnexapublication@gmail.com"
                            });
                            setIsEditingProfile(true);
                          }}
                          className="bg-slate-950 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                          Edit Profile Details
                        </button>
                      )}
                    </div>

                    {profileOtpSent ? (
                      /* OTP Verification Screen */
                      <div className="max-w-md mx-auto py-6 text-center space-y-6 animate-fadeIn">
                        <div className="w-14 h-14 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto text-fuchsia-600">
                          <Shield size={24} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-slate-900">Verify Admin Profile Changes</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            A verification code has been sent to your updated mobile number <span className="font-bold text-slate-800">{adminProfileEdit.mobileNumber}</span> and email address <span className="font-bold text-slate-800">{adminProfileEdit.email}</span>. Enter the 6-digit code below to finalize.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between gap-2 max-w-xs mx-auto mb-2">
                            {Array.from({ length: 6 }).map((_, index) => {
                              const char = profileOtpInput[index] || "";
                              return (
                                <input
                                  key={index}
                                  id={`admin-profile-otp-digit-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={char}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    const updated = profileOtpInput.split("");
                                    while (updated.length < 6) updated.push("");
                                    updated[index] = val;
                                    const newOtp = updated.join("").slice(0, 6);
                                    setProfileOtpInput(newOtp);

                                    if (val && index < 5) {
                                      const nextInput = document.getElementById(`admin-profile-otp-digit-${index + 1}`);
                                      if (nextInput) nextInput.focus();
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                      if (!char && index > 0) {
                                        const prevInput = document.getElementById(`admin-profile-otp-digit-${index - 1}`);
                                        if (prevInput) {
                                          prevInput.focus();
                                          const updated = profileOtpInput.split("");
                                          updated[index - 1] = "";
                                          setProfileOtpInput(updated.join(""));
                                        }
                                      } else {
                                        const updated = profileOtpInput.split("");
                                        updated[index] = "";
                                        setProfileOtpInput(updated.join(""));
                                      }
                                    }
                                  }}
                                  className="w-10 h-12 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl text-center font-bold text-lg focus:outline-none focus:border-fuchsia-500 transition-colors shadow-sm"
                                />
                              );
                            })}
                          </div>

                          <div className="flex gap-3 justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setProfileOtpSent(false);
                                setProfileOtpInput("");
                                setProfileGeneratedOtp("");
                              }}
                              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleVerifyAdminProfileUpdate}
                              className="px-4 py-2 bg-fuchsia-600 text-white hover:bg-fuchsia-700 rounded-xl text-xs font-bold transition shadow-md"
                            >
                              Verify & Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : isEditingProfile ? (
                      /* Editing Mode Form */
                      <form onSubmit={handleInitiateAdminProfileUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Admin Name</label>
                            <input
                              type="text"
                              value={adminProfileEdit.name}
                              onChange={(e) => setAdminProfileEdit({ ...adminProfileEdit, name: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Access ID</label>
                            <input
                              type="text"
                              value={adminProfileEdit.accessId}
                              onChange={(e) => setAdminProfileEdit({ ...adminProfileEdit, accessId: e.target.value.toUpperCase() })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-mono font-bold uppercase tracking-wide"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mobile Number</label>
                            <input
                              type="text"
                              value={adminProfileEdit.mobileNumber}
                              onChange={(e) => setAdminProfileEdit({ ...adminProfileEdit, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input
                              type="email"
                              value={adminProfileEdit.email}
                              onChange={(e) => setAdminProfileEdit({ ...adminProfileEdit, email: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
                          >
                            Save Details
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Display Mode */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Admin Name</span>
                          <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Number</span>
                          <span className="text-sm font-bold text-slate-900">{user?.mobileNumber}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email Address</span>
                          <span className="text-sm font-bold text-slate-900">{user?.collegeEmail || "lurnexapublication@gmail.com"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <ChangePasswordCard
                    showChangePassword={showChangePassword}
                    onOpen={openChangePassword}
                    oldPasswordInput={oldPasswordInput}
                    setOldPasswordInput={setOldPasswordInput}
                    newPasswordInput={newPasswordInput}
                    setNewPasswordInput={setNewPasswordInput}
                    confirmPasswordInput={confirmPasswordInput}
                    setConfirmPasswordInput={setConfirmPasswordInput}
                    showOldPasswordInput={showOldPasswordInput}
                    setShowOldPasswordInput={setShowOldPasswordInput}
                    showNewPasswordInput={showNewPasswordInput}
                    setShowNewPasswordInput={setShowNewPasswordInput}
                    changePasswordError={changePasswordError}
                    changePasswordSuccess={changePasswordSuccess}
                    isChangingPassword={isChangingPassword}
                    resetChangePasswordForm={resetChangePasswordForm}
                    handleChangePassword={handleChangePassword}
                  />
                </div>
              )}
            </div>
          )}

          {/* The faculty dashboard (quiz tools, student roster) has no reading library of its
              own — the app is scoped to reading, so point faculty back to the full portal. */}
          {appMode && user?.role === "faculty" && (
            <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
                <BookOpenCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Faculty Tools Aren't in the App</h2>
              <p className="text-sm text-slate-500">This installed app is for reading purchased and rented textbooks. Quiz creation and student results are on the full portal instead.</p>
              <div className="flex flex-col gap-2 pt-2">
                <a href="/textbooks/portal/login" className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm px-5 py-3 rounded-xl transition">Open Full Portal</a>
                <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 font-bold text-xs py-2 transition">Logout</button>
              </div>
            </div>
          )}

          {/* --- FACULTY DASHBOARD --- */}
          {!appMode && user?.role === "faculty" && (
            <div className="space-y-6">
              {/* Faculty Tabs */}
               <div className="flex border-b border-slate-200 flex-wrap w-full gap-1">
                <button
                  onClick={() => { setActiveTab("create"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === "create" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Plus size={16} />
                  Assemble Custom Quiz
                </button>
                <button
                  onClick={() => { setActiveTab("results"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === "results" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileSpreadsheet size={16} />
                  View Quiz Results
                </button>
                <button
                  onClick={() => { setActiveTab("students"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); setSelectedStudentDetails(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === "students" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users size={16} />
                  My Students
                </button>
                <button
                  onClick={() => { setActiveTab("profile"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === "profile" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User size={16} />
                  My Profile
                </button>
              </div>

              {/* Tab 1: Create Quiz */}
              {activeTab === "create" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Build Form & Manual Question Builder */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5">
                    <h3 className="text-xl font-bold text-slate-900">Quiz Constructor</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Quiz Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Midterm Quiz - Chapter 3"
                          value={newQuizTitle}
                          onChange={(e) => setNewQuizTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Assessment Type</label>
                          <select
                            value={newQuizType}
                            onChange={(e) => {
                              const val = e.target.value as 'mcq' | 'written';
                              setNewQuizType(val);
                              setNewQuizQuestions([]); // Clear questions to match new type
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          >
                            <option value="mcq">MCQ (Quiz)</option>
                            <option value="written">Written Test</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Questions Count</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 5"
                            value={newQuizQuestionsLimit || ""}
                            onChange={(e) => {
                              const limit = Math.max(1, parseInt(e.target.value) || 1);
                              setNewQuizQuestionsLimit(limit);
                              if (newQuizQuestions.length > limit) {
                                setNewQuizQuestions(newQuizQuestions.slice(0, limit));
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Duration (mins)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 for untimed"
                            value={newQuizDuration || ""}
                            onChange={(e) => setNewQuizDuration(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Start Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={newQuizStartTime}
                            onChange={(e) => setNewQuizStartTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">End Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={newQuizEndTime}
                            onChange={(e) => setNewQuizEndTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-sm shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Textbook Mapping</label>
                        <div className="bg-slate-50 border border-slate-200 text-fuchsia-500 font-bold px-4 py-2.5 rounded-xl text-sm">
                          {textbooks.find(b => b.id === newQuizBookId)?.title || `Book ${newQuizBookId}`} (Locked to your Access ID)
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Covered Chapters</label>
                        <div className="flex flex-wrap gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          {Array.from({ length: getBookChapters(newQuizBookId) }, (_, i) => i + 1).map(ch => {
                            const isChecked = newQuizChapters.includes(ch);
                            return (
                              <label key={ch} className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      if (newQuizChapters.length > 1) {
                                        const updated = newQuizChapters.filter(c => c !== ch);
                                        setNewQuizChapters(updated);
                                        setNewQuizQuestions([]);
                                        setManualQuestion(prev => ({ ...prev, chapter: updated[0] || 1 }));
                                      }
                                    } else {
                                      const updated = [...newQuizChapters, ch];
                                      setNewQuizChapters(updated);
                                      setNewQuizQuestions([]);
                                      setManualQuestion(prev => ({ ...prev, chapter: updated[0] || 1 }));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-slate-200 text-fuchsia-500 focus:ring-fuchsia-500 bg-slate-50"
                                />
                                <span>Ch {ch}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-white text-sm">Add Individual Question</h4>
                          <button
                            type="button"
                            disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                            onClick={handleOpenImportModal}
                            className="bg-fuchsia-600/10 hover:bg-fuchsia-600/25 border border-fuchsia-500/20 text-fuchsia-600 text-xs font-black px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Import from Admin Bank
                          </button>
                        </div>

                        <form onSubmit={handleAddManualQuestion} className="space-y-3">
                          <textarea
                            placeholder={newQuizQuestions.length >= newQuizQuestionsLimit ? "Question limit reached." : "Question text..."}
                            disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                            value={manualQuestion.questionText}
                            onChange={(e) => setManualQuestion({ ...manualQuestion, questionText: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            rows={2}
                          />

                          {newQuizType === 'mcq' ? (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Option A"
                                  disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                  value={manualQuestion.optionA}
                                  onChange={(e) => setManualQuestion({ ...manualQuestion, optionA: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <input
                                  type="text"
                                  placeholder="Option B"
                                  disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                  value={manualQuestion.optionB}
                                  onChange={(e) => setManualQuestion({ ...manualQuestion, optionB: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <input
                                  type="text"
                                  placeholder="Option C"
                                  disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                  value={manualQuestion.optionC}
                                  onChange={(e) => setManualQuestion({ ...manualQuestion, optionC: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <input
                                  type="text"
                                  placeholder="Option D"
                                  disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                  value={manualQuestion.optionD}
                                  onChange={(e) => setManualQuestion({ ...manualQuestion, optionD: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                              </div>

                              <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">Chapter:</span>
                                    <select
                                      disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                      value={manualQuestion.chapter}
                                      onChange={(e) => setManualQuestion({ ...manualQuestion, chapter: parseInt(e.target.value) })}
                                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {newQuizChapters.map(ch => (
                                        <option key={ch} value={ch}>Ch {ch}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">Correct:</span>
                                    <select
                                      disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                      value={manualQuestion.correctOption}
                                      onChange={(e) => setManualQuestion({ ...manualQuestion, correctOption: e.target.value as "A" | "B" | "C" | "D" })}
                                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <option value="A">A</option>
                                      <option value="B">B</option>
                                      <option value="C">C</option>
                                      <option value="D">D</option>
                                    </select>
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                  className="bg-slate-100 hover:bg-slate-200 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
                                >
                                  Add Question
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between items-center gap-4">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-600 font-bold uppercase">Chapter:</span>
                                  <select
                                    disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                    value={manualQuestion.chapter}
                                    onChange={(e) => setManualQuestion({ ...manualQuestion, chapter: parseInt(e.target.value) })}
                                    className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {newQuizChapters.map(ch => (
                                      <option key={ch} value={ch}>Ch {ch}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-600 font-bold uppercase">Marks:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                    value={manualQuestion.maxMarks || 5}
                                    onChange={(e) => setManualQuestion({ ...manualQuestion, maxMarks: Math.max(1, parseInt(e.target.value) || 1) })}
                                    className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1 text-center font-bold text-xs w-16 disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              <button
                                type="submit"
                                disabled={newQuizQuestions.length >= newQuizQuestionsLimit}
                                className="bg-slate-100 hover:bg-slate-200 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50"
                              >
                                Add Written Question
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quiz Summary & Publish */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Quiz Layout</h3>
                          <p className="text-xs text-slate-600">Review and re-order questions before compiling the final quiz.</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <span className="bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-500/20 text-xs font-bold px-3 py-1 rounded-xl">
                            {newQuizQuestions.length} / {newQuizQuestionsLimit} Qs
                          </span>
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold px-3 py-1 rounded-xl">
                            {newQuizQuestions.reduce((acc, q) => acc + (q.maxMarks || (newQuizType === 'written' ? 5 : 1)), 0)} Total Marks
                          </span>
                        </div>
                      </div>

                      {publishedQuizCode && (
                        <div className="bg-green-950/40 border border-green-500/30 p-6 rounded-2xl mb-6 text-center space-y-3 animate-scaleIn">
                          <CheckCircle2 size={36} className="text-green-400 mx-auto" />
                          <h4 className="font-extrabold text-slate-900 text-lg">Quiz Compiled Successfully!</h4>
                          <p className="text-xs text-slate-600">Share this unique code with students so they can join and attempt:</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="bg-slate-50 text-fuchsia-500 font-mono font-black text-2xl px-6 py-3 rounded-xl border border-slate-200 tracking-wider shadow-inner">
                              {publishedQuizCode}
                            </span>
                            <button
                              onClick={async () => {
                                await copyToClipboard(publishedQuizCode);
                                showToast("Quiz code copied to clipboard!", 'success');
                              }}
                              className="p-3 bg-slate-50 hover:bg-slate-850 rounded-xl text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                              title="Copy Code"
                            >
                              <Clipboard size={18} />
                            </button>
                          </div>

                          {notifiedStudents.length > 0 ? (
                            <div className="mt-4 p-3 bg-fuchsia-50 border border-fuchsia-100 rounded-xl text-left animate-fadeIn">
                              <div className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-wider mb-1">
                                Simulated Email Notifications Sent
                              </div>
                              <p className="text-[11px] text-slate-700">
                                Email notifications containing the quiz code <b>{publishedQuizCode}</b> have been sent to your <b>{notifiedStudents.length}</b> assigned students:
                              </p>
                              <div className="mt-1 text-[10px] text-slate-500 font-mono max-h-[80px] overflow-y-auto">
                                {notifiedStudents.join(", ")}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-left animate-fadeIn">
                              <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">
                                No Assigned Students Found
                              </div>
                              <p className="text-[11px] text-slate-700">
                                No students have assigned you as their teaching faculty yet.
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => setPublishedQuizCode("")}
                            className="text-xs text-slate-600 hover:text-slate-900 underline font-medium block mx-auto mt-2"
                          >
                            Create another quiz
                          </button>
                        </div>
                      )}

                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {newQuizQuestions.length === 0 ? (
                          <div className="text-center text-slate-500 py-16 text-sm">
                            No questions added yet. Construct a manual question or click "Import from Admin Bank".
                          </div>
                        ) : (
                          newQuizQuestions.map((q, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl relative flex gap-4">
                              <div className="font-bold text-fuchsia-500">{idx + 1}.</div>
                              <div className="flex-1 space-y-1">
                                <div className="font-semibold text-slate-900 text-sm leading-tight pr-6">{q.questionText}</div>
                                {newQuizType === 'mcq' && (
                                  <>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                                      <div>A: {q.optionA}</div>
                                      <div>B: {q.optionB}</div>
                                      <div>C: {q.optionC}</div>
                                      <div>D: {q.optionD}</div>
                                    </div>
                                    <div className="text-[10px] text-green-400 font-bold uppercase">
                                      Correct Option: {q.correctOption}
                                    </div>
                                  </>
                                )}
                                {newQuizType === 'written' && (
                                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-900/60">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Marks:</span>
                                    <input
                                      type="number"
                                      min="1"
                                      value={q.maxMarks || 5}
                                      onChange={(e) => {
                                        const updated = [...newQuizQuestions];
                                        updated[idx] = { 
                                          ...updated[idx], 
                                          maxMarks: Math.max(1, parseInt(e.target.value) || 1) 
                                        };
                                        setNewQuizQuestions(updated);
                                      }}
                                      className="bg-white border border-slate-200 text-slate-900 rounded px-2 py-0.5 text-center font-bold text-[10px] w-14 focus:outline-none focus:border-fuchsia-500"
                                    />
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveBuildingQuestion(idx)}
                                className="p-1.5 text-slate-500 hover:text-red-400 self-start hover:bg-white rounded-lg transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {!publishedQuizCode && (
                      <button
                        onClick={handlePublishQuiz}
                        disabled={newQuizQuestions.length !== newQuizQuestionsLimit}
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-50 disabled:text-slate-600 text-white font-bold py-3.5 rounded-2xl shadow-lg mt-6 transition-all"
                      >
                        Publish Quiz & Generate Code ({newQuizQuestions.length} / {newQuizQuestionsLimit})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: View Results */}
              {activeTab === "results" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
                  {!selectedFacultyQuiz ? (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Active Quizzes</h3>
                      <p className="text-xs text-slate-600 mb-6">Select a quiz below to review student attempts and aggregate scores.</p>
                      
                      {facultyQuizzes.length === 0 ? (
                        <div className="text-center text-slate-500 py-16 text-sm">
                          You haven't published any quizzes yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {facultyQuizzes.map(q => {
                            const attemptsCount = getAttemptsForQuiz(q.quizCode).length;
                            return (
                              <div
                                key={q.quizCode}
                                onClick={() => handleViewQuizAttempts(q)}
                                className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-fuchsia-500/50 cursor-pointer transition-all duration-300 group flex justify-between items-start"
                              >
                                <div className="space-y-2">
                                  <div className="inline-flex bg-fuchsia-500/10 text-fuchsia-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                                    {q.quizCode}
                                  </div>
                                  <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-fuchsia-500 transition-colors">
                                    {q.title}
                                  </h4>
                                  <div className="text-xs text-slate-600">
                                    Total Questions: {q.questions.length} | Book: {textbooks.find(b => b.id === q.bookId)?.title || q.bookId}
                                  </div>
                                </div>

                                <div className="text-right space-y-1">
                                  <div className="text-lg font-black text-slate-900">{attemptsCount}</div>
                                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Attempts</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <button
                        onClick={() => setSelectedFacultyQuiz(null)}
                        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-white font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <ArrowLeft size={14} />
                        Back to Quizzes
                      </button>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                        <div>
                          <div className="inline-flex bg-fuchsia-500/10 text-fuchsia-500 text-xs font-bold px-2.5 py-1 rounded-lg uppercase font-mono mb-2">
                            {selectedFacultyQuiz.quizCode}
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 leading-tight">
                            {selectedFacultyQuiz.title}
                          </h3>
                        </div>

                        <div className="flex gap-6">
                          <div className="text-center bg-white border border-slate-200 p-4 rounded-xl shadow min-w-[100px]">
                            <div className="text-2xl font-black text-slate-900">
                              {selectedQuizAttempts.length}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Attempts</div>
                          </div>
                          <div className="text-center bg-white border border-slate-200 p-4 rounded-xl shadow min-w-[100px]">
                            <div className="text-2xl font-black text-green-400">
                              {selectedQuizAttempts.filter(a => a.status !== 'pending').length > 0 
                                ? (selectedQuizAttempts.filter(a => a.status !== 'pending').reduce((acc, curr) => acc + curr.score, 0) / selectedQuizAttempts.filter(a => a.status !== 'pending').length).toFixed(1)
                                : "N/A"
                              }
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Avg Score</div>
                          </div>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base">Student Attempts Breakdown</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                          <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                            <tr>
                              <th className="p-4 rounded-l-xl">Student Name</th>
                              <th className="p-4">Mobile</th>
                              <th className="p-4">Date</th>
                              <th className="p-4 text-center">Score</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4 rounded-r-xl text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {selectedQuizAttempts.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center text-slate-500 py-12 text-sm">
                                  No attempts submitted for this quiz yet.
                                </td>
                              </tr>
                            ) : (
                              [...selectedQuizAttempts].sort((a, b) => b.score - a.score).map(a => (
                                <tr key={a.id} className="hover:bg-slate-50">
                                  <td className="p-4">
                                     <div className="flex items-center gap-2">
                                       <div className="w-8 h-8 rounded-full overflow-hidden border border-fuchsia-500/20 bg-slate-100 flex items-center justify-center shrink-0 text-fuchsia-600 font-bold text-xs">
                                         {(() => {
                                           const studentInfo = getAllUsers().find(u => u.mobileNumber === a.studentMobile);
                                           return studentInfo?.profilePicture ? (
                                             <img src={studentInfo.profilePicture} alt={a.studentName} className="w-full h-full object-cover" />
                                           ) : (
                                             a.studentName ? a.studentName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST"
                                           );
                                         })()}
                                       </div>
                                       <div>
                                         <div className="font-bold text-slate-900">{a.studentName}</div>
                                         <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                                           Total Quizzes Attended: {getAttemptsForStudent(a.studentMobile).length}
                                         </div>
                                       </div>
                                     </div>
                                  </td>
                                  <td className="p-4 font-mono">{a.studentMobile}</td>
                                  <td className="p-4 text-xs text-slate-600">
                                    {new Date(a.attemptedAt).toLocaleDateString()} at {new Date(a.attemptedAt).toLocaleTimeString()}
                                  </td>
                                  <td className="p-4 text-center font-bold text-slate-900">
                                    {(() => {
                                      const qz = getQuizByCode(a.quizCode);
                                      const totalMarks = getQuizTotalMarks(qz) || a.totalQuestions;
                                      
                                      if (a.status === 'pending') {
                                        return <span className="text-slate-500">— / {totalMarks}</span>;
                                      }
                                      
                                      let rightCount = 0;
                                      let wrongCount = 0;
                                      if (a.type === 'mcq') {
                                        rightCount = a.score;
                                        wrongCount = a.totalQuestions - a.score;
                                      } else if (a.status === 'graded' && a.questionScores) {
                                        a.questionScores.forEach((qs, idx) => {
                                          const maxM = qz?.questions[idx]?.maxMarks || 5;
                                          if (qs >= maxM / 2) {
                                            rightCount++;
                                          } else {
                                            wrongCount++;
                                          }
                                        });
                                      }

                                      return (
                                        <div className="flex flex-col items-center">
                                          <span>{a.score} / {totalMarks}</span>
                                          <span className="text-[10px] font-medium text-slate-600 mt-1">
                                            <span className="text-green-400">{rightCount} Right</span>
                                            <span className="mx-1 text-slate-600">|</span>
                                            <span className="text-red-400">{wrongCount} Wrong</span>
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </td>
                                  <td className="p-4 text-center">
                                    {a.status === 'pending' ? (
                                      <span className="inline-flex bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                        Pending Grading
                                      </span>
                                    ) : (
                                      <span className="inline-flex bg-green-500/10 text-green-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-500/20">
                                        Graded
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-right">
                                    {a.type === 'written' ? (
                                      <button
                                        onClick={() => {
                                          setGradingAttempt(a);
                                          setGradingScore(a.status === 'graded' ? a.score.toString() : "");
                                        }}
                                        className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors"
                                      >
                                        {a.status === 'pending' ? 'Grade' : 'Review'}
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-500 font-semibold italic">Auto-graded</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Faculty Profile */}
              {activeTab === "profile" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Profile Header & Avatar Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-fuchsia-500/20 shadow-md flex items-center justify-center bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white text-4xl font-black">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "FI"
                        )}
                      </div>
                      <label className="absolute bottom-1 right-1 bg-fuchsia-600 text-white p-2 rounded-full cursor-pointer hover:bg-fuchsia-700 transition shadow-lg border border-white">
                        <Camera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                      <h3 className="text-2xl font-black text-slate-900">{user?.name}</h3>
                      <p className="text-sm font-semibold text-fuchsia-600 uppercase tracking-wider">
                        {user?.facultyRole || "Faculty Member"} • {user?.subjectTeaching || "Department"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Associated Book Code: <span className="font-bold text-slate-800 font-mono">{user?.bookId}</span>
                      </p>
                      
                      <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
                        {user?.profilePicture && (
                          <button
                            onClick={handleDeleteProfileImage}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-200"
                          >
                            <Trash2 size={12} />
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Edit / Display Form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xl font-bold text-slate-900">Account Details</h4>
                      {!isEditingProfile && !profileOtpSent && (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="bg-slate-950 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                          Edit Profile Details
                        </button>
                      )}
                    </div>

                    {profileOtpSent ? (
                      /* OTP Verification Screen */
                      <div className="max-w-md mx-auto py-6 text-center space-y-6 animate-fadeIn">
                        <div className="w-14 h-14 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto text-fuchsia-600">
                          <Shield size={24} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-slate-900">Verify Profile Changes</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            A verification code has been sent to your updated mobile number <span className="font-bold text-slate-800">{user?.mobileNumber}</span> and email address <span className="font-bold text-slate-800">{profileForm.collegeEmail}</span>. Enter the 6-digit code below to finalize.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between gap-2 max-w-xs mx-auto mb-2">
                            {Array.from({ length: 6 }).map((_, index) => {
                              const char = profileOtpInput[index] || "";
                              return (
                                <input
                                  key={index}
                                  id={`profile-otp-digit-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={char}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    const updated = profileOtpInput.split("");
                                    while (updated.length < 6) updated.push("");
                                    updated[index] = val;
                                    const newOtp = updated.join("").slice(0, 6);
                                    setProfileOtpInput(newOtp);

                                    if (val && index < 5) {
                                      const nextInput = document.getElementById(`profile-otp-digit-${index + 1}`);
                                      if (nextInput) nextInput.focus();
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                      if (!char && index > 0) {
                                        const prevInput = document.getElementById(`profile-otp-digit-${index - 1}`);
                                        if (prevInput) {
                                          prevInput.focus();
                                          const updated = profileOtpInput.split("");
                                          updated[index - 1] = "";
                                          setProfileOtpInput(updated.join(""));
                                        }
                                      } else {
                                        const updated = profileOtpInput.split("");
                                        updated[index] = "";
                                        setProfileOtpInput(updated.join(""));
                                      }
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                                    setProfileOtpInput(pastedData);
                                    const focusIndex = Math.min(pastedData.length, 5);
                                    const targetInput = document.getElementById(`profile-otp-digit-${focusIndex}`);
                                    if (targetInput) targetInput.focus();
                                  }}
                                  className="w-10 h-12 bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-xl text-center font-bold text-lg focus:outline-none focus:border-fuchsia-500 transition-colors shadow-sm"
                                />
                              );
                            })}
                          </div>

                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => {
                                setProfileOtpSent(false);
                                setProfileOtpInput("");
                                setProfileGeneratedOtp("");
                                setPendingProfileUpdates(null);
                              }}
                              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleVerifyProfileUpdate}
                              className="px-4 py-2 bg-fuchsia-600 text-white hover:bg-fuchsia-700 rounded-xl text-xs font-bold transition shadow-md"
                            >
                              Verify & Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : isEditingProfile ? (
                      /* Editing Mode Form */
                      <form onSubmit={handleInitiateProfileUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">College Email ID</label>
                            <input
                              type="email"
                              value={profileForm.collegeEmail}
                              onChange={(e) => setProfileForm({ ...profileForm, collegeEmail: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                            {profileForm.collegeEmail && profileForm.collegeEmail.includes("@") && !isCollegeEmail(profileForm.collegeEmail) && (
                              <span className="text-[10px] text-red-500 font-bold block mt-1">Generic emails (Gmail/Yahoo/etc.) are not allowed!</span>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">College Name</label>
                            <input
                              type="text"
                              value={profileForm.collegeName}
                              onChange={(e) => setProfileForm({ ...profileForm, collegeName: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Faculty ID / Employee ID</label>
                            <input
                              type="text"
                              value={profileForm.facultyId}
                              onChange={(e) => setProfileForm({ ...profileForm, facultyId: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Faculty Role / Designation</label>
                            <input
                              type="text"
                              value={profileForm.facultyRole}
                              onChange={(e) => setProfileForm({ ...profileForm, facultyRole: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Subject / Department</label>
                            <input
                              type="text"
                              value={profileForm.subjectTeaching}
                              onChange={(e) => setProfileForm({ ...profileForm, subjectTeaching: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number (Read-only)</label>
                            <input
                              type="text"
                              value={user?.mobileNumber || ""}
                              disabled
                              className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 cursor-not-allowed font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Access ID (Read-only)</label>
                            <input
                              type="text"
                              value={user?.accessId || ""}
                              disabled
                              className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 cursor-not-allowed font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(false);
                              if (user) {
                                setProfileForm({
                                  name: user.name || "",
                                  collegeName: user.collegeName || "",
                                  facultyId: user.facultyId || "",
                                  facultyRole: user.facultyRole || "",
                                  subjectTeaching: user.subjectTeaching || "",
                                  collegeEmail: user.collegeEmail || ""
                                });
                              }
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
                          >
                            Save Details
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Display Profile Fields Mode */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Full Name</span>
                          <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">College Email ID</span>
                          <span className="text-sm font-bold text-slate-900">{user?.collegeEmail}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">College Name</span>
                          <span className="text-sm font-bold text-slate-900">{user?.collegeName}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Faculty ID</span>
                          <span className="text-sm font-bold text-slate-900">{user?.facultyId}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Faculty Designation</span>
                          <span className="text-sm font-bold text-slate-900">{user?.facultyRole}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Subject / Department</span>
                          <span className="text-sm font-bold text-slate-900">{user?.subjectTeaching}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            Mobile Number <span className="bg-fuchsia-100 text-fuchsia-600 text-[8px] font-bold px-1 py-0.5 rounded">Login ID</span>
                          </span>
                          <span className="text-sm font-bold text-slate-900">{user?.mobileNumber}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            Access ID <span className="bg-fuchsia-100 text-fuchsia-600 text-[8px] font-bold px-1 py-0.5 rounded">License Code</span>
                          </span>
                          <span className="text-sm font-bold text-slate-900 font-mono">{user?.accessId}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <ChangePasswordCard
                    showChangePassword={showChangePassword}
                    onOpen={openChangePassword}
                    oldPasswordInput={oldPasswordInput}
                    setOldPasswordInput={setOldPasswordInput}
                    newPasswordInput={newPasswordInput}
                    setNewPasswordInput={setNewPasswordInput}
                    confirmPasswordInput={confirmPasswordInput}
                    setConfirmPasswordInput={setConfirmPasswordInput}
                    showOldPasswordInput={showOldPasswordInput}
                    setShowOldPasswordInput={setShowOldPasswordInput}
                    showNewPasswordInput={showNewPasswordInput}
                    setShowNewPasswordInput={setShowNewPasswordInput}
                    changePasswordError={changePasswordError}
                    changePasswordSuccess={changePasswordSuccess}
                    isChangingPassword={isChangingPassword}
                    resetChangePasswordForm={resetChangePasswordForm}
                    handleChangePassword={handleChangePassword}
                  />
                </div>
              )}

              {/* Tab 4: My Students */}
              {activeTab === "students" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Students Listing Header */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">My Assigned Students</h3>
                    <p className="text-xs text-slate-600">Review student details and clicked student detailed quiz results below.</p>
                  </div>

                  {selectedStudentDetails ? (
                    /* Detailed View of Clicked Student */
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 animate-fadeIn">
                      <button
                        onClick={() => setSelectedStudentDetails(null)}
                        className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 transition"
                      >
                        <ArrowLeft size={14} /> Back to Student List
                      </button>

                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-fuchsia-500/20 bg-slate-100 flex items-center justify-center shrink-0 text-fuchsia-600 font-black text-lg">
                            {selectedStudentDetails.profilePicture ? (
                              <img
                                src={selectedStudentDetails.profilePicture}
                                alt={selectedStudentDetails.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              selectedStudentDetails.name ? selectedStudentDetails.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST"
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900">{selectedStudentDetails.name}</h4>
                            <p className="text-xs text-slate-600">Mobile: {selectedStudentDetails.mobileNumber} | College: {selectedStudentDetails.collegeName}</p>
                            {selectedStudentDetails.collegeId && (
                              <p className="text-[10px] text-slate-400 mt-0.5">College ID: {selectedStudentDetails.collegeId}</p>
                            )}
                          </div>
                        </div>
                        <div className="bg-fuchsia-100 text-fuchsia-700 text-xs font-bold px-3 py-1.5 rounded-xl self-start md:self-auto shrink-0 font-mono">
                          Quizzes Written: {getAttemptsForStudent(selectedStudentDetails.mobileNumber).length}
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                              <th className="px-5 py-3">Quiz Code</th>
                              <th className="px-5 py-3">Quiz Title</th>
                              <th className="px-5 py-3">Type</th>
                              <th className="px-5 py-3">Attempted At</th>
                              <th className="px-5 py-3">Grade/Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {(() => {
                              const studentAttempts = getAttemptsForStudent(selectedStudentDetails.mobileNumber);
                              if (studentAttempts.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 italic">
                                      No quizzes attempted yet by this student.
                                    </td>
                                  </tr>
                                );
                              }
                              return studentAttempts.map(attempt => {
                                const quizDetails = getQuizByCode(attempt.quizCode);
                                const totalMarks = getQuizTotalMarks(quizDetails);
                                return (
                                  <tr key={attempt.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-5 py-3.5 font-mono text-xs font-bold">{attempt.quizCode}</td>
                                    <td className="px-5 py-3.5">{quizDetails?.title || "Deleted/Unknown Quiz"}</td>
                                    <td className="px-5 py-3.5 capitalize">{attempt.type}</td>
                                    <td className="px-5 py-3.5 text-xs text-slate-500">
                                      {new Date(attempt.attemptedAt).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                        attempt.status === 'pending'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {attempt.status === 'pending'
                                          ? 'Pending Grading'
                                          : `${attempt.score} / ${totalMarks}`}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Student List Grid */
                    <div>
                      {(() => {
                        const allUsers = getAllUsers();
                        const myStudents = allUsers.filter(
                          u => u.role === 'student' && u.teachingFacultyAccessId?.toUpperCase() === user?.accessId?.toUpperCase()
                        );
                        
                        if (myStudents.length === 0) {
                          return (
                            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 text-sm shadow-xl">
                              No students are currently assigned to you. Instruct your students to sign up using your Access ID.
                            </div>
                          );
                        }
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myStudents.map(student => {
                              const quizCount = getAttemptsForStudent(student.mobileNumber).length;
                              return (
                                <div
                                  key={student.mobileNumber}
                                  onClick={() => setSelectedStudentDetails(student)}
                                  className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-fuchsia-500/50 cursor-pointer hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full overflow-hidden border border-fuchsia-500/20 bg-slate-100 flex items-center justify-center shrink-0 text-fuchsia-600 font-bold text-sm">
                                        {student.profilePicture ? (
                                          <img
                                            src={student.profilePicture}
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          student.name ? student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST"
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-fuchsia-600 transition-colors">
                                          {student.name}
                                        </h4>
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-500">Mobile: {student.mobileNumber}</p>
                                    <p className="text-xs text-slate-500 truncate">Email: {student.collegeEmail || 'N/A'}</p>
                                    <p className="text-xs text-slate-500">College ID: {student.collegeId || 'N/A'}</p>
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quizzes Attempted</span>
                                    <span className="bg-fuchsia-500/10 text-fuchsia-600 font-bold px-2.5 py-1 rounded-full text-xs font-mono">
                                      {quizCount}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- STUDENT DASHBOARD --- */}
          {user?.role === "student" && (
            <div className="space-y-6">
              {/* Student Tabs */}
              <div className="flex border-b border-slate-200 flex-wrap w-full gap-1">
                {/* My Books Tab (only if student has purchased books) */}
                {isTabAllowed("mybooks") && (
                  <button
                    onClick={() => { setActiveTab("mybooks"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "mybooks" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen size={16} />
                    My Books
                  </button>
                )}

                {/* Caselets Tab */}
                {isTabAllowed("caselets") && (
                  <button
                    onClick={() => { setActiveTab("caselets"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); setReadingCaseletInfo(null); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "caselets" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileSpreadsheet size={16} />
                    My Caselets
                  </button>
                )}

                {/* Join Active Quiz */}
                {isTabAllowed("join") && (
                  <button
                    onClick={() => { setActiveTab("join"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "join" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Play size={16} />
                    Join Active Quiz
                  </button>
                )}

                {/* Practice Questions */}
                {isTabAllowed("practice") && (
                  <button
                    onClick={() => { setActiveTab("practice"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "practice" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen size={16} />
                    Practice Questions
                  </button>
                )}

                {/* My Quiz History */}
                {isTabAllowed("history") && (
                  <button
                    onClick={() => { setActiveTab("history"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "history" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileSpreadsheet size={16} />
                    My Quiz History
                  </button>
                )}

                {/* Career Hub */}
                {isTabAllowed("studentCareerHub") && (
                  <button
                    onClick={() => { setActiveTab("studentCareerHub"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "studentCareerHub" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Briefcase size={16} />
                    Career Hub
                  </button>
                )}

                {/* My Profile */}
                {isTabAllowed("studentProfile") && (
                  <button
                    onClick={() => { setActiveTab("studentProfile"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 shrink-0 ${
                      activeTab === "studentProfile" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <User size={16} />
                    My Profile
                  </button>
                )}
              </div>

              {/* Tab: My Books */}
              {activeTab === "mybooks" && (
                <div className="space-y-6">
                  {(readingBookId || readingRentalId) ? null : (
                    // Library Grid
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 font-display">My Digital Bookshelf</h4>
                          <p className="text-sm text-slate-500">Access your active eBook rentals and purchased textbook editions.</p>
                        </div>
                        <a
                          href="/textbooks/store"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 self-start sm:self-auto"
                        >
                          <ShoppingBag size={14} />
                          <span>+ Buy More Textbooks</span>
                        </a>
                      </div>

                      {(() => {
                        const purchasedBookIds = (user?.purchasedBooks && user.purchasedBooks.length > 0)
                          ? user.purchasedBooks.map((id: any) => String(id))
                          : (user?.bookId ? [String(user.bookId)] : []);
                        const userPurchasedBooks = PORTAL_PUBLISHED_BOOKS.filter(book => purchasedBookIds.includes(String(book.id)));
                        const effectiveMyBooksFilter: 'rental' | 'purchased' = myBooksFilter ?? (portalRentals.length > 0 ? 'rental' : 'purchased');

                        // Renewing a book creates a new linked rental row rather than mutating
                        // the old one, so the original expired row sticks around forever as
                        // history. Exclude any expired rental whose book already has an active
                        // rental — otherwise a just-renewed book keeps showing a stale "Renew
                        // Now" prompt for the row that got superseded.
                        const activeRentalBookIds = new Set(portalRentals.map((r: any) => String(r.bookId)));
                        const renewableExpiredRentals = expiredPortalRentals.filter((r: any) => !activeRentalBookIds.has(String(r.bookId)));

                        if (portalRentals.length === 0 && userPurchasedBooks.length === 0) {
                          return (
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-4 shadow-sm max-w-lg mx-auto my-8 animate-fadeIn">
                              <div className="w-16 h-16 bg-fuchsia-50 rounded-2xl flex items-center justify-center mx-auto text-fuchsia-600">
                                <BookOpen size={32} />
                              </div>
                              <h5 className="text-lg font-bold text-slate-900">No Books Found in Your Library</h5>
                              <p className="text-sm text-slate-500 max-w-md mx-auto">
                                You don't have any active digital book rentals or purchased editions attached to this account yet.
                              </p>
                              <a
                                href="/textbooks/store"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all"
                              >
                                <BookOpen size={16} />
                                <span>Browse Academic Bookstore</span>
                              </a>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-6">
                            {/* Rental / Purchased toggle */}
                            <div className="bg-[#F1F5F9] p-1 rounded-xl flex gap-1 self-start w-fit">
                              <button
                                onClick={() => setMyBooksFilter('rental')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  effectiveMyBooksFilter === 'rental' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                }`}
                              >
                                <Clock size={13} />
                                <span>Rental Books ({portalRentals.length})</span>
                              </button>
                              <button
                                onClick={() => setMyBooksFilter('purchased')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  effectiveMyBooksFilter === 'purchased' ? "bg-white text-fuchsia-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                                }`}
                              >
                                <BookOpen size={13} />
                                <span>Purchased Books ({userPurchasedBooks.length})</span>
                              </button>
                            </div>

                        {/* Rented eBooks Section */}
                        {effectiveMyBooksFilter === 'rental' && (
                          <div className="space-y-4 pt-2">
                            {portalRentals.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-10">You don't have any active eBook rentals yet.</p>
                            ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                              {portalRentals.map((rental: any) => {
                                const startedMs = rental.startedAt ? new Date(rental.startedAt).getTime() : null;
                                const expiresMs = rental.expiresAt ? new Date(rental.expiresAt).getTime() : null;
                                const timelinePct = (startedMs && expiresMs && expiresMs > startedMs)
                                  ? Math.min(100, Math.max(0, ((Date.now() - startedMs) / (expiresMs - startedMs)) * 100))
                                  : 0;

                                return (
                                  <div key={rental.rentalId} className="bg-gradient-to-br from-indigo-50/40 to-white border border-indigo-200/80 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all">
                                    <div className="space-y-4">
                                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-150 shadow-inner">
                                        <img
                                          src={rental.bookCoverImg}
                                          alt={rental.bookTitle}
                                          className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                          {rental.planDisplayName}
                                        </span>
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-slate-900 line-clamp-2">{rental.bookTitle}</h5>
                                        <p className="text-xs text-slate-500 mt-1">By {rental.bookAuthors}</p>
                                      </div>

                                      {/* Rental Access Timeline */}
                                      <div className="bg-white/80 border border-indigo-100 rounded-2xl p-3 space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-500">
                                            Rental Access Timeline
                                          </span>
                                          <RentalBadge status={rental.status} expiresAt={rental.expiresAt} />
                                        </div>
                                        <div className="space-y-1.5">
                                          <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all"
                                              style={{ width: `${timelinePct}%` }}
                                            />
                                          </div>
                                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                            <span>{rental.startedAt ? new Date(rental.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "Start"}</span>
                                            <span className="text-indigo-600">{rental.planDisplayName} Plan</span>
                                            <span>{rental.expiresAt ? new Date(rental.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "—"}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 mt-5">
                                      <button
                                        onClick={() => openSecureRental(rental.rentalId)}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-2xl shadow-md transition-all text-center flex items-center justify-center gap-1.5"
                                      >
                                        <BookOpen size={14} />
                                        <span>Read</span>
                                      </button>
                                      <button
                                        onClick={() => setRenewalRental({ rentalId: rental.rentalId, bookTitle: rental.bookTitle, expiresAt: rental.expiresAt, planCode: rental.planCode })}
                                        title="Renew early — remaining time rolls over into the new period"
                                        className="shrink-0 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-bold text-sm px-3.5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                                      >
                                        <RefreshCw size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            )}
                          </div>
                        )}

                        {/* Expired Rentals — access has ended, but renewing brings it right back */}
                        {effectiveMyBooksFilter === 'rental' && renewableExpiredRentals.length > 0 && (
                          <div className="space-y-4 pt-2">
                            <h5 className="text-xs font-extrabold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                              <RefreshCw size={14} /> Expired — Renew to Continue Reading ({renewableExpiredRentals.length})
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                              {renewableExpiredRentals.map((rental: any) => (
                                <div key={rental.rentalId} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between opacity-90 hover:opacity-100 transition-all">
                                  <div className="space-y-4">
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 border border-slate-150 grayscale">
                                      <img
                                        src={rental.bookCoverImg}
                                        alt={rental.bookTitle}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-slate-700 line-clamp-2">{rental.bookTitle}</h5>
                                      <p className="text-xs text-slate-500 mt-1">By {rental.bookAuthors}</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 bg-white border border-red-100 rounded-2xl p-3">
                                      <RentalBadge status="expired" expiresAt={rental.expiresAt} />
                                      <span className="text-[9px] font-bold text-slate-400">
                                        {rental.expiresAt ? `Ended ${new Date(rental.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ""}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setRenewalRental({ rentalId: rental.rentalId, bookTitle: rental.bookTitle, expiresAt: rental.expiresAt, planCode: rental.planCode })}
                                    className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-2xl shadow-md transition-all text-center flex items-center justify-center gap-1.5"
                                  >
                                    <RefreshCw size={14} />
                                    <span>Renew Now</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Purchased Soft Copies Section */}
                        {effectiveMyBooksFilter === 'purchased' && (
                          <div className="space-y-4 pt-2">
                            {userPurchasedBooks.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-10">You don't have any purchased books yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {userPurchasedBooks.map((book) => {
                                  const paidPlan = getLatestPaidPlanForBook(book.id);
                                  return (
                                    <div key={book.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all">
                                      <div className="space-y-4">
                                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-150">
                                          <img
                                            src={book.coverImg}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-slate-900 line-clamp-2">{book.title}</h5>
                                          <p className="text-xs text-slate-500 mt-1">By {book.author}</p>
                                        </div>

                                        {/* Purchase Access Timeline — lifetime, unlike rentals */}
                                        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-1.5 text-emerald-700">
                                            <CheckCircle2 size={13} />
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider">Permanent Access</span>
                                          </div>
                                          {paidPlan && (
                                            <span className="text-[9px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                              {getPlanLabel(paidPlan)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => openSecureBook(book.id)}
                                        className="w-full mt-5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-sm py-2.5 rounded-2xl shadow-sm transition-all"
                                      >
                                        Read Book
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 1: Join & Attempt Quiz */}
              {activeTab === "join" && (
                <div className="max-w-2xl mx-auto">
                   {/* Assigned Teacher Widget */}
                  {(() => {
                    const teacher = getAllUsers().find(
                      u => u.role === "faculty" && u.accessId?.toUpperCase() === user?.teachingFacultyAccessId?.toUpperCase()
                    );
                    if (!teacher) return (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl mb-6 space-y-4 animate-fadeIn">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">Assigned Faculty (Required to join quizzes)</h4>
                          <p className="text-xs text-slate-500">You need to select your teaching faculty to join active quizzes. This can only be set once.</p>
                        </div>
                        <div className="flex gap-3">
                          <select
                            value={studentTeachingFacultyEdit}
                            onChange={(e) => setStudentTeachingFacultyEdit(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-inner"
                          >
                            <option value="">-- Choose Your Faculty --</option>
                            {getAllUsers()
                              .filter(u => 
                                u.role === "faculty" && 
                                u.bookId === user?.bookId &&
                                u.collegeName &&
                                user?.collegeName &&
                                u.collegeName.trim().toLowerCase() === user.collegeName.trim().toLowerCase()
                              )
                              .map(f => (
                                <option key={f.accessId} value={f.accessId}>
                                  {f.name} ({f.collegeEmail || f.mobileNumber})
                                </option>
                              ))
                            }
                          </select>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!studentTeachingFacultyEdit) {
                                showToast("Please select a teaching faculty.", "warning");
                                return;
                              }
                              const success = updateUser(user!.mobileNumber, { teachingFacultyAccessId: studentTeachingFacultyEdit });
                              if (success) {
                                const updated = { ...user!, teachingFacultyAccessId: studentTeachingFacultyEdit };
                                sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updated));
                                setUser(updated);
                                showToast("Teaching faculty assigned successfully!", "success");
                              } else {
                                showToast("Failed to assign teaching faculty.", "error");
                              }
                            }}
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shrink-0"
                          >
                            Save Faculty
                          </button>
                        </div>
                      </div>
                    );
                    return (
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl flex items-center gap-4 mb-6 animate-fadeIn">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-fuchsia-500/20 shadow-sm flex items-center justify-center bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white text-lg font-black shrink-0">
                          {teacher.profilePicture ? (
                            <img
                              src={teacher.profilePicture}
                              alt="Teacher"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            teacher.name ? teacher.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "FI"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-black text-fuchsia-500 uppercase tracking-wider">Your Teaching Faculty</span>
                          <h4 className="text-base font-black text-slate-900 truncate">{teacher.name}</h4>
                          <span className="block text-xs text-slate-500 truncate">{teacher.collegeEmail}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Join Quiz Code Form */}
                  {!activeStudentQuiz && !studentQuizResult && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
                      <div className="w-16 h-16 bg-fuchsia-600/10 rounded-full flex items-center justify-center mx-auto text-fuchsia-500 animate-pulse">
                        <Play size={28} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900">Enter Quiz Code</h3>
                        <p className="text-sm text-slate-600">Enter the unique code provided by your teacher to access the quiz.</p>
                      </div>

                      <form onSubmit={handleJoinQuiz} className="max-w-md mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3 max-w-sm mx-auto mb-4 animate-fadeIn">
                          <span className="bg-slate-100 border-2 border-slate-200 text-slate-500 font-mono font-black text-xl px-4 py-3 rounded-2xl tracking-wider select-none shadow-sm">
                            LRN -
                          </span>
                          <div className="flex gap-2">
                            {Array.from({ length: 4 }).map((_, index) => {
                              const suffix = studentQuizCode.startsWith("LRN-") ? studentQuizCode.slice(4) : studentQuizCode;
                              const char = suffix[index] || "";
                              return (
                                <input
                                  key={index}
                                  id={`quiz-code-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={char}
                                  onChange={(e) => {
                                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                    const suffixParts = suffix.split("");
                                    while (suffixParts.length < 4) suffixParts.push("");
                                    suffixParts[index] = val;
                                    const newSuffix = suffixParts.join("").slice(0, 4);
                                    setStudentQuizCode(newSuffix ? `LRN-${newSuffix}` : "");

                                    if (val && index < 3) {
                                      const nextInput = document.getElementById(`quiz-code-${index + 1}`);
                                      if (nextInput) nextInput.focus();
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                      if (!char && index > 0) {
                                        const prevInput = document.getElementById(`quiz-code-${index - 1}`);
                                        if (prevInput) {
                                          prevInput.focus();
                                          const suffixParts = suffix.split("");
                                          suffixParts[index - 1] = "";
                                          const newSuffix = suffixParts.join("");
                                          setStudentQuizCode(newSuffix ? `LRN-${newSuffix}` : "");
                                        }
                                      } else {
                                        const suffixParts = suffix.split("");
                                        suffixParts[index] = "";
                                        const newSuffix = suffixParts.join("");
                                        setStudentQuizCode(newSuffix ? `LRN-${newSuffix}` : "");
                                      }
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    let pastedData = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "");
                                    if (pastedData.startsWith("LRN")) {
                                      pastedData = pastedData.slice(3);
                                    }
                                    if (pastedData.startsWith("-")) {
                                      pastedData = pastedData.slice(1);
                                    }
                                    pastedData = pastedData.slice(0, 4);
                                    setStudentQuizCode(`LRN-${pastedData}`);
                                    const focusIndex = Math.min(pastedData.length, 3);
                                    const targetInput = document.getElementById(`quiz-code-${focusIndex}`);
                                    if (targetInput) targetInput.focus();
                                  }}
                                  className="w-12 h-14 bg-white border-2 border-slate-200 text-fuchsia-600 rounded-2xl text-center font-mono font-black text-2xl focus:outline-none focus:border-fuchsia-500 transition-colors shadow-sm uppercase"
                                />
                              );
                            })}
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-fuchsia-600/25 transition-all text-base"
                        >
                          Join & Start Quiz
                        </button>
                      </form>
                    </div>
                  )}

                  {/* ACTIVE STUDENT QUIZ ATTEMPT PLAYER */}
                  {activeStudentQuiz && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                      {/* Header details */}
                      <div className="flex justify-between items-center border-b border-slate-200 pb-4 gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">{activeStudentQuiz.title}</h3>
                          <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                            {activeStudentQuiz.type === 'written' ? 'Written Test' : 'MCQ Quiz'}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          {activeStudentQuiz.duration > 0 && (
                            <div className="bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2 font-bold font-mono text-sm shadow-inner animate-pulse">
                              <Clock size={16} />
                              <span>Time Left: {formatTime(timeRemaining)}</span>
                            </div>
                          )}
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest">Question</div>
                            <div className="text-base font-black text-slate-900">
                              {studentCurrentQuestionIndex + 1} / {activeStudentQuiz.questions.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-bold text-slate-900 text-base md:text-lg leading-relaxed shadow-inner">
                        {activeStudentQuiz.questions[studentCurrentQuestionIndex].questionText}
                      </div>

                      {/* Answers Options / Written Response */}
                      {activeStudentQuiz.type === 'written' ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Your Written Response
                          </label>
                          <textarea
                            placeholder="Type your detailed answer here..."
                            value={studentAnswers[studentCurrentQuestionIndex] || ""}
                            onChange={(e) => {
                              const updated = [...studentAnswers];
                              updated[studentCurrentQuestionIndex] = e.target.value;
                              setStudentAnswers(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-4 focus:outline-none focus:border-fuchsia-500 font-medium text-sm transition-all shadow-inner focus:ring-1 focus:ring-fuchsia-500"
                            rows={8}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { key: "A", text: activeStudentQuiz.questions[studentCurrentQuestionIndex].optionA },
                            { key: "B", text: activeStudentQuiz.questions[studentCurrentQuestionIndex].optionB },
                            { key: "C", text: activeStudentQuiz.questions[studentCurrentQuestionIndex].optionC },
                            { key: "D", text: activeStudentQuiz.questions[studentCurrentQuestionIndex].optionD }
                          ].map(opt => {
                            const isSelected = studentAnswers[studentCurrentQuestionIndex] === opt.key;
                            return (
                              <button
                                key={opt.key}
                                onClick={() => handleSelectStudentAnswer(opt.key)}
                                className={`p-4 rounded-2xl border text-left font-semibold transition-all duration-200 flex items-center gap-4 ${
                                  isSelected
                                    ? "bg-fuchsia-600/10 border-fuchsia-500 text-fuchsia-600 shadow-md"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-850"
                                }`}
                              >
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                  isSelected ? "bg-fuchsia-500 text-slate-900" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Navigation buttons */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setStudentCurrentQuestionIndex(studentCurrentQuestionIndex - 1)}
                          disabled={studentCurrentQuestionIndex === 0}
                          className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
                        >
                          Previous
                        </button>
                        
                        {studentCurrentQuestionIndex < activeStudentQuiz.questions.length - 1 ? (
                          <button
                            onClick={() => setStudentCurrentQuestionIndex(studentCurrentQuestionIndex + 1)}
                            disabled={!studentAnswers[studentCurrentQuestionIndex]?.trim()}
                            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold rounded-xl shadow transition-colors disabled:opacity-50"
                          >
                            Next Question
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitStudentQuiz}
                            disabled={studentAnswers.some(ans => !ans?.trim())}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow transition-colors disabled:opacity-50"
                          >
                            Submit Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STUDENT QUIZ RESULT COMPONENT */}
                  {studentQuizResult && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-center">
                      <div className="w-20 h-20 bg-green-600/10 rounded-full flex items-center justify-center mx-auto text-green-500 mb-4 animate-scaleIn">
                        <BookOpenCheck size={36} />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900">
                          {studentQuizResult.type === 'written' ? 'Written Test Submitted!' : 'MCQ Quiz Submitted!'}
                        </h3>
                        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
                          {studentQuizResult.type === 'written' ? 'Pending Manual Grading' : 'Submitted successfully'}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl max-w-md mx-auto border border-slate-200 flex flex-col items-center space-y-3 shadow-inner">
                        {studentQuizResult.type === 'mcq' ? (
                          <div className="space-y-1 text-center">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Your Score</span>
                            <div className="text-3xl font-black text-fuchsia-600">
                              {studentQuizResult.score} / {studentQuizResult.totalQuestions}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Correct and incorrect options are hidden per instructor guidelines.</p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-700">
                            Your answers have been securely submitted to your instructor.
                          </p>
                        )}
                        <div className="inline-flex bg-fuchsia-500/10 text-fuchsia-500 text-xs font-bold px-3 py-1 rounded-full border border-fuchsia-500/20">
                          Status: {studentQuizResult.status === 'graded' ? 'Graded' : 'Pending Grading'}
                        </div>
                      </div>

                      <button
                        onClick={() => { setStudentQuizResult(null); setStudentQuizCode(""); }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl border border-slate-200 transition-all text-sm mt-4 shadow-sm"
                      >
                        Return to Portal Home
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "practice" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {practiceResultScore !== null ? (
                    /* PRACTICE COMPLETED REPORT SCREEN WITH SOLUTIONS */
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 max-w-3xl mx-auto animate-fadeIn">
                      <div className="text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto text-green-500 mb-2">
                          <CheckCircle2 size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Practice Completed!</h3>
                          <p className="text-xs text-slate-600 mt-1">Your practice test session has been submitted.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-inner text-center">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Your Score</span>
                          <div className="text-3xl font-black text-fuchsia-600">
                            {practiceResultScore} / {practiceQuestions.length}
                          </div>
                        </div>
                      </div>

                      {/* Solutions Viewer */}
                      <div className="space-y-4 pt-6 border-t border-slate-200">
                        <h4 className="text-lg font-bold text-slate-900 mb-4">Practice Test Solutions</h4>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {practiceQuestions.map((q, idx) => {
                            const studentAns = practiceAnswers[idx];
                            const correctAns = q.correctOption;
                            const isCorrect = studentAns === correctAns;

                            return (
                              <div key={q.id || idx} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 text-left">
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-slate-800 shrink-0">Q{idx + 1}.</span>
                                  <span className="font-bold text-slate-900">{q.questionText}</span>
                                </div>

                                {q.type !== 'written' ? (
                                  <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                      {[
                                        { key: "A", text: q.optionA },
                                        { key: "B", text: q.optionB },
                                        { key: "C", text: q.optionC },
                                        { key: "D", text: q.optionD }
                                      ].map(opt => {
                                        const isSelected = studentAns === opt.key;
                                        const isCorrectOpt = correctAns === opt.key;
                                        let optClass = "bg-white text-slate-700 border-slate-200";
                                        if (isSelected) {
                                          optClass = isCorrect ? "bg-green-50 border-green-500 text-green-700 font-bold" : "bg-red-50 border-red-500 text-red-700 font-bold";
                                        } else if (isCorrectOpt) {
                                          optClass = "bg-green-50 border-green-400 text-green-700 font-semibold";
                                        }
                                        return (
                                          <div key={opt.key} className={`p-2.5 rounded-xl border flex items-center gap-2 ${optClass}`}>
                                            <span className="font-bold">{opt.key}:</span>
                                            <span>{opt.text}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="text-xs flex flex-wrap gap-3 pt-2">
                                      <span className={`px-2.5 py-1 rounded-lg font-bold border ${
                                        isCorrect 
                                          ? "bg-green-50 text-green-700 border-green-200" 
                                          : "bg-red-50 text-red-700 border-red-200"
                                      }`}>
                                        Your Answer: {studentAns || "Unanswered"}
                                      </span>
                                      {!isCorrect && (
                                        <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg font-bold">
                                          Correct Option: {correctAns}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <div className="space-y-2 text-xs">
                                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                                      <span className="block text-[9px] font-black text-slate-400 uppercase mb-1">Your Written Answer:</span>
                                      <p className="text-slate-800 italic whitespace-pre-wrap">{studentAns || "No answer provided"}</p>
                                    </div>
                                    <div className="bg-green-50/50 border border-green-200 p-3 rounded-xl">
                                      <span className="block text-[9px] font-black text-green-600 uppercase mb-1">Grading & Solution Guide:</span>
                                      <p className="text-green-800">This is a theoretical written response question. Answers are evaluated directly by your assigned teaching instructor.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setPracticeResultScore(null);
                          setPracticeStarted(false);
                          setActivePracticeTest(null);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-xs shadow-sm"
                      >
                        Return to Practice List
                      </button>
                    </div>
                  ) : practiceStarted && activePracticeTest ? (
                    /* ACTIVE PRACTICE SESSION PLAYER */
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-4 gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">{activePracticeTest.title}</h3>
                          <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Self-paced assessment</span>
                        </div>
                        <div className="flex items-center gap-6">
                          {practiceTimeRemaining > 0 && (
                            <div className="bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2 font-bold font-mono text-sm shadow-inner animate-pulse">
                              <Clock size={16} />
                              <span>Time Left: {formatTime(practiceTimeRemaining)}</span>
                            </div>
                          )}
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest">Question</div>
                            <div className="text-base font-black text-slate-900">
                              {practiceCurrentIndex + 1} / {practiceQuestions.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-bold text-slate-900 text-base md:text-lg leading-relaxed shadow-inner">
                        {practiceQuestions[practiceCurrentIndex].questionText}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { key: "A", text: practiceQuestions[practiceCurrentIndex].optionA },
                          { key: "B", text: practiceQuestions[practiceCurrentIndex].optionB },
                          { key: "C", text: practiceQuestions[practiceCurrentIndex].optionC },
                          { key: "D", text: practiceQuestions[practiceCurrentIndex].optionD }
                        ].map(opt => {
                          const isSelected = practiceAnswers[practiceCurrentIndex] === opt.key;

                          let btnClasses = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-850";
                          let spanClasses = "bg-slate-100 text-slate-600";

                          if (isSelected) {
                            btnClasses = "bg-fuchsia-600/10 border-fuchsia-500 text-fuchsia-600 shadow-md font-bold";
                            spanClasses = "bg-fuchsia-500 text-slate-900";
                          }

                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectPracticeAnswer(opt.key)}
                              className={`p-4 rounded-2xl border text-left font-semibold transition-all duration-200 flex items-center gap-4 ${btnClasses}`}
                            >
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${spanClasses}`}>
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setPracticeCurrentIndex(practiceCurrentIndex - 1)}
                          disabled={practiceCurrentIndex === 0}
                          className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-100 transition-colors"
                        >
                          Previous
                        </button>
                        
                        {practiceCurrentIndex < practiceQuestions.length - 1 ? (
                          <button
                            onClick={() => setPracticeCurrentIndex(practiceCurrentIndex + 1)}
                            className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                          >
                            Next Question
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitPractice}
                            disabled={practiceAnswers.some(ans => !ans)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow transition-colors disabled:opacity-50"
                          >
                            Complete Practice
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* LIST OF SCHEDULED PRACTICE TESTS INDEX */
                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">Practice Test Arena</h3>
                        <p className="text-xs text-slate-600">Select an active scheduled practice test assigned for your textbook.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {(() => {
                          const tests = practiceTests;
                          const studentAttempts = getPracticeAttempts(user!.mobileNumber, user!.bookId);

                          if (tests.length === 0) {
                            return (
                              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-sm shadow-xl">
                                No scheduled practice tests are available for this textbook yet.
                              </div>
                            );
                          }

                          return tests.map(t => {
                            const attempt = studentAttempts.find(a => a.practiceTestId === t.id);
                            const now = new Date();
                            const start = new Date(t.startTime);
                            const end = new Date(t.endTime);
                            const isFuture = now < start;
                            const isExpired = now > end;

                            return (
                              <div key={t.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                  <h4 className="text-lg font-black text-slate-900">{t.title}</h4>
                                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-3">
                                    <span>Duration: <b className="text-slate-800 font-mono">{t.duration} Mins</b></span>
                                    <span>Questions Limit: <b className="text-slate-800 font-mono">{t.questionLimit}</b></span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Active: {start.toLocaleString()} to {end.toLocaleString()}
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                                  {attempt ? (
                                    <span className="bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3.5 py-2 rounded-xl font-mono">
                                      Completed (Score: {attempt.score} / {attempt.totalQuestions})
                                    </span>
                                  ) : isFuture ? (
                                    <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3.5 py-2 rounded-xl">
                                      still time is there for practice
                                    </span>
                                  ) : isExpired ? (
                                    <span className="bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold px-3.5 py-2 rounded-xl">
                                      the practice is completed
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setActivePracticeTest(t);
                                        const allQ = getQuestionsByBook(user!.bookId);
                                        let selectedQ: Question[] = [];
                                        if (t.selectedQuestionIds && t.selectedQuestionIds.length > 0) {
                                          selectedQ = t.selectedQuestionIds
                                            .map(qid => allQ.find(item => item.id === qid))
                                            .filter((item): item is Question => !!item);
                                        }
                                        if (selectedQ.length === 0) {
                                          let fallbackQ = allQ.filter(item => item.selectedForPractice === true);
                                          if (fallbackQ.length === 0) {
                                            fallbackQ = allQ.filter(item => item.category === 'practice' || !item.category);
                                          }
                                          selectedQ = fallbackQ.slice(0, t.questionLimit);
                                        }
                                        const selectedQCopy = JSON.parse(JSON.stringify(selectedQ)) as Question[];
                                        const pairedQ = selectedQCopy.map((q, idx) => ({ q, originalIndex: idx }));
                                        const shuffledP = shuffleArray(pairedQ);

                                        const practiceMap: { originalIndex: number; optionMapping: Record<string, string> }[] = [];

                                        const randomizedQ = shuffledP.map((pair) => {
                                          const q = pair.q;
                                          const isWritten = q.type === 'written';

                                          if (isWritten) {
                                            practiceMap.push({
                                              originalIndex: pair.originalIndex,
                                              optionMapping: {}
                                            });
                                            return q;
                                          }

                                          const optionKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
                                          const originalOptionsList = [
                                            { key: 'A', text: q.optionA || "" },
                                            { key: 'B', text: q.optionB || "" },
                                            { key: 'C', text: q.optionC || "" },
                                            { key: 'D', text: q.optionD || "" }
                                          ];

                                          const shuffledOptionsList = shuffleArray(originalOptionsList);

                                          q.optionA = shuffledOptionsList[0].text;
                                          q.optionB = shuffledOptionsList[1].text;
                                          q.optionC = shuffledOptionsList[2].text;
                                          q.optionD = shuffledOptionsList[3].text;

                                          const origCorrectKey = q.correctOption || 'A';
                                          const newCorrectIndex = shuffledOptionsList.findIndex(opt => opt.key === origCorrectKey);
                                          q.correctOption = optionKeys[newCorrectIndex] || 'A';

                                          const optionMapping: Record<string, string> = {};
                                          shuffledOptionsList.forEach((opt, idx) => {
                                            optionMapping[optionKeys[idx]] = opt.key;
                                          });

                                          practiceMap.push({
                                            originalIndex: pair.originalIndex,
                                            optionMapping
                                          });

                                          return q;
                                        });

                                        practiceQuestionMappingRef.current = practiceMap;
                                        setPracticeQuestions(randomizedQ);
                                        setPracticeAnswers(new Array(randomizedQ.length).fill(""));
                                        setPracticeCurrentIndex(0);
                                        setPracticeTimeRemaining(t.duration * 60);
                                        setPracticeResultScore(null);
                                        setSelectedPastAttempt(null);
                                        setPracticeStarted(true);
                                        setTabSwitchCount(0);
                                        requestFullScreen();
                                      }}
                                      className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow transition-colors"
                                    >
                                      Start Practice Test
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Student Quiz History */}
              {activeTab === "history" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {(() => {
                    const attempts = getAttemptsForStudent(user!.mobileNumber);
                    return (
                      <>
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">My Quiz Attendance</h3>
                            <p className="text-xs text-slate-600">Track all quizzes you have written and your scores.</p>
                          </div>
                          <div className="bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-500/20 text-xs font-bold px-4 py-2 rounded-2xl font-mono shrink-0">
                            Total Attempted: {attempts.length}
                          </div>
                        </div>

                        {/* List/Table of Quizzes */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
                          {attempts.length === 0 ? (
                            <div className="text-center text-slate-500 py-16 text-sm">
                              You have not written/attended any quizzes yet.
                            </div>
                          ) : (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                              <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="px-5 py-3">Quiz Code</th>
                                    <th className="px-5 py-3">Quiz Title</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Attempted At</th>
                                    <th className="px-5 py-3 text-right">My Score</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                  {attempts.map(attempt => {
                                    const quizDetails = getQuizByCode(attempt.quizCode);
                                    const totalMarks = getQuizTotalMarks(quizDetails);
                                    return (
                                      <tr key={attempt.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold">{attempt.quizCode}</td>
                                        <td className="px-5 py-3.5">{quizDetails?.title || "Unknown/Deleted Quiz"}</td>
                                        <td className="px-5 py-3.5 capitalize">{attempt.type}</td>
                                        <td className="px-5 py-3.5 text-xs text-slate-500">
                                          {new Date(attempt.attemptedAt).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                            attempt.status === 'pending'
                                              ? 'bg-amber-100 text-amber-700'
                                              : 'bg-green-100 text-green-700'
                                          }`}>
                                            {attempt.status === 'pending'
                                              ? 'Pending Grading'
                                              : `${attempt.score} / ${totalMarks}`}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {activeTab === "studentCareerHub" && (
                <div className="space-y-6">
                  {/* Career Hub Header */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Career & Placement Hub</h3>
                    <p className="text-xs text-slate-600">Access exclusive mock interview questions and corporate placement updates directly from our partner network.</p>
                  </div>

                  {/* Internal Tab Navigation */}
                  <div className="flex border-b border-slate-200 gap-1 pb-1">
                    <button
                      onClick={() => setCareerSubTab("interviews")}
                      className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${
                        careerSubTab === "interviews"
                          ? "bg-fuchsia-600 text-white shadow"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Interview Questions
                    </button>
                    <button
                      onClick={() => setCareerSubTab("updates")}
                      className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${
                        careerSubTab === "updates"
                          ? "bg-fuchsia-600 text-white shadow"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Company Updates
                    </button>
                  </div>

                  {careerSubTab === "interviews" ? (
                    <div className="space-y-4">
                      {/* Search and Filters */}
                      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-xs">
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search by company..."
                            value={interviewSearch}
                            onChange={(e) => setInterviewSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                          <Filter size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty:</span>
                          <select
                            value={interviewDiffFilter}
                            onChange={(e) => setInterviewDiffFilter(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 font-bold text-xs shadow-sm"
                          >
                            <option value="all">All Difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      {/* Interview Questions list */}
                      {(() => {
                        const filtered = interviewQuestions.filter((q) => {
                          const matchesSearch = q.company.toLowerCase().includes(interviewSearch.toLowerCase());
                          const matchesFilter = interviewDiffFilter === "all" || q.difficulty === interviewDiffFilter;
                          return matchesSearch && matchesFilter;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-2">
                              <Briefcase size={36} className="mx-auto text-slate-300 animate-pulse" />
                              <p className="text-xs font-semibold">No interview questions match your criteria.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {filtered.map((q) => {
                              const isExpanded = expandedInterviewId === q.id;
                              return (
                                <div
                                  key={q.id}
                                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 group flex flex-col gap-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="bg-fuchsia-500/10 text-fuchsia-600 text-xs font-black px-3 py-1 rounded-full">
                                        {q.company}
                                      </span>
                                      {q.role && (
                                        <span className="text-xs text-slate-600 font-bold">
                                          Role: {q.role}
                                        </span>
                                      )}
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                        q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                      }`}>
                                        {q.difficulty || "Medium"}
                                      </span>
                                    </div>
                                    {q.answerText && (
                                      <button
                                        onClick={() => setExpandedInterviewId(isExpanded ? null : q.id)}
                                        className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1 bg-fuchsia-50 px-2.5 py-1.5 rounded-xl border border-fuchsia-100/50 transition-colors"
                                      >
                                        {isExpanded ? (
                                          <>
                                            Hide Answer <ChevronUp size={14} />
                                          </>
                                        ) : (
                                          <>
                                            Reveal Answer <ChevronDown size={14} />
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-slate-800 text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                                    {q.questionText}
                                  </p>
                                  {isExpanded && q.answerText && (
                                    <div className="pt-4 border-t border-slate-100 mt-2 animate-fadeIn space-y-2">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Suggested Solution / Guidance</span>
                                      <pre className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto text-slate-700 whitespace-pre-wrap leading-relaxed max-h-96">
                                        {q.answerText}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search for updates */}
                      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-md flex items-center justify-between">
                        <div className="relative w-full sm:max-w-xs">
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter by company name..."
                            value={interviewSearch}
                            onChange={(e) => setInterviewSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs shadow-sm"
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                          Latest corporate notifications & announcements
                        </span>
                      </div>

                      {/* Updates listing */}
                      {(() => {
                        const filtered = companyUpdates.filter((u) =>
                          u.company.toLowerCase().includes(interviewSearch.toLowerCase())
                        );

                        if (filtered.length === 0) {
                          return (
                            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-2">
                              <Newspaper size={36} className="mx-auto text-slate-300 animate-pulse" />
                              <p className="text-xs font-semibold">No company updates available.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filtered.map((u) => (
                              <div
                                key={u.id}
                                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col gap-4"
                              >
                                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                                  <div className="space-y-1">
                                    <h4 className="font-black text-slate-950 text-base">{u.company}</h4>
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                                      Posted: {new Date(u.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className="bg-fuchsia-100 text-fuchsia-600 p-2 rounded-xl">
                                    <Newspaper size={18} />
                                  </span>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-slate-700 text-xs font-medium">
                                  {u.updates.map((bullet, idx) => (
                                    <li key={idx} className="leading-relaxed">{bullet}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: My Caselets */}
              {activeTab === "caselets" && (
                <div className="space-y-6">
                  {(() => {
                    // Rentals grant full digital access, so any rented book's caselet
                    // (if one exists for that book) is included automatically.
                    const rentedBookIds = Array.from(new Set((portalRentals || []).map((r: any) => String(r.bookId || r.book_id))));
                    const rentalByBookId = new Map((portalRentals || []).map((r: any) => [String(r.bookId || r.book_id), r]));

                    // Outright purchases only unlock the caselet if the specific plan the
                    // customer paid for that book actually included it — buying a plain
                    // "book_only" copy should never surface a caselet on My Caselets.
                    const purchasedBookIds = (user?.purchasedBooks && user.purchasedBooks.length > 0)
                      ? user.purchasedBooks.map((id: any) => String(id))
                      : (user?.bookId ? [String(user.bookId)] : []);
                    const purchasedCaseletBookIds = Array.from(new Set(
                      purchasedBookIds.filter((bId) =>
                        userOrdersList.some((o: any) =>
                          !o.isRental && String(o.bookId) === String(bId) &&
                          (o.purchasePlan === "caselet" || o.purchasePlan === "book_caselet")
                        )
                      )
                    ));

                    const buildCaselets = (bookIds: string[], attachRental?: boolean) => bookIds.flatMap((bId) => {
                      if (!BOOK_CASELETS[bId] || BOOK_CASELETS[bId].length === 0) {
                        return [];
                      }
                      const caseletList = BOOK_CASELETS[bId] || [];
                      const book = PORTAL_PUBLISHED_BOOKS.find(b => String(b.id) === String(bId));
                      const rental = attachRental ? rentalByBookId.get(String(bId)) : undefined;
                      return caseletList.map((c, idx) => ({ ...c, bookId: bId, book, caseletIndex: idx, rental }));
                    });

                    const rentalCaselets = buildCaselets(rentedBookIds, true);
                    const purchasedCaselets = buildCaselets(purchasedCaseletBookIds);

                    if (rentalCaselets.length === 0 && purchasedCaselets.length === 0) {
                      return (
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-4 shadow-sm max-w-lg mx-auto my-8 animate-fadeIn">
                          <div className="w-16 h-16 bg-fuchsia-50 rounded-2xl flex items-center justify-center mx-auto text-fuchsia-600">
                            <FileSpreadsheet size={32} />
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">No Caselets Available</h4>
                          <p className="text-sm text-slate-500 max-w-md mx-auto">
                            You don't have any active caselets associated with your textbook purchases or rentals yet.
                          </p>
                          <a
                            href="/textbooks/store"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all"
                          >
                            <BookOpen size={16} />
                            <span>Browse Academic Bookstore</span>
                          </a>
                        </div>
                      );
                    }

                    if (readingCaseletInfo !== null) {
                      return null;
                    }

                    const renderCaseletCard = (item: any, keyIdx: number) => {
                      const rental = item.rental;
                      const startedMs = rental?.startedAt ? new Date(rental.startedAt).getTime() : null;
                      const expiresMs = rental?.expiresAt ? new Date(rental.expiresAt).getTime() : null;
                      const timelinePct = (startedMs && expiresMs && expiresMs > startedMs)
                        ? Math.min(100, Math.max(0, ((Date.now() - startedMs) / (expiresMs - startedMs)) * 100))
                        : 0;

                      return (
                      <div key={keyIdx} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 bg-fuchsia-50 text-fuchsia-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-fuchsia-100">
                              <FileSpreadsheet size={13} />
                              Academic Caselet
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              {item.questions?.length || 2} Questions
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h5>
                            {item.book?.title && (
                              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                                <BookOpen size={12} className="text-slate-400 shrink-0" />
                                <span>From: {item.book.title}</span>
                              </p>
                            )}
                          </div>

                          {item.scenario && (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1">
                              <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Case Study Scenario:</p>
                              <p className="line-clamp-3 text-slate-600 leading-relaxed font-sans">{item.scenario}</p>
                            </div>
                          )}

                          {rental ? (
                            /* Rental Access Timeline — mirrors the "Rental Books" card so a caselet
                               unlocked via rental clearly shows the same expiry it's tied to. */
                            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-3 space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-500">
                                  Rental Access Timeline
                                </span>
                                <RentalBadge status={rental.status} expiresAt={rental.expiresAt} />
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full transition-all"
                                    style={{ width: `${timelinePct}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                  <span>{rental.startedAt ? new Date(rental.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "Start"}</span>
                                  <span className="text-indigo-600">{rental.planDisplayName} Plan</span>
                                  <span>{rental.expiresAt ? new Date(rental.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "—"}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center gap-1.5 text-emerald-700">
                              <CheckCircle2 size={13} />
                              <span className="text-[10px] font-extrabold uppercase tracking-wider">Permanent Access</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => openSecureCaselet(item.bookId, item.caseletIndex)}
                          className="w-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white font-bold text-sm py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          <FileSpreadsheet size={16} />
                          <span>Read Caselet PDF</span>
                        </button>
                      </div>
                      );
                    };

                    const effectiveCaseletsFilter: 'rental' | 'purchased' = myCaseletsFilter ?? (rentalCaselets.length > 0 ? 'rental' : 'purchased');

                    return (
                      <div className="space-y-6 animate-fadeIn">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 font-display">My Academic Caselets</h4>
                          <p className="text-sm text-slate-500">Practical case studies and scenario analyses included with your textbooks.</p>
                        </div>

                        {/* Rental / Purchased toggle */}
                        <div className="bg-[#F1F5F9] p-1 rounded-xl flex gap-1 self-start w-fit">
                          <button
                            onClick={() => setMyCaseletsFilter('rental')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              effectiveCaseletsFilter === 'rental' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            <Clock size={13} />
                            <span>Rental Caselets ({rentalCaselets.length})</span>
                          </button>
                          <button
                            onClick={() => setMyCaseletsFilter('purchased')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              effectiveCaseletsFilter === 'purchased' ? "bg-white text-fuchsia-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            <FileSpreadsheet size={13} />
                            <span>Purchased Caselets ({purchasedCaselets.length})</span>
                          </button>
                        </div>

                        {effectiveCaseletsFilter === 'rental' && (
                          <div className="space-y-4 pt-2">
                            {rentalCaselets.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-10">You don't have any rental caselets yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {rentalCaselets.map((item, keyIdx) => renderCaseletCard(item, keyIdx))}
                              </div>
                            )}
                          </div>
                        )}

                        {effectiveCaseletsFilter === 'purchased' && (
                          <div className="space-y-4 pt-2">
                            {purchasedCaselets.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-10">You don't have any purchased caselets yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {purchasedCaselets.map((item, keyIdx) => renderCaseletCard(item, keyIdx))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab 4: Student Profile */}
              {activeTab === "studentProfile" && (
                <div className="max-w-5xl mx-auto space-y-6">
                  {/* Profile Header & Avatar Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-fuchsia-500/20 shadow-md flex items-center justify-center bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white text-3xl font-black">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST"
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-fuchsia-600 text-white p-2 rounded-full cursor-pointer hover:bg-fuchsia-700 transition shadow-lg border border-white">
                        <Camera size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-1.5">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h3 className="text-2xl font-black text-slate-900">{user?.name}</h3>
                        <span className="bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                          {(user?.role as string) === "faculty" ? "Faculty Instructor" : "Student Member"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {user?.collegeEmail || user?.email || user?.mobileNumber} • Access ID: <span className="font-bold text-slate-800 font-mono">{user?.accessId || user?.bookId}</span>
                      </p>
                      
                      {user?.profilePicture && (
                        <div className="pt-1 flex justify-center md:justify-start">
                          <button
                            onClick={handleDeleteProfileImage}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 border border-red-200"
                          >
                            <Trash2 size={12} />
                            Remove Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Navigation Sub-Tabs */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200 gap-1">
                    <button
                      onClick={() => setProfileSubTab("account")}
                      className={`flex-1 py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 ${
                        profileSubTab === "account"
                          ? "bg-fuchsia-600 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <User size={16} />
                      <span>Account Details</span>
                    </button>
                    <button
                      onClick={() => { setProfileSubTab("orders"); fetchUserOrders(); }}
                      className={`flex-1 py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 ${
                        profileSubTab === "orders"
                          ? "bg-fuchsia-600 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <Package size={16} />
                      <span>Order History {userOrdersList.length > 0 ? `(${userOrdersList.length})` : ""}</span>
                    </button>
                    <button
                      onClick={() => { setProfileSubTab("addresses"); fetchUserAddresses(); }}
                      className={`flex-1 py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 ${
                        profileSubTab === "addresses"
                          ? "bg-fuchsia-600 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <MapPin size={16} />
                      <span>Address Book {userAddressesList.length > 0 ? `(${userAddressesList.length})` : ""}</span>
                    </button>
                  </div>

                  {/* SUB-TAB 1: ACCOUNT DETAILS */}
                  {profileSubTab === "account" && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl animate-fadeIn">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Account Details</h4>
                          <p className="text-xs text-slate-500">Manage your identity and profile details</p>
                        </div>
                        {!isEditingStudentProfile && (
                          <button
                            onClick={() => {
                              setStudentProfileName(user?.name || "");
                              setStudentProfileMobile((user?.mobileNumber && !user.mobileNumber.includes("@")) ? user.mobileNumber : "");
                              setStudentTeachingFacultyEdit(user?.teachingFacultyAccessId || "");
                              setIsEditingStudentProfile(true);
                            }}
                            className="bg-slate-950 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Edit size={14} />
                            <span>Edit Details</span>
                          </button>
                        )}
                      </div>

                    {isEditingStudentProfile ? (
                      <form onSubmit={handleStudentNameUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">Full Name</label>
                            <input
                              type="text"
                              value={studentProfileName}
                              onChange={(e) => setStudentProfileName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-fuchsia-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">Mobile / Phone Number</label>
                            <input
                              type="text"
                              value={studentProfileMobile}
                              onChange={(e) => setStudentProfileMobile(e.target.value)}
                              placeholder="Enter 10-digit mobile number"
                              className="w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:border-fuchsia-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Email Address (Read-only)</label>
                            <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium cursor-not-allowed">
                              {user?.collegeEmail || user?.email || "N/A"}
                            </div>
                          </div>
                          {user?.collegeName && user.collegeName.trim() !== "" && user.collegeName.trim().toUpperCase() !== "N/A" && (
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">College Name (Read-only)</label>
                              <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium cursor-not-allowed">
                                {user.collegeName}
                              </div>
                            </div>
                          )}
                          {user?.collegeId && user.collegeId.trim() !== "" && user.collegeId.trim().toUpperCase() !== "N/A" && (
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">College ID (Read-only)</label>
                              <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium font-mono cursor-not-allowed">
                                {user.collegeId}
                              </div>
                            </div>
                          )}
                          {user?.teachingFacultyAccessId && user.teachingFacultyAccessId.trim() !== "" && user.teachingFacultyAccessId.trim().toUpperCase() !== "N/A" && (
                            <div>
                              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">Assigned Teacher</label>
                              <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium font-mono cursor-not-allowed">
                                {(() => {
                                  const found = getAllUsers().find(u => u.role === "faculty" && (u.accessId?.toUpperCase() || "") === user.teachingFacultyAccessId!.toUpperCase());
                                  return found ? `${found.name} (${user.teachingFacultyAccessId})` : user.teachingFacultyAccessId;
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsEditingStudentProfile(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
                          >
                            Save Details
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">Full Name</label>
                          <div className="bg-slate-50 border border-slate-200 text-slate-850 rounded-xl px-4 py-2.5 font-medium">
                            {user?.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">Mobile Number</label>
                          <div className="bg-slate-50 border border-slate-200 text-slate-850 rounded-xl px-4 py-2.5 font-medium">
                            {(user?.mobileNumber && !user.mobileNumber.includes("@") && user.mobileNumber !== user?.email) ? user.mobileNumber : "Not Provided"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">Email Address</label>
                          <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium">
                            {user?.collegeEmail || user?.email || "N/A"}
                          </div>
                        </div>
                        {user?.collegeName && user.collegeName.trim() !== "" && user.collegeName.trim().toUpperCase() !== "N/A" && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">College Name</label>
                            <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium">
                              {user.collegeName}
                            </div>
                          </div>
                        )}
                        {user?.collegeId && user.collegeId.trim() !== "" && user.collegeId.trim().toUpperCase() !== "N/A" && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">College ID</label>
                            <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium font-mono">
                              {user.collegeId}
                            </div>
                          </div>
                        )}
                        {user?.teachingFacultyAccessId && user.teachingFacultyAccessId.trim() !== "" && user.teachingFacultyAccessId.trim().toUpperCase() !== "N/A" && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono font-bold">Assigned Teacher Access ID</label>
                            <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium font-mono text-slate-800 font-bold">
                              {user.teachingFacultyAccessId}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  )}

                  {/* SUB-TAB 2: ORDER HISTORY */}
                  {profileSubTab === "orders" && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Order History & Receipts</h4>
                          <p className="text-xs text-slate-500">View your purchased textbooks, eBook rentals, invoices, and delivery status</p>
                        </div>
                        <button
                          onClick={fetchUserOrders}
                          className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1 self-start sm:self-auto bg-fuchsia-50 border border-fuchsia-200 px-3 py-1.5 rounded-xl transition"
                        >
                          <RotateCcw size={13} />
                          <span>Refresh Orders</span>
                        </button>
                      </div>

                      {isFetchingOrders ? (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-8 h-8 border-3 border-fuchsia-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-xs font-bold text-slate-500">Loading order history from backend database...</p>
                        </div>
                      ) : userOrdersList.length === 0 ? (
                        <div className="py-12 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-8">
                          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <Package size={28} />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800">No Orders Found</h5>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                              You haven't placed any textbook or eBook rental orders yet under this account.
                            </p>
                          </div>
                          <a
                            href="/textbooks/store"
                            className="inline-flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
                          >
                            <ShoppingBag size={14} />
                            <span>Browse Textbook Store</span>
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userOrdersList.map((ord: any) => (
                            <div key={ord.id || ord.orderId} className="border border-slate-200 rounded-2xl p-5 hover:border-fuchsia-300 transition shadow-sm bg-slate-50/30 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">ORDER ID</span>
                                  <span className="font-mono text-xs font-black text-slate-900">{ord.orderId}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">ORDER DATE</span>
                                  <span className="text-xs font-semibold text-slate-700">{new Date(ord.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">TOTAL PAID</span>
                                  <span className="text-sm font-black text-fuchsia-600">₹{ord.amount?.toLocaleString("en-IN")}</span>
                                </div>
                                <div>
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                                    ord.status === "PAID" || ord.paymentStatus === "SUCCESS"
                                      ? "bg-green-100 text-green-700 border border-green-200"
                                      : "bg-amber-100 text-amber-700 border border-amber-200"
                                  }`}>
                                    <CheckCircle2 size={12} />
                                    <span>{ord.status || "COMPLETED"}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                                  <img src={ord.bookCover} alt={ord.bookTitle} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <h5 className="font-bold text-slate-900 text-sm line-clamp-2">{ord.bookTitle}</h5>
                                  <p className="text-xs text-slate-500">By {ord.bookAuthor}</p>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                      Format: {ord.purchaseFormat}
                                    </span>
                                    <span className="bg-fuchsia-50 text-fuchsia-700 text-[10px] font-bold px-2 py-0.5 rounded border border-fuchsia-200">
                                      Plan: {ord.purchasePlan}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedOrderInvoice(ord)}
                                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0"
                                >
                                  <FileText size={14} />
                                  <span>View Receipt</span>
                                </button>
                              </div>

                              {ord.shippingAddress && (
                                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                                  <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                                    <MapPin size={12} className="text-fuchsia-600" /> Delivery Address:
                                  </span>
                                  <p className="text-slate-600">{ord.shippingAddress}, {ord.city}, {ord.state} - {ord.shippingPincode}</p>
                                </div>
                              )}

                              {ord.isRental && ord.rentalExpiresAt && (
                                <div className="bg-white p-3 rounded-xl border border-indigo-200 text-xs space-y-1">
                                  <span className="font-bold text-indigo-700 flex items-center gap-1 text-[11px]">
                                    <Clock size={12} className="text-indigo-600" />
                                    {ord.rentalStatus === "expired" ? "Rental Expired:" : "Rental Access Valid Until:"}
                                  </span>
                                  <p className="text-slate-600">
                                    {new Date(ord.rentalExpiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: ADDRESS BOOK */}
                  {profileSubTab === "addresses" && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Saved Address Book</h4>
                          <p className="text-xs text-slate-500">Manage delivery addresses for physical textbook orders and rentals</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingAddressObj(null);
                            setAddressFormData({
                              fullName: user?.name || "",
                              phoneNumber: user?.mobileNumber || "",
                              addressLine1: "",
                              addressLine2: "",
                              city: "",
                              state: "",
                              pincode: "",
                              country: "India",
                              addressType: "Home",
                              isDefault: userAddressesList.length === 0
                            });
                            setIsAddressModalOpen(true);
                          }}
                          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                        >
                          <Plus size={15} />
                          <span>+ Add New Address</span>
                        </button>
                      </div>

                      {isFetchingAddresses ? (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-8 h-8 border-3 border-fuchsia-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-xs font-bold text-slate-500">Loading saved addresses from backend database...</p>
                        </div>
                      ) : userAddressesList.length === 0 ? (
                        <div className="py-12 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-8">
                          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                            <MapPin size={28} />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800">No Delivery Addresses Saved</h5>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                              Save your home, college, or hostel address to quickly place physical textbook orders.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {userAddressesList.map((addr: any) => (
                            <div
                              key={addr.id}
                              className={`border rounded-2xl p-5 shadow-sm space-y-3 relative transition flex flex-col justify-between ${
                                addr.isDefault ? "bg-fuchsia-50/30 border-fuchsia-300 ring-2 ring-fuchsia-500/20" : "bg-white border-slate-200"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                                    {addr.addressType === "Home" && <Home size={10} />}
                                    {addr.addressType === "Work" && <Briefcase size={10} />}
                                    {addr.addressType === "College" && <GraduationCap size={10} />}
                                    <span>{addr.addressType || "Address"}</span>
                                  </span>
                                  {addr.isDefault && (
                                    <span className="bg-fuchsia-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs flex items-center gap-1">
                                      <CheckCircle2 size={10} /> DEFAULT
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <h5 className="font-bold text-slate-900 text-sm">{addr.fullName}</h5>
                                  <p className="text-xs font-semibold text-slate-600 font-mono mt-0.5">📞 {addr.phoneNumber}</p>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {addr.addressLine1}
                                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                  <br />
                                  <span className="font-semibold text-slate-800">{addr.city}, {addr.state} - {addr.pincode}</span>
                                  <br />
                                  <span className="text-[11px] text-slate-400">{addr.country}</span>
                                </p>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                {!addr.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                    className="text-xs font-bold text-fuchsia-600 hover:underline flex items-center gap-1"
                                  >
                                    Set as Default
                                  </button>
                                )}
                                <div className="flex items-center gap-2 ml-auto">
                                  <button
                                    onClick={() => {
                                      setEditingAddressObj(addr);
                                      setAddressFormData({
                                        fullName: addr.fullName,
                                        phoneNumber: addr.phoneNumber,
                                        addressLine1: addr.addressLine1,
                                        addressLine2: addr.addressLine2 || "",
                                        city: addr.city,
                                        state: addr.state,
                                        pincode: addr.pincode,
                                        country: addr.country || "India",
                                        addressType: addr.addressType || "Home",
                                        isDefault: addr.isDefault
                                      });
                                      setIsAddressModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                                    title="Edit Address"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                    title="Delete Address"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <ChangePasswordCard
                    showChangePassword={showChangePassword}
                    onOpen={openChangePassword}
                    oldPasswordInput={oldPasswordInput}
                    setOldPasswordInput={setOldPasswordInput}
                    newPasswordInput={newPasswordInput}
                    setNewPasswordInput={setNewPasswordInput}
                    confirmPasswordInput={confirmPasswordInput}
                    setConfirmPasswordInput={setConfirmPasswordInput}
                    showOldPasswordInput={showOldPasswordInput}
                    setShowOldPasswordInput={setShowOldPasswordInput}
                    showNewPasswordInput={showNewPasswordInput}
                    setShowNewPasswordInput={setShowNewPasswordInput}
                    changePasswordError={changePasswordError}
                    changePasswordSuccess={changePasswordSuccess}
                    isChangingPassword={isChangingPassword}
                    resetChangePasswordForm={resetChangePasswordForm}
                    handleChangePassword={handleChangePassword}
                  />
                </div>
              )}

              {showUpgradeModal && (() => {
                const currentPrice = user ? getSoftCopyPrice(user.plan || "complete", user.bookId || "1") : 0;
                const eligiblePlans = user ? ALL_PLANS.filter(p => {
                  if (p.key === user.plan) return false;
                  if (!isPlanAllowedForBook(p.key, user.bookId || "1")) return false;
                  return getSoftCopyPrice(p.key, user.bookId || "1") > currentPrice;
                }) : [];
                const currentPlanLabel = ALL_PLANS.find(p => p.key === user?.plan)?.label || user?.plan || "Unknown";
                const selectedPlanPrice = selectedUpgradePlan ? getSoftCopyPrice(selectedUpgradePlan, user?.bookId || "1") : 0;
                const netUpgradeCost = Math.max(0, selectedPlanPrice - currentPrice);
                const gstVal = Math.round(netUpgradeCost * 0.18);
                const onlineFeeVal = Math.round((netUpgradeCost + gstVal) * 0.02);
                const totalUpgradeCost = netUpgradeCost + gstVal + onlineFeeVal;

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div
                      onClick={() => setShowUpgradeModal(false)}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg relative z-10 p-6 shadow-2xl flex flex-col space-y-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-base font-black text-slate-900">Upgrade Your Access Plan</h3>
                          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                            Current: {currentPlanLabel} (₹{currentPrice})
                          </p>
                        </div>
                        <button
                          onClick={() => setShowUpgradeModal(false)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {eligiblePlans.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-sm font-semibold text-slate-500">You are already on the highest tier plan!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-550 leading-relaxed">
                            Select one of the packages below to upgrade. The pricing is computed dynamically by subtracting your current plan's store value from the target plan's store price:
                          </p>

                          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {eligiblePlans.map(p => {
                              const targetPrice = getSoftCopyPrice(p.key, user?.bookId || "1");
                              const diffCost = targetPrice - currentPrice;
                              const isSelected = selectedUpgradePlan === p.key;

                              return (
                                <label
                                  key={p.key}
                                  onClick={() => setSelectedUpgradePlan(p.key)}
                                  className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-fuchsia-600 bg-fuchsia-50/20"
                                      : "border-slate-100 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-200"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="upgradePlan"
                                    value={p.key}
                                    checked={isSelected}
                                    onChange={() => setSelectedUpgradePlan(p.key)}
                                    className="accent-fuchsia-600 mt-1"
                                  />
                                  <div className="flex-1 space-y-0.5">
                                    <div className="flex justify-between items-baseline">
                                      <span className="text-xs font-bold text-slate-800">{p.label}</span>
                                      <span className="text-xs font-extrabold text-fuchsia-600">₹{diffCost}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{p.desc}</p>
                                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold pt-1">
                                      <span>Store Price: ₹{targetPrice}</span>
                                      <span>•</span>
                                      <span>Current Offset: -₹{currentPrice}</span>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
                            <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                              <span>Base Upgrade Price:</span>
                              <span className="text-slate-800 font-bold">₹{netUpgradeCost}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                              <span>GST Tax (18%):</span>
                              <span className="text-slate-800 font-bold">₹{gstVal}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                              <span>Online Fee (2%):</span>
                              <span className="text-slate-800 font-bold">₹{onlineFeeVal}</span>
                            </div>
                            <hr className="border-slate-200 my-1" />
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Upgrade Fee</span>
                                <span className="text-[10px] text-slate-500 font-medium">Secure dynamic pricing</span>
                              </div>
                              <span className="text-xl font-black text-slate-900">₹{totalUpgradeCost}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-3">
                        <button
                          onClick={() => setShowUpgradeModal(false)}
                          disabled={isUpgrading}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        {eligiblePlans.length > 0 && (
                          <button
                            onClick={() => handleUpgradePlan(selectedUpgradePlan, netUpgradeCost)}
                            disabled={isUpgrading || !selectedUpgradePlan}
                            className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-sm py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                          >
                            {isUpgrading ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Pay & Upgrade"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </main>

      {/* --- QUESTION IMPORT MODAL FOR FACULTY --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsImportModalOpen(false)}
            className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm"
          />
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl relative z-10 flex flex-col max-h-[80vh] shadow-2xl animate-scaleIn">
            
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Import from Question Bank</h3>
                <p className="text-xs text-slate-600">Select questions configured by system Admin to add to your quiz.</p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-750 text-slate-600 hover:text-slate-900 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {importQBankQuestions.length === 0 ? (
                <div className="text-center text-slate-500 py-12 text-sm">
                  No questions available in the question bank for this textbook yet.
                </div>
              ) : (
                (() => {
                  const remainingSlots = newQuizQuestionsLimit - newQuizQuestions.length;
                  const isImportLimitReached = selectedImportIds.length >= remainingSlots;
                  return importQBankQuestions.map((q) => {
                    const isChecked = selectedImportIds.includes(q.id);
                    const isSelectionDisabled = !isChecked && isImportLimitReached;
                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          if (isSelectionDisabled) {
                            showToast(`You can only select up to ${remainingSlots} questions to match the specified limit.`, 'warning');
                            return;
                          }
                          handleToggleImportSelect(q.id);
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-4 ${
                          isSelectionDisabled ? "opacity-40 cursor-not-allowed" : ""
                        } ${
                          isChecked 
                            ? "bg-fuchsia-600/10 border-fuchsia-500 text-slate-900" 
                            : "bg-slate-50 border-slate-200 hover:bg-slate-850/50 text-slate-700"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                          isChecked ? "bg-fuchsia-500 border-fuchsia-500 text-slate-900" : "border-slate-200 bg-white"
                        }`}>
                          {isChecked && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="font-bold text-slate-800 text-sm leading-tight">{q.questionText}</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-600">
                            <div>A: {q.optionA}</div>
                            <div>B: {q.optionB}</div>
                            <div>C: {q.optionC}</div>
                            <div>D: {q.optionD}</div>
                          </div>
                          <div className="text-[10px] text-green-400 font-bold uppercase">
                            Correct: {q.correctOption}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-white rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={selectedImportIds.length === 0}
                className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-50 disabled:text-slate-600 text-white text-sm font-semibold rounded-xl shadow transition-all"
              >
                Import {selectedImportIds.length} Selected
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- WRITTEN TEST MANUAL GRADING MODAL FOR FACULTY --- */}
      {gradingAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => { setGradingAttempt(null); setGradingScore(""); }}
            className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm"
          />
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl relative z-10 flex flex-col max-h-[85vh] shadow-2xl animate-scaleIn">
            
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Grade Student Submission</h3>
                <p className="text-xs text-slate-600">
                  Review student answers for written questions and assign a manual score.
                </p>
              </div>
              <button
                onClick={() => { setGradingAttempt(null); setGradingScore(""); }}
                className="p-1.5 bg-slate-100 hover:bg-slate-750 text-slate-600 hover:text-slate-900 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Student Name</span>
                  <span className="text-slate-900 font-bold text-sm">{gradingAttempt.studentName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Mobile/Email</span>
                  <span className="text-slate-900 font-bold text-sm">{gradingAttempt.studentMobile}</span>
                </div>
              </div>              <div className="space-y-4 border-t border-slate-200 pt-4">
                {getQuizByCode(gradingAttempt.quizCode)?.questions.map((q, idx) => {
                  const studentAnswer = gradingAttempt.answers[idx] || "(No response provided)";
                  const maxM = q.maxMarks || 5;
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                      <div className="font-bold text-slate-900 text-sm">
                        Question {idx + 1}: {q.questionText}
                      </div>
                      <div className="bg-white/60 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                        {studentAnswer}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-900/60">
                        <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Award Marks:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={maxM}
                            step="0.5"
                            value={gradingQuestionScores[idx] ?? 0}
                            onChange={(e) => {
                              const val = Math.min(maxM, Math.max(0, parseFloat(e.target.value) || 0));
                              const updated = [...gradingQuestionScores];
                              updated[idx] = val;
                              setGradingQuestionScores(updated);
                            }}
                            className="bg-white border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1 text-center font-bold text-xs w-16 focus:outline-none focus:border-fuchsia-500"
                          />
                          <span className="text-slate-500 text-xs font-semibold">/ {maxM}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-3xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm font-bold text-slate-900">
                Total Score: <span className="text-fuchsia-500 text-lg font-black">{gradingQuestionScores.reduce((a, b) => a + b, 0)}</span> / {(() => {
                  const qz = getQuizByCode(gradingAttempt.quizCode);
                  return getQuizTotalMarks(qz) || gradingAttempt.totalQuestions;
                })()}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => { setGradingAttempt(null); setGradingScore(""); }}
                  className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-700 hover:bg-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGradeSubmission(gradingAttempt.id)}
                  className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl shadow transition-all"
                >
                  Submit Marks
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Live Toast Popup */}
      {activeToast && (
        <div className="fixed top-6 right-6 z-50 animate-scaleIn max-w-sm w-full bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3.5 backdrop-blur-md bg-white/95">
          <div className={`p-2 rounded-xl shrink-0 ${
            activeToast.type === 'success' 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : activeToast.type === 'error'
              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
              : 'bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20'
          }`}>
            {activeToast.type === 'success' ? (
              <CheckCircle2 size={20} />
            ) : activeToast.type === 'error' ? (
              <AlertCircle size={20} />
            ) : (
              <Info size={20} />
            )}
          </div>
          <div className="flex-1 space-y-0.5 pt-0.5">
            <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              {activeToast.type === 'success' ? 'Success' : activeToast.type === 'error' ? 'Alert Error' : 'System Notice'}
            </h5>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{activeToast.message}</p>
          </div>
          <button 
            onClick={() => setActiveToast(null)} 
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Custom Reusable Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full shadow-2xl p-6 md:p-8 animate-scaleIn">
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                {confirmModal.cancelText || "Cancel"}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
                  confirmModal.isDanger 
                    ? "bg-red-600 hover:bg-red-500" 
                    : "bg-fuchsia-600 hover:bg-fuchsia-500"
                }`}
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(readingBookId || readingRentalId) && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col w-screen h-screen select-none overflow-hidden"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {/* Print protection style tag */}
          <style>{`
            @media print {
              body {
                display: none !important;
              }
            }
          `}</style>

          {/* Secure Reader Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-3 py-2.5 md:px-6 md:py-3.5 bg-slate-900 border-b border-slate-800 text-white shrink-0 font-sans">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div>
                <h4 className="text-sm md:text-lg font-bold text-white tracking-tight truncate max-w-[220px] sm:max-w-md">
                  {readingRentalId
                    ? (activeRentalReadData?.bookTitle || "Rented eBook")
                    : (PORTAL_PUBLISHED_BOOKS.find(b => b.id === readingBookId)?.title || "Secure Textbook")}
                </h4>
                <p className="text-[11px] text-slate-400 hidden sm:block">Secure e-Reader Mode — Printing, copying, and screenshots are restricted.</p>
              </div>
              <button
                onClick={closeSecureReader}
                className="md:hidden bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                Close
              </button>
            </div>
            
            {/* High-quality page navigation & Zoom controls */}
            <div className="flex items-center justify-between sm:justify-end w-full md:w-auto gap-2 md:gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-950/60 px-2.5 py-1 md:px-4 md:py-1.5 rounded-xl md:rounded-2xl border border-slate-800">
                <button
                  disabled={pdfCurrentPage <= 1 || pdfLoading}
                  onClick={triggerPrevPage}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white px-2 py-1 md:px-3.5 md:py-1.5 rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Prev
                </button>
                {isEditingPage ? (
                  <div className="flex items-center gap-1 min-w-[55px] md:min-w-[75px] justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pageInputVal}
                      onChange={(e) => setPageInputVal(e.target.value.replace(/\D/g, ""))}
                      onBlur={handlePageSubmit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePageSubmit();
                      }}
                      className="w-8 md:w-10 bg-slate-800 text-white border border-slate-700 rounded text-center text-xs px-1 py-0.5 focus:outline-none focus:border-fuchsia-500 font-mono font-bold"
                      autoFocus
                    />
                    <span className="text-[11px] md:text-xs font-mono text-slate-350 font-bold">/ {pdfTotalPages || "..."}</span>
                  </div>
                ) : (
                  <span 
                    onClick={() => setIsEditingPage(true)}
                    className="text-[11px] md:text-xs font-mono text-slate-350 min-w-[55px] md:min-w-[75px] text-center font-bold cursor-pointer hover:text-white transition-colors"
                    title="Click to jump to page"
                  >
                    {pdfCurrentPage} / {pdfTotalPages || "..."}
                  </span>
                )}
                <button
                  disabled={pdfCurrentPage >= pdfTotalPages || pdfLoading}
                  onClick={triggerNextPage}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white px-2 py-1 md:px-3.5 md:py-1.5 rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Next
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-950/60 px-2 py-1 md:px-3 md:py-1.5 rounded-xl md:rounded-2xl border border-slate-800">
                <button
                  disabled={pdfZoom <= 0.5 || pdfLoading}
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="text-[10px] md:text-xs font-mono font-bold text-slate-300 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  title="Click to reset zoom to 100%"
                >
                  {Math.round(pdfZoom * 100)}%
                </button>
                <button
                  disabled={pdfZoom >= 3.0 || pdfLoading}
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              <button
                onClick={closeSecureReader}
                className="hidden md:flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition items-center gap-1.5 shrink-0"
              >
                Close Reader
              </button>
            </div>
          </div>

          {/* Embedded Preview Container with relative positioning for watermark */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className={`relative flex-1 bg-zinc-100/90 ${pdfZoom > 1.0 ? "overflow-auto items-start p-6" : "overflow-hidden items-center p-2 md:p-3"} flex justify-center select-none h-full max-h-[calc(100vh-68px)]`}
          >
            {/* Page flip 3D rotation animation style */}
            <style>{`
              @keyframes pageFlipNext {
                0% {
                  transform: perspective(1400px) rotateY(-28deg) scale(0.96);
                  opacity: 0.8;
                  transform-origin: left center;
                }
                50% {
                  transform: perspective(1400px) rotateY(-12deg) scale(0.98);
                  opacity: 0.95;
                }
                100% {
                  transform: perspective(1400px) rotateY(0deg) scale(1);
                  opacity: 1;
                }
              }

              @keyframes pageFlipPrev {
                0% {
                  transform: perspective(1400px) rotateY(28deg) scale(0.96);
                  opacity: 0.8;
                  transform-origin: right center;
                }
                50% {
                  transform: perspective(1400px) rotateY(12deg) scale(0.98);
                  opacity: 0.95;
                }
                100% {
                  transform: perspective(1400px) rotateY(0deg) scale(1);
                  opacity: 1;
                }
              }

              .animate-page-flip-next {
                animation: pageFlipNext 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
              }

              .animate-page-flip-prev {
                animation: pageFlipPrev 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
              }
            `}</style>

            {/* Interactive Left Side Touch / Click Zone (Previous Page) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                triggerPrevPage();
              }}
              className={`absolute left-0 top-0 bottom-0 w-1/4 z-[50] cursor-pointer flex items-center justify-start pl-6 group transition-all select-none ${
                pdfCurrentPage <= 1 ? "pointer-events-none opacity-0" : "hover:bg-gradient-to-r hover:from-black/20 hover:to-transparent"
              }`}
              title="Click / Tap left side for Previous Page"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-all bg-slate-900/90 text-white p-3.5 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/60 group-hover:scale-110 transform">
                <ChevronLeft size={28} />
              </div>
            </div>

            {/* Interactive Right Side Touch / Click Zone (Next Page) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                triggerNextPage();
              }}
              className={`absolute right-0 top-0 bottom-0 w-1/4 z-[50] cursor-pointer flex items-center justify-end pr-6 group transition-all select-none ${
                pdfCurrentPage >= pdfTotalPages ? "pointer-events-none opacity-0" : "hover:bg-gradient-to-l hover:from-black/20 hover:to-transparent"
              }`}
              title="Click / Tap right side for Next Page"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-all bg-slate-900/90 text-white p-3.5 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/60 group-hover:scale-110 transform">
                <ChevronRight size={28} />
              </div>
            </div>

            {/* Dynamic watermark overlaid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[99] grid grid-cols-4 grid-rows-4 opacity-[0.20] select-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center -rotate-35 text-slate-500 text-sm md:text-base font-extrabold tracking-widest uppercase whitespace-nowrap">
                  {user?.collegeEmail || user?.mobileNumber || "LURNEXA PUBLICATION"}
                </div>
              ))}
            </div>

            {/* Blur warning overlay */}
            {isReaderBlurred && (
              <div 
                onClick={() => {
                  document.documentElement.classList.remove("force-secure-blur");
                  setIsReaderBlurred(false);
                }}
                className="absolute inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center text-center p-6 backdrop-blur-md cursor-pointer select-none"
              >
                <Shield className="text-fuchsia-500 mb-4 animate-bounce" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Secure Reader Mode</h3>
                <p className="text-sm text-slate-400 max-w-md mb-4">
                  Content was temporarily hidden. Click or tap anywhere to resume reading.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    document.documentElement.classList.remove("force-secure-blur");
                    setIsReaderBlurred(false);
                  }}
                  className="px-5 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                >
                  Resume Reading
                </button>
              </div>
            )}

            {/* Loading spinner or Error display */}
            {pdfError ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-32 text-center px-6">
                <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-300 max-w-md shadow-2xl">
                  <AlertCircle className="mx-auto mb-3 text-red-500 animate-pulse" size={36} />
                  <h4 className="font-bold text-base text-white mb-1">Document Load Error</h4>
                  <p className="text-xs text-slate-400 mb-4">{pdfError}</p>
                  <button
                    onClick={() => {
                      if (readingBookId) {
                        const book = PORTAL_PUBLISHED_BOOKS.find(b => b.id === readingBookId);
                        if (book) loadPdfFile(`/portal_textbooks/${book.pdfFileName}`);
                      } else if (readingRentalId && activeRentalReadData?.pdfUrl) {
                        loadPdfFile(activeRentalReadData.pdfUrl);
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            ) : pdfLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-32 text-slate-350">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
                <p className="text-sm font-medium">Securing and loading textbook page...</p>
              </div>
            ) : (
              <canvas
                id="secure-reader-canvas"
                className={`bg-white shadow-2xl rounded-2xl border border-slate-800 select-none pointer-events-none transition-all duration-300 shrink-0 ${
                  pageFlipAnim === "flip-next"
                    ? "animate-page-flip-next"
                    : pageFlipAnim === "flip-prev"
                    ? "animate-page-flip-prev"
                    : ""
                }`}
                style={{ userSelect: 'none' }}
              />
            )}
          </div>
        </div>
      )}

      {readingCaseletInfo !== null && (() => {
        const caselets = BOOK_CASELETS[readingCaseletInfo.bookId] || [];
        const currentCaselet = caselets[readingCaseletInfo.index];
        if (!currentCaselet) return null;

        return (
          <div 
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col w-screen h-screen select-none overflow-hidden font-sans" 
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {/* Print protection style tag */}
            <style>{`
              @media print {
                body {
                  display: none !important;
                }
              }
            `}</style>

            {/* Secure Reader Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-slate-800 text-white shrink-0">
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  {currentCaselet.title}
                </h4>
                <p className="text-xs text-slate-400">Secure Caselet Mode — Printing, copying, and screenshots are restricted.</p>
              </div>

              {/* High-quality page navigation & Zoom controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-950/45 px-4 py-2 rounded-2xl border border-slate-850">
                  <button
                    disabled={pdfCurrentPage <= 1 || pdfLoading}
                    onClick={triggerPrevPage}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Previous Page
                  </button>
                  {isEditingPage ? (
                    <div className="flex items-center gap-1 min-w-[75px] justify-center">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pageInputVal}
                        onChange={(e) => setPageInputVal(e.target.value.replace(/\D/g, ""))}
                        onBlur={handlePageSubmit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handlePageSubmit();
                        }}
                        className="w-10 bg-slate-800 text-white border border-slate-700 rounded text-center text-xs px-1 py-0.5 focus:outline-none focus:border-fuchsia-500 font-mono font-bold"
                        autoFocus
                      />
                      <span className="text-xs font-mono text-slate-350 font-bold">of {pdfTotalPages || "..."}</span>
                    </div>
                  ) : (
                    <span 
                      onClick={() => setIsEditingPage(true)}
                      className="text-xs font-mono text-slate-350 min-w-[75px] text-center font-bold cursor-pointer hover:text-white transition-colors"
                      title="Click to jump to page"
                    >
                      Page {pdfCurrentPage} of {pdfTotalPages || "..."}
                    </span>
                  )}
                  <button
                    disabled={pdfCurrentPage >= pdfTotalPages || pdfLoading}
                    onClick={triggerNextPage}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Next Page
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
                  <button
                    disabled={pdfZoom <= 0.5 || pdfLoading}
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="text-xs font-mono font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                    title="Click to reset zoom to 100%"
                  >
                    {Math.round(pdfZoom * 100)}%
                  </button>
                  <button
                    disabled={pdfZoom >= 3.0 || pdfLoading}
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={closeSecureReader}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  Close Reader
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onTouchMove={handleTouchMove}
              className={`relative flex-1 bg-zinc-100/90 ${pdfZoom > 1.0 ? "overflow-auto items-start p-6" : "overflow-hidden items-center p-2 md:p-3"} flex justify-center select-none h-full max-h-[calc(100vh-68px)]`}
            >
              {/* Page flip 3D rotation animation style */}
              <style>{`
                @keyframes pageFlipNext {
                  0% {
                    transform: perspective(1400px) rotateY(-28deg) scale(0.96);
                    opacity: 0.8;
                    transform-origin: left center;
                  }
                  50% {
                    transform: perspective(1400px) rotateY(-12deg) scale(0.98);
                    opacity: 0.95;
                  }
                  100% {
                    transform: perspective(1400px) rotateY(0deg) scale(1);
                    opacity: 1;
                  }
                }

                @keyframes pageFlipPrev {
                  0% {
                    transform: perspective(1400px) rotateY(28deg) scale(0.96);
                    opacity: 0.8;
                    transform-origin: right center;
                  }
                  50% {
                    transform: perspective(1400px) rotateY(12deg) scale(0.98);
                    opacity: 0.95;
                  }
                  100% {
                    transform: perspective(1400px) rotateY(0deg) scale(1);
                    opacity: 1;
                  }
                }

                .animate-page-flip-next {
                  animation: pageFlipNext 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }

                .animate-page-flip-prev {
                  animation: pageFlipPrev 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
              `}</style>

              {/* Interactive Left Side Touch / Click Zone (Previous Page) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerPrevPage();
                }}
                className={`absolute left-0 top-0 bottom-0 w-1/4 z-[50] cursor-pointer flex items-center justify-start pl-6 group transition-all select-none ${
                  pdfCurrentPage <= 1 ? "pointer-events-none opacity-0" : "hover:bg-gradient-to-r hover:from-black/20 hover:to-transparent"
                }`}
                title="Click / Tap left side for Previous Page"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-all bg-slate-900/90 text-white p-3.5 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/60 group-hover:scale-110 transform">
                  <ChevronLeft size={28} />
                </div>
              </div>

              {/* Interactive Right Side Touch / Click Zone (Next Page) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerNextPage();
                }}
                className={`absolute right-0 top-0 bottom-0 w-1/4 z-[50] cursor-pointer flex items-center justify-end pr-6 group transition-all select-none ${
                  pdfCurrentPage >= pdfTotalPages ? "pointer-events-none opacity-0" : "hover:bg-gradient-to-l hover:from-black/20 hover:to-transparent"
                }`}
                title="Click / Tap right side for Next Page"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-all bg-slate-900/90 text-white p-3.5 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/60 group-hover:scale-110 transform">
                  <ChevronRight size={28} />
                </div>
              </div>

              {/* Dynamic watermark overlaid */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-[99] grid grid-cols-4 grid-rows-4 opacity-[0.20] select-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center -rotate-35 text-slate-500 text-sm md:text-base font-extrabold tracking-widest uppercase whitespace-nowrap">
                    {user?.collegeEmail || user?.mobileNumber || "LURNEXA PUBLICATION"}
                  </div>
                ))}
              </div>

              {/* Blur warning overlay */}
              {isReaderBlurred && (
                <div 
                  onClick={() => {
                    document.documentElement.classList.remove("force-secure-blur");
                    setIsReaderBlurred(false);
                  }}
                  className="absolute inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center text-center p-6 backdrop-blur-md cursor-pointer select-none"
                >
                  <Shield className="text-fuchsia-500 mb-4 animate-bounce" size={48} />
                  <h3 className="text-xl font-bold text-white mb-2">Secure Reader Mode</h3>
                  <p className="text-sm text-slate-400 max-w-md mb-4">
                    Content was temporarily hidden. Click or tap anywhere to resume reading.
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      document.documentElement.classList.remove("force-secure-blur");
                      setIsReaderBlurred(false);
                    }}
                    className="px-5 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                  >
                    Resume Reading
                  </button>
                </div>
              )}

              {/* Loading spinner */}
              {pdfLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-32 text-slate-350">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
                  <p className="text-sm font-medium">Securing and loading caselet page...</p>
                </div>
              ) : (
                <canvas
                  id="secure-reader-canvas"
                  className={`bg-white shadow-2xl rounded-2xl border border-slate-800 select-none pointer-events-none transition-all duration-300 shrink-0 ${
                    pageFlipAnim === "flip-next"
                      ? "animate-page-flip-next"
                      : pageFlipAnim === "flip-prev"
                      ? "animate-page-flip-prev"
                      : ""
                  }`}
                  style={{ userSelect: 'none' }}
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* --- ORDER RECEIPT / INVOICE MODAL --- */}
      {selectedOrderInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedOrderInvoice(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-fuchsia-600 rounded-lg flex items-center justify-center font-black text-xs">LP</div>
                  <h3 className="text-lg font-black tracking-tight">LURNEXA PUBLICATIONS</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">Official Payment Receipt & Tax Invoice</p>
              </div>
              <button
                onClick={() => setSelectedOrderInvoice(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-slate-800 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{selectedOrderInvoice.orderId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                  <span className="font-bold text-slate-800">{new Date(selectedOrderInvoice.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
                  <span className="font-bold text-green-600 uppercase">{selectedOrderInvoice.status || "PAID"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">Billed Customer</span>
                  <p className="font-bold text-slate-900 text-xs">{selectedOrderInvoice.customerName || user?.name}</p>
                  <p className="text-slate-500">{selectedOrderInvoice.customerEmail || user?.email}</p>
                  <p className="text-slate-500">{selectedOrderInvoice.customerPhone || user?.mobileNumber}</p>
                </div>
                {selectedOrderInvoice.shippingAddress ? (
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">Shipping Address</span>
                    <p className="text-slate-700">{selectedOrderInvoice.shippingAddress}</p>
                    <p className="text-slate-700">{selectedOrderInvoice.city}, {selectedOrderInvoice.state} - {selectedOrderInvoice.shippingPincode}</p>
                  </div>
                ) : (
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">Delivery Type</span>
                    <p className="font-bold text-fuchsia-600">Digital eBook Reader & Access Key</p>
                    <p className="text-slate-500">Instant Access on Digital Bookshelf</p>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Format</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{selectedOrderInvoice.bookTitle}</div>
                        <div className="text-[11px] text-slate-500">Plan: {selectedOrderInvoice.purchasePlan}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-600">{selectedOrderInvoice.purchaseFormat}</td>
                      <td className="p-3 text-center font-bold">{selectedOrderInvoice.quantity || 1}</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{selectedOrderInvoice.amount?.toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold">
                {selectedOrderInvoice.subtotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{selectedOrderInvoice.subtotal?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {selectedOrderInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedOrderInvoice.couponCode})</span>
                    <span>- ₹{selectedOrderInvoice.discountAmount?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {selectedOrderInvoice.gstAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>GST / Taxes</span>
                    <span>+ ₹{selectedOrderInvoice.gstAmount?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total Paid</span>
                  <span className="text-fuchsia-600">₹{selectedOrderInvoice.amount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedOrderInvoice(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT ADDRESS MODAL --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddressModalOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg relative z-10 flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingAddressObj ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
                <p className="text-xs text-slate-500">Save address for physical textbook shipping</p>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddressSubmit} className="p-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Recipient Name *
                </label>
                <input
                  type="text"
                  value={addressFormData.fullName}
                  onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                  placeholder="e.g. Sai Reddy"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone / Mobile Number *
                </label>
                <input
                  type="text"
                  value={addressFormData.phoneNumber}
                  onChange={(e) => setAddressFormData({ ...addressFormData, phoneNumber: e.target.value })}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Flat, House No., Building, Street *
                </label>
                <input
                  type="text"
                  value={addressFormData.addressLine1}
                  onChange={(e) => setAddressFormData({ ...addressFormData, addressLine1: e.target.value })}
                  placeholder="e.g. Door 4-12, Plot 85, Academic Block Road"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Area, Landmark, Colony (Optional)
                </label>
                <input
                  type="text"
                  value={addressFormData.addressLine2}
                  onChange={(e) => setAddressFormData({ ...addressFormData, addressLine2: e.target.value })}
                  placeholder="e.g. Near University Gate"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                    placeholder="e.g. Telangana"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pincode / Zip Code *
                  </label>
                  <input
                    type="text"
                    value={addressFormData.pincode}
                    onChange={(e) => setAddressFormData({ ...addressFormData, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Address Tag
                  </label>
                  <select
                    value={addressFormData.addressType}
                    onChange={(e: any) => setAddressFormData({ ...addressFormData, addressType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-medium"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="College">College</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultAddress"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 cursor-pointer"
                />
                <label htmlFor="isDefaultAddress" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Set as Primary Default Delivery Address
                </label>
              </div>

              <div className="p-4 border-t border-slate-200 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RENEW RENTAL MODAL --- */}
      <RenewModal
        isOpen={renewalRental !== null}
        onClose={() => setRenewalRental(null)}
        rental={renewalRental}
        onConfirmRenewal={handleConfirmRenewal}
      />

      {!appMode && <FooterSection />}
    </div>
  );
}
