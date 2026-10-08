/**
 * OG - Statistics Specialized Tools & Labs View
 * Handles dedicated routing for 12 tools at #/statistics-tools/:tool
 *
 * Tools:
 * 01. Data Input & Interactive Data Table (Add/remove rows, edit values/freq, sort asc/desc, cf, %)
 * 02. Descriptive Statistics (Population & Sample with exhaustive measures)
 * 03. Measures of Central Tendency (Arithmetic, Weighted, Frequency, Grouped)
 * 04. Measures of Dispersion (Range, Quartile Dev, Mean Dev, Variance, Std Dev, CV)
 * 05. Frequency Distribution Generator (Class intervals, widths, relative & cumulative counts)
 * 06. Grouped Data Lab (Grouped mean, median, modal class, variance & quartiles)
 * 07. Quartiles, Deciles & Percentiles (Q1-Q3, IQR, D1-D9, P1-P99, custom P_k, Outlier fences)
 * 08. Correlation Lab (Pearson r, Covariance, Strength & Direction, No-causation disclaimer)
 * 09. Simple Linear Regression (ŷ = a + bx, Slope, Intercept, R², Point estimation)
 * 10. Statistical Visualization Lab (Dedicated canvas with all 7 chart types)
 * 11. Statistics Calculator (Multi-operation evaluator)
 * 12. Statistics Practice Lab (Interactive drills with instant grading & explanations)
 *
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { StatisticsMathEngine } from '../../math/statistics.js';
import { StatisticalChartVisualizer } from './charts.js';

export class StatisticsToolsView {
  constructor(container, initialTool = 'data-input') {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.activeTool = initialTool || 'data-input';
    this.chartVisualizer = null;
    this._listeners = [];

    // Interactive Data Table state
    this.tableRows = [
      { id: 1, value: 10, frequency: 2 },
      { id: 2, value: 20, frequency: 5 },
      { id: 3, value: 30, frequency: 3 }
    ];

    // Practice Lab questions
    this.practiceScore = { answered: 0, correct: 0 };
    this.practiceQuestions = [
      {
        id: 1,
        question: 'What is the median of the dataset: 10, 20, 30, 40, 50?',
        options: ['20', '30', '35', '25'],
        correct: 1,
        explanation: 'For an odd number of observations (N = 5), the median is at position (5 + 1)/2 = 3rd value, which is 30.'
      },
      {
        id: 2,
        question: 'If sample standard deviation s = 5 and sample mean x̄ = 25, what is the Coefficient of Variation (CV)?',
        options: ['12.5%', '20%', '50%', '5%'],
        correct: 1,
        explanation: 'CV = (s / x̄) × 100% = (5 / 25) × 100% = 20%.'
      },
      {
        id: 3,
        question: 'Which measure of dispersion is used to detect potential outliers using 1.5 × IQR fences?',
        options: ['Range', 'Mean Deviation', 'Interquartile Range (IQR)', 'Standard Deviation'],
        correct: 2,
        explanation: 'Tukey’s standard outlier rule identifies points beyond Q₁ - 1.5×IQR and Q₃ + 1.5×IQR.'
      },
      {
        id: 4,
        question: 'If Pearson correlation r = 0.95 between variables X and Y, what can be mathematically concluded?',
        options: [
          'Increasing X directly causes Y to increase',
          'There is a strong positive linear relationship between X and Y',
          'Y is completely independent of X',
          'The regression slope must be 0.95'
        ],
        correct: 1,
        explanation: 'Correlation measures the strength and direction of linear association, but correlation does not imply causation.'
      }
    ];
  }

  mount() {
    this.render();
    this._attachListeners();
    this._initToolLogic();
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
      <div class="stats-tools-workspace view-animate-in">

        <!-- Top Navigation Bar -->
        <div class="stats-tools-topbar">
          <div class="stats-tools-breadcrumb">
            <a href="#/statistics" class="stats-back-btn">← Statistics Workspace</a>
            <span class="stats-sep">/</span>
            <span class="stats-current-tool-title">${this._getToolTitle(this.activeTool)}</span>
          </div>

          <!-- Tool Selector Pills -->
          <div class="stats-tools-pills-bar">
            ${this._renderToolPills()}
          </div>
        </div>

        <!-- Dynamic Tool Workspace Container -->
        <div class="stats-tool-content-card glass-panel" id="stats-tool-mount">
          ${this._renderToolBody(this.activeTool)}
        </div>

      </div>
    `;
  }

  _getToolTitle(id) {
    const titles = {
      'data-input': '01. Data Input & Interactive Table',
      'descriptive': '02. Descriptive Statistics Summary',
      'central-tendency': '03. Measures of Central Tendency',
      'dispersion': '04. Measures of Dispersion',
      'frequency-dist': '05. Frequency Distribution Generator',
      'grouped-data': '06. Grouped Frequency Data Lab',
      'quantiles': '07. Quartiles, Deciles & Percentiles',
      'correlation': '08. Pearson Correlation Lab',
      'regression': '09. Simple Linear Regression',
      'visualization': '10. Statistical Visualization Lab',
      'calculator': '11. Statistics Multi-Calculator',
      'practice-lab': '12. Statistics Practice Lab'
    };
    return titles[id] || 'Statistics Tool';
  }

  _renderToolPills() {
    const tools = [
      { id: 'data-input', label: 'Data Table' },
      { id: 'descriptive', label: 'Descriptive' },
      { id: 'central-tendency', label: 'Central Tendency' },
      { id: 'dispersion', label: 'Dispersion' },
      { id: 'frequency-dist', label: 'Frequency Dist' },
      { id: 'grouped-data', label: 'Grouped Data' },
      { id: 'quantiles', label: 'Quantiles' },
      { id: 'correlation', label: 'Correlation' },
      { id: 'regression', label: 'Regression' },
      { id: 'visualization', label: 'Visualization' },
      { id: 'calculator', label: 'Calculator' },
      { id: 'practice-lab', label: 'Practice Lab' }
    ];

    return tools.map(t => `
      <a href="#/statistics-tools/${t.id}" class="stats-pill-btn ${this.activeTool === t.id ? 'active' : ''}">
        ${t.label}
      </a>
    `).join('');
  }

  _renderToolBody(toolId) {
    switch (toolId) {
      case 'data-input':
        return this._templateDataTable();
      case 'descriptive':
        return this._templateDescriptive();
      case 'central-tendency':
        return this._templateCentralTendency();
      case 'dispersion':
        return this._templateDispersion();
      case 'frequency-dist':
        return this._templateFrequencyDist();
      case 'grouped-data':
        return this._templateGroupedData();
      case 'quantiles':
        return this._templateQuantiles();
      case 'correlation':
        return this._templateCorrelation();
      case 'regression':
        return this._templateRegression();
      case 'visualization':
        return this._templateVisualization();
      case 'calculator':
        return this._templateCalculator();
      case 'practice-lab':
        return this._templatePracticeLab();
      default:
        return this._templateDataTable();
    }
  }

  // --------------------------------------------------------------------------
  // 01. INTERACTIVE DATA TABLE
  // --------------------------------------------------------------------------
  _templateDataTable() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>01. Interactive Data Table</h2>
          <p>Add, edit, remove, and sort discrete value-frequency pairs with automated cumulative totals and percentages.</p>
        </div>

        <div class="stats-table-controls">
          <button class="stats-btn stats-btn-gold" id="btn-add-table-row">+ Add Row</button>
          <button class="stats-btn stats-btn-outline" id="btn-sort-asc">Sort Value Ascending</button>
          <button class="stats-btn stats-btn-outline" id="btn-sort-desc">Sort Value Descending</button>
          <button class="stats-btn stats-btn-primary" id="btn-analyze-table">Compute Statistics from Table</button>
        </div>

        <div class="stats-table-wrapper" id="stats-interactive-table-container">
          <!-- Rendered in _updateDataTable() -->
        </div>

        <div id="stats-table-results" style="margin-top: 24px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 02. DESCRIPTIVE STATISTICS
  // --------------------------------------------------------------------------
  _templateDescriptive() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>02. Descriptive Statistics Summary</h2>
          <p>Exhaustive descriptive breakdown comparing both Population (N) and Sample (N - 1) properties.</p>
        </div>

        <div class="stats-input-box">
          <label>Dataset Observations:</label>
          <textarea id="desc-input" class="stats-textarea" rows="2">10, 12, 15, 18, 20, 20, 22, 25</textarea>
          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button class="stats-btn stats-btn-primary" id="btn-run-desc">Generate Complete Summary</button>
          </div>
        </div>

        <div id="desc-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 03. CENTRAL TENDENCY
  // --------------------------------------------------------------------------
  _templateCentralTendency() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>03. Measures of Central Tendency</h2>
          <p>Compare Arithmetic Mean, Weighted Mean, Frequency Mean, Median, and Mode with step-by-step substitutions.</p>
        </div>

        <div class="stats-input-box">
          <label>Raw Data:</label>
          <textarea id="ct-input" class="stats-textarea" rows="2">10, 20, 30, 40, 50</textarea>
          <div style="margin-top: 10px;">
            <button class="stats-btn stats-btn-primary" id="btn-run-ct">Calculate Central Tendencies</button>
          </div>
        </div>

        <div id="ct-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 04. DISPERSION
  // --------------------------------------------------------------------------
  _templateDispersion() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>04. Measures of Dispersion</h2>
          <p>Analyze Spread: Range, Quartile Deviation, Mean Deviation about Mean & Median, Variance, Standard Deviation, and CV.</p>
        </div>

        <div class="stats-input-box">
          <label>Dataset:</label>
          <textarea id="disp-input" class="stats-textarea" rows="2">6, 7, 10, 12, 13, 4, 8, 12</textarea>
          <div style="margin-top: 10px;">
            <button class="stats-btn stats-btn-primary" id="btn-run-disp">Compute Dispersion Metrics</button>
          </div>
        </div>

        <div id="disp-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 05. FREQUENCY DISTRIBUTION
  // --------------------------------------------------------------------------
  _templateFrequencyDist() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>05. Frequency Distribution Generator</h2>
          <p>Construct equal class intervals using Sturges’ rule with midpoints, frequencies, and relative/percentage distributions.</p>
        </div>

        <div class="stats-input-box">
          <label>Raw Dataset:</label>
          <textarea id="freqgen-input" class="stats-textarea" rows="3">12, 15, 18, 20, 22, 25, 27, 30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55</textarea>
          <div style="display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap;">
            <div>
              <label style="font-size: 0.8rem;">Classes (optional):</label>
              <input type="number" id="freqgen-classes" class="stats-input-field" placeholder="Auto (Sturges)" style="width: 130px;">
            </div>
            <div>
              <label style="font-size: 0.8rem;">Class Width (optional):</label>
              <input type="number" id="freqgen-width" class="stats-input-field" placeholder="Auto" style="width: 130px;">
            </div>
            <div>
              <label style="font-size: 0.8rem;">Start Boundary:</label>
              <input type="number" id="freqgen-start" class="stats-input-field" placeholder="Auto (Min)" style="width: 130px;">
            </div>
            <div style="align-self: flex-end;">
              <button class="stats-btn stats-btn-primary" id="btn-run-freqgen">Generate Distribution</button>
            </div>
          </div>
        </div>

        <div id="freqgen-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 06. GROUPED DATA LAB
  // --------------------------------------------------------------------------
  _templateGroupedData() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>06. Grouped Frequency Data Lab</h2>
          <p>Calculate Grouped Mean, Grouped Median (L + [(N/2 - cf)/f]·h), Modal Class, Grouped Variance, and Quartiles.</p>
        </div>

        <div class="stats-input-box">
          <label>Grouped Intervals & Frequencies (Format: "Lower-Upper: Frequency"):</label>
          <textarea id="grouped-input" class="stats-textarea" rows="5">0-10: 5
10-20: 8
20-30: 12
30-40: 7</textarea>
          <div style="margin-top: 10px;">
            <button class="stats-btn stats-btn-primary" id="btn-run-grouped">Analyze Grouped Distribution</button>
          </div>
        </div>

        <div id="grouped-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 07. QUARTILES, DECILES & PERCENTILES
  // --------------------------------------------------------------------------
  _templateQuantiles() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>07. Quartiles, Deciles & Percentiles</h2>
          <p>Quantile partitions: Q₁ to Q₃, Deciles D₁ to D₉, and request any custom percentile Pₖ with Tukey outlier fences.</p>
        </div>

        <div class="stats-input-box">
          <label>Observations:</label>
          <textarea id="quant-input" class="stats-textarea" rows="2">10, 12, 15, 18, 20, 20, 22, 25, 30, 35, 40</textarea>
          <div style="display: flex; gap: 16px; margin-top: 12px; align-items: flex-end;">
            <div>
              <label style="font-size: 0.8rem;">Custom Percentile Pₖ (1-99):</label>
              <input type="number" id="quant-pk" class="stats-input-field" value="90" min="1" max="99" style="width: 110px;">
            </div>
            <button class="stats-btn stats-btn-primary" id="btn-run-quant">Calculate Quantiles</button>
          </div>
        </div>

        <div id="quant-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 08. CORRELATION LAB
  // --------------------------------------------------------------------------
  _templateCorrelation() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>08. Pearson Correlation Lab</h2>
          <p>Determine bivariate linear correlation coefficient r and covariance with rigorous interpretation (no causation claim).</p>
        </div>

        <div class="stats-input-box">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label>X Observations:</label>
              <textarea id="corr-x" class="stats-textarea" rows="2">1, 2, 3, 4, 5</textarea>
            </div>
            <div>
              <label>Y Observations:</label>
              <textarea id="corr-y" class="stats-textarea" rows="2">2, 4, 5, 8, 10</textarea>
            </div>
          </div>
          <div style="margin-top: 12px;">
            <button class="stats-btn stats-btn-primary" id="btn-run-corr">Calculate Pearson r & Covariance</button>
          </div>
        </div>

        <div id="corr-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 09. REGRESSION
  // --------------------------------------------------------------------------
  _templateRegression() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>09. Simple Linear Regression</h2>
          <p>Fit regression model ŷ = a + bx, compute slope b, intercept a, coefficient of determination R², and predict ŷ given x.</p>
        </div>

        <div class="stats-input-box">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label>X Values:</label>
              <textarea id="reg-x" class="stats-textarea" rows="2">1, 2, 3, 4, 5</textarea>
            </div>
            <div>
              <label>Y Values:</label>
              <textarea id="reg-y" class="stats-textarea" rows="2">2, 4, 5, 8, 10</textarea>
            </div>
          </div>
          <div style="display: flex; gap: 16px; margin-top: 12px; align-items: flex-end;">
            <div>
              <label style="font-size: 0.8rem;">Predict ŷ at x =</label>
              <input type="number" id="reg-predict-x" class="stats-input-field" value="6" style="width: 100px;">
            </div>
            <button class="stats-btn stats-btn-primary" id="btn-run-reg">Fit Regression Line & Predict</button>
          </div>
        </div>

        <div id="reg-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 10. VISUALIZATION LAB
  // --------------------------------------------------------------------------
  _templateVisualization() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>10. Statistical Visualization Lab</h2>
          <p>Interactive Canvas plotting with OG Palette (Ivory, Gold, Deep Atlas Navy): Histogram, Bar, Box Plot, Scatter, Pie, and Polygon.</p>
        </div>

        <div class="stats-input-box">
          <label>Data to Plot:</label>
          <textarea id="vis-input" class="stats-textarea" rows="2">10, 12, 15, 18, 20, 20, 22, 25</textarea>
          <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
            <button class="stats-btn stats-btn-outline vis-chart-toggle active" data-type="histogram">Histogram</button>
            <button class="stats-btn stats-btn-outline vis-chart-toggle" data-type="bar">Bar Chart</button>
            <button class="stats-btn stats-btn-outline vis-chart-toggle" data-type="boxplot">Box Plot</button>
            <button class="stats-btn stats-btn-outline vis-chart-toggle" data-type="polygon">Polygon</button>
            <button class="stats-btn stats-btn-outline vis-chart-toggle" data-type="curve">Curve</button>
            <button class="stats-btn stats-btn-outline vis-chart-toggle" data-type="pie">Pie Chart</button>
            <button class="stats-btn stats-btn-primary" id="btn-render-vis" style="margin-left: auto;">Render Chart</button>
          </div>
        </div>

        <div class="stats-canvas-wrapper glass-panel" style="margin-top: 20px; padding: 16px; height: 380px;">
          <canvas id="vis-tool-canvas" style="width: 100%; height: 100%;"></canvas>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 11. STATS CALCULATOR
  // --------------------------------------------------------------------------
  _templateCalculator() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>11. Unified Statistics Calculator</h2>
          <p>Select any statistical operation to instantly execute exact formulas, substitutions, and solution steps.</p>
        </div>

        <div class="stats-input-box">
          <label>Dataset:</label>
          <textarea id="calc-input" class="stats-textarea" rows="2">10, 20, 30, 40, 50</textarea>
          <div style="display: flex; gap: 12px; margin-top: 12px; align-items: center; flex-wrap: wrap;">
            <label style="font-size: 0.85rem;">Operation:</label>
            <select id="calc-op-select" class="stats-select-field">
              <option value="mean">Arithmetic Mean</option>
              <option value="median">Median</option>
              <option value="mode">Mode</option>
              <option value="variance">Variance & Standard Deviation</option>
              <option value="range">Range & Midrange</option>
              <option value="quantiles">Quartiles (Q1, Q2, Q3, IQR)</option>
            </select>
            <button class="stats-btn stats-btn-primary" id="btn-run-calc-op">Calculate Operation</button>
          </div>
        </div>

        <div id="calc-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 12. PRACTICE LAB
  // --------------------------------------------------------------------------
  _templatePracticeLab() {
    return `
      <div class="stats-tool-section">
        <div class="stats-tool-head">
          <h2>12. Statistics Practice Lab</h2>
          <p>Test your statistical reasoning with graded drills, feedback, and rigorous step-by-step explanations.</p>
        </div>

        <div class="stats-practice-score-bar" id="practice-score-banner">
          Score: 0 / ${this.practiceQuestions.length} answered
        </div>

        <div class="stats-practice-questions-list">
          ${this.practiceQuestions.map((q, qIdx) => `
            <div class="stats-practice-card glass-panel" id="practice-card-${q.id}">
              <div class="stats-practice-num">Question ${qIdx + 1}</div>
              <div class="stats-practice-q">${q.question}</div>
              <div class="stats-practice-options">
                ${q.options.map((opt, optIdx) => `
                  <button class="stats-practice-opt-btn" data-qid="${q.id}" data-opt="${optIdx}">
                    ${String.fromCharCode(65 + optIdx)}. ${opt}
                  </button>
                `).join('')}
              </div>
              <div class="stats-practice-feedback" id="feedback-${q.id}" style="display: none;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // LOGIC & EVENTS
  // --------------------------------------------------------------------------
  _attachListeners() {
    // Dynamic tab routing or actions
  }

  _initToolLogic() {
    if (this.activeTool === 'data-input') {
      this._initDataTableLogic();
    } else if (this.activeTool === 'descriptive') {
      this._initDescriptiveLogic();
    } else if (this.activeTool === 'central-tendency') {
      this._initCentralTendencyLogic();
    } else if (this.activeTool === 'dispersion') {
      this._initDispersionLogic();
    } else if (this.activeTool === 'frequency-dist') {
      this._initFrequencyDistLogic();
    } else if (this.activeTool === 'grouped-data') {
      this._initGroupedDataLogic();
    } else if (this.activeTool === 'quantiles') {
      this._initQuantilesLogic();
    } else if (this.activeTool === 'correlation') {
      this._initCorrelationLogic();
    } else if (this.activeTool === 'regression') {
      this._initRegressionLogic();
    } else if (this.activeTool === 'visualization') {
      this._initVisualizationLogic();
    } else if (this.activeTool === 'calculator') {
      this._initCalculatorLogic();
    } else if (this.activeTool === 'practice-lab') {
      this._initPracticeLogic();
    }
  }

  // DATA TABLE LOGIC
  _initDataTableLogic() {
    this._renderDataTable();

    const addBtn = document.getElementById('btn-add-table-row');
    if (addBtn) {
      this._on(addBtn, 'click', () => {
        const lastVal = this.tableRows.length ? this.tableRows[this.tableRows.length - 1].value + 10 : 10;
        this.tableRows.push({
          id: Date.now(),
          value: lastVal,
          frequency: 1
        });
        this._renderDataTable();
      });
    }

    const sortAsc = document.getElementById('btn-sort-asc');
    if (sortAsc) {
      this._on(sortAsc, 'click', () => {
        this.tableRows.sort((a, b) => a.value - b.value);
        this._renderDataTable();
      });
    }

    const sortDesc = document.getElementById('btn-sort-desc');
    if (sortDesc) {
      this._on(sortDesc, 'click', () => {
        this.tableRows.sort((a, b) => b.value - a.value);
        this._renderDataTable();
      });
    }

    const analyzeBtn = document.getElementById('btn-analyze-table');
    if (analyzeBtn) {
      this._on(analyzeBtn, 'click', () => {
        // Expand table rows to raw array
        const expanded = [];
        this.tableRows.forEach(r => {
          const count = Math.max(0, Math.round(r.frequency));
          for (let k = 0; k < count; k++) expanded.push(r.value);
        });

        const res = StatisticsMathEngine.analyze(expanded);
        const out = document.getElementById('stats-table-results');
        if (out && res.success) {
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Table Analysis Results (Total Observations N = ${res.result.n}):</h3>
              <p><strong>Mean:</strong> ${res.result.mean} | <strong>Median:</strong> ${res.result.median} | <strong>Mode:</strong> ${res.result.modes.join(', ') || 'None'}</p>
              <p><strong>Pop Variance:</strong> ${res.result.popVariance} | <strong>Sample Variance:</strong> ${res.result.sampleVariance} | <strong>Std Dev:</strong> ${res.result.popStdDev}</p>
            </div>
          `;
        }
      });
    }
  }

  _renderDataTable() {
    const container = document.getElementById('stats-interactive-table-container');
    if (!container) return;

    // Calculate totals and cumulative frequency
    let runningCum = 0;
    const totalFreq = this.tableRows.reduce((acc, r) => acc + (Number(r.frequency) || 0), 0);

    const rowsHtml = this.tableRows.map((r, idx) => {
      const f = Number(r.frequency) || 0;
      runningCum += f;
      const pct = totalFreq > 0 ? ((f / totalFreq) * 100).toFixed(1) + '%' : '0%';

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <input type="number" class="stats-table-input tbl-val" data-idx="${idx}" value="${r.value}">
          </td>
          <td>
            <input type="number" class="stats-table-input tbl-freq" data-idx="${idx}" value="${r.frequency}" min="0">
          </td>
          <td>${runningCum}</td>
          <td>${pct}</td>
          <td>
            <button class="stats-del-btn" data-idx="${idx}" title="Delete row">×</button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="stats-glass-table">
        <thead>
          <tr>
            <th>Index</th>
            <th>Value (xᵢ)</th>
            <th>Frequency (fᵢ)</th>
            <th>Cumulative Freq (cf)</th>
            <th>Percentage (%)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2"><strong>Totals:</strong></td>
            <td><strong>${totalFreq}</strong></td>
            <td><strong>${totalFreq}</strong></td>
            <td><strong>100%</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;

    // Row input listeners
    container.querySelectorAll('.tbl-val').forEach(input => {
      this._on(input, 'change', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        this.tableRows[i].value = parseFloat(e.target.value) || 0;
        this._renderDataTable();
      });
    });

    container.querySelectorAll('.tbl-freq').forEach(input => {
      this._on(input, 'change', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        this.tableRows[i].frequency = Math.max(0, parseFloat(e.target.value) || 0);
        this._renderDataTable();
      });
    });

    container.querySelectorAll('.stats-del-btn').forEach(btn => {
      this._on(btn, 'click', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        if (this.tableRows.length > 1) {
          this.tableRows.splice(i, 1);
          this._renderDataTable();
        } else {
          showToast('Table must have at least one row.');
        }
      });
    });
  }

  // DESCRIPTIVE LOGIC
  _initDescriptiveLogic() {
    const btn = document.getElementById('btn-run-desc');
    if (btn) {
      this._on(btn, 'click', () => {
        const val = document.getElementById('desc-input').value;
        const res = StatisticsMathEngine.analyze(val, false);
        const out = document.getElementById('desc-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Complete Descriptive Summary (N = ${r.n})</h3>
              <div class="stats-metrics-grid" style="margin-top: 12px;">
                <div class="stats-metric-card"><span class="stats-metric-label">Mean</span><span class="stats-metric-val">${r.mean}</span></div>
                <div class="stats-metric-card"><span class="stats-metric-label">Median</span><span class="stats-metric-val">${r.median}</span></div>
                <div class="stats-metric-card"><span class="stats-metric-label">Mode</span><span class="stats-metric-val">${r.modes.join(', ') || 'None'}</span></div>
                <div class="stats-metric-card"><span class="stats-metric-label">Pop Variance</span><span class="stats-metric-val">${r.popVariance}</span></div>
                <div class="stats-metric-card"><span class="stats-metric-label">Sample Variance</span><span class="stats-metric-val">${r.sampleVariance}</span></div>
                <div class="stats-metric-card"><span class="stats-metric-label">Pop Std Dev</span><span class="stats-metric-val">${r.popStdDev}</span></div>
                <div class="stats-metric-card"><span class="stats-metric-label">Sample Std Dev</span><span class="stats-metric-val">${r.sampleStdDev}</span></div>
                <div class="stats-metric-card"><span class="stats-metric-label">CV (Pop)</span><span class="stats-metric-val">${r.popCv}%</span></div>
              </div>
            </div>
          `;
        }
      });
    }
  }

  // CENTRAL TENDENCY LOGIC
  _initCentralTendencyLogic() {
    const btn = document.getElementById('btn-run-ct');
    if (btn) {
      this._on(btn, 'click', () => {
        const val = document.getElementById('ct-input').value;
        const res = StatisticsMathEngine.analyze(val);
        const out = document.getElementById('ct-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Measures of Central Tendency</h3>
              <p><strong>1. Arithmetic Mean (x̄):</strong> ${r.mean} (∑x / N = ${r.sum} / ${r.n})</p>
              <p><strong>2. Median (M):</strong> ${r.median} (Ordered middle rank value)</p>
              <p><strong>3. Mode:</strong> ${r.modes.join(', ') || 'No unique mode'} (Highest frequency value)</p>
              <p><strong>4. Midrange:</strong> ${r.midrange} ((Min + Max) / 2 = (${r.min} + ${r.max}) / 2)</p>
            </div>
          `;
        }
      });
    }
  }

  // DISPERSION LOGIC
  _initDispersionLogic() {
    const btn = document.getElementById('btn-run-disp');
    if (btn) {
      this._on(btn, 'click', () => {
        const val = document.getElementById('disp-input').value;
        const res = StatisticsMathEngine.analyze(val);
        const out = document.getElementById('disp-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Measures of Dispersion</h3>
              <p><strong>Range:</strong> ${r.range} (Max ${r.max} - Min ${r.min})</p>
              <p><strong>Mean Deviation about Mean MD(x̄):</strong> ${r.mdMean}</p>
              <p><strong>Mean Deviation about Median MD(M):</strong> ${r.mdMedian}</p>
              <p><strong>Population Variance (σ²):</strong> ${r.popVariance} | <strong>Pop Std Dev (σ):</strong> ${r.popStdDev}</p>
              <p><strong>Sample Variance (s²):</strong> ${r.sampleVariance} | <strong>Sample Std Dev (s):</strong> ${r.sampleStdDev}</p>
              <p><strong>Coefficient of Variation (CV):</strong> ${r.popCv}%</p>
            </div>
          `;
        }
      });
    }
  }

  // FREQUENCY DIST LOGIC
  _initFrequencyDistLogic() {
    const btn = document.getElementById('btn-run-freqgen');
    if (btn) {
      this._on(btn, 'click', () => {
        const val = document.getElementById('freqgen-input').value;
        const k = document.getElementById('freqgen-classes').value;
        const w = document.getElementById('freqgen-width').value;
        const s = document.getElementById('freqgen-start').value;

        const res = StatisticsMathEngine.generateFrequencyDistribution(val, {
          numClasses: k ? parseInt(k, 10) : undefined,
          classWidth: w ? parseFloat(w) : undefined,
          startBound: s ? parseFloat(s) : undefined
        });

        const out = document.getElementById('freqgen-output');
        if (out && res.success) {
          const r = res.result;
          const rows = r.bins.map(b => `
            <tr>
              <td>${b.interval}</td>
              <td>${b.midpoint}</td>
              <td>${b.frequency}</td>
              <td>${b.cumFreq}</td>
              <td>${b.relFreq}</td>
              <td>${b.pctFreq}</td>
            </tr>
          `).join('');

          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Generated Frequency Distribution (N = ${r.n}, Classes = ${r.numClasses}, Width = ${r.classWidth})</h3>
              <table class="stats-glass-table" style="margin-top: 12px;">
                <thead>
                  <tr><th>Class Interval</th><th>Midpoint</th><th>Frequency</th><th>Cum Freq</th><th>Rel Freq</th><th>% Freq</th></tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `;
        }
      });
    }
  }

  // GROUPED DATA LOGIC
  _initGroupedDataLogic() {
    const btn = document.getElementById('btn-run-grouped');
    if (btn) {
      this._on(btn, 'click', () => {
        const val = document.getElementById('grouped-input').value;
        const res = StatisticsMathEngine.analyzeGroupedData(val);
        const out = document.getElementById('grouped-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Grouped Data Analysis (Total Frequency N = ${r.totalFreq})</h3>
              <p><strong>Grouped Mean (x̄):</strong> ${r.mean} (∑(f·m)/N = ${r.sumFM}/${r.totalFreq})</p>
              <p><strong>Grouped Median (M):</strong> ${r.median} (Median class: ${r.medianClass})</p>
              <p><strong>Grouped Mode:</strong> ${r.mode} (Modal class: ${r.modalClass})</p>
              <p><strong>Grouped Pop Variance:</strong> ${r.popVariance} | <strong>Grouped Pop Std Dev:</strong> ${r.popStdDev}</p>
              <p><strong>Quartiles:</strong> Q₁ = ${r.q1}, Q₂ = ${r.median}, Q₃ = ${r.q3}, IQR = ${r.iqr}</p>
            </div>
          `;
        }
      });
    }
  }

  // QUANTILES LOGIC
  _initQuantilesLogic() {
    const btn = document.getElementById('btn-run-quant');
    if (btn) {
      this._on(btn, 'click', () => {
        const val = document.getElementById('quant-input').value;
        const pk = document.getElementById('quant-pk').value;
        const data = StatisticsMathEngine.parseRawData(val);
        const q = StatisticsMathEngine.calculateQuantiles(data, pk ? parseInt(pk, 10) : 90);
        const out = document.getElementById('quant-output');
        if (out) {
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Quantiles & Percentiles Breakdown</h3>
              <p><strong>Quartiles:</strong> Q₁ = ${q.q1} | Q₂ (Median) = ${q.q2} | Q₃ = ${q.q3}</p>
              <p><strong>Interquartile Range (IQR):</strong> ${q.iqr} | <strong>Quartile Deviation:</strong> ${q.quartileDev}</p>
              <p><strong>Deciles:</strong> D₁=${q.deciles.D1}, D₂=${q.deciles.D2}, D₅=${q.deciles.D5}, D₉=${q.deciles.D9}</p>
              <p><strong>Requested Percentile (P${q.customPercentile.k}):</strong> ${q.customPercentile.value}</p>
              <p><strong>Outlier Fences:</strong> Lower = ${q.lowerFence} | Upper = ${q.upperFence} | Outliers: [${q.outliers.join(', ') || 'None'}]</p>
            </div>
          `;
        }
      });
    }
  }

  // CORRELATION LOGIC
  _initCorrelationLogic() {
    const btn = document.getElementById('btn-run-corr');
    if (btn) {
      this._on(btn, 'click', () => {
        const x = document.getElementById('corr-x').value;
        const y = document.getElementById('corr-y').value;
        const res = StatisticsMathEngine.correlationAndRegression(x, y);
        const out = document.getElementById('corr-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Pearson Correlation Analysis (n = ${r.n})</h3>
              <p><strong>Pearson Correlation Coefficient (r):</strong> ${r.r}</p>
              <p><strong>Covariance:</strong> ${r.covariance} (Sample: ${r.sampleCovariance})</p>
              <p><strong>Interpretation:</strong> ${r.interpretation}</p>
              <p style="color: var(--accent-gold); font-style: italic;"><strong>Crucial Note:</strong> ${r.disclaimer}</p>
            </div>
          `;
        }
      });
    }
  }

  // REGRESSION LOGIC
  _initRegressionLogic() {
    const btn = document.getElementById('btn-run-reg');
    if (btn) {
      this._on(btn, 'click', () => {
        const x = document.getElementById('reg-x').value;
        const y = document.getElementById('reg-y').value;
        const px = document.getElementById('reg-predict-x').value;
        const res = StatisticsMathEngine.correlationAndRegression(x, y, px);
        const out = document.getElementById('reg-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Linear Regression Fit: ŷ = a + bx</h3>
              <p><strong>Regression Equation:</strong> <span class="font-mono highlight-gold">${r.regressionEquation}</span></p>
              <p><strong>Slope (b):</strong> ${r.slope} | <strong>Intercept (a):</strong> ${r.intercept}</p>
              <p><strong>Coefficient of Determination (R²):</strong> ${r.rSquared} (${(r.rSquared * 100).toFixed(1)}% variance explained)</p>
              ${r.prediction ? `<p><strong>Prediction at x = ${r.prediction.x}:</strong> Estimated ŷ = <strong>${r.prediction.predictedY}</strong> (Estimate)</p>` : ''}
            </div>
          `;
        }
      });
    }
  }

  // VISUALIZATION LOGIC
  _initVisualizationLogic() {
    const canvas = document.getElementById('vis-tool-canvas');
    if (!canvas) return;

    this.chartVisualizer = new StatisticalChartVisualizer(canvas);
    this.chartVisualizer.resize();

    let currentType = 'histogram';
    const toggles = document.querySelectorAll('.vis-chart-toggle');
    toggles.forEach(t => {
      this._on(t, 'click', () => {
        toggles.forEach(b => b.classList.remove('active'));
        t.classList.add('active');
        currentType = t.getAttribute('data-type');
        renderVis();
      });
    });

    const renderVis = () => {
      const dataStr = document.getElementById('vis-input').value;
      const parsed = StatisticsMathEngine.parseRawData(dataStr);
      if (parsed.length === 0) return;

      const sorted = [...parsed].sort((a, b) => a - b);
      const freq = StatisticsMathEngine.generateFrequencyDistribution(sorted);
      const q = StatisticsMathEngine.calculateQuantiles(sorted);

      if (currentType === 'histogram' || currentType === 'polygon' || currentType === 'curve' || currentType === 'pie') {
        this.chartVisualizer.setData(currentType, { bins: freq.result.bins });
      } else if (currentType === 'bar') {
        this.chartVisualizer.setData('bar', { items: sorted.map((v, i) => ({ label: `#${i + 1}`, value: v })) });
      } else if (currentType === 'boxplot') {
        this.chartVisualizer.setData('boxplot', { sorted, quantiles: q });
      }
    };

    const renderBtn = document.getElementById('btn-render-vis');
    if (renderBtn) this._on(renderBtn, 'click', renderVis);

    renderVis();
  }

  // CALCULATOR LOGIC
  _initCalculatorLogic() {
    const btn = document.getElementById('btn-run-calc-op');
    if (btn) {
      this._on(btn, 'click', () => {
        const val = document.getElementById('calc-input').value;
        const op = document.getElementById('calc-op-select').value;
        const res = StatisticsMathEngine.analyze(val);
        const out = document.getElementById('calc-output');
        if (out && res.success) {
          const r = res.result;
          let metricVal = '';
          if (op === 'mean') metricVal = `Mean: ${r.mean}`;
          else if (op === 'median') metricVal = `Median: ${r.median}`;
          else if (op === 'mode') metricVal = `Mode: ${r.modes.join(', ') || 'None'}`;
          else if (op === 'variance') metricVal = `Pop Variance: ${r.popVariance}, Std Dev: ${r.popStdDev}`;
          else if (op === 'range') metricVal = `Range: ${r.range}, Midrange: ${r.midrange}`;
          else if (op === 'quantiles') metricVal = `Q1: ${r.quantiles.q1}, Q2: ${r.quantiles.q2}, Q3: ${r.quantiles.q3}, IQR: ${r.quantiles.iqr}`;

          out.innerHTML = `
            <div class="stats-result-box glass-card">
              <h3>Result: ${metricVal}</h3>
              <p><strong>Observations N:</strong> ${r.n} | <strong>Sum:</strong> ${r.sum}</p>
            </div>
          `;
        }
      });
    }
  }

  // PRACTICE LOGIC
  _initPracticeLogic() {
    const optBtns = document.querySelectorAll('.stats-practice-opt-btn');
    optBtns.forEach(btn => {
      this._on(btn, 'click', (e) => {
        const qid = parseInt(btn.dataset.qid, 10);
        const opt = parseInt(btn.dataset.opt, 10);
        const q = this.practiceQuestions.find(x => x.id === qid);
        if (!q) return;

        const card = document.getElementById(`practice-card-${qid}`);
        const feedback = document.getElementById(`feedback-${qid}`);
        if (!card || !feedback) return;

        // Disable all buttons in this question
        card.querySelectorAll('.stats-practice-opt-btn').forEach(b => {
          b.disabled = true;
          if (parseInt(b.dataset.opt, 10) === q.correct) {
            b.classList.add('correct');
          }
        });

        const isCorrect = opt === q.correct;
        if (isCorrect) {
          btn.classList.add('correct');
          feedback.innerHTML = `<span style="color: #15803d; font-weight: bold;">✓ Correct!</span> ${q.explanation}`;
          this.practiceScore.correct++;
        } else {
          btn.classList.add('incorrect');
          feedback.innerHTML = `<span style="color: #b91c1c; font-weight: bold;">✗ Incorrect.</span> ${q.explanation}`;
        }

        feedback.style.display = 'block';
        this.practiceScore.answered++;

        const banner = document.getElementById('practice-score-banner');
        if (banner) {
          banner.textContent = `Score: ${this.practiceScore.correct} / ${this.practiceScore.answered} correct (${this.practiceQuestions.length} total questions)`;
        }
      });
    });
  }
}
