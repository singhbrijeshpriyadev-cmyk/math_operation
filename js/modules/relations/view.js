/**
 * OG - Module 02: Relations & Functions View Component
 * Premium Liquid Glass UI for Module 02: Relations & Functions
 * ES6 Module
 */

import { RelationsMathEngine } from '../../math/relations.js';
import { MappingVisualizer } from './mapping_visualizer.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { store } from '../../state.js';

export const RELATIONS_PRESETS = [
  {
    id: 'bijective',
    label: 'Bijective f(x) = 2x + 1',
    tab: 'function',
    setA: '1, 2, 3, 4',
    setB: '3, 5, 7, 9',
    mode: 'formula',
    formula: '2*x + 1',
    pairs: '(1, 3), (2, 5), (3, 7), (4, 9)'
  },
  {
    id: 'many-to-one',
    label: 'Many-to-One f(x) = x²',
    tab: 'function',
    setA: '-2, -1, 1, 2',
    setB: '1, 4',
    mode: 'formula',
    formula: 'x^2',
    pairs: '(-2, 4), (-1, 1), (1, 1), (2, 4)'
  },
  {
    id: 'not-onto',
    label: 'Injective but Not Onto',
    tab: 'function',
    setA: '1, 2, 3',
    setB: '2, 4, 6, 8, 10',
    mode: 'pairs',
    formula: '2*x',
    pairs: '(1, 2), (2, 4), (3, 6)'
  },
  {
    id: 'not-function',
    label: 'Violation: Not a Function (One-to-Many)',
    tab: 'function',
    setA: '1, 2, 3',
    setB: 'a, b, c',
    mode: 'pairs',
    formula: '',
    pairs: '(1, a), (1, b), (2, c), (3, c)'
  },
  {
    id: 'equivalence',
    label: 'Equivalence Relation (R, S, T)',
    tab: 'relation',
    setA: '1, 2, 3',
    pairs: '(1, 1), (2, 2), (3, 3), (1, 2), (2, 1)'
  },
  {
    id: 'reflexive-only',
    label: 'Reflexive & Symmetric (Not Transitive)',
    tab: 'relation',
    setA: '1, 2, 3',
    pairs: '(1, 1), (2, 2), (3, 3), (1, 2), (2, 1), (2, 3), (3, 2)'
  }
];

