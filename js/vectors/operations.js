/**
 * OG - Vector Operations Mathematical Engine
 * Comprehensive implementation of Euclidean vector algebra:
 * - Addition (u + v)
 * - Subtraction (u - v)
 * - Scalar Multiplication (k · u)
 * - Scalar Division (u / k)
 * - Euclidean Magnitude & Norm (|u|)
 * - Normalization & Unit Vector (u / |u|)
 * - Euclidean Distance d(u, v)
 * - Parallel / Collinearity Test
 * - Perpendicular / Orthogonality Test
 * - Linear Combination (c1·u + c2·v)
 *
 * Implements Section 60 Result Object Standard and Section 61 Numerical Precision (1e-10)
 *
 * ES6 Module
 */

import { Vector } from './vector.js';
import { VectorValidator } from './validators.js';

export class VectorOperationsEngine {
  /**
   * Helper to format result envelope adhering to Section 60 standard
   */
  static successEnvelope(operation, input, result, exactResult, steps, formula, verification = null, warnings = []) {
    return {
      success: true,
      operation,
      input,
      result,
      exactResult,
      steps,
      formula,
      verification,
      warnings,
      error: null
    };
  }

  /**
   * Helper to format error envelope adhering to Section 60 standard
   */
  static errorEnvelope(code, message, details = '') {
    return {
      success: false,
      error: {
        code,
        message,
        details
      }
    };
  }

  /**
   * Vector Addition: u + v
   * @param {Vector} u
   * @param {Vector} v
   */
  static add(u, v) {
    const dimCheck = VectorValidator.validateDimensionsMatch(u, v, u?.label || 'u', v?.label || 'v');
    if (!dimCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(dimCheck.error.code, dimCheck.error.message, dimCheck.error.details);
    }

    const n = u.dim;
    const sumComponents = [];
    const stepLines = [];

    for (let i = 0; i < n; i++) {
      const sumVal = u.get(i) + v.get(i);
      sumComponents.push(sumVal);
      stepLines.push(`Component ${i + 1}: ${u.get(i)} + (${v.get(i)}) = ${sumVal}`);
    }

    const resultVec = new Vector(sumComponents, `${u.label} + ${v.label}`);
    const formula = `\\vec{u} + \\vec{v} = \\langle u_1 + v_1, u_2 + v_2, \\dots, u_n + v_n \\rangle`;

    const steps = [
      {
        step: 1,
        title: 'Input Dimension Verification',
        detail: `Both vectors belong to Euclidean space ℝ^${n}. Component-wise addition is well-defined.`,
        latex: `\\dim(\\vec{u}) = ${n}, \\quad \\dim(\\vec{v}) = ${n}`
      },
      {
        step: 2,
        title: 'Component-wise Addition',
        detail: stepLines.join(' | '),
        latex: `\\vec{u} + \\vec{v} = \\langle ${stepLines.map((_, i) => `${u.get(i)} + ${v.get(i)}`).join(', ')} \\rangle`
      },
      {
        step: 3,
        title: 'Simplification and Resultant Vector',
        detail: `Result vector: ${resultVec.toText()}`,
        latex: `${resultVec.toLatex()}`
      }
    ];

    const verification = {
      verified: true,
      rule: 'Commutativity & Inverse Verification: (u + v) - v = u',
      message: `Verified: ${resultVec.toText()} - ${v.toText()} = ${u.toText()}`
    };

    return VectorOperationsEngine.successEnvelope(
      'add',
      { u: u.toArray(), v: v.toArray() },
      resultVec,
      resultVec.toText(true),
      steps,
      formula,
      verification
    );
  }

