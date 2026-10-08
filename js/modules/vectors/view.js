/**
 * OG - Module 23: Vectors and Three-Dimensional Geometry View
 * Interactive workspace for:
 * - Vector algebra: addition, subtraction, scalar multiplication
 * - Dot product (scalar product), orthogonality, and angle between vectors
 * - Cross product (vector product), magnitude, and area of parallelogram
 * - Unit vectors and direction cosines / ratios
 * - 3D Isometric projection canvas visualizing vectors u⃗, v⃗, u⃗ × v⃗ and spanned area.
 * ES6 Module
 */

import { Vector3DMathEngine } from '../../math/vectors.js';
import { ResultFormatter } from '../../math/formatter.js';

export class VectorsView {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;

    // State: Vector u and Vector v
    this.u = { x: 2, y: 3, z: 1 };
    this.v = { x: 1, y: -2, z: 2 };
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
              <span class="calculus-badge" style="background: rgba(168, 85, 247, 0.12); border-color: rgba(168, 85, 247, 0.35); color: #c084fc;">
                Module #23
              </span>
              <span class="badge badge-vectors">Vectors & 3D Geometry</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Vectors & 3D Geometry
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Compute dot products, cross products, angles, projections, unit vectors, direction cosines,
              and visualize 3D vectors $\\vec{u}$, $\\vec{v}$, and $\\vec{u} \\times \\vec{v}$ with interactive isometric projection.
            </p>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Vector Presets:
          </div>
          <div class="calculus-preset-bar" id="vectors-preset-container">
            <button class="preset-chip" data-preset="standard">Standard: u=(2,3,1), v=(1,-2,2)</button>
            <button class="preset-chip" data-preset="orthogonal">Orthogonal: u=(1,2,-1), v=(2,1,4)</button>
            <button class="preset-chip" data-preset="parallel">Parallel: u=(2,-3,4), v=(4,-6,8)</button>
            <button class="preset-chip" data-preset="basis">Basis: u=(3,0,0), v=(0,3,0)</button>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="calculus-workspace">
          <!-- Left Column: Controls & Derivations -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="calculus-card">
              <div class="calculus-card-title">Vector Definitions</div>
              <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 14px;">
                <!-- Vector u -->
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.88rem; font-weight: 700; color: #B89A5A;">
                      Vector u = (u_x, u_y, u_z)
                    </span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">(Gold in 3D)</span>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                    <div class="calculus-input-group">
                      <label class="calculus-label">u_x</label>
                      <input type="number" id="vec-ux" class="calculus-input" value="${this.u.x}" step="any" />
                    </div>
                    <div class="calculus-input-group">
                      <label class="calculus-label">u_y</label>
                      <input type="number" id="vec-uy" class="calculus-input" value="${this.u.y}" step="any" />
                    </div>
                    <div class="calculus-input-group">
                      <label class="calculus-label">u_z</label>
                      <input type="number" id="vec-uz" class="calculus-input" value="${this.u.z}" step="any" />
                    </div>
                  </div>
                </div>

                <!-- Vector v -->
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.88rem; font-weight: 700; color: #0E1D61;">
                      Vector v = (v_x, v_y, v_z)
                    </span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">(Navy in 3D)</span>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                    <div class="calculus-input-group">
                      <label class="calculus-label">v_x</label>
                      <input type="number" id="vec-vx" class="calculus-input" value="${this.v.x}" step="any" />
                    </div>
                    <div class="calculus-input-group">
                      <label class="calculus-label">v_y</label>
                      <input type="number" id="vec-vy" class="calculus-input" value="${this.v.y}" step="any" />
                    </div>
                    <div class="calculus-input-group">
                      <label class="calculus-label">v_z</label>
                      <input type="number" id="vec-vz" class="calculus-input" value="${this.v.z}" step="any" />
                    </div>
                  </div>
                </div>

                <button id="btn-vec-calc" class="glass-button glass-button-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 6px;">
                  Compute Vector Algebra & 3D Geometry
                </button>
              </div>
            </div>

            <!-- Results & Derivation Target -->
            <div id="vectors-results-container"></div>
          </div>

