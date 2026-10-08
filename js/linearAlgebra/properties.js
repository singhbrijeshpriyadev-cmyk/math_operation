/**
 * OG - Matrix Property Analyzer & Special Matrix Detector
 * Analyzes matrix structure, symmetries, and mathematical properties:
 * - Square, Zero, Identity, Diagonal, Scalar
 * - Upper Triangular, Lower Triangular
 * - Symmetric, Skew-Symmetric
 * - Idempotent, Involutory, Nilpotent, Orthogonal
 * Strict numerical tolerance (1e-10).
 *
 * ES6 Module
 */

import { Matrix } from './matrix.js';
import { MatrixOperationsEngine } from './matrixOperations.js';
import { LinearAlgebraValidator } from './validators.js';
import { LinearAlgebraFormatter } from './formatter.js';

export class MatrixPropertiesAnalyzer {
  static EPSILON = 1e-10;

  /**
   * Analyze all mathematical properties of a Matrix
   */
  static analyze(matrixA) {
    const rows = matrixA.rows;
    const cols = matrixA.cols;
    const isSquare = matrixA.isSquare();
    const eps = this.EPSILON;

    const properties = [];
    const flags = {
      isSquare,
      isZero: true,
      isIdentity: false,
      isDiagonal: false,
      isScalar: false,
      isUpperTriangular: false,
      isLowerTriangular: false,
      isSymmetric: false,
      isSkewSymmetric: false,
      isOrthogonal: false,
      isIdempotent: false,
      isInvolutory: false,
      isNilpotent: false
    };

    // Check Zero Matrix
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.abs(matrixA.get(r, c)) > eps) {
          flags.isZero = false;
          break;
        }
      }
      if (!flags.isZero) break;
    }
    if (flags.isZero) {
      properties.push({ name: 'Zero Matrix', desc: 'All entries are 0 (O_{m×n}).' });
    }

    if (isSquare) {
      // 1. Identity Matrix
      let isIdent = true;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const expected = r === c ? 1 : 0;
          if (Math.abs(matrixA.get(r, c) - expected) > eps) {
            isIdent = false;
            break;
          }
        }
        if (!isIdent) break;
      }
      flags.isIdentity = isIdent;
      if (isIdent) {
        properties.push({ name: 'Identity Matrix', desc: 'Diagonal entries are 1 and all off-diagonal entries are 0 (Iₙ).' });
      }

      // 2. Diagonal Matrix
      let isDiag = true;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r !== c && Math.abs(matrixA.get(r, c)) > eps) {
            isDiag = false;
            break;
          }
        }
        if (!isDiag) break;
      }
      flags.isDiagonal = isDiag;
      if (isDiag && !flags.isIdentity && !flags.isZero) {
        properties.push({ name: 'Diagonal Matrix', desc: 'All off-diagonal entries are zero.' });
      }

      // 3. Scalar Matrix (Diagonal with all diagonal entries identical)
      if (isDiag) {
        const d0 = matrixA.get(0, 0);
        let allSame = true;
        for (let i = 1; i < rows; i++) {
          if (Math.abs(matrixA.get(i, i) - d0) > eps) {
            allSame = false;
            break;
          }
        }
        flags.isScalar = allSame;
        if (allSame && !flags.isIdentity && !flags.isZero) {
          properties.push({ name: 'Scalar Matrix', desc: `Diagonal matrix where all diagonal entries equal ${d0}.` });
        }
      }

      // 4. Upper Triangular (all entries below diagonal are 0)
      let isUpper = true;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < r; c++) {
          if (Math.abs(matrixA.get(r, c)) > eps) {
            isUpper = false;
            break;
          }
        }
        if (!isUpper) break;
      }
      flags.isUpperTriangular = isUpper;
      if (isUpper && !flags.isDiagonal) {
        properties.push({ name: 'Upper Triangular', desc: 'All entries below the main diagonal are zero (aᵢⱼ = 0 for i > j).' });
      }

      // 5. Lower Triangular (all entries above diagonal are 0)
      let isLower = true;
      for (let r = 0; r < rows; r++) {
        for (let c = r + 1; c < cols; c++) {
          if (Math.abs(matrixA.get(r, c)) > eps) {
            isLower = false;
            break;
          }
        }
        if (!isLower) break;
      }
      flags.isLowerTriangular = isLower;
      if (isLower && !flags.isDiagonal) {
        properties.push({ name: 'Lower Triangular', desc: 'All entries above the main diagonal are zero (aᵢⱼ = 0 for i < j).' });
      }

      // 6. Symmetric (A = Aᵀ)
      let isSym = true;
      for (let r = 0; r < rows; r++) {
        for (let c = r + 1; c < cols; c++) {
          if (Math.abs(matrixA.get(r, c) - matrixA.get(c, r)) > eps) {
            isSym = false;
            break;
          }
        }
        if (!isSym) break;
      }
      flags.isSymmetric = isSym;
      if (isSym) {
        properties.push({ name: 'Symmetric Matrix', desc: 'A = Aᵀ (entries symmetric across main diagonal).' });
      }

      // 7. Skew-Symmetric (Aᵀ = -A)
      let isSkew = true;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === c && Math.abs(matrixA.get(r, c)) > eps) {
            isSkew = false; // Main diagonal must be 0
            break;
          }
          if (Math.abs(matrixA.get(r, c) + matrixA.get(c, r)) > eps) {
            isSkew = false;
            break;
          }
        }
        if (!isSkew) break;
      }
      flags.isSkewSymmetric = isSkew && !flags.isZero;
      if (flags.isSkewSymmetric) {
        properties.push({ name: 'Skew-Symmetric Matrix', desc: 'Aᵀ = -A (diagonal entries are 0 and aᵢⱼ = -aⱼᵢ).' });
      }

      // 8. Orthogonal (Aᵀ · A = I)
      const transRes = MatrixOperationsEngine.transpose(matrixA);
      const atA = MatrixOperationsEngine.multiply(Matrix.from(transRes.result.grid), matrixA);
      if (atA.success) {
        const prodMat = Matrix.from(atA.result.grid);
        flags.isOrthogonal = prodMat.equals(Matrix.identity(rows), eps);
        if (flags.isOrthogonal) {
          properties.push({ name: 'Orthogonal Matrix', desc: 'AᵀA = I (columns and rows form an orthonormal basis).' });
        }
      }

      // 9. Idempotent (A² = A)
      const a2Res = MatrixOperationsEngine.multiply(matrixA, matrixA);
      if (a2Res.success) {
        const a2Mat = Matrix.from(a2Res.result.grid);
        flags.isIdempotent = a2Mat.equals(matrixA, eps) && !flags.isIdentity && !flags.isZero;
        if (flags.isIdempotent) {
          properties.push({ name: 'Idempotent Matrix', desc: 'A² = A (projection operator).' });
        }

        // 10. Involutory (A² = I)
        flags.isInvolutory = a2Mat.equals(Matrix.identity(rows), eps) && !flags.isIdentity;
        if (flags.isInvolutory) {
          properties.push({ name: 'Involutory Matrix', desc: 'A² = I (A is its own inverse: A = A⁻¹).' });
        }
      }

      // 11. Nilpotent (Aᵏ = 0 for some k ≤ n)
      if (!flags.isZero && rows <= 5) {
        let curr = matrixA.clone();
        for (let k = 2; k <= rows; k++) {
          const powRes = MatrixOperationsEngine.multiply(curr, matrixA);
          if (powRes.success) {
            curr = Matrix.from(powRes.result.grid);
            if (curr.equals(Matrix.zero(rows, cols), eps)) {
              flags.isNilpotent = true;
              properties.push({ name: 'Nilpotent Matrix', desc: `A^${k} = 0 (Nilpotency index = ${k}).` });
              break;
            }
          }
        }
      }
    }

    // Calculate Trace if square
    let traceVal = null;
    if (isSquare) {
      const trRes = MatrixOperationsEngine.trace(matrixA);
      if (trRes.success) traceVal = trRes.result;
    }

    return {
      dimensions: `${rows} × ${cols}`,
      rows,
      cols,
      isSquare,
      trace: traceVal,
      flags,
      properties,
      summaryText: properties.length > 0 ? properties.map(p => p.name).join(', ') : 'General Matrix'
    };
  }
}
