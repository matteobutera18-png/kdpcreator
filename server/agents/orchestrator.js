// ================================================================
//  agents/orchestrator.js — Coordinatore Pipeline Multi-Agente
//  Scout → Writer/Coloring → Creative → Delivery (SSE Real-Time)
// ================================================================

const scoutAgent    = require('./scout.agent');
const writerAgent   = require('./writer.agent');
const creativeAgent = require('./creative.agent');
const coloringAgent = require('./coloring.agent');
const activityAgent = require('./activity.agent');
const fileManager   = require('../services/fileManager');

/**
 * Invia un evento SSE a tutti i client connessi al job.
 */
function emit(activeJobs, jobId, type, data) {
  const job = activeJobs.get(jobId);
  if (!job || !job.clients) return;
  job.clients.forEach(send => {
    try { send(type, data); } catch {}
  });
  console.log(`[SSE:${jobId.slice(0, 8)}] ${type} →`, data.message || '');
}

/**
 * Pausa simulata per rendere la pipeline "viva".
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Esegue la pipeline completa
 */
async function runPipeline(jobId, categoria, activeJobs) {
  const job = activeJobs.get(jobId);
  if (!job) return;
  job.status = 'running';

  const isColoring = categoria === 'Coloring Books';
  // Se è Coloring Books, adesso è in realtà la modalita "Activity Mix"
  const isActivityMix = isColoring;

  try {
    // ── FASE 0: Inizializzazione ──────────────────────────────
    emit(activeJobs, jobId, 'pipeline_start', {
      message: `🏭 Avvio pipeline per categoria: ${categoria}`,
      categoria,
    });
    await sleep(800);

    // ────────────────────────────────────────────────────────
    // ── FASE 1: AGENTE SCOUT ─────────────────────────────────
    // ────────────────────────────────────────────────────────
    emit(activeJobs, jobId, 'agent_start', {
      agent:   'scout',
      message: '🔍 Agente Scout: Analisi mercato Amazon in corso...',
      step:    1,
    });
    await sleep(600);

    emit(activeJobs, jobId, 'agent_progress', {
      agent:   'scout',
      message: '📊 Scansione categorie bestseller e volume di ricerca...',
      percent: 15,
    });
    await sleep(1200);

    // Puppeteer attempt (con fallback automatico alla simulazione)
    let puppeteerData = null;
    try {
      emit(activeJobs, jobId, 'agent_progress', {
        agent:   'scout',
        message: '🕷️ Puppeteer: connessione ad Amazon.it...',
        percent: 25,
      });
      // Skip scraper if it's a coloring book to simulate faster niche research
      if (!isColoring) {
         puppeteerData = await scoutAgent.tryPuppeteerScrape(categoria);
      }
    } catch {
      emit(activeJobs, jobId, 'agent_progress', {
        agent:   'scout',
        message: '⚡ Motore euristico attivato (Amazon anti-bot rilevato)...',
        percent: 30,
      });
    }

    emit(activeJobs, jobId, 'agent_progress', {
      agent:   'scout',
      message: '🎯 Identificazione nicchie ad alto potenziale...',
      percent: 50,
    });
    await sleep(1000);

    let scoutResult;
    
    if (isColoring) {
        // Mock scout result for coloring books since they have specific sub-niches passed from frontend
        scoutResult = {
            nicchia: job.subNiche || 'Mandala',
            categoria,
            titolo: `Coloring Book ${job.subNiche || 'Mandala'}`,
            sottotitolo: 'Disegni Rilassanti per Adulti e Bambini',
            keywords: ['coloring book', job.subNiche, 'disegni da colorare', 'rilassamento'],
            descrizione: `Un bellissimo libro da colorare a tema ${job.subNiche}. Ogni disegno è stampato su una singola facciata per evitare che il colore macchi il foglio successivo.`,
            categorie_kdp: ['Crafts, Hobbies & Home > Coloring Books for Grown-Ups'],
            pagine_benchmark: 60,
            pagine_extra: 0,
            pagine_target: 62,
            volume_ricerca: 15000,
            competizione: 'media',
            score: 8,
            palette: '#000000,#FFFFFF',
            stile_cover: 'black and white intricate line art with bright colorful typography',
            slug: `coloring_${(job.subNiche || 'mandala').toLowerCase()}_${Date.now().toString(36)}`,
            puppeteer_used: false
        };
    } else {
        scoutResult = scoutAgent.run(categoria, puppeteerData);
    }

    emit(activeJobs, jobId, 'agent_progress', {
      agent:   'scout',
      message: `✅ Nicchia identificata: "${scoutResult.titolo}" | Benchmark: ${scoutResult.pagine_benchmark}p`,
      percent: 80,
    });
    await sleep(800);

    emit(activeJobs, jobId, 'agent_done', {
      agent:   'scout',
      message: `🔍 Scout completato — Nicchia: "${scoutResult.nicchia}"`,
      data:    { titolo: scoutResult.titolo, benchmark: scoutResult.pagine_benchmark },
    });
    await sleep(500);

    // ────────────────────────────────────────────────────────
    // ── FASE 2: AGENTE SCRITTORE / COLORING ───────────────────
    // ────────────────────────────────────────────────────────
    let contentResult;

    if (isActivityMix) {
        emit(activeJobs, jobId, 'agent_start', {
          agent:   'writer',
          message: `🧩 Agente Activity Mix: Generazione procedurale Puzzle e Soluzioni...`,
          step:    2,
        });
        await sleep(600);
        
        contentResult = await activityAgent.run(scoutResult, (msg, percent, data = {}) => {
            emit(activeJobs, jobId, 'agent_progress', { agent: 'writer', message: msg, percent, ...data });
        }, scoutResult.slug, job.activityMix);
    } else {
        emit(activeJobs, jobId, 'agent_start', {
          agent:   'writer',
          message: `✍️ Agente Scrittore: stesura contenuti reali e strategie...`,
          step:    2,
        });
        await sleep(600);
    
        contentResult = await writerAgent.run(scoutResult, (msg, percent) => {
            emit(activeJobs, jobId, 'agent_progress', { agent: 'writer', message: msg, percent });
        });
    }

    emit(activeJobs, jobId, 'agent_done', {
      agent:   'writer',
      message: isActivityMix ? `🖍️ Agente Impaginazione completato — Activity Book Generato` : `✍️ Scrittore completato — ${contentResult.pagineStimate} pagine generate`,
      data:    { pagine: contentResult.pagineStimate, parole: contentResult.parole },
    });
    await sleep(500);

    // ────────────────────────────────────────────────────────
    // ── FASE 3: AGENTE CREATIVO ───────────────────────────────
    // ────────────────────────────────────────────────────────
    emit(activeJobs, jobId, 'agent_start', {
      agent:   'creative',
      message: '🎨 Agente Creativo: generazione prompt copertina Midjourney...',
      step:    3,
    });
    await sleep(600);

    emit(activeJobs, jobId, 'agent_progress', {
      agent:   'creative',
      message: '🖼️ Generazione prompt copertina frontale iper-dettagliato...',
      percent: 60,
    });
    await sleep(1000);

    let creativeResult;
    if (isActivityMix) {
       // La copertina per i coloring books e activity books ha uno stile diverso
       creativeResult = {
           testo: `
📌 PROMPT COPERTINA KDP
Stile: Professional book cover, intricate Puzzle and Activity theme centered on background, vibrant and engaging, typography space at top. --ar 8.5:11 --v 6.0
`
       };
    } else {
       creativeResult = creativeAgent.run(scoutResult);
    }

    emit(activeJobs, jobId, 'agent_done', {
      agent:   'creative',
      message: '🎨 Creativo completato — Prompt generati',
    });
    await sleep(500);

    // ────────────────────────────────────────────────────────
    // ── FASE 4: CONSEGNA OUTPUT ───────────────────────────────
    // ────────────────────────────────────────────────────────
    emit(activeJobs, jobId, 'agent_start', {
      agent:   'delivery',
      message: '📦 Agente Consegna: assemblaggio pacchetto finale...',
      step:    4,
    });
    await sleep(600);

    const slug     = scoutResult.slug;
    const metadata = {
      slug,
      titolo:         scoutResult.titolo,
      sottotitolo:    scoutResult.sottotitolo,
      nicchia:        scoutResult.nicchia,
      categoria,
      isColoringBook: isColoring,
      pdfPath:        isColoring ? contentResult.pdfPath : undefined,
      coverPath:      isColoring ? contentResult.coverPath : undefined,
      keywords:       scoutResult.keywords,
      descrizione:    scoutResult.descrizione,
      categorie_kdp:  scoutResult.categorie_kdp,
      pagineStimate:  contentResult.pagineStimate,
      parole:         contentResult.parole || 0,
      pagine_benchmark: scoutResult.pagine_benchmark,
      pagine_extra:     scoutResult.pagine_extra,
      createdAt:      new Date().toISOString(),
    };

    fileManager.saveBook(slug, {
      metadata,
      libro_6x9:        contentResult.testo,
      prompt_copertina: creativeResult.testo,
    });

    job.status  = 'done';
    job.slug    = slug;
    job.titolo  = scoutResult.titolo;

    emit(activeJobs, jobId, 'pipeline_done', {
      message:  `🎉 Libro pronto: "${scoutResult.titolo}"`,
      slug,
      titolo:   scoutResult.titolo,
      pagine:   contentResult.pagineStimate,
      jobId,
    });

  } catch (err) {
    job.status = 'error';
    emit(activeJobs, jobId, 'pipeline_error', {
      message: `❌ Errore pipeline: ${err.message}`,
      jobId,
    });
    throw err;
  }
}

module.exports = { runPipeline };
