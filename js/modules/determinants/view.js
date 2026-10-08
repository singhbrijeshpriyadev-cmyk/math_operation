/**
 * OG - Module 17: Determinants View Component
 * Premium Liquid Glass UI displaying vertical determinant bars |A|,
 * order selectors (2x2, 3x3, 4x4), cofactor expansions, and intermediate steps.
 * ES6 Module
 */

import { determinantsController, DETERMINANT_PRESETS } from './controller.js';
import { MatrixVisualizer } from '../matrices/visualizer.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class DeterminantsView {
  constructor(container) {
    this.container = container;
    this.unsubscribe = null;
  }

  mount() {
    this.render();
    this.attachEventListeners();

    this.unsubscribe = determinantsController.subscribe((state) => {
      this.updateView(state);
    });

    this.updateView(determinantsController.getModuleState());
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  render() {
    const s = determinantsController.getModuleState();

    this.container.innerHTML = `
      <div class="view-animate-in matrix-module-container">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #17: Determinants</span>
        </nav>

        <!-- Hero Card -->
        <div class="glass-surface matrix-hero-card">
          <div class="badge-row" style="display: flex; gap: 10px; margin-bottom: 12px;">
            <span class="module-number-pill">Module #17</span>
            <span class="badge badge-linear">Linear Algebra</span>
            <span class="badge" style="background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
              Determinantal Calculus
            </span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px;">
                Determinants & Minors
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6;">
                Evaluate determinants of order 2×2, 3×3, and 4×4 with Laplace cofactor expansion, minor decompositions, cross-multiplication proofs, and singularity tests.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 1.8rem;">
              |A|
            </div>
          </div>
        </div>

        <!-- Order Selector Bar -->
        <div class="trig-tool-nav" id="det-order-nav">
          <button class="trig-tool-tab ${s.order === 2 ? 'active' : ''}" data-order="2">Order 2×2 (ad - bc)</button>
          <button class="trig-tool-tab ${s.order === 3 ? 'active' : ''}" data-order="3">Order 3×3 (Laplace Expansion)</button>
          <button class="trig-tool-tab ${s.order === 4 ? 'active' : ''}" data-order="4">Order 4×4 (Multilinear Form)</button>
        </div>

        <!-- Matrix Input Card with Vertical Determinant Bars | | -->
        <div class="glass-card" style="padding: 28px; border-radius: var(--radius-xl);" id="det-input-panel">
          <!-- Injected via renderInputPanels -->
        </div>

        <!-- Results & Intermediate Steps Card -->
        <div class="glass-card derivation-card" id="det-result-panel">
          <!-- Injected via renderResultPanel -->
        </div>
      </div>
    `;

    this.renderInputPanels(s);
    this.renderResultPanel(s);
  }

  renderInputPanels(s) {
    const panel = this.container.querySelector('#det-input-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">Determinant Input |A|</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Edit entries directly inside the determinant bars</span>
        </div>

        <!-- Presets -->
        <div class="sets-presets-bar" style="margin: 0; padding: 0; border: none;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary);">PRESETS:</span>
          <button class="sets-preset-chip" data-det-preset="det2">2×2 Cross</button>
          <button class="sets-preset-chip" data-det-preset="det3">3×3 Laplace</button>
          <button class="sets-preset-chip" data-det-preset="det3Singular">det = 0 Singular</button>
          <button class="sets-preset-chip" data-det-preset="det4Triangular">4×4 Triangular</button>
        </div>
      </div>

      <!-- Determinant Vertical Bars Grid -->
      <div style="display: flex; gap: 28px; align-items: center; margin-bottom: 20px;">
        ${MatrixVisualizer.renderInputGrid(s.mat, s.order, s.order, 'detMat', `Determinant |A| (${s.order}×${s.order})`, true)}
      </div>

      <!-- Action Button -->
      <div>
        <button id="btn-calc-det" class="glass-btn glass-btn-primary" style="padding: 12px 28px;">
          <span>Evaluate Determinant</span>
          ${SVG_ICONS.arrowRight}
        </button>
      </div>
    `;

    this.attachGridListeners();
  }

  renderResultPanel(s) {
    const panel = this.container.querySelector('#det-result-panel');
    if (!panel) return;

    if (s.lastError) {
      panel.innerHTML = `
        <div style="padding: 18px 24px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.4); color: #fecdd3; font-size: 0.95rem;">
          <strong>Determinant Evaluation Error:</strong> ${s.lastError}
        </div>
      `;
      return;
    }

    const res = s.latestResult;
    if (!res || !res.success) {
      panel.innerHTML = '<div style="color: var(--text-tertiary);">No calculation performed yet.</div>';
      return;
    }

    const detVal = res.result.determinant;
    const isSingular = res.result.isSingular;

    panel.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">
          Determinant Resolution & Cofactor Proof
        </h3>
        <button id="btn-copy-det-res" class="glass-btn glass-btn-outline" title="Copy result">
          ${SVG_ICONS.copy}
          <span>Copy Value</span>
        </button>
      </div>

      <!-- Formula Badge -->
      <div style="margin-bottom: 14px;">
        <span class="result-formula-badge">${res.formula}</span>
      </div>

      <!-- Main Value Banner: Deep Atlas Navy with Gold Value -->
      <div style="padding: 20px 24px; border-radius: var(--radius-lg); background: #0E1D61; border: 1px solid rgba(184, 154, 90, 0.4); display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(14, 29, 97, 0.2);">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; color: #B89A5A; text-transform: uppercase;">Determinant Value |A|:</div>
          <div style="font-family: var(--font-math); font-size: 2.2rem; font-weight: 800; color: #B89A5A; margin-top: 4px;">
            |A| = ${detVal}
          </div>
        </div>

        <div>
          <span class="badge ${isSingular ? 'badge-vectors' : 'badge-linear'}" style="font-size: 0.9rem; padding: 6px 16px;">
            ${isSingular ? 'Singular Matrix (det = 0)' : 'Non-Singular Matrix (Invertible)'}
          </span>
        </div>
      </div>

      <!-- Step-by-Step Derivations -->
      <div>
        <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 10px;">Laplace Expansion Steps:</h4>
        <div class="sets-steps-container">
          ${res.steps.map(st => `
            <div class="sets-step-item" style="white-space: pre-line; font-family: var(--font-math);">${st}</div>
          `).join('')}
        </div>
      </div>
    `;

    const copyBtn = panel.querySelector('#btn-copy-det-res');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        await copyToClipboard(String(detVal));
        showToast(`Copied determinant "${detVal}" to clipboard`);
      });
    }
  }

  attachEventListeners() {
    const nav = this.container.querySelector('#det-order-nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.trig-tool-tab');
        if (!tabBtn) return;
        const ord = Number(tabBtn.getAttribute('data-order'));
        determinantsController.setOrder(ord);
        nav.querySelectorAll('.trig-tool-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.renderInputPanels(determinantsController.getModuleState());
        this.renderResultPanel(determinantsController.getModuleState());
      });
    }
  }

  attachGridListeners() {
    const panel = this.container.querySelector('#det-input-panel');
    if (!panel) return;

    // Cell inputs
    panel.querySelectorAll('.matrix-cell-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const r = Number(inp.getAttribute('data-row'));
        const c = Number(inp.getAttribute('data-col'));
        determinantsController.setCell(r, c, inp.value);
      });
    });

    // Execute button
    const btnCalc = panel.querySelector('#btn-calc-det');
    if (btnCalc) {
      btnCalc.addEventListener('click', () => {
        determinantsController.calculateCurrent();
        this.renderResultPanel(determinantsController.getModuleState());
      });
    }

    // Presets
    const presetsBar = panel.querySelector('.sets-presets-bar');
    if (presetsBar) {
      presetsBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.sets-preset-chip');
        if (!chip) return;
        const pKey = chip.getAttribute('data-det-preset');
        determinantsController.loadPreset(pKey);

        // Update nav active tab
        const ord = determinantsController.getModuleState().order;
        const nav = this.container.querySelector('#det-order-nav');
        if (nav) {
          nav.querySelectorAll('.trig-tool-tab').forEach(b => {
            if (Number(b.getAttribute('data-order')) === ord) b.classList.add('active');
            else b.classList.remove('active');
          });
        }

        this.renderInputPanels(determinantsController.getModuleState());
        this.renderResultPanel(determinantsController.getModuleState());
        showToast(`Loaded ${DETERMINANT_PRESETS[pKey]?.name || 'preset'}`);
      });
    }
  }

  updateView(state) {
    if (!this.container) return;
    this.renderResultPanel(state);
  }
}
