"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import NavigationPage from "@/components/Home/nav/page";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});
import FooterSection from "@/components/Home/FooterSection";
import {
  getUser,
  createUser,
  getAllUsers,
  updateUserStatus,
  updateUser,
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
  College
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
  GraduationCap
} from "lucide-react";

const getQuizTotalMarks = (quiz: TextbookQuiz | null | undefined): number => {
  if (!quiz) return 0;
  return quiz.questions.reduce((acc, q) => acc + (q.maxMarks || (quiz.type === 'written' ? 5 : 1)), 0);
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
  const genericDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "mail.com", "yandex.com", "protonmail.com"];
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return !genericDomains.includes(domain);
};

export default function TextbookPortal({ 
  defaultSignup = false,
  initialView = "",
  initialQuizCode = ""
}: { 
  defaultSignup?: boolean;
  initialView?: string;
  initialQuizCode?: string;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Auth State
  const [user, setUser] = useState<TextbookUser | null>(null);
  const [isSignup, setIsSignup] = useState(defaultSignup);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Login inputs
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
  const [genIdCollege, setGenIdCollege] = useState("");
  const [isCollegeAutoFilled, setIsCollegeAutoFilled] = useState(false);

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState(initialView || "");

  // --- ADMIN STATE ---
  const [adminUsers, setAdminUsers] = useState<TextbookUser[]>([]);
  const [adminCollegeFilter, setAdminCollegeFilter] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("");

  const [usersPage, setUsersPage] = useState(1);
  const [accessIdsPage, setAccessIdsPage] = useState(1);
  const [collegesPage, setCollegesPage] = useState(1);
  const [qbankPage, setQbankPage] = useState(1);
  const [textbooksPage, setTextbooksPage] = useState(1);
  const [adminQBankBook, setAdminQBankBook] = useState("1");

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
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<TextbookUser | null>(null);
  const [selectedTemplateFormat, setSelectedTemplateFormat] = useState<string>("");

  const [adminProfileEdit, setAdminProfileEdit] = useState({
    name: "Administrator",
    accessId: "LURNEXA",
    mobileNumber: "9347834904",
    email: "lurnexapublication@gmail.com"
  });

  const getAdminCredentials = () => {
    if (typeof window === 'undefined') return { accessId: "LURNEXA", mobileNumber: "9347834904", name: "Administrator", email: "lurnexapublication@gmail.com" };
    const saved = localStorage.getItem("lurnexa_admin_custom_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          email: "lurnexapublication@gmail.com",
          ...parsed
        };
      } catch (e) {}
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

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'warning') => {
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

  // --- STUDENT STATE ---
  const [studentQuizCode, setStudentQuizCode] = useState("");
  const [activeStudentQuiz, setActiveStudentQuiz] = useState<TextbookQuiz | null>(null);
  const [studentCurrentQuestionIndex, setStudentCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<string[]>([]);
  const [studentQuizResult, setStudentQuizResult] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Practice State
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<string[]>([]);
  const [practiceCurrentIndex, setPracticeCurrentIndex] = useState(0);
  const [practiceResultScore, setPracticeResultScore] = useState<number | null>(null);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState<number>(0);
  const [pastPracticeAttempts, setPastPracticeAttempts] = useState<PracticeAttempt[]>([]);
  const [selectedPastAttempt, setSelectedPastAttempt] = useState<PracticeAttempt | null>(null);

  // Safe window mount check
  useEffect(() => {
    setMounted(true);
    setTextbooks(getAllTextbooks());
    setColleges(getColleges());

    // Detect back/forward cache navigation and force login
    const handlePageShow = (e: PageTransitionEvent) => {
      const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      const isBackForward = navigationEntries[0]?.type === "back_forward";
      if (e.persisted || isBackForward) {
        sessionStorage.removeItem("lurnexa_current_user");
        setUser(null);
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    const savedUser = sessionStorage.getItem("lurnexa_current_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "admin") {
          const identifier = (parsed.role === "faculty" || parsed.role === "student") ? parsed.collegeEmail : parsed.mobileNumber;
          const fresh = getUser(identifier, parsed.accessId);
          if (fresh) {
            setUser(fresh);
            sessionStorage.setItem("lurnexa_current_user", JSON.stringify(fresh));
          } else {
            setUser(parsed);
          }
        } else {
          setUser(parsed);
        }

        // Set default tab based on role
        if (parsed.role === "admin") setActiveTab(initialView || "users");
        else if (parsed.role === "faculty") setActiveTab(initialView || "create");
        else setActiveTab(initialView || "join");
      } catch (e) {
        sessionStorage.removeItem("lurnexa_current_user");
      }
    }
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // Scan for expired quizzes and send results to teachers
  useEffect(() => {
    if (!mounted) return;

    const checkExpiredQuizzes = async () => {
      try {
        const quizzesRaw = localStorage.getItem('lurnexa_quizzes');
        const quizzes = quizzesRaw ? JSON.parse(quizzesRaw) : [];
        const sentEmailsRaw = localStorage.getItem('lurnexa_sent_quiz_emails');
        const sentEmails = sentEmailsRaw ? JSON.parse(sentEmailsRaw) : [];
        const now = new Date();

        const expiredUnsent = quizzes.filter((q: any) => {
          if (!q.endTime) return false;
          const isExpired = new Date(q.endTime) <= now;
          const isSent = sentEmails.includes(q.quizCode.toUpperCase());
          return isExpired && !isSent;
        });

        for (const quiz of expiredUnsent) {
          // Find the teacher details
          const usersRaw = localStorage.getItem('lurnexa_users');
          const users = usersRaw ? JSON.parse(usersRaw) : [];
          const teacher = users.find((u: any) => u.role === "faculty" && u.mobileNumber === quiz.createdBy);
          
          if (!teacher || !teacher.collegeEmail) {
            console.warn(`[Quiz Email Scanner] No teacher email found for quiz ${quiz.quizCode}`);
            // Add to sent emails to avoid scanning repeatedly if no teacher email exists
            sentEmails.push(quiz.quizCode.toUpperCase());
            localStorage.setItem('lurnexa_sent_quiz_emails', JSON.stringify(sentEmails));
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
            localStorage.setItem('lurnexa_sent_quiz_emails', JSON.stringify(sentEmails));
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLogin) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmittingLogin(true);

    const isFacultyLogin = loginAccessId.trim().toUpperCase().startsWith("LF");
    const isStudentLogin = loginAccessId.trim().toUpperCase().startsWith("LS");
    const isAdminAccess = loginAccessId.trim().toUpperCase() === "ADMIN";
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

    const adminCreds = getAdminCredentials();
    const isLoginAdminAccess = loginAccessId.toUpperCase() === adminCreds.accessId.toUpperCase();

    if (!isLoginAdminAccess) {
      if (isEmailLogin) {
        if (!isCollegeEmail(loginMobile)) {
          setErrorMessage("Please enter a valid college email ID. Generic domains (like Gmail, Yahoo, Outlook) are not allowed.");
          setSuccessMessage("");
          setIsSubmittingLogin(false);
          return;
        }
      } else {
        const cleanedMobile = loginMobile.replace(/\D/g, "");
        if (cleanedMobile.length !== 10) {
          setErrorMessage("Please enter a valid 10-digit mobile number containing only numbers.");
          setSuccessMessage("");
          setIsSubmittingLogin(false);
          return;
        }
      }
    }

    let targetCoordinate = loginMobile;
    let matchedUser: TextbookUser | null = null;

    const isAdminLogin = isLoginAdminAccess && (
      loginMobile.toLowerCase() === adminCreds.email.toLowerCase() ||
      loginMobile.replace(/\D/g, "") === adminCreds.mobileNumber
    );
    if (isAdminLogin) {
      targetCoordinate = loginMobile.includes("@") ? adminCreds.email : adminCreds.mobileNumber;
    } else {
      matchedUser = getUser(loginMobile, loginAccessId);
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
      if (!matchedUser.isActive) {
        setErrorMessage("Your profile is inactive. Please contact the administrator.");
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
        body: JSON.stringify({ accessId: loginAccessId, target: targetCoordinate }),
      });

      const data = await res.json();
      if (!res.ok) {
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
      setErrorMessage("Network error: Failed to contact authentication server.");
      setSuccessMessage("");
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle Login Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const adminCreds = getAdminCredentials();
    const isLoginAdminAccess = loginAccessId.toUpperCase() === adminCreds.accessId.toUpperCase();
    const isAdminLogin = isLoginAdminAccess && (
      loginMobile.toLowerCase() === adminCreds.email.toLowerCase() ||
      loginMobile.replace(/\D/g, "") === adminCreds.mobileNumber
    );

    let targetCoordinate = loginMobile;
    let matchedUser: TextbookUser | null = null;

    if (isAdminLogin) {
      targetCoordinate = loginMobile.includes("@") ? adminCreds.email : adminCreds.mobileNumber;
    } else {
      matchedUser = getUser(loginMobile, loginAccessId);
      if (!matchedUser) {
        setErrorMessage("Error retrieving user profile.");
        return;
      }
      targetCoordinate = (loginAccessId.trim().toUpperCase().startsWith("LF") || loginAccessId.trim().toUpperCase().startsWith("LS")) ? (matchedUser.collegeEmail || matchedUser.mobileNumber) : matchedUser.mobileNumber;
    }

    try {
      const res = await fetch("/api/textbooks/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessId: loginAccessId, target: targetCoordinate, code: otpInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "OTP verification failed.");
        return;
      }

      // Success login
      let loggedInUser: TextbookUser;
      if (isAdminLogin) {
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
      } else {
        loggedInUser = matchedUser!;
      }

      sessionStorage.setItem("lurnexa_session_token", data.token);
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setOtpSent(false);
      setSuccessMessage("Logged in successfully!");
      
      if (loggedInUser.role === "admin") setActiveTab("users");
      else if (loggedInUser.role === "faculty") setActiveTab("create");
      else setActiveTab("join");
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
      setErrorMessage("This Access ID has already been registered with another account.");
      return;
    }

    setIsAccessIdVerified(true);
    setDetectedRole(res.role || null);
    setDetectedBookId(res.bookId || "");
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
      setErrorMessage("Please enter a valid college email ID. Generic emails (like Gmail, Yahoo, Outlook) are not allowed.");
      return;
    }

    // Role specific fields
    if (detectedRole === "student" && (!collegeId || !department || !collegeEmail)) {
      setErrorMessage("Please fill in your College ID, Department, and College Email.");
      return;
    }
    if (detectedRole === "student" && !teachingFacultyAccessId) {
      setErrorMessage("Please select or enter your Teaching Faculty's Access ID/Mobile Number.");
      return;
    }
    if (detectedRole === "faculty" && (!facultyRole || !subjectTeaching || !facultyId || !collegeEmail)) {
      setErrorMessage("Please fill in all faculty registration details (Faculty ID, College Email, Designation, Subject).");
      return;
    }

    let verifiedFacultyAccessId = "";
    if (detectedRole === "student") {
      const input = teachingFacultyAccessId.trim();
      const allUsers = getAllUsers();
      const matchedFaculty = allUsers.find(
        u => u.role === "faculty" && 
        (u.accessId.toUpperCase() === input.toUpperCase() || 
         u.mobileNumber === input || 
         u.collegeEmail?.toLowerCase() === input.toLowerCase())
      );
      if (matchedFaculty) {
        if (matchedFaculty.bookId !== detectedBookId) {
          setErrorMessage(`Access Denied: The selected faculty teaches a different textbook than the one assigned to your Access ID. Both student and faculty must be assigned to the same book code prefix (e.g. LFML to LSML).`);
          return;
        }
        verifiedFacultyAccessId = matchedFaculty.accessId;
      } else {
        const allowedIds = getAllAccessIds();
        const preApprovedFaculty = allowedIds.find(
          item => item.role === "faculty" && item.accessId.toUpperCase() === input.toUpperCase()
        );
        if (preApprovedFaculty) {
          if (preApprovedFaculty.bookId !== detectedBookId) {
            setErrorMessage(`Access Denied: The selected faculty Access ID is pre-approved for a different textbook than yours. Both student and faculty must be assigned to the same book code prefix.`);
            return;
          }
          verifiedFacultyAccessId = preApprovedFaculty.accessId;
        } else {
          setErrorMessage("Teaching Faculty not found. Please enter a valid pre-approved Faculty Access ID (starts with LF) or registered Faculty Mobile Number.");
          return;
        }
      }
    }

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

      // Successful OTP Verification -> Create User
      let verifiedFacultyAccessId = "";
      if (detectedRole === "student") {
        const input = teachingFacultyAccessId.trim();
        const allUsers = getAllUsers();
        const matchedFaculty = allUsers.find(
          u => u.role === "faculty" && 
          (u.accessId.toUpperCase() === input.toUpperCase() || 
           u.mobileNumber === input || 
           u.collegeEmail?.toLowerCase() === input.toLowerCase())
        );
        if (matchedFaculty) {
          verifiedFacultyAccessId = matchedFaculty.accessId;
        } else {
          const allowedIds = getAllAccessIds();
          const preApprovedFaculty = allowedIds.find(
            item => item.role === "faculty" && item.accessId.toUpperCase() === input.toUpperCase()
          );
          if (preApprovedFaculty) {
            verifiedFacultyAccessId = preApprovedFaculty.accessId;
          }
        }
      }

      const newUser: TextbookUser = {
        name,
        bookId: detectedBookId,
        mobileNumber,
        role: detectedRole!,
        collegeName,
        isActive: true,
        accessId: signupAccessId,
        ...(detectedRole === "student" 
          ? { collegeId, department, teachingFacultyAccessId: verifiedFacultyAccessId, collegeEmail } 
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

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("lurnexa_current_user");
    setUser(null);
    setActiveTab("");
    setOtpSent(false);
    setOtpInput("");
    setGeneratedOtp("");
    setLoginAccessId("");
    setLoginMobile("");
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
      u => u.role === 'student' && u.teachingFacultyAccessId?.toUpperCase() === user!.accessId.toUpperCase()
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
    
    if (studentProfileName.trim() === user!.name) {
      setIsEditingStudentProfile(false);
      return;
    }
    
    const updatedUser = { ...user!, name: studentProfileName.trim() };
    const success = updateUser(user!.mobileNumber, { name: studentProfileName.trim() });
    if (success) {
      sessionStorage.setItem("lurnexa_current_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingStudentProfile(false);
      showToast("Profile name updated successfully!", "success");
    } else {
      showToast("Failed to update name.", "error");
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

      localStorage.setItem("lurnexa_admin_custom_profile", JSON.stringify({
        name: adminProfileEdit.name,
        accessId: adminProfileEdit.accessId,
        mobileNumber: adminProfileEdit.mobileNumber,
        email: adminProfileEdit.email
      }));

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
    if (!creatorFaculty || user!.teachingFacultyAccessId?.toUpperCase() !== creatorFaculty.accessId.toUpperCase()) {
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

    setActiveStudentQuiz(quiz);
    setStudentCurrentQuestionIndex(0);
    setStudentAnswers(new Array(quiz.questions.length).fill(""));
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

    let score = 0;
    const isWritten = activeStudentQuiz.type === 'written';

    if (!isWritten) {
      activeStudentQuiz.questions.forEach((q, idx) => {
        if (studentAnswers[idx] === q.correctOption) {
          score++;
        }
      });
    }

    const attempt = submitAttempt({
      quizCode: activeStudentQuiz.quizCode,
      studentMobile: user!.mobileNumber,
      studentName: user!.name,
      answers: studentAnswers,
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

    const newAttempt: PracticeAttempt = {
      id: `prac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentMobile: user!.mobileNumber,
      bookId: user!.bookId,
      practiceTestId: activePracticeTest?.id || "",
      answers: practiceAnswers,
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
        <NavigationPage />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 text-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 font-bold">Initializing Portal...</p>
          </div>
        </div>
        <FooterSection />
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
      <NavigationPage />

      <main className="min-h-screen bg-slate-50 text-slate-800 pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-8 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-fuchsia-500 font-bold mb-2">
                <Sparkles size={18} />
                <span>Textbook Portal</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Quiz & Practice Center
              </h1>
            </div>
            {user && (
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
                    {user.role} Portal
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
            )}
          </div>

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

          {/* --- LOGGED OUT VIEW --- */}
          {!user && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
              {/* Promo Info */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                  Accelerate Learning through <span className="text-fuchsia-500">Interactive Assessment</span>
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
                  Lurnexa's Textbook Quiz portal connects teachers and students. Faculty can craft precise quizzes mapped to coursework, and students can attempt assessments or study from mock test banks.
                </p>

                <div className="bg-slate-100/60 border border-slate-200 p-6 rounded-2xl max-w-xl space-y-3">
                  <div className="flex gap-2 items-center text-fuchsia-600 font-bold text-sm">
                    <Key size={16} />
                    <span>Enforced Access Registry</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This platform uses a pre-approved Access ID system. Your credentials must correspond to a unique ID assigned by your administrator. If you do not have an Access ID (e.g. <b>LSML26001</b> for Machine Learning student access), please request one from the system Admin.
                  </p>
                </div>
              </div>

              {/* Form Block */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 rounded-full blur-2xl pointer-events-none" />
                
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
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Twilio Caller ID Verification</h4>
                    </div>
                    <p className="text-xs text-amber-800 mb-2.5">
                      Twilio is calling your phone number now. Please answer and enter this verification code on your keypad:
                    </p>
                    <div className="flex justify-center">
                      <span className="font-mono text-2xl font-black bg-amber-500 text-white px-4 py-1.5 rounded-xl tracking-widest shadow-inner">
                        {twilioValidationCode}
                      </span>
                    </div>
                  </div>
                )}

                {/* Switch Login/Signup */}
                <div className="flex bg-slate-50 p-1.5 rounded-xl mb-8">
                  <button
                    onClick={() => { router.push("/textbooks/portal/login"); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isSignup ? "bg-fuchsia-600 text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { router.push("/textbooks/portal/signup"); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isSignup ? "bg-fuchsia-600 text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* LOGIN FORM */}
                {!isSignup && (
                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pre-approved Access ID</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-3.5 text-slate-500 h-5 w-5" />
                        <input
                          type="text"
                          placeholder="e.g. LSML26001 (Student) or LFML26001 (Faculty)"
                          value={loginAccessId}
                          onChange={(e) => setLoginAccessId(e.target.value.toUpperCase())}
                          disabled={otpSent || isSubmittingLogin}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 font-mono font-bold tracking-wide uppercase text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                        College Email ID
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-3.5 text-slate-500 font-black text-sm">@</span>
                        <input
                          type="text"
                          placeholder="e.g. email@college.edu"
                          value={loginMobile}
                          onChange={(e) => setLoginMobile(e.target.value)}
                          disabled={otpSent || isSubmittingLogin}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 font-medium"
                        />
                      </div>
                    </div>

                    {otpSent && (
                      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4 animate-fadeIn">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 text-center">Enter 6-Digit OTP</label>
                          <div className="flex justify-between gap-2 max-w-xs mx-auto mb-2">
                            {Array.from({ length: 6 }).map((_, index) => {
                              const char = otpInput[index] || "";
                              return (
                                <input
                                  key={index}
                                  id={`otp-digit-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={char}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    const updated = otpInput.split("");
                                    // Ensure we pad if necessary
                                    while (updated.length < 6) updated.push("");
                                    updated[index] = val;
                                    const newOtp = updated.join("").slice(0, 6);
                                    setOtpInput(newOtp);

                                    if (val && index < 5) {
                                      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
                                      if (nextInput) nextInput.focus();
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                      if (!char && index > 0) {
                                        const prevInput = document.getElementById(`otp-digit-${index - 1}`);
                                        if (prevInput) {
                                          prevInput.focus();
                                          const updated = otpInput.split("");
                                          updated[index - 1] = "";
                                          setOtpInput(updated.join(""));
                                        }
                                      } else {
                                        const updated = otpInput.split("");
                                        updated[index] = "";
                                        setOtpInput(updated.join(""));
                                      }
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                                    setOtpInput(pastedData);
                                    const focusIndex = Math.min(pastedData.length, 5);
                                    const targetInput = document.getElementById(`otp-digit-${focusIndex}`);
                                    if (targetInput) targetInput.focus();
                                  }}
                                  className="w-10 h-12 bg-white border-2 border-slate-200 text-slate-900 rounded-xl text-center font-bold text-lg focus:outline-none focus:border-fuchsia-500 transition-colors shadow-sm"
                                />
                              );
                            })}
                          </div>
                        </div>
                        <button
                          onClick={handleVerifyOtp}
                          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                        >
                          Verify & Proceed
                        </button>
                      </div>
                    )}

                    {!otpSent && (
                      <button
                        type="submit"
                        disabled={isSubmittingLogin}
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-fuchsia-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingLogin ? "Requesting OTP..." : "Request OTP Code"}
                        {!isSubmittingLogin && <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />}
                      </button>
                    )}
                  </form>
                )}

                {/* SIGNUP WORKFLOW */}
                {isSignup && (
                  <div className="space-y-4">
                    {/* Step 1: Verification */}
                    {!isAccessIdVerified ? (
                      <form onSubmit={handleVerifyAccessId} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Enter pre-approved Access ID</label>
                          <div className="relative">
                            <Key className="absolute left-4 top-3 text-slate-500 h-4 w-4" />
                            <input
                              type="text"
                              placeholder="e.g. LSML26001"
                              value={signupAccessId}
                              onChange={(e) => setSignupAccessId(e.target.value.toUpperCase())}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-fuchsia-500 font-mono uppercase font-bold tracking-wide text-sm"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">This ID starts with <b>LS</b> (Student) or <b>LF</b> (Faculty) mapping to your subject textbook.</p>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 rounded-xl shadow transition-all"
                        >
                          Verify Access ID
                        </button>
                      </form>
                    ) : signupOtpSent ? (
                      // Step 2b: OTP Verification Form (Before user registration)
                      <form onSubmit={handleVerifySignupOtp} className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                          <div className="text-[10px] text-fuchsia-600 uppercase font-black tracking-wider">Verification Required</div>
                          <div className="text-xs font-bold text-slate-700">
                            We've sent a 6-digit OTP code to {(detectedRole === "faculty" || detectedRole === "student") ? signupForm.collegeEmail : signupForm.mobileNumber}.
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Enter Verification Code (OTP)</label>
                          <input
                            type="text"
                            placeholder="------"
                            value={signupOtpInput}
                            onChange={(e) => setSignupOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 font-mono text-center font-bold tracking-widest text-xl"
                          />
                        </div>

                        <div className="flex gap-2 mt-4 pt-2">
                          <button
                            type="button"
                            onClick={() => { setSignupOtpSent(false); setErrorMessage(""); setSuccessMessage(""); }}
                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all"
                          >
                            Back to Form
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                          >
                            Verify & Register
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Step 2: Complete Details
                      <form onSubmit={handleSignupSubmit} className="space-y-4">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                          <div className="text-[10px] text-fuchsia-600 uppercase font-black tracking-wider">Access ID Validated</div>
                          <div className="text-sm font-bold text-slate-900 font-mono">{signupAccessId}</div>
                          <div className="text-xs text-slate-600 flex items-center gap-1">
                            <span className="capitalize font-bold text-green-400">{detectedRole} Role</span>
                            <span>for</span>
                            <span className="font-bold text-blue-400">
                              {textbooks.find(b => b.id === detectedBookId)?.title || `Book ${detectedBookId}`}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={signupForm.name}
                            onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Mobile Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 9876543210"
                            value={signupForm.mobileNumber}
                            onChange={(e) => setSignupForm({ ...signupForm, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">College / University Name</label>
                          <input
                            type="text"
                            placeholder="IIT Delhi"
                            value={signupForm.collegeName}
                            onChange={(e) => setSignupForm({ ...signupForm, collegeName: e.target.value })}
                            disabled={isCollegeAutoFilled}
                            className={`w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-sm ${
                              isCollegeAutoFilled ? "opacity-75 cursor-not-allowed select-none bg-slate-100 font-bold border-slate-300" : ""
                            }`}
                          />
                          {isCollegeAutoFilled && (
                            <span className="text-[10px] text-fuchsia-500 font-semibold mt-1 block">
                              College automatically selected based on your Access ID.
                            </span>
                          )}
                        </div>

                        {/* Conditional Student fields */}
                        {detectedRole === "student" && (
                          <div className="space-y-3 border-t border-slate-200/80 pt-3 animate-fadeIn">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">College ID / Roll</label>
                                <input
                                  type="text"
                                  placeholder="ID-88392"
                                  value={signupForm.collegeId}
                                  onChange={(e) => setSignupForm({ ...signupForm, collegeId: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Department</label>
                                <input
                                  type="text"
                                  placeholder="CSE"
                                  value={signupForm.department}
                                  onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">College Email ID</label>
                                <input
                                  type="email"
                                  placeholder="e.g. stud@college.edu"
                                  value={signupForm.collegeEmail}
                                  onChange={(e) => setSignupForm({ ...signupForm, collegeEmail: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                />
                                {signupForm.collegeEmail && signupForm.collegeEmail.includes("@") && !isCollegeEmail(signupForm.collegeEmail) && (
                                  <span className="text-[10px] text-red-500 font-bold block mt-1">Generic emails (Gmail/Yahoo/etc.) are not allowed!</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Teaching Faculty (Teacher Book ID / Access ID)</label>
                              <div className="space-y-2">
                                <select
                                  value={signupForm.teachingFacultyAccessId}
                                  onChange={(e) => {
                                    setSignupForm({ ...signupForm, teachingFacultyAccessId: e.target.value });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                >
                                  <option value="">-- Choose Your Faculty --</option>
                                  {getAllUsers()
                                    .filter(u => 
                                      u.role === "faculty" && 
                                      u.bookId === detectedBookId &&
                                      u.collegeName &&
                                      signupForm.collegeName &&
                                      u.collegeName.trim().toLowerCase() === signupForm.collegeName.trim().toLowerCase()
                                    )
                                    .map(f => (
                                      <option key={f.accessId} value={f.accessId}>
                                        {f.name} ({f.collegeEmail || f.mobileNumber})
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">Select your teacher from the dropdown list matching your textbook.</p>
                            </div>
                          </div>
                        )}

                        {/* Conditional Faculty fields */}
                        {detectedRole === "faculty" && (
                          <div className="space-y-3 border-t border-slate-200/80 pt-3 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Faculty ID</label>
                                <input
                                  type="text"
                                  placeholder="e.g. FAC-9901"
                                  value={signupForm.facultyId}
                                  onChange={(e) => setSignupForm({ ...signupForm, facultyId: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">College Email ID</label>
                                <input
                                  type="email"
                                  placeholder="e.g. prof@college.edu"
                                  value={signupForm.collegeEmail}
                                  onChange={(e) => setSignupForm({ ...signupForm, collegeEmail: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                />
                                {signupForm.collegeEmail && signupForm.collegeEmail.includes("@") && !isCollegeEmail(signupForm.collegeEmail) && (
                                  <span className="text-[10px] text-red-500 font-bold block mt-1">Generic emails (Gmail/Yahoo/etc.) are not allowed!</span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Designation</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Assistant Professor"
                                  value={signupForm.facultyRole}
                                  onChange={(e) => setSignupForm({ ...signupForm, facultyRole: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Subject Taught</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Machine Learning"
                                  value={signupForm.subjectTeaching}
                                  onChange={(e) => setSignupForm({ ...signupForm, subjectTeaching: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-fuchsia-500 font-medium text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4 pt-2">
                          <button
                            type="button"
                            onClick={() => { setIsAccessIdVerified(false); setErrorMessage(""); setSuccessMessage(""); }}
                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                          >
                            Create Profile
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- ADMIN DASHBOARD --- */}
          {user?.role === "admin" && (
            <div className="space-y-6">
              {/* Admin Tabs */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-4">
                <div className="flex flex-wrap">
                  <button
                    onClick={() => { setActiveTab("users"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                      activeTab === "users" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Users size={16} />
                    User Profile Control
                  </button>
                  <button
                    onClick={() => { setActiveTab("accessIds"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                      activeTab === "accessIds" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Key size={16} />
                    Access ID Generator
                  </button>
                  <button
                    onClick={() => { setActiveTab("qbank"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                      activeTab === "qbank" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen size={16} />
                    Practice Question Bank
                  </button>
                  <button
                    onClick={() => { setActiveTab("textbooks"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                      activeTab === "textbooks" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpenCheck size={16} />
                    Textbooks Manager
                  </button>
                  <button
                    onClick={() => { setActiveTab("colleges"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                      activeTab === "colleges" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <GraduationCap size={16} />
                    Colleges Manager
                  </button>
                   <button
                    onClick={() => { setActiveTab("practiceResults"); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                      activeTab === "practiceResults" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileSpreadsheet size={16} />
                    Practice Results
                  </button>
                  <button
                    onClick={() => { setActiveTab("adminProfile"); setErrorMessage(""); setSuccessMessage(""); setIsEditingProfile(false); setProfileOtpSent(false); }}
                    className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                      activeTab === "adminProfile" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <User size={16} />
                    Admin Profile
                  </button>
                </div>

                {activeTab !== "adminProfile" && activeTab !== "qbank" && activeTab !== "textbooks" && (
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
              {activeTab === "users" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Registered Profiles Management</h3>
                  <p className="text-xs text-slate-600 mb-6">Activate or deactivate profiles. Deactivated profiles are denied login capability.</p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                        <tr>
                          <th className="p-4 rounded-l-xl">Name</th>
                          <th className="p-4">Access ID</th>
                          <th className="p-4">Mobile</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">College</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 rounded-r-xl text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {(() => {
                          const filtered = adminUsers.filter(u => matchesCollegeFilter(u.collegeName, u.accessId) && (!adminRoleFilter || u.role === adminRoleFilter));
                          const itemsPerPage = 5;
                          const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                          const startIdx = (usersPage - 1) * itemsPerPage;
                          const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage);

                          return paginatedItems.map(u => (
                            <tr key={u.mobileNumber} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-900">{u.name}</td>
                              <td className="p-4 font-mono font-semibold text-fuchsia-600">{u.accessId}</td>
                              <td className="p-4 font-mono">{u.mobileNumber}</td>
                              <td className="p-4 capitalize">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  u.role === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                  u.role === "faculty" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                  "bg-green-500/10 text-green-400 border border-green-500/20"
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4 max-w-xs truncate">{u.collegeName}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.isActive ? "text-green-400" : "text-slate-500"}`}>
                                  <span className={`w-2 h-2 rounded-full ${u.isActive ? "bg-green-500 animate-pulse" : "bg-slate-500"}`} />
                                  {u.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {u.role !== "admin" ? (
                                  <button
                                    onClick={() => handleToggleUserStatus(u.mobileNumber, u.isActive)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                      u.isActive 
                                        ? "bg-slate-100 hover:bg-red-950/40 text-red-400 border border-red-500/20" 
                                        : "bg-green-600 hover:bg-green-500 text-white"
                                    }`}
                                  >
                                    {u.isActive ? "Deactivate" : "Activate"}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-500 font-medium">Protected</span>
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
                    const filtered = adminUsers.filter(u => matchesCollegeFilter(u.collegeName, u.accessId) && (!adminRoleFilter || u.role === adminRoleFilter));
                    const itemsPerPage = 5;
                    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                    if (filtered.length === 0) return null;

                    return (
                      <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4 animate-fadeIn">
                        <span className="text-xs text-slate-500 font-bold">
                          Showing Page {usersPage} of {totalPages} ({filtered.length} total users)
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
                    );
                  })()}
                </div>
              )}

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
                          <option value="">-- No College (Generic) --</option>
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
                        <p className="text-[10px] text-slate-500 mt-1">Used to generate signup codes like LFCD26001 (Faculty) or LSCD26001 (Student).</p>
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
                        })()
                      )}
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
                        <p className="text-[10px] text-slate-500 mt-1">Used to generate unique mapped Access IDs (e.g., NC for Narayana College will produce LSMLNC26001).</p>
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
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Access ID</span>
                          <span className="text-sm font-bold text-slate-900 font-mono">{user?.accessId}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Number</span>
                          <span className="text-sm font-bold text-slate-900">{user?.mobileNumber}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email Address</span>
                          <span className="text-sm font-bold text-slate-900">{user?.collegeEmail || "lurnexapublication@gmail.com"}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Organization</span>
                          <span className="text-sm font-bold text-slate-900">{user?.collegeName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- FACULTY DASHBOARD --- */}
          {user?.role === "faculty" && (
            <div className="space-y-6">
              {/* Faculty Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => { setActiveTab("create"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                    activeTab === "create" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Plus size={16} />
                  Assemble Custom Quiz
                </button>
                <button
                  onClick={() => { setActiveTab("results"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                    activeTab === "results" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileSpreadsheet size={16} />
                  View Quiz Results
                </button>
                <button
                  onClick={() => { setActiveTab("students"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); setSelectedStudentDetails(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                    activeTab === "students" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users size={16} />
                  My Students
                </button>
                <button
                  onClick={() => { setActiveTab("profile"); setErrorMessage(""); setSuccessMessage(""); setSelectedFacultyQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
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
                              onClick={() => {
                                navigator.clipboard.writeText(publishedQuizCode);
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
                                <div className="font-semibold text-white text-sm leading-tight pr-6">{q.questionText}</div>
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
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => { setActiveTab("join"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                    activeTab === "join" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Play size={16} />
                  Join Active Quiz
                </button>
                <button
                  onClick={() => { setActiveTab("practice"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                    activeTab === "practice" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BookOpen size={16} />
                  Practice Questions
                </button>
                <button
                  onClick={() => { setActiveTab("history"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                    activeTab === "history" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileSpreadsheet size={16} />
                  My Quiz History
                </button>
                <button
                  onClick={() => { setActiveTab("studentProfile"); setErrorMessage(""); setSuccessMessage(""); setStudentQuizResult(null); setActiveStudentQuiz(null); }}
                  className={`px-6 py-3 font-bold border-b-2 text-sm transition-all flex items-center gap-2 ${
                    activeTab === "studentProfile" ? "border-fuchsia-500 text-fuchsia-500" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User size={16} />
                  My Profile
                </button>
              </div>

              {/* Tab 1: Join & Attempt Quiz */}
              {activeTab === "join" && (
                <div className="max-w-2xl mx-auto">
                  {/* Assigned Teacher Widget */}
                  {(() => {
                    const teacher = getAllUsers().find(
                      u => u.role === "faculty" && u.accessId?.toUpperCase() === user?.teachingFacultyAccessId?.toUpperCase()
                    );
                    if (!teacher) return null;
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
                                        setPracticeQuestions(selectedQ);
                                        setPracticeAnswers(new Array(selectedQ.length).fill(""));
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

              {/* Tab 4: Student Profile */}
              {activeTab === "studentProfile" && (
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
                          user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST"
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
                        Student Member
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

                  {/* Profile Details Form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xl font-bold text-slate-900">Account Details</h4>
                      {!isEditingStudentProfile && (
                        <button
                          onClick={() => {
                            setStudentProfileName(user?.name || "");
                            setIsEditingStudentProfile(true);
                          }}
                          className="bg-slate-950 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                          Edit Profile Details
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
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Mobile Number (Read-only)</label>
                            <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium cursor-not-allowed">
                              {user?.mobileNumber}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">College Email ID (Read-only)</label>
                            <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium cursor-not-allowed">
                              {user?.collegeEmail || "N/A"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">College Name (Read-only)</label>
                            <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium cursor-not-allowed">
                              {user?.collegeName || "N/A"}
                            </div>
                          </div>
                          {user?.collegeId && (
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">College ID (Read-only)</label>
                              <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium font-mono cursor-not-allowed">
                                {user?.collegeId}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Assigned Teacher Access ID (Read-only)</label>
                            <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-4 py-2.5 font-medium font-mono cursor-not-allowed">
                              {user?.teachingFacultyAccessId || "N/A"}
                            </div>
                          </div>
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
                            {user?.mobileNumber}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">College Email ID</label>
                          <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium">
                            {user?.collegeEmail || "N/A"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">College Name</label>
                          <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium">
                            {user?.collegeName || "N/A"}
                          </div>
                        </div>
                        {user?.collegeId && (
                          <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">College ID</label>
                            <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium font-mono">
                              {user?.collegeId}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono font-bold">Assigned Teacher Access ID</label>
                          <div className="bg-slate-50 border border-slate-200 text-slate-855 rounded-xl px-4 py-2.5 font-medium font-mono text-slate-800 font-bold">
                            {user?.teachingFacultyAccessId || "N/A"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  <span className="text-white font-bold text-sm">{gradingAttempt.studentName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Mobile/Email</span>
                  <span className="text-white font-bold text-sm">{gradingAttempt.studentMobile}</span>
                </div>
              </div>              <div className="space-y-4 border-t border-slate-200 pt-4">
                {getQuizByCode(gradingAttempt.quizCode)?.questions.map((q, idx) => {
                  const studentAnswer = gradingAttempt.answers[idx] || "(No response provided)";
                  const maxM = q.maxMarks || 5;
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                      <div className="font-bold text-white text-sm">
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

      <FooterSection />
    </div>
  );
}
