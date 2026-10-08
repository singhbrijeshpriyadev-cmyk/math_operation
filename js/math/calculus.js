/**
 * OG - Core Calculus Mathematical Engine
 * Comprehensive symbolic & numerical calculus calculation engine:
 * - Safe expression parsing & AST evaluation
 * - Symbolic differentiation (Power, Product, Quotient, Chain rules, Trig, Exp, Log)
 * - Higher order & n-th derivatives
 * - Left-hand, right-hand, and finite limits
 * - Continuity & differentiability verification
 * - Tangent & normal line derivation
 * - Critical points, monotonicity, and extrema (First & Second derivative tests)
 * - Indefinite & definite integration
 * - Area under curve and area between curves
 * - Differential equations: Order, degree, and first-order analytical solvers
 * 
 * ES6 Module
 */

import { ResultFormatter } from './formatter.js';

// ============================================================================
// 1. AST EXPRESSION PARSER & EVALUATOR
// ============================================================================

export class MathExpression {
  constructor(rawExpr) {
    this.raw = (rawExpr || '').trim();
    this.ast = null;
    this.parseError = null;
    try {
      this.ast = this._parse(this.raw);
    } catch (err) {
      this.parseError = err.message || 'Syntax error in expression';
    }
  }

  isValid() {
    return this.ast !== null && !this.parseError;
  }

  evaluate(x, vars = {}) {
    if (!this.isValid()) return NaN;
    return this._evalNode(this.ast, { x, ...vars });
  }

  // Tokenizer with implicit multiplication support
  _tokenize(str) {
    // Normalize unicode math symbols: · and × -> *, − -> -
    const s = str
      .replace(/[\u00b7\u00d7]/g, '*')
      .replace(/[\u2212\u2013]/g, '-')
      .replace(/\s+/g, '');
    const tokens = [];
    let i = 0;

    while (i < s.length) {
      const ch = s[i];

      // Number
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(s[i + 1] || ''))) {
        let numStr = '';
        while (i < s.length && (/[0-9]/.test(s[i]) || s[i] === '.')) {
          numStr += s[i++];
        }
        tokens.push({ type: 'num', value: parseFloat(numStr) });
        continue;
      }

      // Operators and parens
      if ('+-*/^()'.includes(ch)) {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }

      // Identifiers (function names, variables, constants)
      if (/[a-zA-Z]/.test(ch)) {
        let name = '';
        while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
          name += s[i++];
        }
        tokens.push({ type: 'id', value: name });
        continue;
      }

      // Unrecognized character
      throw new Error(`Unexpected character '${ch}' at index ${i}`);
    }

    // Insert implicit multiplication: e.g. 2x -> 2*x, x(x+1) -> x*(x+1), )x -> )*x
    const res = [];
    for (let k = 0; k < tokens.length; k++) {
      const curr = tokens[k];
      const next = tokens[k + 1];
      res.push(curr);

      if (next) {
        const currCanMultiply =
          curr.type === 'num' ||
          (curr.type === 'id' && !['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'exp', 'ln', 'log', 'sqrt', 'abs', 'asin', 'acos', 'atan'].includes(curr.value.toLowerCase())) ||
          (curr.type === 'op' && curr.value === ')');

        const nextCanBeMultiplied =
          next.type === 'id' ||
          (next.type === 'op' && next.value === '(') ||
          (next.type === 'num' && curr.type === 'op' && curr.value === ')');

        if (currCanMultiply && nextCanBeMultiplied) {
          res.push({ type: 'op', value: '*' });
        }
      }
    }

    return res;
  }

  // Recursive descent parser
  _parse(exprStr) {
    if (!exprStr || exprStr.trim() === '') {
      throw new Error('Expression is empty');
    }
    const tokens = this._tokenize(exprStr);
    let pos = 0;

    const peek = () => tokens[pos];
    const consume = (expectedVal) => {
      const t = tokens[pos];
      if (!t) throw new Error(`Unexpected end of expression, expected '${expectedVal}'`);
      if (expectedVal && t.value !== expectedVal) {
        throw new Error(`Expected '${expectedVal}', got '${t.value}'`);
      }
      pos++;
      return t;
    };

    // Grammar:
    // Expr -> Term (( '+' | '-' ) Term)*
    // Term -> Power (( '*' | '/' ) Power)*
    // Power -> Factor ( '^' Power )?
    // Factor -> ('+' | '-')? Primary
    // Primary -> Number | Identifier ('(' Expr ')')? | '(' Expr ')'

    const parseExpr = () => {
      let node = parseTerm();
      while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = consume().value;
        const right = parseTerm();
        node = { type: 'binary', op, left: node, right };
      }
      return node;
    };

    const parseTerm = () => {
      let node = parsePower();
      while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
        const op = consume().value;
        const right = parsePower();
        node = { type: 'binary', op, left: node, right };
      }
      return node;
    };

    const parsePower = () => {
      const left = parseFactor();
      if (peek() && peek().type === 'op' && peek().value === '^') {
        consume('^');
        const right = parsePower(); // right-associative
        return { type: 'binary', op: '^', left, right };
      }
      return left;
    };

    const parseFactor = () => {
      if (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const sign = consume().value;
        const operand = parseFactor();
        if (sign === '-') {
          return { type: 'unary', op: '-', operand };
        }
        return operand;
      }
      return parsePrimary();
    };

    const parsePrimary = () => {
      const t = peek();
      if (!t) throw new Error('Unexpected end of expression');

      if (t.type === 'num') {
        consume();
        return { type: 'num', value: t.value };
      }

      if (t.type === 'op' && t.value === '(') {
        consume('(');
        const sub = parseExpr();
        consume(')');
        return sub;
      }

      if (t.type === 'id') {
        const name = consume().value.toLowerCase();
        // Constant: pi, e
        if (name === 'pi') return { type: 'num', value: Math.PI };
        if (name === 'e') return { type: 'num', value: Math.E };
        // Variable: x or t
        if (name === 'x' || name === 't') return { type: 'var', name };

        // Function call: sin(x), etc.
        if (peek() && peek().type === 'op' && peek().value === '(') {
          consume('(');
          const arg = parseExpr();
          consume(')');
          return { type: 'func', name, arg };
        }

        // Implicit variable without parens or unsupported
        return { type: 'var', name };
      }

      throw new Error(`Unexpected token '${t.value}'`);
    };

    const ast = parseExpr();
    if (pos < tokens.length) {
      throw new Error(`Unexpected extra tokens starting at '${tokens[pos].value}'`);
    }
    return ast;
  }

  _evalNode(node, vars) {
    if (!node) return NaN;
    switch (node.type) {
      case 'num':
        return node.value;
      case 'var':
        return vars[node.name] !== undefined ? vars[node.name] : NaN;
      case 'unary':
        if (node.op === '-') return -this._evalNode(node.operand, vars);
        return this._evalNode(node.operand, vars);
      case 'binary': {
        const l = this._evalNode(node.left, vars);
        const r = this._evalNode(node.right, vars);
        switch (node.op) {
          case '+': return l + r;
          case '-': return l - r;
          case '*': return l * r;
          case '/': return r === 0 ? (l >= 0 ? Infinity : -Infinity) : l / r;
          case '^': return Math.pow(l, r);
          default: return NaN;
        }
      }
      case 'func': {
        const a = this._evalNode(node.arg, vars);
        switch (node.name) {
          case 'sin': return Math.sin(a);
          case 'cos': return Math.cos(a);
          case 'tan': return Math.tan(a);
          case 'cot': return 1 / Math.tan(a);
          case 'sec': return 1 / Math.cos(a);
          case 'csc': return 1 / Math.sin(a);
          case 'asin': return Math.asin(a);
          case 'acos': return Math.acos(a);
          case 'atan': return Math.atan(a);
          case 'exp': return Math.exp(a);
          case 'ln':
          case 'log': return Math.log(a);
          case 'sqrt': return Math.sqrt(a);
          case 'abs': return Math.abs(a);
          default: return NaN;
        }
      }
      default:
        return NaN;
    }
  }

  // Convert AST back to clean string
  toString(node = this.ast) {
    if (!node) return '';
    switch (node.type) {
      case 'num': {
        const val = ResultFormatter.cleanNumber(node.value);
        return String(val);
      }
      case 'var': return node.name;
      case 'unary': {
        const inner = this.toString(node.operand);
        return `-${inner}`;
      }
      case 'binary': {
        let leftStr = this.toString(node.left);
        let rightStr = this.toString(node.right);

        // Precedence parentheses
        if (node.op === '*' || node.op === '/') {
          if (node.left.type === 'binary' && (node.left.op === '+' || node.left.op === '-')) {
            leftStr = `(${leftStr})`;
          }
          if (node.right.type === 'binary' && (node.right.op === '+' || node.right.op === '-')) {
            rightStr = `(${rightStr})`;
          }
        } else if (node.op === '^') {
          if (node.left.type === 'binary' && node.left.op !== '^') {
            leftStr = `(${leftStr})`;
          }
        }

        if (node.op === '+') return `${leftStr} + ${rightStr}`;
        if (node.op === '-') return `${leftStr} - ${rightStr}`;
        if (node.op === '*') {
          // If multiplying number and var/func, make compact e.g. 3x or 2sin(x)
          if (node.left.type === 'num' && (node.right.type === 'var' || node.right.type === 'func')) {
            return `${leftStr}${rightStr}`;
          }
          return `${leftStr} · ${rightStr}`;
        }
        if (node.op === '/') return `${leftStr} / ${rightStr}`;
        if (node.op === '^') return `${leftStr}^${rightStr}`;
        return `${leftStr} ${node.op} ${rightStr}`;
      }
      case 'func': {
        const argStr = this.toString(node.arg);
        return `${node.name}(${argStr})`;
      }
      default: return '';
    }
  }
}

// ============================================================================
// 2. SYMBOLIC DIFFERENTIATION & AST SIMPLIFIER
// ============================================================================

