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
      profile_picture TEXT,
      plan VARCHAR(50) DEFAULT 'complete',
      purchased_books JSONB
    );
  `);

  await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'complete'`);
  await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS purchased_books JSONB`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_allowed_access_ids (
      access_id VARCHAR(50) PRIMARY KEY,
      book_id VARCHAR(50),
      role VARCHAR(20),
      assigned_to VARCHAR(50),
      college_code VARCHAR(50),
      plan VARCHAR(50)
    );
  `);

  await pool.query(`ALTER TABLE textbooks_allowed_access_ids ADD COLUMN IF NOT EXISTS plan VARCHAR(50)`);


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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_interview_questions (
      id VARCHAR(100) PRIMARY KEY,
      company VARCHAR(255),
      role VARCHAR(255),
      question_text TEXT,
      answer_text TEXT,
      difficulty VARCHAR(50),
      created_at VARCHAR(100)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_company_updates (
      id VARCHAR(100) PRIMARY KEY,
      company VARCHAR(255),
      updates JSONB,
      created_at VARCHAR(100)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS textbooks_coupons (
      code VARCHAR(50) PRIMARY KEY,
      discount_percentage INT,
      book_id VARCHAR(50),
      applicable_format VARCHAR(20) DEFAULT 'both'
    );
  `);
  await pool.query(`ALTER TABLE textbooks_coupons ADD COLUMN IF NOT EXISTS applicable_format VARCHAR(20) DEFAULT 'both'`);
}

export async function GET() {
  try {
    try {
      await ensureTables();
    } catch (tblErr) {
      console.warn("⚠️ Warning: Table setup/alteration checks failed (continuing anyway):", tblErr);
    }

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
    const interviewQuestionsRes = await pool.query("SELECT * FROM textbooks_interview_questions");
    const companyUpdatesRes = await pool.query("SELECT * FROM textbooks_company_updates");
    const couponsRes = await pool.query("SELECT * FROM textbooks_coupons");
    const purchasesRes = await pool.query("SELECT * FROM textbooks_purchases ORDER BY created_at DESC");

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
      profilePicture: u.profile_picture,
      plan: u.plan || 'complete',
      purchasedBooks: u.purchased_books || []
    }));

    const allowedAccessIds = accessIdsRes.rows.map(a => {
      const planValues = ['complete','placements','practice','book_only','caselet','book_caselet','book_portal','book_caselet_portal'];
      const rawCollegeCode = a.college_code || null;
      const cleanCollegeCode = rawCollegeCode && planValues.includes(rawCollegeCode) ? null : rawCollegeCode;
      const cleanPlan = a.plan || (rawCollegeCode && planValues.includes(rawCollegeCode) ? rawCollegeCode : null);
      
      let assignedTo = a.assigned_to || undefined;
      let finalPlan = cleanPlan || undefined;

      if (!assignedTo && a.access_id) {
        const matchedUser = users.find(u => u.accessId === a.access_id);
        if (matchedUser) {
          assignedTo = matchedUser.mobileNumber;
          if (!finalPlan) {
            finalPlan = matchedUser.plan;
          }
        }
      }

      return {
        accessId: a.access_id,
        bookId: a.book_id,
        role: a.role,
        assignedTo,
        collegeCode: cleanCollegeCode || undefined,
        plan: finalPlan
      };
    });

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

    const interviewQuestions = interviewQuestionsRes.rows.map(q => ({
      id: q.id,
      company: q.company,
      role: q.role || "",
      questionText: q.question_text,
      answerText: q.answer_text || "",
      difficulty: q.difficulty || "",
      createdAt: q.created_at
    }));

    const companyUpdates = companyUpdatesRes.rows.map(u => ({
      id: u.id,
      company: u.company,
      updates: u.updates || [],
      createdAt: u.created_at
    }));

    const coupons = couponsRes.rows.map(c => ({
      code: c.code,
      discountPercentage: c.discount_percentage,
      bookId: c.book_id,
      applicableFormat: c.applicable_format || 'both'
    }));

    const purchases = purchasesRes.rows.map(p => ({
      id: p.id,
      orderId: p.order_id,
      userIdentifier: p.user_identifier,
      bookId: p.book_id,
      amount: Number(p.amount),
      status: p.status,
      customerName: p.customer_name || "",
      customerEmail: p.customer_email || "",
      customerPhone: p.customer_phone || "",
      shippingAddress: p.shipping_address || "",
      shippingPincode: p.shipping_pincode || "",
      couponCode: p.coupon_code || "",
      discountAmount: Number(p.discount_amount || 0),
      gstAmount: Number(p.gst_amount || 0),
      shippingAmount: Number(p.shipping_amount || 0),
      city: p.city || "",
      state: p.state || "",
      country: p.country || "India",
      quantity: Number(p.quantity || 1),
      subtotal: Number(p.subtotal || p.amount),
      cashfreeOrderId: p.cashfree_order_id || "",
      cashfreePaymentId: p.cashfree_payment_id || "",
      paymentStatus: p.payment_status || "PENDING_PAYMENT",
      orderStatus: p.order_status || "PENDING_PAYMENT",
      purchaseFormat: p.purchase_format || "",
      purchasePlan: p.purchase_plan || "",
      accessId: p.access_id || "",
      createdAt: p.created_at
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
      practiceTests,
      interviewQuestions,
      companyUpdates,
      coupons,
      purchases
    });
  } catch (err: any) {
    console.error("❌ Sync GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    try {
      await ensureTables();
    } catch (tblErr) {
      console.warn("⚠️ Warning: Table setup/alteration checks failed in POST (continuing anyway):", tblErr);
    }
    const { action, table, data } = await request.json();

    if (action === "save" || action === "update") {
      const items = Array.isArray(data) ? data : [data];

      if (table === "users") {
        for (const u of items) {
          await pool.query(`
            INSERT INTO textbooks_users (
              mobile_number, name, book_id, role, college_name, college_id, faculty_id,
              college_email, department, faculty_role, subject_teaching, is_active,
              access_id, teaching_faculty_access_id, profile_picture, plan, purchased_books
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (mobile_number) DO UPDATE SET
              name = EXCLUDED.name, book_id = EXCLUDED.book_id, role = EXCLUDED.role,
              college_name = EXCLUDED.college_name, college_id = EXCLUDED.college_id,
              faculty_id = EXCLUDED.faculty_id, college_email = EXCLUDED.college_email,
              department = EXCLUDED.department, faculty_role = EXCLUDED.faculty_role,
              subject_teaching = EXCLUDED.subject_teaching, is_active = EXCLUDED.is_active,
              access_id = EXCLUDED.access_id, teaching_faculty_access_id = EXCLUDED.teaching_faculty_access_id,
              profile_picture = EXCLUDED.profile_picture, plan = EXCLUDED.plan, purchased_books = EXCLUDED.purchased_books;
          `, [
            u.mobileNumber, u.name, u.bookId, u.role, u.collegeName, u.collegeId || "", u.facultyId || "",
            u.collegeEmail || "", u.department || "", u.facultyRole || "", u.subjectTeaching || "",
            u.isActive, u.accessId, u.teachingFacultyAccessId || "", u.profilePicture || "",
            u.plan || 'complete', JSON.stringify(u.purchasedBooks || [])
          ]);
        }
        


      } else if (table === "allowed_access_ids") {
        for (const item of items) {
          // Safeguard: plan values should never be stored in college_code
          const planValues = ['complete','placements','practice','book_only','caselet','book_caselet','book_portal','book_caselet_portal'];
          const rawCollegeCode = item.collegeCode || null;
          const cleanCollegeCode = rawCollegeCode && planValues.includes(rawCollegeCode) ? null : rawCollegeCode;
          const cleanPlan = item.plan || (rawCollegeCode && planValues.includes(rawCollegeCode) ? rawCollegeCode : null);
          await pool.query(`
            INSERT INTO textbooks_allowed_access_ids (access_id, book_id, role, assigned_to, college_code, plan)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (access_id) DO UPDATE SET
              book_id = EXCLUDED.book_id, role = EXCLUDED.role,
              assigned_to = EXCLUDED.assigned_to, college_code = EXCLUDED.college_code, plan = EXCLUDED.plan;
          `, [item.accessId, item.bookId, item.role, item.assignedTo || null, cleanCollegeCode, cleanPlan]);
        }



      } else if (table === "colleges") {
        for (const c of items) {
          await pool.query(`
            INSERT INTO textbooks_colleges (code, name) VALUES ($1, $2)
            ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
          `, [c.code, c.name]);
        }



      } else if (table === "textbooks") {
        for (const t of items) {
          await pool.query(`
            INSERT INTO textbooks_textbooks (id, title, code) VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, code = EXCLUDED.code;
          `, [t.id, t.title, t.code]);
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



      } else if (table === "book_chapters") {
        const entries = Object.entries(data);
        for (const [bookId, count] of entries) {
          await pool.query(`
            INSERT INTO textbooks_book_chapters (book_id, chapters_count) VALUES ($1, $2)
            ON CONFLICT (book_id) DO UPDATE SET chapters_count = EXCLUDED.chapters_count;
          `, [bookId, count]);
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


      } else if (table === "interview_questions") {
        for (const q of items) {
          await pool.query(`
            INSERT INTO textbooks_interview_questions (id, company, role, question_text, answer_text, difficulty, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              company = EXCLUDED.company, role = EXCLUDED.role, question_text = EXCLUDED.question_text,
              answer_text = EXCLUDED.answer_text, difficulty = EXCLUDED.difficulty;
          `, [q.id, q.company, q.role || "", q.questionText, q.answerText || "", q.difficulty || "", q.createdAt]);
        }


      } else if (table === "company_updates") {
        for (const u of items) {
          await pool.query(`
            INSERT INTO textbooks_company_updates (id, company, updates, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE SET
              company = EXCLUDED.company, updates = EXCLUDED.updates;
          `, [u.id, u.company, JSON.stringify(u.updates || []), u.createdAt]);
        }


      } else if (table === "coupons") {
        for (const c of items) {
          await pool.query(`
            INSERT INTO textbooks_coupons (code, discount_percentage, book_id, applicable_format)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (code) DO UPDATE SET
              discount_percentage = EXCLUDED.discount_percentage,
              book_id = EXCLUDED.book_id,
              applicable_format = EXCLUDED.applicable_format;
          `, [c.code, c.discountPercentage, c.bookId, c.applicableFormat || 'both']);
        }

      } else if (table === "purchases") {
        for (const p of items) {
          await pool.query(`
            INSERT INTO textbooks_purchases (
              order_id, user_identifier, book_id, amount, status,
              customer_name, customer_email, customer_phone,
              shipping_address, shipping_pincode, coupon_code,
              discount_amount, gst_amount, shipping_amount,
              city, state, country, quantity, subtotal,
              cashfree_order_id, cashfree_payment_id,
              payment_status, order_status
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
            ON CONFLICT (order_id) DO UPDATE SET
              status = EXCLUDED.status,
              payment_status = EXCLUDED.payment_status,
              order_status = EXCLUDED.order_status,
              cashfree_payment_id = EXCLUDED.cashfree_payment_id;
          `, [
            p.orderId, p.userIdentifier, p.bookId, p.amount, p.status,
            p.customerName || "", p.customerEmail || "", p.customerPhone || "",
            p.shippingAddress || "", p.shippingPincode || "", p.couponCode || "",
            p.discountAmount || 0, p.gstAmount || 0, p.shippingAmount || 0,
            p.city || "", p.state || "", p.country || "India",
            p.quantity || 1, p.subtotal || p.amount,
            p.cashfreeOrderId || p.orderId, p.cashfreePaymentId || "",
            p.paymentStatus || "PENDING_PAYMENT", p.orderStatus || "PENDING_PAYMENT"
          ]);
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
      } else if (table === "coupons") {
        const { code } = data;
        await pool.query("DELETE FROM textbooks_coupons WHERE code = $1", [code]);
      } else if (table === "users") {
        const { mobileNumber } = data;
        await pool.query("DELETE FROM textbooks_users WHERE mobile_number = $1", [mobileNumber]);
      } else if (table === "interview_questions") {
        const { id } = data;
        await pool.query("DELETE FROM textbooks_interview_questions WHERE id = $1", [id]);
      } else if (table === "company_updates") {
        const { id } = data;
        await pool.query("DELETE FROM textbooks_company_updates WHERE id = $1", [id]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Sync POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
