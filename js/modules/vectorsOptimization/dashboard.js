/**
 * OG - Vectors & Optimization Main Dashboard (VectorsOptimizationDashboardView)
 * Visual Identity: Ivory (#E8E0D2), Gold (#B89A5A), Deep Atlas Navy (#0E1D61)
 *
 * Header:
 * VECTORS & OPTIMIZATION LAB
 * "Analyze vectors, explore geometry, solve constrained optimization problems, and visualize mathematical solutions."
 *
 * Cards:
 * - Vector Lab
 * - Optimization Lab
 * - Vector Geometry
 * - Linear Programming
 * - Constrained Optimization
 * - Numerical Optimization
 * - Visualization
 * - Practice Lab
 * - Formula Library
 *
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { Vector } from '../../vectors/vector.js';
import { VectorParser } from '../../vectors/parser.js';

export const VECTORS_OPTIMIZATION_MODULES = [
  { id: 'vector-calculator',       num: '01', title: 'Vector Lab',                desc: '2D/3D Vector arithmetic, norms, unit directions, distances and collinearity' },
  { id: 'vector-products',         num: '02', title: 'Dot & Cross Products',       desc: 'Orthogonality, angle between vectors, parallelogram areas & triple products' },
  { id: 'vector-geometry',         num: '03', title: 'Vector Geometry',           desc: 'Vector lines, planes, direction cosines, distances and intersections' },
  { id: 'vector-visualization',    num: '04', title: '2D & 3D Visualization',      desc: 'Interactive vector projection canvas with pan, zoom, and orientation rotation' },
  { id: 'function-optimization',   num: '05', title: 'Function Optimization',      desc: 'Critical point analyzer, second derivative test, local and global extrema' },
  { id: 'gradient-lab',            num: '06', title: 'Gradient & Directional',    desc: 'Multivariable gradient vectors ∇f, steepest ascent/descent, and Hessian' },
  { id: 'lagrange-multipliers',    num: '07', title: 'Constrained Optimization',  desc: 'Lagrange multipliers ∇f = λ∇g with equality and boundary constraints' },
  { id: 'linear-programming',      num: '08', title: 'Linear Programming',        desc: 'Graphical corner point method, feasible polygon, and simplex tableaux' },
  { id: 'numerical-optimization',  num: '09', title: 'Numerical Optimization',    desc: 'Gradient descent, learning rates, convergence criteria, and step logs' },
  { id: 'vo-practice-lab',         num: '10', title: 'Practice Lab',              desc: 'Curated problem challenges across vector algebra and optimization calculus' },
  { id: 'vo-formula-library',      num: '11', title: 'Formula Library',           desc: 'Theorems, vector identities, Lagrange conditions, and duality rules' }
];

export class VectorsOptimizationDashboardView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this._listeners = [];
  }

  mount() {
    this.render();
    this._attachListeners();
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
        <!-- Main Header -->
        <div class="vo-header-row">
          <div>
            <div class="vo-breadcrumb">
              <span>OG Mathematics</span>
              <span class="vo-breadcrumb-sep">/</span>
              <span>Advanced Mathematical Laboratories</span>
            </div>
            <h1 class="vo-title">Vectors & Optimization Lab</h1>
            <p class="vo-subtitle">
              Analyze vectors, explore 3D geometry, solve constrained optimization problems, and visualize mathematical solutions.
            </p>
          </div>

          <div class="vo-header-actions">
            <a href="#/vector-lab" class="vo-btn vo-btn-primary">
              Launch Vector Lab →
            </a>
            <a href="#/modules" class="vo-btn vo-btn-secondary">
              All 24 Modules
            </a>
          </div>
        </div>

        <!-- Universal Vector & Optimization Input -->
        <div class="vo-glass-card">
          <div class="vo-card-header">
            <div>
              <div class="vo-card-title">Universal Vector & Optimization Input</div>
              <div class="vo-card-subtitle">Intelligently detects vectors, operations, expressions, and constraints</div>
            </div>
          </div>

          <div class="vo-universal-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B89A5A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
            <input
              type="text"
              id="vo-dash-universal-input"
              class="vo-universal-input"
              placeholder="e.g. u = [3, 4], [1, 2, 3] + [4, 5, 6], or f(x) = x^2 - 4x + 3"
              aria-label="Universal Input"
            >
            <button class="vo-btn vo-btn-primary" id="vo-dash-universal-btn" style="min-height: 38px; padding: 6px 18px;">
              Solve
            </button>
          </div>

          <div class="vo-suggestion-chips">
            <span style="font-size: 0.78rem; font-weight: 700; color: #B89A5A; margin-right: 4px;">Quick Suggestions:</span>
            <button class="vo-chip" data-quick="[1, 2, 3] + [4, 5, 6]">[1,2,3] + [4,5,6]</button>
            <button class="vo-chip" data-quick="[2, 3, 6] magnitude">|[2, 3, 6]|</button>
            <button class="vo-chip" data-quick="unit([3, 4])">unit([3, 4])</button>
            <button class="vo-chip" data-quick="d([1, 2], [4, 6])">distance</button>
          </div>
        </div>

        <!-- Laboratory Navigation Grid -->
        <div>
          <div style="font-size: 1.15rem; font-weight: 800; color: #0E1D61; margin-bottom: 14px;">
            Laboratory Modules & Workspaces
          </div>
          <div class="vo-grid-3">
            ${VECTORS_OPTIMIZATION_MODULES.map(m => `
              <div class="vo-glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span class="vo-step-num" style="width: 26px; height: 26px; font-size: 0.75rem;">${m.num}</span>
                    <span style="font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; color: #B89A5A; text-transform: uppercase;">
                      Interactive Lab
                    </span>
                  </div>
                  <h3 style="font-size: 1.05rem; font-weight: 700; color: #0E1D61; margin: 0 0 6px 0;">${m.title}</h3>
                  <p style="font-size: 0.82rem; color: #0E1D61; opacity: 0.8; margin: 0; line-height: 1.45;">${m.desc}</p>
                </div>
                <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid rgba(184, 154, 90, 0.2);">
                  <a href="#/vector-lab" class="vo-btn vo-btn-secondary" style="width: 100%; min-height: 38px; font-size: 0.8rem;">
                    Launch Laboratory →
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quick Summary & Theorem Cards -->
        <div class="vo-grid-2">
          <!-- Geometric Invariants -->
          <div class="vo-glass-card">
            <div class="vo-card-header">
              <div class="vo-card-title">Foundational Vector Invariants</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem; color: #0E1D61;">
              <div style="padding: 10px 14px; background: rgba(232, 224, 210, 0.4); border-radius: 8px; border-left: 3px solid #B89A5A;">
                <strong>Cauchy-Schwarz Inequality:</strong> |u · v| ≤ |u| |v|, with equality if and only if u and v are linearly dependent.
              </div>
              <div style="padding: 10px 14px; background: rgba(232, 224, 210, 0.4); border-radius: 8px; border-left: 3px solid #B89A5A;">
                <strong>Triangle Inequality:</strong> |u + v| ≤ |u| + |v|, expressing the shortest path between Euclidean points.
              </div>
              <div style="padding: 10px 14px; background: rgba(232, 224, 210, 0.4); border-radius: 8px; border-left: 3px solid #B89A5A;">
                <strong>Parallelogram Law:</strong> |u + v|² + |u - v|² = 2|u|² + 2|v|², fundamental to inner product spaces.
              </div>
            </div>
          </div>

          <!-- Optimization Principles -->
          <div class="vo-glass-card">
            <div class="vo-card-header">
              <div class="vo-card-title">Optimization Principles</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem; color: #0E1D61;">
              <div style="padding: 10px 14px; background: rgba(232, 224, 210, 0.4); border-radius: 8px; border-left: 3px solid #B89A5A;">
                <strong>Fermat's Theorem:</strong> If f has a local extremum at c and is differentiable, then ∇f(c) = 0 (critical point).
              </div>
              <div style="padding: 10px 14px; background: rgba(232, 224, 210, 0.4); border-radius: 8px; border-left: 3px solid #B89A5A;">
                <strong>Lagrange Condition:</strong> For extrema subject to g(x) = c, gradients align: ∇f = λ∇g.
              </div>
              <div style="padding: 10px 14px; background: rgba(232, 224, 210, 0.4); border-radius: 8px; border-left: 3px solid #B89A5A;">
                <strong>Fundamental Theorem of Linear Programming:</strong> Optimal solutions occur at extreme corner vertices of the feasible region.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _attachListeners() {
    const input = document.getElementById('vo-dash-universal-input');
    const btn = document.getElementById('vo-dash-universal-btn');

    const handleSolve = () => {
      const q = input?.value;
      if (!q) return;
      window.location.hash = '#/vector-lab';
    };

    this._on(btn, 'click', handleSolve);
    this._on(input, 'keydown', (e) => {
      if (e.key === 'Enter') handleSolve();
    });

    this.container.querySelectorAll('[data-quick]').forEach(chip => {
      this._on(chip, 'click', (e) => {
        if (input) input.value = e.currentTarget.dataset.quick;
        handleSolve();
      });
    });
  }
}
