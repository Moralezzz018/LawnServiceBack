require('dotenv').config();

const toBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
};

const toArray = (value, fallback = []) => {
  if (!value) return fallback;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const corsOrigins = toArray(process.env.CORS_ORIGIN, ['http://localhost:5173']);

module.exports = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  corsOrigins,

  db: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || 'lawn_service',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    logging: toBoolean(process.env.DB_LOGGING, false),
    sync: toBoolean(process.env.DB_SYNC, false),
    ssl: toBoolean(process.env.DB_SSL, false),
    sslRejectUnauthorized: toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_super_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  ownerBootstrapKey: process.env.OWNER_BOOTSTRAP_KEY || 'change_this_bootstrap_key',

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || '',
    to: process.env.RESEND_TO || '',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: toBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },

  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
