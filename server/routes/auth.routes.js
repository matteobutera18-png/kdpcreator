// ================================================================
//  routes/auth.routes.js — Login / Logout / Me
// ================================================================

const express  = require('express');
const bcrypt   = require('bcryptjs');
const router   = express.Router();

const { requireAuth, signToken, setSessionCookie } = require('../middleware/auth');
const fileManager = require('../services/fileManager');
const config      = require('../config');

// ── POST /api/login ───────────────────────────────────────────
router.post('/login', (req, res, next) => {
  // Applica rate limiter solo al login
  const loginLimiter = req.app.get('loginLimiter');
  loginLimiter(req, res, async () => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username e password richiesti.' });
      }

      // Carica utenti
      const users = fileManager.loadUsers();
      const user  = users.find(u => u.username === username.toLowerCase().trim());

      if (!user) {
        // Risposta generica per non rivelare se l'username esiste
        return res.status(401).json({ error: 'Credenziali non valide.' });
      }

      // Verifica password con bcrypt
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenziali non valide.' });
      }

      // Genera JWT e imposta cookie
      const token = signToken(user);
      setSessionCookie(res, token);

      return res.json({
        success:  true,
        message:  'Login effettuato con successo.',
        user:     { id: user.id, username: user.username, role: user.role },
      });

    } catch (err) {
      next(err);
    }
  });
});

// ── POST /api/logout ──────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie(config.COOKIE_NAME, { httpOnly: true, sameSite: 'Strict' });
  return res.json({ success: true, message: 'Logout effettuato.' });
});

// ── GET /api/me — Verifica sessione attiva ────────────────────
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    authenticated: true,
    user: {
      id:       req.user.id,
      username: req.user.username,
      role:     req.user.role,
    },
  });
});

module.exports = router;
