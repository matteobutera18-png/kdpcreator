// ================================================================
//  js/views/archive.view.js — Archivio "I Miei Libri"
// ================================================================

import { API } from '../api.js';
import { showToast } from '../components/toast.js';

export async function renderArchive(root) {
  root.innerHTML = `
    <div class="top-nav">
      <div class="logo-text">I Miei Libri</div>
      <div class="nav-buttons">
        <button class="icon-btn" id="btn-back" title="Torna alla Dashboard">◀</button>
      </div>
    </div>
    
    <div id="books-container" class="book-list">
      <div style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
        <div style="animation: spin 1s linear infinite; font-size: 2rem; margin-bottom: 10px;">⏳</div>
        Caricamento archivio...
      </div>
    </div>
  `;

  document.getElementById('btn-back').addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  try {
    const data = await API.getBooks();
    const container = document.getElementById('books-container');
    
    if (data.books.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center;">
          <h3 style="margin-bottom: 10px;">Nessun libro generato</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Torna alla dashboard e avvia la produzione.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.books.map(book => `
      <div class="book-card" data-slug="${book.slug}">
        <div class="book-header">
          <div class="book-title">${book.titolo}</div>
          <div style="color: var(--success); font-weight: bold;">✔ Pronto</div>
        </div>
        
        <div class="book-meta">
          <span>📚 ${book.categoria}</span>
          <span>📄 ${book.pagineStimate} pag.</span>
          <span>🕒 ${new Date(book.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div class="book-actions">
          <button class="btn-secondary btn-copy" data-type="desc" data-slug="${book.slug}">
            📋 Copia Descrizione
          </button>
          <button class="btn-secondary btn-copy" data-type="kw" data-slug="${book.slug}">
            🔑 Keywords
          </button>
          <button class="btn-secondary btn-copy" data-type="prompt" data-slug="${book.slug}">
            🎨 Prompt Cover
          </button>
        </div>
        
        <!-- Contenitore espandibile per i dettagli testuali -->
        <div class="book-detail-view" id="detail-${book.slug}"></div>
      </div>
    `).join('');

    // Listener per i bottoni copia
    document.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation(); // Evita l'espansione della card
        const slug = e.target.closest('.btn-copy').dataset.slug;
        const type = e.target.closest('.btn-copy').dataset.type;
        
        try {
          // Fetch dettaglio libro
          const bookDetail = await API.request(`/books/${slug}`);
          let textToCopy = '';
          let msg = '';
          
          if (type === 'desc') {
            textToCopy = bookDetail.metadata.descrizione;
            msg = 'Descrizione copiata!';
          } else if (type === 'kw') {
            textToCopy = bookDetail.metadata.keywords.join('\n');
            msg = 'Keywords copiate!';
          } else if (type === 'prompt') {
            textToCopy = bookDetail.promptCopertina;
            msg = 'Prompt coperti copiati!';
          }
          
          await navigator.clipboard.writeText(textToCopy);
          showToast(msg, 'success');
          
        } catch (err) {
          showToast('Errore durante la copia', 'error');
        }
      });
    });

    // Listener per espandere la card (mostra estratto libro)
    document.querySelectorAll('.book-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        // Ignora i click sui bottoni interni
        if (e.target.closest('.btn-copy')) return;
        
        const slug = card.dataset.slug;
        const detailEl = document.getElementById(`detail-${slug}`);
        
        if (detailEl.style.display === 'block') {
          detailEl.style.display = 'none';
          return;
        }

        // Se vuoto, fetch
        if (!detailEl.innerHTML) {
          detailEl.innerHTML = '<div style="padding: 10px;">Caricamento...</div>';
          detailEl.style.display = 'block';
          
          try {
            const detail = await API.request(`/books/${slug}`);
            
            detailEl.innerHTML = `
              <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                <div class="detail-section">
                  <div class="detail-title">Download File Originali</div>
                  <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
                    ${detail.metadata.isColoringBook ? `
                      <a href="/api/books/${slug}/download/pdf" class="btn-secondary" style="text-decoration: none; color: var(--accent-blue); border-color: var(--accent-blue);" download>⬇️ Libro PDF (Interno)</a>
                      <a href="/api/books/${slug}/download/cover" class="btn-secondary" style="text-decoration: none; color: var(--accent-secondary); border-color: var(--accent-secondary);" download>⬇️ Copertina PDF (Wrap)</a>
                    ` : `
                      <a href="/api/books/${slug}/download/libro" class="btn-secondary" style="text-decoration: none;" download>⬇️ Libro 6x9 (TXT)</a>
                    `}
                    <a href="/api/books/${slug}/download/metadati" class="btn-secondary" style="text-decoration: none;" download>⬇️ Metadati JSON</a>
                    <a href="/api/books/${slug}/download/prompt" class="btn-secondary" style="text-decoration: none;" download>⬇️ Prompt TXT</a>
                  </div>
                </div>
                
                <div class="detail-section">
                  <div class="detail-title">Sottotitolo</div>
                  <div class="detail-text">${detail.metadata.sottotitolo}</div>
                </div>
                
                <div class="detail-section">
                  <div class="detail-title">Categorie KDP Suggerite</div>
                  <div class="detail-text">${detail.metadata.categorie_kdp.join('<br>')}</div>
                </div>
                
                <div class="detail-section">
                  <div class="detail-title">Estratto Libro (Primi caratteri)</div>
                  <div class="detail-text" style="font-family: monospace; font-size: 0.8rem; opacity: 0.8; max-height: 200px; overflow-y: auto;">${detail.libroEstratto}</div>
                </div>
              </div>
            `;
          } catch (err) {
            detailEl.innerHTML = `<div style="color: var(--danger)">Errore caricamento dettagli</div>`;
          }
        } else {
          detailEl.style.display = 'block';
        }
      });
    });

  } catch (err) {
    document.getElementById('books-container').innerHTML = `
      <div style="color: var(--danger); text-align: center; padding: 20px;">
        Errore caricamento archivio: ${err.message}
      </div>
    `;
  }
}
