/**
 * OG - Module 08: Sequence and Series View
 * Interactive exploration of:
 * - Arithmetic Progression (AP): a_n = a + (n-1)d, S_n = (n/2)[2a + (n-1)d]
 * - Geometric Progression (GP): a_n = a·r^(n-1), S_n = a(1 - r^n)/(1 - r), S_∞ = a/(1 - r) (|r| < 1)
 * - Arithmetic Mean (AM = (a+b)/2) & Geometric Mean (GM = √(ab)) verification
 * - Interactive Sequence Bar Plot 2D Canvas Visualization
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class SequenceSeriesView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.mode = 'ap'; // 'ap' | 'gp' | 'means'

    // AP: First term a, Common diff d, Number of terms n
    this.apA = 2;
    this.apD = 3;
    this.apN = 10;

    // GP: First term a, Common ratio r, Number of terms n
    this.gpA = 3;
    this.gpR = 2;
    this.gpN = 6;

    // Means: a, b
    this.meanA = 4;
    this.meanB = 16;
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.calculate();
  }

  destroy() {}

  render() {
    this.container.innerHTML = `
      <div class="calculus-container view-animate-in">
        <!-- Header -->
        <div class="calculus-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge" style="background: rgba(184, 154, 90, 0.15); border-color: rgba(184, 154, 90, 0.4); color: #0E1D61;">
                Module #08
              </span>
              <span class="badge badge-algebra">Algebra</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Sequence and Series
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Explore Arithmetic and Geometric progressions, calculate general terms, finite and infinite series sums,
              and analyze the fundamental inequality AM ≥ GM with dynamic sequence visualizer.
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
            Standard Sequences:
          </div>
          <div class="calculus-preset-bar" id="seq-preset-container">
            <button class="preset-chip" data-preset="ap-standard">AP: a=2, d=3, n=10</button>
            <button class="preset-chip" data-preset="gp-powers">GP: a=1, r=2, n=8</button>
            <button class="preset-chip" data-preset="gp-infinite">Infinite GP: a=4, r=0.5</button>
            <button class="preset-chip" data-preset="means-amgm">AM-GM: a=4, b=16</button>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div style="display: flex; gap: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <button class="glass-btn ${this.mode === 'ap' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-mode="ap">
            Arithmetic Progression (AP)
          </button>
          <button class="glass-btn ${this.mode === 'gp' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-mode="gp">
            Geometric Progression (GP)
          </button>
          <button class="glass-btn ${this.mode === 'means' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-mode="means">
            Means (AM vs GM)
          </button>
        </div>

        <!-- Layout Grid -->
        <div class="calculus-controls-grid" style="grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Left Column: Controls -->
          <div class="glass-panel" style="padding: 24px;">
            ${this.renderControlsHtml()}
          </div>

          <!-- Right Column: Visualization Canvas -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                Progression Visualization
              </span>
              <span style="font-size: 0.8rem; color: var(--cyan-primary); font-family: var(--font-math);">
                Terms Growth Profile
              </span>
            </div>
            <div style="width: 100%; max-width: 380px; height: 220px; background: rgba(9, 13, 22, 0.85); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <canvas id="seq-canvas" width="380" height="220" style="display: block; width: 100%; height: 100%;"></canvas>
            </div>
          </div>
        </div>

        <!-- Results Hero -->
        <div id="seq-results-container"></div>
      </div>
    `;
  }

  renderControlsHtml() {
    if (this.mode === 'means') {
      return `
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Arithmetic & Geometric Means</h3>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="calculus-input-group">
            <label>Value a (Positive Real):</label>
            <input type="number" step="any" min="0.0001" id="mean-a" class="calculus-input-field" value="${this.meanA}">
          </div>
          <div class="calculus-input-group">
            <label>Value b (Positive Real):</label>
            <input type="number" step="any" min="0.0001" id="mean-b" class="calculus-input-field" value="${this.meanB}">
          </div>
          <button class="glass-btn glass-btn-primary" id="btn-calc-seq" style="margin-top: 8px;">
            <span>Calculate AM, GM & Verify AM ≥ GM</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>
      `;
    }

    if (this.mode === 'gp') {
      return `
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Geometric Progression: a, ar, ar², ...</h3>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="calculus-input-group">
              <label>First Term (a):</label>
              <input type="number" step="any" id="gp-a" class="calculus-input-field" value="${this.gpA}">
            </div>
            <div class="calculus-input-group">
              <label>Common Ratio (r):</label>
              <input type="number" step="any" id="gp-r" class="calculus-input-field" value="${this.gpR}">
            </div>
          </div>
          <div class="calculus-input-group">
            <label>Number of Terms (n):</label>
            <input type="number" step="1" min="1" max="50" id="gp-n" class="calculus-input-field" value="${this.gpN}">
          </div>
          <button class="glass-btn glass-btn-primary" id="btn-calc-seq" style="margin-top: 8px;">
            <span>Evaluate GP Terms & Sum</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>
      `;
    }

    // Default: AP
    return `
      <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Arithmetic Progression: a, a+d, a+2d, ...</h3>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="calculus-input-group">
            <label>First Term (a):</label>
            <input type="number" step="any" id="ap-a" class="calculus-input-field" value="${this.apA}">
          </div>
          <div class="calculus-input-group">
            <label>Common Difference (d):</label>
            <input type="number" step="any" id="ap-d" class="calculus-input-field" value="${this.apD}">
          </div>
        </div>
        <div class="calculus-input-group">
          <label>Number of Terms (n):</label>
          <input type="number" step="1" min="1" max="100" id="ap-n" class="calculus-input-field" value="${this.apN}">
        </div>
        <button class="glass-btn glass-btn-primary" id="btn-calc-seq" style="margin-top: 8px;">
          <span>Evaluate AP Terms & Sum</span>
          ${SVG_ICONS.arrowRight}
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    this.container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.mode = btn.getAttribute('data-mode');
        this.render();
        this.attachEventListeners();
        this.calculate();
      });
    });

    this.container.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-preset');
        if (p === 'ap-standard') {
          this.mode = 'ap'; this.apA = 2; this.apD = 3; this.apN = 10;
        } else if (p === 'gp-powers') {
          this.mode = 'gp'; this.gpA = 1; this.gpR = 2; this.gpN = 8;
        } else if (p === 'gp-infinite') {
          this.mode = 'gp'; this.gpA = 4; this.gpR = 0.5; this.gpN = 10;
        } else if (p === 'means-amgm') {
          this.mode = 'means'; this.meanA = 4; this.meanB = 16;
        }
        this.render();
        this.attachEventListeners();
        this.calculate();
      });
    });

    const calcBtn = document.getElementById('btn-calc-seq');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => this.handleCalculateFromInputs());
    }

    ['ap-a', 'ap-d', 'ap-n', 'gp-a', 'gp-r', 'gp-n', 'mean-a', 'mean-b'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.handleCalculateFromInputs());
        el.addEventListener('change', () => this.handleCalculateFromInputs());
      }
    });
  }

  handleCalculateFromInputs() {
    const apa = document.getElementById('ap-a');
    const apd = document.getElementById('ap-d');
    const apn = document.getElementById('ap-n');
    const gpa = document.getElementById('gp-a');
    const gpr = document.getElementById('gp-r');
    const gpn = document.getElementById('gp-n');
    const ma = document.getElementById('mean-a');
    const mb = document.getElementById('mean-b');

    if (apa) this.apA = parseFloat(apa.value) || 0;
    if (apd) this.apD = parseFloat(apd.value) || 0;
    if (apn) this.apN = Math.max(1, parseInt(apn.value) || 10);

    if (gpa) this.gpA = parseFloat(gpa.value) || 0;
    if (gpr) this.gpR = parseFloat(gpr.value) || 1;
    if (gpn) this.gpN = Math.max(1, parseInt(gpn.value) || 6);

    if (ma) this.meanA = Math.max(0.0001, parseFloat(ma.value) || 1);
    if (mb) this.meanB = Math.max(0.0001, parseFloat(mb.value) || 1);

    this.calculate();
  }

  calculate() {
    const resContainer = document.getElementById('seq-results-container');
    if (!resContainer) return;

    if (this.mode === 'means') {
      this.calculateMeans(resContainer);
    } else if (this.mode === 'gp') {
      this.calculateGP(resContainer);
    } else {
      this.calculateAP(resContainer);
    }
  }

  calculateAP(container) {
    const a = this.apA, d = this.apD, n = this.apN;
    const an = a + (n - 1) * d;
    const sn = (n / 2) * (2 * a + (n - 1) * d);

    // Generate terms list
    const terms = [];
    for (let i = 1; i <= Math.min(n, 12); i++) {
      terms.push(a + (i - 1) * d);
    }
    const termsStr = terms.join(', ') + (n > 12 ? ', ...' : '');

    const exprStr = `AP: a = ${a}, d = ${d}, n = ${n}`;
    const formulaStr = `aₙ = a + (n - 1)d, Sₙ = (n / 2) · [2a + (n - 1)d]`;
    const finalAnswer = `a_${n} = ${an}, S_${n} = ${sn}`;

    const steps = [
      `Sequence terms: ${termsStr}`,
      `Evaluate ${n}th term: a_${n} = ${a} + (${n} - 1)·(${d}) = ${a} + ${n - 1}·${d} = ${an}`,
      `Sum formula substitution: S_${n} = (${n} / 2) · [2·(${a}) + (${n} - 1)·(${d})]`,
      `S_${n} = ${n / 2} · [${2 * a} + ${(n - 1) * d}] = ${n / 2} · ${2 * a + (n - 1) * d} = ${sn}`
    ];

    this.renderResultBox(container, exprStr, formulaStr, steps, finalAnswer);
    this.drawSequenceBars(terms);

    store.addHistoryItem(exprStr, finalAnswer, 'Sequence and Series', 'sequence-series');
  }

  calculateGP(container) {
    const a = this.gpA, r = this.gpR, n = this.gpN;
    const an = a * Math.pow(r, n - 1);

    let sn = 0;
    if (r === 1) {
      sn = n * a;
    } else {
      sn = a * (1 - Math.pow(r, n)) / (1 - r);
    }

    let sInfStr = 'Does not converge (|r| ≥ 1)';
    if (Math.abs(r) < 1) {
      const sInf = a / (1 - r);
      sInfStr = sInf.toFixed(4);
    }

    const terms = [];
    for (let i = 1; i <= Math.min(n, 10); i++) {
      terms.push(Number((a * Math.pow(r, i - 1)).toFixed(3)));
    }
    const termsStr = terms.join(', ') + (n > 10 ? ', ...' : '');

    const exprStr = `GP: a = ${a}, r = ${r}, n = ${n}`;
    const formulaStr = `aₙ = a·rⁿ⁻¹, Sₙ = a(1 - rⁿ) / (1 - r), S_∞ = a / (1 - r)`;
    const finalAnswer = `a_${n} = ${an.toFixed(4)}, S_${n} = ${sn.toFixed(4)}, S_∞ = ${sInfStr}`;

    const steps = [
      `Sequence terms: ${termsStr}`,
      `Evaluate ${n}th term: a_${n} = ${a} · (${r})^(${n - 1}) = ${an.toFixed(4)}`,
      `Sum S_${n}: ${a} · (1 - ${r}^${n}) / (1 - ${r}) = ${sn.toFixed(4)}`,
      Math.abs(r) < 1
        ? `Infinite Sum converges since |${r}| < 1: S_∞ = ${a} / (1 - ${r}) = ${sInfStr}`
        : `Infinite Sum diverges because common ratio |${r}| ≥ 1.`
    ];

    this.renderResultBox(container, exprStr, formulaStr, steps, finalAnswer);
    this.drawSequenceBars(terms);

    store.addHistoryItem(exprStr, finalAnswer, 'Sequence and Series', 'sequence-series');
  }

  calculateMeans(container) {
    const a = this.meanA, b = this.meanB;
    const am = (a + b) / 2;
    const gm = Math.sqrt(a * b);
    const diff = am - gm;

    const exprStr = `Numbers a = ${a}, b = ${b}`;
    const formulaStr = `AM = (a + b) / 2, GM = √(a·b), AM ≥ GM`;
    const finalAnswer = `AM = ${am.toFixed(4)}, GM = ${gm.toFixed(4)} (AM - GM = ${diff.toFixed(4)} ≥ 0)`;

    const steps = [
      `Arithmetic Mean (AM) = (${a} + ${b}) / 2 = ${am.toFixed(4)}`,
      `Geometric Mean (GM) = √(${a} · ${b}) = √${(a * b).toFixed(2)} = ${gm.toFixed(4)}`,
      `Inequality Verification: AM - GM = ${am.toFixed(4)} - ${gm.toFixed(4)} = ${diff.toFixed(4)}`,
      `Algebraic Proof: (√a - √b)² ≥ 0 ⟹ a - 2√(ab) + b ≥ 0 ⟹ (a + b)/2 ≥ √(ab)`
    ];

    this.renderResultBox(container, exprStr, formulaStr, steps, finalAnswer);
    this.drawSequenceBars([a, am, gm, b], ['a', 'AM', 'GM', 'b']);

    store.addHistoryItem(`AM vs GM for ${a}, ${b}`, finalAnswer, 'Sequence and Series', 'sequence-series');
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
            <div style="padding: 10px 18px; background: rgba(0,0,0,0.4); border: 1px solid rgba(0,242,254,0.3); border-radius: var(--radius-lg); font-family: var(--font-math); font-size: 1.15rem; font-weight: 800; color: var(--cyan-primary); text-shadow: 0 0 16px rgba(0,242,254,0.4);">
              = ${result}
            </div>
            <button class="glass-btn glass-btn-icon" id="btn-copy-seq-result" title="Copy result">
              ${SVG_ICONS.copy}
            </button>
          </div>
        </div>

        <div style="padding: 14px 18px; background: rgba(15,23,42,0.6); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 18px; font-family: var(--font-math); font-size: 0.95rem; color: var(--text-secondary);">
          <strong style="color: var(--cyan-primary);">Formula:</strong> ${formula}
        </div>

        <h4 style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Step-by-Step Solution:</h4>
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

    const copyBtn = document.getElementById('btn-copy-seq-result');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyToClipboard(result, 'Result copied to clipboard!');
      });
    }
  }

  drawSequenceBars(values = [], customLabels = null) {
    const canvas = document.getElementById('seq-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (values.length === 0) return;

    const padX = 35;
    const padY = 30;
    const chartW = w - 2 * padX;
    const chartH = h - 2 * padY;

    const maxVal = Math.max(...values.map(v => Math.abs(v)), 1);
    const count = values.length;
    const barWidth = Math.max(8, Math.min(32, chartW / (count * 1.6)));
    const spacing = chartW / count;

    // Zero baseline
    const baseY = h - padY;
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, baseY); ctx.lineTo(w - padX, baseY);
    ctx.stroke();

    values.forEach((v, i) => {
      const bh = (Math.abs(v) / maxVal) * (chartH - 20);
      const bx = padX + i * spacing + (spacing - barWidth) / 2;
      const by = baseY - bh;

      // Bar gradient in refined Gold
      const grad = ctx.createLinearGradient(0, by, 0, baseY);
      grad.addColorStop(0, '#B89A5A');
      grad.addColorStop(1, 'rgba(184, 154, 90, 0.35)');

      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, barWidth, bh);

      // Value label on top in Deep Atlas Navy
      ctx.fillStyle = '#0E1D61';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(Number(v.toFixed(1)).toString(), bx + barWidth / 2, by - 6);

      // Index label in Deep Atlas Navy
      const lbl = customLabels ? customLabels[i] : `a${i + 1}`;
      ctx.fillStyle = 'rgba(14, 29, 97, 0.7)';
      ctx.fillText(lbl, bx + barWidth / 2, baseY + 16);
    });
  }
}
