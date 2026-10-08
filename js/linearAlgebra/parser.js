/**
 * OG - Linear Algebra Input Parser
 * Normalizes and parses various matrix and vector input representations:
 * - Nested arrays: [[1, 2], [3, 4]]
 * - Semicolon rows: [1 2; 3 4] or 1 2; 3 4
 * - Plain lines: 1 2 \n 3 4 or 1, 2 \n 3, 4
 * - Vectors: [1, 2, 3]
 * - Universal Input Recognizer for natural commands
 *
 * ES6 Module
 */

import { LinearAlgebraValidator } from './validators.js';

export class LinearAlgebraParser {
  /**
   * Parse a raw input string or object into a 2D numerical matrix grid
   */
  static parseMatrix(raw, name = 'A') {
    if (!raw && raw !== 0) {
      return {
        valid: false,
        error: {
          code: 'EMPTY_INPUT',
          message: `Matrix ${name} input is empty. Please enter matrix elements.`,
          details: 'Input is null, undefined, or empty string.'
        }
      };
    }

    // If already 2D array
    if (Array.isArray(raw)) {
      if (raw.length > 0 && Array.isArray(raw[0])) {
        const val = LinearAlgebraValidator.validateMatrixGrid(raw, name);
        if (!val.valid) return val;
        return { valid: true, grid: raw, rows: val.rows, cols: val.cols };
      }
    }

    const str = String(raw).trim();
    if (str.length === 0) {
      return {
        valid: false,
        error: {
          code: 'EMPTY_INPUT',
          message: `Matrix ${name} input is empty. Please enter matrix elements.`,
          details: 'String length is 0.'
        }
      };
    }

    // Try JSON array parsing: e.g. [[1,2],[3,4]]
    if (str.startsWith('[[') && str.endsWith(']]')) {
      try {
        const parsed = JSON.parse(str);
        const val = LinearAlgebraValidator.validateMatrixGrid(parsed, name);
        if (val.valid) {
          return { valid: true, grid: parsed, rows: val.rows, cols: val.cols };
        }
      } catch (e) {
        // Fall back to general tokenizer
      }
    }

    // Clean outer brackets if present: e.g. [1 2; 3 4] -> 1 2; 3 4
    let cleanStr = str;
    if (cleanStr.startsWith('[') && cleanStr.endsWith(']')) {
      cleanStr = cleanStr.slice(1, -1).trim();
    }

    // Split by semicolons or newlines into rows
    const rawRows = cleanStr.split(/[\n;]+/).map(r => r.trim()).filter(Boolean);

    if (rawRows.length === 0) {
      return {
        valid: false,
        error: {
          code: 'EMPTY_MATRIX',
          message: `Matrix ${name} contains no valid rows.`,
          details: 'No non-empty lines found.'
        }
      };
    }

    const grid = [];
    for (let r = 0; r < rawRows.length; r++) {
      let rowStr = rawRows[r];
      // If row has brackets e.g. [1, 2], remove them
      if (rowStr.startsWith('[') && rowStr.endsWith(']')) {
        rowStr = rowStr.slice(1, -1).trim();
      }

      // Tokenize by comma or spaces
      const tokens = rowStr.split(/[,\s]+/).map(t => t.trim()).filter(Boolean);
      const numRow = [];

      for (let c = 0; c < tokens.length; c++) {
        const token = tokens[c];
        // Handle simple fractions e.g. "1/2" or "-3/4"
        let num;
        if (token.includes('/')) {
          const fracParts = token.split('/');
          const numPart = parseFloat(fracParts[0]);
          const denPart = parseFloat(fracParts[1]);
          if (denPart === 0) {
            return {
              valid: false,
              error: {
                code: 'DIVISION_BY_ZERO',
                message: `Matrix ${name} element "${token}" at (${r + 1}, ${c + 1}) has denominator zero.`,
                details: 'Division by zero is undefined.'
              }
            };
          }
          num = numPart / denPart;
        } else {
          num = parseFloat(token);
        }

        if (isNaN(num) || !Number.isFinite(num)) {
          return {
            valid: false,
            error: {
              code: 'INVALID_NUMBER',
              message: `Matrix ${name} contains an invalid numeric token "${token}" at row ${r + 1}, col ${c + 1}.`,
              details: `Expected a number or fraction, received: ${token}`
            }
          };
        }
        numRow.push(num);
      }

      grid.push(numRow);
    }

    const validation = LinearAlgebraValidator.validateMatrixGrid(grid, name);
    if (!validation.valid) return validation;

    return {
      valid: true,
      grid,
      rows: validation.rows,
      cols: validation.cols
    };
  }

