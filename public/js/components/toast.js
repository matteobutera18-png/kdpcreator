// ================================================================
//  js/components/toast.js — Sistema Notifiche
// ================================================================

export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: '✅',
    error:   '❌',
    info:    '💡',
    warning: '⚠️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '💡'}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);

  // Rimozione automatica
  setTimeout(() => {
    toast.classList.add('toast-closing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}
