import { SEED_QUESTIONS, Question } from './data/practice_questions';

export interface InterviewQuestion {
  id: string;
  company: string;
  role?: string;
  questionText: string;
  answerText?: string;
  difficulty?: string;
  createdAt: string;
}

export interface CompanyUpdate {
  id: string;
  company: string;
  updates: string[];
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  bookId: string;
  applicableFormat: 'soft' | 'physical' | 'both';
  softDiscountPercentage?: number;
  hardDiscountPercentage?: number;
}

export interface PurchaseRecord {
  id: number;
  orderId: string;
  userIdentifier: string;
  bookId: string;
  amount: number;
  status: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingPincode?: string;
  couponCode?: string;
  discountAmount?: number;
  gstAmount?: number;
  shippingAmount?: number;
  city?: string;
  state?: string;
  country?: string;
  quantity?: number;
  subtotal?: number;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  paymentStatus?: string;
  orderStatus?: string;
  purchaseFormat?: string;
  purchasePlan?: string;
  accessId?: string;
  createdAt?: string;
}

export interface TextbookUser {
  name: string;
  bookId: string;
  mobileNumber: string;
  role: 'student' | 'faculty' | 'admin';
  collegeName: string;
  collegeId?: string; // student college id
  facultyId?: string; // faculty id
  collegeEmail?: string; // faculty college email
  department?: string;
  facultyRole?: string; // faculty designation
  subjectTeaching?: string;
  isActive: boolean;
  accessId: string; // The pre-approved ID used during signup and login
  teachingFacultyAccessId?: string; // The Access ID of the student's teaching faculty
  profilePicture?: string; // Base64 profile photo data url
  plan?: 'complete' | 'placements' | 'practice' | 'book_only' | 'caselet' | 'book_caselet' | 'book_portal' | 'book_caselet_portal';
  purchasedBooks?: string[]; // array of book ids
}

export interface AllowedAccessId {
  accessId: string;
  bookId: string;
  role: 'student' | 'faculty';
  assignedTo?: string; // Mobile number of the assigned user, undefined if unassigned
  collegeCode?: string; // Abbreviation code of mapped college
  plan?: string;
}

export interface College {
  code: string; // Unique, e.g. "NC"
  name: string; // College Name, e.g. "Narayana College"
}

export interface Textbook {
  id: string;
  title: string;
  code: string;
}

export interface TextbookQuiz {
  quizCode: string;
  title: string;
  bookId: string;
  createdBy: string; // Mobile number
  type: 'mcq' | 'written';
  duration: number; // in minutes
  questions: {
    questionText: string;
    maxMarks?: number;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctOption?: 'A' | 'B' | 'C' | 'D';
    chapter?: number;
  }[];
  chapters?: number[];
  createdAt: string;
  startTime?: string; // ISO date-time string
  endTime?: string;   // ISO date-time string
}

export interface QuizAttempt {
  id: string;
  quizCode: string;
  studentMobile: string;
  studentName: string;
  answers: string[]; // Selected options or written answers
  questionScores?: number[]; // Marks awarded per question
  score: number;
  totalQuestions: number;
  attemptedAt: string;
  type: 'mcq' | 'written';
  status: 'pending' | 'graded';
}

export interface PracticeAttempt {
  id: string;
  studentMobile: string;
  bookId: string;
  answers: string[];
  score: number;
  totalQuestions: number;
  completedAt: string;
  practiceTestId: string;
}

const isClient = typeof window !== 'undefined';

// In-memory cache for all portal tables to prevent storage in browser cache or localStorage
const IN_MEMORY_DB: Record<string, any> = {};

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (IN_MEMORY_DB[key] !== undefined) {
    return IN_MEMORY_DB[key] as T;
  }
  return defaultValue;
}

const KEY_TO_TABLE: Record<string, string> = {
  'lurnexa_users': 'users',
  'lurnexa_allowed_access_ids': 'allowed_access_ids',
  'lurnexa_colleges': 'colleges',
  'lurnexa_textbooks': 'textbooks',
  'lurnexa_quizzes': 'quizzes',
  'lurnexa_attempts': 'attempts',
  'lurnexa_book_chapters': 'book_chapters',
  'lurnexa_practice_configs': 'practice_configs',
  'lurnexa_practice_attempts': 'practice_attempts',
  'lurnexa_practice_tests': 'practice_tests',
  'lurnexa_interview_questions': 'interview_questions',
  'lurnexa_company_updates': 'company_updates',
  'lurnexa_coupons': 'coupons',
  'lurnexa_purchases': 'purchases'
};

function syncKeyToServer(key: string, value: any) {
  const table = KEY_TO_TABLE[key];
  if (!table) return;
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', table, data: value })
  }).catch(err => console.error(`Failed to sync key ${key} to server database:`, err));
}

export function setStorageItem<T>(key: string, value: T): void {
  IN_MEMORY_DB[key] = value;
  syncKeyToServer(key, value);
}

// Helpers for Access ID Prefix logic
export function getBookCode(bookId: string): string {
  initDb();
  const books = getStorageItem<Textbook[]>('lurnexa_textbooks', []);
  const book = books.find(b => b.id === bookId);
  if (book) return book.code;
  
  // Fallback mapping in case textbooks registry is not synced
  const fallback: Record<string, string> = {
    "1": "MP",
    "2": "ML",
    "3": "DB",
    "4": "ED",
    "5": "PM",
    "6": "AI"
  };
  return fallback[bookId] || "XX";
}

