const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let emailTransporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  logger.info('Email service configured');
} else {
  logger.warn('EMAIL_USER or EMAIL_PASS not set. Emails disabled.');
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
    logger.info(`Email sent successfully to ${to}`, { subject });
    return { success: true };
  } catch (err) {
    logger.error('Email delivery failed', err, { to, subject });
    return { success: false, message: err.message };
  }
}

module.exports = { sendEmail };
