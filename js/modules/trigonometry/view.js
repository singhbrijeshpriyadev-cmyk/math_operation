/**
 * OG - Trigonometric Functions Module View
 * Premium Liquid Glass interactive workspace with 2D graph visualizer,
 * standard angle table, equation solver, identities library, and angle converter.
 * ES6 Module
 */

import { trigController, TRIG_PRESETS } from './controller.js';
import { TrigGraphVisualizer } from './graph.js';
import { TrigonometryMathEngine } from '../../math/trigonometry.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';

export class TrigView {
  constructor(container) {
    this.container = container;
    this.unsubscribe = null;
    this.graphVisualizer = null;
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.setupGraphVisualizer();

    // Subscribe to module controller
    this.unsubscribe = trigController.subscribe((state) => {
      this.updateView(state);
    });

    // Initial sync
    this.updateView(trigController.getModuleState());
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.graphVisualizer) {
      this.graphVisualizer.destroy();
      this.graphVisualizer = null;
    }
  }

  render() {
    const s = trigController.getModuleState();

    this.container.innerHTML = `
      <div class="view-animate-in trig-module-container">
        <!-- Breadcrumbs -->
        <nav class="module-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <a href="#/modules">Modules</a>
          <span>/</span>
          <span style="color: var(--text-white); font-weight: 600;">Module #03: Trigonometric Functions</span>
        </nav>

        <!-- Module Header Hero -->
        <div class="glass-surface trig-hero-card">
          <div class="badge-row" style="display: flex; gap: 10px; margin-bottom: 12px;">
            <span class="module-number-pill">Module #03</span>
            <span class="badge badge-calculus">Calculus</span>
            <span class="badge" style="background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
              Interactive 2D Graph & Solver
            </span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 780px;">
              <h1 style="font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px;">
                Trigonometric Functions
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6;">
                Evaluate basic and inverse trigonometric ratios, explore interactive 2D periodic curves, lookup exact standard angles, and solve trigonometric equations.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 1.8rem;">
              sin θ
            </div>
          </div>
        </div>

        <!-- Tool Navigation Bar -->
        <div class="trig-tool-nav" id="trig-tool-nav">
          <button class="trig-tool-tab ${s.activeToolTab === 'evaluator' ? 'active' : ''}" data-tab="evaluator">
            ${SVG_ICONS.graph}
            <span>Evaluator & 2D Graph</span>
          </button>
          <button class="trig-tool-tab ${s.activeToolTab === 'table' ? 'active' : ''}" data-tab="table">
            <span>Standard Angles Table</span>
          </button>
          <button class="trig-tool-tab ${s.activeToolTab === 'equations' ? 'active' : ''}" data-tab="equations">
            <span>Trigonometric Equations</span>
          </button>
          <button class="trig-tool-tab ${s.activeToolTab === 'identities' ? 'active' : ''}" data-tab="identities">
            ${SVG_ICONS.formulas}
            <span>Identities Explorer</span>
          </button>
          <button class="trig-tool-tab ${s.activeToolTab === 'conversion' ? 'active' : ''}" data-tab="conversion">
            <span>Angle Conversion (DEG ↔ RAD)</span>
          </button>
        </div>

        <!-- Dynamic Tool Workspace Area -->
        <div id="trig-tab-content">
          <!-- Injected dynamically via renderTabContent -->
        </div>
      </div>
    `;

    this.renderTabContent(s);
  }

  renderTabContent(s) {
    const tabSlot = this.container.querySelector('#trig-tab-content');
    if (!tabSlot) return;

    switch (s.activeToolTab) {
      case 'table':
        tabSlot.innerHTML = this.renderStandardTableHTML();
        break;
      case 'equations':
        tabSlot.innerHTML = this.renderEquationsHTML(s);
        break;
      case 'identities':
        tabSlot.innerHTML = this.renderIdentitiesHTML();
        break;
      case 'conversion':
        tabSlot.innerHTML = this.renderConversionHTML(s);
        break;
      case 'evaluator':
      default:
        tabSlot.innerHTML = this.renderEvaluatorHTML(s);
        this.setupGraphVisualizer();
        break;
    }

    this.attachSubTabListeners(s.activeToolTab);
  }

  renderEvaluatorHTML(s) {
    return `
      <!-- Evaluator Specifications Glass Card -->
      <div class="glass-card trig-evaluator-card" style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white);">Evaluate Function</h2>
            <span style="font-size: 0.82rem; color: var(--text-tertiary);">Select trigonometric function and input angle (e.g. 30, pi/6, 45°)</span>
          </div>

          <!-- Angle Mode Toggle -->
          <div class="trig-mode-toggle-group">
            <button class="trig-mode-btn ${s.angleMode === 'DEG' ? 'active' : ''}" data-mode="DEG">DEG (°)</button>
            <button class="trig-mode-btn ${s.angleMode === 'RAD' ? 'active' : ''}" data-mode="RAD">RAD (π)</button>
          </div>
        </div>

        <!-- Function Keypads -->
        <div style="margin-bottom: 8px;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Basic Ratios:</span>
          <div class="trig-function-pills">
            ${['sin', 'cos', 'tan', 'cot', 'sec', 'csc'].map(f => `
              <button class="trig-func-pill ${s.activeFunction === f ? 'active' : ''}" data-func="${f}">${f}</button>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Inverse Ratios:</span>
          <div class="trig-function-pills">
            ${['sin⁻¹', 'cos⁻¹', 'tan⁻¹'].map(f => `
              <button class="trig-func-pill ${s.activeInverseFunc === f ? 'active' : ''}" data-inv-func="${f}">${f}</button>
            `).join('')}
          </div>
        </div>

        <!-- Input Box & Actions -->
        <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; min-width: 240px;">
            <input type="text" id="trig-angle-input" class="glass-input" style="width: 100%; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 18px;" value="${s.inputAngle}" placeholder="e.g. 30 or pi/6" autocomplete="off">
            <span id="trig-unit-indicator" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); font-family: var(--font-math); font-size: 0.9rem; color: var(--cyan-primary);">
              ${s.angleMode === 'DEG' ? '°' : 'rad'}
            </span>
          </div>

          <button id="btn-eval-trig" class="glass-btn glass-btn-primary">
            <span>Calculate</span>
            ${SVG_ICONS.arrowRight}
          </button>
          <button id="btn-clear-trig" class="glass-btn glass-btn-outline">
            ${SVG_ICONS.trash}
            <span>Clear</span>
          </button>
        </div>

        <!-- Presets Bar -->
        <div class="sets-presets-bar" style="margin-top: 14px; padding-top: 14px;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary); margin-right: 4px;">PRESETS:</span>
          <button class="sets-preset-chip" data-trig-preset="sin30">sin(30°)</button>
          <button class="sets-preset-chip" data-trig-preset="cosPi3">cos(π/3)</button>
          <button class="sets-preset-chip" data-trig-preset="tan45">tan(45°)</button>
          <button class="sets-preset-chip" data-trig-preset="sin90">sin(90°)</button>
          <button class="sets-preset-chip" data-trig-preset="invSinHalf">sin⁻¹(0.5)</button>
          <button class="sets-preset-chip" data-trig-preset="eqSinHalf">Solve sin(x) = 0.5</button>
        </div>
      </div>

      <!-- Split Workspace: 2D Graph Visualizer & Result Panel -->
      <div class="trig-workspace-grid">
        <!-- 2D Canvas Graph Card -->
        <div class="glass-card trig-graph-card">
          <div class="trig-graph-header">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--cyan-primary);">✦</span>
                <span>Interactive 2D Graph</span>
              </h3>
              <span style="font-size: 0.8rem; color: var(--text-tertiary);">Hover along curve to trace coordinates</span>
            </div>

            <!-- Curve Function Selector -->
            <div class="trig-graph-controls" style="display: flex; gap: 6px; align-items: center;">
              <button class="trig-graph-select-btn ${s.graphFunc === 'sin' ? 'active' : ''}" data-graph-func="sin">sin(x)</button>
              <button class="trig-graph-select-btn ${s.graphFunc === 'cos' ? 'active' : ''}" data-graph-func="cos">cos(x)</button>
              <button class="trig-graph-select-btn ${s.graphFunc === 'tan' ? 'active' : ''}" data-graph-func="tan">tan(x)</button>
              <a href="#/graph" class="glass-button" style="padding: 4px 10px; font-size: 0.78rem; text-decoration: none; border-radius: var(--radius-sm);" title="Open in Dedicated Graph Calculator">
                Graph Calc ↗
              </a>
            </div>
          </div>

          <!-- Responsive Canvas Container -->
          <div class="trig-canvas-container">
            <canvas id="trig-canvas" class="trig-canvas"></canvas>
          </div>

          <!-- Parameter Modifiers -->
          <div class="trig-graph-footer-stats">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span>Period: <strong style="color: var(--text-primary);">${s.graphFunc === 'tan' ? 'π' : '2π'}</strong></span>
              <span>Domain: <strong style="color: var(--text-primary);">[-2.5π, 2.5π]</strong></span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="glass-btn glass-btn-icon" id="btn-amp-dec" title="Decrease Amplitude" style="width: 28px; height: 28px; font-size: 0.8rem;">-</button>
              <span style="font-size: 0.8rem; line-height: 28px; color: var(--text-white);">Amp: ${s.graphAmplitude}</span>
              <button class="glass-btn glass-btn-icon" id="btn-amp-inc" title="Increase Amplitude" style="width: 28px; height: 28px; font-size: 0.8rem;">+</button>
            </div>
          </div>
        </div>

        <!-- Result & Derivations Card -->
        <div class="glass-card trig-result-card">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
            <div>
              <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-white);" id="trig-res-title">
                ${s.activeFunction}(${s.inputAngle}${s.angleMode === 'DEG' ? '°' : ' rad'})
              </h3>
              <div class="result-formula-badge" id="trig-res-formula">
                ${s.latestResult?.formula || 'sin(θ) = Opposite / Hypotenuse'}
              </div>
            </div>
            <button id="btn-copy-trig-result" class="glass-btn glass-btn-outline" title="Copy answer">
              ${SVG_ICONS.copy}
              <span>Copy</span>
            </button>
          </div>

          <!-- Main Value Box -->
          <div class="trig-main-result-box">
            <div class="trig-result-value" id="trig-res-value">
              ${s.latestResult?.result?.formatted ?? '0.5'}
            </div>
            <div class="trig-exact-badge" id="trig-exact-badge">
              ${s.latestResult?.result?.exactValue ? `Exact: ${s.latestResult.result.exactValue}` : `Mode: ${s.angleMode}`}
            </div>
          </div>

          <!-- Step-by-Step Derivations -->
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-white); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--cyan-primary);">▶</span>
              <span>Mathematical Calculation Steps</span>
            </h4>
            <div class="sets-steps-container" id="trig-steps-container">
              ${s.latestResult?.steps?.map(st => `
                <div class="sets-step-item">${st}</div>
              `).join('') || '<div class="sets-step-item">No steps available</div>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderStandardTableHTML() {
    const tableData = TrigonometryMathEngine.getStandardAngleTable().result;

    return `
      <div class="glass-card" style="padding: 28px; border-radius: var(--radius-xl);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-white);">Standard Trigonometric Angle Table</h2>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">
              Canonical exact values on the unit circle across all 6 trigonometric functions.
            </p>
          </div>
          <button class="glass-btn glass-btn-outline" id="btn-copy-table" data-copy-table="true">
            ${SVG_ICONS.copy}
            <span>Copy Table Text</span>
          </button>
        </div>

        <div class="trig-table-container">
          <table class="trig-standard-table">
            <thead>
              <tr>
                <th>Degrees</th>
                <th>Radians</th>
                <th>sin θ</th>
                <th>cos θ</th>
                <th>tan θ</th>
                <th>cot θ</th>
                <th>sec θ</th>
                <th>csc θ</th>
              </tr>
            </thead>
            <tbody>
              ${tableData.map(row => `
                <tr>
                  <td class="trig-table-angle-cell">${row.deg}</td>
                  <td style="color: var(--cyan-primary); font-weight: 700;">${row.rad}</td>
                  <td>${row.sin}</td>
                  <td>${row.cos}</td>
                  <td>${row.tan}</td>
                  <td>${row.cot}</td>
                  <td>${row.sec}</td>
                  <td>${row.csc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderEquationsHTML(s) {
    const res = s.equationResult;
    return `
      <div class="glass-card" style="padding: 28px; border-radius: var(--radius-xl); margin-bottom: 24px;">
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-white);">Trigonometric Equations Solver</h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">
            Finds principal solutions in [0, 2π) / [0°, 360°) and the general solution family for sin(x) = k, cos(x) = k, tan(x) = k.
          </p>
        </div>

        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-weight: 700; color: var(--text-secondary);">Function:</label>
            <select id="eq-func-select" class="glass-input" style="padding: 10px 16px; font-family: var(--font-math); font-size: 1rem;">
              <option value="sin" ${s.equationFunc === 'sin' ? 'selected' : ''}>sin(x)</option>
              <option value="cos" ${s.equationFunc === 'cos' ? 'selected' : ''}>cos(x)</option>
              <option value="tan" ${s.equationFunc === 'tan' ? 'selected' : ''}>tan(x)</option>
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-weight: 700; color: var(--text-secondary);">=</label>
            <input type="text" id="eq-k-input" class="glass-input" style="max-width: 140px; font-family: var(--font-math); font-size: 1.1rem; padding: 10px 16px;" value="${s.equationK}" placeholder="e.g. 0.5">
          </div>

          <button id="btn-solve-eq" class="glass-btn glass-btn-primary">
            <span>Solve Equation</span>
            ${SVG_ICONS.arrowRight}
          </button>
        </div>

        ${res && res.success ? `
          <div class="glass-panel" style="padding: 24px; border-radius: var(--radius-lg);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h3 style="font-size: 1.25rem; font-family: var(--font-math); color: var(--text-primary);">
                Equation: ${res.result.equation}
              </h3>
              <span class="badge badge-calculus">General Solution</span>
            </div>

            <div style="margin: 14px 0; padding: 16px; border-radius: var(--radius-md); background: rgba(184, 154, 90, 0.12); border: 1px solid rgba(184, 154, 90, 0.35);">
              <div style="font-size: 0.82rem; color: #B89A5A; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">General Formula:</div>
              <div style="font-family: var(--font-math); font-size: 1.3rem; font-weight: 800; color: var(--text-primary);">${res.result.generalFormula}</div>
            </div>

            <div style="margin-bottom: 18px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Principal Solutions in [0, 2π):</div>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${res.result.principalSolutions.map(sol => `
                  <span class="badge" style="font-size: 1rem; padding: 8px 16px; background: rgba(240, 234, 224, 0.75); border: 1px solid rgba(184, 154, 90, 0.3); color: var(--text-primary); font-family: var(--font-math);">
                    x = ${sol}
                  </span>
                `).join('')}
              </div>
            </div>

            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px;">Step-by-Step Resolution:</div>
              <div class="sets-steps-container">
                ${res.steps.map(st => `<div class="sets-step-item">${st}</div>`).join('')}
              </div>
            </div>
          </div>
        ` : (res && !res.success ? `
          <div style="padding: 16px; border-radius: var(--radius-md); background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.4); color: #fecdd3;">
            ${res.error}
          </div>
        ` : '')}
      </div>
    `;
  }

  renderIdentitiesHTML() {
    const categories = TrigonometryMathEngine.getIdentities();
    return `
      <div style="display: flex; flex-direction: column; gap: 28px;">
        ${categories.map(cat => `
          <div>
            <div class="category-heading-wrap" style="margin-bottom: 16px;">
              <h3 class="category-heading-title">${cat.category}</h3>
            </div>
            <div class="trig-identity-grid">
              ${cat.items.map(item => `
                <div class="glass-card trig-identity-card">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text-primary); font-size: 0.95rem;">${item.name}</strong>
                    <button class="glass-btn glass-btn-icon" data-copy-identity="${item.formula}" title="Copy formula">
                      ${SVG_ICONS.copy}
                    </button>
                  </div>
                  <div class="trig-identity-formula">${item.formula}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderConversionHTML(s) {
    const res = s.convertResult;
    return `
      <div class="glass-card" style="padding: 28px; border-radius: var(--radius-xl); max-width: 680px; margin: 0 auto;">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-white); margin-bottom: 8px;">Angle Unit Converter</h2>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px;">
          Seamlessly convert between degrees and radians with exact fractional π representation.
        </p>

        <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-bottom: 20px;">
          <input type="text" id="conv-angle-input" class="glass-input" style="flex: 1; font-family: var(--font-math); font-size: 1.1rem; padding: 12px 16px;" value="${s.convertInput}" placeholder="Angle value">

          <select id="conv-from-select" class="glass-input" style="padding: 12px 14px;">
            <option value="DEG" ${s.convertFromMode === 'DEG' ? 'selected' : ''}>Degrees (°)</option>
            <option value="RAD" ${s.convertFromMode === 'RAD' ? 'selected' : ''}>Radians (rad)</option>
          </select>

          <span style="color: #B89A5A; font-size: 1.2rem;">➔</span>

          <select id="conv-to-select" class="glass-input" style="padding: 12px 14px;">
            <option value="RAD" ${s.convertToMode === 'RAD' ? 'selected' : ''}>Radians (rad)</option>
            <option value="DEG" ${s.convertToMode === 'DEG' ? 'selected' : ''}>Degrees (°)</option>
          </select>

          <button id="btn-convert-angle" class="glass-btn glass-btn-primary">
            <span>Convert</span>
          </button>
        </div>

        ${res && res.success ? `
          <div class="glass-panel" style="padding: 20px; border-radius: var(--radius-lg); margin-top: 16px; background: #0E1D61; border: 1px solid rgba(184, 154, 90, 0.4); box-shadow: 0 10px 30px rgba(14, 29, 97, 0.2);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #B89A5A; text-transform: uppercase;">Result:</div>
            <div style="font-family: var(--font-math); font-size: 1.8rem; font-weight: 800; color: #B89A5A; margin: 8px 0;">
              ${res.result.formatted}
            </div>
            <div class="sets-steps-container" style="margin-top: 14px;">
              ${res.steps.map(st => `<div class="sets-step-item">${st}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  setupGraphVisualizer() {
    const canvas = this.container.querySelector('#trig-canvas');
    if (!canvas) return;

    if (this.graphVisualizer) {
      this.graphVisualizer.destroy();
    }

    const s = trigController.getModuleState();
    const radAngle = s.latestResult?.result?.radians ?? null;

    this.graphVisualizer = new TrigGraphVisualizer(canvas, {
      func: s.graphFunc,
      amplitude: s.graphAmplitude,
      frequency: s.graphFrequency,
      probeAngleRad: radAngle
    });
  }

  attachEventListeners() {
    // Tool Navigation Tab Switcher
    const navBar = this.container.querySelector('#trig-tool-nav');
    if (navBar) {
      navBar.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.trig-tool-tab');
        if (!tabBtn) return;
        const tabKey = tabBtn.getAttribute('data-tab');
        trigController.setActiveToolTab(tabKey);
        this.renderTabContent(trigController.getModuleState());

        // Update tab active class
        navBar.querySelectorAll('.trig-tool-tab').forEach(t => t.classList.remove('active'));
        tabBtn.classList.add('active');
      });
    }
  }

  attachSubTabListeners(activeTab) {
    if (activeTab === 'evaluator') {
      const modeBtns = this.container.querySelectorAll('.trig-mode-btn');
      const funcPills = this.container.querySelectorAll('.trig-func-pill[data-func]');
      const invPills = this.container.querySelectorAll('.trig-func-pill[data-inv-func]');
      const angleInput = this.container.querySelector('#trig-angle-input');
      const btnEval = this.container.querySelector('#btn-eval-trig');
      const btnClear = this.container.querySelector('#btn-clear-trig');
      const btnCopy = this.container.querySelector('#btn-copy-trig-result');
      const presetsBar = this.container.querySelector('.sets-presets-bar');

      // Mode toggles
      modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-mode');
          trigController.setAngleMode(mode);
        });
      });

      // Function pills
      funcPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const f = pill.getAttribute('data-func');
          trigController.setActiveFunction(f);
        });
      });

      // Inverse pills
      invPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const invF = pill.getAttribute('data-inv-func');
          trigController.evaluateInverse(invF, angleInput.value);
        });
      });

      // Evaluate trigger
      const triggerEval = () => {
        trigController.setInputAngle(angleInput.value);
        trigController.evaluateCurrent();
      };

      if (btnEval) btnEval.addEventListener('click', triggerEval);
      if (angleInput) {
        angleInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            triggerEval();
          }
        });
      }

      // Clear button
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          trigController.clear();
          if (angleInput) angleInput.value = '0';
          showToast('Cleared inputs');
        });
      }

      // Presets
      if (presetsBar) {
        presetsBar.addEventListener('click', (e) => {
          const chip = e.target.closest('.sets-preset-chip');
          if (!chip) return;
          const pKey = chip.getAttribute('data-trig-preset');
          trigController.loadPreset(pKey);
          const current = trigController.getModuleState();
          if (angleInput) angleInput.value = current.inputAngle;
          showToast(`Loaded ${TRIG_PRESETS[pKey]?.name || 'preset'}`);
        });
      }

      // Graph function selector buttons
      const graphBtns = this.container.querySelectorAll('.trig-graph-select-btn');
      graphBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const gFunc = btn.getAttribute('data-graph-func');
          trigController.setGraphFunction(gFunc);
          if (this.graphVisualizer) this.graphVisualizer.setFunction(gFunc);
          graphBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      // Amplitude controls
      const btnAmpInc = this.container.querySelector('#btn-amp-inc');
      const btnAmpDec = this.container.querySelector('#btn-amp-dec');
      if (btnAmpInc) {
        btnAmpInc.addEventListener('click', () => {
          const cur = trigController.getModuleState().graphAmplitude;
          const next = Math.min(cur + 0.5, 3);
          trigController.setGraphParameters(next, undefined);
          if (this.graphVisualizer) this.graphVisualizer.setAmplitude(next);
        });
      }
      if (btnAmpDec) {
        btnAmpDec.addEventListener('click', () => {
          const cur = trigController.getModuleState().graphAmplitude;
          const next = Math.max(cur - 0.5, 0.5);
          trigController.setGraphParameters(next, undefined);
          if (this.graphVisualizer) this.graphVisualizer.setAmplitude(next);
        });
      }

      // Copy answer button
      if (btnCopy) {
        btnCopy.addEventListener('click', async () => {
          const val = this.container.querySelector('#trig-res-value')?.textContent?.trim();
          if (val) {
            await copyToClipboard(val);
            showToast(`Copied "${val}" to clipboard`);
          }
        });
      }
    } else if (activeTab === 'equations') {
      const btnSolve = this.container.querySelector('#btn-solve-eq');
      const selFunc = this.container.querySelector('#eq-func-select');
      const inputK = this.container.querySelector('#eq-k-input');

      if (btnSolve) {
        btnSolve.addEventListener('click', () => {
          trigController.solveEquation(selFunc.value, inputK.value);
          this.renderTabContent(trigController.getModuleState());
        });
      }
    } else if (activeTab === 'conversion') {
      const btnConv = this.container.querySelector('#btn-convert-angle');
      const inVal = this.container.querySelector('#conv-angle-input');
      const selFrom = this.container.querySelector('#conv-from-select');
      const selTo = this.container.querySelector('#conv-to-select');

      if (btnConv) {
        btnConv.addEventListener('click', () => {
          trigController.convertAngle(inVal.value, selFrom.value, selTo.value);
          this.renderTabContent(trigController.getModuleState());
        });
      }
    } else if (activeTab === 'identities') {
      this.container.querySelectorAll('[data-copy-identity]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const form = btn.getAttribute('data-copy-identity');
          await copyToClipboard(form);
          showToast('Identity copied');
        });
      });
    } else if (activeTab === 'table') {
      const copyTableBtn = this.container.querySelector('#btn-copy-table');
      if (copyTableBtn) {
        copyTableBtn.addEventListener('click', async () => {
          const tableData = TrigonometryMathEngine.getStandardAngleTable().result;
          const str = tableData.map(r => `${r.deg} (${r.rad}): sin=${r.sin}, cos=${r.cos}, tan=${r.tan}`).join('\n');
          await copyToClipboard(str);
          showToast('Standard angles table copied');
        });
      }
    }
  }

  updateView(state) {
    if (!this.container) return;

    if (state.activeToolTab === 'evaluator') {
      // Update result card elements
      const title = this.container.querySelector('#trig-res-title');
      const formula = this.container.querySelector('#trig-res-formula');
      const val = this.container.querySelector('#trig-res-value');
      const exact = this.container.querySelector('#trig-exact-badge');
      const steps = this.container.querySelector('#trig-steps-container');
      const unit = this.container.querySelector('#trig-unit-indicator');

      if (unit) unit.textContent = state.angleMode === 'DEG' ? '°' : 'rad';

      if (state.latestResult && state.latestResult.success) {
        const r = state.latestResult.result;
        if (title) title.textContent = `${state.activeFunction}(${state.inputAngle}${state.angleMode === 'DEG' ? '°' : ' rad'})`;
        if (formula) formula.textContent = state.latestResult.formula;
        if (val) val.textContent = r.formatted;
        if (exact) exact.textContent = r.exactValue ? `Exact: ${r.exactValue}` : `Mode: ${state.angleMode}`;
        if (steps) {
          steps.innerHTML = state.latestResult.steps.map(st => `<div class="sets-step-item">${st}</div>`).join('');
        }

        // Update probed point on graph
        if (this.graphVisualizer && r.radians !== undefined) {
          this.graphVisualizer.setProbeAngle(r.radians);
        }
      }
    }
  }
}
