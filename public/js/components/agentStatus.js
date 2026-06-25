// ================================================================
//  js/components/agentStatus.js — UI Real-time per Pipeline
// ================================================================

export function createAgentStatusUI() {
  return `
    <div class="agent-pipeline" id="pipeline-container">
      <div class="agent-step" id="step-scout">
        <div class="step-icon">🔍</div>
        <div class="step-content">
          <div class="step-title">Agente Scout</div>
          <div class="step-desc" id="desc-scout">In attesa...</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="prog-scout"></div>
          </div>
        </div>
      </div>
      
      <div class="agent-step" id="step-writer">
        <div class="step-icon">✍️</div>
        <div class="step-content">
          <div class="step-title">Agente Scrittore (Ghostwriter)</div>
          <div class="step-desc" id="desc-writer">In attesa...</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="prog-writer"></div>
          </div>
        </div>
      </div>

      <div class="agent-step" id="step-creative">
        <div class="step-icon">🎨</div>
        <div class="step-content">
          <div class="step-title">Agente Creativo</div>
          <div class="step-desc" id="desc-creative">In attesa...</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="prog-creative"></div>
          </div>
        </div>
      </div>

      <div class="agent-step" id="step-delivery">
        <div class="step-icon">📦</div>
        <div class="step-content">
          <div class="step-title">Agente Consegna</div>
          <div class="step-desc" id="desc-delivery">In attesa...</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="prog-delivery"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function updateAgentStep(agent, status, message, percent = null) {
  const stepEl = document.getElementById(`step-${agent}`);
  const descEl = document.getElementById(`desc-${agent}`);
  const progEl = document.getElementById(`prog-${agent}`);
  
  if (!stepEl) return;

  descEl.textContent = message;

  if (status === 'active') {
    stepEl.classList.add('active');
    stepEl.classList.remove('done');
    if (percent !== null && progEl) {
      progEl.style.width = `${percent}%`;
    }
  } else if (status === 'done') {
    stepEl.classList.remove('active');
    stepEl.classList.add('done');
    if (progEl) progEl.style.width = '100%';
  }
}

export function resetAgentStatusUI() {
  const container = document.getElementById('pipeline-container');
  if (container) {
    container.style.display = 'block';
    const steps = container.querySelectorAll('.agent-step');
    steps.forEach(s => {
      s.classList.remove('active', 'done');
      const prog = s.querySelector('.progress-bar-fill');
      if(prog) prog.style.width = '0%';
    });
  }
}
