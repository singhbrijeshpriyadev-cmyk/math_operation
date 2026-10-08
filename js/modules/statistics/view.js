/**
 * OG - Module 13: Statistics View
 * Interactive analysis of measures of central tendency and dispersion:
 * - Mean, Median, Mode, Range
 * - Mean Deviation about Mean & Median
 * - Population & Sample Variance, Standard Deviation, CV (%)
 * - Interactive Frequency Histogram on Canvas.
 * ES6 Module
 */

import { StatisticsMathEngine } from '../../math/statistics.js';

export class StatisticsView {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;

    this.rawInput = '6, 7, 10, 12, 13, 4, 8, 12';
  }

  mount() {
    this.render();
    this.attachEventListeners();
    this.initCanvas();
    this.calculate();
  }

  render() {
    this.container.innerHTML = `
      <div class="calculus-container">
        <!-- Header -->
        <div class="calculus-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="calculus-badge" style="background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.35); color: #f59e0b;">
                Module #13
              </span>
              <span class="badge badge-stats">Statistics</span>
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--text-white); margin: 0 0 8px 0;">
              Statistics & Dispersion
            </h1>
            <p style="color: var(--text-secondary); max-width: 680px; margin: 0; line-height: 1.5;">
              Analyze central tendency and dispersion of discrete data: mean, median, mean deviation,
              variance, standard deviation, and coefficient of variation (CV) with dynamic frequency histogram plotting.
            </p>
          </div>
        </div>

        <!-- Presets -->
        <div class="glass-panel" style="padding: 16px 20px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
            Sample Datasets:
          </div>
          <div class="calculus-preset-bar" id="stats-preset-container">
            <button class="preset-chip" data-preset="std">Standard: 6, 7, 10, 12, 13, 4, 8, 12</button>
            <button class="preset-chip" data-preset="marks">Exam Marks: 45, 78, 82, 90, 65, 82, 94, 70</button>
            <button class="preset-chip" data-preset="small">Discrete: 2, 4, 4, 4, 5, 5, 7, 9</button>
            <button class="preset-chip" data-preset="symmetric">Symmetric: 10, 20, 30, 40, 50</button>
          </div>
        </div>

        <!-- Workspace Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <!-- Controls Panel -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--text-white); font-weight: 700;">
              Dataset Input
            </h3>

            <div class="calculus-input-group">
              <label>Observations (comma or space-separated):</label>
              <textarea id="stats-data-input" class="calculus-input-field" rows="4" style="resize: vertical;">${this.rawInput}</textarea>
            </div>

            <button class="glass-button glass-button-primary" id="btn-stats-calc" style="padding: 14px; font-weight: 600; font-size: 1rem; margin-top: 8px;">
              Calculate Dispersion & Plot Histogram
            </button>
          </div>

          <!-- Frequency Histogram Canvas -->
          <div class="calculus-graph-panel">
            <div style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-white); font-family: var(--font-mono);">
                Frequency Distribution Histogram
              </span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-family: var(--font-mono);">
                Dynamic Binning
              </span>
            </div>
            <div class="graph-canvas-wrapper">
              <canvas id="stats-canvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Results Showcase -->
        <div id="stats-results-container"></div>
      </div>
    `;
  }

  initCanvas() {
    this.canvas = document.getElementById('stats-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: 500 };
    const width = Math.max(rect.width, 320);
    const height = 300;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  drawHistogram(data) {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;
    if (!ctx || !w || !h || !data || data.length === 0) return;

    ctx.clearRect(0, 0, w, h);

    // Light Liquid Glass Ivory background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#EFE8DC');
    bg.addColorStop(1, '#E8E0D2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Group frequencies
    const freqMap = {};
    data.forEach(v => {
      freqMap[v] = (freqMap[v] || 0) + 1;
    });

    const uniqueKeys = Object.keys(freqMap).map(Number).sort((a, b) => a - b);
    const maxFreq = Math.max(...Object.values(freqMap));

    const padLeft = 40;
    const padBottom = 35;
    const padTop = 25;
    const padRight = 20;

    const chartW = w - padLeft - padRight;
    const chartH = h - padBottom - padTop;

    const barW = Math.min(chartW / uniqueKeys.length - 8, 45);

    // Draw baseline in Deep Atlas Navy
    ctx.strokeStyle = 'rgba(14, 29, 97, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, h - padBottom);
    ctx.lineTo(w - padRight, h - padBottom);
    ctx.stroke();

    // Draw Bars in Gold
    uniqueKeys.forEach((val, i) => {
      const count = freqMap[val];
      const barH = (count / maxFreq) * chartH;
      const x = padLeft + (i / uniqueKeys.length) * chartW + (chartW / uniqueKeys.length - barW) / 2;
      const y = h - padBottom - barH;

      // Gradient Fill in refined Gold
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, '#B89A5A');
      grad.addColorStop(1, 'rgba(184, 154, 90, 0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      ctx.strokeStyle = '#B89A5A';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, barW, barH);

      // Value label in Deep Atlas Navy
      ctx.fillStyle = 'rgba(14, 29, 97, 0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x + barW / 2, h - padBottom + 16);

      // Count label in Deep Atlas Navy
      ctx.fillStyle = '#0E1D61';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(String(count), x + barW / 2, y - 6);
    });
  }

  attachEventListeners() {
    const presetContainer = document.getElementById('stats-preset-container');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        const p = chip.dataset.preset;
        if (p === 'std') this.rawInput = '6, 7, 10, 12, 13, 4, 8, 12';
        else if (p === 'marks') this.rawInput = '45, 78, 82, 90, 65, 82, 94, 70';
        else if (p === 'small') this.rawInput = '2, 4, 4, 4, 5, 5, 7, 9';
        else if (p === 'symmetric') this.rawInput = '10, 20, 30, 40, 50';

        const inEl = document.getElementById('stats-data-input');
        if (inEl) inEl.value = this.rawInput;
        this.calculate();
      });
    }

    const btn = document.getElementById('btn-stats-calc');
    if (btn) {
      btn.addEventListener('click', () => {
        const inEl = document.getElementById('stats-data-input');
        if (inEl) this.rawInput = inEl.value;
        this.calculate();
      });
    }
  }

  calculate() {
    const resultsContainer = document.getElementById('stats-results-container');
    if (!resultsContainer) return;

    const res = StatisticsMathEngine.analyze(this.rawInput);
    if (!res.success) {
      resultsContainer.innerHTML = `
        <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-rose);">
          <div style="color: var(--accent-rose); font-weight: 700; margin-bottom: 6px;">Input Error</div>
          <div style="color: var(--text-secondary);">${res.error}</div>
        </div>
      `;
      return;
    }

    this.drawHistogram(res.result.data);

    resultsContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s ease;">
        <!-- Metrics Grid Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div class="glass-panel" style="padding: 18px; border-top: 3px solid #B89A5A;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Mean (μ)</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono);">${res.result.mean}</div>
          </div>
          <div class="glass-panel" style="padding: 18px; border-top: 3px solid #0E1D61;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Median (M)</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono);">${res.result.median}</div>
          </div>
          <div class="glass-panel" style="padding: 18px; border-top: 3px solid #B89A5A;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Variance (σ²)</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono);">${res.result.variance}</div>
          </div>
          <div class="glass-panel" style="padding: 18px; border-top: 3px solid #0E1D61;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Std Deviation (σ)</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #0E1D61; font-family: var(--font-mono);">${res.result.stdDev}</div>
          </div>
        </div>

        <!-- Secondary Dispersion Metrics -->
        <div class="calculus-result-hero">
          <div class="result-hero-label">Dispersion Summary (N = ${res.result.n})</div>
          <div style="display: flex; flex-wrap: wrap; gap: 24px; font-size: 1.05rem;">
            <span>MD about Mean: <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${res.result.mdMean}</strong></span>
            <span>MD about Median: <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${res.result.mdMedian}</strong></span>
            <span>Range: <strong style="color: var(--accent-violet); font-family: var(--font-mono);">${res.result.range}</strong></span>
            <span>Coefficient of Variation (CV): <strong style="color: #10b981; font-family: var(--font-mono);">${res.result.cv}%</strong></span>
          </div>
        </div>

        <!-- Derivation -->
        <div class="derivation-section">
          <h3 style="margin: 0; color: var(--text-white); font-size: 1.25rem;">
            Complete Statistical Steps
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

  destroy() {
    this.canvas = null;
    this.ctx = null;
  }
}