export class RelationsView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    // State
    this.activeTab = 'function'; // 'function' | 'relation' | 'composition'
    this.functionInputMode = 'formula'; // 'formula' | 'pairs'

    // Form inputs state
    this.funcState = {
      setA: '1, 2, 3, 4',
      setB: '3, 5, 7, 9',
      formula: '2*x + 1',
      pairs: '(1, 3), (2, 5), (3, 7), (4, 9)'
    };

    this.relState = {
      setA: '1, 2, 3',
      pairs: '(1, 1), (2, 2), (3, 3), (1, 2), (2, 1)'
    };

    this.compState = {
      setA: '1, 2, 3',
      setB: '2, 4, 6',
      setC: '5, 9, 13',
      fPairs: '(1, 2), (2, 4), (3, 6)',
      gPairs: '(2, 5), (4, 9), (6, 13)'
    };

    this.lastResultSummary = '';
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.initVisualizer();
    this.calculate();
  }

  destroy() {
    this.visualizer = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="view-animate-in relations-module-container" style="max-width: 1400px; margin: 0 auto; padding-bottom: 60px;">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #02: Relations & Functions</span>
        </nav>

        <!-- Module Header Hero -->
        <div class="glass-surface" style="padding: 24px 30px; margin-bottom: 24px; border-radius: var(--radius-xl); position: relative; overflow: hidden;">
          <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
            <span class="module-number-pill">Module #02</span>
            <span class="badge badge-algebra">Algebra</span>
            <span class="badge" style="background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
              Mappings & Digraphs
            </span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 3.2vw, 2.7rem); font-weight: 800; letter-spacing: -0.02em; margin: 0 0 8px 0; color: var(--text-white);">
                Relations & Functions
              </h1>
              <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                Analyze Cartesian products, binary relation equivalence classes (reflexive, symmetric, transitive),
                function mappings (injective, surjective, bijective, invertible), and composition with interactive mapping diagrams.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 64px; height: 64px; font-size: 1.8rem;">
              f(x)
            </div>
          </div>

          <!-- Tab Navigation Bar -->
          <div style="display: flex; gap: 10px; margin-top: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 12px;">
            <button class="glass-button rel-tab-btn ${this.activeTab === 'function' ? 'active glass-button-primary' : ''}" data-tab="function" style="padding: 8px 18px;">
              1. Function Mapping (f: A → B)
            </button>
            <button class="glass-button rel-tab-btn ${this.activeTab === 'relation' ? 'active glass-button-primary' : ''}" data-tab="relation" style="padding: 8px 18px;">
              2. Relation Properties (R ⊆ A × A)
            </button>
            <button class="glass-button rel-tab-btn ${this.activeTab === 'composition' ? 'active glass-button-primary' : ''}" data-tab="composition" style="padding: 8px 18px;">
              3. Composition (g ∘ f) & Cartesian
            </button>
          </div>
        </div>

        <!-- Presets Bar -->
        <div class="glass-panel" style="padding: 14px 20px; margin-bottom: 24px; border-radius: var(--radius-lg);">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em;">
            Instant Presets:
          </div>
          <div class="calculus-preset-bar" id="rel-presets-container" style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${RELATIONS_PRESETS.map(p => `
              <button class="preset-chip" data-preset-id="${p.id}" style="font-size: 0.82rem;">
                ${p.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Error Alert Banner -->
        <div id="rel-error-banner" style="display: none; margin-bottom: 20px; padding: 12px 18px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.4); color: #fecdd3; font-size: 0.9rem;"></div>

        <!-- Main Workspace (2-Column Grid) -->
        <div class="calculus-workspace">
          <!-- Left Column: Controls & Solutions -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <!-- Dynamic Controls Card based on Active Tab -->
            <div class="calculus-card" id="rel-input-card">
              <!-- Rendered via updateInputCard() -->
            </div>

            <!-- Results & Derivations Target -->
            <div id="rel-results-container"></div>
          </div>

          <!-- Right Column: Interactive Canvas Visualizer -->
          <div>
            <div class="calculus-card" style="padding: 16px; position: sticky; top: 90px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div class="calculus-card-title" id="canvas-card-title" style="margin: 0;">Interactive Mapping Diagram</div>
                <div style="display: flex; gap: 8px;">
                  <button id="btn-copy-result" class="glass-button" style="padding: 4px 10px; font-size: 0.78rem;" title="Copy mathematical result">
                    ${SVG_ICONS.copy} Copy
                  </button>
                  <button id="btn-clear-rel" class="glass-button" style="padding: 4px 10px; font-size: 0.78rem; color: #f43f5e;" title="Clear inputs">
                    Clear
                  </button>
                </div>
              </div>
              <div style="border-radius: 12px; overflow: hidden; border: 1.5px solid rgba(184, 154, 90, 0.3); background: #E8E0D2;">
                <canvas id="relations-canvas" style="display: block; width: 100%; height: 380px;"></canvas>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 0.76rem; color: var(--text-muted);">
                <span id="canvas-legend-desc">Domain A (Gold) ➔ Codomain B (Navy)</span>
                <span id="canvas-status-badge" style="color: #0E1D61; font-weight: 700;">Mapping Visualizer Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.updateInputCard();
  }

  updateInputCard() {
    const card = document.getElementById('rel-input-card');
    if (!card) return;

    if (this.activeTab === 'function') {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div class="calculus-card-title" style="margin: 0;">Function Specification (f: A → B)</div>
          <div style="display: flex; gap: 6px;">
            <button class="glass-button func-mode-btn ${this.functionInputMode === 'formula' ? 'active' : ''}" data-mode="formula" style="padding: 4px 10px; font-size: 0.78rem;">
              Formula f(x)
            </button>
            <button class="glass-button func-mode-btn ${this.functionInputMode === 'pairs' ? 'active' : ''}" data-mode="pairs" style="padding: 4px 10px; font-size: 0.78rem;">
              Ordered Pairs
            </button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="calculus-input-group">
              <label class="calculus-label">Domain Set A</label>
              <input type="text" id="func-set-a" class="calculus-input" value="${this.funcState.setA}" placeholder="e.g. 1, 2, 3, 4" />
            </div>
            <div class="calculus-input-group">
              <label class="calculus-label">Codomain Set B</label>
              <input type="text" id="func-set-b" class="calculus-input" value="${this.funcState.setB}" placeholder="e.g. 3, 5, 7, 9" />
            </div>
          </div>

          ${this.functionInputMode === 'formula' ? `
            <div class="calculus-input-group">
              <label class="calculus-label">Function Formula f(x)</label>
              <input type="text" id="func-formula" class="calculus-input" value="${this.funcState.formula}" placeholder="e.g. 2*x + 1 or x^2" />
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                Evaluates formula for every element in Domain A to form mapping pairs.
              </span>
            </div>
          ` : `
            <div class="calculus-input-group">
              <label class="calculus-label">Mapping Pairs (a, b)</label>
              <input type="text" id="func-pairs" class="calculus-input" value="${this.funcState.pairs}" placeholder="e.g. (1, 3), (2, 5), (3, 7)" />
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                Format: (x, y) pairs separated by commas.
              </span>
            </div>
          `}

          <button id="btn-rel-submit" class="glass-button glass-button-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 6px;">
            Analyze Function & Verify Injectivity / Surjectivity
          </button>
        </div>
      `;
    } else if (this.activeTab === 'relation') {
      card.innerHTML = `
        <div class="calculus-card-title" style="margin-bottom: 14px;">Binary Relation on Set A (R ⊆ A × A)</div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="calculus-input-group">
            <label class="calculus-label">Ground Set A</label>
            <input type="text" id="rel-set-a" class="calculus-input" value="${this.relState.setA}" placeholder="e.g. 1, 2, 3" />
          </div>

          <div class="calculus-input-group">
            <label class="calculus-label">Relation Ordered Pairs R</label>
            <input type="text" id="rel-pairs" class="calculus-input" value="${this.relState.pairs}" placeholder="e.g. (1, 1), (2, 2), (1, 2), (2, 1)" />
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
              Pairs (a, b) in R. Enter pairs to test Reflexive, Symmetric, and Transitive properties.
            </span>
          </div>

          <button id="btn-rel-submit" class="glass-button glass-button-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 6px;">
            Verify Reflexive, Symmetric, Transitive & Equivalence
          </button>
        </div>
      `;
    } else if (this.activeTab === 'composition') {
      card.innerHTML = `
        <div class="calculus-card-title" style="margin-bottom: 14px;">Function Composition (g ∘ f): A → C</div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div class="calculus-input-group">
              <label class="calculus-label">Set A</label>
              <input type="text" id="comp-set-a" class="calculus-input" value="${this.compState.setA}" />
            </div>
            <div class="calculus-input-group">
              <label class="calculus-label">Set B</label>
              <input type="text" id="comp-set-b" class="calculus-input" value="${this.compState.setB}" />
            </div>
            <div class="calculus-input-group">
              <label class="calculus-label">Set C</label>
              <input type="text" id="comp-set-c" class="calculus-input" value="${this.compState.setC}" />
            </div>
          </div>

          <div class="calculus-input-group">
            <label class="calculus-label">Function f: A → B Pairs</label>
            <input type="text" id="comp-f-pairs" class="calculus-input" value="${this.compState.fPairs}" />
          </div>

          <div class="calculus-input-group">
            <label class="calculus-label">Function g: B → C Pairs</label>
            <input type="text" id="comp-g-pairs" class="calculus-input" value="${this.compState.gPairs}" />
          </div>

          <button id="btn-rel-submit" class="glass-button glass-button-primary" style="width: 100%; justify-content: center; padding: 12px; margin-top: 6px;">
            Compute (g ∘ f) & Cartesian Products
          </button>
        </div>
      `;
    }
  }

  initVisualizer() {
    const canvas = document.getElementById('relations-canvas');
    if (canvas) {
      this.visualizer = new MappingVisualizer(canvas);
    }
  }

  attachEventListeners() {
    // Tab switching
    this.container.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.rel-tab-btn');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        if (tab && tab !== this.activeTab) {
          this.activeTab = tab;
          this.container.querySelectorAll('.rel-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
            btn.classList.toggle('glass-button-primary', btn.getAttribute('data-tab') === tab);
          });
          this.updateInputCard();
          this.calculate();
        }
      }

      // Function Mode Switch
      const modeBtn = e.target.closest('.func-mode-btn');
      if (modeBtn) {
        const mode = modeBtn.getAttribute('data-mode');
        if (mode && mode !== this.functionInputMode) {
          this.functionInputMode = mode;
          this.updateInputCard();
          this.calculate();
        }
      }

      // Presets
      const presetBtn = e.target.closest('[data-preset-id]');
      if (presetBtn) {
        const pId = presetBtn.getAttribute('data-preset-id');
        const p = RELATIONS_PRESETS.find(item => item.id === pId);
        if (p) {
          this.activeTab = p.tab;
          this.container.querySelectorAll('.rel-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === p.tab);
            btn.classList.toggle('glass-button-primary', btn.getAttribute('data-tab') === p.tab);
          });

          if (p.tab === 'function') {
            this.functionInputMode = p.mode;
            this.funcState.setA = p.setA;
            this.funcState.setB = p.setB;
            this.funcState.formula = p.formula;
            this.funcState.pairs = p.pairs;
          } else if (p.tab === 'relation') {
            this.relState.setA = p.setA;
            this.relState.pairs = p.pairs;
          }

          this.updateInputCard();
          this.calculate();
        }
      }

      // Copy Result
      if (e.target.closest('#btn-copy-result')) {
        if (this.lastResultSummary) {
          copyToClipboard(this.lastResultSummary);
          showToast('Result copied to clipboard!');
        } else {
          showToast('No calculation result to copy yet.', 'info');
        }
      }

      // Clear
      if (e.target.closest('#btn-clear-rel')) {
        this.clearInputs();
      }

      // Submit
      if (e.target.closest('#btn-rel-submit')) {
        this.gatherInputsAndCalculate();
      }
    });

    // Handle Enter key in inputs
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        this.gatherInputsAndCalculate();
      }
    });
  }

  clearInputs() {
    if (this.activeTab === 'function') {
      this.funcState = { setA: '', setB: '', formula: '', pairs: '' };
    } else if (this.activeTab === 'relation') {
      this.relState = { setA: '', pairs: '' };
    } else {
      this.compState = { setA: '', setB: '', setC: '', fPairs: '', gPairs: '' };
    }
    this.updateInputCard();
    const resCont = document.getElementById('rel-results-container');
    if (resCont) resCont.innerHTML = '';
    const errBanner = document.getElementById('rel-error-banner');
    if (errBanner) errBanner.style.display = 'none';
    if (this.visualizer) {
      this.visualizer.setData(null);
    }
    showToast('Inputs cleared.', 'info');
  }

  gatherInputsAndCalculate() {
    if (this.activeTab === 'function') {
      const a = document.getElementById('func-set-a')?.value || '';
      const b = document.getElementById('func-set-b')?.value || '';
      const form = document.getElementById('func-formula')?.value || '';
      const pairs = document.getElementById('func-pairs')?.value || '';
      this.funcState.setA = a;
      this.funcState.setB = b;
      this.funcState.formula = form;
      this.funcState.pairs = pairs;
    } else if (this.activeTab === 'relation') {
      const a = document.getElementById('rel-set-a')?.value || '';
      const pairs = document.getElementById('rel-pairs')?.value || '';
      this.relState.setA = a;
      this.relState.pairs = pairs;
    } else if (this.activeTab === 'composition') {
      const a = document.getElementById('comp-set-a')?.value || '';
      const b = document.getElementById('comp-set-b')?.value || '';
      const c = document.getElementById('comp-set-c')?.value || '';
      const f = document.getElementById('comp-f-pairs')?.value || '';
      const g = document.getElementById('comp-g-pairs')?.value || '';
      this.compState = { setA: a, setB: b, setC: c, fPairs: f, gPairs: g };
    }

    this.calculate();
  }

  showError(msg) {
    const errBanner = document.getElementById('rel-error-banner');
    if (errBanner) {
      errBanner.textContent = msg;
      errBanner.style.display = 'block';
    }
    const resCont = document.getElementById('rel-results-container');
    if (resCont) {
      resCont.innerHTML = `<div class="calculus-error">${msg}</div>`;
    }
  }

  clearError() {
    const errBanner = document.getElementById('rel-error-banner');
    if (errBanner) errBanner.style.display = 'none';
  }

  calculate() {
    this.clearError();
    const resultsContainer = document.getElementById('rel-results-container');
    if (!resultsContainer) return;

    if (this.activeTab === 'function') {
      this.calculateFunction(resultsContainer);
    } else if (this.activeTab === 'relation') {
      this.calculateRelation(resultsContainer);
    } else if (this.activeTab === 'composition') {
      this.calculateComposition(resultsContainer);
    }
  }

  calculateFunction(resultsContainer) {
    const formulaStr = this.functionInputMode === 'formula' ? this.funcState.formula : null;
    const pairsStr = this.functionInputMode === 'pairs' ? this.funcState.pairs : null;

    const res = RelationsMathEngine.analyzeFunction(
      this.funcState.setA,
      this.funcState.setB,
      pairsStr,
      formulaStr
    );

    if (!res.success) {
      this.showError(res.error);
      return;
    }

    const d = res.result;

    // Update Visualizer
    if (this.visualizer) {
      this.visualizer.setData({
        setA: d.setA,
        setB: d.setB,
        pairs: d.pairs,
        isFunction: d.isFunction,
        isInjective: d.isInjective,
        isSurjective: d.isSurjective,
        isBijective: d.isBijective,
        collisionItems: d.collisionItems,
        unmappedElements: d.unmappedElements,
        oneToManyElements: d.oneToManyElements
      }, 'function');
    }

    // Build Badges
    const badges = [];
    if (!d.isFunction) {
      badges.push(`<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;">Not a Function</span>`);
    } else {
      badges.push(`<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;">Valid Function</span>`);
      if (d.isBijective) {
        badges.push(`<span class="badge" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid #fbbf24;">Bijective ★</span>`);
      } else {
        if (d.isInjective) badges.push(`<span class="badge" style="background: rgba(184, 154, 90, 0.15); color: #0E1D61; border: 1px solid #B89A5A;">Injective (1-1)</span>`);
        if (d.isSurjective) badges.push(`<span class="badge" style="background: rgba(14, 29, 97, 0.12); color: #0E1D61; border: 1px solid #0E1D61;">Surjective (Onto)</span>`);
      }
    }

    // Summary text for copying and history
    this.lastResultSummary = d.isFunction
      ? `Function f: A → B\nPairs: ${RelationsMathEngine.formatPairs(d.pairs)}\nInjective: ${d.isInjective ? 'Yes' : 'No'}\nSurjective: ${d.isSurjective ? 'Yes' : 'No'}\nBijective: ${d.isBijective ? 'Yes' : 'No'}\nRange: { ${d.range.join(', ')} }`
      : `Mapping is NOT a valid function: ${d.unmappedElements.length > 0 ? `Unmapped: ${d.unmappedElements.join(', ')}` : ''}`;

    // Add to History
    store.addHistoryItem(
      `f: A → B (${d.pairs.length} pairs)`,
      d.isBijective ? 'Bijective (1-1 & Onto)' : d.isFunction ? (d.isInjective ? 'Injective' : d.isSurjective ? 'Surjective' : 'Many-to-One') : 'Not a Function',
      'Relations & Functions'
    );

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; animation: fadeIn 0.3s ease;">
        <!-- Hero Outcomes Card -->
        <div class="calculus-result-hero">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="result-hero-label">Function Mapping Outcomes</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">${badges.join('')}</div>
          </div>
          <div class="result-hero-value" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 1.15rem;">
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">Injective (One-to-One)</div>
              <div style="color: ${d.isInjective ? '#0E1D61' : '#ef4444'}; font-weight: 700;">
                ${d.isInjective ? 'YES (1-to-1)' : 'NO (Many-to-One)'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">Surjective (Onto)</div>
              <div style="color: ${d.isSurjective ? '#0E1D61' : '#ef4444'}; font-weight: 700;">
                ${d.isSurjective ? 'YES (Range = B)' : 'NO (Into)'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">Bijective & Invertible</div>
              <div style="color: ${d.isBijective ? '#B89A5A' : 'var(--text-white)'}; font-weight: 700;">
                ${d.isBijective ? 'YES (f⁻¹ exists)' : 'NO'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">Range / Image Set f(A)</div>
              <div style="color: #0E1D61; font-weight: 700; font-family: monospace;">
                { ${d.range.join(', ')} }
              </div>
            </div>
          </div>
        </div>

        ${d.isBijective ? `
          <div class="calculus-card" style="padding: 16px; border-color: rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.05);">
            <div style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; margin-bottom: 6px;">
              ★ Inverse Function f⁻¹: B → A
            </div>
            <div style="font-family: monospace; font-size: 1rem; color: var(--text-white);">
              f⁻¹ = ${RelationsMathEngine.formatPairs(d.inversePairs)}
            </div>
          </div>
        ` : ''}

        <!-- Derivation Steps -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Mathematical Derivation & Proofs
          </h3>
          ${res.steps.map(step => `
            <div class="step-card">
              <div class="step-card-body">${step}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  calculateRelation(resultsContainer) {
    const res = RelationsMathEngine.analyzeRelation(
      this.relState.setA,
      this.relState.pairs
    );

    if (!res.success) {
      this.showError(res.error);
      return;
    }

    const d = res.result;

    // Update Visualizer
    if (this.visualizer) {
      this.visualizer.setData({
        setA: d.setA,
        pairs: d.pairs,
        isReflexive: d.isReflexive,
        isSymmetric: d.isSymmetric,
        isTransitive: d.isTransitive,
        isEquivalence: d.isEquivalence
      }, 'relation');
    }

    // Badges
    const badges = [];
    if (d.isEquivalence) {
      badges.push(`<span class="badge" style="background: rgba(184, 154, 90, 0.2); color: #0E1D61; border: 1.5px solid #B89A5A; font-weight: 700;">Equivalence Relation ★</span>`);
    } else {
      if (d.isReflexive) badges.push(`<span class="badge" style="background: rgba(184, 154, 90, 0.15); color: #0E1D61; border: 1px solid #B89A5A;">Reflexive</span>`);
      if (d.isSymmetric) badges.push(`<span class="badge" style="background: rgba(14, 29, 97, 0.12); color: #0E1D61; border: 1px solid #0E1D61;">Symmetric</span>`);
      if (d.isTransitive) badges.push(`<span class="badge" style="background: rgba(184, 154, 90, 0.15); color: #0E1D61; border: 1px solid #B89A5A;">Transitive</span>`);
    }

    this.lastResultSummary = `Relation R on Set A\nPairs: ${RelationsMathEngine.formatPairs(d.pairs)}\nReflexive: ${d.isReflexive ? 'Yes' : 'No'}\nSymmetric: ${d.isSymmetric ? 'Yes' : 'No'}\nTransitive: ${d.isTransitive ? 'Yes' : 'No'}\nEquivalence: ${d.isEquivalence ? 'Yes' : 'No'}`;

    store.addHistoryItem(
      `R on Set A (${d.pairs.length} pairs)`,
      d.isEquivalence ? 'Equivalence Relation' : `R:${d.isReflexive ? 'Y' : 'N'} S:${d.isSymmetric ? 'Y' : 'N'} T:${d.isTransitive ? 'Y' : 'N'}`,
      'Relations & Functions'
    );

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; animation: fadeIn 0.3s ease;">
        <!-- Hero Outcomes Card -->
        <div class="calculus-result-hero">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="result-hero-label">Relation Properties Summary</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">${badges.join('')}</div>
          </div>
          <div class="result-hero-value" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; font-size: 1.15rem;">
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">Reflexive</div>
              <div style="color: ${d.isReflexive ? '#10b981' : '#ef4444'}; font-weight: 700;">
                ${d.isReflexive ? 'YES' : 'NO'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">Symmetric</div>
              <div style="color: ${d.isSymmetric ? '#10b981' : '#ef4444'}; font-weight: 700;">
                ${d.isSymmetric ? 'YES' : 'NO'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 2px;">Transitive</div>
              <div style="color: ${d.isTransitive ? '#10b981' : '#ef4444'}; font-weight: 700;">
                ${d.isTransitive ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </div>

        ${d.isEquivalence && d.equivalenceClasses.length > 0 ? `
          <div class="calculus-card" style="padding: 16px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #10b981; margin-bottom: 8px;">
              Equivalence Classes Partition
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              ${d.equivalenceClasses.map(eq => `
                <div style="padding: 6px 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); font-family: monospace;">
                  [${eq.rep}] = ${eq.formatted}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Derivation Steps -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Mathematical Derivation & Proofs
          </h3>
          ${res.steps.map(step => `
            <div class="step-card">
              <div class="step-card-body">${step}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  calculateComposition(resultsContainer) {
    const compRes = RelationsMathEngine.composeFunctions(
      this.compState.fPairs,
      this.compState.gPairs,
      this.compState.setA,
      this.compState.setB,
      this.compState.setC
    );

    const cartRes = RelationsMathEngine.cartesianProduct(
      this.compState.setA,
      this.compState.setB
    );

    if (!compRes.success) {
      this.showError(compRes.error);
      return;
    }

    const c = compRes.result;

    this.lastResultSummary = `Composite Function (g ∘ f): A → C\nResult: ${c.formattedComposite}\n|A × B| = ${cartRes.result.totalPairsCount}`;

    store.addHistoryItem(
      `(g ∘ f) on Set A`,
      c.formattedComposite,
      'Relations & Functions'
    );

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; animation: fadeIn 0.3s ease;">
        <!-- Hero Outcomes Card -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Composition Outcome: (g ∘ f): A → C</div>
          <div class="result-hero-value" style="font-size: 1.5rem; color: #E8E0D2; font-family: monospace; font-weight: 700;">
            (g ∘ f) = ${c.formattedComposite}
          </div>
        </div>

        <!-- Cartesian Product Card -->
        <div class="calculus-card" style="padding: 16px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #B89A5A; margin-bottom: 6px;">
            Cartesian Product A × B Metrics
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
            <div>• Cardinality |A × B| = <b>${cartRes.result.totalPairsCount}</b> pairs</div>
            <div>• Total possible subsets / relations = <b>${cartRes.result.relationsCount}</b></div>
          </div>
        </div>

        <!-- Derivation Steps -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Step-by-Step Composition Derivation
          </h3>
          ${compRes.steps.map(step => `
            <div class="step-card">
              <div class="step-card-body">${step}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}
