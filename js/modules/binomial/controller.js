/**
 * OG - Module 07: Binomial Theorem Controller
 * Coordinates pipeline: UI -> BinomialController -> BinomialMathEngine -> ResultFormatter -> UI
 * ES6 Module
 */

import { BaseModuleController } from '../../math/controller.js';
import { BinomialMathEngine } from '../../math/binomial.js';
import { store } from '../../state.js';

export const BINOMIAL_PRESETS = {
  expXY4: {
    name: '(x + y)⁴',
    desc: 'Classic binomial polynomial expansion',
    tab: 'expansion',
    a: 'x',
    b: 'y',
    n: '4'
  },
  expX25: {
    name: '(x + 2)⁵',
    desc: 'Expansion with constant second term',
    tab: 'expansion',
    a: 'x',
    b: '2',
    n: '5'
  },
  generalT3: {
    name: '3rd Term of (x + y)⁵',
    desc: 'T₃ = C(5, 2) · x³ · y²',
    tab: 'general',
    a: 'x',
    b: 'y',
    n: '5',
    r: '2'
  },
  midEven6: {
    name: 'Middle term of (x + y)⁶',
    desc: 'Single middle term for even exponent n=6',
    tab: 'middle',
    a: 'x',
    b: 'y',
    n: '6'
  },
  midOdd5: {
    name: 'Middle terms of (x + y)⁵',
    desc: 'Twin middle terms for odd exponent n=5',
    tab: 'middle',
    a: 'x',
    b: 'y',
    n: '5'
  },
  coeffX2: {
    name: 'Coeff of x² in (x + 1)⁵',
    desc: 'Finding specific power coefficient',
    tab: 'coefficient',
    aCoeff: '1',
    pPower: '1',
    bCoeff: '1',
    qPower: '0',
    n: '5',
    targetK: '2'
  }
};

export class BinomialController extends BaseModuleController {
  constructor() {
    super('binomial-theorem');

    this.moduleState = {
      activeTab: 'expansion', // 'expansion' | 'general' | 'middle' | 'coefficient' | 'pascal'
      // Expansion / General / Middle inputs
      inputA: 'x',
      inputB: 'y',
      inputN: '4',
      inputR: '2',
      // Coefficient inputs: (a*x^p + b*x^q)^n -> find x^k
      coeffA: '1',
      coeffP: '1',
      coeffB: '1',
      coeffQ: '0',
      coeffN: '5',
      coeffK: '2',
      // Pascal Triangle rows
      pascalRows: 7,
      // Results
      latestResult: null,
      lastError: null
    };

    // Auto-calculate initial state
    this.calculateCurrent();
  }

  getModuleState() {
    return { ...this.moduleState };
  }

  setActiveTab(tab) {
    this.moduleState.activeTab = tab;
    this.calculateCurrent();
  }

  setInputs(partial) {
    Object.assign(this.moduleState, partial);
  }

  calculateCurrent() {
    try {
      this.moduleState.lastError = null;
      let res = null;

      switch (this.moduleState.activeTab) {
        case 'expansion':
          res = BinomialMathEngine.expandBinomial(
            this.moduleState.inputA,
            this.moduleState.inputB,
            this.moduleState.inputN
          );
          break;
        case 'general':
          res = BinomialMathEngine.generalTerm(
            this.moduleState.inputA,
            this.moduleState.inputB,
            this.moduleState.inputN,
            this.moduleState.inputR
          );
          break;
        case 'middle':
          res = BinomialMathEngine.middleTerm(
            this.moduleState.inputA,
            this.moduleState.inputB,
            this.moduleState.inputN
          );
          break;
        case 'coefficient':
          res = BinomialMathEngine.findCoefficient(
            this.moduleState.coeffA,
            this.moduleState.coeffP,
            this.moduleState.coeffB,
            this.moduleState.coeffQ,
            this.moduleState.coeffN,
            this.moduleState.coeffK
          );
          break;
        case 'pascal':
          res = BinomialMathEngine.pascalTriangle(this.moduleState.pascalRows);
          break;
        default:
          res = BinomialMathEngine.expandBinomial(
            this.moduleState.inputA,
            this.moduleState.inputB,
            this.moduleState.inputN
          );
          break;
      }

      if (!res.success) {
        this.moduleState.latestResult = null;
        this.moduleState.lastError = res.error;
        this.notify(this.getModuleState());
        return res;
      }

      this.moduleState.latestResult = res;

      // Record in platform calculation history
      const expr = res.result.derivation?.input || 'Binomial Calculation';
      const ans = res.result.derivation?.finalAnswer || res.result.formatted;
      store.addHistoryItem(expr, ans, 'Binomial Theorem');

      this.notify(this.getModuleState());
      return res;
    } catch (err) {
      console.error('BinomialController error:', err);
      this.moduleState.lastError = err.message || 'Calculation error';
      this.notify(this.getModuleState());
      return { success: false, error: this.moduleState.lastError };
    }
  }

  loadPreset(presetKey) {
    const preset = BINOMIAL_PRESETS[presetKey];
    if (!preset) return;

    this.moduleState.activeTab = preset.tab;
    if (preset.a !== undefined) this.moduleState.inputA = preset.a;
    if (preset.b !== undefined) this.moduleState.inputB = preset.b;
    if (preset.n !== undefined) this.moduleState.inputN = preset.n;
    if (preset.r !== undefined) this.moduleState.inputR = preset.r;

    if (preset.aCoeff !== undefined) this.moduleState.coeffA = preset.aCoeff;
    if (preset.pPower !== undefined) this.moduleState.coeffP = preset.pPower;
    if (preset.bCoeff !== undefined) this.moduleState.coeffB = preset.bCoeff;
    if (preset.qPower !== undefined) this.moduleState.coeffQ = preset.qPower;
    if (preset.n !== undefined && preset.tab === 'coefficient') this.moduleState.coeffN = preset.n;
    if (preset.targetK !== undefined) this.moduleState.coeffK = preset.targetK;

    return this.calculateCurrent();
  }

  clear() {
    this.moduleState.inputA = 'x';
    this.moduleState.inputB = 'y';
    this.moduleState.inputN = '0';
    this.moduleState.latestResult = null;
    this.moduleState.lastError = null;
    this.notify(this.getModuleState());
  }
}

export const binomialController = new BinomialController();