export function getBookIdFromCode(code: string): string {
  initDb();
  const books = getStorageItem<Textbook[]>('lurnexa_textbooks', []);
  const book = books.find(b => b.code.toUpperCase() === code.toUpperCase());
  return book ? book.id : "";
}

/**
 * Initializes the database tables in IN_MEMORY_DB with default seed data
 */
export async function syncFromServer(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/textbooks/db/sync');
    const data = await res.json();
    if (data.success) {
      if (data.users) {
        IN_MEMORY_DB['lurnexa_users'] = data.users;
        try { localStorage.setItem('lurnexa_users', JSON.stringify(data.users)); } catch (e) {}
      }
      if (data.allowedAccessIds) {
        IN_MEMORY_DB['lurnexa_allowed_access_ids'] = data.allowedAccessIds;
        try { localStorage.setItem('lurnexa_allowed_access_ids', JSON.stringify(data.allowedAccessIds)); } catch (e) {}
      }
      if (data.colleges) {
        IN_MEMORY_DB['lurnexa_colleges'] = data.colleges;
        try { localStorage.setItem('lurnexa_colleges', JSON.stringify(data.colleges)); } catch (e) {}
      }
      if (data.textbooks) {
        IN_MEMORY_DB['lurnexa_textbooks'] = data.textbooks;
        try { localStorage.setItem('lurnexa_textbooks', JSON.stringify(data.textbooks)); } catch (e) {}
      }
      if (data.quizzes) {
        IN_MEMORY_DB['lurnexa_quizzes'] = data.quizzes;
        try { localStorage.setItem('lurnexa_quizzes', JSON.stringify(data.quizzes)); } catch (e) {}
      }
      if (data.attempts) {
        IN_MEMORY_DB['lurnexa_attempts'] = data.attempts;
        try { localStorage.setItem('lurnexa_attempts', JSON.stringify(data.attempts)); } catch (e) {}
      }
      if (data.chaptersMap) {
        IN_MEMORY_DB['lurnexa_book_chapters'] = data.chaptersMap;
        try { localStorage.setItem('lurnexa_book_chapters', JSON.stringify(data.chaptersMap)); } catch (e) {}
      }
      if (data.configsMap) {
        IN_MEMORY_DB['lurnexa_practice_configs'] = data.configsMap;
        try { localStorage.setItem('lurnexa_practice_configs', JSON.stringify(data.configsMap)); } catch (e) {}
      }
      if (data.practiceAttempts) {
        IN_MEMORY_DB['lurnexa_practice_attempts'] = data.practiceAttempts;
        try { localStorage.setItem('lurnexa_practice_attempts', JSON.stringify(data.practiceAttempts)); } catch (e) {}
      }
      if (data.practiceTests) {
        IN_MEMORY_DB['lurnexa_practice_tests'] = data.practiceTests;
        try { localStorage.setItem('lurnexa_practice_tests', JSON.stringify(data.practiceTests)); } catch (e) {}
      }
      if (data.interviewQuestions) {
        IN_MEMORY_DB['lurnexa_interview_questions'] = data.interviewQuestions;
        try { localStorage.setItem('lurnexa_interview_questions', JSON.stringify(data.interviewQuestions)); } catch (e) {}
      }
      if (data.companyUpdates) {
        IN_MEMORY_DB['lurnexa_company_updates'] = data.companyUpdates;
        try { localStorage.setItem('lurnexa_company_updates', JSON.stringify(data.companyUpdates)); } catch (e) {}
      }
      if (data.coupons) {
        IN_MEMORY_DB['lurnexa_coupons'] = data.coupons;
        try { localStorage.setItem('lurnexa_coupons', JSON.stringify(data.coupons)); } catch (e) {}
      }
      if (data.purchases) {
        IN_MEMORY_DB['lurnexa_purchases'] = data.purchases;
        try { localStorage.setItem('lurnexa_purchases', JSON.stringify(data.purchases)); } catch (e) {}
      }
      return true;
    }
  } catch (err) {
    console.error("Error loading sync data from server database:", err);
  }
  return false;
}

