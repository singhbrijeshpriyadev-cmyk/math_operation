/**
 * OG - Module 20: Integrals View
 * Interactive computation of Indefinite Integrals (symbolic antiderivatives + C)
 * and Definite Integrals (Fundamental Theorem of Calculus + Simpson's Quadrature + Shaded Canvas).
 * ES6 Module
 */

import { CalculusEngine } from '../../math/calculus.js';
import { CalculusGraphVisualizer } from './graph.js';

export class IntegralsView {
  constructor(container) {
    this.container = container;
    this.visualizer = null;

    this.activeTab = 'definite'; // 'definite' | 'indefinite'
    this.funcExpr = 'x^2';
    this.boundA = 0;
    this.boundB = 3;
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.initGraph();
    this.calculate();
  }

  render() {
    this.container.innerHTML = `
      <div class="calculus-container">
        <!-- Header -->
        <div class="calculus-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge">Module #20</span>
              <span class="badge badge-calculus">Calculus</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Integrals
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Compute indefinite antiderivatives with symbolic integration rules, and evaluate definite integrals
              using the Fundamental Theorem of Calculus with shaded region geometry.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="glass-button int-tab-btn ${this.activeTab === 'definite' ? 'active' : ''}" data-tab="definite" style="padding: 8px 18px;">
              Definite Integral ∫ₐᵇ
            </button>
            <button class="glass-button int-tab-btn ${this.activeTab === 'indefinite' ? 'active' : ''}" data-tab="indefinite" style="padding: 8px 18px;">
              Indefinite Integral ∫
            </button>
            <a href="#/graph" class="glass-button" style="padding: 8px 14px; text-decoration: none;" title="Open in Graph Calculator">
              Graph Calc ↗
            </a>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Standard Integrals:
          </div>
          <div class="calculus-preset-bar" id="int-preset-container">
            <button class="preset-chip" data-preset="parabola">Parabola: x² [0, 3]</button>
            <button class="preset-chip" data-preset="poly">Polynomial: 3x² + 2x - 1 [1, 3]</button>
            <button class="preset-chip" data-preset="sine">Trig: sin(x) [0, 3.14]</button>
            <button class="preset-chip" data-preset="cosine">Trig: cos(x) [0, 1.57]</button>
            <button class="preset-chip" data-preset="exp">Exponential: exp(x) [0, 1]</button>
          </div>
        </div>

        <!-- Controls & Plotter Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Integrand Parameters
            </h3>

            <div class="calculus-input-group">
              <label>Integrand Function f(x):</label>
              <input type="text" id="int-func" class="calculus-input-field" value="${this.funcExpr}" placeholder="e.g. x^2, sin(x), 3*x^2">
            </div>

            ${this.activeTab === 'definite' ? `
              <div class="calculus-controls-grid" style="margin-top: 0;">
                <div class="calculus-input-group">
                  <label>Lower Limit a:</label>
                  <input type="number" step="any" id="int-bound-a" class="calculus-input-field" value="${this.boundA}">
                </div>
                <div class="calculus-input-group">
                  <label>Upper Limit b:</label>
                  <input type="number" step="any" id="int-bound-b" class="calculus-input-field" value="${this.boundB}">
                </div>
              </div>
            ` : ''}

            <button class="glass-button glass-button-primary" id="btn-int-calculate" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Integrate ${this.activeTab === 'definite' ? 'Definite Area' : 'Symbolically'}
            </button>
          </div>

          <!-- Canvas Visualizer -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Integration Region Visualizer
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Shaded Area Under Curve
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="int-canvas"></canvas>
            </div>
            <div class="graph-legend-bar">
              <div class="legend-item">
                <span class="legend-indicator" style="background: #B89A5A;"></span>
                <span>Integrand Curve f(x)</span>
              </div>
              ${this.activeTab === 'definite' ? `
                <div class="legend-item">
                  <span class="legend-indicator" style="background: rgba(184, 154, 90, 0.45); height: 10px;"></span>
                  <span>Definite Region [a, b]</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Derivation & Results -->
        <div id="int-results-container"></div>
      </div>
    `;
  }

  initGraph() {
    const canvas = document.getElementById('int-canvas');
    if (!canvas) return;
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    this.visualizer = new CalculusGraphVisualizer(canvas, {
      exprStr: this.funcExpr,
      xMin: Math.min(-1, this.boundA - 1),
      xMax: Math.max(5, this.boundB + 1),
      yMin: -2,
      yMax: 10,
      shadeBounds: this.activeTab === 'definite' ? { a: this.boundA, b: this.boundB, type: 'under' } : null
    });
  }

  attachEventListeners() {
    this.container.querySelectorAll('.int-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.dataset.tab;
        this.render();
        this.attachEventListeners();
        this.initGraph();
        this.calculate();
      });
    });

    const presetContainer = document.getElementById('int-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'parabola') {
          this.funcExpr = 'x^2';
          this.boundA = 0;
          this.boundB = 3;
        } else if (p === 'poly') {
          this.funcExpr = '3*x^2 + 2*x - 1';
          this.boundA = 1;
          this.boundB = 3;
        } else if (p === 'sine') {
          this.funcExpr = 'sin(x)';
          this.boundA = 0;
          this.boundB = 3.1416;
        } else if (p === 'cosine') {
          this.funcExpr = 'cos(x)';
          this.boundA = 0;
          this.boundB = 1.5708;
        } else if (p === 'exp') {
          this.funcExpr = 'exp(x)';
          this.boundA = 0;
          this.boundB = 1;
        }
        const inF = document.getElementById('int-func');
        const inA = document.getElementById('int-bound-a');
        const inB = document.getElementById('int-bound-b');
        if (inF) inF.value = this.funcExpr;
        if (inA) inA.value = this.boundA;
        if (inB) inB.value = this.boundB;
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-int-calculate');
    if (btn) {
      btn.addEventListener('click', () => {
        const inF = document.getElementById('int-func');
        const inA = document.getElementById('int-bound-a');
        const inB = document.getElementById('int-bound-b');

        if (inF) this.funcExpr = inF.value.trim() || 'x^2';
        if (inA) this.boundA = parseFloat(inA.value) || 0;
        if (inB) this.boundB = parseFloat(inB.value) || 1;

        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('int-results-container');
    if (!resultsContainer) return;

    if (this.activeTab === 'definite') {
      const res = CalculusEngine.definiteIntegral(this.funcExpr, this.boundA, this.boundB);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Integration Error</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      if (this.visualizer) {
        this.visualizer.updateOptions({
          exprStr: this.funcExpr,
          xMin: Math.min(-1, this.boundA - 1),
          xMax: Math.max(4, this.boundB + 1.5),
          shadeBounds: { a: this.boundA, b: this.boundB, type: 'under' }
        });
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Hero -->
          <div class="calculus-result-hero">
            <div class="result-hero-label">Definite Integral Value</div>
            <div class="result-hero-value">
              ∫_{${res.result.a}}^{${res.result.b}} (${res.result.expression}) dx = ${res.result.numericalValue}
            </div>
            <div style="font-size: 0.95rem; color: var(--text-secondary);">
              Symbolic Antiderivative: <strong style="color: var(--accent-cyan);">${res.result.antiderivative} + C</strong>
            </div>
          </div>

          <!-- Derivation -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Step-by-Step Evaluation (Fundamental Theorem)
            </h3>
            ${res.steps.map(step => `
              <div class="step-card">
                <div class="step-card-body">${step}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Indefinite
      const res = CalculusEngine.indefiniteIntegral(this.funcExpr);
      if (!res.success) {
        resultsContainer.innerHTML = `
          <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
            <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Integration Error</div>
            <div style="color: var(--text-secondary);">${res.error}</div>
          </div>
        `;
        return;
      }

      if (this.visualizer) {
        this.visualizer.updateOptions({
          exprStr: this.funcExpr,
          shadeBounds: null
        });
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
          <!-- Hero -->
          <div class="calculus-result-hero">
            <div class="result-hero-label">Symbolic Indefinite Integral</div>
            <div class="result-hero-value">
              ∫ (${res.result.integrand}) dx = ${res.result.finalResult}
            </div>
            <div style="font-size: 0.95rem; color: var(--text-secondary);">
              Rule: <strong style="color: var(--accent-cyan);">${res.result.ruleApplied}</strong>
            </div>
          </div>

          <!-- Derivation -->
          <div class="derivation-section">
            <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
              Integration Steps
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
  }

  destroy() {
    if (this.visualizer) {
      this.visualizer.destroy();
      this.visualizer = null;
    }
  }
}
