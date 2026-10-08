/**
 * OG - Module 06: Permutations and Combinations Controller
 * Coordinates pipeline: UI -> CombinatoricsController -> CombinatoricsMathEngine -> ResultFormatter -> UI
 * ES6 Module
 */

import { BaseModuleController } from '../../math/controller.js';
import { CombinatoricsMathEngine } from '../../math/combinatorics.js';
import { store } from '../../state.js';

export const COMBINATORICS_PRESETS = {
  p53: {
    name: 'P(5, 3) = 60',
    desc: 'Arrange 3 distinct items from 5 items',
    tab: 'permutation',
    n: '5',
    r: '3'
  },
  c52: {
    name: 'C(5, 2) = 10',
    desc: 'Select 2 items from 5 items',
    tab: 'combination',
    n: '5',
    r: '2'
  },
  fac7: {
    name: '7! = 5,040',
    desc: 'Factorial permutations of 7 items',
    tab: 'factorial',
    n: '7'
  },
  mississippi: {
    name: 'Word "MISSISSIPPI"',
    desc: 'Permutations with repeated letters',
    tab: 'arrangements',
    word: 'MISSISSIPPI',
    isCircular: false
  },
  handshakes: {
    name: '10 People Handshakes',
    desc: 'Handshakes between 10 attendees = C(10, 2)',
    tab: 'selections',
    selType: 'handshakes',
    p1: '10'
  }
};

export class CombinatoricsController extends BaseModuleController {
  constructor() {
    super('permutations-combinations');

    this.moduleState = {
      activeTab: 'permutation', // 'permutation' | 'combination' | 'factorial' | 'arrangements' | 'selections'
      // Permutation & Combination inputs
      nInput: '5',
      rInput: '3',
      // Factorial input
      facNInput: '5',
      // Arrangements input
      wordInput: 'SUCCESS',
      isCircular: false,
      // Selections input
      selType: 'handshakes',
      selP1: '8',
      selP2: '4',
      selP3: '3',
      // Output state
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
        case 'permutation':
          res = CombinatoricsMathEngine.permutation(this.moduleState.nInput, this.moduleState.rInput);
          break;
        case 'combination':
          res = CombinatoricsMathEngine.combination(this.moduleState.nInput, this.moduleState.rInput);
          break;
        case 'factorial':
          res = CombinatoricsMathEngine.factorial(this.moduleState.facNInput);
          break;
        case 'arrangements':
          res = CombinatoricsMathEngine.arrangements(this.moduleState.wordInput, this.moduleState.isCircular);
          break;
        case 'selections':
          res = CombinatoricsMathEngine.solveSelectionProblem(
            this.moduleState.selType,
            this.moduleState.selP1,
            this.moduleState.selP2,
            this.moduleState.selP3
          );
          break;
        default:
          res = CombinatoricsMathEngine.permutation(this.moduleState.nInput, this.moduleState.rInput);
          break;
      }

      if (!res.success) {
        this.moduleState.latestResult = null;
        this.moduleState.lastError = res.error;
        this.notify(this.getModuleState());
        return res;
      }

      this.moduleState.latestResult = res;

      // Add to platform calculation history
      const expr = res.result.derivation?.input || 'Combinatorics Calculation';
      const ans = res.result.derivation?.finalAnswer || res.result.formatted;
      store.addHistoryItem(expr, ans, 'Permutations & Combinations');

      this.notify(this.getModuleState());
      return res;
    } catch (err) {
      console.error('CombinatoricsController error:', err);
      this.moduleState.lastError = err.message || 'Calculation error';
      this.notify(this.getModuleState());
      return { success: false, error: this.moduleState.lastError };
    }
  }

  loadPreset(presetKey) {
    const preset = COMBINATORICS_PRESETS[presetKey];
    if (!preset) return;

    this.moduleState.activeTab = preset.tab;
    if (preset.n !== undefined) this.moduleState.nInput = preset.n;
    if (preset.r !== undefined) this.moduleState.rInput = preset.r;
    if (preset.tab === 'factorial' && preset.n !== undefined) this.moduleState.facNInput = preset.n;
    if (preset.word !== undefined) this.moduleState.wordInput = preset.word;
    if (preset.isCircular !== undefined) this.moduleState.isCircular = preset.isCircular;
    if (preset.selType !== undefined) this.moduleState.selType = preset.selType;
    if (preset.p1 !== undefined) this.moduleState.selP1 = preset.p1;

    return this.calculateCurrent();
  }

  clear() {
    this.moduleState.nInput = '0';
    this.moduleState.rInput = '0';
    this.moduleState.facNInput = '0';
    this.moduleState.wordInput = '';
    this.moduleState.latestResult = null;
    this.moduleState.lastError = null;
    this.notify(this.getModuleState());
  }
}

export const combinatoricsController = new CombinatoricsController();
