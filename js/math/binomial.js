/**
 * OG - Binomial Theorem Mathematical Engine (Module 07: Binomial Theorem)
 * Computes:
 * - Full Binomial Expansion (a + b)^n
 * - General Term T_(r+1) = nCr · a^(n-r) · b^r
 * - Middle Term(s) (single if n even, twin if n odd)
 * - Specific Coefficient of x^k
 * - Pascal Triangle Generator
 *
 * For EVERY calculation returns structured:
 * - Input
 * - Formula
 * - Substitution
 * - Calculation
 * - Final Answer
 *
 * Architecture:
 * UI -> Module Controller -> BinomialMathEngine -> ResultFormatter -> UI
 */

import { ResultFormatter } from './formatter.js';
import { CombinatoricsMathEngine } from './combinatorics.js';

export class BinomialMathEngine {
  /**
   * Validates positive integer index n
   */
  static validateN(nInput) {
    if (nInput === null || nInput === undefined || String(nInput).trim() === '') {
      return { valid: false, error: 'Exponent n is required.' };
    }
    const n = Number(nInput);
    if (!Number.isInteger(n)) {
      return { valid: false, error: `Exponent n must be an integer, received: "${nInput}".` };
    }
    if (n < 0) {
      return { valid: false, error: `Exponent n must be non-negative (n ≥ 0), received: ${n}.` };
    }
    if (n > 64) {
      return { valid: false, error: `Exponent n (${n}) exceeds maximum polynomial expansion limit (64).` };
    }
    return { valid: true, n, error: null };
  }

  // --------------------------------------------------------------------------
  // 1. FULL BINOMIAL EXPANSION: (a + b)^n
  // --------------------------------------------------------------------------
  static expandBinomial(aStr = 'x', bStr = 'y', nInput = 4) {
    const check = this.validateN(nInput);
    if (!check.valid) return ResultFormatter.error(check.error);

    const n = check.n;
    const a = (aStr || 'x').trim();
    const b = (bStr || 'y').trim();

    const inputStr = `Expression: (${a} + ${b})ⁿ with n = ${n}`;
    const formulaStr = '(a + b)ⁿ = ∑ [ⁿCₖ · aⁿ⁻ᵏ · bᵏ] for k = 0 to n';

    const terms = [];
    const termSteps = [];

    for (let k = 0; k <= n; k++) {
      const coeff = CombinatoricsMathEngine.combination(n, k).result.value;
      const aPower = n - k;
      const bPower = k;

      let termLatex = '';
      if (coeff !== '1' || (aPower === 0 && bPower === 0)) {
        termLatex += coeff;
      }

      if (aPower > 0) {
        termLatex += aPower === 1 ? a : `${a}^${aPower}`;
      }
      if (bPower > 0) {
        termLatex += bPower === 1 ? b : `${b}^${bPower}`;
      }
      if (termLatex === '') termLatex = '1';

      terms.push(termLatex);
      termSteps.push(`k=${k}: ⁿC${k} · (${a})^${aPower} · (${b})^${bPower} = ${termLatex}`);
    }

    const expandedStr = terms.join(' + ').replace(/\+\s*-/g, '- ');
    const substitutionStr = `(${a} + ${b})^${n} = ⁿC₀(${a})^${n} + ⁿC₁(${a})^${n - 1}(${b}) + ... + ⁿC${n}(${b})^${n}`;
    const calculationStr = `Evaluated ${n + 1} binomial coefficients using ⁿCₖ and distributed exponents`;

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: expandedStr
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ${substitutionStr}`,
      `Calculation: ${termSteps.slice(0, 6).join('; ')}${termSteps.length > 6 ? '; ...' : ''}`,
      `Final Answer: (${a} + ${b})^${n} = ${expandedStr}`
    ];

    return ResultFormatter.success(
      {
        n,
        a,
        b,
        termsCount: n + 1,
        terms,
        expanded: expandedStr,
        formatted: expandedStr,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 2. GENERAL TERM: T_(r+1) = nCr · a^(n-r) · b^r
  // --------------------------------------------------------------------------
  static generalTerm(aStr = 'x', bStr = 'y', nInput = 5, rInput = 2) {
    const checkN = this.validateN(nInput);
    if (!checkN.valid) return ResultFormatter.error(checkN.error);

    const n = checkN.n;
    const rCheck = CombinatoricsMathEngine.validateNR(n, rInput);
    if (!rCheck.valid) return ResultFormatter.error(rCheck.error);

    const r = rCheck.r;
    const a = (aStr || 'x').trim();
    const b = (bStr || 'y').trim();

    const termIndex = r + 1;
    const inputStr = `Term index: T_${termIndex} (r = ${r}), from (${a} + ${b})^${n}`;
    const formulaStr = 'Tᵣ₊₁ = ⁿCᵣ · aⁿ⁻ʳ · bʳ';

    const combRes = CombinatoricsMathEngine.combination(n, r);
    const coeff = combRes.result.value;
    const aPower = n - r;
    const bPower = r;

    const substitutionStr = `T_${termIndex} = ⁿC${r} · (${a})^(${n}-${r}) · (${b})^${r} = ⁿC${r} · (${a})^${aPower} · (${b})^${bPower}`;
    const calculationStr = `ⁿC${r} = ${coeff}, a-exponent = ${aPower}, b-exponent = ${bPower}`;

    let finalTerm = '';
    if (coeff !== '1' || (aPower === 0 && bPower === 0)) finalTerm += coeff;
    if (aPower > 0) finalTerm += aPower === 1 ? a : `${a}^${aPower}`;
    if (bPower > 0) finalTerm += bPower === 1 ? b : `${b}^${bPower}`;
    if (finalTerm === '') finalTerm = '1';

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: finalTerm
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ${substitutionStr}`,
      `Calculation: ${calculationStr}`,
      `Final Answer: T_${termIndex} = ${finalTerm}`
    ];