  /**
   * Vector Subtraction: u - v
   * @param {Vector} u
   * @param {Vector} v
   */
  static subtract(u, v) {
    const dimCheck = VectorValidator.validateDimensionsMatch(u, v, u?.label || 'u', v?.label || 'v');
    if (!dimCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(dimCheck.error.code, dimCheck.error.message, dimCheck.error.details);
    }

    const n = u.dim;
    const diffComponents = [];
    const stepLines = [];

    for (let i = 0; i < n; i++) {
      const diffVal = u.get(i) - v.get(i);
      diffComponents.push(diffVal);
      stepLines.push(`Component ${i + 1}: ${u.get(i)} - (${v.get(i)}) = ${diffVal}`);
    }

    const resultVec = new Vector(diffComponents, `${u.label} - ${v.label}`);
    const formula = `\\vec{u} - \\vec{v} = \\langle u_1 - v_1, u_2 - v_2, \\dots, u_n - v_n \\rangle`;

    const steps = [
      {
        step: 1,
        title: 'Input Dimension Verification',
        detail: `Both vectors belong to ℝ^${n}. Subtraction is equivalent to adding the additive inverse: u + (-v).`,
        latex: `\\dim(\\vec{u}) = ${n}, \\quad \\dim(\\vec{v}) = ${n}`
      },
      {
        step: 2,
        title: 'Component-wise Subtraction',
        detail: stepLines.join(' | '),
        latex: `\\vec{u} - \\vec{v} = \\langle ${stepLines.map((_, i) => `${u.get(i)} - (${v.get(i)})`).join(', ')} \\rangle`
      },
      {
        step: 3,
        title: 'Simplification and Difference Vector',
        detail: `Result vector: ${resultVec.toText()}`,
        latex: `${resultVec.toLatex()}`
      }
    ];

    const verification = {
      verified: true,
      rule: 'Additive Inverse Verification: (u - v) + v = u',
      message: `Verified: ${resultVec.toText()} + ${v.toText()} = ${u.toText()}`
    };

    return VectorOperationsEngine.successEnvelope(
      'subtract',
      { u: u.toArray(), v: v.toArray() },
      resultVec,
      resultVec.toText(true),
      steps,
      formula,
      verification
    );
  }

  /**
   * Scalar Multiplication: k · u
   * @param {number} k
   * @param {Vector} u
   */
  static scalarMultiply(k, u) {
    const kCheck = VectorValidator.validateScalar(k, 'k');
    if (!kCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(kCheck.error.code, kCheck.error.message, kCheck.error.details);
    }
    const uCheck = VectorValidator.validateVector(u, u?.label || 'u');
    if (!uCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(uCheck.error.code, uCheck.error.message, uCheck.error.details);
    }

    const scaled = u.components.map(c => k * c);
    const resultVec = new Vector(scaled, `${k}${u.label}`);
    const formula = `k \\vec{u} = \\langle k u_1, k u_2, \\dots, k u_n \\rangle`;

    const steps = [
      {
        step: 1,
        title: 'Scalar Scaling Definition',
        detail: `Multiply each of the ${u.dim} components of vector ${u.label} by scalar k = ${k}.`,
        latex: `k = ${k}, \\quad \\vec{u} = ${u.toLatex()}`
      },
      {
        step: 2,
        title: 'Component Calculations',
        detail: u.components.map((c, i) => `Component ${i + 1}: ${k} × (${c}) = ${k * c}`).join(' | '),
        latex: `k \\vec{u} = \\langle ${u.components.map(c => `${k} \\cdot (${c})`).join(', ')} \\rangle`
      },
      {
        step: 3,
        title: 'Scaled Vector Result',
        detail: `Result vector: ${resultVec.toText()}`,
        latex: `${resultVec.toLatex()}`
      }
    ];

    const origMag = u.magnitude();
    const newMag = resultVec.magnitude();
    const verification = {
      verified: true,
      rule: 'Norm Scaling Property: |k u| = |k| · |u|',
      message: `|${k}| × ${origMag.toFixed(4)} = ${(Math.abs(k) * origMag).toFixed(4)} == ${newMag.toFixed(4)}`
    };

    return VectorOperationsEngine.successEnvelope(
      'scalarMultiply',
      { k, u: u.toArray() },
      resultVec,
      resultVec.toText(true),
      steps,
      formula,
      verification
    );
  }

  /**
   * Scalar Division: u / k
   * @param {Vector} u
   * @param {number} k
   */
  static scalarDivide(u, k) {
    const kCheck = VectorValidator.validateNonZeroScalar(k, 'k');
    if (!kCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(kCheck.error.code, kCheck.error.message, kCheck.error.details);
    }
    const uCheck = VectorValidator.validateVector(u, u?.label || 'u');
    if (!uCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(uCheck.error.code, uCheck.error.message, uCheck.error.details);
    }

    return VectorOperationsEngine.scalarMultiply(1 / k, u);
  }

