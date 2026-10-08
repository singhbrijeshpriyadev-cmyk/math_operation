/**
 * OG - Module 17: Determinants Controller
 * Coordinates pipeline: UI -> DeterminantsController -> MatrixMathEngine -> ResultFormatter -> UI
 * ES6 Module
 */

import { BaseModuleController } from '../../math/controller.js';
import { MatrixMathEngine } from '../../math/matrix.js';
import { store } from '../../state.js';

export const DETERMINANT_PRESETS = {
  det2: {
    name: '2×2 Determinant',
    desc: '|[3, 8; 4, 6]| = (18 - 32) = -14',
    order: 2,
    mat: [[3, 8], [4, 6]]
  },
  det3: {
    name: '3×3 Standard Laplace',
    desc: '|[1, 2, 3; 0, 4, 5; 1, 0, 6]|',
    order: 3,
    mat: [[1, 2, 3], [0, 4, 5], [1, 0, 6]]
  },
  det3Singular: {
    name: '3×3 Zero Determinant',
    desc: 'Linearly dependent rows (det = 0)',
    order: 3,
    mat: [[1, 2, 3], [2, 4, 6], [7, 8, 9]]
  },
  det4Triangular: {
    name: '4×4 Upper Triangular',
    desc: 'Product of diagonal entries',
    order: 4,
    mat: [
      [2, 3, 1, 5],
      [0, 4, 2, 1],
      [0, 0, 3, 2],
      [0, 0, 0, 5]
    ]
  }
};

export class DeterminantsController extends BaseModuleController {
  constructor() {
    super('determinants');

    this.moduleState = {
      order: 3, // 2 | 3 | 4
      mat: [
        [1, 2, 3],
        [0, 4, 5],
        [1, 0, 6]
      ],
      // Results
      latestResult: null,
      lastError: null
    };

    this.calculateCurrent();
  }

  getModuleState() {
    return { ...this.moduleState };
  }

  setOrder(order) {
    const n = Math.min(Math.max(Number(order) || 3, 2), 4);
    this.moduleState.order = n;
    this.moduleState.mat = this._resizeSquareGrid(this.moduleState.mat, n);
    this.calculateCurrent();
  }

  setCell(r, c, val) {
    const num = parseFloat(val);
    const cleanVal = isNaN(num) || !isFinite(num) ? 0 : num;
    if (this.moduleState.mat[r]) {
      this.moduleState.mat[r][c] = cleanVal;
    }
  }

  calculateCurrent() {
    try {
      this.moduleState.lastError = null;
      const res = MatrixMathEngine.determinant(this.moduleState.mat);

      if (!res.success) {
        this.moduleState.latestResult = null;
        this.moduleState.lastError = res.error;
        this.notify(this.getModuleState());
        return res;
      }

      this.moduleState.latestResult = res;

      // History
      store.addHistoryItem(
        `Determinant |A| (${this.moduleState.order}×${this.moduleState.order})`,
        res.result.formatted,
        'Determinants'
      );

      this.notify(this.getModuleState());
      return res;
    } catch (err) {
      console.error('DeterminantsController error:', err);
      this.moduleState.lastError = err.message || 'Determinant evaluation error';
      this.notify(this.getModuleState());
      return { success: false, error: this.moduleState.lastError };
    }
  }

  loadPreset(presetKey) {
    const preset = DETERMINANT_PRESETS[presetKey];
    if (!preset) return;

    this.moduleState.order = preset.order;
    this.moduleState.mat = preset.mat.map(r => [...r]);
    return this.calculateCurrent();
  }

  _resizeSquareGrid(oldGrid, n) {
    const newGrid = [];
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) {
        if (oldGrid && oldGrid[r] && oldGrid[r][c] !== undefined) {
          row.push(oldGrid[r][c]);
        } else {
          row.push(r === c ? 1 : 0);
        }
      }
      newGrid.push(row);
    }
    return newGrid;
  }
}

export const determinantsController = new DeterminantsController();
