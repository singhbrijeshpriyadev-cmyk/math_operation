/**
 * OG - Dedicated Calculus Tools & Laboratories Workspace
 * Complete dedicated interactive workbenches for all 14 Calculus modules & tools:
 * 01. Limits
 * 02. Derivatives
 * 03. Continuity
 * 04. Differentiability
 * 05. Applications of Derivatives
 * 06. Integrals
 * 07. Applications of Integrals
 * 08. Differential Equations
 * 09. Calculus Graphing Lab
 * 10. Calculus Formula Library
 * 11. Calculus Step Solver
 * 12. Calculus Practice Lab
 * 13. Numerical Calculus Lab
 * 14. Calculus Calculator
 *
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';

const TOOLS_CONFIG = [
  { id: 'limits',                 num: '01', title: 'Limits',                    icon: 'lim' },
  { id: 'derivatives',            num: '02', title: 'Derivatives',               icon: '∂' },
  { id: 'continuity',             num: '03', title: 'Continuity',                icon: 'C' },
  { id: 'differentiability',      num: '04', title: 'Differentiability',         icon: 'D' },
  { id: 'applications-derivatives',num: '05',title: 'Applications of Derivatives',icon: '📈' },
  { id: 'integrals',              num: '06', title: 'Integrals',                 icon: '∫' },
  { id: 'applications-integrals', num: '07', title: 'Applications of Integrals', icon: '∯' },
  { id: 'differential-equations', num: '08', title: 'Differential Equations',    icon: 'dy' },
  { id: 'graphing-lab',           num: '09', title: 'Calculus Graphing Lab',     icon: '📊' },
  { id: 'formula-library',        num: '10', title: 'Calculus Formula Library',  icon: '📚' },
  { id: 'step-solver',            num: '11', title: 'Calculus Step Solver',      icon: '⚡' },
  { id: 'practice-lab',           num: '12', title: 'Calculus Practice Lab',     icon: '🧠' },
  { id: 'numerical-lab',          num: '13', title: 'Numerical Calculus Lab',    icon: '🔢' },
  { id: 'calculator',             num: '14', title: 'Calculus Calculator',       icon: '🧮' }
];

const FORMULA_DATABASE = [
  // Limits
  { cat: 'Limits', name: 'Standard Trig Limit', formula: 'lim(x→0) sin(x)/x = 1', exp: 'Fundamental trigonometric limit based on squeeze theorem.', ex: 'lim(x→0) sin(3x)/x = 3', mod: 'Module #12' },
  { cat: 'Limits', name: 'Standard Exponential Limit', formula: 'lim(x→0) (eˣ - 1)/x = 1', exp: 'Derivative of eˣ at x = 0.', ex: 'lim(x→0) (e^(2x) - 1)/x = 2', mod: 'Module #12' },
  { cat: 'Limits', name: 'Power Limit Theorem', formula: 'lim(x→a) (xⁿ - aⁿ)/(x - a) = n·aⁿ⁻¹', exp: 'Algebraic limit for powers of polynomials.', ex: 'lim(x→2) (x³ - 8)/(x - 2) = 12', mod: 'Module #12' },
  { cat: 'Limits', name: 'Limit at Infinity Reciprocal', formula: 'lim(x→∞) 1/xⁿ = 0  (n > 0)', exp: 'Reciprocal decay towards zero as x grows unboundedly.', ex: 'lim(x→∞) 1/x² = 0', mod: 'Module #12' },

  // Derivatives
  { cat: 'Derivatives', name: 'Power Rule', formula: 'd/dx [xⁿ] = n·xⁿ⁻¹', exp: 'Differentiating polynomial monomials.', ex: 'd/dx [x³] = 3x²', mod: 'Module #12' },
  { cat: 'Derivatives', name: 'Product Rule', formula: 'd/dx [u·v] = u\'·v + u·v\'', exp: 'Derivative of product of two functions.', ex: 'd/dx [(x²+1)(x³-2)] = 5x⁴ + 3x² - 4x', mod: 'Module #12' },
  { cat: 'Derivatives', name: 'Quotient Rule', formula: "d/dx [u/v] = (u'·v - u·v') / v²", exp: 'Derivative of rational combination.', ex: "d/dx [x/(x+1)] = 1/(x+1)²", mod: 'Module #12' },
  { cat: 'Derivatives', name: 'Chain Rule', formula: "d/dx [f(g(x))] = f'(g(x)) · g'(x)", exp: 'Derivative of composed functions.', ex: 'd/dx [sin(x²)] = 2x·cos(x²)', mod: 'Module #18' },
  { cat: 'Derivatives', name: 'Exponential Derivative', formula: 'd/dx [eˣ] = eˣ', exp: 'The exponential function is its own derivative.', ex: 'd/dx [e^(3x)] = 3e^(3x)', mod: 'Module #18' },
  { cat: 'Derivatives', name: 'Natural Logarithm Derivative', formula: 'd/dx [ln(x)] = 1/x  (x > 0)', exp: 'Derivative of log base e.', ex: 'd/dx [ln(2x)] = 1/x', mod: 'Module #18' },

  // Integrals
  { cat: 'Integrals', name: 'Power Rule for Integrals', formula: '∫ xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ -1)', exp: 'Standard monomial antiderivative.', ex: '∫ x² dx = x³/3 + C', mod: 'Module #20' },
  { cat: 'Integrals', name: 'Reciprocal Integral', formula: '∫ 1/x dx = ln|x| + C', exp: 'Logarithmic antiderivative of 1/x.', ex: '∫ 3/x dx = 3·ln|x| + C', mod: 'Module #20' },
  { cat: 'Integrals', name: 'Sine Integral', formula: '∫ sin(x) dx = -cos(x) + C', exp: 'Standard trigonometric antiderivative.', ex: '∫ sin(2x) dx = -cos(2x)/2 + C', mod: 'Module #20' },
  { cat: 'Integrals', name: 'Cosine Integral', formula: '∫ cos(x) dx = sin(x) + C', exp: 'Standard trigonometric antiderivative.', ex: '∫ cos(x) dx = sin(x) + C', mod: 'Module #20' },
  { cat: 'Integrals', name: 'Fundamental Theorem of Calculus', formula: '∫ₐᵇ f(x) dx = F(b) - F(a)', exp: 'Evaluates definite integral using antiderivative F(x).', ex: '∫₀² x² dx = 8/3 - 0 = 8/3', mod: 'Module #20' },
  { cat: 'Integrals', name: 'Integration by Parts', formula: '∫ u dv = u·v - ∫ v du', exp: 'Product rule inverted for integration.', ex: '∫ x·eˣ dx = (x - 1)eˣ + C', mod: 'Module #20' },

  // Differential Equations
  { cat: 'Differential Equations', name: 'Separation of Variables', formula: 'dy/dx = g(x)·h(y) ⟹ (1/h(y)) dy = g(x) dx', exp: 'Separating differential variables into single-variable integrals.', ex: 'dy/dx = 2x ⟹ y = x² + C', mod: 'Module #22' },
  { cat: 'Differential Equations', name: 'First-Order Linear ODE', formula: 'dy/dx + P(x)y = Q(x)', exp: 'Standard first order linear differential equation.', ex: 'dy/dx + y = 2 ⟹ y = 2 + C·e⁻ˣ', mod: 'Module #22' },
  { cat: 'Differential Equations', name: 'Integrating Factor (IF)', formula: 'IF = e^(∫ P(x) dx)', exp: 'Multiplier that converts left-hand side into product derivative.', ex: 'P = 1 ⟹ IF = eˣ', mod: 'Module #22' },

  // Applications
  { cat: 'Applications', name: 'Tangent Line Equation', formula: "y - y₀ = f'(x₀) · (x - x₀)", exp: 'Point-slope equation of tangent at (x₀, y₀).', ex: 'f(x)=x² at x=2 ⟹ y - 4 = 4(x - 2)', mod: 'Module #19' },
  { cat: 'Applications', name: 'Normal Line Equation', formula: "y - y₀ = -1/f'(x₀) · (x - x₀)", exp: 'Perpendicular line to curve at point of contact.', ex: 'f(x)=x² at x=2 ⟹ y - 4 = -1/4(x - 2)', mod: 'Module #19' },
  { cat: 'Applications', name: 'First Derivative Test', formula: "f'(c) = 0, f'(x) changes + to - ⟹ Local Max", exp: 'Determines local maxima and minima.', ex: 'f(x)=x³-3x ⟹ x=-1 is Local Max', mod: 'Module #19' },
  { cat: 'Applications', name: 'Second Derivative Test', formula: "f'(c) = 0: f''(c) > 0 ⟹ Min, f''(c) < 0 ⟹ Max", exp: 'Concavity test at stationary critical point.', ex: "f''(1) = 6 > 0 ⟹ Local Min", mod: 'Module #19' },
  { cat: 'Applications', name: 'Area Between Curves', formula: 'Area = ∫ₐᵇ |f(x) - g(x)| dx', exp: 'Enclosed geometric area between two bounding curves.', ex: 'y=x² and y=4 ⟹ Area = 32/3', mod: 'Module #21' }
];

export class CalculusToolsView {
  constructor(container, initialTool = 'limits') {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.currentTool = this._resolveTool(initialTool);
    this.graphVisualizer = null;
    this._listeners = [];
  }

  _resolveTool(id) {
    const valid = TOOLS_CONFIG.find(t => t.id === id);
    return valid ? valid.id : 'limits';
  }

  mount() {
    this.render();
    this._attachListeners();
    this._initToolWorkspace();
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
    const activeToolConfig = TOOLS_CONFIG.find(t => t.id === this.currentTool) || TOOLS_CONFIG[0];

    this.container.innerHTML = `
      <div class="calc-workspace view-animate-in">

        <!-- Top Breadcrumb & Switcher -->
        <div class="calc-tools-header">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <a href="#/calculus" class="calc-breadcrumb-link">Calculus Workspace</a>
            <span class="calc-breadcrumb-sep">/</span>
            <span class="calc-breadcrumb-current">${activeToolConfig.title}</span>
          </div>
          <h1 class="calc-title">${activeToolConfig.title.toUpperCase()}</h1>
          <p class="calc-subtitle">Laboratory & interactive calculus workbench #${activeToolConfig.num}</p>
        </div>

        <!-- Horizontal Tool Selector Tabs -->
        <nav class="calc-tools-tab-bar" aria-label="Calculus Tools Navigation">
          ${TOOLS_CONFIG.map(t => `
            <a href="#/calculus-tools/${t.id}" class="calc-tool-tab ${t.id === this.currentTool ? 'active' : ''}">
              <span class="calc-tab-icon">${t.icon}</span>
              <span class="calc-tab-text">${t.title}</span>
            </a>
          `).join('')}
        </nav>

        <!-- Main Dedicated Tool Body Container -->
        <div id="calc-tool-body-container" class="calc-tool-body">
          <!-- Dynamically populated by _initToolWorkspace -->
        </div>

      </div>
    `;
  }

  _attachListeners() {
    // Navigation tab switching without full reload
    const tabs = this.container.querySelectorAll('.calc-tool-tab');
    tabs.forEach(tab => {
      this._on(tab, 'click', (e) => {
        const href = tab.getAttribute('href') || '';
        const id = href.replace('#/calculus-tools/', '');
        if (id && id !== this.currentTool) {
          this.currentTool = id;
          window.location.hash = href;
          this.mount();
        }
      });
    });
  }

  _initToolWorkspace() {
    const body = document.getElementById('calc-tool-body-container');
    if (!body) return;

    switch (this.currentTool) {
      case 'limits':
        this._renderLimitsTool(body);
        break;
      case 'derivatives':
        this._renderDerivativesTool(body);
        break;
      case 'continuity':
        this._renderContinuityTool(body);
        break;
      case 'differentiability':
        this._renderDifferentiabilityTool(body);
        break;
      case 'applications-derivatives':
        this._renderApplicationsDerivativesTool(body);
        break;
      case 'integrals':
        this._renderIntegralsTool(body);
        break;
      case 'applications-integrals':
        this._renderApplicationsIntegralsTool(body);
        break;
      case 'differential-equations':
        this._renderDifferentialEquationsTool(body);
        break;
      case 'graphing-lab':
        this._renderGraphingLabTool(body);
        break;
      case 'formula-library':
        this._renderFormulaLibraryTool(body);
        break;
      case 'step-solver':
        this._renderStepSolverTool(body);
        break;
      case 'practice-lab':
        this._renderPracticeLabTool(body);
        break;
      case 'numerical-lab':
        this._renderNumericalLabTool(body);
        break;
      case 'calculator':
      default:
        this._renderCalculatorTool(body);
        break;
    }
  }

  // ==========================================================================
  // TOOL 01: LIMITS
  // ==========================================================================
  _renderLimitsTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">01. Complete Limit Calculator</h2>
        <p class="calc-tool-desc">Evaluate two-sided limits, Left-Hand Limit (L⁻), Right-Hand Limit (L⁺), finite/infinite approaches, and algebraic factoring.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Target Function f(x):</label>
            <input type="text" id="lim-input-expr" class="glass-input" value="(x^2 - 4)/(x - 2)">
          </div>
          <div class="calc-field-group" style="max-width: 160px;">
            <label class="calc-label">Approach Point x → c:</label>
            <input type="text" id="lim-input-c" class="glass-input" value="2">
          </div>
          <button id="btn-eval-limit" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Evaluate Limit</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-expr="(x^2 - 4)/(x - 2)" data-c="2">(x² - 4)/(x - 2) at 2</button>
          <button class="calc-preset-chip" data-expr="sin(x)/x" data-c="0">sin(x)/x at 0</button>
          <button class="calc-preset-chip" data-expr="1/x" data-c="0">1/x at 0</button>
          <button class="calc-preset-chip" data-expr="1/x" data-c="inf">1/x at ∞</button>
          <button class="calc-preset-chip" data-expr="(x^2 + 3*x)/x" data-c="0">(x² + 3x)/x at 0</button>
        </div>

        <div id="lim-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-limit');
    const exprInput = container.querySelector('#lim-input-expr');
    const cInput = container.querySelector('#lim-input-c');
    const outBox = container.querySelector('#lim-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const cStr = cInput.value.trim();
      const cVal = (cStr === 'inf' || cStr === '∞') ? Infinity : (cStr === '-inf' || cStr === '-∞') ? -Infinity : parseFloat(cStr) || 0;
      const res = CalculusEngine.evaluateLimit(expr, cVal);

      if (res.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">Two-Sided Limit Result</span>
            <div class="calc-outcome-value">${res.result.limitStr}</div>
            <div class="calc-outcome-secondary">Classification: ${res.result.classification} | Method: ${res.result.method}</div>
          </div>

          <div class="calc-properties-list" style="margin-top: 16px;">
            <div class="calc-property-row"><span class="calc-prop-label">Left-Hand Limit (L⁻)</span><span class="calc-prop-value">${res.result.lhl}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Right-Hand Limit (L⁺)</span><span class="calc-prop-value">${res.result.rhl}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Condition L⁻ = L⁺</span><span class="calc-prop-value">${res.result.limitExists ? 'Satisfied' : 'Not Satisfied'}</span></div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Step-by-Step Derivation:</div>
            <ol class="calc-raw-steps-ol">${res.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        exprInput.value = chip.getAttribute('data-expr');
        cInput.value = chip.getAttribute('data-c');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 02: DERIVATIVES
  // ==========================================================================
  _renderDerivativesTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">02. Symbolic Derivative Engine</h2>
        <p class="calc-tool-desc">First, second, and higher derivatives with Product Rule, Quotient Rule, Chain Rule, and tangent slope.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Function f(x):</label>
            <input type="text" id="deriv-input-expr" class="glass-input" value="(x^2 + 1)*(x^3 - 2)">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Order (n):</label>
            <select id="deriv-input-order" class="glass-input">
              <option value="1" selected>1 (f')</option>
              <option value="2">2 (f'')</option>
              <option value="3">3 (f''')</option>
            </select>
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Evaluate at x = a:</label>
            <input type="number" id="deriv-input-eval" class="glass-input" value="1">
          </div>
          <button id="btn-eval-deriv" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Differentiate</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-expr="(x^2 + 1)*(x^3 - 2)">Product: (x²+1)(x³-2)</button>
          <button class="calc-preset-chip" data-expr="sin(x^2)">Chain: sin(x²)</button>
          <button class="calc-preset-chip" data-expr="x^2 + 3*x">x² + 3x</button>
          <button class="calc-preset-chip" data-expr="exp(x)">eˣ</button>
          <button class="calc-preset-chip" data-expr="ln(x)">ln(x)</button>
        </div>

        <div id="deriv-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-deriv');
    const exprInput = container.querySelector('#deriv-input-expr');
    const orderInput = container.querySelector('#deriv-input-order');
    const evalInput = container.querySelector('#deriv-input-eval');
    const outBox = container.querySelector('#deriv-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const order = parseInt(orderInput.value, 10) || 1;
      const evalX = evalInput.value !== '' ? parseFloat(evalInput.value) : null;
      const res = CalculusEngine.differentiate(expr, order, evalX);

      if (res.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">${res.result.order === 1 ? "f'(x)" : `Derivative Order #${res.result.order}`}</span>
            <div class="calc-outcome-value">${res.result.nthDerivative}</div>
            <div class="calc-outcome-secondary">${res.result.evalTangentInterpretation || ''}</div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Step-by-Step Derivation:</div>
            <ol class="calc-raw-steps-ol">${res.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        exprInput.value = chip.getAttribute('data-expr');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 03: CONTINUITY
  // ==========================================================================
  _renderContinuityTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">03. Continuity Analyzer</h2>
        <p class="calc-tool-desc">Verify continuity at x = a: Checks Left-Hand Limit, Right-Hand Limit, and function value f(a) against LHL = RHL = f(a).</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Function f(x):</label>
            <input type="text" id="cont-input-expr" class="glass-input" value="x^2">
          </div>
          <div class="calc-field-group" style="max-width: 160px;">
            <label class="calc-label">Test Point x = a:</label>
            <input type="number" id="cont-input-a" class="glass-input" value="2">
          </div>
          <button id="btn-eval-cont" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Test Continuity</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-expr="x^2" data-a="2">f(x) = x² at x=2</button>
          <button class="calc-preset-chip" data-expr="abs(x)" data-a="0">f(x) = |x| at x=0</button>
          <button class="calc-preset-chip" data-expr="(x^2 - 4)/(x - 2)" data-a="2">(x²-4)/(x-2) at x=2 (Hole)</button>
          <button class="calc-preset-chip" data-expr="1/x" data-a="0">1/x at x=0 (Infinite)</button>
        </div>

        <div id="cont-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-cont');
    const exprInput = container.querySelector('#cont-input-expr');
    const aInput = container.querySelector('#cont-input-a');
    const outBox = container.querySelector('#cont-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const a = parseFloat(aInput.value) || 0;
      const res = CalculusEngine.checkContinuity(expr, a);

      if (res.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">Continuity Verdict</span>
            <div class="calc-outcome-value">${res.result.isContinuous ? 'Continuous at x = ' + a : 'Discontinuous at x = ' + a}</div>
            <div class="calc-outcome-secondary">${res.result.classification} | LHL: ${res.result.lhl}, RHL: ${res.result.rhl}, f(${a}): ${res.result.fValue !== null ? res.result.fValue : 'Undefined'}</div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Continuity Test Steps:</div>
            <ol class="calc-raw-steps-ol">${res.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        exprInput.value = chip.getAttribute('data-expr');
        aInput.value = chip.getAttribute('data-a');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 04: DIFFERENTIABILITY
  // ==========================================================================
  _renderDifferentiabilityTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">04. Differentiability Analyzer</h2>
        <p class="calc-tool-desc">Verify differentiability at x = a: Computes Left Derivative (LHD) and Right Derivative (RHD). Differentiability implies continuity, but continuity does not imply differentiability.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Function f(x):</label>
            <input type="text" id="diff-input-expr" class="glass-input" value="abs(x)">
          </div>
          <div class="calc-field-group" style="max-width: 160px;">
            <label class="calc-label">Test Point x = a:</label>
            <input type="number" id="diff-input-a" class="glass-input" value="0">
          </div>
          <button id="btn-eval-diff" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Test Differentiability</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-expr="abs(x)" data-a="0">|x| at x=0 (Corner)</button>
          <button class="calc-preset-chip" data-expr="x^2" data-a="0">x² at x=0 (Smooth)</button>
          <button class="calc-preset-chip" data-expr="x^3" data-a="0">x³ at x=0 (Inflexion)</button>
          <button class="calc-preset-chip" data-expr="sin(x)" data-a="0">sin(x) at x=0</button>
        </div>

        <div id="diff-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-diff');
    const exprInput = container.querySelector('#diff-input-expr');
    const aInput = container.querySelector('#diff-input-a');
    const outBox = container.querySelector('#diff-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const a = parseFloat(aInput.value) || 0;
      const res = CalculusEngine.checkDifferentiability(expr, a);

      if (res.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">Differentiability Verdict</span>
            <div class="calc-outcome-value">${res.result.isDifferentiable ? 'Differentiable at x = ' + a : 'NOT Differentiable at x = ' + a}</div>
            <div class="calc-outcome-secondary">${res.result.explanation}</div>
          </div>

          <div class="calc-properties-list" style="margin-top: 16px;">
            <div class="calc-property-row"><span class="calc-prop-label">Left Derivative (LHD)</span><span class="calc-prop-value">${res.result.lhd}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Right Derivative (RHD)</span><span class="calc-prop-value">${res.result.rhd}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Continuous at Point</span><span class="calc-prop-value">${res.result.isContinuous ? 'Yes' : 'No'}</span></div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Differentiability Verification Steps:</div>
            <ol class="calc-raw-steps-ol">${res.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        exprInput.value = chip.getAttribute('data-expr');
        aInput.value = chip.getAttribute('data-a');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 05: APPLICATIONS OF DERIVATIVES
  // ==========================================================================
  _renderApplicationsDerivativesTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">05. Applications of Derivatives Lab</h2>
        <p class="calc-tool-desc">Analyze monotonicity, stationary critical points, local extrema (1st and 2nd derivative tests), concavity, and optimization on an interval.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Function f(x):</label>
            <input type="text" id="app-input-expr" class="glass-input" value="x^3 - 3*x">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Range [a, b]: Min:</label>
            <input type="number" id="app-input-min" class="glass-input" value="-4">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Max:</label>
            <input type="number" id="app-input-max" class="glass-input" value="4">
          </div>
          <button id="btn-eval-app" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Analyze Function</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-expr="x^3 - 3*x">x³ - 3x (Cubic Extrema)</button>
          <button class="calc-preset-chip" data-expr="x^4 - 4*x^2">x⁴ - 4x² (Double Well)</button>
          <button class="calc-preset-chip" data-expr="x^2 + 3*x">x² + 3x (Parabola Min)</button>
        </div>

        <div id="app-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-app');
    const exprInput = container.querySelector('#app-input-expr');
    const minInput = container.querySelector('#app-input-min');
    const maxInput = container.querySelector('#app-input-max');
    const outBox = container.querySelector('#app-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const min = parseFloat(minInput.value) || -4;
      const max = parseFloat(maxInput.value) || 4;
      const extRes = CalculusEngine.extremaAndMonotonicity(expr, min, max);
      const optRes = CalculusEngine.optimizeFunction(expr, min, max);

      if (extRes.success && optRes.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">Global Extrema on [${min}, ${max}]</span>
            <div class="calc-outcome-value">Max: ${optRes.result.globalMax.y} | Min: ${optRes.result.globalMin.y}</div>
            <div class="calc-outcome-secondary">Max at x = ${optRes.result.globalMax.x} | Min at x = ${optRes.result.globalMin.x}</div>
          </div>

          <div class="calc-properties-list" style="margin-top: 16px;">
            <div class="calc-property-row"><span class="calc-prop-label">First Derivative f'(x)</span><span class="calc-prop-value">${extRes.result.firstDerivative}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Second Derivative f''(x)</span><span class="calc-prop-value">${extRes.result.secondDerivative}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Critical Points</span><span class="calc-prop-value">${extRes.result.criticalPoints.map(c => `(${c.x}, ${c.y}) [${c.type}]`).join(' | ') || 'None'}</span></div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Monotonicity & Extrema Steps:</div>
            <ol class="calc-raw-steps-ol">${extRes.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        exprInput.value = chip.getAttribute('data-expr');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 06: INTEGRALS
  // ==========================================================================
  _renderIntegralsTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">06. Integration Engine</h2>
        <p class="calc-tool-desc">Indefinite integrals with exact fraction antiderivatives (+ C) and definite integrals with exact fractions (e.g. 8/3) and decimal modes.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Integrand f(x):</label>
            <input type="text" id="int-input-expr" class="glass-input" value="x^2">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Lower Bound (a):</label>
            <input type="number" id="int-input-a" class="glass-input" value="0">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Upper Bound (b):</label>
            <input type="number" id="int-input-b" class="glass-input" value="2">
          </div>
          <button id="btn-eval-int" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Integrate</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-expr="x^2" data-a="0" data-b="2">∫₀² x² dx (8/3)</button>
          <button class="calc-preset-chip" data-expr="sin(x)" data-a="0" data-b="3.14159">∫₀^π sin(x) dx (2)</button>
          <button class="calc-preset-chip" data-expr="x^2 + 3*x + 2" data-a="0" data-b="1">∫₀¹ (x²+3x+2) dx</button>
          <button class="calc-preset-chip" data-expr="exp(x)" data-a="0" data-b="1">∫₀¹ eˣ dx</button>
        </div>

        <div id="int-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-int');
    const exprInput = container.querySelector('#int-input-expr');
    const aInput = container.querySelector('#int-input-a');
    const bInput = container.querySelector('#int-input-b');
    const outBox = container.querySelector('#int-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const a = parseFloat(aInput.value) || 0;
      const b = parseFloat(bInput.value) || 1;
      const indefRes = CalculusEngine.indefiniteIntegral(expr);
      const defRes = CalculusEngine.definiteIntegral(expr, a, b);

      if (indefRes.success && defRes.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">Indefinite & Definite Outcome</span>
            <div class="calc-outcome-value">∫ f(x) dx = ${indefRes.result.finalResult}</div>
            <div class="calc-outcome-secondary">Definite [${a}, ${b}] => Exact: ${defRes.result.exactValue} | Decimal: ${defRes.result.decimalValue}</div>
          </div>

          <div class="calc-properties-list" style="margin-top: 16px;">
            <div class="calc-property-row"><span class="calc-prop-label">Integrand</span><span class="calc-prop-value">${expr}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Antiderivative F(x)</span><span class="calc-prop-value">${indefRes.result.antiderivative}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Definite Exact Value</span><span class="calc-prop-value">${defRes.result.exactValue}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Definite Decimal Value</span><span class="calc-prop-value">${defRes.result.decimalValue}</span></div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Definite Integral Fundamental Theorem Steps:</div>
            <ol class="calc-raw-steps-ol">${defRes.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        exprInput.value = chip.getAttribute('data-expr');
        aInput.value = chip.getAttribute('data-a');
        bInput.value = chip.getAttribute('data-b');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 07: APPLICATIONS OF INTEGRALS
  // ==========================================================================
  _renderApplicationsIntegralsTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">07. Area Calculator (Applications of Integrals)</h2>
        <p class="calc-tool-desc">Calculate geometric enclosed area under a curve or between two intersecting curves (e.g. y = x² and y = 4).</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Upper Curve y₁ = f(x):</label>
            <input type="text" id="area-input-f" class="glass-input" value="4">
          </div>
          <div class="calc-field-group">
            <label class="calc-label">Lower Curve y₂ = g(x):</label>
            <input type="text" id="area-input-g" class="glass-input" value="x^2">
          </div>
          <button id="btn-eval-area" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Find Bounded Area</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-f="4" data-g="x^2">y = 4 and y = x² (32/3)</button>
          <button class="calc-preset-chip" data-f="x" data-g="x^2">y = x and y = x² (1/6)</button>
          <button class="calc-preset-chip" data-f="sin(x)" data-g="0">y = sin(x) and x-axis on [0, π]</button>
        </div>

        <div id="area-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-area');
    const fInput = container.querySelector('#area-input-f');
    const gInput = container.querySelector('#area-input-g');
    const outBox = container.querySelector('#area-output-box');

    const runEval = () => {
      const f = fInput.value;
      const g = gInput.value;
      const res = CalculusEngine.areaBetweenCurves(f, g);

      if (res.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">Enclosed Bounded Area</span>
            <div class="calc-outcome-value">${res.result.exactArea} sq units</div>
            <div class="calc-outcome-secondary">Intersection Interval: x ∈ [${res.result.a}, ${res.result.b}] | Decimal: ${res.result.area}</div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Area Derivation Steps:</div>
            <ol class="calc-raw-steps-ol">${res.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        fInput.value = chip.getAttribute('data-f');
        gInput.value = chip.getAttribute('data-g');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 08: DIFFERENTIAL EQUATIONS
  // ==========================================================================
  _renderDifferentialEquationsTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">08. Differential Equations Workspace</h2>
        <p class="calc-tool-desc">Identify order and degree, solve separable ODEs (dy/dx = f(x)), growth/decay (dy/dx = ky), and first-order linear equations (dy/dx + Py = Q).</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Differential Equation:</label>
            <input type="text" id="ode-input-expr" class="glass-input" value="dy/dx = 2x">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Initial x₀:</label>
            <input type="number" id="ode-input-x0" class="glass-input" value="0">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Initial y₀:</label>
            <input type="number" id="ode-input-y0" class="glass-input" value="1">
          </div>
          <button id="btn-eval-ode" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Solve ODE</span>
          </button>
        </div>

        <div class="calc-preset-bar">
          <button class="calc-preset-chip" data-expr="dy/dx = 2x" data-x0="0" data-y0="1">dy/dx = 2x</button>
          <button class="calc-preset-chip" data-expr="dy/dx = 3y" data-x0="0" data-y0="5">dy/dx = 3y (Growth)</button>
          <button class="calc-preset-chip" data-expr="dy/dx + y = 2" data-x0="0" data-y0="4">dy/dx + y = 2 (Linear)</button>
        </div>

        <div id="ode-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-ode');
    const exprInput = container.querySelector('#ode-input-expr');
    const x0Input = container.querySelector('#ode-input-x0');
    const y0Input = container.querySelector('#ode-input-y0');
    const outBox = container.querySelector('#ode-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const x0 = x0Input.value !== '' ? parseFloat(x0Input.value) : undefined;
      const y0 = y0Input.value !== '' ? parseFloat(y0Input.value) : undefined;

      let odeType = 'direct';
      let params = { x0, y0 };

      if (expr.includes('dy/dx +') || expr.includes('+ y')) {
        odeType = 'linear';
        params.P = 1;
        params.Q = 2;
      } else if (expr.match(/dy\/dx\s*=\s*[0-9\.\-]*y/i)) {
        odeType = 'exponential';
        const kMatch = expr.match(/([0-9\.\-]+)y/i);
        params.k = kMatch ? parseFloat(kMatch[1]) : 2;
      } else {
        odeType = 'direct';
        params.fx = expr.replace(/^dy\/dx\s*=\s*/i, '').trim() || '2x';
      }

      const res = CalculusEngine.solveDifferentialEquation(odeType, params);

      if (res.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">General & Particular Solutions</span>
            <div class="calc-outcome-value">${res.result.generalSol}</div>
            <div class="calc-outcome-secondary">${res.result.particularSol ? 'Particular with y(' + x0 + ')=' + y0 + ': ' + res.result.particularSol : 'Order: ' + res.result.order + ', Degree: ' + res.result.degree}</div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">ODE Analytical Derivation Steps:</div>
            <ol class="calc-raw-steps-ol">${res.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    container.querySelectorAll('.calc-preset-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        exprInput.value = chip.getAttribute('data-expr');
        x0Input.value = chip.getAttribute('data-x0');
        y0Input.value = chip.getAttribute('data-y0');
        runEval();
      });
    });

    runEval();
  }

  // ==========================================================================
  // TOOL 09: CALCULUS GRAPHING LAB
  // ==========================================================================
  _renderGraphingLabTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">09. Calculus Graphing Lab</h2>
        <p class="calc-tool-desc">Dedicated interactive visualizer: plot f(x), f'(x), f''(x), zoom, pan, select points, and dynamically drag tangent lines.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Primary Function f(x):</label>
            <input type="text" id="graphlab-input-f" class="glass-input" value="x^3 - 3*x">
          </div>
          <div class="calc-field-group">
            <label class="calc-label">Optional g(x):</label>
            <input type="text" id="graphlab-input-g" class="glass-input" placeholder="e.g. 2*x">
          </div>
          <button id="btn-graphlab-plot" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Plot Graph</span>
          </button>
        </div>

        <div class="calc-canvas-wrap" style="margin-top: 16px;">
          <canvas id="graphlab-canvas" class="calc-canvas"></canvas>
        </div>

        <div class="calc-graph-controls" style="margin-top: 14px;">
          <div class="calc-tangent-slider-wrap">
            <label class="calc-slider-label">
              <span>Tangent Slider <strong>x = a</strong>:</span>
              <span id="graphlab-a-badge" class="calc-badge-gold">a = 1.0</span>
            </label>
            <input type="range" id="graphlab-slider" min="-4" max="4" step="0.1" value="1" class="calc-slider">
          </div>
          <div class="calc-graph-toggles">
            <label class="calc-toggle-item"><input type="checkbox" id="chk-lab-d1" checked> <span>Show f'(x)</span></label>
            <label class="calc-toggle-item"><input type="checkbox" id="chk-lab-d2"> <span>Show f''(x)</span></label>
            <label class="calc-toggle-item"><input type="checkbox" id="chk-lab-normal"> <span>Show Normal</span></label>
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#graphlab-canvas');
    const fInput = container.querySelector('#graphlab-input-f');
    const gInput = container.querySelector('#graphlab-input-g');
    const plotBtn = container.querySelector('#btn-graphlab-plot');
    const slider = container.querySelector('#graphlab-slider');
    const badge = container.querySelector('#graphlab-a-badge');
    const chkD1 = container.querySelector('#chk-lab-d1');
    const chkD2 = container.querySelector('#chk-lab-d2');
    const chkNorm = container.querySelector('#chk-lab-normal');

    let labVisualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: fInput.value,
      showDerivative: true,
      derivStr: '3*x^2 - 3',
      tangentX0: 1,
      showNormal: false
    });

    const updatePlot = () => {
      const f = fInput.value;
      const g = gInput.value || null;
      const d1Res = CalculusEngine.differentiate(f, 1);
      const d2Res = CalculusEngine.differentiate(f, 2);

      labVisualizer.updateOptions({
        exprStr: f,
        exprGStr: g,
        derivStr: d1Res.success ? d1Res.result.firstDerivative : null,
        secondDerivStr: d2Res.success ? d2Res.result.secondDerivative : null,
        showDerivative: chkD1.checked,
        showSecondDerivative: chkD2.checked,
        showNormal: chkNorm.checked,
        tangentX0: parseFloat(slider.value)
      });
    };

    this._on(plotBtn, 'click', updatePlot);
    this._on(slider, 'input', (e) => {
      const val = parseFloat(e.target.value);
      badge.textContent = `a = ${val.toFixed(1)}`;
      labVisualizer.setTangentPoint(val);
    });

    this._on(chkD1, 'change', updatePlot);
    this._on(chkD2, 'change', updatePlot);
    this._on(chkNorm, 'change', updatePlot);
  }

  // ==========================================================================
  // TOOL 10: FORMULA LIBRARY
  // ==========================================================================
  _renderFormulaLibraryTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">10. Calculus Formula Library</h2>
        <p class="calc-tool-desc">Categorized standard formulas: Limits, Derivatives, Integrals, Differential Equations, and Applications with explanations and examples.</p>

        <div class="calc-formula-filters">
          <button class="calc-filter-chip active" data-cat="all">All Formulas</button>
          <button class="calc-filter-chip" data-cat="Limits">Limits</button>
          <button class="calc-filter-chip" data-cat="Derivatives">Derivatives</button>
          <button class="calc-filter-chip" data-cat="Integrals">Integrals</button>
          <button class="calc-filter-chip" data-cat="Differential Equations">Differential Equations</button>
          <button class="calc-filter-chip" data-cat="Applications">Applications</button>
        </div>

        <div id="calc-formula-cards-grid" class="calc-formula-cards-grid" style="margin-top: 20px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;

    const grid = container.querySelector('#calc-formula-cards-grid');
    const filterBtns = container.querySelectorAll('.calc-filter-chip');

    const renderCards = (cat = 'all') => {
      const list = cat === 'all' ? FORMULA_DATABASE : FORMULA_DATABASE.filter(f => f.cat === cat);
      grid.innerHTML = list.map(item => `
        <div class="glass-surface calc-formula-card">
          <div class="calc-form-card-top">
            <span class="calc-form-cat-badge">${item.cat}</span>
            <span class="calc-form-mod-badge">${item.mod}</span>
          </div>
          <h3 class="calc-form-name">${item.name}</h3>
          <div class="calc-form-formula-box">${item.formula}</div>
          <p class="calc-form-exp">${item.exp}</p>
          <div class="calc-form-example">
            <strong>Example:</strong> <code>${item.ex}</code>
          </div>
        </div>
      `).join('');
    };

    filterBtns.forEach(btn => {
      this._on(btn, 'click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCards(btn.getAttribute('data-cat'));
      });
    });

    renderCards('all');
  }

  // ==========================================================================
  // TOOL 11: STEP SOLVER
  // ==========================================================================
  _renderStepSolverTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">11. Calculus Step Solver</h2>
        <p class="calc-tool-desc">Rigorous step-by-step mathematical reasoning through the 7-stage derivation flow.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Enter Problem or Expression:</label>
            <input type="text" id="solver-input-expr" class="glass-input" value="d/dx [(x^2 + 1)*(x^3 - 2)]">
          </div>
          <button id="btn-run-solver" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Solve with Steps</span>
          </button>
        </div>

        <div id="solver-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-run-solver');
    const input = container.querySelector('#solver-input-expr');
    const outBox = container.querySelector('#solver-output-box');

    const runSolver = () => {
      const val = input.value;
      const detected = CalculusEngine.detectCalculusInput(val);
      let steps = [];
      let formula = '';
      let outcome = '';

      if (detected.type === 'derivative') {
        const res = CalculusEngine.differentiate(detected.expr, detected.order || 1);
        if (res.success) { steps = res.steps; formula = res.formula; outcome = res.result.nthDerivative; }
      } else if (detected.type === 'limit') {
        const res = CalculusEngine.evaluateLimit(detected.expr, detected.c || 0);
        if (res.success) { steps = res.steps; formula = res.formula; outcome = res.result.limitStr; }
      } else if (detected.type === 'indefinite_integral') {
        const res = CalculusEngine.indefiniteIntegral(detected.expr);
        if (res.success) { steps = res.steps; formula = res.formula; outcome = res.result.finalResult; }
      } else if (detected.type === 'definite_integral') {
        const res = CalculusEngine.definiteIntegral(detected.expr, detected.a, detected.b);
        if (res.success) { steps = res.steps; formula = res.formula; outcome = res.result.exactValue; }
      } else {
        const res = CalculusEngine.differentiate(detected.expr, 1);
        if (res.success) { steps = res.steps; formula = res.formula; outcome = res.result.firstDerivative; }
      }

      outBox.innerHTML = `
        <div class="calc-outcome-hero">
          <span class="calc-outcome-label">Final Verified Answer</span>
          <div class="calc-outcome-value">${outcome}</div>
          <div class="calc-outcome-secondary">${formula}</div>
        </div>

        <div class="calc-raw-steps-box" style="margin-top: 20px;">
          <div class="calc-raw-steps-header">7-Stage Derivation:</div>
          <ol class="calc-raw-steps-ol">${steps.map(s => `<li>${s}</li>`).join('')}</ol>
        </div>
      `;
    };

    this._on(btn, 'click', runSolver);
    runSolver();
  }

  // ==========================================================================
  // TOOL 12: PRACTICE LAB
  // ==========================================================================
  _renderPracticeLabTool(container) {
    const questions = [
      { q: "Evaluate lim(x→2) (x² - 4)/(x - 2)", options: ["0", "2", "4", "Does not exist"], answer: 2, exp: "Factor: (x-2)(x+2)/(x-2) = x+2. As x→2, 2+2 = 4." },
      { q: "What is d/dx [x³ - 3x]?", options: ["3x² - 3", "3x²", "3x", "6x"], answer: 0, exp: "By power rule: d/dx(x³) = 3x², d/dx(-3x) = -3 ⟹ 3x² - 3." },
      { q: "Evaluate indefinite integral ∫ x² dx:", options: ["x³ + C", "x³/3 + C", "2x + C", "x³/2 + C"], answer: 1, exp: "By power rule: x^(2+1)/(2+1) = x³/3 + C." },
      { q: "Is f(x) = |x| differentiable at x = 0?", options: ["Yes, f'(0) = 0", "Yes, f'(0) = 1", "No, LHD (-1) ≠ RHD (+1)", "Undefined"], answer: 2, exp: "f(x)=|x| has a sharp corner at x=0. LHD = -1, RHD = 1, so it is not differentiable." },
      { q: "What is the order and degree of dy/dx = 2x?", options: ["Order 1, Degree 1", "Order 2, Degree 1", "Order 1, Degree 2", "Order 0, Degree 1"], answer: 0, exp: "The highest derivative is first order, raised to power 1 ⟹ Order 1, Degree 1." }
    ];

    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">12. Calculus Practice Lab</h2>
        <p class="calc-tool-desc">Test your understanding across Limits, Derivatives, Continuity, Integrals, and Differential Equations.</p>

        <div id="calc-practice-container" class="calc-practice-wrap" style="margin-top: 20px;">
          ${questions.map((item, idx) => `
            <div class="glass-surface calc-practice-card" id="practice-card-${idx}">
              <div class="calc-practice-q-num">Question #${idx + 1}</div>
              <h3 class="calc-practice-q-text">${item.q}</h3>
              <div class="calc-practice-options">
                ${item.options.map((opt, oIdx) => `
                  <button class="calc-practice-opt-btn" data-q="${idx}" data-opt="${oIdx}">
                    <span class="calc-opt-badge">${String.fromCharCode(65 + oIdx)}</span>
                    <span>${opt}</span>
                  </button>
                `).join('')}
              </div>
              <div class="calc-practice-feedback" id="feedback-${idx}" style="display: none;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Handle option clicks
    container.querySelectorAll('.calc-practice-opt-btn').forEach(btn => {
      this._on(btn, 'click', () => {
        const qIdx = parseInt(btn.getAttribute('data-q'), 10);
        const optIdx = parseInt(btn.getAttribute('data-opt'), 10);
        const qData = questions[qIdx];
        const card = container.querySelector(`#practice-card-${qIdx}`);
        const feedback = container.querySelector(`#feedback-${qIdx}`);

        const isCorrect = optIdx === qData.answer;
        card.querySelectorAll('.calc-practice-opt-btn').forEach((b, i) => {
          b.disabled = true;
          if (i === qData.answer) b.classList.add('correct');
          else if (i === optIdx && !isCorrect) b.classList.add('incorrect');
        });

        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div class="calc-feedback-badge ${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </div>
          <p class="calc-feedback-exp">${qData.exp}</p>
        `;
      });
    });
  }

  // ==========================================================================
  // TOOL 13: NUMERICAL CALCULUS LAB
  // ==========================================================================
  _renderNumericalLabTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">13. Numerical Calculus Lab</h2>
        <p class="calc-tool-desc">Numerical approximation methods: Central Difference for derivatives, Trapezoidal Rule, and Simpson's 1/3 Rule for definite integrals with error bounds.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Function f(x):</label>
            <input type="text" id="num-input-expr" class="glass-input" value="x^2">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Evaluation x₀:</label>
            <input type="number" id="num-input-x0" class="glass-input" value="3">
          </div>
          <div class="calc-field-group" style="max-width: 140px;">
            <label class="calc-label">Step Width (h):</label>
            <input type="text" id="num-input-h" class="glass-input" value="0.0001">
          </div>
          <button id="btn-eval-num" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Compute Approximation</span>
          </button>
        </div>

        <div id="num-output-box" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-eval-num');
    const exprInput = container.querySelector('#num-input-expr');
    const x0Input = container.querySelector('#num-input-x0');
    const hInput = container.querySelector('#num-input-h');
    const outBox = container.querySelector('#num-output-box');

    const runEval = () => {
      const expr = exprInput.value;
      const x0 = parseFloat(x0Input.value) || 1;
      const h = parseFloat(hInput.value) || 1e-4;

      const dRes = CalculusEngine.numericalDerivative(expr, x0, h);
      const intRes = CalculusEngine.numericalDefiniteIntegral(expr, 0, x0, 100);

      if (dRes.success && intRes.success) {
        outBox.innerHTML = `
          <div class="calc-outcome-hero">
            <span class="calc-outcome-label">Numerical Approximation (Central Difference)</span>
            <div class="calc-outcome-value">f'(${x0}) ≈ ${dRes.result.firstDerivative}</div>
            <div class="calc-outcome-secondary">Truncation Error Estimate: ~ ${dRes.result.estimatedError}</div>
          </div>

          <div class="calc-properties-list" style="margin-top: 16px;">
            <div class="calc-property-row"><span class="calc-prop-label">Second Derivative Approx f''(${x0})</span><span class="calc-prop-value">${dRes.result.secondDerivative}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Simpson's 1/3 Rule ∫₀^{${x0}} f(x) dx</span><span class="calc-prop-value">${intRes.result.simpsonValue}</span></div>
            <div class="calc-property-row"><span class="calc-prop-label">Trapezoidal Rule ∫₀^{${x0}} f(x) dx</span><span class="calc-prop-value">${intRes.result.trapezoidalValue}</span></div>
          </div>

          <div class="calc-raw-steps-box" style="margin-top: 20px;">
            <div class="calc-raw-steps-header">Numerical Quadrature Derivation:</div>
            <ol class="calc-raw-steps-ol">${dRes.steps.map(s => `<li>${s}</li>`).join('')}</ol>
          </div>
        `;
      }
    };

    this._on(btn, 'click', runEval);
    runEval();
  }

  // ==========================================================================
  // TOOL 14: CALCULUS CALCULATOR
  // ==========================================================================
  _renderCalculatorTool(container) {
    container.innerHTML = `
      <div class="glass-surface calc-tool-panel">
        <h2 class="calc-tool-heading">14. Unified Calculus Calculator</h2>
        <p class="calc-tool-desc">All-in-one solver: Enter any calculus expression and choose your operation.</p>

        <div class="calc-form-row">
          <div class="calc-field-group">
            <label class="calc-label">Universal Expression:</label>
            <input type="text" id="calc-uni-expr" class="glass-input" value="x^3 - 3*x">
          </div>
          <div class="calc-field-group" style="max-width: 180px;">
            <label class="calc-label">Operation:</label>
            <select id="calc-uni-op" class="glass-input">
              <option value="differentiate">Differentiate</option>
              <option value="integrate">Integrate</option>
              <option value="limit">Limit at x=0</option>
              <option value="tangent">Tangent & Normal</option>
              <option value="analyze">Full Analysis</option>
            </select>
          </div>
          <button id="btn-calc-uni-run" class="glass-btn glass-btn-primary" style="align-self: flex-end; height: 42px;">
            <span>Calculate</span>
          </button>
        </div>

        <div id="calc-uni-out" class="calc-tool-results-wrap" style="margin-top: 24px;"></div>
      </div>
    `;

    const btn = container.querySelector('#btn-calc-uni-run');
    const exprInput = container.querySelector('#calc-uni-expr');
    const opSelect = container.querySelector('#calc-uni-op');
    const outBox = container.querySelector('#calc-uni-out');

    const runEval = () => {
      const expr = exprInput.value;
      const op = opSelect.value;
      let outcome = '';
      let steps = [];

      if (op === 'differentiate') {
        const res = CalculusEngine.differentiate(expr, 1);
        if (res.success) { outcome = res.result.firstDerivative; steps = res.steps; }
      } else if (op === 'integrate') {
        const res = CalculusEngine.indefiniteIntegral(expr);
        if (res.success) { outcome = res.result.finalResult; steps = res.steps; }
      } else if (op === 'limit') {
        const res = CalculusEngine.evaluateLimit(expr, 0);
        if (res.success) { outcome = res.result.limitStr; steps = res.steps; }
      } else if (op === 'tangent') {
        const res = CalculusEngine.tangentAndNormal(expr, 1);
        if (res.success) { outcome = res.result.tangentEq; steps = res.steps; }
      } else {
        const res = CalculusEngine.extremaAndMonotonicity(expr, -4, 4);
        if (res.success) { outcome = res.result.firstDerivative; steps = res.steps; }
      }

      outBox.innerHTML = `
        <div class="calc-outcome-hero">
          <span class="calc-outcome-label">Result: ${op.toUpperCase()}</span>
          <div class="calc-outcome-value">${outcome}</div>
        </div>

        <div class="calc-raw-steps-box" style="margin-top: 20px;">
          <div class="calc-raw-steps-header">Step-by-Step Result:</div>
          <ol class="calc-raw-steps-ol">${steps.map(s => `<li>${s}</li>`).join('')}</ol>
        </div>
      `;
    };

    this._on(btn, 'click', runEval);
    runEval();
  }
}
