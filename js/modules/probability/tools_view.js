/**
 * OG - Probability Specialized Tools & Labs View
 * Handles dedicated routing for 12 tools at #/probability-tools/:tool
 *
 * Tools:
 * 13. Probability Calculator (Unified evaluator)
 * 14. Sample Space & Events (Coin, Die, Two Dice, Cards, Custom)
 * 15. Classical Probability (Exact fractions, decimals, percentages)
 * 16. Addition & Multiplication Rules (General vs Disjoint, Independent vs Dependent)
 * 17. Conditional Probability (P(A|B) = P(A ∩ B) / P(B), division-by-zero checks)
 * 18. Bayes' Theorem Solver (Priors, Likelihoods, Evidence, Posteriors)
 * 19. Independent & Dependent Events (With vs Without replacement urn experiment)
 * 20. Permutations & Combinations (Counting-based probabilities using Algebra engine)
 * 21. Random Experiments Lab (Empirical simulation: 10 to 100,000 trials, convergence)
 * 22. Probability Distributions (Bernoulli & Binomial PMF table and chart)
 * 23. Expected Value & Variance (E(X), Var(X), σ, discrete random variables)
 * 24. Probability Practice Lab (Interactive drills with instant grading & explanations)
 *
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from '../../utils.js';
import { ProbabilityMathEngine } from '../../math/probability.js';
import { ProbabilityTreeVisualizer } from './tree.js';

export class ProbabilityToolsView {
  constructor(container, initialTool = 'calculator') {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.activeTool = initialTool || 'calculator';
    this.treeVisualizer = null;
    this._listeners = [];

    // Practice Lab questions
    this.practiceScore = { answered: 0, correct: 0 };
    this.practiceQuestions = [
      {
        id: 1,
        question: 'What is the probability of rolling a sum of 7 when rolling two fair six-sided dice?',
        options: ['1/12', '1/6', '7/36', '5/36'],
        correct: 1,
        explanation: 'There are 6 favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) out of 36 total outcomes. P = 6/36 = 1/6.'
      },
      {
        id: 2,
        question: 'If events A and B are independent with P(A) = 0.4 and P(B) = 0.5, what is P(A ∩ B)?',
        options: ['0.9', '0.2', '0.1', '0.0'],
        correct: 1,
        explanation: 'By the multiplication rule for independent events: P(A ∩ B) = P(A) · P(B) = 0.4 × 0.5 = 0.20.'
      },
      {
        id: 3,
        question: 'Given P(A ∩ B) = 0.15 and P(B) = 0.50, find the conditional probability P(A|B).',
        options: ['0.075', '0.30', '0.65', '0.35'],
        correct: 1,
        explanation: 'P(A|B) = P(A ∩ B) / P(B) = 0.15 / 0.50 = 0.30 (30%).'
      },
      {
        id: 4,
        question: 'In a Binomial experiment with n = 10 trials and success probability p = 0.3, what is the expected value (mean)?',
        options: ['2.1', '3.0', '7.0', '0.9'],
        correct: 1,
        explanation: 'For a Binomial distribution, Mean μ = n · p = 10 × 0.3 = 3.0.'
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
      <div class="prob-tools-workspace view-animate-in">

        <!-- Top Navigation Bar -->
        <div class="prob-tools-topbar">
          <div class="prob-tools-breadcrumb">
            <a href="#/probability" class="prob-back-btn">← Probability Workspace</a>
            <span class="prob-sep">/</span>
            <span class="prob-current-tool-title">${this._getToolTitle(this.activeTool)}</span>
          </div>

          <!-- Tool Selector Pills -->
          <div class="prob-tools-pills-bar">
            ${this._renderToolPills()}
          </div>
        </div>

        <!-- Dynamic Tool Content -->
        <div class="prob-tool-content-card glass-panel" id="prob-tool-mount">
          ${this._renderToolBody(this.activeTool)}
        </div>

      </div>
    `;
  }

  _getToolTitle(id) {
    const titles = {
      'calculator': '13. Unified Probability Calculator',
      'sample-space': '14. Sample Space & Event Builder',
      'classical': '15. Classical Probability (Exact Fractions)',
      'rules': '16. Addition & Multiplication Rules',
      'conditional': '17. Conditional Probability Lab',
      'bayes': "18. Bayes' Theorem Solver",
      'independence': '19. Independent & Dependent Events',
      'combinatorics': '20. Permutations & Combinations Probability',
      'simulation': '21. Random Experiment Simulation Lab',
      'distributions': '22. Probability Distributions (Binomial)',
      'expected-value': '23. Expected Value & Variance Lab',
      'practice-lab': '24. Probability Practice Lab'
    };
    return titles[id] || 'Probability Tool';
  }

  _renderToolPills() {
    const tools = [
      { id: 'calculator', label: 'Calculator' },
      { id: 'sample-space', label: 'Sample Space' },
      { id: 'classical', label: 'Classical' },
      { id: 'rules', label: 'Rules' },
      { id: 'conditional', label: 'Conditional' },
      { id: 'bayes', label: 'Bayes' },
      { id: 'independence', label: 'Independence' },
      { id: 'combinatorics', label: 'Perm/Comb' },
      { id: 'simulation', label: 'Simulation' },
      { id: 'distributions', label: 'Distributions' },
      { id: 'expected-value', label: 'Expected Value' },
      { id: 'practice-lab', label: 'Practice Lab' }
    ];

    return tools.map(t => `
      <a href="#/probability-tools/${t.id}" class="prob-pill-btn ${this.activeTool === t.id ? 'active' : ''}">
        ${t.label}
      </a>
    `).join('');
  }

  _renderToolBody(toolId) {
    switch (toolId) {
      case 'calculator':
        return this._templateCalculator();
      case 'sample-space':
        return this._templateSampleSpace();
      case 'classical':
        return this._templateClassical();
      case 'rules':
        return this._templateRules();
      case 'conditional':
        return this._templateConditional();
      case 'bayes':
        return this._templateBayes();
      case 'independence':
        return this._templateIndependence();
      case 'combinatorics':
        return this._templateCombinatorics();
      case 'simulation':
        return this._templateSimulation();
      case 'distributions':
        return this._templateDistributions();
      case 'expected-value':
        return this._templateExpectedValue();
      case 'practice-lab':
        return this._templatePracticeLab();
      default:
        return this._templateCalculator();
    }
  }

  // --------------------------------------------------------------------------
  // 13. CALCULATOR
  // --------------------------------------------------------------------------
  _templateCalculator() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>13. Unified Probability Calculator</h2>
          <p>Instant evaluation for classical, two-event union, joint, and conditional problems.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            <div>
              <label>P(A):</label>
              <input type="number" id="calc-pa" class="prob-input-field" value="0.6" step="0.05" min="0" max="1">
            </div>
            <div>
              <label>P(B):</label>
              <input type="number" id="calc-pb" class="prob-input-field" value="0.5" step="0.05" min="0" max="1">
            </div>
            <div>
              <label>P(A ∩ B) (blank for independent):</label>
              <input type="number" id="calc-inter" class="prob-input-field" value="0.3" step="0.05" min="0" max="1">
            </div>
          </div>
          <div style="margin-top: 14px;">
            <button class="prob-btn prob-btn-primary" id="btn-run-calc">Execute Calculation</button>
          </div>
        </div>

        <div id="calc-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 14. SAMPLE SPACE & EVENTS
  // --------------------------------------------------------------------------
  _templateSampleSpace() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>14. Sample Space & Event Builder</h2>
          <p>Examine sample spaces for Coin, Single Die, Two Dice, Deck of Cards, and filter favorable outcomes.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label>Sample Space Type:</label>
              <select id="space-type-select" class="prob-select-field">
                <option value="two-dice">Two Fair Dice (n = 36)</option>
                <option value="dice">Single Die (n = 6)</option>
                <option value="coin">Coin Toss (n = 2)</option>
                <option value="two-coins">Two Coins (n = 4)</option>
                <option value="cards">Standard 52-Card Deck (n = 52)</option>
              </select>
            </div>
            <div>
              <label>Event Condition (e.g. "sum 7", "even", "face", "hearts"):</label>
              <input type="text" id="space-condition-input" class="prob-input-field" value="sum 7" style="width: 220px;">
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-run-space">Filter Event Outcomes</button>
          </div>
        </div>

        <div id="space-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 15. CLASSICAL PROBABILITY
  // --------------------------------------------------------------------------
  _templateClassical() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>15. Classical Probability (P = n(A) / n(S))</h2>
          <p>Compute exact simplified fractions, floating decimals, and percentage values with selectable precision.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label>Favorable Outcomes n(A):</label>
              <input type="number" id="class-fav" class="prob-input-field" value="6" min="0" style="width: 140px;">
            </div>
            <div>
              <label>Total Sample Size n(S):</label>
              <input type="number" id="class-total" class="prob-input-field" value="36" min="1" style="width: 140px;">
            </div>
            <div>
              <label>Decimal Precision:</label>
              <select id="class-prec" class="prob-select-field">
                <option value="2">2 decimals</option>
                <option value="4" selected>4 decimals</option>
                <option value="6">6 decimals</option>
              </select>
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-run-class">Compute Probability</button>
          </div>
        </div>

        <div id="class-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 16. ADDITION & MULTIPLICATION RULES
  // --------------------------------------------------------------------------
  _templateRules() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>16. Addition & Multiplication Rules</h2>
          <p>Compare General Addition Rule P(A∪B) = P(A)+P(B)-P(A∩B) vs Disjoint, and Independent vs Dependent multiplication.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            <div>
              <label>P(A):</label>
              <input type="number" id="rules-pa" class="prob-input-field" value="0.4" step="0.05" min="0" max="1">
            </div>
            <div>
              <label>P(B):</label>
              <input type="number" id="rules-pb" class="prob-input-field" value="0.5" step="0.05" min="0" max="1">
            </div>
            <div>
              <label>P(A ∩ B):</label>
              <input type="number" id="rules-inter" class="prob-input-field" value="0.2" step="0.05" min="0" max="1">
            </div>
          </div>
          <div style="margin-top: 14px;">
            <button class="prob-btn prob-btn-primary" id="btn-run-rules">Analyze Rules & Assumptions</button>
          </div>
        </div>

        <div id="rules-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 17. CONDITIONAL PROBABILITY
  // --------------------------------------------------------------------------
  _templateConditional() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>17. Conditional Probability: P(A|B) = P(A ∩ B) / P(B)</h2>
          <p>Calculates updated likelihood given conditioning event B with mathematical error protection if P(B) = 0.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label>Joint P(A ∩ B):</label>
              <input type="number" id="cond-inter" class="prob-input-field" value="0.2" step="0.05" min="0" max="1" style="width: 140px;">
            </div>
            <div>
              <label>Conditioning P(B):</label>
              <input type="number" id="cond-pb" class="prob-input-field" value="0.5" step="0.05" min="0" max="1" style="width: 140px;">
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-run-cond">Evaluate Conditional P(A|B)</button>
          </div>
        </div>

        <div id="cond-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 18. BAYES THEOREM
  // --------------------------------------------------------------------------
  _templateBayes() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>18. Bayes' Theorem Solver</h2>
          <p>Invert conditional probabilities using Prior, Likelihood, Evidence P(A), and Posterior with multi-hypothesis partitions.</p>
        </div>

        <div class="prob-input-box">
          <label>Hypotheses Partition (Format: "Hypothesis Name, Prior, Likelihood"):</label>
          <textarea id="bayes-input" class="stats-textarea" rows="4">H1 (Disease), 0.01, 0.95
H2 (Healthy), 0.99, 0.05</textarea>
          <div style="margin-top: 10px;">
            <button class="prob-btn prob-btn-primary" id="btn-run-bayes">Compute Bayesian Posteriors</button>
          </div>
        </div>

        <div id="bayes-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 19. INDEPENDENCE & DEPENDENT EVENTS
  // --------------------------------------------------------------------------
  _templateIndependence() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>19. Independent & Dependent Sampling Lab</h2>
          <p>Examine urn drawing experiments with vs without replacement to observe updated conditional probabilities.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label>Red Objects in Urn:</label>
              <input type="number" id="urn-red" class="prob-input-field" value="5" min="0" style="width: 110px;">
            </div>
            <div>
              <label>Blue Objects in Urn:</label>
              <input type="number" id="urn-blue" class="prob-input-field" value="3" min="0" style="width: 110px;">
            </div>
            <div>
              <label>Sampling Mode:</label>
              <select id="urn-mode" class="prob-select-field">
                <option value="without">Without Replacement (Dependent)</option>
                <option value="with">With Replacement (Independent)</option>
              </select>
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-run-urn">Simulate 2 Draws</button>
          </div>
        </div>

        <div id="urn-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 20. COMBINATORICS PROBABILITY
  // --------------------------------------------------------------------------
  _templateCombinatorics() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>20. Permutations & Combinations Counting-Based Probability</h2>
          <p>Compute probabilities using nCr selection techniques integrated directly from the OG Algebra engine.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label>Favorable nCr (n, r):</label>
              <div style="display: flex; gap: 6px;">
                <input type="number" id="comb-fav-n" class="prob-input-field" value="4" style="width: 65px;">
                <input type="number" id="comb-fav-r" class="prob-input-field" value="2" style="width: 65px;">
              </div>
            </div>
            <div>
              <label>Total nCr (N, R):</label>
              <div style="display: flex; gap: 6px;">
                <input type="number" id="comb-tot-n" class="prob-input-field" value="10" style="width: 65px;">
                <input type="number" id="comb-tot-r" class="prob-input-field" value="2" style="width: 65px;">
              </div>
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-run-comb">Compute Selection Probability</button>
          </div>
        </div>

        <div id="comb-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 21. RANDOM EXPERIMENT SIMULATION LAB
  // --------------------------------------------------------------------------
  _templateSimulation() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>21. Random Experiment Simulation Lab</h2>
          <p>Simulate 10 to 100,000 empirical trials and compare experimental frequency vs exact theoretical probability.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label>Experiment Type:</label>
              <select id="sim-type" class="prob-select-field">
                <option value="coin">Fair Coin Toss</option>
                <option value="die">Six-Sided Die Roll</option>
                <option value="two-dice">Sum of Two Dice</option>
                <option value="cards">Card Draw (Suits)</option>
              </select>
            </div>
            <div>
              <label>Number of Trials:</label>
              <select id="sim-trials" class="prob-select-field">
                <option value="10">10 trials</option>
                <option value="100">100 trials</option>
                <option value="1000" selected>1,000 trials</option>
                <option value="10000">10,000 trials</option>
                <option value="100000">100,000 trials</option>
              </select>
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-run-sim">Run Simulation</button>
          </div>
        </div>

        <div id="sim-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 22. PROBABILITY DISTRIBUTIONS
  // --------------------------------------------------------------------------
  _templateDistributions() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>22. Binomial & Bernoulli Distributions</h2>
          <p>Compute Binomial PMF P(X = x) = ⁿCₓ · pˣ · (1-p)ⁿ⁻ˣ, Expected Value np, Variance np(1-p), and PMF bar plot.</p>
        </div>

        <div class="prob-input-box">
          <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end;">
            <div>
              <label>Number of Trials n:</label>
              <input type="number" id="binom-n" class="prob-input-field" value="10" min="1" max="100" style="width: 100px;">
            </div>
            <div>
              <label>Success Probability p:</label>
              <input type="number" id="binom-p" class="prob-input-field" value="0.3" step="0.05" min="0" max="1" style="width: 100px;">
            </div>
            <div>
              <label>Specific Successes x:</label>
              <input type="number" id="binom-x" class="prob-input-field" value="4" min="0" style="width: 100px;">
            </div>
            <button class="prob-btn prob-btn-primary" id="btn-run-binom">Compute Distribution</button>
          </div>
        </div>

        <div class="prob-canvas-wrapper glass-panel" style="margin-top: 20px; padding: 14px; height: 320px;">
          <canvas id="binom-canvas" style="width: 100%; height: 100%;"></canvas>
        </div>

        <div id="binom-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 23. EXPECTED VALUE & VARIANCE
  // --------------------------------------------------------------------------
  _templateExpectedValue() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>23. Expected Value & Variance Lab</h2>
          <p>Enter discrete outcome-probability pairs (x, P(X=x)) to compute E(X), Var(X), and σ with validation that ∑pᵢ = 1.</p>
        </div>

        <div class="prob-input-box">
          <label>Pairs (Format: "x, P(X=x)"):</label>
          <textarea id="ev-input" class="stats-textarea" rows="4">1, 0.2
2, 0.5
3, 0.3</textarea>
          <div style="margin-top: 10px;">
            <button class="prob-btn prob-btn-primary" id="btn-run-ev">Compute E(X) & Variance</button>
          </div>
        </div>

        <div id="ev-output" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 24. PRACTICE LAB
  // --------------------------------------------------------------------------
  _templatePracticeLab() {
    return `
      <div class="prob-tool-section">
        <div class="prob-tool-head">
          <h2>24. Probability Practice Lab</h2>
          <p>Drill your understanding of events, conditional probability, Bayes' theorem, and distributions with instant feedback.</p>
        </div>

        <div class="stats-practice-score-bar" id="prob-practice-score-banner">
          Score: 0 / ${this.practiceQuestions.length} answered
        </div>

        <div class="stats-practice-questions-list">
          ${this.practiceQuestions.map((q, qIdx) => `
            <div class="stats-practice-card glass-panel" id="prob-practice-card-${q.id}">
              <div class="stats-practice-num">Question ${qIdx + 1}</div>
              <div class="stats-practice-q">${q.question}</div>
              <div class="stats-practice-options">
                ${q.options.map((opt, optIdx) => `
                  <button class="stats-practice-opt-btn prob-opt-btn" data-qid="${q.id}" data-opt="${optIdx}">
                    ${String.fromCharCode(65 + optIdx)}. ${opt}
                  </button>
                `).join('')}
              </div>
              <div class="stats-practice-feedback" id="prob-feedback-${q.id}" style="display: none;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // LOGIC & CONTROLLER INITIALIZATION
  // --------------------------------------------------------------------------
  _attachListeners() {}

  _initToolLogic() {
    switch (this.activeTool) {
      case 'calculator':
        this._initCalcLogic();
        break;
      case 'sample-space':
        this._initSampleSpaceLogic();
        break;
      case 'classical':
        this._initClassicalLogic();
        break;
      case 'rules':
        this._initRulesLogic();
        break;
      case 'conditional':
        this._initConditionalLogic();
        break;
      case 'bayes':
        this._initBayesLogic();
        break;
      case 'independence':
        this._initIndependenceLogic();
        break;
      case 'combinatorics':
        this._initCombinatoricsLogic();
        break;
      case 'simulation':
        this._initSimulationLogic();
        break;
      case 'distributions':
        this._initDistributionsLogic();
        break;
      case 'expected-value':
        this._initExpectedValueLogic();
        break;
      case 'practice-lab':
        this._initPracticeLogic();
        break;
      default:
        this._initCalcLogic();
    }
  }

  // CALCULATOR LOGIC
  _initCalcLogic() {
    const btn = document.getElementById('btn-run-calc');
    if (btn) {
      this._on(btn, 'click', () => {
        const pa = parseFloat(document.getElementById('calc-pa').value);
        const pb = parseFloat(document.getElementById('calc-pb').value);
        const pInterStr = document.getElementById('calc-inter').value;
        const pInter = pInterStr.trim() !== '' ? parseFloat(pInterStr) : null;

        const res = ProbabilityMathEngine.twoEvents(pa, pb, pInter);
        const out = document.getElementById('calc-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="prob-result-box glass-card">
              <h3>Probability Calculator Results:</h3>
              <p><strong>P(A ∪ B) Union:</strong> ${r.pUnion.decimal} (${r.pUnion.percentage})</p>
              <p><strong>P(A|B) Conditional:</strong> ${r.pAgivenB ? r.pAgivenB.decimal : 'Undefined'} | <strong>P(B|A):</strong> ${r.pBgivenA ? r.pBgivenA.decimal : 'Undefined'}</p>
              <p><strong>Complements:</strong> P(A') = ${r.pNotA.decimal} | P(B') = ${r.pNotB.decimal}</p>
              <p><strong>Independence:</strong> ${r.isIndependent ? 'Events are INDEPENDENT' : 'Events are DEPENDENT'}</p>
            </div>
          `;
        }
      });
    }
  }

  // SAMPLE SPACE LOGIC
  _initSampleSpaceLogic() {
    const btn = document.getElementById('btn-run-space');
    if (btn) {
      this._on(btn, 'click', () => {
        const type = document.getElementById('space-type-select').value;
        const cond = document.getElementById('space-condition-input').value;
        const res = ProbabilityMathEngine.filterSampleSpaceEvent(type, cond);
        const out = document.getElementById('space-output');
        if (out) {
          out.innerHTML = `
            <div class="prob-result-box glass-card">
              <h3>Sample Space: ${res.space.type} (n(S) = ${res.totalCount})</h3>
              <p><strong>Filtered Condition:</strong> "${res.condition}"</p>
              <p><strong>Favorable Outcomes (${res.favorableCount}):</strong> [${res.favorableOutcomes.slice(0, 15).join(', ')}${res.favorableOutcomes.length > 15 ? '...' : ''}]</p>
              <p><strong>Probability P:</strong> <span class="font-mono highlight-gold">${res.probability.exact}</span> = ${res.probability.decimal} (${res.probability.percentage})</p>
            </div>
          `;
        }
      });
    }
  }

  // CLASSICAL LOGIC
  _initClassicalLogic() {
    const btn = document.getElementById('btn-run-class');
    if (btn) {
      this._on(btn, 'click', () => {
        const fav = document.getElementById('class-fav').value;
        const tot = document.getElementById('class-total').value;
        const prec = parseInt(document.getElementById('class-prec').value, 10);
        const res = ProbabilityMathEngine.classicalProbability(fav, tot, prec);
        const out = document.getElementById('class-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="prob-result-box glass-card">
              <h3>Classical Probability: P(A) = n(A) / n(S)</h3>
              <p><strong>Favorable n(A):</strong> ${r.favorable} | <strong>Total n(S):</strong> ${r.total}</p>
              <p><strong>Exact Simplified Fraction:</strong> <span class="font-mono highlight-gold">${r.exact}</span></p>
              <p><strong>Floating Decimal:</strong> ${r.decimal}</p>
              <p><strong>Percentage:</strong> ${r.percentage}</p>
            </div>
          `;
        }
      });
    }
  }

  // RULES LOGIC
  _initRulesLogic() {
    const btn = document.getElementById('btn-run-rules');
    if (btn) {
      this._on(btn, 'click', () => {
        const pa = parseFloat(document.getElementById('rules-pa').value);
        const pb = parseFloat(document.getElementById('rules-pb').value);
        const inter = parseFloat(document.getElementById('rules-inter').value);
        const res = ProbabilityMathEngine.twoEvents(pa, pb, inter);
        const out = document.getElementById('rules-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="prob-result-box glass-card">
              <h3>Addition & Multiplication Rules Breakdown:</h3>
              <p><strong>Addition Rule:</strong> P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = ${r.pA.decimal} + ${r.pB.decimal} - ${r.pInter.decimal} = <strong>${r.pUnion.decimal}</strong></p>
              <p><strong>Multiplication Verification:</strong> P(A)·P(B) = ${(r.pA.value * r.pB.value).toFixed(4)} vs P(A ∩ B) = ${r.pInter.decimal} ⟹ <strong>${r.isIndependent ? 'Independent' : 'Dependent'}</strong></p>
              <p><strong>Disjoint / Mutually Exclusive:</strong> ${r.isMutuallyExclusive ? 'YES (P(A ∩ B) = 0)' : 'NO (P(A ∩ B) > 0)'}</p>
            </div>
          `;
        }
      });
    }
  }

  // CONDITIONAL LOGIC
  _initConditionalLogic() {
    const btn = document.getElementById('btn-run-cond');
    if (btn) {
      this._on(btn, 'click', () => {
        const inter = document.getElementById('cond-inter').value;
        const pb = document.getElementById('cond-pb').value;
        const res = ProbabilityMathEngine.conditionalProbability(inter, pb);
        const out = document.getElementById('cond-output');
        if (out) {
          if (res.success) {
            const r = res.result;
            out.innerHTML = `
              <div class="prob-result-box glass-card">
                <h3>Conditional Probability: P(A|B) = P(A ∩ B) / P(B)</h3>
                <p><strong>Joint P(A ∩ B):</strong> ${r.pInter.decimal} | <strong>Conditioning P(B):</strong> ${r.pB.decimal}</p>
                <p><strong>Result P(A|B):</strong> <span class="font-mono highlight-gold">${r.pAgivenB.exact}</span> = ${r.pAgivenB.decimal} (${r.pAgivenB.percentage})</p>
              </div>
            `;
          } else {
            out.innerHTML = `
              <div class="prob-error-box">
                <p style="color: #b91c1c; margin: 0;"><strong>Mathematical Error:</strong> ${res.error}</p>
              </div>
            `;
          }
        }
      });
    }
  }

  // BAYES LOGIC
  _initBayesLogic() {
    const btn = document.getElementById('btn-run-bayes');
    if (btn) {
      this._on(btn, 'click', () => {
        const lines = document.getElementById('bayes-input').value.trim().split('\n');
        const partitions = lines.map(l => {
          const parts = l.split(/[,|\t]+/).map(s => s.trim());
          return {
            name: parts[0] || 'Hypothesis',
            prior: parseFloat(parts[1]),
            likelihood: parseFloat(parts[2])
          };
        });

        const res = ProbabilityMathEngine.bayesTheorem(partitions);
        const out = document.getElementById('bayes-output');
        if (out) {
          if (res.success) {
            const r = res.result;
            const rows = r.partitions.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.prior.decimal}</td>
                <td>${p.likelihood.decimal}</td>
                <td>${p.joint.decimal}</td>
                <td><strong class="highlight-gold">${p.posterior.decimal} (${p.posterior.percentage})</strong></td>
              </tr>
            `).join('');

            out.innerHTML = `
              <div class="prob-result-box glass-card">
                <h3>Bayesian Posterior Probabilities</h3>
                <p><strong>Total Evidence P(A):</strong> ${r.totalEvidence.decimal} (${r.totalEvidence.percentage})</p>
                <table class="stats-glass-table" style="margin-top: 10px;">
                  <thead>
                    <tr><th>Hypothesis</th><th>Prior P(Eᵢ)</th><th>Likelihood P(A|Eᵢ)</th><th>Joint P(A ∩ Eᵢ)</th><th>Posterior P(Eᵢ|A)</th></tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
            `;
          } else {
            out.innerHTML = `<div class="prob-error-box"><p style="color: #b91c1c; margin: 0;">${res.error}</p></div>`;
          }
        }
      });
    }
  }

  // INDEPENDENCE / URN LOGIC
  _initIndependenceLogic() {
    const btn = document.getElementById('btn-run-urn');
    if (btn) {
      this._on(btn, 'click', () => {
        const red = document.getElementById('urn-red').value;
        const blue = document.getElementById('urn-blue').value;
        const mode = document.getElementById('urn-mode').value === 'with';
        const res = ProbabilityMathEngine.drawingExperiment(red, blue, 2, mode);
        const out = document.getElementById('urn-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="prob-result-box glass-card">
              <h3>Urn Sampling Analysis</h3>
              <p>${r.explanation}</p>
              <p><strong>P(Drawing 2 Red Balls):</strong> <span class="font-mono highlight-gold">${r.probabilityTwoRed.exact}</span> = ${r.probabilityTwoRed.decimal} (${r.probabilityTwoRed.percentage})</p>
            </div>
          `;
        }
      });
    }
  }

  // COMBINATORICS LOGIC
  _initCombinatoricsLogic() {
    const btn = document.getElementById('btn-run-comb');
    if (btn) {
      this._on(btn, 'click', () => {
        const fn = document.getElementById('comb-fav-n').value;
        const fr = document.getElementById('comb-fav-r').value;
        const tn = document.getElementById('comb-tot-n').value;
        const tr = document.getElementById('comb-tot-r').value;

        const res = ProbabilityMathEngine.countingProbability(fn, fr, tn, tr);
        const out = document.getElementById('comb-output');
        if (out && res.success) {
          const r = res.result;
          out.innerHTML = `
            <div class="prob-result-box glass-card">
              <h3>Counting-Based Probability</h3>
              <p><strong>Favorable Combinations:</strong> ${r.favWays} | <strong>Total Combinations:</strong> ${r.totalWays}</p>
              <p><strong>Result:</strong> <span class="font-mono highlight-gold">${r.exact}</span> = ${r.decimal} (${r.percentage})</p>
            </div>
          `;
        }
      });
    }
  }

  // SIMULATION LOGIC
  _initSimulationLogic() {
    const btn = document.getElementById('btn-run-sim');
    if (btn) {
      this._on(btn, 'click', () => {
        const type = document.getElementById('sim-type').value;
        const trials = parseInt(document.getElementById('sim-trials').value, 10);
        const res = ProbabilityMathEngine.runSimulation(type, trials);
        const out = document.getElementById('sim-output');
        if (out) {
          const rows = res.comparison.map(c => `
            <tr>
              <td><strong>${c.outcome}</strong></td>
              <td>${c.count}</td>
              <td>${c.experimentalFreq}</td>
              <td>${c.theoreticalProb}</td>
              <td>${c.discrepancy}</td>
            </tr>
          `).join('');

          out.innerHTML = `
            <div class="prob-result-box glass-card">
              <h3>Simulation Results: ${res.trials.toLocaleString()} Trials</h3>
              <p style="color: var(--accent-gold);">${res.note}</p>
              <table class="stats-glass-table" style="margin-top: 10px;">
                <thead>
                  <tr><th>Outcome</th><th>Observed Count</th><th>Experimental Freq</th><th>Theoretical Prob</th><th>Difference</th></tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `;
        }
      });
    }
  }

  // DISTRIBUTIONS LOGIC
  _initDistributionsLogic() {
    const canvas = document.getElementById('binom-canvas');
    if (canvas) {
      this.treeVisualizer = new ProbabilityTreeVisualizer(canvas);
      this.treeVisualizer.resize();
    }

    const runBinom = () => {
      const n = document.getElementById('binom-n').value;
      const p = document.getElementById('binom-p').value;
      const x = document.getElementById('binom-x').value;

      const res = ProbabilityMathEngine.binomialDistribution(n, p, x);
      const out = document.getElementById('binom-output');
      if (out && res.success) {
        const r = res.result;

        if (this.treeVisualizer) {
          this.treeVisualizer.setData('binomial', r);
        }

        out.innerHTML = `
          <div class="prob-result-box glass-card">
            <h3>Binomial Distribution: X ~ Bin(${r.n}, ${r.p})</h3>
            <p><strong>Mean (Expected Value):</strong> μ = np = ${r.mean}</p>
            <p><strong>Variance:</strong> σ² = np(1-p) = ${r.variance} | <strong>Std Dev:</strong> σ = ${r.stdDev}</p>
            ${r.targetResult ? `<p><strong>P(X = ${r.targetResult.x}):</strong> <span class="font-mono highlight-gold">${r.targetResult.probability.exact}</span> = ${r.targetResult.probability.decimal} (${r.targetResult.probability.percentage})</p>` : ''}
          </div>
        `;
      }
    };

    const btn = document.getElementById('btn-run-binom');
    if (btn) this._on(btn, 'click', runBinom);

    runBinom();
  }

  // EXPECTED VALUE LOGIC
  _initExpectedValueLogic() {
    const btn = document.getElementById('btn-run-ev');
    if (btn) {
      this._on(btn, 'click', () => {
        const lines = document.getElementById('ev-input').value.trim().split('\n');
        const pairs = lines.map(l => {
          const parts = l.split(/[,|\t]+/).map(s => s.trim());
          return { x: parseFloat(parts[0]), p: parseFloat(parts[1]) };
        });

        const res = ProbabilityMathEngine.expectedValueAndVariance(pairs);
        const out = document.getElementById('ev-output');
        if (out) {
          if (res.success) {
            const r = res.result;
            out.innerHTML = `
              <div class="prob-result-box glass-card">
                <h3>Discrete Random Variable Analysis</h3>
                <p><strong>Expected Value E(X):</strong> <span class="font-mono highlight-gold">${r.expectedValue}</span></p>
                <p><strong>Second Moment E(X²):</strong> ${r.expectedX2}</p>
                <p><strong>Variance Var(X):</strong> ${r.variance} | <strong>Standard Deviation σ:</strong> ${r.stdDev}</p>
              </div>
            `;
          } else {
            out.innerHTML = `<div class="prob-error-box"><p style="color: #b91c1c; margin: 0;">${res.error}</p></div>`;
          }
        }
      });
    }
  }

  // PRACTICE LOGIC
  _initPracticeLogic() {
    const optBtns = document.querySelectorAll('.prob-opt-btn');
    optBtns.forEach(btn => {
      this._on(btn, 'click', (e) => {
        const qid = parseInt(btn.dataset.qid, 10);
        const opt = parseInt(btn.dataset.opt, 10);
        const q = this.practiceQuestions.find(x => x.id === qid);
        if (!q) return;

        const card = document.getElementById(`prob-practice-card-${qid}`);
        const feedback = document.getElementById(`prob-feedback-${qid}`);
        if (!card || !feedback) return;

        card.querySelectorAll('.prob-opt-btn').forEach(b => {
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

        const banner = document.getElementById('prob-practice-score-banner');
        if (banner) {
          banner.textContent = `Score: ${this.practiceScore.correct} / ${this.practiceScore.answered} correct (${this.practiceQuestions.length} total questions)`;
        }
      });
    });
  }
}
