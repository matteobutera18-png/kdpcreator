// ================================================================
//  routes/agents.routes.js — Pipeline Multi-Agente + SSE Stream
// ================================================================

const express      = require('express');
const router       = express.Router();
const { v4: uuidv4 } = require('uuid');

const { requireAuth }  = require('../middleware/auth');
const orchestrator     = require('../agents/orchestrator');

// Mappa dei job attivi: jobId → EventEmitter
const activeJobs = new Map();

// ── POST /api/agents/generate — Avvia pipeline ───────────────
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { categoria, activityMix } = req.body;

    if (!categoria) {
      return res.status(400).json({ error: 'Categoria richiesta.' });
    }

    const jobId = uuidv4();

    // Registra il job come "in attesa"
    activeJobs.set(jobId, { status: 'pending', categoria, activityMix, createdAt: new Date().toISOString() });

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

module.exports = router;
