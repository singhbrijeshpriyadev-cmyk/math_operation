/**
 * OG - Module 24: Linear Programming View
 * Graphical 2D Linear Programming Problem (LPP) solver:
 * - Objective Function: Maximize or Minimize Z = c₁x + c₂y
 * - System of linear inequality constraints: a₁x + a₂y ≤ d (or ≥ d) with x ≥ 0, y ≥ 0
 * - Corner point / extreme point evaluation
 * - Dynamic 2D Canvas plotting of the shaded feasible region polygon,
 *   constraint boundary lines, vertices, and the optimal solution point.
 * ES6 Module
 */

import { LinearProgrammingMathEngine } from '../../math/lpp.js';
import { ResultFormatter } from '../../math/formatter.js';

export class LinearProgrammingView {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;

    // State
    this.objective = {
      type: 'max', // 'max' | 'min'
      c1: 3,
      c2: 2
    };

    this.constraints = [
      { a: 1, b: 2, op: '<=', d: 8 },
      { a: 3, b: 2, op: '<=', d: 12 }
    ];
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.initCanvas();
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
                Module #24
              </span>
              <span class="badge badge-vectors">Vectors & Optimization</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Linear Programming
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Solve 2-variable Linear Programming Problems (LPP) using the graphical Corner Point Method.
              Identify feasible polygons, evaluate vertices, and determine the optimal objective value $Z^*$.
            </p>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Standard LPP Problems:
          </div>
          <div class="calculus-preset-bar" id="lpp-preset-container">
            <button class="preset-chip" data-preset="std">Standard Max: Z = 3x + 2y (x+2y≤8, 3x+2y≤12)</button>
            <button class="preset-chip" data-preset="resource">Resource Allocation: Z = 5x + 4y (6x+4y≤24, x+2y≤6)</button>
            <button class="preset-chip" data-preset="min">Minimization: Z = 4x + 2y (x+y≥5, 2x+y≥8, x+y≤10)</button>
            <button class="preset-chip" data-preset="profits">Manufacturing: Z = 50x + 70y (2x+y≤8, x+2y≤10)</button>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="calculus-workspace">
          <!-- Left Column: Problem Setup & Derivation -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Objective Function Card -->
            <div class="calculus-card">
              <div class="calculus-card-title">1. Objective Function Z</div>
              <div style="display: flex; gap: 12px; align-items: flex-end; margin-top: 14px;">
                <div class="calculus-input-group" style="width: 140px;">
                  <label class="calculus-label">Goal</label>
                  <select id="lpp-obj-type" class="calculus-input" style="cursor: pointer;">
                    <option value="max" ${this.objective.type === 'max' ? 'selected' : ''}>Maximize</option>
                    <option value="min" ${this.objective.type === 'min' ? 'selected' : ''}>Minimize</option>
                  </select>
                </div>
                <div class="calculus-input-group" style="flex: 1;">
                  <label class="calculus-label">c₁ (coeff of x)</label>
                  <input type="number" id="lpp-c1" class="calculus-input" value="${this.objective.c1}" step="any" />
                </div>
                <div style="font-size: 1.2rem; color: var(--text-white); padding-bottom: 8px;">x +</div>
                <div class="calculus-input-group" style="flex: 1;">
                  <label class="calculus-label">c₂ (coeff of y)</label>
                  <input type="number" id="lpp-c2" class="calculus-input" value="${this.objective.c2}" step="any" />
                </div>
                <div style="font-size: 1.2rem; color: var(--text-white); padding-bottom: 8px;">y</div>
              </div>
            </div>

            <!-- Constraints Card -->
            <div class="calculus-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div class="calculus-card-title" style="margin: 0;">2. Linear Constraints</div>
                <button id="btn-add-constraint" class="glass-button" style="padding: 4px 12px; font-size: 0.8rem;">
                  + Add Constraint
                </button>
              </div>
              <div id="constraints-list-container" style="display: flex; flex-direction: column; gap: 10px;">
                <!-- Rendered dynamically -->
              </div>
              <div style="margin-top: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.04); font-size: 0.82rem; color: var(--text-muted);">
                Non-negativity restrictions active: <b>x ≥ 0</b> and <b>y ≥ 0</b>
              </div>

              <button id="btn-lpp-solve" class="glass-button glass-button-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 14px;">
                Solve LPP & Plot Feasible Region
              </button>
            </div>

            <!-- Results & Derivation Target -->
            <div id="lpp-results-container"></div>
          </div>

