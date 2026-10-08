/**
 * OG - Module 10: Conic Sections View with 2D Canvas Graphing
 * Interactive exploration of:
 * - Circle: (x - h)² + (y - k)² = r²
 * - Parabola: Standard forms y = a·x² and y² = 4ax
 * - Ellipse: x²/a² + y²/b² = 1 (Foci, Eccentricity e, Major/Minor Axes)
 * - Hyperbola: x²/a² - y²/b² = 1 (Asymptotes y = ±(b/a)x, Foci, Eccentricity)
 * High-DPI 2D plotter with conic parameter derivation and Graph Calculator integration.
 * ES6 Module
 */

import { CalculusGraphVisualizer } from '../calculus/graph.js';
import { ResultFormatter } from '../../math/formatter.js';

export class ConicSectionsView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    this.conicType = 'parabola'; // 'parabola' | 'circle' | 'ellipse' | 'hyperbola'
    this.paramA = 2;
    this.paramB = 1;
    this.centerH = 0;
    this.centerK = 0;
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
              <span class="calculus-badge" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.35); color: #10b981;">
                Module #10
              </span>
              <span class="badge badge-geometry">Coordinate Geometry</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Conic Sections
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Explore standard geometric conic sections including circles, parabolas, ellipses, and hyperbolas
              with foci, directrices, eccentricities, and real-time 2D Canvas plotting.
            </p>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="#/geometry/conics" class="glass-button glass-button-primary" style="padding: 8px 18px; text-decoration: none;">
              Launch Conic Analyzer 📐
            </a>
            <a href="#/graph" class="glass-button glass-button-secondary" id="btn-conic-graph-calc" style="padding: 8px 18px; text-decoration: none;">
              Graph Calculator ➔
            </a>
          </div>
        </div>

        <!-- Conic Type Tabs -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Conic Category:
          </div>
          <div class="calculus-preset-bar">
            <button class="preset-chip conic-chip ${this.conicType === 'parabola' ? 'active' : ''}" data-type="parabola">Parabola (y = ax²)</button>
            <button class="preset-chip conic-chip ${this.conicType === 'circle' ? 'active' : ''}" data-type="circle">Circle (r² = x² + y²)</button>
            <button class="preset-chip conic-chip ${this.conicType === 'ellipse' ? 'active' : ''}" data-type="ellipse">Ellipse (x²/a² + y²/b² = 1)</button>
            <button class="preset-chip conic-chip ${this.conicType === 'hyperbola' ? 'active' : ''}" data-type="hyperbola">Hyperbola (x²/a² - y²/b² = 1)</button>
          </div>
        </div>

        <!-- Controls & Plotter Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls Panel -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Conic Geometric Parameters
            </h3>

            ${this.getInputsHtml()}

            <button class="glass-button glass-button-primary" id="btn-conic-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Analyze & Render Conic
            </button>
          </div>

          <!-- Canvas Visualizer -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Conic Coordinate Visualizer
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                High-DPI Plot
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="conic-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>Upper / Primary Branch</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator" style="background: #0E1D61; border-top: 1px dashed;"></span>
                <span>Lower / Conjugate Branch</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A; border: 1.5px solid #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                <span>Foci / Vertex</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Derivation & Results -->
        <div id="conic-results-container"></div>
      </div>
    `;
  }

  getInputsHtml() {
    if (this.conicType === 'parabola') {
      return `
        <div class="calculus-input-group">
          <label>Leading Coefficient a in y = a·x²:</label>
          <input type="number" step="any" id="conic-param-a" class="calculus-input-field" value="${this.paramA}">
        </div>
      `;
    } else if (this.conicType === 'circle') {
      return `
        <div class="calculus-input-group">
          <label>Radius r:</label>
          <input type="number" step="any" min="0.1" id="conic-param-a" class="calculus-input-field" value="${this.paramA}">
        </div>
      `;
    } else {
      // Ellipse or Hyperbola
      return `
        <div class="calculus-controls-grid" style="margin-top: 0;">
          <div class="calculus-input-group">
            <label>Semi-Major / Transverse Axis a:</label>
            <input type="number" step="any" min="0.1" id="conic-param-a" class="calculus-input-field" value="${this.paramA}">
          </div>
          <div class="calculus-input-group">
            <label>Semi-Minor / Conjugate Axis b:</label>
            <input type="number" step="any" min="0.1" id="conic-param-b" class="calculus-input-field" value="${this.paramB}">
          </div>
        </div>
      `;
    }
  }

  initGraph() {
    const canvas = document.getElementById('conic-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }

    const { exprUpper, exprLower, markers } = this.getConicExpressions();
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: exprUpper,
      exprGStr: exprLower,
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      markers
    });
  }

  getConicExpressions() {
    const a = this.paramA;
    const b = this.paramB;

    if (this.conicType === 'parabola') {
      // y = a*x^2
      const focusY = a !== 0 ? ResultFormatter.cleanNumber(1 / (4 * a)) : 0;
      return {
        exprUpper: `${a}*x^2`,
        exprLower: null,
        markers: [
          { x: 0, y: 0, label: 'V(0,0)', type: 'min' },
          { x: 0, y: focusY, label: `F(0,${focusY})`, type: 'root' }
        ]
      };
    } else if (this.conicType === 'circle') {
      // y = ± sqrt(r^2 - x^2)
      const r2 = a * a;
      return {
        exprUpper: `sqrt(${r2} - x^2)`,
        exprLower: `-sqrt(${r2} - x^2)`,
        markers: [{ x: 0, y: 0, label: 'C(0,0)', type: 'root' }]
      };
    } else if (this.conicType === 'ellipse') {
      // y = ± b * sqrt(1 - x^2/a^2)
      const e = Math.sqrt(Math.max(0, 1 - (b * b) / (a * a)));
      const cFocus = ResultFormatter.cleanNumber(a * e);
      return {
        exprUpper: `${b} * sqrt(1 - (x^2 / ${a * a}))`,
        exprLower: `-${b} * sqrt(1 - (x^2 / ${a * a}))`,
        markers: [
          { x: cFocus, y: 0, label: 'F₁', type: 'root' },
          { x: -cFocus, y: 0, label: 'F₂', type: 'root' }
        ]
      };
    } else {
      // Hyperbola: y = ± b * sqrt(x^2/a^2 - 1)
      const e = Math.sqrt(1 + (b * b) / (a * a));
      const cFocus = ResultFormatter.cleanNumber(a * e);
      return {
        exprUpper: `${b} * sqrt((x^2 / ${a * a}) - 1)`,
        exprLower: `-${b} * sqrt((x^2 / ${a * a}) - 1)`,
        markers: [
          { x: cFocus, y: 0, label: 'F₁', type: 'root' },
          { x: -cFocus, y: 0, label: 'F₂', type: 'root' }
        ]
      };
    }
  }

  attachEventListeners() {
    this.container.querySelectorAll('.conic-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        this.conicType = e.currentTarget.dataset.type;
        if (this.conicType === 'parabola') {
          this.paramA = 1;
        } else if (this.conicType === 'circle') {
          this.paramA = 3;
        } else if (this.conicType === 'ellipse') {
          this.paramA = 3;
          this.paramB = 2;
        } else if (this.conicType === 'hyperbola') {
          this.paramA = 2;
          this.paramB = 1.5;
        }
        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    });

    const btn = document.getElementById('btn-conic-calculate');
    if (btn) {
      btn.addEventListener('click', () => {
        const inA = document.getElementById('conic-param-a');
        const inB = document.getElementById('conic-param-b');
        if (inA) this.paramA = parseFloat(inA.value) || 1;
        if (inB) this.paramB = parseFloat(inB.value) || 1;
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('conic-results-container');
    if (!resultsContainer) return;

    const a = this.paramA;
    const b = this.paramB;

    const { exprUpper, exprLower, markers } = this.getConicExpressions();
    if (this.visualizer) {
      this.visualizer.updateOptions({
        exprStr: exprUpper,
        exprGStr: exprLower,
        markers
      });
    }

    let eqStr = '';
    let detailsHtml = '';

    if (this.conicType === 'parabola') {
      const focusY = ResultFormatter.cleanNumber(1 / (4 * a));
      eqStr = `y = ${a}x²`;
      detailsHtml = `
        <span>Focus: <strong style="color: var(--accent-cyan);">(0, ${focusY})</strong></span>
        <span>Directrix: <strong style="color: var(--accent-violet);">y = -${focusY}</strong></span>
        <span>Latus Rectum: <strong style="color: #10b981;">${ResultFormatter.cleanNumber(1 / a)}</strong></span>
      `;
    } else if (this.conicType === 'circle') {
      eqStr = `x² + y² = ${a * a}`;
      detailsHtml = `
        <span>Center: <strong style="color: var(--accent-cyan);">(0, 0)</strong></span>
        <span>Radius r: <strong style="color: #10b981;">${a} units</strong></span>
        <span>Area: <strong style="color: var(--accent-violet);">${ResultFormatter.cleanNumber(Math.PI * a * a)} π sq units</strong></span>
      `;
    } else if (this.conicType === 'ellipse') {
      const e = Math.sqrt(Math.max(0, 1 - (b * b) / (a * a)));
      const cFocus = ResultFormatter.cleanNumber(a * e);
      eqStr = `x² / ${a * a} + y² / ${b * b} = 1`;
      detailsHtml = `
        <span>Eccentricity e: <strong style="color: var(--accent-cyan);">${ResultFormatter.cleanNumber(e)}</strong></span>
        <span>Foci: <strong style="color: var(--accent-violet);">(±${cFocus}, 0)</strong></span>
        <span>Major Axis: <strong style="color: #10b981;">${2 * a}</strong> | Minor Axis: <strong style="color: #10b981;">${2 * b}</strong></span>
      `;
    } else {
      const e = Math.sqrt(1 + (b * b) / (a * a));
      const cFocus = ResultFormatter.cleanNumber(a * e);
      eqStr = `x² / ${a * a} - y² / ${b * b} = 1`;
      detailsHtml = `
        <span>Eccentricity e: <strong style="color: var(--accent-cyan);">${ResultFormatter.cleanNumber(e)}</strong></span>
        <span>Foci: <strong style="color: var(--accent-violet);">(±${cFocus}, 0)</strong></span>
        <span>Asymptotes: <strong style="color: #eab308;">y = ±${ResultFormatter.cleanNumber(b / a)}x</strong></span>
      `;
    }

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Standard Conic Equation</div>
          <div class="result-hero-value">
            ${eqStr}
          </div>
          <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 20px;">
            ${detailsHtml}
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
