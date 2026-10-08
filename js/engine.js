/**
 * OG - Mathematical Calculation Engine
 * Pure Recursive-Descent Expression Parser & Evaluator (No eval() or Function())
 * ES6 Module
 */

export class CalculationEngine {
  constructor(options = {}) {
    this.angleMode = options.angleMode || 'DEG'; // 'DEG' | 'RAD'
    this.precision = options.precision !== undefined ? options.precision : 6;
  }

  setAngleMode(mode) {
    this.angleMode = mode === 'RAD' ? 'RAD' : 'DEG';
  }

  setPrecision(precision) {
    this.precision = Math.max(0, Math.min(14, precision));
  }

  /**
   * Tokenizes mathematical expression string into structured tokens
   */
  tokenize(rawExpr) {
    if (!rawExpr || typeof rawExpr !== 'string') return [];

    // Normalize symbols
    let expr = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/sin⁻¹/g, 'asin')
      .replace(/cos⁻¹/g, 'acos')
      .replace(/tan⁻¹/g, 'atan')
      .replace(/√/g, 'sqrt')
      .replace(/∛/g, 'cbrt')
      .replace(/π/g, 'PI');

    const tokens = [];
    let i = 0;
    const len = expr.length;

    while (i < len) {
      const char = expr[i];

      // Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Numbers (integers or floating point)
      if (/[0-9.]/.test(char)) {
        let numStr = '';
        let dotCount = 0;
        while (i < len && /[0-9.]/.test(expr[i])) {
          if (expr[i] === '.') {
            dotCount++;
            if (dotCount > 1) throw new Error('Malformed decimal number');
          }
          numStr += expr[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        continue;
      }

      // Identifiers: functions, constants
      if (/[a-zA-Z_]/.test(char)) {
        let ident = '';
        while (i < len && /[a-zA-Z0-9_]/.test(expr[i])) {
          ident += expr[i];
          i++;
        }

        const lower = ident.toLowerCase();
        if (lower === 'pi') {
          tokens.push({ type: 'NUMBER', value: Math.PI });
        } else if (lower === 'e' && (i >= len || !/[a-zA-Z]/.test(expr[i]))) {
          tokens.push({ type: 'NUMBER', value: Math.E });
        } else {
          tokens.push({ type: 'FUNCTION', value: lower });
        }
        continue;
      }

      // Operators and punctuation
      if ('+-*/%^!()'.includes(char)) {
        tokens.push({ type: 'OPERATOR', value: char });
        i++;
        continue;
      }

      // Unknown character
      throw new Error(`Invalid mathematical character: '${char}'`);
    }

    return tokens;
  }

  /**
   * Evaluates an expression using recursive-descent parsing
   */
  evaluate(rawExpr) {
    if (!rawExpr || rawExpr.trim() === '') {
      return { success: true, value: 0, formatted: '0' };
    }

    try {
      const tokens = this.tokenize(rawExpr);
      if (tokens.length === 0) {
        return { success: true, value: 0, formatted: '0' };
      }

      let pos = 0;

      const peek = () => tokens[pos];
      const consume = () => tokens[pos++];
      const match = (val) => {
        if (tokens[pos] && tokens[pos].value === val) {
          pos++;
          return true;
        }
        return false;
      };

      // Grammar hierarchy:
      // Expression := Additive
      // Additive   := Multiplicative ( ('+' | '-') Multiplicative )*
      // Multiplicative := Power ( ('*' | '/' | '%') Power )*
      // Power      := Postfix ( '^' Power )?   (right-associative)
      // Postfix    := Primary ('!')*
      // Primary    := FunctionCall | '(' Expression ')' | NUMBER | Unary

      const parseExpression = () => parseAdditive();

      const parseAdditive = () => {
        let left = parseMultiplicative();
        while (peek() && (peek().value === '+' || peek().value === '-')) {
          const op = consume().value;
          const right = parseMultiplicative();
          left = op === '+' ? left + right : left - right;
        }
        return left;
      };

      const parseMultiplicative = () => {
        let left = parsePower();
        while (peek() && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
          const op = consume().value;
          const right = parsePower();
          if (op === '*') {
            left = left * right;
          } else if (op === '/') {
            if (right === 0) throw new Error('Division by zero');
            left = left / right;
          } else if (op === '%') {
            if (right === 0) throw new Error('Modulo by zero');
            left = left % right;
          }
        }
        return left;
      };

      const parsePower = () => {
        let base = parsePostfix();
        if (peek() && peek().value === '^') {
          consume(); // consume '^'
          const exponent = parsePower(); // right-associative
          base = Math.pow(base, exponent);
        }
        return base;
      };

      const parsePostfix = () => {
        let val = parsePrimary();
        while (peek() && peek().value === '!') {
          consume();
          val = this.calcFactorial(val);
        }
        return val;
      };

      const parsePrimary = () => {
        const token = peek();
        if (!token) throw new Error('Unexpected end of expression');

        // Unary minus or plus
        if (token.value === '-') {
          consume();
          return -parsePrimary();
        }
        if (token.value === '+') {
          consume();
          return parsePrimary();
        }

        // Parentheses
        if (token.value === '(') {
          consume();
          const val = parseExpression();
          if (!match(')')) throw new Error('Missing closing parenthesis');
          return val;
        }

        // Number literal
        if (token.type === 'NUMBER') {
          consume();
          return token.value;
        }

        // Function call
        if (token.type === 'FUNCTION') {
          const fnName = consume().value;
          if (!match('(')) {
            // Implicit argument if immediately followed by number or constant
            if (peek() && peek().type === 'NUMBER') {
              const arg = consume().value;
              return this.executeFunction(fnName, arg);
            }
            throw new Error(`Expected '(' after function '${fnName}'`);
          }
          const arg = parseExpression();
          if (!match(')')) throw new Error(`Missing closing parenthesis for '${fnName}'`);
          return this.executeFunction(fnName, arg);
        }

        throw new Error(`Unexpected token: '${token.value}'`);
      };

      const result = parseExpression();

      if (pos < tokens.length) {
        throw new Error(`Unexpected token at position ${pos}: '${tokens[pos].value}'`);
      }

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Mathematical domain error (undefined result)');
      }

      // Clean up floating point representation
      const cleanVal = this.sanitizeFloat(result);
      const formatted = this.formatResult(cleanVal);

      return {
        success: true,
        value: cleanVal,
        formatted
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Syntax Error',
        value: null,
        formatted: 'Error'
      };
    }
  }

