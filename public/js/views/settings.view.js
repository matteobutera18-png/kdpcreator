import { API } from '../api.js';
import { showToast } from '../components/toast.js';

export function renderSettings(root) {
  root.innerHTML = `
    <div class="top-nav">
      <div class="logo-text">IMPOSTAZIONI</div>
      <div class="nav-buttons">
        <button class="icon-btn" id="btn-back" title="Torna alla Dashboard">⬅️</button>
      </div>
    </div>

    <div class="glass-card" style="animation: slideUp 0.3s ease;">
      <h2 style="font-size: 1.1rem; margin-bottom: 16px;">Dati Profilo</h2>
      
      <form id="settings-form">
        <div class="input-group">
          <label class="input-label">E-mail</label>
          <input type="email" id="settings-email" class="input-field" required>
        </div>

        <div class="input-group">
          <label class="input-label">Numero di Telefono</label>
          <input type="tel" id="settings-phone" class="input-field" required>
        </div>
        
        <button type="submit" class="btn-primary" style="margin-top: 20px;">
          <span style="font-size: 1.2rem;">💾</span> SALVA MODIFICHE
        </button>
      </form>
    </div>
  `;

  // Carica i dati attuali
  API.request('/auth/me').then(data => {
    if (data && data.user) {
      document.getElementById('settings-email').value = data.user.email || '';
      document.getElementById('settings-phone').value = data.user.phone || '';
    }
  }).catch(err => console.error(err));

  // Torna alla dashboard
  document.getElementById('btn-back').addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });

  // Salva impostazioni
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = document.getElementById('settings-email').value;
    const phone = document.getElementById('settings-phone').value;

    try {
      btn.disabled = true;
      btn.innerHTML = 'Salvataggio...';
      
      await API.updateSettings(email, phone);
      showToast('Impostazioni salvate con successo!', 'success');
      
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span style="font-size: 1.2rem;">💾</span> SALVA MODIFICHE';
    }
  });
}
