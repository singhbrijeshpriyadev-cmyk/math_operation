/**
 * OG - Module 11: Introduction to Three-Dimensional Geometry View
 * Interactive 3D Coordinate exploration:
 * - Octants and coordinates in space
 * - 3D Distance formula: d = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²]
 * - Section formula: internal / external division
 * - Isometric 3D Canvas visualizer projecting (X, Y, Z) space.
 * ES6 Module
 */

import { Vector3DMathEngine } from '../../math/vectors.js';
import { ResultFormatter } from '../../math/formatter.js';

export class Intro3DView {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;

    // State
    this.p1 = { x: 1, y: 2, z: 3 };
    this.p2 = { x: 4, y: 6, z: 8 };
    this.ratioM = 2;
    this.ratioN = 1;
    this.isInternal = true;
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
                Module #11
              </span>
              <span class="badge badge-geometry">Coordinate Geometry</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              3D Coordinate Geometry
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Explore three-dimensional space $\\mathbb{R}^3$, octants, spatial distance calculations,
              and internal/external section ratios with projected 3D isometric visualization.
            </p>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="#/geometry/3d" class="glass-button glass-button-primary" style="padding: 8px 18px; text-decoration: none;">
              Launch 3D Workspace 📐
            </a>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Coordinate Pairs:
          </div>
          <div class="calculus-preset-bar" id="intro3d-preset-container">
            <button class="preset-chip" data-preset="diag">P₁(0,0,0) to P₂(3,4,5)</button>
            <button class="preset-chip" data-preset="std">P₁(1,2,3) to P₂(4,6,8)</button>
            <button class="preset-chip" data-preset="neg">P₁(-2,1,3) to P₂(2,-3,1)</button>
            <button class="preset-chip" data-preset="cube">P₁(0,0,0) to P₂(2,2,2)</button>
          </div>
        </div>

        <!-- Workspace Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              3D Spatial Coordinates
            </h3>

            <!-- Point 1 -->
            <div>
              <label style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600; display: block; margin-bottom: 6px;">
                Point P₁(x₁, y₁, z₁):
              </label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <input type="number" step="any" id="p1-x" class="calculus-input-field" value="${this.p1.x}">
                <input type="number" step="any" id="p1-y" class="calculus-input-field" value="${this.p1.y}">
                <input type="number" step="any" id="p1-z" class="calculus-input-field" value="${this.p1.z}">
              </div>
            </div>

            <!-- Point 2 -->
            <div>
              <label style="font-size: 0.85rem; color: var(--accent-violet); font-weight: 600; display: block; margin-bottom: 6px;">
                Point P₂(x₂, y₂, z₂):
              </label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                <input type="number" step="any" id="p2-x" class="calculus-input-field" value="${this.p2.x}">
                <input type="number" step="any" id="p2-y" class="calculus-input-field" value="${this.p2.y}">
                <input type="number" step="any" id="p2-z" class="calculus-input-field" value="${this.p2.z}">
              </div>
            </div>

            <!-- Ratio -->
            <div>
              <label style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; display: block; margin-bottom: 6px;">
                Section Ratio (m : n):
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <input type="number" step="any" min="0.1" id="ratio-m" class="calculus-input-field" value="${this.ratioM}" placeholder="m">
                <input type="number" step="any" min="0.1" id="ratio-n" class="calculus-input-field" value="${this.ratioN}" placeholder="n">
              </div>
            </div>

            <button class="glass-button glass-button-primary" id="btn-intro3d-calc" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Compute Distance & Section Point
            </button>
          </div>

