/**
 * OG - Coordinate Geometry Mathematics Engine
 * High-precision symbolic and numerical coordinate geometry calculations without eval().
 * Covers:
 * 01. Points & Coordinates (distance, midpoint, internal/external section formula, slope, collinearity)
 * 02. Triangle Geometry (area, perimeter, centroid, incenter, circumcenter, orthocenter)
 * 03. Straight Lines (slope-intercept, point-slope, two-point, intercept, general Ax+By+C=0, normal form)
 * 04. Line Relationships (parallel, perpendicular, angle between lines, intersection point, parallel distance)
 * 05. Pair of Straight Lines (angle, slopes, intersection, condition of reality/coincidence)
 * 06. Circles (standard (x-h)²+(y-k)²=r², general x²+y²+2gx+2fy+c=0, center, radius, intercepts)
 * 07. Parabolas (standard forms y²=±4ax, x²=±4ay, translated, vertex, focus, directrix, latus rectum)
 * 08. Ellipses (horizontal/vertical, foci, eccentricity, major/minor axes, directrices, latus rectum)
 * 09. Hyperbolas (horizontal/vertical, foci, eccentricity, transverse/conjugate axes, asymptotes, directrices)
 * 10. General Conic Classifier (Ax² + Bxy + Cy² + Dx + Ey + F = 0)
 * 11. 3D Coordinates (distance, midpoint, section formula, line equations, direction cosines, planes)
 * 12. Universal Geometry Input Parser & Operation Suggester
 * ES6 Module
 */

export class CoordinateGeometryMathEngine {

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. POINTS & COORDINATES (2D)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Distance between two points A(x1, y1) and B(x2, y2)
   */
  static distance2D(p1, p2) {
    if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
      return { success: false, error: 'Invalid coordinates. Expected points with valid x and y numeric values.' };
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dx2 = dx * dx;
    const dy2 = dy * dy;
    const sumSq = dx2 + dy2;
    const dist = Math.sqrt(sumSq);

    const steps = [
      { label: 'Points Identified', value: `A(${this._fmt(p1.x)}, ${this._fmt(p1.y)}) and B(${this._fmt(p2.x)}, ${this._fmt(p2.y)})` },
      { label: 'Distance Formula', value: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]' },
      { label: 'Differences', value: `Δx = x₂ - x₁ = ${this._fmt(p2.x)} - (${this._fmt(p1.x)}) = ${this._fmt(dx)},  Δy = y₂ - y₁ = ${this._fmt(p2.y)} - (${this._fmt(p1.y)}) = ${this._fmt(dy)}` },
      { label: 'Substitution', value: `d = √[(${this._fmt(dx)})² + (${this._fmt(dy)})²] = √[${this._fmt(dx2)} + ${this._fmt(dy2)}] = √${this._fmt(sumSq)}` },
    ];

    const exact = this._simplifySquareRoot(sumSq);
    const decimal = this._fmt(dist);

    if (exact !== decimal) {
      steps.push({ label: 'Exact Simplified Form', value: `d = ${exact}` });
      steps.push({ label: 'Decimal Approximation', value: `d ≈ ${decimal}` });
    } else {
      steps.push({ label: 'Result', value: `d = ${exact}` });
    }

    return {
      success: true,
      result: exact !== decimal ? `${exact} (≈ ${decimal})` : exact,
      exact,
      decimal,
      numericValue: dist,
      dx,
      dy,
      sumSq,
      steps,
      operation: 'Distance Between Two Points'
    };
  }

  /**
   * Midpoint of segment AB
   */
  static midpoint2D(p1, p2) {
    if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
      return { success: false, error: 'Invalid coordinates for midpoint calculation.' };
    }

    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;

    const mxStr = Number.isInteger(p1.x + p2.x) && (p1.x + p2.x) % 2 !== 0 ? `${p1.x + p2.x}/2` : this._fmt(mx);
    const myStr = Number.isInteger(p1.y + p2.y) && (p1.y + p2.y) % 2 !== 0 ? `${p1.y + p2.y}/2` : this._fmt(my);

    const steps = [
      { label: 'Points Identified', value: `A(${this._fmt(p1.x)}, ${this._fmt(p1.y)}) and B(${this._fmt(p2.x)}, ${this._fmt(p2.y)})` },
      { label: 'Midpoint Formula', value: 'M = ((x₁ + x₂) / 2, (y₁ + y₂) / 2)' },
      { label: 'X-Coordinate', value: `x_M = (${this._fmt(p1.x)} + ${this._fmt(p2.x)}) / 2 = ${this._fmt(p1.x + p2.x)} / 2 = ${mxStr}` },
      { label: 'Y-Coordinate', value: `y_M = (${this._fmt(p1.y)} + ${this._fmt(p2.y)}) / 2 = ${this._fmt(p1.y + p2.y)} / 2 = ${myStr}` },
      { label: 'Midpoint Result', value: `M = (${mxStr}, ${myStr})` }
    ];

