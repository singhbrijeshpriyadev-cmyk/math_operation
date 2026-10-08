/**
 * OG - Linear Algebra Formatter & Result Envelope
 * Formats numbers, fractions, LaTeX representations, and standardizes result objects.
 * Strict compliance with Section 51 Result Standard.
 *
 * ES6 Module
 */

export class LinearAlgebraFormatter {
  static EPSILON = 1e-10;

  /**
   * Cleans floating point representation using epsilon threshold
   */
  static cleanNumber(val, decimals = 6) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return 0;
    if (Math.abs(val) < this.EPSILON) return 0;

    // Check if within epsilon of an integer
    const roundInt = Math.round(val);
    if (Math.abs(val - roundInt) < this.EPSILON) {
      return roundInt;
    }

    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  /**
   * Convert floating point number to exact fraction string if rational within tolerance
   */
  static toExactFraction(val, maxDenominator = 10000) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return '0';
    if (Math.abs(val) < this.EPSILON) return '0';

    const roundInt = Math.round(val);
    if (Math.abs(val - roundInt) < this.EPSILON) return `${roundInt}`;

    const sign = val < 0 ? -1 : 1;
    const absVal = Math.abs(val);

    // Continued fraction algorithm for rational approximation
    let h1 = 1, h2 = 0;
    let k1 = 0, k2 = 1;
    let b = absVal;

    do {
      const a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;

      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;

      b = 1 / (b - a);
    } while (Math.abs(absVal - h1 / k1) > absVal * 1e-7 && k1 < maxDenominator && isFinite(b));

    if (k1 <= maxDenominator && Math.abs(absVal - h1 / k1) < 1e-5) {
      const num = sign * h1;
      const den = k1;
      return den === 1 ? `${num}` : `${num}/${den}`;
    }

    return `${this.cleanNumber(val, 6)}`;
  }

  /**
   * Format matrix grid into text with curved / square brackets
   */
  static formatMatrixText(grid, exact = false) {
    if (!grid || !Array.isArray(grid) || grid.length === 0) return '[]';

    const formattedGrid = grid.map(row =>
      row.map(val => exact ? this.toExactFraction(val) : `${this.cleanNumber(val, 4)}`)
    );

    // Compute max width per column for clean alignment
    const cols = formattedGrid[0].length;
    const colWidths = new Array(cols).fill(0);
    formattedGrid.forEach(row => {
      row.forEach((cell, c) => {
        colWidths[c] = Math.max(colWidths[c], cell.length);
      });
    });

    const lines = formattedGrid.map(row => {
      const paddedCells = row.map((cell, c) => cell.padStart(colWidths[c], ' '));
      return `[ ${paddedCells.join('  ')} ]`;
    });

    return lines.join('\n');
  }

  /**
   * Format matrix grid into LaTeX bmatrix string
   */
  static formatMatrixLatex(grid, exact = false) {
    if (!grid || !Array.isArray(grid) || grid.length === 0) return '\\begin{bmatrix}\\end{bmatrix}';

    const rows = grid.map(row =>
      row.map(val => exact ? this.toExactFraction(val) : `${this.cleanNumber(val, 4)}`).join(' & ')
    );

    return `\\begin{bmatrix}\n  ${rows.join(' \\\\\n  ')}\n\\end{bmatrix}`;
  }

  /**
   * Format vector into text e.g. [1, 2, 3]
   */
  static formatVectorText(vec, exact = false) {
    if (!vec || !Array.isArray(vec)) return '[]';
    const formatted = vec.map(v => exact ? this.toExactFraction(v) : `${this.cleanNumber(v, 4)}`);
    return `[${formatted.join(', ')}]`;
  }

  /**
   * Format vector into LaTeX column vector
   */
  static formatVectorLatex(vec, exact = false) {
    if (!vec || !Array.isArray(vec)) return '\\begin{bmatrix}\\end{bmatrix}';
    const rows = vec.map(v => exact ? this.toExactFraction(v) : `${this.cleanNumber(v, 4)}`).join(' \\\\\n  ');
    return `\\begin{bmatrix}\n  ${rows}\n\\end{bmatrix}`;
  }

  /**
   * Standard Result Object Envelope (Section 51)
   */
  static success({
    operation,
    input,
    result,
    exactResult = null,
    steps = [],
    formula = '',
    verification = null,
    warnings = []
  }) {
    return {
      success: true,
      operation: String(operation || 'operation'),
      input,
      result,
      exactResult: exactResult || result,
      steps: Array.isArray(steps) ? steps : [String(steps)],
      formula: String(formula || ''),
      verification: verification || null,
      warnings: Array.isArray(warnings) ? warnings : [],
      error: null
    };
  }

  /**
   * Standard Error Object Envelope (Section 51)
   */
  static error({
    code = 'ERROR',
    message = 'An error occurred during calculation.',
    details = ''
  }) {
    return {
      success: false,
      operation: null,
      input: null,
      result: null,
      exactResult: null,
      steps: [],
      formula: null,
      verification: null,
      warnings: [],
      error: {
        code,
        message,
        details: details || message
      }
    };
  }
}