export function initDb(): void {
  if (!isClient) return;

  // Background-sync the entire database state from PostgreSQL
  if (typeof window !== 'undefined' && !window.hasOwnProperty('__db_sync_started')) {
    (window as any).__db_sync_started = true;
    syncFromServer();
  }

  // Purge/clean up browser's legacy localStorage to guarantee compliance
  if (typeof window !== 'undefined') {
    const localPurgeKey = 'lurnexa_db_purge_v5_local';
    if (!localStorage.getItem(localPurgeKey)) {
      const keysToPurge = [
        'lurnexa_users',
        'lurnexa_allowed_access_ids',
        'lurnexa_colleges',
        'lurnexa_textbooks',
        'lurnexa_quizzes',
        'lurnexa_attempts',
        'lurnexa_book_chapters',
        'lurnexa_practice_configs',
        'lurnexa_practice_attempts',
        'lurnexa_practice_tests',
        'lurnexa_sent_quiz_emails',
        'lurnexa_admin_custom_profile',
        'lurnexa_db_purge_v5'
      ];
      keysToPurge.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (e) {}
      });
      localStorage.setItem(localPurgeKey, 'true');
    }
  }

  // One-time database purge inside in-memory store
  const dbPurgeCompleted = IN_MEMORY_DB['lurnexa_db_purge_v5'];
  if (!dbPurgeCompleted) {
    delete IN_MEMORY_DB['lurnexa_users'];
    delete IN_MEMORY_DB['lurnexa_allowed_access_ids'];
    delete IN_MEMORY_DB['lurnexa_colleges'];
    delete IN_MEMORY_DB['lurnexa_quizzes'];
    delete IN_MEMORY_DB['lurnexa_attempts'];
    delete IN_MEMORY_DB['lurnexa_sent_quiz_emails'];
    delete IN_MEMORY_DB['lurnexa_admin_custom_profile'];
    delete IN_MEMORY_DB['lurnexa_practice_attempts'];
    delete IN_MEMORY_DB['lurnexa_practice_tests'];
    IN_MEMORY_DB['lurnexa_db_purge_v5'] = 'true';
  }

  // Initialize Access IDs Registry as empty (no default seeded IDs)
  if (!IN_MEMORY_DB['lurnexa_allowed_access_ids']) {
    IN_MEMORY_DB['lurnexa_allowed_access_ids'] = [];
  }
  let allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);

  // Initialize Users (Seed Admin user)
  let users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
  let usersModified = false;
  
  // Enforce exactly 1 admin user matching the new required credentials
  const otherAdmins = users.filter(u => u.role === 'admin' && (u.mobileNumber !== '9347834904' || u.accessId.toUpperCase() !== 'LURNEXA'));
  if (otherAdmins.length > 0) {
    users = users.filter(u => !(u.role === 'admin' && (u.mobileNumber !== '9347834904' || u.accessId.toUpperCase() !== 'LURNEXA')));
    usersModified = true;
  }

  const hasAdmin = users.some(u => u.role === 'admin' && u.mobileNumber === '9347834904');
  if (!hasAdmin) {
    users.push({
      name: "Administrator",
      bookId: "ADMIN",
      mobileNumber: "9347834904",
      role: "admin",
      collegeName: "Lurnexa Publications Admin HQ",
      isActive: true,
      collegeEmail: "lurnexapublication@gmail.com",
      accessId: "LURNEXA"
    });
    IN_MEMORY_DB['lurnexa_users'] = users;
    try { localStorage.setItem('lurnexa_users', JSON.stringify(users)); } catch (e) {}
  } else if (usersModified) {
    IN_MEMORY_DB['lurnexa_users'] = users;
    try { localStorage.setItem('lurnexa_users', JSON.stringify(users)); } catch (e) {}
  } else {
    // If multiple duplicate admins of the correct credentials exist, keep exactly one
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length > 1) {
      users = users.filter(u => u.role !== 'admin' || u.mobileNumber === '9347834904');
      IN_MEMORY_DB['lurnexa_users'] = users;
      try { localStorage.setItem('lurnexa_users', JSON.stringify(users)); } catch (e) {}
    }
  }

  // Initialize Question Bank (Seed Default practice questions)
  const qBank = getStorageItem<Question[]>('lurnexa_question_bank', []);
  if (qBank.length === 0) {
    IN_MEMORY_DB['lurnexa_question_bank'] = SEED_QUESTIONS;
  }

  // Initialize Quizzes
  if (!IN_MEMORY_DB['lurnexa_quizzes']) {
    IN_MEMORY_DB['lurnexa_quizzes'] = [];
  }

  // Initialize Attempts
  if (!IN_MEMORY_DB['lurnexa_attempts']) {
    IN_MEMORY_DB['lurnexa_attempts'] = [];
  }

  // Initialize Chapters count mapping
  if (!IN_MEMORY_DB['lurnexa_book_chapters']) {
    IN_MEMORY_DB['lurnexa_book_chapters'] = {
      "1": 5,
      "2": 5,
      "3": 5,
      "4": 5,
      "5": 6,
      "6": 5
    };
  }

  // Initialize Practice Test Configurations
  if (!IN_MEMORY_DB['lurnexa_practice_configs']) {
    IN_MEMORY_DB['lurnexa_practice_configs'] = {
      "1": { duration: 10, questionLimit: 5 },
      "2": { duration: 15, questionLimit: 5 },
      "3": { duration: 12, questionLimit: 5 },
      "4": { duration: 10, questionLimit: 5 },
      "5": { duration: 12, questionLimit: 5 },
      "6": { duration: 15, questionLimit: 5 }
    };
  }

  // Initialize Textbooks
  if (!IN_MEMORY_DB['lurnexa_textbooks']) {
    const defaultBooks: Textbook[] = [
      { id: "1", title: "Indian Mineral Import Policy Options", code: "MP" },
      { id: "2", title: "Machine Learning: A Structured Approach", code: "ML" },
      { id: "3", title: "Database Management Systems: Concepts & Design", code: "DB" },
      { id: "4", title: "Entrepreneurship Development: Concepts to Creation", code: "ED" },
      { id: "5", title: "Principles of Microeconomics for Business and Management", code: "PM" },
      { id: "6", title: "Foundations of Artificial Intelligence: Concepts, Techniques and Applications", code: "AI" }
    ];
    IN_MEMORY_DB['lurnexa_textbooks'] = defaultBooks;
  }

  // Initialize Colleges
  if (!IN_MEMORY_DB['lurnexa_colleges']) {
    const defaultColleges: College[] = [
      { code: "NC", name: "Narayana College" }
    ];
    IN_MEMORY_DB['lurnexa_colleges'] = defaultColleges;
  }

  // Initialize Career Hub - Interview Questions
  const currentQuestions = getStorageItem<InterviewQuestion[]>('lurnexa_interview_questions', []);
  if (currentQuestions.length === 0) {
    const defaultQuestions: InterviewQuestion[] = [
      {
        id: "iq-1",
        company: "Google",
        role: "Software Engineer",
        questionText: "Explain the difference between process and thread, and how multi-threading is handled in modern operating systems.",
        answerText: "A process is an independent executing program with its own memory space, while a thread is a subset of a process that shares memory with other threads of the same process. OS handles multi-threading via context switching and CPU scheduling.",
        difficulty: "Medium",
        createdAt: new Date().toISOString()
      },
      {
        id: "iq-2",
        company: "Microsoft",
        role: "Software Engineer II",
        questionText: "Given a binary tree, write an efficient algorithm to serialize and deserialize it.",
        answerText: "Use pre-order traversal for serialization, marking null nodes with a placeholder (e.g. '#'). For deserialization, reconstruct using a queue containing the serialized values.",
        difficulty: "Hard",
        createdAt: new Date().toISOString()
      },
      {
        id: "iq-3",
        company: "Amazon",
        role: "Systems Engineer",
        questionText: "Design a URL shortening service like bit.ly. Detail the database schema and scaling strategy.",
        answerText: "Use Base62 encoding for short IDs, store mappings in a NoSQL database (e.g. DynamoDB) for scalability, and cache popular links using Redis.",
        difficulty: "Hard",
        createdAt: new Date().toISOString()
      }
    ];
    IN_MEMORY_DB['lurnexa_interview_questions'] = defaultQuestions;
    if (typeof window !== 'undefined') {
      setStorageItem('lurnexa_interview_questions', defaultQuestions);
    }
  }

  // Initialize Career Hub - Company Updates
  const currentUpdates = getStorageItem<CompanyUpdate[]>('lurnexa_company_updates', []);
  if (currentUpdates.length === 0) {
    const defaultUpdates: CompanyUpdate[] = [
      {
        id: "cu-1",
        company: "Google",
        updates: [
          "Google is hiring Software Engineering Interns for 2026/2027.",
          "Applications open next week on the Google Careers portal.",
          "Focus areas: Data Structures, Algorithms, and System Design."
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "cu-2",
        company: "Microsoft",
        updates: [
          "Microsoft IDC off-campus drive announced for Graduate Engineers.",
          "Eligible branches: CSE, IT, ECE.",
          "Online assessment is expected to commence in July."
        ],
        createdAt: new Date().toISOString()
      }
    ];
    IN_MEMORY_DB['lurnexa_company_updates'] = defaultUpdates;
    if (typeof window !== 'undefined') {
      setStorageItem('lurnexa_company_updates', defaultUpdates);
    }
  }
}

