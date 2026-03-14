const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const env = require('../config/env');

function appointmentHtml(payload) {
  const services = Array.isArray(payload.serviceTypes) ? payload.serviceTypes.join(', ') : '';

  return `
    <h2>New Appointment Request</h2>
    <p><strong>Name:</strong> ${payload.fullName}</p>
    <p><strong>Phone:</strong> ${payload.phone}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Address:</strong> ${payload.serviceAddress}</p>
    <p><strong>Services:</strong> ${services}</p>
    <p><strong>Preferred date/time:</strong> ${payload.preferredDateTime}</p>
    <p><strong>Notes:</strong> ${payload.notes || '-'}</p>
  `;
}

async function sendWithResend(subject, html) {
  const resend = new Resend(env.resend.apiKey);

  return resend.emails.send({
    from: env.resend.from,
    to: env.resend.to,
    subject,
    html,
  });
}

async function sendWithSmtp(subject, html) {
  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user
      ? {
          user: env.smtp.user,
          pass: env.smtp.pass,
        }
      : undefined,
  });

  return transporter.sendMail({
    from: env.smtp.from,
    to: env.resend.to,
    subject,
    html,
  });
}

async function sendAppointmentNotification(payload) {
  const subject = 'New Lawn Service Appointment Request';
  const html = appointmentHtml(payload);

  if (env.resend.apiKey && env.resend.from && env.resend.to) {
    return sendWithResend(subject, html);
  }

  if (env.smtp.host && env.smtp.from && env.resend.to) {
    return sendWithSmtp(subject, html);
  }

  console.warn('No email provider configured. Appointment email not sent.');
  return null;
}

module.exports = {
  sendAppointmentNotification,
};
