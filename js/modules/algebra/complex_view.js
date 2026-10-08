/**
 * OG - Module 04: Complex Numbers & Quadratic Equations View
 * Interactive exploration of:
 * - Complex Arithmetic: Addition, Subtraction, Multiplication, Division
 * - Modulus |z| = √(a² + b²), Conjugate z̄ = a - bi, Argument θ = atan2(b, a)
 * - Polar & Euler Form: r·(cos θ + i·sin θ) = r·e^(iθ)
 * - Quadratic Equations: ax² + bx + c = 0 with complex discriminant Δ = b² - 4ac
 * - Interactive Argand Plane 2D Canvas Visualization
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class ComplexNumbersView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.activeTab = 'arithmetic'; // 'arithmetic' | 'polar' | 'quadratic'

    // Arithmetic operands
    this.z1Real = 3;
    this.z1Imag = 4;
    this.z2Real = 1;
    this.z2Imag = -2;
    this.operation = 'add'; // 'add' | 'sub' | 'mul' | 'div'

    // Quadratic parameters: ax² + bx + c = 0
    this.quadA = 1;
    this.quadB = 4;
    this.quadC = 13;

    this.latestResult = null;
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.calculate();
  }

  destroy() {
    // Clean up if needed
  }

  render() {
    this.container.innerHTML = `
      <div class="calculus-container view-animate-in">
        <!-- Header -->
        <div class="calculus-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge" style="background: rgba(184, 154, 90, 0.15); border-color: rgba(184, 154, 90, 0.4); color: #0E1D61;">
                Module #04
              </span>
              <span class="badge badge-algebra">Algebra</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Complex Numbers & Quadratic Equations
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Compute complex arithmetic, conjugates, modulus, polar forms, and solve quadratic equations
              with real and complex roots, accompanied by an interactive Argand plane.
            </p>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="#/calculator" class="glass-btn glass-btn-outline" style="text-decoration: none;">
              <span>Open Calculator</span>
              ${SVG_ICONS.arrowRight}
            </a>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Quick Presets:
          </div>
          <div class="calculus-preset-bar" id="complex-preset-container">
            <button class="preset-chip" data-preset="pythag">Pythagorean: 3 + 4i</button>
            <button class="preset-chip" data-preset="euler">Euler Unit: 1 + i</button>
            <button class="preset-chip" data-preset="pure-imag">Pure Imaginary: 0 + 5i</button>
            <button class="preset-chip" data-preset="quad-complex">Roots of x² + 4x + 13 = 0</button>
            <button class="preset-chip" data-preset="quad-real">Roots of x² - 5x + 6 = 0</button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div style="display: flex; gap: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <button class="glass-btn ${this.activeTab === 'arithmetic' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-tab="arithmetic">
            Complex Arithmetic
          </button>
          <button class="glass-btn ${this.activeTab === 'polar' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-tab="polar">
            Modulus, Conjugate & Polar Form
          </button>
          <button class="glass-btn ${this.activeTab === 'quadratic' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-tab="quadratic">
            Quadratic Equations
          </button>
        </div>

        <!-- Layout Grid -->
        <div class="calculus-controls-grid" style="grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Controls Column -->
          <div class="glass-panel" style="padding: 24px;">
            <div id="complex-inputs-container">
              ${this.renderInputsHtml()}
            </div>
          </div>

          <!-- Visualization / Argand Column -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                Argand Plane (Complex Plane)
              </span>
              <span style="font-size: 0.8rem; color: var(--cyan-primary); font-family: var(--font-math);">
                Re(z) vs Im(z)
              </span>
            </div>
            <div style="width: 100%; max-width: 360px; height: 320px; background: rgba(9, 13, 22, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); position: relative; overflow: hidden;">
              <canvas id="argand-canvas" width="360" height="320" style="display: block; width: 100%; height: 100%;"></canvas>
            </div>
          </div>
        </div>

        <!-- Result & Step-by-Step Solution Hero -->
        <div id="complex-results-container"></div>
      </div>
    `;
  }

  renderInputsHtml() {
    if (this.activeTab === 'quadratic') {
      return `
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Solve ax² + bx + c = 0</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="calculus-input-group">
            <label>Coefficient a:</label>
            <input type="number" step="any" id="quad-a" class="calculus-input-field" value="${this.quadA}">
          </div>
          <div class="calculus-input-group">
            <label>Coefficient b:</label>
            <input type="number" step="any" id="quad-b" class="calculus-input-field" value="${this.quadB}">
          </div>
          <div class="calculus-input-group">
            <label>Constant c:</label>
            <input type="number" step="any" id="quad-c" class="calculus-input-field" value="${this.quadC}">
          </div>
          <button class="glass-btn glass-btn-primary" id="btn-calc-complex" style="margin-top: 8px;">
            <span>Solve Quadratic Equation</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>
      `;
    }

    if (this.activeTab === 'polar') {
      return `
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Complex Number z = a + bi</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="calculus-input-group">
            <label>Real Part (a):</label>
            <input type="number" step="any" id="z1-real" class="calculus-input-field" value="${this.z1Real}">
          </div>
          <div class="calculus-input-group">
            <label>Imaginary Part (b):</label>
            <input type="number" step="any" id="z1-imag" class="calculus-input-field" value="${this.z1Imag}">
          </div>
          <button class="glass-btn glass-btn-primary" id="btn-calc-complex" style="margin-top: 8px;">
            <span>Analyze Modulus & Polar Form</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>
      `;
    }

    // Default: Arithmetic
    return `
      <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Binary Complex Operations</h3>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="calculus-input-group">
            <label>z₁ Real Part (a₁):</label>
            <input type="number" step="any" id="z1-real" class="calculus-input-field" value="${this.z1Real}">
          </div>
          <div class="calculus-input-group">
            <label>z₁ Imag Part (b₁):</label>
            <input type="number" step="any" id="z1-imag" class="calculus-input-field" value="${this.z1Imag}">
          </div>
        </div>

        <div class="calculus-input-group">
          <label>Operation:</label>
          <select id="complex-op" class="calculus-input-field" style="background: rgba(15, 23, 42, 0.85);">
            <option value="add" ${this.operation === 'add' ? 'selected' : ''}>Addition (z₁ + z₂)</option>
            <option value="sub" ${this.operation === 'sub' ? 'selected' : ''}>Subtraction (z₁ - z₂)</option>
            <option value="mul" ${this.operation === 'mul' ? 'selected' : ''}>Multiplication (z₁ × z₂)</option>
            <option value="div" ${this.operation === 'div' ? 'selected' : ''}>Division (z₁ / z₂)</option>
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="calculus-input-group">
            <label>z₂ Real Part (a₂):</label>
            <input type="number" step="any" id="z2-real" class="calculus-input-field" value="${this.z2Real}">
          </div>
          <div class="calculus-input-group">
            <label>z₂ Imag Part (b₂):</label>
            <input type="number" step="any" id="z2-imag" class="calculus-input-field" value="${this.z2Imag}">
          </div>
        </div>

        <button class="glass-btn glass-btn-primary" id="btn-calc-complex" style="margin-top: 8px;">
          <span>Calculate Operation</span>
          ${SVG_ICONS.arrowRight}
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    // Tab switching
    this.container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
        this.attachEventListeners();
        this.calculate();
      });
    });

    // Presets
    this.container.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-preset');
        if (p === 'pythag') {
          this.activeTab = 'polar';
          this.z1Real = 3;
          this.z1Imag = 4;
        } else if (p === 'euler') {
          this.activeTab = 'polar';
          this.z1Real = 1;
          this.z1Imag = 1;
        } else if (p === 'pure-imag') {
          this.activeTab = 'polar';
          this.z1Real = 0;
          this.z1Imag = 5;
        } else if (p === 'quad-complex') {
          this.activeTab = 'quadratic';
          this.quadA = 1;
          this.quadB = 4;
          this.quadC = 13;
        } else if (p === 'quad-real') {
          this.activeTab = 'quadratic';
          this.quadA = 1;
          this.quadB = -5;
          this.quadC = 6;
        }
        this.render();
        this.attachEventListeners();
        this.calculate();
      });
    });

    // Calculate action
    const calcBtn = document.getElementById('btn-calc-complex');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => this.handleCalculateFromInputs());
    }

    // Dynamic inputs
    ['z1-real', 'z1-imag', 'z2-real', 'z2-imag', 'quad-a', 'quad-b', 'quad-c', 'complex-op'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.handleCalculateFromInputs());
        el.addEventListener('change', () => this.handleCalculateFromInputs());
      }
    });
  }

  handleCalculateFromInputs() {
    const z1r = document.getElementById('z1-real');
    const z1i = document.getElementById('z1-imag');
    const z2r = document.getElementById('z2-real');
    const z2i = document.getElementById('z2-imag');
    const op = document.getElementById('complex-op');
    const qa = document.getElementById('quad-a');
    const qb = document.getElementById('quad-b');
    const qc = document.getElementById('quad-c');

    if (z1r) this.z1Real = parseFloat(z1r.value) || 0;
    if (z1i) this.z1Imag = parseFloat(z1i.value) || 0;
    if (z2r) this.z2Real = parseFloat(z2r.value) || 0;
    if (z2i) this.z2Imag = parseFloat(z2i.value) || 0;
    if (op) this.operation = op.value;
    if (qa) this.quadA = parseFloat(qa.value) || 1;
    if (qb) this.quadB = parseFloat(qb.value) || 0;
    if (qc) this.quadC = parseFloat(qc.value) || 0;

    this.calculate();
  }

  calculate() {
    const resContainer = document.getElementById('complex-results-container');
    if (!resContainer) return;

    if (this.activeTab === 'quadratic') {
      this.calculateQuadratic(resContainer);
    } else if (this.activeTab === 'polar') {
      this.calculatePolar(resContainer);
    } else {
      this.calculateArithmetic(resContainer);
    }
  }

  calculateArithmetic(container) {
    const a1 = this.z1Real, b1 = this.z1Imag;
    const a2 = this.z2Real, b2 = this.z2Imag;
    let resReal = 0, resImag = 0, exprStr = '', formulaStr = '', steps = [];

    const formatComplex = (r, i) => {
      const sign = i >= 0 ? '+' : '-';
      return `${r} ${sign} ${Math.abs(i)}i`;
    };

    if (this.operation === 'add') {
      resReal = a1 + a2;
      resImag = b1 + b2;
      exprStr = `(${formatComplex(a1, b1)}) + (${formatComplex(a2, b2)})`;
      formulaStr = `(a₁ + a₂) + (b₁ + b₂)i`;
      steps = [
        `Combine real components: ${a1} + (${a2}) = ${resReal}`,
        `Combine imaginary components: ${b1} + (${b2}) = ${resImag}`,
        `Result: ${formatComplex(resReal, resImag)}`
      ];
    } else if (this.operation === 'sub') {
      resReal = a1 - a2;
      resImag = b1 - b2;
      exprStr = `(${formatComplex(a1, b1)}) - (${formatComplex(a2, b2)})`;
      formulaStr = `(a₁ - a₂) + (b₁ - b₂)i`;
      steps = [
        `Subtract real components: ${a1} - (${a2}) = ${resReal}`,
        `Subtract imaginary components: ${b1} - (${b2}) = ${resImag}`,
        `Result: ${formatComplex(resReal, resImag)}`
      ];
    } else if (this.operation === 'mul') {
      resReal = a1 * a2 - b1 * b2;
      resImag = a1 * b2 + a2 * b1;
      exprStr = `(${formatComplex(a1, b1)}) × (${formatComplex(a2, b2)})`;
      formulaStr = `(a₁a₂ - b₁b₂) + (a₁b₂ + a₂b₁)i`;
      steps = [
        `Expand: (${a1})(${a2}) + (${a1})(${b2}i) + (${b1}i)(${a2}) + (${b1}i)(${b2}i)`,
        `Apply i² = -1: ${a1 * a2} - (${b1 * b2}) = ${resReal}`,
        `Combine imaginary: ${a1 * b2} + ${a2 * b1} = ${resImag}`,
        `Result: ${formatComplex(resReal, resImag)}`
      ];
    } else {
      const denom = a2 * a2 + b2 * b2;
      if (denom === 0) {
        container.innerHTML = `<div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">Division by zero complex number (z₂ = 0).</div>`;
        return;
      }
      resReal = Number(((a1 * a2 + b1 * b2) / denom).toFixed(6));
      resImag = Number(((b1 * a2 - a1 * b2) / denom).toFixed(6));
      exprStr = `(${formatComplex(a1, b1)}) / (${formatComplex(a2, b2)})`;
      formulaStr = `[(a₁a₂ + b₁b₂) / (a₂² + b₂²)] + [(b₁a₂ - a₁b₂) / (a₂² + b₂²)]i`;
      steps = [
        `Multiply numerator and denominator by conjugate of z₂ (${a2} - ${b2}i)`,
        `Denominator |z₂|² = ${a2}² + (${b2})² = ${denom}`,
        `Numerator real part: (${a1})(${a2}) + (${b1})(${b2}) = ${a1 * a2 + b1 * b2}`,
        `Numerator imaginary part: (${b1})(${a2}) - (${a1})(${b2}) = ${b1 * a2 - a1 * b2}`,
        `Result: ${formatComplex(resReal, resImag)}`
      ];
    }

    const finalResultStr = formatComplex(resReal, resImag);
    this.renderResultBox(container, exprStr, formulaStr, steps, finalResultStr);
    this.drawArgand([
      { r: a1, i: b1, label: 'z₁', color: '#B89A5A' },
      { r: a2, i: b2, label: 'z₂', color: '#0E1D61' },
      { r: resReal, i: resImag, label: 'Result', color: '#B89A5A' }
    ]);

    // Record into history
    store.addHistoryItem(exprStr, finalResultStr, 'Complex Numbers and Quadratic Equations', 'complex-numbers');
  }

  calculatePolar(container) {
    const a = this.z1Real, b = this.z1Imag;
    const modR = Math.sqrt(a * a + b * b);
    const argThetaRad = Math.atan2(b, a);
    const argThetaDeg = (argThetaRad * 180) / Math.PI;

    const formatComplex = (r, i) => `${r} ${i >= 0 ? '+' : '-'} ${Math.abs(i)}i`;
    const exprStr = `z = ${formatComplex(a, b)}`;
    const formulaStr = `|z| = √(a² + b²), θ = Arg(z) = atan2(b, a), z = r·(cos θ + i·sin θ)`;
    const steps = [
      `Modulus r = √[(${a})² + (${b})²] = √${(a*a + b*b).toFixed(2)} = ${modR.toFixed(4)}`,
      `Conjugate z̄ = ${a} - (${b})i = ${formatComplex(a, -b)}`,
      `Principal Argument θ = ${argThetaRad.toFixed(4)} rad (${argThetaDeg.toFixed(2)}°)`,
      `Polar Form: ${modR.toFixed(4)} · [cos(${argThetaDeg.toFixed(1)}°) + i·sin(${argThetaDeg.toFixed(1)}°)]`,
      `Euler Exponential Form: ${modR.toFixed(4)} · e^(${argThetaRad.toFixed(4)}i)`
    ];
    const finalResultStr = `|z| = ${modR.toFixed(4)}, θ = ${argThetaDeg.toFixed(2)}°`;

    this.renderResultBox(container, exprStr, formulaStr, steps, finalResultStr);
    this.drawArgand([
      { r: a, i: b, label: 'z', color: '#B89A5A' },
      { r: a, i: -b, label: 'z̄', color: '#0E1D61' }
    ]);

    store.addHistoryItem(`|${formatComplex(a, b)}|`, finalResultStr, 'Complex Numbers and Quadratic Equations', 'complex-numbers');
  }

  calculateQuadratic(container) {
    const a = this.quadA, b = this.quadB, c = this.quadC;
    if (a === 0) {
      container.innerHTML = `<div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">a cannot be zero in a quadratic equation.</div>`;
      return;
    }

    const disc = b * b - 4 * a * c;
    const exprStr = `${a}x² + ${b}x + ${c} = 0`;
    const formulaStr = `Δ = b² - 4ac, x = (-b ± √Δ) / (2a)`;
    let finalResultStr = '', steps = [];

    if (disc > 0) {
      const sqrtD = Math.sqrt(disc);
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);
      finalResultStr = `x₁ = ${r1.toFixed(4)}, x₂ = ${r2.toFixed(4)}`;
      steps = [
        `Discriminant Δ = (${b})² - 4·(${a})·(${c}) = ${disc} (> 0, Real and distinct roots)`,
        `x = [-(${b}) ± √${disc}] / (2·${a})`,
        `x₁ = (${-b} + ${sqrtD.toFixed(4)}) / ${2 * a} = ${r1.toFixed(4)}`,
        `x₂ = (${-b} - ${sqrtD.toFixed(4)}) / ${2 * a} = ${r2.toFixed(4)}`
      ];
      this.drawArgand([
        { r: r1, i: 0, label: 'x₁', color: '#B89A5A' },
        { r: r2, i: 0, label: 'x₂', color: '#0E1D61' }
      ]);
    } else if (disc === 0) {
      const r = -b / (2 * a);
      finalResultStr = `x = ${r.toFixed(4)} (Repeated)`;
      steps = [
        `Discriminant Δ = (${b})² - 4·(${a})·(${c}) = 0 (Real and equal roots)`,
        `x = -(${b}) / (2·${a}) = ${r.toFixed(4)}`
      ];
      this.drawArgand([{ r: r, i: 0, label: 'x', color: '#B89A5A' }]);
    } else {
      const sqrtAbsD = Math.sqrt(-disc);
      const realPart = -b / (2 * a);
      const imagPart = sqrtAbsD / (2 * a);
      finalResultStr = `x = ${realPart.toFixed(4)} ± ${Math.abs(imagPart).toFixed(4)}i`;
      steps = [
        `Discriminant Δ = (${b})² - 4·(${a})·(${c}) = ${disc} (< 0, Complex conjugate roots)`,
        `√Δ = √(${disc}) = ${sqrtAbsD.toFixed(4)}i`,
        `x = [-(${b}) ± ${sqrtAbsD.toFixed(4)}i] / (2·${a})`,
        `x₁ = ${realPart.toFixed(4)} + ${Math.abs(imagPart).toFixed(4)}i`,
        `x₂ = ${realPart.toFixed(4)} - ${Math.abs(imagPart).toFixed(4)}i`
      ];
      this.drawArgand([
        { r: realPart, i: imagPart, label: 'x₁', color: '#B89A5A' },
        { r: realPart, i: -imagPart, label: 'x₂', color: '#0E1D61' }
      ]);
    }

    this.renderResultBox(container, exprStr, formulaStr, steps, finalResultStr);
    store.addHistoryItem(`Roots of ${exprStr}`, finalResultStr, 'Complex Numbers and Quadratic Equations', 'complex-numbers');
  }

  renderResultBox(container, expr, formula, steps, result) {
    container.innerHTML = `
      <div class="glass-panel" style="padding: 24px; margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-tertiary); text-transform: uppercase;">Problem:</span>
            <div style="font-family: var(--font-math); font-size: 1.25rem; font-weight: 700; color: var(--text-white);">${expr}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="padding: 10px 18px; background: rgba(0,0,0,0.4); border: 1px solid rgba(0,242,254,0.3); border-radius: var(--radius-lg); font-family: var(--font-math); font-size: 1.3rem; font-weight: 800; color: var(--cyan-primary); text-shadow: 0 0 16px rgba(0,242,254,0.4);">
              = ${result}
            </div>
            <button class="glass-btn glass-btn-icon" id="btn-copy-complex-result" title="Copy result">
              ${SVG_ICONS.copy}
            </button>
          </div>
        </div>

        <div style="padding: 14px 18px; background: rgba(15,23,42,0.6); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 18px; font-family: var(--font-math); font-size: 0.95rem; color: var(--text-secondary);">
          <strong style="color: var(--cyan-primary);">Formula:</strong> ${formula}
        </div>

        <h4 style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Step-by-Step Calculation:</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${steps.map((st, i) => `
            <div style="padding: 12px 16px; background: rgba(15,23,42,0.45); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-md); font-family: var(--font-math); font-size: 0.92rem;">
              <span style="color: var(--cyan-primary); font-weight: 700; margin-right: 8px;">Step ${i + 1}:</span>
              <span>${st}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const copyBtn = document.getElementById('btn-copy-complex-result');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyToClipboard(result, 'Result copied to clipboard!');
      });
    }
  }

  drawArgand(points = []) {
    const canvas = document.getElementById('argand-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    // Fill subtle Ivory glass background
    ctx.fillStyle = '#E8E0D2';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // Determine scale based on max coordinate
    let maxCoord = 5;
    points.forEach(p => {
      maxCoord = Math.max(maxCoord, Math.abs(p.r) + 1, Math.abs(p.i) + 1);
    });
    const scale = (w * 0.4) / maxCoord;

    // Grid lines in subtle Gold
    ctx.strokeStyle = 'rgba(184, 154, 90, 0.2)';
    ctx.lineWidth = 1;
    for (let r = -Math.ceil(maxCoord); r <= Math.ceil(maxCoord); r++) {
      if (r === 0) continue;
      const x = cx + r * scale;
      const y = cy - r * scale;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
      ctx.moveTo(0, y); ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes in Deep Atlas Navy
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    // Axis labels in Deep Atlas Navy
    ctx.fillStyle = 'rgba(14, 29, 97, 0.7)';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.fillText('Re', w - 24, cy - 8);
    ctx.fillText('Im', cx + 8, 18);

    // Plot points & vectors from origin
    points.forEach(p => {
      const px = cx + p.r * scale;
      const py = cy - p.i * scale;
      const pointColor = p.color === '#00f2fe' || !p.color ? '#B89A5A' : p.color;

      // Line from origin
      ctx.strokeStyle = pointColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Point circle
      ctx.fillStyle = pointColor;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0E1D61';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Point label in Deep Atlas Navy
      ctx.fillStyle = '#0E1D61';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`${p.label} (${p.r.toFixed(1)}, ${p.i.toFixed(1)})`, px + 8, py - 4);
    });
  }
}
