/**
 * OG - Module 16: Matrices Controller
 * Coordinates pipeline: UI -> MatricesController -> MatrixMathEngine -> ResultFormatter -> UI
 * ES6 Module
 */

import { BaseModuleController } from '../../math/controller.js';
import { MatrixMathEngine } from '../../math/matrix.js';
import { store } from '../../state.js';

export const MATRIX_PRESETS = {
  inv2: {
    name: '2×2 Invertible',
    desc: 'det = 10 ≠ 0, standard test',
    rowsA: 2, colsA: 2,
    matA: [[4, 7], [2, 6]],
    op: 'inverse'
  },
  sing2: {
    name: '2×2 Singular (det=0)',
    desc: 'Linearly dependent rows [2, 4] and [1, 2]',
    rowsA: 2, colsA: 2,
    matA: [[2, 4], [1, 2]],
    op: 'determinant'
  },
  std3: {
    name: '3×3 Standard',
    desc: 'det = 1, test for adjoint and inverse',
    rowsA: 3, colsA: 3,
    matA: [[1, 2, 3], [0, 1, 4], [5, 6, 0]],
    op: 'inverse'
  },
  mul23x32: {
    name: '2×3 × 3×2 Multiplication',
    desc: 'Compatible rectangular matrix product',
    rowsA: 2, colsA: 3,
    matA: [[1, 2, 3], [4, 5, 6]],
    rowsB: 3, colsB: 2,
    matB: [[7, 8], [9, 1], [2, 3]],
    op: 'multiply'
  },
  rank3: {
    name: '3×3 Rank Test',
    desc: 'Matrix with rank 2',
    rowsA: 3, colsA: 3,
    matA: [[1, 2, 3], [2, 4, 6], [1, 1, 1]],
    op: 'rank'
  },
  id4: {
    name: '4×4 Identity',
    desc: 'Trace = 4, det = 1',
    rowsA: 4, colsA: 4,
    matA: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ],
    op: 'determinant'
  }
};

export class MatricesController extends BaseModuleController {
  constructor() {
    super('matrices');

    this.moduleState = {
      activeOp: 'inverse', // 'add' | 'subtract' | 'multiply' | 'scalar' | 'transpose' | 'determinant' | 'inverse' | 'rank' | 'trace' | 'adjoint' | 'cofactor'
      // Matrix A dimensions & data
      rowsA: 2,
      colsA: 2,
      matA: [[4, 7], [2, 6]],
      // Matrix B dimensions & data (for binary operations)
      rowsB: 2,
      colsB: 2,
      matB: [[1, 2], [3, 4]],
      // Scalar factor
      scalarK: 2,
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

  setActiveOp(op) {
    this.moduleState.activeOp = op;
    this.calculateCurrent();
  }

  setMatrixSize(target, rows, cols) {
    if (target === 'A') {
      this.moduleState.rowsA = rows;
      this.moduleState.colsA = cols;
      this.moduleState.matA = this._resizeGrid(this.moduleState.matA, rows, cols);
    } else {
      this.moduleState.rowsB = rows;
      this.moduleState.colsB = cols;
      this.moduleState.matB = this._resizeGrid(this.moduleState.matB, rows, cols);
    }
    this.calculateCurrent();
  }

  setCell(target, r, c, val) {
    const num = parseFloat(val);
    const cleanVal = isNaN(num) || !isFinite(num) ? 0 : num;
    if (target === 'A') {
      if (this.moduleState.matA[r]) this.moduleState.matA[r][c] = cleanVal;
    } else {
      if (this.moduleState.matB[r]) this.moduleState.matB[r][c] = cleanVal;
    }
  }

  setScalar(k) {
    this.moduleState.scalarK = parseFloat(k) || 0;
  }

  calculateCurrent() {
    try {
      this.moduleState.lastError = null;
      let res = null;

      switch (this.moduleState.activeOp) {
        case 'add':
          res = MatrixMathEngine.add(this.moduleState.matA, this.moduleState.matB);
          break;
        case 'subtract':
          res = MatrixMathEngine.subtract(this.moduleState.matA, this.moduleState.matB);
          break;
        case 'multiply':
          res = MatrixMathEngine.multiply(this.moduleState.matA, this.moduleState.matB);
          break;
        case 'scalar':
          res = MatrixMathEngine.scalarMultiply(this.moduleState.matA, this.moduleState.scalarK);
          break;
        case 'transpose':
          res = MatrixMathEngine.transpose(this.moduleState.matA);
          break;
        case 'determinant':
          res = MatrixMathEngine.determinant(this.moduleState.matA);
          break;
        case 'inverse':
          res = MatrixMathEngine.inverse(this.moduleState.matA);
          break;
        case 'rank':
          res = MatrixMathEngine.rank(this.moduleState.matA);
          break;
        case 'trace':
          res = MatrixMathEngine.trace(this.moduleState.matA);
          break;
        case 'adjoint':
          res = MatrixMathEngine.adjoint(this.moduleState.matA);
          break;
        case 'cofactor':
          res = MatrixMathEngine.minorsAndCofactors(this.moduleState.matA);
          break;
        default:
          res = MatrixMathEngine.inverse(this.moduleState.matA);
          break;
      }

      if (!res.success) {
        this.moduleState.latestResult = null;
        this.moduleState.lastError = res.error;
        this.notify(this.getModuleState());
        return res;
      }

      this.moduleState.latestResult = res;

      // Platform history recording
      const opName = this.moduleState.activeOp.toUpperCase();
      store.addHistoryItem(
        `Matrix ${opName} on ${this.moduleState.rowsA}×${this.moduleState.colsA}`,
        res.result.formatted,
        'Matrices'
      );

      this.notify(this.getModuleState());
      return res;
    } catch (err) {
      console.error('MatricesController error:', err);
      this.moduleState.lastError = err.message || 'Matrix calculation error';
      this.notify(this.getModuleState());
      return { success: false, error: this.moduleState.lastError };
    }
  }

  loadPreset(presetKey) {
    const preset = MATRIX_PRESETS[presetKey];
    if (!preset) return;

    this.moduleState.activeOp = preset.op;
    this.moduleState.rowsA = preset.rowsA;
    this.moduleState.colsA = preset.colsA;
    this.moduleState.matA = preset.matA.map(r => [...r]);

    if (preset.matB) {
      this.moduleState.rowsB = preset.rowsB;
      this.moduleState.colsB = preset.colsB;
      this.moduleState.matB = preset.matB.map(r => [...r]);
    }

    return this.calculateCurrent();
  }

  _resizeGrid(oldGrid, newRows, newCols) {
    const newGrid = [];
    for (let r = 0; r < newRows; r++) {
      const row = [];
      for (let c = 0; c < newCols; c++) {
        if (oldGrid && oldGrid[r] && oldGrid[r][c] !== undefined) {
          row.push(oldGrid[r][c]);
        } else {
          row.push(r === c ? 1 : 0); // Default to identity style
        }
      }
      newGrid.push(row);
    }
    return newGrid;
  }
}

export const matricesController = new MatricesController();