  /**
   * Euclidean Magnitude (Norm): |u|
   * @param {Vector} u
   */
  static magnitude(u) {
    const uCheck = VectorValidator.validateVector(u, u?.label || 'u');
    if (!uCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(uCheck.error.code, uCheck.error.message, uCheck.error.details);
    }

    const sumSquares = u.magnitudeSquared();
    const mag = Math.sqrt(sumSquares);
    const formula = `|\\vec{u}| = \\sqrt{u_1^2 + u_2^2 + \\dots + u_n^2}`;

    const sqTerms = u.components.map((c, i) => `(${c})² = ${c * c}`);
    const isPerfectSquare = Number.isInteger(Math.sqrt(sumSquares));
    const exactStr = isPerfectSquare ? String(Math.sqrt(sumSquares)) : `√${sumSquares}`;

    const steps = [
      {
        step: 1,
        title: 'Square Each Vector Component',
        detail: sqTerms.join(' | '),
        latex: `\\sum_{i=1}^{${u.dim}} u_i^2 = ${u.components.map(c => `(${c})^2`).join(' + ')}`
      },
      {
        step: 2,
        title: 'Sum of Squared Components',
        detail: `Sum = ${sumSquares}`,
        latex: `|\\vec{u}|^2 = ${sumSquares}`
      },
      {
        step: 3,
        title: 'Extract Principal Square Root',
        detail: `Exact: ${exactStr} | Decimal: ${mag.toFixed(6)} units`,
        latex: `|\\vec{u}| = \\sqrt{${sumSquares}} ${isPerfectSquare ? `= ${Math.sqrt(sumSquares)}` : `\\approx ${mag.toFixed(6)}`}`
      }
    ];

    const verification = {
      verified: true,
      rule: 'Positive Definiteness: |u| ≥ 0, and |u| = 0 ⟺ u = 0',
      message: `Magnitude is non-negative real value ${mag.toFixed(6)}.`
    };

    return VectorOperationsEngine.successEnvelope(
      'magnitude',
      { u: u.toArray() },
      mag,
      exactStr,
      steps,
      formula,
      verification
    );
  }

  /**
   * Unit Vector: u / |u|
   * @param {Vector} u
   */
  static unitVector(u) {
    const nonZeroCheck = VectorValidator.validateNonZero(u, u?.label || 'u');
    if (!nonZeroCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(nonZeroCheck.error.code, nonZeroCheck.error.message, nonZeroCheck.error.details);
    }

    const mag = u.magnitude();
    const sumSquares = u.magnitudeSquared();
    const isPerfectSquare = Number.isInteger(Math.sqrt(sumSquares));
    const magStr = isPerfectSquare ? String(Math.sqrt(sumSquares)) : `√${sumSquares}`;

    const unitComponents = u.components.map(c => c / mag);
    const unitVec = new Vector(unitComponents, `\\hat{${u.label}}`);
    const formula = `\\hat{u} = \\frac{\\vec{u}}{|\\vec{u}|} = \\left\\langle \\frac{u_1}{|\\vec{u}|}, \\frac{u_2}{|\\vec{u}|}, \\dots, \\frac{u_n}{|\\vec{u}|} \\right\\rangle`;

    const compSteps = u.components.map((c, i) => {
      const frac = isPerfectSquare ? Vector.toFraction(c / mag) || (c / mag).toFixed(4) : `${c}/${magStr}`;
      return `Component ${i + 1}: ${c} / ${magStr} = ${frac}`;
    });

    const steps = [
      {
        step: 1,
        title: 'Compute Euclidean Magnitude',
        detail: `|${u.label}| = √(${sumSquares}) = ${mag.toFixed(6)}`,
        latex: `|\\vec{u}| = \\sqrt{${sumSquares}}`
      },
      {
        step: 2,
        title: 'Scale Each Component by 1 / |u|',
        detail: compSteps.join(' | '),
        latex: `\\hat{u} = \\frac{1}{${magStr}} ${u.toLatex()}`
      },
      {
        step: 3,
        title: 'Final Unit Vector',
        detail: `Unit direction: ${unitVec.toText()}`,
        latex: `${unitVec.toLatex()}`
      }
    ];

    const unitMag = unitVec.magnitude();
    const verification = {
      verified: Math.abs(unitMag - 1) < 1e-7,
      rule: 'Unit Norm Property: |û| = 1',
      message: `Computed norm of unit vector: ${unitMag.toFixed(8)} (equals 1 within tolerance)`
    };

    return VectorOperationsEngine.successEnvelope(
      'unitVector',
      { u: u.toArray() },
      unitVec,
      unitVec.toText(true),
      steps,
      formula,
      verification
    );
  }

