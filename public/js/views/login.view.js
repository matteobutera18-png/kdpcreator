// ================================================================
//  js/views/login.view.js — Schermata di Autenticazione
// ================================================================

import { API } from '../api.js';
import { showToast } from '../components/toast.js';

export function renderLogin(root) {
  root.innerHTML = `
    <div class="glass-card" style="margin-top: 50px; animation: slideUp 0.5s ease;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 class="logo-text" style="font-size: 1.8rem; margin-bottom: 10px;">KDP FACTORY</h1>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Pannello di Controllo Industriale</p>
      </div>

      <form id="login-form">
        <div class="input-group">
          <label class="input-label">Username</label>
          <input type="text" id="username" class="input-field" value="admin" required autocomplete="username">
        </div>
        
        <div class="input-group">
          <label class="input-label">Password Segreta</label>
          <input type="password" id="password" class="input-field" required autocomplete="current-password">
        </div>
        
        <button type="submit" class="btn-primary" style="margin-top: 30px;">
          Accedi al Sistema
        </button>
      </form>
    </div>
  `;

  // Focus sul campo password (visto che admin è precompilato)
  setTimeout(() => document.getElementById('password')?.focus(), 100);

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const card = document.querySelector('.glass-card');

    try {
      btn.disabled = true;
      btn.innerHTML = 'Autenticazione...';
      
      await API.login(user, pass);
      
      showToast('Accesso autorizzato', 'success');
      window.location.hash = '#/dashboard';
      
    } catch (err) {
      // Shake animation per errore
      card.classList.remove('shake');
      void card.offsetWidth; // trigger reflow
      card.classList.add('shake');
      
      showToast(err.message, 'error');
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Accedi al Sistema';
    }
  });
}
