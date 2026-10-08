/**
 * OG - Combinatorics Mathematical Engine (Module 06: Permutations and Combinations)
 * Exact computation for Factorials, Permutations (nPr), Combinations (nCr),
 * Arrangements with repetition, Circular arrangements, and Selection Problems.
 *
 * For EVERY calculation returns structured:
 * - Input
 * - Formula
 * - Substitution
 * - Calculation
 * - Final Answer
 *
 * Architecture:
 * UI -> Module Controller -> CombinatoricsMathEngine -> ResultFormatter -> UI
 */

import { ResultFormatter } from './formatter.js';

export class CombinatoricsMathEngine {
  /**
   * Defensive input validator for combinatorics (n, r)
   */
  static validateNR(nInput, rInput, allowRExceeds = false) {
    if (nInput === null || nInput === undefined || String(nInput).trim() === '') {
      return { valid: false, error: 'Value of n is required.' };
    }

    const n = Number(nInput);
    if (!Number.isInteger(n)) {
      return { valid: false, error: `Value of n must be an integer, received: "${nInput}".` };
    }
    if (n < 0) {
      return { valid: false, error: `Negative value for n (${n}) is not allowed.` };
    }
    if (n > 200) {
      return { valid: false, error: `Value of n (${n}) exceeds maximum calculation limit (200).` };
    }

    if (rInput !== undefined && rInput !== null && String(rInput).trim() !== '') {
      const r = Number(rInput);
      if (!Number.isInteger(r)) {
        return { valid: false, error: `Value of r must be an integer, received: "${rInput}".` };
      }
      if (r < 0) {
        return { valid: false, error: `Negative value for r (${r}) is not allowed.` };
      }
      if (!allowRExceeds && r > n) {
        return { valid: false, error: `Value of r (${r}) cannot be greater than n (${n}) for this operation.` };
      }
      return { valid: true, n, r, error: null };
    }

    return { valid: true, n, r: null, error: null };
  }

  /**
   * BigInt Factorial helper
   */
  static bigFactorial(n) {
    let result = 1n;
    for (let i = 2n; i <= BigInt(n); i++) {
      result *= i;
    }
    return result;
  }

  // --------------------------------------------------------------------------
  // 1. FACTORIAL: n!
  // --------------------------------------------------------------------------
  static factorial(nInput) {
    const check = this.validateNR(nInput);
    if (!check.valid) return ResultFormatter.error(check.error);

    const n = check.n;
    const inputStr = `n = ${n}`;
    const formulaStr = 'n! = n × (n - 1) × (n - 2) × ... × 2 × 1  (with 0! = 1 by definition)';

    let substitutionStr = '';
    let calculationStr = '';
    let ansBig = 1n;

    if (n === 0) {
      substitutionStr = '0!';
      calculationStr = 'Defined as 1 (representing the single permutation of the empty set)';
      ansBig = 1n;
    } else if (n === 1) {
      substitutionStr = '1!';
      calculationStr = '1 = 1';
      ansBig = 1n;
    } else {
      const terms = [];
      const showCount = Math.min(n, 6);
      for (let i = n; i >= n - showCount + 1; i--) terms.push(i);
      if (n > 6) {
        substitutionStr = `${terms.join(' × ')} × ... × 2 × 1`;
      } else {
        substitutionStr = `${terms.join(' × ')} × 1`;
      }
      ansBig = this.bigFactorial(n);
      calculationStr = `Multiplying all positive integers from ${n} down to 1`;
    }

    const finalAnsStr = ansBig.toString();

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: finalAnsStr
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ${n}! = ${substitutionStr}`,
      `Calculation: ${calculationStr}`,
      `Final Answer: ${n}! = ${finalAnsStr}`
    ];

    return ResultFormatter.success(
      {
        n,
        value: finalAnsStr,
        formatted: `${n}! = ${finalAnsStr}`,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 2. PERMUTATIONS: nPr
  // --------------------------------------------------------------------------
  static permutation(nInput, rInput) {
    const check = this.validateNR(nInput, rInput);
    if (!check.valid) return ResultFormatter.error(check.error);

    const { n, r } = check;
    const inputStr = `n = ${n}, r = ${r}`;
    const formulaStr = 'ⁿPᵣ = n! / (n - r)! = n × (n - 1) × ... × (n - r + 1)';

    const diff = n - r;
    let substitutionStr = `${n}! / (${n} - ${r})! = ${n}! / ${diff}!`;
    let calculationStr = '';

    let ansBig = 1n;
    const terms = [];
    for (let i = 0; i < r; i++) {
      const factor = BigInt(n - i);
      ansBig *= factor;
      if (i < 8) terms.push((n - i).toString());
    }

    if (r === 0) {
      calculationStr = `${n}! / ${n}! = 1 (1 arrangement of choosing 0 elements)`;
      ansBig = 1n;
    } else if (terms.length <= 8 && terms.length === r) {
      calculationStr = `${terms.join(' × ')} = ${ansBig.toString()}`;
    } else {
      calculationStr = `${terms.slice(0, 5).join(' × ')} × ... × (${n - r + 1}) = ${ansBig.toString()}`;
    }

    const finalAnsStr = ansBig.toString();

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: finalAnsStr
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ⁿPᵣ = ${substitutionStr}`,
      `Calculation: ${calculationStr}`,
      `Final Answer: ⁿPᵣ = ${finalAnsStr}`
    ];

