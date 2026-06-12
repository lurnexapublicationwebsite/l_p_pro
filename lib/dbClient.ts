import { SEED_QUESTIONS, Question } from './data/practice_questions';

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
}

export interface AllowedAccessId {
  accessId: string;
  bookId: string;
  role: 'student' | 'faculty';
  assignedTo?: string; // Mobile number of the assigned user, undefined if unassigned
  collegeCode?: string; // Abbreviation code of mapped college
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
  'lurnexa_practice_tests': 'practice_tests'
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
  return book ? book.code : "XX";
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
export function initDb(): void {
  if (!isClient) return;

  // Background-sync the entire database state from PostgreSQL
  if (typeof window !== 'undefined' && !window.hasOwnProperty('__db_sync_started')) {
    (window as any).__db_sync_started = true;
    fetch('/api/textbooks/db/sync')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.users) IN_MEMORY_DB['lurnexa_users'] = data.users;
          if (data.allowedAccessIds) IN_MEMORY_DB['lurnexa_allowed_access_ids'] = data.allowedAccessIds;
          if (data.colleges) IN_MEMORY_DB['lurnexa_colleges'] = data.colleges;
          if (data.textbooks) IN_MEMORY_DB['lurnexa_textbooks'] = data.textbooks;
          if (data.quizzes) IN_MEMORY_DB['lurnexa_quizzes'] = data.quizzes;
          if (data.attempts) IN_MEMORY_DB['lurnexa_attempts'] = data.attempts;
          if (data.chaptersMap) IN_MEMORY_DB['lurnexa_book_chapters'] = data.chaptersMap;
          if (data.configsMap) IN_MEMORY_DB['lurnexa_practice_configs'] = data.configsMap;
          if (data.practiceAttempts) IN_MEMORY_DB['lurnexa_practice_attempts'] = data.practiceAttempts;
          if (data.practiceTests) IN_MEMORY_DB['lurnexa_practice_tests'] = data.practiceTests;
        }
      })
      .catch(err => console.error("Error loading sync data from server database:", err));
  }

  // Purge/clean up browser's legacy localStorage to guarantee compliance
  if (typeof window !== 'undefined') {
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

  // Initialize Users (Seed Admin user)
  let users = getStorageItem<TextbookUser[]>('lurnexa_users', []);
  
  // Enforce exactly 1 admin user matching the new required credentials
  const otherAdmins = users.filter(u => u.role === 'admin' && (u.mobileNumber !== '9347834904' || u.accessId.toUpperCase() !== 'LURNEXA'));
  if (otherAdmins.length > 0) {
    users = users.filter(u => !(u.role === 'admin' && (u.mobileNumber !== '9347834904' || u.accessId.toUpperCase() !== 'LURNEXA')));
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
  } else {
    // If multiple duplicate admins of the correct credentials exist, keep exactly one
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length > 1) {
      users = users.filter(u => u.role !== 'admin' || u.mobileNumber === '9347834904');
      IN_MEMORY_DB['lurnexa_users'] = users;
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
      "4": 5
    };
  }

  // Initialize Practice Test Configurations
  if (!IN_MEMORY_DB['lurnexa_practice_configs']) {
    IN_MEMORY_DB['lurnexa_practice_configs'] = {
      "1": { duration: 10, questionLimit: 5 },
      "2": { duration: 15, questionLimit: 5 },
      "3": { duration: 12, questionLimit: 5 },
      "4": { duration: 10, questionLimit: 5 }
    };
  }

  // Initialize Textbooks
  if (!IN_MEMORY_DB['lurnexa_textbooks']) {
    const defaultBooks: Textbook[] = [
      { id: "1", title: "Indian Mineral Import Policy Options", code: "MP" },
      { id: "2", title: "Machine Learning: A Structured Approach", code: "ML" },
      { id: "3", title: "Database Management Systems: Concepts & Design", code: "DB" },
      { id: "4", title: "Entrepreneurship Development: Concepts to Creation", code: "ED" }
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
    collegeName: collegeName
  };
}

export function generateAccessId(bookId: string, role: 'student' | 'faculty', collegeCode?: string): string {
  initDb();
  const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
  
  const rolePrefix = role === 'student' ? 'LS' : 'LF';
  const bookCode = getBookCode(bookId);
  const collegePart = collegeCode ? collegeCode.toUpperCase() : "";
  const prefix = `${rolePrefix}${bookCode}${collegePart}26`; // e.g. LSMLNC26

  // Find all existing matching prefixes to calculate count
  const matches = allowedIds
    .filter(item => item.accessId.toUpperCase().startsWith(prefix.toUpperCase()))
    .map(item => {
      const numPart = item.accessId.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

  const nextNum = matches.length > 0 ? Math.max(...matches) + 1 : 1;
  const nextNumStr = nextNum.toString().padStart(3, '0'); // e.g. 001, 002
  const newId = `${prefix}${nextNumStr}`;

  allowedIds.push({
    accessId: newId,
    bookId,
    role,
    collegeCode: collegeCode || undefined
  });

  setStorageItem('lurnexa_allowed_access_ids', allowedIds);
  return newId;
}

export function generateAccessIdsBulk(bookId: string, role: 'student' | 'faculty', count: number, collegeCode?: string): string[] {
  initDb();
  const allowedIds = getStorageItem<AllowedAccessId[]>('lurnexa_allowed_access_ids', []);
  
  const rolePrefix = role === 'student' ? 'LS' : 'LF';
  const bookCode = getBookCode(bookId);
  const collegePart = collegeCode ? collegeCode.toUpperCase() : "";
  const prefix = `${rolePrefix}${bookCode}${collegePart}26`; // e.g. LSMLNC26

  // Find all existing matching prefixes to calculate starting count
  const matches = allowedIds
    .filter(item => item.accessId.toUpperCase().startsWith(prefix.toUpperCase()))
    .map(item => {
      const numPart = item.accessId.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

  let nextNum = matches.length > 0 ? Math.max(...matches) + 1 : 1;
  const generatedIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const nextNumStr = nextNum.toString().padStart(3, '0'); // e.g. 001, 002
    const newId = `${prefix}${nextNumStr}`;
    
    allowedIds.push({
      accessId: newId,
      bookId,
      role,
      collegeCode: collegeCode || undefined
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
}


