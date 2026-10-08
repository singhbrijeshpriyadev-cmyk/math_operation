/**
 * OG - Matrix Operations Engine
 * Performs all core matrix operations with step-by-step mathematical explanations:
 * - Addition: A + B
 * - Subtraction: A - B
 * - Scalar multiplication: k · A
 * - Matrix multiplication: A × B (with dot-product intermediate steps)
 * - Hadamard multiplication: A ∘ B
 * - Transpose: Aᵀ
 * - Conjugate transpose: Aᴴ
 * - Matrix power: Aᵏ
 * - Trace: tr(A)
 *
 * ES6 Module
 */

import { Matrix } from './matrix.js';
import { LinearAlgebraValidator } from './validators.js';
import { LinearAlgebraFormatter } from './formatter.js';

export class MatrixOperationsEngine {
  /**
   * Matrix Addition: C = A + B
   */
  static add(matrixA, matrixB) {
    const val = LinearAlgebraValidator.validateSameDimensions(
      matrixA.rows, matrixA.cols,
      matrixB.rows, matrixB.cols,
      'Addition'
    );
    if (!val.valid) return LinearAlgebraFormatter.error(val.error);

    const rows = matrixA.rows;
    const cols = matrixA.cols;
    const grid = [];
    const stepLines = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const aVal = matrixA.get(r, c);
        const bVal = matrixB.get(r, c);
        const sum = aVal + bVal;
        row.push(sum);
        if (rows <= 4 && cols <= 4) {
          stepLines.push(`c₍${r + 1},${c + 1}₎ = a₍${r + 1},${c + 1}₎ + b₍${r + 1},${c + 1}₎ = ${aVal} + ${bVal} = ${sum}`);
        }
      }
      grid.push(row);
    }

    const resultMatrix = new Matrix(grid, 'C');
    const formulaStr = 'C = A + B  ⟹  cᵢⱼ = aᵢⱼ + bᵢⱼ';

    const steps = [
      `1. Dimension check: Both Matrix A (${rows}×${cols}) and Matrix B (${rows}×${cols}) have identical dimensions.`,
      `2. Formula applied: ${formulaStr}`,
      `3. Element-wise additions:\n   ` + (stepLines.length > 0 ? stepLines.slice(0, 12).join('\n   ') : 'Elements computed element-wise across all rows and columns.'),
      `4. Resulting Matrix C (${rows}×${cols}):\n${resultMatrix.toText()}`
    ];

    return LinearAlgebraFormatter.success({
      operation: 'addition',
      input: { matrixA: matrixA.toJSON(), matrixB: matrixB.toJSON() },
      result: resultMatrix.toJSON(),
      exactResult: resultMatrix.toText(true),
      steps,
      formula: formulaStr,
      verification: 'A + B = B + A (Commutative property satisfied)'
    });
  }

  /**
   * Matrix Subtraction: C = A - B
   */
  static subtract(matrixA, matrixB) {
    const val = LinearAlgebraValidator.validateSameDimensions(
      matrixA.rows, matrixA.cols,
      matrixB.rows, matrixB.cols,
      'Subtraction'
    );
    if (!val.valid) return LinearAlgebraFormatter.error(val.error);

    const rows = matrixA.rows;
    const cols = matrixA.cols;
    const grid = [];
    const stepLines = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const aVal = matrixA.get(r, c);
        const bVal = matrixB.get(r, c);
        const diff = aVal - bVal;
        row.push(diff);
        if (rows <= 4 && cols <= 4) {
          stepLines.push(`c₍${r + 1},${c + 1}₎ = a₍${r + 1},${c + 1}₎ - b₍${r + 1},${c + 1}₎ = ${aVal} - ${bVal} = ${diff}`);
        }
      }
      grid.push(row);
    }

    const resultMatrix = new Matrix(grid, 'C');
    const formulaStr = 'C = A - B  ⟹  cᵢⱼ = aᵢⱼ - bᵢⱼ';

    const steps = [
      `1. Dimension check: Both matrices have identical dimensions (${rows}×${cols}).`,
      `2. Formula applied: ${formulaStr}`,
      `3. Element-wise subtractions:\n   ` + (stepLines.length > 0 ? stepLines.slice(0, 12).join('\n   ') : 'Elements subtracted element-wise.'),
      `4. Resulting Matrix C (${rows}×${cols}):\n${resultMatrix.toText()}`
    ];

    return LinearAlgebraFormatter.success({
      operation: 'subtraction',
      input: { matrixA: matrixA.toJSON(), matrixB: matrixB.toJSON() },
      result: resultMatrix.toJSON(),
      exactResult: resultMatrix.toText(true),
      steps,
      formula: formulaStr,
      verification: 'A - B = A + (-1)·B'
    });
  }

  /**
   * Scalar Multiplication: C = k · A
   */
  static scalarMultiply(matrixA, scalar) {
    const val = LinearAlgebraValidator.validateScalar(scalar, 'k');
    if (!val.valid) return LinearAlgebraFormatter.error(val.error);

    const k = val.value;
    const rows = matrixA.rows;
    const cols = matrixA.cols;
    const grid = matrixA.grid.map(row => row.map(v => v * k));
    const resultMatrix = new Matrix(grid, 'C');
    const formulaStr = `C = k · A  ⟹  cᵢⱼ = ${k} · aᵢⱼ`;

    const steps = [
      `1. Given scalar k = ${k} and Matrix A (${rows}×${cols}).`,
      `2. Formula applied: ${formulaStr}`,
      `3. Multiplying every entry in Matrix A by ${k}.`,
      `4. Resulting Matrix C (${rows}×${cols}):\n${resultMatrix.toText()}`
    ];

    return LinearAlgebraFormatter.success({
      operation: 'scalar_multiplication',
      input: { matrixA: matrixA.toJSON(), scalar: k },
      result: resultMatrix.toJSON(),
      exactResult: resultMatrix.toText(true),
      steps,
      formula: formulaStr
    });
  }

  /**
   * Matrix Multiplication: C = A × B
   */
  static multiply(matrixA, matrixB) {
    const val = LinearAlgebraValidator.validateMultiplicationDimensions(
      matrixA.rows, matrixA.cols,
      matrixB.rows, matrixB.cols
    );
    if (!val.valid) return LinearAlgebraFormatter.error(val.error);

    const m = matrixA.rows;
    const kDim = matrixA.cols; // inner dimension
    const p = matrixB.cols;

    const grid = [];
    const stepDetails = [];

    for (let r = 0; r < m; r++) {
      const row = [];
      for (let c = 0; c < p; c++) {
        let sum = 0;
        const products = [];
        for (let k = 0; k < kDim; k++) {
          const aVal = matrixA.get(r, k);
          const bVal = matrixB.get(k, c);
          const prod = aVal * bVal;
          sum += prod;
          products.push(`(${aVal} × ${bVal})`);
        }
        row.push(sum);
        if (m <= 3 && p <= 3) {
          stepDetails.push(`c₍${r + 1},${c + 1}₎ = row ${r + 1}(A) · col ${c + 1}(B) = ${products.join(' + ')} = ${sum}`);
        }
      }
      grid.push(row);
    }

    const resultMatrix = new Matrix(grid, 'C');
    const formulaStr = `C₍ₘ×ₚ₎ = A₍ₘ×ₖ₎ × B₍ₖ×ₚ₎  ⟹  cᵢⱼ = ∑ₖ aᵢₖ · bₖⱼ`;

    const steps = [
      `1. Compatibility Check: Matrix A is ${m}×${kDim} and Matrix B is ${matrixB.rows}×${p}. Columns of A (${kDim}) match rows of B (${matrixB.rows}). Result dimension is ${m}×${p}.`,
      `2. Formula: ${formulaStr}`,
      `3. Dot product row-by-column evaluations:\n   ` + (stepDetails.length > 0 ? stepDetails.slice(0, 9).join('\n   ') : 'Inner products evaluated across all rows and columns.'),
      `4. Product Matrix C (${m}×${p}):\n${resultMatrix.toText()}`
    ];

    return LinearAlgebraFormatter.success({
      operation: 'multiplication',
      input: { matrixA: matrixA.toJSON(), matrixB: matrixB.toJSON() },
      result: resultMatrix.toJSON(),
      exactResult: resultMatrix.toText(true),
      steps,
      formula: formulaStr
    });
  }

  /**
   * Hadamard (Element-wise) Multiplication: C = A ∘ B
   */
  static hadamardMultiply(matrixA, matrixB) {
    const val = LinearAlgebraValidator.validateSameDimensions(
      matrixA.rows, matrixA.cols,
      matrixB.rows, matrixB.cols,
      'Hadamard multiplication'
    );
    if (!val.valid) return LinearAlgebraFormatter.error(val.error);

    const rows = matrixA.rows;
    const cols = matrixA.cols;
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(matrixA.get(r, c) * matrixB.get(r, c));
      }
      grid.push(row);
    }

    const resultMatrix = new Matrix(grid, 'C');
    const formulaStr = 'C = A ∘ B  ⟹  cᵢⱼ = aᵢⱼ · bᵢⱼ';

    return LinearAlgebraFormatter.success({
      operation: 'hadamard_multiplication',
      input: { matrixA: matrixA.toJSON(), matrixB: matrixB.toJSON() },
      result: resultMatrix.toJSON(),
      exactResult: resultMatrix.toText(true),
      steps: [
        `1. Dimensions match: ${rows}×${cols}.`,
        `2. Element-wise product formula: ${formulaStr}`,
        `3. Result:\n${resultMatrix.toText()}`
      ],
      formula: formulaStr
    });
  }

  /**
   * Matrix Transpose: C = Aᵀ
   */
  static transpose(matrixA) {
    const rows = matrixA.rows;
    const cols = matrixA.cols;
    const grid = Array.from({ length: cols }, (_, c) =>
      Array.from({ length: rows }, (_, r) => matrixA.get(r, c))
    );

    const resultMatrix = new Matrix(grid, `${matrixA.name}ᵀ`);
    const formulaStr = 'Aᵀ  ⟹  (Aᵀ)ᵢⱼ = aⱼᵢ';

    const steps = [
      `1. Original Matrix A has dimensions ${rows} × ${cols}.`,
      `2. Transpose operation interchanges rows and columns: row i becomes column i.`,
      `3. Resulting Transpose Matrix Aᵀ has dimensions ${cols} × ${rows}:\n${resultMatrix.toText()}`
    ];

    return LinearAlgebraFormatter.success({
      operation: 'transpose',
      input: { matrixA: matrixA.toJSON() },
      result: resultMatrix.toJSON(),
      exactResult: resultMatrix.toText(true),
      steps,
      formula: formulaStr,
      verification: '(Aᵀ)ᵀ = A (Double transpose returns original matrix)'
    });
  }

  /**
   * Conjugate Transpose: Aᴴ
   */
  static conjugateTranspose(matrixA) {
    // For real matrices, Aᴴ === Aᵀ
    const tRes = this.transpose(matrixA);
    tRes.operation = 'conjugate_transpose';
    tRes.formula = 'Aᴴ = (A*)ᵀ (For real matrices, Aᴴ = Aᵀ)';
    tRes.steps.push('4. Since all entries are real numbers, the complex conjugate is identical to the entry itself.');
    return tRes;
  }

  /**
   * Matrix Power: Aᵏ
   */
  static power(matrixA, power) {
    const squareVal = LinearAlgebraValidator.validateSquare(matrixA.rows, matrixA.cols, matrixA.name, 'Matrix Power');
    if (!squareVal.valid) return LinearAlgebraFormatter.error(squareVal.error);

    const powVal = LinearAlgebraValidator.validatePower(power);
    if (!powVal.valid) return LinearAlgebraFormatter.error(powVal.error);

    const k = powVal.power;
    const n = matrixA.rows;

    if (k === 0) {
      const identityMatrix = Matrix.identity(n, 'I');
      return LinearAlgebraFormatter.success({
        operation: 'matrix_power',
        input: { matrixA: matrixA.toJSON(), power: 0 },
        result: identityMatrix.toJSON(),
        exactResult: identityMatrix.toText(true),
        steps: [
          `1. Any non-zero square matrix raised to power 0 equals the Identity Matrix I (${n}×${n}).`,
          `2. Result:\n${identityMatrix.toText()}`
        ],
        formula: 'A⁰ = I'
      });
    }

    if (k === 1) {
      return LinearAlgebraFormatter.success({
        operation: 'matrix_power',
        input: { matrixA: matrixA.toJSON(), power: 1 },
        result: matrixA.toJSON(),
        exactResult: matrixA.toText(true),
        steps: [`1. Matrix power A¹ equals Matrix A itself.`],
        formula: 'A¹ = A'
      });
    }

    // Repeated multiplication
    let current = matrixA.clone();
    for (let p = 2; p <= k; p++) {
      const multRes = this.multiply(current, matrixA);
      if (!multRes.success) return multRes;
      current = Matrix.from(multRes.result.grid, `${matrixA.name}^${p}`);
    }

    const formulaStr = `Aᵏ = A × A × ... × A (${k} times)`;
    const steps = [
      `1. Matrix A (${n}×${n}) is square.`,
      `2. Formula: ${formulaStr}`,
      `3. Successively computed powers from A² up to A^${k}.`,
      `4. Final Result Matrix A^${k}:\n${current.toText()}`
    ];

    return LinearAlgebraFormatter.success({
      operation: 'matrix_power',
      input: { matrixA: matrixA.toJSON(), power: k },
      result: current.toJSON(),
      exactResult: current.toText(true),
      steps,
      formula: formulaStr
    });
  }

  /**
   * Matrix Trace: tr(A) = ∑ aᵢᵢ
   */
  static trace(matrixA) {
    const squareVal = LinearAlgebraValidator.validateSquare(matrixA.rows, matrixA.cols, matrixA.name, 'Trace');
    if (!squareVal.valid) return LinearAlgebraFormatter.error(squareVal.error);

    const n = matrixA.rows;
    let sum = 0;
    const diagEntries = [];

    for (let i = 0; i < n; i++) {
      const val = matrixA.get(i, i);
      diagEntries.push(val);
      sum += val;
    }

    const formulaStr = 'tr(A) = ∑ᵢ₌₁ⁿ aᵢᵢ';
    const cSum = LinearAlgebraFormatter.cleanNumber(sum);

    const steps = [
      `1. Matrix A (${n}×${n}) is square.`,
      `2. Formula: ${formulaStr}`,
      `3. Diagonal entries: [${diagEntries.join(', ')}]`,
      `4. Sum of diagonal entries: ${diagEntries.join(' + ')} = ${cSum}`
    ];

    return LinearAlgebraFormatter.success({
      operation: 'trace',
      input: { matrixA: matrixA.toJSON() },
      result: cSum,
      exactResult: LinearAlgebraFormatter.toExactFraction(sum),
      steps,
      formula: formulaStr,
      verification: 'tr(A) = tr(Aᵀ)'
    });
  }
}