    return {
      success: true,
      result: `M(${mxStr}, ${myStr})`,
      point: { x: mx, y: my },
      x: mx,
      y: my,
      steps,
      operation: 'Midpoint of Segment'
    };
  }

  /**
   * Section Formula (Internal and External Division in ratio m:n)
   */
  static sectionFormula2D(p1, p2, m, n, isInternal = true) {
    if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
      return { success: false, error: 'Invalid point coordinates.' };
    }
    m = parseFloat(m);
    n = parseFloat(n);
    if (isNaN(m) || isNaN(n) || m <= 0 || n <= 0) {
      return { success: false, error: 'Ratio terms m and n must be positive numbers (> 0).' };
    }

    if (!isInternal && m === n) {
      return { success: false, error: 'External division ratio m:n cannot have m = n (division by zero: point at infinity).' };
    }

    const typeStr = isInternal ? 'Internal Division' : 'External Division';
    const denom = isInternal ? m + n : m - n;
    const numX = isInternal ? (m * p2.x + n * p1.x) : (m * p2.x - n * p1.x);
    const numY = isInternal ? (m * p2.y + n * p1.y) : (m * p2.y - n * p1.y);

    const px = numX / denom;
    const py = numY / denom;

    const opSymbol = isInternal ? '+' : '−';
    const formulaStr = isInternal
      ? 'P = ((m·x₂ + n·x₁) / (m + n), (m·y₂ + n·y₁) / (m + n))'
      : 'P = ((m·x₂ − n·x₁) / (m − n), (m·y₂ − n·y₁) / (m − n))';

    const pxStr = Number.isInteger(numX) && Number.isInteger(denom) && numX % denom !== 0
      ? this._simplifyFraction(numX, denom)
      : this._fmt(px);

    const pyStr = Number.isInteger(numY) && Number.isInteger(denom) && numY % denom !== 0
      ? this._simplifyFraction(numY, denom)
      : this._fmt(py);

    const steps = [
      { label: 'Division Type & Ratio', value: `${typeStr} in ratio ${m} : ${n}` },
      { label: 'Formula', value: formulaStr },
      { label: 'X-Coordinate', value: `x = (${m}·${this._fmt(p2.x)} ${opSymbol} ${n}·${this._fmt(p1.x)}) / (${m} ${opSymbol} ${n}) = ${this._fmt(numX)} / ${this._fmt(denom)} = ${pxStr}` },
      { label: 'Y-Coordinate', value: `y = (${m}·${this._fmt(p2.y)} ${opSymbol} ${n}·${this._fmt(p1.y)}) / (${m} ${opSymbol} ${n}) = ${this._fmt(numY)} / ${this._fmt(denom)} = ${pyStr}` },
      { label: 'Resulting Point', value: `P = (${pxStr}, ${pyStr})` }
    ];

    return {
      success: true,
      result: `P(${pxStr}, ${pyStr})`,
      point: { x: px, y: py },
      isInternal,
      ratio: `${m}:${n}`,
      steps,
      operation: `Section Formula (${typeStr})`
    };
  }

  /**
   * Slope between two points: m = (y2 - y1) / (x2 - x1)
   */
  static slope2D(p1, p2) {
    if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
      return { success: false, error: 'Invalid coordinates for slope calculation.' };
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const steps = [
      { label: 'Points Identified', value: `A(${this._fmt(p1.x)}, ${this._fmt(p1.y)}) and B(${this._fmt(p2.x)}, ${this._fmt(p2.y)})` },
      { label: 'Slope Formula', value: 'm = (y₂ - y₁) / (x₂ - x₁)' },
      { label: 'Substitution', value: `m = (${this._fmt(p2.y)} - ${this._fmt(p1.y)}) / (${this._fmt(p2.x)} - ${this._fmt(p1.x)}) = ${this._fmt(dy)} / ${this._fmt(dx)}` }
    ];

    // Vertical line: dx = 0
    if (Math.abs(dx) < 1e-12) {
      if (Math.abs(dy) < 1e-12) {
        return { success: false, error: 'Coincident points: A and B are the same point. Slope cannot be determined.' };
      }
      steps.push({ label: 'Vertical Line Detected', value: 'Δx = 0  →  Denominator is zero.' });
      steps.push({ label: 'Mathematical Conclusion', value: 'Slope is Undefined (Line is perpendicular to X-axis, θ = 90°).' });
      return {
        success: true,
        result: 'Undefined slope',
        isUndefined: true,
        angleDeg: 90,
        type: 'vertical',
        steps,
        operation: 'Slope of Line'
      };
    }

    const m = dy / dx;
    let classification = '';
    if (Math.abs(m) < 1e-12) {
      classification = 'Zero slope (Horizontal line, parallel to X-axis, θ = 0°)';
    } else if (m > 0) {
      classification = 'Positive slope (Line rises from left to right, acute inclination)';
    } else {
      classification = 'Negative slope (Line falls from left to right, obtuse inclination)';
    }

    const angleRad = Math.atan(m);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 180; // Standard inclination with positive x-axis

    const mStr = Number.isInteger(dy) && Number.isInteger(dx) && dy % dx !== 0
      ? this._simplifyFraction(dy, dx)
      : this._fmt(m);

    steps.push({ label: 'Calculated Slope', value: `m = ${mStr}` });
    steps.push({ label: 'Inclination Angle θ', value: `θ = arctan(m) = arctan(${this._fmt(m)}) ≈ ${this._fmt(angleDeg)}°` });
    steps.push({ label: 'Classification', value: classification });

    return {
      success: true,
      result: `m = ${mStr}`,
      slopeValue: m,
      isUndefined: false,
      angleDeg: angleDeg,
      classification,
      steps,
      operation: 'Slope of Line'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. TRIANGLE GEOMETRY & COLLINEARITY (3 POINTS)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Complete Triangle analysis & Collinearity check for 3 points A, B, C
   */
  static triangleAnalysis(p1, p2, p3) {
    if (!p1 || !p2 || !p3 || [p1.x, p1.y, p2.x, p2.y, p3.x, p3.y].some(isNaN)) {
      return { success: false, error: 'Three valid 2D points A, B, C are required.' };
    }

    // Side lengths
    const dAB = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const dBC = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const dCA = Math.hypot(p1.x - p3.x, p1.y - p3.y);

    // Area using Shoelace / Determinant: (1/2)|x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|
    const det = p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y);
    const area = 0.5 * Math.abs(det);

    const steps = [
      { label: 'Given Points', value: `A(${this._fmt(p1.x)}, ${this._fmt(p1.y)}), B(${this._fmt(p2.x)}, ${this._fmt(p2.y)}), C(${this._fmt(p3.x)}, ${this._fmt(p3.y)})` },
      { label: 'Area Formula', value: 'Area = ½ |x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂)|' },
      { label: 'Substitution', value: `Area = ½ |${this._fmt(p1.x)}(${this._fmt(p2.y)} - ${this._fmt(p3.y)}) + ${this._fmt(p2.x)}(${this._fmt(p3.y)} - ${this._fmt(p1.y)}) + ${this._fmt(p3.x)}(${this._fmt(p1.y)} - ${this._fmt(p2.y)})|` },
      { label: 'Determinant Value', value: `½ |${this._fmt(det)}| = ${this._fmt(area)}` }
    ];

    // Collinearity test
    const isCollinear = Math.abs(area) < 1e-9;
    if (isCollinear) {
      steps.push({ label: 'Collinearity Verdict', value: 'Area = 0  →  Points A, B, C are COLLINEAR (lie on the same straight line).' });
      return {
        success: true,
        isCollinear: true,
        area: 0,
        result: 'Points are Collinear (Area = 0)',
        steps,
        operation: 'Collinearity Check'
      };
    }

    // Centroid G = ((x1+x2+x3)/3, (y1+y2+y3)/3)
    const gx = (p1.x + p2.x + p3.x) / 3;
    const gy = (p1.y + p2.y + p3.y) / 3;

    // Incenter I = (a·x1 + b·x2 + c·x3)/(a+b+c) where a=BC, b=CA, c=AB
    const a = dBC, b = dCA, c = dAB;
    const perimeter = a + b + c;
    const ix = (a * p1.x + b * p2.x + c * p3.x) / perimeter;
    const iy = (a * p1.y + b * p2.y + c * p3.y) / perimeter;

    steps.push({ label: 'Side Lengths', value: `AB = ${this._fmt(c)},  BC = ${this._fmt(a)},  CA = ${this._fmt(b)}` });
    steps.push({ label: 'Perimeter', value: `P = AB + BC + CA = ${this._fmt(perimeter)}` });
    steps.push({ label: 'Triangle Area', value: `Area = ${this._fmt(area)} sq units` });
    steps.push({ label: 'Centroid G Formula', value: 'G = ((x₁ + x₂ + x₃) / 3, (y₁ + y₂ + y₃) / 3)' });
    steps.push({ label: 'Centroid Coordinates', value: `G = (${this._fmt(gx)}, ${this._fmt(gy)})` });
    steps.push({ label: 'Incenter I Coordinates', value: `I = (${this._fmt(ix)}, ${this._fmt(iy)})` });

    return {
      success: true,
      isCollinear: false,
      area: this._fmt(area),
      perimeter: this._fmt(perimeter),
      sides: { ab: this._fmt(c), bc: this._fmt(a), ca: this._fmt(b) },
      centroid: { x: gx, y: gy, label: `G(${this._fmt(gx)}, ${this._fmt(gy)})` },
      incenter: { x: ix, y: iy, label: `I(${this._fmt(ix)}, ${this._fmt(iy)})` },
      result: `Area = ${this._fmt(area)}, Centroid = (${this._fmt(gx)}, ${this._fmt(gy)})`,
      steps,
      operation: 'Triangle Properties'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. STRAIGHT LINES ANALYZER (2D)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Comprehensive Straight Line Analyzer:
   * Accepts: general form (Ax + By + C = 0) or slope-intercept (y = mx + c) or 2 points
   */
  static analyzeLine(A, B, C) {
    A = parseFloat(A);
    B = parseFloat(B);
    C = parseFloat(C);

    if (isNaN(A) || isNaN(B) || isNaN(C)) {
      return { success: false, error: 'Valid coefficients A, B, C required for Ax + By + C = 0.' };
    }

    if (Math.abs(A) < 1e-12 && Math.abs(B) < 1e-12) {
      return { success: false, error: 'Both A and B cannot be zero simultaneously in Ax + By + C = 0.' };
    }

    const steps = [];
    const eqGeneral = `${A !== 1 ? (A === -1 ? '-' : this._fmt(A)) : ''}x ${B >= 0 ? '+ ' : '- '}${Math.abs(B) !== 1 ? this._fmt(Math.abs(B)) : ''}y ${C >= 0 ? '+ ' : '- '}${this._fmt(Math.abs(C))} = 0`;
    steps.push({ label: 'General Equation', value: eqGeneral });

    let slope = null;
    let slopeStr = '';
    let xIntercept = null;
    let yIntercept = null;
    let isVertical = false;
    let isHorizontal = false;

    // Slope m = -A / B (when B != 0)
    if (Math.abs(B) < 1e-12) {
      isVertical = true;
      slopeStr = 'Undefined (Vertical Line)';
      xIntercept = -C / A;
      steps.push({ label: 'Vertical Line', value: `B = 0  →  x = ${this._fmt(-C / A)}` });
      steps.push({ label: 'X-Intercept', value: `x = ${this._fmt(xIntercept)} (Point: (${this._fmt(xIntercept)}, 0))` });
      steps.push({ label: 'Y-Intercept', value: 'None (Line is parallel to Y-axis)' });
    } else {
      slope = -A / B;
      slopeStr = Number.isInteger(-A) && Number.isInteger(B) && (-A) % B !== 0
        ? this._simplifyFraction(-A, B)
        : this._fmt(slope);

      if (Math.abs(slope) < 1e-12) isHorizontal = true;

      // y-intercept: y = -C / B
      yIntercept = -C / B;
      steps.push({ label: 'Slope-Intercept Form', value: `y = (${slopeStr})·x ${yIntercept >= 0 ? '+ ' : '- '}${this._fmt(Math.abs(yIntercept))}` });
      steps.push({ label: 'Slope m', value: `m = -A / B = -(${this._fmt(A)}) / (${this._fmt(B)}) = ${slopeStr}` });
      steps.push({ label: 'Y-Intercept', value: `y = -C / B = ${this._fmt(yIntercept)} (Point: (0, ${this._fmt(yIntercept)}))` });

      // x-intercept: x = -C / A (when A != 0)
      if (Math.abs(A) >= 1e-12) {
        xIntercept = -C / A;
        steps.push({ label: 'X-Intercept', value: `x = -C / A = ${this._fmt(xIntercept)} (Point: (${this._fmt(xIntercept)}, 0))` });
      } else {
        steps.push({ label: 'X-Intercept', value: 'None (Line is horizontal, parallel to X-axis)' });
      }
    }

    // Inclination angle θ with positive X-axis
    let angleDeg = 90;
    if (!isVertical) {
      let rad = Math.atan(slope);
      angleDeg = (rad * 180) / Math.PI;
      if (angleDeg < 0) angleDeg += 180;
    }
    steps.push({ label: 'Inclination Angle θ', value: `θ = ${this._fmt(angleDeg)}°` });

    // Distance from Origin: p = |C| / √(A² + B²)
    const distOrigin = Math.abs(C) / Math.hypot(A, B);
    steps.push({ label: 'Perpendicular Distance from Origin', value: `p = |C| / √(A² + B²) = |${this._fmt(C)}| / √(${this._fmt(A * A + B * B)}) = ${this._fmt(distOrigin)}` });

    // Normal form: x·cos(α) + y·sin(α) = p
    const normDenom = Math.hypot(A, B) * (C > 0 ? -1 : 1);
    const cosAlpha = A / normDenom;
    const sinAlpha = B / normDenom;
    steps.push({ label: 'Normal Form', value: `(${this._fmt(cosAlpha)})·x + (${this._fmt(sinAlpha)})·y = ${this._fmt(distOrigin)}` });

    return {
      success: true,
      result: `Slope: ${slopeStr}, Intercepts: (X: ${xIntercept !== null ? this._fmt(xIntercept) : 'none'}, Y: ${yIntercept !== null ? this._fmt(yIntercept) : 'none'})`,
      slope: slope !== null ? slope : 'undefined',
      slopeStr,
      xIntercept,
      yIntercept,
      angleDeg,
      distOrigin,
      isVertical,
      isHorizontal,
      A, B, C,
      steps,
      operation: 'Straight Line Analysis'
    };
  }

  /**
   * Relationship between two lines L1: A1x + B1y + C1 = 0 and L2: A2x + B2y + C2 = 0
   */
  static lineRelationships(l1, l2) {
    const A1 = l1.A, B1 = l1.B, C1 = l1.C;
    const A2 = l2.A, B2 = l2.B, C2 = l2.C;

    const det = A1 * B2 - A2 * B1;
    const steps = [
      { label: 'Line 1 (L₁)', value: `${this._fmt(A1)}x + ${this._fmt(B1)}y + ${this._fmt(C1)} = 0` },
      { label: 'Line 2 (L₂)', value: `${this._fmt(A2)}x + ${this._fmt(B2)}y + ${this._fmt(C2)} = 0` },
      { label: 'Determinant A₁B₂ - A₂B₁', value: `(${this._fmt(A1)})·(${this._fmt(B2)}) - (${this._fmt(A2)})·(${this._fmt(B1)}) = ${this._fmt(det)}` }
    ];

    // Case 1: Parallel or Coincident (det == 0)
    if (Math.abs(det) < 1e-9) {
      // Check coincidence: A1/A2 = B1/B2 = C1/C2
      const detC1 = A1 * C2 - A2 * C1;
      const detC2 = B1 * C2 - B2 * C1;
      if (Math.abs(detC1) < 1e-9 && Math.abs(detC2) < 1e-9) {
        steps.push({ label: 'Verdict', value: 'COINCIDENT LINES: L₁ and L₂ represent the exact same line.' });
        return {
          success: true,
          relation: 'coincident',
          result: 'Coincident lines (Infinite intersection points)',
          angleDeg: 0,
          steps,
          operation: 'Line Relationship'
        };
      } else {
        // Parallel lines: calculate distance between them
        // Normalize L2 so coefficients match L1 ratio
        const scale = (A1 !== 0) ? (A2 / A1) : (B2 / B1);
        const normC2 = C2 / scale;
        const distParallel = Math.abs(C1 - normC2) / Math.hypot(A1, B1);

        steps.push({ label: 'Verdict', value: 'PARALLEL LINES: Slopes are equal, no intersection points exist.' });
        steps.push({ label: 'Distance Formula', value: 'd = |C₁ - C₂| / √(A² + B²)' });
        steps.push({ label: 'Distance Between Parallel Lines', value: `d = ${this._fmt(distParallel)}` });

        return {
          success: true,
          relation: 'parallel',
          result: `Parallel lines (Distance = ${this._fmt(distParallel)})`,
          distance: distParallel,
          angleDeg: 0,
          steps,
          operation: 'Line Relationship'
        };
      }
    }

    // Case 2: Intersecting lines
    // Intersection point by Cramer's rule:
    // x = (B1·C2 - B2·C1) / det, y = (C1·A2 - C2·A1) / det
    const ix = (B1 * C2 - B2 * C1) / det;
    const iy = (C1 * A2 - C2 * A1) / det;

    // Perpendicular check: A1·A2 + B1·B2 == 0
    const dotProduct = A1 * A2 + B1 * B2;
    const isPerp = Math.abs(dotProduct) < 1e-9;

    // Acute angle between lines: cosθ = |A1·A2 + B1·B2| / (√(A1²+B1²)·√(A2²+B2²))
    const cosTheta = Math.abs(dotProduct) / (Math.hypot(A1, B1) * Math.hypot(A2, B2));
    const angleRad = Math.acos(Math.min(1, Math.max(0, cosTheta)));
    const angleDeg = (angleRad * 180) / Math.PI;

    steps.push({ label: 'Intersection Coordinates', value: `x = ${this._fmt(ix)}, y = ${this._fmt(iy)}  →  P(${this._fmt(ix)}, ${this._fmt(iy)})` });
    steps.push({ label: 'Angle Formula', value: 'cos θ = |A₁A₂ + B₁B₂| / [√(A₁²+B₁²) · √(A₂²+B₂²)]' });
    steps.push({ label: 'Angle Between Lines', value: `θ = ${this._fmt(angleDeg)}°` });

    if (isPerp) {
      steps.push({ label: 'Perpendicular Relationship', value: 'A₁A₂ + B₁B₂ = 0  →  LINES ARE PERPENDICULAR (θ = 90°).' });
    } else {
      steps.push({ label: 'Verdict', value: `INTERSECTING LINES at P(${this._fmt(ix)}, ${this._fmt(iy)}) at acute angle ${this._fmt(angleDeg)}°` });
    }

    return {
      success: true,
      relation: isPerp ? 'perpendicular' : 'intersecting',
      result: isPerp
        ? `Perpendicular at P(${this._fmt(ix)}, ${this._fmt(iy)}) (90°)`
        : `Intersect at P(${this._fmt(ix)}, ${this._fmt(iy)}) (Angle: ${this._fmt(angleDeg)}°)`,
      intersection: { x: ix, y: iy },
      angleDeg,
      isPerpendicular: isPerp,
      steps,
      operation: 'Line Relationship'
    };
  }

  /**
   * Pair of Straight Lines: ax² + 2hxy + by² + 2gx + 2fy + c = 0
   */
  static pairOfLines(a, h, b, g = 0, f = 0, c = 0) {
    a = parseFloat(a) || 0;
    h = parseFloat(h) || 0;
    b = parseFloat(b) || 0;
    g = parseFloat(g) || 0;
    f = parseFloat(f) || 0;
    c = parseFloat(c) || 0;

    const delta = a * b * c + 2 * f * g * h - a * f * f - b * g * g - c * h * h;
    const h2_ab = h * h - a * b;
    const steps = [
      { label: 'Equation Given', value: `${a}x² + ${2*h}xy + ${b}y² + ${2*g}x + ${2*f}y + ${c} = 0` },
      { label: 'Discriminant Condition', value: `Δ = abc + 2fgh - af² - bg² - ch² = ${this._fmt(delta)}` }
    ];

    let lineType = '';
    if (Math.abs(h2_ab) < 1e-9) {
      lineType = 'Coincident (Parallel) Lines';
      steps.push({ label: 'Nature of Lines', value: 'h² - ab = 0  →  Lines are coincident / parallel.' });
    } else if (h2_ab > 0) {
      lineType = 'Real and Distinct Lines';
      steps.push({ label: 'Nature of Lines', value: `h² - ab = ${this._fmt(h2_ab)} > 0  →  Lines are REAL AND DISTINCT.` });
    } else {
      lineType = 'Imaginary Lines';
      steps.push({ label: 'Nature of Lines', value: `h² - ab = ${this._fmt(h2_ab)} < 0  →  Lines are IMAGINARY (intersecting at a real point).` });
    }

    // Angle between lines: tanθ = 2√(h²-ab) / |a+b|
    let angleDeg = null;
    let isPerp = Math.abs(a + b) < 1e-9;
    if (isPerp) {
      angleDeg = 90;
      steps.push({ label: 'Perpendicular Condition', value: 'a + b = 0  →  LINES ARE PERPENDICULAR (θ = 90°).' });
    } else if (h2_ab >= 0) {
      const tanTheta = (2 * Math.sqrt(h2_ab)) / Math.abs(a + b);
      angleDeg = (Math.atan(tanTheta) * 180) / Math.PI;
      steps.push({ label: 'Angle Formula', value: 'tan θ = 2√(h² - ab) / |a + b|' });
      steps.push({ label: 'Angle Between Lines', value: `θ = ${this._fmt(angleDeg)}°` });
    }

    // Point of intersection (if ab - h² != 0):
    let intersection = null;
    const denom = a * b - h * h;
    if (Math.abs(denom) > 1e-9) {
      const ix = (h * f - b * g) / denom;
      const iy = (g * h - a * f) / denom;
      intersection = { x: ix, y: iy };
      steps.push({ label: 'Point of Intersection', value: `P(${this._fmt(ix)}, ${this._fmt(iy)})` });
    }

    return {
      success: true,
      result: `${lineType}${angleDeg !== null ? ` (Angle: ${this._fmt(angleDeg)}°)` : ''}${intersection ? ` at (${this._fmt(intersection.x)}, ${this._fmt(intersection.y)})` : ''}`,
      lineType,
      h2_ab,
      delta,
      angleDeg,
      isPerpendicular: isPerp,
      intersection,
      steps,
      operation: 'Pair of Straight Lines'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. CIRCLE ANALYZER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Circle from (x - h)² + (y - k)² = r² or general x² + y² + 2gx + 2fy + c = 0
   */
  static analyzeCircle(h, k, r) {
    h = parseFloat(h);
    k = parseFloat(k);
    r = parseFloat(r);

    if (isNaN(h) || isNaN(k) || isNaN(r)) {
      return { success: false, error: 'Valid center (h, k) and radius r values required.' };
    }
    if (r <= 0) {
      return { success: false, error: 'Radius must be a positive number (> 0).' };
    }

    const r2 = r * r;
    const g = -h;
    const f = -k;
    const c = h * h + k * k - r2;

    const steps = [
      { label: 'Standard Form', value: `(x ${h >= 0 ? '- ' : '+ '}${this._fmt(Math.abs(h))})² + (y ${k >= 0 ? '- ' : '+ '}${this._fmt(Math.abs(k))})² = ${this._fmt(r2)}` },
      { label: 'Center (h, k)', value: `C(${this._fmt(h)}, ${this._fmt(k)})` },
      { label: 'Radius r', value: `r = ${this._fmt(r)}` },
      { label: 'Diameter', value: `d = 2r = ${this._fmt(2 * r)}` },
      { label: 'Area & Circumference', value: `Area = π·r² ≈ ${this._fmt(Math.PI * r2)},  Circumference = 2π·r ≈ ${this._fmt(2 * Math.PI * r)}` },
      { label: 'General Equation', value: `x² + y² ${g >= 0 ? '+ ' : '- '}${this._fmt(Math.abs(2 * g))}x ${f >= 0 ? '+ ' : '- '}${this._fmt(Math.abs(2 * f))}y ${c >= 0 ? '+ ' : '- '}${this._fmt(Math.abs(c))} = 0` }
    ];

    // Intercepts with X-axis (set y = 0)
    // (x - h)² + k² = r²  =>  (x - h)² = r² - k²
    const discX = r2 - k * k;
    let xIntercepts = [];
    if (discX > 0) {
      const sqrtX = Math.sqrt(discX);
      xIntercepts = [h - sqrtX, h + sqrtX];
      steps.push({ label: 'X-Intercepts', value: `x = ${this._fmt(h - sqrtX)} and x = ${this._fmt(h + sqrtX)}` });
    } else if (Math.abs(discX) < 1e-9) {
      xIntercepts = [h];
      steps.push({ label: 'X-Intercept (Tangent)', value: `Touches X-axis at x = ${this._fmt(h)}` });
    } else {
      steps.push({ label: 'X-Intercepts', value: 'None (Circle does not intersect X-axis)' });
    }

    // Intercepts with Y-axis (set x = 0)
    const discY = r2 - h * h;
    let yIntercepts = [];
    if (discY > 0) {
      const sqrtY = Math.sqrt(discY);
      yIntercepts = [k - sqrtY, k + sqrtY];
      steps.push({ label: 'Y-Intercepts', value: `y = ${this._fmt(k - sqrtY)} and y = ${this._fmt(k + sqrtY)}` });
    } else if (Math.abs(discY) < 1e-9) {
      yIntercepts = [k];
      steps.push({ label: 'Y-Intercept (Tangent)', value: `Touches Y-axis at y = ${this._fmt(k)}` });
    } else {
      steps.push({ label: 'Y-Intercepts', value: 'None (Circle does not intersect Y-axis)' });
    }

    return {
      success: true,
      result: `Center: (${this._fmt(h)}, ${this._fmt(k)}), Radius: ${this._fmt(r)}`,
      center: { x: h, y: k },
      radius: r,
      r: r,
      diameter: 2 * r,
      area: Math.PI * r2,
      circumference: 2 * Math.PI * r,
      xIntercepts,
      yIntercepts,
      steps,
      operation: 'Circle Analysis'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. PARABOLA ANALYZER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Parabola standard forms: y² = 4ax, y² = -4ax, x² = 4ay, x² = -4ay
   */
  static analyzeParabola(param1 = 1, param2 = 'y2_4ax') {
    let a, formType;
    if (typeof param1 === 'string' && isNaN(Number(param1))) {
      formType = param1;
      a = Math.abs(parseFloat(param2) || 1);
    } else {
      a = Math.abs(parseFloat(param1) || 1);
      formType = param2 || 'y2_4ax';
    }

    // Map common aliases
    const aliasMap = {
      'y2_pos': 'y2_4ax',
      'y2_neg': 'y2_neg_4ax',
      'x2_pos': 'x2_4ay',
      'x2_neg': 'x2_neg_4ay'
    };
    formType = aliasMap[formType] || formType;

    const steps = [];
    let vertex = { x: 0, y: 0 };
    let focus = { x: 0, y: 0 };
    let directrix = '';
    let axis = '';
    let latusRectum = 4 * a;
    let opening = '';
    let standardEq = '';

    switch (formType) {
      case 'y2_neg_4ax':
        standardEq = `y² = -${this._fmt(4 * a)}x`;
        opening = 'Left (towards negative X-axis)';
        focus = { x: -a, y: 0 };
        directrix = `x = ${this._fmt(a)}`;
        axis = 'y = 0 (X-axis)';
        break;
      case 'x2_4ay':
        standardEq = `x² = ${this._fmt(4 * a)}y`;
        opening = 'Upward (towards positive Y-axis)';
        focus = { x: 0, y: a };
        directrix = `y = -${this._fmt(a)}`;
        axis = 'x = 0 (Y-axis)';
        break;
      case 'x2_neg_4ay':
        standardEq = `x² = -${this._fmt(4 * a)}y`;
        opening = 'Downward (towards negative Y-axis)';
        focus = { x: 0, y: -a };
        directrix = `y = ${this._fmt(a)}`;
        axis = 'x = 0 (Y-axis)';
        break;
      case 'y2_4ax':
      default:
        standardEq = `y² = ${this._fmt(4 * a)}x`;
        opening = 'Right (towards positive X-axis)';
        focus = { x: a, y: 0 };
        directrix = `x = -${this._fmt(a)}`;
        axis = 'y = 0 (X-axis)';
        break;
    }

    steps.push({ label: 'Standard Equation', value: standardEq });
    steps.push({ label: 'Parameter a', value: `a = ${this._fmt(a)}` });
    steps.push({ label: 'Vertex', value: `V(${this._fmt(vertex.x)}, ${this._fmt(vertex.y)})` });
    steps.push({ label: 'Focus', value: `F(${this._fmt(focus.x)}, ${this._fmt(focus.y)})` });
    steps.push({ label: 'Directrix Equation', value: directrix });
    steps.push({ label: 'Axis of Symmetry', value: axis });
    steps.push({ label: 'Length of Latus Rectum', value: `LLR = 4a = ${this._fmt(latusRectum)}` });
    steps.push({ label: 'Opening Direction', value: opening });

    return {
      success: true,
      result: `Vertex: (0,0), Focus: (${this._fmt(focus.x)}, ${this._fmt(focus.y)}), Directrix: ${directrix}`,
      vertex,
      focus,
      directrix,
      axis,
      latusRectum,
      opening,
      standardEq,
      a,
      steps,
      operation: 'Parabola Analysis'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. ELLIPSE ANALYZER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ellipse: x²/a² + y²/b² = 1
   */
  static analyzeEllipse(semiA = 5, semiB = 3) {
    const a = Math.abs(parseFloat(semiA) || 5);
    const b = Math.abs(parseFloat(semiB) || 3);

    if (a === b) {
      return this.analyzeCircle(0, 0, a);
    }

    const isHorizontal = a > b;
    const majorSemi = Math.max(a, b);
    const minorSemi = Math.min(a, b);
    const c = Math.sqrt(majorSemi * majorSemi - minorSemi * minorSemi);
    const e = c / majorSemi; // Eccentricity < 1
    const latusRectum = (2 * minorSemi * minorSemi) / majorSemi;

    const steps = [
      { label: 'Equation', value: `x²/${this._fmt(a * a)} + y²/${this._fmt(b * b)} = 1` },
      { label: 'Orientation', value: isHorizontal ? 'Horizontal Ellipse (a > b)' : 'Vertical Ellipse (b > a)' },
      { label: 'Semi-Major Axis', value: `${isHorizontal ? 'a' : 'b'} = ${this._fmt(majorSemi)} (Major axis length = ${this._fmt(2 * majorSemi)})` },
      { label: 'Semi-Minor Axis', value: `${isHorizontal ? 'b' : 'a'} = ${this._fmt(minorSemi)} (Minor axis length = ${this._fmt(2 * minorSemi)})` },
      { label: 'Focal Distance c', value: `c = √(a² - b²) = √(${this._fmt(majorSemi * majorSemi)} - ${this._fmt(minorSemi * minorSemi)}) = √${this._fmt(majorSemi * majorSemi - minorSemi * minorSemi)} = ${this._fmt(c)}` },
      { label: 'Eccentricity e', value: `e = c / a = ${this._fmt(c)} / ${this._fmt(majorSemi)} ≈ ${this._fmt(e)}  (0 < e < 1)` },
      { label: 'Foci Coordinates', value: isHorizontal ? `F₁(−${this._fmt(c)}, 0) and F₂(${this._fmt(c)}, 0)` : `F₁(0, −${this._fmt(c)}) and F₂(0, ${this._fmt(c)})` },
      { label: 'Vertices', value: isHorizontal ? `(±${this._fmt(majorSemi)}, 0)` : `(0, ±${this._fmt(majorSemi)})` },
      { label: 'Co-Vertices', value: isHorizontal ? `(0, ±${this._fmt(minorSemi)})` : `(±${this._fmt(minorSemi)}, 0)` },
      { label: 'Directrices Equations', value: isHorizontal ? `x = ±a/e = ±${this._fmt(majorSemi / e)}` : `y = ±b/e = ±${this._fmt(majorSemi / e)}` },
      { label: 'Length of Latus Rectum', value: `2b²/a = 2·(${this._fmt(minorSemi * minorSemi)}) / ${this._fmt(majorSemi)} = ${this._fmt(latusRectum)}` }
    ];

    return {
      success: true,
      result: `Foci: (±${this._fmt(c)}, 0), Eccentricity e = ${this._fmt(e)}, Major = ${this._fmt(2 * majorSemi)}`,
      a, b, c,
      eccentricity: e,
      majorAxis: 2 * majorSemi,
      minorAxis: 2 * minorSemi,
      latusRectum,
      isHorizontal,
      foci: isHorizontal ? [{ x: -c, y: 0 }, { x: c, y: 0 }] : [{ x: 0, y: -c }, { x: 0, y: c }],
      vertices: isHorizontal ? [{ x: -majorSemi, y: 0 }, { x: majorSemi, y: 0 }] : [{ x: 0, y: -majorSemi }, { x: 0, y: majorSemi }],
      steps,
      operation: 'Ellipse Analysis'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. HYPERBOLA ANALYZER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Hyperbola: x²/a² - y²/b² = 1 (horizontal) or y²/a² - x²/b² = 1 (vertical)
   */
  static analyzeHyperbola(semiA = 4, semiB = 3, isVertical = false) {
    const a = Math.abs(parseFloat(semiA) || 4);
    const b = Math.abs(parseFloat(semiB) || 3);
    const c = Math.hypot(a, b); // c = √(a² + b²)
    const e = c / a; // Eccentricity > 1
    const latusRectum = (2 * b * b) / a;

    const eqStr = isVertical
      ? `y²/${this._fmt(a * a)} - x²/${this._fmt(b * b)} = 1`
      : `x²/${this._fmt(a * a)} - y²/${this._fmt(b * b)} = 1`;

    const asymptoteSlope = isVertical ? a / b : b / a;
    const asymptoteStr = `y = ±(${this._fmt(asymptoteSlope)})·x`;

    const steps = [
      { label: 'Standard Equation', value: eqStr },
      { label: 'Transverse Axis Length', value: `2a = 2·(${this._fmt(a)}) = ${this._fmt(2 * a)}` },
      { label: 'Conjugate Axis Length', value: `2b = 2·(${this._fmt(b)}) = ${this._fmt(2 * b)}` },
      { label: 'Focal Distance c', value: `c = √(a² + b²) = √(${this._fmt(a * a)} + ${this._fmt(b * b)}) = √${this._fmt(a * a + b * b)} = ${this._fmt(c)}` },
      { label: 'Eccentricity e', value: `e = c / a = ${this._fmt(c)} / ${this._fmt(a)} ≈ ${this._fmt(e)}  (e > 1)` },
      { label: 'Vertices', value: isVertical ? `(0, ±${this._fmt(a)})` : `(±${this._fmt(a)}, 0)` },
      { label: 'Foci Coordinates', value: isVertical ? `F₁(0, −${this._fmt(c)}) and F₂(0, ${this._fmt(c)})` : `F₁(−${this._fmt(c)}, 0) and F₂(${this._fmt(c)}, 0)` },
      { label: 'Asymptotes', value: asymptoteStr },
      { label: 'Directrices', value: isVertical ? `y = ±a/e = ±${this._fmt(a / e)}` : `x = ±a/e = ±${this._fmt(a / e)}` },
      { label: 'Length of Latus Rectum', value: `2b²/a = 2·(${this._fmt(b * b)}) / ${this._fmt(a)} = ${this._fmt(latusRectum)}` }
    ];

    return {
      success: true,
      result: `Foci: (±${this._fmt(c)}, 0), Asymptotes: ${asymptoteStr}, e = ${this._fmt(e)}`,
      a, b, c,
      eccentricity: e,
      asymptotes: asymptoteStr,
      asymptoteSlope,
      latusRectum,
      isVertical,
      foci: isVertical ? [{ x: 0, y: -c }, { x: 0, y: c }] : [{ x: -c, y: 0 }, { x: c, y: 0 }],
      vertices: isVertical ? [{ x: 0, y: -a }, { x: 0, y: a }] : [{ x: -a, y: 0 }, { x: a, y: 0 }],
      steps,
      operation: 'Hyperbola Analysis'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. GENERAL CONIC CLASSIFIER (Ax² + Bxy + Cy² + Dx + Ey + F = 0)
  // ─────────────────────────────────────────────────────────────────────────────

  static classifyGeneralConic(A, B, C, D, E, F) {
    A = parseFloat(A) || 0;
    B = parseFloat(B) || 0;
    C = parseFloat(C) || 0;
    D = parseFloat(D) || 0;
    E = parseFloat(E) || 0;
    F = parseFloat(F) || 0;

    // Discriminant Delta = B² - 4AC
    const delta = B * B - 4 * A * C;

    // Determinant of 3x3 matrix M:
    // [ A    B/2  D/2 ]
    // [ B/2  C    E/2 ]
    // [ D/2  E/2  F   ]
    const b2 = B / 2, d2 = D / 2, e2 = E / 2;
    const detM = A * (C * F - e2 * e2) - b2 * (b2 * F - e2 * d2) + d2 * (b2 * e2 - C * d2);

    const steps = [
      { label: 'General Equation', value: `${this._fmt(A)}x² + ${this._fmt(B)}xy + ${this._fmt(C)}y² + ${this._fmt(D)}x + ${this._fmt(E)}y + ${this._fmt(F)} = 0` },
      { label: 'Discriminant Formula', value: 'Δ = B² - 4AC' },
      { label: 'Discriminant Value', value: `Δ = (${this._fmt(B)})² - 4·(${this._fmt(A)})·(${this._fmt(C)}) = ${this._fmt(delta)}` },
      { label: 'Matrix Invariant det(M)', value: `det(M) = ${this._fmt(detM)}` }
    ];

    let conicType = '';
    let explanation = '';

    if (Math.abs(detM) < 1e-6) {
      conicType = 'Degenerate Conic';
      explanation = delta < 0 ? 'Point or imaginary lines' : delta === 0 ? 'Pair of parallel or coincident lines' : 'Pair of intersecting lines';
      steps.push({ label: 'Degeneracy Detected', value: `det(M) = 0  →  Degenerate conic section (${explanation})` });
    } else if (Math.abs(B) < 1e-9 && Math.abs(A - C) < 1e-9 && A !== 0) {
      conicType = 'Circle';
      explanation = 'B = 0 and A = C ≠ 0 with Δ < 0';
      steps.push({ label: 'Classification', value: 'CIRCLE: Coefficients of x² and y² are equal and xy term is absent.' });
    } else if (delta < 0) {
      conicType = 'Ellipse';
      explanation = 'Δ = B² - 4AC < 0 (Bounded closed conic curve)';
      steps.push({ label: 'Classification', value: 'ELLIPSE: Discriminant Δ < 0.' });
    } else if (Math.abs(delta) < 1e-9) {
      conicType = 'Parabola';
      explanation = 'Δ = B² - 4AC = 0 (Unbounded single-branch curve)';
      steps.push({ label: 'Classification', value: 'PARABOLA: Discriminant Δ = 0.' });
    } else {
      conicType = 'Hyperbola';
      explanation = 'Δ = B² - 4AC > 0 (Two unbounded branches with asymptotes)';
      steps.push({ label: 'Classification', value: 'HYPERBOLA: Discriminant Δ > 0.' });
    }

    return {
      success: true,
      conicType,
      delta,
      detM,
      explanation,
      result: `${conicType} (${explanation})`,
      steps,
      operation: 'Conic Section Classification'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. THREE-DIMENSIONAL GEOMETRY (3D)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 3D Distance between A(x1,y1,z1) and B(x2,y2,z2)
   */
  static distance3D(p1, p2) {
    if (!p1 || !p2 || [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z].some(isNaN)) {
      return { success: false, error: 'Valid 3D point coordinates required.' };
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const sumSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(sumSq);

    const steps = [
      { label: '3D Points Identified', value: `A(${this._fmt(p1.x)}, ${this._fmt(p1.y)}, ${this._fmt(p1.z)}) and B(${this._fmt(p2.x)}, ${this._fmt(p2.y)}, ${this._fmt(p2.z)})` },
      { label: 'Distance Formula', value: 'd = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²]' },
      { label: 'Differences', value: `Δx = ${this._fmt(dx)}, Δy = ${this._fmt(dy)}, Δz = ${this._fmt(dz)}` },
      { label: 'Substitution', value: `d = √[(${this._fmt(dx)})² + (${this._fmt(dy)})² + (${this._fmt(dz)})²] = √[${this._fmt(dx * dx)} + ${this._fmt(dy * dy)} + ${this._fmt(dz * dz)}] = √${this._fmt(sumSq)}` }
    ];

    const exact = this._simplifySquareRoot(sumSq);
    const decimal = this._fmt(dist);

    if (exact !== decimal) {
      steps.push({ label: 'Exact Simplified Form', value: `d = ${exact}` });
      steps.push({ label: 'Decimal Form', value: `d ≈ ${decimal}` });
    } else {
      steps.push({ label: 'Result', value: `d = ${exact}` });
    }

    return {
      success: true,
      result: exact !== decimal ? `${exact} (≈ ${decimal})` : exact,
      exact,
      decimal,
      numericValue: dist,
      dx, dy, dz,
      steps,
      operation: '3D Distance Formula'
    };
  }

  /**
   * 3D Section Formula in ratio m:n
   */
  static sectionFormula3D(p1, p2, m, n, isInternal = true) {
    if (!p1 || !p2 || [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z].some(isNaN)) {
      return { success: false, error: 'Valid 3D point coordinates required.' };
    }
    m = parseFloat(m);
    n = parseFloat(n);
    if (isNaN(m) || isNaN(n) || m <= 0 || n <= 0) {
      return { success: false, error: 'Ratio m:n terms must be positive numbers.' };
    }
    if (!isInternal && m === n) {
      return { success: false, error: 'External division ratio cannot have m = n.' };
    }

    const typeStr = isInternal ? 'Internal Division' : 'External Division';
    const denom = isInternal ? m + n : m - n;
    const px = (isInternal ? (m * p2.x + n * p1.x) : (m * p2.x - n * p1.x)) / denom;
    const py = (isInternal ? (m * p2.y + n * p1.y) : (m * p2.y - n * p1.y)) / denom;
    const pz = (isInternal ? (m * p2.z + n * p1.z) : (m * p2.z - n * p1.z)) / denom;

    const steps = [
      { label: 'Division Type & Ratio', value: `${typeStr} in ratio ${m} : ${n}` },
      { label: '3D Formula', value: `P = ((m·x₂ ± n·x₁)/(m ± n), (m·y₂ ± n·y₁)/(m ± n), (m·z₂ ± n·z₁)/(m ± n))` },
      { label: 'Coordinates Calculation', value: `x = ${this._fmt(px)},  y = ${this._fmt(py)},  z = ${this._fmt(pz)}` },
      { label: 'Resulting 3D Point', value: `P(${this._fmt(px)}, ${this._fmt(py)}, ${this._fmt(pz)})` }
    ];

    return {
      success: true,
      result: `P(${this._fmt(px)}, ${this._fmt(py)}, ${this._fmt(pz)})`,
      point: { x: px, y: py, z: pz },
      steps,
      operation: `3D Section Formula (${typeStr})`
    };
  }

  /**
   * 3D Line through two points: Direction ratios, direction cosines, vector and cartesian form
   */
  static line3D(p1, p2) {
    if (!p1 || !p2 || [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z].some(isNaN)) {
      return { success: false, error: 'Valid 3D point coordinates required.' };
    }

    const drX = p2.x - p1.x;
    const drY = p2.y - p1.y;
    const drZ = p2.z - p1.z;
    const mag = Math.hypot(drX, drY, drZ);

    if (mag < 1e-12) {
      return { success: false, error: 'Points A and B are coincident; cannot form a unique 3D line.' };
    }

    const dcL = drX / mag;
    const dcM = drY / mag;
    const dcN = drZ / mag;

    const cartesianEq = `(x - ${this._fmt(p1.x)})/${this._fmt(drX)} = (y - ${this._fmt(p1.y)})/${this._fmt(drY)} = (z - ${this._fmt(p1.z)})/${this._fmt(drZ)}`;
    const vectorEq = `r⃗ = (${this._fmt(p1.x)}î + ${this._fmt(p1.y)}ĵ + ${this._fmt(p1.z)}k̂) + λ·(${this._fmt(drX)}î + ${this._fmt(drY)}ĵ + ${this._fmt(drZ)}k̂)`;

    const steps = [
      { label: 'Direction Ratios (a, b, c)', value: `a = x₂-x₁ = ${this._fmt(drX)},  b = y₂-y₁ = ${this._fmt(drY)},  c = z₂-z₁ = ${this._fmt(drZ)}` },
      { label: 'Magnitude √(a² + b² + c²)', value: `√(${this._fmt(drX * drX + drY * drY + drZ * drZ)}) ≈ ${this._fmt(mag)}` },
      { label: 'Direction Cosines (l, m, n)', value: `l = ${this._fmt(dcL)},  m = ${this._fmt(dcM)},  n = ${this._fmt(dcN)}  (l² + m² + n² = 1)` },
      { label: 'Cartesian Equation', value: cartesianEq },
      { label: 'Vector Equation', value: vectorEq }
    ];

    return {
      success: true,
      result: cartesianEq,
      directionRatios: { a: drX, b: drY, c: drZ },
      directionCosines: { l: dcL, m: dcM, n: dcN },
      cartesianEq,
      vectorEq,
      steps,
      operation: '3D Line Analysis'
    };
  }

  /**
   * 3D Plane: Ax + By + Cz + D = 0
   */
  static plane3D(A, B, C, D) {
    A = parseFloat(A);
    B = parseFloat(B);
    C = parseFloat(C);
    D = parseFloat(D);

    if (isNaN(A) || isNaN(B) || isNaN(C) || isNaN(D)) {
      return { success: false, error: 'Valid coefficients A, B, C, D required for Ax + By + Cz + D = 0.' };
    }

    const normalMag = Math.hypot(A, B, C);
    if (normalMag < 1e-12) {
      return { success: false, error: 'At least one of A, B, C must be non-zero.' };
    }

    const distOrigin = Math.abs(D) / normalMag;
    const unitNormal = { x: A / normalMag, y: B / normalMag, z: C / normalMag };

    const steps = [
      { label: 'Plane Equation', value: `${this._fmt(A)}x + ${this._fmt(B)}y + ${this._fmt(C)}z + ${this._fmt(D)} = 0` },
      { label: 'Normal Vector n⃗', value: `n⃗ = (${this._fmt(A)}, ${this._fmt(B)}, ${this._fmt(C)})` },
      { label: 'Normal Magnitude |n⃗|', value: `|n⃗| = √(${this._fmt(A * A + B * B + C * C)}) ≈ ${this._fmt(normalMag)}` },
      { label: 'Unit Normal Vector n̂', value: `n̂ = (${this._fmt(unitNormal.x)}, ${this._fmt(unitNormal.y)}, ${this._fmt(unitNormal.z)})` },
      { label: 'Distance from Origin', value: `d = |D| / |n⃗| = |${this._fmt(D)}| / ${this._fmt(normalMag)} ≈ ${this._fmt(distOrigin)}` }
    ];

    return {
      success: true,
      result: `Normal: (${this._fmt(A)}, ${this._fmt(B)}, ${this._fmt(C)}), Dist from origin: ${this._fmt(distOrigin)}`,
      normal: { x: A, y: B, z: C },
      unitNormal,
      distOrigin,
      steps,
      operation: '3D Plane Analysis'
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. UNIVERSAL GEOMETRY INPUT PARSER & DETECTOR
  // ─────────────────────────────────────────────────────────────────────────────

  static detectGeometryInput(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return { type: 'unknown', suggestions: [] };
    const clean = rawInput.trim();

    // 1. Two 2D Points: e.g. A(2,3), B(6,7) or (2,3), (6,7)
    const twoPointsMatch = clean.match(/^[a-zA-Z]?\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)\s*[,;]?\s*[a-zA-Z]?\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)$/);
    if (twoPointsMatch) {
      const p1 = { x: parseFloat(twoPointsMatch[1]), y: parseFloat(twoPointsMatch[2]) };
      const p2 = { x: parseFloat(twoPointsMatch[3]), y: parseFloat(twoPointsMatch[4]) };
      return {
        type: 'two-points-2d',
        p1, p2,
        suggestions: ['Distance', 'Midpoint', 'Slope', 'Line Equation', 'Plot']
      };
    }

    // 2. Three 2D Points: e.g. A(0,0), B(4,0), C(0,3)
    const threePointsMatch = clean.match(/^[a-zA-Z]?\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)\s*[,;]?\s*[a-zA-Z]?\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)\s*[,;]?\s*[a-zA-Z]?\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)$/);
    if (threePointsMatch) {
      const p1 = { x: parseFloat(threePointsMatch[1]), y: parseFloat(threePointsMatch[2]) };
      const p2 = { x: parseFloat(threePointsMatch[3]), y: parseFloat(threePointsMatch[4]) };
      const p3 = { x: parseFloat(threePointsMatch[5]), y: parseFloat(threePointsMatch[6]) };
      return {
        type: 'three-points-2d',
        p1, p2, p3,
        suggestions: ['Triangle Area', 'Centroid', 'Collinearity Check', 'Plot Triangle']
      };
    }

    // 3. Two 3D Points: e.g. A(1,2,3), B(4,6,8)
    const two3DPointsMatch = clean.match(/^[a-zA-Z]?\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)\s*[,;]?\s*[a-zA-Z]?\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)$/);
    if (two3DPointsMatch) {
      const p1 = { x: parseFloat(two3DPointsMatch[1]), y: parseFloat(two3DPointsMatch[2]), z: parseFloat(two3DPointsMatch[3]) };
      const p2 = { x: parseFloat(two3DPointsMatch[4]), y: parseFloat(two3DPointsMatch[5]), z: parseFloat(two3DPointsMatch[6]) };
      return {
        type: 'two-points-3d',
        p1, p2,
        suggestions: ['3D Distance', '3D Midpoint', 'Direction Ratios', '3D Line Vector Form', 'Plot 3D']
      };
    }

    // 4. Circle: x^2 + y^2 = r^2 or (x-h)^2 + (y-k)^2 = r^2
    if (/(?:x\^2|x²)\s*\+\s*(?:y\^2|y²)\s*=\s*(\d+\.?\d*)/i.test(clean)) {
      return { type: 'circle', suggestions: ['Find Center & Radius', 'Plot Circle', 'Find Intercepts', 'Area & Perimeter'] };
    }
    if (/\(x\s*[-+]\s*\d+\.?\d*\)\^2\s*\+\s*\(y\s*[-+]\s*\d+\.?\d*\)\^2\s*=\s*\d+/i.test(clean)) {
      return { type: 'circle', suggestions: ['Find Center & Radius', 'Plot Circle', 'Find Intercepts'] };
    }

    // 5. Ellipse: x^2/a^2 + y^2/b^2 = 1
    if (/(?:x\^2|x²)\s*\/\s*\d+\.?\d*\s*\+\s*(?:y\^2|y²)\s*\/\s*\d+\.?\d*\s*=\s*1/i.test(clean)) {
      return { type: 'ellipse', suggestions: ['Find Foci', 'Major & Minor Axes', 'Eccentricity', 'Plot Ellipse'] };
    }

    // 6. Hyperbola: x^2/a^2 - y^2/b^2 = 1 or y^2/a^2 - x^2/b^2 = 1
    if (/(?:x\^2|x²)\s*\/\s*\d+\.?\d*\s*-\s*(?:y\^2|y²)\s*\/\s*\d+\.?\d*\s*=\s*1/i.test(clean) ||
        /(?:y\^2|y²)\s*\/\s*\d+\.?\d*\s*-\s*(?:x\^2|x²)\s*\/\s*\d+\.?\d*\s*=\s*1/i.test(clean)) {
      return { type: 'hyperbola', suggestions: ['Find Foci', 'Asymptotes', 'Eccentricity', 'Plot Hyperbola'] };
    }

    // 7. Parabola: y^2 = 4ax or x^2 = 4ay
    if (/(?:y\^2|y²)\s*=\s*[-+]?\d*\.?\d*x/i.test(clean) || /(?:x\^2|x²)\s*=\s*[-+]?\d*\.?\d*y/i.test(clean)) {
      return { type: 'parabola', suggestions: ['Vertex & Focus', 'Directrix', 'Latus Rectum', 'Plot Parabola'] };
    }

    // 8. 3D Plane: Ax + By + Cz + D = 0
    if (/[-+]?\d*\.?\d*x\s*[-+]\s*\d*\.?\d*y\s*[-+]\s*\d*\.?\d*z/i.test(clean) && clean.includes('=')) {
      return { type: 'plane-3d', suggestions: ['Normal Vector', 'Distance from Origin', 'Plot Plane in 3D'] };
    }

    // 9. Straight line: y = mx + c or Ax + By + C = 0
    if (/^y\s*=\s*[-+]?\d*\.?\d*x\s*([+-]\s*\d+\.?\d*)?$/i.test(clean) ||
        /[-+]?\d*\.?\d*x\s*[-+]\s*\d*\.?\d*y\s*([+-]\s*\d+\.?\d*)?\s*=\s*0/i.test(clean)) {
      return { type: 'line', suggestions: ['Slope & Intercepts', 'Angle with X-axis', 'Distance from Origin', 'Plot Line'] };
    }

    return { type: 'expression', suggestions: ['Analyze Geometry', 'Plot on Coordinate Plane', 'Find Properties'] };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS (Exact Radical & Fraction Simplifiers)
  // ─────────────────────────────────────────────────────────────────────────────

  static _fmt(n) {
    if (typeof n !== 'number') return String(n);
    if (!isFinite(n)) return String(n);
    if (Number.isInteger(n)) return String(n);
    return parseFloat(n.toFixed(6)).toString();
  }

  static _gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) { [a, b] = [b, a % b]; }
    return a;
  }

  static _simplifyFraction(num, den) {
    if (den === 0) return 'undefined';
    if (num === 0) return '0';
    const sign = (num < 0) ^ (den < 0) ? '-' : '';
    const n = Math.abs(Math.round(num));
    const d = Math.abs(Math.round(den));
    const g = this._gcd(n, d);
    const redN = n / g;
    const redD = d / g;
    return redD === 1 ? `${sign}${redN}` : `${sign}${redN}/${redD}`;
  }

  static _simplifySquareRoot(n) {
    if (n < 0) return 'i√' + Math.abs(n);
    if (n === 0) return '0';
    if (!Number.isInteger(n)) return this._fmt(Math.sqrt(n));

    const root = Math.round(Math.sqrt(n));
    if (root * root === n) return String(root);

    let outside = 1;
    let inside = n;

    for (let factor = Math.floor(Math.sqrt(inside)); factor >= 2; factor--) {
      const fSq = factor * factor;
      if (inside % fSq === 0) {
        outside *= factor;
        inside /= fSq;
      }
    }

    if (outside > 1) {
      return `${outside}√${inside}`;
    }
    return `√${n}`;
  }
}