// ==========================================
// ACCESS ID DB OPERATIONS
// ==========================================

export function getAllAccessIds(): AllowedAccessId[] {
  initDb();
  return getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
}

export function validateAccessId(accessId: string): { 
  isValid: boolean; 
  bookId?: string; 
  role?: 'student' | 'faculty'; 
  isAssigned?: boolean;
  collegeCode?: string;
  collegeName?: string;
  plan?: string;
  error?: string; 
} {
  initDb();
  const idClean = accessId.trim().toUpperCase();
  
  if (idClean === "ADMIN") {
    return { isValid: true, bookId: "ADMIN", role: "faculty", isAssigned: true }; // Special Admin Bypass
  }

  const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
  const matched = allowedIds.find(item => item.accessId.toUpperCase() === idClean);
  
  if (!matched) {
    return { isValid: false, error: "Invalid Access ID. Please check the code or contact your Admin." };
  }

  let collegeName = "";
  if (matched.collegeCode) {
    const colleges = getStorageItem<College[]>('lurnexa_colleges', []);
    const coll = colleges.find(c => c.code.toUpperCase() === matched.collegeCode!.toUpperCase());
    if (coll) {
      collegeName = coll.name;
    }
  }

  return {
    isValid: true,
    bookId: matched.bookId,
    role: matched.role,
    isAssigned: !!matched.assignedTo,
    collegeCode: matched.collegeCode,
    collegeName: collegeName,
    plan: matched.plan
  };
}