  /**
   * Executes specific scientific mathematical functions
   */
  executeFunction(fn, arg) {
    const isDeg = this.angleMode === 'DEG';
    const degToRad = (d) => (d * Math.PI) / 180;
    const radToDeg = (r) => (r * 180) / Math.PI;

    switch (fn) {
      // Trigonometric Functions
      case 'sin': {
        const rad = isDeg ? degToRad(arg) : arg;
        // Check for exact multiples of 180° in DEG
        if (isDeg && arg % 180 === 0) return 0;
        // Check for 30° -> 0.5
        if (isDeg && arg % 360 === 30) return 0.5;
        if (isDeg && arg % 360 === 150) return 0.5;
        return Math.sin(rad);
      }
      case 'cos': {
        const rad = isDeg ? degToRad(arg) : arg;
        if (isDeg && (arg - 90) % 180 === 0) return 0;
        if (isDeg && (arg % 360 === 60 || arg % 360 === 300)) return 0.5;
        return Math.cos(rad);
      }
      case 'tan': {
        if (isDeg && (arg - 90) % 180 === 0) {
          throw new Error('tan is undefined at 90° + k·180°');
        }
        const rad = isDeg ? degToRad(arg) : arg;
        return Math.tan(rad);
      }
      case 'cot': {
        if (isDeg && arg % 180 === 0) {
          throw new Error('cot is undefined at k·180°');
        }
        const rad = isDeg ? degToRad(arg) : arg;
        const tanVal = Math.tan(rad);
        if (tanVal === 0) throw new Error('cot is undefined');
        return 1 / tanVal;
      }
      case 'sec': {
        if (isDeg && (arg - 90) % 180 === 0) {
          throw new Error('sec is undefined at 90° + k·180°');
        }
        const rad = isDeg ? degToRad(arg) : arg;
        const cosVal = Math.cos(rad);
        if (cosVal === 0) throw new Error('sec is undefined');
        return 1 / cosVal;
      }
      case 'csc': {
        if (isDeg && arg % 180 === 0) {
          throw new Error('csc is undefined at k·180°');
        }
        const rad = isDeg ? degToRad(arg) : arg;
        const sinVal = Math.sin(rad);
        if (sinVal === 0) throw new Error('csc is undefined');
        return 1 / sinVal;
      }

      // Inverse Trigonometric Functions
      case 'asin': {
        if (arg < -1 || arg > 1) throw new Error('asin domain is [-1, 1]');
        const resRad = Math.asin(arg);
        return isDeg ? radToDeg(resRad) : resRad;
      }
      case 'acos': {
        if (arg < -1 || arg > 1) throw new Error('acos domain is [-1, 1]');
        const resRad = Math.acos(arg);
        return isDeg ? radToDeg(resRad) : resRad;
      }
      case 'atan': {
        const resRad = Math.atan(arg);
        return isDeg ? radToDeg(resRad) : resRad;
      }

      // Logarithms
      case 'log': {
        if (arg <= 0) throw new Error('log requires positive argument');
        return Math.log10(arg);
      }
      case 'ln': {
        if (arg <= 0) throw new Error('ln requires positive argument');
        return Math.log(arg);
      }

      // Roots & Powers
      case 'sqrt': {
        if (arg < 0) throw new Error('sqrt of negative number requires complex domain');
        return Math.sqrt(arg);
      }
      case 'cbrt': {
        return Math.cbrt(arg);
      }
      case 'sqr': {
        return arg * arg;
      }
      case 'cube': {
        return arg * arg * arg;
      }
      case 'exp': {
        return Math.exp(arg);
      }
      case 'tenpow': {
        return Math.pow(10, arg);
      }

      // Absolute value
      case 'abs': {
        return Math.abs(arg);
      }

      // Factorial as function call fact(n)
      case 'fact':
      case 'factorial': {
        return this.calcFactorial(arg);
      }

      default:
        throw new Error(`Unknown function: '${fn}'`);
    }
  }

  /**
   * Computes factorial for integers
   */
  calcFactorial(n) {
    if (n < 0) throw new Error('Factorial of negative number is undefined');
    if (!Number.isInteger(n)) throw new Error('Factorial currently supports non-negative integers');
    if (n > 170) throw new Error('Factorial overflow (> 170!)');

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Sanitizes binary floating point arithmetic artifacts
   */
  sanitizeFloat(val) {
    if (Math.abs(val) < 1e-15) return 0;
    // Fix things like 0.30000000000000004 -> 0.3
    const factor = Math.pow(10, 14);
    return Math.round(val * factor) / factor;
  }

  /**
   * Formats numbers to desired precision
   */
  formatResult(num) {
    if (num === 0) return '0';
    if (!isFinite(num)) return 'Error';

    // Exponential notation for extreme numbers
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-7 && Math.abs(num) > 0)) {
      return num.toExponential(this.precision);
    }

    // Fixed precision format
    const str = Number(num.toFixed(this.precision)).toString();
    return str;
  }
}

export const mathEngine = new CalculationEngine();
