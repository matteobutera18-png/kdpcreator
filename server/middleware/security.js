// ================================================================
//  middleware/security.js — Helmet + Rate Limiter + CORS
// ================================================================

const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const config      = require('../config');

/**
 * Applica tutti i middleware di sicurezza all'app Express.
 */
function applySecurityMiddleware(app) {

  // ── Helmet — Header HTTP Sicuri ─────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:   ["'self'"],
        scriptSrc:    ["'self'", "'unsafe-inline'"],  // necessario per SPA
        styleSrc:     ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc:      ["'self'", 'https://fonts.gstatic.com'],
        imgSrc:       ["'self'", 'data:', 'blob:'],
        connectSrc:   ["'self'"],
        frameSrc:     ["'none'"],
        objectSrc:    ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge:            31536000,
      includeSubDomains: true,
      preload:           true,
    },
  }));

  // ── Rate Limiter Globale ────────────────────────────────────
  app.use(rateLimit({
    windowMs: config.RATE_LIMIT.global.windowMs,
    max:      config.RATE_LIMIT.global.max,
    message:  { error: 'Troppe richieste. Riprova tra qualche minuto.' },
    standardHeaders: true,
    legacyHeaders:   false,
  }));

  // ── Rate Limiter Specifico per Login (anti-brute-force) ────
  const loginLimiter = rateLimit({
    windowMs: config.RATE_LIMIT.login.windowMs,
    max:      config.RATE_LIMIT.login.max,
    message:  { error: 'Troppi tentativi di accesso. Riprova tra 15 minuti.' },
    standardHeaders: true,
    legacyHeaders:   false,
    skipSuccessfulRequests: true,   // non conta le richieste riuscite
  });

  // Esporta il loginLimiter per usarlo sulla route /api/login
  app.set('loginLimiter', loginLimiter);
}

module.exports = { applySecurityMiddleware };
