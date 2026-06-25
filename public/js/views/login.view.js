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
          <label class="input-label">E-mail</label>
          <input type="email" id="email" class="input-field" placeholder="es. admin@kdpfactory.com" required autocomplete="email">
        </div>

        <div class="input-group">
          <label class="input-label">Numero di Telefono</label>
          <input type="tel" id="phone" class="input-field" placeholder="es. +39 333 1234567" required autocomplete="tel">
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

  // Focus sul primo campo
  setTimeout(() => document.getElementById('email')?.focus(), 100);

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const pass = document.getElementById('password').value;
    const card = document.querySelector('.glass-card');

    try {
      btn.disabled = true;
      btn.innerHTML = 'Autenticazione...';
      
      await API.login(email, phone, pass);
      
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
