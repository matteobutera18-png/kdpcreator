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
      const { email, phone, password } = req.body;

      if (!email || !phone || !password) {
        return res.status(400).json({ error: 'Email, Telefono e Password richiesti.' });
      }

      // Carica utenti
      const users = fileManager.loadUsers();
      const user  = users.find(u => u.email === email.toLowerCase().trim() && u.phone === phone.trim());

      if (!user) {
        // Risposta generica per non rivelare l'esistenza
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
        user:     { id: user.id, email: user.email, phone: user.phone, role: user.role },
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
      email:    req.user.email,
      phone:    req.user.phone,
      role:     req.user.role,
    },
  });
});

// ── POST /api/settings — Aggiorna Profilo ────────────────────
router.post('/settings', requireAuth, (req, res) => {
  try {
    const { email, phone } = req.body;
    const users = fileManager.loadUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    users[userIndex].email = email.toLowerCase().trim();
    users[userIndex].phone = phone.trim();
    
    fileManager.saveUsers(users); // Aggiungeremo questo metodo a fileManager
    
    // Aggiorna req.user e rigenera il token? Opzionale ma consigliato
    const updatedUser = users[userIndex];
    const token = signToken(updatedUser);
    setSessionCookie(res, token);
    
    return res.json({ success: true, message: 'Impostazioni aggiornate' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
