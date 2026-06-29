// ================================================================
//  agents/activity.agent.js — Motore Procedurale per Activity Books
//  Genera Labirinti vettoriali o Pagine a Righe tramite PDFKit
// ================================================================

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Algoritmo Recursive Backtracker per generare un labirinto
 * @param {number} cols 
 * @param {number} rows 
 */
function generateMaze(cols, rows) {
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
    top: true, right: true, bottom: true, left: true, visited: false
  })));

  const stack = [];
  let current = { x: 0, y: 0 };
  grid[0][0].visited = true;

  // Apertura entrata e uscita
  grid[0][0].top = false;
  grid[rows - 1][cols - 1].bottom = false;

  function getUnvisitedNeighbors(c) {
    const neighbors = [];
    if (c.y > 0 && !grid[c.y - 1][c.x].visited) neighbors.push({ x: c.x, y: c.y - 1, dir: 'top' });
    if (c.x < cols - 1 && !grid[c.y][c.x + 1].visited) neighbors.push({ x: c.x + 1, y: c.y, dir: 'right' });
    if (c.y < rows - 1 && !grid[c.y + 1][c.x].visited) neighbors.push({ x: c.x, y: c.y + 1, dir: 'bottom' });
    if (c.x > 0 && !grid[c.y][c.x - 1].visited) neighbors.push({ x: c.x - 1, y: c.y, dir: 'left' });
    return neighbors;
  }

  function removeWall(a, b, dir) {
    if (dir === 'top') { grid[a.y][a.x].top = false; grid[b.y][b.x].bottom = false; }
    if (dir === 'right') { grid[a.y][a.x].right = false; grid[b.y][b.x].left = false; }
    if (dir === 'bottom') { grid[a.y][a.x].bottom = false; grid[b.y][b.x].top = false; }
    if (dir === 'left') { grid[a.y][a.x].left = false; grid[b.y][b.x].right = false; }
  }

  while (true) {
    const neighbors = getUnvisitedNeighbors(current);
    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      stack.push(current);
      removeWall(current, next, next.dir);
      current = { x: next.x, y: next.y };
      grid[current.y][current.x].visited = true;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      break;
    }
  }

  return grid;
}

/**
 * Disegna la matrice del labirinto sul PDF
 */
function drawMaze(doc, grid, xOffset, yOffset, cellSize) {
  doc.lineWidth(1);
  doc.strokeColor('#000000');

  const rows = grid.length;
  const cols = grid[0].length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const px = xOffset + x * cellSize;
      const py = yOffset + y * cellSize;

      if (cell.top) { doc.moveTo(px, py).lineTo(px + cellSize, py).stroke(); }
      if (cell.right) { doc.moveTo(px + cellSize, py).lineTo(px + cellSize, py + cellSize).stroke(); }
      if (cell.bottom) { doc.moveTo(px, py + cellSize).lineTo(px + cellSize, py + cellSize).stroke(); }
      if (cell.left) { doc.moveTo(px, py).lineTo(px, py + cellSize).stroke(); }
    }
  }
}

/**
 * Disegna una pagina di diario a righe
 */
function drawLinedPage(doc, width, height) {
  doc.lineWidth(0.5);
  doc.strokeColor('#CCCCCC');
  const lineSpacing = 24; // Punti
  const startY = 72;
  const endY = height - 72;

  for (let y = startY; y <= endY; y += lineSpacing) {
    doc.moveTo(54, y).lineTo(width - 54, y).stroke();
  }
}

