/**
 * OG - Statistics Workspace Dashboard View
 * Visual Identity: Ivory (#E8E0D2), Gold (#B89A5A), Deep Atlas Navy (#0E1D61)
 * Premium Liquid Glass Architecture
 *
 * Provides:
 * - Header: STATISTICS "Turn data into meaningful information."
 * - Main Actions: Enter Data | Import Data | Analyze Data | Create Chart | Clear Dataset
 * - Dataset Quick Analysis Panel (Raw comma/space/line data)
 * - Population vs Sample variance/std dev toggle (explicit, not silent)
 * - Metrics Panel (Count, Sum, Mean, Median, Mode, Min, Max, Range, Variance, Std Dev, CV)
 * - Visualization Lab Canvas (Histogram, Bar, Box Plot, Scatter, Pie, Frequency Polygon, Curve)
 * - 7-Stage Mathematical Derivation (Problem -> Data -> Formula -> Substitution -> Calc -> Result -> Interpretation)
 * - Navigation links to the 12 specialized Statistics tools and curriculum modules
 *
 * ES6 Module
 */

import { store } from '../../state.js';
import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { StatisticsMathEngine } from '../../math/statistics.js';
import { StatisticalChartVisualizer } from './charts.js';

export const STATISTICS_TOOLS = [
  { id: 'data-input',        num: '01', icon: '📋', title: 'Data Input & Table',      desc: 'Interactive table with index, frequencies & cumulative totals' },
  { id: 'descriptive',       num: '02', icon: '📊', title: 'Descriptive Statistics',  desc: 'Complete summary: mean, median, mode, pop vs sample variance' },
  { id: 'central-tendency',  num: '03', icon: '🎯', title: 'Central Tendency',        desc: 'Arithmetic, weighted, frequency & grouped means' },
  { id: 'dispersion',        num: '04', icon: '📏', title: 'Measures of Dispersion',  desc: 'Range, quartile dev, mean dev, variance & CV (%)' },
  { id: 'frequency-dist',    num: '05', icon: '🔢', title: 'Frequency Distribution',  desc: 'Sturges class intervals, widths, relative & cumulative counts' },
  { id: 'grouped-data',      num: '06', icon: '📑', title: 'Grouped Data Lab',        desc: 'Interpolation formulas for grouped mean, median & mode' },
  { id: 'quantiles',         num: '07', icon: '📐', title: 'Quartiles & Percentiles', desc: 'Q1-Q3, IQR, D1-D9, P1-P99, custom P_k & IQR outlier fences' },
  { id: 'correlation',       num: '08', icon: '🔄', title: 'Correlation Lab',         desc: 'Pearson r coefficient, covariance, interpretation (no causation)' },
  { id: 'regression',        num: '09', icon: '📈', title: 'Linear Regression',       desc: 'ŷ = a + bx, slope, intercept, R² and estimated point prediction' },
  { id: 'visualization',     num: '10', icon: '📉', title: 'Visualization Lab',       desc: 'Histogram, bar, box plot, scatter, pie & frequency curves' },
  { id: 'calculator',        num: '11', icon: '🧮', title: 'Statistics Calculator',   desc: 'Unified multi-operation statistical engine evaluator' },
  { id: 'practice-lab',      num: '12', icon: '🧠', title: 'Statistics Practice Lab', desc: 'Interactive drills with instant step-by-step solutions' }
];

