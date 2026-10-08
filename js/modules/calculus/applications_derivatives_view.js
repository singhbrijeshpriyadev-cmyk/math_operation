/**
 * OG - Module 19: Applications of Derivatives View
 * Interactive workspace for:
 * 1. Tangent and Normal lines at point x0
 * 2. Critical Points, Extrema (Local Maxima/Minima via 2nd derivative test) & Monotonicity
 * ES6 Module
 */

import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';

export class ApplicationsDerivativesView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    this.activeMode = 'tangent'; // 'tangent' | 'extrema'
    this.funcExpr = 'x^3 - 3*x';
    this.x0 = 1;
    this.rangeMin = -3.5;
    this.rangeMax = 3.5;
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
              <span class="calculus-badge">Module #19</span>
              <span class="badge badge-calculus">Calculus</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Applications of Derivatives
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Analyze geometric rates of change with tangent & normal equations, identify critical points,
              and apply the second derivative test to find local maxima, minima, and intervals of increase/decrease.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="glass-button mode-btn ${this.activeMode === 'tangent' ? 'active' : ''}" data-mode="tangent" style="padding: 8px 18px;">
              Tangent & Normal
            </button>
            <button class="glass-button mode-btn ${this.activeMode === 'extrema' ? 'active' : ''}" data-mode="extrema" style="padding: 8px 18px;">
              Extrema & Monotonicity
            </button>
            <a href="#/graph" class="glass-button" style="padding: 8px 14px; text-decoration: none;" title="Open in Graph Calculator">
              Graph Calc ↗
            </a>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Curated Functions:
          </div>
          <div class="calculus-preset-bar" id="app-d-preset-container">
            <button class="preset-chip" data-preset="cubic">Cubic: x³ - 3x (x₀ = 1)</button>
            <button class="preset-chip" data-preset="parabola">Parabola: x² - 4x + 3 (x₀ = 2)</button>
            <button class="preset-chip" data-preset="inverted">Inverted: 4 - x² (x₀ = 1)</button>
            <button class="preset-chip" data-preset="quartic">Quartic: x⁴ - 2x² (x₀ = 0.5)</button>
            <button class="preset-chip" data-preset="sine">Sine: sin(x) (x₀ = 0.78)</button>
          </div>
        </div>

        <!-- Controls & Plotter -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls Panel -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              ${this.activeMode === 'tangent' ? 'Tangent & Normal Settings' : 'Extrema Search Window'}
            </h3>

            <div class="calculus-input-group">
              <label>Function y = f(x):</label>
              <input type="text" id="app-d-func" class="calculus-input-field" value="${this.funcExpr}" placeholder="e.g. x^3 - 3*x">
            </div>

            ${this.activeMode === 'tangent' ? `
              <div class="calculus-input-group">
                <label>Point of Tangency x₀:</label>
                <input type="number" step="any" id="app-d-x0" class="calculus-input-field" value="${this.x0}">
              </div>
            ` : `
              <div class="calculus-controls-grid" style="margin-top: 0;">
                <div class="calculus-input-group">
                  <label>Domain Min x:</label>
                  <input type="number" step="any" id="app-d-rmin" class="calculus-input-field" value="${this.rangeMin}">
                </div>
                <div class="calculus-input-group">
                  <label>Domain Max x:</label>
                  <input type="number" step="any" id="app-d-rmax" class="calculus-input-field" value="${this.rangeMax}">
                </div>
              </div>
            `}

            <button class="glass-button glass-button-primary" id="btn-app-d-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Calculate & Plot
            </button>
          </div>

          <!-- Interactive 2D Graph -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Calculus Geometry Visualizer
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Interactive coordinates probe
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="app-d-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>f(x) Curve</span>
              </div>
              ${this.activeMode === 'tangent' ? `
                <div class="legend-item">
                  <span class="legend-indicator" style="background: #B89A5A;"></span>
                  <span>Tangent Line</span>
                </div>
                <div class="legend-item">
                  <span class="legend-indicator" style="background: #0E1D61; border-top: 1px dashed;"></span>
                  <span>Normal Line</span>
                </div>
              ` : `
                <div class="legend-item">
                  <span class="legend-indicator" style="background: #B89A5A; border-radius: 50%; width: 8px; height: 8px;"></span>
                  <span>Local Maxima</span>
                </div>
                <div class="legend-item">
                  <span class="legend-indicator" style="background: #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                  <span>Local Minima</span>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Results Showcase -->
        <div id="app-d-results-container"></div>
      </div>
    `;
  }

  initGraph() {
    const canvas = document.getElementById('app-d-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: this.funcExpr,
      xMin: this.rangeMin,
      xMax: this.rangeMax,
      yMin: -5,
      yMax: 5,
      tangentX0: this.activeMode === 'tangent' ? this.x0 : null,
      showNormal: this.activeMode === 'tangent'
    });
  }

  attachEventListeners() {
    this.container.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeMode = e.currentTarget.dataset.mode;
        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    });

    const presetContainer = document.getElementById('app-d-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'cubic') {
          this.funcExpr = 'x^3 - 3*x';
          this.x0 = 1;
        } else if (p === 'parabola') {
          this.funcExpr = 'x^2 - 4*x + 3';
          this.x0 = 2;
        } else if (p === 'inverted') {
          this.funcExpr = '4 - x^2';
          this.x0 = 1;
        } else if (p === 'quartic') {
          this.funcExpr = 'x^4 - 2*x^2';
          this.x0 = 0.5;
        } else if (p === 'sine') {
          this.funcExpr = 'sin(x)';
          this.x0 = 0.785;
        }
        const inF = document.getElementById('app-d-func');
        const inX0 = document.getElementById('app-d-x0');
        if (inF) inF.value = this.funcExpr;
        if (inX0) inX0.value = this.x0;
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-app-d-calculate');
    if (btn) {
      btn.addEventListener('click', () => {
        const inF = document.getElementById('app-d-func');
        const inX0 = document.getElementById('app-d-x0');
        const inRmin = document.getElementById('app-d-rmin');
        const inRmax = document.getElementById('app-d-rmax');

        if (inF) this.funcExpr = inF.value.trim() || 'x^2';
        if (inX0) this.x0 = parseFloat(inX0.value) || 0;
        if (inRmin) this.rangeMin = parseFloat(inRmin.value) || -5;
        if (inRmax) this.rangeMax = parseFloat(inRmax.value) || 5;

        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('app-d-results-container');
    if (!resultsContainer) return;

    if (this.activeMode === 'tangent') {
      const res = CalculusEngine.tangentAndNormal(this.funcExpr, this.x0);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Calculation Failed</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      if (this.visualizer) {
        this.visualizer.updateOptions({
          exprStr: this.funcExpr,
          tangentX0: this.x0,
          showNormal: true,
          markers: [{ x: this.x0, y: res.result.y0, label: 'P', type: 'root' }]
        });
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Hero -->
          <div class="calculus-result-hero">
            <div class="result-hero-label">Tangent & Normal Equations at (${res.result.x0}, ${res.result.y0})</div>
            <div class="result-hero-value" style="display: flex; flex-direction: column; gap: 8px;">
              <div style="color: #eab308;">Tangent Line: ${res.result.tangentEq}</div>
              <div style="color: #c084fc; font-size: 1.3rem;">Normal Line: ${res.result.normalEq}</div>
            </div>
            <div style="font-size: 0.95rem; color: var(--text-secondary);">
              Slope of Tangent m = <strong style="color: #eab308;">${res.result.slope}</strong> &nbsp;|&nbsp;
              Slope of Normal mₙ = <strong style="color: #c084fc;">${res.result.normalSlope !== null ? res.result.normalSlope : 'Undefined (Vertical)'}</strong>
            </div>
          </div>

          <!-- Derivation -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Step-by-Step Derivation
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
      // Extrema and Monotonicity
      const res = CalculusEngine.extremaAndMonotonicity(this.funcExpr, this.rangeMin, this.rangeMax);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Analysis Failed</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      if (this.visualizer) {
        this.visualizer.updateOptions({
          exprStr: this.funcExpr,
          tangentX0: null,
          showNormal: false,
          markers: res.result.criticalPoints.map(cp => ({
            x: cp.x,
            y: cp.y,
            type: cp.type
          }))
        });
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Hero -->
          <div class="calculus-result-hero">
            <div class="result-hero-label">Critical Points & Extrema Summary</div>
            <div class="result-hero-value" style="font-size: 1.25rem;">
              ${res.result.criticalPoints.length === 0 ? 'No Critical Points in domain window' : res.result.criticalPoints.map(cp => `
                <div style="color: ${cp.type === 'Local Maximum' ? '#ef4444' : '#10b981'}; margin-bottom: 6px;">
                  • ${cp.type} at (${cp.x}, ${cp.y}) [f''(${cp.x}) = ${cp.secD}]
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Monotonicity Intervals Table -->
          <div class="glass-panel" style="padding: 20px;">
            <h4 style="margin: 0 0 12px 0; color: var(--text-white); font-size: 1.05rem;">
              Monotonicity Intervals
            </h4>
            <table class="limit-approach-table">
              <thead>
                <tr>
                  <th>Interval</th>
                  <th>Test Point</th>
                  <th>f'(x) Slope</th>
                  <th>Behavior</th>
                </tr>
              </thead>
              <tbody>
                ${res.result.intervals.map(iv => `
                  <tr>
                    <td><strong>${iv.interval}</strong></td>
                    <td>${iv.testPoint}</td>
                    <td>${iv.slope}</td>
                    <td style="color: ${iv.slope > 0 ? '#10b981' : '#f43f5e'}; font-weight: 600;">${iv.behavior}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Derivation Steps -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Full Mathematical Analysis Steps
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
