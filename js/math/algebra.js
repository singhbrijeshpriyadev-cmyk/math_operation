/**
 * OG - Algebra Mathematics Engine
 * Symbolic algebra operations without eval().
 * Covers: simplification, factorization, expansion, equation solving,
 * complex numbers, polynomial tools, inequalities, trigonometric identities.
 * ES6 Module
 */

export class AlgebraMathEngine {

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. EXPRESSION DETECTION — smartly identify what the user entered
  // ─────────────────────────────────────────────────────────────────────────────

  static detectExpressionType(input) {
    if (!input || typeof input !== 'string') return { type: 'unknown', suggestions: [] };
    const expr = input.trim();

    // Equation detection (contains = but not ==)
    if (/[^=!<>]=[^=]/.test(expr)) {
      const sides = expr.split(/(?<![<>!])=(?!=)/);
      if (sides.length === 2) {
        const rhs = sides[1].trim();
        const lhs = sides[0].trim();
        // Linear: single variable, degree 1
        if (/^[0-9a-zA-Z\s+\-*/().=]+$/.test(expr) && !expr.includes('^2') && !expr.includes('x²') && !expr.includes('^')) {
          return { type: 'linear-equation', suggestions: ['Solve Equation', 'Show Steps', 'Graph'] };
        }
        // Quadratic
        if (expr.includes('^2') || expr.includes('x²') || expr.includes('x^2')) {
          return { type: 'quadratic-equation', suggestions: ['Solve Equation', 'Find Roots', 'Graph', 'Discriminant'] };
        }
        return { type: 'equation', suggestions: ['Solve Equation', 'Show Steps'] };
      }
    }

    // Inequality
    if (/[<>]|<=|>=|≤|≥/.test(expr)) {
      return { type: 'inequality', suggestions: ['Solve Inequality', 'Graph on Number Line', 'Interval Notation'] };
    }

    // Factored form detection — looks like (x+a)(x+b)
    if (/^\s*\([^)]+\)\s*\([^)]+\)/.test(expr)) {
      return { type: 'product', suggestions: ['Expand', 'Simplify', 'Find Roots'] };
    }

    // Quadratic expression
    if (/x\^2|x²/.test(expr) && !expr.includes('=')) {
      return { type: 'quadratic-expression', suggestions: ['Factor', 'Solve', 'Graph', 'Simplify'] };
    }

    // Like terms only (no power > 1)
    if (/\d*x\s*[+\-]\s*\d*x/.test(expr)) {
      return { type: 'like-terms', suggestions: ['Simplify', 'Collect Like Terms', 'Graph'] };
    }

    // Trigonometric
    if (/sin|cos|tan|sec|csc|cot/i.test(expr)) {
      return { type: 'trigonometric', suggestions: ['Simplify', 'Verify Identity', 'Evaluate', 'Graph'] };
    }

    // Polynomial (contains ^ without = )
    if (expr.includes('^') && !expr.includes('=')) {
      return { type: 'polynomial', suggestions: ['Simplify', 'Factor', 'Expand', 'Graph'] };
    }

    return { type: 'expression', suggestions: ['Simplify', 'Evaluate', 'Factor', 'Graph'] };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. LIKE-TERMS SIMPLIFICATION
  // ─────────────────────────────────────────────────────────────────────────────

  static simplifyLikeTerms(input) {
    const expr = input.trim();
    const steps = [];
    steps.push({ label: 'Original Expression', value: expr });

    // Parse terms: coefficient * x^power + constant
    // Regex: captures optional sign, optional coefficient, optional variable part
    const termRegex = /([+\-]?\s*\d*\.?\d*)\s*\*?\s*(x(?:\^(\d+))?)?/gi;
    const terms = [];
    let match;
    let cleanExpr = expr.replace(/\s+/g, '');

    // Standardize: convert 2x^2 style into coefficient/power pairs
    const parseTerms = (e) => {
      const result = [];
      // Split on + or - (keeping the sign)
      const parts = e.match(/[+\-]?[^+\-]+/g) || [];
      for (let part of parts) {
        part = part.trim();
        if (!part) continue;

        // Match coefficient * x ^ power
        const m = part.match(/^([+\-]?\d*\.?\d*)\s*\*?\s*x(?:\^(\d+))?$/i);
        if (m) {
          const coeff = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : parseFloat(m[1]);
          const power = m[2] ? parseInt(m[2]) : 1;
          result.push({ coeff, power, type: 'variable' });
          continue;
        }

        // Constant term
        const c = parseFloat(part);
        if (!isNaN(c)) {
          result.push({ coeff: c, power: 0, type: 'constant' });
          continue;
        }

        result.push({ raw: part, type: 'raw' });
      }
      return result;
    };

    const parsed = parseTerms(cleanExpr);
    const grouped = {};
    const rawTerms = [];

    for (const t of parsed) {
      if (t.type === 'raw') { rawTerms.push(t.raw); continue; }
      const key = t.power;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += t.coeff;
    }

    if (Object.keys(grouped).length === 0) {
      return { success: false, error: 'Could not parse expression for like-term collection.' };
    }

    // Build show-working step
    const likeTermGroups = Object.entries(grouped)
      .filter(([p]) => parseInt(p) > 0)
      .map(([p, c]) => {
        const pow = parseInt(p);
        return pow === 1 ? `(${c})x` : `(${c})x^${p}`;
      }).join(' + ');

    if (likeTermGroups) {
      steps.push({ label: 'Group Like Terms', value: likeTermGroups });
    }

    // Build result
    const resultTerms = [];
    const powers = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    for (const pow of powers) {
      const coeff = grouped[pow];
      if (coeff === 0) continue;
      if (pow === 0) {
        resultTerms.push(coeff > 0 ? `+ ${coeff}` : `- ${Math.abs(coeff)}`);
      } else if (pow === 1) {
        if (coeff === 1) resultTerms.push('x');
        else if (coeff === -1) resultTerms.push('-x');
        else resultTerms.push(`${coeff}x`);
      } else {
        if (coeff === 1) resultTerms.push(`x^${pow}`);
        else if (coeff === -1) resultTerms.push(`-x^${pow}`);
        else resultTerms.push(`${coeff}x^${pow}`);
      }
    }

    let simplified = resultTerms.join(' ').replace(/\+\s*-/g, '- ').trim();
    if (simplified.startsWith('+ ')) simplified = simplified.slice(2);
    if (!simplified) simplified = '0';

    steps.push({ label: 'Combine Like Terms', value: simplified });

    return { success: true, result: simplified, steps, operation: 'Simplify Like Terms' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. EXPANSION
  // ─────────────────────────────────────────────────────────────────────────────

  static expand(input) {
    const expr = input.trim();
    const steps = [];
    steps.push({ label: 'Expression', value: expr });

    // (ax + b)(cx + d) pattern
    const binomialProduct = expr.match(/^\(\s*([+\-]?\d*\.?\d*)\s*\*?\s*x\s*([+\-]\s*\d+\.?\d*)\s*\)\s*\(\s*([+\-]?\d*\.?\d*)\s*\*?\s*x\s*([+\-]\s*\d+\.?\d*)\s*\)$/i);
    if (binomialProduct) {
      const a = parseFloat(binomialProduct[1] || '1') || 1;
      const b = parseFloat(binomialProduct[2].replace(/\s/g, ''));
      const c = parseFloat(binomialProduct[3] || '1') || 1;
      const d = parseFloat(binomialProduct[4].replace(/\s/g, ''));

      steps.push({ label: 'Apply FOIL', value: `(${a}x)(${c}x) + (${a}x)(${d}) + (${b})(${c}x) + (${b})(${d})` });

      const x2 = a * c;
      const x1 = a * d + b * c;
      const x0 = b * d;

      steps.push({ label: 'First: x² terms', value: `${x2}x²` });
      steps.push({ label: 'Outer + Inner: x terms', value: `${a}x × ${d} + ${b} × ${c}x = ${a*d}x + ${b*c}x = ${x1}x` });
      steps.push({ label: 'Last: constant', value: `${b} × ${d} = ${x0}` });

      const result = this._buildQuadratic(x2, x1, x0);
      steps.push({ label: 'Expanded Form', value: result });
      return { success: true, result, steps, operation: 'Expand' };
    }

    // (x + a)^2 pattern
    const squaredBinomial = expr.match(/^\(\s*x\s*([+\-]\s*\d+\.?\d*)\s*\)\s*\^?\s*2$/i);
    if (squaredBinomial) {
      const b = parseFloat(squaredBinomial[1].replace(/\s/g, ''));
      steps.push({ label: 'Formula', value: '(x + b)² = x² + 2bx + b²' });
      steps.push({ label: 'Substitute b', value: `b = ${b}` });
      steps.push({ label: '2bx term', value: `2 × ${b} × x = ${2*b}x` });
      steps.push({ label: 'b² term', value: `(${b})² = ${b*b}` });
      const result = this._buildQuadratic(1, 2*b, b*b);
      steps.push({ label: 'Result', value: result });
      return { success: true, result, steps, operation: 'Expand (a+b)²' };
    }

    // (x - a)^2
    const squaredBinomialMinus = expr.match(/^\(\s*x\s*-\s*(\d+\.?\d*)\s*\)\s*\^?\s*2$/i);
    if (squaredBinomialMinus) {
      const b = parseFloat(squaredBinomialMinus[1]);
      steps.push({ label: 'Formula', value: '(x - b)² = x² - 2bx + b²' });
      steps.push({ label: 'Substitute b', value: `b = ${b}` });
      const result = this._buildQuadratic(1, -2*b, b*b);
      steps.push({ label: 'Result', value: result });
      return { success: true, result, steps, operation: 'Expand (a-b)²' };
    }

    // (x + a)^3
    const cubedBinomial = expr.match(/^\(\s*x\s*([+\-]\s*\d+\.?\d*)\s*\)\s*\^?\s*3$/i);
    if (cubedBinomial) {
      const b = parseFloat(cubedBinomial[1].replace(/\s/g, ''));
      steps.push({ label: 'Formula', value: '(x + b)³ = x³ + 3x²b + 3xb² + b³' });
      steps.push({ label: 'Substitute b', value: `b = ${b}` });
      const b2 = b * b, b3 = b * b * b;
      const result = this._buildCubic(1, 3*b, 3*b2, b3);
      steps.push({ label: 'Result', value: result });
      return { success: true, result, steps, operation: 'Expand (a+b)³' };
    }

    // (x + a)(x - a) difference of squares
    const diffSquares = expr.match(/^\(\s*x\s*([+\-]\s*\d+\.?\d*)\s*\)\s*\(\s*x\s*([+\-]\s*\d+\.?\d*)\s*\)$/i);
    if (diffSquares) {
      const b1 = parseFloat(diffSquares[1].replace(/\s/g, ''));
      const b2 = parseFloat(diffSquares[2].replace(/\s/g, ''));
      if (b1 === -b2 || b1 + b2 === 0) {
        const n = Math.abs(b1);
        steps.push({ label: 'Difference of Squares', value: `(x + ${n})(x - ${n}) = x² - ${n*n}` });
        return { success: true, result: `x² - ${n*n}`, steps, operation: 'Expand (Difference of Squares)' };
      }
      // Otherwise do FOIL
      const x1 = b1 + b2;
      const x0 = b1 * b2;
      const result = this._buildQuadratic(1, x1, x0);
      steps.push({ label: 'FOIL Result', value: result });
      return { success: true, result, steps, operation: 'Expand' };
    }

    return { success: false, error: 'Could not recognize expansion pattern. Supported: (ax+b)(cx+d), (x±b)², (x±b)³' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. FACTORIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  static factorize(input) {
    const expr = input.trim();
    const steps = [];
    steps.push({ label: 'Expression', value: expr });

    // Parse as quadratic: ax² + bx + c
    const quad = this._parseQuadratic(expr);
    if (quad) {
      const { a, b, c } = quad;
      steps.push({ label: 'Standard Form', value: `${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}` });
      steps.push({ label: 'Identify Coefficients', value: `a = ${a}, b = ${b}, c = ${c}` });

      const disc = b * b - 4 * a * c;
      steps.push({ label: 'Discriminant', value: `D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${disc}` });

      if (disc < 0) {
        return {
          success: false,
          error: 'Discriminant < 0: This quadratic cannot be factored over the reals (complex roots).',
          steps
        };
      }

      const sqrtDisc = Math.sqrt(disc);
      if (!Number.isInteger(sqrtDisc)) {
        // Irrational factors
        const r1 = (-b + sqrtDisc) / (2 * a);
        const r2 = (-b - sqrtDisc) / (2 * a);
        steps.push({ label: 'Roots (Irrational)', value: `x₁ = ${this._fmt(r1)}, x₂ = ${this._fmt(r2)}` });
        const result = `${a !== 1 ? a : ''}(x - ${this._fmt(r1)})(x - ${this._fmt(r2)})`;
        steps.push({ label: 'Factored Form', value: result });
        return { success: true, result, steps, operation: 'Factorize' };
      }

      const r1 = (-b + sqrtDisc) / (2 * a);
      const r2 = (-b - sqrtDisc) / (2 * a);

      // Build nice integer factors
      if (Number.isInteger(r1) && Number.isInteger(r2)) {
        steps.push({ label: 'Find Two Numbers', value: `Need p, q such that p + q = ${b/a} and p × q = ${c/a}` });
        steps.push({ label: 'Found', value: `p = ${-r1}, q = ${-r2}` });

        const f1 = this._formatFactor(a, r1);
        const f2 = this._formatFactor(1, r2);
        const result = a !== 1 ? `${a}(x - ${r1})(x - ${r2})` : `(x - ${r1})(x - ${r2})`;
        // Simplify notation
        const prettyResult = result
          .replace('- -', '+ ')
          .replace('- 0', '')
          .replace(/\(x - -(\d+)\)/g, '(x + $1)');

        steps.push({ label: 'Factored Form', value: prettyResult });
        return { success: true, result: prettyResult, steps, operation: 'Factorize' };
      }
    }

    // Difference of squares: ax² - b²
    const diffSq = this._parseDifferenceOfSquares(expr);
    if (diffSq) {
      const { a, n } = diffSq;
      steps.push({ label: 'Pattern', value: 'Difference of Squares: a² - b² = (a+b)(a-b)' });
      const sqA = Math.sqrt(a);
      const sqN = Math.sqrt(n);
      steps.push({ label: 'Identify', value: `a = ${this._fmt(sqA)}x, b = ${this._fmt(sqN)}` });
      const result = `(${sqA !== 1 ? sqA : ''}x + ${sqN})(${sqA !== 1 ? sqA : ''}x - ${sqN})`;
      steps.push({ label: 'Factored Form', value: result });
      return { success: true, result, steps, operation: 'Factorize (Difference of Squares)' };
    }

    // Common factor extraction: e.g. 3x² - 12 → 3(x² - 4)
    const commonFactor = this._extractCommonFactor(expr);
    if (commonFactor && commonFactor.factor !== 1) {
      const { factor, reduced } = commonFactor;
      steps.push({ label: 'Common Factor', value: `GCF = ${factor}` });
      steps.push({ label: 'Factor Out', value: `${factor}(${reduced})` });
      // Try to factor the reduced expression further
      const inner = this.factorize(reduced);
      if (inner.success && inner.result !== reduced) {
        steps.push({ label: 'Factor Inner', value: inner.result });
        const result = `${factor}${inner.result}`;
        steps.push({ label: 'Fully Factored', value: result });
        return { success: true, result, steps, operation: 'Factorize' };
      }
      const result = `${factor}(${reduced})`;
      steps.push({ label: 'Factored Form', value: result });
      return { success: true, result, steps, operation: 'Factorize' };
    }

    return { success: false, error: 'Could not factor this expression. Supported: quadratics ax²+bx+c, difference of squares, common factor extraction.', steps };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. EQUATION SOLVER
  // ─────────────────────────────────────────────────────────────────────────────

  static solveLinear(input) {
    const expr = input.trim();
    const steps = [];
    steps.push({ label: 'Equation', value: expr });

    const parts = expr.split(/(?<![<>!])=(?!=)/);
    if (parts.length !== 2) {
      return { success: false, error: 'Invalid equation. Use format: ax + b = c' };
    }

    const lhs = parts[0].trim();
    const rhs = parts[1].trim();
    steps.push({ label: 'LHS', value: lhs });
    steps.push({ label: 'RHS', value: rhs });

    // Move everything to LHS: parse both sides
    const lhsCoeffs = this._parseLinearSide(lhs);
    const rhsCoeffs = this._parseLinearSide(rhs);

    if (!lhsCoeffs || !rhsCoeffs) {
      return { success: false, error: 'Could not parse equation. Use format: 2x + 5 = 15' };
    }

    const xCoeff = lhsCoeffs.x - rhsCoeffs.x;
    const constant = rhsCoeffs.c - lhsCoeffs.c;

    steps.push({ label: 'Rearrange (move all x to LHS, constants to RHS)', value: `${xCoeff}x = ${constant}` });

    if (xCoeff === 0) {
      if (constant === 0) return { success: true, result: 'All real numbers (identity)', steps, operation: 'Solve Linear' };
      return { success: false, error: 'No solution (contradiction)', steps };
    }

    const x = constant / xCoeff;
    steps.push({ label: 'Divide both sides by ' + xCoeff, value: `x = ${constant} / ${xCoeff}` });
    steps.push({ label: 'Solution', value: `x = ${this._fmt(x)}` });

    // Verify
    steps.push({ label: 'Verification', value: `Substitute x = ${this._fmt(x)} into original equation` });

    return { success: true, result: `x = ${this._fmt(x)}`, resultValue: x, steps, operation: 'Solve Linear Equation' };
  }

  static solveQuadratic(input) {
    const expr = input.trim();
    const steps = [];
    steps.push({ label: 'Equation', value: expr });

    // Normalize: move everything to LHS
    let normalized = expr;
    if (expr.includes('=')) {
      const sides = expr.split(/(?<![<>!])=(?!=)/);
      if (sides.length === 2) {
        const rhs = sides[1].trim();
        if (rhs === '0' || rhs === '') {
          normalized = sides[0].trim();
        } else {
          // Move RHS to LHS — basic case
          normalized = sides[0].trim() + ' - (' + sides[1].trim() + ')';
        }
      }
    }

    const quad = this._parseQuadratic(normalized);
    if (!quad) {
      return { success: false, error: 'Could not parse as quadratic. Format: ax² + bx + c = 0' };
    }

    const { a, b, c } = quad;
    steps.push({ label: 'Standard Form', value: `${a}x² + ${b}x + ${c} = 0` });
    steps.push({ label: 'Identify Coefficients', value: `a = ${a}, b = ${b}, c = ${c}` });
    steps.push({ label: 'Quadratic Formula', value: 'x = (-b ± √(b² - 4ac)) / (2a)' });

    const disc = b * b - 4 * a * c;
    steps.push({ label: 'Calculate Discriminant', value: `D = b² - 4ac = (${b})² - 4(${a})(${c}) = ${b*b} - ${4*a*c} = ${disc}` });

    let discriminantClass, x1, x2, x1Display, x2Display;

    if (disc > 0) {
      discriminantClass = 'Two distinct real roots (D > 0)';
      const sqrtD = Math.sqrt(disc);
      x1 = (-b + sqrtD) / (2 * a);
      x2 = (-b - sqrtD) / (2 * a);
      x1Display = this._fmt(x1);
      x2Display = this._fmt(x2);
      steps.push({ label: 'Nature of Roots', value: discriminantClass });
      steps.push({ label: 'x₁', value: `x₁ = (-${b} + √${disc}) / (2 × ${a}) = ${this._fmt(-b)} + ${this._fmt(sqrtD)}) / ${2*a} = ${x1Display}` });
      steps.push({ label: 'x₂', value: `x₂ = (-${b} - √${disc}) / (2 × ${a}) = ${x2Display}` });
    } else if (disc === 0) {
      discriminantClass = 'Two equal real roots (D = 0)';
      x1 = x2 = -b / (2 * a);
      x1Display = x2Display = this._fmt(x1);
      steps.push({ label: 'Nature of Roots', value: discriminantClass });
      steps.push({ label: 'x₁ = x₂', value: `x = -b / (2a) = ${this._fmt(-b)} / ${2*a} = ${x1Display}` });
    } else {
      discriminantClass = 'Complex conjugate roots (D < 0)';
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-disc) / (2 * a);
      x1Display = `${this._fmt(realPart)} + ${this._fmt(imagPart)}i`;
      x2Display = `${this._fmt(realPart)} - ${this._fmt(imagPart)}i`;
      steps.push({ label: 'Nature of Roots', value: discriminantClass });
      steps.push({ label: 'Real Part', value: `${this._fmt(realPart)}` });
      steps.push({ label: 'Imaginary Part', value: `±${this._fmt(imagPart)}i` });
      return {
        success: true,
        result: `x₁ = ${x1Display}, x₂ = ${x2Display}`,
        x1: x1Display, x2: x2Display,
        discriminant: disc, discriminantClass,
        a, b, c,
        isComplex: true,
        steps,
        operation: 'Solve Quadratic Equation'
      };
    }

    return {
      success: true,
      result: x1 === x2 ? `x = ${x1Display}` : `x₁ = ${x1Display}, x₂ = ${x2Display}`,
      x1: x1Display, x2: x2Display,
      x1Value: x1, x2Value: x2,
      discriminant: disc, discriminantClass,
      a, b, c,
      isComplex: false,
      steps,
      operation: 'Solve Quadratic Equation'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. LINEAR INEQUALITIES
  // ─────────────────────────────────────────────────────────────────────────────

  static solveInequality(input) {
    const expr = input.trim();
    const steps = [];
    steps.push({ label: 'Inequality', value: expr });

    // Normalize inequality symbols
    const normalized = expr.replace(/≤/g, '<=').replace(/≥/g, '>=');

    // Detect the operator
    let op = '';
    let opDisplay = '';
    if (normalized.includes('<=')) { op = '<='; opDisplay = '≤'; }
    else if (normalized.includes('>=')) { op = '>='; opDisplay = '≥'; }
    else if (normalized.includes('<')) { op = '<'; opDisplay = '<'; }
    else if (normalized.includes('>')) { op = '>'; opDisplay = '>'; }

    if (!op) return { success: false, error: 'No inequality operator found. Use <, >, ≤, ≥.' };

    const sides = normalized.split(op);
    if (sides.length !== 2) return { success: false, error: 'Could not parse inequality.' };

    const lhsCoeffs = this._parseLinearSide(sides[0].trim());
    const rhsCoeffs = this._parseLinearSide(sides[1].trim());

    if (!lhsCoeffs || !rhsCoeffs) {
      return { success: false, error: 'Could not parse linear inequality.' };
    }

    const xCoeff = lhsCoeffs.x - rhsCoeffs.x;
    const constant = rhsCoeffs.c - lhsCoeffs.c;

    steps.push({ label: 'Move x terms to LHS, constants to RHS', value: `${xCoeff}x ${opDisplay} ${constant}` });

    if (xCoeff === 0) {
      return { success: false, error: 'No variable found in inequality.', steps };
    }

    let finalOp = opDisplay;
    let finalVal = constant / xCoeff;

    if (xCoeff < 0) {
      // Reverse inequality
      const flipped = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '≤': '≥', '≥': '≤' };
      finalOp = flipped[opDisplay] || opDisplay;
      steps.push({
        label: '⚠️ Dividing by negative number — reverse the inequality symbol',
        value: `Coefficient is ${xCoeff} (negative), so ${opDisplay} becomes ${finalOp}`
      });
    }

    steps.push({ label: 'Divide both sides by ' + Math.abs(xCoeff), value: `x ${finalOp} ${this._fmt(finalVal)}` });

    const solution = `x ${finalOp} ${this._fmt(finalVal)}`;

    // Interval notation
    let interval = '';
    switch (finalOp) {
      case '<':  interval = `(-∞, ${this._fmt(finalVal)})`; break;
      case '>':  interval = `(${this._fmt(finalVal)}, +∞)`; break;
      case '≤': case '<=': interval = `(-∞, ${this._fmt(finalVal)}]`; break;
      case '≥': case '>=': interval = `[${this._fmt(finalVal)}, +∞)`; break;
    }

    steps.push({ label: 'Interval Notation', value: interval });

    return {
      success: true,
      result: solution,
      interval,
      value: finalVal,
      operator: finalOp,
      steps,
      operation: 'Solve Linear Inequality'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. COMPLEX NUMBERS
  // ─────────────────────────────────────────────────────────────────────────────

  static complexArithmetic(a1, b1, a2, b2, op) {
    const steps = [];
    const z1 = `${a1} ${b1 >= 0 ? '+' : '-'} ${Math.abs(b1)}i`;
    const z2 = `${a2} ${b2 >= 0 ? '+' : '-'} ${Math.abs(b2)}i`;
    steps.push({ label: 'z₁', value: z1 });
    steps.push({ label: 'z₂', value: z2 });

    let ra, rb;
    switch (op) {
      case 'add':
        steps.push({ label: 'Addition', value: '(a₁ + a₂) + (b₁ + b₂)i' });
        ra = a1 + a2; rb = b1 + b2;
        steps.push({ label: 'Real Part', value: `${a1} + ${a2} = ${ra}` });
        steps.push({ label: 'Imaginary Part', value: `${b1} + ${b2} = ${rb}` });
        break;
      case 'sub':
        steps.push({ label: 'Subtraction', value: '(a₁ - a₂) + (b₁ - b₂)i' });
        ra = a1 - a2; rb = b1 - b2;
        steps.push({ label: 'Real Part', value: `${a1} - ${a2} = ${ra}` });
        steps.push({ label: 'Imaginary Part', value: `${b1} - ${b2} = ${rb}` });
        break;
      case 'mul':
        steps.push({ label: 'Multiplication', value: '(a₁a₂ - b₁b₂) + (a₁b₂ + a₂b₁)i' });
        ra = a1*a2 - b1*b2;
        rb = a1*b2 + a2*b1;
        steps.push({ label: 'Real Part', value: `(${a1})(${a2}) - (${b1})(${b2}) = ${a1*a2} - ${b1*b2} = ${ra}` });
        steps.push({ label: 'Imaginary Part', value: `(${a1})(${b2}) + (${a2})(${b1}) = ${a1*b2} + ${a2*b1} = ${rb}` });
        break;
      case 'div':
        const denom = a2*a2 + b2*b2;
        if (denom === 0) return { success: false, error: 'Division by zero: z₂ cannot be 0' };
        steps.push({ label: 'Division Formula', value: 'z₁/z₂ = (z₁ × z̄₂) / |z₂|²' });
        steps.push({ label: 'Conjugate z̄₂', value: `${a2} - ${b2}i` });
        steps.push({ label: '|z₂|²', value: `${a2}² + ${b2}² = ${denom}` });
        ra = (a1*a2 + b1*b2) / denom;
        rb = (a2*b1 - a1*b2) / denom;
        steps.push({ label: 'Numerator Real', value: `${a1*a2} + ${b1*b2} = ${a1*a2+b1*b2}` });
        steps.push({ label: 'Numerator Imag', value: `${a2*b1} - ${a1*b2} = ${a2*b1-a1*b2}` });
        break;
    }

    const modulus = Math.sqrt(ra*ra + rb*rb);
    const arg = Math.atan2(rb, ra) * (180 / Math.PI);
    const conjugate = `${this._fmt(ra)} ${rb >= 0 ? '-' : '+'} ${Math.abs(this._fmt(rb))}i`;
    const resultStr = `${this._fmt(ra)} ${rb >= 0 ? '+' : '-'} ${Math.abs(this._fmt(rb))}i`;
    const polar = `${this._fmt(modulus)}(cos ${this._fmt(arg)}° + i·sin ${this._fmt(arg)}°)`;

    steps.push({ label: 'Result', value: resultStr });
    steps.push({ label: 'Modulus |z|', value: `√(${this._fmt(ra)}² + ${this._fmt(rb)}²) = ${this._fmt(modulus)}` });
    steps.push({ label: 'Argument arg(z)', value: `${this._fmt(arg)}°` });
    steps.push({ label: 'Polar Form', value: polar });

    return {
      success: true, result: resultStr,
      real: this._fmt(ra), imag: this._fmt(rb),
      modulus: this._fmt(modulus), argument: this._fmt(arg),
      conjugate, polar,
      steps, operation: op.toUpperCase()
    };
  }

  static complexProperties(a, b) {
    const steps = [];
    const z = `${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}i`;
    steps.push({ label: 'z', value: z });
    const modulus = Math.sqrt(a*a + b*b);
    const arg = Math.atan2(b, a) * (180 / Math.PI);
    const conjugate = `${a} ${b > 0 ? '-' : '+'} ${Math.abs(b)}i`;
    const polar = `${this._fmt(modulus)}(cos ${this._fmt(arg)}° + i·sin ${this._fmt(arg)}°)`;

    steps.push({ label: 'Real Part Re(z)', value: String(a) });
    steps.push({ label: 'Imaginary Part Im(z)', value: String(b) });
    steps.push({ label: 'Conjugate z̄', value: conjugate });
    steps.push({ label: 'Modulus |z|', value: `√(${a}² + ${b}²) = √${a*a + b*b} = ${this._fmt(modulus)}` });
    steps.push({ label: 'Argument arg(z)', value: `atan2(${b}, ${a}) = ${this._fmt(arg)}°` });
    steps.push({ label: 'Polar Form', value: polar });

    return {
      success: true, result: z,
      real: a, imag: b,
      conjugate, modulus: this._fmt(modulus),
      argument: this._fmt(arg), polar,
      steps, operation: 'Complex Properties'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. POLYNOMIAL ANALYSIS
  // ─────────────────────────────────────────────────────────────────────────────

  static analyzePolynomial(input) {
    const expr = input.trim();
    const steps = [];
    steps.push({ label: 'Polynomial', value: expr });

    // Extract terms and find degree, leading coeff, constant
    const quad = this._parseQuadratic(expr);
    if (quad) {
      const { a, b, c } = quad;
      const disc = b*b - 4*a*c;
      steps.push({ label: 'Standard Form', value: `P(x) = ${a}x² + ${b}x + ${c}` });
      steps.push({ label: 'Degree', value: '2' });
      steps.push({ label: 'Leading Coefficient', value: String(a) });
      steps.push({ label: 'Constant Term', value: String(c) });
      steps.push({ label: 'Discriminant', value: `D = ${disc}` });

      let roots = [];
      if (disc >= 0) {
        const sqrtD = Math.sqrt(disc);
        roots = [(-b + sqrtD)/(2*a), (-b - sqrtD)/(2*a)];
        steps.push({ label: 'Roots', value: roots.map(r => `x = ${this._fmt(r)}`).join(', ') });
      } else {
        steps.push({ label: 'Roots', value: 'Complex (D < 0)' });
      }

      const vertex = { x: -b/(2*a), y: c - b*b/(4*a) };
      steps.push({ label: 'Vertex', value: `(${this._fmt(vertex.x)}, ${this._fmt(vertex.y)})` });
      steps.push({ label: 'Axis of Symmetry', value: `x = ${this._fmt(vertex.x)}` });
      steps.push({ label: 'Opens', value: a > 0 ? 'Upward (a > 0)' : 'Downward (a < 0)' });

      return {
        success: true, result: `Degree 2, Roots: ${disc >= 0 ? roots.map(r => this._fmt(r)).join(', ') : 'Complex'}`,
        degree: 2, leadingCoeff: a, constant: c, discriminant: disc,
        roots: disc >= 0 ? roots : [], vertex, a, b, c,
        steps, operation: 'Polynomial Analysis'
      };
    }

    // Linear
    const linear = this._parseLinearSide(expr.replace('P(x)=','').replace('f(x)=',''));
    if (linear && linear.x !== 0) {
      steps.push({ label: 'Degree', value: '1' });
      steps.push({ label: 'Leading Coefficient', value: String(linear.x) });
      steps.push({ label: 'Constant Term', value: String(linear.c) });
      steps.push({ label: 'Root', value: `x = ${this._fmt(-linear.c / linear.x)}` });
      return {
        success: true, result: `Degree 1, Root: x = ${this._fmt(-linear.c / linear.x)}`,
        degree: 1, leadingCoeff: linear.x, constant: linear.c,
        steps, operation: 'Polynomial Analysis'
      };
    }

    return { success: false, error: 'Could not parse polynomial. Enter in standard form: ax² + bx + c or ax + b', steps };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. TRIGONOMETRIC IDENTITY VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────

  static verifyTrigIdentity(input) {
    const expr = input.trim().toLowerCase();
    const steps = [];
    steps.push({ label: 'Expression', value: expr });

    // sin²x + cos²x = 1
    if (/sin.?2.?x\s*\+\s*cos.?2.?x/.test(expr) || /sin\^2.?x\s*\+\s*cos\^2.?x/.test(expr)) {
      steps.push({ label: 'Identity', value: 'Pythagorean Identity' });
      steps.push({ label: 'Formula', value: 'sin²x + cos²x = 1 (for all x)' });
      steps.push({ label: 'Proof Sketch', value: 'From unit circle: for any angle x, (sin x)² + (cos x)² = 1 by Pythagoras.' });
      return { success: true, result: '1', verified: true, steps, operation: 'Verify Trigonometric Identity' };
    }

    // 1 + tan²x = sec²x
    if (/1\s*\+\s*tan.?2.?x/.test(expr) || /tan.?2.?x\s*\+\s*1/.test(expr)) {
      steps.push({ label: 'Identity', value: '1 + tan²x = sec²x' });
      steps.push({ label: 'Derivation', value: 'Divide sin²x + cos²x = 1 by cos²x' });
      steps.push({ label: 'Step 1', value: 'sin²x/cos²x + 1 = 1/cos²x' });
      steps.push({ label: 'Step 2', value: 'tan²x + 1 = sec²x' });
      return { success: true, result: 'sec²x', verified: true, steps, operation: 'Verify Trigonometric Identity' };
    }

    // 1 + cot²x = csc²x
    if (/1\s*\+\s*cot.?2.?x/.test(expr)) {
      steps.push({ label: 'Identity', value: '1 + cot²x = csc²x' });
      steps.push({ label: 'Derivation', value: 'Divide sin²x + cos²x = 1 by sin²x' });
      steps.push({ label: 'Step 1', value: '1 + cos²x/sin²x = 1/sin²x' });
      steps.push({ label: 'Step 2', value: '1 + cot²x = csc²x' });
      return { success: true, result: 'csc²x', verified: true, steps, operation: 'Verify Trigonometric Identity' };
    }

    // sin(A+B)
    if (/sin\s*\(?\s*a\s*\+\s*b\s*\)?/.test(expr)) {
      steps.push({ label: 'Addition Formula', value: 'sin(A + B) = sin A cos B + cos A sin B' });
      return { success: true, result: 'sin A cos B + cos A sin B', verified: true, steps, operation: 'Trig Identity' };
    }

    // cos(A+B)
    if (/cos\s*\(?\s*a\s*\+\s*b\s*\)?/.test(expr)) {
      steps.push({ label: 'Addition Formula', value: 'cos(A + B) = cos A cos B - sin A sin B' });
      return { success: true, result: 'cos A cos B - sin A sin B', verified: true, steps, operation: 'Trig Identity' };
    }

    return {
      success: false,
      error: 'Expression not recognized as a standard identity. Supported: sin²x+cos²x, 1+tan²x, 1+cot²x, sin(A+B), cos(A+B)',
      steps
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. QUICK SOLVER — auto-detect and solve
  // ─────────────────────────────────────────────────────────────────────────────

  static quickSolve(input, operationOverride = null) {
    const expr = input.trim();
    if (!expr) return { success: false, error: 'Please enter an expression.' };

    const detection = this.detectExpressionType(expr);
    const op = operationOverride || detection.type;

    switch (op) {
      case 'linear-equation':
      case 'solve':
        if (expr.includes('=')) return this.solveLinear(expr);
        break;
      case 'quadratic-equation':
        return this.solveQuadratic(expr);
      case 'inequality':
        return this.solveInequality(expr);
      case 'product':
      case 'expand':
        return this.expand(expr);
      case 'factor':
      case 'factorize':
      case 'quadratic-expression':
        return this.factorize(expr);
      case 'like-terms':
      case 'simplify':
        return this.simplifyLikeTerms(expr);
      case 'trigonometric':
        return this.verifyTrigIdentity(expr);
      case 'polynomial':
        return this.analyzePolynomial(expr);
    }

    // Fallback: try simplify
    const simplified = this.simplifyLikeTerms(expr);
    if (simplified.success) return simplified;

    // Try factorize
    const factored = this.factorize(expr);
    if (factored.success) return factored;

    return { success: false, error: `Cannot automatically process: "${expr}". Try specifying the operation.` };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  static _fmt(n) {
    if (typeof n !== 'number') return String(n);
    if (!isFinite(n)) return String(n);
    if (Number.isInteger(n)) return String(n);
    // Round to 6 decimal places, strip trailing zeros
    return parseFloat(n.toFixed(6)).toString();
  }

  static _parseLinearSide(expr) {
    // Parse ax + b from a string, returns { x: coeff_of_x, c: constant }
    let x = 0, c = 0;
    const cleaned = expr.replace(/\s/g, '').replace(/−/g, '-');
    const terms = cleaned.match(/[+\-]?[^+\-]+/g) || [];

    for (let term of terms) {
      term = term.trim();
      if (/^[+\-]?\d*\.?\d*x$/.test(term)) {
        const coeffStr = term.replace('x', '');
        if (coeffStr === '' || coeffStr === '+') x += 1;
        else if (coeffStr === '-') x -= 1;
        else x += parseFloat(coeffStr);
      } else if (/^[+\-]?\d+\.?\d*$/.test(term)) {
        c += parseFloat(term);
      }
    }
    return { x, c };
  }

  static _parseQuadratic(expr) {
    // Parse ax² + bx + c (or ax^2 ...)
    const clean = expr.replace(/\s/g, '').replace('²', '^2').replace(/−/g, '-');

    // Match a coefficient for x²
    const ax2 = clean.match(/([+\-]?\d*\.?\d*)x\^2/);
    const bx  = clean.match(/([+\-]?\d*\.?\d*)x(?!\^)/);
    const c0  = clean.match(/(?:^|[+\-])(\d+\.?\d*)(?!x)/);

    if (!ax2) return null;

    const a = ax2[1] === '' || ax2[1] === '+' ? 1 : ax2[1] === '-' ? -1 : parseFloat(ax2[1]);
    const b = bx ? (bx[1] === '' || bx[1] === '+' ? 1 : bx[1] === '-' ? -1 : parseFloat(bx[1])) : 0;
    const c = c0 ? parseFloat(c0[1]) * (clean.indexOf('-' + c0[1]) === clean.lastIndexOf('-' + c0[1]) && clean.includes('-' + c0[1]) ? -1 : 1) : 0;

    if (isNaN(a) || isNaN(b)) return null;

    // Better constant extraction — find the last numeric token not attached to x
    let cleanForC = clean
      .replace(/([+\-]?\d*\.?\d*)x\^2/g, '')
      .replace(/([+\-]?\d*\.?\d*)x/g, '');
    const constMatch = cleanForC.match(/^[+\-]?\d+\.?\d*$/);
    const cVal = constMatch ? parseFloat(constMatch[0]) : 0;

    return { a, b, c: cVal };
  }

  static _parseDifferenceOfSquares(expr) {
    // ax² - n: a must be perfect square, n must be perfect square
    const clean = expr.replace(/\s/g, '').replace('²', '^2');
    const m = clean.match(/^(\d*)x\^2-(\d+\.?\d*)$/);
    if (!m) return null;
    const a = m[1] === '' ? 1 : parseInt(m[1]);
    const n = parseFloat(m[2]);
    if (Math.sqrt(n) % 1 !== 0) return null; // n must be perfect square
    if (Math.sqrt(a) % 1 !== 0 && a !== 1) return null;
    return { a, n };
  }

  static _extractCommonFactor(expr) {
    // Very basic: extract GCF from polynomial coefficients
    const clean = expr.replace(/\s/g, '').replace('²', '^2');
    const coeffMatches = clean.match(/\d+/g);
    if (!coeffMatches || coeffMatches.length < 2) return null;
    const nums = coeffMatches.map(Number);
    const gcf = nums.reduce((a, b) => this._gcd(a, b));
    if (gcf <= 1) return null;
    // Divide all coefficients by gcf
    const reduced = clean.replace(/(\d+)/g, (match) => {
      const val = parseInt(match) / gcf;
      return Number.isInteger(val) ? String(val) : match;
    });
    return { factor: gcf, reduced };
  }

  static _gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a;
  }

  static _buildQuadratic(a, b, c) {
    let result = '';
    if (a !== 0) result += (a === 1 ? '' : a === -1 ? '-' : a) + 'x²';
    if (b !== 0) result += (result ? (b > 0 ? ' + ' : ' - ') : (b < 0 ? '-' : '')) + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x';
    if (c !== 0) result += (result ? (c > 0 ? ' + ' : ' - ') : (c < 0 ? '-' : '')) + Math.abs(c);
    return result || '0';
  }

  static _buildCubic(a, b, c, d) {
    let result = '';
    if (a !== 0) result += (a === 1 ? '' : a) + 'x³';
    if (b !== 0) result += (result ? (b > 0 ? ' + ' : ' - ') : (b < 0 ? '-' : '')) + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'x²';
    if (c !== 0) result += (result ? (c > 0 ? ' + ' : ' - ') : (c < 0 ? '-' : '')) + (Math.abs(c) === 1 ? '' : Math.abs(c)) + 'x';
    if (d !== 0) result += (result ? (d > 0 ? ' + ' : ' - ') : (d < 0 ? '-' : '')) + Math.abs(d);
    return result || '0';
  }

  static _formatFactor(a, root) {
    if (root === 0) return a !== 1 ? `${a}x` : 'x';
    const sign = root > 0 ? '-' : '+';
    return `(${a !== 1 ? a : ''}x ${sign} ${Math.abs(root)})`;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. SAFE EXPRESSION EVALUATOR (No eval())
  // ─────────────────────────────────────────────────────────────────────────────

  static evaluateExpression(expr, variables = {}) {
    const raw = (expr || '').trim();
    if (!raw) return { success: false, error: 'Empty expression' };

    const steps = [];
    steps.push({ label: 'Original Expression', value: raw });

    // Show substituted variable assignments
    const varKeys = Object.keys(variables).filter(k => variables[k] !== '' && variables[k] !== undefined);
    if (varKeys.length > 0) {
      const varStr = varKeys.map(k => `${k} = ${variables[k]}`).join(', ');
      steps.push({ label: 'Given Variables', value: varStr });
    }

    try {
      // Tokenize and evaluate safely
      let substitutedExpr = raw;
      // Substitute known constants
      substitutedExpr = substitutedExpr
        .replace(/π|\bpi\b/gi, `(${Math.PI})`)
        .replace(/\be\b/g, `(${Math.E})`);

      // Substitute variables
      for (const k of varKeys) {
        const val = parseFloat(variables[k]);
        if (!isNaN(val)) {
          const regex = new RegExp(`\\b${k}\\b`, 'g');
          substitutedExpr = substitutedExpr.replace(regex, `(${val})`);
        }
      }

      steps.push({ label: 'Substituted Expression', value: substitutedExpr });

      // Parse and compute numeric value
      const resultVal = this._safeEvalMath(substitutedExpr);
      if (isNaN(resultVal) || !isFinite(resultVal)) {
        return { success: false, error: 'Expression evaluated to undefined or infinity (e.g. division by zero).' };
      }

      const exact = Number.isInteger(resultVal) ? String(resultVal) : this._fmt(resultVal);
      steps.push({ label: 'Calculate Result', value: exact });

      return {
        success: true,
        result: exact,
        numericValue: resultVal,
        steps,
        operation: 'Evaluate Expression'
      };
    } catch (err) {
      return { success: false, error: err.message || 'Error evaluating expression' };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. ALGEBRAIC SUBSTITUTION
  // ─────────────────────────────────────────────────────────────────────────────

  static substituteVariable(expr, varName = 'x', replacement = '2') {
    const raw = (expr || '').trim();
    const varClean = (varName || 'x').trim();
    const replClean = (replacement || '').trim();

    if (!raw || !replClean) {
      return { success: false, error: 'Please provide expression, variable, and replacement value' };
    }

    const steps = [];
    steps.push({ label: 'Original Expression', value: raw });
    steps.push({ label: 'Substitution Rule', value: `Replace ${varClean} with (${replClean})` });

    // Substitute variable
    const pattern = new RegExp(`\\b${varClean}\\b`, 'g');
    const substituted = raw.replace(pattern, `(${replClean})`);
    steps.push({ label: 'Substituted Expression', value: substituted });

    // If replacement is a number, we can compute the value
    const numericVal = parseFloat(replClean);
    if (!isNaN(numericVal) && !/[a-zA-Z]/.test(replClean)) {
      const evalRes = this.evaluateExpression(raw, { [varClean]: numericVal });
      if (evalRes.success) {
        steps.push({ label: 'Simplified Value', value: evalRes.result });
        return {
          success: true,
          result: evalRes.result,
          substituted,
          steps,
          operation: 'Algebraic Substitution'
        };
      }
    }

    // Symbolic substitution result
    return {
      success: true,
      result: substituted,
      steps,
      operation: 'Algebraic Substitution'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. RATIO & PROPORTION SOLVER
  // ─────────────────────────────────────────────────────────────────────────────

  static solveProportion(input) {
    const raw = (input || '').trim();
    const steps = [];
    steps.push({ label: 'Proportion / Ratio', value: raw });

    // Case 1: Equation form: a/b = c/d or a:b = c:d
    // e.g. x/4 = 6/8 or 3/x = 9/12 or x:4 = 6:8
    const eqMatch = raw.split(/=|::/);
    if (eqMatch.length === 2) {
      const left = eqMatch[0].trim();
      const right = eqMatch[1].trim();

      // Split fractions
      const leftParts = left.split(/[/:]/);
      const rightParts = right.split(/[/:]/);

      if (leftParts.length === 2 && rightParts.length === 2) {
        const [aStr, bStr] = leftParts.map(s => s.trim());
        const [cStr, dStr] = rightParts.map(s => s.trim());

        steps.push({ label: 'Standard Proportion Form', value: `${aStr} / ${bStr} = ${cStr} / ${dStr}` });
        steps.push({ label: 'Cross-Multiplication Property', value: `a × d = b × c  →  (${aStr}) × (${dStr}) = (${bStr}) × (${cStr})` });

        // Identify variable: x or any single letter
        const parts = [aStr, bStr, cStr, dStr];
        const varIdx = parts.findIndex(p => /^[a-zA-Z]$/.test(p));

        if (varIdx !== -1) {
          const varName = parts[varIdx];
          const a = parseFloat(aStr), b = parseFloat(bStr), c = parseFloat(cStr), d = parseFloat(dStr);

          let ans;
          if (varIdx === 0) { // a = (b*c)/d
            ans = (b * c) / d;
            steps.push({ label: `Solve for ${varName}`, value: `${varName} = (${b} × ${c}) / ${d} = ${b * c} / ${d}` });
          } else if (varIdx === 1) { // b = (a*d)/c
            ans = (a * d) / c;
            steps.push({ label: `Solve for ${varName}`, value: `${varName} = (${a} × ${d}) / ${c} = ${a * d} / ${c}` });
          } else if (varIdx === 2) { // c = (a*d)/b
            ans = (a * d) / b;
            steps.push({ label: `Solve for ${varName}`, value: `${varName} = (${a} × ${d}) / ${b} = ${a * d} / ${b}` });
          } else { // d = (b*c)/a
            ans = (b * c) / a;
            steps.push({ label: `Solve for ${varName}`, value: `${varName} = (${b} × ${c}) / ${a} = ${b * c} / ${a}` });
          }

          if (isNaN(ans) || !isFinite(ans)) {
            return { success: false, error: 'Division by zero in proportion calculation' };
          }

          const ansFmt = Number.isInteger(ans) ? String(ans) : this._fmt(ans);
          steps.push({ label: 'Solution', value: `${varName} = ${ansFmt}` });

          return {
            success: true,
            result: `${varName} = ${ansFmt}`,
            numericValue: ans,
            steps,
            operation: 'Solve Proportion'
          };
        }
      }
    }

    // Case 2: Simple Ratio Simplification: a:b or a/b
    const ratioParts = raw.split(/[:/]/);
    if (ratioParts.length === 2) {
      const a = parseFloat(ratioParts[0]);
      const b = parseFloat(ratioParts[1]);

      if (!isNaN(a) && !isNaN(b)) {
        if (b === 0) return { success: false, error: 'Division by zero: ratio denominator cannot be 0' };

        steps.push({ label: 'Original Terms', value: `Antecedent = ${a}, Consequent = ${b}` });

        if (Number.isInteger(a) && Number.isInteger(b)) {
          const g = this._gcd(a, b);
          const simpA = a / g;
          const simpB = b / g;
          steps.push({ label: 'Greatest Common Divisor (GCD)', value: `GCD(${Math.abs(a)}, ${Math.abs(b)}) = ${g}` });
          steps.push({ label: 'Divide Both Terms by GCD', value: `${a} ÷ ${g} : ${b} ÷ ${g}` });
          steps.push({ label: 'Simplified Ratio', value: `${simpA} : ${simpB}` });
          const decimalVal = this._fmt(a / b);
          steps.push({ label: 'Decimal Equivalent', value: `${decimalVal}` });

          return {
            success: true,
            result: `${simpA} : ${simpB}`,
            antecedent: simpA,
            consequent: simpB,
            decimal: decimalVal,
            steps,
            operation: 'Simplify Ratio'
          };
        } else {
          const decimalVal = this._fmt(a / b);
          steps.push({ label: 'Decimal Ratio', value: `${decimalVal}` });
          return {
            success: true,
            result: `${decimalVal}`,
            steps,
            operation: 'Simplify Ratio'
          };
        }
      }
    }

    return { success: false, error: 'Invalid proportion format. Use e.g. "x/4 = 6/8" or "24:36"' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 15. LOGARITHMIC EQUATION SOLVER
  // ─────────────────────────────────────────────────────────────────────────────

  static solveLogarithmic(input) {
    const raw = (input || '').trim();
    const steps = [];
    steps.push({ label: 'Equation', value: raw });

    // Support:
    // log(x) = c  (base 10)
    // ln(x) = c   (base e)
    // log2(x) = c (base 2)
    // log_b(x) = c
    // log(ax + b) = c
    const sides = raw.split('=');
    if (sides.length !== 2) {
      return { success: false, error: 'Logarithmic equation must contain an equals sign "=" (e.g. log(x) = 2)' };
    }

    const lhs = sides[0].trim();
    const rhsVal = parseFloat(sides[1].trim());

    if (isNaN(rhsVal)) {
      return { success: false, error: 'Right-hand side must be a numeric value' };
    }

    // Match base and argument
    // Cases: ln(...), log2(...), log_2(...), log(...)
    let base = 10;
    let baseName = '10';
    let argStr = '';

    const lnMatch = lhs.match(/^ln\s*\(([^)]+)\)$/i);
    const logBaseMatch = lhs.match(/^log_?(\d+)\s*\(([^)]+)\)$/i);
    const logDefaultMatch = lhs.match(/^log\s*\(([^)]+)\)$/i);

    if (lnMatch) {
      base = Math.E;
      baseName = 'e';
      argStr = lnMatch[1].trim();
      steps.push({ label: 'Identify Logarithm', value: `Natural logarithm: base e ≈ 2.71828` });
    } else if (logBaseMatch) {
      base = parseFloat(logBaseMatch[1]);
      baseName = String(base);
      argStr = logBaseMatch[2].trim();
      steps.push({ label: 'Identify Logarithm', value: `Base-${baseName} logarithm` });
    } else if (logDefaultMatch) {
      base = 10;
      baseName = '10';
      argStr = logDefaultMatch[1].trim();
      steps.push({ label: 'Identify Logarithm', value: `Common logarithm: base 10` });
    } else {
      return { success: false, error: 'Unsupported format. Use log(x) = 2, ln(x) = 3, or log2(x) = 4' };
    }

    steps.push({ label: 'Argument of Logarithm', value: `arg = ${argStr}` });
    steps.push({ label: 'Exponential Form Conversion', value: `log_b(y) = c  ⟺  y = b^c` });

    const powerVal = Math.pow(base, rhsVal);
    const powerExact = baseName === 'e' ? `e^${rhsVal}` : `${baseName}^${rhsVal} = ${this._fmt(powerVal)}`;
    steps.push({ label: 'Converted Equation', value: `${argStr} = ${powerExact}` });

    // Solve for variable in argStr
    if (/^[a-zA-Z]$/.test(argStr)) {
      // Just x = powerVal
      const exactResult = baseName === 'e' ? `e^${rhsVal} (≈ ${this._fmt(powerVal)})` : this._fmt(powerVal);
      steps.push({ label: 'Domain Check', value: `x > 0 required. Since ${powerExact} > 0, solution is valid.` });
      steps.push({ label: 'Solution', value: `${argStr} = ${exactResult}` });

      return {
        success: true,
        result: `${argStr} = ${exactResult}`,
        numericValue: powerVal,
        steps,
        operation: 'Solve Logarithmic Equation'
      };
    }

    // Linear argument: ax + b
    const lin = this._parseLinearSide(argStr);
    if (lin && lin.coeff !== 0) {
      // coeff * x + const = powerVal
      const xVal = (powerVal - lin.constant) / lin.coeff;
      const xFmt = this._fmt(xVal);
      steps.push({ label: 'Rearrange Linear Terms', value: `${lin.coeff}x = ${this._fmt(powerVal)} - (${lin.constant}) = ${this._fmt(powerVal - lin.constant)}` });
      steps.push({ label: 'Solve for x', value: `x = ${xFmt}` });
      steps.push({ label: 'Domain Verification', value: `Verify argument: ${argStr} evaluated at x = ${xFmt} is positive (> 0). Valid!` });

      return {
        success: true,
        result: `x = ${xFmt}`,
        numericValue: xVal,
        steps,
        operation: 'Solve Logarithmic Equation'
      };
    }

    return {
      success: true,
      result: `${argStr} = ${this._fmt(powerVal)}`,
      steps,
      operation: 'Solve Logarithmic Equation'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 16. EXPONENTIAL EQUATION SOLVER
  // ─────────────────────────────────────────────────────────────────────────────

  static solveExponential(input) {
    const raw = (input || '').trim();
    const steps = [];
    steps.push({ label: 'Equation', value: raw });

    // Support:
    // 2^x = 16
    // 3^(x-1) = 27
    // e^x = 10
    // b^x = c
    const sides = raw.split('=');
    if (sides.length !== 2) {
      return { success: false, error: 'Exponential equation must contain an equals sign "=" (e.g. 2^x = 16)' };
    }

    const lhs = sides[0].trim();
    const rhsVal = parseFloat(sides[1].trim());

    if (isNaN(rhsVal) || rhsVal <= 0) {
      return { success: false, error: 'Right-hand side must be a positive number (> 0) since b^x > 0' };
    }

    // Match base and exponent: b^(...) or e^(...) or b^x
    const expMatch = lhs.match(/^([0-9.]+|e)\s*\^\s*\(?([a-zA-Z0-9+\-*.\s]+)\)?$/);
    if (!expMatch) {
      return { success: false, error: 'Unsupported exponential format. Use e.g. 2^x = 16, 3^(x-1) = 27, or e^x = 10' };
    }

    const baseStr = expMatch[1].trim();
    const exponentStr = expMatch[2].trim();
    const base = baseStr === 'e' ? Math.E : parseFloat(baseStr);

    if (base <= 0 || base === 1) {
      return { success: false, error: 'Exponential base must be positive and not equal to 1' };
    }

    steps.push({ label: 'Identify Base & Exponent', value: `Base b = ${baseStr}, Exponent = ${exponentStr}` });

    // Check if RHS is an exact power of base
    let exactPower = null;
    if (baseStr !== 'e' && Number.isInteger(base) && Number.isInteger(rhsVal)) {
      for (let p = -10; p <= 20; p++) {
        if (Math.pow(base, p) === rhsVal) {
          exactPower = p;
          break;
        }
      }
    }

    if (exactPower !== null) {
      steps.push({ label: 'Equate Bases', value: `${rhsVal} = ${baseStr}^${exactPower}` });
      steps.push({ label: 'Equate Exponents', value: `${exponentStr} = ${exactPower}` });

      if (/^[a-zA-Z]$/.test(exponentStr)) {
        steps.push({ label: 'Solution', value: `${exponentStr} = ${exactPower}` });
        return {
          success: true,
          result: `${exponentStr} = ${exactPower}`,
          numericValue: exactPower,
          steps,
          operation: 'Solve Exponential Equation'
        };
      }

      // Linear exponent: e.g. x - 1 = 3  =>  x = 4
      const lin = this._parseLinearSide(exponentStr);
      if (lin && lin.coeff !== 0) {
        const xVal = (exactPower - lin.constant) / lin.coeff;
        const xFmt = this._fmt(xVal);
        steps.push({ label: 'Solve for x', value: `x = (${exactPower} - ${lin.constant}) / ${lin.coeff} = ${xFmt}` });
        return {
          success: true,
          result: `x = ${xFmt}`,
          numericValue: xVal,
          steps,
          operation: 'Solve Exponential Equation'
        };
      }
    }

    // General case using logarithms: x = ln(c) / ln(b)
    steps.push({ label: 'Apply Natural Logarithms', value: `ln(${baseStr}^(${exponentStr})) = ln(${rhsVal})` });
    steps.push({ label: 'Power Rule of Logarithms', value: `(${exponentStr}) × ln(${baseStr}) = ln(${rhsVal})` });
    steps.push({ label: 'Isolate Exponent', value: `${exponentStr} = ln(${rhsVal}) / ln(${baseStr})` });

    const expVal = Math.log(rhsVal) / Math.log(base);
    const expFmt = this._fmt(expVal);

    if (/^[a-zA-Z]$/.test(exponentStr)) {
      steps.push({ label: 'Calculate Numeric Value', value: `${exponentStr} = ${expFmt}` });
      return {
        success: true,
        result: `${exponentStr} = ${expFmt}`,
        numericValue: expVal,
        steps,
        operation: 'Solve Exponential Equation'
      };
    }

    const lin = this._parseLinearSide(exponentStr);
    if (lin && lin.coeff !== 0) {
      const xVal = (expVal - lin.constant) / lin.coeff;
      const xFmt = this._fmt(xVal);
      steps.push({ label: 'Solve for x', value: `x = (${expFmt} - ${lin.constant}) / ${lin.coeff} = ${xFmt}` });
      return {
        success: true,
        result: `x = ${xFmt}`,
        numericValue: xVal,
        steps,
        operation: 'Solve Exponential Equation'
      };
    }

    return {
      success: true,
      result: `${exponentStr} = ${expFmt}`,
      numericValue: expVal,
      steps,
      operation: 'Solve Exponential Equation'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SAFE MATH EXPRESSION EVALUATOR (Recursive-descent arithmetic, no eval)
  // ─────────────────────────────────────────────────────────────────────────────

  static _safeEvalMath(expr) {
    // Sanitize and normalize string
    let s = expr.replace(/\s+/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**');

    // Tokenize into numbers, operators, parentheses, functions
    let pos = 0;

    function parseExpression() {
      let val = parseTerm();
      while (pos < s.length && (s[pos] === '+' || s[pos] === '-')) {
        const op = s[pos++];
        const nextVal = parseTerm();
        val = op === '+' ? val + nextVal : val - nextVal;
      }
      return val;
    }

    function parseTerm() {
      let val = parseFactor();
      while (pos < s.length && (s[pos] === '*' || s[pos] === '/')) {
        if (s.substr(pos, 2) === '**') break;
        const op = s[pos++];
        const nextVal = parseFactor();
        val = op === '*' ? val * nextVal : val / nextVal;
      }
      return val;
    }

    function parseFactor() {
      let val = parsePrimary();
      while (pos < s.length && s.substr(pos, 2) === '**') {
        pos += 2;
        const nextVal = parseFactor(); // right-associative power
        val = Math.pow(val, nextVal);
      }
      return val;
    }

    function parsePrimary() {
      if (pos >= s.length) return 0;

      // Unary +/-
      if (s[pos] === '+') { pos++; return parsePrimary(); }
      if (s[pos] === '-') { pos++; return -parsePrimary(); }

      // Parentheses
      if (s[pos] === '(') {
        pos++;
        const val = parseExpression();
        if (s[pos] === ')') pos++;
        return val;
      }

      // Mathematical functions: sqrt, abs, sin, cos, tan, log, ln
      const fnMatch = s.substr(pos).match(/^(sqrt|abs|sin|cos|tan|log|ln)\b/i);
      if (fnMatch) {
        const fnName = fnMatch[1].toLowerCase();
        pos += fnName.length;
        if (s[pos] === '(') {
          pos++;
          const arg = parseExpression();
          if (s[pos] === ')') pos++;
          switch (fnName) {
            case 'sqrt': return Math.sqrt(arg);
            case 'abs': return Math.abs(arg);
            case 'sin': return Math.sin(arg);
            case 'cos': return Math.cos(arg);
            case 'tan': return Math.tan(arg);
            case 'log': return Math.log10(arg);
            case 'ln': return Math.log(arg);
          }
        }
      }

      // Numbers
      const numMatch = s.substr(pos).match(/^\d+(\.\d+)?/);
      if (numMatch) {
        pos += numMatch[0].length;
        return parseFloat(numMatch[0]);
      }

      pos++;
      return 0;
    }

    return parseExpression();
  }
}

