/**
 * OG - Mathematical Input Validator
 * Defensive validation ensuring calculation safety and graceful error handling
 * ES6 Module
 */

export class MathValidator {
  /**
   * Assesses if input is a valid finite real number
   */
  static isNumber(val, paramName = 'Input') {
    if (val === null || val === undefined || val === '') {
      return { valid: false, error: `${paramName} is required and cannot be empty.`, value: null };
    }
    const num = Number(val);
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
      return { valid: false, error: `${paramName} must be a valid finite real number.`, value: null };
    }
    return { valid: true, error: null, value: num };
  }

  /**
   * Assesses if input is an integer
   */
  static isInteger(val, paramName = 'Input') {
    const numCheck = this.isNumber(val, paramName);
    if (!numCheck.valid) return numCheck;

    if (!Number.isInteger(numCheck.value)) {
      return { valid: false, error: `${paramName} must be an integer, received decimal: ${numCheck.value}`, value: null };
    }
    return { valid: true, error: null, value: numCheck.value };
  }

  /**
   * Assesses if input is a non-negative integer (n >= 0)
   */
  static isNonNegativeInteger(val, paramName = 'Input') {
    const intCheck = this.isInteger(val, paramName);
    if (!intCheck.valid) return intCheck;

    if (intCheck.value < 0) {
      return { valid: false, error: `${paramName} must be non-negative (>= 0), received: ${intCheck.value}`, value: null };
    }
    return { valid: true, error: null, value: intCheck.value };
  }

  /**
   * Assesses if input is positive (> 0)
   */
  static isPositive(val, paramName = 'Input') {
    const numCheck = this.isNumber(val, paramName);
    if (!numCheck.valid) return numCheck;

    if (numCheck.value <= 0) {
      return { valid: false, error: `${paramName} must be strictly positive (> 0), received: ${numCheck.value}`, value: null };
    }
    return { valid: true, error: null, value: numCheck.value };
  }

  /**
   * Assesses if input is non-zero
   */
  static isNonZero(val, paramName = 'Denominator') {
    const numCheck = this.isNumber(val, paramName);
    if (!numCheck.valid) return numCheck;

    if (numCheck.value === 0) {
      return { valid: false, error: `${paramName} cannot be zero (division by zero is undefined).`, value: null };
    }
    return { valid: true, error: null, value: numCheck.value };
  }

  /**
   * Validates (n, r) for permutations and combinations
   */
  static validateCombinatorics(n, r) {
    const checkN = this.isNonNegativeInteger(n, 'Total items (n)');
    if (!checkN.valid) return checkN;

    const checkR = this.isNonNegativeInteger(r, 'Selected items (r)');
    if (!checkR.valid) return checkR;

    if (checkN.value > 170) {
      return { valid: false, error: `Value of n (${checkN.value}) exceeds calculation limits (> 170).`, value: null };
    }

    if (checkR.value > checkN.value) {
      return {
        valid: false,
        error: `Number of selected items r (${checkR.value}) cannot be greater than total items n (${checkN.value}).`,
        value: null
      };
    }

    return { valid: true, error: null, n: checkN.value, r: checkR.value };
  }
}
