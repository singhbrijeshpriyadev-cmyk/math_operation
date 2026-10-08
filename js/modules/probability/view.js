/**
 * OG - Module 14: Probability View
 * Interactive workspace for:
 * 1. Two-Event Algebra & Independence (P(A ∪ B), P(A|B), P(A'))
 * 2. Bayes' Theorem Solver
 * 3. Dynamic Venn Diagram Likelihood Canvas Visualizer.
 * ES6 Module
 */

import { ProbabilityMathEngine } from '../../math/probability.js';

export class ProbabilityView {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;

    this.activeTab = 'events'; // 'events' | 'bayes'
    this.pA = 0.6;
    this.pB = 0.5;
    this.pInter = 0.3;

    // Bayes default hypotheses
    this.bayesPartitions = [
      { name: 'E₁ (Urn 1)', prior: 0.5, likelihood: 0.4 },
      { name: 'E₂ (Urn 2)', prior: 0.5, likelihood: 0.7 }
    ];
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.initCanvas();
    this.calculate();
  }

  render() {
    this.container.innerHTML = `
      <div class="calculus-container">
        <!-- Header -->
        <div class="calculus-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge" style="background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.35); color: #f59e0b;">
                Module #14
              </span>
              <span class="badge badge-stats">Probability</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Probability & Bayes' Theorem
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Explore axiomatic event algebra, conditional probability $P(A|B)$, independence criteria,
              and Bayesian inference with interactive Venn likelihood visualization.
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="glass-button prob-tab-btn ${this.activeTab === 'events' ? 'active' : ''}" data-tab="events" style="padding: 8px 18px;">
              Two Events Algebra
            </button>
            <button class="glass-button prob-tab-btn ${this.activeTab === 'bayes' ? 'active' : ''}" data-tab="bayes" style="padding: 8px 18px;">
              Bayes' Theorem
            </button>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Standard Scenarios:
          </div>
          <div class="calculus-preset-bar" id="prob-preset-container">
            <button class="preset-chip" data-preset="independent">Independent: P(A)=0.6, P(B)=0.5, P(A∩B)=0.3</button>
            <button class="preset-chip" data-preset="disjoint">Disjoint (Mutually Exclusive): P(A∩B)=0</button>
            <button class="preset-chip" data-preset="bayes-medical">Bayes: Diagnostic Test (95% accuracy)</button>
          </div>
        </div>

        <!-- Workspace Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              ${this.activeTab === 'events' ? 'Event Probabilities' : "Bayes' Partition Inputs"}
            </h3>

            ${this.getInputsHtml()}

            <button class="glass-button glass-button-primary" id="btn-prob-calc" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Compute Probability Solution
            </button>
          </div>

          <!-- Venn Visualizer Canvas -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Probability Venn Representation
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Sample Space S (Area = 1)
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="prob-canvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Results Showcase -->
        <div id="prob-results-container"></div>
      </div>
    `;
  }

  getInputsHtml() {
    if (this.activeTab === 'events') {
      return `
        <div class="calculus-controls-grid" style="margin-top: 0;">
          <div class="calculus-input-group">
            <label>P(A):</label>
            <input type="number" step="0.01" min="0" max="1" id="prob-pa" class="calculus-input-field" value="${this.pA}">
          </div>
          <div class="calculus-input-group">
            <label>P(B):</label>
            <input type="number" step="0.01" min="0" max="1" id="prob-pb" class="calculus-input-field" value="${this.pB}">
          </div>
        </div>
        <div class="calculus-input-group">
          <label>Intersection P(A ∩ B):</label>
          <input type="number" step="0.01" min="0" max="1" id="prob-pinter" class="calculus-input-field" value="${this.pInter}">
        </div>
      `;
    } else {
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">
            <span>Hypothesis</span>
            <span>Prior P(Eᵢ)</span>
            <span>Likelihood P(A|Eᵢ)</span>
          </div>
          ${this.bayesPartitions.map((p, i) => `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px;">
              <input type="text" class="calculus-input-field bayes-name" data-index="${i}" value="${p.name}">
              <input type="number" step="0.01" min="0" max="1" class="calculus-input-field bayes-prior" data-index="${i}" value="${p.prior}">
              <input type="number" step="0.01" min="0" max="1" class="calculus-input-field bayes-like" data-index="${i}" value="${p.likelihood}">
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  initCanvas() {
    this.canvas = document.getElementById('prob-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: 500 };
    const width = Math.max(rect.width, 320);
    const height = 300;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  drawVenn() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;
    if (!ctx || !w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // Light Liquid Glass Ivory background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#EFE8DC');
    bg.addColorStop(1, '#E8E0D2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Sample space rectangle
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.fillStyle = '#0E1D61';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('Sample Space S', 32, 40);

    const centerY = h / 2;
    const radius = Math.min(w * 0.22, 75);
    const centerA = { x: w / 2 - radius * 0.55, y: centerY };
    const centerB = { x: w / 2 + radius * 0.55, y: centerY };

    // Circle A in Gold
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerA.x, centerA.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(184, 154, 90, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#B89A5A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Circle B in Deep Atlas Navy
    ctx.beginPath();
    ctx.arc(centerB.x, centerB.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14, 29, 97, 0.18)';
    ctx.fill();
    ctx.strokeStyle = '#0E1D61';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels in Deep Atlas Navy & Gold
    ctx.fillStyle = '#B89A5A';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', centerA.x - radius * 0.4, centerY);

    ctx.fillStyle = '#0E1D61';
    ctx.fillText('B', centerB.x + radius * 0.4, centerY);

    ctx.fillStyle = '#0E1D61';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText('A ∩ B', w / 2, centerY);

    ctx.restore();
  }

  attachEventListeners() {
    this.container.querySelectorAll('.prob-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.dataset.tab;
        this.render();
        this.attachEventListeners();
        this.initCanvas();
        this.calculate();
      });
    });

    const presetContainer = document.getElementById('prob-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'independent') {
          this.activeTab = 'events';
          this.pA = 0.6;
          this.pB = 0.5;
          this.pInter = 0.3;
        } else if (p === 'disjoint') {
          this.activeTab = 'events';
          this.pA = 0.4;
          this.pB = 0.4;
          this.pInter = 0.0;
        } else if (p === 'bayes-medical') {
          this.activeTab = 'bayes';
          this.bayesPartitions = [
            { name: 'Disease Present (D)', prior: 0.01, likelihood: 0.95 },
            { name: 'Healthy (H)', prior: 0.99, likelihood: 0.05 }
          ];
        }

        this.render();
        this.attachEventListeners();
        this.initCanvas();
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-prob-calc');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.activeTab === 'events') {
          this.pA = parseFloat(document.getElementById('prob-pa')?.value) || 0;
          this.pB = parseFloat(document.getElementById('prob-pb')?.value) || 0;
          this.pInter = parseFloat(document.getElementById('prob-pinter')?.value) || 0;
        } else {
          const names = document.querySelectorAll('.bayes-name');
          const priors = document.querySelectorAll('.bayes-prior');
          const likes = document.querySelectorAll('.bayes-like');
          this.bayesPartitions = [];
          names.forEach((el, i) => {
            this.bayesPartitions.push({
              name: el.value || `E${i + 1}`,
              prior: parseFloat(priors[i].value) || 0,
              likelihood: parseFloat(likes[i].value) || 0
            });
          });
        }
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('prob-results-container');
    if (!resultsContainer) return;

    this.drawVenn();

    if (this.activeTab === 'events') {
      const res = ProbabilityMathEngine.twoEvents(this.pA, this.pB, this.pInter);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Probability Error</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Hero Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            <div class="glass-panel" style="padding: 18px; border-top: 3px solid #B89A5A;">
              <div style="font-size: 0.8rem; color: var(--text-muted);">P(A ∪ B)</div>
              <div style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono);">${res.result.pUnion}</div>
            </div>
            <div class="glass-panel" style="padding: 18px; border-top: 3px solid #0E1D61;">
              <div style="font-size: 0.8rem; color: var(--text-muted);">P(A | B)</div>
              <div style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono);">${res.result.pAgivenB !== null ? res.result.pAgivenB : 'N/A'}</div>
            </div>
            <div class="glass-panel" style="padding: 18px; border-top: 3px solid #B89A5A;">
              <div style="font-size: 0.8rem; color: var(--text-muted);">P(B | A)</div>
              <div style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono);">${res.result.pBgivenA !== null ? res.result.pBgivenA : 'N/A'}</div>
            </div>
            <div class="glass-panel" style="padding: 18px; border-top: 3px solid #0E1D61;">
              <div style="font-size: 0.8rem; color: var(--text-muted);">Independence</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: ${res.result.isIndependent ? '#10b981' : '#f43f5e'};">
                ${res.result.isIndependent ? 'Independent' : 'Dependent'}
              </div>
            </div>
          </div>

          <!-- Derivation -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Step-by-Step Probability Analysis
            </h3>
            ${res.steps.map(step => `
              <div class="step-card">
                <div class="step-card-body">${step}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Bayes
      const res = ProbabilityMathEngine.bayesTheorem(this.bayesPartitions);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Bayes Error</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Hero -->
          <div class="calculus-result-hero">
            <div class="result-hero-label">Posterior Probabilities via Bayes' Theorem</div>
            <div class="result-hero-value" style="display: flex; flex-direction: column; gap: 6px;">
              ${res.result.posteriors.map(p => `
                <div style="color: #E8E0D2; font-size: 1.3rem; font-weight: 700;">
                  P(${p.name} | A) = <strong style="color: #B89A5A;">${p.posterior}</strong> (${(p.posterior * 100).toFixed(2)}%)
                </div>
              `).join('')}
            </div>
            <div style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 4px;">
              Total Marginal Probability P(A) = <strong style="color: var(--accent-cyan);">${res.result.totalProbA}</strong>
            </div>
          </div>

          <!-- Derivation -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Step-by-Step Bayes Inference
            </h3>
            ${res.steps.map(step => `
              <div class="step-card">
                <div class="step-card-body">${step}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  destroy() {
    this.canvas = null;
    this.ctx = null;
  }
}
