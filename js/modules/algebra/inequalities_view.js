/**
 * OG - Module 05: Linear Inequalities View
 * Interactive exploration of:
 * - Linear inequalities in one variable: ax + b ≤ c, ax + b ≥ c, ax + b < c, ax + b > c
 * - Sign reversal rule upon multiplication/division by negative numbers
 * - Absolute value / modulus inequalities: |ax + b| ≤ c and |ax + b| ≥ c
 * - Interactive Real Number Line 2D Canvas Visualization
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class LinearInequalitiesView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.mode = 'linear'; // 'linear' | 'modulus'

    // ax + b [op] c
    this.coeffA = 2;
    this.constB = -3;
    this.op = '<='; // '<=' | '>=' | '<' | '>'
    this.rhsC = 7;

    // |ax + b| [modOp] c
    this.modOp = '<='; // '<=' | '>='
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
                Module #05
              </span>
              <span class="badge badge-algebra">Algebra</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Linear Inequalities
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Solve single-variable linear and modulus inequalities, observe sign reversal rules,
              and inspect the continuous solution intervals on the interactive real number line.
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
            Standard Inequalities:
          </div>
          <div class="calculus-preset-bar" id="ineq-preset-container">
            <button class="preset-chip" data-preset="simple">2x - 3 ≤ 7</button>
            <button class="preset-chip" data-preset="reversal">-3x + 6 > 12 (Reversal)</button>
            <button class="preset-chip" data-preset="mod-bounded">|x - 2| ≤ 5</button>
            <button class="preset-chip" data-preset="mod-unbounded">|2x + 1| ≥ 7</button>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div style="display: flex; gap: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <button class="glass-btn ${this.mode === 'linear' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-mode="linear">
            Linear Inequality: ax + b [≤, ≥, <, >] c
          </button>
          <button class="glass-btn ${this.mode === 'modulus' ? 'glass-btn-primary' : 'glass-btn-outline'}" data-mode="modulus">
            Modulus Inequality: |ax + b| [≤, ≥] c
          </button>
        </div>

        <!-- Grid Layout -->
        <div class="calculus-controls-grid" style="grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Left Column: Controls -->
          <div class="glass-panel" style="padding: 24px;">
            ${this.renderControlsHtml()}
          </div>

          <!-- Right Column: Number Line Canvas -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                Solution on Real Number Line (ℝ)
              </span>
              <span style="font-size: 0.8rem; color: var(--cyan-primary); font-family: var(--font-math);">
                Interval Geometry
              </span>
            </div>
            <div style="width: 100%; max-width: 380px; height: 180px; background: rgba(9, 13, 22, 0.85); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <canvas id="number-line-canvas" width="380" height="180" style="display: block; width: 100%; height: 100%;"></canvas>
            </div>
          </div>
        </div>

        <!-- Results & Steps Container -->
        <div id="ineq-results-container"></div>
      </div>
    `;
  }

  renderControlsHtml() {
    if (this.mode === 'modulus') {
      return `
        <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Solve |ax + b| [op] c</h3>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="calculus-input-group">
              <label>Coefficient a:</label>
              <input type="number" step="any" id="ineq-a" class="calculus-input-field" value="${this.coeffA}">
            </div>
            <div class="calculus-input-group">
              <label>Constant b:</label>
              <input type="number" step="any" id="ineq-b" class="calculus-input-field" value="${this.constB}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="calculus-input-group">
              <label>Operator:</label>
              <select id="ineq-mod-op" class="calculus-input-field" style="background: rgba(15,23,42,0.85);">
                <option value="<=" ${this.modOp === '<=' ? 'selected' : ''}>≤ (Bounded interval)</option>
                <option value=">=" ${this.modOp === '>=' ? 'selected' : ''}>≥ (Disjoint rays)</option>
              </select>
            </div>
            <div class="calculus-input-group">
              <label>RHS Constant c:</label>
              <input type="number" step="any" id="ineq-c" class="calculus-input-field" value="${this.rhsC}">
            </div>
          </div>

          <button class="glass-btn glass-btn-primary" id="btn-calc-ineq" style="margin-top: 8px;">
            <span>Solve Modulus Inequality</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>
      `;
    }

    return `
      <h3 style="font-size: 1.15rem; margin-bottom: 16px; color: var(--text-white);">Solve ax + b [op] c</h3>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="calculus-input-group">
            <label>Coefficient a:</label>
            <input type="number" step="any" id="ineq-a" class="calculus-input-field" value="${this.coeffA}">
          </div>
          <div class="calculus-input-group">
            <label>Constant b:</label>
            <input type="number" step="any" id="ineq-b" class="calculus-input-field" value="${this.constB}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="calculus-input-group">
            <label>Operator:</label>
            <select id="ineq-op" class="calculus-input-field" style="background: rgba(15,23,42,0.85);">
              <option value="<=" ${this.op === '<=' ? 'selected' : ''}>≤ (Less than or equal)</option>
              <option value=">=" ${this.op === '>=' ? 'selected' : ''}>≥ (Greater than or equal)</option>
              <option value="<" ${this.op === '<' ? 'selected' : ''}>&lt; (Strictly less)</option>
              <option value=">" ${this.op === '>' ? 'selected' : ''}>&gt; (Strictly greater)</option>
            </select>
          </div>
          <div class="calculus-input-group">
            <label>RHS Constant c:</label>
            <input type="number" step="any" id="ineq-c" class="calculus-input-field" value="${this.rhsC}">
          </div>
        </div>

        <button class="glass-btn glass-btn-primary" id="btn-calc-ineq" style="margin-top: 8px;">
          <span>Solve Linear Inequality</span>
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
        if (p === 'simple') {
          this.mode = 'linear';
          this.coeffA = 2; this.constB = -3; this.op = '<='; this.rhsC = 7;
        } else if (p === 'reversal') {
          this.mode = 'linear';
          this.coeffA = -3; this.constB = 6; this.op = '>'; this.rhsC = 12;
        } else if (p === 'mod-bounded') {
          this.mode = 'modulus';
          this.coeffA = 1; this.constB = -2; this.modOp = '<='; this.rhsC = 5;
        } else if (p === 'mod-unbounded') {
          this.mode = 'modulus';
          this.coeffA = 2; this.constB = 1; this.modOp = '>='; this.rhsC = 7;
        }
        this.render();
        this.attachEventListeners();
        this.calculate();
      });
    });

    const calcBtn = document.getElementById('btn-calc-ineq');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => this.handleCalculateFromInputs());
    }

    ['ineq-a', 'ineq-b', 'ineq-c', 'ineq-op', 'ineq-mod-op'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.handleCalculateFromInputs());
        el.addEventListener('change', () => this.handleCalculateFromInputs());
      }
    });
  }

  handleCalculateFromInputs() {
    const elA = document.getElementById('ineq-a');
    const elB = document.getElementById('ineq-b');
    const elC = document.getElementById('ineq-c');
    const elOp = document.getElementById('ineq-op');
    const elModOp = document.getElementById('ineq-mod-op');

    if (elA) this.coeffA = parseFloat(elA.value) || 1;
    if (elB) this.constB = parseFloat(elB.value) || 0;
    if (elC) this.rhsC = parseFloat(elC.value) || 0;
    if (elOp) this.op = elOp.value;
    if (elModOp) this.modOp = elModOp.value;

    this.calculate();
  }

  calculate() {
    const resContainer = document.getElementById('ineq-results-container');
    if (!resContainer) return;

    if (this.coeffA === 0) {
      resContainer.innerHTML = `<div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">Coefficient 'a' cannot be 0 in a single-variable inequality.</div>`;
      return;
    }

    if (this.mode === 'modulus') {
      this.calculateModulus(resContainer);
    } else {
      this.calculateLinear(resContainer);
    }
  }

  calculateLinear(container) {
    const a = this.coeffA, b = this.constB, c = this.rhsC, op = this.op;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const exprStr = `${a}x ${bStr} ${op} ${c}`;
    const rhsAfterSub = c - b;

    let finalOp = op;
    let reversed = false;
    if (a < 0) {
      reversed = true;
      if (op === '<=') finalOp = '>=';
      else if (op === '>=') finalOp = '<=';
      else if (op === '<') finalOp = '>';
      else if (op === '>') finalOp = '<';
    }

    const boundX = rhsAfterSub / a;
    const boundXFormatted = Number(boundX.toFixed(4));

    let intervalStr = '';
    if (finalOp === '<=') intervalStr = `(-∞, ${boundXFormatted}]`;
    else if (finalOp === '<') intervalStr = `(-∞, ${boundXFormatted})`;
    else if (finalOp === '>=') intervalStr = `[${boundXFormatted}, ∞)`;
    else intervalStr = `(${boundXFormatted}, ∞)`;

    const finalAnswer = `x ${finalOp} ${boundXFormatted} ⟺ ${intervalStr}`;

    const steps = [
      `Original statement: ${exprStr}`,
      `Subtract constant (${b}) from both sides: ${a}x ${op} ${c} - (${b}) ⟹ ${a}x ${op} ${rhsAfterSub}`,
      reversed
        ? `Divide by negative coefficient (${a}): ⚠️ Inequality sign reverses from '${op}' to '${finalOp}'! ⟹ x ${finalOp} ${rhsAfterSub} / (${a})`
        : `Divide both sides by positive coefficient (${a}): ⟹ x ${finalOp} ${rhsAfterSub} / (${a})`,
      `Computed bound: x ${finalOp} ${boundXFormatted}`,
      `Interval Notation: x ∈ ${intervalStr}`
    ];

    this.renderResultBox(container, exprStr, 'ax + b ≤ c ⟹ x ≤ (c - b)/a (reverses if a < 0)', steps, finalAnswer);
    this.drawNumberLine({
      type: finalOp.startsWith('<') ? 'ray-left' : 'ray-right',
      bound: boundXFormatted,
      inclusive: finalOp.includes('=')
    });

    store.addHistoryItem(exprStr, finalAnswer, 'Linear Inequalities', 'linear-inequalities');
  }

  calculateModulus(container) {
    const a = this.coeffA, b = this.constB, c = this.rhsC, modOp = this.modOp;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const exprStr = `|${a}x ${bStr}| ${modOp} ${c}`;

    if (c < 0) {
      const ans = modOp === '<=' ? 'No solution (∅)' : 'All real numbers ℝ (-∞, ∞)';
      this.renderResultBox(container, exprStr, '|u| ≥ 0 for all real u', [`Since absolute value is always non-negative, |${a}x ${bStr}| cannot be ≤ negative constant (${c}).`], ans);
      return;
    }

    let finalAnswer = '', steps = [];
    if (modOp === '<=') {
      // -c <= ax + b <= c
      const leftBound = (-c - b) / a;
      const rightBound = (c - b) / a;
      const minB = Math.min(leftBound, rightBound);
      const maxB = Math.max(leftBound, rightBound);
      finalAnswer = `[${minB.toFixed(4)}, ${maxB.toFixed(4)}]`;
      steps = [
        `Definition: |u| ≤ c ⟺ -c ≤ u ≤ c`,
        `Apply to expression: -${c} ≤ ${a}x ${bStr} ≤ ${c}`,
        `Subtract (${b}) across all parts: ${-c - b} ≤ ${a}x ≤ ${c - b}`,
        `Divide by coefficient (${a}) with sign consideration: x ∈ [${minB.toFixed(4)}, ${maxB.toFixed(4)}]`
      ];
      this.drawNumberLine({ type: 'segment', left: minB, right: maxB, inclusive: true });
    } else {
      // ax + b <= -c or ax + b >= c
      const b1 = (-c - b) / a;
      const b2 = (c - b) / a;
      const minB = Math.min(b1, b2);
      const maxB = Math.max(b1, b2);
      finalAnswer = `(-∞, ${minB.toFixed(4)}] ∪ [${maxB.toFixed(4)}, ∞)`;
      steps = [
        `Definition: |u| ≥ c ⟺ u ≤ -c OR u ≥ c`,
        `Split branch 1: ${a}x ${bStr} ≤ -${c} ⟹ x ≤ ${minB.toFixed(4)}`,
        `Split branch 2: ${a}x ${bStr} ≥ ${c} ⟹ x ≥ ${maxB.toFixed(4)}`,
        `Union of solution sets: x ∈ (-∞, ${minB.toFixed(4)}] ∪ [${maxB.toFixed(4)}, ∞)`
      ];
      this.drawNumberLine({ type: 'union-rays', left: minB, right: maxB, inclusive: true });
    }

    this.renderResultBox(container, exprStr, '|u| ≤ c ⟺ -c ≤ u ≤ c', steps, finalAnswer);
    store.addHistoryItem(exprStr, finalAnswer, 'Linear Inequalities', 'linear-inequalities');
  }

  renderResultBox(container, expr, formula, steps, result) {
    container.innerHTML = `
      <div class="glass-panel" style="padding: 24px; margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-tertiary); text-transform: uppercase;">Inequality:</span>
            <div style="font-family: var(--font-math); font-size: 1.25rem; font-weight: 700; color: var(--text-white);">${expr}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="padding: 10px 18px; background: rgba(0,0,0,0.4); border: 1px solid rgba(0,242,254,0.3); border-radius: var(--radius-lg); font-family: var(--font-math); font-size: 1.25rem; font-weight: 800; color: var(--cyan-primary); text-shadow: 0 0 16px rgba(0,242,254,0.4);">
              = ${result}
            </div>
            <button class="glass-btn glass-btn-icon" id="btn-copy-ineq-result" title="Copy result">
              ${SVG_ICONS.copy}
            </button>
          </div>
        </div>

        <div style="padding: 14px 18px; background: rgba(15,23,42,0.6); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 18px; font-family: var(--font-math); font-size: 0.95rem; color: var(--text-secondary);">
          <strong style="color: var(--cyan-primary);">Rule:</strong> ${formula}
        </div>

        <h4 style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Step-by-Step Derivation:</h4>
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

    const copyBtn = document.getElementById('btn-copy-ineq-result');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyToClipboard(result, 'Result copied to clipboard!');
      });
    }
  }

  drawNumberLine(spec = {}) {
    const canvas = document.getElementById('number-line-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    // Fill subtle Ivory glass background
    ctx.fillStyle = '#E8E0D2';
    ctx.fillRect(0, 0, w, h);

    const cy = h / 2;
    const pad = 40;

    // Number line axis in Deep Atlas Navy
    ctx.strokeStyle = '#0E1D61';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, cy); ctx.lineTo(w - pad, cy);
    ctx.stroke();

    // Arrows on ends
    const drawArrow = (x, y, dir) => {
      ctx.fillStyle = '#0E1D61';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - dir * 8, y - 5);
      ctx.lineTo(x - dir * 8, y + 5);
      ctx.fill();
    };
    drawArrow(pad, cy, -1);
    drawArrow(w - pad, cy, 1);

    // Map value to canvas X coordinate
    let minVal = -10, maxVal = 10;
    if (spec.type === 'segment' || spec.type === 'union-rays') {
      const span = Math.max(Math.abs(spec.left), Math.abs(spec.right)) + 4;
      minVal = -span; maxVal = span;
    } else if (spec.bound !== undefined) {
      const span = Math.abs(spec.bound) + 5;
      minVal = -span; maxVal = span;
    }

    const toX = (val) => pad + ((val - minVal) / (maxVal - minVal)) * (w - 2 * pad);

    // Draw ticks
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.3)';
    ctx.fillStyle = 'rgba(14, 29, 97, 0.75)';
    ctx.font = 'bold 10px JetBrains Mono';
    ctx.textAlign = 'center';

    const step = Math.ceil((maxVal - minVal) / 8);
    for (let v = Math.ceil(minVal); v <= Math.floor(maxVal); v += step) {
      const tx = toX(v);
      ctx.beginPath();
      ctx.moveTo(tx, cy - 5); ctx.lineTo(tx, cy + 5);
      ctx.stroke();
      ctx.fillText(v.toString(), tx, cy + 20);
    }

    // Highlight solution region in Gold
    ctx.strokeStyle = '#B89A5A';
    ctx.lineWidth = 5;
    ctx.fillStyle = '#B89A5A';

    const drawEndpoint = (x, filled) => {
      ctx.beginPath();
      ctx.arc(x, cy, 6, 0, Math.PI * 2);
      if (filled) {
        ctx.fillStyle = '#B89A5A';
        ctx.fill();
      } else {
        ctx.fillStyle = '#E8E0D2';
        ctx.fill();
        ctx.strokeStyle = '#B89A5A';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    };

    if (spec.type === 'ray-left') {
      const bx = toX(spec.bound);
      ctx.beginPath();
      ctx.moveTo(pad, cy); ctx.lineTo(bx, cy);
      ctx.stroke();
      drawEndpoint(bx, spec.inclusive);
    } else if (spec.type === 'ray-right') {
      const bx = toX(spec.bound);
      ctx.beginPath();
      ctx.moveTo(bx, cy); ctx.lineTo(w - pad, cy);
      ctx.stroke();
      drawEndpoint(bx, spec.inclusive);
    } else if (spec.type === 'segment') {
      const lx = toX(spec.left);
      const rx = toX(spec.right);
      ctx.beginPath();
      ctx.moveTo(lx, cy); ctx.lineTo(rx, cy);
      ctx.stroke();
      drawEndpoint(lx, spec.inclusive);
      drawEndpoint(rx, spec.inclusive);
    } else if (spec.type === 'union-rays') {
      const lx = toX(spec.left);
      const rx = toX(spec.right);
      ctx.beginPath();
      ctx.moveTo(pad, cy); ctx.lineTo(lx, cy);
      ctx.moveTo(rx, cy); ctx.lineTo(w - pad, cy);
      ctx.stroke();
      drawEndpoint(lx, spec.inclusive);
      drawEndpoint(rx, spec.inclusive);
    }
  }
}
