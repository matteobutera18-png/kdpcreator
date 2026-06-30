// ================================================================
//  routes/agents.routes.js — Pipeline Multi-Agente + SSE Stream
// ================================================================

const express      = require('express');
const router       = express.Router();
const { v4: uuidv4 } = require('uuid');

const { requireAuth }  = require('../middleware/auth');
const orchestrator     = require('../agents/orchestrator');
const activityAgent    = require('../agents/activity.agent');

// Mappa dei job attivi: jobId → EventEmitter
const activeJobs = new Map();

// ── POST /api/agents/generate — Avvia pipeline ───────────────
router.post('/generate', requireAuth, async (req, res) => {
  try {
    console.log("Dati ricevuti per la generazione:", JSON.stringify(req.body));
    const { categoria, activityMix, benchmark } = req.body;
    
    // DEFENSIVE CODING: fallback per competitors/benchmark
    const competitors = req.body.competitors || [];
    const selectedCompetitor = req.body.selectedCompetitor || benchmark || null;
    
    if (competitors && Array.isArray(competitors)) {
      // Esempio di utilizzo (preventivo) per evitare crash
      competitors.map(c => c);
    }

    if (!categoria) {
      return res.status(400).json({ error: 'Categoria richiesta.' });
    }

    const jobId = uuidv4();

    // Registra il job come "in attesa"
    activeJobs.set(jobId, { status: 'pending', categoria, activityMix, benchmark, createdAt: new Date().toISOString() });

    // Avvia la pipeline in background (non-blocking)
    orchestrator.runPipeline(jobId, categoria, activeJobs).catch(err => {
      const job = activeJobs.get(jobId);
      if (job) job.status = 'error';
      console.error(`❌ Pipeline ${jobId} fallita in background:`, err.message);
    });

    return res.json({
      jobId,
      message: `Pipeline avviata per categoria: ${categoria}`,
      streamUrl: `/api/agents/stream/${jobId}`,
    });
  } catch (err) {
    console.error(`❌ Errore sincrono pipeline:`, err);
    return res.status(500).json({ error: err.message || 'Errore interno del server durante l\'avvio della generazione.' });
  }
});

// ── GET /api/agents/stream/:jobId — SSE Real-Time Updates ────
router.get('/stream/:jobId', requireAuth, (req, res) => {
  const { jobId } = req.params;

  // Header SSE
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (type, data) => {
    try {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    } catch {}
  };

  // Registra il client SSE per questo job
  const job = activeJobs.get(jobId);
  if (!job) {
    send('error', { message: 'Job non trovato.' });
    return res.end();
  }

  // Salva il riferimento alla funzione send nel job
  if (!job.clients) job.clients = [];
  job.clients.push(send);

  // Invia heartbeat ogni 20 secondi per tenere viva la connessione
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch { clearInterval(heartbeat); }
  }, 20000);

  // Cleanup alla disconnessione del client
  req.on('close', () => {
    clearInterval(heartbeat);
    if (job.clients) {
      job.clients = job.clients.filter(c => c !== send);
    }
  });
});

// ── GET /api/agents/jobs — Lista job attivi ──────────────────
router.get('/jobs', requireAuth, (req, res) => {
  const jobs = [];
  activeJobs.forEach((job, id) => {
    jobs.push({ id, status: job.status, categoria: job.categoria, createdAt: job.createdAt });
  });
  res.json({ jobs });
});

// ── POST /api/agents/preview-puzzle — Anteprima Live ────────
router.post('/preview-puzzle', requireAuth, (req, res) => {
  try {
    const { type, options } = req.body;
    let result = null;

    if (type === 'sudoku') {
       result = activityAgent.generateSudoku(options.diff || 'Medio');
    } else if (type === 'maze') {
       result = { puzzle: activityAgent.generateMaze(20, 20) };
    } else if (type === 'wordsearch') {
       let words = options.words ? options.words.split(',').map(s=>s.trim()).filter(s=>s.length>0) : ['MIX','PUZZLE','TEST'];
       result = activityAgent.generateWordSearch(words, 15);
    } else {
       return res.status(400).json({ error: 'Tipo di puzzle sconosciuto.' });
    }

    res.json(result);
  } catch (err) {
    console.error('Errore preview puzzle:', err);
    res.status(500).json({ error: 'Errore durante la generazione dell\'anteprima.' });
  }
});

// ── POST /api/agents/analyze-market — Analisi Competitor ────
router.post('/analyze-market', requireAuth, (req, res) => {
  try {
    const { categoria, mix } = req.body;
    
    // Simulazione di scraping da Amazon KDP o database interno
    const competitors = [
      {
        titolo: `Il Grande Libro di ${categoria}`,
        cover_url: 'https://via.placeholder.com/60x90/FF6B6B/FFFFFF?text=Top1',
        prezzo: '9.99',
        pagine: 120,
        vendite_mensili: 450,
        punti_deboli: 'Design interno caotico, font troppo piccoli'
      },
      {
        titolo: `Maxi Raccolta ${categoria === 'Coloring Books' ? 'Activity' : categoria}`,
        cover_url: 'https://via.placeholder.com/60x90/4ECDC4/FFFFFF?text=Top2',
        prezzo: '7.99',
        pagine: 90,
        vendite_mensili: 320,
        punti_deboli: 'Copertina spenta, no soluzioni in coda'
      },
      {
        titolo: `Sfida la Mente: ${categoria}`,
        cover_url: 'https://via.placeholder.com/60x90/FFE66D/000000?text=Top3',
        prezzo: '11.90',
        pagine: 150,
        vendite_mensili: 210,
        punti_deboli: 'Prezzo troppo alto, recensioni su carta sottile'
      },
      {
        titolo: `Activity & Relax per Adulti`,
        cover_url: 'https://via.placeholder.com/60x90/1A535C/FFFFFF?text=Top4',
        prezzo: '8.50',
        pagine: 100,
        vendite_mensili: 180,
        punti_deboli: 'Puzzle troppo semplici e ripetitivi'
      },
      {
        titolo: `Logica Estrema Volume 1`,
        cover_url: 'https://via.placeholder.com/60x90/000000/FFFFFF?text=Top5',
        prezzo: '6.99',
        pagine: 80,
        vendite_mensili: 150,
        punti_deboli: 'Assenza di illustrazioni o cornici decorative'
      }
    ];
    
    res.json({ competitors });
  } catch (err) {
    console.error('Errore analyze-market:', err);
    res.status(500).json({ error: 'Errore durante l\'analisi del mercato.' });
  }
});

module.exports = router;
