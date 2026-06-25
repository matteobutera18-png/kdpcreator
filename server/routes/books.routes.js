// ================================================================
//  routes/books.routes.js — Archivio Libri (Protetto JWT)
// ================================================================

const express     = require('express');
const router      = express.Router();
const path        = require('path');

const { requireAuth }  = require('../middleware/auth');
const fileManager      = require('../services/fileManager');

// Tutte le route richiedono autenticazione
router.use(requireAuth);

// ── GET /api/books — Lista tutti i libri ─────────────────────
router.get('/', (req, res) => {
  const books = fileManager.listBooks();
  return res.json({ books, total: books.length });
});

// ── GET /api/books/:slug — Dettaglio libro ────────────────────
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const book = fileManager.getBook(slug);

  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato.' });
  }

  return res.json(book);
});

// ── GET /api/books/:slug/download/:fileType — Download file protetto ──
router.get('/:slug/download/:fileType', (req, res) => {
  const { slug, fileType } = req.params;
  const filePath = fileManager.getBookFilePath(slug, fileType);

  if (!filePath) {
    return res.status(404).json({ error: 'File non trovato o tipo non valido.' });
  }

  const filename = path.basename(filePath);
  res.setHeader('Content-Disposition', `attachment; filename="${slug}_${filename}"`);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(filePath);
});

module.exports = router;
