/**
 * OG - Module 18: Continuity and Differentiability View
 * Systematic verification of LHL, RHL, f(c), continuity classification,
 * and Left-Hand vs Right-Hand Derivative differentiability check.
 * ES6 Module
 */

import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';

export class ContinuityView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    this.funcExpr = 'x^2 + 1';
    this.testPointC = 2;
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
        <!-- Header -->
        <div class="calculus-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge">Module #18</span>
              <span class="badge badge-calculus">Calculus</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Continuity and Differentiability
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Verify whether a function is continuous and differentiable at a given point $x = c$
              by rigorously comparing Left-Hand Limit, Right-Hand Limit, $f(c)$, and one-sided derivatives.
            </p>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Standard Test Cases:
          </div>
          <div class="calculus-preset-bar" id="cont-preset-container">
            <button class="preset-chip" data-preset="poly">Continuous: x² + 1 at x = 2</button>
            <button class="preset-chip" data-preset="remov">Removable: (x² - 4)/(x - 2) at x = 2</button>
            <button class="preset-chip" data-preset="cusp">Non-Differentiable Cusp: abs(x) at x = 0</button>
            <button class="preset-chip" data-preset="asymp">Infinite Discontinuity: 1/x at x = 0</button>
            <button class="preset-chip" data-preset="sine">Smooth Trig: sin(x) at x = 0</button>
          </div>
        </div>

        <!-- Controls & Plotter Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Investigation Parameters
            </h3>

            <div class="calculus-input-group">
              <label>Function f(x):</label>
              <input type="text" id="cont-input-func" class="calculus-input-field" value="${this.funcExpr}" placeholder="e.g. x^2 + 1, abs(x), (x^2 - 4)/(x - 2)">
            </div>

            <div class="calculus-input-group">
              <label>Test Point c:</label>
              <input type="number" step="any" id="cont-input-c" class="calculus-input-field" value="${this.testPointC}" placeholder="e.g. 0, 2">
            </div>

            <button class="glass-button glass-button-primary" id="btn-cont-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Verify Continuity & Differentiability
            </button>
          </div>

          <!-- Canvas Visualizer -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Continuity Neighborhood Plot
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Visualizing (c - h, c + h)
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="cont-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>f(x) Curve</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator" style="background: #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                <span>Verification Point x = c</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Derivation & Results -->
        <div id="cont-results-container"></div>
      </div>
    `;
  }

  initGraph() {
    const canvas = document.getElementById('cont-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: this.funcExpr,
      xMin: this.testPointC - 4,
      xMax: this.testPointC + 4,
      yMin: -3,
      yMax: 8,
      tangentX0: this.testPointC
    });
  }

  attachEventListeners() {
    const presetContainer = document.getElementById('cont-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'poly') {
          this.funcExpr = 'x^2 + 1';
          this.testPointC = 2;
        } else if (p === 'remov') {
          this.funcExpr = '(x^2 - 4)/(x - 2)';
          this.testPointC = 2;
        } else if (p === 'cusp') {
          this.funcExpr = 'abs(x)';
          this.testPointC = 0;
        } else if (p === 'asymp') {
          this.funcExpr = '1/x';
          this.testPointC = 0;
        } else if (p === 'sine') {
          this.funcExpr = 'sin(x)';
          this.testPointC = 0;
        }
        const inF = document.getElementById('cont-input-func');
        const inC = document.getElementById('cont-input-c');
        if (inF) inF.value = this.funcExpr;
        if (inC) inC.value = this.testPointC;
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-cont-calculate');
    if (btn) {
      btn.addEventListener('click', () => {
        const inF = document.getElementById('cont-input-func');
        const inC = document.getElementById('cont-input-c');
        if (inF) this.funcExpr = inF.value.trim() || 'x^2';
        if (inC) this.testPointC = parseFloat(inC.value) || 0;
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('cont-results-container');
    if (!resultsContainer) return;

    const res = CalculusEngine.checkContinuity(this.funcExpr, this.testPointC);
    if (!res.success) {
      resultsContainer.innerHTML = `
        <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
          <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Check Failed</div>
          <div style="color: var(--text-secondary);">${res.error}</div>
        </div>
      `;
      return;
    }

    // Update graph
    if (this.visualizer) {
      this.visualizer.updateOptions({
        exprStr: this.funcExpr,
        xMin: this.testPointC - 4,
        xMax: this.testPointC + 4,
        tangentX0: this.testPointC,
        markers: [{
          x: this.testPointC,
          y: res.result.fValue !== null ? res.result.fValue : 0,
          label: 'c',
          type: res.result.isContinuous ? 'min' : 'max'
        }]
      });
    }

    const badgeColor = res.result.isContinuous ? '#10b981' : '#f43f5e';
    const diffColor = res.result.isDifferentiable ? '#10b981' : '#f43f5e';

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero Verdict -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Verification Outcome at x = ${res.result.c}</div>
          <div class="result-hero-value" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
            <span style="color: ${badgeColor};">
              Continuity: ${res.result.classification}
            </span>
            <span style="font-size: 1.1rem; color: var(--text-muted);">|</span>
            <span style="color: ${diffColor}; font-size: 1.3rem;">
              Differentiability: ${res.result.isDifferentiable ? 'Differentiable' : 'Not Differentiable'}
            </span>
          </div>
          <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 16px;">
            <span>f(${res.result.c}): <strong style="color: var(--accent-cyan);">${res.result.fValue !== null ? res.result.fValue : 'Undefined'}</strong></span>
            <span>LHL (x ➔ ${res.result.c}⁻): <strong style="color: var(--accent-cyan);">${res.result.lhl}</strong></span>
            <span>RHL (x ➔ ${res.result.c}⁺): <strong style="color: var(--accent-cyan);">${res.result.rhl}</strong></span>
            <span>LHD: <strong style="color: var(--accent-violet);">${res.result.lhd !== null ? res.result.lhd : 'N/A'}</strong></span>
            <span>RHD: <strong style="color: var(--accent-violet);">${res.result.rhd !== null ? res.result.rhd : 'N/A'}</strong></span>
          </div>
        </div>

        <!-- Derivation Steps -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Proof
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

  destroy() {
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
  }
}