export function generateAccessId(bookId: string, role: 'student' | 'faculty', collegeCode?: string): string {
  initDb();
  const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
  
  const rolePrefix = role === 'faculty' ? 'LF' : 'LS';
  const bookCode = getBookCode(bookId);
  const collegePart = collegeCode ? (collegeCode.toUpperCase() === "OTHERS" || collegeCode.toUpperCase() === "OT" ? "OT" : collegeCode.toUpperCase()) : "";
  const prefix = `${rolePrefix}${bookCode}${collegePart}`; // e.g. LSMLNC or LFMLNC

  // Find all existing matching prefixes to calculate count
  const matches = allowedIds
    .filter(item => item.accessId.toUpperCase().startsWith(prefix.toUpperCase()))
    .map(item => {
      const numPart = item.accessId.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

  const nextNum = matches.length > 0 ? Math.max(...matches) + 1 : 26001;
  const newId = `${prefix}${nextNum}`;

  allowedIds.push({
    accessId: newId,
    bookId,
    role,
    collegeCode: collegeCode ? (collegeCode.toUpperCase() === "OTHERS" || collegeCode.toUpperCase() === "OT" ? "OT" : collegeCode.toUpperCase()) : undefined
  });

  setStorageItem('lurnexa_allowed_access_ids', allowedIds);
  return newId;
}

export function generateAccessIdsBulk(bookId: string, role: 'student' | 'faculty', count: number, collegeCode?: string): string[] {
  initDb();
  const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
  
  const rolePrefix = role === 'faculty' ? 'LF' : 'LS';
  const bookCode = getBookCode(bookId);
  const collegePart = collegeCode ? (collegeCode.toUpperCase() === "OTHERS" || collegeCode.toUpperCase() === "OT" ? "OT" : collegeCode.toUpperCase()) : "";
  const prefix = `${rolePrefix}${bookCode}${collegePart}`; // e.g. LSMLNC or LFMLNC

  // Find all existing matching prefixes to calculate starting count
  const matches = allowedIds
    .filter(item => item.accessId.toUpperCase().startsWith(prefix.toUpperCase()))
    .map(item => {
      const numPart = item.accessId.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

  let nextNum = matches.length > 0 ? Math.max(...matches) + 1 : 26001;
  const generatedIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const newId = `${prefix}${nextNum}`;
    
    allowedIds.push({
      accessId: newId,
      bookId,
      role,
      collegeCode: collegeCode ? (collegeCode.toUpperCase() === "OTHERS" || collegeCode.toUpperCase() === "OT" ? "OT" : collegeCode.toUpperCase()) : undefined
    });
    generatedIds.push(newId);
    nextNum++;
  }

  setStorageItem('lurnexa_allowed_access_ids', allowedIds);
  return generatedIds;
}

// ==========================================
// USER DB OPERATIONS
// ==========================================

export function getUser(mobileOrEmail: string, accessId: string): TextbookUser | null {
  initDb();
  const idClean = accessId.trim().toUpperCase();
  
  // Special admin bypass check
  if ((mobileOrEmail === '9347834904' || mobileOrEmail.toLowerCase() === 'lurnexapublication@gmail.com') && idClean === 'LURNEXA') {
    const users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
    return users.find(u => u.mobileNumber === '9347834904' && u.accessId.toUpperCase() === 'LURNEXA') || null;
  }

  const users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
  const isEmailUser = idClean.startsWith("LF") || idClean.startsWith("LS");

  if (isEmailUser) {
    return users.find(u => u.collegeEmail?.toLowerCase() === mobileOrEmail.trim().toLowerCase() && u.accessId.toUpperCase() === idClean) || null;
  } else {
    return users.find(u => u.mobileNumber === mobileOrEmail.trim() && u.accessId.toUpperCase() === idClean) || null;
  }
}

export function getAllUsers(): TextbookUser[] {
  initDb();
  return getStorageItem<TextbookUser[]>('lurnexa_users', []);
}

export function createUser(user: TextbookUser): { success: boolean; error?: string } {
  initDb();
  const users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
  const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
  
  // Validate mobile number unique
  if (users.some(u => u.mobileNumber === user.mobileNumber)) {
    return { success: false, error: "A user with this mobile number already exists." };
  }

  // Validate Access ID
  const idClean = user.accessId.trim().toUpperCase();
  const idIndex = allowedIds.findIndex(item => item.accessId.toUpperCase() === idClean);
  
  if (idIndex === -1) {
    return { success: false, error: "The provided Access ID is invalid." };
  }

  if (allowedIds[idIndex].assignedTo) {
    return { success: false, error: "This Access ID has already been assigned to another account." };
  }

  // Assign ID
  allowedIds[idIndex].assignedTo = user.mobileNumber;
  setStorageItem('lurnexa_allowed_access_ids', allowedIds);

  // Add User
  users.push(user);
  setStorageItem('lurnexa_users', users);
  
  return { success: true };
}

export function updateUserStatus(mobileNumber: string, isActive: boolean): boolean {
  initDb();
  const users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
  const index = users.findIndex(u => u.mobileNumber === mobileNumber);
  if (index !== -1) {
    // Admin cannot deactivate themselves
    if (mobileNumber === '9347834904') return false;

    users[index].isActive = isActive;
    setStorageItem('lurnexa_users', users);
    return true;
  }
  return false;
}

export function updateUser(mobileNumber: string, updatedFields: Partial<TextbookUser>): boolean {
  initDb();
  const users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
  const index = users.findIndex(u => u.mobileNumber === mobileNumber);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedFields };
    setStorageItem('lurnexa_users', users);
    return true;
  }
  return false;
}

export function deleteUser(mobileNumber: string): boolean {
  initDb();
  const users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
  const userToDelete = users.find(u => u.mobileNumber === mobileNumber);
  if (!userToDelete) return false;

  // Protect Admin from deletion
  if (mobileNumber === '9347834904') return false;

  // Remove the user from the list
  const updatedUsers = users.filter(u => u.mobileNumber !== mobileNumber);
  setStorageItem('lurnexa_users', updatedUsers);

  // Free their accessId mapping so it can be reused
  if (userToDelete.accessId) {
    const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
    const idx = allowedIds.findIndex(item => item.accessId.toUpperCase() === userToDelete.accessId.toUpperCase());
    if (idx !== -1) {
      delete allowedIds[idx].assignedTo;
      setStorageItem('lurnexa_allowed_access_ids', allowedIds);
    }
  }

  // Also delete on server database
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table: 'users', data: { mobileNumber } })
  }).catch(err => console.error(`Failed to delete user ${mobileNumber} on server:`, err));

  return true;
}

// ==========================================
// QUESTION BANK DB OPERATIONS
// ==========================================

export function getQuestionsByBook(bookId: string): Question[] {
  initDb();
  const qBank = getStorageItem<Question[]>('lurnexa_question_bank', []);
  return qBank.filter(q => q.bookId === bookId);
}

