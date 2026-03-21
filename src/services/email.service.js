const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const env = require('../config/env');

function maskEmail(value) {
  if (!value || !value.includes('@')) return value || '';
  const [name, domain] = value.split('@');
  if (!name) return `***@${domain}`;
  if (name.length <= 2) return `${name[0] || '*'}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}

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

  const result = await resend.emails.send({
    from: env.resend.from,
    to: env.resend.to,
    subject,
    html,
  });

  return {
    provider: 'resend',
    result,
  };
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

  const result = await transporter.sendMail({
    from: env.smtp.from,
    to: env.resend.to,
    subject,
    html,
  });

  return {
    provider: 'smtp',
    result,
  };
}

async function sendAppointmentNotification(payload) {
  const subject = 'New Lawn Service Appointment Request';
  const html = appointmentHtml(payload);
  const context = {
    appointmentId: payload.appointmentId || 'unknown',
    to: maskEmail(env.resend.to),
    fromResend: maskEmail(env.resend.from),
    fromSmtp: maskEmail(env.smtp.from),
  };

  console.log('[EMAIL] Starting appointment email flow', context);

  try {
    if (env.resend.apiKey && env.resend.from && env.resend.to) {
      const response = await sendWithResend(subject, html);
      const resendId = response?.result?.data?.id || response?.result?.id || null;
      const resendError = response?.result?.error || null;

      console.log('[EMAIL] Resend response', {
        appointmentId: context.appointmentId,
        provider: response.provider,
        messageId: resendId,
        error: resendError,
      });

      return {
        status: resendError ? 'provider-error' : 'accepted',
        provider: response.provider,
        messageId: resendId,
        error: resendError,
      };
    }

    if (env.smtp.host && env.smtp.from && env.resend.to) {
      const response = await sendWithSmtp(subject, html);
      const smtpId = response?.result?.messageId || null;

      console.log('[EMAIL] SMTP response', {
        appointmentId: context.appointmentId,
        provider: response.provider,
        messageId: smtpId,
        accepted: response?.result?.accepted,
        rejected: response?.result?.rejected,
      });

      return {
        status: 'accepted',
        provider: response.provider,
        messageId: smtpId,
      };
    }

    console.warn('[EMAIL] No provider configured. Email not sent.', {
      appointmentId: context.appointmentId,
      resendConfigured: Boolean(env.resend.apiKey && env.resend.from && env.resend.to),
      smtpConfigured: Boolean(env.smtp.host && env.smtp.from && env.resend.to),
    });

    return {
      status: 'not-configured',
      provider: 'none',
    };
  } catch (error) {
    console.error('[EMAIL] Sending failed', {
      appointmentId: context.appointmentId,
      message: error.message,
      stack: error.stack,
    });

    return {
      status: 'failed',
      provider: 'unknown',
      error: error.message,
    };
  }
}

module.exports = {
  sendAppointmentNotification,
};
