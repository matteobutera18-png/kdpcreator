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

// ── POST /api/books/seo-optimize ──────────────────────────────
router.post('/seo-optimize', requireAuth, (req, res) => {
  const { keyword } = req.body;
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword mancante.' });
  }
  
  // Generazione heuristica/simulata avanzata per tag SEO
  const kw = keyword.toLowerCase().trim();
  const tags = [
    `${kw} per principianti`,
    `${kw} guida pratica`,
    `migliori ${kw} 2026`,
    `${kw} passo passo`,
    `tecniche di ${kw}`,
    `manuale di ${kw}`,
    `${kw} per adulti`
  ];
  
  const description = `<b>Scopri il mondo di ${keyword.toUpperCase()} come mai prima d'ora!</b>
  <br><br>
  Stai cercando la risorsa definitiva per <i>${kw}</i>? Questo libro è stato progettato appositamente per chi desidera risultati concreti e immediati.
  <br><br>
  <h2>Cosa troverai all'interno:</h2>
  <ul>
    <li>Tecniche avanzate e consigli pratici.</li>
    <li>Esercizi passo-passo testati sul campo.</li>
    <li>Oltre 50 esempi reali da applicare subito.</li>
  </ul>
  <br>
  Non aspettare oltre! Clicca su <b>"Acquista Ora"</b> e inizia oggi stesso il tuo viaggio straordinario.`;

  return res.json({
    success: true,
    keyword,
    tags,
    description
  });
});

module.exports = router;
