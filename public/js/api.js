// ================================================================
//  js/api.js — HTTP Client e Gestione SSE
// ================================================================

import { showToast } from './components/toast.js';
import { updateAgentStep } from './components/agentStatus.js';

export const API = {
  
  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401 && window.location.hash !== '#/login') {
          window.location.hash = '#/login';
        }
        throw new Error(data.error || 'Errore di rete');
      }
      
      return data;
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err);
      throw err;
    }
  },

  async login(email, phone, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, phone, password })
    });
  },

  async register(email, phone, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, phone, password })
    });
  },

  async updateSettings(email, phone) {
    return this.request('/auth/settings', {
      method: 'POST',
      body: JSON.stringify({ email, phone })
    });
  },

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },

  async checkSession() {
    try {
      const data = await this.request('/auth/me');
      return data.authenticated;
    } catch {
      return false;
    }
  },

  // ── Libri & Agenti ──────────────────────────────────────────

  async getBooks() {
    return this.request('/books');
  },

  async optimizeSEO(keyword) {
    return this.request('/books/seo-optimize', {
      method: 'POST',
      body: JSON.stringify({ keyword })
    });
  },

  async analyzeMarket(payload) {
    return this.request('/agents/analyze-market', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async generateBook(categoria, activityMix = null, benchmark = null) {
    return this.request('/agents/generate', {
      method: 'POST',
      body: JSON.stringify({ categoria, activityMix, benchmark })
    });
  },

  async previewPuzzle(type, options) {
    return this.request('/agents/preview-puzzle', {
      method: 'POST',
      body: JSON.stringify({ type, options })
    });
  },

  // ── Ascolto eventi real-time SSE ──────────────────────────
  listenToJob(jobId, onComplete, onProgress) {
    const eventSource = new EventSource(`/api/agents/stream/${jobId}`);
    
    eventSource.onmessage = (event) => {
      // Ignora gli heartbeat (iniziano con ':')
      if (event.data.startsWith(':')) return;

      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'pipeline_start':
            showToast(data.message, 'info');
            break;
            
          case 'agent_start':
            updateAgentStep(data.agent, 'active', data.message, 0);
            break;
            
          case 'agent_progress':
            updateAgentStep(data.agent, 'active', data.message, data.percent);
            if (onProgress) onProgress(data);
            break;
            
          case 'agent_done':
            updateAgentStep(data.agent, 'done', data.message);
            showToast(data.message, 'success');
            break;
            
          case 'pipeline_done':
            showToast(data.message, 'success', 5000);
            updateAgentStep('delivery', 'done', 'Completato!');
            eventSource.close();
            if (onComplete) onComplete(data);
            break;
            
          case 'pipeline_error':
            showToast(data.message, 'error', 5000);
            eventSource.close();
            break;
        }
      } catch (e) {
        console.error('Errore parsing SSE', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error', err);
      eventSource.close();
    };

    return eventSource;
  }
};
