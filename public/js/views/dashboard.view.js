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

        <!-- Sotto-Nicchia Coloring/Activity Books -->
        <div id="coloring-options" style="display: none; margin-bottom: 20px; animation: fadeIn 0.3s ease; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
          
          <label class="input-label" style="color: var(--accent-secondary);">Tipo di Interno</label>
          <select id="coloring-type" class="input-field" style="background: rgba(0, 255, 136, 0.05); border-color: rgba(0, 255, 136, 0.3); margin-bottom: 12px;">
            <option value="Coloring Book">🎨 Libro da Colorare (Disegni)</option>
            <option value="Labirinti">🧩 Labirinti / Activity Book</option>
            <option value="Diario">📓 Diario con Righe (Low Content)</option>
          </select>

          <label class="input-label" style="color: var(--accent-blue);">Soggetto / Nicchia (Es. Mandala, Animali, Halloween)</label>
          <input type="text" id="coloring-niche-input" class="input-field" placeholder="Es. Dinosauri, Mandala Floreali..." value="Mandala" style="background: rgba(0, 210, 255, 0.05); border-color: rgba(0, 210, 255, 0.3); margin-bottom: 12px;">
          
          <div style="display: flex; gap: 15px;">
            <div style="flex: 1;">
              <label class="input-label" style="color: var(--accent-blue);">Stile Grafico</label>
              <select id="coloring-art-style" class="input-field" style="background: rgba(0, 210, 255, 0.05); border-color: rgba(0, 210, 255, 0.3);">
                <option value="Line Art Pulita">Line Art Pulita (Classico)</option>
                <option value="Kawaii Semplice">Kawaii Semplice (Giapponese Carino)</option>
                <option value="Mandala Intricato">Mandala Intricato (Complesso)</option>
                <option value="Schizzo a Matita">Schizzo a Matita (Artistico)</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label class="input-label" style="color: var(--accent-blue);">Difficoltà / Età</label>
              <select id="coloring-difficulty" class="input-field" style="background: rgba(0, 210, 255, 0.05); border-color: rgba(0, 210, 255, 0.3);">
                <option value="Bambini">Bambini (Tratti Spessi)</option>
                <option value="Adulti">Adulti (Dettagliato)</option>
              </select>
            </div>
          </div>
          
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 12px;">
            <span style="color: var(--warning);">⚠ NOVITÀ:</span> Marginatura KDP Bleed 8.625"x11.25" attiva con Pagina Sanguinante automatica per i disegni!
          </p>
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
      
      const coloringOptions = document.getElementById('coloring-options');
      if (selectedCategory === 'Coloring Books') {
        coloringOptions.style.display = 'block';
      } else {
        coloringOptions.style.display = 'none';
      }
    });
  });

  // Navigazione
  document.getElementById('btn-archive').addEventListener('click', () => {
    window.location.hash = '#/archive';
  });

  // Avvio Generazione
  document.getElementById('btn-generate').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    const isColoring = selectedCategory === 'Coloring Books';
    const subNiche = isColoring ? document.getElementById('coloring-niche-input').value : null;
    const difficulty = isColoring ? document.getElementById('coloring-difficulty').value : null;
    const bookType = isColoring ? document.getElementById('coloring-type').value : null;
    const artStyle = isColoring ? document.getElementById('coloring-art-style').value : null;
    
    try {
      btn.disabled = true;
      btn.innerHTML = '<span style="animation: spin 1s linear infinite;">⏳</span> Inizializzazione...';
      
      // Resetta UI agenti
      resetAgentStatusUI();
      
      const livePreview = document.getElementById('live-preview');
      const previewGrid = document.getElementById('preview-grid');
      
      if (isColoring) {
        livePreview.style.display = 'block';
        previewGrid.innerHTML = ''; // resetta le immagini
      } else {
        livePreview.style.display = 'none';
      }
      
      // Chiama API
      const res = await API.generateBook(selectedCategory, subNiche, difficulty, bookType, artStyle);
      
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
