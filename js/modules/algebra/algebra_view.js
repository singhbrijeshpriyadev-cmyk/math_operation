/**
 * OG - Algebra Workspace Dashboard View
 * The primary landing page for the Algebra section.
 * Features: Smart quick-solver, expression detection, recent history,
 * algebra tools grid, and module navigator.
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { AlgebraMathEngine } from '../../math/algebra.js';

const ALGEBRA_MODULES = [
  { id: 'sets',                         num: '01', title: 'Sets & Set Theory',                  icon: '∅',    desc: 'Union, intersection, complement, Venn diagrams', href: '#/modules/sets' },
  { id: 'relations-functions',          num: '02', title: 'Relations & Functions',              icon: 'f(x)', desc: 'Domain, range, composition, inverse functions', href: '#/modules/relations-functions' },
  { id: 'trigonometric-functions',      num: '03', title: 'Trigonometric Functions',            icon: 'sin',  desc: 'Sine, cosine, tangent and their graphs', href: '#/modules/trigonometric-functions' },
  { id: 'complex-numbers',              num: '04', title: 'Complex Numbers & Quadratics',       icon: 'a+bi', desc: 'Arithmetic, polar form, Argand plane, quadratics', href: '#/modules/complex-numbers' },
  { id: 'linear-inequalities',          num: '05', title: 'Linear Inequalities',                icon: '<≤>≥', desc: 'Solve and visualize linear inequalities', href: '#/modules/linear-inequalities' },
  { id: 'permutations-combinations',   num: '06', title: 'Permutations & Combinations',       icon: 'nCr', desc: 'Factorial, P(n,r), C(n,r), arrangements', href: '#/modules/permutations-combinations' },
  { id: 'binomial-theorem',             num: '07', title: 'Binomial Theorem',                   icon: '(a+b)ⁿ', desc: 'Expansion, Pascal triangle, general term', href: '#/modules/binomial-theorem' },
  { id: 'sequence-series',              num: '08', title: 'Sequences & Series',                 icon: 'AP GP', desc: 'Arithmetic and geometric progressions, sums', href: '#/modules/sequence-series' },
];

const ALGEBRA_TOOLS = [
  { id: 'equation',     icon: '=',     title: 'Equation Solver',    desc: 'Solve linear and quadratic equations step by step' },
  { id: 'factor',       icon: '×',     title: 'Factorization',      desc: 'Factor quadratics, polynomials and diff of squares' },
  { id: 'simplify',     icon: '≡',     title: 'Simplification',    desc: 'Collect like terms and simplify expressions' },
  { id: 'expand',       icon: '↔',     title: 'Expansion',          desc: 'Expand products and binomial powers' },
  { id: 'poly',         icon: 'P',     title: 'Polynomial Tools',   desc: 'Degree, roots, vertex, discriminant' },
  { id: 'evaluator',    icon: 'f(x)',  title: 'Evaluator',          desc: 'Evaluate expressions with variable values' },
  { id: 'substitution', icon: 'x→a',   title: 'Substitution',       desc: 'Substitute variables with values or expressions' },
  { id: 'ratio-prop',   icon: 'a:b',   title: 'Ratio & Proportion', desc: 'Solve proportions and simplify ratios' },
  { id: 'log-exp',      icon: 'log·e', title: 'Log & Exponential',  desc: 'Solve logarithmic and exponential equations' },
];

const QUICK_EXAMPLES = [
  { label: 'x² + 5x + 6',    hint: 'Factor' },
  { label: '2x + 5 = 15',    hint: 'Solve' },
  { label: '(x+2)(x-3)',     hint: 'Expand' },
  { label: '2x + 3x',        hint: 'Simplify' },
  { label: 'x² - 5x + 6 = 0', hint: 'Quadratic' },
];

export class AlgebraView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.currentInput = '';
    this.currentResult = null;
    this.detectedType = null;
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
    const recentHistory = store.getState().history.filter(h =>
      ['Sets', 'Relations', 'Trig', 'Complex Numbers', 'Linear Inequalities',
       'Combinatorics', 'Binomial', 'Sequences', 'Algebra', 'Equation Solver',
       'Factorization', 'Simplify', 'Expansion'].some(k => (h.module || '').includes(k))
    ).slice(0, 4);

    this.container.innerHTML = `
      <div class="alg-workspace view-animate-in">

        <!-- ── HEADER ── -->
        <div class="alg-header">
          <div class="alg-header-text">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span class="alg-badge">Algebra</span>
              <span style="font-size:0.78rem;color:var(--text-tertiary);font-weight:600;">8 Modules · 9 Tools</span>
            </div>
            <h1 class="alg-title">Algebra Workspace</h1>
            <p class="alg-subtitle">Explore expressions, equations, functions and patterns.</p>
          </div>
          <div class="alg-header-actions">
            <a href="#/modules?cat=algebra" class="glass-btn glass-btn-outline">
              <span>All 24 Modules</span>
              ${SVG_ICONS.arrowRight}
            </a>
          </div>
        </div>

        <!-- ── QUICK SOLVER ── -->
        <div class="glass-panel alg-solver-panel">
          <div class="alg-solver-header">
            <div class="alg-solver-title">
              <span class="alg-solver-icon">⟨/⟩</span>
              <div>
                <div style="font-size:1.05rem;font-weight:700;color:var(--text-primary);">Quick Algebra Solver</div>
                <div style="font-size:0.82rem;color:var(--text-tertiary);">Enter any expression, equation, or inequality</div>
              </div>
            </div>
            <div class="alg-mode-badge" id="alg-type-badge">— Enter expression —</div>
          </div>

          <!-- Input -->
          <div class="alg-input-row">
            <div class="alg-input-wrap">
              <span class="alg-input-symbol">f(x)</span>
              <input
                type="text"
                id="alg-main-input"
                class="alg-main-input"
                placeholder="e.g. x² + 5x + 6  or  2x + 5 = 15  or  (x+2)(x-3)"
                autocomplete="off"
                spellcheck="false"
                aria-label="Algebra expression input"
              />
              <button class="alg-input-clear" id="alg-input-clear" title="Clear input" aria-label="Clear">✕</button>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="alg-action-bar" id="alg-action-bar">
            <button class="alg-action-btn alg-btn-primary" id="alg-btn-solve" data-op="solve">
              <span class="alg-btn-icon">=</span> Solve
            </button>
            <button class="alg-action-btn" id="alg-btn-simplify" data-op="simplify">
              <span class="alg-btn-icon">≡</span> Simplify
            </button>
            <button class="alg-action-btn" id="alg-btn-factor" data-op="factor">
              <span class="alg-btn-icon">×</span> Factor
            </button>
            <button class="alg-action-btn" id="alg-btn-expand" data-op="expand">
              <span class="alg-btn-icon">↔</span> Expand
            </button>
            <button class="alg-action-btn" id="alg-btn-graph" data-op="graph">
              <span class="alg-btn-icon">📈</span> Graph
            </button>
          </div>

          <!-- Quick examples -->
          <div class="alg-examples-row">
            <span class="alg-examples-label">Try:</span>
            ${QUICK_EXAMPLES.map(ex => `
              <button class="alg-example-chip" data-example="${ex.label}" title="${ex.hint}">
                ${ex.label}
              </button>
            `).join('')}
          </div>

          <!-- Suggestions -->
          <div class="alg-suggestions" id="alg-suggestions" style="display:none;"></div>

          <!-- Result panel -->
          <div class="alg-result-area" id="alg-result-area" style="display:none;"></div>
        </div>

        <!-- ── TWO-COLUMN GRID ── -->
        <div class="alg-grid-2col">

          <!-- Left: Algebra Modules -->
          <div>
            <div class="alg-section-header">
              <h2 class="alg-section-title">Curriculum Modules</h2>
              <a href="#/modules" class="alg-see-all">All Modules ${SVG_ICONS.arrowRight}</a>
            </div>
            <div class="alg-modules-list" id="alg-modules-list">
              ${ALGEBRA_MODULES.map(m => `
                <a href="${m.href}" class="alg-module-card" id="mod-card-${m.id}">
                  <div class="alg-module-icon">${m.icon}</div>
                  <div class="alg-module-info">
                    <div class="alg-module-num">#${m.num}</div>
                    <div class="alg-module-name">${m.title}</div>
                    <div class="alg-module-desc">${m.desc}</div>
                  </div>
                  <div class="alg-module-arrow">${SVG_ICONS.arrowRight}</div>
                </a>
              `).join('')}
            </div>
          </div>

          <!-- Right: Tools + Recent -->
          <div class="alg-right-col">

            <!-- Algebra Tools -->
            <div class="alg-section-header">
              <h2 class="alg-section-title">Algebra Tools</h2>
            </div>
            <div class="alg-tools-grid">
              ${ALGEBRA_TOOLS.map(t => `
                <button class="alg-tool-card" data-tool="${t.id}" id="tool-${t.id}" title="${t.desc}">
                  <span class="alg-tool-icon">${t.icon}</span>
                  <span class="alg-tool-name">${t.title}</span>
                </button>
              `).join('')}
            </div>

            <!-- Recent Algebra Activity -->
            <div class="alg-section-header" style="margin-top:28px;">
              <h2 class="alg-section-title">Recent Activity</h2>
              <a href="#/history" class="alg-see-all">History ${SVG_ICONS.arrowRight}</a>
            </div>
            <div class="glass-panel alg-recent-panel">
              ${recentHistory.length === 0 ? `
                <div class="alg-empty-state">
                  <div class="alg-empty-icon">∿</div>
                  <div class="alg-empty-title">No algebra history yet</div>
                  <p class="alg-empty-desc">Use the solver above to start calculating</p>
                </div>
              ` : recentHistory.map(h => `
                <div class="alg-recent-item" data-reopen="${encodeURIComponent(h.expression)}">
                  <div class="alg-recent-meta">
                    <span class="alg-recent-module">${h.module}</span>
                    <span class="alg-recent-time">${h.timestamp}</span>
                  </div>
                  <div class="alg-recent-expr">${h.expression}</div>
                  <div class="alg-recent-result">= ${h.result}</div>
                </div>
              `).join('')}
            </div>

            <!-- Algebra Search -->
            <div class="alg-section-header" style="margin-top:28px;">
              <h2 class="alg-section-title">Search Algebra</h2>
            </div>
            <div class="alg-search-wrap glass-panel" style="padding:16px;">
              <div class="alg-search-input-wrap">
                ${SVG_ICONS.search}
                <input
                  type="text"
                  id="alg-search"
                  class="alg-search-input"
                  placeholder="Search: quadratic, nCr, AP, complex..."
                  aria-label="Search algebra topics"
                />
              </div>
              <div class="alg-search-results" id="alg-search-results"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _attachListeners() {
    const input = document.getElementById('alg-main-input');
    const clearBtn = document.getElementById('alg-input-clear');
    const typeBadge = document.getElementById('alg-type-badge');
    const suggestions = document.getElementById('alg-suggestions');

    // Live detection as user types
    this._on(input, 'input', () => {
      this.currentInput = input.value;
      this._updateDetection(input.value, typeBadge, suggestions);
    });

    this._on(input, 'keydown', (e) => {
      if (e.key === 'Enter') this._runOperation('solve');
    });

    // Clear
    this._on(clearBtn, 'click', () => {
      input.value = '';
      this.currentInput = '';
      typeBadge.textContent = '— Enter expression —';
      suggestions.style.display = 'none';
      document.getElementById('alg-result-area').style.display = 'none';
    });

    // Action buttons
    ['solve', 'simplify', 'factor', 'expand', 'graph'].forEach(op => {
      const btn = document.getElementById(`alg-btn-${op}`);
      this._on(btn, 'click', () => this._runOperation(op));
    });

    // Example chips
    document.querySelectorAll('.alg-example-chip').forEach(chip => {
      this._on(chip, 'click', () => {
        input.value = chip.dataset.example;
        this.currentInput = chip.dataset.example;
        this._updateDetection(chip.dataset.example, typeBadge, suggestions);
        input.focus();
      });
    });

    // Tool cards → open in solver with preset operation
    document.querySelectorAll('.alg-tool-card').forEach(card => {
      this._on(card, 'click', () => {
        const tool = card.dataset.tool;
        this._openToolWorkspace(tool);
      });
    });

    // Recent item reopen
    document.querySelectorAll('.alg-recent-item').forEach(item => {
      this._on(item, 'click', () => {
        const expr = decodeURIComponent(item.dataset.reopen || '');
        if (expr && input) {
          input.value = expr;
          this.currentInput = expr;
          this._updateDetection(expr, typeBadge, suggestions);
          this._runOperation('solve');
          input.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Algebra search
    const searchInput = document.getElementById('alg-search');
    this._on(searchInput, 'input', () => {
      this._runSearch(searchInput.value);
    });
  }

  _updateDetection(expr, badge, suggestionsEl) {
    if (!expr.trim()) {
      badge.textContent = '— Enter expression —';
      suggestionsEl.style.display = 'none';
      return;
    }

    const detection = AlgebraMathEngine.detectExpressionType(expr);
    this.detectedType = detection;

    const typeLabels = {
      'linear-equation': 'Linear Equation',
      'quadratic-equation': 'Quadratic Equation',
      'equation': 'Equation',
      'inequality': 'Inequality',
      'product': 'Product of Factors',
      'quadratic-expression': 'Quadratic Expression',
      'like-terms': 'Like Terms',
      'trigonometric': 'Trigonometric',
      'polynomial': 'Polynomial',
      'expression': 'Expression',
    };

    badge.textContent = typeLabels[detection.type] || detection.type;

    if (detection.suggestions && detection.suggestions.length > 0) {
      suggestionsEl.innerHTML = `
        <span class="alg-suggest-label">Suggested operations:</span>
        ${detection.suggestions.map(s => `
          <button class="alg-suggest-chip" data-suggestion="${s}">${s}</button>
        `).join('')}
      `;
      suggestionsEl.style.display = 'flex';

      // Attach suggestion clicks
      suggestionsEl.querySelectorAll('.alg-suggest-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const suggestion = chip.dataset.suggestion.toLowerCase();
          const opMap = {
            'factor': 'factor', 'factorize': 'factor',
            'solve equation': 'solve', 'solve': 'solve',
            'simplify': 'simplify', 'expand': 'expand',
            'graph': 'graph', 'discriminant': 'solve',
            'find roots': 'solve',
          };
          const op = opMap[suggestion] || 'solve';
          this._runOperation(op);
        });
      });
    } else {
      suggestionsEl.style.display = 'none';
    }
  }

  _runOperation(op) {
    const input = document.getElementById('alg-main-input');
    const expr = (input && input.value.trim()) || this.currentInput.trim();
    if (!expr) { showToast('Please enter an expression first.', 'info'); return; }

    if (op === 'graph') {
      window.location.hash = `#/graph`;
      showToast('Open the Graph Calculator and enter: ' + expr, 'info');
      return;
    }

    let result;
    switch (op) {
      case 'solve':
        // Auto-detect and solve
        if (expr.includes('=') && !expr.includes('<=') && !expr.includes('>=')) {
          const isQuad = /x\^2|x²/.test(expr);
          result = isQuad ? AlgebraMathEngine.solveQuadratic(expr) : AlgebraMathEngine.solveLinear(expr);
        } else if (/[<>]/.test(expr) || expr.includes('≤') || expr.includes('≥')) {
          result = AlgebraMathEngine.solveInequality(expr);
        } else {
          result = AlgebraMathEngine.quickSolve(expr, 'factor');
        }
        break;
      case 'simplify':
        result = AlgebraMathEngine.simplifyLikeTerms(expr);
        break;
      case 'factor':
        result = AlgebraMathEngine.factorize(expr);
        break;
      case 'expand':
        result = AlgebraMathEngine.expand(expr);
        break;
      default:
        result = AlgebraMathEngine.quickSolve(expr);
    }

    this.currentResult = result;
    this._renderResult(result, expr, op);

    // Save to history
    if (result && result.success) {
      store.addHistoryItem(expr, result.result, 'Algebra · ' + (result.operation || op), 'algebra');
    }
  }

  _renderResult(result, expr, op) {
    const area = document.getElementById('alg-result-area');
    if (!area) return;
    area.style.display = 'block';

    if (!result || !result.success) {
      area.innerHTML = `
        <div class="alg-error-panel">
          <div class="alg-error-icon">⚠</div>
          <div>
            <div class="alg-error-title">Cannot Process Expression</div>
            <div class="alg-error-msg">${result ? result.error : 'Unknown error'}</div>
          </div>
        </div>
        ${result && result.steps && result.steps.length > 1 ? this._renderSteps(result.steps) : ''}
      `;
      return;
    }

    const discriminantHtml = result.discriminant !== undefined ? `
      <div class="alg-result-meta-grid">
        <div class="alg-meta-item">
          <div class="alg-meta-label">a</div>
          <div class="alg-meta-val">${result.a}</div>
        </div>
        <div class="alg-meta-item">
          <div class="alg-meta-label">b</div>
          <div class="alg-meta-val">${result.b}</div>
        </div>
        <div class="alg-meta-item">
          <div class="alg-meta-label">c</div>
          <div class="alg-meta-val">${result.c}</div>
        </div>
        <div class="alg-meta-item">
          <div class="alg-meta-label">D = b²-4ac</div>
          <div class="alg-meta-val" style="color:${result.discriminant > 0 ? '#22c55e' : result.discriminant === 0 ? '#B89A5A' : '#ef4444'};">
            ${result.discriminant}
          </div>
        </div>
      </div>
      <div class="alg-disc-class">${result.discriminantClass || ''}</div>
    ` : '';

    const intervalHtml = result.interval ? `
      <div class="alg-result-interval">
        <span class="alg-meta-label">Interval Notation:</span>
        <span class="alg-interval-val">${result.interval}</span>
      </div>
    ` : '';

    area.innerHTML = `
      <div class="alg-result-panel result-animate">
        <!-- Operation label -->
        <div class="alg-result-op-label">${result.operation || op}</div>

        <!-- Expression -->
        <div class="alg-result-expr">${expr}</div>
        <div class="alg-result-arrow">↓</div>

        <!-- Main Answer -->
        <div class="alg-result-answer">${result.result}</div>

        ${discriminantHtml}
        ${intervalHtml}

        <!-- Action bar -->
        <div class="alg-result-actions">
          <button class="glass-btn glass-btn-primary alg-copy-btn" id="alg-copy-answer">
            ${SVG_ICONS.copy} Copy Answer
          </button>
          <button class="glass-btn glass-btn-outline alg-steps-toggle" id="alg-steps-toggle">
            Show Steps (${result.steps ? result.steps.length : 0})
          </button>
          ${!result.isComplex ? `
            <a href="#/graph" class="glass-btn glass-btn-outline">
              ${SVG_ICONS.graph} Graph
            </a>
          ` : ''}
        </div>

        <!-- Steps (collapsible) -->
        <div class="alg-steps-container" id="alg-steps-container" style="display:none;">
          ${this._renderSteps(result.steps || [])}
        </div>
      </div>
    `;

    // Attach copy + toggle
    const copyBtn = document.getElementById('alg-copy-answer');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyToClipboard(result.result, 'Answer copied!');
      });
    }

    const stepsToggle = document.getElementById('alg-steps-toggle');
    const stepsContainer = document.getElementById('alg-steps-container');
    if (stepsToggle && stepsContainer) {
      stepsToggle.addEventListener('click', () => {
        const isOpen = stepsContainer.style.display !== 'none';
        stepsContainer.style.display = isOpen ? 'none' : 'block';
        stepsToggle.textContent = isOpen
          ? `Show Steps (${result.steps ? result.steps.length : 0})`
          : `Hide Steps`;
      });
    }
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

  _openToolWorkspace(tool) {
    const toolRoutes = {
      'equation':     '#/algebra/equation-solver',
      'factor':       '#/algebra/factorization',
      'simplify':     '#/algebra/simplification',
      'expand':       '#/algebra/expansion',
      'poly':         '#/algebra/polynomial',
      'evaluator':    '#/algebra/evaluator',
      'substitution': '#/algebra/substitution',
      'ratio-prop':   '#/algebra/ratio-proportion',
      'log-exp':      '#/algebra/log-exp',
      'inequality':   '#/modules/linear-inequalities',
      'complex':      '#/modules/complex-numbers',
      'trig-id':      '#/modules/trigonometric-functions',
    };

    const route = toolRoutes[tool];
    if (route) {
      window.location.hash = route;
    } else {
      // Focus the solver and set a suggestion
      const input = document.getElementById('alg-main-input');
      if (input) input.focus();
    }
  }

  _runSearch(query) {
    const resultsEl = document.getElementById('alg-search-results');
    if (!resultsEl) return;
    if (!query.trim()) { resultsEl.innerHTML = ''; return; }

    const q = query.toLowerCase();
    const searchIndex = [
      { type: 'Module', title: 'Sets & Set Theory', desc: 'Union, intersection, power set, Venn diagram', href: '#/modules/sets', tags: ['sets', 'union', 'intersection', 'venn', 'complement'] },
      { type: 'Module', title: 'Relations & Functions', desc: 'Domain, range, composition, bijective', href: '#/modules/relations-functions', tags: ['function', 'relation', 'domain', 'range', 'bijective', 'composition'] },
      { type: 'Module', title: 'Trigonometric Functions', desc: 'sin, cos, tan, graphs, identities', href: '#/modules/trigonometric-functions', tags: ['trig', 'sin', 'cos', 'tan', 'sine', 'cosine', 'tangent', 'identity'] },
      { type: 'Module', title: 'Complex Numbers', desc: 'a+bi, modulus, argument, quadratic', href: '#/modules/complex-numbers', tags: ['complex', 'imaginary', 'argand', 'quadratic', 'modulus', 'polar'] },
      { type: 'Module', title: 'Linear Inequalities', desc: 'Solve x>a, x≤b, interval notation', href: '#/modules/linear-inequalities', tags: ['inequality', 'linear', 'interval', 'greater', 'less', 'solve'] },
      { type: 'Module', title: 'Permutations & Combinations', desc: 'nPr, nCr, factorial, selection', href: '#/modules/permutations-combinations', tags: ['permutation', 'combination', 'ncr', 'npr', 'factorial', 'selection', 'arrangement'] },
      { type: 'Module', title: 'Binomial Theorem', desc: 'Expansion, Pascal triangle, general term', href: '#/modules/binomial-theorem', tags: ['binomial', 'pascal', 'expansion', 'general term', '(a+b)^n'] },
      { type: 'Module', title: 'Sequences & Series', desc: 'AP, GP, nth term, sum, mean', href: '#/modules/sequence-series', tags: ['sequence', 'series', 'ap', 'gp', 'arithmetic', 'geometric', 'progression', 'nth term'] },
      { type: 'Formula', title: 'Quadratic Formula', desc: 'x = (-b ± √(b²-4ac)) / 2a', href: '#/formulas', tags: ['quadratic', 'formula', 'roots', 'discriminant'] },
      { type: 'Formula', title: 'nCr = n! / r!(n-r)!', desc: 'Combination formula', href: '#/modules/permutations-combinations', tags: ['ncr', 'combination', 'choose'] },
      { type: 'Formula', title: 'sin²x + cos²x = 1', desc: 'Pythagorean identity', href: '#/modules/trigonometric-functions', tags: ['pythagorean', 'identity', 'trig', 'sin', 'cos'] },
      { type: 'Formula', title: 'Sum of AP: n/2(2a + (n-1)d)', desc: 'Arithmetic progression sum', href: '#/modules/sequence-series', tags: ['ap', 'arithmetic', 'sum', 'progression'] },
      { type: 'Formula', title: 'Sum of GP: a(rⁿ-1)/(r-1)', desc: 'Geometric progression sum', href: '#/modules/sequence-series', tags: ['gp', 'geometric', 'sum', 'ratio'] },
    ];

    const matches = searchIndex.filter(item =>
      item.tags.some(tag => tag.includes(q)) ||
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      resultsEl.innerHTML = `<div class="alg-search-empty">No results for "${query}"</div>`;
      return;
    }

    resultsEl.innerHTML = matches.map(m => `
      <a href="${m.href}" class="alg-search-result-item">
        <span class="alg-search-type">${m.type}</span>
        <div>
          <div class="alg-search-result-title">${m.title}</div>
          <div class="alg-search-result-desc">${m.desc}</div>
        </div>
        ${SVG_ICONS.arrowRight}
      </a>
    `).join('');
  }
}
