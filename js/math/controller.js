/**
 * OG - Module Controller Layer
 * Implements architectural pipeline: UI -> Module Controller -> Math Engine -> Result Formatter -> UI
 * ES6 Module
 */

import { CoreMathEngine } from './core.js';
import { ResultFormatter } from './formatter.js';

export class BaseModuleController {
  constructor(moduleId = 'core') {
    this.moduleId = moduleId;
    this.subscribers = new Set();
  }

  /**
   * Subscribe UI components to calculation events
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Dispatches structured response to UI subscribers
   */
  notify(response) {
    this.subscribers.forEach(cb => {
      try {
        cb(response);
      } catch (err) {
        console.error(`UI Subscriber error in module ${this.moduleId}:`, err);
      }
    });
  }

  /**
   * Safe execution wrapper ensuring UI never crashes
   */
  execute(operationName, ...args) {
    try {
      if (typeof CoreMathEngine[operationName] !== 'function') {
        const errResp = ResultFormatter.error(`Operation '${operationName}' is not supported by the mathematical engine.`);
        this.notify(errResp);
        return errResp;
      }

      // Delegate to Core Mathematical Engine
      const response = CoreMathEngine[operationName](...args);
      this.notify(response);
      return response;
    } catch (unhandledErr) {
      console.error(`Unexpected error in ModuleController [${this.moduleId}]:`, unhandledErr);
      const fallbackResp = ResultFormatter.error(`Unexpected system error: ${unhandledErr.message || unhandledErr}`);
      this.notify(fallbackResp);
      return fallbackResp;
    }
  }

  // --- Foundational Controller Methods for UI ---

  computeFactorial(n) {
    return this.execute('factorial', n);
  }

  computePermutation(n, r) {
    return this.execute('permutation', n, r);
  }

  computeCombination(n, r) {
    return this.execute('combination', n, r);
  }

  computeGcd(a, b) {
    return this.execute('gcd', a, b);
  }

  computeLcm(a, b) {
    return this.execute('lcm', a, b);
  }

  computePercentage(value, total) {
    return this.execute('percentage', value, total);
  }

  computePower(base, exponent) {
    return this.execute('power', base, exponent);
  }

  computeSquareRoot(x) {
    return this.execute('squareRoot', x);
  }

  computeCubeRoot(x) {
    return this.execute('cubeRoot', x);
  }

  convertDegreeToRadian(deg) {
    return this.execute('degreeToRadian', deg);
  }

  convertRadianToDegree(rad) {
    return this.execute('radianToDegree', rad);
  }

  applyRounding(value, decimals) {
    return this.execute('round', value, decimals);
  }

  applySignificantDigits(value, digits) {
    return this.execute('toSignificantDigits', value, digits);
  }
}

// Global Core Module Controller Instance
export const coreModuleController = new BaseModuleController('core');
