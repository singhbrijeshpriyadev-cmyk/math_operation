/**
 * OG - Calculus Dashboard & Workspace View
 * Visual identity: Ivory (#E8E0D2), Gold (#B89A5A), Deep Atlas Navy (#0E1D61)
 * Liquid Glass Design
 *
 * Provides:
 * - Header: CALCULUS "Understand change, motion, area and accumulation."
 * - Universal Calculus Input Bar: [ f(x) = x³ - 3x ] [ Analyze ]
 * - Smart Operation Suggestions: Evaluate Limit, Differentiate, Integrate, Analyze Function, etc.
 * - Split Workspace: Graph on left, Result on right, Step-by-Step solution below
 * - Interactive Canvas: Pan, Zoom, Reset, Dynamic Tangent line slider (x = a)
 * - Exact / Decimal Mode Switcher
 * - Curriculum Modules (6) & Advanced Tools (14) Navigation Grid
 * - History & Favorites integration
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';

const CURRICULUM_MODULES = [
  { id: 'limits-derivatives',          num: '12', title: 'Limits and Derivatives',          icon: 'lim', desc: 'Finite & one-sided limits, first principles, standard limits', href: '#/modules/limits-derivatives' },
  { id: 'continuity-differentiability',num: '18', title: 'Continuity and Differentiability',icon: 'C',   desc: 'Continuity tests, differentiability, chain rule & derivatives', href: '#/modules/continuity-differentiability' },
  { id: 'applications-of-derivatives', num: '19', title: 'Applications of Derivatives',     icon: '📈',  desc: 'Increasing/decreasing, tangents & normals, maxima & minima', href: '#/modules/applications-of-derivatives' },
  { id: 'integrals',                   num: '20', title: 'Integrals',                       icon: '∫',   desc: 'Indefinite & definite integrals, substitution, parts & fractions', href: '#/modules/integrals' },
  { id: 'applications-of-integrals',   num: '21', title: 'Applications of Integrals',       icon: '∯',   desc: 'Area under curves, area bounded between intersecting curves', href: '#/modules/applications-of-integrals' },
  { id: 'differential-equations',      num: '22', title: 'Differential Equations',          icon: 'dy',  desc: 'Order & degree, variable separation, first-order linear ODEs', href: '#/modules/differential-equations' }
];

const ADVANCED_TOOLS = [
  { id: 'limits',                 num: '01', icon: 'lim', title: 'Limits',                    desc: 'Two-sided, LHL, RHL, algebraic limits, table' },
  { id: 'derivatives',            num: '02', icon: '∂',   title: 'Derivatives',               desc: 'Product, quotient & chain rules, higher order' },
  { id: 'continuity',             num: '03', icon: 'C',   title: 'Continuity',                desc: 'LHL = RHL = f(a) test, removable & jump types' },
  { id: 'differentiability',      num: '04', icon: 'D',   title: 'Differentiability',         desc: 'LHD, RHD, |x| test, differentiability conditions' },
  { id: 'applications-derivatives',num: '05',icon: '📈',  title: 'Applications of Derivatives',desc: 'Monotonicity, critical points, extrema, concavity' },
  { id: 'integrals',              num: '06', icon: '∫',   title: 'Integrals',                 desc: 'Indefinite (+C) & definite integration, exact fractions' },
  { id: 'applications-integrals', num: '07', icon: '∯',   title: 'Applications of Integrals', desc: 'Area under curve & area between curves' },
  { id: 'differential-equations', num: '08', icon: 'dy',  title: 'Differential Equations',    desc: 'Order, degree, variable separation, integrating factor' },
  { id: 'graphing-lab',           num: '09', icon: '📊',  title: 'Calculus Graphing Lab',     desc: 'Interactive 2D graph with tangent probe, zoom & pan' },
  { id: 'formula-library',        num: '10', icon: '📚',  title: 'Calculus Formula Library',  desc: 'Categorized rules, theorems, examples & guides' },
  { id: 'step-solver',            num: '11', icon: '⚡',  title: 'Calculus Step Solver',      desc: '7-stage mathematically meaningful derivation engine' },
  { id: 'practice-lab',           num: '12', icon: '🧠',  title: 'Calculus Practice Lab',     desc: 'Quick practice, topic drills, exam mode' },
  { id: 'numerical-lab',          num: '13', icon: '🔢',  title: 'Numerical Calculus Lab',    desc: 'Central difference, Simpson & Trapezoidal rules' },
  { id: 'calculator',             num: '14', icon: '🧮',  title: 'Calculus Calculator',       desc: 'Unified all-in-one calculus expression evaluator' }
];

export class CalculusView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.graphVisualizer = null;
    this.currentInput = 'f(x) = x³ - 3x';
    this.currentAction = 'analyze'; // 'analyze' | 'differentiate' | 'integrate' | 'limit' | 'tangent'
    this.isExactMode = true;
    this.decimalPrecision = 6;
    this.currentTangentA = 1;
    this.currentResultData = null;
    this._listeners = [];
  }

  mount() {
    this.render();
    this._attachListeners();
    this._initGraph();
    this.analyzeCurrentInput(true);
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => {
      try { el.removeEventListener(evt, fn); } catch (e) {}
    });
    this._listeners = [];

    if (this.graphVisualizer && typeof this.graphVisualizer.destroy === 'function') {
      this.graphVisualizer.destroy();
      this.graphVisualizer = null;
    }
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  render() {
    this.container.innerHTML = `
      <div class="calc-workspace view-animate-in">

        <!-- Header -->
        <header class="calc-header">
          <div class="calc-header-text">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span class="calc-badge">
                <span class="calc-badge-dot"></span>
                Calculus Workspace
              </span>
            </div>
            <h1 class="calc-title">CALCULUS</h1>
            <p class="calc-subtitle">Understand change, motion, area and accumulation.</p>
          </div>
          <div class="calc-header-actions">
            <a href="#/calculus-tools/calculator" class="glass-btn glass-btn-outline">
              <span class="glass-btn-icon">🧮</span>
              <span>All Calculators</span>
            </a>
            <a href="#/calculus-tools/formula-library" class="glass-btn glass-btn-primary">
              <span class="glass-btn-icon">📚</span>
              <span>Formula Library</span>
            </a>
          </div>
        </header>

        <!-- Universal Calculus Input & Operation Detection Panel -->
        <section class="glass-surface calc-solver-panel">
          <div class="calc-solver-header">
            <div>
              <span class="calc-solver-tag">Universal Calculus Input</span>
              <h2 class="calc-solver-title">Expression or Equation</h2>
            </div>
            <div class="calc-mode-toggle-wrap">
              <button class="calc-mode-btn ${this.isExactMode ? 'active' : ''}" id="btn-calc-mode-exact">Exact</button>
              <button class="calc-mode-btn ${!this.isExactMode ? 'active' : ''}" id="btn-calc-mode-decimal">Decimal</button>
            </div>
          </div>

          <!-- Input Bar with Universal Expression Box -->
          <div class="calc-input-bar">
            <div class="calc-input-wrap">
              <input type="text"
                id="calc-universal-input"
                class="glass-input calc-main-input"
                placeholder="e.g. f(x) = x³ - 3x, lim x→2 (x²-4)/(x-2), d/dx (x² + 3x), ∫ x² dx, dy/dx = 2x"
                value="${this.currentInput}"
                spellcheck="false"
                autocomplete="off">
            </div>
            <button class="glass-btn glass-btn-primary calc-analyze-btn" id="btn-calc-analyze">
              <span>Analyze</span>
            </button>
          </div>

          <!-- Smart Operation Suggestion Chips -->
          <div class="calc-suggestions-row">
            <span class="calc-suggestions-label">Suggested:</span>
            <div id="calc-suggestions-chips" class="calc-chips-container">
              <!-- Dynamically populated chips -->
            </div>
          </div>

          <!-- Quick Expression Presets -->
          <div class="calc-presets-row">
            <span class="calc-presets-label">Examples:</span>
            <div class="calc-presets-scroll">
              <button class="calc-preset-chip" data-input="f(x) = x³ - 3x">x³ - 3x</button>
              <button class="calc-preset-chip" data-input="lim x→2 (x² - 4)/(x - 2)">lim x→2 (x²-4)/(x-2)</button>
              <button class="calc-preset-chip" data-input="lim x→0 sin(x)/x">lim x→0 sin(x)/x</button>
              <button class="calc-preset-chip" data-input="d/dx (x² + 3x)">d/dx (x² + 3x)</button>
              <button class="calc-preset-chip" data-input="d/dx [(x²+1)(x³-2)]">Product Rule</button>
              <button class="calc-preset-chip" data-input="d/dx [sin(x²)]">Chain Rule</button>
              <button class="calc-preset-chip" data-input="∫ x² dx">∫ x² dx</button>
              <button class="calc-preset-chip" data-input="∫₀² x² dx">∫₀² x² dx</button>
              <button class="calc-preset-chip" data-input="|x| at x=0">|x| at x=0</button>
              <button class="calc-preset-chip" data-input="dy/dx = 2x">dy/dx = 2x</button>
            </div>
          </div>
        </section>

        <!-- Main Desktop Workspace: Side-by-Side Graph & Result -->
        <div class="calc-workspace-split">

          <!-- Left Column: Interactive Graph Canvas & Controls -->
          <div class="glass-surface calc-canvas-card">
            <div class="calc-card-header">
              <div class="calc-card-title-group">
                <span class="calc-card-icon">📊</span>
                <div>
                  <h3 class="calc-card-title">Interactive Calculus Graph</h3>
                  <p class="calc-card-sub" id="calc-graph-func-label">Plotting f(x)</p>
                </div>
              </div>

              <!-- Graph Toolbar: Zoom & Reset -->
              <div class="calc-graph-toolbar">
                <button class="calc-tool-btn" id="btn-graph-zoom-in" title="Zoom In">+</button>
                <button class="calc-tool-btn" id="btn-graph-zoom-out" title="Zoom Out">−</button>
                <button class="calc-tool-btn" id="btn-graph-reset" title="Reset View">Reset</button>
              </div>
            </div>

            <!-- Canvas Wrapper -->
            <div class="calc-canvas-wrap">
              <canvas id="calc-primary-canvas" class="calc-canvas"></canvas>
            </div>

            <!-- Graph Bottom Controls: Dynamic Tangent Slider & Toggles -->
            <div class="calc-graph-controls">
              <div class="calc-tangent-slider-wrap">
                <label for="calc-tangent-slider" class="calc-slider-label">
                  <span>Tangent Point <strong>x = a</strong>:</span>
                  <span id="calc-tangent-val-badge" class="calc-badge-gold">a = 1.0</span>
                </label>
                <input type="range" id="calc-tangent-slider" min="-4" max="4" step="0.1" value="1" class="calc-slider">
              </div>

              <div class="calc-graph-toggles">
                <label class="calc-toggle-item">
                  <input type="checkbox" id="chk-show-derivative" checked>
                  <span>Show f'(x)</span>
                </label>
                <label class="calc-toggle-item">
                  <input type="checkbox" id="chk-show-normal">
                  <span>Show Normal</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Right Column: Result Hero & Mathematical Values -->
          <div class="glass-surface calc-result-card">
            <div class="calc-card-header">
              <div class="calc-card-title-group">
                <span class="calc-card-icon">⚡</span>
                <div>
                  <h3 class="calc-card-title">Analysis & Outcome</h3>
                  <p class="calc-card-sub" id="calc-action-subtitle">Calculated symbolically</p>
                </div>
              </div>
              <button class="glass-btn glass-btn-outline calc-copy-btn" id="btn-copy-calc-result" title="Copy result">
                ${SVG_ICONS.copy || 'Copy'}
              </button>
            </div>

            <!-- Primary Outcome Showcase Box -->
            <div class="calc-outcome-hero" id="calc-outcome-hero-box">
              <span class="calc-outcome-label" id="calc-outcome-label">Result</span>
              <div class="calc-outcome-value" id="calc-outcome-value">—</div>
              <div class="calc-outcome-secondary" id="calc-outcome-secondary"></div>
            </div>

            <!-- Quantitative Properties Table -->
            <div class="calc-properties-list" id="calc-properties-container">
              <!-- Dynamically populated property rows -->
            </div>
          </div>

        </div>

        <!-- Step-by-Step Solution Accordion (Full Width Below) -->
        <section class="glass-surface calc-steps-card">
          <div class="calc-steps-header" id="calc-steps-toggle-btn">
            <div class="calc-steps-title-group">
              <span class="calc-card-icon">🪜</span>
              <div>
                <h3 class="calc-card-title">Step-by-Step Solution</h3>
                <p class="calc-card-sub">Rigorous 7-stage mathematical derivation</p>
              </div>
            </div>
            <button class="glass-btn glass-btn-outline calc-toggle-chevron" id="btn-toggle-steps">
              <span>View Derivation</span>
              <span class="calc-chevron-icon">▼</span>
            </button>
          </div>

          <div class="calc-steps-content" id="calc-steps-content-box">
            <div class="calc-step-flow">
              <div class="calc-step-node">
                <span class="calc-step-pill">1. PROBLEM</span>
                <span class="calc-step-text" id="step-node-problem">—</span>
              </div>
              <div class="calc-step-node">
                <span class="calc-step-pill">2. IDENTIFICATION</span>
                <span class="calc-step-text" id="step-node-identification">—</span>
              </div>
              <div class="calc-step-node">
                <span class="calc-step-pill">3. FORMULA / RULE</span>
                <span class="calc-step-text" id="step-node-formula">—</span>
              </div>
              <div class="calc-step-node">
                <span class="calc-step-pill">4. SUBSTITUTION</span>
                <span class="calc-step-text" id="step-node-substitution">—</span>
              </div>
              <div class="calc-step-node">
                <span class="calc-step-pill">5. CALCULATION</span>
                <span class="calc-step-text" id="step-node-calculation">—</span>
              </div>
              <div class="calc-step-node">
                <span class="calc-step-pill">6. SIMPLIFICATION</span>
                <span class="calc-step-text" id="step-node-simplification">—</span>
              </div>
              <div class="calc-step-node calc-step-final">
                <span class="calc-step-pill calc-step-pill-gold">7. FINAL ANSWER</span>
                <span class="calc-step-text calc-step-text-gold" id="step-node-final">—</span>
              </div>
            </div>

            <!-- Full Steps Raw List -->
            <div class="calc-raw-steps-box" id="calc-raw-steps-list"></div>
          </div>
        </section>

        <!-- Dedicated Calculus Modules Navigation Grid (Curriculum Modules) -->
        <section class="calc-nav-section">
          <div class="calc-nav-header">
            <div>
              <span class="calc-solver-tag">Core Curriculum</span>
              <h2 class="calc-nav-title">Calculus Curriculum Modules</h2>
            </div>
            <p class="calc-nav-desc">Comprehensive lessons with interactive visualizations and rigorous proofs</p>
          </div>

          <div class="calc-modules-grid">
            ${CURRICULUM_MODULES.map(m => `
              <a href="${m.href}" class="glass-surface calc-module-card">
                <div class="calc-mod-top">
                  <span class="calc-mod-num">Module #${m.num}</span>
                  <span class="calc-mod-icon-badge">${m.icon}</span>
                </div>
                <h3 class="calc-mod-title">${m.title}</h3>
                <p class="calc-mod-desc">${m.desc}</p>
                <div class="calc-mod-arrow">
                  <span>Explore Module</span>
                  <span>→</span>
                </div>
              </a>
            `).join('')}
          </div>
        </section>

        <!-- Advanced Calculus Tools Navigation Grid (All 14 Tools) -->
        <section class="calc-nav-section" style="margin-top: 40px;">
          <div class="calc-nav-header">
            <div>
              <span class="calc-solver-tag">Laboratories & Solvers</span>
              <h2 class="calc-nav-title">Calculus Suite Tools (01 — 14)</h2>
            </div>
            <p class="calc-nav-desc">Dedicated interactive workbenches for specialized calculus computation</p>
          </div>

          <div class="calc-tools-grid">
            ${ADVANCED_TOOLS.map(t => `
              <a href="#/calculus-tools/${t.id}" class="glass-surface calc-tool-card">
                <div class="calc-tool-top">
                  <span class="calc-tool-num">${t.num}</span>
                  <span class="calc-tool-icon">${t.icon}</span>
                </div>
                <h4 class="calc-tool-title">${t.title}</h4>
                <p class="calc-tool-desc">${t.desc}</p>
              </a>
            `).join('')}
          </div>
        </section>

      </div>
    `;
  }

  _initGraph() {
    const canvas = document.getElementById('calc-primary-canvas');
    if (!canvas) return;

    this.graphVisualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: 'x^3 - 3*x',
      derivStr: '3*x^2 - 3',
      showDerivative: true,
      tangentX0: this.currentTangentA,
      showNormal: false,
      onPointSelect: ({ x, y, fx }) => {
        const slider = document.getElementById('calc-tangent-slider');
        const badge = document.getElementById('calc-tangent-val-badge');
        if (slider) slider.value = x.toFixed(1);
        if (badge) badge.textContent = `a = ${x.toFixed(1)}`;
        this.currentTangentA = parseFloat(x.toFixed(1));
        if (this.graphVisualizer) {
          this.graphVisualizer.setTangentPoint(this.currentTangentA);
        }
      }
    });
  }

  _attachListeners() {
    const input = document.getElementById('calc-universal-input');
    const analyzeBtn = document.getElementById('btn-calc-analyze');
    const exactBtn = document.getElementById('btn-calc-mode-exact');
    const decimalBtn = document.getElementById('btn-calc-mode-decimal');
    const copyBtn = document.getElementById('btn-copy-calc-result');
    const stepsToggle = document.getElementById('calc-steps-toggle-btn');
    const zoomInBtn = document.getElementById('btn-graph-zoom-in');
    const zoomOutBtn = document.getElementById('btn-graph-zoom-out');
    const resetGraphBtn = document.getElementById('btn-graph-reset');
    const tangentSlider = document.getElementById('calc-tangent-slider');
    const chkDerivative = document.getElementById('chk-show-derivative');
    const chkNormal = document.getElementById('chk-show-normal');

    // Input analyze on Enter
    if (input) {
      this._on(input, 'keydown', (e) => {
        if (e.key === 'Enter') {
          this.currentInput = input.value;
          this.analyzeCurrentInput(true);
        }
      });
      this._on(input, 'input', () => {
        this.updateOperationChips(input.value);
      });
    }

    if (analyzeBtn && input) {
      this._on(analyzeBtn, 'click', () => {
        this.currentInput = input.value;
        this.analyzeCurrentInput(true);
      });
    }

    // Exact / Decimal toggles
    if (exactBtn && decimalBtn) {
      this._on(exactBtn, 'click', () => {
        this.isExactMode = true;
        exactBtn.classList.add('active');
        decimalBtn.classList.remove('active');
        this.refreshResultDisplay();
      });
      this._on(decimalBtn, 'click', () => {
        this.isExactMode = false;
        decimalBtn.classList.add('active');
        exactBtn.classList.remove('active');
        this.refreshResultDisplay();
      });
    }

    // Presets
    const presetBtns = this.container.querySelectorAll('.calc-preset-chip');
    presetBtns.forEach(btn => {
      this._on(btn, 'click', () => {
        const val = btn.getAttribute('data-input');
        if (input) input.value = val;
        this.currentInput = val;
        this.analyzeCurrentInput(true);
      });
    });

    // Copy Result
    if (copyBtn) {
      this._on(copyBtn, 'click', () => {
        const valEl = document.getElementById('calc-outcome-value');
        if (valEl && valEl.textContent) {
          copyToClipboard(valEl.textContent);
          showToast('Calculus outcome copied to clipboard');
        }
      });
    }

    // Steps accordion toggle
    if (stepsToggle) {
      this._on(stepsToggle, 'click', () => {
        const contentBox = document.getElementById('calc-steps-content-box');
        const chevron = document.querySelector('.calc-chevron-icon');
        if (contentBox) {
          contentBox.classList.toggle('open');
          if (chevron) chevron.textContent = contentBox.classList.contains('open') ? '▲' : '▼';
        }
      });
    }

    // Graph Zoom / Pan Controls
    if (zoomInBtn) {
      this._on(zoomInBtn, 'click', () => {
        if (this.graphVisualizer) this.graphVisualizer.zoom(0.8);
      });
    }
    if (zoomOutBtn) {
      this._on(zoomOutBtn, 'click', () => {
        if (this.graphVisualizer) this.graphVisualizer.zoom(1.25);
      });
    }
    if (resetGraphBtn) {
      this._on(resetGraphBtn, 'click', () => {
        if (this.graphVisualizer) this.graphVisualizer.resetView();
      });
    }

    // Tangent Slider
    if (tangentSlider) {
      this._on(tangentSlider, 'input', (e) => {
        const aVal = parseFloat(e.target.value);
        this.currentTangentA = aVal;
        const badge = document.getElementById('calc-tangent-val-badge');
        if (badge) badge.textContent = `a = ${aVal.toFixed(1)}`;
        if (this.graphVisualizer) {
          this.graphVisualizer.setTangentPoint(aVal);
        }
      });
    }

    // Checkbox toggles
    if (chkDerivative) {
      this._on(chkDerivative, 'change', (e) => {
        if (this.graphVisualizer) {
          this.graphVisualizer.updateOptions({ showDerivative: e.target.checked });
        }
      });
    }
    if (chkNormal) {
      this._on(chkNormal, 'change', (e) => {
        if (this.graphVisualizer) {
          this.graphVisualizer.updateOptions({ showNormal: e.target.checked });
        }
      });
    }
  }

  updateOperationChips(inputStr) {
    const chipsContainer = document.getElementById('calc-suggestions-chips');
    if (!chipsContainer) return;

    const detected = CalculusEngine.detectCalculusInput(inputStr);
    const ops = detected.suggestedOperations || ['Differentiate', 'Integrate', 'Plot'];

    chipsContainer.innerHTML = ops.map(op => `
      <button class="calc-op-chip ${this.isOpActive(op, detected) ? 'active' : ''}" data-op="${op}">
        ${op}
      </button>
    `).join('');

    // Attach click events
    chipsContainer.querySelectorAll('.calc-op-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        const op = chip.getAttribute('data-op');
        this.executeOperation(op, detected);
      });
    });
  }

  isOpActive(op, detected) {
    if (op === 'Differentiate' && this.currentAction === 'differentiate') return true;
    if (op === 'Integrate' && this.currentAction === 'integrate') return true;
    if (op === 'Evaluate Limit' && this.currentAction === 'limit') return true;
    if (op === 'Analyze Function' && this.currentAction === 'analyze') return true;
    return false;
  }

  executeOperation(operationName, detected) {
    switch (operationName) {
      case 'Differentiate':
      case 'Derivative':
        this.currentAction = 'differentiate';
        break;
      case 'Integrate':
      case 'Indefinite Integral':
      case 'Definite Integral':
        this.currentAction = 'integrate';
        break;
      case 'Evaluate Limit':
        this.currentAction = 'limit';
        break;
      case 'Analyze Function':
      case 'Critical Points':
      default:
        this.currentAction = 'analyze';
        break;
    }
    this.analyzeCurrentInput(true);
  }

  analyzeCurrentInput(syncGraph = true) {
    const detected = CalculusEngine.detectCalculusInput(this.currentInput);
    this.updateOperationChips(this.currentInput);

    let expr = detected.expr || 'x^2';
    let outcomeTitle = 'Result';
    let outcomeValue = '';
    let outcomeSecondary = '';
    let properties = [];
    let steps = [];
    let formula = '';
    let graphExpr = expr;
    let graphDeriv = null;
    let markers = [];
    let shadeBounds = null;

    try {
      if (detected.type === 'limit' || this.currentAction === 'limit') {
        const c = detected.c !== undefined ? detected.c : 0;
        const res = CalculusEngine.evaluateLimit(expr, c);
        if (res.success) {
          outcomeTitle = `Limit as x → ${c}`;
          outcomeValue = res.result.limitStr;
          outcomeSecondary = `L⁻ = ${res.result.lhl}   |   L⁺ = ${res.result.rhl}`;
          properties = [
            { label: 'Expression', value: res.result.expression },
            { label: 'Approach Point (c)', value: String(c) },
            { label: 'Method', value: res.result.method },
            { label: 'Left-Hand Limit (L⁻)', value: String(res.result.lhl) },
            { label: 'Right-Hand Limit (L⁺)', value: String(res.result.rhl) },
            { label: 'Two-Sided Limit', value: String(res.result.limitValue || 'Does not exist') },
            { label: 'Classification', value: res.result.classification }
          ];
          steps = res.steps;
          formula = res.formula;
        }
      } else if (detected.type === 'indefinite_integral' || (this.currentAction === 'integrate' && detected.type !== 'definite_integral')) {
        const res = CalculusEngine.indefiniteIntegral(expr);
        if (res.success) {
          outcomeTitle = 'Indefinite Integral';
          outcomeValue = res.result.finalResult;
          outcomeSecondary = `Rule: ${res.result.ruleApplied}`;
          properties = [
            { label: 'Integrand', value: res.result.integrand },
            { label: 'Antiderivative F(x)', value: res.result.antiderivative },
            { label: 'Constant of Integration', value: '+ C' },
            { label: 'Rule Applied', value: res.result.ruleApplied }
          ];
          steps = res.steps;
          formula = res.formula;
        }
      } else if (detected.type === 'definite_integral') {
        const a = detected.a !== undefined ? detected.a : 0;
        const b = detected.b !== undefined ? detected.b : 2;
        const res = CalculusEngine.definiteIntegral(expr, a, b);
        if (res.success) {
          outcomeTitle = `Definite Integral [${a}, ${b}]`;
          outcomeValue = this.isExactMode ? res.result.exactValue : String(res.result.decimalValue);
          outcomeSecondary = `Exact: ${res.result.exactValue}   |   Decimal: ${res.result.decimalValue}`;
          properties = [
            { label: 'Integrand f(x)', value: res.result.expression },
            { label: 'Lower Bound (a)', value: String(a) },
            { label: 'Upper Bound (b)', value: String(b) },
            { label: 'Antiderivative F(x)', value: res.result.antiderivative },
            { label: 'Exact Result', value: res.result.exactValue },
            { label: 'Decimal Approximation', value: String(res.result.decimalValue) },
            { label: 'Signed Area', value: String(res.result.signedArea) }
          ];
          steps = res.steps;
          formula = res.formula;
          shadeBounds = { a, b, type: 'under' };
        }
      } else if (detected.type === 'differential_equation') {
        // Differential Equation
        const isLinear = expr.includes('+') && expr.includes('y');
        const odeType = isLinear ? 'linear' : 'direct';
        const fx = expr.replace(/^dy\/dx\s*=\s*/i, '').trim();
        const res = CalculusEngine.solveDifferentialEquation(odeType, { fx: fx || '2x' });
        if (res.success) {
          outcomeTitle = 'General Solution';
          outcomeValue = res.result.generalSol;
          outcomeSecondary = `Order: ${res.result.order}   |   Degree: ${res.result.degree}`;
          properties = [
            { label: 'Differential Equation', value: expr },
            { label: 'ODE Type', value: res.result.odeType },
            { label: 'Order', value: String(res.result.order) },
            { label: 'Degree', value: String(res.result.degree) },
            { label: 'General Solution', value: res.result.generalSol }
          ];
          steps = res.steps;
          formula = res.formula;
        }
      } else if (this.currentAction === 'differentiate' || detected.type === 'derivative') {
        const order = detected.order || 1;
        const res = CalculusEngine.differentiate(expr, order, this.currentTangentA);
        if (res.success) {
          outcomeTitle = order === 1 ? "First Derivative f'(x)" : `Derivative Order #${order}`;
          outcomeValue = res.result.nthDerivative;
          outcomeSecondary = `At x = ${this.currentTangentA}: slope m = ${res.result.evalResult !== null ? res.result.evalResult : '—'}`;
          properties = [
            { label: 'Function f(x)', value: res.result.expression },
            { label: "First Derivative f'(x)", value: res.result.firstDerivative },
            ...(res.result.secondDerivative ? [{ label: "Second Derivative f''(x)", value: res.result.secondDerivative }] : []),
            { label: `Slope at x = ${this.currentTangentA}`, value: String(res.result.evalResult) }
          ];
          steps = res.steps;
          formula = res.formula;
          graphDeriv = res.result.firstDerivative;
        }
      } else {
        // Complete Function Analysis Lab (Default)
        const dRes = CalculusEngine.differentiate(expr, 2, this.currentTangentA);
        const extRes = CalculusEngine.extremaAndMonotonicity(expr, -4.5, 4.5);
        const tanRes = CalculusEngine.tangentAndNormal(expr, this.currentTangentA);

        outcomeTitle = "Analysis: f'(x) & Tangent";
        outcomeValue = dRes.success ? dRes.result.firstDerivative : 'f(x)';
        outcomeSecondary = tanRes.success ? `Tangent at x=${this.currentTangentA}: ${tanRes.result.tangentEq}` : '';

        const crits = extRes.success ? extRes.result.criticalPoints : [];
        markers = crits.map(c => ({ x: c.x, y: c.y, label: c.type, type: c.type }));

        properties = [
          { label: 'Function f(x)', value: expr },
          { label: "First Derivative f'(x)", value: dRes.success ? dRes.result.firstDerivative : '—' },
          { label: "Second Derivative f''(x)", value: dRes.success ? dRes.result.secondDerivative : '—' },
          { label: `Tangent at x = ${this.currentTangentA}`, value: tanRes.success ? tanRes.result.tangentEq : '—' },
          { label: `Normal at x = ${this.currentTangentA}`, value: tanRes.success ? tanRes.result.normalEq : '—' },
          { label: 'Critical Points', value: crits.length > 0 ? crits.map(c => `(${c.x}, ${c.y}) [${c.type}]`).join(', ') : 'None in range' }
        ];

        steps = [
          ...(dRes.success ? dRes.steps : []),
          ...(tanRes.success ? tanRes.steps.slice(3) : []),
          ...(extRes.success ? extRes.steps.slice(3) : [])
        ];
        formula = dRes.success ? dRes.formula : '';
        graphDeriv = dRes.success ? dRes.result.firstDerivative : null;
      }
    } catch (err) {
      outcomeTitle = 'Error';
      outcomeValue = 'Invalid expression';
      outcomeSecondary = err.message || 'Check mathematical syntax';
      steps = [`Error evaluating expression: ${err.message}`];
    }

    this.currentResultData = {
      outcomeTitle,
      outcomeValue,
      outcomeSecondary,
      properties,
      steps,
      formula
    };

    // Update DOM
    this.refreshResultDisplay();
    this.renderStepByStep(steps, formula);

    // Sync Graph
    if (syncGraph && this.graphVisualizer) {
      const funcLabel = document.getElementById('calc-graph-func-label');
      if (funcLabel) funcLabel.textContent = `Plotting: ${graphExpr}`;

      this.graphVisualizer.updateOptions({
        exprStr: graphExpr,
        derivStr: graphDeriv,
        tangentX0: this.currentTangentA,
        markers,
        shadeBounds
      });
    }

    // Save to OG Store History
    store.addHistoryItem({
      expression: this.currentInput,
      result: outcomeValue,
      module: 'Calculus',
      operation: detected.type
    });
  }

  refreshResultDisplay() {
    if (!this.currentResultData) return;
    const { outcomeTitle, outcomeValue, outcomeSecondary, properties } = this.currentResultData;

    const labelEl = document.getElementById('calc-outcome-label');
    const valEl = document.getElementById('calc-outcome-value');
    const secEl = document.getElementById('calc-outcome-secondary');
    const propContainer = document.getElementById('calc-properties-container');

    if (labelEl) labelEl.textContent = outcomeTitle;
    if (valEl) valEl.textContent = outcomeValue;
    if (secEl) secEl.textContent = outcomeSecondary;

    if (propContainer) {
      propContainer.innerHTML = properties.map(p => `
        <div class="calc-property-row">
          <span class="calc-prop-label">${p.label}</span>
          <span class="calc-prop-value">${p.value}</span>
        </div>
      `).join('');
    }
  }

  renderStepByStep(steps = [], formula = '') {
    const rawContainer = document.getElementById('calc-raw-steps-list');
    const probEl = document.getElementById('step-node-problem');
    const idEl = document.getElementById('step-node-identification');
    const formEl = document.getElementById('step-node-formula');
    const subEl = document.getElementById('step-node-substitution');
    const calcEl = document.getElementById('step-node-calculation');
    const simpEl = document.getElementById('step-node-simplification');
    const finalEl = document.getElementById('step-node-final');

    if (steps.length === 0) {
      if (rawContainer) rawContainer.innerHTML = '<p class="calc-no-steps">Symbolic step solution is not currently supported for this expression.</p>';
      return;
    }

    // Map into the 7 standard stages
    if (probEl) probEl.textContent = steps[0] || 'Target Calculus Problem';
    if (idEl) idEl.textContent = steps[1] || 'Identify calculus rule / method';
    if (formEl) formEl.textContent = formula || steps[2] || 'Standard theorem or formula';
    if (subEl) subEl.textContent = steps[3] || 'Substitute values / variables';
    if (calcEl) calcEl.textContent = steps[4] || 'Compute intermediate derivatives / limits';
    if (simpEl) simpEl.textContent = steps[5] || 'Simplify algebraic terms';
    if (finalEl) finalEl.textContent = steps[steps.length - 1] || 'Final Verified Result';

    if (rawContainer) {
      rawContainer.innerHTML = `
        <div class="calc-raw-steps-header">Detailed Step Log:</div>
        <ol class="calc-raw-steps-ol">
          ${steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      `;
    }
  }
}
