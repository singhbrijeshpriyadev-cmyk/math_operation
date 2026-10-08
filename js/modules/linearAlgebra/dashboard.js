/**
 * OG - Linear Algebra Main Dashboard View (LinearAlgebraView)
 * Visual Identity: Ivory (#E8E0D2), Gold (#B89A5A), Deep Atlas Navy (#0E1D61)
 * Premium Liquid Glass Architecture
 *
 * Header: LINEAR ALGEBRA "Explore matrices, vectors, transformations and linear systems."
 * Phase 1 Implementation:
 * - Universal Linear Algebra input area with intelligent operation suggestions
 * - Interactive multi-matrix manager (Matrix A, Matrix B) with curved brackets
 * - Dynamic dimension controls (+ / - row, + / - col, size presets 1x1 to 5x5)
 * - Matrix Operations: A + B, A - B, A × B, k · A, Aᵀ, tr(A), A², A ∘ B
 * - Exact / Decimal mode switcher
 * - 7-Stage Mathematical Derivation flow
 * - Matrix Properties Analyzer card
 * - Linear Algebra Module Navigation Grid
 *
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { Matrix } from '../../linearAlgebra/matrix.js';
import { LinearAlgebraParser } from '../../linearAlgebra/parser.js';
import { MatrixOperationsEngine } from '../../linearAlgebra/matrixOperations.js';
import { MatrixPropertiesAnalyzer } from '../../linearAlgebra/properties.js';

export const LINEAR_ALGEBRA_MODULES = [
  { id: 'matrix-calculator',  num: '01', title: 'Matrix Calculator',          desc: 'Dynamic dimension matrix editor with cell-level precision' },
  { id: 'matrix-operations',  num: '02', title: 'Matrix Operations',          desc: 'Addition, subtraction, multiplication, powers and transposes' },
  { id: 'determinants',       num: '03', title: 'Determinants Lab',           desc: 'Laplace cofactor expansion, minors, and 2×2 to n×n determinants' },
  { id: 'matrix-inverse',     num: '04', title: 'Matrix Inverse Lab',         desc: 'Gauss-Jordan [A|I] elimination and adjugate formulas' },
  { id: 'rank-rref',          num: '05', title: 'Rank & RREF Lab',            desc: 'Row echelon form, reduced REF, pivot columns & free variables' },
  { id: 'linear-systems',     num: '06', title: 'Linear Systems Solver',      desc: 'Unique, infinite, or inconsistent systems via Gaussian & Cramer' },
  { id: 'vector-calculator',  num: '07', title: 'Vector Calculator',          desc: '2D & 3D vector algebra, dot product, cross product, projections' },
  { id: 'vector-spaces',      num: '08', title: 'Vector Spaces & Subspaces',  desc: 'Linear combinations, span, basis extraction, and dimension' },
  { id: 'linear-independence',num: '09', title: 'Linear Independence',       desc: 'Homogeneous system testing: independent vs dependent sets' },
  { id: 'null-space',         num: '10', title: 'Null Space (Kernel)',        desc: 'Solutions to Ax = 0, nullity, and basis vectors verification' },
  { id: 'column-row-space',   num: '11', title: 'Column & Row Spaces',        desc: 'Pivot column basis, RREF non-zero rows, fundamental subspaces' },
  { id: 'eigenvalues',        num: '12', title: 'Eigenvalues Lab',            desc: 'Characteristic polynomial det(A - λI) = 0 and multiplicities' },
  { id: 'eigenvectors',       num: '13', title: 'Eigenvectors Lab',           desc: 'Eigenspaces (A - λI)v = 0 and geometric multiplicity' },
  { id: 'diagonalization',    num: '14', title: 'Diagonalization Lab',        desc: 'Eigenbasis decomposition A = PDP⁻¹ and defect testing' },
  { id: 'transformations',    num: '15', title: 'Linear Transformations',     desc: '2D/3D scaling, rotation, shearing, reflection & grid warp' },
  { id: 'orthogonality',      num: '16', title: 'Orthogonality & Projections',desc: 'Orthogonal vectors, Gram-Schmidt process, and projᵥ(u)' },
  { id: 'least-squares',      num: '17', title: 'Least Squares Lab',          desc: 'Overdetermined systems and normal equations AᵀAx = Aᵀb' },
  { id: 'lu-decomposition',   num: '18', title: 'LU Decomposition',           desc: 'Doolittle factorization A = LU with forward & backward solve' },
  { id: 'qr-decomposition',   num: '19', title: 'QR Decomposition',           desc: 'Orthogonal Q and upper triangular R via Gram-Schmidt' },
  { id: 'practice-lab',       num: '20', title: 'Linear Algebra Practice Lab',desc: 'Interactive graded problems with complete step explanations' }
];

export class LinearAlgebraView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;

    // State for Matrix A
    this.matrixA = Matrix.from([
      [1, 2],
      [3, 4]
    ], 'A');

    // State for Matrix B
    this.matrixB = Matrix.from([
      [5, 6],
      [7, 8]
    ], 'B');

    this.scalarK = 2;
    this.matrixPower = 2;
    this.activeOperation = 'multiply'; // 'add' | 'subtract' | 'multiply' | 'scalar' | 'transpose' | 'trace' | 'power' | 'hadamard'
    this.isExactMode = false;
    this.decimalPrecision = 4;
    this.currentResult = null;
    this.universalInput = 'A = [[1,2],[3,4]]';
    this._listeners = [];
  }

  mount() {
    this.render();
    this._attachListeners();
    this.computeCurrentOperation();
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => {
      try { el.removeEventListener(evt, fn); } catch (e) {}
    });
    this._listeners = [];
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  render() {
    this.container.innerHTML = `
      <div class="la-workspace view-animate-in">

        <!-- Header -->
        <header class="la-header">
          <div class="la-header-text">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span class="la-badge">
                <span class="la-badge-dot"></span>
                Linear Algebra Lab
              </span>
              <span class="la-subbadge">Modules #16 & #17</span>
            </div>
            <h1 class="la-title">LINEAR ALGEBRA</h1>
            <p class="la-subtitle">"Explore matrices, vectors, transformations and linear systems."</p>
          </div>
          <div class="la-quick-actions">
            <a href="#/linear-algebra/matrix-calculator" class="la-btn la-btn-gold">
              ${SVG_ICONS.calculator || '🧮'} Matrix Calculator
            </a>
            <a href="#/modules/16" class="la-btn la-btn-outline">
              Curriculum Module #16
            </a>
            <a href="#/modules/17" class="la-btn la-btn-outline">
              Curriculum Module #17
            </a>
          </div>
        </header>

        <!-- Universal Linear Algebra Input Area (Section 2 & 39) -->
        <div class="la-universal-card glass-panel">
          <div class="la-universal-header">
            <span class="la-universal-title">Universal Linear Algebra Input</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Intelligent Parser: Matrices, Operations, Systems</span>
          </div>
          <div class="la-universal-row">
            <input type="text" id="la-universal-input" class="la-universal-input"
              value="${this.universalInput}"
              placeholder="e.g. A = [[1,2],[3,4]]  or  det([[1,2],[3,4]])  or  2x + 3y = 7; x - y = 1">
            <button class="la-btn la-btn-primary" id="btn-parse-universal">
              Interpret & Load
            </button>
          </div>
          <div class="la-suggestions-bar">
            <span class="la-suggestions-label">Suggestions:</span>
            <button class="la-suggestion-chip" data-val="A = [[1,2],[3,4]]">2×2 Matrix A</button>
            <button class="la-suggestion-chip" data-val="A = [[1,2,3],[4,5,6],[7,8,9]]">3×3 Matrix A</button>
            <button class="la-suggestion-chip" data-val="det([[1,2],[3,4]])">det([[1,2],[3,4]])</button>
            <button class="la-suggestion-chip" data-val="rank([[1,2,3],[2,4,6]])">rank(A)</button>
            <button class="la-suggestion-chip" data-val="eigenvalues([[2,1],[1,2]])">eigenvalues(A)</button>
          </div>
        </div>

        <!-- Interactive Multi-Matrix Manager (Section 4) -->
        <div class="la-matrix-lab-grid">

          <!-- Matrix A Card -->
          <div class="la-matrix-card glass-panel" id="card-matrix-a">
            <div class="la-matrix-card-header">
              <div class="la-matrix-card-title">
                <span>Matrix A</span>
                <span class="la-matrix-dim-badge" id="badge-dim-a">${this.matrixA.rows} × ${this.matrixA.cols}</span>
              </div>
              <div class="la-matrix-dim-controls">
                <span class="la-dim-tag">Rows:</span>
                <button class="la-btn-icon" id="btn-a-row-sub" title="Remove Row">−</button>
                <button class="la-btn-icon" id="btn-a-row-add" title="Add Row">+</button>
                <span class="la-dim-tag" style="margin-left: 6px;">Cols:</span>
                <button class="la-btn-icon" id="btn-a-col-sub" title="Remove Column">−</button>
                <button class="la-btn-icon" id="btn-a-col-add" title="Add Column">+</button>
              </div>
            </div>

            <!-- Liquid Glass Matrix Bracket Presentation -->
            <div class="la-matrix-container">
              <div class="la-matrix-bracket-wrap">
                <div class="la-matrix-bracket-left"></div>
                <div class="la-matrix-grid" id="grid-matrix-a">
                  ${this._renderMatrixGrid(this.matrixA, 'a')}
                </div>
                <div class="la-matrix-bracket-right"></div>
              </div>
            </div>

            <div class="la-matrix-actions-row">
              <button class="la-btn la-btn-outline la-btn-sm" id="btn-a-identity">Identity I</button>
              <button class="la-btn la-btn-outline la-btn-sm" id="btn-a-random">Random</button>
              <button class="la-btn la-btn-outline la-btn-sm" id="btn-a-zero">Clear (0)</button>
            </div>
          </div>

          <!-- Matrix B Card -->
          <div class="la-matrix-card glass-panel" id="card-matrix-b">
            <div class="la-matrix-card-header">
              <div class="la-matrix-card-title">
                <span>Matrix B</span>
                <span class="la-matrix-dim-badge" id="badge-dim-b">${this.matrixB.rows} × ${this.matrixB.cols}</span>
              </div>
              <div class="la-matrix-dim-controls">
                <span class="la-dim-tag">Rows:</span>
                <button class="la-btn-icon" id="btn-b-row-sub" title="Remove Row">−</button>
                <button class="la-btn-icon" id="btn-b-row-add" title="Add Row">+</button>
                <span class="la-dim-tag" style="margin-left: 6px;">Cols:</span>
                <button class="la-btn-icon" id="btn-b-col-sub" title="Remove Column">−</button>
                <button class="la-btn-icon" id="btn-b-col-add" title="Add Column">+</button>
              </div>
            </div>

            <div class="la-matrix-container">
              <div class="la-matrix-bracket-wrap">
                <div class="la-matrix-bracket-left"></div>
                <div class="la-matrix-grid" id="grid-matrix-b">
                  ${this._renderMatrixGrid(this.matrixB, 'b')}
                </div>
                <div class="la-matrix-bracket-right"></div>
              </div>
            </div>

            <div class="la-matrix-actions-row">
              <button class="la-btn la-btn-outline la-btn-sm" id="btn-b-identity">Identity I</button>
              <button class="la-btn la-btn-outline la-btn-sm" id="btn-b-random">Random</button>
              <button class="la-btn la-btn-outline la-btn-sm" id="btn-b-zero">Clear (0)</button>
            </div>
          </div>

        </div>

        <!-- Operations Toolbar (Section 5) -->
        <div class="la-ops-card glass-panel">
          <div class="la-ops-title">Matrix Operations Toolbar</div>
          <div class="la-ops-bar">
            <button class="la-op-btn ${this.activeOperation === 'multiply' ? 'active' : ''}" data-op="multiply">Multiply A × B</button>
            <button class="la-op-btn ${this.activeOperation === 'add' ? 'active' : ''}" data-op="add">Add A + B</button>
            <button class="la-op-btn ${this.activeOperation === 'subtract' ? 'active' : ''}" data-op="subtract">Subtract A − B</button>
            <button class="la-op-btn ${this.activeOperation === 'scalar' ? 'active' : ''}" data-op="scalar">Scalar k · A (k=2)</button>
            <button class="la-op-btn ${this.activeOperation === 'transpose' ? 'active' : ''}" data-op="transpose">Transpose Aᵀ</button>
            <button class="la-op-btn ${this.activeOperation === 'trace' ? 'active' : ''}" data-op="trace">Trace tr(A)</button>
            <button class="la-op-btn ${this.activeOperation === 'power' ? 'active' : ''}" data-op="power">Power A²</button>
            <button class="la-op-btn ${this.activeOperation === 'hadamard' ? 'active' : ''}" data-op="hadamard">Hadamard A ∘ B</button>
          </div>
        </div>

        <!-- Calculation Result Card & Derivation -->
        <div class="la-result-card glass-panel" id="la-result-container">
          <!-- Rendered dynamically -->
        </div>

        <!-- Matrix Properties Card (Section 32, 33, 34) -->
        <div class="la-props-card glass-panel" id="la-props-container">
          <!-- Rendered dynamically -->
        </div>

        <!-- Linear Algebra 20 Modules Navigation Grid (Section 3) -->
        <div class="la-modules-section">
          <div class="la-modules-header">
            <div>
              <h2 class="la-modules-title">LINEAR ALGEBRA LABORATORY MODULES</h2>
              <p style="margin: 4px 0 0 0; color: rgba(14, 29, 97, 0.65); font-size: 0.9rem;">
                A comprehensive analytical suite for matrices, vectors, decompositions, and transformations
              </p>
            </div>
          </div>

          <div class="la-modules-grid">
            ${LINEAR_ALGEBRA_MODULES.map(m => `
              <a href="#/linear-algebra/${m.id}" class="la-module-card glass-card">
                <div class="la-module-num">${m.num}</div>
                <div class="la-module-name">${m.title}</div>
                <div class="la-module-desc">${m.desc}</div>
              </a>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  _renderMatrixGrid(matrix, prefix) {
    const rows = matrix.rows;
    const cols = matrix.cols;
    let html = `<div style="display: grid; grid-template-columns: repeat(${cols}, auto); gap: 6px;">`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = matrix.get(r, c);
        html += `
          <input type="number" step="any"
            class="la-matrix-cell-input"
            data-prefix="${prefix}"
            data-row="${r}"
            data-col="${c}"
            value="${val}">
        `;
      }
    }
    html += '</div>';
    return html;
  }

  _attachListeners() {
    // Universal input interpreter
    const parseBtn = document.getElementById('btn-parse-universal');
    const universalInputEl = document.getElementById('la-universal-input');

    const handleUniversal = () => {
      const txt = universalInputEl ? universalInputEl.value : '';
      this.universalInput = txt;
      const rec = LinearAlgebraParser.recognizeInput(txt);

      if (rec.type === 'matrix_definition' || rec.type === 'matrix') {
        const parsed = LinearAlgebraParser.parseMatrix(rec.matrixContent || txt);
        if (parsed.valid) {
          if (rec.label === 'B') {
            this.matrixB = Matrix.from(parsed.grid, 'B');
          } else {
            this.matrixA = Matrix.from(parsed.grid, 'A');
          }
          this._updateMatrixDOM();
          this.computeCurrentOperation();
          showToast(`Loaded Matrix ${rec.label || 'A'} (${parsed.rows}×${parsed.cols})`);
        } else {
          showToast(parsed.error.message, 'error');
        }
      } else {
        showToast(`Interpreted: ${rec.suggestion}`);
      }
    };

    if (parseBtn) this._on(parseBtn, 'click', handleUniversal);

    // Suggestion chips
    const chips = document.querySelectorAll('.la-suggestion-chip');
    chips.forEach(chip => {
      this._on(chip, 'click', () => {
        const val = chip.getAttribute('data-val');
        if (universalInputEl) universalInputEl.value = val;
        this.universalInput = val;
        handleUniversal();
      });
    });

    // Operation buttons
    const opBtns = document.querySelectorAll('.la-op-btn');
    opBtns.forEach(btn => {
      this._on(btn, 'click', () => {
        opBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeOperation = btn.getAttribute('data-op');
        this.computeCurrentOperation();
      });
    });

    // Dimension controls Matrix A
    this._attachDimControls('a', 'matrixA');
    this._attachDimControls('b', 'matrixB');

    // Matrix cell inputs
    this._attachCellInputs();
  }

  _attachDimControls(prefix, matrixKey) {
    const rowAdd = document.getElementById(`btn-${prefix}-row-add`);
    const rowSub = document.getElementById(`btn-${prefix}-row-sub`);
    const colAdd = document.getElementById(`btn-${prefix}-col-add`);
    const colSub = document.getElementById(`btn-${prefix}-col-sub`);
    const identBtn = document.getElementById(`btn-${prefix}-identity`);
    const randBtn = document.getElementById(`btn-${prefix}-random`);
    const zeroBtn = document.getElementById(`btn-${prefix}-zero`);

    if (rowAdd) {
      this._on(rowAdd, 'click', () => {
        const curr = this[matrixKey];
        if (curr.rows < 6) {
          const newGrid = curr.grid.map(r => [...r]);
          newGrid.push(new Array(curr.cols).fill(0));
          this[matrixKey] = Matrix.from(newGrid, curr.name);
          this._updateMatrixDOM();
          this.computeCurrentOperation();
        } else {
          showToast('Maximum row limit (6) reached.');
        }
      });
    }

    if (rowSub) {
      this._on(rowSub, 'click', () => {
        const curr = this[matrixKey];
        if (curr.rows > 1) {
          const newGrid = curr.grid.slice(0, -1).map(r => [...r]);
          this[matrixKey] = Matrix.from(newGrid, curr.name);
          this._updateMatrixDOM();
          this.computeCurrentOperation();
        } else {
          showToast('Minimum row limit is 1.');
        }
      });
    }

    if (colAdd) {
      this._on(colAdd, 'click', () => {
        const curr = this[matrixKey];
        if (curr.cols < 6) {
          const newGrid = curr.grid.map(r => [...r, 0]);
          this[matrixKey] = Matrix.from(newGrid, curr.name);
          this._updateMatrixDOM();
          this.computeCurrentOperation();
        } else {
          showToast('Maximum column limit (6) reached.');
        }
      });
    }

    if (colSub) {
      this._on(colSub, 'click', () => {
        const curr = this[matrixKey];
        if (curr.cols > 1) {
          const newGrid = curr.grid.map(r => r.slice(0, -1));
          this[matrixKey] = Matrix.from(newGrid, curr.name);
          this._updateMatrixDOM();
          this.computeCurrentOperation();
        } else {
          showToast('Minimum column limit is 1.');
        }
      });
    }

    if (identBtn) {
      this._on(identBtn, 'click', () => {
        const curr = this[matrixKey];
        const n = Math.min(curr.rows, curr.cols);
        this[matrixKey] = Matrix.identity(n, curr.name);
        this._updateMatrixDOM();
        this.computeCurrentOperation();
      });
    }

    if (randBtn) {
      this._on(randBtn, 'click', () => {
        const curr = this[matrixKey];
        this[matrixKey] = Matrix.random(curr.rows, curr.cols, -4, 5, curr.name);
        this._updateMatrixDOM();
        this.computeCurrentOperation();
      });
    }

    if (zeroBtn) {
      this._on(zeroBtn, 'click', () => {
        const curr = this[matrixKey];
        this[matrixKey] = Matrix.zero(curr.rows, curr.cols, curr.name);
        this._updateMatrixDOM();
        this.computeCurrentOperation();
      });
    }
  }

  _attachCellInputs() {
    const inputs = this.container.querySelectorAll('.la-matrix-cell-input');
    inputs.forEach(input => {
      this._on(input, 'change', (e) => {
        const prefix = e.target.getAttribute('data-prefix');
        const r = parseInt(e.target.getAttribute('data-row'), 10);
        const c = parseInt(e.target.getAttribute('data-col'), 10);
        const val = parseFloat(e.target.value) || 0;

        if (prefix === 'a') {
          this.matrixA = this.matrixA.set(r, c, val);
        } else {
          this.matrixB = this.matrixB.set(r, c, val);
        }
        this.computeCurrentOperation();
      });
    });
  }

  _updateMatrixDOM() {
    const gridA = document.getElementById('grid-matrix-a');
    const badgeA = document.getElementById('badge-dim-a');
    if (gridA) gridA.innerHTML = this._renderMatrixGrid(this.matrixA, 'a');
    if (badgeA) badgeA.textContent = `${this.matrixA.rows} × ${this.matrixA.cols}`;

    const gridB = document.getElementById('grid-matrix-b');
    const badgeB = document.getElementById('badge-dim-b');
    if (gridB) gridB.innerHTML = this._renderMatrixGrid(this.matrixB, 'b');
    if (badgeB) badgeB.textContent = `${this.matrixB.rows} × ${this.matrixB.cols}`;

    this._attachCellInputs();
  }

  computeCurrentOperation() {
    let res;
    switch (this.activeOperation) {
      case 'add':
        res = MatrixOperationsEngine.add(this.matrixA, this.matrixB);
        break;
      case 'subtract':
        res = MatrixOperationsEngine.subtract(this.matrixA, this.matrixB);
        break;
      case 'multiply':
        res = MatrixOperationsEngine.multiply(this.matrixA, this.matrixB);
        break;
      case 'scalar':
        res = MatrixOperationsEngine.scalarMultiply(this.matrixA, this.scalarK);
        break;
      case 'transpose':
        res = MatrixOperationsEngine.transpose(this.matrixA);
        break;
      case 'trace':
        res = MatrixOperationsEngine.trace(this.matrixA);
        break;
      case 'power':
        res = MatrixOperationsEngine.power(this.matrixA, this.matrixPower);
        break;
      case 'hadamard':
        res = MatrixOperationsEngine.hadamardMultiply(this.matrixA, this.matrixB);
        break;
      default:
        res = MatrixOperationsEngine.multiply(this.matrixA, this.matrixB);
    }

    this.currentResult = res;
    this._renderResult();
    this._renderProperties();
  }

  _renderResult() {
    const container = document.getElementById('la-result-container');
    if (!container) return;

    const res = this.currentResult;
    if (!res) return;

    if (!res.success) {
      container.innerHTML = `
        <div class="la-error-box">
          <span style="font-size: 1.5rem;">⚠️</span>
          <div>
            <strong>Mathematical Incompatibility:</strong>
            <p style="margin: 4px 0 0 0;">${res.error.message}</p>
            <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: rgba(185, 28, 28, 0.8);">${res.error.details}</p>
          </div>
        </div>
      `;
      return;
    }

    // Is result a Matrix or a scalar (Trace)?
    const isMatrix = res.result && res.result.grid;
    let resultDisplayHtml = '';

    if (isMatrix) {
      const grid = res.result.grid;
      const rows = res.result.rows;
      const cols = res.result.cols;

      resultDisplayHtml = `
        <div class="la-matrix-container" style="background: rgba(255, 255, 255, 0.9);">
          <div class="la-matrix-bracket-wrap">
            <div class="la-matrix-bracket-left" style="border-color: #B89A5A;"></div>
            <div style="display: grid; grid-template-columns: repeat(${cols}, auto); gap: 12px; padding: 6px 12px;">
              ${grid.map(row => row.map(v => `
                <div style="min-width: 50px; text-align: center; font-family: var(--font-mono); font-weight: 800; font-size: 1.15rem; color: #0E1D61;">
                  ${this.isExactMode ? res.exactResult : v}
                </div>
              `).join('')).join('')}
            </div>
            <div class="la-matrix-bracket-right" style="border-color: #B89A5A;"></div>
          </div>
        </div>
      `;
    } else {
      resultDisplayHtml = `
        <div style="font-size: 2rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono); text-align: center; padding: 16px;">
          ${res.result}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="la-result-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="la-result-title">CALCULATION RESULT</span>
          <span class="la-matrix-dim-badge" style="background: rgba(184, 154, 90, 0.25);">
            ${isMatrix ? `${res.result.rows} × ${res.result.cols}` : 'Scalar'}
          </span>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <div class="la-mode-toggle">
            <button class="la-mode-btn ${!this.isExactMode ? 'active' : ''}" id="btn-mode-dec">Decimal</button>
            <button class="la-mode-btn ${this.isExactMode ? 'active' : ''}" id="btn-mode-exact">Exact</button>
          </div>
          <button class="la-btn la-btn-xs" id="btn-copy-matrix-result">Copy Result</button>
        </div>
      </div>

      <div class="la-result-display-box">
        ${resultDisplayHtml}
      </div>

      <!-- 7-Stage Derivation Flow -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
        <div style="font-size: 0.85rem; font-weight: 800; color: #0E1D61; letter-spacing: 0.05em; text-transform: uppercase;">
          Step-by-Step Derivation & Verification
        </div>
        <div class="la-stages-flow">
          <div class="la-stage-item">
            <div class="la-stage-num">01</div>
            <div class="la-stage-content">
              <span class="la-stage-label">APPLIED FORMULA</span>
              <div class="la-stage-text font-mono" style="color: #B89A5A; font-weight: 700;">${res.formula}</div>
            </div>
          </div>
          <div class="la-stage-item">
            <div class="la-stage-num">02</div>
            <div class="la-stage-content">
              <span class="la-stage-label">INTERMEDIATE COMPUTATIONS</span>
              <div class="la-stage-text font-mono" style="white-space: pre-wrap; font-size: 0.88rem;">
                ${res.steps.join('\n')}
              </div>
            </div>
          </div>
          ${res.verification ? `
            <div class="la-stage-item">
              <div class="la-stage-num">03</div>
              <div class="la-stage-content">
                <span class="la-stage-label">MATHEMATICAL VERIFICATION</span>
                <div class="la-stage-text" style="color: #15803d; font-weight: 600;">✓ ${res.verification}</div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Mode toggle listeners
    const decBtn = document.getElementById('btn-mode-dec');
    const exactBtn = document.getElementById('btn-mode-exact');
    if (decBtn) {
      this._on(decBtn, 'click', () => {
        this.isExactMode = false;
        this._renderResult();
      });
    }
    if (exactBtn) {
      this._on(exactBtn, 'click', () => {
        this.isExactMode = true;
        this._renderResult();
      });
    }

    const copyBtn = document.getElementById('btn-copy-matrix-result');
    if (copyBtn) {
      this._on(copyBtn, 'click', () => {
        const textToCopy = isMatrix ? Matrix.from(res.result.grid).toText(this.isExactMode) : String(res.result);
        copyToClipboard(textToCopy);
        showToast('Matrix result copied to clipboard');
      });
    }
  }

  _renderProperties() {
    const container = document.getElementById('la-props-container');
    if (!container) return;

    const props = MatrixPropertiesAnalyzer.analyze(this.matrixA);

    container.innerHTML = `
      <div class="la-props-header">
        Matrix A Properties Card (${props.dimensions})
      </div>
      <div class="la-props-grid">
        <div class="la-prop-item">
          <div class="la-prop-name">Square Matrix</div>
          <div class="la-prop-desc">${props.isSquare ? 'Yes (Rows equal columns)' : 'No (Rectangular matrix)'}</div>
        </div>
        <div class="la-prop-item">
          <div class="la-prop-name">Trace tr(A)</div>
          <div class="la-prop-desc">${props.trace !== null ? props.trace : 'Undefined for non-square matrices'}</div>
        </div>
        ${props.properties.map(p => `
          <div class="la-prop-item" style="border-color: rgba(184, 154, 90, 0.45); background: rgba(184, 154, 90, 0.1);">
            <div class="la-prop-name" style="color: #0E1D61;">✓ ${p.name}</div>
            <div class="la-prop-desc">${p.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
