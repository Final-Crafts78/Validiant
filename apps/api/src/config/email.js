const nodemailer = require('nodemailer');

let emailTransporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('✅ Email service configured');
} else {
  console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Emails disabled.');
}

async function sendEmail(to, subject, html) {
  if (!emailTransporter) return { success: false, message: 'Email not configured' };
  try {
    await emailTransporter.sendMail({
      from: `"Validiant Notifications" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    return { success: true };
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    return { success: false, message: err.message };
  }
}

module.exports = { sendEmail };
