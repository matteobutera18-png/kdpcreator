// ================================================================
//  js/app.js — SPA Router e Inizializzazione App
// ================================================================

import { API } from './api.js';
import { renderLogin } from './views/login.view.js';
import { renderRegister } from './views/register.view.js';
import { renderDashboard } from './views/dashboard.view.js';
import { renderArchive } from './views/archive.view.js';
import { renderSettings } from './views/settings.view.js';

const root = document.getElementById('app-root');

// ── Router Semplice basato su hash (#) ────────────────────────
async function router() {
  const hash = window.location.hash || '#/dashboard';
  
  // Svuota schermata e mostra loading
  root.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100vh; font-size:2rem; animation:spin 1s linear infinite;">⏳</div>';
  
  try {
    // Il login è stato eliminato. Si va diretti alle viste.
    
    // Rendering Vista
    switch (hash) {
      case '#/dashboard':
        renderDashboard(root);
        break;
      case '#/archive':
        renderArchive(root);
        break;
      case '#/settings':
        renderSettings(root);
        break;
      default:
        window.location.hash = '#/dashboard';
    }
  } catch (err) {
    console.error('Errore Router:', err);
    root.innerHTML = `<div style="color: #EF4444; padding: 20px; text-align:center;">Errore fatale: ${err.message}</div>`;
  }
}

// Ascolta i cambiamenti di route
window.addEventListener('hashchange', router);

// Inizializza l'app al caricamento
window.addEventListener('DOMContentLoaded', router);
