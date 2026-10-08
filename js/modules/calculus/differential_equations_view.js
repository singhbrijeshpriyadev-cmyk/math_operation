/**
 * OG - Module 22: Differential Equations View
 * Interactive classifier for Order & Degree, and analytical solver for basic first-order ODEs:
 * - Direct integration dy/dx = f(x)
 * - Exponential growth/decay dy/dx = k*y
 * - Linear first-order ODE dy/dx + P*y = Q via Integrating Factor
 * - Particular solutions via Initial Value Conditions (IVP)
 * - Solution curve Canvas plotter.
 * ES6 Module
 */

import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';

export class DifferentialEquationsView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    this.odeType = 'linear'; // 'direct' | 'exponential' | 'linear'
    this.params = {
      fx: '2x',
      k: 2,
      P: 1,
      Q: 2,
      x0: 0,
      y0: 4
    };
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
              <span class="calculus-badge">Module #22</span>
              <span class="badge badge-calculus">Calculus</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Differential Equations
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Identify differential equation order and degree, compute integrating factors (IF),
              and solve standard first-order separable and linear differential equations with initial value conditions (IVP).
            </p>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="glass-button ode-type-btn ${this.odeType === 'linear' ? 'active' : ''}" data-type="linear" style="padding: 8px 16px;">
              Linear (dy/dx + Py = Q)
            </button>
            <button class="glass-button ode-type-btn ${this.odeType === 'direct' ? 'active' : ''}" data-type="direct" style="padding: 8px 16px;">
              Direct (dy/dx = f(x))
            </button>
            <button class="glass-button ode-type-btn ${this.odeType === 'exponential' ? 'active' : ''}" data-type="exponential" style="padding: 8px 16px;">
              Growth / Decay (dy/dx = ky)
            </button>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Benchmark Presets:
          </div>
          <div class="calculus-preset-bar" id="ode-preset-container">
            <button class="preset-chip" data-preset="linear-standard">Linear: dy/dx + y = 2, y(0) = 4</button>
            <button class="preset-chip" data-preset="growth">Growth: dy/dx = 2y, y(0) = 1</button>
            <button class="preset-chip" data-preset="decay">Decay: dy/dx = -0.5y, y(0) = 5</button>
            <button class="preset-chip" data-preset="direct-quad">Direct: dy/dx = 2x, y(0) = 3</button>
            <button class="preset-chip" data-preset="direct-poly">Direct: dy/dx = 3x² - 1, y(1) = 2</button>
          </div>
        </div>

        <!-- Main Workspace -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls Panel -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Equation Parameters
            </h3>

            ${this.getInputsHtml()}

            <div style="margin-top: 6px;">
              <div style="font-size: 0.88rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 8px;">
                Initial Value Condition y(x₀) = y₀ (for Particular Solution):
              </div>
              <div class="calculus-controls-grid" style="margin-top: 0;">
                <div class="calculus-input-group">
                  <label>x₀:</label>
                  <input type="number" step="any" id="ode-x0" class="calculus-input-field" value="${this.params.x0}">
                </div>
                <div class="calculus-input-group">
                  <label>y₀:</label>
                  <input type="number" step="any" id="ode-y0" class="calculus-input-field" value="${this.params.y0}">
                </div>
              </div>
            </div>

            <button class="glass-button glass-button-primary" id="btn-ode-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Solve Differential Equation
            </button>
          </div>

          <!-- Solution Curve Canvas Visualizer -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Particular Solution Trajectory y(x)
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Passing through (x₀, y₀)
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="ode-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>Solution Curve y(x)</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator" style="background: #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                <span>Initial Condition (x₀, y₀)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Derivation & Results -->
        <div id="ode-results-container"></div>
      </div>
    `;
  }

  getInputsHtml() {
    if (this.odeType === 'direct') {
      return `
        <div class="calculus-input-group">
          <label>Derivative Function f(x):</label>
          <input type="text" id="ode-fx" class="calculus-input-field" value="${this.params.fx}" placeholder="e.g. 2x, 3x^2 - 1">
        </div>
      `;
    } else if (this.odeType === 'exponential') {
      return `
        <div class="calculus-input-group">
          <label>Growth / Decay Constant k:</label>
          <input type="number" step="any" id="ode-k" class="calculus-input-field" value="${this.params.k}" placeholder="e.g. 2, -0.5">
        </div>
      `;
    } else {
      // Linear
      return `
        <div class="calculus-controls-grid" style="margin-top: 0;">
          <div class="calculus-input-group">
            <label>Coefficient P in dy/dx + Py = Q:</label>
            <input type="number" step="any" id="ode-p" class="calculus-input-field" value="${this.params.P}">
          </div>
          <div class="calculus-input-group">
            <label>Constant Q in dy/dx + Py = Q:</label>
            <input type="number" step="any" id="ode-q" class="calculus-input-field" value="${this.params.Q}">
          </div>
        </div>
      `;
    }
  }

  initGraph() {
    const canvas = document.getElementById('ode-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: '2 + 2*exp(-x)',
      xMin: -2,
      xMax: 5,
      yMin: -1,
      yMax: 8,
      markers: [{ x: this.params.x0, y: this.params.y0, label: 'IVP', type: 'root' }]
    });
  }

  attachEventListeners() {
    this.container.querySelectorAll('.ode-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.odeType = e.currentTarget.dataset.type;
        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    });

    const presetContainer = document.getElementById('ode-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'linear-standard') {
          this.odeType = 'linear';
          this.params.P = 1;
          this.params.Q = 2;
          this.params.x0 = 0;
          this.params.y0 = 4;
        } else if (p === 'growth') {
          this.odeType = 'exponential';
          this.params.k = 2;
          this.params.x0 = 0;
          this.params.y0 = 1;
        } else if (p === 'decay') {
          this.odeType = 'exponential';
          this.params.k = -0.5;
          this.params.x0 = 0;
          this.params.y0 = 5;
        } else if (p === 'direct-quad') {
          this.odeType = 'direct';
          this.params.fx = '2x';
          this.params.x0 = 0;
          this.params.y0 = 3;
        } else if (p === 'direct-poly') {
          this.odeType = 'direct';
          this.params.fx = '3*x^2 - 1';
          this.params.x0 = 1;
          this.params.y0 = 2;
        }

        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-ode-calculate');
    if (btn) {
      btn.addEventListener('click', () => {
        const inFx = document.getElementById('ode-fx');
        const inK = document.getElementById('ode-k');
        const inP = document.getElementById('ode-p');
        const inQ = document.getElementById('ode-q');
        const inX0 = document.getElementById('ode-x0');
        const inY0 = document.getElementById('ode-y0');

        if (inFx) this.params.fx = inFx.value.trim() || '2x';
        if (inK) this.params.k = parseFloat(inK.value) || 1;
        if (inP) this.params.P = parseFloat(inP.value) || 1;
        if (inQ) this.params.Q = parseFloat(inQ.value) || 2;
        if (inX0) this.params.x0 = parseFloat(inX0.value) || 0;
        if (inY0) this.params.y0 = parseFloat(inY0.value) || 0;

        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('ode-results-container');
    if (!resultsContainer) return;

    const res = CalculusEngine.solveDifferentialEquation(this.odeType, this.params);
    if (!res.success) {
      resultsContainer.innerHTML = `
        <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
          <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Solution Error</div>
          <div style="color: var(--text-secondary);">${res.error}</div>
        </div>
      `;
      return;
    }

    // Extract plot expression from particular solution
    let plotExpr = null;
    if (res.result.particularSol) {
      const match = res.result.particularSol.match(/^y\s*=\s*(.+)$/);
      if (match) {
        plotExpr = match[1].replace(/·/g, '*');
      }
    }

    if (this.visualizer && plotExpr) {
      this.visualizer.updateOptions({
        exprStr: plotExpr,
        markers: [{ x: this.params.x0, y: this.params.y0, label: 'IVP', type: 'root' }]
      });
    }

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Differential Equation Solutions</div>
          <div class="result-hero-value" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="color: #E8E0D2; font-weight: 700;">General Solution: ${res.result.generalSol}</div>
            ${res.result.particularSol ? `
              <div style="color: #B89A5A; font-size: 1.35rem; font-weight: 700;">Particular Solution (IVP): ${res.result.particularSol}</div>
            ` : ''}
          </div>
          <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; gap: 20px;">
            <span>Order: <strong style="color: var(--accent-cyan);">${res.result.order}</strong></span>
            <span>Degree: <strong style="color: var(--accent-cyan);">${res.result.degree}</strong></span>
            <span>Condition: <strong style="color: var(--accent-violet);">y(${this.params.x0}) = ${this.params.y0}</strong></span>
          </div>
        </div>

        <!-- Derivation -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Analytical Derivation
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
