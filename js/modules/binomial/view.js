/**
 * OG - Module 07: Binomial Theorem View
 * Premium Liquid Glass UI displaying structured:
 * Input, Formula, Substitution, Calculation, and Final Answer,
 * plus interactive step-by-step animated Pascal's Triangle.
 * ES6 Module
 */

import { binomialController, BINOMIAL_PRESETS } from './controller.js';
import { PascalTriangleVisualizer } from './pascal.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class BinomialView {
  constructor(container) {
    this.container = container;
    this.unsubscribe = null;
    this.pascalVisualizer = null;
  }

  mount() {
    this.render();
    this.attachEventListeners();

    this.unsubscribe = binomialController.subscribe((state) => {
      this.updateView(state);
    });

    this.updateView(binomialController.getModuleState());
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.pascalVisualizer) {
      this.pascalVisualizer.destroy();
      this.pascalVisualizer = null;
    }
  }

  render() {
    const s = binomialController.getModuleState();

    this.container.innerHTML = `
      <div class="view-animate-in binom-module-container">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #07: Binomial Theorem</span>
        </nav>

        <!-- Hero Card -->
        <div class="glass-surface binom-hero-card">
          <div class="badge-row" style="display: flex; gap: 10px; margin-bottom: 12px;">
            <span class="module-number-pill">Module #07</span>
            <span class="badge badge-algebra">Algebra</span>
            <span class="badge" style="background: rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.4); color: #a5b4fc;">
              Polynomial Expansions
            </span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px;">
                Binomial Theorem
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6;">
                Algebraic expansions of (a + b)ⁿ, general and middle terms, coefficient isolation, and interactive step-by-step animated Pascal’s Triangle.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 1.8rem;">
              (x+a)ⁿ
            </div>
          </div>
        </div>

        <!-- Tool Tabs Navigation Bar -->
        <div class="trig-tool-nav" id="binom-tool-nav">
          <button class="trig-tool-tab ${s.activeTab === 'expansion' ? 'active' : ''}" data-tab="expansion">
            <span>(a + b)ⁿ Expansion</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'general' ? 'active' : ''}" data-tab="general">
            <span>General Term (Tᵣ₊₁)</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'middle' ? 'active' : ''}" data-tab="middle">
            <span>Middle Term(s)</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'coefficient' ? 'active' : ''}" data-tab="coefficient">
            <span>Coefficient of xᵏ</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'pascal' ? 'active' : ''}" data-tab="pascal">
            <span>✦ Pascal's Triangle</span>
          </button>
        </div>

        <!-- Dynamic Inputs or Visualizer Slot -->
        <div class="glass-card" style="padding: 28px; border-radius: var(--radius-xl);" id="binom-main-card">
          <!-- Injected via renderTabContent -->
        </div>

        <!-- Calculation Outcome: Structured 5-Step Card -->
        <div class="glass-card derivation-card" id="binom-derivation-card" style="${s.activeTab === 'pascal' ? 'display: none;' : ''}">
          <!-- Injected via renderDerivation -->
        </div>
      </div>
    `;

    this.renderTabContent(s);
  }

  renderTabContent(s) {
    const mainCard = this.container.querySelector('#binom-main-card');
    const derivCard = this.container.querySelector('#binom-derivation-card');
    if (!mainCard) return;

    if (s.activeTab === 'pascal') {
      if (derivCard) derivCard.style.display = 'none';
      mainCard.innerHTML = `
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">
            Interactive Animated Pascal's Triangle
          </h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">
            Watch binomial coefficients construct row-by-row through recursive addition: ⁿCᵣ = ⁿ⁻¹Cᵣ₋₁ + ⁿ⁻¹Cᵣ.
          </p>
        </div>
        <div id="pascal-mount-slot"></div>
      `;

      const slot = mainCard.querySelector('#pascal-mount-slot');
      if (this.pascalVisualizer) this.pascalVisualizer.destroy();
      this.pascalVisualizer = new PascalTriangleVisualizer(slot, { maxRows: s.pascalRows });
      return;
    }

    if (derivCard) derivCard.style.display = 'flex';

    let fieldsHtml = '';

    if (s.activeTab === 'expansion') {
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">(a + b)ⁿ Full Polynomial Expansion</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Generates all (n + 1) terms with exact binomial coefficients</span>
        </div>

        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
          <div style="flex: 1; min-width: 120px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Term a:</label>
            <input type="text" id="binom-a-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 14px;" value="${s.inputA}">
          </div>

          <div style="flex: 1; min-width: 120px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Term b:</label>
            <input type="text" id="binom-b-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 14px;" value="${s.inputB}">
          </div>

          <div style="flex: 1; min-width: 120px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Exponent n:</label>
            <input type="number" min="0" max="64" id="binom-n-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 14px;" value="${s.inputN}">
          </div>

          <div style="align-self: flex-end;">
            <button id="btn-calc-binom" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
              <span>Expand</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      `;
    } else if (s.activeTab === 'general') {
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">General Term T_(r+1) = ⁿCᵣ · aⁿ⁻ʳ · bʳ</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Computes the specific (r + 1)-th term directly without expanding the whole polynomial</span>
        </div>

        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
          <div style="flex: 1; min-width: 110px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Term a:</label>
            <input type="text" id="binom-a-input" class="glass-input" style="width: 100%; font-family: var(--font-math); padding: 12px;" value="${s.inputA}">
          </div>
          <div style="flex: 1; min-width: 110px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Term b:</label>
            <input type="text" id="binom-b-input" class="glass-input" style="width: 100%; font-family: var(--font-math); padding: 12px;" value="${s.inputB}">
          </div>
          <div style="flex: 1; min-width: 110px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Exponent n:</label>
            <input type="number" min="0" max="64" id="binom-n-input" class="glass-input" style="width: 100%; font-family: var(--font-math); padding: 12px;" value="${s.inputN}">
          </div>
          <div style="flex: 1; min-width: 110px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Parameter r:</label>
            <input type="number" min="0" max="64" id="binom-r-input" class="glass-input" style="width: 100%; font-family: var(--font-math); padding: 12px;" value="${s.inputR}">
          </div>
          <div style="align-self: flex-end;">
            <button id="btn-calc-binom" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
              <span>Compute Term</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      `;
    } else if (s.activeTab === 'middle') {
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">Middle Term Determination</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Identifies single middle term when n is even, or twin middle terms when n is odd</span>
        </div>

        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
          <div style="flex: 1; min-width: 120px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Term a:</label>
            <input type="text" id="binom-a-input" class="glass-input" style="width: 100%; font-family: var(--font-math); padding: 12px;" value="${s.inputA}">
          </div>
          <div style="flex: 1; min-width: 120px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Term b:</label>
            <input type="text" id="binom-b-input" class="glass-input" style="width: 100%; font-family: var(--font-math); padding: 12px;" value="${s.inputB}">
          </div>
          <div style="flex: 1; min-width: 120px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Exponent n:</label>
            <input type="number" min="0" max="64" id="binom-n-input" class="glass-input" style="width: 100%; font-family: var(--font-math); padding: 12px;" value="${s.inputN}">
          </div>
          <div style="align-self: flex-end;">
            <button id="btn-calc-binom" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
              <span>Find Middle Term(s)</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      `;
    } else if (s.activeTab === 'coefficient') {
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">Specific Coefficient of xᵏ</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Format: (a·xᵖ + b·x^q)ⁿ. Solves for exact term containing xᵏ</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 14px; margin-bottom: 20px;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Coeff a:</label>
            <input type="number" id="coeff-a" class="glass-input" style="width: 100%; padding: 10px;" value="${s.coeffA}">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Power p:</label>
            <input type="number" id="coeff-p" class="glass-input" style="width: 100%; padding: 10px;" value="${s.coeffP}">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Coeff b:</label>
            <input type="number" id="coeff-b" class="glass-input" style="width: 100%; padding: 10px;" value="${s.coeffB}">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Power q:</label>
            <input type="number" id="coeff-q" class="glass-input" style="width: 100%; padding: 10px;" value="${s.coeffQ}">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Exp n:</label>
            <input type="number" min="0" id="coeff-n" class="glass-input" style="width: 100%; padding: 10px;" value="${s.coeffN}">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Target Power k:</label>
            <input type="number" id="coeff-k" class="glass-input" style="width: 100%; padding: 10px;" value="${s.coeffK}">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
          <button id="btn-calc-binom" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
            <span>Solve Coefficient</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>
      `;
    }

    mainCard.innerHTML = `
      ${fieldsHtml}
      <div class="sets-presets-bar">
        <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary); margin-right: 4px;">PRESETS:</span>
        <button class="sets-preset-chip" data-binom-preset="expXY4">(x + y)⁴</button>
        <button class="sets-preset-chip" data-binom-preset="expX25">(x + 2)⁵</button>
        <button class="sets-preset-chip" data-binom-preset="generalT3">Term T₃ in (x + y)⁵</button>
        <button class="sets-preset-chip" data-binom-preset="midEven6">Mid of (x + y)⁶</button>
        <button class="sets-preset-chip" data-binom-preset="midOdd5">Mid of (x + y)⁵</button>
        <button class="sets-preset-chip" data-binom-preset="coeffX2">Coeff x² in (x + 1)⁵</button>
      </div>
    `;

    this.attachFieldListeners();
    this.renderDerivation(s);
  }

  renderDerivation(s) {
    const card = this.container.querySelector('#binom-derivation-card');
    if (!card) return;

    if (s.lastError) {
      card.innerHTML = `
        <div style="padding: 16px 20px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.4); color: #fecdd3; font-size: 0.95rem;">
          <strong>Validation Error:</strong> ${s.lastError}
        </div>
      `;
      return;
    }

    const d = s.latestResult?.result?.derivation;
    if (!d) {
      card.innerHTML = '<div style="color: var(--text-tertiary);">No calculation performed yet.</div>';
      return;
    }

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; flex-wrap: wrap; gap: 10px;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">
          Detailed Mathematical Derivation
        </h3>
        <button id="btn-copy-binom-ans" class="glass-btn glass-btn-outline" title="Copy final answer">
          ${SVG_ICONS.copy}
          <span>Copy Answer</span>
        </button>
      </div>

      <!-- 1. Input -->
      <div class="derivation-step-item">
        <span class="derivation-label label-input">✦ 1. Input Specification</span>
        <div class="derivation-content">${d.input}</div>
      </div>

      <!-- 2. Formula -->
      <div class="derivation-step-item">
        <span class="derivation-label label-formula">✦ 2. Governing Theorem / Formula</span>
        <div class="derivation-content" style="color: var(--cyan-primary);">${d.formula}</div>
      </div>

      <!-- 3. Substitution -->
      <div class="derivation-step-item">
        <span class="derivation-label label-sub">✦ 3. Substitution</span>
        <div class="derivation-content">${d.substitution}</div>
      </div>

      <!-- 4. Calculation -->
      <div class="derivation-step-item">
        <span class="derivation-label label-calc">✦ 4. Calculation & Steps</span>
        <div class="derivation-content">${d.calculation}</div>
      </div>

      <!-- 5. Final Answer -->
      <div class="derivation-step-item" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
        <span class="derivation-label label-ans">✦ 5. Final Answer</span>
        <div class="derivation-content highlight-answer" id="binom-final-ans-text">${d.finalAnswer}</div>
      </div>
    `;

    const copyBtn = card.querySelector('#btn-copy-binom-ans');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        await copyToClipboard(d.finalAnswer);
        showToast(`Copied "${d.finalAnswer}" to clipboard`);
      });
    }
  }

  attachEventListeners() {
    const nav = this.container.querySelector('#binom-tool-nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.trig-tool-tab');
        if (!tabBtn) return;
        const tab = tabBtn.getAttribute('data-tab');
        binomialController.setActiveTab(tab);
        nav.querySelectorAll('.trig-tool-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.renderTabContent(binomialController.getModuleState());
      });
    }
  }

  attachFieldListeners() {
    const btnCalc = this.container.querySelector('#btn-calc-binom');
    const inputA = this.container.querySelector('#binom-a-input');
    const inputB = this.container.querySelector('#binom-b-input');
    const inputN = this.container.querySelector('#binom-n-input');
    const inputR = this.container.querySelector('#binom-r-input');

    const coeffA = this.container.querySelector('#coeff-a');
    const coeffP = this.container.querySelector('#coeff-p');
    const coeffB = this.container.querySelector('#coeff-b');
    const coeffQ = this.container.querySelector('#coeff-q');
    const coeffN = this.container.querySelector('#coeff-n');
    const coeffK = this.container.querySelector('#coeff-k');

    const presetsBar = this.container.querySelector('.sets-presets-bar');

    const handleCalc = () => {
      const stateUpdate = {};
      if (inputA) stateUpdate.inputA = inputA.value;
      if (inputB) stateUpdate.inputB = inputB.value;
      if (inputN) stateUpdate.inputN = inputN.value;
      if (inputR) stateUpdate.inputR = inputR.value;

      if (coeffA) stateUpdate.coeffA = coeffA.value;
      if (coeffP) stateUpdate.coeffP = coeffP.value;
      if (coeffB) stateUpdate.coeffB = coeffB.value;
      if (coeffQ) stateUpdate.coeffQ = coeffQ.value;
      if (coeffN) stateUpdate.coeffN = coeffN.value;
      if (coeffK) stateUpdate.coeffK = coeffK.value;

      binomialController.setInputs(stateUpdate);
      binomialController.calculateCurrent();
      this.renderDerivation(binomialController.getModuleState());
    };

    if (btnCalc) btnCalc.addEventListener('click', handleCalc);

    [inputA, inputB, inputN, inputR, coeffA, coeffP, coeffB, coeffQ, coeffN, coeffK].forEach(inp => {
      if (inp) {
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleCalc();
          }
        });
      }
    });

    if (presetsBar) {
      presetsBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.sets-preset-chip');
        if (!chip) return;
        const pKey = chip.getAttribute('data-binom-preset');
        binomialController.loadPreset(pKey);
        this.renderTabContent(binomialController.getModuleState());
        showToast(`Loaded ${BINOMIAL_PRESETS[pKey]?.name || 'preset'}`);
      });
    }
  }

  updateView(state) {
    if (!this.container) return;
    this.renderDerivation(state);
  }
}