  /**
   * Parse 1D numerical vector
   */
  static parseVector(raw, name = 'v') {
    if (!raw && raw !== 0) {
      return {
        valid: false,
        error: {
          code: 'EMPTY_VECTOR',
          message: `Vector ${name} is empty.`,
          details: 'Input is null or empty.'
        }
      };
    }

    if (Array.isArray(raw)) {
      const clean = raw.map(Number);
      if (clean.every(Number.isFinite) && clean.length > 0) {
        return { valid: true, vector: clean, dimension: clean.length };
      }
    }

    let str = String(raw).trim();
    if (str.startsWith('[') && str.endsWith(']')) {
      str = str.slice(1, -1).trim();
    }

    const tokens = str.split(/[,\s;]+/).map(t => t.trim()).filter(Boolean);
    if (tokens.length === 0) {
      return {
        valid: false,
        error: {
          code: 'EMPTY_VECTOR',
          message: `Vector ${name} contains no valid components.`,
          details: 'No tokens found.'
        }
      };
    }

    const vector = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      let num;
      if (t.includes('/')) {
        const parts = t.split('/');
        num = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else {
        num = parseFloat(t);
      }
      if (isNaN(num) || !Number.isFinite(num)) {
        return {
          valid: false,
          error: {
            code: 'INVALID_VECTOR_COMPONENT',
            message: `Vector ${name} component "${t}" at position ${i + 1} is not a valid number.`,
            details: `Received: ${t}`
          }
        };
      }
      vector.push(num);
    }

    return {
      valid: true,
      vector,
      dimension: vector.length
    };
  }

  /**
   * Universal Linear Algebra Input Recognizer (Section 39)
   * Recognizes expressions and suggests module / operation
   */
  static recognizeInput(inputStr) {
    if (!inputStr || typeof inputStr !== 'string') {
      return { type: 'unknown', confidence: 0, suggestion: 'matrix' };
    }

    const raw = inputStr.trim();
    const lower = raw.toLowerCase();

    // 1. Explicit operation commands: det(...), inv(...), rank(...), eigen(...)
    if (lower.startsWith('det(') || lower.startsWith('determinant(')) {
      const inner = raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')')).trim();
      return {
        type: 'determinant',
        operation: 'determinant',
        payload: inner,
        suggestion: 'Determinant calculation'
      };
    }

    if (lower.startsWith('inv(') || lower.startsWith('inverse(')) {
      const inner = raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')')).trim();
      return {
        type: 'inverse',
        operation: 'inverse',
        payload: inner,
        suggestion: 'Matrix Inverse calculation'
      };
    }

    if (lower.startsWith('rank(')) {
      const inner = raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')')).trim();
      return {
        type: 'rank',
        operation: 'rank',
        payload: inner,
        suggestion: 'Rank and RREF analysis'
      };
    }

    if (lower.startsWith('rref(')) {
      const inner = raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')')).trim();
      return {
        type: 'rref',
        operation: 'rref',
        payload: inner,
        suggestion: 'Reduced Row Echelon Form'
      };
    }

    if (lower.startsWith('eigen(') || lower.startsWith('eigenvalues(') || lower.includes('eigenvalues of')) {
      const match = raw.match(/\[\[.+\]\]/);
      const inner = match ? match[0] : raw.replace(/.*eigenvalues(?:\s+of)?\s*/i, '').trim();
      return {
        type: 'eigenvalues',
        operation: 'eigenvalues',
        payload: inner,
        suggestion: 'Eigenvalue & Eigenvector calculation'
      };
    }

    // 2. Vector operations: dot, cross, proj
    if (lower.includes('dot') || lower.includes('·')) {
      const parts = raw.split(/dot|·/i).map(s => s.trim());
      return {
        type: 'vector_dot',
        operation: 'dot_product',
        vectorA: parts[0],
        vectorB: parts[1],
        suggestion: 'Vector Dot Product'
      };
    }

    if (lower.includes('cross') || lower.includes('×')) {
      const parts = raw.split(/cross|×/i).map(s => s.trim());
      return {
        type: 'vector_cross',
        operation: 'cross_product',
        vectorA: parts[0],
        vectorB: parts[1],
        suggestion: 'Vector Cross Product'
      };
    }

    // 3. System of linear equations: contains variables like x, y, z and '='
    if (raw.includes('=') && (raw.includes('x') || raw.includes('y') || raw.includes('z'))) {
      const lines = raw.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
      if (lines.length >= 2 || (lines.length === 1 && lines[0].includes('='))) {
        return {
          type: 'linear_system',
          operation: 'solve_system',
          equations: lines,
          suggestion: 'Solve System of Linear Equations'
        };
      }
    }

    // 4. Matrix assignment: A = [[...]]
    if (/^[A-Z]\s*=\s*\[/i.test(raw)) {
      const labelMatch = raw.match(/^([A-Z])\s*=\s*(.*)$/i);
      const label = labelMatch ? labelMatch[1].toUpperCase() : 'A';
      const matrixContent = labelMatch ? labelMatch[2] : raw;
      return {
        type: 'matrix_definition',
        label,
        matrixContent,
        suggestion: `Assign to Matrix ${label}`
      };
    }

    // 5. Direct Matrix format
    if (raw.startsWith('[[') || raw.includes(';') || (raw.includes('\n') && /\d/.test(raw))) {
      return {
        type: 'matrix',
        operation: 'matrix_analysis',
        matrixContent: raw,
        suggestion: 'Analyze Matrix Properties & Operations'
      };
    }

    // 6. Direct Vector format
    if (raw.startsWith('[') && !raw.startsWith('[[')) {
      return {
        type: 'vector',
        operation: 'vector_analysis',
        vectorContent: raw,
        suggestion: 'Vector Analysis'
      };
    }

    return {
      type: 'general',
      payload: raw,
      suggestion: 'Matrix / Vector Calculator'
    };
  }
}