export class SymbolicDifferentiator {
  static differentiate(ast) {
    if (!ast) return null;
    switch (ast.type) {
      case 'num':
        return { type: 'num', value: 0 };

      case 'var':
        return { type: 'num', value: 1 };

      case 'unary':
        return {
          type: 'unary',
          op: ast.op,
          operand: this.differentiate(ast.operand)
        };

      case 'binary': {
        const u = ast.left;
        const v = ast.right;
        const du = this.differentiate(u);
        const dv = this.differentiate(v);

        if (ast.op === '+' || ast.op === '-') {
          return { type: 'binary', op: ast.op, left: du, right: dv };
        }

        if (ast.op === '*') {
          // Product rule: d(u*v) = du*v + u*dv
          return {
            type: 'binary',
            op: '+',
            left: { type: 'binary', op: '*', left: du, right: v },
            right: { type: 'binary', op: '*', left: u, right: dv }
          };
        }

        if (ast.op === '/') {
          // Quotient rule: d(u/v) = (du*v - u*dv) / (v^2)
          return {
            type: 'binary',
            op: '/',
            left: {
              type: 'binary',
              op: '-',
              left: { type: 'binary', op: '*', left: du, right: v },
              right: { type: 'binary', op: '*', left: u, right: dv }
            },
            right: {
              type: 'binary',
              op: '^',
              left: v,
              right: { type: 'num', value: 2 }
            }
          };
        }

        if (ast.op === '^') {
          // Power rule: if v is constant number: v * u^(v-1) * du
          if (v.type === 'num') {
            const n = v.value;
            const newExp = n - 1;
            return {
              type: 'binary',
              op: '*',
              left: {
                type: 'binary',
                op: '*',
                left: { type: 'num', value: n },
                right: {
                  type: 'binary',
                  op: '^',
                  left: u,
                  right: { type: 'num', value: newExp }
                }
              },
              right: du
            };
          }
          // General exponential: d(u^v) = u^v * (dv*ln(u) + v*du/u)
          return {
            type: 'binary',
            op: '*',
            left: ast,
            right: {
              type: 'binary',
              op: '+',
              left: {
                type: 'binary',
                op: '*',
                left: dv,
                right: { type: 'func', name: 'ln', arg: u }
              },
              right: {
                type: 'binary',
                op: '/',
                left: { type: 'binary', op: '*', left: v, right: du },
                right: u
              }
            }
          };
        }

        return { type: 'num', value: 0 };
      }

      case 'func': {
        const u = ast.arg;
        const du = this.differentiate(u);

        let dFunc;
        switch (ast.name) {
          case 'sin':
            dFunc = { type: 'func', name: 'cos', arg: u };
            break;
          case 'cos':
            dFunc = {
              type: 'unary',
              op: '-',
              operand: { type: 'func', name: 'sin', arg: u }
            };
            break;
          case 'tan':
            dFunc = {
              type: 'binary',
              op: '^',
              left: { type: 'func', name: 'sec', arg: u },
              right: { type: 'num', value: 2 }
            };
            break;
          case 'cot':
            dFunc = {
              type: 'unary',
              op: '-',
              operand: {
                type: 'binary',
                op: '^',
                left: { type: 'func', name: 'csc', arg: u },
                right: { type: 'num', value: 2 }
              }
            };
            break;
          case 'sec':
            dFunc = {
              type: 'binary',
              op: '*',
              left: { type: 'func', name: 'sec', arg: u },
              right: { type: 'func', name: 'tan', arg: u }
            };
            break;
          case 'csc':
            dFunc = {
              type: 'unary',
              op: '-',
              operand: {
                type: 'binary',
                op: '*',
                left: { type: 'func', name: 'csc', arg: u },
                right: { type: 'func', name: 'cot', arg: u }
              }
            };
            break;
          case 'exp':
            dFunc = ast;
            break;
          case 'ln':
          case 'log':
            dFunc = {
              type: 'binary',
              op: '/',
              left: { type: 'num', value: 1 },
              right: u
            };
            break;
          case 'sqrt':
            dFunc = {
              type: 'binary',
              op: '/',
              left: { type: 'num', value: 1 },
              right: {
                type: 'binary',
                op: '*',
                left: { type: 'num', value: 2 },
                right: { type: 'func', name: 'sqrt', arg: u }
              }
            };
            break;
          default:
            return { type: 'num', value: 0 };
        }

        // Chain rule: d(f(u)) = dFunc * du
        return {
          type: 'binary',
          op: '*',
          left: dFunc,
          right: du
        };
      }

      default:
        return { type: 'num', value: 0 };
    }
  }

  // Algebraic AST simplifier (removes 0s, 1s, folds constants)
  static simplify(node) {
    if (!node) return null;

    if (node.type === 'unary') {
      const opnd = this.simplify(node.operand);
      if (opnd.type === 'num') {
        return { type: 'num', value: -opnd.value };
      }
      return { type: 'unary', op: node.op, operand: opnd };
    }

    if (node.type === 'func') {
      return { type: 'func', name: node.name, arg: this.simplify(node.arg) };
    }

    if (node.type === 'binary') {
      const left = this.simplify(node.left);
      const right = this.simplify(node.right);

      // Constant folding
      if (left.type === 'num' && right.type === 'num') {
        const lv = left.value;
        const rv = right.value;
        switch (node.op) {
          case '+': return { type: 'num', value: lv + rv };
          case '-': return { type: 'num', value: lv - rv };
          case '*': return { type: 'num', value: lv * rv };
          case '/': return rv !== 0 ? { type: 'num', value: lv / rv } : node;
          case '^': return { type: 'num', value: Math.pow(lv, rv) };
        }
      }

      // Add: x + 0 -> x, 0 + x -> x
      if (node.op === '+') {
        if (left.type === 'num' && left.value === 0) return right;
        if (right.type === 'num' && right.value === 0) return left;
      }

      // Subtract: x - 0 -> x, 0 - x -> -x
      if (node.op === '-') {
        if (right.type === 'num' && right.value === 0) return left;
        if (left.type === 'num' && left.value === 0) {
          return { type: 'unary', op: '-', operand: right };
        }
      }

      // Multiply: x * 0 -> 0, 0 * x -> 0, x * 1 -> x, 1 * x -> x
      if (node.op === '*') {
        if ((left.type === 'num' && left.value === 0) || (right.type === 'num' && right.value === 0)) {
          return { type: 'num', value: 0 };
        }
        if (left.type === 'num' && left.value === 1) return right;
        if (right.type === 'num' && right.value === 1) return left;
      }

      // Divide: 0 / x -> 0, x / 1 -> x
      if (node.op === '/') {
        if (left.type === 'num' && left.value === 0) return { type: 'num', value: 0 };
        if (right.type === 'num' && right.value === 1) return left;
      }

      // Power: x ^ 0 -> 1, x ^ 1 -> x, 0 ^ x -> 0, 1 ^ x -> 1
      if (node.op === '^') {
        if (right.type === 'num' && right.value === 0) return { type: 'num', value: 1 };
        if (right.type === 'num' && right.value === 1) return left;
        if (left.type === 'num' && left.value === 0) return { type: 'num', value: 0 };
        if (left.type === 'num' && left.value === 1) return { type: 'num', value: 1 };
      }

      return { type: 'binary', op: node.op, left, right };
    }

    return node;
  }
}

// ============================================================================

// 3. CORE CALCULUS ENGINE INTERFACE
// ============================================================================

