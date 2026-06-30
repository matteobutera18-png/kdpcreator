// ================================================================
//  js/views/dashboard.view.js — Schermata Principale e Generazione
// ================================================================

import { API } from '../api.js';
import { showToast } from '../components/toast.js';
import { createAgentStatusUI, resetAgentStatusUI } from '../components/agentStatus.js';

export function renderDashboard(root) {
  root.innerHTML = `
    <div class="top-nav">
      <div class="logo-text">KDP FACTORY</div>
      <div class="nav-buttons">
        <button class="icon-btn" id="btn-archive" title="Archivio Libri">📚</button>
      </div>
    </div>

    <!-- TABS -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <button class="btn-secondary" id="tab-gen" style="border-color: var(--accent-blue); color: var(--accent-blue);">🏭 Generatore Libri</button>
      <button class="btn-secondary" id="tab-seo">🔍 SEO Optimizer</button>
    </div>

    <!-- PANNELLO SEO OPTIMIZER -->
    <div id="panel-seo" class="glass-card" style="display: none; margin-bottom: 24px;">
      <h2 style="font-size: 1.1rem; margin-bottom: 16px;">Analisi Nicchie e Keyword KDP</h2>
      <div class="input-group">
        <label class="input-label">Inserisci la tua parola chiave principale</label>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="seo-keyword" class="input-field" placeholder="Es. Unicorni magici, finanza personale...">
          <button class="btn-primary" id="btn-seo-generate" style="width: auto; padding: 0 20px;">Analizza</button>
        </div>
      </div>
      
      <div id="seo-results" style="display: none; margin-top: 20px; animation: fadeIn 0.3s ease;">
        <h3 style="font-size: 0.9rem; color: var(--accent-blue); margin-bottom: 8px;">Top 7 Tag SEO ad alto volume</h3>
        <div id="seo-tags" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;"></div>
        
        <h3 style="font-size: 0.9rem; color: var(--accent-secondary); margin-bottom: 8px;">Descrizione Ottimizzata (HTML KDP)</h3>
        <div id="seo-desc" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; max-height: 200px; overflow-y: auto;"></div>
      </div>
    </div>

    <!-- PANNELLO GENERATORE LIBRI -->
    <div id="panel-gen">
      <div class="glass-card" style="margin-bottom: 24px;">
        <h2 style="font-size: 1.1rem; margin-bottom: 16px;">1. Seleziona Macro-Categoria</h2>
        
        <div class="category-pills" id="category-selector">
          <div class="pill active" data-cat="Crescita Personale">Crescita Personale</div>
          <div class="pill" data-cat="Finanza Personale">Finanza Personale</div>
          <div class="pill" data-cat="Salute & Benessere">Salute & Benessere</div>
          <div class="pill" data-cat="Business & Imprenditoria">Business & Imprenditoria</div>
          <div class="pill" data-cat="Manualistica">Manualistica</div>
          <div class="pill" data-cat="Guide Pratiche">Guide Pratiche</div>
          <div class="pill" data-cat="Coloring Books" style="border-color: var(--accent-blue); color: var(--accent-blue);">🎨 Libri da Colorare / Attività</div>
        </div>

        <!-- Sotto-Nicchia Activity / Puzzle Books (Slot Unica) -->
        <div id="activity-mix-options" style="display: none; margin-bottom: 20px; animation: fadeIn 0.3s ease; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
          <h3 style="color: var(--accent-blue); margin-bottom: 12px; font-size: 1.05rem;">🧩 Slot Unica Configurazione Puzzle</h3>
          
          <!-- SUDOKU -->
          <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
            <div style="flex: 0 0 120px;">
              <label class="input-label" style="margin-bottom: 4px;">Quantità Sudoku</label>
              <input type="number" id="mix-sudoku-qty" class="input-field" value="0" min="0" max="100" style="padding: 8px;">
            </div>
            <div style="flex: 1; display: flex; gap: 10px; align-items: flex-end;">
              <div style="flex: 1;">
                <label class="input-label" style="margin-bottom: 4px;">Difficoltà Sudoku</label>
                <select id="mix-sudoku-diff" class="input-field" style="padding: 8px;">
                  <option value="Facile">Facile</option>
                  <option value="Medio">Medio</option>
                  <option value="Difficile">Difficile</option>
                  <option value="Diabolico">Diabolico</option>
                </select>
              </div>
              <button class="btn-secondary btn-preview-puzzle" data-type="sudoku" style="padding: 8px 12px; height: 38px;">👁️</button>
            </div>
          </div>

          <!-- LABIRINTI -->
          <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
            <div style="flex: 0 0 120px;">
              <label class="input-label" style="margin-bottom: 4px;">Q.tà Labirinti</label>
              <input type="number" id="mix-maze-qty" class="input-field" value="0" min="0" max="100" style="padding: 8px;">
            </div>
            <div style="flex: 1; display: flex; gap: 10px; align-items: flex-end;">
              <div style="flex: 1;">
                <label class="input-label" style="margin-bottom: 4px;">Forma Labirinto</label>
                <select id="mix-maze-shape" class="input-field" style="padding: 8px;">
                  <option value="Quadrati">Quadrati Classici</option>
                  <option value="Circolari">Circolari</option>
                </select>
              </div>
              <button class="btn-secondary btn-preview-puzzle" data-type="maze" style="padding: 8px 12px; height: 38px;">👁️</button>
            </div>
          </div>

          <!-- CRUCIPUZZLE -->
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
            <div style="width: 120px;">
              <label class="input-label" style="margin-bottom: 4px;">Q.tà Crucipuzzle</label>
              <input type="number" id="mix-wordsearch-qty" class="input-field" value="0" min="0" max="100" style="padding: 8px;">
            </div>
            <div style="width: 100%; display: flex; gap: 10px; align-items: flex-start;">
              <div style="flex: 1;">
                <label class="input-label" style="margin-bottom: 4px;">Lista Parole (Separate da virgola)</label>
                <textarea id="mix-wordsearch-words" class="input-field" rows="3" placeholder="Es. mela, pera, banana, fragola, limone..." style="padding: 8px; resize: vertical;"></textarea>
              </div>
              <button class="btn-secondary btn-preview-puzzle" data-type="wordsearch" style="padding: 8px 12px; height: 38px; margin-top: 25px;">👁️</button>
            </div>
          </div>
          
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 12px;">
            <span style="color: var(--accent-blue);">ℹ INFO:</span> Il PDF generato includerà tutte le soluzioni in formato griglia alla fine del libro.
          </p>
          
          <!-- CALCOLATORE KDP -->
          <div style="margin-top: 15px; padding: 12px; background: rgba(0, 255, 136, 0.05); border: 1px dashed rgba(0, 255, 136, 0.3); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.9rem; color: var(--text-secondary);">Stima Pagine Totali:</span>
                <strong style="color: white; font-size: 1.1rem; margin-left: 8px;" id="calc-pages">0</strong>
              </div>
              <div>
                <span style="font-size: 0.9rem; color: var(--text-secondary);">Costo Stampa KDP:</span>
                <strong style="color: var(--accent-secondary); font-size: 1.1rem; margin-left: 8px;" id="calc-cost">$0.00</strong>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-primary" id="btn-generate">
          <span style="font-size: 1.5rem;">⚡</span>
          AVVIA GENERAZIONE NUOVO LIBRO
        </button>
      </div>

      <!-- UI Pipeline Agenti -->
      ${createAgentStatusUI()}
      
      <!-- Live Preview Container -->
      <div id="live-preview" class="live-preview-container">
        <div class="live-preview-title">
          <span>👁️ Live Preview</span>
          <span style="font-size:0.7rem; opacity:0.7">Generazione in corso...</span>
        </div>
        <div id="preview-grid" class="live-preview-grid">
           <!-- Le immagini appariranno qui -->
        </div>
      </div>
    </div>

    <!-- MODAL ANTEPRIMA PUZZLE -->
    <div id="puzzle-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
       <div style="background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; max-width: 90%; max-height: 90%; overflow: auto; position: relative; display: flex; flex-direction: column; align-items: center;">
          <button id="close-modal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">✕</button>
          <h2 id="modal-title" style="margin-bottom: 20px; color: var(--accent-blue);">Anteprima Puzzle</h2>
          <div id="modal-content" style="background: white; padding: 20px; border-radius: 8px; color: black; display: inline-block;"></div>
       </div>
    </div>
  `;

  // ── Event Listeners ─────────────────────────────────────────

  // Tabs Navigation
  const tabGen = document.getElementById('tab-gen');
  const tabSeo = document.getElementById('tab-seo');
  const panelGen = document.getElementById('panel-gen');
  const panelSeo = document.getElementById('panel-seo');

  tabGen.addEventListener('click', () => {
    tabGen.style.borderColor = 'var(--accent-blue)';
    tabGen.style.color = 'var(--accent-blue)';
    tabSeo.style.borderColor = 'rgba(255,255,255,0.1)';
    tabSeo.style.color = 'white';
    panelGen.style.display = 'block';
    panelSeo.style.display = 'none';
  });

  tabSeo.addEventListener('click', () => {
    tabSeo.style.borderColor = 'var(--accent-blue)';
    tabSeo.style.color = 'var(--accent-blue)';
    tabGen.style.borderColor = 'rgba(255,255,255,0.1)';
    tabGen.style.color = 'white';
    panelSeo.style.display = 'block';
    panelGen.style.display = 'none';
  });

  // SEO Optimizer
  document.getElementById('btn-seo-generate').addEventListener('click', async (e) => {
    const keyword = document.getElementById('seo-keyword').value;
    if (!keyword) return showToast('Inserisci una keyword!', 'error');
    
    const btn = e.target;
    btn.disabled = true;
    btn.innerHTML = 'Analisi in corso...';
    
    try {
      const res = await API.optimizeSEO(keyword);
      document.getElementById('seo-results').style.display = 'block';
      
      const tagsContainer = document.getElementById('seo-tags');
      tagsContainer.innerHTML = res.tags.map(t => `<span style="background: rgba(0,210,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem;">#${t}</span>`).join('');
      
      const descContainer = document.getElementById('seo-desc');
      descContainer.innerHTML = res.description;
      
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Analizza';
    }
  });

  // Selezione categoria
  let selectedCategory = 'Crescita Personale';
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      selectedCategory = e.target.dataset.cat;
      
      const activityMixOptions = document.getElementById('activity-mix-options');
      if (selectedCategory === 'Coloring Books') {
        activityMixOptions.style.display = 'block';
        updateKdpCalculator();
      } else {
        activityMixOptions.style.display = 'none';
      }
    });
  });

  // ── Calcolatore KDP & Preview ───────────────────────────────
  const updateKdpCalculator = () => {
     const s = parseInt(document.getElementById('mix-sudoku-qty').value) || 0;
     const m = parseInt(document.getElementById('mix-maze-qty').value) || 0;
     const w = parseInt(document.getElementById('mix-wordsearch-qty').value) || 0;
     
     const puzzlePages = (s + m + w) * 2;
     const solutionPages = Math.ceil((s + m + w) / 4);
     const totalPages = puzzlePages + solutionPages + 2; // + title page front/back
     
     let cost = 0;
     if (totalPages <= 23) {
         cost = 0; // KDP requires 24 min
     } else if (totalPages <= 108) {
         cost = 2.15;
     } else {
         cost = 0.85 + (totalPages * 0.012);
     }
     
     document.getElementById('calc-pages').textContent = totalPages;
     document.getElementById('calc-cost').textContent = cost > 0 ? '$' + cost.toFixed(2) : '---';
     if (totalPages > 0 && totalPages < 24) document.getElementById('calc-cost').textContent = 'Min 24p';
  };
  
  ['mix-sudoku-qty', 'mix-maze-qty', 'mix-wordsearch-qty'].forEach(id => {
      document.getElementById(id).addEventListener('input', updateKdpCalculator);
  });

  // Modal logic
  const modal = document.getElementById('puzzle-modal');
  document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');
  
  document.querySelectorAll('.btn-preview-puzzle').forEach(btn => {
      btn.addEventListener('click', async (e) => {
          const type = e.target.dataset.type;
          const options = {};
          if (type === 'sudoku') options.diff = document.getElementById('mix-sudoku-diff').value;
          if (type === 'wordsearch') options.words = document.getElementById('mix-wordsearch-words').value;
          
          btn.innerHTML = '⏳';
          btn.disabled = true;
          
          try {
             const res = await API.previewPuzzle(type, options);
             renderModalPreview(type, res);
             modal.style.display = 'flex';
          } catch(err) {
             showToast(err.message, 'error');
          } finally {
             btn.innerHTML = '👁️';
             btn.disabled = false;
          }
      });
  });

  function renderModalPreview(type, data) {
      document.getElementById('modal-title').textContent = `Anteprima: ${type.toUpperCase()}`;
      const mc = document.getElementById('modal-content');
      
      if (type === 'sudoku') {
         const grid = data.puzzle;
         let html = '<table style="border-collapse: collapse; border: 2px solid black;">';
         for(let r=0; r<9; r++) {
             html += '<tr>';
             for(let c=0; c<9; c++) {
                 let val = grid[r][c] === "" ? "&nbsp;" : grid[r][c];
                 let bb = (r%3===2) ? "2px solid black" : "1px solid #ccc";
                 let br = (c%3===2) ? "2px solid black" : "1px solid #ccc";
                 html += `<td style="width:30px; height:30px; text-align:center; font-weight:bold; border-bottom:${bb}; border-right:${br};">${val}</td>`;
             }
             html += '</tr>';
         }
         html += '</table>';
         mc.innerHTML = html;
      } 
      else if (type === 'wordsearch') {
         const grid = data.puzzle;
         let html = '<table style="border-collapse: collapse;">';
         for(let r=0; r<grid.length; r++) {
             html += '<tr>';
             for(let c=0; c<grid[0].length; c++) {
                 html += `<td style="width:25px; height:25px; text-align:center; font-family:monospace; font-size:16px;">${grid[r][c]}</td>`;
             }
             html += '</tr>';
         }
         html += '</table>';
         mc.innerHTML = html;
      }
      else if (type === 'maze') {
         const grid = data.puzzle;
         const size = 15;
         let html = `<div style="position:relative; width:${grid[0].length * size}px; height:${grid.length * size}px;">`;
         for(let r=0; r<grid.length; r++) {
             for(let c=0; c<grid[0].length; c++) {
                 const cell = grid[r][c];
                 let bt = cell.top ? '1px solid black' : 'none';
                 let br = cell.right ? '1px solid black' : 'none';
                 let bb = cell.bottom ? '1px solid black' : 'none';
                 let bl = cell.left ? '1px solid black' : 'none';
                 html += `<div style="position:absolute; left:${c*size}px; top:${r*size}px; width:${size}px; height:${size}px; box-sizing:border-box; border-top:${bt}; border-right:${br}; border-bottom:${bb}; border-left:${bl};"></div>`;
             }
         }
         html += '</div>';
         mc.innerHTML = html;
      }
  }

  // Navigazione
  document.getElementById('btn-archive').addEventListener('click', () => {
    window.location.hash = '#/archive';
  });

  // Avvio Generazione
  document.getElementById('btn-generate').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    const isActivityMix = selectedCategory === 'Coloring Books';
    
    let activityMix = null;
    if (isActivityMix) {
       activityMix = {
         sudoku: {
           qty: parseInt(document.getElementById('mix-sudoku-qty').value) || 0,
           diff: document.getElementById('mix-sudoku-diff').value
         },
         maze: {
           qty: parseInt(document.getElementById('mix-maze-qty').value) || 0,
           shape: document.getElementById('mix-maze-shape').value
         },
         wordsearch: {
           qty: parseInt(document.getElementById('mix-wordsearch-qty').value) || 0,
           words: document.getElementById('mix-wordsearch-words').value
         }
       };
       
       if (activityMix.sudoku.qty === 0 && activityMix.maze.qty === 0 && activityMix.wordsearch.qty === 0) {
         return showToast('Inserisci almeno una quantità maggiore di zero per i puzzle.', 'error');
       }
    }
    
    try {
      btn.disabled = true;
      btn.innerHTML = '<span style="animation: spin 1s linear infinite;">⏳</span> Inizializzazione...';
      
      resetAgentStatusUI();
      
      // Resetta UI e Preview
      const previewGrid = document.getElementById('preview-grid');
      if (previewGrid) previewGrid.innerHTML = '';
      
      // Chiama API
      const res = await API.generateBook(selectedCategory, activityMix);
      
      const livePreview = document.getElementById('live-preview');
      
      if (isActivityMix) {
        livePreview.style.display = 'block';
        previewGrid.innerHTML = ''; // resetta le immagini
      } else {
        livePreview.style.display = 'none';
      }
      
      // Ascolta SSE Stream per questo job
      API.listenToJob(res.jobId, 
        // onComplete
        (finalData) => {
          btn.disabled = false;
          btn.innerHTML = '<span style="font-size: 1.5rem;">⚡</span> AVVIA NUOVA GENERAZIONE';
          
          setTimeout(() => {
            if(confirm(`Il libro "${finalData.titolo}" è pronto!\nVuoi aprirlo nell'archivio?`)) {
              window.location.hash = '#/archive';
            }
          }, 1000);
        },
        // onProgress (passa dati opzionali come l'immagine URL)
        (data) => {
           if (data.imageUrl) {
              const img = document.createElement('img');
              img.src = data.imageUrl;
              img.className = 'preview-img';
              previewGrid.appendChild(img);
              // scrolla giù
              previewGrid.scrollTop = previewGrid.scrollHeight;
           }
        }
      );

    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<span style="font-size: 1.5rem;">⚡</span> AVVIA GENERAZIONE NUOVO LIBRO';
    }
  });
}
