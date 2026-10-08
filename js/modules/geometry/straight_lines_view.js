/**
 * OG - Module 09: Straight Lines View with 2D Canvas Graphing
 * Interactive exploration of:
 * - Slope-Intercept Form: y = m·x + c
 * - Point-Slope Form: y - y₁ = m·(x - x₁)
 * - Two-Point Form
 * - Intercepts (x-intercept and y-intercept)
 * - Angle with positive X-axis (θ = arctan(m))
 * - Perpendicular Distance to Point: d = |Ax₁ + By₁ + C| / √(A² + B²)
 * - High-DPI interactive graph with hover probe & "Open in Graph Calculator" integration.
 * ES6 Module
 */

import { CalculusGraphVisualizer } from '../calculus/graph.js';
import { ResultFormatter } from '../../math/formatter.js';

export class StraightLinesView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    // Line Parameters: y = mx + c
    this.slopeM = 1.5;
    this.interceptC = -1;

    // Test point for distance: (px, py)
    this.pointX = 2;
    this.pointY = 4;
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
                Module #09
              </span>
              <span class="badge badge-geometry">Coordinate Geometry</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Straight Lines
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Explore linear equations in two dimensions, slope-intercept forms, angle of inclination,
              collinearity, intercepts, and perpendicular distance with real-time 2D Canvas plotting.
            </p>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="#/geometry/lines" class="glass-button glass-button-primary" style="padding: 8px 18px; text-decoration: none;">
              Launch Line Analyzer 📐
            </a>
            <a href="#/graph" class="glass-button glass-button-secondary" id="btn-open-graph-calc" style="padding: 8px 18px; text-decoration: none;">
              Graph Calculator ➔
            </a>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Standard Lines:
          </div>
          <div class="calculus-preset-bar" id="line-preset-container">
            <button class="preset-chip" data-preset="diag">Identity: y = x</button>
            <button class="preset-chip" data-preset="steep">Steep: y = 2x - 3</button>
            <button class="preset-chip" data-preset="neg">Negative Slope: y = -0.5x + 2</button>
            <button class="preset-chip" data-preset="horiz">Horizontal: y = 3</button>
            <button class="preset-chip" data-preset="perp">Perpendicular: y = -2x + 1</button>
          </div>
        </div>

        <!-- Controls & Plotter Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Line Equation: y = m·x + c
            </h3>

            <div class="calculus-controls-grid" style="margin-top: 0;">
              <div class="calculus-input-group">
                <label>Slope (m):</label>
                <input type="number" step="any" id="line-input-m" class="calculus-input-field" value="${this.slopeM}">
              </div>
              <div class="calculus-input-group">
                <label>Y-Intercept (c):</label>
                <input type="number" step="any" id="line-input-c" class="calculus-input-field" value="${this.interceptC}">
              </div>
            </div>

            <div style="margin-top: 6px;">
              <div style="font-size: 0.88rem; font-weight: 600; color: var(--accent-cyan); margin-bottom: 8px;">
                Probe Point P(x₁, y₁) for Perpendicular Distance:
              </div>
              <div class="calculus-controls-grid" style="margin-top: 0;">
                <div class="calculus-input-group">
                  <label>x₁:</label>
                  <input type="number" step="any" id="line-input-px" class="calculus-input-field" value="${this.pointX}">
                </div>
                <div class="calculus-input-group">
                  <label>y₁:</label>
                  <input type="number" step="any" id="line-input-py" class="calculus-input-field" value="${this.pointY}">
                </div>
              </div>
            </div>

            <button class="glass-button glass-button-primary" id="btn-line-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Analyze Line & Distance
            </button>
          </div>

          <!-- Canvas Visualizer -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                2D Line Plotter
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Interactive Coordinates
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="line-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>Line y = mx + c</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator" style="background: #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                <span>Point P(x₁, y₁)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Derivation & Results -->
        <div id="line-results-container"></div>
      </div>
    `;
  }

  initGraph() {
    const canvas = document.getElementById('line-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }

    const eqStr = this.getExprString();
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: eqStr,
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      markers: [{ x: this.pointX, y: this.pointY, label: 'P', type: 'root' }]
    });
  }

  getExprString() {
    const m = this.slopeM;
    const c = this.interceptC;
    if (m === 0) return `${c}`;
    const mStr = m === 1 ? 'x' : m === -1 ? '-x' : `${m}*x`;
    if (c === 0) return mStr;
    return c > 0 ? `${mStr} + ${c}` : `${mStr} - ${Math.abs(c)}`;
  }

  attachEventListeners() {
    const presetContainer = document.getElementById('line-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'diag') {
          this.slopeM = 1;
          this.interceptC = 0;
          this.pointX = 1;
          this.pointY = 3;
        } else if (p === 'steep') {
          this.slopeM = 2;
          this.interceptC = -3;
          this.pointX = 2;
          this.pointY = 4;
        } else if (p === 'neg') {
          this.slopeM = -0.5;
          this.interceptC = 2;
          this.pointX = 0;
          this.pointY = 0;
        } else if (p === 'horiz') {
          this.slopeM = 0;
          this.interceptC = 3;
          this.pointX = 2;
          this.pointY = 1;
        } else if (p === 'perp') {
          this.slopeM = -2;
          this.interceptC = 1;
          this.pointX = 1;
          this.pointY = 2;
        }

        const inM = document.getElementById('line-input-m');
        const inC = document.getElementById('line-input-c');
        const inPx = document.getElementById('line-input-px');
        const inPy = document.getElementById('line-input-py');

        if (inM) inM.value = this.slopeM;
        if (inC) inC.value = this.interceptC;
        if (inPx) inPx.value = this.pointX;
        if (inPy) inPy.value = this.pointY;

        this.calculate();
      });
    }

    const btn = document.getElementById('btn-line-calculate');
    if (btn) {
      btn.addEventListener('click', () => {
        const inM = document.getElementById('line-input-m');
        const inC = document.getElementById('line-input-c');
        const inPx = document.getElementById('line-input-px');
        const inPy = document.getElementById('line-input-py');

        if (inM) this.slopeM = parseFloat(inM.value) || 0;
        if (inC) this.interceptC = parseFloat(inC.value) || 0;
        if (inPx) this.pointX = parseFloat(inPx.value) || 0;
        if (inPy) this.pointY = parseFloat(inPy.value) || 0;

        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('line-results-container');
    if (!resultsContainer) return;

    const m = this.slopeM;
    const c = this.interceptC;
    const px = this.pointX;
    const py = this.pointY;

    // Angle of inclination: θ = arctan(m) in rad and deg
    const thetaRad = Math.atan(m);
    const thetaDeg = ResultFormatter.cleanNumber((thetaRad * 180) / Math.PI);

    // Intercepts
    const yIntercept = c;
    const xIntercept = m !== 0 ? ResultFormatter.cleanNumber(-c / m) : 'None (Parallel to X-axis)';

    // General form: mx - y + c = 0 => A = m, B = -1, C = c
    // Distance formula: d = |A*x1 + B*y1 + C| / sqrt(A^2 + B^2)
    const numerator = Math.abs(m * px - py + c);
    const denominator = Math.sqrt(m * m + 1);
    const dist = ResultFormatter.cleanNumber(numerator / denominator);

    // Update graph
    const eqStr = this.getExprString();
    if (this.visualizer) {
      this.visualizer.updateOptions({
        exprStr: eqStr,
        markers: [{ x: px, y: py, label: 'P', type: 'root' }]
      });
    }

    const formulaStr = "Slope-Intercept: y = m·x + c   |   Perpendicular Distance: d = |m·x₁ - y₁ + c| / √(m² + 1)";
    const steps = [
      `1. Line Equation: y = ${m}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}`,
      `2. Slope m = ${m} ⟹ Angle of Inclination θ = arctan(${m}) = ${thetaDeg}° (${ResultFormatter.cleanNumber(thetaRad)} rad)`,
      `3. Intercepts: Y-Intercept = (0, ${yIntercept}), X-Intercept = (${xIntercept}, 0)`,
      `4. General Form: ${m}x - y ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0`,
      `5. Perpendicular Distance to Point P(${px}, ${py}):`,
      `   d = |(${m})(${px}) - (${py}) + (${c})| / √(${m}² + (-1)²)`,
      `   d = |${ResultFormatter.cleanNumber(m * px - py + c)}| / √${ResultFormatter.cleanNumber(m * m + 1)} = ${dist} units`
    ];

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Line Equation & Geometry</div>
          <div class="result-hero-value">
            y = ${m}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
          </div>
          <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; flex-wrap: wrap; gap: 16px;">
            <span>Slope m: <strong style="color: var(--accent-cyan);">${m}</strong></span>
            <span>Angle θ: <strong style="color: var(--accent-violet);">${thetaDeg}°</strong></span>
            <span>Distance to P(${px}, ${py}): <strong style="color: #10b981;">${dist} units</strong></span>
          </div>
        </div>

        <!-- Derivation -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Properties & Derivation
          </h3>
          ${steps.map(step => `
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
