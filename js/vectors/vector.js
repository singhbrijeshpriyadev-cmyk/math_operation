/**
 * OG - Vector Class Data Model
 * Represents n-dimensional Euclidean vectors with specialized 2D & 3D ergonomics
 * Supports exact rational fractions, LaTeX formatting, and immutable updates
 *
 * ES6 Module
 */

import { VectorValidator } from './validators.js';

export class Vector {
  /**
   * @param {Array<number>} components - Array of real numbers
   * @param {string} label - Vector symbol (e.g. 'u', 'v', 'w')
   */
  constructor(components, label = 'v') {
    if (!Array.isArray(components) || components.length === 0) {
      throw new Error('Vector requires a non-empty array of numerical components.');
    }
    // Clean trailing precision artifacts within epsilon
    this.components = components.map(c => {
      const num = Number(c);
      return Math.abs(num) < VectorValidator.EPSILON ? 0 : num;
    });
    this.label = label || 'v';
    this.dim = this.components.length;
  }

  // Ergonomic coordinate accessors
  get x() { return this.components[0] ?? 0; }
  get y() { return this.components[1] ?? 0; }
  get z() { return this.components[2] ?? 0; }

  /**
   * Component at index (0-based)
   */
  get(i) {
    return this.components[i] ?? 0;
  }

  /**
   * Returns a new Vector with component updated at index
   */
  set(index, value) {
    if (index < 0 || index >= this.dim) {
      throw new Error(`Index ${index} out of bounds for vector of dimension ${this.dim}`);
    }
    const next = [...this.components];
    next[index] = Math.abs(value) < VectorValidator.EPSILON ? 0 : Number(value);
    return new Vector(next, this.label);
  }