// ─────────────────────────────────────────────────────────────
//  ESECUZIONE AGENTE ACTIVITY BOOKS
// ─────────────────────────────────────────────────────────────
async function run(scoutResult, updateProgress, slug, difficulty, bookType) {
  const numPagine = 10; 
  
  if (updateProgress) updateProgress(`📄 Inizializzazione Activity Book: ${bookType}...`, 10);

  // Generazione del file PDF (8.5x11 inches = 612 x 792 points)
  const pdfPath = path.join(__dirname, '..', 'data', 'books', slug, `${slug}.pdf`);
  fs.mkdirSync(path.join(__dirname, '..', 'data', 'books', slug), { recursive: true });

  return new Promise((resolve, reject) => {
      // Impostiamo il formato 8.625 x 11.25 per il KDP Bleed
      const docWidth = 8.625 * 72; // 621 pt
      const docHeight = 11.25 * 72; // 810 pt

      const doc = new PDFDocument({
         size: [docWidth, docHeight], 
         margins: { top: 0, bottom: 0, left: 0, right: 0 },
         autoFirstPage: false
      });

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Pagina Titolo / Copyright
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#000000').text(`${bookType.toUpperCase()}`, {
         align: 'center',
      });
      doc.moveDown();
      doc.fontSize(12).text(`Nicchia: ${scoutResult.nicchia}`, { align: 'center' });
      
      // Pagina bianca retro titolo
      doc.addPage();

      if (updateProgress) updateProgress(`🧩 Generazione Motore Vettoriale (${numPagine} Pagine)...`, 40);

      // Inseriamo i labirinti o le righe
      for (let i = 0; i < numPagine; i++) {
          doc.addPage();
          
          if (bookType === 'Labirinti') {
              const mazeCols = difficulty === 'Bambini' ? 10 : 25;
              const mazeRows = difficulty === 'Bambini' ? 12 : 30;
              const cellSize = Math.floor(500 / mazeCols); // Larghezza area ~500pt
              const startX = (docWidth - (mazeCols * cellSize)) / 2;
              const startY = (docHeight - (mazeRows * cellSize)) / 2;
              
              doc.font('Helvetica-Bold').fontSize(16).text(`Labirinto ${i+1}`, 0, startY - 30, { align: 'center' });
              
              const grid = generateMaze(mazeCols, mazeRows);
              drawMaze(doc, grid, startX, startY, cellSize);
              
              // In un libro KDP inseriamo una pagina bianca sul retro dei puzzle se usano pennarelli
              // ma di solito i labirinti possono avere un retro con la soluzione o essere fronte/retro.
              // Per semplicità mettiamo pagina bianca:
              doc.addPage();
          } 
          else if (bookType === 'Diario') {
              drawLinedPage(doc, docWidth, docHeight);
              // Per il diario il retro e' lo stesso, niente pagina bianca fittizia
              doc.addPage();
              drawLinedPage(doc, docWidth, docHeight);
          }
      }

      doc.end();

      writeStream.on('finish', async () => {
          
          if (updateProgress) updateProgress(`📄 Generazione Copertina Wrap KDP Bleed...`, 80);
          
          const totalPages = bookType === 'Diario' ? numPagine * 2 + 2 : numPagine * 2 + 2;
          const spineInches = Math.max(totalPages * 0.0022525, 0.1); 
          const spinePoints = spineInches * 72;
          
          // KDP Wrap Cover standard 8.5x11 con Bleed: (8.5*2) + spine + 0.25 larghezza, 11 + 0.25 altezza.
          const coverWidth = (8.5 * 72 * 2) + spinePoints + (0.25 * 72);
          const coverHeight = 11.25 * 72;
          
          const coverPdfPath = path.join(__dirname, '..', 'data', 'books', slug, `Cover_8.5x11.pdf`);
          const coverDoc = new PDFDocument({
              size: [coverWidth, coverHeight],
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
          });
          const coverWriteStream = fs.createWriteStream(coverPdfPath);
          coverDoc.pipe(coverWriteStream);
          
          // Sfondo cover (colore vibrant yellow per activity books)
          coverDoc.rect(0, 0, coverWidth, coverHeight).fill('#FFD166');
          
          const frontX = (8.5 * 72) + spinePoints + (0.125 * 72);
          coverDoc.fill('#000000').font('Helvetica-Bold').fontSize(36).text(scoutResult.titolo.toUpperCase(), frontX + 50, 200, { width: 8.5*72 - 100, align: 'center' });
          coverDoc.fontSize(16).text(`The Ultimate ${bookType}`, frontX + 50, 300, { width: 8.5*72 - 100, align: 'center' });
          
          coverDoc.end();
          
          await new Promise(res => coverWriteStream.on('finish', res));

          if (updateProgress) updateProgress(`✅ Activity Book e Copertina Generati!`, 100);

          resolve({
              testo: `[PDF ACTIVITY BOOK] Libro di tipo ${bookType} generato con successo.\nTroverai i file nell'archivio.`,
              pagineStimate: totalPages,
              parole: 0, 
              isColoringBook: true, // Reuse flag for PDF download frontend logic
              pdfPath: pdfPath,
              coverPath: coverPdfPath
          });
      });

      writeStream.on('error', (err) => reject(err));
  });
}

module.exports = { run };