          <!-- Right Column: 3D Projected Canvas -->
          <div>
            <div class="calculus-card" style="padding: 16px; position: sticky; top: 90px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div class="calculus-card-title" style="margin: 0;">3D Vector Isometric Visualizer</div>
                <div style="display: flex; gap: 8px; font-size: 0.75rem;">
                  <span style="display: inline-flex; align-items: center; gap: 4px; color: #B89A5A;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #B89A5A;"></span> u
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 4px; color: #0E1D61;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #0E1D61;"></span> v
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 4px; color: #B89A5A;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #B89A5A; border: 1.5px solid #0E1D61;"></span> u × v
                  </span>
                </div>
              </div>
              <div style="border-radius: 12px; overflow: hidden; border: 1.5px solid rgba(184, 154, 90, 0.3); background: #E8E0D2;">
                <canvas id="vectors-canvas" style="display: block; width: 100%; height: 380px;"></canvas>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 0.78rem; color: var(--text-muted);">
                <span>Isometric ℝ³ projection (+X Gold, +Y & +Z Navy)</span>
                <span id="canvas-status-badge" style="color: #0E1D61; font-weight: 700;">Origin (0,0,0) centered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initCanvas() {
    this.canvas = document.getElementById('vectors-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 480;
    const height = 380;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  // 3D Isometric projection
  project3D(x, y, z) {
    const originX = this.displayWidth / 2;
    const originY = this.displayHeight / 2 + 20;

    // Scale dynamically based on max vector component
    const maxCoord = Math.max(
      Math.abs(this.u.x), Math.abs(this.u.y), Math.abs(this.u.z),
      Math.abs(this.v.x), Math.abs(this.v.y), Math.abs(this.v.z),
      4
    );
    const scale = Math.min(28, (this.displayWidth * 0.28) / maxCoord);

    // 30 degree isometric angle
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);

    const sx = originX + (y - x) * cos30 * scale;
    const sy = originY + (x + y) * sin30 * scale - z * scale;

    return { x: sx, y: sy };
  }

  drawVectorArrow(from, to, color, width = 2.5) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    // Line
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLength = 10;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  draw3DScene(cross) {
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

    const o = this.project3D(0, 0, 0);

    // 1. Axes
    const axisLen = 6;
    const xEnd = this.project3D(axisLen, 0, 0);
    const yEnd = this.project3D(0, axisLen, 0);
    const zEnd = this.project3D(0, 0, axisLen);

    // X Axis (Gold)
    ctx.strokeStyle = '#B89A5A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(xEnd.x, xEnd.y);
    ctx.stroke();
    ctx.fillStyle = '#B89A5A';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText('+X', xEnd.x - 14, xEnd.y + 12);

    // Y Axis (Deep Atlas Navy)
    ctx.strokeStyle = '#0E1D61';
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.stroke();
    ctx.fillStyle = '#0E1D61';
    ctx.fillText('+Y', yEnd.x + 8, yEnd.y + 12);

    // Z Axis (Navy Secondary)
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.7)';
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(14, 29, 97, 0.8)';
    ctx.fillText('+Z', zEnd.x - 6, zEnd.y - 8);

    // Origin indicator
    ctx.beginPath();
    ctx.arc(o.x, o.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0E1D61';
    ctx.fill();

    // 2. Parallelogram Spanned by u and v
    const uEnd = this.project3D(this.u.x, this.u.y, this.u.z);
    const vEnd = this.project3D(this.v.x, this.v.y, this.v.z);
    const uvSum = this.project3D(this.u.x + this.v.x, this.u.y + this.v.y, this.u.z + this.v.z);

    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(uEnd.x, uEnd.y);
    ctx.lineTo(uvSum.x, uvSum.y);
    ctx.lineTo(vEnd.x, vEnd.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(184, 154, 90, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Vector u (Gold)
    this.drawVectorArrow(o, uEnd, '#B89A5A', 2.8);
    ctx.fillStyle = '#0E1D61';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText(`u⃗ ⟨${this.u.x}, ${this.u.y}, ${this.u.z}⟩`, uEnd.x + 8, uEnd.y - 6);

    // 4. Draw Vector v (Deep Atlas Navy)
    this.drawVectorArrow(o, vEnd, '#0E1D61', 2.8);
    ctx.fillStyle = '#0E1D61';
    ctx.fillText(`v⃗ ⟨${this.v.x}, ${this.v.y}, ${this.v.z}⟩`, vEnd.x + 8, vEnd.y + 14);

    // 5. Draw Cross Product Vector u x v (Gold Accent)
    if (cross) {
      // Normalize cross product for visualization if it's huge
      const crossMag = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
      let visCross = cross;
      if (crossMag > 7) {
        const factor = 6 / crossMag;
        visCross = { x: cross.x * factor, y: cross.y * factor, z: cross.z * factor };
      }
      const crossEnd = this.project3D(visCross.x, visCross.y, visCross.z);
      this.drawVectorArrow(o, crossEnd, '#B89A5A', 2.5);
      ctx.fillStyle = '#0E1D61';
      ctx.fillText(`u⃗ × v⃗`, crossEnd.x + 8, crossEnd.y - 6);
    }
  }

  attachEventListeners() {
    const presetContainer = document.getElementById('vectors-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-preset]');
        if (!btn) return;
        const p = btn.getAttribute('data-preset');
        if (p === 'standard') {
          this.u = { x: 2, y: 3, z: 1 };
          this.v = { x: 1, y: -2, z: 2 };
        } else if (p === 'orthogonal') {
          this.u = { x: 1, y: 2, z: -1 };
          this.v = { x: 2, y: 1, z: 4 };
        } else if (p === 'parallel') {
          this.u = { x: 2, y: -3, z: 4 };
          this.v = { x: 4, y: -6, z: 8 };
        } else if (p === 'basis') {
          this.u = { x: 3, y: 0, z: 0 };
          this.v = { x: 0, y: 3, z: 0 };
        }

        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        };
        setVal('vec-ux', this.u.x);
        setVal('vec-uy', this.u.y);
        setVal('vec-uz', this.u.z);
        setVal('vec-vx', this.v.x);
        setVal('vec-vy', this.v.y);
        setVal('vec-vz', this.v.z);

        this.calculate();
      });
    }

