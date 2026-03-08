const nodemailer = require('nodemailer');

// Create transporter — uses Gmail App Password or Ethereal in dev
const createTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Gmail App Password
            },
        });
    }
    // Fallback: Ethereal (prints preview URL to console in dev)
    return null;
};

const sendMail = async (to, subject, html) => {
    let transporter = createTransporter();
    if (!transporter) {
        // In dev without email config, create an ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await transporter.sendMail({
            from: '"EduFlow LMS" <no-reply@eduflow.com>',
            to, subject, html,
        });
        console.log(`📧 Email preview: ${nodemailer.getTestMessageUrl(info)}`);
        return;
    }
    await transporter.sendMail({
        from: `"EduFlow LMS" <${process.env.EMAIL_USER}>`,
        to, subject, html,
    });
};

// ── Email templates ────────────────────────────────────────────────
const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #fff;
  border-radius: 16px; border: 1px solid #e5e7eb;
`;

exports.sendEnrollmentEmail = async (to, { studentName, courseTitle }) => {
    const html = `
    <div style="${baseStyle}">
      <div style="background: linear-gradient(135deg,#6366f1,#7c3aed); border-radius:12px; padding:24px; text-align:center; margin-bottom:24px;">
        <h1 style="color:#fff;font-size:24px;margin:0">🎉 Welcome to EduFlow!</h1>
      </div>
      <p style="color:#374151;font-size:16px;">Hi <strong>${studentName}</strong>,</p>
      <p style="color:#6b7280;">You've successfully enrolled in:</p>
      <div style="background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:8px;padding:16px;margin:16px 0;">
        <strong style="font-size:18px;color:#4f46e5;">${courseTitle}</strong>
      </div>
      <p style="color:#6b7280;">Start learning at your own pace. We're rooting for you!</p>
      <a href="http://localhost:5173/my-courses" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">
        Go to My Courses →
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">EduFlow LMS · Empowering Learners Everywhere</p>
    </div>`;
    await sendMail(to, `🎉 Enrolled: ${courseTitle}`, html);
};

exports.sendCompletionEmail = async (to, { studentName, courseTitle }) => {
    const html = `
    <div style="${baseStyle}">
      <div style="background:linear-gradient(135deg,#059669,#10b981);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <h1 style="color:#fff;font-size:24px;margin:0">🏆 Course Completed!</h1>
      </div>
      <p style="color:#374151;font-size:16px;">Congratulations, <strong>${studentName}</strong>!</p>
      <p style="color:#6b7280;">You've completed:</p>
      <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:8px;padding:16px;margin:16px 0;">
        <strong style="font-size:18px;color:#059669;">${courseTitle}</strong>
      </div>
      <p style="color:#6b7280;">Your certificate is ready to download. Keep up the amazing work!</p>
      <a href="http://localhost:5173/my-courses" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">
        Download Certificate →
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">EduFlow LMS · Empowering Learners Everywhere</p>
    </div>`;
    await sendMail(to, `🏆 You completed "${courseTitle}"!`, html);
};

exports.sendNewLessonEmail = async (toList, { courseTitle, lessonTitle }) => {
    if (!toList || toList.length === 0) return;
    const html = `
    <div style="${baseStyle}">
      <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <h1 style="color:#fff;font-size:24px;margin:0">📖 New Lesson Available!</h1>
      </div>
      <p style="color:#374151;font-size:16px;">A new lesson has been added to <strong>${courseTitle}</strong>:</p>
      <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;margin:16px 0;">
        <strong style="font-size:18px;color:#2563eb;">${lessonTitle}</strong>
      </div>
      <a href="http://localhost:5173/my-courses" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px;">
        Start Lesson →
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">EduFlow LMS · Empowering Learners Everywhere</p>
    </div>`;
    // Send in parallel, don't await individually to prevent one failure blocking others
    await Promise.allSettled(toList.map(to => sendMail(to, `📖 New lesson in "${courseTitle}"`, html)));
};