          <!-- Right Column: 2D Feasible Region Canvas -->
          <div>
            <div class="calculus-card" style="padding: 16px; position: sticky; top: 90px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div class="calculus-card-title" style="margin: 0;">Feasible Region & Optimum Vertex</div>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
                  Quadrant I (x ≥ 0, y ≥ 0)
                </span>
              </div>
              <div style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); background: #070a14;">
                <canvas id="lpp-canvas" style="display: block; width: 100%; height: 420px;"></canvas>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 0.78rem; color: var(--text-muted);">
                <span>Shaded green polygon: Feasible region</span>
                <span style="color: #fbbf24; font-weight: 600;">★ Gold vertex: Optimal (x*, y*)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderConstraintsInputs();
  }

  renderConstraintsInputs() {
    const container = document.getElementById('constraints-list-container');
    if (!container) return;

    container.innerHTML = this.constraints.map((c, idx) => `
      <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.02); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
        <input type="number" class="calculus-input c-input-a" data-idx="${idx}" value="${c.a}" style="width: 60px;" step="any" />
        <span style="color: var(--text-white); font-size: 0.9rem;">x +</span>
        <input type="number" class="calculus-input c-input-b" data-idx="${idx}" value="${c.b}" style="width: 60px;" step="any" />
        <span style="color: var(--text-white); font-size: 0.9rem;">y</span>
        <select class="calculus-input c-input-op" data-idx="${idx}" style="width: 70px; cursor: pointer;">
          <option value="<=" ${c.op === '<=' ? 'selected' : ''}>≤</option>
          <option value=">=" ${c.op === '>=' ? 'selected' : ''}>≥</option>
        </select>
        <input type="number" class="calculus-input c-input-d" data-idx="${idx}" value="${c.d}" style="width: 70px;" step="any" />
        ${this.constraints.length > 1 ? `
          <button class="btn-remove-c" data-idx="${idx}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; font-size: 1.1rem; line-height: 1;">
            ×
          </button>
        ` : ''}
      </div>
    `).join('');
  }

  initCanvas() {
    this.canvas = document.getElementById('lpp-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 480;
    const height = 420;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  drawFeasibleScene(solvedData) {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;
    if (!ctx || !w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // Light Liquid Glass Ivory background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#EFE8DC');
    bg.addColorStop(1, '#E8E0D2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Padding & Axis Bounds
    const padLeft = 45;
    const padBottom = 40;
    const padTop = 20;
    const padRight = 20;

    // Determine max values on X and Y axes
    let maxX = 10;
    let maxY = 10;
    if (solvedData && solvedData.cornerPoints && solvedData.cornerPoints.length > 0) {
      solvedData.cornerPoints.forEach(p => {
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    }
    this.constraints.forEach(c => {
      if (c.a > 0) maxX = Math.max(maxX, c.d / c.a);
      if (c.b > 0) maxY = Math.max(maxY, c.d / c.b);
    });

    maxX = Math.ceil(maxX * 1.25) || 12;
    maxY = Math.ceil(maxY * 1.25) || 12;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const toScreenX = (x) => padLeft + (x / maxX) * plotW;
    const toScreenY = (y) => padTop + plotH - (y / maxY) * plotH;

    // 1. Grid lines in subtle Gold
    ctx.strokeStyle = 'rgba(184, 154, 90, 0.16)';
    ctx.lineWidth = 1;
    const stepX = Math.max(1, Math.round(maxX / 6));
    for (let x = 0; x <= maxX; x += stepX) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, padTop);
      ctx.lineTo(sx, padTop + plotH);
      ctx.stroke();

      ctx.fillStyle = 'rgba(14, 29, 97, 0.65)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(x, sx - 4, padTop + plotH + 16);
    }

    const stepY = Math.max(1, Math.round(maxY / 6));
    for (let y = 0; y <= maxY; y += stepY) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(padLeft + plotW, sy);
      ctx.stroke();

      ctx.fillStyle = 'rgba(14, 29, 97, 0.65)';
      ctx.fillText(y, padLeft - 22, sy + 4);
    }

    // 2. Axes (X and Y) in Deep Atlas Navy
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    ctx.fillStyle = '#0E1D61';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText('X', padLeft + plotW - 12, padTop + plotH + 18);
    ctx.fillText('Y', padLeft - 18, padTop + 14);

    // 3. Draw Feasible Polygon in Gold
    if (solvedData && solvedData.cornerPoints && solvedData.cornerPoints.length >= 3) {
      const pts = [...solvedData.cornerPoints];
      const cx = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
      const cy = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;
      pts.sort((p1, p2) => Math.atan2(p1.y - cy, p1.x - cx) - Math.atan2(p2.y - cy, p2.x - cx));

      ctx.beginPath();
      ctx.moveTo(toScreenX(pts[0].x), toScreenY(pts[0].y));
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(toScreenX(pts[i].x), toScreenY(pts[i].y));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(184, 154, 90, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#B89A5A';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 4. Draw Constraint Boundary Lines
    const colors = ['#0E1D61', '#B89A5A', 'rgba(14, 29, 97, 0.7)', 'rgba(184, 154, 90, 0.8)'];
    this.constraints.forEach((c, idx) => {
      ctx.strokeStyle = colors[idx % colors.length];
      ctx.lineWidth = 1.6;
      ctx.beginPath();

      const pts = [];
      if (Math.abs(c.b) > 1e-6) {
        const y0 = c.d / c.b;
        if (y0 >= 0 && y0 <= maxY * 2) pts.push({ x: 0, y: y0 });
        const yMax = (c.d - c.a * maxX) / c.b;
        if (yMax >= 0 && yMax <= maxY * 2) pts.push({ x: maxX, y: yMax });
      }
      if (Math.abs(c.a) > 1e-6) {
        const x0 = c.d / c.a;
        if (x0 >= 0 && x0 <= maxX * 2) pts.push({ x: x0, y: 0 });
        const xMax = (c.d - c.b * maxY) / c.a;
        if (xMax >= 0 && xMax <= maxX * 2) pts.push({ x: xMax, y: maxY });
      }

      if (pts.length >= 2) {
        ctx.moveTo(toScreenX(pts[0].x), toScreenY(pts[0].y));
        ctx.lineTo(toScreenX(pts[1].x), toScreenY(pts[1].y));
        ctx.stroke();
      }
    });

    // 5. Draw Corner Vertices and Highlight Optimum
    if (solvedData && solvedData.cornerPoints) {
      solvedData.cornerPoints.forEach(pt => {
        const sx = toScreenX(pt.x);
        const sy = toScreenY(pt.y);
        const isOpt = Math.abs(pt.x - solvedData.optimalX) < 1e-4 && Math.abs(pt.y - solvedData.optimalY) < 1e-4;

        if (isOpt) {
          ctx.beginPath();
          ctx.arc(sx, sy, 9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(184, 154, 90, 0.35)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = '#B89A5A';
          ctx.fill();
          ctx.strokeStyle = '#0E1D61';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Label in Deep Atlas Navy
          ctx.fillStyle = '#0E1D61';
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillText(`★ (${pt.x}, ${pt.y}) [Z*=${pt.z}]`, sx + 10, sy - 8);
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#0E1D61';
          ctx.fill();

          ctx.fillStyle = 'rgba(14, 29, 97, 0.7)';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`(${pt.x}, ${pt.y})`, sx + 6, sy + 12);
        }
      });
    }
  }

  attachEventListeners() {
    // Presets
    const presetContainer = document.getElementById('lpp-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-preset]');
        if (!btn) return;
        const p = btn.getAttribute('data-preset');
        if (p === 'std') {
          this.objective = { type: 'max', c1: 3, c2: 2 };
          this.constraints = [
            { a: 1, b: 2, op: '<=', d: 8 },
            { a: 3, b: 2, op: '<=', d: 12 }
          ];
        } else if (p === 'resource') {
          this.objective = { type: 'max', c1: 5, c2: 4 };
          this.constraints = [
            { a: 6, b: 4, op: '<=', d: 24 },
            { a: 1, b: 2, op: '<=', d: 6 }
          ];
        } else if (p === 'min') {
          this.objective = { type: 'min', c1: 4, c2: 2 };
          this.constraints = [
            { a: 1, b: 1, op: '>=', d: 5 },
            { a: 2, b: 1, op: '>=', d: 8 },
            { a: 1, b: 1, op: '<=', d: 10 }
          ];
        } else if (p === 'profits') {
          this.objective = { type: 'max', c1: 50, c2: 70 };
          this.constraints = [
            { a: 2, b: 1, op: '<=', d: 8 },
            { a: 1, b: 2, op: '<=', d: 10 }
          ];
        }

        const objTypeEl = document.getElementById('lpp-obj-type');
        const c1El = document.getElementById('lpp-c1');
        const c2El = document.getElementById('lpp-c2');
        if (objTypeEl) objTypeEl.value = this.objective.type;
        if (c1El) c1El.value = this.objective.c1;
        if (c2El) c2El.value = this.objective.c2;

        this.renderConstraintsInputs();
        this.calculate();
      });
    }

    // Add constraint
    const addBtn = document.getElementById('btn-add-constraint');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.constraints.push({ a: 1, b: 1, op: '<=', d: 10 });
        this.renderConstraintsInputs();
      });
    }

    // Constraints input delegation
    const listContainer = document.getElementById('constraints-list-container');
    if (listContainer) {
      listContainer.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (isNaN(idx) || !this.constraints[idx]) return;

        if (e.target.classList.contains('c-input-a')) {
          this.constraints[idx].a = parseFloat(e.target.value) || 0;
        } else if (e.target.classList.contains('c-input-b')) {
          this.constraints[idx].b = parseFloat(e.target.value) || 0;
        } else if (e.target.classList.contains('c-input-op')) {
          this.constraints[idx].op = e.target.value;
        } else if (e.target.classList.contains('c-input-d')) {
          this.constraints[idx].d = parseFloat(e.target.value) || 0;
        }
      });

      listContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove-c');
        if (removeBtn) {
          const idx = parseInt(removeBtn.dataset.idx, 10);
          if (!isNaN(idx) && this.constraints.length > 1) {
            this.constraints.splice(idx, 1);
            this.renderConstraintsInputs();
          }
        }
      });
    }

    // Solve button
    const solveBtn = document.getElementById('btn-lpp-solve');
    if (solveBtn) {
      solveBtn.addEventListener('click', () => {
        const objType = document.getElementById('lpp-obj-type')?.value || 'max';
        const c1 = parseFloat(document.getElementById('lpp-c1')?.value) || 0;
        const c2 = parseFloat(document.getElementById('lpp-c2')?.value) || 0;

        this.objective = { type: objType, c1, c2 };
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('lpp-results-container');
    if (!resultsContainer) return;

    const res = LinearProgrammingMathEngine.solve(this.objective, this.constraints);
    if (!res.success) {
      resultsContainer.innerHTML = `<div class="calculus-error">${res.error}</div>`;
      this.drawFeasibleScene(null);
      return;
    }

    const d = res.result;
    this.drawFeasibleScene(d);

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero Optimum Outcome -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Optimal Solution Summary</div>
          <div class="result-hero-value" style="display: flex; flex-direction: column; gap: 6px;">
            <div style="color: #fbbf24; font-size: 2rem;">
              ${d.isMax ? 'Maximum' : 'Minimum'} Z* = ${d.optimalZ}
            </div>
            <div style="color: #10b981; font-size: 1.25rem;">
              Optimal Vertex: (x*, y*) = (${d.optimalX}, ${d.optimalY})
            </div>
          </div>
        </div>

        <!-- Corner Points Evaluation Table -->
        <div class="calculus-card">
          <div class="calculus-card-title">Corner Point Method Evaluations</div>
          <div style="margin-top: 12px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.12); color: var(--text-muted); text-align: left;">
                  <th style="padding: 8px 12px;">Vertex Point</th>
                  <th style="padding: 8px 12px;">Coordinates (x, y)</th>
                  <th style="padding: 8px 12px;">Objective Z = ${d.c1}x + ${d.c2}y</th>
                  <th style="padding: 8px 12px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${d.cornerPoints.map((pt, i) => {
                  const isOpt = Math.abs(pt.x - d.optimalX) < 1e-4 && Math.abs(pt.y - d.optimalY) < 1e-4;
                  return `
                    <tr style="border-bottom: 1px solid rgba(14, 29, 97, 0.1); ${isOpt ? 'background: rgba(184, 154, 90, 0.12); font-weight: 700;' : ''}">
                      <td style="padding: 8px 12px; color: ${isOpt ? '#B89A5A' : '#0E1D61'};">V${i + 1}</td>
                      <td style="padding: 8px 12px; font-family: monospace; color: #0E1D61;">(${pt.x}, ${pt.y})</td>
                      <td style="padding: 8px 12px; font-family: monospace; color: ${isOpt ? '#B89A5A' : '#0E1D61'}; font-weight: 700;">${pt.z}</td>
                      <td style="padding: 8px 12px;">
                        ${isOpt ? '<span class="badge" style="background: rgba(184, 154, 90, 0.2); color: #0E1D61; border: 1.5px solid #B89A5A; font-weight: 700;">OPTIMAL ★</span>' : '<span style="color: var(--text-muted);">Feasible</span>'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Step-by-Step Derivation -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Mathematical Derivation
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
    this.canvas = null;
    this.ctx = null;
  }
}