          <!-- 3D Isometric Projected Canvas -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Isometric ℝ³ Space Projection
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Axes: X (Gold), Y & Z (Deep Atlas Navy)
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="intro3d-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A; border-radius: 50%; width: 8px; height: 8px;"></span>
                <span>Point P₁</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator" style="background: #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                <span>Point P₂</span>
              </div>
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A; border: 1.5px solid #0E1D61; border-radius: 50%; width: 8px; height: 8px;"></span>
                <span>Section Point P</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Showcase -->
        <div id="intro3d-results-container"></div>
      </div>
    `;
  }

  initCanvas() {
    this.canvas = document.getElementById('intro3d-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: 500 };
    const width = Math.max(rect.width, 320);
    const height = 340;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  // 3D Isometric coordinate projection: (x, y, z) -> (screenX, screenY)
  project3D(x, y, z) {
    const originX = this.displayWidth / 2;
    const originY = this.displayHeight / 2 + 30;
    const scale = 18;

    // Isometric projection angle (30 degrees)
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);

    const sx = originX + (y - x) * cos30 * scale;
    const sy = originY + (x + y) * sin30 * scale - z * scale;

    return { x: sx, y: sy };
  }

  draw3DScene(sectionPt) {
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

    // 1. Draw 3D Axes
    const xEnd = this.project3D(7, 0, 0);
    const yEnd = this.project3D(0, 7, 0);
    const zEnd = this.project3D(0, 0, 7);

    // X axis (Gold)
    ctx.strokeStyle = '#B89A5A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(xEnd.x, xEnd.y);
    ctx.stroke();
    ctx.fillStyle = '#B89A5A';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText('+X', xEnd.x - 14, xEnd.y + 12);

    // Y axis (Deep Atlas Navy)
    ctx.strokeStyle = '#0E1D61';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.stroke();
    ctx.fillStyle = '#0E1D61';
    ctx.fillText('+Y', yEnd.x + 8, yEnd.y + 12);

    // Z axis (Deep Atlas Navy secondary)
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(14, 29, 97, 0.8)';
    ctx.fillText('+Z', zEnd.x - 6, zEnd.y - 8);

    // 2. Line Segment P1 - P2
    const sP1 = this.project3D(this.p1.x, this.p1.y, this.p1.z);
    const sP2 = this.project3D(this.p2.x, this.p2.y, this.p2.z);

    ctx.strokeStyle = 'rgba(14, 29, 97, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sP1.x, sP1.y);
    ctx.lineTo(sP2.x, sP2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Points
    const drawPoint = (pt, color, label) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0E1D61';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(label, pt.x + 8, pt.y - 6);
    };

    drawPoint(sP1, '#B89A5A', `P₁(${this.p1.x},${this.p1.y},${this.p1.z})`);
    drawPoint(sP2, '#0E1D61', `P₂(${this.p2.x},${this.p2.y},${this.p2.z})`);

    if (sectionPt) {
      const sPt = this.project3D(sectionPt.x, sectionPt.y, sectionPt.z);
      drawPoint(sPt, '#B89A5A', `P(${sectionPt.x},${sectionPt.y},${sectionPt.z})`);
    }
  }

  attachEventListeners() {
    const presetContainer = document.getElementById('intro3d-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'diag') {
          this.p1 = { x: 0, y: 0, z: 0 };
          this.p2 = { x: 3, y: 4, z: 5 };
        } else if (p === 'std') {
          this.p1 = { x: 1, y: 2, z: 3 };
          this.p2 = { x: 4, y: 6, z: 8 };
        } else if (p === 'neg') {
          this.p1 = { x: -2, y: 1, z: 3 };
          this.p2 = { x: 2, y: -3, z: 1 };
        } else if (p === 'cube') {
          this.p1 = { x: 0, y: 0, z: 0 };
          this.p2 = { x: 2, y: 2, z: 2 };
        }

        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        };
        setVal('p1-x', this.p1.x);
        setVal('p1-y', this.p1.y);
        setVal('p1-z', this.p1.z);
        setVal('p2-x', this.p2.x);
        setVal('p2-y', this.p2.y);
        setVal('p2-z', this.p2.z);

        this.calculate();
      });
    }

    const btn = document.getElementById('btn-intro3d-calc');
    if (btn) {
      btn.addEventListener('click', () => {
        const getVal = (id) => parseFloat(document.getElementById(id)?.value) || 0;
        this.p1 = { x: getVal('p1-x'), y: getVal('p1-y'), z: getVal('p1-z') };
        this.p2 = { x: getVal('p2-x'), y: getVal('p2-y'), z: getVal('p2-z') };
        this.ratioM = getVal('ratio-m') || 1;
        this.ratioN = getVal('ratio-n') || 1;
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('intro3d-results-container');
    if (!resultsContainer) return;

    const distRes = Vector3DMathEngine.distance3D(this.p1, this.p2);
    const secRes = Vector3DMathEngine.sectionFormula(this.p1, this.p2, this.ratioM, this.ratioN, this.isInternal);

    this.draw3DScene(secRes.success ? secRes.result.point : null);

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Hero -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">3D Spatial Geometry Outcomes</div>
          <div class="result-hero-value" style="display: flex; flex-direction: column; gap: 6px;">
            <div style="color: #E8E0D2; font-weight: 700;">Distance P₁P₂ = ${distRes.result.distance} units</div>
            <div style="color: #B89A5A; font-size: 1.35rem; font-weight: 700;">
              Section Point P (${this.ratioM}:${this.ratioN}): (${secRes.result.point.x}, ${secRes.result.point.y}, ${secRes.result.point.z})
            </div>
          </div>
        </div>

        <!-- Derivation -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Derivation
          </h3>
          ${distRes.steps.map(step => `
            <div class="step-card">
              <div class="step-card-body">${step}</div>
            </div>
          `).join('')}
          ${secRes.steps.map(step => `
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
