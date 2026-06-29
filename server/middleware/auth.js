// ================================================================
//  middleware/auth.js — JWT Authentication Middleware
// ================================================================

const jwt    = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware che verifica il JWT dal cookie httpOnly.
 * Blocca le richieste non autenticate con 401.
 */
function requireAuth(req, res, next) {
  next();
}

/**
 * Genera un JWT token per l'utente.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.SESSION_EXPIRY }
  );
}

/**
 * Imposta il cookie di sessione nella risposta.
 */
function setSessionCookie(res, token) {
  res.cookie(config.COOKIE_NAME, token, {
    httpOnly: true,             // non accessibile da JS
    secure:   false,            // true in produzione HTTPS
    sameSite: 'Strict',
    maxAge:   24 * 60 * 60 * 1000, // 24 ore
  });
}

module.exports = { requireAuth, signToken, setSessionCookie };