export function addQuestionToBank(question: Omit<Question, 'id'>): Question {
  initDb();
  const qBank = getStorageItem<Question[]>('lurnexa_question_bank', []);
  const newQuestion: Question = {
    ...question,
    id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  };
  qBank.push(newQuestion);
  setStorageItem('lurnexa_question_bank', qBank);
  return newQuestion;
}

export function deleteQuestionFromBank(id: string): boolean {
  initDb();
  const qBank = getStorageItem<Question[]>('lurnexa_question_bank', []);
  const index = qBank.findIndex(q => q.id === id);
  if (index !== -1) {
    qBank.splice(index, 1);
    setStorageItem('lurnexa_question_bank', qBank);
    return true;
  }
  return false;
}

// ==========================================
// QUIZ DB OPERATIONS
// ==========================================

export function getQuizByCode(quizCode: string): TextbookQuiz | null {
  initDb();
  const quizzes = getStorageItem<TextbookQuiz[]>('lurnexa_quizzes', []);
  return quizzes.find(q => q.quizCode.toUpperCase() === quizCode.toUpperCase()) || null;
}

export function getQuizzesByCreator(createdByMobile: string): TextbookQuiz[] {
  initDb();
  const quizzes = getStorageItem<TextbookQuiz[]>('lurnexa_quizzes', []);
  return quizzes.filter(q => q.createdBy === createdByMobile);
}

export function createQuiz(quiz: TextbookQuiz): { success: boolean; error?: string } {
  initDb();
  const quizzes = getStorageItem<TextbookQuiz[]>('lurnexa_quizzes', []);
  
  // Check if code is unique
  if (quizzes.some(q => q.quizCode.toUpperCase() === quiz.quizCode.toUpperCase())) {
    return { success: false, error: "A quiz with this code already exists. Please try again." };
  }

  quizzes.push(quiz);
  setStorageItem('lurnexa_quizzes', quizzes);
  return { success: true };
}

// ==========================================
// ATTEMPTS DB OPERATIONS
// ==========================================

export function submitAttempt(attempt: Omit<QuizAttempt, 'id' | 'attemptedAt'>): QuizAttempt {
  initDb();
  const attempts = getStorageItem<QuizAttempt[]>('lurnexa_attempts', []);
  const newAttempt: QuizAttempt = {
    ...attempt,
    id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    attemptedAt: new Date().toISOString()
  };
  attempts.push(newAttempt);
  setStorageItem('lurnexa_attempts', attempts);
  return newAttempt;
}

export function getAttemptsForQuiz(quizCode: string): QuizAttempt[] {
  initDb();
  const attempts = getStorageItem<QuizAttempt[]>('lurnexa_attempts', []);
  return attempts
    .filter(a => a.quizCode.toUpperCase() === quizCode.toUpperCase())
    .sort((a, b) => b.score - a.score);
}

export function getAttemptsForStudent(studentMobile: string): QuizAttempt[] {
  initDb();
  const attempts = getStorageItem<QuizAttempt[]>('lurnexa_attempts', []);
  return attempts.filter(a => a.studentMobile === studentMobile);
}

export function gradeAttempt(attemptId: string, score: number, questionScores?: number[]): boolean {
  initDb();
  const attempts = getStorageItem<QuizAttempt[]>('lurnexa_attempts', []);
  const idx = attempts.findIndex(a => a.id === attemptId);
  if (idx !== -1) {
    attempts[idx].score = score;
    if (questionScores) {
      attempts[idx].questionScores = questionScores;
    }
    attempts[idx].status = 'graded';
    setStorageItem('lurnexa_attempts', attempts);
    return true;
  }
  return false;
}

export function getBookChapters(bookId: string): number {
  initDb();
  const chaptersMap = getStorageItem<Record<string, number>>('lurnexa_book_chapters', {
    "1": 5,
    "2": 5,
    "3": 5,
    "4": 5
  });
  return chaptersMap[bookId] ?? 5;
}

export function updateBookChapters(bookId: string, count: number): void {
  initDb();
  const chaptersMap = getStorageItem<Record<string, number>>('lurnexa_book_chapters', {
    "1": 5,
    "2": 5,
    "3": 5,
    "4": 5
  });
  chaptersMap[bookId] = count;
  setStorageItem('lurnexa_book_chapters', chaptersMap);
}

export function getPracticeConfig(bookId: string): { duration: number; questionLimit: number } {
  initDb();
  const configs = getStorageItem<Record<string, { duration: number; questionLimit: number }>>('lurnexa_practice_configs', {
    "1": { duration: 10, questionLimit: 5 },
    "2": { duration: 15, questionLimit: 5 },
    "3": { duration: 12, questionLimit: 5 },
    "4": { duration: 10, questionLimit: 5 }
  });
  return configs[bookId] ?? { duration: 10, questionLimit: 5 };
}

export function updatePracticeConfig(bookId: string, duration: number, questionLimit: number): void {
  initDb();
  const configs = getStorageItem<Record<string, { duration: number; questionLimit: number }>>('lurnexa_practice_configs', {
    "1": { duration: 10, questionLimit: 5 },
    "2": { duration: 15, questionLimit: 5 },
    "3": { duration: 12, questionLimit: 5 },
    "4": { duration: 10, questionLimit: 5 }
  });
  configs[bookId] = { duration, questionLimit };
  setStorageItem('lurnexa_practice_configs', configs);
}

export function getAllTextbooks(): Textbook[] {
  initDb();
  return getStorageItem<Textbook[]>('lurnexa_textbooks', []);
}

