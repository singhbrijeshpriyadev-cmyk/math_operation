/**
 * OG - Linear Algebra Validators
 * Validates matrix dimensions, vector compatibility, and data integrity.
 * Returns standard error envelopes when validation fails.
 *
 * ES6 Module
 */

export class LinearAlgebraValidator {
  /**
   * Floating-point comparison tolerance
   */
  static EPSILON = 1e-10;

  /**
   * Validate that input is a non-empty 2D array of finite numbers
   */
  static validateMatrixGrid(grid, name = 'A') {
    if (!grid || !Array.isArray(grid)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_MATRIX',
          message: `Matrix ${name} must be a 2-dimensional array.`,
          details: `Received: ${typeof grid}`
        }
      };
    }

    const rows = grid.length;
    if (rows === 0) {
      return {
        valid: false,
        error: {
          code: 'EMPTY_MATRIX',
          message: `Matrix ${name} cannot be empty.`,
          details: 'Number of rows is 0.'
        }
      };
    }

    if (!Array.isArray(grid[0]) || grid[0].length === 0) {
      return {
        valid: false,
        error: {
          code: 'EMPTY_ROW',
          message: `Matrix ${name} must contain at least one column.`,
          details: 'Row 1 has 0 columns.'
        }
      };
    }

    const cols = grid[0].length;
    for (let r = 0; r < rows; r++) {
      if (!Array.isArray(grid[r])) {
        return {
          valid: false,
          error: {
            code: 'INVALID_ROW',
            message: `Row ${r + 1} of Matrix ${name} is not an array.`,
            details: `Row index ${r} is not an array.`
          }
        };
      }
      if (grid[r].length !== cols) {
        return {
          valid: false,
          error: {
            code: 'INCONSISTENT_DIMENSIONS',
            message: `Matrix ${name} has inconsistent row lengths. Row 1 has ${cols} columns, but Row ${r + 1} has ${grid[r].length} columns.`,
            details: `All rows in a matrix must have identical lengths.`
          }
        };
      }
      for (let c = 0; c < cols; c++) {
        const val = grid[r][c];
        if (typeof val !== 'number' || !Number.isFinite(val)) {
          return {
            valid: false,
            error: {
              code: 'NON_NUMERIC_ELEMENT',
              message: `Matrix ${name} contains an invalid numeric element at position (${r + 1}, ${c + 1}).`,
              details: `Element value is: ${val}`
            }
          };
        }
      }
    }

    return { valid: true, rows, cols };
  }

  /**
   * Validate that a matrix is square (m === n)
   */
  static validateSquare(rows, cols, name = 'A', operation = 'Operation') {
    if (rows !== cols) {
      return {
        valid: false,
        error: {
          code: 'NOT_SQUARE',
          message: `${operation} is only defined for square matrices (n × n). Matrix ${name} has dimensions ${rows} × ${cols}.`,
          details: `Rows (${rows}) must equal Columns (${cols}).`
        }
      };
    }
    return { valid: true };
  }

  /**
   * Validate matrix addition/subtraction compatibility: dimensions must match exactly
   */
  static validateSameDimensions(rA, cA, rB, cB, opName = 'Addition') {
    if (rA !== rB || cA !== cB) {
      return {
        valid: false,
        error: {
          code: 'DIMENSION_MISMATCH',
          message: `Matrix ${opName} is undefined because matrix dimensions do not match. Matrix A is ${rA} × ${cA}, while Matrix B is ${rB} × ${cB}.`,
          details: `Both matrices must have identical dimensions (m × n).`
        }
      };
    }
    return { valid: true };
  }

  /**
   * Validate matrix multiplication compatibility: cols(A) === rows(B)
   */
  static validateMultiplicationDimensions(rA, cA, rB, cB) {
    if (cA !== rB) {
      return {
        valid: false,
        error: {
          code: 'MULTIPLICATION_UNDEFINED',
          message: `Matrix multiplication A × B is undefined because the number of columns in Matrix A (${cA}) does not equal the number of rows in Matrix B (${rB}).`,
          details: `For A(m × k) and B(k × p), the inner dimension k must be equal. Here ${cA} ≠ ${rB}.`
        }
      };
    }
    return { valid: true, resultRows: rA, resultCols: cB };
  }

  /**
   * Validate scalar value
   */
  static validateScalar(k, name = 'scalar') {
    const num = Number(k);
    if (!Number.isFinite(num)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_SCALAR',
          message: `Value for ${name} must be a finite number.`,
          details: `Received: ${k}`
        }
      };
    }
    return { valid: true, value: num };
  }

  /**
   * Validate power exponent (non-negative integer)
   */
  static validatePower(p) {
    const num = Number(p);
    if (!Number.isInteger(num) || num < 0) {
      return {
        valid: false,
        error: {
          code: 'INVALID_POWER',
          message: `Matrix power exponent must be a non-negative integer (0, 1, 2, ...).`,
          details: `Received power: ${p}`
        }
      };
    }
    if (num > 20) {
      return {
        valid: false,
        error: {
          code: 'POWER_TOO_LARGE',
          message: `Matrix power ${num} exceeds calculation limit of 20.`,
          details: `Power must be ≤ 20 to maintain numerical stability.`
        }
      };
    }
    return { valid: true, power: num };
  }
}
