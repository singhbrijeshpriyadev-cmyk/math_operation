/**
 * OG - Vectors & Optimization: Vector Laboratory (VectorLabView)
 * Phase 1 Implementation: Vector Engine + Vector Calculator
 *
 * Strict OG Palette:
 * - Ivory #E8E0D2 (50%)
 * - Gold #B89A5A (30%)
 * - Deep Atlas Navy #0E1D61 (20%)
 *
 * Features:
 * - 2D & 3D Vector Workbench with dynamic component editors
 * - Universal Vector Input with intelligent intent recognition
 * - Exact (fractions / radicals) and Decimal modes
 * - Operations: Addition, Subtraction, Scalar Multiplication/Division,
 *   Magnitude, Unit Vector, Distance, Linear Combination, Parallel & Perpendicular tests
 * - 7-Stage Step-by-Step Derivation Flow
 * - Result Verification and Vector Properties Card
 * - Copy as Text, LaTeX, Array
 *
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { Vector } from '../../vectors/vector.js';
import { VectorOperationsEngine } from '../../vectors/operations.js';
import { VectorParser } from '../../vectors/parser.js';

export class VectorLabView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;

    // Default 3D Vectors
    this.dim = 3;
    this.u = Vector.from([3, 4, 0], 'u');
    this.v = Vector.from([1, 2, 2], 'v');

    this.selectedOp = 'add';
    this.scalarK = 2;
    this.combC1 = 2;
    this.combC2 = -1;
    this.exactMode = true;
    this.currentResult = null;

    this._listeners = [];
  }

  mount() {
    this.render();
    this._attachListeners();
    this.executeOperation('add');
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

  render() {
    this.container.innerHTML = `
      <div class="vo-workspace view-animate-in">
        <!-- Breadcrumb & Header -->
        <div class="vo-header-row">
          <div>
            <div class="vo-breadcrumb">
              <a href="#/vectors-optimization" class="vo-breadcrumb-link">Vectors & Optimization</a>
              <span class="vo-breadcrumb-sep">/</span>
              <span>Vector Calculator</span>
            </div>
            <h1 class="vo-title">Vector Laboratory</h1>
            <p class="vo-subtitle">
              Interactive 2D & 3D Euclidean vector workspace. Compute vector arithmetic, norms, unit directions, distances, and collinearity.
            </p>
          </div>

          <!-- Mode & Dimension Switcher -->
          <div class="vo-header-actions">
            <!-- Dimension 2D / 3D -->
            <div class="vo-mode-toggle" role="group" aria-label="Vector Dimension">
              <button class="vo-mode-btn ${this.dim === 2 ? 'active' : ''}" id="vo-dim-2d" title="2D Plane ℝ²">2D Plane (ℝ²)</button>
              <button class="vo-mode-btn ${this.dim === 3 ? 'active' : ''}" id="vo-dim-3d" title="3D Space ℝ³">3D Space (ℝ³)</button>
            </div>

            <!-- Exact / Decimal -->
            <div class="vo-mode-toggle" role="group" aria-label="Format Mode">
              <button class="vo-mode-btn ${this.exactMode ? 'active' : ''}" id="vo-mode-exact" title="Exact Fractions & Radicals">Exact</button>
              <button class="vo-mode-btn ${!this.exactMode ? 'active' : ''}" id="vo-mode-decimal" title="Decimal Mode">Decimal</button>
            </div>
          </div>
        </div>

        <!-- Universal Vector Input -->
        <div class="vo-glass-card">
          <div class="vo-card-header">
            <div>
              <div class="vo-card-title">Universal Vector Input</div>
              <div class="vo-card-subtitle">Enter vectors, points, expressions, or natural queries</div>
            </div>
          </div>

          <div class="vo-universal-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B89A5A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
            <input
              type="text"
              id="vo-universal-input"
              class="vo-universal-input"
              placeholder="e.g. u = [3, 4], [1, 2, 3] + [4, 5, 6], or mag([3, 4])"
              value=""
              aria-label="Universal Vector Input"
            >
            <button class="vo-btn vo-btn-primary" id="vo-universal-submit" style="min-height: 38px; padding: 6px 16px;">
              Parse & Solve
            </button>
          </div>

          <div class="vo-suggestion-chips" id="vo-suggestion-chips">
            <span style="font-size: 0.78rem; font-weight: 700; color: #B89A5A; margin-right: 4px;">Quick Inputs:</span>
            <button class="vo-chip" data-query="[1, 2, 3] + [4, 5, 6]">[1,2,3] + [4,5,6]</button>
            <button class="vo-chip" data-query="[3, 4] · [1, 2]">[3,4] · [1,2]</button>
            <button class="vo-chip" data-query="mag([3, 4, 0])">mag([3,4,0])</button>
            <button class="vo-chip" data-query="unit([2, 3, 6])">unit([2,3,6])</button>
          </div>
        </div>

        <!-- Vector Workbenches: Vector u and Vector v -->
        <div class="vo-grid-2">
          <!-- Vector u Card -->
          <div class="vo-glass-card">
            ${this._renderVectorWorkbench('u', this.u)}
          </div>

          <!-- Vector v Card -->
          <div class="vo-glass-card">
            ${this._renderVectorWorkbench('v', this.v)}
          </div>
        </div>

        <!-- Presets Bar -->
        <div class="vo-glass-card" style="padding: 14px 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: #B89A5A; text-transform: uppercase;">Curated Presets:</span>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="vo-btn vo-btn-secondary" data-preset="standard" style="min-height: 36px; padding: 4px 12px; font-size: 0.78rem;">
                  Standard (3,4,0) & (1,2,2)
                </button>
                <button class="vo-btn vo-btn-secondary" data-preset="orthogonal" style="min-height: 36px; padding: 4px 12px; font-size: 0.78rem;">
                  Orthogonal (2,1,-1) & (1,2,4)
                </button>
                <button class="vo-btn vo-btn-secondary" data-preset="parallel" style="min-height: 36px; padding: 4px 12px; font-size: 0.78rem;">
                  Parallel (2,-3,4) & (4,-6,8)
                </button>
                <button class="vo-btn vo-btn-secondary" data-preset="basis" style="min-height: 36px; padding: 4px 12px; font-size: 0.78rem;">
                  Basis (1,0,0) & (0,1,0)
                </button>
              </div>
            </div>

            <div style="display: flex; gap: 6px;">
              <button class="vo-btn vo-btn-secondary" id="vo-btn-swap" style="min-height: 36px; padding: 4px 12px; font-size: 0.78rem;">
                ⇄ Swap u & v
              </button>
            </div>
          </div>
        </div>

        <!-- Operations Toolbar -->
        <div class="vo-glass-card">
          <div class="vo-card-header">
            <div>
              <div class="vo-card-title">Vector Operations</div>
              <div class="vo-card-subtitle">Select an algebraic or geometric operation to perform</div>
            </div>
            <div style="font-size: 0.82rem; font-family: 'JetBrains Mono', monospace; color: #B89A5A; font-weight: 700;">
              u ∈ ℝ^${this.u.dim} &nbsp;|&nbsp; v ∈ ℝ^${this.v.dim}
            </div>
          </div>

          <div class="vo-ops-toolbar">
            <button class="vo-op-btn ${this.selectedOp === 'add' ? 'active' : ''}" data-op="add">u + v (Sum)</button>
            <button class="vo-op-btn ${this.selectedOp === 'sub' ? 'active' : ''}" data-op="sub">u - v (Difference)</button>
            <button class="vo-op-btn ${this.selectedOp === 'sub-vu' ? 'active' : ''}" data-op="sub-vu">v - u</button>
            <button class="vo-op-btn ${this.selectedOp === 'scalar-u' ? 'active' : ''}" data-op="scalar-u">k · u (Scale)</button>
            <button class="vo-op-btn ${this.selectedOp === 'scalar-div-u' ? 'active' : ''}" data-op="scalar-div-u">u / k</button>
            <button class="vo-op-btn ${this.selectedOp === 'mag-u' ? 'active' : ''}" data-op="mag-u">|u| (Norm)</button>
            <button class="vo-op-btn ${this.selectedOp === 'mag-v' ? 'active' : ''}" data-op="mag-v">|v| (Norm)</button>
            <button class="vo-op-btn ${this.selectedOp === 'unit-u' ? 'active' : ''}" data-op="unit-u">û (Unit Vector)</button>
            <button class="vo-op-btn ${this.selectedOp === 'unit-v' ? 'active' : ''}" data-op="unit-v">v̂ (Unit Vector)</button>
            <button class="vo-op-btn ${this.selectedOp === 'distance' ? 'active' : ''}" data-op="distance">d(u, v) (Distance)</button>
            <button class="vo-op-btn ${this.selectedOp === 'combination' ? 'active' : ''}" data-op="combination">c₁u + c₂v</button>
            <button class="vo-op-btn ${this.selectedOp === 'test-parallel' ? 'active' : ''}" data-op="test-parallel">u ∥ v (Collinear)</button>
            <button class="vo-op-btn ${this.selectedOp === 'test-perp' ? 'active' : ''}" data-op="test-perp">u ⟂ v (Orthogonal)</button>
          </div>

          <!-- Parameter Sub-bar for Scalar & Linear Combination -->
          <div id="vo-op-params" style="display: flex; align-items: center; gap: 16px; margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(184, 154, 90, 0.25); flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="vo-input-scalar" style="font-size: 0.85rem; color: #B89A5A; font-weight: 600;">Scalar k:</label>
              <input type="number" id="vo-input-scalar" class="vo-component-input" style="width: 68px;" value="${this.scalarK}" step="any">
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="vo-input-c1" style="font-size: 0.85rem; color: #B89A5A; font-weight: 600;">Weight c₁:</label>
              <input type="number" id="vo-input-c1" class="vo-component-input" style="width: 68px;" value="${this.combC1}" step="any">
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <label for="vo-input-c2" style="font-size: 0.85rem; color: #B89A5A; font-weight: 600;">Weight c₂:</label>
              <input type="number" id="vo-input-c2" class="vo-component-input" style="width: 68px;" value="${this.combC2}" step="any">
            </div>
            <button class="vo-btn vo-btn-primary" id="vo-btn-recalc" style="min-height: 38px; padding: 6px 18px;">
              Recalculate
            </button>
          </div>
        </div>

        <!-- Result & Step-by-Step Derivation Panel -->
        <div id="vo-result-region">
          <!-- Populated by _renderResult() -->
        </div>

        <!-- Vector Properties Cards Grid -->
        <div class="vo-grid-2">
          <!-- Properties of u -->
          <div class="vo-glass-card">
            ${this._renderPropertiesCard('u', this.u)}
          </div>

          <!-- Properties of v -->
          <div class="vo-glass-card">
            ${this._renderPropertiesCard('v', this.v)}
          </div>
        </div>
      </div>
    `;
  }

  _renderVectorWorkbench(label, vec) {
    const letters = ['x', 'y', 'z', 'w'];
    return `
      <div class="vo-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="vo-step-num" style="width: 32px; height: 32px; font-size: 0.95rem;">${label}</div>
          <div>
            <div class="vo-card-title">Vector ${label}</div>
            <div class="vo-card-subtitle">${vec.dim}D Euclidean Vector in ℝ^${vec.dim}</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="vo-btn vo-btn-secondary" data-action="zero" data-target="${label}" style="min-height: 34px; padding: 2px 10px; font-size: 0.75rem;" title="Set to zero vector">0</button>
          <button class="vo-btn vo-btn-secondary" data-action="random" data-target="${label}" style="min-height: 34px; padding: 2px 10px; font-size: 0.75rem;" title="Random integer vector">Rand</button>
          <button class="vo-btn vo-btn-secondary" data-action="negate" data-target="${label}" style="min-height: 34px; padding: 2px 10px; font-size: 0.75rem;" title="Negate vector">-v</button>
        </div>
      </div>

      <!-- Vector Components Bracket -->
      <div style="display: flex; justify-content: center; margin: 18px 0;">
        <div class="vo-vector-bracket">
          <span class="vo-bracket-symbol">⟨</span>
          ${vec.components.map((val, idx) => `
            <div class="vo-component-group">
              <span class="vo-component-label">${label}_${letters[idx] || (idx + 1)}</span>
              <input
                type="number"
                class="vo-component-input"
                data-vec="${label}"
                data-idx="${idx}"
                value="${val}"
                step="any"
                aria-label="${label} component ${idx + 1}"
              >
            </div>
            ${idx < vec.dim - 1 ? '<span style="color:#B89A5A;font-weight:700;font-size:1.2rem;margin-top:14px;">,</span>' : ''}
          `).join('')}
          <span class="vo-bracket-symbol">⟩</span>
        </div>
      </div>

      <!-- Footer Info & Copy Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(184, 154, 90, 0.25); padding-top: 12px; font-size: 0.82rem;">
        <div style="display: flex; gap: 6px;">
          <button class="vo-btn vo-btn-secondary" data-copy-vec="${label}" style="min-height: 32px; padding: 2px 10px; font-size: 0.75rem;">
            Copy ⟨ ⟩
          </button>
          <button class="vo-btn vo-btn-secondary" data-copy-latex="${label}" style="min-height: 32px; padding: 2px 10px; font-size: 0.75rem;">
            LaTeX
          </button>
        </div>
        <div style="color: #B89A5A; font-family: 'JetBrains Mono', monospace; font-weight: 600;">
          |${label}| = ${vec.magnitude().toFixed(4)}
        </div>
      </div>
    `;
  }

  _renderPropertiesCard(label, vec) {
    const mag = vec.magnitude();
    const isZero = vec.isZero();
    let unitStr = 'Undefined (zero vector)';
    try {
      if (!isZero) {
        unitStr = vec.normalize().toText(this.exactMode);
      }
    } catch {
      unitStr = 'Undefined';
    }

    const angle2D = vec.dim === 2 ? vec.toAngle2D().degrees.toFixed(2) + '°' : null;

    return `
      <div class="vo-card-header">
        <div>
          <div class="vo-card-title">Properties of Vector ${label}</div>
          <div class="vo-card-subtitle">Geometric analysis and invariants</div>
        </div>
        <div class="vo-step-num" style="width: 28px; height: 28px;">${label}</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(232, 224, 210, 0.4); border-radius: 6px;">
          <span style="font-weight: 600; color: #0E1D61;">Dimension:</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #B89A5A; font-weight: 700;">ℝ^${vec.dim}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(232, 224, 210, 0.4); border-radius: 6px;">
          <span style="font-weight: 600; color: #0E1D61;">Euclidean Magnitude |${label}|:</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #0E1D61; font-weight: 700;">${mag.toFixed(6)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(232, 224, 210, 0.4); border-radius: 6px;">
          <span style="font-weight: 600; color: #0E1D61;">Unit Vector ${label}̂:</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #0E1D61;">${unitStr}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(232, 224, 210, 0.4); border-radius: 6px;">
          <span style="font-weight: 600; color: #0E1D61;">Basis Decomposition:</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #0E1D61;">${vec.toComponentNotation(this.exactMode)}</span>
        </div>
        ${angle2D ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: rgba(232, 224, 210, 0.4); border-radius: 6px;">
            <span style="font-weight: 600; color: #0E1D61;">Polar Direction Angle:</span>
            <span style="font-family: 'JetBrains Mono', monospace; color: #B89A5A; font-weight: 700;">${angle2D}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  executeOperation(op) {
    this.selectedOp = op;
    let res = null;

    if (op === 'add') {
      res = VectorOperationsEngine.add(this.u, this.v);
    } else if (op === 'sub') {
      res = VectorOperationsEngine.subtract(this.u, this.v);
    } else if (op === 'sub-vu') {
      res = VectorOperationsEngine.subtract(this.v, this.u);
    } else if (op === 'scalar-u') {
      res = VectorOperationsEngine.scalarMultiply(this.scalarK, this.u);
    } else if (op === 'scalar-div-u') {
      res = VectorOperationsEngine.scalarDivide(this.u, this.scalarK);
    } else if (op === 'mag-u') {
      res = VectorOperationsEngine.magnitude(this.u);
    } else if (op === 'mag-v') {
      res = VectorOperationsEngine.magnitude(this.v);
    } else if (op === 'unit-u') {
      res = VectorOperationsEngine.unitVector(this.u);
    } else if (op === 'unit-v') {
      res = VectorOperationsEngine.unitVector(this.v);
    } else if (op === 'distance') {
      res = VectorOperationsEngine.distance(this.u, this.v);
    } else if (op === 'combination') {
      res = VectorOperationsEngine.linearCombination(this.combC1, this.u, this.combC2, this.v);
    } else if (op === 'test-parallel') {
      res = VectorOperationsEngine.testParallel(this.u, this.v);
    } else if (op === 'test-perp') {
      res = VectorOperationsEngine.testPerpendicular(this.u, this.v);
    }

    this.currentResult = res;
    this._renderResult();
  }

  _renderResult() {
    const container = document.getElementById('vo-result-region');
    if (!container) return;

    if (!this.currentResult) {
      container.innerHTML = '';
      return;
    }

    const res = this.currentResult;
    if (!res.success) {
      container.innerHTML = `
        <div class="vo-glass-card" style="border-left: 4px solid #B89A5A;">
          <div style="font-weight: 700; font-size: 1rem; color: #0E1D61; margin-bottom: 6px;">
            Mathematical Constraint Violated (${res.error.code})
          </div>
          <div style="font-size: 0.9rem; color: #0E1D61; opacity: 0.95; line-height: 1.5;">
            ${res.error.message}
          </div>
          ${res.error.details ? `<div style="margin-top: 8px; font-size: 0.82rem; color: #0E1D61; opacity: 0.8;">${res.error.details}</div>` : ''}
        </div>
      `;
      return;
    }

    // Format display representation
    let displayHtml = '';
    if (res.result instanceof Vector) {
      const vec = res.result;
      displayHtml = `
        <div class="vo-result-val">
          ${this.exactMode ? vec.toText(true) : vec.toText(false)}
        </div>
        <div class="vo-result-exact">
          Basis: ${vec.toComponentNotation(this.exactMode)}
        </div>
      `;
    } else if (typeof res.result === 'number') {
      displayHtml = `
        <div class="vo-result-val">
          ${this.exactMode && res.exactResult ? res.exactResult : res.result.toFixed(6)}
        </div>
        <div class="vo-result-exact">
          Decimal: ${res.result.toFixed(6)} units
        </div>
      `;
    } else if (typeof res.result === 'object' && res.result !== null) {
      if ('isParallel' in res.result) {
        displayHtml = `
          <div class="vo-result-val" style="font-size: 1.6rem; color: ${res.result.isParallel ? '#B89A5A' : '#0E1D61'};">
            ${res.result.isParallel ? '✓ Vectors are PARALLEL (Collinear)' : '✗ Vectors are NOT Parallel'}
          </div>
          <div class="vo-result-exact">
            ${res.result.ratio !== null ? `Scaling factor k = ${res.result.ratio.toFixed(4)}` : ''}
          </div>
        `;
      } else if ('isPerpendicular' in res.result) {
        displayHtml = `
          <div class="vo-result-val" style="font-size: 1.6rem; color: ${res.result.isPerpendicular ? '#B89A5A' : '#0E1D61'};">
            ${res.result.isPerpendicular ? '✓ Vectors are ORTHOGONAL (u ⟂ v, 90°)' : '✗ Vectors are NOT Orthogonal'}
          </div>
          <div class="vo-result-exact">
            Dot Product u · v = ${res.result.dotProduct.toFixed(6)}
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="vo-glass-card">
        <!-- Result Header -->
        <div class="vo-card-header">
          <div>
            <div class="vo-card-title">Computation Result: ${res.operation.toUpperCase()}</div>
            <div class="vo-card-subtitle">${res.formula || 'Vector Operation'}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="vo-btn vo-btn-secondary" id="vo-btn-copy-result" title="Copy result to clipboard">
              Copy Result
            </button>
            <button class="vo-btn vo-btn-secondary" id="vo-btn-copy-latex" title="Copy LaTeX">
              Copy LaTeX
            </button>
          </div>
        </div>

        <!-- Result Box -->
        <div class="vo-result-card">
          ${displayHtml}
        </div>

        ${res.verification ? `
          <div class="vo-verification-box" style="margin-bottom: 20px;">
            <strong>Verification (${res.verification.rule}):</strong> ${res.verification.message}
          </div>
        ` : ''}

        <!-- 7-Stage Mathematical Derivation Flow -->
        <div class="vo-steps-container">
          <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #B89A5A; margin-bottom: 8px;">
            Step-by-Step Mathematical Derivation
          </div>
          ${res.steps && res.steps.length ? res.steps.map(step => `
            <div class="vo-step-item">
              <div class="vo-step-num">${step.step}</div>
              <div class="vo-step-content">
                <div class="vo-step-title">${step.title}</div>
                <div class="vo-step-detail">${step.detail}</div>
                ${step.latex ? `<div class="vo-step-latex">${step.latex}</div>` : ''}
              </div>
            </div>
          `).join('') : '<div style="font-size: 0.85rem; color: #0E1D61; opacity: 0.8;">Single-step direct evaluation.</div>'}
        </div>
      </div>
    `;

    // Copy actions
    const copyResBtn = document.getElementById('vo-btn-copy-result');
    if (copyResBtn) {
      copyResBtn.addEventListener('click', () => {
        if (res.result instanceof Vector) {
          copyToClipboard(res.result.toText());
          showToast('Result vector copied to clipboard');
        } else {
          copyToClipboard(String(res.result));
          showToast('Result copied to clipboard');
        }
      });
    }

    const copyLatexBtn = document.getElementById('vo-btn-copy-latex');
    if (copyLatexBtn) {
      copyLatexBtn.addEventListener('click', () => {
        if (res.result instanceof Vector) {
          copyToClipboard(res.result.toLatex());
          showToast('LaTeX vector copied to clipboard');
        } else {
          copyToClipboard(String(res.result));
          showToast('Copied to clipboard');
        }
      });
    }
  }

  _attachListeners() {
    // Exact / Decimal Toggle
    const exactBtn = document.getElementById('vo-mode-exact');
    const decimalBtn = document.getElementById('vo-mode-decimal');
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

    // Dimension Toggle 2D / 3D
    const dim2dBtn = document.getElementById('vo-dim-2d');
    const dim3dBtn = document.getElementById('vo-dim-3d');
    this._on(dim2dBtn, 'click', () => {
      if (this.dim !== 2) {
        this.dim = 2;
        this.u = Vector.from([this.u.x, this.u.y], 'u');
        this.v = Vector.from([this.v.x, this.v.y], 'v');
        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      }
    });
    this._on(dim3dBtn, 'click', () => {
      if (this.dim !== 3) {
        this.dim = 3;
        this.u = Vector.from([this.u.x, this.u.y, 0], 'u');
        this.v = Vector.from([this.v.x, this.v.y, 2], 'v');
        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      }
    });

    // Universal Vector Input submit
    const universalInput = document.getElementById('vo-universal-input');
    const universalSubmit = document.getElementById('vo-universal-submit');
    const handleUniversal = () => {
      const q = universalInput?.value;
      if (!q) return;
      const parsed = VectorParser.parseUniversal(q);
      if (parsed.vectors.length > 0) {
        if (parsed.vectors.length >= 2) {
          this.u = parsed.vectors[0].clone('u');
          this.v = parsed.vectors[1].clone('v');
          this.dim = Math.max(this.u.dim, this.v.dim);
          showToast(`Loaded vectors u and v from query`);
        } else {
          this.u = parsed.vectors[0].clone('u');
          this.dim = this.u.dim;
          showToast(`Loaded vector u from query`);
        }

        if (parsed.operation && ['add', 'subtract', 'magnitude', 'unitVector'].includes(parsed.operation)) {
          this.selectedOp = parsed.operation === 'subtract' ? 'sub' : parsed.operation === 'magnitude' ? 'mag-u' : parsed.operation === 'unitVector' ? 'unit-u' : parsed.operation;
        }

        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      } else {
        showToast('Could not recognize vector expression. Check syntax.');
      }
    };

    this._on(universalSubmit, 'click', handleUniversal);
    this._on(universalInput, 'keydown', (e) => {
      if (e.key === 'Enter') handleUniversal();
    });

    // Suggestion chips
    this.container.querySelectorAll('[data-query]').forEach(chip => {
      this._on(chip, 'click', (e) => {
        if (universalInput) {
          universalInput.value = e.currentTarget.dataset.query;
          handleUniversal();
        }
      });
    });

    // Component input fields
    this.container.querySelectorAll('.vo-component-input[data-vec]').forEach(input => {
      this._on(input, 'change', (e) => {
        const vecLbl = e.currentTarget.dataset.vec;
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const val = parseFloat(e.currentTarget.value) || 0;
        if (vecLbl === 'u') {
          this.u = this.u.set(idx, val);
        } else if (vecLbl === 'v') {
          this.v = this.v.set(idx, val);
        }
        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      });
    });

    // Quick Workbench actions: zero, random, negate
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const action = e.currentTarget.dataset.action;
        const target = e.currentTarget.dataset.target;
        const targetVec = target === 'u' ? this.u : this.v;

        if (action === 'zero') {
          const z = Vector.zero(this.dim, target);
          if (target === 'u') this.u = z; else this.v = z;
        } else if (action === 'random') {
          const r = Vector.random(this.dim, -5, 6, target);
          if (target === 'u') this.u = r; else this.v = r;
        } else if (action === 'negate') {
          const neg = targetVec.components.map(c => -c);
          const n = new Vector(neg, target);
          if (target === 'u') this.u = n; else this.v = n;
        }

        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
      });
    });

    // Presets
    this.container.querySelectorAll('[data-preset]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const p = e.currentTarget.dataset.preset;
        if (p === 'standard') {
          this.dim = 3;
          this.u = Vector.from([3, 4, 0], 'u');
          this.v = Vector.from([1, 2, 2], 'v');
        } else if (p === 'orthogonal') {
          this.dim = 3;
          this.u = Vector.from([2, 1, -1], 'u');
          this.v = Vector.from([1, 2, 4], 'v');
        } else if (p === 'parallel') {
          this.dim = 3;
          this.u = Vector.from([2, -3, 4], 'u');
          this.v = Vector.from([4, -6, 8], 'v');
        } else if (p === 'basis') {
          this.dim = 3;
          this.u = Vector.from([1, 0, 0], 'u');
          this.v = Vector.from([0, 1, 0], 'v');
        }

        this.render();
        this._attachListeners();
        this.executeOperation(this.selectedOp);
        showToast(`Loaded preset: ${p}`);
      });
    });

    // Swap u & v
    const swapBtn = document.getElementById('vo-btn-swap');
    this._on(swapBtn, 'click', () => {
      const temp = this.u;
      this.u = this.v.clone('u');
      this.v = temp.clone('v');
      this.render();
      this._attachListeners();
      this.executeOperation(this.selectedOp);
      showToast('Swapped vectors u and v');
    });

    // Operations toolbar buttons
    this.container.querySelectorAll('.vo-op-btn[data-op]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        this.container.querySelectorAll('.vo-op-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.executeOperation(e.currentTarget.dataset.op);
      });
    });

    // Parameter inputs: scalar k, c1, c2
    const scalarInput = document.getElementById('vo-input-scalar');
    this._on(scalarInput, 'change', (e) => {
      this.scalarK = parseFloat(e.currentTarget.value) || 1;
    });

    const c1Input = document.getElementById('vo-input-c1');
    this._on(c1Input, 'change', (e) => {
      this.combC1 = parseFloat(e.currentTarget.value) || 1;
    });

    const c2Input = document.getElementById('vo-input-c2');
    this._on(c2Input, 'change', (e) => {
      this.combC2 = parseFloat(e.currentTarget.value) || 1;
    });

    const recalcBtn = document.getElementById('vo-btn-recalc');
    this._on(recalcBtn, 'click', () => {
      this.executeOperation(this.selectedOp);
    });

    // Copy actions for workbench vectors
    this.container.querySelectorAll('[data-copy-vec]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const lbl = e.currentTarget.dataset.copyVec;
        const vec = lbl === 'u' ? this.u : this.v;
        copyToClipboard(vec.toText());
        showToast(`Copied Vector ${lbl}: ${vec.toText()}`);
      });
    });

    this.container.querySelectorAll('[data-copy-latex]').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const lbl = e.currentTarget.dataset.copyLatex;
        const vec = lbl === 'u' ? this.u : this.v;
        copyToClipboard(vec.toLatex());
        showToast(`Copied LaTeX for Vector ${lbl}`);
      });
    });
  }
}
