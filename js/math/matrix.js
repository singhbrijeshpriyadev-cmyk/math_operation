/**
 * OG - Matrix & Determinant Mathematical Engine (Modules 16 & 17)
 * High-precision matrix operations:
 * - Addition, Subtraction, Multiplication, Scalar Multiplication
 * - Transpose, Trace, Rank (Gaussian REF)
 * - Minors, Cofactors, Adjoint
 * - Determinants (1x1, 2x2, 3x3, 4x4) with intermediate Laplace expansions
 * - Matrix Inverse with singularity checks (det != 0)
 *
 * For EVERY operation returns structured:
 * - Input matrices
 * - Formula
 * - Intermediate steps
 * - Final result matrix / scalar
 *
 * Architecture:
 * UI -> Module Controller -> MatrixMathEngine -> ResultFormatter -> UI
 */

import { ResultFormatter } from './formatter.js';

export class MatrixMathEngine {
  /**
   * Sanitizes and parses raw matrix input into clean 2D numerical array
   */
  static parseMatrix(raw, expectedRows, expectedCols, name = 'A') {
    if (!raw) {
      return { valid: false, error: `Matrix ${name} input is required.`, data: null, rows: 0, cols: 0 };
    }

    let grid = [];

    if (Array.isArray(raw)) {
      if (raw.length === 0 || !Array.isArray(raw[0])) {
        return { valid: false, error: `Matrix ${name} must be a 2D array.`, data: null, rows: 0, cols: 0 };
      }
      grid = raw.map(row => row.map(val => {
        const num = parseFloat(val);
        return isNaN(num) || !isFinite(num) ? 0 : num;
      }));
    } else if (typeof raw === 'string') {
      // Parse string format e.g. "1, 2; 3, 4" or newline separated
      const lines = raw.trim().split(/[\n;]+/);
      grid = lines.map(line => {
        return line.trim().split(/[,\s]+/).filter(Boolean).map(val => {
          const num = parseFloat(val);
          return isNaN(num) || !isFinite(num) ? 0 : num;
        });
      }).filter(r => r.length > 0);
    }

    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;

    // Verify row lengths consistency
    for (let i = 1; i < rows; i++) {
      if (grid[i].length !== cols) {
        return {
          valid: false,
          error: `Matrix ${name} has inconsistent column lengths (row 1 has ${cols} cols, row ${i + 1} has ${grid[i].length} cols).`,
          data: null,
          rows: 0,
          cols: 0
        };
      }
    }

    if (expectedRows && rows !== expectedRows) {
      return {
        valid: false,
        error: `Matrix ${name} expected ${expectedRows} rows, but received ${rows}.`,
        data: null,
        rows,
        cols
      };
    }

    if (expectedCols && cols !== expectedCols) {
      return {
        valid: false,
        error: `Matrix ${name} expected ${expectedCols} columns, but received ${cols}.`,
        data: null,
        rows,
        cols
      };
    }

    return {
      valid: true,
      data: grid,
      rows,
      cols,
      formatted: this.formatMatrixLatex(grid)
    };
  }

  /**
   * Formats 2D array into clean display string
   */
  static formatMatrixText(grid) {
    if (!grid || grid.length === 0) return '[]';
    return grid.map(row => `[${row.map(v => ResultFormatter.cleanNumber(v)).join(', ')}]`).join('\n');
  }

  static formatMatrixLatex(grid) {
    if (!grid || grid.length === 0) return '[ ]';
    const rows = grid.map(r => r.map(v => ResultFormatter.cleanNumber(v)).join('  '));
    return `[ ${rows.join(' ; ')} ]`;
  }

