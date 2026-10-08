/**
 * OG - Scientific Calculator UI & Controller
 * Connects the pure Calculation Engine with the Liquid Glass UI
 * ES6 Module
 */

import { mathEngine } from './engine.js';
import { store } from './state.js';
import { copyToClipboard, showToast } from './utils.js';

export class CalculatorController {
  constructor(containerSelector = '#full-calc-container') {
    this.container = document.querySelector(containerSelector);
    this.state = store.getState();

    // Local controller cache
    this.expression = this.state.calculator.expression || '';
    this.result = this.state.calculator.result || '0';
    this.mode = this.state.calculator.mode || 'scientific';
    this.angleMode = this.state.userPreferences.angleMode || 'DEG';
    this.precision = this.state.userPreferences.precision !== undefined ? this.state.userPreferences.precision : 6;
    this.hasEvaluated = false;

    // Synchronize engine
    mathEngine.setAngleMode(this.angleMode);
    mathEngine.setPrecision(this.precision);

    this.boundKeyboardHandler = this.handleKeyboardInput.bind(this);
  }

  init() {
    this.attachDomListeners();
    this.attachKeyboardListener();
    this.updateDisplay();
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyboardHandler);
  }

  setMode(mode) {
    this.mode = mode === 'basic' ? 'basic' : 'scientific';
    store.setCalculatorMode(this.mode);
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    modeTabs.forEach(tab => {
      if (tab.dataset.calcMode === this.mode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const sciKeypad = document.getElementById('calc-keypad-sci');
    const basicKeypad = document.getElementById('calc-keypad-basic');
    if (sciKeypad && basicKeypad) {
      if (this.mode === 'basic') {
        sciKeypad.style.display = 'none';
        basicKeypad.style.display = 'grid';
      } else {
        sciKeypad.style.display = 'grid';
        basicKeypad.style.display = 'none';
      }
    }
  }

  setAngleMode(mode) {
    this.angleMode = mode === 'RAD' ? 'RAD' : 'DEG';
    store.setAngleMode(this.angleMode);
    mathEngine.setAngleMode(this.angleMode);

    const badgeDeg = document.getElementById('calc-badge-deg');
    const badgeRad = document.getElementById('calc-badge-rad');
    if (badgeDeg && badgeRad) {
      if (this.angleMode === 'DEG') {
        badgeDeg.classList.add('active');
        badgeRad.classList.remove('active');
      } else {
        badgeRad.classList.add('active');
        badgeDeg.classList.remove('active');
      }
    }

    // If there is an active expression, re-evaluate to show result in new angle basis
    if (this.expression && this.hasEvaluated) {
      this.evaluate(false);
    }
  }

  setPrecision(precision) {
    this.precision = Number(precision);
    store.setPrecision(this.precision);
    mathEngine.setPrecision(this.precision);
    if (this.expression && this.hasEvaluated) {
      this.evaluate(false);
    }
  }

  append(token) {
    // If user just evaluated and enters an operator, continue with answer
    if (this.hasEvaluated) {
      if (['+', '-', '×', '÷', '*', '/', '^', '%'].includes(token)) {
        if (this.result !== 'Error') {
          this.expression = this.result + token;
        } else {
          this.expression = token;
        }
      } else {
        this.expression = token;
      }
      this.hasEvaluated = false;
    } else {
      this.expression += token;
    }
    this.updateDisplay();
  }

  appendFunction(fnName) {
    if (this.hasEvaluated) {
      this.expression = `${fnName}(`;
      this.hasEvaluated = false;
    } else {
      this.expression += `${fnName}(`;
    }
    this.updateDisplay();
  }

  clear() {
    this.expression = '';
    this.result = '0';
    this.hasEvaluated = false;
    this.updateDisplay();
  }

  backspace() {
    if (this.hasEvaluated) {
      this.clear();
      return;
    }

    if (!this.expression) return;

    // Check for multi-character tokens like "sin(", "asin(", "log(", "sqrt("
    const multiTokens = [
      'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(',
      'sin(', 'cos(', 'tan(', 'cot(', 'sec(', 'csc(',
      'asin(', 'acos(', 'atan(',
      'log(', 'ln(', 'sqrt(', 'cbrt(', 'abs(', 'exp(', 'tenpow('
    ];

    for (const t of multiTokens) {
      if (this.expression.endsWith(t)) {
        this.expression = this.expression.slice(0, -t.length);
        this.updateDisplay();
        return;
      }
    }

    // Default: remove single trailing character
    this.expression = this.expression.slice(0, -1);
    this.updateDisplay();
  }

  toggleSign() {
    if (!this.expression && this.result !== '0' && this.result !== 'Error') {
      const num = parseFloat(this.result);
      if (!isNaN(num)) {
        this.result = (-num).toString();
      }
    } else if (this.expression) {
      if (this.expression.startsWith('-(') && this.expression.endsWith(')')) {
        this.expression = this.expression.slice(2, -1);
      } else {
        this.expression = `-(${this.expression})`;
      }
    }
    this.updateDisplay();
  }

  evaluate(recordToHistory = true) {
    if (!this.expression || this.expression.trim() === '') return;

    const evalResult = mathEngine.evaluate(this.expression);

    if (evalResult.success) {
      this.result = evalResult.formatted;
      this.hasEvaluated = true;
      if (recordToHistory) {
        store.addHistoryItem(this.expression, evalResult.formatted, 'Scientific Calculator');
        this.refreshHistoryDrawer();
      }
    } else {
      this.result = evalResult.error || 'Error';
      this.hasEvaluated = true;
    }

    this.updateDisplay();
  }

  copyResult() {
    if (this.result && this.result !== 'Error') {
      copyToClipboard(this.result, `Copied ${this.result}`);
    }
  }

  updateDisplay() {
    const exprEl = document.getElementById('calc-expr-display');
    const resultEl = document.getElementById('calc-result-display');

    if (exprEl) {
      exprEl.textContent = this.expression || ' ';
      exprEl.scrollLeft = exprEl.scrollWidth;
    }

    if (resultEl) {
      resultEl.textContent = this.result || '0';
      if (this.result === 'Error' || (typeof this.result === 'string' && this.result.includes('Error'))) {
        resultEl.classList.add('has-error');
      } else {
        resultEl.classList.remove('has-error');
      }
    }
  }

  refreshHistoryDrawer() {
    const listEl = document.getElementById('calc-history-list');
    if (!listEl) return;

    const history = store.getState().history;
    if (history.length === 0) {
      listEl.innerHTML = `<div style="grid-column: 1/-1; font-size: 0.84rem; color: var(--text-tertiary); text-align: center; padding: 12px;">No calculations yet</div>`;
      return;
    }

    listEl.innerHTML = history.slice(0, 6).map(item => `
      <div class="history-card-replay" data-replay-expr="${item.expression}">
        <span style="font-family: var(--font-math); font-size: 0.8rem; color: var(--text-tertiary);">${item.timestamp}</span>
        <span style="font-family: var(--font-math); font-size: 0.92rem; color: var(--text-white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.expression}</span>
        <span style="font-family: var(--font-math); font-size: 1rem; font-weight: 700; color: var(--accent-cyan);">= ${item.result}</span>
      </div>
    `).join('');
  }

  attachDomListeners() {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-calc-action]');
      if (!btn) return;

      const action = btn.dataset.calcAction;
      const val = btn.dataset.calcVal;

      switch (action) {
        case 'append':
          this.append(val);
          break;
        case 'fn':
          this.appendFunction(val);
          break;
        case 'clear':
          this.clear();
          break;
        case 'backspace':
          this.backspace();
          break;
        case 'evaluate':
          this.evaluate(true);
          break;
        case 'sign':
          this.toggleSign();
          break;
        case 'copy':
          this.copyResult();
          break;
        case 'angle-deg':
          this.setAngleMode('DEG');
          break;
        case 'angle-rad':
          this.setAngleMode('RAD');
          break;
        case 'mode-scientific':
          this.setMode('scientific');
          break;
        case 'mode-basic':
          this.setMode('basic');
          break;
        default:
          break;
      }
    });

    // History card replay click listener
    const historyContainer = document.getElementById('calc-history-list');
    if (historyContainer) {
      historyContainer.addEventListener('click', (e) => {
        const item = e.target.closest('[data-replay-expr]');
        if (!item) return;
        const expr = item.getAttribute('data-replay-expr');
        this.expression = expr;
        this.evaluate(false);
        showToast('Expression loaded into calculator');
      });
    }

    // Precision change listener
    const precSelect = document.getElementById('calc-precision-select');
    if (precSelect) {
      precSelect.addEventListener('change', (e) => {
        this.setPrecision(e.target.value);
        showToast(`Precision set to ${e.target.value} decimals`);
      });
    }

    // Mode tab buttons
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.calcMode;
        this.setMode(mode);
      });
    });
  }

  handleKeyboardInput(e) {
    // Only capture when on calculator page and not typing into an active text input or textarea
    if (location.hash !== '#/calculator') return;
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

    const key = e.key;

    // Digits
    if (/[0-9.]/.test(key)) {
      e.preventDefault();
      this.append(key);
      return;
    }

    // Standard Operators
    if (key === '+' || key === '-' || key === '*' || key === '/' || key === '^' || key === '%' || key === '!') {
      e.preventDefault();
      const opMap = { '*': '×', '/': '÷', '-': '-' };
      this.append(opMap[key] || key);
      return;
    }

    // Parentheses
    if (key === '(' || key === ')') {
      e.preventDefault();
      this.append(key);
      return;
    }

    // Equals / Enter
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      this.evaluate(true);
      return;
    }

    // Backspace / Delete
    if (key === 'Backspace') {
      e.preventDefault();
      this.backspace();
      return;
    }

    // Clear (Escape or c / C)
    if (key === 'Escape' || key === 'Delete') {
      e.preventDefault();
      this.clear();
      return;
    }

    // Keyboard Function Shortcuts
    if (key === 's') {
      e.preventDefault();
      this.appendFunction('sin');
    } else if (key === 'c') {
      e.preventDefault();
      this.appendFunction('cos');
    } else if (key === 't') {
      e.preventDefault();
      this.appendFunction('tan');
    } else if (key === 'l') {
      e.preventDefault();
      this.appendFunction('ln');
    } else if (key === 'p') {
      e.preventDefault();
      this.append('π');
    } else if (key === 'e') {
      e.preventDefault();
      this.append('e');
    }
  }

  attachKeyboardListener() {
    window.addEventListener('keydown', this.boundKeyboardHandler);
  }
}
