/**
 * OG - Probability Workspace Dashboard View
 * Visual Identity: Ivory (#E8E0D2), Gold (#B89A5A), Deep Atlas Navy (#0E1D61)
 * Premium Liquid Glass Architecture
 *
 * Provides:
 * - Header: PROBABILITY "Model uncertainty, events and outcomes."
 * - Main Actions: Probability Calculator | Event Builder | Conditional Probability | Bayes Theorem | Distributions | Random Experiment
 * - Two Events Workspace (P(A), P(B), P(A ∩ B)) with smart independence & mutual exclusivity testing
 * - Interactive Canvas: Probability Tree with path outcomes, Contingency Matrix, and Binomial PMF
 * - 7-Stage Step-by-Step Derivation Flow
 * - 12 Sub-Tools & Labs Navigation Grid
 *
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { ProbabilityMathEngine } from '../../math/probability.js';
import { ProbabilityTreeVisualizer } from './tree.js';

export const PROBABILITY_TOOLS = [
  { id: 'calculator',      num: '13', icon: '🧮', title: 'Probability Calculator',  desc: 'Unified evaluator for classical, union, conditional and joint problems' },
  { id: 'sample-space',    num: '14', icon: '🎲', title: 'Sample Space & Events',   desc: 'Coin, die, two dice, deck of cards, custom sets & event algebra' },
  { id: 'classical',       num: '15', icon: '⚖️', title: 'Classical Probability',   desc: 'P(A) = favorable / total, exact fractions, decimals, percentages' },
  { id: 'rules',           num: '16', icon: '➕', title: 'Addition & Multiplication',desc: 'General vs mutually exclusive addition, independent vs dependent rules' },
  { id: 'conditional',     num: '17', icon: '🎯', title: 'Conditional Probability', desc: 'P(A|B) = P(A ∩ B) / P(B) with division-by-zero safeguards' },
  { id: 'bayes',           num: '18', icon: '🌳', title: "Bayes' Theorem Lab",       desc: 'Prior, Likelihood, Evidence, Posterior with multi-hypothesis tree' },
  { id: 'independence',    num: '19', icon: '🔗', title: 'Independent vs Dependent', desc: 'Independence verification, sampling with vs without replacement' },
  { id: 'combinatorics',   num: '20', icon: '🔢', title: 'Permutations & Combos',    desc: 'Counting probability using nPr, nCr integrated from Algebra' },
  { id: 'simulation',      num: '21', icon: '🔄', title: 'Random Experiment Lab',   desc: 'Simulations: 10 to 100,000 trials, Law of Large Numbers convergence' },
  { id: 'distributions',   num: '22', icon: '📊', title: 'Probability Distributions',desc: 'Bernoulli & Binomial PMF table, expected value, variance' },
  { id: 'expected-value',  num: '23', icon: '📐', title: 'Expected Value & Variance', desc: 'E(X) = ∑x·P(X=x), Var(X), with rigorous ∑p = 1 validation' },
  { id: 'practice-lab',    num: '24', icon: '🧠', title: 'Probability Practice Lab', desc: 'Interactive drills with instant grading, solutions & exam mode' }
];

export class ProbabilityView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.treeVisualizer = null;
    this.pA = 0.6;
    this.pB = 0.5;
    this.pInter = 0.3;
    this.activeMode = 'tree'; // 'tree' | 'binomial' | 'contingency'
    this.resultData = null;
    this._listeners = [];
  }

  mount() {
    this.render();
    this._attachListeners();
    this._initVisualizer();
    this.calculateTwoEvents();
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => {
      try { el.removeEventListener(evt, fn); } catch (e) {}
    });
    this._listeners = [];

    if (this.treeVisualizer && typeof this.treeVisualizer.destroy === 'function') {
      this.treeVisualizer.destroy();
      this.treeVisualizer = null;
    }
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  render() {
    this.container.innerHTML = `
      <div class="prob-workspace view-animate-in">

        <!-- Header -->
        <header class="prob-header">
          <div class="prob-header-text">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span class="prob-badge">
                <span class="prob-badge-dot"></span>
                Probability Workspace
              </span>
              <span class="prob-subbadge">Module #14</span>
            </div>
            <h1 class="prob-title">PROBABILITY</h1>
            <p class="prob-subtitle">"Model uncertainty, events and outcomes."</p>
          </div>
          <div class="prob-quick-actions">
            <a href="#/probability-tools/calculator" class="prob-btn prob-btn-gold">
              ${SVG_ICONS.calculator || '🧮'} Probability Calculator
            </a>
            <a href="#/probability-tools/sample-space" class="prob-btn prob-btn-outline">
              ${SVG_ICONS.box || '🎲'} Event Builder
            </a>
            <a href="#/probability-tools/conditional" class="prob-btn prob-btn-outline">
              Conditional
            </a>
            <a href="#/probability-tools/bayes" class="prob-btn prob-btn-outline">
              Bayes' Theorem
            </a>
            <a href="#/probability-tools/distributions" class="prob-btn prob-btn-outline">
              Distributions
            </a>
            <a href="#/probability-tools/simulation" class="prob-btn prob-btn-primary">
              ${SVG_ICONS.refresh || '🔄'} Random Experiment
            </a>
          </div>
        </header>

        <!-- Presets Row -->
        <div class="prob-presets-bar">
          <span class="prob-presets-label">Scenarios:</span>
          <button class="prob-preset-chip active" data-pa="0.6" data-pb="0.5" data-inter="0.3">Independent: P(A)=0.6, P(B)=0.5, P(A∩B)=0.3</button>
          <button class="prob-preset-chip" data-pa="0.4" data-pb="0.3" data-inter="0">Mutually Exclusive: P(A∩B)=0</button>
          <button class="prob-preset-chip" data-pa="0.5" data-pb="0.4" data-inter="0.2">General: P(A∩B)=0.2</button>
          <button class="prob-preset-chip" data-pa="0.8" data-pb="0.5" data-inter="0.4">Medical Test Scenario</button>
        </div>

        <!-- Universal Event Input Bar -->
        <div class="prob-input-card glass-panel">
          <div class="prob-input-header">
            <span class="prob-input-title">Two Events Probability Configuration</span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">P(A), P(B), P(A ∩ B) ∈ [0, 1]</span>
          </div>

          <div class="prob-inputs-row">
            <div class="prob-field-group">
              <label>P(A):</label>
              <input type="number" id="prob-pa-input" class="prob-input-field" step="0.05" min="0" max="1" value="${this.pA}">
            </div>
            <div class="prob-field-group">
              <label>P(B):</label>
              <input type="number" id="prob-pb-input" class="prob-input-field" step="0.05" min="0" max="1" value="${this.pB}">
            </div>
            <div class="prob-field-group">
              <label>P(A ∩ B) (Optional / Leave blank for independent):</label>
              <input type="number" id="prob-pinter-input" class="prob-input-field" step="0.05" min="0" max="1" value="${this.pInter}">
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-compute-events" style="height: 42px; align-self: flex-end;">
              Compute Probability Solution
            </button>
          </div>
        </div>

        <!-- Split Workspace Grid -->
        <div class="prob-split-grid">

          <!-- Left: CALCULATION RESULTS -->
          <div class="prob-panel glass-panel" id="prob-calc-panel">
            <div class="prob-panel-header">
              <div class="prob-panel-title">
                <span class="prob-indicator-dot"></span>
                PROBABILITY EVENT METRICS
              </div>
              <div class="prob-panel-badge" id="prob-independence-badge">Independent</div>
            </div>

            <div class="prob-metrics-grid" id="prob-metrics-grid">
              <!-- Rendered dynamically -->
            </div>

            <div class="prob-submetrics-box" id="prob-rules-box">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Right: VISUALIZATION (Probability Tree / Contingency) -->
          <div class="prob-panel glass-panel" id="prob-visual-panel">
            <div class="prob-panel-header">
              <div class="prob-panel-title">
                <span class="prob-indicator-dot gold"></span>
                VISUALIZATION LAB
              </div>
              <div class="prob-view-toggle">
                <button class="prob-view-btn active" data-mode="tree">Probability Tree</button>
                <button class="prob-view-btn" data-mode="contingency">2×2 Matrix</button>
              </div>
            </div>

            <div class="prob-canvas-container">
              <canvas id="prob-main-canvas"></canvas>
            </div>

            <div class="prob-canvas-footer">
              <span id="prob-canvas-caption">Probability tree showing stage branches and joint path probabilities</span>
            </div>
          </div>

        </div>

        <!-- 7-Stage Mathematical Derivation Section -->
        <div class="prob-derivation-card glass-panel" id="prob-derivation-container">
          <!-- Rendered dynamically -->
        </div>

        <!-- 12 Sub-Tools & Labs Navigation Grid -->
        <div class="prob-tools-section">
          <div class="prob-tools-header">
            <div>
              <h2 class="prob-tools-title">PROBABILITY MODULES & LABS</h2>
              <p class="prob-tools-sub">12 rigorous probabilistic calculation, simulation and practice tools</p>
            </div>
            <a href="#/modules/14" class="prob-curriculum-link">
              View Curriculum Module #14 →
            </a>
          </div>

          <div class="prob-tools-grid">
            ${PROBABILITY_TOOLS.map(tool => `
              <a href="#/probability-tools/${tool.id}" class="prob-tool-card glass-card">
                <div class="prob-tool-top">
                  <span class="prob-tool-num">${tool.num}</span>
                  <span class="prob-tool-icon">${tool.icon}</span>
                </div>
                <div class="prob-tool-name">${tool.title}</div>
                <div class="prob-tool-desc">${tool.desc}</div>
              </a>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  _attachListeners() {
    const computeBtn = document.getElementById('btn-compute-events');
    if (computeBtn) {
      this._on(computeBtn, 'click', () => {
        const paVal = parseFloat(document.getElementById('prob-pa-input').value);
        const pbVal = parseFloat(document.getElementById('prob-pb-input').value);
        const interValStr = document.getElementById('prob-pinter-input').value;
        const interVal = interValStr.trim() !== '' ? parseFloat(interValStr) : null;

        this.pA = isNaN(paVal) ? 0.5 : paVal;
        this.pB = isNaN(pbVal) ? 0.5 : pbVal;
        this.pInter = interVal;

        this.calculateTwoEvents();
      });
    }

    // Presets
    const presetChips = document.querySelectorAll('.prob-preset-chip');
    presetChips.forEach(chip => {
      this._on(chip, 'click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const pa = parseFloat(chip.getAttribute('data-pa'));
        const pb = parseFloat(chip.getAttribute('data-pb'));
        const inter = parseFloat(chip.getAttribute('data-inter'));

        document.getElementById('prob-pa-input').value = pa;
        document.getElementById('prob-pb-input').value = pb;
        document.getElementById('prob-pinter-input').value = inter;

        this.pA = pa;
        this.pB = pb;
        this.pInter = inter;

        this.calculateTwoEvents();
      });
    });

    // View toggle (Tree vs Contingency)
    const viewBtns = document.querySelectorAll('.prob-view-btn');
    viewBtns.forEach(btn => {
      this._on(btn, 'click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeMode = btn.getAttribute('data-mode');
        this._updateCanvas();
      });
    });
  }

  _initVisualizer() {
    const canvas = document.getElementById('prob-main-canvas');
    if (canvas) {
      this.treeVisualizer = new ProbabilityTreeVisualizer(canvas);
      this.treeVisualizer.resize();
    }
  }

  calculateTwoEvents() {
    const res = ProbabilityMathEngine.twoEvents(this.pA, this.pB, this.pInter);
    if (!res.success) {
      showToast(res.error || 'Probability error', 'error');
      this._renderError(res.error);
      return;
    }

    this.resultData = res.result;

    // Record in OG state
    try {
      store.addHistoryItem({
        type: 'Probability Analysis',
        summary: `P(A)=${res.result.pA.decimal}, P(B)=${res.result.pB.decimal}, P(A∪B)=${res.result.pUnion.decimal}`,
        timestamp: Date.now()
      });
    } catch (e) {}

    this._renderMetrics();
    this._renderDerivation(res.result.derivation7Stage);
    this._updateCanvas();
  }

  _renderError(errMsg) {
    const grid = document.getElementById('prob-metrics-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="prob-error-box">
          <span style="font-size: 1.5rem;">⚠️</span>
          <div>
            <strong>Probability Error:</strong>
            <p style="margin: 4px 0 0 0; color: #b91c1c;">${errMsg}</p>
          </div>
        </div>
      `;
    }
  }

  _renderMetrics() {
    const r = this.resultData;
    if (!r) return;

    const badge = document.getElementById('prob-independence-badge');
    if (badge) {
      badge.textContent = r.isIndependent ? 'Independent Events' : 'Dependent Events';
      badge.style.background = r.isIndependent ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)';
      badge.style.color = r.isIndependent ? '#15803d' : '#ca8a04';
    }

    const grid = document.getElementById('prob-metrics-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="prob-metric-card">
          <span class="prob-metric-label">P(A)</span>
          <span class="prob-metric-val">${r.pA.decimal}</span>
          <span class="prob-metric-sub">${r.pA.percentage}</span>
        </div>
        <div class="prob-metric-card">
          <span class="prob-metric-label">P(B)</span>
          <span class="prob-metric-val">${r.pB.decimal}</span>
          <span class="prob-metric-sub">${r.pB.percentage}</span>
        </div>
        <div class="prob-metric-card highlight">
          <span class="prob-metric-label">P(A ∩ B) Joint</span>
          <span class="prob-metric-val">${r.pInter.decimal}</span>
          <span class="prob-metric-sub">${r.pInter.percentage}</span>
        </div>
        <div class="prob-metric-card highlight">
          <span class="prob-metric-label">P(A ∪ B) Union</span>
          <span class="prob-metric-val">${r.pUnion.decimal}</span>
          <span class="prob-metric-sub">${r.pUnion.percentage}</span>
        </div>
        <div class="prob-metric-card">
          <span class="prob-metric-label">P(A') Complement</span>
          <span class="prob-metric-val">${r.pNotA.decimal}</span>
        </div>
        <div class="prob-metric-card">
          <span class="prob-metric-label">P(B') Complement</span>
          <span class="prob-metric-val">${r.pNotB.decimal}</span>
        </div>
        <div class="prob-metric-card highlight">
          <span class="prob-metric-label">P(A|B) Conditional</span>
          <span class="prob-metric-val">${r.pAgivenB ? r.pAgivenB.decimal : 'Undefined'}</span>
          <span class="prob-metric-sub">${r.pAgivenB ? r.pAgivenB.percentage : ''}</span>
        </div>
        <div class="prob-metric-card highlight">
          <span class="prob-metric-label">P(B|A) Conditional</span>
          <span class="prob-metric-val">${r.pBgivenA ? r.pBgivenA.decimal : 'Undefined'}</span>
          <span class="prob-metric-sub">${r.pBgivenA ? r.pBgivenA.percentage : ''}</span>
        </div>
      `;
    }

    const rulesBox = document.getElementById('prob-rules-box');
    if (rulesBox) {
      rulesBox.innerHTML = `
        <div class="prob-submetric-row">
          <span>Independence Test:</span>
          <strong>P(A)·P(B) = ${(r.pA.value * r.pB.value).toFixed(4)} ${r.isIndependent ? '== P(A ∩ B) (Independent)' : '≠ P(A ∩ B) (Dependent)'}</strong>
        </div>
        <div class="prob-submetric-row">
          <span>Mutual Exclusivity:</span>
          <span>${r.isMutuallyExclusive ? 'P(A ∩ B) = 0 (Mutually Exclusive / Disjoint)' : 'P(A ∩ B) > 0 (Non-disjoint events)'}</span>
        </div>
        <div class="prob-submetric-row">
          <span>Event Difference P(A - B):</span>
          <strong>${r.pAminusB.decimal} (${r.pAminusB.percentage})</strong>
        </div>
      `;
    }
  }

  _updateCanvas() {
    if (!this.treeVisualizer || !this.resultData) return;
    const r = this.resultData;

    const caption = document.getElementById('prob-canvas-caption');

    if (this.activeMode === 'tree') {
      if (caption) caption.textContent = 'Two-stage probability tree: branch probabilities and joint path probabilities';
      this.treeVisualizer.setData('tree', {
        pA: r.pA,
        pAgivenB: r.pAgivenB,
        pBgivenNotA: 0.4
      });
    } else {
      if (caption) caption.textContent = '2×2 Contingency frequency matrix displaying joint and marginal distributions';
      // Compute proxy counts for 100 observations
      const nAB = Math.round(r.pInter.value * 100);
      const nAnB = Math.round(r.pAminusB.value * 100);
      const nB = Math.round(r.pB.value * 100);
      const nnAB = Math.max(0, nB - nAB);
      const nnAnB = Math.max(0, 100 - nAB - nAnB - nnAB);

      this.treeVisualizer.setData('contingency', {
        counts: {
          ab: nAB,
          anb: nAnB,
          nab: nnAB,
          nanb: nnAnB,
          totalA: nAB + nAnB,
          totalNotA: nnAB + nnAnB,
          totalB: nAB + nnAB,
          totalNotB: nAnB + nnAnB,
          N: 100
        },
        pAgivenB: r.pAgivenB,
        pBgivenA: r.pBgivenA
      });
    }
  }

  _renderDerivation(d) {
    const container = document.getElementById('prob-derivation-container');
    if (!container || !d) return;

    container.innerHTML = `
      <div class="prob-derivation-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="prob-stage-badge">7-STAGE PROOF</span>
          <h3 class="prob-derivation-title">MATHEMATICAL STEP-BY-STEP DERIVATION</h3>
        </div>
        <button class="prob-btn prob-btn-xs" id="btn-copy-prob-steps">
          ${SVG_ICONS.copy || '📋'} Copy Solution
        </button>
      </div>

      <div class="prob-stages-flow">
        <div class="prob-stage-item">
          <div class="prob-stage-num">01</div>
          <div class="prob-stage-content">
            <span class="prob-stage-label">PROBLEM STATEMENT</span>
            <div class="prob-stage-text">${d.problem}</div>
          </div>
        </div>

        <div class="prob-stage-item">
          <div class="prob-stage-num">02</div>
          <div class="prob-stage-content">
            <span class="prob-stage-label">DATA / EVENTS</span>
            <div class="prob-stage-text font-mono">${d.data}</div>
          </div>
        </div>

        <div class="prob-stage-item">
          <div class="prob-stage-num">03</div>
          <div class="prob-stage-content">
            <span class="prob-stage-label">FORMULA / THEOREM</span>
            <div class="prob-stage-text font-mono highlight-gold">${d.formula}</div>
          </div>
        </div>

        <div class="prob-stage-item">
          <div class="prob-stage-num">04</div>
          <div class="prob-stage-content">
            <span class="prob-stage-label">SUBSTITUTION</span>
            <div class="prob-stage-text font-mono">${d.substitution}</div>
          </div>
        </div>

        <div class="prob-stage-item">
          <div class="prob-stage-num">05</div>
          <div class="prob-stage-content">
            <span class="prob-stage-label">CALCULATION</span>
            <div class="prob-stage-text font-mono">${d.calculation}</div>
          </div>
        </div>

        <div class="prob-stage-item">
          <div class="prob-stage-num">06</div>
          <div class="prob-stage-content">
            <span class="prob-stage-label">FINAL RESULT</span>
            <div class="prob-stage-text font-mono highlight-navy">${d.result}</div>
          </div>
        </div>

        <div class="prob-stage-item">
          <div class="prob-stage-num">07</div>
          <div class="prob-stage-content">
            <span class="prob-stage-label">INTERPRETATION & CONTEXT</span>
            <div class="prob-stage-text">${d.interpretation}</div>
          </div>
        </div>
      </div>
    `;

    const copyBtn = document.getElementById('btn-copy-prob-steps');
    if (copyBtn) {
      this._on(copyBtn, 'click', () => {
        const text = `
=== PROBABILITY DERIVATION ===
Problem: ${d.problem}
Data: ${d.data}
Formula: ${d.formula}
Substitution: ${d.substitution}
Calculation: ${d.calculation}
Result: ${d.result}
Interpretation: ${d.interpretation}
        `.trim();
        copyToClipboard(text);
        showToast('Probability solution copied');
      });
    }
  }
}
