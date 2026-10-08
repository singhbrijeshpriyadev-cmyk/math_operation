/**
 * OG - Module 06: Permutations and Combinations View
 * Premium Liquid Glass UI displaying structured:
 * Input, Formula, Substitution, Calculation, and Final Answer.
 * ES6 Module
 */

import { combinatoricsController, COMBINATORICS_PRESETS } from './controller.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class CombinatoricsView {
  constructor(container) {
    this.container = container;
    this.unsubscribe = null;
  }

  mount() {
    this.render();
    this.attachEventListeners();

    this.unsubscribe = combinatoricsController.subscribe((state) => {
      this.updateView(state);
    });

    this.updateView(combinatoricsController.getModuleState());
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  render() {
    const s = combinatoricsController.getModuleState();

    this.container.innerHTML = `
      <div class="view-animate-in comb-module-container">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #06: Permutations & Combinations</span>
        </nav>

        <!-- Hero Card -->
        <div class="glass-surface comb-hero-card">
          <div class="badge-row" style="display: flex; gap: 10px; margin-bottom: 12px;">
            <span class="module-number-pill">Module #06</span>
            <span class="badge badge-algebra">Algebra</span>
            <span class="badge" style="background: rgba(184, 154, 90, 0.15); border-color: rgba(184, 154, 90, 0.4); color: #0E1D61;">
              Counting & Selections
            </span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px;">
                Permutations & Combinations
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6;">
                Fundamental counting principles, factorial permutations P(n, r), combinations C(n, r), distinct letter arrangements, and selection models.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 1.8rem;">
              ⁿCᵣ
            </div>
          </div>
        </div>

        <!-- Tool Tabs Navigation Bar -->
        <div class="trig-tool-nav" id="comb-tool-nav">
          <button class="trig-tool-tab ${s.activeTab === 'permutation' ? 'active' : ''}" data-tab="permutation">
            <span>ⁿPᵣ Permutations</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'combination' ? 'active' : ''}" data-tab="combination">
            <span>ⁿCᵣ Combinations</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'factorial' ? 'active' : ''}" data-tab="factorial">
            <span>n! Factorials</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'arrangements' ? 'active' : ''}" data-tab="arrangements">
            <span>Word Arrangements</span>
          </button>
          <button class="trig-tool-tab ${s.activeTab === 'selections' ? 'active' : ''}" data-tab="selections">
            <span>Selection Problems</span>
          </button>
        </div>

        <!-- Inputs Card -->
        <div class="glass-card" style="padding: 28px; border-radius: var(--radius-xl);" id="comb-input-card">
          <!-- Injected via renderInputFields -->
        </div>

        <!-- Calculation Outcome: Structured 5-Step Card -->
        <div class="glass-card derivation-card" id="comb-derivation-card">
          <!-- Injected via renderDerivation -->
        </div>
      </div>
    `;

    this.renderInputFields(s);
    this.renderDerivation(s);
  }

  renderInputFields(s) {
    const card = this.container.querySelector('#comb-input-card');
    if (!card) return;

    let fieldsHtml = '';

    if (s.activeTab === 'permutation' || s.activeTab === 'combination') {
      const isPerm = s.activeTab === 'permutation';
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">
            ${isPerm ? 'Permutations P(n, r) — Ordered Arrangements' : 'Combinations C(n, r) — Unordered Selections'}
          </h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Constraint: n and r must be integers, and r ≤ n</span>
        </div>

        <div style="display: flex; gap: 18px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
          <div style="flex: 1; min-width: 160px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Total Items (n):</label>
            <input type="number" min="0" max="200" step="1" id="comb-n-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 16px;" value="${s.nInput}">
          </div>

          <div style="flex: 1; min-width: 160px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Selected Items (r):</label>
            <input type="number" min="0" max="200" step="1" id="comb-r-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 16px;" value="${s.rInput}">
          </div>

          <div style="align-self: flex-end;">
            <button id="btn-calc-comb" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
              <span>Compute</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      `;
    } else if (s.activeTab === 'factorial') {
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">Factorial n! Calculation</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Product of all positive integers less than or equal to n (n ≥ 0)</span>
        </div>

        <div style="display: flex; gap: 18px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
          <div style="max-width: 240px; width: 100%;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Integer n:</label>
            <input type="number" min="0" max="200" step="1" id="comb-fac-n-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 16px;" value="${s.facNInput}">
          </div>

          <div style="align-self: flex-end;">
            <button id="btn-calc-comb" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
              <span>Compute n!</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      `;
    } else if (s.activeTab === 'arrangements') {
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">Word & Sequence Permutations</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Calculates distinct arrangements accounting for repeated items and circular geometries</span>
        </div>

        <div style="display: flex; gap: 18px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
          <div style="flex: 2; min-width: 240px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Word / String:</label>
            <input type="text" id="comb-word-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 16px; text-transform: uppercase;" value="${s.wordInput}" placeholder="e.g. MISSISSIPPI">
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-top: 24px;">
            <label class="glass-btn glass-btn-outline" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="comb-circular-check" ${s.isCircular ? 'checked' : ''}>
              <span>Circular Arrangement</span>
            </label>
          </div>

          <div style="align-self: flex-end;">
            <button id="btn-calc-comb" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
              <span>Compute</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      `;
    } else if (s.activeTab === 'selections') {
      fieldsHtml = `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">Applied Selection Problems</h2>
          <span style="font-size: 0.82rem; color: var(--text-tertiary);">Real-world combinatorial scenarios: Handshakes, Polygon Diagonals, and Committee Formations</span>
        </div>

        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
          <div style="min-width: 200px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Problem Scenario:</label>
            <select id="comb-sel-type" class="glass-input" style="width: 100%; padding: 12px 14px;">
              <option value="handshakes" ${s.selType === 'handshakes' ? 'selected' : ''}>Handshake Count (C(n, 2))</option>
              <option value="diagonals" ${s.selType === 'diagonals' ? 'selected' : ''}>Polygon Diagonals (C(n, 2) - n)</option>
              <option value="committee" ${s.selType === 'committee' ? 'selected' : ''}>Committee Pool Selection</option>
            </select>
          </div>

          ${s.selType === 'committee' ? `
            <div style="width: 110px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Men:</label>
              <input type="number" id="comb-sel-p1" class="glass-input" style="width: 100%; padding: 12px;" value="${s.selP1}">
            </div>
            <div style="width: 110px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Women:</label>
              <input type="number" id="comb-sel-p2" class="glass-input" style="width: 100%; padding: 12px;" value="${s.selP2}">
            </div>
            <div style="width: 110px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Size (k):</label>
              <input type="number" id="comb-sel-p3" class="glass-input" style="width: 100%; padding: 12px;" value="${s.selP3}">
            </div>
          ` : `
            <div style="width: 160px;">
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">
                ${s.selType === 'handshakes' ? 'Attendees (n):' : 'Vertices (n):'}
              </label>
              <input type="number" min="2" id="comb-sel-p1" class="glass-input" style="width: 100%; padding: 12px;" value="${s.selP1}">
            </div>
          `}

          <div style="align-self: flex-end;">
            <button id="btn-calc-comb" class="glass-btn glass-btn-primary" style="padding: 12px 24px;">
              <span>Solve</span>
              ${SVG_ICONS.arrowRight}
            </button>
          </div>
        </div>
      `;
    }

    // Add Preset chips
    card.innerHTML = `
      ${fieldsHtml}
      <div class="sets-presets-bar">
        <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary); margin-right: 4px;">PRESETS:</span>
        <button class="sets-preset-chip" data-comb-preset="p53">P(5, 3)</button>
        <button class="sets-preset-chip" data-comb-preset="c52">C(5, 2)</button>
        <button class="sets-preset-chip" data-comb-preset="fac7">7!</button>
        <button class="sets-preset-chip" data-comb-preset="mississippi">"MISSISSIPPI"</button>
        <button class="sets-preset-chip" data-comb-preset="handshakes">10 Handshakes</button>
      </div>
    `;

    this.attachFieldListeners();
  }

  renderDerivation(s) {
    const card = this.container.querySelector('#comb-derivation-card');
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
        <button id="btn-copy-comb-ans" class="glass-btn glass-btn-outline" title="Copy final answer">
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
        <span class="derivation-label label-formula">✦ 2. Governing Formula</span>
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
        <div class="derivation-content highlight-answer" id="comb-final-ans-text">${d.finalAnswer}</div>
      </div>
    `;

    const copyBtn = card.querySelector('#btn-copy-comb-ans');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        await copyToClipboard(d.finalAnswer);
        showToast(`Copied "${d.finalAnswer}" to clipboard`);
      });
    }
  }

  attachEventListeners() {
    const nav = this.container.querySelector('#comb-tool-nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.trig-tool-tab');
        if (!tabBtn) return;
        const tab = tabBtn.getAttribute('data-tab');
        combinatoricsController.setActiveTab(tab);
        nav.querySelectorAll('.trig-tool-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.renderInputFields(combinatoricsController.getModuleState());
        this.renderDerivation(combinatoricsController.getModuleState());
      });
    }
  }

  attachFieldListeners() {
    const btnCalc = this.container.querySelector('#btn-calc-comb');
    const inputN = this.container.querySelector('#comb-n-input');
    const inputR = this.container.querySelector('#comb-r-input');
    const inputFacN = this.container.querySelector('#comb-fac-n-input');
    const inputWord = this.container.querySelector('#comb-word-input');
    const checkCirc = this.container.querySelector('#comb-circular-check');
    const selType = this.container.querySelector('#comb-sel-type');
    const selP1 = this.container.querySelector('#comb-sel-p1');
    const selP2 = this.container.querySelector('#comb-sel-p2');
    const selP3 = this.container.querySelector('#comb-sel-p3');
    const presetsBar = this.container.querySelector('.sets-presets-bar');

    const handleCalc = () => {
      const stateUpdate = {};
      if (inputN) stateUpdate.nInput = inputN.value;
      if (inputR) stateUpdate.rInput = inputR.value;
      if (inputFacN) stateUpdate.facNInput = inputFacN.value;
      if (inputWord) stateUpdate.wordInput = inputWord.value;
      if (checkCirc) stateUpdate.isCircular = checkCirc.checked;
      if (selType) stateUpdate.selType = selType.value;
      if (selP1) stateUpdate.selP1 = selP1.value;
      if (selP2) stateUpdate.selP2 = selP2.value;
      if (selP3) stateUpdate.selP3 = selP3.value;

      combinatoricsController.setInputs(stateUpdate);
      combinatoricsController.calculateCurrent();
      this.renderDerivation(combinatoricsController.getModuleState());
    };

    if (btnCalc) btnCalc.addEventListener('click', handleCalc);

    [inputN, inputR, inputFacN, inputWord, selP1, selP2, selP3].forEach(inp => {
      if (inp) {
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleCalc();
          }
        });
      }
    });

    if (selType) {
      selType.addEventListener('change', () => {
        combinatoricsController.setInputs({ selType: selType.value });
        this.renderInputFields(combinatoricsController.getModuleState());
      });
    }

    if (presetsBar) {
      presetsBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.sets-preset-chip');
        if (!chip) return;
        const pKey = chip.getAttribute('data-comb-preset');
        combinatoricsController.loadPreset(pKey);
        this.renderInputFields(combinatoricsController.getModuleState());
        this.renderDerivation(combinatoricsController.getModuleState());
        showToast(`Loaded ${COMBINATORICS_PRESETS[pKey]?.name || 'preset'}`);
      });
    }
  }

  updateView(state) {
    if (!this.container) return;
    this.renderDerivation(state);
  }
}