    return ResultFormatter.success(
      {
        n,
        r,
        value: finalAnsStr,
        formatted: `P(${n}, ${r}) = ${finalAnsStr}`,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 3. COMBINATIONS: nCr
  // --------------------------------------------------------------------------
  static combination(nInput, rInput) {
    const check = this.validateNR(nInput, rInput);
    if (!check.valid) return ResultFormatter.error(check.error);

    const { n, r } = check;
    const inputStr = `n = ${n}, r = ${r}`;
    const formulaStr = 'ⁿCᵣ = n! / [r! × (n - r)!]';

    const diff = n - r;
    const effectiveR = Math.min(r, diff);
    const substitutionStr = `${n}! / [${r}! × (${n} - ${r})!] = ${n}! / [${r}! × ${diff}!]`;

    // Compute efficiently: (n * (n-1) * ... * (n-effectiveR+1)) / effectiveR!
    let numBig = 1n;
    let denBig = 1n;
    const numTerms = [];
    const denTerms = [];

    for (let i = 0; i < effectiveR; i++) {
      numBig *= BigInt(n - i);
      denBig *= BigInt(i + 1);
      if (i < 6) {
        numTerms.push((n - i).toString());
        denTerms.push((i + 1).toString());
      }
    }

    const ansBig = denBig > 0n ? numBig / denBig : 1n;

    let calculationStr = '';
    if (r === 0 || r === n) {
      calculationStr = `${n}! / [0! × ${n}!] = 1 (exactly 1 subset)`;
    } else if (effectiveR <= 6) {
      calculationStr = `[${numTerms.join(' × ')}] / [${denTerms.join(' × ')}] = ${ansBig.toString()}`;
    } else {
      calculationStr = `Using symmetry ⁿCᵣ = ⁿCₙ₋ᵣ: [${numTerms.slice(0, 4).join(' × ')} × ...] / [${denTerms.slice(0, 4).join(' × ')} × ...] = ${ansBig.toString()}`;
    }

    const finalAnsStr = ansBig.toString();

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: finalAnsStr
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ⁿCᵣ = ${substitutionStr}`,
      `Calculation: ${calculationStr}`,
      `Final Answer: ⁿCᵣ = ${finalAnsStr}`
    ];

    return ResultFormatter.success(
      {
        n,
        r,
        value: finalAnsStr,
        formatted: `C(${n}, ${r}) = ${finalAnsStr}`,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 4. ARRANGEMENTS (Letters with repetition & Circular permutations)
  // --------------------------------------------------------------------------
  static arrangements(inputWord, isCircular = false) {
    if (!inputWord || typeof inputWord !== 'string') {
      return ResultFormatter.error('Input word/sequence is required.');
    }

    const cleaned = inputWord.trim().replace(/\s+/g, '').toUpperCase();
    if (cleaned.length === 0) {
      return ResultFormatter.error('Word cannot be empty.');
    }
    if (cleaned.length > 50) {
      return ResultFormatter.error('Word length exceeds maximum calculation limit (50).');
    }

    const n = cleaned.length;
    // Count letter frequencies
    const freq = {};
    for (const char of cleaned) {
      freq[char] = (freq[char] || 0) + 1;
    }

    const repeated = Object.entries(freq).filter(([_, count]) => count > 1);

    const inputStr = `Sequence: "${cleaned}", Total Items n = ${n}${isCircular ? ' (Circular)' : ' (Linear)'}`;
    let formulaStr = '';
    let substitutionStr = '';
    let calculationStr = '';
    let ansBig = 1n;

    if (isCircular) {
      // Circular permutations: (n - 1)! / (p! q! ...)
      formulaStr = 'Number of Circular Arrangements = (n - 1)! / (p! × q! × ...)';
      const numFac = this.bigFactorial(n - 1);
      let denFac = 1n;
      const denParts = [];

      for (const [char, count] of repeated) {
        denFac *= this.bigFactorial(count);
        denParts.push(`${char}: ${count}!`);
      }

      ansBig = numFac / denFac;
      substitutionStr = `(${n} - 1)! / [${denParts.length > 0 ? denParts.join(' × ') : '1'}] = ${n - 1}! / ${denFac.toString()}`;
      calculationStr = `${numFac.toString()} / ${denFac.toString()} = ${ansBig.toString()}`;
    } else {
      // Linear arrangements with repetition: n! / (p! q! ...)
      formulaStr = 'Number of Distinct Arrangements = n! / (p! × q! × ...)';
      const numFac = this.bigFactorial(n);
      let denFac = 1n;
      const denParts = [];

      for (const [char, count] of repeated) {
        denFac *= this.bigFactorial(count);
        denParts.push(`${char}: ${count}!`);
      }

      ansBig = numFac / denFac;
      substitutionStr = `${n}! / [${denParts.length > 0 ? denParts.join(' × ') : '1'}] = ${numFac.toString()} / ${denFac.toString()}`;
      calculationStr = repeated.length > 0
        ? `Repeated letters: ${repeated.map(([c, k]) => `${c}(${k})`).join(', ')}. Result = ${ansBig.toString()}`
        : `All letters are unique. Result = ${n}! = ${ansBig.toString()}`;
    }

    const finalAnsStr = ansBig.toString();

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: finalAnsStr
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ${substitutionStr}`,
      `Calculation: ${calculationStr}`,
      `Final Answer: ${finalAnsStr} distinct arrangements`
    ];

    return ResultFormatter.success(
      {
        word: cleaned,
        length: n,
        frequencies: freq,
        isCircular,
        value: finalAnsStr,
        formatted: `${finalAnsStr} arrangements`,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 5. SELECTION PROBLEMS (Teams, Handshakes, Diagonals, Committees)
  // --------------------------------------------------------------------------
  static solveSelectionProblem(type, p1, p2, p3) {
    switch (type) {
      case 'handshakes': {
        // Handshakes between n people = nC2
        const check = this.validateNR(p1);
        if (!check.valid) return ResultFormatter.error(check.error);
        const n = check.n;
        if (n < 2) return ResultFormatter.error('Need at least 2 people for a handshake.');

        const comb = this.combination(n, 2);
        const inputStr = `Number of attendees n = ${n}`;
        const formulaStr = 'Total Handshakes = ⁿC₂ = n(n - 1) / 2';
        const substitutionStr = `${n}(${n} - 1) / 2 = (${n} × ${n - 1}) / 2`;
        const ans = comb.result.value;

        return ResultFormatter.success(
          {
            type: 'handshakes',
            n,
            value: ans,
            formatted: `${ans} handshakes`,
            derivation: {
              input: inputStr,
              formula: formulaStr,
              substitution: substitutionStr,
              calculation: `Each person shakes hands with every other person without repetition.`,
              finalAnswer: `${ans} handshakes`
            }
          },
          [
            `Input: ${inputStr}`,
            `Formula: ${formulaStr}`,
            `Substitution: ${substitutionStr}`,
            `Calculation: (${n} × ${n - 1}) / 2`,
            `Final Answer: ${ans} handshakes`
          ],
          formulaStr
        );
      }

      case 'diagonals': {
        // Diagonals in polygon with n vertices = nC2 - n = n(n - 3) / 2
        const check = this.validateNR(p1);
        if (!check.valid) return ResultFormatter.error(check.error);
        const n = check.n;
        if (n < 3) return ResultFormatter.error('A polygon must have at least 3 vertices.');

        const ans = (n * (n - 3)) / 2;
        const inputStr = `Number of vertices n = ${n}`;
        const formulaStr = 'Total Diagonals = ⁿC₂ - n = n(n - 3) / 2';
        const substitutionStr = `${n}(${n} - 3) / 2 = (${n} × ${n - 3}) / 2`;

        return ResultFormatter.success(
          {
            type: 'diagonals',
            n,
            value: ans.toString(),
            formatted: `${ans} diagonals`,
            derivation: {
              input: inputStr,
              formula: formulaStr,
              substitution: substitutionStr,
              calculation: `Connecting any 2 vertices gives ⁿC₂ line segments, minus n edges leaves diagonals.`,
              finalAnswer: `${ans} diagonals`
            }
          },
          [
            `Input: ${inputStr}`,
            `Formula: ${formulaStr}`,
            `Substitution: ${substitutionStr}`,
            `Calculation: (${n} × ${n - 3}) / 2`,
            `Final Answer: ${ans} diagonals`
          ],
          formulaStr
        );
      }

      case 'committee': {
        // Select committee of size k from M men and W women
        const men = Number(p1);
        const women = Number(p2);
        const k = Number(p3);

        if (!Number.isInteger(men) || !Number.isInteger(women) || !Number.isInteger(k) || men < 0 || women < 0 || k <= 0) {
          return ResultFormatter.error('Men, Women, and Committee size must be non-negative integers (k > 0).');
        }
        if (k > men + women) {
          return ResultFormatter.error(`Committee size (${k}) cannot exceed total pool (${men + women}).`);
        }

        const totalPool = men + women;
        const comb = this.combination(totalPool, k);
        const inputStr = `Pool: ${men} men, ${women} women (Total ${totalPool}), Committee size: ${k}`;
        const formulaStr = 'Unrestricted Ways = ⁿCᵣ where n = (Men + Women), r = Committee Size';
        const substitutionStr = `⁽${men}+${women}⁾C${k} = ⁽${totalPool}⁾C${k}`;
        const ans = comb.result.value;

        return ResultFormatter.success(
          {
            type: 'committee',
            men,
            women,
            k,
            value: ans,
            formatted: `${ans} combinations`,
            derivation: {
              input: inputStr,
              formula: formulaStr,
              substitution: substitutionStr,
              calculation: `Selecting any ${k} members out of ${totalPool} without gender restriction.`,
              finalAnswer: `${ans} ways`
            }
          },
          [
            `Input: ${inputStr}`,
            `Formula: ${formulaStr}`,
            `Substitution: ${substitutionStr}`,
            `Calculation: C(${totalPool}, ${k})`,
            `Final Answer: ${ans} committee formations`
          ],
          formulaStr
        );
      }

      default:
        return ResultFormatter.error(`Unknown selection problem type: ${type}`);
    }
  }
}
