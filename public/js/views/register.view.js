import { API } from '../api.js';
import { showToast } from '../components/toast.js';

export function renderRegister(root) {
  root.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; animation: fadeIn 0.5s ease;">
      <div class="logo-text" style="font-size: 2.5rem; margin-bottom: 32px;">KDP FACTORY</div>
      
      <div class="glass-card" style="width: 100%; max-width: 400px;">
        <h2 style="margin-bottom: 24px; font-size: 1.25rem; text-align: center;">Registra un nuovo account</h2>

        <form id="register-form">
          <div class="input-group">
            <label class="input-label">E-mail</label>
            <input type="email" id="reg-email" class="input-field" placeholder="es. mario@email.com" required autocomplete="email">
          </div>

          <div class="input-group">
            <label class="input-label">Numero di Telefono</label>
            <input type="tel" id="reg-phone" class="input-field" placeholder="es. +39 333 1234567" required autocomplete="tel">
          </div>
          
          <div class="input-group">
            <label class="input-label">Password Segreta</label>
            <input type="password" id="reg-password" class="input-field" required autocomplete="new-password">
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 32px;">
            <span style="font-size: 1.2rem;">📝</span> CREA ACCOUNT
          </button>
        </form>

        <div style="margin-top: 24px; text-align: center; font-size: 0.9rem;">
          <span style="color: var(--text-secondary);">Hai già un account?</span>
          <a href="#/login" style="color: var(--accent-blue); text-decoration: none; font-weight: bold; margin-left: 8px;">Accedi qui</a>
        </div>
      </div>
    </div>
  `;

  // Focus sul primo campo
  setTimeout(() => document.getElementById('reg-email')?.focus(), 100);

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-password').value;

    try {
      btn.disabled = true;
      btn.innerHTML = 'Creazione account in corso...';
      
      await API.register(email, phone, pass);
      
      showToast('Account creato con successo!', 'success');
      window.location.hash = '#/dashboard';
      
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<span style="font-size: 1.2rem;">📝</span> CREA ACCOUNT';
    }
  });
}
