/**
 * OG - Sets Module Controller
 * Coordinates flow: UI -> SetsController -> SetsMathEngine -> ResultFormatter -> UI
 * ES6 Module
 */

import { BaseModuleController } from '../../math/controller.js';
import { SetsMathEngine } from '../../math/sets.js';
import { store } from '../../state.js';

export const PRESETS = {
  overlap: {
    name: 'Overlapping Sets',
    desc: 'Sets with shared elements {3, 4}',
    a: 'A = {1, 2, 3, 4}',
    b: 'B = {3, 4, 5, 6}',
    u: '{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}'
  },
  disjoint: {
    name: 'Disjoint Sets',
    desc: 'Mutually exclusive sets (A ∩ B = ∅)',
    a: 'A = {1, 3, 5, 7}',
    b: 'B = {2, 4, 6, 8}',
    u: '{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}'
  },
  subset: {
    name: 'Subset (A ⊂ B)',
    desc: 'Set A is strictly contained inside B',
    a: 'A = {2, 4}',
    b: 'B = {1, 2, 3, 4, 5}',
    u: '{1, 2, 3, 4, 5, 6, 7, 8}'
  },
  alphabetic: {
    name: 'Alphabetic Sets',
    desc: 'Text elements instead of numbers',
    a: 'A = {α, β, γ, δ}',
    b: 'B = {γ, δ, ε, ζ}',
    u: '{α, β, γ, δ, ε, ζ, η, θ}'
  },
  empty: {
    name: 'Empty Set Edge Case',
    desc: 'Operations with null set ∅',
    a: 'A = ∅',
    b: 'B = {1, 2, 3}',
    u: '{1, 2, 3, 4, 5}'
  }
};

export class SetsController extends BaseModuleController {
  constructor() {
    super('sets');

    this.moduleState = {
      inputA: 'A = {1, 2, 3, 4}',
      inputB: 'B = {3, 4, 5, 6}',
      inputU: '{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}',
      activeOp: 'union',
      batchResult: null,
      currentOpResult: null,
      lastError: null
    };

    // Auto-calculate initial state
    this.calculateAll();
  }

  getModuleState() {
    return { ...this.moduleState };
  }

  setInputs(inputA, inputB, inputU) {
    if (inputA !== undefined) this.moduleState.inputA = inputA;
    if (inputB !== undefined) this.moduleState.inputB = inputB;
    if (inputU !== undefined) this.moduleState.inputU = inputU;
  }

  setActiveOperation(opKey) {
    this.moduleState.activeOp = opKey;
    if (this.moduleState.batchResult && this.moduleState.batchResult.success) {
      this.moduleState.currentOpResult = this._extractOpResult(this.moduleState.batchResult, opKey);
    }
    this.notify(this.getModuleState());
  }

  calculateAll() {
    try {
      this.moduleState.lastError = null;
      const response = SetsMathEngine.calculateAll(
        this.moduleState.inputA,
        this.moduleState.inputB,
        this.moduleState.inputU
      );

      if (!response.success) {
        this.moduleState.batchResult = null;
        this.moduleState.currentOpResult = null;
        this.moduleState.lastError = response.error;
        this.notify(this.getModuleState());
        return response;
      }

      this.moduleState.batchResult = response;
      this.moduleState.currentOpResult = this._extractOpResult(response, this.moduleState.activeOp);

      // Record in platform calculation history
      const activeOpRes = this.moduleState.currentOpResult;
      if (activeOpRes && activeOpRes.success) {
        const opTitle = this._getOpTitle(this.moduleState.activeOp);
        store.addHistoryItem(
          `${opTitle} for A=${response.result.formattedA}, B=${response.result.formattedB}`,
          activeOpRes.result.formatted,
          'Sets Module'
        );
      }

      this.notify(this.getModuleState());
      return response;
    } catch (err) {
      console.error('SetsController execution error:', err);
      this.moduleState.lastError = err.message || 'An unexpected calculation error occurred.';
      this.notify(this.getModuleState());
      return { success: false, error: this.moduleState.lastError };
    }
  }

  loadPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    this.moduleState.inputA = preset.a;
    this.moduleState.inputB = preset.b;
    this.moduleState.inputU = preset.u;
    return this.calculateAll();
  }

  clear() {
    this.moduleState.inputA = 'A = {}';
    this.moduleState.inputB = 'B = {}';
    this.moduleState.inputU = '{}';
    this.moduleState.batchResult = null;
    this.moduleState.currentOpResult = null;
    this.moduleState.lastError = null;
    this.notify(this.getModuleState());
  }

  _extractOpResult(batchResponse, opKey) {
    if (!batchResponse || !batchResponse.success) return null;
    const r = batchResponse.result;

    switch (opKey) {
      case 'union': return r.union;
      case 'intersection': return r.intersection;
      case 'diffAB': return r.diffAB;
      case 'diffBA': return r.diffBA;
      case 'symDiff': return r.symDiff;
      case 'complementA': return r.complementA;
      case 'complementB': return r.complementB;
      case 'subsetAB': return r.subsetAB;
      case 'subsetBA': return r.subsetBA;
      case 'properSubsetAB': return r.properSubsetAB;
      case 'cartesianAB': return r.cartesianAB;
      case 'powerSetA': return r.powerSetA;
      case 'powerSetB': return r.powerSetB;
      default: return r.union;
    }
  }

  _getOpTitle(opKey) {
    const titles = {
      union: 'A ∪ B',
      intersection: 'A ∩ B',
      diffAB: 'A - B',
      diffBA: 'B - A',
      symDiff: 'A Δ B',
      complementA: 'A′',
      complementB: 'B′',
      subsetAB: 'A ⊆ B',
      subsetBA: 'B ⊆ A',
      properSubsetAB: 'A ⊂ B',
      cartesianAB: 'A × B',
      powerSetA: '𝒫(A)',
      powerSetB: '𝒫(B)'
    };
    return titles[opKey] || opKey;
  }
}

export const setsController = new SetsController();
