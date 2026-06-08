import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_users (
      mobile_number VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255),
      book_id VARCHAR(50),
      role VARCHAR(20),
      college_name VARCHAR(255),
      college_id VARCHAR(50),
      faculty_id VARCHAR(50),
      college_email VARCHAR(255),
      department VARCHAR(255),
      faculty_role VARCHAR(255),
      subject_teaching VARCHAR(255),
      is_active BOOLEAN,
      access_id VARCHAR(50),
      teaching_faculty_access_id VARCHAR(50),
      profile_picture TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_allowed_access_ids (
      access_id VARCHAR(50) PRIMARY KEY,
      book_id VARCHAR(50),
      role VARCHAR(20),
      assigned_to VARCHAR(50),
      college_code VARCHAR(50)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_colleges (
      code VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_textbooks (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255),
      code VARCHAR(50)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_quizzes (
      quiz_code VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255),
      book_id VARCHAR(50),
      created_by VARCHAR(50),
      type VARCHAR(20),
      duration INT,
      questions JSONB,
      chapters JSONB,
      created_at VARCHAR(100),
      start_time VARCHAR(100),
      end_time VARCHAR(100)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_attempts (
      id VARCHAR(100) PRIMARY KEY,
      quiz_code VARCHAR(50),
      student_mobile VARCHAR(50),
      student_name VARCHAR(255),
      answers JSONB,
      question_scores JSONB,
      score INT,
      total_questions INT,
      attempted_at VARCHAR(100),
      type VARCHAR(20),
      status VARCHAR(20)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_book_chapters (
      book_id VARCHAR(50) PRIMARY KEY,
      chapters_count INT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_practice_configs (
      book_id VARCHAR(50) PRIMARY KEY,
      duration INT,
      question_limit INT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_practice_attempts (
      id VARCHAR(100) PRIMARY KEY,
      student_mobile VARCHAR(50),
      book_id VARCHAR(50),
      answers JSONB,
      score INT,
      total_questions INT,
      completed_at VARCHAR(100),
      practice_test_id VARCHAR(100)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_practice_tests (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255),
      book_id VARCHAR(50),
      duration INT,
      question_limit INT,
      start_time VARCHAR(100),
      end_time VARCHAR(100),
      created_at VARCHAR(100),
      selected_question_ids JSONB
    );
  `);
}

export async function GET() {
  try {
    await ensureTables();

    const usersRes = await pool.query("SELECT * FROM textbooks_users");
    const accessIdsRes = await pool.query("SELECT * FROM textbooks_allowed_access_ids");
    const collegesRes = await pool.query("SELECT * FROM textbooks_colleges");
    const textbooksRes = await pool.query("SELECT * FROM textbooks_textbooks");
    const quizzesRes = await pool.query("SELECT * FROM textbooks_quizzes");
    const attemptsRes = await pool.query("SELECT * FROM textbooks_attempts");
    const bookChaptersRes = await pool.query("SELECT * FROM textbooks_book_chapters");
    const practiceConfigsRes = await pool.query("SELECT * FROM textbooks_practice_configs");
    const practiceAttemptsRes = await pool.query("SELECT * FROM textbooks_practice_attempts");
    const practiceTestsRes = await pool.query("SELECT * FROM textbooks_practice_tests");

    const users = usersRes.rows.map(u => ({
      name: u.name,
      bookId: u.book_id,
      mobileNumber: u.mobile_number,
      role: u.role,
      collegeName: u.college_name,
      collegeId: u.college_id,
      facultyId: u.faculty_id,
      collegeEmail: u.college_email,
      department: u.department,
      facultyRole: u.faculty_role,
      subjectTeaching: u.subject_teaching,
      isActive: u.is_active,
      accessId: u.access_id,
      teachingFacultyAccessId: u.teaching_faculty_access_id,
      profilePicture: u.profile_picture
    }));

    const allowedAccessIds = accessIdsRes.rows.map(a => ({
      accessId: a.access_id,
      bookId: a.book_id,
      role: a.role,
      assignedTo: a.assigned_to || undefined,
      collegeCode: a.college_code || undefined
    }));

    const colleges = collegesRes.rows.map(c => ({
      code: c.code,
      name: c.name
    }));

    const textbooks = textbooksRes.rows.map(t => ({
      id: t.id,
      title: t.title,
      code: t.code
    }));

    const quizzes = quizzesRes.rows.map(q => ({
      quizCode: q.quiz_code,
      title: q.title,
      bookId: q.book_id,
      createdBy: q.created_by,
      type: q.type,
      duration: q.duration,
      questions: q.questions || [],
      chapters: q.chapters || [],
      createdAt: q.created_at,
      startTime: q.start_time,
      endTime: q.end_time
    }));

    const attempts = attemptsRes.rows.map(a => ({
      id: a.id,
      quizCode: a.quiz_code,
      studentMobile: a.student_mobile,
      studentName: a.student_name,
      answers: a.answers || [],
      questionScores: a.question_scores || [],
      score: a.score,
      totalQuestions: a.total_questions,
      attemptedAt: a.attempted_at,
      type: a.type,
      status: a.status
    }));

    const chaptersMap: Record<string, number> = {};
    bookChaptersRes.rows.forEach(bc => {
      chaptersMap[bc.book_id] = bc.chapters_count;
    });

    const configsMap: Record<string, any> = {};
    practiceConfigsRes.rows.forEach(pc => {
      configsMap[pc.book_id] = { duration: pc.duration, questionLimit: pc.question_limit };
    });

    const practiceAttempts = practiceAttemptsRes.rows.map(pa => ({
      id: pa.id,
      studentMobile: pa.student_mobile,
      bookId: pa.book_id,
      answers: pa.answers || [],
      score: pa.score,
      totalQuestions: pa.total_questions,
      completedAt: pa.completed_at,
      practiceTestId: pa.practice_test_id
    }));

    const practiceTests = practiceTestsRes.rows.map(pt => ({
      id: pt.id,
      title: pt.title,
      bookId: pt.book_id,
      duration: pt.duration,
      questionLimit: pt.question_limit,
      startTime: pt.start_time,
      endTime: pt.end_time,
      createdAt: pt.created_at,
      selectedQuestionIds: pt.selected_question_ids || []
    }));

    return NextResponse.json({
      success: true,
      users,
      allowedAccessIds,
      colleges,
      textbooks,
      quizzes,
      attempts,
      chaptersMap,
      configsMap,
      practiceAttempts,
      practiceTests
    });
  } catch (err: any) {
    console.error("❌ Sync GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const { action, table, data } = await request.json();

    if (action === "save" || action === "update") {
      const items = Array.isArray(data) ? data : [data];

      if (table === "users") {
        for (const u of items) {
          await pool.query(`
            INSERT INTO textbooks_users (
              mobile_number, name, book_id, role, college_name, college_id, faculty_id,
              college_email, department, faculty_role, subject_teaching, is_active,
              access_id, teaching_faculty_access_id, profile_picture
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (mobile_number) DO UPDATE SET
              name = EXCLUDED.name, book_id = EXCLUDED.book_id, role = EXCLUDED.role,
              college_name = EXCLUDED.college_name, college_id = EXCLUDED.college_id,
              faculty_id = EXCLUDED.faculty_id, college_email = EXCLUDED.college_email,
              department = EXCLUDED.department, faculty_role = EXCLUDED.faculty_role,
              subject_teaching = EXCLUDED.subject_teaching, is_active = EXCLUDED.is_active,
              access_id = EXCLUDED.access_id, teaching_faculty_access_id = EXCLUDED.teaching_faculty_access_id,
              profile_picture = EXCLUDED.profile_picture;
          `, [
            u.mobileNumber, u.name, u.bookId, u.role, u.collegeName, u.collegeId || "", u.facultyId || "",
            u.collegeEmail || "", u.department || "", u.facultyRole || "", u.subjectTeaching || "",
            u.isActive, u.accessId, u.teachingFacultyAccessId || "", u.profilePicture || ""
          ]);
        }
        
        // Cascade delete removed records
        const activeMobiles = items.map(u => u.mobileNumber);
        if (activeMobiles.length > 0) {
          const placeholders = activeMobiles.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_users WHERE mobile_number NOT IN (${placeholders})`, activeMobiles);
        } else {
          await pool.query("DELETE FROM textbooks_users");
        }

      } else if (table === "allowed_access_ids") {
        for (const item of items) {
          await pool.query(`
            INSERT INTO textbooks_allowed_access_ids (access_id, book_id, role, assigned_to, college_code)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (access_id) DO UPDATE SET
              book_id = EXCLUDED.book_id, role = EXCLUDED.role,
              assigned_to = EXCLUDED.assigned_to, college_code = EXCLUDED.college_code;
          `, [item.accessId, item.bookId, item.role, item.assignedTo || null, item.collegeCode || null]);
        }

        const activeAccessIds = items.map(a => a.accessId);
        if (activeAccessIds.length > 0) {
          const placeholders = activeAccessIds.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_allowed_access_ids WHERE access_id NOT IN (${placeholders})`, activeAccessIds);
        } else {
          await pool.query("DELETE FROM textbooks_allowed_access_ids");
        }

      } else if (table === "colleges") {
        for (const c of items) {
          await pool.query(`
            INSERT INTO textbooks_colleges (code, name) VALUES ($1, $2)
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
          `, [c.code, c.name]);
        }

        const activeCodes = items.map(c => c.code);
        if (activeCodes.length > 0) {
          const placeholders = activeCodes.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_colleges WHERE code NOT IN (${placeholders})`, activeCodes);
        } else {
          await pool.query("DELETE FROM textbooks_colleges");
        }

      } else if (table === "textbooks") {
        for (const t of items) {
          await pool.query(`
            INSERT INTO textbooks_textbooks (id, title, code) VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, code = EXCLUDED.code;
          `, [t.id, t.title, t.code]);
        }

        const activeBookIds = items.map(t => t.id);
        if (activeBookIds.length > 0) {
          const placeholders = activeBookIds.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_textbooks WHERE id NOT IN (${placeholders})`, activeBookIds);
        } else {
          await pool.query("DELETE FROM textbooks_textbooks");
        }

      } else if (table === "quizzes") {
        for (const q of items) {
          await pool.query(`
            INSERT INTO textbooks_quizzes (quiz_code, title, book_id, created_by, type, duration, questions, chapters, created_at, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (quiz_code) DO UPDATE SET
              title = EXCLUDED.title, book_id = EXCLUDED.book_id, created_by = EXCLUDED.created_by,
              type = EXCLUDED.type, duration = EXCLUDED.duration, questions = EXCLUDED.questions,
              chapters = EXCLUDED.chapters, start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time;
          `, [
            q.quizCode, q.title, q.bookId, q.createdBy, q.type, q.duration,
            JSON.stringify(q.questions || []), JSON.stringify(q.chapters || []),
            q.createdAt, q.startTime || null, q.endTime || null
          ]);
        }

        const activeQuizCodes = items.map(q => q.quizCode);
        if (activeQuizCodes.length > 0) {
          const placeholders = activeQuizCodes.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_quizzes WHERE quiz_code NOT IN (${placeholders})`, activeQuizCodes);
        } else {
          await pool.query("DELETE FROM textbooks_quizzes");
        }

      } else if (table === "attempts") {
        for (const att of items) {
          await pool.query(`
            INSERT INTO textbooks_attempts (id, quiz_code, student_mobile, student_name, answers, question_scores, score, total_questions, attempted_at, type, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              score = EXCLUDED.score, question_scores = EXCLUDED.question_scores, status = EXCLUDED.status;
          `, [
            att.id, att.quizCode, att.studentMobile, att.studentName,
            JSON.stringify(att.answers || []), JSON.stringify(att.questionScores || []),
            att.score, att.totalQuestions, att.attemptedAt, att.type, att.status
          ]);
        }

        const activeAttemptIds = items.map(a => a.id);
        if (activeAttemptIds.length > 0) {
          const placeholders = activeAttemptIds.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_attempts WHERE id NOT IN (${placeholders})`, activeAttemptIds);
        } else {
          await pool.query("DELETE FROM textbooks_attempts");
        }

      } else if (table === "book_chapters") {
        const entries = Object.entries(data);
        for (const [bookId, count] of entries) {
          await pool.query(`
            INSERT INTO textbooks_book_chapters (book_id, chapters_count) VALUES ($1, $2)
            ON CONFLICT (book_id) DO UPDATE SET chapters_count = EXCLUDED.chapters_count;
          `, [bookId, count]);
        }

        const activeBookIds = Object.keys(data);
        if (activeBookIds.length > 0) {
          const placeholders = activeBookIds.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_book_chapters WHERE book_id NOT IN (${placeholders})`, activeBookIds);
        } else {
          await pool.query("DELETE FROM textbooks_book_chapters");
        }

      } else if (table === "practice_configs") {
        const entries = Object.entries(data);
        for (const [bookId, configObj] of entries) {
          const { duration, questionLimit } = configObj as any;
          await pool.query(`
            INSERT INTO textbooks_practice_configs (book_id, duration, question_limit) VALUES ($1, $2, $3)
            ON CONFLICT (book_id) DO UPDATE SET duration = EXCLUDED.duration, question_limit = EXCLUDED.question_limit;
          `, [bookId, duration, questionLimit]);
        }

        const activeBookIds = Object.keys(data);
        if (activeBookIds.length > 0) {
          const placeholders = activeBookIds.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_practice_configs WHERE book_id NOT IN (${placeholders})`, activeBookIds);
        } else {
          await pool.query("DELETE FROM textbooks_practice_configs");
        }

      } else if (table === "practice_attempts") {
        for (const pa of items) {
          await pool.query(`
            INSERT INTO textbooks_practice_attempts (id, student_mobile, book_id, answers, score, total_questions, completed_at, practice_test_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO NOTHING;
          `, [
            pa.id, pa.studentMobile, pa.bookId, JSON.stringify(pa.answers || []),
            pa.score, pa.totalQuestions, pa.completedAt, pa.practiceTestId || ""
          ]);
        }

        const activeAttemptIds = items.map(pa => pa.id);
        if (activeAttemptIds.length > 0) {
          const placeholders = activeAttemptIds.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_practice_attempts WHERE id NOT IN (${placeholders})`, activeAttemptIds);
        } else {
          await pool.query("DELETE FROM textbooks_practice_attempts");
        }

      } else if (table === "practice_tests") {
        for (const pt of items) {
          await pool.query(`
            INSERT INTO textbooks_practice_tests (id, title, book_id, duration, question_limit, start_time, end_time, created_at, selected_question_ids)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title, duration = EXCLUDED.duration, question_limit = EXCLUDED.question_limit,
              start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, selected_question_ids = EXCLUDED.selected_question_ids;
          `, [
            pt.id, pt.title, pt.bookId, pt.duration, pt.questionLimit,
            pt.startTime || "", pt.endTime || "", pt.createdAt, JSON.stringify(pt.selectedQuestionIds || [])
          ]);
        }

        const activeTestIds = items.map(pt => pt.id);
        if (activeTestIds.length > 0) {
          const placeholders = activeTestIds.map((_, i) => `$${i+1}`).join(",");
          await pool.query(`DELETE FROM textbooks_practice_tests WHERE id NOT IN (${placeholders})`, activeTestIds);
        } else {
          await pool.query("DELETE FROM textbooks_practice_tests");
        }
      }
    } else if (action === "delete") {
      if (table === "textbooks") {
        const { bookId } = data;
        await pool.query("DELETE FROM textbooks_textbooks WHERE id = $1", [bookId]);
        await pool.query("DELETE FROM textbooks_book_chapters WHERE book_id = $1", [bookId]);
        await pool.query("DELETE FROM textbooks_allowed_access_ids WHERE book_id = $1", [bookId]);
        await pool.query("DELETE FROM textbooks_quizzes WHERE book_id = $1", [bookId]);
        await pool.query("DELETE FROM textbooks_practice_attempts WHERE book_id = $1", [bookId]);
      } else if (table === "practice_tests") {
        const { id } = data;
        await pool.query("DELETE FROM textbooks_practice_tests WHERE id = $1", [id]);
      } else if (table === "colleges") {
        const { code } = data;
        await pool.query("DELETE FROM textbooks_colleges WHERE code = $1", [code]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Sync POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
