/**
 * OG - Sets Module View Component
 * Premium Liquid Glass UI for Module 01: Sets
 * ES6 Module
 */

import { setsController, PRESETS } from './controller.js';
import { SetVennVisualizer } from './venn.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class SetsView {
  constructor(container) {
    this.container = container;
    this.unsubscribe = null;
    this.boundListeners = [];
  }

  /**
   * Mounts the Sets view into the container
   */
  mount() {
    this.render();
    this.attachEventListeners();

    // Subscribe to module controller state changes
    this.unsubscribe = setsController.subscribe((state) => {
      this.updateView(state);
    });

    // Initial render with current state
    this.updateView(setsController.getModuleState());
  }

  /**
   * Cleans up subscriptions and listeners when unmounting
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  render() {
    const s = setsController.getModuleState();

    this.container.innerHTML = `
      <div class="view-animate-in sets-module-container">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #01: Sets</span>
        </nav>

        <!-- Module Header Hero -->
        <div class="glass-surface sets-hero-card">
          <div class="badge-row" style="display: flex; gap: 10px; margin-bottom: 12px;">
            <span class="module-number-pill">Module #01</span>
            <span class="badge badge-algebra">Algebra</span>
            <span class="badge" style="background: rgba(184, 154, 90, 0.15); border-color: rgba(184, 154, 90, 0.4); color: #0E1D61;">
              Interactive Solver & Visualizer
            </span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px;">
                Sets & Set Theory
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6;">
                Calculate union, intersection, relative difference, complements, subsets, and Cartesian products with interactive Liquid Glass Venn diagrams.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 2rem;">
              ∅
            </div>
          </div>
        </div>

        <!-- Inputs & Presets Glass Card -->
        <div class="glass-card sets-input-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
            <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">Set Input Specifications</h2>
            <span style="font-size: 0.8rem; color: var(--text-tertiary); font-family: var(--font-math);">Format: {1, 2, 3} or 1, 2, 3</span>
          </div>

          <!-- Error Alert Banner -->
          <div id="sets-error-banner" style="display: none; margin-bottom: 18px; padding: 12px 18px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.4); color: #fecdd3; font-size: 0.9rem;">
            <!-- Dynamic error message -->
          </div>

          <div class="sets-inputs-grid">
            <!-- Set A -->
            <div class="set-field-group">
              <label class="set-field-label" for="set-a-input">
                <span>Set A</span>
                <span style="color: var(--cyan-primary); font-family: var(--font-math);">A = { ... }</span>
              </label>
              <input id="set-a-input" type="text" class="set-input-box" value="${this._escapeHtml(s.inputA)}" placeholder="e.g. {1, 2, 3, 4}" autocomplete="off" spellcheck="false">
            </div>

            <!-- Set B -->
            <div class="set-field-group">
              <label class="set-field-label" for="set-b-input">
                <span>Set B</span>
                <span style="color: #c084fc; font-family: var(--font-math);">B = { ... }</span>
              </label>
              <input id="set-b-input" type="text" class="set-input-box" value="${this._escapeHtml(s.inputB)}" placeholder="e.g. {3, 4, 5, 6}" autocomplete="off" spellcheck="false">
            </div>

            <!-- Universal Set U -->
            <div class="set-field-group">
              <label class="set-field-label" for="set-u-input">
                <span>Universal Domain (𝒰)</span>
                <span style="color: var(--text-tertiary); font-family: var(--font-math);">𝒰 = { ... }</span>
              </label>
              <input id="set-u-input" type="text" class="set-input-box" value="${this._escapeHtml(s.inputU)}" placeholder="e.g. {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}" autocomplete="off" spellcheck="false">
            </div>
          </div>

          <!-- Presets -->
          <div class="sets-presets-bar">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-tertiary); margin-right: 4px;">PRESETS:</span>
            <button class="sets-preset-chip" data-preset="overlap">Overlapping Sets {1,2,3,4} & {3,4,5,6}</button>
            <button class="sets-preset-chip" data-preset="disjoint">Disjoint Sets {1,3,5} & {2,4,6}</button>
            <button class="sets-preset-chip" data-preset="subset">Subset {2,4} ⊂ {1,2,3,4,5}</button>
            <button class="sets-preset-chip" data-preset="alphabetic">Alphabetic {α, β, γ}</button>
            <button class="sets-preset-chip" data-preset="empty">Empty Set ∅</button>
          </div>

          <!-- Action Buttons -->
          <div class="sets-actions-bar">
            <button id="btn-sets-calculate" class="glass-btn glass-btn-primary">
              <span>Calculate All Operations</span>
              ${SVG_ICONS.arrowRight}
            </button>
            <button id="btn-sets-clear" class="glass-btn glass-btn-outline">
              ${SVG_ICONS.trash}
              <span>Clear</span>
            </button>
          </div>
        </div>

        <!-- Operations Navigation Pill Bar -->
        <div class="sets-operations-nav" id="sets-operations-bar">
          <button class="sets-op-tab ${s.activeOp === 'union' ? 'active' : ''}" data-op="union">
            <span>A ∪ B</span>
            <span class="op-tag">Union</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'intersection' ? 'active' : ''}" data-op="intersection">
            <span>A ∩ B</span>
            <span class="op-tag">Intersection</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'diffAB' ? 'active' : ''}" data-op="diffAB">
            <span>A - B</span>
            <span class="op-tag">Diff A\\B</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'diffBA' ? 'active' : ''}" data-op="diffBA">
            <span>B - A</span>
            <span class="op-tag">Diff B\\A</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'symDiff' ? 'active' : ''}" data-op="symDiff">
            <span>A Δ B</span>
            <span class="op-tag">Symmetric Diff</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'complementA' ? 'active' : ''}" data-op="complementA">
            <span>A′</span>
            <span class="op-tag">Complement A</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'complementB' ? 'active' : ''}" data-op="complementB">
            <span>B′</span>
            <span class="op-tag">Complement B</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'subsetAB' ? 'active' : ''}" data-op="subsetAB">
            <span>A ⊆ B</span>
            <span class="op-tag">Subset</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'properSubsetAB' ? 'active' : ''}" data-op="properSubsetAB">
            <span>A ⊂ B</span>
            <span class="op-tag">Proper Subset</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'cartesianAB' ? 'active' : ''}" data-op="cartesianAB">
            <span>A × B</span>
            <span class="op-tag">Cartesian</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'powerSetA' ? 'active' : ''}" data-op="powerSetA">
            <span>𝒫(A)</span>
            <span class="op-tag">Power Set A</span>
          </button>
          <button class="sets-op-tab ${s.activeOp === 'powerSetB' ? 'active' : ''}" data-op="powerSetB">
            <span>𝒫(B)</span>
            <span class="op-tag">Power Set B</span>
          </button>
        </div>

        <!-- Central Split Workspace: Venn Visualizer & Active Operation Result -->
        <div class="sets-workspace-grid">
          <!-- Left: Liquid Glass Venn Visualizer Card -->
          <div class="glass-card venn-card" id="venn-card-container">
            <div class="venn-card-header">
              <div class="venn-card-title">
                <span style="color: var(--cyan-primary);">✦</span>
                <span>Venn Diagram Visualization</span>
              </div>
              <span class="badge badge-algebra" id="venn-active-badge">Interactive Mode</span>
            </div>

            <!-- SVG Diagram Slot -->
            <div id="venn-svg-slot">
              <!-- Rendered via SetVennVisualizer -->
            </div>
          </div>

          <!-- Right: Active Operation Result & Steps Card -->
          <div class="glass-card sets-result-card">
            <div class="result-header-row">
              <div>
                <h3 class="result-operation-name" id="result-op-name">Operation Result</h3>
                <div class="result-formula-badge" id="result-formula-text">Formula</div>
              </div>
              <button id="btn-copy-answer" class="glass-btn glass-btn-outline" title="Copy answer to clipboard">
                ${SVG_ICONS.copy}
                <span>Copy Answer</span>
              </button>
            </div>

            <!-- Main Result Value Banner -->
            <div class="result-main-value-box">
              <div class="result-text" id="result-main-value">{ ... }</div>
              <div class="result-cardinality-chip" id="result-cardinality-tag">n = 0</div>
            </div>

            <!-- Step-by-Step Derivation Section -->
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-white); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--cyan-primary);">▶</span>
                <span>Step-by-Step Mathematical Derivation</span>
              </h4>
              <div class="sets-steps-container" id="result-steps-container">
                <!-- Derivation steps inserted here -->
              </div>
            </div>
          </div>
        </div>

        <!-- All-Operations Overview Matrix -->
        <div class="sets-matrix-section">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-white);">All Operations Matrix</h3>
            <span style="font-size: 0.85rem; color: var(--text-secondary);">Click any card to inspect detailed derivations</span>
          </div>

          <div class="sets-matrix-grid" id="sets-matrix-grid">
            <!-- 10 Operations cards injected here -->
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const inputA = this.container.querySelector('#set-a-input');
    const inputB = this.container.querySelector('#set-b-input');
    const inputU = this.container.querySelector('#set-u-input');
    const btnCalc = this.container.querySelector('#btn-sets-calculate');
    const btnClear = this.container.querySelector('#btn-sets-clear');
    const btnCopy = this.container.querySelector('#btn-copy-answer');
    const opBar = this.container.querySelector('#sets-operations-bar');
    const presetsBar = this.container.querySelector('.sets-presets-bar');
    const matrixGrid = this.container.querySelector('#sets-matrix-grid');

    const handleCalculate = () => {
      setsController.setInputs(inputA.value, inputB.value, inputU.value);
      setsController.calculateAll();
    };

    // Calculate button
    if (btnCalc) {
      btnCalc.addEventListener('click', handleCalculate);
    }

    // Enter key inside inputs
    [inputA, inputB, inputU].forEach((input) => {
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleCalculate();
          }
        });
      }
    });

    // Preset chips
    if (presetsBar) {
      presetsBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.sets-preset-chip');
        if (!chip) return;
        const presetKey = chip.getAttribute('data-preset');
        setsController.loadPreset(presetKey);
        const s = setsController.getModuleState();
        if (inputA) inputA.value = s.inputA;
        if (inputB) inputB.value = s.inputB;
        if (inputU) inputU.value = s.inputU;
        showToast(`Loaded ${PRESETS[presetKey]?.name || 'preset'}`);
      });
    }

    // Clear button
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        setsController.clear();
        const s = setsController.getModuleState();
        if (inputA) inputA.value = s.inputA;
        if (inputB) inputB.value = s.inputB;
        if (inputU) inputU.value = s.inputU;
        showToast('Cleared inputs');
      });
    }

    // Operation Tab switching
    if (opBar) {
      opBar.addEventListener('click', (e) => {
        const tab = e.target.closest('.sets-op-tab');
        if (!tab) return;
        const opKey = tab.getAttribute('data-op');
        setsController.setActiveOperation(opKey);
      });
    }

    // Matrix Card clicking
    if (matrixGrid) {
      matrixGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.matrix-card');
        if (!card) return;
        const opKey = card.getAttribute('data-op');
        if (opKey) {
          setsController.setActiveOperation(opKey);
          // Scroll smoothly to workspace
          const workspace = this.container.querySelector('.sets-workspace-grid');
          if (workspace) {
            workspace.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    }

    // Copy answer button
    if (btnCopy) {
      btnCopy.addEventListener('click', async () => {
        const resultVal = this.container.querySelector('#result-main-value')?.textContent;
        if (resultVal) {
          const success = await copyToClipboard(resultVal);
          if (success) {
            showToast(`Copied "${resultVal}" to clipboard`);
          }
        }
      });
    }
  }

  updateView(state) {
    if (!this.container) return;

    const errorBanner = this.container.querySelector('#sets-error-banner');
    const vennSlot = this.container.querySelector('#venn-svg-slot');
    const resultOpName = this.container.querySelector('#result-op-name');
    const resultFormula = this.container.querySelector('#result-formula-text');
    const resultMainVal = this.container.querySelector('#result-main-value');
    const resultCardTag = this.container.querySelector('#result-cardinality-tag');
    const stepsContainer = this.container.querySelector('#result-steps-container');
    const matrixGrid = this.container.querySelector('#sets-matrix-grid');

    // Update active tab highlighting
    const tabs = this.container.querySelectorAll('.sets-op-tab');
    tabs.forEach((tab) => {
      const op = tab.getAttribute('data-op');
      if (op === state.activeOp) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Check error state
    if (state.lastError) {
      if (errorBanner) {
        errorBanner.style.display = 'block';
        errorBanner.textContent = `Error: ${state.lastError}`;
      }
      return;
    } else if (errorBanner) {
      errorBanner.style.display = 'none';
    }

    const batch = state.batchResult;
    if (!batch || !batch.success) return;

    const r = batch.result;
    const currentOp = state.currentOpResult;

    // Render Venn Diagram
    if (vennSlot) {
      vennSlot.innerHTML = SetVennVisualizer.renderSVG(r.vennData, state.activeOp);
    }

    // Render Active Operation Result
    if (currentOp && currentOp.success) {
      if (resultOpName) {
        resultOpName.textContent = this._getOperationDisplayTitle(state.activeOp);
      }
      if (resultFormula) {
        resultFormula.textContent = currentOp.formula || '';
      }
      if (resultMainVal) {
        resultMainVal.textContent = currentOp.result.formatted || String(currentOp.result);
      }
      if (resultCardTag) {
        const count = currentOp.result.cardinality ?? currentOp.result.totalPairs ?? currentOp.result.totalSubsets ?? '';
        resultCardTag.textContent = count !== '' ? `n = ${count}` : (currentOp.result.isSubset !== undefined ? (currentOp.result.isSubset ? 'TRUE' : 'FALSE') : '');
      }

      // Render Steps
      if (stepsContainer && Array.isArray(currentOp.steps)) {
        stepsContainer.innerHTML = currentOp.steps.map((st) => `
          <div class="sets-step-item">
            ${this._escapeHtml(st)}
          </div>
        `).join('');
      }
    }

    // Render All-Operations Matrix Grid
    if (matrixGrid) {
      matrixGrid.innerHTML = this._renderMatrixCards(r, state.activeOp);
    }
  }

  _renderMatrixCards(r, activeOp) {
    const cards = [
      {
        op: 'union',
        symbol: 'A ∪ B',
        name: 'Union',
        value: r.union.result.formatted,
        stat: `|A ∪ B| = ${r.union.result.cardinality}`
      },
      {
        op: 'intersection',
        symbol: 'A ∩ B',
        name: 'Intersection',
        value: r.intersection.result.formatted,
        stat: r.intersection.result.isDisjoint ? 'Disjoint (∅)' : `|A ∩ B| = ${r.intersection.result.cardinality}`
      },
      {
        op: 'diffAB',
        symbol: 'A - B',
        name: 'Relative Difference (A\\B)',
        value: r.diffAB.result.formatted,
        stat: `|A - B| = ${r.diffAB.result.cardinality}`
      },
      {
        op: 'diffBA',
        symbol: 'B - A',
        name: 'Relative Difference (B\\A)',
        value: r.diffBA.result.formatted,
        stat: `|B - A| = ${r.diffBA.result.cardinality}`
      },
      {
        op: 'symDiff',
        symbol: 'A Δ B',
        name: 'Symmetric Difference',
        value: r.symDiff.result.formatted,
        stat: `|A Δ B| = ${r.symDiff.result.cardinality}`
      },
      {
        op: 'complementA',
        symbol: 'A′',
        name: 'Complement of A (𝒰 - A)',
        value: r.complementA.result.formatted,
        stat: `|A′| = ${r.complementA.result.cardinality}`
      },
      {
        op: 'complementB',
        symbol: 'B′',
        name: 'Complement of B (𝒰 - B)',
        value: r.complementB.result.formatted,
        stat: `|B′| = ${r.complementB.result.cardinality}`
      },
      {
        op: 'subsetAB',
        symbol: 'A ⊆ B',
        name: 'Subset Condition',
        value: r.subsetAB.result.isSubset ? 'TRUE (A is subset)' : 'FALSE (Not subset)',
        stat: r.subsetAB.result.isSubset ? '∀x (x ∈ A ⟹ x ∈ B)' : `${r.subsetAB.result.counterexamples.length} counterexample(s)`
      },
      {
        op: 'properSubsetAB',
        symbol: 'A ⊂ B',
        name: 'Proper Subset Condition',
        value: r.properSubsetAB.result.isProperSubset ? 'TRUE (Proper subset)' : 'FALSE',
        stat: r.properSubsetAB.result.isProperSubset ? 'A ⊆ B and A ≠ B' : 'Failed proper condition'
      },
      {
        op: 'cartesianAB',
        symbol: 'A × B',
        name: 'Cartesian Product',
        value: r.cartesianAB.result.formatted,
        stat: `${r.cartesianAB.result.totalPairs} ordered pairs`
      },
      {
        op: 'powerSetA',
        symbol: '𝒫(A)',
        name: 'Power Set of A',
        value: r.powerSetA.result.formatted,
        stat: `2^|A| = ${r.powerSetA.result.totalSubsets} subsets`
      },
      {
        op: 'powerSetB',
        symbol: '𝒫(B)',
        name: 'Power Set of B',
        value: r.powerSetB.result.formatted,
        stat: `2^|B| = ${r.powerSetB.result.totalSubsets} subsets`
      }
    ];

    return cards.map((c) => `
      <div class="glass-card matrix-card ${activeOp === c.op ? 'active' : ''}" data-op="${c.op}" style="${activeOp === c.op ? 'border-color: #B89A5A; box-shadow: 0 0 16px rgba(184, 154, 90, 0.25);' : ''}">
        <div class="matrix-card-header">
          <span class="matrix-card-symbol">${c.symbol}</span>
          <span class="matrix-card-desc">${c.name}</span>
        </div>
        <div class="matrix-card-value" title="${this._escapeHtml(c.value)}">
          ${this._escapeHtml(c.value)}
        </div>
        <div class="matrix-card-footer">
          <span>${c.stat}</span>
          <span style="color: var(--cyan-primary); font-weight: 600;">Inspect →</span>
        </div>
      </div>
    `).join('');
  }

  _getOperationDisplayTitle(opKey) {
    const titles = {
      union: 'Set Union (A ∪ B)',
      intersection: 'Set Intersection (A ∩ B)',
      diffAB: 'Relative Difference (A - B)',
      diffBA: 'Relative Difference (B - A)',
      symDiff: 'Symmetric Difference (A Δ B)',
      complementA: 'Absolute Complement (A′ = 𝒰 - A)',
      complementB: 'Absolute Complement (B′ = 𝒰 - B)',
      subsetAB: 'Subset Relation (A ⊆ B)',
      subsetBA: 'Subset Relation (B ⊆ A)',
      properSubsetAB: 'Proper Subset Relation (A ⊂ B)',
      cartesianAB: 'Cartesian Product (A × B)',
      powerSetA: 'Power Set of A (𝒫(A))',
      powerSetB: 'Power Set of B (𝒫(B))'
    };
    return titles[opKey] || opKey;
  }

  _escapeHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