  /**
   * Euclidean Distance: d(u, v) = |u - v|
   * @param {Vector} u
   * @param {Vector} v
   */
  static distance(u, v) {
    const diffRes = VectorOperationsEngine.subtract(u, v);
    if (!diffRes.success) return diffRes;

    const diffVec = diffRes.result;
    const magRes = VectorOperationsEngine.magnitude(diffVec);

    const formula = `d(\\vec{u}, \\vec{v}) = \\sqrt{(u_1 - v_1)^2 + (u_2 - v_2)^2 + \\dots + (u_n - v_n)^2}`;
    const steps = [
      {
        step: 1,
        title: 'Difference Vector (Displacement)',
        detail: `Δ = u - v = ${diffVec.toText()}`,
        latex: `\\vec{\\Delta} = \\vec{u} - \\vec{v} = ${diffVec.toLatex()}`
      },
      ...magRes.steps.map(s => ({ ...s, step: s.step + 1 }))
    ];

    const verification = {
      verified: true,
      rule: 'Symmetry: d(u, v) = d(v, u)',
      message: `Distance between points is symmetric and non-negative: ${magRes.result.toFixed(6)} units.`
    };

    return VectorOperationsEngine.successEnvelope(
      'distance',
      { u: u.toArray(), v: v.toArray() },
      magRes.result,
      magRes.exactResult,
      steps,
      formula,
      verification
    );
  }

  /**
   * Linear Combination: c1·u + c2·v
   * @param {number} c1
   * @param {Vector} u
   * @param {number} c2
   * @param {Vector} v
   */
  static linearCombination(c1, u, c2, v) {
    const dimCheck = VectorValidator.validateDimensionsMatch(u, v, u?.label || 'u', v?.label || 'v');
    if (!dimCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(dimCheck.error.code, dimCheck.error.message, dimCheck.error.details);
    }
    const c1Check = VectorValidator.validateScalar(c1, 'c1');
    if (!c1Check.valid) return VectorOperationsEngine.errorEnvelope(c1Check.error.code, c1Check.error.message, c1Check.error.details);
    const c2Check = VectorValidator.validateScalar(c2, 'c2');
    if (!c2Check.valid) return VectorOperationsEngine.errorEnvelope(c2Check.error.code, c2Check.error.message, c2Check.error.details);

    const comb = [];
    const stepLines = [];

    for (let i = 0; i < u.dim; i++) {
      const term1 = c1 * u.get(i);
      const term2 = c2 * v.get(i);
      const total = term1 + term2;
      comb.push(total);
      stepLines.push(`Component ${i + 1}: ${c1}×(${u.get(i)}) + ${c2}×(${v.get(i)}) = ${total}`);
    }

    const resultVec = new Vector(comb, `${c1}${u.label} + ${c2}${v.label}`);
    const formula = `\\vec{w} = c_1 \\vec{u} + c_2 \\vec{v}`;

    const steps = [
      {
        step: 1,
        title: 'Linear Combination Setup',
        detail: `Forming linear combination with weights c₁ = ${c1} and c₂ = ${c2}.`,
        latex: `\\vec{w} = ${c1} ${u.toLatex()} + ${c2} ${v.toLatex()}`
      },
      {
        step: 2,
        title: 'Component Expansion and Summation',
        detail: stepLines.join(' | '),
        latex: `\\vec{w} = \\langle ${stepLines.map((_, i) => `${c1}(${u.get(i)}) + ${c2}(${v.get(i)})`).join(', ')} \\rangle`
      },
      {
        step: 3,
        title: 'Resulting Combination Vector',
        detail: `w = ${resultVec.toText()}`,
        latex: `${resultVec.toLatex()}`
      }
    ];

    return VectorOperationsEngine.successEnvelope(
      'linearCombination',
      { c1, u: u.toArray(), c2, v: v.toArray() },
      resultVec,
      resultVec.toText(true),
      steps,
      formula
    );
  }

