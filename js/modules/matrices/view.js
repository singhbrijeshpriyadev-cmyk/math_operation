/**
 * OG - Module 16: Matrices View Component
 * Premium Liquid Glass UI displaying matrix inputs with curved brackets,
 * dimension selectors, operations toolbar, intermediate steps, and display visualizer.
 * ES6 Module
 */

import { matricesController, MATRIX_PRESETS } from './controller.js';
import { MatrixVisualizer } from './visualizer.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export const SUPPORTED_SIZES = [
  { label: '1×1', r: 1, c: 1 },
  { label: '2×2', r: 2, c: 2 },
  { label: '2×3', r: 2, c: 3 },
  { label: '3×2', r: 3, c: 2 },
  { label: '3×3', r: 3, c: 3 },
  { label: '3×4', r: 3, c: 4 },
  { label: '4×4', r: 4, c: 4 }
];

export class MatricesView {
  constructor(container) {
    this.container = container;
    this.unsubscribe = null;
  }

  mount() {
    this.render();
    this.attachEventListeners();

    this.unsubscribe = matricesController.subscribe((state) => {
      this.updateView(state);
    });

    this.updateView(matricesController.getModuleState());
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  render() {
    const s = matricesController.getModuleState();

    this.container.innerHTML = `
      <div class="view-animate-in matrix-module-container">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #16: Matrices</span>
        </nav>

        <!-- Hero Card -->
        <div class="glass-surface matrix-hero-card">
          <div class="badge-row" style="display: flex; gap: 10px; margin-bottom: 12px;">
            <span class="module-number-pill">Module #16</span>
            <span class="badge badge-linear">Linear Algebra</span>
            <span class="badge" style="background: rgba(184, 154, 90, 0.15); border-color: rgba(184, 154, 90, 0.4); color: #0E1D61;">
              Matrix Operations Engine
            </span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px;">
                Matrices & Linear Systems
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6;">
                Perform matrix addition, subtraction, multiplication, inverses, Gaussian rank reduction, determinants, transposes, and adjoint calculations.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 1.8rem;">
              [A]
            </div>
          </div>
        </div>

        <!-- Operations Navigation Pill Bar -->
        <div class="trig-tool-nav" id="matrix-ops-nav">
          <button class="trig-tool-tab ${s.activeOp === 'inverse' ? 'active' : ''}" data-op="inverse">Inverse A⁻¹</button>
          <button class="trig-tool-tab ${s.activeOp === 'multiply' ? 'active' : ''}" data-op="multiply">Multiply A × B</button>
          <button class="trig-tool-tab ${s.activeOp === 'add' ? 'active' : ''}" data-op="add">Add A + B</button>
          <button class="trig-tool-tab ${s.activeOp === 'subtract' ? 'active' : ''}" data-op="subtract">Subtract A - B</button>
          <button class="trig-tool-tab ${s.activeOp === 'scalar' ? 'active' : ''}" data-op="scalar">Scalar k · A</button>
          <button class="trig-tool-tab ${s.activeOp === 'transpose' ? 'active' : ''}" data-op="transpose">Transpose Aᵀ</button>
          <button class="trig-tool-tab ${s.activeOp === 'determinant' ? 'active' : ''}" data-op="determinant">Determinant |A|</button>
          <button class="trig-tool-tab ${s.activeOp === 'rank' ? 'active' : ''}" data-op="rank">Rank REF</button>
          <button class="trig-tool-tab ${s.activeOp === 'trace' ? 'active' : ''}" data-op="trace">Trace tr(A)</button>
          <button class="trig-tool-tab ${s.activeOp === 'adjoint' ? 'active' : ''}" data-op="adjoint">Adjoint adj(A)</button>
          <button class="trig-tool-tab ${s.activeOp === 'cofactor' ? 'active' : ''}" data-op="cofactor">Cofactors C</button>
        </div>

        <!-- Matrix Input Card with Liquid Glass Brackets -->
        <div class="glass-card" style="padding: 28px; border-radius: var(--radius-xl);" id="matrix-input-panel">
          <!-- Injected via renderInputPanels -->
        </div>

        <!-- Results & Intermediate Steps Card -->
        <div class="glass-card derivation-card" id="matrix-result-panel">
          <!-- Injected via renderResultPanel -->
        </div>
      </div>
    `;

    this.renderInputPanels(s);
    this.renderResultPanel(s);
  }

  renderInputPanels(s) {
    const panel = this.container.querySelector('#matrix-input-panel');
    if (!panel) return;

    const isBinary = ['add', 'subtract', 'multiply'].includes(s.activeOp);
    const isScalar = s.activeOp === 'scalar';

    // Dimension selectors HTML for Matrix A
    const dimButtonsA = SUPPORTED_SIZES.map(sz => `
      <button class="matrix-dim-btn ${s.rowsA === sz.r && s.colsA === sz.c ? 'active' : ''}" data-target="A" data-r="${sz.r}" data-c="${sz.c}">
        ${sz.label}
      </button>
    `).join('');

    const dimButtonsB = SUPPORTED_SIZES.map(sz => `
      <button class="matrix-dim-btn ${s.rowsB === sz.r && s.colsB === sz.c ? 'active' : ''}" data-target="B" data-r="${sz.r}" data-c="${sz.c}">
        ${sz.label}
      </button>
    `).join('');

    panel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">Matrix Input Specification</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Click any cell to edit numbers directly</span>
        </div>

        <!-- Presets -->
        <div class="sets-presets-bar" style="margin: 0; padding: 0; border: none;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary);">PRESETS:</span>
          <button class="sets-preset-chip" data-mat-preset="inv2">2×2 Invertible</button>
          <button class="sets-preset-chip" data-mat-preset="sing2">2×2 Singular</button>
          <button class="sets-preset-chip" data-mat-preset="std3">3×3 Standard</button>
          <button class="sets-preset-chip" data-mat-preset="mul23x32">2×3 × 3×2 Mul</button>
          <button class="sets-preset-chip" data-mat-preset="rank3">3×3 Rank Test</button>
          <button class="sets-preset-chip" data-mat-preset="id4">4×4 Identity</button>
        </div>
      </div>

      <!-- Size Selector Bar for Matrix A -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Matrix A Size:</div>
        <div class="matrix-dim-selector-bar">${dimButtonsA}</div>
      </div>

      <!-- Scalar input if scalar op -->
      ${isScalar ? `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <label style="font-weight: 700; color: var(--text-secondary);">Scalar Factor k =</label>
          <input type="number" id="matrix-scalar-input" class="glass-input" style="max-width: 120px; text-align: center; font-size: 1.1rem; padding: 10px;" value="${s.scalarK}">
        </div>
      ` : ''}

      <!-- Matrix Inputs Flex Layout -->
      <div style="display: flex; gap: 28px; align-items: center; flex-wrap: wrap;">
        <!-- Matrix A -->
        ${MatrixVisualizer.renderInputGrid(s.matA, s.rowsA, s.colsA, 'matA', 'Matrix A')}

        ${isBinary ? `
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--cyan-primary); padding: 0 8px;">
            ${s.activeOp === 'add' ? '+' : (s.activeOp === 'subtract' ? '-' : '×')}
          </div>

          <!-- Matrix B -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Matrix B Size:</div>
            <div class="matrix-dim-selector-bar" style="margin-bottom: 8px;">${dimButtonsB}</div>
            ${MatrixVisualizer.renderInputGrid(s.matB, s.rowsB, s.colsB, 'matB', 'Matrix B')}
          </div>
        ` : ''}
      </div>

      <!-- Action Button -->
      <div style="margin-top: 24px; display: flex; gap: 12px;">
        <button id="btn-calc-matrix" class="glass-btn glass-btn-primary" style="padding: 12px 28px;">
          <span>Execute Operation</span>
          ${SVG_ICONS.arrowRight}
        </button>
      </div>
    `;

    this.attachGridListeners();
  }

  renderResultPanel(s) {
    const panel = this.container.querySelector('#matrix-result-panel');
    if (!panel) return;

    if (s.lastError) {
      panel.innerHTML = `
        <div style="padding: 18px 24px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.4); color: #fecdd3; font-size: 0.95rem;">
          <strong>Dimension / Inversion Error:</strong> ${s.lastError}
        </div>
      `;
      return;
    }

    const res = s.latestResult;
    if (!res || !res.success) {
      panel.innerHTML = '<div style="color: var(--text-tertiary);">No calculation performed yet.</div>';
      return;
    }

    const isMatrixOutput = Boolean(res.result.data);

    panel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">
          Calculation Output & Intermediate Steps
        </h3>
        <button id="btn-copy-matrix-res" class="glass-btn glass-btn-outline" title="Copy result">
          ${SVG_ICONS.copy}
          <span>Copy Result</span>
        </button>
      </div>

      <!-- Formula Badge -->
      <div style="margin-bottom: 14px;">
        <span class="result-formula-badge">${res.formula}</span>
      </div>

      <!-- Visual Matrix Output Display: High contrast Deep Atlas Navy panel -->
      <div style="padding: 20px; border-radius: var(--radius-lg); background: #0E1D61; border: 1px solid rgba(184, 154, 90, 0.4); margin-bottom: 16px; box-shadow: 0 10px 30px rgba(14, 29, 97, 0.2);">
        <div style="font-size: 0.8rem; font-weight: 700; color: #B89A5A; text-transform: uppercase; margin-bottom: 8px;">Final Result:</div>
        ${isMatrixOutput ? MatrixVisualizer.renderDisplayMatrix(res.result.data) : `
          <div style="font-family: var(--font-math); font-size: 1.8rem; font-weight: 800; color: #B89A5A;">
            ${res.result.formatted}
          </div>
        `}
      </div>

      <!-- Step-by-Step Derivations -->
      <div>
        <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 10px;">Intermediate Computations:</h4>
        <div class="sets-steps-container">
          ${res.steps.map(st => `
            <div class="sets-step-item" style="white-space: pre-line; font-family: var(--font-math);">${st}</div>
          `).join('')}
        </div>
      </div>
    `;

    const copyBtn = panel.querySelector('#btn-copy-matrix-res');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        await copyToClipboard(res.result.formatted);
        showToast(`Copied result to clipboard`);
      });
    }
  }

  attachEventListeners() {
    const nav = this.container.querySelector('#matrix-ops-nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.trig-tool-tab');
        if (!tabBtn) return;
        const op = tabBtn.getAttribute('data-op');
        matricesController.setActiveOp(op);
        nav.querySelectorAll('.trig-tool-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.renderInputPanels(matricesController.getModuleState());
        this.renderResultPanel(matricesController.getModuleState());
      });
    }
  }

  attachGridListeners() {
    const panel = this.container.querySelector('#matrix-input-panel');
    if (!panel) return;

    // Dimension buttons
    panel.querySelectorAll('.matrix-dim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        const r = Number(btn.getAttribute('data-r'));
        const c = Number(btn.getAttribute('data-c'));
        matricesController.setMatrixSize(target, r, c);
        this.renderInputPanels(matricesController.getModuleState());
        this.renderResultPanel(matricesController.getModuleState());
      });
    });

    // Cell inputs
    panel.querySelectorAll('.matrix-cell-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const target = inp.getAttribute('data-matrix') === 'matA' ? 'A' : 'B';
        const r = Number(inp.getAttribute('data-row'));
        const c = Number(inp.getAttribute('data-col'));
        matricesController.setCell(target, r, c, inp.value);
      });
    });

    // Scalar input
    const scalarInp = panel.querySelector('#matrix-scalar-input');
    if (scalarInp) {
      scalarInp.addEventListener('input', () => {
        matricesController.setScalar(scalarInp.value);
      });
    }

    // Execute button
    const btnCalc = panel.querySelector('#btn-calc-matrix');
    if (btnCalc) {
      btnCalc.addEventListener('click', () => {
        matricesController.calculateCurrent();
        this.renderResultPanel(matricesController.getModuleState());
      });
    }

    // Presets
    const presetsBar = panel.querySelector('.sets-presets-bar');
    if (presetsBar) {
      presetsBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.sets-preset-chip');
        if (!chip) return;
        const pKey = chip.getAttribute('data-mat-preset');
        matricesController.loadPreset(pKey);
        this.renderInputPanels(matricesController.getModuleState());
        this.renderResultPanel(matricesController.getModuleState());
        showToast(`Loaded ${MATRIX_PRESETS[pKey]?.name || 'preset'}`);
      });
    }
  }

  updateView(state) {
    if (!this.container) return;
    this.renderResultPanel(state);
  }
}