    return ResultFormatter.success(
      {
        n,
        r,
        termIndex,
        coeff,
        aPower,
        bPower,
        term: finalTerm,
        formatted: `T_${termIndex} = ${finalTerm}`,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 3. MIDDLE TERM(S)
  // --------------------------------------------------------------------------
  static middleTerm(aStr = 'x', bStr = 'y', nInput = 6) {
    const check = this.validateN(nInput);
    if (!check.valid) return ResultFormatter.error(check.error);

    const n = check.n;
    const a = (aStr || 'x').trim();
    const b = (bStr || 'y').trim();

    const isEven = n % 2 === 0;
    const totalTerms = n + 1;

    let inputStr = `Expansion (${a} + ${b})^${n} (Total terms = ${totalTerms}, n is ${isEven ? 'EVEN' : 'ODD'})`;
    let formulaStr = '';
    let substitutionStr = '';
    let calculationStr = '';
    let finalAnswerStr = '';
    let middleTerms = [];

    if (isEven) {
      // Exactly 1 middle term at r = n / 2, which is term (n/2 + 1)
      const r = n / 2;
      const termIdx = r + 1;
      formulaStr = 'Since n is even, single middle term exists: T_(n/2 + 1) = ⁿC_(n/2) · a^(n/2) · b^(n/2)';
      substitutionStr = `r = ${n}/2 = ${r} ⟹ Middle Term = T_${termIdx}`;

      const tRes = this.generalTerm(a, b, n, r);
      calculationStr = `Computing T_${termIdx}: ${tRes.result.derivation.calculation}`;
      finalAnswerStr = `T_${termIdx} = ${tRes.result.term}`;
      middleTerms = [{ index: termIdx, r, term: tRes.result.term }];
    } else {
      // Exactly 2 middle terms at r1 = (n - 1) / 2 and r2 = (n + 1) / 2
      const r1 = (n - 1) / 2;
      const r2 = (n + 1) / 2;
      const idx1 = r1 + 1;
      const idx2 = r2 + 1;

      formulaStr = 'Since n is odd, two middle terms exist: T_((n+1)/2) and T_((n+3)/2)';
      substitutionStr = `Middle Terms: T_${idx1} (at r = ${r1}) and T_${idx2} (at r = ${r2})`;

      const t1 = this.generalTerm(a, b, n, r1);
      const t2 = this.generalTerm(a, b, n, r2);

      calculationStr = `Term 1: T_${idx1} = ${t1.result.term}; Term 2: T_${idx2} = ${t2.result.term}`;
      finalAnswerStr = `T_${idx1} = ${t1.result.term}  and  T_${idx2} = ${t2.result.term}`;
      middleTerms = [
        { index: idx1, r: r1, term: t1.result.term },
        { index: idx2, r: r2, term: t2.result.term }
      ];
    }

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: finalAnswerStr
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ${substitutionStr}`,
      `Calculation: ${calculationStr}`,
      `Final Answer: ${finalAnswerStr}`
    ];

    return ResultFormatter.success(
      {
        n,
        isEven,
        totalTerms,
        middleTerms,
        formatted: finalAnswerStr,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 4. SPECIFIC COEFFICIENT OF x^k IN (a x^p + b x^q)^n
  // --------------------------------------------------------------------------
  static findCoefficient(aCoeff = 1, pPower = 1, bCoeff = 1, qPower = 0, nInput = 5, targetPower = 2) {
    const check = this.validateN(nInput);
    if (!check.valid) return ResultFormatter.error(check.error);

    const n = check.n;
    const a = Number(aCoeff) || 1;
    const p = Number(pPower) || 1;
    const b = Number(bCoeff) || 1;
    const q = Number(qPower) || 0;
    const k = Number(targetPower) || 0;

    const inputStr = `Find coefficient of x^${k} in (${a === 1 ? '' : a}x${p === 1 ? '' : `^${p}`} + ${b === 1 ? '' : b}${q === 0 ? '' : `x^${q}`})^${n}`;
    const formulaStr = 'General Term: Tᵣ₊₁ = ⁿCᵣ · (axᵖ)ⁿ⁻ʳ · (bx^q)ʳ = ⁿCᵣ · aⁿ⁻ʳ · bʳ · x^[p(n - r) + q·r]';

    // Solve for r: p(n - r) + q·r = k  =>  p·n - (p - q)·r = k  =>  r = (p·n - k) / (p - q)
    const diffPQ = p - q;
    if (diffPQ === 0) {
      return ResultFormatter.error('Powers p and q cannot be equal when solving for a specific power of x.');
    }

    const num = p * n - k;
    if (num % diffPQ !== 0) {
      return ResultFormatter.error(`Power x^${k} cannot be formed: r = (${num} / ${diffPQ}) is not an integer.`);
    }

    const r = num / diffPQ;
    if (r < 0 || r > n) {
      return ResultFormatter.error(`Term x^${k} does not exist in this expansion (solved r = ${r}, which is outside [0, ${n}]).`);
    }

    const combVal = CombinatoricsMathEngine.combination(n, r).result.value;
    const aPart = Math.pow(a, n - r);
    const bPart = Math.pow(b, r);
    const finalCoeffNum = Number(combVal) * aPart * bPart;

    const substitutionStr = `p(n - r) + qr = ${p}(${n} - r) + ${q}r = ${k}  ⟹  ${p * n} - ${diffPQ}r = ${k}  ⟹  r = ${r}`;
    const calculationStr = `Coeff = ⁿC${r} · (${a})^(${n - r}) · (${b})^${r} = ${combVal} × ${aPart} × ${bPart} = ${finalCoeffNum}`;
    const finalAnsStr = finalCoeffNum.toString();

    const derivation = {
      input: inputStr,
      formula: formulaStr,
      substitution: substitutionStr,
      calculation: calculationStr,
      finalAnswer: `Coefficient of x^${k} = ${finalAnsStr} (in term T_${r + 1})`
    };

    const steps = [
      `Input: ${inputStr}`,
      `Formula: ${formulaStr}`,
      `Substitution: ${substitutionStr}`,
      `Calculation: ${calculationStr}`,
      `Final Answer: Coefficient of x^${k} is ${finalAnsStr}`
    ];

    return ResultFormatter.success(
      {
        n,
        r,
        termIndex: r + 1,
        targetPower: k,
        coefficient: finalCoeffNum,
        formatted: `Coefficient = ${finalAnsStr}`,
        derivation
      },
      steps,
      formulaStr
    );
  }

  // --------------------------------------------------------------------------
  // 5. PASCAL'S TRIANGLE GENERATOR
  // --------------------------------------------------------------------------
  static pascalTriangle(numRows = 7) {
    const rows = Math.min(Math.max(Number(numRows) || 6, 1), 16);
    const triangle = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c <= r; c++) {
        if (c === 0 || c === r) {
          row.push(1);
        } else {
          row.push(triangle[r - 1][c - 1] + triangle[r - 1][c]);
        }
      }
      triangle.push(row);
    }

    return ResultFormatter.success(
      {
        rows,
        triangle,
        formatted: `${rows} rows generated`
      },
      [
        `Generated ${rows} rows of Pascal's Triangle.`,
        'Every cell represents ⁿCᵣ, satisfying Pascal’s identity: ⁿCᵣ = ⁿ⁻¹Cᵣ₋₁ + ⁿ⁻¹Cᵣ.'
      ],
      'ⁿCᵣ = ⁿ⁻¹Cᵣ₋₁ + ⁿ⁻¹Cᵣ'
    );
  }
}
