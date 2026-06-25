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
        <button class="icon-btn" id="btn-settings" title="Impostazioni">⚙️</button>
        <button class="icon-btn" id="btn-logout" title="Esci">🚪</button>
      </div>
    </div>

    <div class="glass-card" style="margin-bottom: 24px;">
      <h2 style="font-size: 1.1rem; margin-bottom: 16px;">1. Seleziona Macro-Categoria</h2>
      
      <div class="category-pills" id="category-selector">
        <div class="pill active" data-cat="Crescita Personale">Crescita Personale</div>
        <div class="pill" data-cat="Finanza Personale">Finanza Personale</div>
        <div class="pill" data-cat="Salute & Benessere">Salute & Benessere</div>
        <div class="pill" data-cat="Business & Imprenditoria">Business & Imprenditoria</div>
        <div class="pill" data-cat="Manualistica">Manualistica</div>
        <div class="pill" data-cat="Guide Pratiche">Guide Pratiche</div>
        <div class="pill" data-cat="Coloring Books" style="border-color: var(--accent-blue); color: var(--accent-blue);">🎨 Libri da Colorare</div>
      </div>

      <!-- Sotto-Nicchia Coloring Books (visibile solo se categoria è Coloring Books) -->
      <div id="coloring-options" style="display: none; margin-bottom: 20px; animation: fadeIn 0.3s ease;">
        <label class="input-label" style="color: var(--accent-blue);">Nicchia Disegni</label>
        <select id="coloring-niche-select" class="input-field" style="background: rgba(0, 210, 255, 0.05); border-color: rgba(0, 210, 255, 0.3); margin-bottom: 12px;">
          <option value="Mandala">Mandala Geometrici / Floreali</option>
          <option value="Animali">Animali della Giungla / Foresta</option>
          <option value="Fantasy">Mondo Fantasy (Fate, Draghi, Magia)</option>
        </select>
        
        <label class="input-label" style="color: var(--accent-blue);">Difficoltà</label>
        <select id="coloring-difficulty" class="input-field" style="background: rgba(0, 210, 255, 0.05); border-color: rgba(0, 210, 255, 0.3);">
          <option value="Bambini">Bambini (Linee Spesse, Facile)</option>
          <option value="Adulti">Adulti (Dettagliato, Complesso)</option>
        </select>
        
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px;">
          L'agente genererà un PDF 8.5"x11" e la Copertina automatica calcolata in base alle pagine.
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
  `;

  // ── Event Listeners ─────────────────────────────────────────

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

  document.getElementById('btn-settings').addEventListener('click', () => {
    window.location.hash = '#/settings';
  });

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await API.logout();
    window.location.hash = '#/login';
  });

  // Avvio Generazione
  document.getElementById('btn-generate').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    const isColoring = selectedCategory === 'Coloring Books';
    const subNiche = isColoring ? document.getElementById('coloring-niche-select').value : null;
    const difficulty = isColoring ? document.getElementById('coloring-difficulty').value : null;
    
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
      const res = await API.generateBook(selectedCategory, subNiche, difficulty);
      
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
