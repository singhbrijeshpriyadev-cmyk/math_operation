/**
 * OG - Trigonometric Mathematical Engine
 * Comprehensive calculations for Basic & Inverse Trigonometry, Angle Conversions,
 * Exact Standard Angles, Trigonometric Equations, and Mathematical Proof Steps.
 * ES6 Module
 *
 * Architecture:
 * UI -> Module Controller -> TrigonometryMathEngine -> ResultFormatter -> UI
 */

import { ResultFormatter } from './formatter.js';

export class TrigonometryMathEngine {
  /**
   * Angle normalization & parsing
   * Supports: "30", "30°", "30 deg", "pi/6", "π/4", "2*pi/3", "-45"
   */
  static parseAngle(input, defaultMode = 'DEG') {
    if (input === null || input === undefined) {
      return { valid: false, value: 0, mode: defaultMode, radians: 0, degrees: 0, error: 'Angle input is required.' };
    }

    let str = String(input).trim().toLowerCase();
    if (!str) {
      return { valid: false, value: 0, mode: defaultMode, radians: 0, degrees: 0, error: 'Angle cannot be empty.' };
    }

    let detectedMode = defaultMode;
    if (str.includes('deg') || str.includes('°')) {
      detectedMode = 'DEG';
      str = str.replace(/deg|°/g, '').trim();
    } else if (str.includes('rad')) {
      detectedMode = 'RAD';
      str = str.replace(/rad/g, '').trim();
    }

    // Handle pi or π expressions (e.g. "pi/6", "2*pi/3", "3pi/2", "-pi")
    let numericValue = null;
    const hasPi = str.includes('pi') || str.includes('π');

    if (hasPi) {
      detectedMode = 'RAD'; // Expressions with π are fundamentally in radians
      let expr = str.replace(/π/g, 'pi');
      // Replace instances like "2pi" with "2*pi"
      expr = expr.replace(/(\d)\s*pi/g, '$1*pi');
      expr = expr.replace(/pi\s*(\d)/g, 'pi*$1');

      try {
        // Safe evaluation of simple rational pi multiples e.g. "pi/6", "2*pi/3"
        numericValue = this._evalPiExpression(expr);
      } catch (e) {
        return { valid: false, value: 0, mode: detectedMode, radians: 0, degrees: 0, error: `Invalid π angle expression: ${str}` };
      }
    } else {
      const num = parseFloat(str);
      if (isNaN(num) || !isFinite(num)) {
        return { valid: false, value: 0, mode: detectedMode, radians: 0, degrees: 0, error: `Invalid numerical angle: "${input}"` };
      }
      numericValue = num;
    }

    let rad, deg;
    if (detectedMode === 'DEG') {
      deg = numericValue;
      rad = (deg * Math.PI) / 180;
    } else {
      rad = numericValue;
      deg = ResultFormatter.cleanNumber((rad * 180) / Math.PI);
    }

    return {
      valid: true,
      value: numericValue,
      mode: detectedMode,
      radians: rad,
      degrees: deg,
      rawString: String(input).trim(),
      error: null
    };
  }

  /**
   * Safely evaluates simple pi expressions like "pi/4", "3*pi/2", "pi"
   */
  static _evalPiExpression(expr) {
    expr = expr.replace(/\s+/g, '');
    if (expr === 'pi' || expr === '+pi') return Math.PI;
    if (expr === '-pi') return -Math.PI;

    // Matches fraction like [numerator]/[denominator]
    const parts = expr.split('/');
    if (parts.length === 2) {
      const numStr = parts[0].replace('pi', '').replace('*', '');
      const denStr = parts[1];
      const numCoeff = numStr === '' || numStr === '+' ? 1 : (numStr === '-' ? -1 : parseFloat(numStr));
      const denCoeff = parseFloat(denStr);
      if (isNaN(numCoeff) || isNaN(denCoeff) || denCoeff === 0) throw new Error('Invalid fraction');
      return (numCoeff * Math.PI) / denCoeff;
    }

    // Matches product like 2*pi
    if (expr.includes('*')) {
      const multParts = expr.split('*');
      let val = 1;
      for (const p of multParts) {
        if (p === 'pi') val *= Math.PI;
        else val *= parseFloat(p);
      }
      return val;
    }

    const coeff = expr.replace('pi', '');
    const c = coeff === '' ? 1 : parseFloat(coeff);
    return c * Math.PI;
  }

