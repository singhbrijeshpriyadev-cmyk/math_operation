/**
 * OG - Module 12: Limits and Derivatives View
 * Full interactive exploration of Left-Hand Limit, Right-Hand Limit, Finite Limits,
 * First Principles, and Higher-Order Derivatives.
 * ES6 Module
 */

import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class LimitsView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    // State
    this.activeTab = 'limits'; // 'limits' | 'derivatives'
    this.funcExpr = 'sin(x)/x';
    this.approachC = 0;
    this.derivExpr = 'x^3 - 3*x + 2';
    this.derivOrder = 1;
    this.evalX = 1;
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.initGraph();
    this.calculate();
  }

  render() {
    this.container.innerHTML = `
      <div class="calculus-container">
        <!-- Module Header -->
        <div class="calculus-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge">Module #12</span>
              <span class="badge badge-calculus">Calculus</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Limits and Derivatives
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Explore left-hand & right-hand limits, finite limit existence, first principles,
              and symbolic first, second, and $n$-th order derivatives with real-time graph visualization.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="glass-button tab-btn ${this.activeTab === 'limits' ? 'active' : ''}" data-tab="limits" style="padding: 8px 18px;">
              Limits Engine
            </button>
            <button class="glass-button tab-btn ${this.activeTab === 'derivatives' ? 'active' : ''}" data-tab="derivatives" style="padding: 8px 18px;">
              Derivatives Engine
            </button>
            <a href="#/graph" class="glass-button" style="padding: 8px 14px; text-decoration: none;" title="Open in Graph Calculator">
              Graph Calc ↗
            </a>
          </div>
        </div>

        <!-- Presets Bar -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Curated Presets:
          </div>
          <div class="calculus-preset-bar" id="limits-preset-container">
            ${this.getPresetsHtml()}
          </div>
        </div>

        <!-- Main Workspace (Controls + Graph) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls Glass Panel -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              ${this.activeTab === 'limits' ? 'Limit Parameters' : 'Differentiation Parameters'}
            </h3>

            ${this.getControlsHtml()}

            <button class="glass-button glass-button-primary" id="btn-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Calculate ${this.activeTab === 'limits' ? 'Limit & Approach' : 'Symbolic Derivative'}
            </button>
          </div>

          <!-- Interactive 2D Graph Visualizer -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                2D Dynamic Coordinate Plotter
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Hover cursor to probe values
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="limits-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>f(x) Curve</span>
              </div>
              ${this.activeTab === 'derivatives' ? `
                <div class="legend-item">
                  <span class="legend-indicator" style="background: #0E1D61; border-top: 1px dashed;"></span>
                  <span>f'(x) Derivative</span>
                </div>
              ` : `
                <div class="legend-item">
                  <span class="legend-indicator" style="background: #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                  <span>Point of Approach x = c</span>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Derivation & Results Glass Showcase -->
        <div id="results-container"></div>
      </div>
    `;
  }

  getPresetsHtml() {
    if (this.activeTab === 'limits') {
      return `
        <button class="preset-chip" data-preset="sinc">sin(x) / x (x ➔ 0)</button>
        <button class="preset-chip" data-preset="diffsq">(x² - 4)/(x - 2) (x ➔ 2)</button>
        <button class="preset-chip" data-preset="poly">x² + 3x - 1 (x ➔ 1)</button>
        <button class="preset-chip" data-preset="sqrt">(√(x) - 1)/(x - 1) (x ➔ 1)</button>
        <button class="preset-chip" data-preset="exp">(e^x - 1)/x (x ➔ 0)</button>
      `;
    } else {
      return `
        <button class="preset-chip" data-preset="cubic">x³ - 3x + 2 (1st & 2nd)</button>
        <button class="preset-chip" data-preset="trig">sin(x) (n-th order)</button>
        <button class="preset-chip" data-preset="exp">exp(2*x) (Exponential)</button>
        <button class="preset-chip" data-preset="power">x^5 - 5x³ + 4x</button>
      `;
    }
  }

  getControlsHtml() {
    if (this.activeTab === 'limits') {
      return `
        <div class="calculus-input-group">
          <label>Target Function f(x):</label>
          <input type="text" id="input-func" class="calculus-input-field" value="${this.funcExpr}" placeholder="e.g. sin(x)/x, (x^2 - 4)/(x - 2)">
        </div>
        <div class="calculus-input-group">
          <label>Point of Approach c:</label>
          <input type="number" step="any" id="input-c" class="calculus-input-field" value="${this.approachC}" placeholder="e.g. 0, 2">
        </div>
      `;
    } else {
      return `
        <div class="calculus-input-group">
          <label>Function f(x):</label>
          <input type="text" id="input-deriv-func" class="calculus-input-field" value="${this.derivExpr}" placeholder="e.g. x^3 - 3*x + 2, sin(x)">
        </div>
        <div class="calculus-controls-grid" style="margin-top: 0;">
          <div class="calculus-input-group">
            <label>Derivative Order n (1 - 5):</label>
            <input type="number" min="1" max="5" id="input-order" class="calculus-input-field" value="${this.derivOrder}">
          </div>
          <div class="calculus-input-group">
            <label>Evaluate at x (optional):</label>
            <input type="number" step="any" id="input-eval-x" class="calculus-input-field" value="${this.evalX}">
          </div>
        </div>
      `;
    }
  }

  initGraph() {
    const canvas = document.getElementById('limits-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: this.activeTab === 'limits' ? this.funcExpr : this.derivExpr,
      xMin: -4.5,
      xMax: 4.5,
      yMin: -4.0,
      yMax: 5.0,
      tangentX0: this.activeTab === 'limits' ? this.approachC : this.evalX
    });
  }

  attachEventListeners() {
    // Tab switching
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.dataset.tab;
        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    });

    // Presets
    const presetContainer = document.getElementById('limits-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const preset = chip.dataset.preset;
        this.applyPreset(preset);
      });
    }

    // Calculate Button
    const calcBtn = document.getElementById('btn-calculate');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        this.readInputs();
        this.calculate();
      });
    }
  }

  applyPreset(preset) {
    if (this.activeTab === 'limits') {
      if (preset === 'sinc') {
        this.funcExpr = 'sin(x)/x';
        this.approachC = 0;
      } else if (preset === 'diffsq') {
        this.funcExpr = '(x^2 - 4)/(x - 2)';
        this.approachC = 2;
      } else if (preset === 'poly') {
        this.funcExpr = 'x^2 + 3*x - 1';
        this.approachC = 1;
      } else if (preset === 'sqrt') {
        this.funcExpr = '(sqrt(x) - 1)/(x - 1)';
        this.approachC = 1;
      } else if (preset === 'exp') {
        this.funcExpr = '(exp(x) - 1)/x';
        this.approachC = 0;
      }
      const inFunc = document.getElementById('input-func');
      const inC = document.getElementById('input-c');
      if (inFunc) inFunc.value = this.funcExpr;
      if (inC) inC.value = this.approachC;
    } else {
      if (preset === 'cubic') {
        this.derivExpr = 'x^3 - 3*x + 2';
        this.derivOrder = 2;
        this.evalX = 1;
      } else if (preset === 'trig') {
        this.derivExpr = 'sin(x)';
        this.derivOrder = 3;
        this.evalX = 0;
      } else if (preset === 'exp') {
        this.derivExpr = 'exp(2*x)';
        this.derivOrder = 2;
        this.evalX = 0;
      } else if (preset === 'power') {
        this.derivExpr = 'x^5 - 5*x^3 + 4*x';
        this.derivOrder = 1;
        this.evalX = 2;
      }
      const inD = document.getElementById('input-deriv-func');
      const inO = document.getElementById('input-order');
      const inE = document.getElementById('input-eval-x');
      if (inD) inD.value = this.derivExpr;
      if (inO) inO.value = this.derivOrder;
      if (inE) inE.value = this.evalX;
    }
    this.calculate();
  }

  readInputs() {
    if (this.activeTab === 'limits') {
      const inFunc = document.getElementById('input-func');
      const inC = document.getElementById('input-c');
      if (inFunc) this.funcExpr = inFunc.value.trim() || 'sin(x)/x';
      if (inC) this.approachC = parseFloat(inC.value) || 0;
    } else {
      const inD = document.getElementById('input-deriv-func');
      const inO = document.getElementById('input-order');
      const inE = document.getElementById('input-eval-x');
      if (inD) this.derivExpr = inD.value.trim() || 'x^2';
      if (inO) this.derivOrder = parseInt(inO.value, 10) || 1;
      if (inE) this.evalX = inE.value !== '' ? parseFloat(inE.value) : null;
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;

    if (this.activeTab === 'limits') {
      const res = CalculusEngine.evaluateLimit(this.funcExpr, this.approachC);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Evaluation Error</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      // Update graph
      if (this.visualizer) {
        this.visualizer.updateOptions({
          exprStr: this.funcExpr,
          tangentX0: this.approachC,
          markers: [{ x: this.approachC, y: typeof res.result.limitValue === 'number' ? res.result.limitValue : 0, label: 'L', type: 'root' }]
        });
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Result Hero -->
          <div class="calculus-result-hero">
            <div class="result-hero-label">Final Limit Outcome</div>
            <div class="result-hero-value">
              lim(x ➔ ${res.result.c}) ${res.result.expression} = ${res.result.limitStr}
            </div>
            <div style="font-size: 0.95rem; color: var(--text-secondary);">
              Left-Hand Limit (LHL): <strong style="color: var(--accent-cyan);">${res.result.lhl}</strong> &nbsp;|&nbsp;
              Right-Hand Limit (RHL): <strong style="color: var(--accent-violet);">${res.result.rhl}</strong> &nbsp;|&nbsp;
              Status: <span style="color: ${res.result.limitExists ? '#10b981' : '#f43f5e'}; font-weight: 600;">
                ${res.result.limitExists ? 'Finite Limit Exists' : 'Limit Does Not Exist'}
              </span>
            </div>
          </div>

          <!-- Derivation Steps -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Step-by-Step Derivation & Limit Evaluation
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
      // Derivatives
      const res = CalculusEngine.differentiate(this.derivExpr, this.derivOrder, this.evalX);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Differentiation Error</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      // Update graph
      if (this.visualizer) {
        this.visualizer.updateOptions({
          exprStr: this.derivExpr,
          showDerivative: true,
          derivStr: res.result.firstDerivative,
          tangentX0: this.evalX !== null ? this.evalX : 1
        });
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Result Hero -->
          <div class="calculus-result-hero">
            <div class="result-hero-label">Order #${res.result.order} Derivative</div>
            <div class="result-hero-value">
              ${res.result.order === 1 ? "f'(x)" : res.result.order === 2 ? "f''(x)" : `f^(${res.result.order})(x)`} = ${res.result.nthDerivative}
            </div>
            ${res.result.evalResult !== null ? `
              <div style="font-size: 1.05rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 4px;">
                Evaluated at x = ${res.result.evalX}: <strong>${res.result.evalResult}</strong>
              </div>
            ` : ''}
          </div>

          <!-- Derivation Steps -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Symbolic Derivation Stages
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
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
  }
}