  /**
   * Magnitude (Euclidean Euclidean Norm |v|)
   */
  magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }

  /**
   * Sum of squares: |v|² = v · v
   */
  magnitudeSquared() {
    return this.components.reduce((sum, c) => sum + c * c, 0);
  }

  /**
   * Checks if vector is mathematically zero within tolerance
   */
  isZero(tol = VectorValidator.EPSILON) {
    return this.magnitude() < tol;
  }

  /**
   * Normalizes vector to unit vector: v / |v|
   */
  normalize(tol = VectorValidator.EPSILON) {
    const mag = this.magnitude();
    if (mag < tol) {
      throw new Error(`Cannot normalize zero vector ${this.label}. Direction is undefined.`);
    }
    const unitComponents = this.components.map(c => c / mag);
    return new Vector(unitComponents, `\\hat{${this.label}}`);
  }

  /**
   * Equality check within tolerance
   */
  equals(other, tol = VectorValidator.EPSILON) {
    if (!other || this.dim !== other.dim) return false;
    for (let i = 0; i < this.dim; i++) {
      if (Math.abs(this.components[i] - other.components[i]) > tol) {
        return false;
      }
    }
    return true;
  }

  /**
   * Clone vector
   */
  clone(newLabel = null) {
    return new Vector([...this.components], newLabel || this.label);
  }

  /**
   * Export to JavaScript array
   */
  toArray() {
    return [...this.components];
  }

  /**
   * Export to {x, y, z} object for 2D/3D interop
   */
  toObject() {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    };
  }

  /**
   * 2D Polar angle in radians and degrees (if dim >= 2)
   */
  toAngle2D() {
    const rad = Math.atan2(this.y, this.x);
    const deg = (rad * 180) / Math.PI;
    return {
      radians: rad,
      degrees: deg >= 0 ? deg : deg + 360
    };
  }

  /**
   * Plain text representation: ⟨x, y, z⟩
   */
  toText(exact = false) {
    const formatted = this.components.map(c => Vector.formatNumber(c, exact));
    return `⟨${formatted.join(', ')}⟩`;
  }

  /**
   * Column vector representation: [x, y, z]ᵀ
   */
  toBracketText() {
    return `[${this.components.join(', ')}]`;
  }

  /**
   * Standard unit vector component notation: xi + yj + zk
   */
  toComponentNotation(exact = false) {
    const basisLetters = ['i', 'j', 'k', 'e₄', 'e₅', 'e₆'];
    const parts = [];

    for (let i = 0; i < this.dim; i++) {
      const val = this.components[i];
      if (Math.abs(val) < VectorValidator.EPSILON) continue;

      const formattedVal = Vector.formatNumber(Math.abs(val), exact);
      const sign = val < 0 ? ' - ' : (parts.length > 0 ? ' + ' : '');
      const unit = `\\hat{${basisLetters[i] || 'e_' + (i + 1)}}`;

      if (Math.abs(val - 1) < VectorValidator.EPSILON) {
        parts.push(`${sign}${unit}`);
      } else if (Math.abs(val - (-1)) < VectorValidator.EPSILON) {
        parts.push(` - ${unit}`);
      } else {
        parts.push(`${sign}${formattedVal}${unit}`);
      }
    }

    return parts.length > 0 ? parts.join('') : '0';
  }

  /**
   * LaTeX Column Matrix representation: \begin{pmatrix} ... \end{pmatrix}
   */
  toLatex(exact = false) {
    const rows = this.components.map(c => Vector.formatNumber(c, exact)).join(' \\\\ ');
    return `\\begin{pmatrix} ${rows} \\end{pmatrix}`;
  }

  /**
   * LaTeX angle bracket representation: \langle x, y, z \rangle
   */
  toLatexAngle(exact = false) {
    const elements = this.components.map(c => Vector.formatNumber(c, exact)).join(', ');
    return `\\langle ${elements} \\rangle`;
  }

  /**
   * Format number as exact fraction if applicable, or rounded decimal
   */
  static formatNumber(val, exact = true, precision = 6) {
    if (Math.abs(val) < VectorValidator.EPSILON) return '0';
    if (Number.isInteger(val)) return String(val);

    if (exact) {
      const frac = Vector.toFraction(val);
      if (frac) return frac;
    }

    const rounded = Number(val.toFixed(precision));
    return String(rounded);
  }

  /**
   * Converts floating point number to rational fraction string
   */
  static toFraction(val, maxDenominator = 1000) {
    if (Number.isInteger(val)) return String(val);

    const sign = val < 0 ? '-' : '';
    const absVal = Math.abs(val);

    let bestNum = 1;
    let bestDen = 1;
    let bestError = Math.abs(absVal - 1);

    for (let den = 1; den <= maxDenominator; den++) {
      const num = Math.round(absVal * den);
      const error = Math.abs(absVal - num / den);
      if (error < 1e-7) {
        return `${sign}${num}/${den}`;
      }
      if (error < bestError) {
        bestError = error;
        bestNum = num;
        bestDen = den;
      }
    }

    if (bestError < 1e-4) {
      return `${sign}${bestNum}/${bestDen}`;
    }
    return null;
  }

  // ==========================================
  // FACTORY METHODS
  // ==========================================

  /**
   * Create Vector from array or {x, y, z} object
   */
  static from(input, label = 'v') {
    if (input instanceof Vector) {
      return input.clone(label);
    }
    if (Array.isArray(input)) {
      return new Vector(input, label);
    }
    if (typeof input === 'object' && input !== null) {
      if (input.components && Array.isArray(input.components)) {
        return new Vector(input.components, label || input.label);
      }
      if ('x' in input && 'y' in input) {
        const arr = [input.x, input.y];
        if ('z' in input && input.z !== undefined) {
          arr.push(input.z);
        }
        return new Vector(arr, label);
      }
    }
    throw new Error('Unsupported vector input format. Expected array or {x, y, z} coordinate object.');
  }

  /**
   * Zero vector in ℝⁿ
   */
  static zero(dim = 3, label = '0') {
    return new Vector(new Array(dim).fill(0), label);
  }

  /**
   * Standard basis vector e_i in ℝⁿ
   */
  static basis(dim = 3, index = 0, label = null) {
    const arr = new Array(dim).fill(0);
    arr[index] = 1;
    const basisLabel = label || (dim === 3 ? ['i', 'j', 'k'][index] || `e_${index + 1}` : `e_${index + 1}`);
    return new Vector(arr, basisLabel);
  }

  /**
   * Random integer vector with components in [min, max]
   */
  static random(dim = 3, min = -5, max = 5, label = 'v') {
    const arr = [];
    for (let i = 0; i < dim; i++) {
      arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return new Vector(arr, label);
  }

  /**
   * Parses string e.g. "[1, 2, 3]", "<1, 2, 3>", or "1, 2, 3"
   */
  static parse(str, label = 'v') {
    if (typeof str !== 'string') return null;
    const cleaned = str.replace(/[\[\]\<\>\(\)]/g, ' ').trim();
    const parts = cleaned.split(/[\s,;]+/).filter(Boolean);
    if (!parts.length) return null;
    const nums = parts.map(p => Number(p));
    if (nums.some(n => !Number.isFinite(n))) return null;
    return new Vector(nums, label);
  }
}
