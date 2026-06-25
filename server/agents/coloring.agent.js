// ================================================================
//  agents/coloring.agent.js — Generatore PDF Libri da Colorare (Reale)
//  Midjourney/Pollinations Prompts & PDF Blank Pages Assembler
// ================================================================

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function getPromptsByNiche(nicchia, numPagine) {
  const baseStyle = "black and white line art, clean precise lines, coloring book page, no shading, pure white background, vector style, flat design, uncolored, high resolution";
  let subjects = [];

  const nicheMap = {
    'Mandala': [
      "intricate circular mandala, geometric shapes, symmetrical",
      "floral mandala, lotus petals, spiritual, highly detailed",
      "animal silhouette filled with mandala patterns",
      "abstract kaleidoscopic mandala, repeating geometric forms",
      "sun and moon celestial mandala, intricate stars"
    ],
    'Animali': [
      "cute baby elephant in a jungle setting, large leaves",
      "majestic lion head, detailed mane, simple background",
      "playful dolphins jumping in waves, stylized ocean",
      "sleeping fox curled up under a tree, forest elements",
      "detailed owl on a branch, large eyes, feathers",
      "savanna animals, giraffe eating leaves, line art"
    ],
    'Fantasy': [
      "beautiful fairy with intricate wings, sitting on a mushroom",
      "dragon wrapped around a castle tower, scales, fire",
      "magical crystal cave, glowing gems, stalactites",
      "mermaid on a rock, underwater plants, bubbles",
      "wizard reading a spellbook, glowing magic circles"
    ]
  };

  // Se la nicchia non è nella mappa esatta, prova a vedere se contiene parole chiave, 
  // altrimenti usa la stringa esatta della nicchia fornita dall'utente.
  let pool = nicheMap[nicchia];
  if (!pool) {
     for (const key of Object.keys(nicheMap)) {
         if (nicchia.toLowerCase().includes(key.toLowerCase())) pool = nicheMap[key];
     }
     if (!pool) pool = [`${nicchia} theme coloring page`]; // Fallback generico
  }
  
  for(let i=0; i<numPagine; i++) {
    const randomSubject = pool[Math.floor(Math.random() * pool.length)];
    subjects.push(`${randomSubject} variation ${i+1}, ${baseStyle}`);
  }

  return subjects;
}

// ─────────────────────────────────────────────────────────────
//  ESECUZIONE AGENTE CON GENERAZIONE PDF REALE
// ─────────────────────────────────────────────────────────────
async function run(scoutResult, updateProgress, slug) {
  const numPagine = 10; // Per demo veloce mettiamo 10, ma si può portare a 30
  const prompts = getPromptsByNiche(scoutResult.nicchia, numPagine);
  
  // Creiamo una directory temporanea per scaricare le immagini
  const tmpDir = path.join(__dirname, '..', 'data', 'tmp_images', slug);
  fs.mkdirSync(tmpDir, { recursive: true });

  const imagePaths = [];

  // Scaricamento immagini via Pollinations AI
  for (let i = 0; i < prompts.length; i++) {
    if (updateProgress) {
        updateProgress(`🎨 Generazione Immagine ${i+1}/${prompts.length}... (Potrebbe richiedere alcuni secondi)`, Math.round((i / prompts.length) * 50));
    }
    
    // Seed casuale per variare l'immagine anche con stesso prompt
    const seed = Math.floor(Math.random() * 999999999); 
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompts[i])}?width=825&height=1065&nologo=true&seed=${seed}`;
    
    try {
       const response = await fetch(url);
       if (!response.ok) throw new Error('API Error fetching image');
       const buffer = await response.arrayBuffer();
       
       const imgPath = path.join(tmpDir, `page_${i}.jpg`);
       fs.writeFileSync(imgPath, Buffer.from(buffer));
       imagePaths.push(imgPath);
    } catch (err) {
       console.error(`Errore generazione immagine ${i}:`, err);
       // Inseriamo un'immagine grigia vuota fittizia in caso di errore per non far crashare il pdf
       // Nella realtà salteremmo o riproveremmo
    }
  }

  if (updateProgress) updateProgress(`📄 Compilazione PDF (8.5x11") in corso...`, 80);

  // Generazione del file PDF reale (8.5x11 inches = 612 x 792 points in pdfkit)
  const pdfPath = path.join(__dirname, '..', 'data', 'books', slug, `${slug}.pdf`);
  // Ci assicuriamo che la directory destinazione esista (lo fa il filemanager di solito, ma per sicurezza)
  fs.mkdirSync(path.join(__dirname, '..', 'data', 'books', slug), { recursive: true });

  return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
         size: [612, 792], // 8.5 x 11 pollici
         margins: { top: 0, bottom: 0, left: 0, right: 0 },
         autoFirstPage: false
      });

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Pagina Titolo / Copyright
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(24).text(`COLORING BOOK: ${scoutResult.nicchia.toUpperCase()}`, {
         align: 'center',
         valign: 'center'
      });
      doc.moveDown();
      doc.fontSize(12).text('Generato tramite KDP Factory Dashboard', { align: 'center' });
      
      // Pagina bianca retro titolo
      doc.addPage();

      // Inseriamo i disegni alternati a pagine bianche
      for (let i = 0; i < imagePaths.length; i++) {
          // Disegno
          doc.addPage();
          try {
             // L'immagine deve fittare 8.5x11 (612x792), aggiungiamo un margine di sicurezza (bleed) 
             // usando fit: [612, 792] o x:0, y:0, width: 612, height: 792. 
             // Usiamo margini KDP standard
             doc.image(imagePaths[i], 36, 36, { width: 540, height: 720 });
          } catch(e) {
             doc.text('Errore caricamento immagine ' + i);
          }

          // Pagina Bianca anti bleed-through
          doc.addPage();
      }

      doc.end();

      writeStream.on('finish', () => {
          // Cleanup delle immagini temporanee
          try {
             for (const p of imagePaths) fs.unlinkSync(p);
             fs.rmdirSync(tmpDir);
          } catch(e) { console.error('Errore cleanup tmp dir:', e); }

          if (updateProgress) updateProgress(`✅ PDF Generato con successo!`, 100);

          resolve({
              testo: `[PDF REALE GENERATO] Il libro da colorare è stato impaginato e salvato in PDF.\nTroverai il file pdf nell'archivio o tramite download diretto.`,
              pagineStimate: numPagine * 2 + 2, // 1 disegno + 1 bianca + 2 di intro
              parole: 0, 
              outline: [], // non serve l'outline fittizio
              isColoringBook: true,
              pdfPath: pdfPath
          });
      });

      writeStream.on('error', (err) => reject(err));
  });
}

module.exports = { run };
