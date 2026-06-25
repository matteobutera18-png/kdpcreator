// ================================================================
//  server/config.js — Configurazione Centralizzata
// ================================================================

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');

const ROOT = path.join(__dirname, '..');

const config = {
  PORT:           process.env.PORT || 3001,
  NODE_ENV:       process.env.NODE_ENV || 'development',
  JWT_SECRET:     process.env.JWT_SECRET || 'fallback_dev_secret_change_in_prod',
  SESSION_EXPIRY: process.env.SESSION_EXPIRY || '24h',
  COOKIE_NAME:    'kdp_session',

  PATHS: {
    root:      ROOT,
    data:      path.join(ROOT, 'server', 'data'),
    books:     path.join(ROOT, 'server', 'data', 'books'),
    users:     path.join(ROOT, 'server', 'data', 'users.json'),
    public:    path.join(ROOT, 'public'),
    qrImage:   path.join(ROOT, 'public', 'qr-access.png'),
  },

  RATE_LIMIT: {
    login: {
      windowMs: 15 * 60 * 1000,  // 15 minuti
      max:      10,               // max 10 tentativi login per IP
    },
    global: {
      windowMs: 15 * 60 * 1000,
      max:      200,
    },
  },

  // Configurazione Puppeteer
  PUPPETEER: {
    headless:        true,
    timeout:         30000,
    userAgent:       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // Amazon blocca i crawler — useremo la modalità simulata come fallback
    useSimulation:   true,
  },
};

module.exports = config;