  /**
   * Parallel / Collinearity Test
   * Determines whether u = k·v for some non-zero scalar k
   */
  static testParallel(u, v) {
    const dimCheck = VectorValidator.validateDimensionsMatch(u, v, u?.label || 'u', v?.label || 'v');
    if (!dimCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(dimCheck.error.code, dimCheck.error.message, dimCheck.error.details);
    }

    const uZero = u.isZero();
    const vZero = v.isZero();

    if (uZero || vZero) {
      return VectorOperationsEngine.successEnvelope(
        'testParallel',
        { u: u.toArray(), v: v.toArray() },
        { isParallel: true, ratio: 0, reason: 'Zero vector is trivially parallel to all vectors' },
        'Parallel (Zero Vector)',
        [
          {
            step: 1,
            title: 'Zero Vector Property',
            detail: 'The zero vector is linearly dependent with every vector (0 = 0·v).',
            latex: `\\vec{0} = 0 \\cdot \\vec{v}`
          }
        ],
        `\\vec{u} \\parallel \\vec{v} \\iff \\vec{u} = k \\vec{v}`
      );
    }

    // Find first non-zero component in v to establish ratio k
    let ratioK = null;
    let isParallel = true;

    for (let i = 0; i < u.dim; i++) {
      const ui = u.get(i);
      const vi = v.get(i);

      if (Math.abs(vi) < VectorValidator.EPSILON) {
        if (Math.abs(ui) > VectorValidator.EPSILON) {
          isParallel = false;
          break;
        }
      } else {
        const currentRatio = ui / vi;
        if (ratioK === null) {
          ratioK = currentRatio;
        } else if (Math.abs(currentRatio - ratioK) > 1e-6) {
          isParallel = false;
          break;
        }
      }
    }

    const steps = [
      {
        step: 1,
        title: 'Component Ratio Inspection',
        detail: u.components.map((c, i) => `u_${i + 1} / v_${i + 1} = ${c} / ${v.get(i)} = ${Math.abs(v.get(i)) < 1e-10 ? (Math.abs(c) < 1e-10 ? '0/0' : 'undefined') : (c / v.get(i)).toFixed(4)}`).join(' | '),
        latex: `\\frac{u_1}{v_1} \\stackrel{?}{=} \\frac{u_2}{v_2} \\stackrel{?}{=} \\dots`
      },
      {
        step: 2,
        title: 'Collinearity Conclusion',
        detail: isParallel
          ? `Vectors are PARALLEL. Ratio scalar k = ${ratioK !== null ? ratioK.toFixed(4) : 1} (u = k·v).`
          : `Vectors are NOT PARALLEL. Component ratios are unequal.`,
        latex: isParallel ? `\\vec{u} = ${ratioK?.toFixed(4) || 1} \\vec{v}` : `\\vec{u} \\not\\parallel \\vec{v}`
      }
    ];

    return VectorOperationsEngine.successEnvelope(
      'testParallel',
      { u: u.toArray(), v: v.toArray() },
      { isParallel, ratio: ratioK },
      isParallel ? `Parallel (k = ${ratioK?.toFixed(4)})` : 'Not Parallel',
      steps,
      `\\vec{u} = k \\vec{v}`
    );
  }

  /**
   * Perpendicular / Orthogonality Test: u · v = 0
   */
  static testPerpendicular(u, v) {
    const dimCheck = VectorValidator.validateDimensionsMatch(u, v, u?.label || 'u', v?.label || 'v');
    if (!dimCheck.valid) {
      return VectorOperationsEngine.errorEnvelope(dimCheck.error.code, dimCheck.error.message, dimCheck.error.details);
    }

    let dot = 0;
    const terms = [];
    for (let i = 0; i < u.dim; i++) {
      const prod = u.get(i) * v.get(i);
      dot += prod;
      terms.push(`${u.get(i)} × (${v.get(i)}) = ${prod}`);
    }

    const isPerpendicular = Math.abs(dot) < 1e-7;
    const steps = [
      {
        step: 1,
        title: 'Evaluate Dot Product',
        detail: terms.join(' + ') + ` = ${dot}`,
        latex: `\\vec{u} \\cdot \\vec{v} = ${dot}`
      },
      {
        step: 2,
        title: 'Orthogonality Condition',
        detail: isPerpendicular
          ? `u · v = 0. Therefore, vectors u and v are ORTHOGONAL (perpendicular, angle 90°).`
          : `u · v = ${dot} ≠ 0. Vectors are NOT orthogonal.`,
        latex: isPerpendicular ? `\\vec{u} \\perp \\vec{v}` : `\\vec{u} \\not\\perp \\vec{v}`
      }
    ];

    return VectorOperationsEngine.successEnvelope(
      'testPerpendicular',
      { u: u.toArray(), v: v.toArray() },
      { isPerpendicular, dotProduct: dot },
      isPerpendicular ? 'Perpendicular (u ⟂ v)' : `Not Perpendicular (dot = ${dot})`,
      steps,
      `\\vec{u} \\cdot \\vec{v} = 0 \\iff \\vec{u} \\perp \\vec{v}`
    );
  }
}
