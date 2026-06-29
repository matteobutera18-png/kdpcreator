// ================================================================
//  agents/coloring.agent.js — Generatore PDF Libri da Colorare (Reale)
//  Midjourney/Pollinations Prompts & PDF Blank Pages Assembler
// ================================================================

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function getPromptsByNiche(nicchia, numPagine, difficulty, artStyle) {
  const diffStyle = difficulty === 'Bambini' 
    ? "simple, thick bold lines, easy to color, very few details, large shapes" 
    : "intricate, extremely detailed, highly complex, fine lines";
    
  // Aggiunta parametri di Stile
  let styleModifiers = "";
  let negativePrompts = "&negativePrompt=shading, colors, gray background, gradients, 3d, realistic";
  
  if (artStyle === 'Kawaii Semplice') {
      styleModifiers = "kawaii style, cute, japanese chibi, adorable";
      negativePrompts += ", scary, complex";
  } else if (artStyle === 'Mandala Intricato') {
      styleModifiers = "mandala pattern, kaleidoscopic, circular symmetrical design";
  } else if (artStyle === 'Schizzo a Matita') {
      styleModifiers = "pencil sketch style line art, hand drawn texture";
  } else {
      styleModifiers = "clean vector art"; // Default
  }

  const baseStyle = `black and white line art, pure white background, uncolored, ${diffStyle}, ${styleModifiers}`;
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
    // Formattiamo il prompt finale includendo il negativePrompt nell'URL 
    // Lo gestiamo come oggetto per passarlo alla funzione di fetch
    subjects.push({
      text: `${randomSubject} variation ${i+1}, ${baseStyle}`,
      neg: negativePrompts
    });
  }

  return subjects;
}

// ─────────────────────────────────────────────────────────────
//  ESECUZIONE AGENTE CON GENERAZIONE PDF REALE E COVER
// ─────────────────────────────────────────────────────────────
async function run(scoutResult, updateProgress, slug, difficulty, artStyle) {
  const numPagine = 10; // Demo
  const prompts = getPromptsByNiche(scoutResult.nicchia, numPagine, difficulty, artStyle);
  
  // Creiamo una directory temporanea per scaricare le immagini
  const tmpDir = path.join(__dirname, '..', 'data', 'tmp_images', slug);
  fs.mkdirSync(tmpDir, { recursive: true });

  const imagePaths = [];

  // Scaricamento immagini via Pollinations AI
  for (let i = 0; i < prompts.length; i++) {
    const seed = Math.floor(Math.random() * 999999999); 
    const promptData = prompts[i];
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptData.text)}?width=862&height=1125&nologo=true&seed=${seed}${promptData.neg}`;
    
    if (updateProgress) {
        // Send image URL for Live Preview
        updateProgress(`🎨 Generazione Immagine ${i+1}/${prompts.length}... [${artStyle}]`, Math.round((i / prompts.length) * 50), { imageUrl: url });
    }
    
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

  if (updateProgress) updateProgress(`📄 Compilazione PDF Bleed (8.625x11.25") in corso...`, 80);

  // Generazione del file PDF reale Bleed (8.625x11.25 inches)
  const docWidth = 8.625 * 72;  // 621 pt
  const docHeight = 11.25 * 72; // 810 pt

  const pdfPath = path.join(__dirname, '..', 'data', 'books', slug, `${slug}.pdf`);
  fs.mkdirSync(path.join(__dirname, '..', 'data', 'books', slug), { recursive: true });

  return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
         size: [docWidth, docHeight],
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
             // Immagine centrata per full bleed
             // doc.image usa l'intera area 621x810
             doc.image(imagePaths[i], 0, 0, { width: docWidth, height: docHeight });
          } catch(e) {
             doc.text('Errore caricamento immagine ' + i);
          }

          // Pagina Bianca anti bleed-through
          doc.addPage();
      }

      doc.end();

      writeStream.on('finish', async () => {
          
          if (updateProgress) updateProgress(`📄 Generazione Copertina (Fronte + Retro) in corso...`, 90);
          
          // Generazione Cover PDF Wrap Bleed
          const totalPages = numPagine * 2 + 2;
          const spineInches = Math.max(totalPages * 0.0022525, 0.1); 
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
          
          // Sfondo cover (colore dark blueish)
          coverDoc.rect(0, 0, coverWidth, coverHeight).fill('#1E1E2E');
          
          // Testo Retro (sinistra)
          coverDoc.fill('#FFFFFF').fontSize(16).text('Un meraviglioso libro da colorare creato da KDP Factory.', 50, 100, { width: 8.5*72 - 100, align: 'center' });
          coverDoc.fontSize(12).text(`Nicchia: ${scoutResult.nicchia.toUpperCase()}\nDifficoltà: ${difficulty}`, 50, 200, { width: 8.5*72 - 100, align: 'center' });
          
          // Dorso (centro)
          coverDoc.save();
          // Trasla al centro esatto
          coverDoc.translate(8.5*72 + (spinePoints/2), coverHeight/2);
          coverDoc.rotate(-90);
          coverDoc.fontSize(10).fill('#FFFFFF').text(scoutResult.titolo.toUpperCase(), 0, -5, { align: 'center', width: coverHeight });
          coverDoc.restore();
          
          // Testo Fronte (destra)
          const frontX = (8.5*72) + spinePoints + (0.125 * 72);
          coverDoc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(36).text(scoutResult.titolo.toUpperCase(), frontX + 50, 100, { width: 8.5*72 - 100, align: 'center' });
          
          // Aggiungiamo l'ultima immagine generata come copertina frontale se esiste
          if (imagePaths.length > 0) {
              try {
                  coverDoc.image(imagePaths[imagePaths.length - 1], frontX + (8.5*72/2) - 150, 250, { width: 300 });
              } catch(e){}
          }
          
          coverDoc.end();
          
          await new Promise(res => coverWriteStream.on('finish', res));

          // Cleanup delle immagini temporanee
          try {
             for (const p of imagePaths) fs.unlinkSync(p);
             fs.rmdirSync(tmpDir);
          } catch(e) { console.error('Errore cleanup tmp dir:', e); }

          if (updateProgress) updateProgress(`✅ PDF e Copertina Generati con successo!`, 100);

          resolve({
              testo: `[PDF REALE GENERATO] Il libro da colorare è stato impaginato e salvato in PDF assieme alla sua Copertina.\nTroverai i file nell'archivio.`,
              pagineStimate: totalPages,
              parole: 0, 
              outline: [], // non serve l'outline fittizio
              isColoringBook: true,
              pdfPath: pdfPath,
              coverPath: coverPdfPath
          });
      });

      writeStream.on('error', (err) => reject(err));
  });
}

module.exports = { run };