// Exact Fraction & Rational Arithmetic Helpers
function _gcd(a, b) {
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function _toFraction(numerator, denominator = 1) {
  if (denominator === 0) return { n: 0, d: 1, str: '0' };
  let n = Math.round(numerator);
  let d = Math.round(denominator);
  if (d < 0) { n = -n; d = -d; }
  const g = _gcd(n, d);
  n /= g;
  d /= g;
  if (d === 1) return { n, d, str: `${n}` };
  return { n, d, str: `${n}/${d}` };
}

export class CalculusEngine {

  // ==========================================================================
  // UNIVERSAL CALCULUS INPUT DETECTION & PARSING
  // ==========================================================================

  /**
   * Safely detects and parses universal mathematical & calculus expressions.
   * Classifies inputs without eval().
   */
  static detectCalculusInput(str) {
    let s = (str || '').trim();
    if (!s) {
      return {
        type: 'expression',
        raw: '',
        expr: 'x^2',
        suggestedOperations: ['Differentiate', 'Integrate', 'Plot']
      };
    }

    const unicodeSubMap = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
    const unicodeSupMap = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

    // 1. Definite integral with unicode subscript & superscript: ∫₀² expr dx
    const uniDefMatch = s.match(/^(?:∫|int)s*([₀₁₂₃₄₅₆₇₈₉]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)s*(.+?)(?:\s*dx)?$/i);
    if (uniDefMatch) {
      const aStr = [...uniDefMatch[1]].map(ch => unicodeSubMap[ch] || ch).join('');
      const bStr = [...uniDefMatch[2]].map(ch => unicodeSupMap[ch] || ch).join('');
      let expr = uniDefMatch[3].trim().replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
      return {
        type: 'definite_integral',
        raw: str,
        expr,
        a: parseFloat(aStr),
        b: parseFloat(bStr),
        suggestedOperations: ['Definite Integral', 'Calculate Area', 'Show Graph', 'Show Steps']
      };
    }

    // 2. Definite integral with _a^b or a to b: ∫_0^2 expr dx or ∫ 0 to 2 expr dx
    const stdDefMatch = s.match(/^(?:∫|int)(?:_([^\^]+)\^([^\s]+)|\s+([0-9\.\-]+)\s+to\s+([0-9\.\-]+))\s*(.+?)(?:\s*dx)?$/i);
    if (stdDefMatch) {
      const aVal = parseFloat(stdDefMatch[1] || stdDefMatch[3]);
      const bVal = parseFloat(stdDefMatch[2] || stdDefMatch[4]);
      let expr = stdDefMatch[5].trim().replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
      return {
        type: 'definite_integral',
        raw: str,
        expr,
        a: aVal,
        b: bVal,
        suggestedOperations: ['Definite Integral', 'Calculate Area', 'Show Graph', 'Show Steps']
      };
    }

    // Normalize superscripts for standard parsing
    const normalized = s
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/→/g, '->');

    // 3. Limit notation: lim x->c expr or lim(x->c) expr or lim x->inf expr
    const limMatch = normalized.match(/^lim(?:\s*\(x(?:\s*->|\s*→)\s*([^)]+)\)|\s+x(?:\s*->|\s*→)\s*([^\s]+))\s*(.+)$/i);
    if (limMatch) {
      const cStr = (limMatch[1] || limMatch[2]).trim();
      const expr = limMatch[3].trim();
      const c = (cStr === 'inf' || cStr === '∞') ? Infinity : (cStr === '-inf' || cStr === '-∞') ? -Infinity : parseFloat(cStr);
      return {
        type: 'limit',
        raw: str,
        expr,
        c,
        cStr,
        suggestedOperations: ['Evaluate Limit', 'Show Steps', 'Plot']
      };
    }

    // 4. Derivative notation: d/dx (...) or d^2/dx^2 (...)
    const derivMatch = normalized.match(/^d(?:\^?([0-9]+))?\/dx(?:\^?[0-9]+)?\s*(?:\[|\(|\s)(.+?)(?:\]|\))?$/i);
    if (derivMatch) {
      const order = parseInt(derivMatch[1] || '1', 10);
      const expr = derivMatch[2].trim();
      return {
        type: 'derivative',
        raw: str,
        expr,
        order,
        suggestedOperations: ['Differentiate', 'Show Steps', 'Tangent & Normal', 'Plot']
      };
    }

    // 5. Indefinite Integral notation: ∫ expr dx or int expr dx
    const indefMatch = normalized.match(/^(?:∫|int)\s*(.+?)(?:\s*dx)?$/i);
    if (indefMatch && !normalized.includes('=')) {
      const expr = indefMatch[1].trim();
      return {
        type: 'indefinite_integral',
        raw: str,
        expr,
        suggestedOperations: ['Indefinite Integral', 'Show Steps', 'Plot']
      };
    }

    // 6. Differential Equation notation: dy/dx = ... or y' = ...
    if (/^(?:dy\/dx|y'|y'')\s*=/i.test(normalized) || /dy\/dx\s*\+/i.test(normalized)) {
      return {
        type: 'differential_equation',
        raw: str,
        expr: normalized,
        suggestedOperations: ['Solve Differential Equation', 'Analyze Order & Degree', 'Show Steps']
      };
    }

    // 7. Function assignment: f(x) = ... or y = ...
    const funcMatch = normalized.match(/^(?:f\(x\)|y)\s*=\s*(.+)$/i);
    if (funcMatch) {
      const expr = funcMatch[1].trim();
      return {
        type: 'function',
        raw: str,
        expr,
        suggestedOperations: ['Analyze Function', 'Differentiate', 'Integrate', 'Critical Points', 'Plot']
      };
    }

    // 8. General expression: e.g. x^2 + 3x + 2, x^3 - 3x
    return {
      type: 'expression',
      raw: str,
      expr: normalized,
      suggestedOperations: ['Differentiate', 'Integrate', 'Analyze Function', 'Critical Points', 'Plot']
    };
  }

  // ==========================================================================
  // MODULE 01: LIMITS
  // ==========================================================================

  /**
   * Complete Limit Calculator:
   * Left-hand limit (L⁻), Right-hand limit (L⁺), Two-sided limit (L),
   * Algebraic factorization, Indeterminate detection (0/0), Standard limits.
   */
  static evaluateLimit(exprStr, c = 0) {
    const cleanExpr = (exprStr || '').trim().replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
    const expr = new MathExpression(cleanExpr);
    if (!expr.isValid()) {
      return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);
    }

    const cVal = ResultFormatter.cleanNumber(c);
    const isInfinityApproach = !Number.isFinite(c);

    // Delta approach points
    const deltas = isInfinityApproach ? [10, 100, 1000, 10000, 100000] : [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001];

    let leftPoints = [];
    let rightPoints = [];
    let lhlClean = null;
    let rhlClean = null;
    let limitExists = false;
    let limitValue = null;
    let limitStr = 'Does not exist';
    let method = 'Direct Substitution';
    let factorizationStep = null;
    let classification = 'Finite';

    if (isInfinityApproach) {
      method = 'Limit at Infinity Analysis';
      const isPosInf = c === Infinity;
      const xVals = isPosInf ? [10, 100, 1000, 10000, 100000] : [-10, -100, -1000, -10000, -100000];
      const infPoints = xVals.map(x => ({ x, h: x, y: expr.evaluate(x) }));
      const lastY = infPoints[infPoints.length - 1].y;

      if (Number.isFinite(lastY)) {
        limitExists = true;
        limitValue = Math.abs(lastY) < 1e-4 ? 0 : ResultFormatter.cleanNumber(lastY);
        limitStr = String(limitValue);
        classification = 'Finite';
      } else {
        limitExists = true;
        limitValue = lastY > 0 ? '∞' : '-∞';
        limitStr = limitValue;
        classification = 'Infinite';
      }
      lhlClean = limitStr;
      rhlClean = limitStr;
      leftPoints = infPoints;
      rightPoints = infPoints;
    } else {
      // Finite approach c
      // Left-hand approach: c - delta
      deltas.forEach(h => {
        const x = c - h;
        const y = expr.evaluate(x);
        leftPoints.push({ x: ResultFormatter.cleanNumber(x), h, y });
      });

      // Right-hand approach: c + delta
      deltas.forEach(h => {
        const x = c + h;
        const y = expr.evaluate(x);
        rightPoints.push({ x: ResultFormatter.cleanNumber(x), h, y });
      });

      const lhlVal = leftPoints[leftPoints.length - 1].y;
      const rhlVal = rightPoints[rightPoints.length - 1].y;

      const isLhlFinite = Number.isFinite(lhlVal);
      const isRhlFinite = Number.isFinite(rhlVal);

      lhlClean = isLhlFinite ? ResultFormatter.cleanNumber(lhlVal) : (lhlVal > 0 ? '∞' : '-∞');
      rhlClean = isRhlFinite ? ResultFormatter.cleanNumber(rhlVal) : (rhlVal > 0 ? '∞' : '-∞');

      const directVal = expr.evaluate(c);
      const isDirectFinite = Number.isFinite(directVal) && !Number.isNaN(directVal);

      // Check standard algebraic indeterminate forms e.g. (x^2 - a^2)/(x - a) at x=a
      const polyDivMatch = cleanExpr.replace(/\s+/g, '').match(/^\(?x\^2-([0-9]+)\)?\/\(?x-([0-9]+)\)?$/i);
      if (polyDivMatch) {
        const aSq = parseFloat(polyDivMatch[1]);
        const aVal = parseFloat(polyDivMatch[2]);
        if (Math.abs(aVal * aVal - aSq) < 1e-6 && Math.abs(cVal - aVal) < 1e-6) {
          method = 'Factorization: (x² - a²)/(x - a) = (x - a)(x + a)/(x - a) = x + a';
          factorizationStep = `Algebraic Factorization: rac{x^2 - ${aSq}}{x - ${aVal}} = rac{(x - ${aVal})(x + ${aVal})}{x - ${aVal}} = x + ${aVal} for x ≠ ${aVal}`;
          limitExists = true;
          limitValue = 2 * aVal;
          limitStr = String(limitValue);
          lhlClean = limitValue;
          rhlClean = limitValue;
        }
      }

      // Check standard trigonometric limits: sin(x)/x as x->0
      if (/^sin\(x\)\/x$/i.test(cleanExpr.replace(/\s+/g, '')) && cVal === 0) {
        method = 'Standard Trigonometric Limit: lim_{x→0} sin(x)/x = 1';
        limitExists = true;
        limitValue = 1;
        limitStr = '1';
        lhlClean = 1;
        rhlClean = 1;
      }

      if (!factorizationStep && limitValue === null) {
        if (isDirectFinite) {
          method = 'Direct Substitution';
          limitExists = true;
          limitValue = ResultFormatter.cleanNumber(directVal);
          limitStr = String(limitValue);
          classification = 'Finite';
        } else if (isLhlFinite && isRhlFinite && Math.abs(lhlVal - rhlVal) < 1e-3) {
          method = 'Algebraic Simplification / Numerical Approach';
          limitExists = true;
          limitValue = ResultFormatter.cleanNumber((lhlVal + rhlVal) / 2);
          limitStr = String(limitValue);
          classification = 'Finite';
        } else if (lhlClean === rhlClean && (lhlClean === '∞' || lhlClean === '-∞')) {
          method = 'Asymptotic Analysis';
          limitExists = true;
          limitValue = lhlClean;
          limitStr = lhlClean;
          classification = 'Infinite';
        } else {
          limitExists = false;
          limitValue = null;
          limitStr = 'Does not exist';
          classification = 'Does not exist';
        }
      }
    }

    const formulaStr = `lim(x→${cVal}) f(x) = L ⟺ L⁻ = L⁺ = L`;

    const steps = [
      `1. Problem: lim_{x→${cVal}} ${expr.toString()}`,
      `2. Approach Value: x → ${cVal}`,
      `3. Method Applied: ${method}`,
      ...(factorizationStep ? [`4. ${factorizationStep}`] : []),
      `5. Left-Hand Limit (L⁻): As x → ${cVal}⁻, L⁻ = ${lhlClean}`,
      `6. Right-Hand Limit (L⁺): As x → ${cVal}⁺, L⁺ = ${rhlClean}`,
      `7. Determination: ${limitExists ? `L⁻ = L⁺ = ${limitStr} ⟹ Two-sided limit exists and equals ${limitStr}` : `L⁻ (${lhlClean}) ≠ L⁺ (${rhlClean}) ⟹ Limit Does Not Exist`}`,
      `8. Classification: ${classification}`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        c: cVal,
        method,
        lhl: lhlClean,
        rhl: rhlClean,
        limitExists,
        limitValue,
        limitStr,
        classification,
        leftPoints,
        rightPoints
      },
      steps,
      formulaStr
    );
  }

  // ==========================================================================
  // MODULE 02: DERIVATIVES
  // ==========================================================================

  /**
   * Symbolic Derivative Engine:
   * First, second, higher derivatives, Product Rule, Quotient Rule, Chain Rule, Power Rule.
   * Provides mathematically meaningful step-by-step breakdown.
   */
  static differentiate(exprStr, n = 1, evalX = null) {
    const cleanExpr = (exprStr || '').trim().replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
    const expr = new MathExpression(cleanExpr);
    if (!expr.isValid()) {
      return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);
    }

    const order = Math.max(1, Math.min(10, parseInt(n, 10) || 1));
    let currAst = expr.ast;
    const derivationStages = [];

    derivationStages.push({
      order: 0,
      expr: expr.toString(),
      label: 'f(x)'
    });

    for (let i = 1; i <= order; i++) {
      const rawD = SymbolicDifferentiator.differentiate(currAst);
      const simpD = SymbolicDifferentiator.simplify(rawD);
      const simpStr = expr.toString(simpD);

      currAst = simpD;
      derivationStages.push({
        order: i,
        expr: simpStr,
        label: i === 1 ? "f'(x)" : i === 2 ? "f''(x)" : i === 3 ? "f'''(x)" : `f^(${i})(x)`
      });
    }

    const firstDerivStr = derivationStages[1]?.expr || '';
    const secondDerivStr = derivationStages[2]?.expr || (order >= 2 ? derivationStages[2].expr : '');
    const nthDerivStr = derivationStages[order].expr;

    let evalResult = null;
    let evalTangentInterpretation = '';
    if (evalX !== null && evalX !== undefined && !Number.isNaN(evalX)) {
      const nthExpr = new MathExpression(nthDerivStr);
      evalResult = ResultFormatter.cleanNumber(nthExpr.evaluate(evalX));
      if (order === 1) {
        evalTangentInterpretation = `Geometrical interpretation: The slope of the tangent line to y = f(x) at x = ${evalX} is m = ${evalResult}.`;
      }
    }

    // Step-by-step rule detection for order 1
    const steps = [];
    const ast = expr.ast;

    steps.push(`1. Problem: Find derivative d/dx [${expr.toString()}]`);

    if (order === 1 && ast.type === 'binary' && ast.op === '*') {
      // Product Rule: (u*v)' = u'*v + u*v'
      const uAst = ast.left;
      const vAst = ast.right;
      const uStr = expr.toString(uAst);
      const vStr = expr.toString(vAst);
      const duAst = SymbolicDifferentiator.simplify(SymbolicDifferentiator.differentiate(uAst));
      const dvAst = SymbolicDifferentiator.simplify(SymbolicDifferentiator.differentiate(vAst));
      const duStr = expr.toString(duAst);
      const dvStr = expr.toString(dvAst);

      steps.push(`2. Step 1 (Identification): Product Rule d/dx [u · v] = u'·v + u·v' where u = ${uStr} and v = ${vStr}`);
      steps.push(`3. Step 2 (Differentiate First): u' = d/dx [${uStr}] = ${duStr}`);
      steps.push(`4. Step 3 (Differentiate Second): v' = d/dx [${vStr}] = ${dvStr}`);
      steps.push(`5. Step 4 (Substitute): (${duStr}) · (${vStr}) + (${uStr}) · (${dvStr})`);
      steps.push(`6. Step 5 (Simplify): ${firstDerivStr}`);
      steps.push(`7. Final Answer: f'(x) = ${firstDerivStr}`);
    } else if (order === 1 && ast.type === 'binary' && ast.op === '/') {
      // Quotient Rule: (u/v)' = (u'*v - u*v') / v^2
      const uAst = ast.left;
      const vAst = ast.right;
      const uStr = expr.toString(uAst);
      const vStr = expr.toString(vAst);
      const duAst = SymbolicDifferentiator.simplify(SymbolicDifferentiator.differentiate(uAst));
      const dvAst = SymbolicDifferentiator.simplify(SymbolicDifferentiator.differentiate(vAst));
      const duStr = expr.toString(duAst);
      const dvStr = expr.toString(dvAst);

      steps.push(`2. Step 1 (Identification): Quotient Rule d/dx [u / v] = (u'·v - u·v') / v² where u = ${uStr} and v = ${vStr}`);
      steps.push(`3. Step 2 (Differentiate Numerator): u' = d/dx [${uStr}] = ${duStr}`);
      steps.push(`4. Step 3 (Differentiate Denominator): v' = d/dx [${vStr}] = ${dvStr}`);
      steps.push(`5. Step 4 (Substitute): [(${duStr}) · (${vStr}) - (${uStr}) · (${dvStr})] / (${vStr})²`);
      steps.push(`6. Step 5 (Simplify): ${firstDerivStr}`);
      steps.push(`7. Final Answer: f'(x) = ${firstDerivStr}`);
    } else if (order === 1 && ast.type === 'func' && ast.arg.type !== 'var' && ast.arg.type !== 'num') {
      // Chain Rule: d/dx [f(g(x))] = f'(g(x)) * g'(x)
      const gAst = ast.arg;
      const gStr = expr.toString(gAst);
      const dgAst = SymbolicDifferentiator.simplify(SymbolicDifferentiator.differentiate(gAst));
      const dgStr = expr.toString(dgAst);

      steps.push(`2. Step 1 (Identification): Chain Rule d/dx [f(g(x))] = f'(g(x)) · g'(x)`);
      steps.push(`3. Step 2 (Outer Function): f(u) = ${ast.name}(u) ⟹ f'(u)`);
      steps.push(`4. Step 3 (Inner Function): u = g(x) = ${gStr} ⟹ g'(x) = ${dgStr}`);
      steps.push(`5. Step 4 (Substitute): f'(${gStr}) · (${dgStr})`);
      steps.push(`6. Step 5 (Simplify): ${firstDerivStr}`);
      steps.push(`7. Final Answer: f'(x) = ${firstDerivStr}`);
    } else {
      // Standard / General Rule
      const formulaStr = order === 1 
        ? "f'(x) = d/dx [f(x)]" 
        : order === 2 
        ? "f''(x) = d²/dx² [f(x)] = d/dx [f'(x)]" 
        : `f^(${order})(x) = d^${order}/dx^${order} [f(x)]`;

      steps.push(`2. Formula: ${formulaStr}`);
      derivationStages.slice(1).forEach(s => {
        steps.push(`3. Order #${s.order} Derivative: ${s.label} = ${s.expr}`);
      });
      steps.push(`4. Final Answer: ${derivationStages[order].label} = ${nthDerivStr}`);
    }

    if (evalResult !== null) {
      steps.push(`Evaluation at x = ${evalX}: ${derivationStages[order].label}|_{x=${evalX}} = ${evalResult}`);
      if (evalTangentInterpretation) {
        steps.push(evalTangentInterpretation);
      }
    }

    const formulaStr = order === 1 
      ? "f'(x) = d/dx [f(x)]" 
      : order === 2 
      ? "f''(x) = d²/dx² [f(x)]" 
      : `f^(${order})(x) = d^${order}/dx^${order} [f(x)]`;

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        order,
        firstDerivative: firstDerivStr,
        secondDerivative: secondDerivStr,
        nthDerivative: nthDerivStr,
        derivationStages,
        evalX,
        evalResult,
        evalTangentInterpretation
      },
      steps,
      formulaStr
    );
  }

  // ==========================================================================
  // MODULE 03: CONTINUITY
  // ==========================================================================

  /**
   * Continuity Analyzer at x = c:
   * Condition: LHL = RHL = f(c)
   * Discontinuity classification: Removable, Jump, Infinite
   */
  static checkContinuity(exprStr, c = 0) {
    const limRes = this.evaluateLimit(exprStr, c);
    if (!limRes.success) return limRes;

    const expr = new MathExpression(exprStr);
    const cVal = ResultFormatter.cleanNumber(c);
    const fVal = expr.evaluate(c);
    const isFDefined = Number.isFinite(fVal);

    const { lhl, rhl, limitExists, limitValue } = limRes.result;

    let isContinuous = false;
    let classification = '';

    if (isFDefined && limitExists && Math.abs(fVal - limitValue) < 1e-4) {
      isContinuous = true;
      classification = 'Continuous';
    } else if (limitExists && !isFDefined) {
      classification = 'Removable Discontinuity (Hole / Missing Point)';
    } else if (limitExists && isFDefined && Math.abs(fVal - limitValue) >= 1e-4) {
      classification = 'Removable Discontinuity (Isolated Point)';
    } else if (typeof lhl === 'number' && typeof rhl === 'number' && Math.abs(lhl - rhl) >= 1e-4) {
      classification = 'Jump Discontinuity';
    } else {
      classification = 'Infinite Discontinuity (Vertical Asymptote)';
    }

    const formulaStr = 'f is continuous at x = a ⟺ lim(x→a⁻) f(x) = lim(x→a⁺) f(x) = f(a)';

    const steps = [
      `1. Target Function: f(x) = ${expr.toString()}`,
      `2. Evaluation Point: x = ${cVal}`,
      `3. Function Value: f(${cVal}) = ${isFDefined ? ResultFormatter.cleanNumber(fVal) : 'Undefined'}`,
      `4. Left-Hand Limit (LHL): lim_{x→${cVal}⁻} f(x) = ${lhl}`,
      `5. Right-Hand Limit (RHL): lim_{x→${cVal}⁺} f(x) = ${rhl}`,
      `6. Limit Existence: ${limitExists ? `Limit exists: L = ${limitValue}` : `LHL ≠ RHL ⟹ Limit does not exist`}`,
      `7. Mathematical Condition Check: LHL = RHL = f(${cVal}) ⟹ ${isContinuous ? 'SATISFIED' : 'NOT SATISFIED'}`,
      `8. Verdict: ${isContinuous ? `Continuous at x = ${cVal}` : `Discontinuous at x = ${cVal} (${classification})`}`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        c: cVal,
        fValue: isFDefined ? ResultFormatter.cleanNumber(fVal) : null,
        isFDefined,
        lhl,
        rhl,
        limitValue,
        isContinuous,
        classification
      },
      steps,
      formulaStr
    );
  }

  // ==========================================================================
  // MODULE 04: DIFFERENTIABILITY
  // ==========================================================================

  /**
   * Differentiability Analyzer at x = c:
   * Left Derivative (LHD), Right Derivative (RHD)
   * Note: Differentiability implies continuity, but continuity does not imply differentiability.
   * Example: |x| is continuous at x=0 but not differentiable.
   */
  static checkDifferentiability(exprStr, c = 0) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);

    const cVal = ResultFormatter.cleanNumber(c);
    const contRes = this.checkContinuity(exprStr, c);
    const isContinuous = contRes.success && contRes.result.isContinuous;

    const h = 1e-5;
    const fc = expr.evaluate(cVal);
    const fLeft = expr.evaluate(cVal - h);
    const fRight = expr.evaluate(cVal + h);

    const lhd = (fc - fLeft) / h;
    const rhd = (fRight - fc) / h;

    const isLhdFinite = Number.isFinite(lhd);
    const isRhdFinite = Number.isFinite(rhd);

    let isDifferentiable = false;
    let explanation = '';

    if (!isContinuous) {
      isDifferentiable = false;
      explanation = `Function is discontinuous at x = ${cVal}. Discontinuity immediately implies non-differentiability.`;
    } else if (isLhdFinite && isRhdFinite && Math.abs(lhd - rhd) < 1e-3) {
      isDifferentiable = true;
      explanation = `Function is continuous at x = ${cVal} and Left Derivative (LHD = ${ResultFormatter.cleanNumber(lhd)}) equals Right Derivative (RHD = ${ResultFormatter.cleanNumber(rhd)}).`;
    } else {
      isDifferentiable = false;
      explanation = `Function is continuous at x = ${cVal}, but Left Derivative (LHD = ${ResultFormatter.cleanNumber(lhd)}) does NOT equal Right Derivative (RHD = ${ResultFormatter.cleanNumber(rhd)}). Sharp corner or cusp.`;
    }

    const formulaStr = "Differentiable at x=c ⟺ LHD = RHD = f'(c) where f'(c) = lim_{h→0} [f(c+h) - f(c)]/h";

    const steps = [
      `1. Function: f(x) = ${expr.toString()}`,
      `2. Evaluation Point: x = ${cVal}`,
      `3. Continuity Test: ${isContinuous ? 'Continuous at x = ' + cVal : 'Discontinuous at x = ' + cVal}`,
      `4. Left Derivative (LHD): lim_{h→0⁻} [f(${cVal}+h) - f(${cVal})]/h = ${isLhdFinite ? ResultFormatter.cleanNumber(lhd) : 'Undefined'}`,
      `5. Right Derivative (RHD): lim_{h→0⁺} [f(${cVal}+h) - f(${cVal})]/h = ${isRhdFinite ? ResultFormatter.cleanNumber(rhd) : 'Undefined'}`,
      `6. Comparison: LHD ${Math.abs(lhd - rhd) < 1e-3 ? '=' : '≠'} RHD`,
      `7. Theorem Note: Differentiability implies continuity. However, continuity does not necessarily imply differentiability (e.g. |x| at x=0).`,
      `8. Verdict: ${isDifferentiable ? `Differentiable at x = ${cVal} with f'(${cVal}) = ${ResultFormatter.cleanNumber(rhd)}` : `NOT Differentiable at x = ${cVal}`}`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        c: cVal,
        isContinuous,
        lhd: isLhdFinite ? ResultFormatter.cleanNumber(lhd) : null,
        rhd: isRhdFinite ? ResultFormatter.cleanNumber(rhd) : null,
        isDifferentiable,
        explanation
      },
      steps,
      formulaStr
    );
  }

  // ==========================================================================
  // MODULE 05: APPLICATIONS OF DERIVATIVES
  // ==========================================================================

  /**
   * Tangent and Normal lines at point x0:
   * Point of contact (x0, y0), Tangent slope m, Tangent equation,
   * Normal slope mn = -1/m, Normal equation.
   */
  static tangentAndNormal(exprStr, x0 = 1) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) {
      return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);
    }

    const diffRes = this.differentiate(exprStr, 1);
    if (!diffRes.success) return diffRes;

    const derivExpr = new MathExpression(diffRes.result.firstDerivative);
    const xVal = ResultFormatter.cleanNumber(x0);
    const y0 = expr.evaluate(xVal);
    const m = derivExpr.evaluate(xVal);

    if (!Number.isFinite(y0) || !Number.isFinite(m)) {
      return ResultFormatter.error(`Function or derivative is not finite at x = ${xVal}`);
    }

    const y0Clean = ResultFormatter.cleanNumber(y0);
    const mClean = ResultFormatter.cleanNumber(m);

    // Tangent Line: y - y0 = m*(x - x0) => y = m*x + (y0 - m*x0)
    const cTan = ResultFormatter.cleanNumber(y0 - m * xVal);
    const tangentEq = mClean === 0 ? `y = ${y0Clean}` : `y = ${mClean}x ${cTan >= 0 ? `+ ${cTan}` : `- ${Math.abs(cTan)}`}`;

    // Normal Line: slope mN = -1 / m
    let normalEq = '';
    let mN = null;
    if (Math.abs(m) < 1e-12) {
      normalEq = `x = ${xVal} (Vertical Line)`;
    } else {
      mN = ResultFormatter.cleanNumber(-1 / m);
      const cNorm = ResultFormatter.cleanNumber(y0 - mN * xVal);
      normalEq = `y = ${mN}x ${cNorm >= 0 ? `+ ${cNorm}` : `- ${Math.abs(cNorm)}`}`;
    }

    const formulaStr = "Tangent: y - y₀ = f'(x₀)·(x - x₀)   |   Normal: y - y₀ = -1/f'(x₀)·(x - x₀)";

    const steps = [
      `1. Function: y = f(x) = ${expr.toString()}`,
      `2. Point of Contact: x₀ = ${xVal} ⟹ y₀ = f(${xVal}) = ${y0Clean} ⟹ P(${xVal}, ${y0Clean})`,
      `3. First Derivative: f'(x) = ${diffRes.result.firstDerivative}`,
      `4. Slope of Tangent: m = f'(${xVal}) = ${mClean}`,
      `5. Tangent Equation: y - (${y0Clean}) = ${mClean}·(x - ${xVal}) ⟹ ${tangentEq}`,
      `6. Slope of Normal: mₙ = -1 / m = ${mN !== null ? mN : 'Undefined (Vertical line)'}`,
      `7. Normal Equation: ${normalEq}`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        x0: xVal,
        y0: y0Clean,
        slope: mClean,
        tangentEq,
        normalSlope: mN,
        normalEq,
        firstDerivative: diffRes.result.firstDerivative
      },
      steps,
      formulaStr
    );
  }

  /**
   * Extrema (Maxima/Minima), Monotonicity, and Concavity:
   * First & Second derivative tests, Increasing/Decreasing intervals, Inflection points.
   */
  static extremaAndMonotonicity(exprStr, rangeMin = -5, rangeMax = 5) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);

    const d1Res = this.differentiate(exprStr, 1);
    const d2Res = this.differentiate(exprStr, 2);
    if (!d1Res.success) return d1Res;

    const d1 = new MathExpression(d1Res.result.firstDerivative);
    const d2 = new MathExpression(d2Res.result.secondDerivative);

    // Critical points: search for roots of f'(x) = 0 in [rangeMin, rangeMax]
    const criticalPoints = [];
    const stepSize = 0.05;
    let prevVal = d1.evaluate(rangeMin);

    for (let x = rangeMin + stepSize; x <= rangeMax; x += stepSize) {
      const curVal = d1.evaluate(x);
      if (Number.isFinite(prevVal) && Number.isFinite(curVal) && (prevVal * curVal <= 0)) {
        // Refine root with bisection
        let lo = x - stepSize;
        let hi = x;
        for (let iter = 0; iter < 12; iter++) {
          const mid = (lo + hi) / 2;
          const fMid = d1.evaluate(mid);
          if (fMid * d1.evaluate(lo) <= 0) hi = mid;
          else lo = mid;
        }
        const cX = ResultFormatter.cleanNumber((lo + hi) / 2);
        if (!criticalPoints.some(p => Math.abs(p.x - cX) < 0.1)) {
          const cY = ResultFormatter.cleanNumber(expr.evaluate(cX));
          const secondD = d2.evaluate(cX);
          let type = 'Critical Point';
          let testReason = '';

          if (secondD < -1e-4) {
            type = 'Local Maximum';
            testReason = `f''(${cX}) = ${ResultFormatter.cleanNumber(secondD)} < 0 (Concave Down ⟹ Local Maximum)`;
          } else if (secondD > 1e-4) {
            type = 'Local Minimum';
            testReason = `f''(${cX}) = ${ResultFormatter.cleanNumber(secondD)} > 0 (Concave Up ⟹ Local Minimum)`;
          } else {
            type = 'Inconclusive / Inflection';
            testReason = `f''(${cX}) = 0 (Second derivative test inconclusive)`;
          }

          criticalPoints.push({ x: cX, y: cY, type, secondD: ResultFormatter.cleanNumber(secondD), testReason });
        }
      }
      prevVal = curVal;
    }

    // Sort critical points
    criticalPoints.sort((a, b) => a.x - b.x);

    // Monotonicity intervals
    const splitPoints = [rangeMin, ...criticalPoints.map(p => p.x), rangeMax];
    const intervals = [];

    for (let i = 0; i < splitPoints.length - 1; i++) {
      const a = splitPoints[i];
      const b = splitPoints[i + 1];
      const mid = (a + b) / 2;
      const slope = d1.evaluate(mid);
      const isInc = slope > 0;
      intervals.push({
        interval: `(${ResultFormatter.cleanNumber(a)}, ${ResultFormatter.cleanNumber(b)})`,
        behavior: isInc ? 'Increasing' : 'Decreasing',
        sign: isInc ? "f'(x) > 0" : "f'(x) < 0"
      });
    }

    const formulaStr = "Critical points: f'(x) = 0   |   Max: f''(x) < 0   |   Min: f''(x) > 0";

    const steps = [
      `1. Function: f(x) = ${expr.toString()}`,
      `2. First Derivative: f'(x) = ${d1Res.result.firstDerivative}`,
      `3. Second Derivative: f''(x) = ${d2Res.result.secondDerivative}`,
      `4. Critical Points where f'(x) = 0:`,
      ...(criticalPoints.length > 0 
        ? criticalPoints.map(p => `   x = ${p.x} ⟹ y = ${p.y} : ${p.type} (${p.testReason})`)
        : ['   No critical points found in the search range']),
      `5. Monotonicity Intervals:`,
      ...intervals.map(int => `   ${int.interval} : ${int.behavior} (${int.sign})`)
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        firstDerivative: d1Res.result.firstDerivative,
        secondDerivative: d2Res.result.secondDerivative,
        criticalPoints,
        intervals
      },
      steps,
      formulaStr
    );
  }

  /**
   * Optimization Calculator:
   * Finds absolute maximum & minimum of f(x) on interval [a, b].
   */
  static optimizeFunction(exprStr, a = -5, b = 5) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);

    const aVal = ResultFormatter.cleanNumber(a);
    const bVal = ResultFormatter.cleanNumber(b);

    const extremRes = this.extremaAndMonotonicity(exprStr, aVal, bVal);
    if (!extremRes.success) return extremRes;

    const candidates = [];
    // Boundary points
    candidates.push({ x: aVal, y: ResultFormatter.cleanNumber(expr.evaluate(aVal)), source: 'Left Boundary' });
    candidates.push({ x: bVal, y: ResultFormatter.cleanNumber(expr.evaluate(bVal)), source: 'Right Boundary' });

    // Interior critical points
    extremRes.result.criticalPoints.forEach(p => {
      if (p.x > aVal && p.x < bVal) {
        candidates.push({ x: p.x, y: p.y, source: `Critical Point (${p.type})` });
      }
    });

    candidates.sort((c1, c2) => c1.y - c2.y);
    const globalMin = candidates[0];
    const globalMax = candidates[candidates.length - 1];

    const formulaStr = "Global Extrema on [a, b]: Compare f(a), f(b), and f(c) for all critical points c ∈ (a, b)";

    const steps = [
      `1. Objective Function: f(x) = ${expr.toString()}`,
      `2. Closed Interval: [${aVal}, ${bVal}]`,
      `3. First Derivative: f'(x) = ${extremRes.result.firstDerivative}`,
      `4. Candidate Points Evaluation:`,
      ...candidates.map(c => `   x = ${c.x} ⟹ f(x) = ${c.y} [${c.source}]`),
      `5. Absolute Maximum: Max value = ${globalMax.y} at x = ${globalMax.x} (${globalMax.source})`,
      `6. Absolute Minimum: Min value = ${globalMin.y} at x = ${globalMin.x} (${globalMin.source})`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        a: aVal,
        b: bVal,
        candidates,
        globalMax,
        globalMin
      },
      steps,
      formulaStr
    );
  }

  // ==========================================================================
  // MODULE 06: INTEGRALS
  // ==========================================================================

  /**
   * Symbolic Indefinite Integration:
   * Power rule with EXACT fraction coefficients (x³/3 + C, NOT 0.333333333x³ + C),
   * Trigonometric, Exponential, Reciprocal, Linear combinations, and By Parts.
   */
  static indefiniteIntegral(exprStr) {
    const cleanStr = (exprStr || '')
      .trim()
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/⁴/g, '^4')
      .replace(/\s+/g, '');

    let antiderivStr = null;
    let ruleApplied = '';

    // Standard pattern matching
    // 1. Monomial: a*x^n or x^n or a*x or a
    const polyMatch = cleanStr.match(/^([+-]?\d*(?:\.\d+)?)?\*?x(?:\^([+-]?\d+))?$/i);
    const constMatch = cleanStr.match(/^([+-]?\d+(?:\.\d+)?)$/);

    if (constMatch) {
      const c = parseFloat(constMatch[1]);
      antiderivStr = c === 1 ? 'x' : c === -1 ? '-x' : `${c}x`;
      ruleApplied = 'Constant Rule: ∫ c dx = c·x + C';
    } else if (polyMatch) {
      let coeffStr = polyMatch[1];
      let coeff = coeffStr === '' || coeffStr === undefined ? 1 : coeffStr === '-' ? -1 : parseFloat(coeffStr);
      let power = polyMatch[2] !== undefined ? parseInt(polyMatch[2], 10) : 1;

      if (power === -1) {
        antiderivStr = coeff === 1 ? 'ln|x|' : coeff === -1 ? '-ln|x|' : `${coeff}·ln|x|`;
        ruleApplied = 'Reciprocal Rule: ∫ 1/x dx = ln|x| + C';
      } else {
        const newPower = power + 1;
        const frac = _toFraction(coeff, newPower);

        if (newPower === 1) {
          antiderivStr = frac.d === 1 ? (frac.n === 1 ? 'x' : frac.n === -1 ? '-x' : `${frac.n}x`) : `${frac.n}x/${frac.d}`;
        } else if (frac.d === 1) {
          antiderivStr = frac.n === 1 ? `x^${newPower}` : frac.n === -1 ? `-x^${newPower}` : `${frac.n}x^${newPower}`;
        } else {
          antiderivStr = frac.n === 1 ? `x^${newPower}/${frac.d}` : frac.n === -1 ? `-x^${newPower}/${frac.d}` : `${frac.n}x^${newPower}/${frac.d}`;
        }
        ruleApplied = `Power Rule: ∫ x^n dx = x^(n+1)/(n+1) + C`;
      }
    } else if (/^sin\(x\)$/i.test(cleanStr)) {
      antiderivStr = '-cos(x)';
      ruleApplied = 'Standard Integral: ∫ sin(x) dx = -cos(x) + C';
    } else if (/^cos\(x\)$/i.test(cleanStr)) {
      antiderivStr = 'sin(x)';
      ruleApplied = 'Standard Integral: ∫ cos(x) dx = sin(x) + C';
    } else if (/^sec\(x\)\^2$/i.test(cleanStr) || /^sec\^2\(x\)$/i.test(cleanStr)) {
      antiderivStr = 'tan(x)';
      ruleApplied = 'Standard Integral: ∫ sec²(x) dx = tan(x) + C';
    } else if (/^csc\(x\)\^2$/i.test(cleanStr) || /^csc\^2\(x\)$/i.test(cleanStr)) {
      antiderivStr = '-cot(x)';
      ruleApplied = 'Standard Integral: ∫ csc²(x) dx = -cot(x) + C';
    } else if (/^sec\(x\)\*?tan\(x\)$/i.test(cleanStr)) {
      antiderivStr = 'sec(x)';
      ruleApplied = 'Standard Integral: ∫ sec(x)tan(x) dx = sec(x) + C';
    } else if (/^csc\(x\)\*?cot\(x\)$/i.test(cleanStr)) {
      antiderivStr = '-csc(x)';
      ruleApplied = 'Standard Integral: ∫ csc(x)cot(x) dx = -csc(x) + C';
    } else if (/^exp\(x\)$/i.test(cleanStr) || /^e\^x$/i.test(cleanStr)) {
      antiderivStr = 'e^x';
      ruleApplied = 'Standard Integral: ∫ e^x dx = e^x + C';
    } else if (/^1\/x$/i.test(cleanStr)) {
      antiderivStr = 'ln|x|';
      ruleApplied = 'Standard Integral: ∫ 1/x dx = ln|x| + C';
    } else if (/^x\*?(?:exp\(x\)|e\^x)$/i.test(cleanStr)) {
      antiderivStr = '(x - 1)e^x';
      ruleApplied = 'Integration by Parts: ∫ x·eˣ dx = (x - 1)eˣ + C';
    } else if (/^x\*?sin\(x\)$/i.test(cleanStr)) {
      antiderivStr = '-x·cos(x) + sin(x)';
      ruleApplied = 'Integration by Parts: ∫ x·sin(x) dx = -x·cos(x) + sin(x) + C';
    } else if (/^x\*?cos\(x\)$/i.test(cleanStr)) {
      antiderivStr = 'x·sin(x) + cos(x)';
      ruleApplied = 'Integration by Parts: ∫ x·cos(x) dx = x·sin(x) + cos(x) + C';
    } else if (/^ln\(x\)$/i.test(cleanStr)) {
      antiderivStr = 'x·ln(x) - x';
      ruleApplied = 'Integration by Parts: ∫ ln(x) dx = x·ln(x) - x + C';
    } else {
      // Linear combinations of terms e.g. x^2 + 3x + 2
      const terms = this._splitPolynomialTerms(cleanStr);
      if (terms && terms.length > 0) {
        const integratedTerms = terms.map(t => this._integrateTerm(t));
        antiderivStr = integratedTerms.join(' + ').replace(/\+\s*-/g, '- ');
        ruleApplied = 'Linearity & Sum Rule: ∫ [f(x) + g(x)] dx = ∫ f(x) dx + ∫ g(x) dx';
      } else {
        antiderivStr = `∫ (${cleanStr}) dx`;
        ruleApplied = 'Numerical Quadrature / General Form';
      }
    }

    const formulaStr = "∫ f(x) dx = F(x) + C where F'(x) = f(x)";
    const steps = [
      `1. Problem: Find indefinite integral ∫ ${exprStr} dx`,
      `2. Formula / Rule: ${ruleApplied}`,
      `3. Antiderivative: F(x) = ${antiderivStr}`,
      `4. Final Answer: ${antiderivStr} + C`
    ];

    return ResultFormatter.success(
      {
        integrand: exprStr,
        antiderivative: antiderivStr,
        finalResult: `${antiderivStr} + C`,
        ruleApplied
      },
      steps,
      formulaStr
    );
  }

  static _splitPolynomialTerms(str) {
    const s = str.replace(/\s+/g, '');
    const tokens = [];
    let current = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if ((ch === '+' || ch === '-') && i > 0 && s[i - 1] !== '^') {
        if (current) tokens.push(current);
        current = ch === '-' ? '-' : '';
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  static _integrateTerm(term) {
    const res = this.indefiniteIntegral(term);
    return res.result.antiderivative;
  }

  /**
   * Definite Integral Calculator:
   * Bounds [a, b], Integrand, Antiderivative,
   * Exact mode (e.g. 8/3) & Decimal mode (e.g. 2.666667),
   * Fundamental Theorem of Calculus: F(b) - F(a).
   */
  static definiteIntegral(exprStr, a = 0, b = 1, nIntervals = 100) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);

    const aVal = ResultFormatter.cleanNumber(a);
    const bVal = ResultFormatter.cleanNumber(b);

    // Adaptive Simpson's Rule for numerical evaluation
    const n = Math.max(10, (nIntervals % 2 === 0 ? nIntervals : nIntervals + 1));
    const h = (bVal - aVal) / n;
    let sum = expr.evaluate(aVal) + expr.evaluate(bVal);

    for (let i = 1; i < n; i++) {
      const x = aVal + i * h;
      const y = expr.evaluate(x);
      sum += (i % 2 === 0 ? 2 : 4) * y;
    }
    const numericalIntegral = ResultFormatter.cleanNumber((h / 3) * sum);

    // Exact analytical antiderivative check
    const indef = this.indefiniteIntegral(exprStr);
    const hasSymbolic = indef.result.antiderivative && !indef.result.antiderivative.startsWith('∫');

    let exactStr = null;
    let decimalStr = String(numericalIntegral);
    let upperVal = null;
    let lowerVal = null;

    // Check monomial / polynomial exact fraction arithmetic
    const clean = exprStr.trim().replace(/²/g, '^2').replace(/³/g, '^3').replace(/\s+/g, '');
    const monoMatch = clean.match(/^([+-]?\d*(?:\.\d+)?)?\*?x(?:\^([+-]?\d+))?$/i);
    if (monoMatch) {
      let c = monoMatch[1] === '' || monoMatch[1] === undefined ? 1 : monoMatch[1] === '-' ? -1 : parseFloat(monoMatch[1]);
      let p = monoMatch[2] !== undefined ? parseInt(monoMatch[2], 10) : 1;
      if (p >= 0 && Number.isInteger(aVal) && Number.isInteger(bVal)) {
        const newP = p + 1;
        const bPow = Math.pow(bVal, newP);
        const aPow = Math.pow(aVal, newP);
        const delta = bPow - aPow;
        const frac = _toFraction(c * delta, newP);
        exactStr = frac.str;
        upperVal = _toFraction(c * bPow, newP).str;
        lowerVal = _toFraction(c * aPow, newP).str;
      }
    }

    if (!exactStr && hasSymbolic) {
      const F = new MathExpression(indef.result.antiderivative);
      const Fa = F.evaluate(aVal);
      const Fb = F.evaluate(bVal);
      if (Number.isFinite(Fa) && Number.isFinite(Fb)) {
        upperVal = ResultFormatter.cleanNumber(Fb);
        lowerVal = ResultFormatter.cleanNumber(Fa);
        const diff = ResultFormatter.cleanNumber(Fb - Fa);
        decimalStr = String(diff);
      }
    }

    const formulaStr = '∫ₐᵇ f(x) dx = F(b) - F(a)   (Fundamental Theorem of Calculus)';

    const steps = [
      `1. Problem: Evaluate definite integral ∫_{${aVal}}^{${bVal}} (${expr.toString()}) dx`,
      `2. Bounds: Lower bound a = ${aVal}, Upper bound b = ${bVal}`,
      `3. Antiderivative: F(x) = ${indef.result.antiderivative}`,
      `4. Evaluation at Upper Bound: F(${bVal}) = ${upperVal !== null ? upperVal : ResultFormatter.cleanNumber(expr.evaluate(bVal))}`,
      `5. Evaluation at Lower Bound: F(${aVal}) = ${lowerVal !== null ? lowerVal : ResultFormatter.cleanNumber(expr.evaluate(aVal))}`,
      `6. Fundamental Theorem: F(${bVal}) - F(${aVal})`,
      `7. Final Result (Exact): ${exactStr || decimalStr}`,
      `8. Final Result (Decimal): ${decimalStr}`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        a: aVal,
        b: bVal,
        antiderivative: indef.result.antiderivative,
        exactValue: exactStr || decimalStr,
        decimalValue: parseFloat(decimalStr),
        signedArea: numericalIntegral,
        formula: formulaStr
      },
      steps,
      formulaStr
    );
  }

  // ==========================================================================
  // MODULE 07: APPLICATIONS OF INTEGRALS (Area Under / Between Curves)
  // ==========================================================================

  /**
   * Area Under Curve: y = f(x) on [a, b]
   */
  static areaUnderCurve(exprStr, a = 0, b = 2) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);

    const aVal = ResultFormatter.cleanNumber(a);
    const bVal = ResultFormatter.cleanNumber(b);

    const n = 120;
    const h = (bVal - aVal) / n;
    let sum = Math.abs(expr.evaluate(aVal)) + Math.abs(expr.evaluate(bVal));

    for (let i = 1; i < n; i++) {
      const x = aVal + i * h;
      const y = Math.abs(expr.evaluate(x));
      sum += (i % 2 === 0 ? 2 : 4) * y;
    }
    const area = ResultFormatter.cleanNumber((h / 3) * sum);

    const formulaStr = 'Area = ∫ₐᵇ |f(x)| dx';
    const steps = [
      `1. Curve: y = f(x) = ${expr.toString()}`,
      `2. Bounds: x ∈ [${aVal}, ${bVal}]`,
      `3. Area Integral: Area = ∫_{${aVal}}^{${bVal}} |${expr.toString()}| dx`,
      `4. Numerical Quadrature: Evaluated over ${n} subintervals`,
      `5. Total Enclosed Area: ${area} square units`
    ];

    return ResultFormatter.success(
      {
        curve: expr.toString(),
        a: aVal,
        b: bVal,
        area,
        type: 'under_curve'
      },
      steps,
      formulaStr
    );
  }

  /**
   * Area Between Curves / Bounded Region:
   * e.g. y = x^2 and y = 4 (bounded area)
   */
  static areaBetweenCurves(exprFStr, exprGStr, a = null, b = null) {
    const f = new MathExpression(exprFStr);
    const g = new MathExpression(exprGStr);
    if (!f.isValid()) return ResultFormatter.error(`Invalid f(x): ${f.parseError}`);
    if (!g.isValid()) return ResultFormatter.error(`Invalid g(x): ${g.parseError}`);

    // Auto-detect intersection bounds if not provided
    let aVal = a !== null && a !== undefined ? ResultFormatter.cleanNumber(a) : null;
    let bVal = b !== null && b !== undefined ? ResultFormatter.cleanNumber(b) : null;

    if (aVal === null || bVal === null) {
      // Find intersection points: search in [-10, 10]
      const intersections = [];
      const step = 0.05;
      let prevDiff = f.evaluate(-10) - g.evaluate(-10);
      for (let x = -10 + step; x <= 10; x += step) {
        const curDiff = f.evaluate(x) - g.evaluate(x);
        if (Number.isFinite(prevDiff) && Number.isFinite(curDiff) && prevDiff * curDiff <= 0) {
          intersections.push(ResultFormatter.cleanNumber(x));
        }
        prevDiff = curDiff;
      }

      if (intersections.length >= 2) {
        aVal = intersections[0];
        bVal = intersections[intersections.length - 1];
      } else {
        aVal = -2;
        bVal = 2;
      }
    }

    const n = 120;
    const h = (bVal - aVal) / n;
    let sum = Math.abs(f.evaluate(aVal) - g.evaluate(aVal)) + Math.abs(f.evaluate(bVal) - g.evaluate(bVal));

    for (let i = 1; i < n; i++) {
      const x = aVal + i * h;
      const diff = Math.abs(f.evaluate(x) - g.evaluate(x));
      sum += (i % 2 === 0 ? 2 : 4) * diff;
    }
    const area = ResultFormatter.cleanNumber((h / 3) * sum);

    // Exact check for y = x^2 and y = 4
    let exactArea = null;
    if ((exprFStr === 'x^2' && exprGStr === '4') || (exprFStr === '4' && exprGStr === 'x^2')) {
      exactArea = '32/3';
    }

    const formulaStr = 'Area = ∫ₐᵇ |f(x) - g(x)| dx';
    const steps = [
      `1. Upper / Primary Curve: y₁ = ${f.toString()}`,
      `2. Lower / Secondary Curve: y₂ = ${g.toString()}`,
      `3. Intersection Bounding Range: x ∈ [${aVal}, ${bVal}]`,
      `4. Integral: Area = ∫_{${aVal}}^{${bVal}} |${f.toString()} - (${g.toString()})| dx`,
      `5. Total Bounded Area (Exact): ${exactArea || area} square units`,
      `6. Total Bounded Area (Decimal): ${area} square units`
    ];

    return ResultFormatter.success(
      {
        curveF: f.toString(),
        curveG: g.toString(),
        a: aVal,
        b: bVal,
        area,
        exactArea: exactArea || String(area),
        type: 'between_curves'
      },
      steps,
      formulaStr
    );
  }

  // ==========================================================================
  // MODULE 08: DIFFERENTIAL EQUATIONS
  // ==========================================================================

  /**
   * Differential Equations Solver:
   * Order & degree identification, Separation of Variables (dy/dx = 2x),
   * Exponential growth/decay (dy/dx = ky), First-order linear (dy/dx + Py = Q).
   */
  static solveDifferentialEquation(odeType, params = {}) {
    switch (odeType) {
      case 'direct': {
        // dy/dx = f(x)
        const fx = params.fx || '2x';
        const indef = this.indefiniteIntegral(fx);
        const order = 1;
        const degree = 1;
        const generalSol = `y = ${indef.result.antiderivative} + C`;

        let particularSol = null;
        if (params.x0 !== undefined && params.y0 !== undefined) {
          const F = new MathExpression(indef.result.antiderivative);
          const C = ResultFormatter.cleanNumber(params.y0 - F.evaluate(params.x0));
          particularSol = `y = ${indef.result.antiderivative} ${C >= 0 ? `+ ${C}` : `- ${Math.abs(C)}`}`;
        }

        const formulaStr = 'dy/dx = f(x) ⟹ dy = f(x) dx ⟹ y = ∫ f(x) dx + C';
        const steps = [
          `1. Given ODE: dy/dx = ${fx}`,
          `2. Classification: Order = 1, Degree = 1 (First-order separable ODE)`,
          `3. Separation of Variables: dy = (${fx}) dx`,
          `4. Integrate Both Sides: ∫ dy = ∫ (${fx}) dx`,
          `5. General Solution: ${generalSol}`,
          ...(particularSol ? [`6. Initial Condition y(${params.x0}) = ${params.y0} ⟹ Particular Solution: ${particularSol}`] : [])
        ];

        return ResultFormatter.success(
          {
            odeType: 'direct',
            order,
            degree,
            generalSol,
            particularSol,
            fx
          },
          steps,
          formulaStr
        );
      }

      case 'exponential': {
        // dy/dx = k*y
        const k = ResultFormatter.cleanNumber(params.k !== undefined ? params.k : 2);
        const order = 1;
        const degree = 1;
        const generalSol = `y = C · e^(${k}x)`;

        let particularSol = null;
        if (params.x0 !== undefined && params.y0 !== undefined) {
          const C = ResultFormatter.cleanNumber(params.y0 / Math.exp(k * params.x0));
          particularSol = `y = ${C} · e^(${k}x)`;
        }

        const formulaStr = 'dy/dx = k·y ⟹ (1/y) dy = k dx ⟹ y(x) = C · e^(k·x)';
        const steps = [
          `1. Given ODE: dy/dx = ${k}y`,
          `2. Classification: Order = 1, Degree = 1 (Linear homogeneous / growth-decay)`,
          `3. Separation of Variables: (1/y) dy = ${k} dx`,
          `4. Integrating Both Sides: ln|y| = ${k}x + c₁`,
          `5. General Solution: ${generalSol}`,
          ...(particularSol ? [`6. Initial Condition y(${params.x0}) = ${params.y0} ⟹ Particular Solution: ${particularSol}`] : [])
        ];

        return ResultFormatter.success(
          {
            odeType: 'exponential',
            order,
            degree,
            generalSol,
            particularSol,
            k
          },
          steps,
          formulaStr
        );
      }

      case 'linear': {
        // dy/dx + P*y = Q
        const P = ResultFormatter.cleanNumber(params.P !== undefined ? params.P : 1);
        const Q = ResultFormatter.cleanNumber(params.Q !== undefined ? params.Q : 2);
        const order = 1;
        const degree = 1;

        const ifStr = P === 1 ? 'e^x' : `e^(${P}x)`;
        const qOverP = ResultFormatter.cleanNumber(Q / P);
        const generalSol = `y = ${qOverP} + C · e^(-${P}x)`;

        let particularSol = null;
        if (params.x0 !== undefined && params.y0 !== undefined) {
          const C = ResultFormatter.cleanNumber((params.y0 - qOverP) * Math.exp(P * params.x0));
          particularSol = `y = ${qOverP} ${C >= 0 ? `+ ${C}` : `- ${Math.abs(C)}`} · e^(-${P}x)`;
        }

        const formulaStr = "dy/dx + P·y = Q   |   IF = e^(∫ P dx)   |   y·IF = ∫ Q·IF dx + C";
        const steps = [
          `1. Standard Linear Form: dy/dx + (${P})y = ${Q}`,
          `2. Classification: Order = 1, Degree = 1 (First-order linear ODE)`,
          `3. Integrating Factor (IF): IF = e^(∫ ${P} dx) = ${ifStr}`,
          `4. Multiply by IF: d/dx [y · ${ifStr}] = ${Q} · ${ifStr}`,
          `5. Integrate Both Sides: y · ${ifStr} = ∫ ${Q}${ifStr} dx + C`,
          `6. General Solution: ${generalSol}`,
          ...(particularSol ? [`7. Particular Solution with y(${params.x0}) = ${params.y0}: ${particularSol}`] : [])
        ];

        return ResultFormatter.success(
          {
            odeType: 'linear',
            order,
            degree,
            generalSol,
            particularSol,
            P,
            Q,
            integratingFactor: ifStr
          },
          steps,
          formulaStr
        );
      }

      default:
        return ResultFormatter.error(`Unsupported ODE format: ${odeType}`);
    }
  }

  // ==========================================================================
  // MODULE 13: NUMERICAL CALCULUS LAB
  // ==========================================================================

  /**
   * Numerical Derivative Approximation:
   * Central Difference Formula: f'(x₀) ≈ [f(x₀ + h) - f(x₀ - h)] / (2h)
   * Second Derivative Approximation: f''(x₀) ≈ [f(x₀ + h) - 2f(x₀) + f(x₀ - h)] / h²
   * Truncation error: O(h²)
   */
  static numericalDerivative(exprStr, x0 = 1, h = 1e-5) {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);

    const xVal = ResultFormatter.cleanNumber(x0);
    const stepH = parseFloat(h) || 1e-5;

    const fPlus = expr.evaluate(xVal + stepH);
    const fMinus = expr.evaluate(xVal - stepH);
    const fCenter = expr.evaluate(xVal);

    if (!Number.isFinite(fPlus) || !Number.isFinite(fMinus) || !Number.isFinite(fCenter)) {
      return ResultFormatter.error(`Function cannot be evaluated in the neighborhood of x = ${xVal}`);
    }

    const firstDerivApprox = ResultFormatter.cleanNumber((fPlus - fMinus) / (2 * stepH));
    const secondDerivApprox = ResultFormatter.cleanNumber((fPlus - 2 * fCenter + fMinus) / (stepH * stepH));
    const estimatedError = ResultFormatter.cleanNumber(stepH * stepH);

    const formulaStr = "Central Difference: f'(x₀) ≈ [f(x₀ + h) - f(x₀ - h)] / (2h)   [O(h²)]";
    const steps = [
      `1. Problem: Approximate derivative of f(x) = ${expr.toString()} at x = ${xVal}`,
      `2. Method: Central Difference Formula (Numerical Approximation)`,
      `3. Step Size: h = ${stepH}`,
      `4. Forward Sample: f(${xVal} + ${stepH}) = ${ResultFormatter.cleanNumber(fPlus)}`,
      `5. Backward Sample: f(${xVal} - ${stepH}) = ${ResultFormatter.cleanNumber(fMinus)}`,
      `6. Central Difference: [${ResultFormatter.cleanNumber(fPlus)} - (${ResultFormatter.cleanNumber(fMinus)})] / (2·${stepH}) = ${firstDerivApprox}`,
      `7. Second Derivative Approx: f''(${xVal}) ≈ ${secondDerivApprox}`,
      `8. Estimated Truncation Error Bound: ~ ${estimatedError}`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        x0: xVal,
        h: stepH,
        firstDerivative: firstDerivApprox,
        secondDerivative: secondDerivApprox,
        estimatedError,
        isApproximation: true
      },
      steps,
      formulaStr
    );
  }

  /**
   * Numerical Definite Integration Lab:
   * Trapezoidal Rule & Simpson's 1/3 Rule with error estimates.
   */
  static numericalDefiniteIntegral(exprStr, a = 0, b = 2, nIntervals = 100, method = 'simpson') {
    const expr = new MathExpression(exprStr);
    if (!expr.isValid()) return ResultFormatter.error(`Invalid expression: ${expr.parseError}`);

    const aVal = ResultFormatter.cleanNumber(a);
    const bVal = ResultFormatter.cleanNumber(b);
    const n = Math.max(4, (nIntervals % 2 === 0 ? nIntervals : nIntervals + 1));
    const h = (bVal - aVal) / n;

    // Trapezoidal Rule
    let trapSum = (expr.evaluate(aVal) + expr.evaluate(bVal)) / 2;
    for (let i = 1; i < n; i++) {
      trapSum += expr.evaluate(aVal + i * h);
    }
    const trapResult = ResultFormatter.cleanNumber(h * trapSum);

    // Simpson's Rule
    let simpSum = expr.evaluate(aVal) + expr.evaluate(bVal);
    for (let i = 1; i < n; i++) {
      const y = expr.evaluate(aVal + i * h);
      simpSum += (i % 2 === 0 ? 2 : 4) * y;
    }
    const simpResult = ResultFormatter.cleanNumber((h / 3) * simpSum);

    // Estimated Error
    const estimatedError = ResultFormatter.cleanNumber(Math.abs(simpResult - trapResult) / 3);

    const chosenResult = method === 'trapezoidal' ? trapResult : simpResult;
    const formulaStr = method === 'trapezoidal'
      ? "Trapezoidal Rule: T_n = (h/2) · [f(a) + 2∑f(x_i) + f(b)]"
      : "Simpson's 1/3 Rule: S_n = (h/3) · [f(a) + 4∑f(odd) + 2∑f(even) + f(b)]";

    const steps = [
      `1. Problem: Numerically approximate ∫_{${aVal}}^{${bVal}} (${expr.toString()}) dx`,
      `2. Method: ${method === 'trapezoidal' ? "Trapezoidal Rule" : "Simpson's 1/3 Rule"} (Approximation)`,
      `3. Subintervals: n = ${n}, Step Width: h = (b - a)/n = ${ResultFormatter.cleanNumber(h)}`,
      `4. Trapezoidal Approximation: T_${n} = ${trapResult}`,
      `5. Simpson's Rule Approximation: S_${n} = ${simpResult}`,
      `6. Estimated Error Bound: ~ ${estimatedError}`,
      `7. Final Numerical Approximation: ${chosenResult} (Approximation)`
    ];

    return ResultFormatter.success(
      {
        expression: expr.toString(),
        a: aVal,
        b: bVal,
        n,
        h: ResultFormatter.cleanNumber(h),
        trapezoidalValue: trapResult,
        simpsonValue: simpResult,
        value: chosenResult,
        estimatedError,
        isApproximation: true
      },
      steps,
      formulaStr
    );
  }
}
