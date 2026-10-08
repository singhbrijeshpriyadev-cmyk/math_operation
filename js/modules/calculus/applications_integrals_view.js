/**
 * OG - Module 21: Applications of Integrals View
 * Interactive workspace for finding:
 * 1. Area Under a Curve y = f(x)
 * 2. Area Between Two Curves y1 = f(x) and y2 = g(x)
 * with High-DPI shaded dual-curve Canvas visualization.
 * ES6 Module
 */

import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';

export class ApplicationsIntegralsView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    this.activeMode = 'between'; // 'between' | 'under'
    this.funcF = 'x';
    this.funcG = 'x^2';
    this.boundA = 0;
    this.boundB = 1;
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
              <span class="calculus-badge">Module #21</span>
              <span class="badge badge-calculus">Calculus</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Applications of Integrals
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Determine geometric areas enclosed under simple curves and between intersecting curves
              with step-by-step quadrature and vivid interactive shaded 2D plotting.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="glass-button app-i-mode-btn ${this.activeMode === 'between' ? 'active' : ''}" data-mode="between" style="padding: 8px 18px;">
              Area Between Two Curves
            </button>
            <button class="glass-button app-i-mode-btn ${this.activeMode === 'under' ? 'active' : ''}" data-mode="under" style="padding: 8px 18px;">
              Area Under Curve
            </button>
            <a href="#/graph" class="glass-button" style="padding: 8px 14px; text-decoration: none;" title="Open in Graph Calculator">
              Graph Calc ↗
            </a>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Curated Area Problems:
          </div>
          <div class="calculus-preset-bar" id="app-i-preset-container">
            <button class="preset-chip" data-preset="line-parabola">Line & Parabola: y = x and y = x² [0, 1]</button>
            <button class="preset-chip" data-preset="dual-parabola">Two Parabolas: 4 - x² and x² - 4 [-2, 2]</button>
            <button class="preset-chip" data-preset="cubic-line">Cubic & Line: x³ and x [0, 1]</button>
            <button class="preset-chip" data-preset="under-sine">Under Sine: sin(x) [0, 3.14]</button>
            <button class="preset-chip" data-preset="under-parabola">Under Parabola: x² [0, 3]</button>
          </div>
        </div>

        <!-- Controls & Canvas -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls Panel -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Bounding Functions & Limits
            </h3>

            <div class="calculus-input-group">
              <label>Primary Curve y₁ = f(x):</label>
              <input type="text" id="app-i-func-f" class="calculus-input-field" value="${this.funcF}">
            </div>

            ${this.activeMode === 'between' ? `
              <div class="calculus-input-group">
                <label>Secondary Curve y₂ = g(x):</label>
                <input type="text" id="app-i-func-g" class="calculus-input-field" value="${this.funcG}">
              </div>
            ` : ''}

            <div class="calculus-controls-grid" style="margin-top: 0;">
              <div class="calculus-input-group">
                <label>Lower Limit a:</label>
                <input type="number" step="any" id="app-i-bound-a" class="calculus-input-field" value="${this.boundA}">
              </div>
              <div class="calculus-input-group">
                <label>Upper Limit b:</label>
                <input type="number" step="any" id="app-i-bound-b" class="calculus-input-field" value="${this.boundB}">
              </div>
            </div>

            <button class="glass-button glass-button-primary" id="btn-app-i-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Calculate Enclosed Area
            </button>
          </div>

          <!-- Canvas Plotter -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Shaded Enclosed Region
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Dynamic bounded integral
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="app-i-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>f(x) Curve</span>
              </div>
              ${this.activeMode === 'between' ? `
                <div class="legend-item">
                  <span class="legend-indicator" style="background: #0E1D61; border-top: 1px dashed;"></span>
                  <span>g(x) Curve</span>
                </div>
              ` : ''}
              <div class="legend-item">
                <span class="legend-indicator" style="background: rgba(184, 154, 90, 0.45); height: 10px;"></span>
                <span>Enclosed Area</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Derivation & Results -->
        <div id="app-i-results-container"></div>
      </div>
    `;
  }

  initGraph() {
    const canvas = document.getElementById('app-i-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }

    const minX = Math.min(-1, this.boundA - 1);
    const maxX = Math.max(3, this.boundB + 1);

    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: this.funcF,
      exprGStr: this.activeMode === 'between' ? this.funcG : null,
      xMin: minX,
      xMax: maxX,
      yMin: -3,
      yMax: 5,
      shadeBounds: {
        a: this.boundA,
        b: this.boundB,
        type: this.activeMode === 'between' ? 'between' : 'under'
      }
    });
  }

  attachEventListeners() {
    this.container.querySelectorAll('.app-i-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeMode = e.currentTarget.dataset.mode;
        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    });

    const presetContainer = document.getElementById('app-i-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'line-parabola') {
          this.activeMode = 'between';
          this.funcF = 'x';
          this.funcG = 'x^2';
          this.boundA = 0;
          this.boundB = 1;
        } else if (p === 'dual-parabola') {
          this.activeMode = 'between';
          this.funcF = '4 - x^2';
          this.funcG = 'x^2 - 4';
          this.boundA = -2;
          this.boundB = 2;
        } else if (p === 'cubic-line') {
          this.activeMode = 'between';
          this.funcF = 'x';
          this.funcG = 'x^3';
          this.boundA = 0;
          this.boundB = 1;
        } else if (p === 'under-sine') {
          this.activeMode = 'under';
          this.funcF = 'sin(x)';
          this.boundA = 0;
          this.boundB = 3.1416;
        } else if (p === 'under-parabola') {
          this.activeMode = 'under';
          this.funcF = 'x^2';
          this.boundA = 0;
          this.boundB = 3;
        }

        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-app-i-calculate');
    if (btn) {
      btn.addEventListener('click', () => {
        const inF = document.getElementById('app-i-func-f');
        const inG = document.getElementById('app-i-func-g');
        const inA = document.getElementById('app-i-bound-a');
        const inB = document.getElementById('app-i-bound-b');

        if (inF) this.funcF = inF.value.trim() || 'x';
        if (inG) this.funcG = inG.value.trim() || 'x^2';
        if (inA) this.boundA = parseFloat(inA.value) || 0;
        if (inB) this.boundB = parseFloat(inB.value) || 1;

        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('app-i-results-container');
    if (!resultsContainer) return;

    let res;
    if (this.activeMode === 'between') {
      res = CalculusEngine.areaBetweenCurves(this.funcF, this.funcG, this.boundA, this.boundB);
    } else {
      res = CalculusEngine.areaUnderCurve(this.funcF, this.boundA, this.boundB);
    }

    if (!res.success) {
      resultsContainer.innerHTML = `
        <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
          <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Area Calculation Error</div>
          <div style="color: var(--text-secondary);">${res.error}</div>
        </div>
      `;
      return;
    }

    if (this.visualizer) {
      this.visualizer.updateOptions({
        exprStr: this.funcF,
        exprGStr: this.activeMode === 'between' ? this.funcG : null,
        xMin: Math.min(-1, this.boundA - 1),
        xMax: Math.max(3, this.boundB + 1),
        shadeBounds: {
          a: this.boundA,
          b: this.boundB,
          type: this.activeMode === 'between' ? 'between' : 'under'
        }
      });
    }

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Calculated Enclosed Area</div>
          <div class="result-hero-value">
            Area = ${res.result.area} sq units
          </div>
          <div style="font-size: 0.95rem; color: var(--text-secondary);">
            Bounds: <strong style="color: var(--accent-cyan);">x ∈ [${res.result.a}, ${res.result.b}]</strong> &nbsp;|&nbsp;
            ${this.activeMode === 'between' ? `
              Between: <strong style="color: #B89A5A;">y₁ = ${res.result.curveF}</strong> and <strong style="color: #0E1D61;">y₂ = ${res.result.curveG}</strong>
            ` : `
              Under Curve: <strong style="color: #B89A5A;">y = ${res.result.curve}</strong>
            `}
          </div>
        </div>

        <!-- Derivation -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Quadrature Derivation
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