  // --------------------------------------------------------------------------
  // 1. MATRIX ADDITION: A + B
  // --------------------------------------------------------------------------
  static add(matAInput, matBInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    const pB = this.parseMatrix(matBInput, null, null, 'B');
    if (!pB.valid) return ResultFormatter.error(pB.error);

    if (pA.rows !== pB.rows || pA.cols !== pB.cols) {
      return ResultFormatter.error(
        `Incompatible dimensions for addition: Matrix A is ${pA.rows}×${pA.cols}, while Matrix B is ${pB.rows}×${pB.cols}. Matrices must have identical dimensions.`
      );
    }

    const rows = pA.rows;
    const cols = pA.cols;
    const result = [];
    const stepLines = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const sum = ResultFormatter.cleanNumber(pA.data[i][j] + pB.data[i][j]);
        row.push(sum);
        stepLines.push(`c₍${i + 1},${j + 1}₎ = a₍${i + 1},${j + 1}₎ + b₍${i + 1},${j + 1}₎ = ${pA.data[i][j]} + ${pB.data[i][j]} = ${sum}`);
      }
      result.push(row);
    }

    const formulaStr = '(A + B)ᵢⱼ = Aᵢⱼ + Bᵢⱼ';
    const steps = [
      `Input Matrix A (${rows}×${cols}): ${pA.formatted}`,
      `Input Matrix B (${rows}×${cols}): ${pB.formatted}`,
      `Formula: ${formulaStr}`,
      `Intermediate Steps:\n${stepLines.slice(0, 8).join('\n')}${stepLines.length > 8 ? '\n... (all entries added element-wise)' : ''}`,
      `Final Result Matrix (${rows}×${cols}):\n${this.formatMatrixText(result)}`
    ];

    return ResultFormatter.success(
      {
        rows,
        cols,
        data: result,
        formatted: this.formatMatrixLatex(result),
        matA: pA.data,
        matB: pB.data,
        operation: 'add'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 2. MATRIX SUBTRACTION: A - B
  // --------------------------------------------------------------------------
  static subtract(matAInput, matBInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    const pB = this.parseMatrix(matBInput, null, null, 'B');
    if (!pB.valid) return ResultFormatter.error(pB.error);

    if (pA.rows !== pB.rows || pA.cols !== pB.cols) {
      return ResultFormatter.error(
        `Incompatible dimensions for subtraction: Matrix A is ${pA.rows}×${pA.cols}, while Matrix B is ${pB.rows}×${pB.cols}. Matrices must have identical dimensions.`
      );
    }

    const rows = pA.rows;
    const cols = pA.cols;
    const result = [];
    const stepLines = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const diff = ResultFormatter.cleanNumber(pA.data[i][j] - pB.data[i][j]);
        row.push(diff);
        stepLines.push(`c₍${i + 1},${j + 1}₎ = a₍${i + 1},${j + 1}₎ - b₍${i + 1},${j + 1}₎ = ${pA.data[i][j]} - ${pB.data[i][j]} = ${diff}`);
      }
      result.push(row);
    }

    const formulaStr = '(A - B)ᵢⱼ = Aᵢⱼ - Bᵢⱼ';
    const steps = [
      `Input Matrix A (${rows}×${cols}): ${pA.formatted}`,
      `Input Matrix B (${rows}×${cols}): ${pB.formatted}`,
      `Formula: ${formulaStr}`,
      `Intermediate Steps:\n${stepLines.slice(0, 8).join('\n')}${stepLines.length > 8 ? '\n... (all entries subtracted element-wise)' : ''}`,
      `Final Result Matrix (${rows}×${cols}):\n${this.formatMatrixText(result)}`
    ];

    return ResultFormatter.success(
      {
        rows,
        cols,
        data: result,
        formatted: this.formatMatrixLatex(result),
        matA: pA.data,
        matB: pB.data,
        operation: 'subtract'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 3. MATRIX MULTIPLICATION: A × B
  // --------------------------------------------------------------------------
  static multiply(matAInput, matBInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    const pB = this.parseMatrix(matBInput, null, null, 'B');
    if (!pB.valid) return ResultFormatter.error(pB.error);

    if (pA.cols !== pB.rows) {
      return ResultFormatter.error(
        `Incompatible dimensions for multiplication: Columns of Matrix A (${pA.cols}) must equal Rows of Matrix B (${pB.rows}). Received ${pA.rows}×${pA.cols} and ${pB.rows}×${pB.cols}.`
      );
    }

    const m = pA.rows;
    const k = pA.cols; // equals pB.rows
    const n = pB.cols;
    const result = [];
    const stepLines = [];

    for (let i = 0; i < m; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        let sum = 0;
        const products = [];
        for (let p = 0; p < k; p++) {
          const valA = pA.data[i][p];
          const valB = pB.data[p][j];
          sum += valA * valB;
          products.push(`(${valA} × ${valB})`);
        }
        sum = ResultFormatter.cleanNumber(sum);
        row.push(sum);
        stepLines.push(`c₍${i + 1},${j + 1}₎ = row ${i + 1} · col ${j + 1} = ${products.join(' + ')} = ${sum}`);
      }
      result.push(row);
    }

    const formulaStr = '(AB)ᵢⱼ = ∑ₖ Aᵢₖ · Bₖⱼ';
    const steps = [
      `Input Matrix A (${m}×${k}): ${pA.formatted}`,
      `Input Matrix B (${k}×${n}): ${pB.formatted}`,
      `Compatibility Check: Columns of A (${k}) == Rows of B (${k}) [VALID]`,
      `Formula: ${formulaStr}`,
      `Intermediate Dot Products:\n${stepLines.slice(0, 9).join('\n')}${stepLines.length > 9 ? '\n... (all entry dot products evaluated)' : ''}`,
      `Final Result Matrix (${m}×${n}):\n${this.formatMatrixText(result)}`
    ];

    return ResultFormatter.success(
      {
        rows: m,
        cols: n,
        data: result,
        formatted: this.formatMatrixLatex(result),
        matA: pA.data,
        matB: pB.data,
        operation: 'multiply'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 4. SCALAR MULTIPLICATION: k · A
  // --------------------------------------------------------------------------
  static scalarMultiply(matAInput, scalarInput = 2) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    const k = parseFloat(scalarInput);
    if (isNaN(k) || !isFinite(k)) {
      return ResultFormatter.error(`Scalar value "${scalarInput}" must be a valid real number.`);
    }

    const rows = pA.rows;
    const cols = pA.cols;
    const result = pA.data.map(row => row.map(val => ResultFormatter.cleanNumber(val * k)));

    const formulaStr = '(k · A)ᵢⱼ = k × Aᵢⱼ';
    const steps = [
      `Input Matrix A (${rows}×${cols}): ${pA.formatted}`,
      `Scalar Factor: k = ${k}`,
      `Formula: ${formulaStr}`,
      `Intermediate Steps: Every entry multiplied by ${k}`,
      `Final Result Matrix (${rows}×${cols}):\n${this.formatMatrixText(result)}`
    ];

    return ResultFormatter.success(
      {
        rows,
        cols,
        scalar: k,
        data: result,
        formatted: this.formatMatrixLatex(result),
        operation: 'scalarMultiply'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 5. TRANSPOSE: Aᵀ
  // --------------------------------------------------------------------------
  static transpose(matAInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    const rows = pA.rows;
    const cols = pA.cols;
    const result = [];

    for (let j = 0; j < cols; j++) {
      const newRow = [];
      for (let i = 0; i < rows; i++) {
        newRow.push(pA.data[i][j]);
      }
      result.push(newRow);
    }

    const formulaStr = '(Aᵀ)ᵢⱼ = Aⱼᵢ (rows become columns)';
    const steps = [
      `Input Matrix A (${rows}×${cols}): ${pA.formatted}`,
      `Formula: ${formulaStr}`,
      `Intermediate Steps: Transformed ${rows} rows into ${cols} columns`,
      `Final Transposed Matrix (${cols}×${rows}):\n${this.formatMatrixText(result)}`
    ];

    return ResultFormatter.success(
      {
        rows: cols,
        cols: rows,
        data: result,
        formatted: this.formatMatrixLatex(result),
        operation: 'transpose'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 6. TRACE: tr(A)
  // --------------------------------------------------------------------------
  static trace(matAInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    if (pA.rows !== pA.cols) {
      return ResultFormatter.error(
        `Trace is only defined for square matrices. Received rectangular matrix ${pA.rows}×${pA.cols}.`
      );
    }

    const n = pA.rows;
    let sum = 0;
    const diagElements = [];

    for (let i = 0; i < n; i++) {
      const val = pA.data[i][i];
      sum += val;
      diagElements.push(val);
    }

    sum = ResultFormatter.cleanNumber(sum);
    const formulaStr = 'tr(A) = ∑ᵢ₌₁ⁿ aᵢᵢ';
    const steps = [
      `Input Square Matrix A (${n}×${n}): ${pA.formatted}`,
      `Formula: ${formulaStr}`,
      `Main Diagonal Elements: [${diagElements.join(', ')}]`,
      `Calculation: ${diagElements.join(' + ')} = ${sum}`,
      `Final Answer: tr(A) = ${sum}`
    ];

    return ResultFormatter.success(
      {
        n,
        trace: sum,
        diagonal: diagElements,
        formatted: String(sum),
        operation: 'trace'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 7. DETERMINANT: det(A) or |A| (1x1, 2x2, 3x3, 4x4)
  // --------------------------------------------------------------------------
  static determinant(matAInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    if (pA.rows !== pA.cols) {
      return ResultFormatter.error(
        `Determinant is only defined for square matrices. Received ${pA.rows}×${pA.cols}.`
      );
    }

    const n = pA.rows;
    const A = pA.data;

    let detVal = 0;
    let formulaStr = '';
    const stepLines = [];

    if (n === 1) {
      detVal = A[0][0];
      formulaStr = '|A| = a₁₁';
      stepLines.push(`Single element matrix: |[${detVal}]| = ${detVal}`);
    } else if (n === 2) {
      // 2x2: ad - bc
      const a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
      detVal = (a * d) - (b * c);
      formulaStr = '|A| = (a₁₁ · a₂₂) - (a₁₂ · a₂₁)';
      stepLines.push(`Cross multiplication: (${a} × ${d}) - (${b} × ${c}) = ${a * d} - ${b * c} = ${detVal}`);
    } else if (n === 3) {
      // 3x3 Laplace Expansion along Row 1
      formulaStr = '|A| = a₁₁ · M₁₁ - a₁₂ · M₁₂ + a₁₃ · M₁₃';
      for (let j = 0; j < 3; j++) {
        const sign = (j % 2 === 0) ? 1 : -1;
        const entry = A[0][j];
        const sub = this._submatrix(A, 0, j);
        const subDet = (sub[0][0] * sub[1][1]) - (sub[0][1] * sub[1][0]);
        const term = sign * entry * subDet;
        detVal += term;
        stepLines.push(
          `Cofactor C₁₍${j + 1}₎: ${sign > 0 ? '+' : '-'}(${entry}) × |[${sub[0][0]}, ${sub[0][1]}; ${sub[1][0]}, ${sub[1][1]}]| = ${sign > 0 ? '+' : '-'}(${entry}) × (${subDet}) = ${term}`
        );
      }
    } else if (n === 4) {
      // 4x4 Laplace expansion along Row 1
      formulaStr = '|A| = a₁₁·C₁₁ + a₁₂·C₁₂ + a₁₃·C₁₃ + a₁₄·C₁₄';
      for (let j = 0; j < 4; j++) {
        const sign = (j % 2 === 0) ? 1 : -1;
        const entry = A[0][j];
        if (entry === 0) {
          stepLines.push(`Entry a₁₍${j + 1}₎ = 0 ⟹ term = 0`);
          continue;
        }
        const sub = this._submatrix(A, 0, j);
        const subDetRes = this.determinant(sub);
        const term = sign * entry * subDetRes.result.determinant;
        detVal += term;
        stepLines.push(
          `Cofactor C₁₍${j + 1}₎: ${sign > 0 ? '+' : '-'}(${entry}) × det(3×3 minor) = ${sign > 0 ? '+' : '-'}(${entry}) × (${subDetRes.result.determinant}) = ${term}`
        );
      }
    } else {
      // n > 4: Gaussian elimination with row swaps
      return this._determinantGaussian(pA);
    }

    detVal = ResultFormatter.cleanNumber(detVal);
    const steps = [
      `Input Matrix A (${n}×${n}):\n${this.formatMatrixText(A)}`,
      `Formula: ${formulaStr}`,
      `Intermediate Cofactor / Minor Expansions:\n${stepLines.join('\n')}`,
      `Final Answer: det(A) = |A| = ${detVal}`
    ];

    return ResultFormatter.success(
      {
        n,
        determinant: detVal,
        formatted: String(detVal),
        isSingular: Math.abs(detVal) < 1e-12,
        operation: 'determinant'
      },
      steps,
      formulaStr
    );
  }

  // Helper: extracts minor submatrix omitting row r and col c
  static _submatrix(mat, omitRow, omitCol) {
    return mat
      .filter((_, i) => i !== omitRow)
      .map(row => row.filter((_, j) => j !== omitCol));
  }

  // --------------------------------------------------------------------------
  // 8. MINORS & COFACTOR MATRIX: C_ij = (-1)^(i+j) * M_ij
  // --------------------------------------------------------------------------
  static minorsAndCofactors(matAInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    if (pA.rows !== pA.cols) {
      return ResultFormatter.error(`Minors & Cofactors require a square matrix. Received ${pA.rows}×${pA.cols}.`);
    }

    const n = pA.rows;
    if (n < 2) {
      return ResultFormatter.error('Minors and cofactors require matrix of order at least 2×2.');
    }

    const A = pA.data;
    const minorMatrix = [];
    const cofactorMatrix = [];
    const stepLines = [];

    for (let i = 0; i < n; i++) {
      const minRow = [];
      const cofRow = [];
      for (let j = 0; j < n; j++) {
        const sub = this._submatrix(A, i, j);
        const subDet = this.determinant(sub).result.determinant;
        const sign = ((i + j) % 2 === 0) ? 1 : -1;
        const cof = ResultFormatter.cleanNumber(sign * subDet);

        minRow.push(subDet);
        cofRow.push(cof);
        stepLines.push(`M₍${i + 1},${j + 1}₎ = ${subDet} ⟹ C₍${i + 1},${j + 1}₎ = (-1)⁽${i + 1}+${j + 1}⁾ × ${subDet} = ${cof}`);
      }
      minorMatrix.push(minRow);
      cofactorMatrix.push(cofRow);
    }

    const formulaStr = 'Cᵢⱼ = (-1)ⁱ⁺ʲ · Mᵢⱼ where Mᵢⱼ = det(Minor Submatrix)';
    const steps = [
      `Input Square Matrix A (${n}×${n}):\n${this.formatMatrixText(A)}`,
      `Formula: ${formulaStr}`,
      `Intermediate Minor & Cofactor Calculations:\n${stepLines.slice(0, 9).join('\n')}${stepLines.length > 9 ? '\n... (all cofactors computed)' : ''}`,
      `Cofactor Matrix C:\n${this.formatMatrixText(cofactorMatrix)}`
    ];

    return ResultFormatter.success(
      {
        n,
        minorMatrix,
        cofactorMatrix,
        formatted: this.formatMatrixLatex(cofactorMatrix),
        operation: 'cofactor'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 9. ADJOINT MATRIX: adj(A) = Cᵀ
  // --------------------------------------------------------------------------
  static adjoint(matAInput) {
    const cofRes = this.minorsAndCofactors(matAInput);
    if (!cofRes.success) return cofRes;

    const n = cofRes.result.n;
    const cofMatrix = cofRes.result.cofactorMatrix;
    const adjMatrix = [];

    for (let j = 0; j < n; j++) {
      const row = [];
      for (let i = 0; i < n; i++) {
        row.push(cofMatrix[i][j]);
      }
      adjMatrix.push(row);
    }

    const formulaStr = 'adj(A) = Cᵀ = (Cofactor Matrix)ᵀ';
    const steps = [
      `Formula: ${formulaStr}`,
      `Computed Cofactor Matrix C:\n${this.formatMatrixText(cofMatrix)}`,
      `Transposed Cofactor Matrix:\n${this.formatMatrixText(adjMatrix)}`,
      `Final Adjoint Matrix adj(A):\n${this.formatMatrixText(adjMatrix)}`
    ];

    return ResultFormatter.success(
      {
        n,
        adjointMatrix: adjMatrix,
        cofactorMatrix: cofMatrix,
        data: adjMatrix,
        formatted: this.formatMatrixLatex(adjMatrix),
        operation: 'adjoint'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 10. MATRIX INVERSE: A⁻¹ = (1 / det(A)) · adj(A)
  // --------------------------------------------------------------------------
  static inverse(matAInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    if (pA.rows !== pA.cols) {
      return ResultFormatter.error(`Matrix must be square to have an inverse. Received ${pA.rows}×${pA.cols}.`);
    }

    const n = pA.rows;
    // 1x1 case
    if (n === 1) {
      const val = pA.data[0][0];
      if (val === 0) return ResultFormatter.error('Determinant = 0. Single element matrix [0] is not invertible.');
      const inv = ResultFormatter.cleanNumber(1 / val);
      return ResultFormatter.success(
        { n: 1, data: [[inv]], formatted: `[${inv}]`, determinant: val },
        [`det(A) = ${val} ≠ 0`, `A⁻¹ = [1 / ${val}] = [${inv}]`],
        'A⁻¹ = 1 / a₁₁'
      );
    }

    // Step 1: Check Determinant
    const detRes = this.determinant(pA.data);
    const det = detRes.result.determinant;

    if (Math.abs(det) < 1e-12) {
      return ResultFormatter.error(
        `Matrix is singular (determinant = 0). The inverse matrix A⁻¹ does not exist because division by zero is undefined.`
      );
    }

    // Step 2: Compute Adjoint
    const adjRes = this.adjoint(pA.data);
    const adj = adjRes.result.adjointMatrix;

    // Step 3: Divide each element of adj by det
    const invMatrix = [];
    const stepLines = [];

    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        const val = ResultFormatter.cleanNumber(adj[i][j] / det);
        row.push(val);
        stepLines.push(`a⁻¹₍${i + 1},${j + 1}₎ = (${adj[i][j]}) / ${det} = ${val}`);
      }
      invMatrix.push(row);
    }

    const formulaStr = 'A⁻¹ = (1 / det(A)) · adj(A)';
    const steps = [
      `Input Square Matrix A (${n}×${n}):\n${this.formatMatrixText(pA.data)}`,
      `1. Compute Determinant: det(A) = ${det} (Non-zero, matrix is INVERTIBLE)`,
      `2. Compute Adjoint adj(A):\n${this.formatMatrixText(adj)}`,
      `3. Apply Inverse Formula: ${formulaStr}`,
      `Intermediate Element Scaling:\n${stepLines.slice(0, 9).join('\n')}${stepLines.length > 9 ? '\n... (all entries scaled by 1/det)' : ''}`,
      `Final Inverse Matrix A⁻¹:\n${this.formatMatrixText(invMatrix)}`
    ];

    return ResultFormatter.success(
      {
        n,
        determinant: det,
        adjointMatrix: adj,
        data: invMatrix,
        formatted: this.formatMatrixLatex(invMatrix),
        operation: 'inverse'
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 11. RANK: rank(A) via Gaussian Elimination to Row Echelon Form
  // --------------------------------------------------------------------------
  static rank(matAInput) {
    const pA = this.parseMatrix(matAInput, null, null, 'A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    const m = pA.rows;
    const n = pA.cols;
    // Clone matrix
    const ref = pA.data.map(r => [...r]);
    const stepLines = [];

    let rank = 0;
    let lead = 0;

    for (let r = 0; r < m; r++) {
      if (lead >= n) break;

      // Find non-zero pivot
      let i = r;
      while (i < m && Math.abs(ref[i][lead]) < 1e-12) i++;

      if (i === m) {
        lead++;
        r--; // retry same row with next column
        continue;
      }

      // Swap rows if needed
      if (i !== r) {
        const temp = ref[i];
        ref[i] = ref[r];
        ref[r] = temp;
        stepLines.push(`Swapped Row ${r + 1} and Row ${i + 1}`);
      }

      const pivot = ref[r][lead];

      // Eliminate rows below
      for (let rowIdx = r + 1; rowIdx < m; rowIdx++) {
        const factor = ref[rowIdx][lead] / pivot;
        if (Math.abs(factor) > 1e-12) {
          for (let colIdx = lead; colIdx < n; colIdx++) {
            ref[rowIdx][colIdx] -= factor * ref[r][colIdx];
          }
          stepLines.push(`R₍${rowIdx + 1}₎ ➔ R₍${rowIdx + 1}₎ - (${ResultFormatter.cleanNumber(factor)}) · R₍${r + 1}₎`);
        }
      }

      lead++;
      rank++;
    }

    // Clean REF matrix
    const cleanedREF = ref.map(row => row.map(v => ResultFormatter.cleanNumber(v)));

    const formulaStr = 'rank(A) = Number of non-zero rows in Row Echelon Form (REF)';
    const steps = [
      `Input Matrix A (${m}×${n}):\n${this.formatMatrixText(pA.data)}`,
      `Formula: ${formulaStr}`,
      `Elementary Row Operations:\n${stepLines.length > 0 ? stepLines.join('\n') : 'Matrix already in Row Echelon Form'}`,
      `Row Echelon Form (REF):\n${this.formatMatrixText(cleanedREF)}`,
      `Final Answer: rank(A) = ${rank}`
    ];

    return ResultFormatter.success(
      {
        rows: m,
        cols: n,
        rank,
        refMatrix: cleanedREF,
        formatted: `rank = ${rank}`,
        operation: 'rank'
      },
      steps,
      formulaStr
    );
  }
}
