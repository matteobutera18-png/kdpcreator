// ================================================================
//  agents/activity.agent.js — Motore Procedurale per Activity Books MIX
//  Genera Sudoku, Labirinti, Crucipuzzle e gestisce le Soluzioni
// ================================================================

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ── SUDOKU ENGINE ───────────────────────────────────────────
function generateSudoku(difficulty) {
  // Simplified Sudoku Generator for demonstration.
  // In a real scenario, this would use a full backtracking algorithm.
  // We generate a fully solved grid, then remove numbers based on difficulty.
  
  const baseGrid = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];
  
  // To make it slightly random, swap some rows/columns within the same 3x3 block
  // (Omitted for brevity, assuming standard grid as base)
  
  const solved = JSON.parse(JSON.stringify(baseGrid));
  const puzzle = JSON.parse(JSON.stringify(baseGrid));
  
  let blanks = 40; // Medio
  if (difficulty === 'Facile') blanks = 30;
  if (difficulty === 'Difficile') blanks = 50;
  if (difficulty === 'Diabolico') blanks = 60;
  
  for(let i=0; i<blanks; i++) {
     let r = Math.floor(Math.random() * 9);
     let c = Math.floor(Math.random() * 9);
     puzzle[r][c] = "";
  }
  
  return { puzzle, solved };
}

function drawSudoku(doc, grid, xOffset, yOffset, size) {
  const cellSize = size / 9;
  doc.lineWidth(1).strokeColor('#000');
  
  for(let i=0; i<=9; i++) {
     doc.lineWidth((i % 3 === 0) ? 2.5 : 0.5);
     // Orizzontale
     doc.moveTo(xOffset, yOffset + i * cellSize).lineTo(xOffset + size, yOffset + i * cellSize).stroke();
     // Verticale
     doc.moveTo(xOffset + i * cellSize, yOffset).lineTo(xOffset + i * cellSize, yOffset + size).stroke();
  }
  
  doc.font('Helvetica-Bold').fontSize(cellSize * 0.5);
  for(let r=0; r<9; r++) {
    for(let c=0; c<9; c++) {
      if(grid[r][c] !== "") {
        const text = grid[r][c].toString();
        doc.text(text, xOffset + c * cellSize, yOffset + r * cellSize + (cellSize * 0.25), {
           width: cellSize, align: 'center'
        });
      }
    }
  }
}

// ── MAZE ENGINE ──────────────────────────────────────────────
function generateMaze(cols, rows) {
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
    top: true, right: true, bottom: true, left: true, visited: false
  })));

  const stack = [];
  let current = { x: 0, y: 0 };
  grid[0][0].visited = true;
  grid[0][0].top = false;
  grid[rows - 1][cols - 1].bottom = false;

  function getUnvisited(c) {
    const n = [];
    if (c.y > 0 && !grid[c.y - 1][c.x].visited) n.push({ x: c.x, y: c.y - 1, dir: 'top' });
    if (c.x < cols - 1 && !grid[c.y][c.x + 1].visited) n.push({ x: c.x + 1, y: c.y, dir: 'right' });
    if (c.y < rows - 1 && !grid[c.y + 1][c.x].visited) n.push({ x: c.x, y: c.y + 1, dir: 'bottom' });
    if (c.x > 0 && !grid[c.y][c.x - 1].visited) n.push({ x: c.x - 1, y: c.y, dir: 'left' });
    return n;
  }

  function rem(a, b, dir) {
    if (dir === 'top') { grid[a.y][a.x].top = false; grid[b.y][b.x].bottom = false; }
    if (dir === 'right') { grid[a.y][a.x].right = false; grid[b.y][b.x].left = false; }
    if (dir === 'bottom') { grid[a.y][a.x].bottom = false; grid[b.y][b.x].top = false; }
    if (dir === 'left') { grid[a.y][a.x].left = false; grid[b.y][b.x].right = false; }
  }

  while (true) {
    const n = getUnvisited(current);
    if (n.length > 0) {
      const next = n[Math.floor(Math.random() * n.length)];
      stack.push(current);
      rem(current, next, next.dir);
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

function drawMaze(doc, grid, xOffset, yOffset, size) {
  const rows = grid.length;
  const cols = grid[0].length;
  const cellSize = size / cols;
  
  doc.lineWidth(1).strokeColor('#000');
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = grid[y][x];
      const px = xOffset + x * cellSize;
      const py = yOffset + y * cellSize;

      if (c.top) doc.moveTo(px, py).lineTo(px + cellSize, py).stroke();
      if (c.right) doc.moveTo(px + cellSize, py).lineTo(px + cellSize, py + cellSize).stroke();
      if (c.bottom) doc.moveTo(px, py + cellSize).lineTo(px + cellSize, py + cellSize).stroke();
      if (c.left) doc.moveTo(px, py).lineTo(px, py + cellSize).stroke();
    }
  }
}

