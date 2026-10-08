/**
 * OG - Linear Algebra Matrix Laboratory (MatrixLabView)
 * Dedicated Matrix Calculator and Operations Workspace
 *
 * Visual Identity: Ivory (#E8E0D2), Gold (#B89A5A), Deep Atlas Navy (#0E1D61)
 * Liquid Glass styling with curved bracket matrix displays
 *
 * Supports:
 * - Dynamic rows & cols (1x1 to 6x6+)
 * - Multiple matrices (A, B, C)
 * - Operations: Addition, Subtraction, Multiplication, Scalar, Power, Transpose, Trace, Hadamard
 * - Presets: Identity, Zero, Random, Diagonal, Symmetric, Vandermonde
 * - Matrix cell editor with keyboard navigation
 * - Matrix paste & text import
 * - Save & Load from localStorage
 * - Exact (fractional) and Decimal modes
 * - 7-Stage Mathematical Derivation flow
 * - Matrix Properties Analyzer integration
 * - Copy as Text, LaTeX, Array
 *
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { Matrix } from '../../linearAlgebra/matrix.js';
import { LinearAlgebraParser } from '../../linearAlgebra/parser.js';
import { MatrixOperationsEngine } from '../../linearAlgebra/matrixOperations.js';
import { MatrixPropertiesAnalyzer } from '../../linearAlgebra/properties.js';
import { LinearAlgebraFormatter } from '../../linearAlgebra/formatter.js';

export class MatrixLabView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;

    // Active matrices in laboratory
    this.matrices = {
      A: Matrix.from([[2, 1], [-1, 3]], 'A'),
      B: Matrix.from([[1, 4], [0, 2]], 'B'),
      C: Matrix.from([[1, 0, 2], [0, 1, -1]], 'C')
    };

    this.activeMatrixLabel = 'A';
    this.selectedOp = 'add';
    this.scalarK = 2;
    this.powerExponent = 2;
    this.exactMode = true;
    this.currentResult = null;
    this.savedMatrices = this._loadSavedMatrices();

    this._listeners = [];
  }

  mount() {
    this.render();
    this._attachListeners();
    this.executeOperation('A + B');
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));
    this._listeners = [];
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  _loadSavedMatrices() {
    try {
      const stored = localStorage.getItem('og_linear_algebra_saved_matrices');
      return stored ? JSON.parse(stored) : [
        { name: 'Standard 2x2', data: [[1, 2], [3, 4]] },
        { name: 'Rotation 90°', data: [[0, -1], [1, 0]] },
        { name: 'Symmetric 3x3', data: [[2, -1, 0], [-1, 2, -1], [0, -1, 2]] }
      ];
    } catch {
      return [];
    }
  }

  _saveSavedMatrices() {
    try {
      localStorage.setItem('og_linear_algebra_saved_matrices', JSON.stringify(this.savedMatrices));
    } catch (e) {
      console.warn('Could not save matrices to localStorage', e);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="la-workspace view-animate-in">
        <!-- Navigation Breadcrumb & Header -->
        <div class="la-header-row">
          <div class="la-header-text">
            <div class="la-breadcrumb">
              <a href="#/linear-algebra" class="la-breadcrumb-link">Linear Algebra</a>
              <span class="la-breadcrumb-sep">/</span>
              <span class="la-breadcrumb-current">Matrix Calculator & Operations</span>
            </div>
            <h1 class="la-title">Matrix Laboratory</h1>
            <p class="la-subtitle">Interactive matrix creation, cell editing, dynamic dimension control, and arithmetic operations.</p>
          </div>

          <!-- Controls: Mode Switcher & Navigation shortcut -->
          <div class="la-header-actions">
            <div class="la-mode-toggle" role="group" aria-label="Format mode selector">
              <button class="la-mode-btn ${this.exactMode ? 'active' : ''}" id="matlab-mode-exact" title="Exact Fractions Mode">
                <span>Exact (Fractions)</span>
              </button>
              <button class="la-mode-btn ${!this.exactMode ? 'active' : ''}" id="matlab-mode-decimal" title="Decimal Mode (6 decimals)">
                <span>Decimal</span>
              </button>
            </div>
            <a href="#/linear-algebra" class="la-btn la-btn-secondary" style="font-size: 0.8rem;">
              ← Back to Overview
            </a>
          </div>
        </div>

        <!-- Quick Switcher Tabs for Matrices A, B, C -->
        <div class="la-glass-card" style="margin-bottom: 24px; padding: 14px 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--la-gold); font-weight: 700;">Edit Matrix:</span>
              <div class="la-matrix-tab-bar" style="display: flex; gap: 6px;">
                ${['A', 'B', 'C'].map(lbl => `
                  <button class="la-tab-btn ${this.activeMatrixLabel === lbl ? 'active' : ''}" data-target-matrix="${lbl}">
                    Matrix ${lbl} <span style="font-size: 0.72rem; opacity: 0.8;">(${this.matrices[lbl].rows}×${this.matrices[lbl].cols})</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Presets & Actions for Active Matrix -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="la-btn la-btn-secondary" id="matlab-btn-duplicate" title="Duplicate active matrix">Duplicate</button>
              <button class="la-btn la-btn-secondary" id="matlab-btn-clear" title="Fill with zeros">Zero</button>
              <button class="la-btn la-btn-secondary" id="matlab-btn-identity" title="Identity matrix">Identity</button>
              <button class="la-btn la-btn-secondary" id="matlab-btn-random" title="Random integer values">Random</button>
              <button class="la-btn la-btn-secondary" id="matlab-btn-save" title="Save matrix to library">Save Matrix</button>
              <button class="la-btn la-btn-secondary" id="matlab-btn-import-toggle" title="Paste/Import raw data">Import / Paste</button>
            </div>
          </div>

          <!-- Collapsible Import Drawer -->
          <div id="matlab-import-drawer" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--la-border);">
            <div style="display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap;">
              <textarea id="matlab-import-text" class="la-code-box" style="flex: 1; min-width: 280px; min-height: 70px; resize: vertical; padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;" placeholder="e.g. [[1, 2], [3, 4]] OR [1 2; 3 4] OR 1 2 newline 3 4"></textarea>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="la-btn la-btn-primary" id="matlab-import-apply">Apply to Matrix ${this.activeMatrixLabel}</button>
                <button class="la-btn la-btn-secondary" id="matlab-import-cancel">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Matrix Workbenches Grid: Active Matrix + Companion Matrix -->
        <div class="la-grid-2" style="margin-bottom: 28px;">
          <!-- Left: Active Matrix Card -->
          <div class="la-glass-card" id="matlab-card-active">
            ${this._renderMatrixCard(this.activeMatrixLabel, this.matrices[this.activeMatrixLabel])}
          </div>

          <!-- Right: Companion Matrix Card (B or A) -->
          <div class="la-glass-card" id="matlab-card-companion">
            ${this._renderCompanionMatrixCard()}
          </div>
        </div>

        <!-- Operations Toolbar & Action Bar -->
        <div class="la-glass-card" style="margin-bottom: 28px;">
          <div class="la-card-header">
            <div>
              <div class="la-card-title">Matrix Operations</div>
              <div class="la-card-subtitle">Select an arithmetic, algebraic, or dimensional operation</div>
            </div>
            <div class="la-dim-badge">
              A: ${this.matrices.A.rows}×${this.matrices.A.cols} &nbsp;|&nbsp; B: ${this.matrices.B.rows}×${this.matrices.B.cols}
            </div>
          </div>

          <div class="la-ops-toolbar">
            <button class="la-op-btn ${this.selectedOp === 'add' ? 'active' : ''}" data-op="add">A + B</button>
            <button class="la-op-btn ${this.selectedOp === 'sub' ? 'active' : ''}" data-op="sub">A - B</button>
            <button class="la-op-btn ${this.selectedOp === 'mul' ? 'active' : ''}" data-op="mul">A × B</button>
            <button class="la-op-btn ${this.selectedOp === 'mul-ba' ? 'active' : ''}" data-op="mul-ba">B × A</button>
            <button class="la-op-btn ${this.selectedOp === 'hadamard' ? 'active' : ''}" data-op="hadamard">A ∘ B (Hadamard)</button>
            <button class="la-op-btn ${this.selectedOp === 'scalar-a' ? 'active' : ''}" data-op="scalar-a">k · A</button>
            <button class="la-op-btn ${this.selectedOp === 'power-a' ? 'active' : ''}" data-op="power-a">A^n (Power)</button>
            <button class="la-op-btn ${this.selectedOp === 'transpose-a' ? 'active' : ''}" data-op="transpose-a">Aᵀ (Transpose)</button>
            <button class="la-op-btn ${this.selectedOp === 'trace-a' ? 'active' : ''}" data-op="trace-a">tr(A) (Trace)</button>
            <button class="la-op-btn ${this.selectedOp === 'equality' ? 'active' : ''}" data-op="equality">A = B (Equality)</button>
          </div>

          <!-- Parameter Sub-bar for Scalar & Power -->
          <div id="matlab-op-params" style="display: flex; align-items: center; gap: 16px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--la-border); flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="matlab-input-scalar" style="font-size: 0.85rem; color: var(--la-gold); font-weight: 600;">Scalar k:</label>
              <input type="number" id="matlab-input-scalar" class="la-cell-input" style="width: 70px; text-align: center;" value="${this.scalarK}" step="any">
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="matlab-input-exponent" style="font-size: 0.85rem; color: var(--la-gold); font-weight: 600;">Exponent n:</label>
              <input type="number" id="matlab-input-exponent" class="la-cell-input" style="width: 70px; text-align: center;" value="${this.powerExponent}" min="0" max="10" step="1">
            </div>
            <button class="la-btn la-btn-primary" id="matlab-btn-recalc" style="padding: 6px 18px;">
              Compute Selected
            </button>
          </div>
        </div>

        <!-- 7-Stage Mathematical Derivation & Result Panel -->
        <div id="matlab-result-region" style="margin-bottom: 28px;">
          <!-- Dynamically populated by _renderResult() -->
        </div>

        <!-- Matrix Properties Analyzer & Saved Library Grid -->
        <div class="la-grid-2">
          <!-- Active Matrix Properties Card -->
          <div class="la-glass-card" id="matlab-properties-card">
            ${this._renderPropertiesCard(this.matrices[this.activeMatrixLabel])}
          </div>

          <!-- Saved Matrices Library Card -->
          <div class="la-glass-card">
            <div class="la-card-header">
              <div>
                <div class="la-card-title">Saved Matrices</div>
                <div class="la-card-subtitle">Stored configurations in browser memory</div>
              </div>
            </div>
            <div id="matlab-saved-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
              ${this._renderSavedList()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderMatrixCard(label, matrix) {
    return `
      <div class="la-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="la-step-num" style="width: 32px; height: 32px; font-size: 0.95rem;">${label}</div>
          <div>
            <div class="la-card-title">Matrix ${label}</div>
            <div class="la-card-subtitle">${matrix.rows} × ${matrix.cols} Real Matrix</div>
          </div>
        </div>
        <div class="la-matrix-dim-controls">
          <button class="la-dim-btn" data-action="remove-row" data-mat="${label}" title="Remove row">−</button>
          <span style="font-size: 0.82rem; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${matrix.rows}R</span>
          <button class="la-dim-btn" data-action="add-row" data-mat="${label}" title="Add row">+</button>
          <span style="color: var(--la-gold); margin: 0 2px;">×</span>
          <button class="la-dim-btn" data-action="remove-col" data-mat="${label}" title="Remove column">−</button>
          <span style="font-size: 0.82rem; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${matrix.cols}C</span>
          <button class="la-dim-btn" data-action="add-col" data-mat="${label}" title="Add column">+</button>
        </div>
      </div>

      <!-- Matrix Grid with Curved Bracket -->
      <div style="display: flex; justify-content: center; margin: 20px 0;">
        <div class="la-matrix-bracket">
          <div class="la-matrix-grid" style="grid-template-columns: repeat(${matrix.cols}, minmax(52px, 1fr));">
            ${matrix.data.map((row, r) =>
              row.map((val, c) => `
                <input
                  type="text"
                  class="la-cell-input"
                  data-mat="${label}"
                  data-row="${r}"
                  data-col="${c}"
                  value="${val}"
                  aria-label="Matrix ${label} row ${r+1} col ${c+1}"
                >
              `).join('')
            ).join('')}
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--la-border); padding-top: 12px; font-size: 0.82rem;">
        <div style="display: flex; gap: 6px;">
          <button class="la-btn la-btn-secondary" data-copy-mat="${label}" style="font-size: 0.78rem; padding: 4px 10px;">
            Copy [ [ ] ]
          </button>
          <button class="la-btn la-btn-secondary" data-copy-latex="${label}" style="font-size: 0.78rem; padding: 4px 10px;">
            LaTeX
          </button>
        </div>
        <div style="color: var(--la-gold); font-family: 'JetBrains Mono', monospace;">
          dim: ${matrix.rows}×${matrix.cols}
        </div>
      </div>
    `;
  }

  _renderCompanionMatrixCard() {
    const companionLabel = this.activeMatrixLabel === 'A' ? 'B' : 'A';
    const companionMatrix = this.matrices[companionLabel];
    return this._renderMatrixCard(companionLabel, companionMatrix);
  }

  _renderPropertiesCard(matrix) {
    const analysis = MatrixPropertiesAnalyzer.analyze(matrix);
    return `
      <div class="la-card-header">
        <div>
          <div class="la-card-title">Properties of Matrix ${matrix.label || 'A'}</div>
          <div class="la-card-subtitle">Algebraic structure and structural classification</div>
        </div>
        <div class="la-dim-badge">${matrix.rows} × ${matrix.cols}</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${analysis.properties.map(p => `
          <div class="la-prop-item">
            <span class="la-prop-name">${p.name}</span>
            <span class="la-prop-badge ${p.holds ? 'positive' : 'negative'}">
              ${p.holds ? '✓ ' + p.note : '✗ ' + p.note}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }

  _renderSavedList() {
    if (!this.savedMatrices.length) {
      return `<div style="text-align: center; color: var(--la-navy); opacity: 0.6; padding: 24px; font-size: 0.85rem;">No saved matrices. Click "Save Matrix" to preserve one.</div>`;
    }
    return this.savedMatrices.map((item, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(232, 224, 210, 0.4); border-radius: 8px; border: 1px solid var(--la-border);">
        <div>
          <div style="font-weight: 600; font-size: 0.85rem; color: var(--la-navy);">${item.name}</div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--la-gold);">
            ${item.data.length}×${item.data[0]?.length || 0} &nbsp;·&nbsp; [${item.data[0]?.slice(0, 3).join(', ')}${item.data[0]?.length > 3 ? '...' : ''}]
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="la-btn la-btn-secondary" data-load-idx="${idx}" style="padding: 4px 10px; font-size: 0.75rem;">Load into ${this.activeMatrixLabel}</button>
          <button class="la-btn la-btn-secondary" data-delete-idx="${idx}" style="padding: 4px 8px; font-size: 0.75rem; color: #a94442;">✕</button>
        </div>
      </div>
    `).join('');
  }

  executeOperation(op) {
    const matA = this.matrices.A;
    const matB = this.matrices.B;
    let res = null;

    if (op === 'A + B' || op === 'add') {
      res = MatrixOperationsEngine.add(matA, matB);
    } else if (op === 'A - B' || op === 'sub') {
      res = MatrixOperationsEngine.subtract(matA, matB);
    } else if (op === 'A × B' || op === 'mul') {
      res = MatrixOperationsEngine.multiply(matA, matB);
    } else if (op === 'B × A' || op === 'mul-ba') {
      res = MatrixOperationsEngine.multiply(matB, matA);
    } else if (op === 'hadamard') {
      res = MatrixOperationsEngine.hadamard(matA, matB);
    } else if (op === 'scalar-a') {
      res = MatrixOperationsEngine.scalarMultiply(this.scalarK, matA);
    } else if (op === 'power-a') {
      res = MatrixOperationsEngine.power(matA, this.powerExponent);
    } else if (op === 'transpose-a') {
      res = MatrixOperationsEngine.transpose(matA);
    } else if (op === 'trace-a') {
      res = MatrixOperationsEngine.trace(matA);
    } else if (op === 'equality') {
      res = MatrixOperationsEngine.equals(matA, matB);
    }

    this.currentResult = res;
    this._renderResult();
  }

  _renderResult() {
    const container = document.getElementById('matlab-result-region');
    if (!container) return;

    if (!this.currentResult) {
      container.innerHTML = '';
      return;
    }

    const res = this.currentResult;
    if (!res.success) {
      container.innerHTML = `
        <div class="la-glass-card" style="border-left: 4px solid var(--la-gold);">
          <div class="la-error-banner">
            <div style="font-weight: 700; font-size: 1rem; margin-bottom: 6px;">
              Mathematical Requirement Not Met (${res.error.code})
            </div>
            <div style="font-size: 0.9rem; line-height: 1.5; opacity: 0.95;">
              ${res.error.message}
            </div>
            ${res.error.details ? `<div style="margin-top: 8px; font-size: 0.82rem; opacity: 0.85;">${res.error.details}</div>` : ''}
          </div>
        </div>
      `;
      return;
    }

    // Format matrix representation
    let resultDisplayHtml = '';
    if (res.result instanceof Matrix) {
      const mat = res.result;
      resultDisplayHtml = `
        <div class="la-matrix-bracket">
          <div class="la-matrix-grid" style="grid-template-columns: repeat(${mat.cols}, minmax(48px, 1fr));">
            ${mat.data.map(row =>
              row.map(val => `
                <div class="la-cell-readonly">
                  ${this.exactMode ? LinearAlgebraFormatter.formatValue(val, true) : LinearAlgebraFormatter.formatValue(val, false, 6)}
                </div>
              `).join('')
            ).join('')}
          </div>
        </div>
      `;
    } else if (typeof res.result === 'number') {
      resultDisplayHtml = `
        <div class="la-result-callout" style="font-size: 2.2rem; font-weight: 800; color: var(--la-navy);">
          ${this.exactMode ? LinearAlgebraFormatter.formatValue(res.result, true) : LinearAlgebraFormatter.formatValue(res.result, false, 6)}
        </div>
      `;
    } else if (typeof res.result === 'boolean') {
      resultDisplayHtml = `
        <div class="la-result-callout" style="font-size: 1.6rem; font-weight: 700; color: ${res.result ? 'var(--la-gold)' : 'var(--la-navy)'};">
          ${res.result ? '✓ True (Matrices are equal within tolerance)' : '✗ False (Matrices differ)'}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="la-glass-card">
        <!-- Result Header -->
        <div class="la-card-header">
          <div>
            <div class="la-card-title">Computation Result: ${res.operation.toUpperCase()}</div>
            <div class="la-card-subtitle">${res.formula || 'Standard Matrix Operation'}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="la-btn la-btn-secondary" id="matlab-copy-result-btn" title="Copy result matrix">
              Copy Result
            </button>
            <button class="la-btn la-btn-secondary" id="matlab-copy-latex-btn" title="Copy LaTeX">
              Copy LaTeX
            </button>
          </div>
        </div>

        <!-- Result Box -->
        <div style="display: flex; justify-content: center; align-items: center; padding: 24px; background: rgba(232, 224, 210, 0.3); border-radius: 12px; margin-bottom: 24px;">
          ${resultDisplayHtml}
        </div>

        ${res.verification ? `
          <div class="la-verification-box" style="margin-bottom: 20px;">
            <strong>Verification:</strong> ${res.verification.message}
          </div>
        ` : ''}

        <!-- 7-Stage Mathematical Derivation Flow -->
        <div class="la-steps-container">
          <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--la-gold); margin-bottom: 14px;">
            Step-by-Step Mathematical Derivation
          </div>
          ${res.steps && res.steps.length ? res.steps.map(step => `
            <div class="la-step-item">
              <div class="la-step-num">${step.step}</div>
              <div class="la-step-content">
                <div class="la-step-title">${step.title}</div>
                <div class="la-step-detail">${step.detail}</div>
                ${step.latex ? `<div class="la-step-latex">${step.latex}</div>` : ''}
              </div>
            </div>
          `).join('') : '<div style="font-size: 0.85rem; color: var(--la-navy); opacity: 0.8;">No sub-steps required for this identity operation.</div>'}
        </div>
      </div>
    `;

    // Attach copy actions
    const copyResultBtn = document.getElementById('matlab-copy-result-btn');
    if (copyResultBtn) {
      copyResultBtn.addEventListener('click', () => {
        if (res.result instanceof Matrix) {
          copyToClipboard(res.result.toText());
          showToast('Result matrix copied to clipboard');
        } else {
          copyToClipboard(String(res.result));
          showToast('Result copied to clipboard');
        }
      });
    }

    const copyLatexBtn = document.getElementById('matlab-copy-latex-btn');
    if (copyLatexBtn) {
      copyLatexBtn.addEventListener('click', () => {
        if (res.result instanceof Matrix) {
          copyToClipboard(res.result.toLatex());
          showToast('LaTeX bmatrix copied to clipboard');
        } else {
          copyToClipboard(String(res.result));
          showToast('Copied to clipboard');
        }
      });
    }
  }

  _attachListeners() {
    // Mode switcher
    const exactBtn = document.getElementById('matlab-mode-exact');
    const decimalBtn = document.getElementById('matlab-mode-decimal');
    this._on(exactBtn, 'click', () => {
      this.exactMode = true;
      exactBtn.classList.add('active');
      decimalBtn.classList.remove('active');
      this._renderResult();
    });
    this._on(decimalBtn, 'click', () => {
      this.exactMode = false;
      decimalBtn.classList.add('active');
      exactBtn.classList.remove('active');
      this._renderResult();
    });

    // Matrix Tabs (A, B, C)
    const tabBtns = this.container.querySelectorAll('[data-target-matrix]');
    tabBtns.forEach(btn => {
      this._on(btn, 'click', (e) => {
        this.activeMatrixLabel = e.currentTarget.dataset.targetMatrix;
        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      });
    });

    // Dimension controls (+ / - row, + / - col)
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const action = e.currentTarget.dataset.action;
        const matLbl = e.currentTarget.dataset.mat;
        const mat = this.matrices[matLbl];
        if (!mat) return;

        if (action === 'add-row') {
          if (mat.rows >= 8) return showToast('Maximum 8 rows supported');
          const newRow = new Array(mat.cols).fill(0);
          this.matrices[matLbl] = Matrix.from([...mat.data, newRow], matLbl);
        } else if (action === 'remove-row') {
          if (mat.rows <= 1) return showToast('Minimum 1 row required');
          const newData = mat.data.slice(0, -1);
          this.matrices[matLbl] = Matrix.from(newData, matLbl);
        } else if (action === 'add-col') {
          if (mat.cols >= 8) return showToast('Maximum 8 columns supported');
          const newData = mat.data.map(r => [...r, 0]);
          this.matrices[matLbl] = Matrix.from(newData, matLbl);
        } else if (action === 'remove-col') {
          if (mat.cols <= 1) return showToast('Minimum 1 column required');
          const newData = mat.data.map(r => r.slice(0, -1));
          this.matrices[matLbl] = Matrix.from(newData, matLbl);
        }

        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      });
    });

    // Cell inputs editing
    this.container.querySelectorAll('.la-cell-input[data-mat]').forEach(input => {
      this._on(input, 'change', (e) => {
        const matLbl = e.currentTarget.dataset.mat;
        const r = parseInt(e.currentTarget.dataset.row, 10);
        const c = parseInt(e.currentTarget.dataset.col, 10);
        const val = parseFloat(e.currentTarget.value) || 0;
        this.matrices[matLbl] = this.matrices[matLbl].set(r, c, val);
        this._updateProperties();
        this.executeOperation(this.selectedOp);
      });
    });

    // Quick Matrix Presets for Active Matrix
    const dupBtn = document.getElementById('matlab-btn-duplicate');
    this._on(dupBtn, 'click', () => {
      const active = this.matrices[this.activeMatrixLabel];
      const targetLbl = this.activeMatrixLabel === 'A' ? 'B' : 'A';
      this.matrices[targetLbl] = Matrix.from(active.data.map(r => [...r]), targetLbl);
      showToast(`Copied Matrix ${this.activeMatrixLabel} to Matrix ${targetLbl}`);
      this.render();
      this._attachListeners();
      this.executeOperation(this.selectedOp);
    });

    const clearBtn = document.getElementById('matlab-btn-clear');
    this._on(clearBtn, 'click', () => {
      const active = this.matrices[this.activeMatrixLabel];
      this.matrices[this.activeMatrixLabel] = Matrix.zero(active.rows, active.cols, this.activeMatrixLabel);
      this.render();
      this._attachListeners();
      this.executeOperation(this.selectedOp);
    });

    const identBtn = document.getElementById('matlab-btn-identity');
    this._on(identBtn, 'click', () => {
      const active = this.matrices[this.activeMatrixLabel];
      const n = Math.min(active.rows, active.cols);
      this.matrices[this.activeMatrixLabel] = Matrix.identity(n, this.activeMatrixLabel);
      this.render();
      this._attachListeners();
      this.executeOperation(this.selectedOp);
    });

    const randBtn = document.getElementById('matlab-btn-random');
    this._on(randBtn, 'click', () => {
      const active = this.matrices[this.activeMatrixLabel];
      this.matrices[this.activeMatrixLabel] = Matrix.random(active.rows, active.cols, -5, 10, this.activeMatrixLabel);
      this.render();
      this._attachListeners();
      this.executeOperation(this.selectedOp);
    });

    // Save Matrix to library
    const saveBtn = document.getElementById('matlab-btn-save');
    this._on(saveBtn, 'click', () => {
      const active = this.matrices[this.activeMatrixLabel];
      const name = prompt(`Enter name for Matrix ${this.activeMatrixLabel}:`, `Matrix ${this.activeMatrixLabel} (${active.rows}x${active.cols})`);
      if (name) {
        this.savedMatrices.push({
          name: name.trim(),
          data: active.data.map(r => [...r])
        });
        this._saveSavedMatrices();
        showToast(`Saved "${name}" to library`);
        const listEl = document.getElementById('matlab-saved-list');
        if (listEl) listEl.innerHTML = this._renderSavedList();
      }
    });

    // Import drawer toggle
    const importToggleBtn = document.getElementById('matlab-btn-import-toggle');
    const importDrawer = document.getElementById('matlab-import-drawer');
    this._on(importToggleBtn, 'click', () => {
      if (importDrawer) {
        importDrawer.style.display = importDrawer.style.display === 'none' ? 'block' : 'none';
      }
    });

    const importCancel = document.getElementById('matlab-import-cancel');
    this._on(importCancel, 'click', () => {
      if (importDrawer) importDrawer.style.display = 'none';
    });

    const importApply = document.getElementById('matlab-import-apply');
    this._on(importApply, 'click', () => {
      const txt = document.getElementById('matlab-import-text')?.value;
      if (!txt) return;
      const parsed = LinearAlgebraParser.parseMatrix(txt, this.activeMatrixLabel);
      if (parsed.success) {
        this.matrices[this.activeMatrixLabel] = parsed.matrix;
        showToast(`Matrix ${this.activeMatrixLabel} updated from import`);
        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      } else {
        showToast(parsed.error?.message || 'Invalid matrix format');
      }
    });

    // Operations toolbar
    this.container.querySelectorAll('.la-op-btn[data-op]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        this.container.querySelectorAll('.la-op-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedOp = e.currentTarget.dataset.op;
        this.executeOperation(this.selectedOp);
      });
    });

    // Scalar & Power inputs
    const scalarInput = document.getElementById('matlab-input-scalar');
    this._on(scalarInput, 'change', (e) => {
      this.scalarK = parseFloat(e.currentTarget.value) || 1;
    });

    const exponentInput = document.getElementById('matlab-input-exponent');
    this._on(exponentInput, 'change', (e) => {
      this.powerExponent = parseInt(e.currentTarget.value, 10) || 1;
    });

    const recalcBtn = document.getElementById('matlab-btn-recalc');
    this._on(recalcBtn, 'click', () => {
      this.executeOperation(this.selectedOp);
    });

    // Copy matrix actions
    this.container.querySelectorAll('[data-copy-mat]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const matLbl = e.currentTarget.dataset.copyMat;
        const mat = this.matrices[matLbl];
        if (mat) {
          copyToClipboard(mat.toText());
          showToast(`Copied Matrix ${matLbl}`);
        }
      });
    });

    this.container.querySelectorAll('[data-copy-latex]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const matLbl = e.currentTarget.dataset.copyLatex;
        const mat = this.matrices[matLbl];
        if (mat) {
          copyToClipboard(mat.toLatex());
          showToast(`Copied LaTeX for Matrix ${matLbl}`);
        }
      });
    });

    // Saved list load & delete
    this.container.querySelectorAll('[data-load-idx]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.loadIdx, 10);
        const item = this.savedMatrices[idx];
        if (item) {
          this.matrices[this.activeMatrixLabel] = Matrix.from(item.data, this.activeMatrixLabel);
          showToast(`Loaded "${item.name}" into Matrix ${this.activeMatrixLabel}`);
          this.render();
          this._attachListeners();
          this.executeOperation(this.selectedOp);
        }
      });
    });

    this.container.querySelectorAll('[data-delete-idx]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.deleteIdx, 10);
        this.savedMatrices.splice(idx, 1);
        this._saveSavedMatrices();
        showToast('Saved matrix deleted');
        const listEl = document.getElementById('matlab-saved-list');
        if (listEl) listEl.innerHTML = this._renderSavedList();
      });
    });
  }

  _updateProperties() {
    const card = document.getElementById('matlab-properties-card');
    if (card) {
      card.innerHTML = this._renderPropertiesCard(this.matrices[this.activeMatrixLabel]);
    }
  }
}