  // --------------------------------------------------------------------------
  // EXACT VALUE LOOKUP TABLES (Eliminates IEEE-754 precision artifacts)
  // --------------------------------------------------------------------------
  static getExactTrig(func, degrees) {
    // Normalize degree into [0, 360)
    let d = ((degrees % 360) + 360) % 360;
    // Round to 4 decimal places for key checking
    d = Math.round(d * 10000) / 10000;

    const exactTable = {
      0:   { sin: '0', cos: '1', tan: '0', cot: 'Undefined', sec: '1', csc: 'Undefined' },
      30:  { sin: '1/2', cos: '√3/2', tan: '1/√3', cot: '√3', sec: '2/√3', csc: '2' },
      45:  { sin: '1/√2', cos: '1/√2', tan: '1', cot: '1', sec: '√2', csc: '√2' },
      60:  { sin: '√3/2', cos: '1/2', tan: '√3', cot: '1/√3', sec: '2', csc: '2/√3' },
      90:  { sin: '1', cos: '0', tan: 'Undefined', cot: '0', sec: 'Undefined', csc: '1' },
      120: { sin: '√3/2', cos: '-1/2', tan: '-√3', cot: '-1/√3', sec: '-2', csc: '2/√3' },
      135: { sin: '1/√2', cos: '-1/√2', tan: '-1', cot: '-1', sec: '-√2', csc: '√2' },
      150: { sin: '1/2', cos: '-√3/2', tan: '-1/√3', cot: '-√3', sec: '-2/√3', csc: '2' },
      180: { sin: '0', cos: '-1', tan: '0', cot: 'Undefined', sec: '-1', csc: 'Undefined' },
      210: { sin: '-1/2', cos: '-√3/2', tan: '1/√3', cot: '√3', sec: '-2/√3', csc: '-2' },
      225: { sin: '-1/√2', cos: '-1/√2', tan: '1', cot: '1', sec: '-√2', csc: '-√2' },
      240: { sin: '-√3/2', cos: '-1/2', tan: '√3', cot: '1/√3', sec: '-2', csc: '-2/√3' },
      270: { sin: '-1', cos: '0', tan: 'Undefined', cot: '0', sec: 'Undefined', csc: '-1' },
      300: { sin: '-√3/2', cos: '1/2', tan: '-√3', cot: '-1/√3', sec: '2', csc: '-2/√3' },
      315: { sin: '-1/√2', cos: '1/√2', tan: '-1', cot: '-1', sec: '√2', csc: '-√2' },
      330: { sin: '-1/2', cos: '√3/2', tan: '-1/√3', cot: '-√3', sec: '2/√3', csc: '-2' }
    };

    if (exactTable[d] && exactTable[d][func]) {
      return exactTable[d][func];
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 1. BASIC TRIGONOMETRIC FUNCTIONS
  // --------------------------------------------------------------------------
  static evaluateTrig(funcName, angleInput, mode = 'DEG') {
    const parsed = this.parseAngle(angleInput, mode);
    if (!parsed.valid) return ResultFormatter.error(parsed.error);

    const rad = parsed.radians;
    const deg = parsed.degrees;
    const exact = this.getExactTrig(funcName, deg);

    let val = null;
    let isUndefined = false;
    let formula = '';
    let description = '';

    switch (funcName) {
      case 'sin':
        val = Math.sin(rad);
        formula = 'sin(θ) = Opposite / Hypotenuse';
        description = 'Sine is the y-coordinate of a point on the unit circle.';
        break;
      case 'cos':
        val = Math.cos(rad);
        formula = 'cos(θ) = Adjacent / Hypotenuse';
        description = 'Cosine is the x-coordinate of a point on the unit circle.';
        break;
      case 'tan':
        if (Math.abs(Math.cos(rad)) < 1e-12) {
          isUndefined = true;
        } else {
          val = Math.tan(rad);
        }
        formula = 'tan(θ) = sin(θ) / cos(θ) = Opposite / Adjacent';
        description = 'Tangent represents the slope of the terminal ray on the unit circle.';
        break;
      case 'cot':
        if (Math.abs(Math.sin(rad)) < 1e-12) {
          isUndefined = true;
        } else {
          val = 1 / Math.tan(rad);
        }
        formula = 'cot(θ) = 1 / tan(θ) = cos(θ) / sin(θ)';
        description = 'Cotangent is the reciprocal of the tangent function.';
        break;
      case 'sec':
        if (Math.abs(Math.cos(rad)) < 1e-12) {
          isUndefined = true;
        } else {
          val = 1 / Math.cos(rad);
        }
        formula = 'sec(θ) = 1 / cos(θ)';
        description = 'Secant is the reciprocal of the cosine function.';
        break;
      case 'csc':
      case 'cosec':
        funcName = 'csc';
        if (Math.abs(Math.sin(rad)) < 1e-12) {
          isUndefined = true;
        } else {
          val = 1 / Math.sin(rad);
        }
        formula = 'csc(θ) = 1 / sin(θ)';
        description = 'Cosecant is the reciprocal of the sine function.';
        break;
      default:
        return ResultFormatter.error(`Unknown trigonometric function: ${funcName}`);
    }

    if (isUndefined) {
      return ResultFormatter.success(
        {
          function: funcName,
          angle: parsed.rawString,
          degrees: deg,
          radians: rad,
          mode: parsed.mode,
          numericValue: null,
          formatted: 'Undefined',
          exactValue: 'Undefined',
          isUndefined: true
        },
        [
          `1. Input angle: θ = ${parsed.rawString} (${deg.toFixed(2)}° or ${rad.toFixed(4)} rad).`,
          `2. Function evaluated: ${funcName}(θ).`,
          `3. Denominator evaluates to 0 at this angle, creating a vertical asymptote.`,
          `4. Result: ${funcName}(θ) is UNDEFINED.`
        ],
        formula
      );
    }

    // Clean floating point artifacts (e.g. 1.22e-16 -> 0)
    if (Math.abs(val) < 1e-14) val = 0;
    const cleanNum = ResultFormatter.cleanNumber(val);
    const displayResult = exact || String(cleanNum);

    const steps = [
      `1. Given input angle: θ = ${parsed.rawString} (${parsed.mode === 'DEG' ? `${deg}°` : `${rad.toFixed(4)} rad`}).`,
      `2. Angle converted to standard radians: θ = ${rad.toFixed(6)} rad.`,
      `3. Applied definition: ${formula}.`,
      exact ? `4. Standard angle identity detected: exact value = ${exact}.` : `4. Computed numeric approximation = ${cleanNum}.`,
      `5. Final Result: ${funcName}(${parsed.rawString}) = ${displayResult}.`
    ];

    return ResultFormatter.success(
      {
        function: funcName,
        angle: parsed.rawString,
        degrees: deg,
        radians: rad,
        mode: parsed.mode,
        numericValue: cleanNum,
        formatted: displayResult,
        exactValue: exact,
        isUndefined: false,
        description
      },
      steps,
      formula
    );
  }

  // --------------------------------------------------------------------------
  // 2. INVERSE TRIGONOMETRIC FUNCTIONS
  // --------------------------------------------------------------------------
  static evaluateInverseTrig(funcName, valueInput, outputMode = 'DEG') {
    const num = parseFloat(valueInput);
    if (isNaN(num) || !isFinite(num)) {
      return ResultFormatter.error(`Input "${valueInput}" must be a valid real number.`);
    }

    let radVal = null;
    let formula = '';
    let domainStr = '';
    let rangeStr = '';

    switch (funcName) {
      case 'arcsin':
      case 'asin':
      case 'sin⁻¹':
        funcName = 'sin⁻¹';
        if (num < -1 || num > 1) {
          return ResultFormatter.error(`Input ${num} is outside the valid domain of sin⁻¹(x): [-1, 1].`);
        }
        radVal = Math.asin(num);
        formula = 'θ = sin⁻¹(x) ⟺ sin(θ) = x,  θ ∈ [-π/2, π/2]';
        domainStr = 'x ∈ [-1, 1]';
        rangeStr = outputMode === 'DEG' ? '[-90°, 90°]' : '[-π/2, π/2]';
        break;

      case 'arccos':
      case 'acos':
      case 'cos⁻¹':
        funcName = 'cos⁻¹';
        if (num < -1 || num > 1) {
          return ResultFormatter.error(`Input ${num} is outside the valid domain of cos⁻¹(x): [-1, 1].`);
        }
        radVal = Math.acos(num);
        formula = 'θ = cos⁻¹(x) ⟺ cos(θ) = x,  θ ∈ [0, π]';
        domainStr = 'x ∈ [-1, 1]';
        rangeStr = outputMode === 'DEG' ? '[0°, 180°]' : '[0, π]';
        break;

      case 'arctan':
      case 'atan':
      case 'tan⁻¹':
        funcName = 'tan⁻¹';
        radVal = Math.atan(num);
        formula = 'θ = tan⁻¹(x) ⟺ tan(θ) = x,  θ ∈ (-π/2, π/2)';
        domainStr = 'x ∈ (-∞, ∞)';
        rangeStr = outputMode === 'DEG' ? '(-90°, 90°)' : '(-π/2, π/2)';
        break;

      default:
        return ResultFormatter.error(`Unsupported inverse trigonometric function: ${funcName}`);
    }

    const degVal = (radVal * 180) / Math.PI;
    const finalVal = outputMode === 'DEG' ? degVal : radVal;
    const cleanNum = ResultFormatter.cleanNumber(finalVal);
    const unitLabel = outputMode === 'DEG' ? '°' : ' rad';
    const formattedResult = `${cleanNum}${unitLabel}`;

    const steps = [
      `1. Target: Compute ${funcName}(${num}). Domain restriction: ${domainStr}.`,
      `2. Verify argument: ${num} lies within the valid domain.`,
      `3. Principal branch definition: ${formula} (Range: ${rangeStr}).`,
      `4. Evaluated angle in radians: θ = ${radVal.toFixed(6)} rad.`,
      `5. Converted to ${outputMode}: θ = ${formattedResult}.`
    ];

    return ResultFormatter.success(
      {
        function: funcName,
        input: num,
        outputMode,
        radians: radVal,
        degrees: degVal,
        numericValue: cleanNum,
        formatted: formattedResult
      },
      steps,
      formula
    );
  }

  // --------------------------------------------------------------------------
  // 3. ANGLE CONVERSION: DEG ↔ RAD
  // --------------------------------------------------------------------------
  static convertAngle(input, fromMode = 'DEG', toMode = 'RAD') {
    const parsed = this.parseAngle(input, fromMode);
    if (!parsed.valid) return ResultFormatter.error(parsed.error);

    let convertedValue, unit, formula, piFraction;

    if (toMode === 'RAD') {
      convertedValue = parsed.radians;
      unit = 'rad';
      formula = 'Radians = Degrees × (π / 180)';
      piFraction = this._getPiFraction(parsed.degrees);
    } else {
      convertedValue = parsed.degrees;
      unit = '°';
      formula = 'Degrees = Radians × (180 / π)';
      piFraction = null;
    }

    const cleanVal = ResultFormatter.cleanNumber(convertedValue);
    const formatted = piFraction ? `${piFraction} rad (${cleanVal.toFixed(4)} rad)` : `${cleanVal}${unit}`;

    const steps = [
      `1. Initial angle: ${parsed.rawString} (${fromMode}).`,
      `2. Conversion theorem: ${formula}.`,
      piFraction ? `3. Exact fractional multiple: ${piFraction} rad.` : `3. Direct numeric calculation applied.`,
      `4. Result: ${formatted}.`
    ];

    return ResultFormatter.success(
      {
        original: parsed.rawString,
        fromMode,
        toMode,
        degrees: parsed.degrees,
        radians: parsed.radians,
        piFraction,
        formatted,
        numericValue: cleanVal
      },
      steps,
      formula
    );
  }

  static _getPiFraction(degrees) {
    let d = Math.round(degrees * 1000) / 1000;
    if (d === 0) return '0';

    // Find greatest common divisor of integer degrees and 180
    if (Number.isInteger(d)) {
      let num = d;
      let den = 180;
      let sign = num < 0 ? '-' : '';
      num = Math.abs(num);

      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
      const g = gcd(num, den);
      num /= g;
      den /= g;

      if (den === 1) return `${sign}${num === 1 ? '' : num}π`;
      return `${sign}${num === 1 ? '' : num}π/${den}`;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // 4. STANDARD ANGLE TABLE
  // --------------------------------------------------------------------------
  static getStandardAngleTable() {
    const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360];
    const rows = angles.map((deg) => {
      const piFrac = this._getPiFraction(deg);
      return {
        deg: `${deg}°`,
        rad: piFrac ? `${piFrac}` : `${((deg * Math.PI) / 180).toFixed(3)}`,
        sin: this.getExactTrig('sin', deg) ?? Math.sin((deg * Math.PI) / 180).toFixed(4),
        cos: this.getExactTrig('cos', deg) ?? Math.cos((deg * Math.PI) / 180).toFixed(4),
        tan: this.getExactTrig('tan', deg) ?? Math.tan((deg * Math.PI) / 180).toFixed(4),
        cot: this.getExactTrig('cot', deg) ?? '—',
        sec: this.getExactTrig('sec', deg) ?? '—',
        csc: this.getExactTrig('csc', deg) ?? '—'
      };
    });

    return ResultFormatter.success(
      rows,
      ['Standard angles evaluated on the unit circle across all 6 trigonometric functions.'],
      'Trigonometric Ratios of Standard Angles'
    );
  }

  // --------------------------------------------------------------------------
  // 5. TRIGONOMETRIC EQUATIONS SOLVER: sin(x) = k, cos(x) = k, tan(x) = k
  // --------------------------------------------------------------------------
  static solveEquation(funcName, constantK, mode = 'DEG') {
    const k = parseFloat(constantK);
    if (isNaN(k) || !isFinite(k)) {
      return ResultFormatter.error(`Constant k = "${constantK}" must be a valid real number.`);
    }

    let alphaRad = null;
    let principalSols = [];
    let generalFormula = '';

    switch (funcName) {
      case 'sin':
        if (k < -1 || k > 1) {
          return ResultFormatter.error(`No real solutions: sin(x) = ${k} has no solution because -1 ≤ sin(x) ≤ 1.`);
        }
        alphaRad = Math.asin(k);
        // Principal solutions in [0, 2π)
        const s1 = ((alphaRad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const s2 = (((Math.PI - alphaRad) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        principalSols = [s1, s2].filter((v, i, a) => a.findIndex(t => Math.abs(t - v) < 1e-6) === i);
        generalFormula = 'x = nπ + (-1)ⁿ α,  n ∈ ℤ';
        break;

      case 'cos':
        if (k < -1 || k > 1) {
          return ResultFormatter.error(`No real solutions: cos(x) = ${k} has no solution because -1 ≤ cos(x) ≤ 1.`);
        }
        alphaRad = Math.acos(k);
        const c1 = alphaRad;
        const c2 = 2 * Math.PI - alphaRad;
        principalSols = [c1, c2].filter((v, i, a) => a.findIndex(t => Math.abs(t - v) < 1e-6) === i);
        generalFormula = 'x = 2nπ ± α,  n ∈ ℤ';
        break;

      case 'tan':
        alphaRad = Math.atan(k);
        const t1 = ((alphaRad % Math.PI) + Math.PI) % Math.PI;
        const t2 = t1 + Math.PI;
        principalSols = [t1, t2].filter((v, i, a) => a.findIndex(t => Math.abs(t - v) < 1e-6) === i);
        generalFormula = 'x = nπ + α,  n ∈ ℤ';
        break;

      default:
        return ResultFormatter.error(`Equation solving currently supports sin, cos, and tan.`);
    }

    principalSols.sort((a, b) => a - b);

    // Format principal solutions
    const formattedPrincipal = principalSols.map((rad) => {
      if (mode === 'DEG') {
        const deg = (rad * 180) / Math.PI;
        return `${ResultFormatter.cleanNumber(deg)}°`;
      }
      return `${rad.toFixed(4)} rad`;
    });

    const alphaDisplay = mode === 'DEG'
      ? `${ResultFormatter.cleanNumber((alphaRad * 180) / Math.PI)}°`
      : `${alphaRad.toFixed(4)} rad`;

    const steps = [
      `1. Target equation: ${funcName}(x) = ${k}.`,
      `2. Verify solvability: Argument k is within valid range for ${funcName}.`,
      `3. Find reference angle α: α = ${funcName}⁻¹(${k}) = ${alphaDisplay}.`,
      `4. General Solution: ${generalFormula} (where α = ${alphaDisplay}).`,
      `5. Principal Solutions in [0, 2π) / [0°, 360°): {${formattedPrincipal.join(', ')}}.`
    ];

    return ResultFormatter.success(
      {
        equation: `${funcName}(x) = ${k}`,
        constant: k,
        alphaRad,
        alphaDisplay,
        generalFormula,
        principalSolutions: formattedPrincipal,
        mode
      },
      steps,
      generalFormula
    );
  }

  // --------------------------------------------------------------------------
  // 6. CORE IDENTITIES REPOSITORY
  // --------------------------------------------------------------------------
  static getIdentities() {
    return [
      {
        category: 'Pythagorean Identities',
        items: [
          { name: 'Fundamental Pythagorean', formula: 'sin²(x) + cos²(x) = 1' },
          { name: 'Secant-Tangent Identity', formula: '1 + tan²(x) = sec²(x)' },
          { name: 'Cosecant-Cotangent Identity', formula: '1 + cot²(x) = csc²(x)' }
        ]
      },
      {
        category: 'Compound Angle Formulas',
        items: [
          { name: 'Sine of Sum', formula: 'sin(A + B) = sin(A)cos(B) + cos(A)sin(B)' },
          { name: 'Sine of Difference', formula: 'sin(A - B) = sin(A)cos(B) - cos(A)sin(B)' },
          { name: 'Cosine of Sum', formula: 'cos(A + B) = cos(A)cos(B) - sin(A)sin(B)' },
          { name: 'Cosine of Difference', formula: 'cos(A - B) = cos(A)cos(B) + sin(A)sin(B)' },
          { name: 'Tangent of Sum', formula: 'tan(A + B) = (tan A + tan B) / (1 - tan A tan B)' }
        ]
      },
      {
        category: 'Double & Half Angle Formulas',
        items: [
          { name: 'Double Angle Sine', formula: 'sin(2x) = 2 sin(x) cos(x)' },
          { name: 'Double Angle Cosine', formula: 'cos(2x) = cos²(x) - sin²(x) = 2cos²(x) - 1 = 1 - 2sin²(x)' },
          { name: 'Double Angle Tangent', formula: 'tan(2x) = 2tan(x) / (1 - tan²(x))' },
          { name: 'Half Angle Sine', formula: 'sin(x/2) = ±√[(1 - cos x) / 2]' },
          { name: 'Half Angle Cosine', formula: 'cos(x/2) = ±√[(1 + cos x) / 2]' }
        ]
      },
      {
        category: 'Sum-to-Product & Product-to-Sum',
        items: [
          { name: 'Sum of Sines', formula: 'sin(A) + sin(B) = 2 sin((A+B)/2) cos((A-B)/2)' },
          { name: 'Sum of Cosines', formula: 'cos(A) + cos(B) = 2 cos((A+B)/2) cos((A-B)/2)' },
          { name: 'Difference of Cosines', formula: 'cos(A) - cos(B) = -2 sin((A+B)/2) sin((A-B)/2)' }
        ]
      }
    ];
  }
}
