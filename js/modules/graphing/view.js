/**
 * OG - Dedicated Graph Calculator View
 * Premium Liquid Glass interactive graphing workspace:
 * - Multi-function plotting with dynamic expression list
 * - Clean input normalizing 'y = ...' or 'f(x) = ...'
 * - Real-time pan & zoom with HUD controls
 * - Domain and Range boundaries
 * - Quick function chips (y = x, y = x², y = x³, y = sin(x), y = cos(x), y = tan(x), y = e^x, y = log(x))
 * - Hide/show toggle, color badges, and derivative toggles
 * ES6 Module
 */

import { MathExpression, SymbolicDifferentiator } from '../../math/calculus.js';
import { GraphCalculatorVisualizer, GRAPH_COLOR_PALETTE } from './visualizer.js';
import { SVG_ICONS } from '../../utils.js';

export class GraphCalculatorView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    // Expression items
    this.expressions = [
      {
        id: 'expr_1',
        rawText: 'y = sin(x)',
        parsedStr: 'sin(x)',
        color: GRAPH_COLOR_PALETTE[0],
        visible: true,
        showDerivative: false,
        expr: new MathExpression('sin(x)'),
        derivExpr: new MathExpression('cos(x)')
      },
      {
        id: 'expr_2',
        rawText: 'y = x^2',
        parsedStr: 'x^2',
        color: GRAPH_COLOR_PALETTE[1],
        visible: true,
        showDerivative: false,
        expr: new MathExpression('x^2'),
        derivExpr: new MathExpression('2x')
      }
    ];

    // Domain / Range
    this.xMin = -6;
    this.xMax = 6;
    this.yMin = -5;
    this.yMax = 5;
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.initVisualizer();
  }

  render() {
    this.container.innerHTML = `
      <div class="graph-workspace">
        <!-- Header -->
        <div class="graph-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge" style="background: rgba(184, 154, 90, 0.15); border-color: rgba(184, 154, 90, 0.4); color: #0E1D61;">
                Core Tool
              </span>
              <span class="badge badge-geometry">2D Coordinate Visualizer</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Graph Calculator
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Plot single or multiple functions simultaneously, inspect coordinate geometry,
              drag to pan, scroll to zoom, and analyze functions in high-definition Liquid Glass.
            </p>
          </div>

          <div style="display: flex; gap: 10px; align-items: center;">
            <button class="glass-button" id="btn-reset-view" title="Reset View" style="padding: 8px 16px;">
              Reset Origin (0,0)
            </button>
            <button class="glass-button glass-button-primary" id="btn-add-expr" style="padding: 8px 18px;">
              + Add Function
            </button>
          </div>
        </div>

        <!-- Quick Function Preset Bar -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
            Quick Presets (Standard Functions):
          </div>
          <div class="quick-func-bar" id="quick-preset-bar">
            <button class="quick-func-chip" data-func="y = x">y = x</button>
            <button class="quick-func-chip" data-func="y = x^2">y = x²</button>
            <button class="quick-func-chip" data-func="y = x^3">y = x³</button>
            <button class="quick-func-chip" data-func="y = sin(x)">y = sin(x)</button>
            <button class="quick-func-chip" data-func="y = cos(x)">y = cos(x)</button>
            <button class="quick-func-chip" data-func="y = tan(x)">y = tan(x)</button>
            <button class="quick-func-chip" data-func="y = exp(x)">y = e^x</button>
            <button class="quick-func-chip" data-func="y = log(x)">y = log(x)</button>
          </div>
        </div>

        <!-- Main Layout (Sidebar + Viewport) -->
        <div class="graph-main-layout">
          <!-- Sidebar: Expressions & Domain -->
          <div class="graph-sidebar">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-white); font-family: var(--font-mono);">
                Expressions List
              </span>
              <span style="font-size: 0.8rem; color: var(--text-muted);" id="expr-count-badge">
                ${this.expressions.length} plotted
              </span>
            </div>

            <!-- Dynamic Expression Card List -->
            <div class="expression-list" id="expression-list-container">
              ${this.renderExpressionsListHtml()}
            </div>

            <!-- Domain Controls -->
            <div style="margin-top: 10px;">
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; font-family: var(--font-mono);">
                Window Bounds
              </div>
              <div class="domain-settings-card">
                <div class="domain-input-unit">
                  <label>X Min</label>
                  <input type="number" step="any" id="domain-xmin" value="${this.xMin}">
                </div>
                <div class="domain-input-unit">
                  <label>X Max</label>
                  <input type="number" step="any" id="domain-xmax" value="${this.xMax}">
                </div>
                <div class="domain-input-unit">
                  <label>Y Min</label>
                  <input type="number" step="any" id="domain-ymin" value="${this.yMin}">
                </div>
                <div class="domain-input-unit">
                  <label>Y Max</label>
                  <input type="number" step="any" id="domain-ymax" value="${this.yMax}">
                </div>
              </div>
            </div>
          </div>

          <!-- Viewport Card -->
          <div class="graph-viewport-card">
            <!-- Toolbar -->
            <div class="graph-toolbar">
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="color: var(--text-white); font-weight: 600;">Interactive Canvas</span>
                <span style="color: var(--text-muted);">|</span>
                <span style="color: var(--accent-cyan); font-size: 0.82rem;">Trig Mode: Radians</span>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-muted);" id="viewport-bounds-display">
                X: [${this.xMin.toFixed(1)}, ${this.xMax.toFixed(1)}] | Y: [${this.yMin.toFixed(1)}, ${this.yMax.toFixed(1)}]
              </div>
            </div>

            <!-- Canvas Container -->
            <div class="viewport-canvas-container" id="canvas-container">
              <canvas id="graph-calculator-canvas"></canvas>

              <!-- Floating HUD Navigation Buttons -->
              <div class="graph-hud-controls">
                <button class="hud-btn" id="hud-zoom-in" title="Zoom In (+)">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button class="hud-btn" id="hud-zoom-out" title="Zoom Out (-)">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <button class="hud-btn" id="hud-reset" title="Reset Center">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderExpressionsListHtml() {
    return this.expressions.map((item, index) => `
      <div class="expression-card" data-expr-id="${item.id}">
        <span class="expr-color-bullet" style="color: ${item.color}; background: ${item.color};"></span>
        <input type="text" class="expr-input-field" value="${item.rawText}" placeholder="e.g. y = sin(x)">
        <button class="expr-action-btn ${item.visible ? 'active' : ''}" data-action="toggle-visibility" title="${item.visible ? 'Hide Function' : 'Show Function'}">
          ${item.visible ? `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          ` : `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          `}
        </button>
        <button class="expr-action-btn ${item.showDerivative ? 'active' : ''}" data-action="toggle-derivative" title="Toggle f'(x) Derivative">
          <span style="font-size: 0.75rem; font-weight: 700; font-family: var(--font-mono);">f'</span>
        </button>
        ${this.expressions.length > 1 ? `
          <button class="expr-action-btn btn-remove" data-action="remove" title="Delete Function">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        ` : ''}
      </div>
    `).join('');
  }

  initVisualizer() {
    const canvas = document.getElementById('graph-calculator-canvas');
    if (!canvas) return;

    if (this.visualizer) {
      this.visualizer.destroy();
    }

    this.visualizer = new GraphCalculatorVisualizer(canvas, {
      expressions: this.expressions,
      xMin: this.xMin,
      xMax: this.xMax,
      yMin: this.yMin,
      yMax: this.yMax,
      onViewChange: (bounds) => {
        this.xMin = bounds.xMin;
        this.xMax = bounds.xMax;
        this.yMin = bounds.yMin;
        this.yMax = bounds.yMax;
        this.updateDomainInputs();
      }
    });
  }

  updateDomainInputs() {
    const inXmin = document.getElementById('domain-xmin');
    const inXmax = document.getElementById('domain-xmax');
    const inYmin = document.getElementById('domain-ymin');
    const inYmax = document.getElementById('domain-ymax');
    const display = document.getElementById('viewport-bounds-display');

    if (inXmin) inXmin.value = this.xMin.toFixed(2);
    if (inXmax) inXmax.value = this.xMax.toFixed(2);
    if (inYmin) inYmin.value = this.yMin.toFixed(2);
    if (inYmax) inYmax.value = this.yMax.toFixed(2);
    if (display) {
      display.textContent = `X: [${this.xMin.toFixed(1)}, ${this.xMax.toFixed(1)}] | Y: [${this.yMin.toFixed(1)}, ${this.yMax.toFixed(1)}]`;
    }
  }

  attachEventListeners() {
    // 1. Add Expression button
    const addBtn = document.getElementById('btn-add-expr');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.addExpression('y = cos(x)');
      });
    }

    // 2. Reset View button & HUD reset
    const resetBtn = document.getElementById('btn-reset-view');
    const hudReset = document.getElementById('hud-reset');
    [resetBtn, hudReset].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.visualizer) this.visualizer.resetView();
        });
      }
    });

    // 3. HUD Zoom In / Out
    const zoomIn = document.getElementById('hud-zoom-in');
    const zoomOut = document.getElementById('hud-zoom-out');
    if (zoomIn) {
      zoomIn.addEventListener('click', () => {
        if (this.visualizer) this.visualizer.zoom(0.85);
      });
    }
    if (zoomOut) {
      zoomOut.addEventListener('click', () => {
        if (this.visualizer) this.visualizer.zoom(1.18);
      });
    }

    // 4. Quick Function Preset chips
    const presetBar = document.getElementById('quick-preset-bar');
    if (presetBar) {
      presetBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.quick-func-chip');
        if (!chip) return;
        const funcStr = chip.dataset.func;
        this.addExpression(funcStr);
      });
    }

    // 5. Expression List Actions (edit, toggle, remove)
    const listContainer = document.getElementById('expression-list-container');
    if (listContainer) {
      listContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('expr-input-field')) {
          const card = e.target.closest('.expression-card');
          const id = card.dataset.exprId;
          this.updateExpressionText(id, e.target.value);
        }
      });

      listContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.expr-action-btn');
        if (!btn) return;
        const card = btn.closest('.expression-card');
        const id = card.dataset.exprId;
        const action = btn.dataset.action;

        if (action === 'toggle-visibility') {
          this.toggleVisibility(id);
        } else if (action === 'toggle-derivative') {
          this.toggleDerivative(id);
        } else if (action === 'remove') {
          this.removeExpression(id);
        }
      });
    }

    // 6. Domain Inputs Change
    ['xmin', 'xmax', 'ymin', 'ymax'].forEach(prop => {
      const el = document.getElementById(`domain-${prop}`);
      if (el) {
        el.addEventListener('change', () => {
          const inXmin = parseFloat(document.getElementById('domain-xmin')?.value) || -6;
          const inXmax = parseFloat(document.getElementById('domain-xmax')?.value) || 6;
          const inYmin = parseFloat(document.getElementById('domain-ymin')?.value) || -5;
          const inYmax = parseFloat(document.getElementById('domain-ymax')?.value) || 5;

          if (inXmin < inXmax && inYmin < inYmax) {
            this.xMin = inXmin;
            this.xMax = inXmax;
            this.yMin = inYmin;
            this.yMax = inYmax;
            if (this.visualizer) {
              this.visualizer.setDomain(inXmin, inXmax, inYmin, inYmax);
            }
          }
        });
      }
    });
  }

  // Parse input string: y = sin(x) -> sin(x)
  normalizeExpression(text) {
    let clean = (text || '').trim();
    // Strip "y =" or "f(x) ="
    clean = clean.replace(/^[yY]\s*=\s*/, '');
    clean = clean.replace(/^[fF]\(x\)\s*=\s*/, '');

    // Normalize powers: x² -> x^2, x³ -> x^3
    clean = clean.replace(/x²/g, 'x^2').replace(/x³/g, 'x^3');
    // Normalize e^x -> exp(x)
    clean = clean.replace(/e\^x/gi, 'exp(x)');

    return clean;
  }

  addExpression(rawText) {
    const id = `expr_${Date.now()}_${Math.floor(Math.random() * 100)}`;
    const parsedStr = this.normalizeExpression(rawText);
    const color = GRAPH_COLOR_PALETTE[this.expressions.length % GRAPH_COLOR_PALETTE.length];

    const expr = new MathExpression(parsedStr);
    let derivExpr = null;
    if (expr.isValid()) {
      const dAst = SymbolicDifferentiator.differentiate(expr.ast);
      const simpD = SymbolicDifferentiator.simplify(dAst);
      derivExpr = new MathExpression(expr.toString(simpD));
    }

    this.expressions.push({
      id,
      rawText,
      parsedStr,
      color,
      visible: true,
      showDerivative: false,
      expr,
      derivExpr
    });

    this.refreshExpressionList();
    if (this.visualizer) {
      this.visualizer.setExpressions(this.expressions);
    }
  }

  updateExpressionText(id, newText) {
    const item = this.expressions.find(e => e.id === id);
    if (!item) return;

    item.rawText = newText;
    item.parsedStr = this.normalizeExpression(newText);
    item.expr = new MathExpression(item.parsedStr);

    if (item.expr.isValid()) {
      const dAst = SymbolicDifferentiator.differentiate(item.expr.ast);
      const simpD = SymbolicDifferentiator.simplify(dAst);
      item.derivExpr = new MathExpression(item.expr.toString(simpD));
    } else {
      item.derivExpr = null;
    }

    if (this.visualizer) {
      this.visualizer.setExpressions(this.expressions);
    }
  }

  toggleVisibility(id) {
    const item = this.expressions.find(e => e.id === id);
    if (!item) return;
    item.visible = !item.visible;
    this.refreshExpressionList();
    if (this.visualizer) {
      this.visualizer.setExpressions(this.expressions);
    }
  }

  toggleDerivative(id) {
    const item = this.expressions.find(e => e.id === id);
    if (!item) return;
    item.showDerivative = !item.showDerivative;
    this.refreshExpressionList();
    if (this.visualizer) {
      this.visualizer.setExpressions(this.expressions);
    }
  }

  removeExpression(id) {
    if (this.expressions.length <= 1) return;
    this.expressions = this.expressions.filter(e => e.id !== id);
    this.refreshExpressionList();
    if (this.visualizer) {
      this.visualizer.setExpressions(this.expressions);
    }
  }

  refreshExpressionList() {
    const container = document.getElementById('expression-list-container');
    const badge = document.getElementById('expr-count-badge');
    if (container) {
      container.innerHTML = this.renderExpressionsListHtml();
    }
    if (badge) {
      badge.textContent = `${this.expressions.length} plotted`;
    }
  }

  destroy() {
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
  }
}
