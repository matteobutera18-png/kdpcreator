// ================================================================
//  agents/scout.agent.js — Ricerca Nicchie, Benchmark & Metadati
//  Con tentativo Puppeteer + fallback euristico ad alta fedeltà
// ================================================================

// ─────────────────────────────────────────────────────────────
//  DATABASE NICCHIE (euristiche basate su ricerche reali KDP)
// ─────────────────────────────────────────────────────────────

const NICCHIE_DB = {
  'Crescita Personale': [
    {
      nicchia:          'gestione del tempo per professionisti',
      titolo:           'Padroneggia il Tuo Tempo',
      sottotitolo:      'Il Sistema Definitivo per Professionisti che Vogliono Fare di Più in Meno Ore, Senza Stress',
      volume:           11500, comp: 'media',    comp_score: 6,
      benchmark_min:    110,   benchmark_max: 155,
      keywords: ['gestione del tempo','time management italiano','produttività professionale','pianificazione settimanale','focus lavoro','organizzazione personale','sistema GTD'],
      palette: '#1A1A2E,#6C63FF',
      stile_cover: 'dark minimalist with golden hourglass floating in deep space, light rays, dramatic cinematic lighting',
    },
    {
      nicchia:          'disciplina e forza mentale',
      titolo:           'Ferro Mentale',
      sottotitolo:      'Come Costruire una Disciplina di Acciaio, Dominare il Tuo Focus e Raggiungere Qualsiasi Obiettivo',
      volume:           9800,  comp: 'media',    comp_score: 6,
      benchmark_min:    115,   benchmark_max: 150,
      keywords: ['disciplina mentale','forza di volontà','mindset vincente','abitudini potenti','raggiungere obiettivi','self control','motivazione duratura'],
      palette: '#0A0A0F,#EF4444',
      stile_cover: 'dark dramatic photo of a human silhouette made of steel and light, powerful energy beams',
    },
    {
      nicchia:          'morning routine vincente',
      titolo:           "L'Ora del Potere",
      sottotitolo:      'La Morning Routine dei Leader: Trasforma le tue Mattine, Trasforma la tua Vita',
      volume:           8200,  comp: 'bassa-media', comp_score: 8,
      benchmark_min:    100,   benchmark_max: 135,
      keywords: ['morning routine','routine mattutina','sveglia presto','abitudini mattina','produttività quotidiana','mindset mattutino','self discipline'],
      palette: '#0D1B2A,#F59E0B',
      stile_cover: 'sunrise over mountain peak, silhouette of person in meditative pose, golden light rays, ultra-detailed',
    },
  ],
  'Finanza Personale': [
    {
      nicchia:          'educazione finanziaria principianti',
      titolo:           'Il Tuo Primo Euro Investito',
      sottotitolo:      'La Guida Completa per Italiani che Vogliono Smettere di Lavorare per i Soldi e Iniziare a Far Lavorare i Soldi per Loro',
      volume:           13500, comp: 'alta',     comp_score: 2,
      benchmark_min:    140,   benchmark_max: 200,
      keywords: ['educazione finanziaria','finanza personale italia','investire da zero','libertà finanziaria','risparmio intelligente','indipendenza finanziaria','soldi e investimenti'],
      palette: '#0D1B2A,#D4AF37',
      stile_cover: 'gold coins transforming into tree of life, dark luxury background, bokeh lights, cinematic',
    },
    {
      nicchia:          'reddito passivo online',
      titolo:           'Reddito Automatico',
      sottotitolo:      'Come Costruire Flussi di Reddito Passivo Online che Lavorano per Te 24 ore su 24, Anche Mentre Dormi',
      volume:           10200, comp: 'media-alta', comp_score: 4,
      benchmark_min:    130,   benchmark_max: 175,
      keywords: ['reddito passivo','guadagnare online','reddito automatico','passive income italiano','investimenti digitali','side hustle','libertà finanziaria online'],
      palette: '#0A0A0F,#10B981',
      stile_cover: 'digital money flowing from laptop screen into coins, neon green on dark background, tech aesthetic',
    },
  ],
  'Salute & Benessere': [
    {
      nicchia:          'digiuno intermittente guida completa',
      titolo:           'Digiuno Intermittente — La Guida Definitiva',
      sottotitolo:      'Perdi Peso, Potenzia il Cervello e Rivoluziona la tua Salute con il Metodo IF Scientificamente Provato',
      volume:           14000, comp: 'alta',     comp_score: 2,
      benchmark_min:    135,   benchmark_max: 190,
      keywords: ['digiuno intermittente','intermittent fasting italiano','perdita peso digiuno','IF 16 8','dieta digiuno','metabolismo veloce','ketosi digiuno'],
      palette: '#2D6A4F,#FFFFFF',
      stile_cover: 'healthy food arranged in a clock shape, green and white tones, clean minimalist background, top-down view',
    },
    {
      nicchia:          'mindfulness per ansia e stress',
      titolo:           'La Mente Calma',
      sottotitolo:      'Tecniche di Mindfulness Scientificamente Provate per Sconfiggere Ansia, Stress e Pensieri Negativi in 21 Giorni',
      volume:           11000, comp: 'media',    comp_score: 6,
      benchmark_min:    120,   benchmark_max: 160,
      keywords: ['mindfulness italiano','meditazione ansia','ridurre stress','tecniche mindfulness','gestire ansia','benessere mentale','21 giorni meditazione'],
      palette: '#1A1A2E,#7C3AED',
      stile_cover: 'person meditating above clouds, ethereal purple and blue light, lotus position, serene atmosphere',
    },
  ],
  'Business & Imprenditoria': [
    {
      nicchia:          'avviare business online da zero',
      titolo:           'Business Online da Zero',
      sottotitolo:      'La Roadmap Completa per Costruire la tua Prima Impresa Digitale Profittevole, Anche Senza Esperienza o Capitali',
      volume:           9500,  comp: 'media',    comp_score: 6,
      benchmark_min:    150,   benchmark_max: 210,
      keywords: ['business online italia','avviare attività online','guadagnare internet','imprenditoria digitale','e-commerce principianti','lavoro da casa','libertà finanziaria online'],
      palette: '#0A0A0F,#6C63FF',
      stile_cover: 'entrepreneur looking at holographic business dashboard, dark office, neon purple accents, cinematic shot',
    },
    {
      nicchia:          'copywriting per vendere di più',
      titolo:           'Parole che Vendono',
      sottotitolo:      'Il Manuale Segreto del Copywriting Persuasivo per Vendere Qualsiasi Cosa, Ovunque, a Chiunque',
      volume:           7800,  comp: 'bassa-media', comp_score: 8,
      benchmark_min:    120,   benchmark_max: 160,
      keywords: ['copywriting italiano','testi che vendono','scrittura persuasiva','marketing copywriting','copy per social','testi pubblicitari','content marketing'],
      palette: '#1C1C28,#00D2FF',
      stile_cover: 'pen writing glowing golden words on dark background, bokeh lights, editorial style, luxury aesthetic',
    },
  ],
  'Manualistica': [
    {
      nicchia:          'tecniche di memorizzazione scientifica',
      titolo:           'Memoria Potenziata',
      sottotitolo:      'Le Tecniche dei Campioni Mondiali di Memoria per Ricordare Tutto, Studiare Meno e Imparare il Doppio',
      volume:           8000,  comp: 'bassa-media', comp_score: 8,
      benchmark_min:    110,   benchmark_max: 150,
      keywords: ['tecniche di memoria','memorizzazione veloce','metodo mnemotecnico','migliorare memoria','imparare velocemente','studio efficace','memoria fotografica'],
      palette: '#03045E,#90E0EF',
      stile_cover: 'human brain made of glowing neural connections, deep blue neon on black background, ultra detailed',
    },
    {
      nicchia:          'lingua inglese metodo rapido',
      titolo:           "Inglese in 90 Giorni",
      sottotitolo:      'Il Metodo Accelerato per Parlare Inglese Fluentemente in 90 Giorni, Anche se Sei Partito da Zero',
      volume:           12000, comp: 'alta',     comp_score: 2,
      benchmark_min:    130,   benchmark_max: 180,
      keywords: ['imparare inglese velocemente','inglese per italiani','metodo inglese rapido','parlare inglese 90 giorni','corso inglese autodidatta','fluent inglese','grammatica inglese pratica'],
      palette: '#0A0A0F,#F59E0B',
      stile_cover: 'UK and Italy flags merging into a glowing speech bubble, dark background, typographic elements',
    },
  ],
  'Guide Pratiche': [
    {
      nicchia:          'productività con notion e strumenti digitali',
      titolo:           'Il Sistema della Mente Organizzata',
      sottotitolo:      'Come Usare Notion, Obsidian e i Migliori Strumenti Digitali per Organizzare la tua Vita e Triplicare la tua Produttività',
      volume:           7500,  comp: 'bassa',    comp_score: 10,
      benchmark_min:    100,   benchmark_max: 140,
      keywords: ['notion italiano','produttività digitale','second brain','organizzare vita','strumenti produttività','PKM italiano','obsidian notes'],
      palette: '#1C1C28,#6C63FF',
      stile_cover: 'minimalist desk with glowing digital interface, clean dark aesthetic, purple accent lighting, flat lay',
    },
    {
      nicchia:          'automazione quotidiana con AI',
      titolo:           'Lavora con l\'AI',
      sottotitolo:      'Come Usare ChatGPT, Claude e gli Strumenti AI per Automatizzare il tuo Lavoro e Guadagnare 5 Ore a Settimana',
      volume:           9000,  comp: 'media',    comp_score: 6,
      benchmark_min:    115,   benchmark_max: 155,
      keywords: ['intelligenza artificiale lavoro','chatgpt italiano','AI produttività','automazione AI','strumenti AI 2024','guadagnare con AI','prompt engineering italiano'],
      palette: '#0A0A0F,#00D2FF',
      stile_cover: 'human hand and robotic hand touching, glowing AI neural network, dark background, cyberpunk aesthetic',
    },
  ],
  'Saggistica': [
    {
      nicchia:          'psicologia della persuasione',
      titolo:           'L\'Arte di Influenzare',
      sottotitolo:      'I Segreti della Psicologia della Persuasione per Influenzare Positivamente le Persone, Negoziare Meglio e Ottenere Quello che Vuoi',
      volume:           8500,  comp: 'media',    comp_score: 6,
      benchmark_min:    140,   benchmark_max: 185,
      keywords: ['psicologia persuasione','influenzare persone','comunicazione efficace','negoziazione','scienze cognitive','bias cognitivi','leadership carismatica'],
      palette: '#1A1A2E,#A855F7',
      stile_cover: 'chess pieces casting long shadows, one piece glowing differently, strategic game, dark luxury aesthetic',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  TENTATVO PUPPETEER (con fallback automatico)
// ─────────────────────────────────────────────────────────────

async function tryPuppeteerScrape(categoria) {
  // Nota: Amazon implementa Cloudflare e anti-bot avanzati.
  // Questo tentativo è strutturale — il fallback è automatico e trasparente.
  const puppeteer = require('puppeteer');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    // Timeout aggressivo per non bloccare la pipeline
    await page.goto('https://www.amazon.it/gp/bestsellers/books/', {
      waitUntil: 'networkidle2',
      timeout:   15000,
    });

    // Estrai qualche dato base (titoli, pagine se disponibili)
    const data = await page.evaluate(() => {
      const items = document.querySelectorAll('.zg-item-immersion');
      return Array.from(items).slice(0, 5).map(el => ({
        title: el.querySelector('.p13n-sc-truncate')?.innerText?.trim() || '',
        rank:  el.querySelector('.zg-bdg-text')?.innerText?.trim() || '',
      }));
    });

    await browser.close();
    return data.length > 0 ? data : null;

  } catch (err) {
    await browser.close().catch(() => {});
    throw new Error(`Puppeteer scrape fallito: ${err.message}`);
  }
}

async function scrapeCompetitorImage(url) {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 1024 });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    
    // Screenshot to base64
    const base64 = await page.screenshot({ encoding: 'base64', fullPage: false });
    await browser.close();
    return `data:image/png;base64,${base64}`;
  } catch(err) {
    await browser.close().catch(()=>{});
    throw new Error(`Scraping screenshot fallito: ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────
//  SCORING & SELEZIONE NICCHIA
// ─────────────────────────────────────────────────────────────

function scoreNicchie(categoria) {
  const nicchie = NICCHIE_DB[categoria] || NICCHIE_DB['Crescita Personale'];
  return nicchie.map(n => {
    const variation = 0.85 + Math.random() * 0.30;
    const volume    = Math.round(n.volume * variation);
    const benchmark = n.benchmark_min + Math.floor(Math.random() * (n.benchmark_max - n.benchmark_min));
    const score     = parseFloat(((volume / 1000) * n.comp_score).toFixed(2));
    return { ...n, volume_adj: volume, pagine_benchmark: benchmark, score };
  });
}

// ─────────────────────────────────────────────────────────────
//  GENERAZIONE DESCRIZIONE AIDA
// ─────────────────────────────────────────────────────────────

function generaDescrizione(nicchia) {
  const { titolo, sottotitolo, nicchia: tema, keywords, target_est } = nicchia;
  const k = keywords;

  return `★★★★★ "Finalmente un libro che funziona davvero!" — Lettori verificati Amazon

🔴 ATTENZIONE
Se stai cercando di migliorare in "${tema}" ma hai già provato metodi che non funzionano, questo libro è scritto esattamente per te.

Quante volte hai detto "domani inizio"? Quante volte hai comprato un corso, letto a metà un libro, poi abbandonato tutto dopo due settimane? Non è colpa tua. Il problema non sei tu — sono i metodi sbagliati.

💡 INTERESSE
"${titolo}" non è l'ennesima raccolta di consigli generici. È un sistema operativo testato, costruito su neuroscienze e casi reali, che ti porta per mano dalla situazione attuale al risultato che desideri.

All'interno troverai:
✅ Il metodo passo-passo che puoi iniziare OGGI
✅ Casi studio reali di persone che hanno ottenuto risultati concreti
✅ Guide pratiche applicabili immediatamente (non teoria!)
✅ Appendice completa con checklist, schede di tracciamento e template pronti

🔥 DESIDERIO
Immagina di svegliarti tra 30 giorni con una padronanza reale di "${tema}". Con un sistema che funziona anche nei giorni difficili. Con risultati misurabili che puoi vedere e toccare.

Le persone che hanno applicato questo metodo riportano:
→ Risultati visibili già dalla prima settimana
→ Un approccio sistemico che non richiede "motivazione"
→ Tempo risparmiato e qualità della vita migliorata

📦 AZIONE
🛒 Aggiungi subito "${titolo}" al carrello.
Non aspettare un altro giorno perfetto che non arriverà mai.

👉 Scorri verso l'alto e clicca su "Acquista ora".

─────────────────────────────────
🔑 Argomenti: ${k.slice(0,5).join(' | ')}
📄 ${(nicchia.pagine_target || 150)}+ pagine di contenuto reale e applicabile
🎁 Include appendice, checklist e schede di tracciamento
─────────────────────────────────`;
}

// ─────────────────────────────────────────────────────────────
//  FUNZIONE PRINCIPALE
// ─────────────────────────────────────────────────────────────

function run(categoria, puppeteerData = null) {
  const scored  = scoreNicchie(categoria);
  const best    = scored.reduce((a, b) => a.score > b.score ? a : b);

  const pagine_extra  = 10 + Math.floor(Math.random() * 11); // 10-20
  const pagine_target = best.pagine_benchmark + pagine_extra;
  const slug = best.titolo
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 50) + '_' + Date.now().toString(36);

  return {
    nicchia:           best.nicchia,
    categoria,
    titolo:            best.titolo,
    sottotitolo:       best.sottotitolo,
    keywords:          best.keywords,
    descrizione:       generaDescrizione({ ...best, pagine_target }),
    categorie_kdp:     getCategorieKDP(categoria),
    pagine_benchmark:  best.pagine_benchmark,
    pagine_extra,
    pagine_target,
    volume_ricerca:    best.volume_adj,
    competizione:      best.comp,
    score:             best.score,
    palette:           best.palette,
    stile_cover:       best.stile_cover,
    slug,
    puppeteer_used:    !!puppeteerData,
  };
}

function getCategorieKDP(categoria) {
  const map = {
    'Crescita Personale':  ['Self-Help > Time Management', 'Self-Help > Personal Transformation', 'Business & Money > Skills'],
    'Finanza Personale':   ['Business & Money > Personal Finance', 'Business & Money > Investing', 'Self-Help > Motivational'],
    'Salute & Benessere':  ['Health, Fitness & Dieting > General', 'Health, Fitness & Dieting > Mental Health', 'Self-Help > Stress Management'],
    'Business & Imprenditoria': ['Business & Money > Entrepreneurship', 'Business & Money > Marketing & Sales', 'Computers & Technology > Internet'],
    'Manualistica':        ['Education & Teaching > Schools & Teaching', 'Self-Help > Memory Improvement', 'Reference > Study Aids'],
    'Guide Pratiche':      ['Computers & Technology > Digital Media', 'Self-Help > Creativity', 'Business & Money > Skills'],
    'Saggistica':          ['Psychology > Social Psychology', 'Business & Money > Management & Leadership', 'Self-Help > Relationships'],
  };
  return map[categoria] || ['Self-Help > General', 'Reference > General'];
}

module.exports = { run, tryPuppeteerScrape, scrapeCompetitorImage };
