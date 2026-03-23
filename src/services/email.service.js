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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function appointmentHtml(payload) {
  const services = Array.isArray(payload.serviceTypes) ? payload.serviceTypes.join(', ') : 'Not specified';

  const safeFullName = escapeHtml(payload.fullName);
  const safePhone = escapeHtml(payload.phone);
  const safeEmail = escapeHtml(payload.email);
  const safeAddress = escapeHtml(payload.serviceAddress);
  const safeServices = escapeHtml(services);
  const safeDate = escapeHtml(payload.preferredDateTime);
  const safeNotes = escapeHtml(payload.notes || 'No notes');

  return `
    <div style="background:#f4f7ef;padding:24px 12px;font-family:Inter,Arial,sans-serif;color:#1e1e1e;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d9e8c5;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#6b7c2e,#3b4a10);padding:20px 24px;color:#ffffff;">
            <div style="font-size:12px;letter-spacing:.08em;opacity:.9;text-transform:uppercase;">Memphis Lawn Service</div>
            <h2 style="margin:8px 0 0;font-size:24px;line-height:1.2;">New Appointment Request</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 16px;color:#475569;font-size:14px;">A new lead has been submitted from the website.</p>

            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;width:180px;color:#64748b;font-size:13px;">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;font-weight:600;font-size:14px;">${safeFullName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;color:#64748b;font-size:13px;">Phone</td>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;font-weight:600;font-size:14px;">${safePhone}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;color:#64748b;font-size:13px;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;font-weight:600;font-size:14px;">${safeEmail}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;color:#64748b;font-size:13px;">Address</td>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;font-weight:600;font-size:14px;">${safeAddress}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;color:#64748b;font-size:13px;">Services</td>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;font-weight:600;font-size:14px;">${safeServices}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;color:#64748b;font-size:13px;">Preferred date/time</td>
                <td style="padding:10px 0;border-bottom:1px solid #edf2e4;font-weight:600;font-size:14px;">${safeDate}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:13px;vertical-align:top;">Notes</td>
                <td style="padding:10px 0;font-weight:600;font-size:14px;">${safeNotes}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
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