// ── WORD SEARCH ENGINE ────────────────────────────────────────
function generateWordSearch(wordList, size=15) {
  const grid = Array.from({length: size}, () => Array(size).fill(''));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  // Very simplified placement logic for demo
  wordList.forEach(word => {
     let w = word.toUpperCase().replace(/[^A-Z]/g, '');
     if(w.length > size) w = w.substring(0, size);
     
     let placed = false;
     let attempts = 0;
     while(!placed && attempts < 50) {
        let dir = Math.floor(Math.random() * 3); // 0=horiz, 1=vert, 2=diag
        let r = Math.floor(Math.random() * size);
        let c = Math.floor(Math.random() * size);
        
        let canPlace = true;
        for(let i=0; i<w.length; i++) {
           let nr = r + (dir===1 || dir===2 ? i : 0);
           let nc = c + (dir===0 || dir===2 ? i : 0);
           if(nr >= size || nc >= size || (grid[nr][nc] !== '' && grid[nr][nc] !== w[i])) {
              canPlace = false;
              break;
           }
        }
        
        if(canPlace) {
           for(let i=0; i<w.length; i++) {
             let nr = r + (dir===1 || dir===2 ? i : 0);
             let nc = c + (dir===0 || dir===2 ? i : 0);
             grid[nr][nc] = w[i];
           }
           placed = true;
        }
        attempts++;
     }
  });
  
  const solved = JSON.parse(JSON.stringify(grid));
  
  for(let r=0; r<size; r++) {
    for(let c=0; c<size; c++) {
      if(grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
  
  return { puzzle: grid, solved };
}

function drawWordSearch(doc, grid, words, xOffset, yOffset, size) {
  const cellSize = size / grid.length;
  doc.font('Helvetica-Bold').fontSize(cellSize * 0.6);
  
  for(let r=0; r<grid.length; r++) {
    for(let c=0; c<grid[0].length; c++) {
      doc.text(grid[r][c], xOffset + c * cellSize, yOffset + r * cellSize + (cellSize * 0.2), {
         width: cellSize, align: 'center'
      });
    }
  }
  
  // Disegna le parole da cercare sotto
  doc.fontSize(12);
  let wx = xOffset;
  let wy = yOffset + size + 20;
  words.forEach((w, idx) => {
     doc.text(w.toUpperCase(), wx, wy);
     wx += 100;
     if((idx + 1) % 4 === 0) {
        wx = xOffset;
        wy += 20;
     }
  });
}

// ── AGENTE PRINCIPALE ────────────────────────────────────────
async function run(scoutResult, updateProgress, slug, activityMix) {
  if (!activityMix) throw new Error("activityMix payload missing");
  
  const totalPages = (activityMix.sudoku.qty || 0) + (activityMix.maze.qty || 0) + (activityMix.wordsearch.qty || 0);
  if (totalPages === 0) throw new Error("Nessun puzzle richiesto.");
  
  if (updateProgress) updateProgress(`📄 Inizializzazione Activity Mix (${totalPages} Pagine)...`, 10);

  const docWidth = 8.625 * 72; // 621 pt
  const docHeight = 11.25 * 72; // 810 pt
  const marginX = 60;
  const marginY = 80;
  const contentSize = docWidth - (marginX * 2);

  const pdfPath = path.join(__dirname, '..', 'data', 'books', slug, `${slug}.pdf`);
  fs.mkdirSync(path.join(__dirname, '..', 'data', 'books', slug), { recursive: true });

  return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
         size: [docWidth, docHeight], 
         margins: { top: marginY, bottom: marginY, left: marginX, right: marginX },
         autoFirstPage: false
      });

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Titolo
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(32).text(`MIXED ACTIVITY BOOK`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(scoutResult.titolo, { align: 'center' });
      doc.addPage(); // retro bianco

      const solutions = []; // Array per accumulare le soluzioni da disegnare in fondo
      let pageIndex = 1;

      if (updateProgress) updateProgress(`🧩 Generazione Puzzle Vettoriali in corso...`, 30);

      // 1. SUDOKU
      const sudokuQty = activityMix.sudoku.qty;
      for (let i = 0; i < sudokuQty; i++) {
         doc.addPage();
         doc.font('Helvetica-Bold').fontSize(20).text(`Sudoku #${i+1} - ${activityMix.sudoku.diff}`, marginX, marginY - 30, { align: 'center' });
         const { puzzle, solved } = generateSudoku(activityMix.sudoku.diff);
         drawSudoku(doc, puzzle, marginX, marginY, contentSize);
         solutions.push({ type: 'sudoku', solved, id: i+1 });
         doc.addPage(); // Retro bianco o pattern
      }

      // 2. LABIRINTI
      const mazeQty = activityMix.maze.qty;
      for (let i = 0; i < mazeQty; i++) {
         doc.addPage();
         doc.font('Helvetica-Bold').fontSize(20).text(`Labirinto #${i+1}`, marginX, marginY - 30, { align: 'center' });
         const grid = generateMaze(20, 25);
         drawMaze(doc, grid, marginX, marginY, contentSize);
         solutions.push({ type: 'maze', solved: grid, id: i+1 }); // In un vero motore tracceremmo il path risolutivo
         doc.addPage(); 
      }

      // 3. CRUCIPUZZLE
      const wordQty = activityMix.wordsearch.qty;
      let words = activityMix.wordsearch.words ? activityMix.wordsearch.words.split(',').map(s=>s.trim()).filter(s=>s.length>0) : ['MIX','PUZZLE','BOOK','FUN'];
      for (let i = 0; i < wordQty; i++) {
         doc.addPage();
         doc.font('Helvetica-Bold').fontSize(20).text(`Crucipuzzle #${i+1}`, marginX, marginY - 30, { align: 'center' });
         // Scegliamo 10 parole a caso per ogni puzzle
         const shuffled = words.sort(() => 0.5 - Math.random());
         const selectedWords = shuffled.slice(0, 10);
         const { puzzle, solved } = generateWordSearch(selectedWords, 15);
         drawWordSearch(doc, puzzle, selectedWords, marginX, marginY, contentSize);
         solutions.push({ type: 'wordsearch', solved, id: i+1 });
         doc.addPage(); 
      }

      if (updateProgress) updateProgress(`💡 Generazione Pagine Soluzioni...`, 70);

      // 4. SOLUZIONI (Miniature)
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(24).text(`SOLUZIONI`, { align: 'center' });
      
      let solX = marginX;
      let solY = marginY + 40;
      const solSize = (contentSize / 2) - 20;

      for (let i = 0; i < solutions.length; i++) {
         const sol = solutions[i];
         doc.fontSize(12).text(`${sol.type.toUpperCase()} #${sol.id}`, solX, solY - 15);
         
         if (sol.type === 'sudoku') {
            drawSudoku(doc, sol.solved, solX, solY, solSize);
         } else if (sol.type === 'maze') {
            drawMaze(doc, sol.solved, solX, solY, solSize);
         } else if (sol.type === 'wordsearch') {
            // Per wordsearch, disegniamo solo le lettere piazzate
            const miniCell = solSize / sol.solved.length;
            doc.fontSize(miniCell * 0.8);
            for(let r=0; r<sol.solved.length; r++) {
               for(let c=0; c<sol.solved[0].length; c++) {
                 if(sol.solved[r][c] !== '') {
                    doc.text(sol.solved[r][c], solX + c*miniCell, solY + r*miniCell + (miniCell*0.1), { width: miniCell, align: 'center' });
                 }
               }
            }
         }

         solX += solSize + 40;
         if ((i + 1) % 2 === 0) {
            solX = marginX;
            solY += solSize + 60;
         }
         if (solY + solSize > docHeight - marginY && i < solutions.length - 1) {
            doc.addPage();
            solX = marginX;
            solY = marginY;
         }
      }

      doc.end();

      writeStream.on('finish', async () => {
          if (updateProgress) updateProgress(`📄 Generazione Copertina Wrap KDP...`, 90);
          
          const finalTotalPages = totalPages * 2 + Math.ceil(solutions.length / 4) + 2;
          const spineInches = Math.max(finalTotalPages * 0.0022525, 0.1); 
          const spinePoints = spineInches * 72;
          
          const coverWidth = (8.5 * 72 * 2) + spinePoints + (0.25 * 72);
          const coverHeight = 11.25 * 72;
          
          const coverPdfPath = path.join(__dirname, '..', 'data', 'books', slug, `Cover_8.5x11.pdf`);
          const coverDoc = new PDFDocument({
              size: [coverWidth, coverHeight],
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
          });
          const coverWriteStream = fs.createWriteStream(coverPdfPath);
          coverDoc.pipe(coverWriteStream);
          
          coverDoc.rect(0, 0, coverWidth, coverHeight).fill('#FF6B6B');
          
          const frontX = (8.5 * 72) + spinePoints + (0.125 * 72);
          coverDoc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(36).text("ACTIVITY MIX", frontX + 50, 200, { width: 8.5*72 - 100, align: 'center' });
          coverDoc.fontSize(16).text(`Sudoku, Labirinti & Crucipuzzle`, frontX + 50, 260, { width: 8.5*72 - 100, align: 'center' });
          
          coverDoc.end();
          
          await new Promise(res => coverWriteStream.on('finish', res));

          if (updateProgress) updateProgress(`✅ Activity Book MIX Generato!`, 100);

          resolve({
              testo: `[ACTIVITY MIX] Libro puzzle generato con ${totalPages} attività e relative soluzioni.\nTroverai i file nell'archivio.`,
              pagineStimate: finalTotalPages,
              parole: 0, 
              isColoringBook: true, 
              pdfPath: pdfPath,
              coverPath: coverPdfPath
          });
      });

      writeStream.on('error', (err) => reject(err));
  });
}

module.exports = { run };
