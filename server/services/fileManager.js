// ================================================================
//  services/fileManager.js — Gestione I/O File Protetti
// ================================================================

const fs   = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Inizializza le directory dati al primo avvio.
 */
function initDirectories() {
  const dirs = [config.PATHS.data, config.PATHS.books];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Creata directory: ${dir}`);
    }
  });

  // Crea users.json vuoto se non esiste
  if (!fs.existsSync(config.PATHS.users)) {
    fs.writeFileSync(config.PATHS.users, '[]', 'utf-8');
    console.log('👤 Creato users.json (vuoto). Esegui: node setup.js');
  }
}

/**
 * Carica tutti gli utenti dal file JSON.
 */
function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(config.PATHS.users, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * Salva gli utenti nel file JSON.
 */
function saveUsers(users) {
  fs.writeFileSync(config.PATHS.users, JSON.stringify(users, null, 2), 'utf-8');
}

/**
 * Salva i dati di un libro generato.
 * @param {string} slug - Identificatore del libro
 * @param {object} data - Oggetto con metadata, libro_6x9, prompt_copertina
 */
function saveBook(slug, data) {
  const bookDir = path.join(config.PATHS.books, slug);
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
  }

  // metadata.json
  fs.writeFileSync(
    path.join(bookDir, 'metadata.json'),
    JSON.stringify(data.metadata, null, 2),
    'utf-8'
  );

  // libro_6x9.txt
  fs.writeFileSync(
    path.join(bookDir, 'libro_6x9.txt'),
    data.libro_6x9,
    'utf-8'
  );

  // prompt_copertina.txt
  fs.writeFileSync(
    path.join(bookDir, 'prompt_copertina.txt'),
    data.prompt_copertina,
    'utf-8'
  );

  console.log(`📦 Libro salvato: ${bookDir}`);
  return bookDir;
}

/**
 * Restituisce la lista di tutti i libri generati.
 */
function listBooks() {
  try {
    const booksDir = config.PATHS.books;
    if (!fs.existsSync(booksDir)) return [];

    return fs.readdirSync(booksDir)
      .filter(slug => {
        const metaPath = path.join(booksDir, slug, 'metadata.json');
        return fs.existsSync(metaPath);
      })
      .map(slug => {
        try {
          const meta = JSON.parse(
            fs.readFileSync(path.join(booksDir, slug, 'metadata.json'), 'utf-8')
          );
          return {
            slug,
            titolo:       meta.titolo     || slug,
            categoria:    meta.categoria  || '—',
            keywords:     meta.keywords   || [],
            pagineStimate: meta.pagineStimate || 0,
            createdAt:    meta.createdAt  || '',
          };
        } catch {
          return { slug, titolo: slug, categoria: '—', keywords: [], pagineStimate: 0, createdAt: '' };
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('Errore lettura libri:', err.message);
    return [];
  }
}

/**
 * Restituisce il dettaglio completo di un libro.
 */
function getBook(slug) {
  const bookDir = path.join(config.PATHS.books, slug);

  if (!fs.existsSync(bookDir)) return null;

  const meta     = JSON.parse(fs.readFileSync(path.join(bookDir, 'metadata.json'), 'utf-8'));
  const libro    = fs.readFileSync(path.join(bookDir, 'libro_6x9.txt'), 'utf-8');
  const prompts  = fs.readFileSync(path.join(bookDir, 'prompt_copertina.txt'), 'utf-8');

  // Estratto del libro (primi 3000 caratteri)
  const estratto = libro.substring(0, 3000) + (libro.length > 3000 ? '\n\n[...]' : '');

  return {
    slug,
    metadata:        meta,
    libroEstratto:   estratto,
    promptCopertina: prompts,
    caratteriTotali: libro.length,
  };
}

/**
 * Restituisce il percorso di un file protetto del libro per il download.
 */
function getBookFilePath(slug, fileType) {
  const validFiles = {
    'libro':   'libro_6x9.txt',
    'metadati': 'metadata.json',
    'prompt':  'prompt_copertina.txt',
    'pdf':     `${slug}.pdf`,
    'cover':   `Cover_8.5x11.pdf`,
  };
  const filename = validFiles[fileType];
  if (!filename) return null;

  const filePath = path.join(config.PATHS.books, slug, filename);
  return fs.existsSync(filePath) ? filePath : null;
}

module.exports = {
  initDirectories,
  loadUsers,
  saveUsers,
  saveBook,
  listBooks,
  getBook,
  getBookFilePath,
};
