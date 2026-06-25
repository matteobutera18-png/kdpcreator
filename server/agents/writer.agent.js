// ================================================================
//  agents/writer.agent.js — Ghostwriter KDP Universale via Pollinations AI
//  Logica Anti-Repetition e generazione dinamica per Saggistica
// ================================================================

// ─────────────────────────────────────────────────────────────
//  FORMATTAZIONE KDP 6x9
// ─────────────────────────────────────────────────────────────

const KDP = {
  caratteriPerRiga: 65,
  righePerPagina: 33,
};

function centra(testo, larghezza = KDP.caratteriPerRiga) {
  if (testo.length >= larghezza) return testo;
  const pad = Math.floor((larghezza - testo.length) / 2);
  return ' '.repeat(pad) + testo;
}

function aCapoGiustificato(testo, larghezza = KDP.caratteriPerRiga) {
  const parole = testo.split(' ');
  const righe = [];
  let rigaCorrente = [];
  let lenCorrente = 0;

  for (const parola of parole) {
    if (lenCorrente + parola.length + rigaCorrente.length <= larghezza) {
      rigaCorrente.push(parola);
      lenCorrente += parola.length;
    } else {
      if (rigaCorrente.length > 0) righe.push(rigaCorrente.join(' '));
      rigaCorrente = [parola];
      lenCorrente = parola.length;
    }
  }
  if (rigaCorrente.length > 0) righe.push(rigaCorrente.join(' '));
  return righe.join('\n');
}

function paginaVuota() {
  return '\n'.repeat(5);
}

function numeroPagina(n) {
  return centra(`— ${n} —`);
}

function separatoreCapitolo() {
  return '\n' + '─'.repeat(KDP.caratteriPerRiga) + '\n';
}

function stimaPagineFisiche(testoFormattato) {
  const parole = testoFormattato.split(/\s+/).filter(p => p.length > 0).length;
  // Per un libro 6x9 pollici, stimiamo circa 250 parole per pagina reale
  return Math.max(1, Math.ceil(parole / 250)) + 8;
}

// ─────────────────────────────────────────────────────────────
//  GENERAZIONE OUTLINE UNIVERSALE
// ─────────────────────────────────────────────────────────────

function generaOutline(scoutResult) {
  return [
    { titolo: "Frontespizio", tipo: "servizio" },
    { titolo: "Copyright", tipo: "servizio" },
    { titolo: "Indice", tipo: "servizio" },
    { titolo: "Introduzione", tipo: "testo" },
    { titolo: "Capitolo 1: I Miti da Sfatare", tipo: "testo" },
    { titolo: "Capitolo 2: Le Fondamenta del Metodo", tipo: "testo" },
    { titolo: "Capitolo 3: L'Esecuzione Pratica", tipo: "testo" },
    { titolo: "Capitolo 4: Casi Studio ed Esempi Reali", tipo: "testo" }, 
    { titolo: "Capitolo 5: Tecniche Avanzate per l'Eccellenza", tipo: "testo" },
    { titolo: "Conclusione", tipo: "testo" },
    { titolo: "Appendice: Strumenti e Checklist", tipo: "testo" },
  ];
}

// ─────────────────────────────────────────────────────────────
//  CHIAMATA AI REALE A POLLINATIONS (Con regola anti-loop)
// ─────────────────────────────────────────────────────────────

async function generaCapitoloAI(titolo, nicchia, contestoPrecedente) {
  // Costruzione di un Prompt rigoroso per Saggistica Universale
  const prompt = `
Agisci come un autore bestseller del New York Times di saggistica professionale.
Devi scrivere il capitolo intitolato "${titolo}" per un libro sulla nicchia: "${nicchia}".
REGOLE ASSOLUTE:
1. NON RIPETERE MAI concetti già espressi nei capitoli precedenti. (I capitoli precedenti parlavano di: ${contestoPrecedente.slice(-200) || 'Niente, questo è il primo capitolo'}).
2. Scrivi in modo estremamente fluido, senza introdurre con frasi come "In questo capitolo vedremo...".
3. Fornisci un testo lungo, denso, e di enorme valore pratico (almeno 800 parole).
4. Nessun testo di riempimento (Lorem Ipsum) e nessuna ripetizione di blocchi (Anti-repetition check attivo).
5. Scrivi solo il contenuto del capitolo (nessun titolo, nessuna nota introduttiva tua).
Rispondi esclusivamente con il testo del capitolo in italiano.
  `.trim();

  try {
    const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
    if (!response.ok) throw new Error('API Error');
    let text = await response.text();
    return text.trim();
  } catch (err) {
    console.error(`[Writer Agent] Errore AI per ${titolo}:`, err);
    // Fallback di sicurezza in caso di API down
    return `Questo è un contenuto autogenerato di backup per il capitolo: ${titolo}. L'API di scrittura non era raggiungibile al momento della stesura. Assicurati di ampliare questi concetti applicando le strategie descritte nel manuale operativo. La nicchia in esame (${nicchia}) richiede un'approfondita disamina per fornire vero valore ai lettori.`;
  }
}

// ─────────────────────────────────────────────────────────────
//  ESECUZIONE AGENTE
// ─────────────────────────────────────────────────────────────

// Siccome abbiamo l'API reale, l'agente ora è asincrono
async function run(scoutResult, updateProgress) {
  const outline = generaOutline(scoutResult);
  let testo = '';
  let pagina = 1;
  let contestoProgressivo = ''; // Usato per evitare ripetizioni nell'AI

  for (let i = 0; i < outline.length; i++) {
    const cap = outline[i];
    
    // Aggiornamento interfaccia SSE (tramite callback)
    if (updateProgress) {
       updateProgress(`✍️ Scrittura in corso: ${cap.titolo}...`, Math.round((i / outline.length) * 100));
    }

    testo += `\n[Intestazione KDP - ${scoutResult.titolo}]\n\n`;
    testo += centra(cap.titolo.toUpperCase()) + '\n';
    testo += separatoreCapitolo();
    
    let contenuto = "";
    if (cap.tipo === "servizio") {
      contenuto = `[CONTENUTO DI SERVIZIO: ${cap.titolo}]\n(Questa pagina verrà compilata in fase di impaginazione finale con i dati dell'autore e dell'editore).`;
    } else {
      // Chiamata vera all'API
      contenuto = await generaCapitoloAI(cap.titolo, scoutResult.nicchia, contestoProgressivo);
      // Aggiorniamo il contesto per non far ripetere l'AI (teniamo un mini riassunto delle ultime parole)
      contestoProgressivo = cap.titolo + ". " + contenuto.slice(0, 150) + "... ";
    }

    testo += aCapoGiustificato(contenuto) + '\n\n';
    testo += paginaVuota();
    testo += numeroPagina(pagina) + '\n';
    testo += '\n[Interruzione di Pagina]\n\n';
    
    // Avanzamento pagine (Stima approssimativa)
    pagina += cap.tipo === 'servizio' ? 1 : Math.max(2, Math.floor(contenuto.length / 1500) + 1);
  }

  const paroleTotali = testo.split(/\s+/).filter(p => p.length > 0).length;
  const pagineStimate = Math.max(stimaPagineFisiche(testo), scoutResult.pagine_target || 50);

  return {
    testo: testo,
    pagineStimate,
    parole: paroleTotali,
    outline: outline
  };
}

module.exports = { run };
