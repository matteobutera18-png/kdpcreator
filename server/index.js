// ================================================================
//  server/index.js — Entry Point Backend KDP Dashboard
// ================================================================

const express      = require('express');
const path         = require('path');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const config       = require('./config');
const fileManager  = require('./services/fileManager');
const qrGenerator  = require('./services/qrGenerator');
const { applySecurityMiddleware } = require('./middleware/security');

// Route
const authRoutes   = require('./routes/auth.routes');
const booksRoutes  = require('./routes/books.routes');
const agentsRoutes = require('./routes/agents.routes');

const app = express();

// ── Inizializzazione ──────────────────────────────────────────
fileManager.initDirectories();

// ── Middleware di Base ────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
}));

// ── Sicurezza ─────────────────────────────────────────────────
applySecurityMiddleware(app);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/books',  booksRoutes);
app.use('/api/agents', agentsRoutes);

// ── Static Files (Frontend PWA) ───────────────────────────────
app.use(express.static(config.PATHS.public));

// ── SPA Fallback (Tutte le altre route caricano index.html) ───
app.get('*', (req, res) => {
  res.sendFile(path.join(config.PATHS.public, 'index.html'));
});

// ── Error Handling Globale ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Errore Server:', err);
  res.status(500).json({ error: 'Errore interno del server.' });
});

// ── Avvio Server ──────────────────────────────────────────────
app.listen(config.PORT, '0.0.0.0', async () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   🏭 KDP FACTORY DASHBOARD AVVIATA            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\n🚀 Server in ascolto su porta ${config.PORT}`);
  
  // Genera QR Code per accesso mobile
  await qrGenerator.generate(config.PORT);
});
