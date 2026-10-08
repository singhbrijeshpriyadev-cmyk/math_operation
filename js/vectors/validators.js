/**
 * OG - Vectors & Optimization: Validators
 * Strictly enforces mathematical constraints and input integrity
 * Uses configured epsilon tolerance (1e-10)
 *
 * ES6 Module
 */

export class VectorValidator {
  static EPSILON = 1e-10;

  /**
   * Validates whether a value is a finite number
   */
  static isFiniteNumber(val) {
    return typeof val === 'number' && Number.isFinite(val);
  }

  /**
   * Zero detection within epsilon tolerance
   */
  static isZero(val, tol = VectorValidator.EPSILON) {
    return Math.abs(val) < tol;
  }

  /**
   * Validate a Vector instance or raw array
   */
  static validateVector(v, name = 'vector') {
    if (!v) {
      return {
        valid: false,
        error: {
          code: 'NULL_VECTOR',
          message: `The parameter "${name}" cannot be null or undefined.`,
          details: 'Provide a valid vector with 2, 3, or n finite numerical components.'
        }
      };
    }

    const components = Array.isArray(v) ? v : (v.components || (typeof v.toArray === 'function' ? v.toArray() : null));

    if (!Array.isArray(components) || components.length === 0) {
      return {
        valid: false,
        error: {
          code: 'INVALID_VECTOR_COMPONENTS',
          message: `Vector "${name}" does not contain a valid array of numerical components.`,
          details: 'A vector must consist of an ordered list of at least one real number.'
        }
      };
    }

    for (let i = 0; i < components.length; i++) {
      if (!VectorValidator.isFiniteNumber(components[i])) {
        return {
          valid: false,
          error: {
            code: 'NON_NUMERIC_COMPONENT',
            message: `Component at index ${i + 1} of vector "${name}" is not a finite number.`,
            details: `Received: ${components[i]}. All vector components must be real numbers.`
          }
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validates dimensional equality between two vectors
   */
  static validateDimensionsMatch(u, v, nameU = 'Vector u', nameV = 'Vector v') {
    const validU = VectorValidator.validateVector(u, nameU);
    if (!validU.valid) return validU;

    const validV = VectorValidator.validateVector(v, nameV);
    if (!validV.valid) return validV;

    const dimU = u.dim || (u.components ? u.components.length : u.length);
    const dimV = v.dim || (v.components ? v.components.length : v.length);

    if (dimU !== dimV) {
      return {
        valid: false,
        error: {
          code: 'DIMENSION_MISMATCH',
          message: `Vector operation is undefined between ${nameU} (dimension ${dimU}) and ${nameV} (dimension ${dimV}).`,
          details: `Component-wise vector operations require vectors to belong to the same Euclidean space ℝⁿ. Found ℝ^${dimU} and ℝ^${dimV}.`
        }
      };
    }

    return { valid: true };
  }

  /**
   * Validates that vector is non-zero (required for normalization, direction cosines, projection reference)
   */
  static validateNonZero(v, name = 'vector', tol = VectorValidator.EPSILON) {
    const valid = VectorValidator.validateVector(v, name);
    if (!valid.valid) return valid;

    const magSq = typeof v.magnitudeSquared === 'function'
      ? v.magnitudeSquared()
      : (v.components || v).reduce((sum, c) => sum + c * c, 0);

    if (magSq < tol * tol) {
      return {
        valid: false,
        error: {
          code: 'ZERO_VECTOR_UNDEFINED',
          message: `Operation is mathematically undefined for the zero vector (${name} = 0).`,
          details: 'Cannot normalize a zero vector or project onto a zero vector because direction is undefined and division by magnitude |v| = 0 is impossible.'
        }
      };
    }

    return { valid: true };
  }

  /**
   * Validates that a scalar is a finite real number
   */
  static validateScalar(k, name = 'scalar') {
    if (!VectorValidator.isFiniteNumber(k)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_SCALAR',
          message: `Scalar value "${name}" must be a finite real number.`,
          details: `Received: ${k}. Ensure the scalar multiplier is defined and finite.`
        }
      };
    }
    return { valid: true };
  }

  /**
   * Validates that scalar is non-zero for scalar division
   */
  static validateNonZeroScalar(k, name = 'scalar', tol = VectorValidator.EPSILON) {
    const valid = VectorValidator.validateScalar(k, name);
    if (!valid.valid) return valid;

    if (Math.abs(k) < tol) {
      return {
        valid: false,
        error: {
          code: 'DIVISION_BY_ZERO',
          message: `Scalar division by zero is undefined (${name} = 0).`,
          details: 'Cannot divide vector components by scalar k = 0.'
        }
      };
    }

    return { valid: true };
  }

  /**
   * Validates 3D vector requirement (for cross product, scalar triple product, etc.)
   */
  static validate3D(v, name = 'vector') {
    const valid = VectorValidator.validateVector(v, name);
    if (!valid.valid) return valid;

    const dim = v.dim || (v.components ? v.components.length : v.length);
    if (dim !== 3) {
      return {
        valid: false,
        error: {
          code: 'REQUIRE_3D_VECTOR',
          message: `Operation strictly requires 3-dimensional vectors. "${name}" has dimension ${dim}.`,
          details: `Cross products and triple products are defined specifically in 3D Euclidean space ℝ³. Received ℝ^${dim}.`
        }
      };
    }

    return { valid: true };
  }

  /**
   * Validates 2D or 3D requirement (for geometric line/plane operations)
   */
  static validate2DOr3D(v, name = 'vector') {
    const valid = VectorValidator.validateVector(v, name);
    if (!valid.valid) return valid;

    const dim = v.dim || (v.components ? v.components.length : v.length);
    if (dim !== 2 && dim !== 3) {
      return {
        valid: false,
        error: {
          code: 'REQUIRE_2D_OR_3D_VECTOR',
          message: `Geometric operation requires 2D or 3D vectors. "${name}" has dimension ${dim}.`,
          details: `Received ℝ^${dim}. Only ℝ² (plane) and ℝ³ (space) support this geometric representation.`
        }
      };
    }

    return { valid: true };
  }
}
