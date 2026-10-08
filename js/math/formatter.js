/**
 * OG - Mathematical Result Formatter
 * Standardizes execution outcomes and error envelopes for the OG platform
 * ES6 Module
 */

export class ResultFormatter {
  /**
   * Produces a standardized success envelope
   * @param {*} result - The calculated value or structured output
   * @param {Array<string>} steps - Step-by-step explanatory derivation
   * @param {string} formula - The mathematical formula / theorem applied
   */
  static success(result, steps = [], formula = '') {
    return {
      success: true,
      result,
      steps: Array.isArray(steps) ? steps : [String(steps)],
      formula: typeof formula === 'string' ? formula : String(formula || ''),
      error: null
    };
  }

  /**
   * Produces a standardized error envelope
   * @param {string} errorMessage - Human-readable explanation of why calculation could not proceed
   */
  static error(errorMessage) {
    return {
      success: false,
      result: null,
      steps: [],
      formula: null,
      error: typeof errorMessage === 'string' ? errorMessage : (errorMessage?.message || 'Calculation error')
    };
  }

  /**
   * Cleans floating point representation
   */
  static cleanNumber(num) {
    if (typeof num !== 'number' || !isFinite(num)) return num;
    if (Math.abs(num) < 1e-15) return 0;
    const factor = Math.pow(10, 12);
    return Math.round(num * factor) / factor;
  }
}
