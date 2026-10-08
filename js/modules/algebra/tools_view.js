/**
 * OG - Algebra Tools Workspace
 * Dedicated workspace for each Algebra Tool:
 * 09. Simplification
 * 10. Factorization
 * 11. Polynomial Operations
 * 12. Equation Solver (Linear & Quadratic)
 * 13. Expression Evaluator
 * 14. Algebraic Substitution
 * 15. Ratio & Proportion
 * 16. Logarithmic Equations
 * 17. Exponential Equations
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { AlgebraMathEngine } from '../../math/algebra.js';

export class AlgebraToolsView {
  constructor(container, tool = 'equation-solver') {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    // Map tool aliases
    const aliasMap = {
      'equation': 'equation-solver',
      'factor': 'factorization',
      'simplify': 'simplification',
      'expand': 'expansion',
      'poly': 'polynomial',
      'evaluator': 'evaluator',
      'substitution': 'substitution',
      'ratio': 'ratio-proportion',
      'proportion': 'ratio-proportion',
      'ratio-prop': 'ratio-proportion',
      'log-equations': 'log-exp',
      'exp-equations': 'log-exp',
      'log-exp': 'log-exp',
    };
    this.tool = aliasMap[tool] || tool || 'equation-solver';
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
    const toolConfigs = {
      'equation-solver': {
        title: 'Equation Solver',
        subtitle: 'Solve linear and quadratic equations step by step',
        badge: '=',
        content: this._renderEquationSolver()
      },
      'factorization': {
        title: 'Factorization',
        subtitle: 'Factor polynomials using common factor, difference of squares, quadratic method',
        badge: '×',
        content: this._renderFactorization()
      },
      'expansion': {
        title: 'Expansion',
        subtitle: 'Expand products of binomials and power expressions',
        badge: '↔',
        content: this._renderExpansion()
      },
      'simplification': {
        title: 'Simplification',
        subtitle: 'Collect like terms and simplify algebraic expressions',
        badge: '≡',
        content: this._renderSimplification()
      },
      'polynomial': {
        title: 'Polynomial Analyzer',
        subtitle: 'Analyze degree, roots, vertex, discriminant and graph',
        badge: 'P',
        content: this._renderPolynomialTool()
      },
      'evaluator': {
        title: 'Expression Evaluator',
        subtitle: 'Evaluate algebraic expressions with assigned variable values',
        badge: 'f(x)',
        content: this._renderEvaluator()
      },
      'substitution': {
        title: 'Algebraic Substitution',
        subtitle: 'Substitute variables with values or expressions with full steps',
        badge: 'x→a',
        content: this._renderSubstitution()
      },
      'ratio-proportion': {
        title: 'Ratio & Proportion',
        subtitle: 'Solve proportions with cross-multiplication and simplify ratios to lowest terms',
        badge: 'a:b',
        content: this._renderRatioProportion()
      },
      'log-exp': {
        title: 'Logarithmic & Exponential Equations',
        subtitle: 'Solve log and exponential equations with domain validation and step-by-step conversion',
        badge: 'log·e',
        content: this._renderLogExp()
      },
    };

    const config = toolConfigs[this.tool] || toolConfigs['equation-solver'];

    const pills = [
      { id: 'equation-solver', label: 'Equation Solver' },
      { id: 'factorization', label: 'Factorization' },
      { id: 'simplification', label: 'Simplification' },
      { id: 'expansion', label: 'Expansion' },
      { id: 'polynomial', label: 'Polynomials' },
      { id: 'evaluator', label: 'Evaluator' },
      { id: 'substitution', label: 'Substitution' },
      { id: 'ratio-proportion', label: 'Ratio & Proportion' },
      { id: 'log-exp', label: 'Log & Exp' },
    ];

    this.container.innerHTML = `
      <div class="alg-workspace view-animate-in">
        <!-- Header -->
        <div class="alg-header">
          <div class="alg-header-text">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <a href="#/algebra" class="glass-btn glass-btn-outline" style="padding:6px 14px;min-height:34px;font-size:0.82rem;">
                ${SVG_ICONS.back} Back to Algebra
              </a>
              <span class="alg-badge">${config.badge}</span>
            </div>
            <h1 class="alg-title">${config.title}</h1>
            <p class="alg-subtitle">${config.subtitle}</p>
          </div>
        </div>

        <!-- Top Tool Switcher Pills -->
        <div class="alg-tool-nav-pills" role="navigation" aria-label="Algebra tools navigation">
          ${pills.map(p => `
            <a href="#/algebra/${p.id}" class="alg-pill ${this.tool === p.id ? 'active' : ''}">
              ${p.label}
            </a>
          `).join('')}
        </div>

        ${config.content}
      </div>
    `;
  }

  // ── EQUATION SOLVER ──
  _renderEquationSolver() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-tabs" id="eq-tabs">
          <button class="alg-tool-tab active" data-tab="linear">Linear</button>
          <button class="alg-tool-tab" data-tab="quadratic">Quadratic</button>
        </div>

        <!-- LINEAR -->
        <div id="tab-linear" class="alg-tab-content">
          <div class="alg-tool-form">
            <label class="alg-form-label">Enter Linear Equation</label>
            <div class="alg-input-row">
              <div class="alg-input-wrap">
                <span class="alg-input-symbol">ax+b</span>
                <input type="text" id="eq-linear-input" class="alg-main-input"
                  placeholder="e.g. 2x + 5 = 15  or  3x - 7 = 2x + 4"
                  value="2x + 5 = 15" />
              </div>
            </div>
            <div class="alg-form-presets">
              <span class="alg-examples-label">Examples:</span>
              <button class="alg-example-chip" data-target="eq-linear-input" data-val="2x + 5 = 15">2x + 5 = 15</button>
              <button class="alg-example-chip" data-target="eq-linear-input" data-val="3x - 7 = 2x + 4">3x - 7 = 2x + 4</button>
              <button class="alg-example-chip" data-target="eq-linear-input" data-val="5x + 10 = 35">5x + 10 = 35</button>
            </div>
            <button class="glass-btn glass-btn-primary alg-compute-btn" id="eq-linear-btn">
              Solve Equation ${SVG_ICONS.arrowRight}
            </button>
          </div>
          <div id="eq-linear-result" class="alg-tool-result-area"></div>
        </div>

        <!-- QUADRATIC -->
        <div id="tab-quadratic" class="alg-tab-content" style="display:none;">
          <div class="alg-tool-form">
            <label class="alg-form-label">Quadratic: ax² + bx + c = 0</label>
            <div class="alg-quad-coeffs">
              <div class="alg-coeff-input">
                <label>a</label>
                <input type="number" id="quad-a" class="alg-coeff-field" value="1" />
              </div>
              <div class="alg-coeff-input">
                <label>b</label>
                <input type="number" id="quad-b" class="alg-coeff-field" value="-5" />
              </div>
              <div class="alg-coeff-input">
                <label>c</label>
                <input type="number" id="quad-c" class="alg-coeff-field" value="6" />
              </div>
            </div>
            <div class="alg-form-presets">
              <span class="alg-examples-label">Presets:</span>
              <button class="alg-example-chip" data-quad="1,-5,6">x²-5x+6=0</button>
              <button class="alg-example-chip" data-quad="1,4,4">x²+4x+4=0</button>
              <button class="alg-example-chip" data-quad="1,0,-9">x²-9=0</button>
              <button class="alg-example-chip" data-quad="1,0,1">x²+1=0</button>
            </div>
            <button class="glass-btn glass-btn-primary alg-compute-btn" id="eq-quad-btn">
              Solve Quadratic ${SVG_ICONS.arrowRight}
            </button>
          </div>

          <!-- Visual discriminant panel -->
          <div class="alg-disc-visual" id="alg-disc-visual" style="display:none;">
            <div class="alg-disc-item" id="disc-item-a"><span class="alg-disc-label">a</span><span class="alg-disc-val" id="disc-a">—</span></div>
            <div class="alg-disc-item" id="disc-item-b"><span class="alg-disc-label">b</span><span class="alg-disc-val" id="disc-b">—</span></div>
            <div class="alg-disc-item" id="disc-item-c"><span class="alg-disc-label">c</span><span class="alg-disc-val" id="disc-c">—</span></div>
            <div class="alg-disc-item alg-disc-highlight" id="disc-item-d">
              <span class="alg-disc-label">D = b²-4ac</span>
              <span class="alg-disc-val" id="disc-d">—</span>
            </div>
          </div>

          <div id="eq-quad-result" class="alg-tool-result-area"></div>
        </div>
      </div>
    `;
  }

  // ── FACTORIZATION ──
  _renderFactorization() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-form">
          <label class="alg-form-label">Enter Expression to Factor</label>
          <div class="alg-input-row">
            <div class="alg-input-wrap">
              <span class="alg-input-symbol">f(x)</span>
              <input type="text" id="factor-input" class="alg-main-input"
                placeholder="e.g. x² + 5x + 6  or  x² - 9  or  4x² - 25"
                value="x^2 + 5x + 6" />
            </div>
          </div>
          <div class="alg-form-presets">
            <span class="alg-examples-label">Examples:</span>
            <button class="alg-example-chip" data-target="factor-input" data-val="x^2 + 5x + 6">x²+5x+6</button>
            <button class="alg-example-chip" data-target="factor-input" data-val="x^2 - 9">x²-9</button>
            <button class="alg-example-chip" data-target="factor-input" data-val="x^2 - 5x + 6">x²-5x+6</button>
            <button class="alg-example-chip" data-target="factor-input" data-val="4x^2 - 25">4x²-25</button>
            <button class="alg-example-chip" data-target="factor-input" data-val="3x^2 - 12">3x²-12</button>
          </div>
          <button class="glass-btn glass-btn-primary alg-compute-btn" id="factor-btn">
            Factorize ${SVG_ICONS.arrowRight}
          </button>
        </div>

        <!-- Method guide -->
        <div class="alg-method-guide">
          <div class="alg-method-card">
            <div class="alg-method-icon">GCF</div>
            <div class="alg-method-name">Common Factor</div>
            <div class="alg-method-ex">6x²+12x → 6x(x+2)</div>
          </div>
          <div class="alg-method-card">
            <div class="alg-method-icon">a²-b²</div>
            <div class="alg-method-name">Diff. of Squares</div>
            <div class="alg-method-ex">x²-9 → (x+3)(x-3)</div>
          </div>
          <div class="alg-method-card">
            <div class="alg-method-icon">ax²+bx+c</div>
            <div class="alg-method-name">Quadratic</div>
            <div class="alg-method-ex">x²+5x+6 → (x+2)(x+3)</div>
          </div>
        </div>

        <div id="factor-result" class="alg-tool-result-area"></div>
      </div>
    `;
  }

  // ── EXPANSION ──
  _renderExpansion() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-form">
          <label class="alg-form-label">Enter Expression to Expand</label>
          <div class="alg-input-row">
            <div class="alg-input-wrap">
              <span class="alg-input-symbol">×</span>
              <input type="text" id="expand-input" class="alg-main-input"
                placeholder="e.g. (x+2)(x+3)  or  (x+1)^2  or  (x+1)^3"
                value="(x+2)(x+3)" />
            </div>
          </div>
          <div class="alg-form-presets">
            <span class="alg-examples-label">Examples:</span>
            <button class="alg-example-chip" data-target="expand-input" data-val="(x+2)(x+3)">(x+2)(x+3)</button>
            <button class="alg-example-chip" data-target="expand-input" data-val="(x+1)^2">(x+1)²</button>
            <button class="alg-example-chip" data-target="expand-input" data-val="(x-3)^2">(x-3)²</button>
            <button class="alg-example-chip" data-target="expand-input" data-val="(x+1)^3">(x+1)³</button>
            <button class="alg-example-chip" data-target="expand-input" data-val="(x+3)(x-3)">(x+3)(x-3)</button>
          </div>
          <button class="glass-btn glass-btn-primary alg-compute-btn" id="expand-btn">
            Expand ${SVG_ICONS.arrowRight}
          </button>
        </div>

        <!-- Identity reference -->
        <div class="alg-identity-ref">
          <div class="alg-identity-title">Algebraic Identities</div>
          <div class="alg-identities-grid">
            <div class="alg-identity-item"><span>(a+b)²</span><span>=</span><span>a²+2ab+b²</span></div>
            <div class="alg-identity-item"><span>(a-b)²</span><span>=</span><span>a²-2ab+b²</span></div>
            <div class="alg-identity-item"><span>(a+b)(a-b)</span><span>=</span><span>a²-b²</span></div>
            <div class="alg-identity-item"><span>(a+b)³</span><span>=</span><span>a³+3a²b+3ab²+b³</span></div>
          </div>
        </div>

        <div id="expand-result" class="alg-tool-result-area"></div>
      </div>
    `;
  }

  // ── SIMPLIFICATION ──
  _renderSimplification() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-form">
          <label class="alg-form-label">Enter Expression to Simplify</label>
          <div class="alg-input-row">
            <div class="alg-input-wrap">
              <span class="alg-input-symbol">≡</span>
              <input type="text" id="simplify-input" class="alg-main-input"
                placeholder="e.g. 2x + 3x  or  x + x + x  or  5x - 2x + 1"
                value="2x + 3x" />
            </div>
          </div>
          <div class="alg-form-presets">
            <span class="alg-examples-label">Examples:</span>
            <button class="alg-example-chip" data-target="simplify-input" data-val="2x + 3x">2x+3x</button>
            <button class="alg-example-chip" data-target="simplify-input" data-val="x + x + x">x+x+x</button>
            <button class="alg-example-chip" data-target="simplify-input" data-val="5x - 2x + 1">5x-2x+1</button>
            <button class="alg-example-chip" data-target="simplify-input" data-val="3x^2 + 2x^2 - x">3x²+2x²-x</button>
          </div>
          <button class="glass-btn glass-btn-primary alg-compute-btn" id="simplify-btn">
            Simplify ${SVG_ICONS.arrowRight}
          </button>
        </div>
        <div id="simplify-result" class="alg-tool-result-area"></div>
      </div>
    `;
  }

  // ── POLYNOMIAL ANALYZER ──
  _renderPolynomialTool() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-form">
          <label class="alg-form-label">Enter Polynomial P(x)</label>
          <div class="alg-input-row">
            <div class="alg-input-wrap">
              <span class="alg-input-symbol">P(x)</span>
              <input type="text" id="poly-input" class="alg-main-input"
                placeholder="e.g. x^2 - 4x + 3  or  2x^2 + 3x - 5"
                value="x^2 - 4x + 3" />
            </div>
          </div>
          <div class="alg-form-presets">
            <span class="alg-examples-label">Examples:</span>
            <button class="alg-example-chip" data-target="poly-input" data-val="x^2 - 4x + 3">x²-4x+3</button>
            <button class="alg-example-chip" data-target="poly-input" data-val="2x^2 + 3x - 5">2x²+3x-5</button>
            <button class="alg-example-chip" data-target="poly-input" data-val="x^2 - 9">x²-9</button>
          </div>
          <button class="glass-btn glass-btn-primary alg-compute-btn" id="poly-btn">
            Analyze Polynomial ${SVG_ICONS.arrowRight}
          </button>
        </div>
        <div id="poly-result" class="alg-tool-result-area"></div>
      </div>
    `;
  }

  // ── 13. EXPRESSION EVALUATOR ──
  _renderEvaluator() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-form">
          <label class="alg-form-label">Expression to Evaluate</label>
          <div class="alg-input-row">
            <div class="alg-input-wrap">
              <span class="alg-input-symbol">f(x)</span>
              <input type="text" id="eval-expr-input" class="alg-main-input"
                placeholder="e.g. 2*x^2 + 3*x - 5  or  sin(x) + cos(x)"
                value="2*x^2 + 3*x - 5" />
            </div>
          </div>

          <label class="alg-form-label" style="margin-top:16px;">Variable Values</label>
          <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:700;color:var(--text-primary);">x =</span>
              <input type="number" id="eval-var-x" class="alg-coeff-field" style="width:90px;" value="2" />
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:700;color:var(--text-primary);">y =</span>
              <input type="number" id="eval-var-y" class="alg-coeff-field" style="width:90px;" placeholder="opt" />
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:700;color:var(--text-primary);">a =</span>
              <input type="number" id="eval-var-a" class="alg-coeff-field" style="width:90px;" placeholder="opt" />
            </div>
          </div>

          <div class="alg-form-presets">
            <span class="alg-examples-label">Presets:</span>
            <button class="alg-example-chip" data-eval="2*x^2 + 3*x - 5,x=2">2x²+3x-5 (x=2)</button>
            <button class="alg-example-chip" data-eval="x^3 - 4*x + 1,x=3">x³-4x+1 (x=3)</button>
            <button class="alg-example-chip" data-eval="sqrt(x^2 + 9),x=4">√(x²+9) (x=4)</button>
            <button class="alg-example-chip" data-eval="x^2 + y^2,x=3,y=4">x²+y² (x=3,y=4)</button>
          </div>

          <button class="glass-btn glass-btn-primary alg-compute-btn" id="eval-btn">
            Evaluate Expression ${SVG_ICONS.arrowRight}
          </button>
        </div>
        <div id="eval-result" class="alg-tool-result-area"></div>
      </div>
    `;
  }

  // ── 14. ALGEBRAIC SUBSTITUTION ──
  _renderSubstitution() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-form">
          <label class="alg-form-label">Target Expression</label>
          <div class="alg-input-row">
            <div class="alg-input-wrap">
              <span class="alg-input-symbol">E</span>
              <input type="text" id="subst-expr-input" class="alg-main-input"
                placeholder="e.g. 2x + 5  or  x^2 - 4x + 3"
                value="2x + 5" />
            </div>
          </div>

          <div style="display:flex;gap:14px;margin-top:16px;flex-wrap:wrap;">
            <div style="flex:1;min-width:140px;">
              <label class="alg-form-label">Variable to Replace</label>
              <input type="text" id="subst-var-name" class="alg-coeff-field" style="width:100%;" value="x" />
            </div>
            <div style="flex:2;min-width:200px;">
              <label class="alg-form-label">Replacement Value or Expression</label>
              <input type="text" id="subst-replacement" class="alg-coeff-field" style="width:100%;" value="3" />
            </div>
          </div>

          <div class="alg-form-presets" style="margin-top:14px;">
            <span class="alg-examples-label">Presets:</span>
            <button class="alg-example-chip" data-subst="2x + 5,x,3">2x+5 [x=3]</button>
            <button class="alg-example-chip" data-subst="x^2 - 4,x,y+1">x²-4 [x=y+1]</button>
            <button class="alg-example-chip" data-subst="3x^2 + 2x - 1,x,2">3x²+2x-1 [x=2]</button>
            <button class="alg-example-chip" data-subst="a^2 + 2a + 1,a,5">a²+2a+1 [a=5]</button>
          </div>

          <button class="glass-btn glass-btn-primary alg-compute-btn" id="subst-btn">
            Perform Substitution ${SVG_ICONS.arrowRight}
          </button>
        </div>
        <div id="subst-result" class="alg-tool-result-area"></div>
      </div>
    `;
  }

  // ── 15. RATIO & PROPORTION ──
  _renderRatioProportion() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-tabs" id="ratio-tabs">
          <button class="alg-tool-tab active" data-tab="proportion">Solve Proportion</button>
          <button class="alg-tool-tab" data-tab="simplify-ratio">Simplify Ratio</button>
        </div>

        <!-- SOLVE PROPORTION -->
        <div id="tab-proportion" class="alg-tab-content">
          <div class="alg-tool-form">
            <label class="alg-form-label">Proportion: a / b = c / d</label>
            <div class="alg-input-row">
              <div class="alg-input-wrap">
                <span class="alg-input-symbol">a/b=c/d</span>
                <input type="text" id="prop-input" class="alg-main-input"
                  placeholder="e.g. x/4 = 6/8  or  3/x = 9/12  or  5/10 = x/20"
                  value="x/4 = 6/8" />
              </div>
            </div>
            <div class="alg-form-presets">
              <span class="alg-examples-label">Presets:</span>
              <button class="alg-example-chip" data-target="prop-input" data-val="x/4 = 6/8">x/4 = 6/8</button>
              <button class="alg-example-chip" data-target="prop-input" data-val="3/x = 9/12">3/x = 9/12</button>
              <button class="alg-example-chip" data-target="prop-input" data-val="5/10 = x/20">5/10 = x/20</button>
              <button class="alg-example-chip" data-target="prop-input" data-val="2/7 = 8/x">2/7 = 8/x</button>
            </div>
            <button class="glass-btn glass-btn-primary alg-compute-btn" id="prop-btn">
              Solve Proportion ${SVG_ICONS.arrowRight}
            </button>
          </div>
          <div id="prop-result" class="alg-tool-result-area"></div>
        </div>

        <!-- SIMPLIFY RATIO -->
        <div id="tab-simplify-ratio" class="alg-tab-content" style="display:none;">
          <div class="alg-tool-form">
            <label class="alg-form-label">Ratio to Simplify: A : B</label>
            <div class="alg-input-row">
              <div class="alg-input-wrap">
                <span class="alg-input-symbol">A:B</span>
                <input type="text" id="ratio-input" class="alg-main-input"
                  placeholder="e.g. 24:36  or  15/45  or  120:180"
                  value="24:36" />
              </div>
            </div>
            <div class="alg-form-presets">
              <span class="alg-examples-label">Presets:</span>
              <button class="alg-example-chip" data-target="ratio-input" data-val="24:36">24 : 36</button>
              <button class="alg-example-chip" data-target="ratio-input" data-val="15:45">15 : 45</button>
              <button class="alg-example-chip" data-target="ratio-input" data-val="84:144">84 : 144</button>
              <button class="alg-example-chip" data-target="ratio-input" data-val="100:250">100 : 250</button>
            </div>
            <button class="glass-btn glass-btn-primary alg-compute-btn" id="ratio-btn">
              Simplify Ratio ${SVG_ICONS.arrowRight}
            </button>
          </div>
          <div id="ratio-result" class="alg-tool-result-area"></div>
        </div>
      </div>
    `;
  }

  // ── 16 & 17. LOGARITHMIC & EXPONENTIAL ──
  _renderLogExp() {
    return `
      <div class="glass-panel" style="padding:24px;margin-bottom:24px;">
        <div class="alg-tool-tabs" id="logexp-tabs">
          <button class="alg-tool-tab active" data-tab="log">Logarithmic</button>
          <button class="alg-tool-tab" data-tab="exp">Exponential</button>
        </div>

        <!-- LOGARITHMIC -->
        <div id="tab-log" class="alg-tab-content">
          <div class="alg-tool-form">
            <label class="alg-form-label">Logarithmic Equation: log_b(x) = c</label>
            <div class="alg-input-row">
              <div class="alg-input-wrap">
                <span class="alg-input-symbol">log</span>
                <input type="text" id="log-input" class="alg-main-input"
                  placeholder="e.g. log(x) = 2  or  ln(x) = 3  or  log2(x) = 5  or  log(2x + 4) = 2"
                  value="log(x) = 2" />
              </div>
            </div>
            <div class="alg-form-presets">
              <span class="alg-examples-label">Presets:</span>
              <button class="alg-example-chip" data-target="log-input" data-val="log(x) = 2">log(x) = 2</button>
              <button class="alg-example-chip" data-target="log-input" data-val="ln(x) = 3">ln(x) = 3</button>
              <button class="alg-example-chip" data-target="log-input" data-val="log2(x) = 5">log2(x) = 5</button>
              <button class="alg-example-chip" data-target="log-input" data-val="log(2x + 4) = 2">log(2x+4) = 2</button>
            </div>
            <button class="glass-btn glass-btn-primary alg-compute-btn" id="log-btn">
              Solve Logarithmic Equation ${SVG_ICONS.arrowRight}
            </button>
          </div>
          <div id="log-result" class="alg-tool-result-area"></div>
        </div>

        <!-- EXPONENTIAL -->
        <div id="tab-exp" class="alg-tab-content" style="display:none;">
          <div class="alg-tool-form">
            <label class="alg-form-label">Exponential Equation: b^x = c</label>
            <div class="alg-input-row">
              <div class="alg-input-wrap">
                <span class="alg-input-symbol">b^x</span>
                <input type="text" id="exp-input" class="alg-main-input"
                  placeholder="e.g. 2^x = 16  or  3^(x-1) = 27  or  e^x = 10"
                  value="2^x = 16" />
              </div>
            </div>
            <div class="alg-form-presets">
              <span class="alg-examples-label">Presets:</span>
              <button class="alg-example-chip" data-target="exp-input" data-val="2^x = 16">2^x = 16</button>
              <button class="alg-example-chip" data-target="exp-input" data-val="3^(x-1) = 27">3^(x-1) = 27</button>
              <button class="alg-example-chip" data-target="exp-input" data-val="e^x = 10">e^x = 10</button>
              <button class="alg-example-chip" data-target="exp-input" data-val="5^x = 20">5^x = 20</button>
            </div>
            <button class="glass-btn glass-btn-primary alg-compute-btn" id="exp-btn">
              Solve Exponential Equation ${SVG_ICONS.arrowRight}
            </button>
          </div>
          <div id="exp-result" class="alg-tool-result-area"></div>
        </div>
      </div>
    `;
  }

  _attachListeners() {
    // Tab switching in any tool
    ['eq-tabs', 'ratio-tabs', 'logexp-tabs'].forEach(tabContainerId => {
      const container = document.getElementById(tabContainerId);
      if (!container) return;
      const tabs = container.querySelectorAll('.alg-tool-tab');
      tabs.forEach(tab => {
        this._on(tab, 'click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const tabId = tab.dataset.tab;
          // Hide sister tab contents within the same parent
          const parent = container.parentElement;
          parent.querySelectorAll('.alg-tab-content').forEach(c => c.style.display = 'none');
          const target = document.getElementById(`tab-${tabId}`);
          if (target) target.style.display = 'block';
        });
      });
    });

    // Example chips → fill target input
    document.querySelectorAll('.alg-example-chip[data-target]').forEach(chip => {
      this._on(chip, 'click', () => {
        const target = document.getElementById(chip.dataset.target);
        if (target) { target.value = chip.dataset.val; target.focus(); }
      });
    });

    // Quadratic presets
    document.querySelectorAll('.alg-example-chip[data-quad]').forEach(chip => {
      this._on(chip, 'click', () => {
        const [a, b, c] = chip.dataset.quad.split(',').map(Number);
        const aEl = document.getElementById('quad-a');
        const bEl = document.getElementById('quad-b');
        const cEl = document.getElementById('quad-c');
        if (aEl) aEl.value = a;
        if (bEl) bEl.value = b;
        if (cEl) cEl.value = c;
      });
    });

    // Evaluator presets
    document.querySelectorAll('.alg-example-chip[data-eval]').forEach(chip => {
      this._on(chip, 'click', () => {
        const parts = chip.dataset.eval.split(',');
        const expr = parts[0];
        const exprEl = document.getElementById('eval-expr-input');
        if (exprEl) exprEl.value = expr;
        for (let i = 1; i < parts.length; i++) {
          const [v, val] = parts[i].split('=');
          const varEl = document.getElementById(`eval-var-${v.trim().toLowerCase()}`);
          if (varEl) varEl.value = val.trim();
        }
      });
    });

    // Substitution presets
    document.querySelectorAll('.alg-example-chip[data-subst]').forEach(chip => {
      this._on(chip, 'click', () => {
        const [expr, varName, repl] = chip.dataset.subst.split(',');
        const exprEl = document.getElementById('subst-expr-input');
        const varEl = document.getElementById('subst-var-name');
        const replEl = document.getElementById('subst-replacement');
        if (exprEl) exprEl.value = expr;
        if (varEl) varEl.value = varName;
        if (replEl) replEl.value = repl;
      });
    });

    // ── EQUATION SOLVER buttons ──
    const eqLinearBtn = document.getElementById('eq-linear-btn');
    this._on(eqLinearBtn, 'click', () => {
      const val = document.getElementById('eq-linear-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.solveLinear(val);
      this._renderToolResult(result, val, 'eq-linear-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Equation Solver', 'algebra');
    });

    const eqQuadBtn = document.getElementById('eq-quad-btn');
    this._on(eqQuadBtn, 'click', () => {
      const a = parseFloat(document.getElementById('quad-a')?.value || '1');
      const b = parseFloat(document.getElementById('quad-b')?.value || '0');
      const c = parseFloat(document.getElementById('quad-c')?.value || '0');
      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        showToast('Please enter valid coefficients', 'error'); return;
      }
      const expr = `${a}x^2 + ${b}x + ${c} = 0`;
      const result = AlgebraMathEngine.solveQuadratic(expr);

      // Update discriminant visual
      const discVisual = document.getElementById('alg-disc-visual');
      if (discVisual) {
        discVisual.style.display = 'grid';
        document.getElementById('disc-a').textContent = a;
        document.getElementById('disc-b').textContent = b;
        document.getElementById('disc-c').textContent = c;
        const dEl = document.getElementById('disc-d');
        const disc = b*b - 4*a*c;
        dEl.textContent = disc;
        dEl.style.color = disc > 0 ? '#22c55e' : disc === 0 ? '#B89A5A' : '#ef4444';
      }

      this._renderToolResult(result, expr, 'eq-quad-result');
      if (result.success) store.addHistoryItem(expr, result.result, 'Quadratic Solver', 'algebra');
    });

    // ── FACTORIZATION ──
    const factorBtn = document.getElementById('factor-btn');
    this._on(factorBtn, 'click', () => {
      const val = document.getElementById('factor-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.factorize(val);
      this._renderToolResult(result, val, 'factor-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Factorization', 'algebra');
    });

    // ── EXPANSION ──
    const expandBtn = document.getElementById('expand-btn');
    this._on(expandBtn, 'click', () => {
      const val = document.getElementById('expand-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.expand(val);
      this._renderToolResult(result, val, 'expand-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Expansion', 'algebra');
    });

    // ── SIMPLIFICATION ──
    const simplifyBtn = document.getElementById('simplify-btn');
    this._on(simplifyBtn, 'click', () => {
      const val = document.getElementById('simplify-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.simplifyLikeTerms(val);
      this._renderToolResult(result, val, 'simplify-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Simplification', 'algebra');
    });

    // ── POLYNOMIAL ──
    const polyBtn = document.getElementById('poly-btn');
    this._on(polyBtn, 'click', () => {
      const val = document.getElementById('poly-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.analyzePolynomial(val);
      this._renderPolyResult(result, val);
      if (result.success) store.addHistoryItem(val, result.result, 'Polynomial Analysis', 'algebra');
    });

    // ── EVALUATOR ──
    const evalBtn = document.getElementById('eval-btn');
    this._on(evalBtn, 'click', () => {
      const expr = document.getElementById('eval-expr-input')?.value.trim();
      if (!expr) return;
      const vars = {};
      const xVal = document.getElementById('eval-var-x')?.value.trim();
      const yVal = document.getElementById('eval-var-y')?.value.trim();
      const aVal = document.getElementById('eval-var-a')?.value.trim();
      if (xVal !== '') vars.x = xVal;
      if (yVal !== '') vars.y = yVal;
      if (aVal !== '') vars.a = aVal;

      const result = AlgebraMathEngine.evaluateExpression(expr, vars);
      this._renderToolResult(result, expr, 'eval-result');
      if (result.success) store.addHistoryItem(expr, result.result, 'Expression Evaluator', 'algebra');
    });

    // ── SUBSTITUTION ──
    const substBtn = document.getElementById('subst-btn');
    this._on(substBtn, 'click', () => {
      const expr = document.getElementById('subst-expr-input')?.value.trim();
      const varName = document.getElementById('subst-var-name')?.value.trim() || 'x';
      const repl = document.getElementById('subst-replacement')?.value.trim() || '';
      if (!expr || !repl) return;

      const result = AlgebraMathEngine.substituteVariable(expr, varName, repl);
      this._renderToolResult(result, `${expr} [${varName}→${repl}]`, 'subst-result');
      if (result.success) store.addHistoryItem(`${expr} [${varName}→${repl}]`, result.result, 'Algebraic Substitution', 'algebra');
    });

    // ── RATIO & PROPORTION ──
    const propBtn = document.getElementById('prop-btn');
    this._on(propBtn, 'click', () => {
      const val = document.getElementById('prop-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.solveProportion(val);
      this._renderToolResult(result, val, 'prop-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Proportion Solver', 'algebra');
    });

    const ratioBtn = document.getElementById('ratio-btn');
    this._on(ratioBtn, 'click', () => {
      const val = document.getElementById('ratio-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.solveProportion(val);
      this._renderToolResult(result, val, 'ratio-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Ratio Simplification', 'algebra');
    });

    // ── LOGARITHMIC & EXPONENTIAL ──
    const logBtn = document.getElementById('log-btn');
    this._on(logBtn, 'click', () => {
      const val = document.getElementById('log-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.solveLogarithmic(val);
      this._renderToolResult(result, val, 'log-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Logarithmic Equation', 'algebra');
    });

    const expBtn = document.getElementById('exp-btn');
    this._on(expBtn, 'click', () => {
      const val = document.getElementById('exp-input')?.value.trim();
      if (!val) return;
      const result = AlgebraMathEngine.solveExponential(val);
      this._renderToolResult(result, val, 'exp-result');
      if (result.success) store.addHistoryItem(val, result.result, 'Exponential Equation', 'algebra');
    });

    // Enter key shortcuts
    const enterMap = {
      'eq-linear-input': 'eq-linear-btn',
      'factor-input': 'factor-btn',
      'expand-input': 'expand-btn',
      'simplify-input': 'simplify-btn',
      'poly-input': 'poly-btn',
      'eval-expr-input': 'eval-btn',
      'subst-expr-input': 'subst-btn',
      'prop-input': 'prop-btn',
      'ratio-input': 'ratio-btn',
      'log-input': 'log-btn',
      'exp-input': 'exp-btn',
    };

    Object.keys(enterMap).forEach(id => {
      const el = document.getElementById(id);
      this._on(el, 'keydown', (e) => {
        if (e.key === 'Enter') {
          document.getElementById(enterMap[id])?.click();
        }
      });
    });
  }

  _renderToolResult(result, expr, containerId) {
    const area = document.getElementById(containerId);
    if (!area) return;

    if (!result || !result.success) {
      area.innerHTML = `
        <div class="alg-error-panel">
          <div class="alg-error-icon">⚠</div>
          <div>
            <div class="alg-error-title">Cannot Process</div>
            <div class="alg-error-msg">${result ? result.error : 'Unknown error'}</div>
          </div>
        </div>
        ${result && result.steps && result.steps.length > 1 ? this._renderSteps(result.steps) : ''}
      `;
      return;
    }

    const rootsHtml = result.x1 && result.x2 ? `
      <div class="alg-roots-grid">
        <div class="alg-root-item">
          <div class="alg-root-label">x₁</div>
          <div class="alg-root-val">${result.x1}</div>
        </div>
        <div class="alg-root-item">
          <div class="alg-root-label">x₂</div>
          <div class="alg-root-val">${result.x2}</div>
        </div>
      </div>
    ` : '';

    area.innerHTML = `
      <div class="alg-result-panel result-animate">
        <div class="alg-result-op-label">${result.operation || 'Result'}</div>
        <div class="alg-result-expr">${expr}</div>
        <div class="alg-result-arrow">↓</div>
        <div class="alg-result-answer">${result.result}</div>
        ${rootsHtml}
        ${result.discriminantClass ? `<div class="alg-disc-class">${result.discriminantClass}</div>` : ''}
        ${result.interval ? `<div class="alg-result-interval"><span class="alg-meta-label">Interval:</span> <span class="alg-interval-val">${result.interval}</span></div>` : ''}

        <div class="alg-result-actions">
          <button class="glass-btn glass-btn-primary alg-copy-btn" id="${containerId}-copy">
            ${SVG_ICONS.copy} Copy Answer
          </button>
          <button class="glass-btn glass-btn-outline alg-steps-toggle" id="${containerId}-steps-toggle">
            Show Steps (${result.steps ? result.steps.length : 0})
          </button>
        </div>

        <div class="alg-steps-container" id="${containerId}-steps" style="display:none;">
          ${this._renderSteps(result.steps || [])}
        </div>
      </div>
    `;

    // Copy
    document.getElementById(`${containerId}-copy`)?.addEventListener('click', () => {
      copyToClipboard(result.result, 'Answer copied!');
    });

    // Steps toggle
    const stepsEl = document.getElementById(`${containerId}-steps`);
    const toggleEl = document.getElementById(`${containerId}-steps-toggle`);
    toggleEl?.addEventListener('click', () => {
      const isOpen = stepsEl.style.display !== 'none';
      stepsEl.style.display = isOpen ? 'none' : 'block';
      toggleEl.textContent = isOpen ? `Show Steps (${result.steps ? result.steps.length : 0})` : 'Hide Steps';
    });
  }

  _renderPolyResult(result, expr) {
    if (!result.success) {
      this._renderToolResult(result, expr, 'poly-result');
      return;
    }

    const area = document.getElementById('poly-result');
    if (!area) return;

    area.innerHTML = `
      <div class="alg-result-panel result-animate">
        <div class="alg-result-op-label">Polynomial Analysis</div>
        <div class="alg-result-expr">P(x) = ${expr}</div>

        <div class="alg-poly-stats">
          <div class="alg-poly-stat">
            <div class="alg-poly-stat-label">Degree</div>
            <div class="alg-poly-stat-val">${result.degree}</div>
          </div>
          <div class="alg-poly-stat">
            <div class="alg-poly-stat-label">Leading Coeff.</div>
            <div class="alg-poly-stat-val">${result.leadingCoeff}</div>
          </div>
          <div class="alg-poly-stat">
            <div class="alg-poly-stat-label">Constant</div>
            <div class="alg-poly-stat-val">${result.constant}</div>
          </div>
          ${result.discriminant !== undefined ? `
            <div class="alg-poly-stat">
              <div class="alg-poly-stat-label">Discriminant</div>
              <div class="alg-poly-stat-val" style="color:${result.discriminant > 0 ? '#22c55e' : result.discriminant === 0 ? '#B89A5A' : '#ef4444'};">${result.discriminant}</div>
            </div>
          ` : ''}
        </div>

        ${result.vertex ? `
          <div class="alg-poly-vertex">
            <div class="alg-poly-stat-label">Vertex</div>
            <div class="alg-poly-stat-val">(${result.vertex.x}, ${result.vertex.y})</div>
            <div style="font-size:0.82rem;color:var(--text-tertiary);margin-top:4px;">
              Opens ${result.a > 0 ? 'Upward ↑' : 'Downward ↓'}
            </div>
          </div>
        ` : ''}

        ${result.roots && result.roots.length > 0 ? `
          <div class="alg-roots-grid">
            ${result.roots.map((r, i) => `
              <div class="alg-root-item">
                <div class="alg-root-label">x₁${result.roots.length > 1 ? ['', '₂'][i] || '' : ''}</div>
                <div class="alg-root-val">${r}</div>
              </div>
            `).join('')}
          </div>
        ` : result.degree === 2 ? `<div class="alg-disc-class">No real roots (D < 0)</div>` : ''}

        <div class="alg-result-actions">
          <button class="glass-btn glass-btn-outline alg-steps-toggle" id="poly-result-steps-toggle">
            Show Steps (${result.steps ? result.steps.length : 0})
          </button>
          <a href="#/graph" class="glass-btn glass-btn-outline">
            ${SVG_ICONS.graph} Graph
          </a>
        </div>

        <div class="alg-steps-container" id="poly-result-steps" style="display:none;">
          ${this._renderSteps(result.steps || [])}
        </div>
      </div>
    `;

    const stepsEl = document.getElementById('poly-result-steps');
    const toggleEl = document.getElementById('poly-result-steps-toggle');
    toggleEl?.addEventListener('click', () => {
      const isOpen = stepsEl.style.display !== 'none';
      stepsEl.style.display = isOpen ? 'none' : 'block';
      toggleEl.textContent = isOpen ? `Show Steps (${result.steps ? result.steps.length : 0})` : 'Hide Steps';
    });
  }

  _renderSteps(steps) {
    if (!steps || steps.length === 0) return '';
    return `
      <div class="alg-steps-list">
        ${steps.map((step, i) => `
          <div class="alg-step-item">
            <div class="alg-step-num">${i + 1}</div>
            <div class="alg-step-body">
              <div class="alg-step-label">${step.label}</div>
              <div class="alg-step-value">${step.value}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