    const calcBtn = document.getElementById('btn-vec-calc');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        const getVal = (id) => parseFloat(document.getElementById(id)?.value) || 0;
        this.u = { x: getVal('vec-ux'), y: getVal('vec-uy'), z: getVal('vec-uz') };
        this.v = { x: getVal('vec-vx'), y: getVal('vec-vy'), z: getVal('vec-vz') };
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('vectors-results-container');
    if (!resultsContainer) return;

    const res = Vector3DMathEngine.vectorAlgebra(this.u, this.v);
    if (!res.success) {
      resultsContainer.innerHTML = `<div class="calculus-error">${res.error}</div>`;
      return;
    }

    const d = res.result;
    this.draw3DScene(d.crossProduct);

    // Badges
    const statusBadges = [];
    if (d.isOrthogonal) {
      statusBadges.push(`<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;">Orthogonal (u⃗ ⟂ v⃗)</span>`);
    }
    if (d.isParallel) {
      statusBadges.push(`<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b;">Parallel (u⃗ ∥ v⃗)</span>`);
    }

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero Summary -->
        <div class="calculus-result-hero">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="result-hero-label">Vector Analysis Outcomes</div>
            <div style="display: flex; gap: 6px;">${statusBadges.join('')}</div>
          </div>
          <div class="result-hero-value" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 1.15rem;">
            <div>
              <div style="font-size: 0.8rem; color: rgba(232, 224, 210, 0.7); margin-bottom: 2px;">Dot Product u · v</div>
              <div style="color: #E8E0D2; font-weight: 700;">${d.dotProduct}</div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: rgba(232, 224, 210, 0.7); margin-bottom: 2px;">Angle θ</div>
              <div style="color: #B89A5A; font-weight: 700;">${d.angleDeg}°</div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: rgba(232, 224, 210, 0.7); margin-bottom: 2px;">Cross Product u × v</div>
              <div style="color: #E8E0D2; font-weight: 700;">(${d.crossProduct.x}, ${d.crossProduct.y}, ${d.crossProduct.z})</div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: rgba(232, 224, 210, 0.7); margin-bottom: 2px;">Parallelogram Area |u × v|</div>
              <div style="color: #B89A5A; font-weight: 700;">${d.magCross} sq units</div>
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="calculus-card" style="padding: 16px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #B89A5A; margin-bottom: 6px;">Vector u Metrics</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">
              <div>• Magnitude |u| = <b>${d.magU}</b></div>
              <div>• Direction Cosines (l, m, n): <b>(${d.directionCosinesU.l}, ${d.directionCosinesU.m}, ${d.directionCosinesU.n})</b></div>
              <div>• Unit Vector û = (${d.directionCosinesU.l}, ${d.directionCosinesU.m}, ${d.directionCosinesU.n})</div>
            </div>
          </div>
          <div class="calculus-card" style="padding: 16px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #0E1D61; margin-bottom: 6px;">Vector v Metrics</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">
              <div>• Magnitude |v| = <b>${d.magV}</b></div>
              <div>• Projection of u on v = <b>${d.magV > 0 ? ResultFormatter.cleanNumber(d.dotProduct / d.magV) : 0}</b></div>
              <div>• Projection of v on u = <b>${d.magU > 0 ? ResultFormatter.cleanNumber(d.dotProduct / d.magU) : 0}</b></div>
            </div>
          </div>
        </div>

        <!-- Step-by-Step Derivation -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Algebraic Derivation & Proofs
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
