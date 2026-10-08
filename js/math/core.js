/**
 * OG - Core Mathematical Engine Functions
 * Pure, reliable, defensive mathematical algorithms returning step-by-step structured data
 * ES6 Module
 */

import { MathValidator } from './validator.js';
import { ResultFormatter } from './formatter.js';

export class CoreMathEngine {
  /**
   * 1. Factorial: n! = n * (n - 1) * ... * 1
   */
  static factorial(n) {
    try {
      const check = MathValidator.isNonNegativeInteger(n, 'n');
      if (!check.valid) return ResultFormatter.error(check.error);

      const val = check.value;
      if (val > 170) {
        return ResultFormatter.error(`Factorial overflow for n = ${val} (maximum supported is 170!).`);
      }

      const steps = [];
      const formula = 'n! = n × (n - 1) × (n - 2) × ... × 1, where 0! = 1';

      if (val === 0 || val === 1) {
        steps.push(`By definition of factorial, ${val}! = 1`);
        return ResultFormatter.success(1, steps, formula);
      }

      steps.push(`Evaluating factorial for integer n = ${val}`);
      let product = 1;
      const terms = [];
      for (let i = val; i >= 1; i--) {
        product *= i;
        if (terms.length < 6) {
          terms.push(i);
        }
      }

      if (val > 6) {
        steps.push(`Expanded sequence: ${terms.slice(0, 3).join(' × ')} × ... × 3 × 2 × 1`);
      } else {
        steps.push(`Expanded sequence: ${terms.join(' × ')}`);
      }

      steps.push(`Computed product: ${product}`);
      return ResultFormatter.success(product, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing factorial');
    }
  }

  /**
   * 2. Permutation: P(n, r) = n! / (n - r)!
   */
  static permutation(n, r) {
    try {
      const check = MathValidator.validateCombinatorics(n, r);
      if (!check.valid) return ResultFormatter.error(check.error);

      const numN = check.n;
      const numR = check.r;
      const formula = 'P(n, r) = n! / (n - r)!';
      const steps = [
        `Given total objects n = ${numN}, arrangements r = ${numR}`,
        `Apply permutation formula: P(${numN}, ${numR}) = ${numN}! / (${numN} - ${numR})!`
      ];

      if (numR === 0) {
        steps.push(`When r = 0, P(${numN}, 0) = 1 (there is exactly one way to arrange zero items)`);
        return ResultFormatter.success(1, steps, formula);
      }

      const diff = numN - numR;
      steps.push(`Denominator: (${numN} - ${numR})! = ${diff}!`);

      // Compute product of n * (n - 1) * ... * (n - r + 1) to prevent premature overflow
      let result = 1;
      const factors = [];
      for (let i = 0; i < numR; i++) {
        const factor = numN - i;
        factors.push(factor);
        result *= factor;
      }

      steps.push(`Simplified calculation: ${factors.join(' × ')} = ${result}`);
      return ResultFormatter.success(result, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing permutation');
    }
  }

  /**
   * 3. Combination: C(n, r) = n! / [r! * (n - r)!]
   */
  static combination(n, r) {
    try {
      const check = MathValidator.validateCombinatorics(n, r);
      if (!check.valid) return ResultFormatter.error(check.error);

      const numN = check.n;
      let numR = check.r;
      const formula = 'C(n, r) = n! / [r! × (n - r)!]';
      const steps = [
        `Given total items n = ${numN}, selections r = ${numR}`,
        `Apply combination formula: C(${numN}, ${numR}) = ${numN}! / [${numR}! × (${numN} - ${numR})!]`
      ];

      // Symmetry optimization C(n, r) = C(n, n - r)
      if (numR > numN - numR) {
        steps.push(`Using symmetry identity C(n, r) = C(n, n - r): C(${numN}, ${numR}) = C(${numN}, ${numN - numR})`);
        numR = numN - numR;
      }

      if (numR === 0) {
        steps.push(`When r = 0, C(${numN}, 0) = 1 (exactly one way to choose nothing)`);
        return ResultFormatter.success(1, steps, formula);
      }

      let numerator = 1;
      let denominator = 1;
      const numFactors = [];
      const denFactors = [];

      for (let i = 1; i <= numR; i++) {
        const numFactor = numN - i + 1;
        numFactors.push(numFactor);
        denFactors.push(i);
        numerator *= numFactor;
        denominator *= i;
      }

      const result = Math.round(numerator / denominator);
      steps.push(`Numerator: ${numFactors.join(' × ')} = ${numerator}`);
      steps.push(`Denominator: ${denFactors.join(' × ')} = ${denominator}`);
      steps.push(`Result: ${numerator} / ${denominator} = ${result}`);

      return ResultFormatter.success(result, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing combination');
    }
  }

  /**
   * 4. Greatest Common Divisor (GCD) using Euclidean Algorithm
   */
  static gcd(a, b) {
    try {
      const checkA = MathValidator.isInteger(a, 'First integer (a)');
      if (!checkA.valid) return ResultFormatter.error(checkA.error);

      const checkB = MathValidator.isInteger(b, 'Second integer (b)');
      if (!checkB.valid) return ResultFormatter.error(checkB.error);

      let x = Math.abs(checkA.value);
      let y = Math.abs(checkB.value);
      const formula = 'gcd(a, b) = gcd(b, a mod b) [Euclidean Algorithm]';
      const steps = [`Given integers |a| = ${x}, |b| = ${y}`];

      if (x === 0 && y === 0) {
        return ResultFormatter.error('gcd(0, 0) is undefined as every integer divides 0.');
      }
      if (x === 0) {
        steps.push(`gcd(0, ${y}) = ${y}`);
        return ResultFormatter.success(y, steps, formula);
      }
      if (y === 0) {
        steps.push(`gcd(${x}, 0) = ${x}`);
        return ResultFormatter.success(x, steps, formula);
      }

      while (y !== 0) {
        const remainder = x % y;
        const quotient = Math.floor(x / y);
        steps.push(`${x} = ${y} × ${quotient} + ${remainder}`);
        x = y;
        y = remainder;
      }

      steps.push(`The last non-zero remainder is ${x}`);
      return ResultFormatter.success(x, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing GCD');
    }
  }

  /**
   * 5. Least Common Multiple (LCM): lcm(a, b) = |a * b| / gcd(a, b)
   */
  static lcm(a, b) {
    try {
      const checkA = MathValidator.isInteger(a, 'First integer (a)');
      if (!checkA.valid) return ResultFormatter.error(checkA.error);

      const checkB = MathValidator.isInteger(b, 'Second integer (b)');
      if (!checkB.valid) return ResultFormatter.error(checkB.error);

      const x = Math.abs(checkA.value);
      const y = Math.abs(checkB.value);
      const formula = 'lcm(a, b) = (|a| × |b|) / gcd(a, b)';
      const steps = [`Given integers |a| = ${x}, |b| = ${y}`];

      if (x === 0 || y === 0) {
        steps.push(`Since one of the numbers is 0, lcm(${x}, ${y}) = 0`);
        return ResultFormatter.success(0, steps, formula);
      }

      const gcdRes = this.gcd(x, y);
      if (!gcdRes.success) return ResultFormatter.error(gcdRes.error);

      const gcdVal = gcdRes.result;
      steps.push(`Calculated gcd(${x}, ${y}) = ${gcdVal}`);

      const product = x * y;
      steps.push(`Product |a × b| = ${x} × ${y} = ${product}`);

      const result = product / gcdVal;
      steps.push(`lcm(${x}, ${y}) = ${product} / ${gcdVal} = ${result}`);

      return ResultFormatter.success(result, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing LCM');
    }
  }

  /**
   * 6. Percentage: P = (value / total) * 100%
   */
  static percentage(value, total) {
    try {
      const checkVal = MathValidator.isNumber(value, 'Value');
      if (!checkVal.valid) return ResultFormatter.error(checkVal.error);

      const checkTotal = MathValidator.isNonZero(total, 'Total');
      if (!checkTotal.valid) return ResultFormatter.error(checkTotal.error);

      const val = checkVal.value;
      const tot = checkTotal.value;
      const formula = 'P = (Value / Total) × 100%';

      const ratio = val / tot;
      const pct = ResultFormatter.cleanNumber(ratio * 100);

      const steps = [
        `Given Value = ${val}, Total = ${tot}`,
        `Fractional ratio: ${val} / ${tot} = ${ResultFormatter.cleanNumber(ratio)}`,
        `Multiply by 100 to convert to percentage: ${ResultFormatter.cleanNumber(ratio)} × 100% = ${pct}%`
      ];

      return ResultFormatter.success(pct, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing percentage');
    }
  }

  /**
   * 7. Power: b^e
   */
  static power(base, exponent) {
    try {
      const checkBase = MathValidator.isNumber(base, 'Base (b)');
      if (!checkBase.valid) return ResultFormatter.error(checkBase.error);

      const checkExp = MathValidator.isNumber(exponent, 'Exponent (e)');
      if (!checkExp.valid) return ResultFormatter.error(checkExp.error);

      const b = checkBase.value;
      const e = checkExp.value;
      const formula = 'b^e = exp(e × ln(b))';
      const steps = [`Given base b = ${b}, exponent e = ${e}`];

      if (b === 0 && e === 0) {
        return ResultFormatter.error('0^0 is an indeterminate form in standard arithmetic.');
      }
      if (b === 0 && e < 0) {
        return ResultFormatter.error('0 raised to a negative power results in division by zero.');
      }
      if (b < 0 && !Number.isInteger(e)) {
        return ResultFormatter.error('Negative base with non-integer exponent yields a complex number.');
      }

      const res = Math.pow(b, e);
      if (!isFinite(res)) {
        return ResultFormatter.error('Power operation exceeded numeric capacity (overflow).');
      }

      steps.push(`Evaluate exponential ${b}^${e} = ${ResultFormatter.cleanNumber(res)}`);
      return ResultFormatter.success(ResultFormatter.cleanNumber(res), steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing power');
    }
  }

  /**
   * 8. Square Root: √x = x^(1/2)
   */
  static squareRoot(x) {
    try {
      const check = MathValidator.isNumber(x, 'Radicand (x)');
      if (!check.valid) return ResultFormatter.error(check.error);

      const val = check.value;
      const formula = '√x = x^(1/2)';
      const steps = [`Given radicand x = ${val}`];

      if (val < 0) {
        return ResultFormatter.error(`Square root of negative number (${val}) is not real.`);
      }

      const res = ResultFormatter.cleanNumber(Math.sqrt(val));
      steps.push(`Principal square root: √${val} = ${res}`);
      return ResultFormatter.success(res, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing square root');
    }
  }

  /**
   * 9. Cube Root: ∛x
   */
  static cubeRoot(x) {
    try {
      const check = MathValidator.isNumber(x, 'Radicand (x)');
      if (!check.valid) return ResultFormatter.error(check.error);

      const val = check.value;
      const formula = '∛x = sgn(x) × |x|^(1/3)';
      const steps = [`Given radicand x = ${val}`];

      const res = ResultFormatter.cleanNumber(Math.cbrt(val));
      steps.push(`Principal real cube root: ∛${val} = ${res}`);
      return ResultFormatter.success(res, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error computing cube root');
    }
  }

  /**
   * 10a. Degree to Radian Conversion
   */
  static degreeToRadian(deg) {
    try {
      const check = MathValidator.isNumber(deg, 'Angle in degrees');
      if (!check.valid) return ResultFormatter.error(check.error);

      const d = check.value;
      const formula = 'rad = deg × (π / 180)';
      const factor = Math.PI / 180;
      const rad = ResultFormatter.cleanNumber(d * factor);

      const steps = [
        `Given angle in degrees: ${d}°`,
        `Multiply by conversion factor (π / 180) ≈ ${factor.toFixed(8)}`,
        `Radian result: ${d} × (π / 180) = ${rad} rad`
      ];

      return ResultFormatter.success(rad, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error converting degrees to radians');
    }
  }

  /**
   * 10b. Radian to Degree Conversion
   */
  static radianToDegree(rad) {
    try {
      const check = MathValidator.isNumber(rad, 'Angle in radians');
      if (!check.valid) return ResultFormatter.error(check.error);

      const r = check.value;
      const formula = 'deg = rad × (180 / π)';
      const factor = 180 / Math.PI;
      const deg = ResultFormatter.cleanNumber(r * factor);

      const steps = [
        `Given angle in radians: ${r} rad`,
        `Multiply by conversion factor (180 / π) ≈ ${factor.toFixed(8)}`,
        `Degree result: ${r} × (180 / π) = ${deg}°`
      ];

      return ResultFormatter.success(deg, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error converting radians to degrees');
    }
  }

  /**
   * 11. Rounding: round(value, decimals)
   */
  static round(value, decimals = 0) {
    try {
      const checkVal = MathValidator.isNumber(value, 'Value to round');
      if (!checkVal.valid) return ResultFormatter.error(checkVal.error);

      const checkDec = MathValidator.isNonNegativeInteger(decimals, 'Decimals');
      if (!checkDec.valid) return ResultFormatter.error(checkDec.error);

      const v = checkVal.value;
      const d = checkDec.value;
      const formula = 'round(x, d) = round(x × 10^d) / 10^d';

      if (d > 14) {
        return ResultFormatter.error('Decimal precision cannot exceed 14 places.');
      }

      const multiplier = Math.pow(10, d);
      const rounded = Math.round((v + Number.EPSILON) * multiplier) / multiplier;

      const steps = [
        `Original value: ${v}, target decimals: ${d}`,
        `Multiply by 10^${d} = ${multiplier}: ${v * multiplier}`,
        `Apply standard midpoint rounding and divide by ${multiplier}: ${rounded}`
      ];

      return ResultFormatter.success(rounded, steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error performing rounding');
    }
  }

  /**
   * 12. Significant Digits: toSignificantDigits(value, digits)
   */
  static toSignificantDigits(value, digits = 4) {
    try {
      const checkVal = MathValidator.isNumber(value, 'Value');
      if (!checkVal.valid) return ResultFormatter.error(checkVal.error);

      const checkDig = MathValidator.isInteger(digits, 'Significant digits');
      if (!checkDig.valid) return ResultFormatter.error(checkDig.error);

      const v = checkVal.value;
      const d = checkDig.value;
      const formula = 'Significant Figures representation';

      if (d < 1 || d > 14) {
        return ResultFormatter.error('Significant digits must be between 1 and 14.');
      }

      if (v === 0) {
        return ResultFormatter.success('0', ['Value is 0, representation is 0'], formula);
      }

      const formatted = Number(v.toPrecision(d)).toString();
      const steps = [
        `Original number: ${v}`,
        `Round to ${d} significant digits: ${formatted}`
      ];

      return ResultFormatter.success(Number(formatted), steps, formula);
    } catch (err) {
      return ResultFormatter.error(err.message || 'Error formatting significant digits');
    }
  }
}