export class StatisticsView {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.chartVisualizer = null;
    this.currentRawInput = '10, 12, 15, 18, 20, 20, 22, 25';
    this.isSample = false; // Population (false) vs Sample (true)
    this.activeChartType = 'histogram';
    this.analysisResult = null;
    this._listeners = [];
  }

  mount() {
    this.render();
    this._attachListeners();
    this._initVisualizer();
    this.analyzeCurrentData();
  }

  destroy() {
    this._listeners.forEach(({ el, evt, fn }) => {
      try { el.removeEventListener(evt, fn); } catch (e) {}
    });
    this._listeners = [];

    if (this.chartVisualizer && typeof this.chartVisualizer.destroy === 'function') {
      this.chartVisualizer.destroy();
      this.chartVisualizer = null;
    }
  }

  _on(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn);
    this._listeners.push({ el, evt, fn });
  }

  render() {
    this.container.innerHTML = `
      <div class="stats-workspace view-animate-in">

        <!-- Header -->
        <header class="stats-header">
          <div class="stats-header-text">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <span class="stats-badge">
                <span class="stats-badge-dot"></span>
                Statistics Workspace
              </span>
              <span class="stats-subbadge">Module #13</span>
            </div>
            <h1 class="stats-title">STATISTICS</h1>
            <p class="stats-subtitle">"Turn data into meaningful information."</p>
          </div>
          <div class="stats-quick-actions">
            <button class="stats-btn stats-btn-gold" id="btn-stats-enter" title="Enter or edit raw observations">
              ${SVG_ICONS.edit || '✍️'} Enter Data
            </button>
            <button class="stats-btn stats-btn-outline" id="btn-stats-import" title="Load sample dataset presets">
              ${SVG_ICONS.upload || '📥'} Import Data
            </button>
            <button class="stats-btn stats-btn-primary" id="btn-stats-analyze" title="Compute all descriptive metrics">
              ${SVG_ICONS.check || '⚡'} Analyze Data
            </button>
            <button class="stats-btn stats-btn-outline" id="btn-stats-chart-action" title="Jump to visualization view">
              ${SVG_ICONS.graph || '📊'} Create Chart
            </button>
            <button class="stats-btn stats-btn-outline" id="btn-stats-clear" title="Clear input field">
              ${SVG_ICONS.trash || '🗑️'} Clear Dataset
            </button>
          </div>
        </header>

        <!-- Presets Row -->
        <div class="stats-presets-bar">
          <span class="stats-presets-label">Datasets:</span>
          <button class="stats-preset-chip active" data-data="10, 12, 15, 18, 20, 20, 22, 25">Example (N=8)</button>
          <button class="stats-preset-chip" data-data="10, 20, 30, 40, 50">Symmetric (10-50)</button>
          <button class="stats-preset-chip" data-data="45, 78, 82, 90, 65, 82, 94, 70, 88, 76">Exam Marks</button>
          <button class="stats-preset-chip" data-data="12, 15, 19, 21, 24, 25, 28, 31, 33, 95">With Outlier (95)</button>
          <button class="stats-preset-chip" data-data="5, 8, 12, 15, 18, 22, 25, 29, 34, 38">Uniform Trend</button>
        </div>

        <!-- Universal Input & Mode Bar -->
        <div class="stats-input-card glass-panel">
          <div class="stats-input-header">
            <span class="stats-input-title">Dataset (Comma, Space, or Line-Separated)</span>
            <div class="stats-mode-toggle" id="stats-pop-sample-toggle">
              <span class="stats-toggle-label">Variance Mode:</span>
              <button class="stats-toggle-btn ${!this.isSample ? 'active' : ''}" id="mode-population" title="Compute Population parameters (N)">
                Population (N)
              </button>
              <button class="stats-toggle-btn ${this.isSample ? 'active' : ''}" id="mode-sample" title="Compute Sample statistics (N - 1)">
                Sample (N - 1)
              </button>
            </div>
          </div>
          <div class="stats-input-row">
            <textarea id="stats-dataset-input" class="stats-textarea" rows="2" placeholder="e.g. 10, 12, 15, 18, 20, 20, 22, 25">${this.currentRawInput}</textarea>
            <button class="stats-btn stats-btn-primary stats-analyze-btn" id="btn-submit-data">
              Confirm & Analyze
            </button>
          </div>
          <div class="stats-input-hint">
            <span>Tip: Confirm or submit dataset to recalculate statistics. Supports negative numbers, decimals, and custom sizes.</span>
          </div>
        </div>

        <!-- Split Workspace: Metrics on Left, Visualization on Right -->
        <div class="stats-split-grid">

          <!-- Left: METRICS PANEL -->
          <div class="stats-panel glass-panel" id="stats-metrics-panel">
            <div class="stats-panel-header">
              <div class="stats-panel-title">
                <span class="stats-indicator-dot"></span>
                METRICS SUMMARY
              </div>
              <div class="stats-panel-badge" id="stats-count-badge">N = 8</div>
            </div>

            <div class="stats-metrics-grid" id="stats-metrics-grid">
              <!-- Rendered dynamically -->
            </div>

            <!-- Additional Dispersion & Quantiles summary -->
            <div class="stats-submetrics-box" id="stats-submetrics-box">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Right: VISUALIZATION LAB -->
          <div class="stats-panel glass-panel" id="stats-visual-panel">
            <div class="stats-panel-header">
              <div class="stats-panel-title">
                <span class="stats-indicator-dot gold"></span>
                VISUALIZATION LAB
              </div>
              <!-- Chart selector pills -->
              <div class="stats-chart-selector" id="stats-chart-type-selector">
                <button class="stats-chart-btn active" data-chart="histogram">Histogram</button>
                <button class="stats-chart-btn" data-chart="bar">Bar</button>
                <button class="stats-chart-btn" data-chart="boxplot">Box Plot</button>
                <button class="stats-chart-btn" data-chart="polygon">Polygon</button>
                <button class="stats-chart-btn" data-chart="curve">Curve</button>
                <button class="stats-chart-btn" data-chart="pie">Pie</button>
              </div>
            </div>

            <div class="stats-canvas-container">
              <canvas id="stats-main-canvas"></canvas>
            </div>

            <div class="stats-canvas-footer">
              <span id="stats-chart-caption">Interactive Histogram with dynamic bin frequencies</span>
              <button class="stats-btn stats-btn-xs" id="btn-export-chart">Copy Chart</button>
            </div>
          </div>

        </div>

        <!-- 7-Stage Mathematical Derivation Section -->
        <div class="stats-derivation-card glass-panel" id="stats-derivation-container">
          <!-- Rendered dynamically -->
        </div>

        <!-- 12 Sub-Tools & Labs Navigation Grid -->
        <div class="stats-tools-section">
          <div class="stats-tools-header">
            <div>
              <h2 class="stats-tools-title">STATISTICS MODULES & LABS</h2>
              <p class="stats-tools-sub">Access the full 12-component analytical and practice suite</p>
            </div>
            <a href="#/modules/13" class="stats-curriculum-link">
              View Curriculum Module #13 →
            </a>
          </div>

          <div class="stats-tools-grid">
            ${STATISTICS_TOOLS.map(tool => `
              <a href="#/statistics-tools/${tool.id}" class="stats-tool-card glass-card">
                <div class="stats-tool-top">
                  <span class="stats-tool-num">${tool.num}</span>
                  <span class="stats-tool-icon">${tool.icon}</span>
                </div>
                <div class="stats-tool-name">${tool.title}</div>
                <div class="stats-tool-desc">${tool.desc}</div>
              </a>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  _attachListeners() {
    // Mode toggle
    const popBtn = document.getElementById('mode-population');
    const samBtn = document.getElementById('mode-sample');
    if (popBtn && samBtn) {
      this._on(popBtn, 'click', () => {
        this.isSample = false;
        popBtn.classList.add('active');
        samBtn.classList.remove('active');
        this.analyzeCurrentData();
      });
      this._on(samBtn, 'click', () => {
        this.isSample = true;
        samBtn.classList.add('active');
        popBtn.classList.remove('active');
        this.analyzeCurrentData();
      });
    }

    // Submit / Analyze buttons
    const analyzeBtn = document.getElementById('btn-stats-analyze');
    const submitBtn = document.getElementById('btn-submit-data');
    const inputEl = document.getElementById('stats-dataset-input');

    const handleAnalyze = () => {
      if (inputEl) {
        this.currentRawInput = inputEl.value;
      }
      this.analyzeCurrentData();
    };

    if (analyzeBtn) this._on(analyzeBtn, 'click', handleAnalyze);
    if (submitBtn) this._on(submitBtn, 'click', handleAnalyze);

    // Enter Data button focuses textarea
    const enterBtn = document.getElementById('btn-stats-enter');
    if (enterBtn && inputEl) {
      this._on(enterBtn, 'click', () => {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    // Clear Dataset
    const clearBtn = document.getElementById('btn-stats-clear');
    if (clearBtn && inputEl) {
      this._on(clearBtn, 'click', () => {
        inputEl.value = '';
        this.currentRawInput = '';
        showToast('Dataset cleared');
      });
    }

    // Presets bar
    const presetChips = document.querySelectorAll('.stats-preset-chip');
    presetChips.forEach(chip => {
      this._on(chip, 'click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const val = chip.getAttribute('data-data');
        if (inputEl) inputEl.value = val;
        this.currentRawInput = val;
        this.analyzeCurrentData();
      });
    });

    // Chart Type Selector
    const chartBtns = document.querySelectorAll('.stats-chart-btn');
    chartBtns.forEach(btn => {
      this._on(btn, 'click', () => {
        chartBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeChartType = btn.getAttribute('data-chart');
        this._updateChart();
      });
    });

    // Chart action jump
    const chartAction = document.getElementById('btn-stats-chart-action');
    if (chartAction) {
      this._on(chartAction, 'click', () => {
        const visualPanel = document.getElementById('stats-visual-panel');
        if (visualPanel) visualPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    // Copy chart button
    const exportBtn = document.getElementById('btn-export-chart');
    if (exportBtn) {
      this._on(exportBtn, 'click', () => {
        if (this.chartVisualizer && this.chartVisualizer.canvas) {
          try {
            this.chartVisualizer.canvas.toBlob(blob => {
              if (blob && navigator.clipboard && navigator.clipboard.write) {
                navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                showToast('Chart image copied to clipboard');
              } else {
                showToast('Chart copied');
              }
            });
          } catch (e) {
            showToast('Unable to copy chart to clipboard');
          }
        }
      });
    }
  }

  _initVisualizer() {
    const canvas = document.getElementById('stats-main-canvas');
    if (canvas) {
      this.chartVisualizer = new StatisticalChartVisualizer(canvas);
      this.chartVisualizer.resize();
    }
  }

  analyzeCurrentData() {
    const res = StatisticsMathEngine.analyze(this.currentRawInput, this.isSample);
    if (!res.success) {
      showToast(res.error || 'Invalid dataset', 'error');
      this._renderError(res.error);
      return;
    }

    this.analysisResult = res.result;

    // Save to OG state / history
    try {
      store.addHistoryItem({
        type: 'Statistics Analysis',
        summary: `N = ${res.result.n}, Mean = ${res.result.mean}, ${this.isSample ? 'Sample' : 'Pop'} SD = ${res.result.primaryStdDev}`,
        timestamp: Date.now()
      });
    } catch (e) {}

    this._renderMetrics();
    this._renderDerivation(res.result.derivation7Stage, res.steps);
    this._updateChart();
  }

  _renderError(errMsg) {
    const grid = document.getElementById('stats-metrics-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="stats-error-box">
          <span class="stats-error-icon">⚠️</span>
          <div>
            <strong>Calculation Error:</strong>
            <p style="margin: 4px 0 0 0; color: #b91c1c;">${errMsg}</p>
          </div>
        </div>
      `;
    }
  }

  _renderMetrics() {
    const r = this.analysisResult;
    if (!r) return;

    const badge = document.getElementById('stats-count-badge');
    if (badge) badge.textContent = `N = ${r.n}`;

    const grid = document.getElementById('stats-metrics-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="stats-metric-card">
          <span class="stats-metric-label">Count (N)</span>
          <span class="stats-metric-val">${r.n}</span>
        </div>
        <div class="stats-metric-card">
          <span class="stats-metric-label">Sum (∑x)</span>
          <span class="stats-metric-val">${r.sum}</span>
        </div>
        <div class="stats-metric-card highlight">
          <span class="stats-metric-label">Mean (x̄)</span>
          <span class="stats-metric-val">${r.mean}</span>
        </div>
        <div class="stats-metric-card highlight">
          <span class="stats-metric-label">Median (M)</span>
          <span class="stats-metric-val">${r.median}</span>
        </div>
        <div class="stats-metric-card">
          <span class="stats-metric-label">Mode</span>
          <span class="stats-metric-val">${r.modes && r.modes.length ? r.modes.join(', ') : 'None'}</span>
        </div>
        <div class="stats-metric-card">
          <span class="stats-metric-label">Minimum</span>
          <span class="stats-metric-val">${r.min}</span>
        </div>
        <div class="stats-metric-card">
          <span class="stats-metric-label">Maximum</span>
          <span class="stats-metric-val">${r.max}</span>
        </div>
        <div class="stats-metric-card">
          <span class="stats-metric-label">Range</span>
          <span class="stats-metric-val">${r.range}</span>
        </div>
        <div class="stats-metric-card">
          <span class="stats-metric-label">Midrange</span>
          <span class="stats-metric-val">${r.midrange}</span>
        </div>
        <div class="stats-metric-card highlight">
          <span class="stats-metric-label">${this.isSample ? 'Sample Variance (s²)' : 'Pop Variance (σ²)'}</span>
          <span class="stats-metric-val">${r.primaryVariance}</span>
        </div>
        <div class="stats-metric-card highlight">
          <span class="stats-metric-label">${this.isSample ? 'Sample Std Dev (s)' : 'Pop Std Dev (σ)'}</span>
          <span class="stats-metric-val">${r.primaryStdDev}</span>
        </div>
        <div class="stats-metric-card">
          <span class="stats-metric-label">Coeff. Variation (CV)</span>
          <span class="stats-metric-val">${r.primaryCv}%</span>
        </div>
      `;
    }

    const subBox = document.getElementById('stats-submetrics-box');
    if (subBox && r.quantiles) {
      const q = r.quantiles;
      subBox.innerHTML = `
        <div class="stats-submetric-row">
          <span>Quartiles:</span>
          <strong>Q₁ = ${q.q1} | Q₂ = ${q.q2} | Q₃ = ${q.q3}</strong>
        </div>
        <div class="stats-submetric-row">
          <span>Interquartile Range (IQR):</span>
          <strong>${q.iqr} (Quartile Dev = ${q.quartileDev})</strong>
        </div>
        <div class="stats-submetric-row">
          <span>Outlier Fences:</span>
          <span>Lower = ${q.lowerFence} | Upper = ${q.upperFence}</span>
        </div>
        <div class="stats-submetric-row">
          <span>Detected Outliers:</span>
          <span style="color: ${q.outliers.length ? '#b91c1c' : 'var(--text-muted)'}; font-weight: 600;">
            ${q.outliers.length ? q.outliers.join(', ') : 'None detected'}
          </span>
        </div>
      `;
    }
  }

  _updateChart() {
    if (!this.chartVisualizer || !this.analysisResult) return;

    const r = this.analysisResult;
    const sorted = r.sorted || [];

    // Frequency distribution for histogram and polygon
    const freqRes = StatisticsMathEngine.generateFrequencyDistribution(sorted);
    const bins = freqRes.success ? freqRes.result.bins : [];

    const captionEl = document.getElementById('stats-chart-caption');

    switch (this.activeChartType) {
      case 'histogram':
        if (captionEl) captionEl.textContent = `Frequency Histogram with ${bins.length} intervals (Bin width = ${freqRes.result.classWidth})`;
        this.chartVisualizer.setData('histogram', { bins });
        break;
      case 'bar': {
        if (captionEl) captionEl.textContent = 'Observation Value Bar Distribution';
        const items = sorted.map((v, i) => ({ label: `#${i + 1}`, value: v }));
        this.chartVisualizer.setData('bar', { items });
        break;
      }
      case 'boxplot':
        if (captionEl) captionEl.textContent = `Box & Whisker Plot with Outlier Fences (IQR = ${r.quantiles.iqr})`;
        this.chartVisualizer.setData('boxplot', {
          sorted,
          quantiles: r.quantiles
        });
        break;
      case 'polygon':
        if (captionEl) captionEl.textContent = 'Frequency Polygon connecting class midpoints';
        this.chartVisualizer.setData('polygon', { bins });
        break;
      case 'curve':
        if (captionEl) captionEl.textContent = 'Smoothed Frequency Distribution Curve';
        this.chartVisualizer.setData('curve', { bins });
        break;
      case 'pie':
        if (captionEl) captionEl.textContent = 'Proportional Class Frequency Sectors';
        this.chartVisualizer.setData('pie', { bins });
        break;
      default:
        this.chartVisualizer.setData('histogram', { bins });
    }
  }

  _renderDerivation(d, steps = []) {
    const container = document.getElementById('stats-derivation-container');
    if (!container || !d) return;

    container.innerHTML = `
      <div class="stats-derivation-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="stats-stage-badge">7-STAGE PROOF</span>
          <h3 class="stats-derivation-title">MATHEMATICAL STEP-BY-STEP DERIVATION</h3>
        </div>
        <button class="stats-btn stats-btn-xs" id="btn-copy-steps">
          ${SVG_ICONS.copy || '📋'} Copy Solution
        </button>
      </div>

      <div class="stats-stages-flow">
        <div class="stats-stage-item">
          <div class="stats-stage-num">01</div>
          <div class="stats-stage-content">
            <span class="stats-stage-label">PROBLEM STATEMENT</span>
            <div class="stats-stage-text">${d.problem}</div>
          </div>
        </div>

        <div class="stats-stage-item">
          <div class="stats-stage-num">02</div>
          <div class="stats-stage-content">
            <span class="stats-stage-label">DATA / EVENTS</span>
            <div class="stats-stage-text font-mono">${d.data}</div>
          </div>
        </div>

        <div class="stats-stage-item">
          <div class="stats-stage-num">03</div>
          <div class="stats-stage-content">
            <span class="stats-stage-label">FORMULA / THEOREM</span>
            <div class="stats-stage-text font-mono highlight-gold">${d.formula}</div>
          </div>
        </div>

        <div class="stats-stage-item">
          <div class="stats-stage-num">04</div>
          <div class="stats-stage-content">
            <span class="stats-stage-label">SUBSTITUTION</span>
            <div class="stats-stage-text font-mono">${d.substitution}</div>
          </div>
        </div>

        <div class="stats-stage-item">
          <div class="stats-stage-num">05</div>
          <div class="stats-stage-content">
            <span class="stats-stage-label">CALCULATION</span>
            <div class="stats-stage-text font-mono">${d.calculation}</div>
          </div>
        </div>

        <div class="stats-stage-item">
          <div class="stats-stage-num">06</div>
          <div class="stats-stage-content">
            <span class="stats-stage-label">FINAL RESULT</span>
            <div class="stats-stage-text font-mono highlight-navy">${d.result}</div>
          </div>
        </div>

        <div class="stats-stage-item">
          <div class="stats-stage-num">07</div>
          <div class="stats-stage-content">
            <span class="stats-stage-label">INTERPRETATION & CONTEXT</span>
            <div class="stats-stage-text">${d.interpretation}</div>
          </div>
        </div>
      </div>
    `;

    const copyBtn = document.getElementById('btn-copy-steps');
    if (copyBtn) {
      this._on(copyBtn, 'click', () => {
        const text = `
=== STATISTICS DERIVATION ===
Problem: ${d.problem}
Data: ${d.data}
Formula: ${d.formula}
Substitution: ${d.substitution}
Calculation: ${d.calculation}
Result: ${d.result}
Interpretation: ${d.interpretation}
        `.trim();
        copyToClipboard(text);
        showToast('Step-by-step solution copied');
      });
    }
  }
}