export function addTextbook(book: Textbook): { success: boolean; error?: string } {
  initDb();
  const books = getStorageItem<Textbook[]>('lurnexa_textbooks', []);
  
  // Validate unique ID
  const idClean = book.id.trim();
  if (books.some(b => b.id.toLowerCase() === idClean.toLowerCase())) {
    return { success: false, error: `A textbook with ID "${idClean}" already exists.` };
  }

  // Validate unique code
  const codeClean = book.code.trim().toUpperCase();
  if (books.some(b => b.code.toUpperCase() === codeClean)) {
    return { success: false, error: `A textbook with prefix code "${codeClean}" already exists.` };
  }

  // Validate fields
  if (!book.title.trim()) {
    return { success: false, error: "Textbook title cannot be empty." };
  }

  books.push({
    id: idClean,
    title: book.title.trim(),
    code: codeClean
  });

  setStorageItem('lurnexa_textbooks', books);
  return { success: true };
}

export function deleteTextbook(bookId: string): void {
  initDb();
  
  // 1. Delete textbook
  const books = getStorageItem<Textbook[]>('lurnexa_textbooks', []);
  const updatedBooks = books.filter(b => b.id !== bookId);
  setStorageItem('lurnexa_textbooks', updatedBooks);

  // 2. Cascade delete questions mapped to this book
  const qBank = getStorageItem<Question[]>('lurnexa_question_bank', []);
  const updatedQBank = qBank.filter(q => q.bookId !== bookId);
  setStorageItem('lurnexa_question_bank', updatedQBank);

  // 3. Cascade delete chapters config mapping
  const chaptersMap = getStorageItem<Record<string, number>>('lurnexa_book_chapters', {});
  if (bookId in chaptersMap) {
    delete chaptersMap[bookId];
    setStorageItem('lurnexa_book_chapters', chaptersMap);
  }

  // 4. Cascade delete access IDs mapped to this book
  const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
  const updatedAllowedIds = allowedIds.filter(item => item.bookId !== bookId);
  setStorageItem('lurnexa_allowed_access_ids', updatedAllowedIds);

  // 5. Cascade delete quizzes mapped to this book
  const quizzes = getStorageItem<TextbookQuiz[]>('lurnexa_quizzes', []);
  const updatedQuizzes = quizzes.filter(q => q.bookId !== bookId);
  setStorageItem('lurnexa_quizzes', updatedQuizzes);

  // 6. Cascade delete attempts mapped to those quizzes
  const deletedQuizCodes = quizzes.filter(q => q.bookId === bookId).map(q => q.quizCode.toUpperCase());
  if (deletedQuizCodes.length > 0) {
    const attempts = getStorageItem<QuizAttempt[]>('lurnexa_attempts', []);
    const updatedAttempts = attempts.filter(a => !deletedQuizCodes.includes(a.quizCode.toUpperCase()));
    setStorageItem('lurnexa_attempts', updatedAttempts);
  }

  // 7. Cascade delete practice attempts mapped to this book
  const practiceAttempts = getStorageItem<PracticeAttempt[]>('lurnexa_practice_attempts', []);
  const updatedPracticeAttempts = practiceAttempts.filter(a => a.bookId !== bookId);
  setStorageItem('lurnexa_practice_attempts', updatedPracticeAttempts);

  // Also delete on server database
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table: 'textbooks', data: { bookId } })
  }).catch(err => console.error(`Failed to delete textbook ${bookId} on server:`, err));
}

export function getPracticeAttempts(studentMobile: string, bookId: string): PracticeAttempt[] {
  initDb();
  if (typeof window === 'undefined') return [];
  const attempts = getStorageItem<PracticeAttempt[]>('lurnexa_practice_attempts', []);
  return attempts.filter(a => a.studentMobile === studentMobile && a.bookId === bookId);
}

export function getAllPracticeAttempts(): PracticeAttempt[] {
  initDb();
  if (typeof window === 'undefined') return [];
  return getStorageItem<PracticeAttempt[]>('lurnexa_practice_attempts', []);
}

export function savePracticeAttempt(attempt: PracticeAttempt): void {
  initDb();
  if (typeof window === 'undefined') return;
  const attempts = getStorageItem<PracticeAttempt[]>('lurnexa_practice_attempts', []);
  attempts.push(attempt);
  setStorageItem('lurnexa_practice_attempts', attempts);
}

export function toggleQuestionPracticeSelection(questionId: string, isSelected: boolean): void {
  initDb();
  if (typeof window === 'undefined') return;
  const qBank = getStorageItem<Question[]>('lurnexa_question_bank', []);
  const index = qBank.findIndex(q => q.id === questionId);
  if (index !== -1) {
    qBank[index].selectedForPractice = isSelected;
    setStorageItem('lurnexa_question_bank', qBank);
  }
}

export interface PracticeTest {
  id: string;
  title: string;
  bookId: string;
  duration: number;
  questionLimit: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  selectedQuestionIds?: string[];
}

export function getPracticeTests(bookId?: string): PracticeTest[] {
  initDb();
  if (typeof window === 'undefined') return [];
  const tests = getStorageItem<PracticeTest[]>('lurnexa_practice_tests', []);
  if (bookId) {
    return tests.filter(t => t.bookId === bookId);
  }
  return tests;
}

export function savePracticeTest(test: PracticeTest): { success: boolean; error?: string } {
  initDb();
  if (typeof window === 'undefined') return { success: false };
  const tests = getStorageItem<PracticeTest[]>('lurnexa_practice_tests', []);
  tests.push(test);
  setStorageItem('lurnexa_practice_tests', tests);
  return { success: true };
}

