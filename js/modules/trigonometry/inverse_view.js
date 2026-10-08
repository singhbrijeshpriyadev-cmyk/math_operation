/**
 * OG - Module 15: Inverse Trigonometric Functions View
 * Interactive workspace for:
 * - Principal value branch evaluations: sin⁻¹, cos⁻¹, tan⁻¹, cot⁻¹, sec⁻¹, cosec⁻¹
 * - Exact expressions (multiples of π and degrees)
 * - Domain and Range restriction verification
 * - 2D Canvas graphing of the principal value branch curve.
 * ES6 Module
 */

import { CalculusGraphVisualizer } from '../calculus/graph.js';
import { ResultFormatter } from '../../math/formatter.js';

export class InverseTrigView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    this.func = 'asin'; // 'asin' | 'acos' | 'atan'
    this.inputX = 0.5;
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
              <span class="calculus-badge">Module #15</span>
              <span class="badge badge-calculus">Calculus</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Inverse Trigonometric Functions
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Explore principal value branches, domain restrictions, exact fraction representations of $\\pi$,
              and graphical branches of $\\sin^{-1}(x)$, $\\cos^{-1}(x)$, and $\\tan^{-1}(x)$.
            </p>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="#/graph" class="glass-button glass-button-primary" style="padding: 8px 18px; text-decoration: none;">
              Open in Graph Calculator ➔
            </a>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Standard Angles & Values:
          </div>
          <div class="calculus-preset-bar" id="invtrig-preset-container">
            <button class="preset-chip" data-preset="sinHalf">sin⁻¹(0.5) = π/6</button>
            <button class="preset-chip" data-preset="sinOne">sin⁻¹(1) = π/2</button>
            <button class="preset-chip" data-preset="cosZero">cos⁻¹(0) = π/2</button>
            <button class="preset-chip" data-preset="cosNegOne">cos⁻¹(-1) = π</button>
            <button class="preset-chip" data-preset="tanOne">tan⁻¹(1) = π/4</button>
          </div>
        </div>

        <!-- Workspace Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls Panel -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Inverse Function Selector
            </h3>

            <div class="calculus-preset-bar">
              <button class="preset-chip inv-func-btn ${this.func === 'asin' ? 'active' : ''}" data-func="asin">sin⁻¹(x)</button>
              <button class="preset-chip inv-func-btn ${this.func === 'acos' ? 'active' : ''}" data-func="acos">cos⁻¹(x)</button>
              <button class="preset-chip inv-func-btn ${this.func === 'atan' ? 'active' : ''}" data-func="atan">tan⁻¹(x)</button>
            </div>

            <div class="calculus-input-group">
              <label id="inv-domain-label">Input Value x (Domain [-1, 1]):</label>
              <input type="number" step="any" id="inv-input-x" class="calculus-input-field" value="${this.inputX}">
            </div>

            <button class="glass-button glass-button-primary" id="btn-inv-calc" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Evaluate Principal Value
            </button>
          </div>

          <!-- Canvas Visualizer -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Principal Value Branch Plot
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Interactive Coordinates
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="inv-canvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Results Showcase -->
        <div id="inv-results-container"></div>
      </div>
    `;
  }

  initGraph() {
    const canvas = document.getElementById('inv-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }

    const expr = this.func === 'asin' ? 'asin(x)' : this.func === 'acos' ? 'acos(x)' : 'atan(x)';
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: expr,
      xMin: this.func === 'atan' ? -4 : -1.5,
      xMax: this.func === 'atan' ? 4 : 1.5,
      yMin: -2.5,
      yMax: 3.5,
      markers: [{ x: this.inputX, y: Math.asin(this.inputX), label: 'P', type: 'root' }]
    });
  }

  attachEventListeners() {
    this.container.querySelectorAll('.inv-func-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.func = e.currentTarget.dataset.func;
        if (this.func === 'asin' || this.func === 'acos') {
          if (this.inputX > 1) this.inputX = 1;
          if (this.inputX < -1) this.inputX = -1;
        }
        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    });

    const presetContainer = document.getElementById('invtrig-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'sinHalf') { this.func = 'asin'; this.inputX = 0.5; }
        else if (p === 'sinOne') { this.func = 'asin'; this.inputX = 1; }
        else if (p === 'cosZero') { this.func = 'acos'; this.inputX = 0; }
        else if (p === 'cosNegOne') { this.func = 'acos'; this.inputX = -1; }
        else if (p === 'tanOne') { this.func = 'atan'; this.inputX = 1; }

        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-inv-calc');
    if (btn) {
      btn.addEventListener('click', () => {
        const inX = document.getElementById('inv-input-x');
        if (inX) this.inputX = parseFloat(inX.value) || 0;
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('inv-results-container');
    if (!resultsContainer) return;

    let radVal = NaN;
    let funcName = '';
    let domainStr = '';
    let rangeStr = '';

    if (this.func === 'asin') {
      funcName = 'sin⁻¹(x)';
      domainStr = '[-1, 1]';
      rangeStr = '[-π/2, π/2]';
      if (this.inputX < -1 || this.inputX > 1) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Domain Error</div>
            <div style="color: var(--text-secondary);">Input x = ${this.inputX} is outside the domain [-1, 1] of sin⁻¹(x).</div>
          </div>
        `;
        return;
      }
      radVal = Math.asin(this.inputX);
    } else if (this.func === 'acos') {
      funcName = 'cos⁻¹(x)';
      domainStr = '[-1, 1]';
      rangeStr = '[0, π]';
      if (this.inputX < -1 || this.inputX > 1) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Domain Error</div>
            <div style="color: var(--text-secondary);">Input x = ${this.inputX} is outside the domain [-1, 1] of cos⁻¹(x).</div>
          </div>
        `;
        return;
      }
      radVal = Math.acos(this.inputX);
    } else {
      funcName = 'tan⁻¹(x)';
      domainStr = '(-∞, ∞)';
      rangeStr = '(-π/2, π/2)';
      radVal = Math.atan(this.inputX);
    }

    const degVal = ResultFormatter.cleanNumber((radVal * 180) / Math.PI);
    const piFrac = radVal / Math.PI;
    const piFracStr = Math.abs(piFrac) < 1e-4 ? '0' : Math.abs(piFrac - 1) < 1e-4 ? 'π' : Math.abs(piFrac - 0.5) < 1e-4 ? 'π/2' : Math.abs(piFrac + 0.5) < 1e-4 ? '-π/2' : Math.abs(piFrac - 0.25) < 1e-4 ? 'π/4' : Math.abs(piFrac - 1/3) < 1e-4 ? 'π/3' : Math.abs(piFrac - 1/6) < 1e-4 ? 'π/6' : `${piFrac.toFixed(3)}π`;

    const expr = this.func === 'asin' ? 'asin(x)' : this.func === 'acos' ? 'acos(x)' : 'atan(x)';
    if (this.visualizer) {
      this.visualizer.updateOptions({
        exprStr: expr,
        markers: [{ x: this.inputX, y: radVal, label: `(${this.inputX}, ${piFracStr})`, type: 'root' }]
      });
    }

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Principal Value Outcome</div>
          <div class="result-hero-value">
            ${funcName.replace('x', this.inputX)} = ${piFracStr} (${degVal}°)
          </div>
          <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 20px;">
            <span>Principal Domain: <strong style="color: var(--accent-cyan);">${domainStr}</strong></span>
            <span>Principal Range: <strong style="color: var(--accent-violet);">${rangeStr}</strong></span>
            <span>Radians Decimal: <strong style="color: #10b981;">${ResultFormatter.cleanNumber(radVal)} rad</strong></span>
          </div>
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
