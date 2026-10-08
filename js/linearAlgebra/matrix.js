/**
 * OG - Matrix Core Data Model
 * Immutable-friendly Matrix class with multidimensional accessors,
 * factory generators, and string representations.
 *
 * ES6 Module
 */

import { LinearAlgebraValidator } from './validators.js';
import { LinearAlgebraFormatter } from './formatter.js';
import { LinearAlgebraParser } from './parser.js';

export class Matrix {
  /**
   * @param {number[][]} grid - 2D numerical array
   * @param {string} name - Matrix label e.g. 'A', 'B'
   */
  constructor(grid, name = 'A') {
    const val = LinearAlgebraValidator.validateMatrixGrid(grid, name);
    if (!val.valid) {
      throw new Error(val.error.message);
    }

    this.rows = val.rows;
    this.cols = val.cols;
    this.name = name;

    // Deep clone grid ensuring pure numbers
    this.grid = grid.map(row => row.map(v => Number(v)));
  }

  /**
   * Get element at 0-indexed position (r, c)
   */
  get(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
      return undefined;
    }
    return this.grid[r][c];
  }

  /**
   * Return a new Matrix with element at (r, c) updated
   */
  set(r, c, val) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
      throw new Error(`Index out of bounds: (${r}, ${c}) for matrix ${this.rows}×${this.cols}`);
    }
    const newGrid = this.grid.map(row => [...row]);
    newGrid[r][c] = Number(val);
    return new Matrix(newGrid, this.name);
  }

  /**
   * Get row r as array
   */
  row(r) {
    if (r < 0 || r >= this.rows) return undefined;
    return [...this.grid[r]];
  }

  /**
   * Get column c as array
   */
  col(c) {
    if (c < 0 || c >= this.cols) return undefined;
    return this.grid.map(row => row[c]);
  }

  /**
   * Check if matrix is square (m === n)
   */
  isSquare() {
    return this.rows === this.cols;
  }

  /**
   * Deep clone of matrix
   */
  clone(newName = null) {
    return new Matrix(this.grid.map(r => [...r]), newName || this.name);
  }

  /**
   * Check equality with another matrix within numerical tolerance
   */
  equals(other, tolerance = LinearAlgebraValidator.EPSILON) {
    if (!other || !(other instanceof Matrix)) return false;
    if (this.rows !== other.rows || this.cols !== other.cols) return false;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (Math.abs(this.grid[r][c] - other.grid[r][c]) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Format matrix to bracketed text
   */
  toText(exact = false) {
    return LinearAlgebraFormatter.formatMatrixText(this.grid, exact);
  }

  /**
   * Format matrix to LaTeX bmatrix
   */
  toLatex(exact = false) {
    return LinearAlgebraFormatter.formatMatrixLatex(this.grid, exact);
  }

  /**
   * JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      rows: this.rows,
      cols: this.cols,
      grid: this.grid
    };
  }

  // ==========================================================================
  // FACTORY METHODS
  // ==========================================================================

  /**
   * Create Matrix from 2D array
   */
  static from(grid, name = 'A') {
    return new Matrix(grid, name);
  }

  /**
   * Parse Matrix from text or array with validation envelope
   */
  static parse(raw, name = 'A') {
    const res = LinearAlgebraParser.parseMatrix(raw, name);
    if (!res.valid) return res;
    return {
      valid: true,
      matrix: new Matrix(res.grid, name),
      rows: res.rows,
      cols: res.cols
    };
  }

  /**
   * Identity Matrix I_n
   */
  static identity(n, name = 'I') {
    const size = Math.max(1, parseInt(n, 10));
    const grid = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => (r === c ? 1 : 0))
    );
    return new Matrix(grid, name);
  }

  /**
   * Zero Matrix 0_{m×n}
   */
  static zero(rows, cols, name = 'O') {
    const r = Math.max(1, parseInt(rows, 10));
    const c = Math.max(1, parseInt(cols, 10));
    const grid = Array.from({ length: r }, () => new Array(c).fill(0));
    return new Matrix(grid, name);
  }

  /**
   * Diagonal Matrix from array of diagonal entries
   */
  static diagonal(elements, name = 'D') {
    if (!Array.isArray(elements) || elements.length === 0) {
      throw new Error('Diagonal matrix elements must be a non-empty array.');
    }
    const n = elements.length;
    const grid = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => (r === c ? Number(elements[r]) : 0))
    );
    return new Matrix(grid, name);
  }

  /**
   * Random integer matrix
   */
  static random(rows, cols, min = -5, max = 5, name = 'R') {
    const r = Math.max(1, parseInt(rows, 10));
    const c = Math.max(1, parseInt(cols, 10));
    const grid = Array.from({ length: r }, () =>
      Array.from({ length: c }, () => Math.floor(Math.random() * (max - min + 1)) + min)
    );
    return new Matrix(grid, name);
  }
}