export function deletePracticeTest(id: string): void {
  initDb();
  if (typeof window === 'undefined') return;
  const tests = getStorageItem<PracticeTest[]>('lurnexa_practice_tests', []);
  const updated = tests.filter(t => t.id !== id);
  setStorageItem('lurnexa_practice_tests', updated);

  // Also delete on server database
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table: 'practice_tests', data: { id } })
  }).catch(err => console.error(`Failed to delete practice test ${id} on server:`, err));
}

export function updatePracticeTest(updatedTest: PracticeTest): void {
  initDb();
  if (typeof window === 'undefined') return;
  const tests = getStorageItem<PracticeTest[]>('lurnexa_practice_tests', []);
  const index = tests.findIndex(t => t.id === updatedTest.id);
  if (index !== -1) {
    tests[index] = updatedTest;
    setStorageItem('lurnexa_practice_tests', tests);
  }
}

export function getColleges(): College[] {
  initDb();
  return getStorageItem<College[]>('lurnexa_colleges', []);
}

export function addCollege(college: College): { success: boolean; error?: string } {
  initDb();
  const colleges = getStorageItem<College[]>('lurnexa_colleges', []);
  const codeClean = college.code.trim().toUpperCase();
  if (colleges.some(c => c.code.toUpperCase() === codeClean)) {
    return { success: false, error: `A college with code "${codeClean}" already exists.` };
  }
  if (!college.name.trim()) {
    return { success: false, error: "College name cannot be empty." };
  }
  colleges.push({
    code: codeClean,
    name: college.name.trim()
  });
  setStorageItem('lurnexa_colleges', colleges);
  return { success: true };
}

export function deleteCollege(code: string): void {
  initDb();
  const colleges = getStorageItem<College[]>('lurnexa_colleges', []);
  const updated = colleges.filter(c => c.code.toUpperCase() !== code.toUpperCase());
  setStorageItem('lurnexa_colleges', updated);

  // Also delete on server database
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table: 'colleges', data: { code } })
  }).catch(err => console.error(`Failed to delete college ${code} on server:`, err));
}

export function getInterviewQuestions(): InterviewQuestion[] {
  initDb();
  return getStorageItem<InterviewQuestion[]>('lurnexa_interview_questions', []);
}

export function saveInterviewQuestion(question: InterviewQuestion): void {
  initDb();
  if (typeof window === 'undefined') return;
  const list = getStorageItem<InterviewQuestion[]>('lurnexa_interview_questions', []);
  const idx = list.findIndex(q => q.id === question.id);
  if (idx !== -1) {
    list[idx] = question;
  } else {
    list.push(question);
  }
  setStorageItem('lurnexa_interview_questions', list);
}

export function deleteInterviewQuestion(id: string): void {
  initDb();
  if (typeof window === 'undefined') return;
  const list = getStorageItem<InterviewQuestion[]>('lurnexa_interview_questions', []);
  const updated = list.filter(q => q.id !== id);
  setStorageItem('lurnexa_interview_questions', updated);

  // Also delete on server database
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table: 'interview_questions', data: { id } })
  }).catch(err => console.error(`Failed to delete interview question ${id} on server:`, err));
}

export function getCompanyUpdates(): CompanyUpdate[] {
  initDb();
  return getStorageItem<CompanyUpdate[]>('lurnexa_company_updates', []);
}

export function saveCompanyUpdate(update: CompanyUpdate): void {
  initDb();
  if (typeof window === 'undefined') return;
  const list = getStorageItem<CompanyUpdate[]>('lurnexa_company_updates', []);
  const idx = list.findIndex(u => u.id === update.id);
  if (idx !== -1) {
    list[idx] = update;
  } else {
    list.push(update);
  }
  setStorageItem('lurnexa_company_updates', list);
}

export function deleteCompanyUpdate(id: string): void {
  initDb();
  if (typeof window === 'undefined') return;
  const list = getStorageItem<CompanyUpdate[]>('lurnexa_company_updates', []);
  const updated = list.filter(u => u.id !== id);
  setStorageItem('lurnexa_company_updates', updated);

  // Also delete on server database
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table: 'company_updates', data: { id } })
  }).catch(err => console.error(`Failed to delete company update ${id} on server:`, err));
}

export function getCoupons(): Coupon[] {
  initDb();
  return getStorageItem<Coupon[]>('lurnexa_coupons', []);
}

export function saveCoupon(coupon: Coupon): void {
  initDb();
  if (typeof window === 'undefined') return;
  const list = getStorageItem<Coupon[]>('lurnexa_coupons', []);
  const idx = list.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
  if (idx !== -1) {
    list[idx] = coupon;
  } else {
    list.push(coupon);
  }
  setStorageItem('lurnexa_coupons', list);
}

export function deleteCoupon(code: string): void {
  initDb();
  if (typeof window === 'undefined') return;
  const list = getStorageItem<Coupon[]>('lurnexa_coupons', []);
  const updated = list.filter(c => c.code.toUpperCase() !== code.toUpperCase());
  IN_MEMORY_DB['lurnexa_coupons'] = updated;
  try { localStorage.setItem('lurnexa_coupons', JSON.stringify(updated)); } catch (e) {}
  
  // Also delete on server database
  fetch('/api/textbooks/db/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', table: 'coupons', data: { code } })
  }).catch(err => console.error(`Failed to delete coupon ${code} on server:`, err));
}

export function getAllPurchases(): PurchaseRecord[] {
  initDb();
  return getStorageItem<PurchaseRecord[]>('lurnexa_purchases', []);
}


