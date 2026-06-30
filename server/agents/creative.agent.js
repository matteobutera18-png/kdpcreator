// ================================================================
//  agents/creative.agent.js — Prompt Designer per Copertine KDP
//  Output: prompt Midjourney v6 / DALL-E 3 iper-dettagliati
// ================================================================

// ─────────────────────────────────────────────────────────────
//  LIBRERIA STILI E COMPOSIZIONI
// ─────────────────────────────────────────────────────────────

const LUCI = [
  'dramatic cinematic lighting with volumetric light rays',
  'soft golden hour backlighting with lens flare',
  'deep contrast chiaroscuro lighting',
  'ethereal neon glow with rim lighting',
  'professional studio key light with subtle fill',
];

const COMPOSIZIONI = [
  'centered composition, rule of thirds, hero shot',
  'dynamic diagonal composition, strong visual hierarchy',
  'minimalist centered with negative space, breathing room',
  'layered depth with foreground detail and blurred background',
  'symmetrical composition with vanishing point perspective',
];

const QUALITA_PARAMS = '--ar 6:9 --v 6 --style raw --q 2 --s 750';

// ─────────────────────────────────────────────────────────────
//  GENERATORE PROMPT COPERTINA
// ─────────────────────────────────────────────────────────────

function generaPromptCopertina(scout) {
  const luce        = LUCI[Math.floor(Math.random() * LUCI.length)];
  const composizione = COMPOSIZIONI[Math.floor(Math.random() * COMPOSIZIONI.length)];
  const colori      = scout.palette || '#1A1A2E,#6C63FF';
  const [colore1, colore2] = colori.split(',');
  const stile       = scout.stile_cover || 'professional book cover design';

  let benchmarkText = '';
  if (scout.benchmark && scout.benchmark.titolo) {
      benchmarkText = `ATTENZIONE BENCHMARK COMPETITOR: Devi superare graficamente il libro "${scout.benchmark.titolo}" che ha questo punto debole: "${scout.benchmark.punti_deboli}". Crea una composizione superiore per impatto visivo e brillantezza dei colori che distrugga la concorrenza. `;
  }

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PROMPT COPERTINA FRONTALE — "${scout.titolo}"
  Ottimizzato per: Midjourney v6 | DALL-E 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 MIDJOURNEY v6 — Copia e incolla esattamente questo prompt:
────────────────────────────────────────────────────────────────
${benchmarkText}${stile}, professional Amazon KDP book cover for "${scout.titolo}", ${composizione}, ${luce}, dominant colors: ${colore1} background with ${colore2} accent lights, ultra-detailed 8K rendering, editorial design aesthetic, premium luxury feel, typography space reserved at top 30% for title text and bottom 10% for author name, NO text in image, hyperrealistic, award-winning book cover design, trending on Behance, shot on Hasselblad H6D, f/1.4 aperture, bokeh background, professional photo retouching ${QUALITA_PARAMS}
────────────────────────────────────────────────────────────────

📌 DALL-E 3 (ChatGPT) — Usa questo prompt:
────────────────────────────────────────────────────────────────
Create a professional, premium book cover design for an Amazon KDP book titled "${scout.titolo}: ${scout.sottotitolo}". ${benchmarkText}The visual style: ${stile}. Color palette: deep ${colore1} background with ${colore2} accent lighting. Lighting: ${luce}. Composition: ${composizione}. The design should feel editorial, modern, and high-end — comparable to Big 5 publisher covers. Leave the top third of the image empty for title text overlay, and bottom portion for author name. NO text should appear in the generated image. Aspect ratio: 6:9 portrait (suitable for KDP 6x9 inch print). Style: ultra-realistic, hyperdetailed, professional photography quality.
────────────────────────────────────────────────────────────────

📐 SPECIFICHE TECNICHE COPERTINA KDP:
  • Formato: 6" × 9" (15.24 × 22.86 cm)
  • Risoluzione minima: 300 DPI per stampa
  • Formato file: JPG o PNG ad alta qualità
  • Spazio sicuro: 0.25" (6mm) dai bordi
  • Risoluzione digitale (eBook): 2560 × 1600 px (JPG ≥ 40 MB)
  • Colori: RGB per digitale, CMYK per stampa

💡 SUGGERIMENTI DI OTTIMIZZAZIONE:
  • Il titolo "${scout.titolo}" va posizionato nel terzo superiore
  • Font consigliato: Bold sans-serif (es. Montserrat Black, Bebas Neue)
  • Il sottotitolo va in dimensione 40-50% del titolo
  • Usa il colore ${colore2} per il titolo per massimo contrasto
  • Aggiungi la banda del colore categoria (es. viola per business, verde per salute)
`.trim();
}

// ─────────────────────────────────────────────────────────────
//  GENERATORE PROMPT ILLUSTRAZIONI INTERNE
// ─────────────────────────────────────────────────────────────

function generaPromptIllustrazioni(scout) {
  const kw = scout.keywords || [];
  const cat = scout.categoria || 'Crescita Personale';

  const illustrazioni = [
    {
      posizione: 'Capitolo 1 — Immagine di Apertura (Hook Visivo)',
      scopo:     'Creare impatto emotivo e introdurre il tema principale',
      prompt:    `Minimalist black and white editorial illustration representing the concept of "${kw[0] || scout.nicchia}", stark contrast, geometric shapes, thought-provoking visual metaphor, suitable for book interior chapter opener, ink illustration style. OUTPUT PURAMENTE VETTORIALE, linee nere ad alto contrasto spesse almeno 2px, sfondo bianco puro #FFFFFF, assenza totale di sfumature, ombre o artefatti grigi --ar 16:9 --v 6 --style raw --s 500`,
    },
    {
      posizione: 'Capitolo Centrale — Infografica / Schema Visivo',
      scopo:     'Illustrare il metodo o il sistema presentato nel libro',
      prompt:    `Clean vector-style infographic illustration showing "${kw[1] || 'sistema metodologico'}" process with 4 steps, flat design, icons, minimal color palette of 2-3 colors (${(scout.palette || '#6C63FF,#FFFFFF').replace(',', ' and ')}), suitable for print in grayscale, professional editorial illustration. OUTPUT PURAMENTE VETTORIALE, linee nere ad alto contrasto spesse almeno 2px, sfondo bianco puro #FFFFFF, assenza totale di sfumature, ombre o artefatti grigi --ar 4:3 --v 6 --style raw --s 400`,
    },
    {
      posizione: 'Capitolo Finale / Appendice — Elemento Motivazionale',
      scopo:     'Chiusura emotiva e call to action visiva',
      prompt:    `Inspirational minimal illustration of a person achieving their goal related to "${kw[2] || cat}", silhouette style, uplifting mood, warm gradient background transitioning from dark to light, symbolic of transformation and success, suitable for book interior. OUTPUT PURAMENTE VETTORIALE, linee nere ad alto contrasto spesse almeno 2px, sfondo bianco puro #FFFFFF, assenza totale di sfumature, ombre o artefatti grigi --ar 3:2 --v 6 --style raw --s 600`,
    },
  ];

  return illustrazioni.map((ill, i) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ILLUSTRAZIONE INTERNA ${i + 1}/3 — ${ill.posizione}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📌 Scopo: ${ill.scopo}

  🎨 PROMPT MIDJOURNEY:
  ${ill.prompt}

  💡 Note di stampa:
  • Convertire in scala di grigi se il libro è B&W
  • Risoluzione: 300 DPI per stampa
  • Formato: PNG con sfondo bianco per massima compatibilità
`.trim()).join('\n\n');
}

// ─────────────────────────────────────────────────────────────
//  FUNZIONE PRINCIPALE
// ─────────────────────────────────────────────────────────────

function run(scoutResult) {
  const header = `
╔══════════════════════════════════════════════════════════════╗
║   🎨 AGENTE CREATIVO — PROMPT GRAFICI KDP                    ║
║   Libro: "${scoutResult.titolo}"
║   Generato: ${new Date().toLocaleString('it-IT')}
╚══════════════════════════════════════════════════════════════╝

`.trim();

  const coverPrompt       = generaPromptCopertina(scoutResult);
  const illustrazioniText = generaPromptIllustrazioni(scoutResult);

  const separator = '\n\n' + '═'.repeat(65) + '\n\n';

  const testo = [
    header,
    separator,
    '## SEZIONE 1: PROMPT COPERTINA FRONTALE',
    separator,
    coverPrompt,
    separator,
    '## SEZIONE 2: PROMPT ILLUSTRAZIONI INTERNE',
    separator,
    illustrazioniText,
    separator,
    `## NOTE FINALI
    
Per risultati ottimali con Midjourney:
1. Accedi a midjourney.com o Discord
2. Usa /imagine e incolla il prompt
3. Genera 4 varianti (U1-U4 per upscale)
4. Seleziona la migliore e usa V per variazioni
5. Scarica in alta risoluzione (PNG)

Per DALL-E 3 (ChatGPT Plus):
1. Apri ChatGPT con DALL-E attivo
2. Incolla il prompt DALL-E sopra
3. Genera e scarica l'immagine
4. Apri in Canva o Photoshop per aggiungere il testo del titolo

📐 Strumenti consigliati per composizione finale:
• Canva Pro → template KDP book cover
• Adobe InDesign → layout professionale
• BookBolt.io → strumento specifico KDP
• GIMP (gratuito) → editing immagini

🎯 Obiettivo: copertina che converta al 3%+ di CTR su Amazon`,
  ].join('\n');

  return { testo };
}

module.exports = { run };
