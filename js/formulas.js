/**
 * OG - Comprehensive Mathematical Formula Library Database & Interactive View
 * 11 Curated Categories:
 * - Algebra
 * - Trigonometry
 * - Coordinate Geometry
 * - Calculus
 * - Statistics
 * - Probability
 * - Matrices
 * - Determinants
 * - Vectors
 * - 3D Geometry
 * - Linear Programming
 *
 * Features:
 * - Real-time Search
 * - Category Filters + Favorites Filter
 * - Favorite Star persistence via localStorage
 * - Copy formula with tooltip & toast
 * - Deep-link directly to related modules
 * - Collapsible Formula Explanation & Intuition
 *
 * ES6 Module
 */

import { copyToClipboard, showToast, SVG_ICONS } from './utils.js';

export const FORMULA_CATEGORIES = [
  'All',
  'Favorites',
  'Algebra',
  'Trigonometry',
  'Coordinate Geometry',
  'Calculus',
  'Statistics',
  'Probability',
  'Matrices',
  'Determinants',
  'Vectors',
  '3D Geometry',
  'Linear Programming'
];

export const FORMULA_DATABASE = [
  // ==========================================
  // 1. ALGEBRA
  // ==========================================
  {
    id: 'quad-formula',
    name: 'Quadratic Formula',
    formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
    topic: 'Quadratic Equations',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Calculates the roots of any quadratic equation ax² + bx + c = 0.',
    explanation: 'Derived by completing the square on the general second-degree polynomial. The discriminant Δ = b² - 4ac determines the nature of the roots: real and distinct if Δ > 0, real and equal if Δ = 0, and complex conjugates if Δ < 0.',
    relatedModule: { id: 'complex-numbers', name: 'Complex Numbers and Quadratic Equations', num: 4 }
  },
  {
    id: 'binomial-theorem',
    name: 'Binomial Theorem Expansion',
    formula: '(a + b)ⁿ = ∑ [C(n, k) · aⁿ⁻ᵏ · bᵏ]',
    topic: 'Binomial Theorem',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Expands the positive integral power of any binomial sum.',
    explanation: 'The coefficients C(n, k) = n! / [k!(n - k)!] match the n-th row of Pascal’s Triangle, representing the number of combinations when selecting k terms of b out of n factors.',
    relatedModule: { id: 'binomial-theorem', name: 'Binomial Theorem', num: 7 }
  },
  {
    id: 'binomial-general-term',
    name: 'Binomial General Term (Tᵣ₊₁)',
    formula: 'Tᵣ₊₁ = C(n, r) · aⁿ⁻ʳ · bʳ',
    topic: 'Binomial Theorem',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Determines the (r+1)-th term in the binomial expansion of (a + b)ⁿ without expanding.',
    explanation: 'Used to locate specific terms (such as middle terms or terms independent of x) by equating the variable exponent to zero.',
    relatedModule: { id: 'binomial-theorem', name: 'Binomial Theorem', num: 7 }
  },
  {
    id: 'ap-sum',
    name: 'Sum of Arithmetic Progression (AP)',
    formula: 'Sₙ = (n / 2) · [2a + (n - 1)d] = (n / 2) · [a + l]',
    topic: 'Sequences & Series',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Computes the sum of the first n terms of an arithmetic progression.',
    explanation: 'Discovered by pairing symmetric terms from opposite ends: the average of the first term a and last term l multiplied by the total number of terms n.',
    relatedModule: { id: 'sequence-series', name: 'Sequence and Series', num: 8 }
  },
  {
    id: 'gp-infinite-sum',
    name: 'Infinite Geometric Series Sum',
    formula: 'S_∞ = a / (1 - r),   for |r| < 1',
    topic: 'Sequences & Series',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Total converged sum of an infinite geometric progression with common ratio |r| < 1.',
    explanation: 'As n → ∞, rⁿ vanishes towards zero when |r| < 1, causing the finite sum Sₙ = a(1 - rⁿ)/(1 - r) to asymptotically converge to a / (1 - r).',
    relatedModule: { id: 'sequence-series', name: 'Sequence and Series', num: 8 }
  },
  {
    id: 'set-cardinality-union',
    name: 'Cardinality of Union of Two Sets',
    formula: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B)',
    topic: 'Set Theory',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Principle of Inclusion-Exclusion for two finite sets A and B.',
    explanation: 'Summing n(A) and n(B) counts the shared elements in the intersection n(A ∩ B) twice. Subtracting the intersection corrects for double-counting.',
    relatedModule: { id: 'sets', name: 'Sets', num: 1 }
  },
  {
    id: 'de-morgans-laws',
    name: 'De Morgan’s Laws',
    formula: '(A ∪ B)′ = A′ ∩ B′   and   (A ∩ B)′ = A′ ∪ B′',
    topic: 'Set Theory & Logic',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Relates set unions, intersections, and complements.',
    explanation: 'The complement of a union is the intersection of the individual complements, fundamental in boolean logic and set duality.',
    relatedModule: { id: 'sets', name: 'Sets', num: 1 }
  },
  {
    id: 'permutations-formula',
    name: 'Permutation (Arrangement)',
    formula: 'P(n, r) = n! / (n - r)!',
    topic: 'Combinatorics',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Number of ordered arrangements of r distinct objects chosen from n items.',
    explanation: 'Order matters. The first slot has n choices, the second (n - 1), up to the r-th slot having (n - r + 1) choices.',
    relatedModule: { id: 'permutations-combinations', name: 'Permutations and Combinations', num: 6 }
  },
  {
    id: 'combinations-formula',
    name: 'Combination (Selection)',
    formula: 'C(n, r) = n! / [r! · (n - r)!]',
    topic: 'Combinatorics',
    category: 'Algebra',
    badgeClass: 'badge-algebra',
    description: 'Number of unordered selections of r objects chosen from n items.',
    explanation: 'Order does not matter. It equals the number of permutations P(n, r) divided by r! to eliminate permutations of the same selection.',
    relatedModule: { id: 'permutations-combinations', name: 'Permutations and Combinations', num: 6 }
  },

  // ==========================================
  // 2. TRIGONOMETRY
  // ==========================================
  {
    id: 'trig-pythagorean',
    name: 'Fundamental Pythagorean Identity',
    formula: 'sin²(θ) + cos²(θ) = 1',
    topic: 'Trigonometric Identities',
    category: 'Trigonometry',
    badgeClass: 'badge-calculus',
    description: 'The primary identity relating sine and cosine on the unit circle.',
    explanation: 'Represents the Pythagorean theorem x² + y² = 1 applied to coordinates (cos θ, sin θ) on a unit circle centered at the origin.',
    relatedModule: { id: 'trigonometric-functions', name: 'Trigonometric Functions', num: 3 }
  },
  {
    id: 'trig-double-sin',
    name: 'Double Angle Identity: Sine',
    formula: 'sin(2θ) = 2 · sin(θ) · cos(θ)',
    topic: 'Multiple Angles',
    category: 'Trigonometry',
    badgeClass: 'badge-calculus',
    description: 'Expresses the sine of double angle in terms of single angle products.',
    explanation: 'Derived from the sine addition formula sin(A + B) = sin A cos B + cos A sin B by substituting A = B = θ.',
    relatedModule: { id: 'trigonometric-functions', name: 'Trigonometric Functions', num: 3 }
  },
  {
    id: 'trig-double-cos',
    name: 'Double Angle Identity: Cosine',
    formula: 'cos(2θ) = cos²(θ) - sin²(θ) = 2cos²(θ) - 1 = 1 - 2sin²(θ)',
    topic: 'Multiple Angles',
    category: 'Trigonometry',
    badgeClass: 'badge-calculus',
    description: 'Three interchangeable forms of the cosine double angle formula.',
    explanation: 'Crucial for power reduction in calculus when integrating sin²(x) or cos²(x) via cos²(x) = (1 + cos 2x)/2.',
    relatedModule: { id: 'trigonometric-functions', name: 'Trigonometric Functions', num: 3 }
  },
  {
    id: 'trig-tan-addition',
    name: 'Tangent Compound Angle',
    formula: 'tan(A + B) = (tan A + tan B) / (1 - tan A · tan B)',
    topic: 'Compound Angles',
    category: 'Trigonometry',
    badgeClass: 'badge-calculus',
    description: 'Computes tangent of sum of two angles.',
    explanation: 'Formed by dividing sin(A + B) by cos(A + B) and simplifying by dividing numerator and denominator by cos A cos B.',
    relatedModule: { id: 'trigonometric-functions', name: 'Trigonometric Functions', num: 3 }
  },
  {
    id: 'inverse-trig-complement',
    name: 'Principal Complement Identity',
    formula: 'sin⁻¹(x) + cos⁻¹(x) = π / 2,   for x ∈ [-1, 1]',
    topic: 'Inverse Trigonometry',
    category: 'Trigonometry',
    badgeClass: 'badge-calculus',
    description: 'Complementary relationship between arcsine and arccosine within their principal domain.',
    explanation: 'In any right-angled triangle, the acute angles sum to π/2 (90°). If sin(θ) = x, then cos(π/2 - θ) = x.',
    relatedModule: { id: 'inverse-trigonometric-functions', name: 'Inverse Trigonometric Functions', num: 15 }
  },
  {
    id: 'inverse-trig-atan-sum',
    name: 'Arctangent Addition Formula',
    formula: 'tan⁻¹(x) + tan⁻¹(y) = tan⁻¹[(x + y) / (1 - xy)],   for xy < 1',
    topic: 'Inverse Trigonometry',
    category: 'Trigonometry',
    badgeClass: 'badge-calculus',
    description: 'Combines two arctangent values into a single inverse tangent expression.',
    explanation: 'Inverse reflection of tan(A + B). Requires xy < 1 to guarantee the resulting principal angle lies in (-π/2, π/2).',
    relatedModule: { id: 'inverse-trigonometric-functions', name: 'Inverse Trigonometric Functions', num: 15 }
  },

  // ==========================================
  // 3. COORDINATE GEOMETRY
  // ==========================================
  {
    id: 'distance-2d',
    name: '2D Euclidean Distance Formula',
    formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]',
    topic: 'Distance & Length',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Calculates the shortest straight-line distance between points P₁(x₁, y₁) and P₂(x₂, y₂).',
    explanation: 'Direct geometric consequence of the Pythagorean Theorem on the right-triangle formed by horizontal difference Δx and vertical difference Δy.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'midpoint-2d',
    name: 'Midpoint Formula',
    formula: 'M = ((x₁ + x₂) / 2, (y₁ + y₂) / 2)',
    topic: 'Points & Coordinates',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Finds the exact equidistant point on the line segment connecting P₁ and P₂.',
    explanation: 'Calculated as the arithmetic mean of the respective x and y coordinates.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'section-formula-2d',
    name: 'Section Formula (Ratio m : n)',
    formula: 'P = ((m·x₂ ± n·x₁) / (m ± n), (m·y₂ ± n·y₁) / (m ± n))',
    topic: 'Division of Segment',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Divides a line segment internally (+) or externally (-) in the ratio m : n.',
    explanation: 'Internal division finds a point strictly between P₁ and P₂. External division finds an extension point on the line beyond the segment.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'slope-formula',
    name: 'Slope of a Line',
    formula: 'm = (y₂ - y₁) / (x₂ - x₁) = tan(θ)',
    topic: 'Slope & Inclination',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Measures the steepness and direction of a non-vertical straight line.',
    explanation: 'Positive slope rises from left to right; negative slope falls; zero slope is horizontal; vertical lines have an undefined slope (division by zero).',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'triangle-area-coord',
    name: 'Area of Triangle from Coordinates',
    formula: 'Area = ½ · |x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂)|',
    topic: 'Triangles',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Calculates the planar area enclosed by three vertices A, B, and C.',
    explanation: 'Derived from the absolute value of half the 3×3 coordinate determinant. An area of 0 proves that the three points are collinear.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'slope-intercept-form',
    name: 'Slope-Intercept Line Equation',
    formula: 'y = m · x + c',
    topic: 'Straight Lines',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Standard linear equation with gradient m and vertical intercept c.',
    explanation: 'The slope m = tan(θ) determines the inclination angle of the line with the positive x-axis, and (0, c) is where the line crosses the y-axis.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'perpendicular-distance-line',
    name: 'Perpendicular Distance to Line',
    formula: 'd = |A·x₁ + B·y₁ + C| / √(A² + B²)',
    topic: 'Distance from Point',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Shortest Euclidean distance from point (x₁, y₁) to the general line Ax + By + C = 0.',
    explanation: 'Derived by projecting the vector from a line point to (x₁, y₁) onto the line’s normal vector n⃗ = ⟨A, B⟩.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'angle-between-lines',
    name: 'Angle Between Two Lines',
    formula: 'tan(θ) = |(m₂ - m₁) / (1 + m₁·m₂)|',
    topic: 'Line Relationships',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Calculates the acute angle θ between two straight lines with slopes m₁ and m₂.',
    explanation: 'Lines are parallel if m₁ = m₂. Lines are perpendicular if m₁ · m₂ = -1 (a 90° relationship).',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'distance-parallel-lines',
    name: 'Distance Between Parallel Lines',
    formula: 'd = |C₁ - C₂| / √(A² + B²)',
    topic: 'Parallel Lines',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Finds the constant perpendicular spacing between two parallel lines Ax + By + C₁ = 0 and Ax + By + C₂ = 0.',
    explanation: 'Since coefficients A and B match, the difference between constant intercepts normalized by normal magnitude gives the exact separation.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'pair-of-lines-angle',
    name: 'Pair of Straight Lines Angle',
    formula: 'tan(θ) = 2√(h² - ab) / |a + b|',
    topic: 'Pair of Straight Lines',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Calculates the angle between lines represented by the homogeneous quadratic ax² + 2hxy + by² = 0.',
    explanation: 'Lines are perpendicular if a + b = 0. Lines are coincident or real/distinct if h² - ab ≥ 0; imaginary if h² - ab < 0.',
    relatedModule: { id: 'straight-lines', name: 'Straight Lines', num: 9 }
  },
  {
    id: 'circle-general-eq',
    name: 'General Form of Circle',
    formula: 'x² + y² + 2gx + 2fy + c = 0',
    topic: 'Conic Sections: Circle',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Second-degree general circle equation with Center (-g, -f) and Radius r = √(g² + f² - c).',
    explanation: 'Real circle if g² + f² - c > 0; point circle if g² + f² - c = 0; imaginary circle if g² + f² - c < 0.',
    relatedModule: { id: 'conic-sections', name: 'Conic Sections', num: 10 }
  },
  {
    id: 'circle-standard-eq',
    name: 'Standard Circle Equation',
    formula: '(x - h)² + (y - k)² = r²',
    topic: 'Conic Sections: Circle',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Locus of all points at constant distance r from center (h, k).',
    explanation: 'Direct algebraic translation of the distance constraint: any point (x, y) on the circle is at fixed radius r from the center.',
    relatedModule: { id: 'conic-sections', name: 'Conic Sections', num: 10 }
  },
  {
    id: 'parabola-standard-eq',
    name: 'Standard Parabola Equation',
    formula: 'y² = 4a · x   (Focus at (a, 0), Directrix x = -a)',
    topic: 'Conic Sections: Parabola',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Locus of points equidistant from focus (a, 0) and vertical directrix line x = -a.',
    explanation: 'Eccentricity e = 1. The latus rectum length is 4a and the vertex is at the origin (0, 0).',
    relatedModule: { id: 'conic-sections', name: 'Conic Sections', num: 10 }
  },
  {
    id: 'ellipse-standard-eq',
    name: 'Standard Ellipse Equation',
    formula: 'x² / a² + y² / b² = 1,   where b² = a²(1 - e²)',
    topic: 'Conic Sections: Ellipse',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Symmetric oval with major axis 2a, minor axis 2b, and eccentricity e < 1.',
    explanation: 'Sum of distances from any point on the ellipse to the two foci (±ae, 0) is constant and equal to 2a.',
    relatedModule: { id: 'conic-sections', name: 'Conic Sections', num: 10 }
  },
  {
    id: 'hyperbola-standard-eq',
    name: 'Standard Hyperbola Equation',
    formula: 'x² / a² - y² / b² = 1,   where b² = a²(e² - 1)',
    topic: 'Conic Sections: Hyperbola',
    category: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    description: 'Two symmetrical open curves with eccentricity e > 1 and asymptotes y = ±(b/a)x.',
    explanation: 'Absolute difference of distances from any point on the hyperbola to the two foci (±ae, 0) is constant and equal to 2a.',
    relatedModule: { id: 'conic-sections', name: 'Conic Sections', num: 10 }
  },

  // ==========================================
  // 4. CALCULUS
  // ==========================================
  {
    id: 'derivative-first-principle',
    name: 'Derivative from First Principles',
    formula: "f'(x) = lim(h → 0) [f(x + h) - f(x)] / h",
    topic: 'Differentiation',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Fundamental limit definition of the instantaneous rate of change of a function.',
    explanation: 'Represents the limiting slope of secant lines passing through (x, f(x)) and (x + h, f(x + h)) as the step interval h shrinks to zero.',
    relatedModule: { id: 'limits-derivatives', name: 'Limits and Derivatives', num: 12 }
  },
  {
    id: 'power-rule-diff',
    name: 'Power Rule of Differentiation',
    formula: 'd/dx [xⁿ] = n · xⁿ⁻¹',
    topic: 'Differentiation Rules',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Differentiates powers of x for any real exponent n.',
    explanation: 'Foundational rule derived via the binomial expansion of (x + h)ⁿ as h approaches 0.',
    relatedModule: { id: 'limits-derivatives', name: 'Limits and Derivatives', num: 12 }
  },
  {
    id: 'product-rule-diff',
    name: 'Product Rule of Differentiation',
    formula: "d/dx [u · v] = u · (dv/dx) + v · (du/dx)",
    topic: 'Differentiation Rules',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Differentiates the product of two differentiable functions u(x) and v(x).',
    explanation: 'Geometrically, if a rectangle has area u·v and sides expand by du and dv, the first-order change in area is u·dv + v·du.',
    relatedModule: { id: 'limits-derivatives', name: 'Limits and Derivatives', num: 12 }
  },
  {
    id: 'chain-rule-diff',
    name: 'Chain Rule (Composite Functions)',
    formula: "d/dx [f(g(x))] = f'(g(x)) · g'(x)",
    topic: 'Differentiation Rules',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Differentiates nested functions f(u) where u = g(x).',
    explanation: 'Multiplies the relative rates of change: dy/dx = (dy/du) · (du/dx). Essential for complex transcendental and polynomial functions.',
    relatedModule: { id: 'continuity-differentiability', name: 'Continuity and Differentiability', num: 18 }
  },
  {
    id: 'tangent-line-eq',
    name: 'Equation of Tangent Line',
    formula: "y - y₀ = m · (x - x₀),   where m = dy/dx |₍ₓ₀, ᵧ₀₎",
    topic: 'Applications of Derivatives',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Straight line that touches curve y = f(x) locally at point (x₀, y₀).',
    explanation: 'The slope m of the tangent line equals the first derivative evaluated at the contact point.',
    relatedModule: { id: 'applications-of-derivatives', name: 'Applications of Derivatives', num: 19 }
  },
  {
    id: 'integration-by-parts',
    name: 'Integration by Parts',
    formula: '∫ u · v dx = u ∫ v dx - ∫ [u′ · (∫ v dx)] dx',
    topic: 'Integration Techniques',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Integrates products of functions by transferring differentiation onto u.',
    explanation: 'Direct integral counterpart of the product rule: ∫ d(uv) = uv = ∫ u dv + ∫ v du.',
    relatedModule: { id: 'integrals', name: 'Integrals', num: 20 }
  },
  {
    id: 'area-under-curve',
    name: 'Area Under Curve',
    formula: 'A = ∫ₐᵇ f(x) dx = F(b) - F(a)',
    topic: 'Definite Integration',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Geometric area bounded by curve y = f(x), x-axis, and vertical lines x = a and x = b.',
    explanation: 'Evaluated by the Fundamental Theorem of Calculus where F(x) is the continuous antiderivative of f(x).',
    relatedModule: { id: 'applications-of-integrals', name: 'Applications of Integrals', num: 21 }
  },
  {
    id: 'first-order-linear-ode',
    name: '1st-Order Linear ODE Integrating Factor',
    formula: 'IF = e^(∫ P(x) dx),   Solution: y · IF = ∫ [Q(x) · IF] dx + C',
    topic: 'Differential Equations',
    category: 'Calculus',
    badgeClass: 'badge-calculus',
    description: 'Solves first-order linear differential equations dy/dx + P(x)·y = Q(x).',
    explanation: 'Multiplying through by IF transforms the left-hand side into the exact derivative d/dx [y · IF], enabling direct integration.',
    relatedModule: { id: 'differential-equations', name: 'Differential Equations', num: 22 }
  },

  // ==========================================
  // 5. STATISTICS
  // ==========================================
  {
    id: 'stat-mean',
    name: 'Arithmetic Mean (Average)',
    formula: 'μ = (∑ xᵢ) / N   or   x̄ = (∑ fᵢ·xᵢ) / (∑ fᵢ)',
    topic: 'Measures of Central Tendency',
    category: 'Statistics',
    badgeClass: 'badge-stats',
    description: 'Calculates the center of mass of discrete or frequency data observations.',
    explanation: 'The point about which the sum of algebraic deviations is identically zero: ∑ (xᵢ - μ) = 0.',
    relatedModule: { id: 'statistics', name: 'Statistics', num: 13 }
  },
  {
    id: 'stat-variance',
    name: 'Population Variance (σ²)',
    formula: 'σ² = [∑ (xᵢ - μ)²] / N = [∑ xᵢ² / N] - μ²',
    topic: 'Measures of Dispersion',
    category: 'Statistics',
    badgeClass: 'badge-stats',
    description: 'Quantifies the mean squared deviation of data points from their arithmetic average.',
    explanation: 'A fundamental measure of dispersion: always non-negative. Squaring prevents positive and negative deviations from cancelling each other out.',
    relatedModule: { id: 'statistics', name: 'Statistics', num: 13 }
  },
  {
    id: 'stat-std-dev',
    name: 'Standard Deviation (σ)',
    formula: 'σ = √[∑ (xᵢ - μ)² / N]',
    topic: 'Measures of Dispersion',
    category: 'Statistics',
    badgeClass: 'badge-stats',
    description: 'Square root of variance, expressing data spread in native physical measurement units.',
    explanation: 'Under normal distribution, approximately 68.2% of data points fall within μ ± 1σ, and 95.4% fall within μ ± 2σ.',
    relatedModule: { id: 'statistics', name: 'Statistics', num: 13 }
  },
  {
    id: 'stat-coeff-variation',
    name: 'Coefficient of Variation (CV)',
    formula: 'CV = (σ / |μ|) × 100%',
    topic: 'Relative Dispersion',
    category: 'Statistics',
    badgeClass: 'badge-stats',
    description: 'Dimensionless percentage ratio measuring relative consistency between differing datasets.',
    explanation: 'A dataset with a lower CV is considered more consistent, stable, or homogeneous than one with a higher CV.',
    relatedModule: { id: 'statistics', name: 'Statistics', num: 13 }
  },

  // ==========================================
  // 6. PROBABILITY
  // ==========================================
  {
    id: 'prob-addition-rule',
    name: 'Addition Rule of Probability',
    formula: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
    topic: 'Event Algebra',
    category: 'Probability',
    badgeClass: 'badge-stats',
    description: 'Probability that event A, event B, or both occur in a random experiment.',
    explanation: 'If events A and B are mutually exclusive (disjoint), P(A ∩ B) = 0, reducing the identity to P(A ∪ B) = P(A) + P(B).',
    relatedModule: { id: 'probability', name: 'Probability', num: 14 }
  },
  {
    id: 'prob-conditional',
    name: 'Conditional Probability',
    formula: 'P(A | B) = P(A ∩ B) / P(B),   where P(B) > 0',
    topic: 'Conditional Probability',
    category: 'Probability',
    badgeClass: 'badge-stats',
    description: 'Probability of event A occurring given that event B has already occurred.',
    explanation: 'Restricts the sample space Ω exclusively to outcomes in event B, measuring the fraction of B occupied by A ∩ B.',
    relatedModule: { id: 'probability', name: 'Probability', num: 14 }
  },
  {
    id: 'prob-bayes-theorem',
    name: 'Bayes’ Theorem',
    formula: 'P(Eᵢ | A) = [P(A | Eᵢ) · P(Eᵢ)] / [∑ⱼ P(A | Eⱼ) · P(Eⱼ)]',
    topic: 'Bayesian Inference',
    category: 'Probability',
    badgeClass: 'badge-stats',
    description: 'Calculates posterior probability of hypothesis Eᵢ given observed event evidence A.',
    explanation: 'Combines prior belief P(Eᵢ) with likelihood P(A | Eᵢ) normalized by the Law of Total Probability to form the updated posterior belief.',
    relatedModule: { id: 'probability', name: 'Probability', num: 14 }
  },
  {
    id: 'prob-independence',
    name: 'Independence Condition',
    formula: 'P(A ∩ B) = P(A) · P(B)   ⟺   P(A | B) = P(A)',
    topic: 'Independent Events',
    category: 'Probability',
    badgeClass: 'badge-stats',
    description: 'Mathematical test for statistical independence between two events.',
    explanation: 'Events are independent if the occurrence of one provides zero information about the likelihood of the other.',
    relatedModule: { id: 'probability', name: 'Probability', num: 14 }
  },

  // ==========================================
  // 7. MATRICES
  // ==========================================
  {
    id: 'matrix-multiplication',
    name: 'Matrix Product Definition',
    formula: 'C₍ᵢ, ⱼ₎ = ∑ₖ [A₍ᵢ, ₖ₎ · B₍ₖ, ⱼ₎]   for (m×k) · (k×n)',
    topic: 'Matrix Algebra',
    category: 'Matrices',
    badgeClass: 'badge-linear',
    description: 'Multiplication of matrix A by matrix B requires columns(A) = rows(B).',
    explanation: 'The entry in row i and column j is the dot product of the i-th row vector of A and the j-th column vector of B. Note that AB ≠ BA in general.',
    relatedModule: { id: 'matrices', name: 'Matrices', num: 16 }
  },
  {
    id: 'matrix-transpose-product',
    name: 'Transpose Product Reversal Rule',
    formula: '(A · B)ᵀ = Bᵀ · Aᵀ',
    topic: 'Matrix Transpose',
    category: 'Matrices',
    badgeClass: 'badge-linear',
    description: 'The transpose of a matrix product reverses the order of factors.',
    explanation: 'Reflects rows into columns across each matrix factor, requiring the reversal of indices for dimensional compatibility.',
    relatedModule: { id: 'matrices', name: 'Matrices', num: 16 }
  },
  {
    id: 'matrix-inverse-formula',
    name: 'Matrix Inverse via Adjoint',
    formula: 'A⁻¹ = (1 / |A|) · adj(A),   where |A| ≠ 0',
    topic: 'Invertibility',
    category: 'Matrices',
    badgeClass: 'badge-linear',
    description: 'Computes multiplicative inverse matrix such that A · A⁻¹ = A⁻¹ · A = I.',
    explanation: 'The adjoint adj(A) is the transpose of the cofactor matrix. An inverse exists if and only if matrix A is non-singular (|A| ≠ 0).',
    relatedModule: { id: 'matrices', name: 'Matrices', num: 16 }
  },

  // ==========================================
  // 8. DETERMINANTS
  // ==========================================
  {
    id: 'det-2x2-formula',
    name: '2×2 Matrix Determinant',
    formula: '|A| = det [a, b ; c, d] = a·d - b·c',
    topic: 'Determinants',
    category: 'Determinants',
    badgeClass: 'badge-linear',
    description: 'Scalar area scale factor of 2D linear transformation.',
    explanation: 'Represents the signed area of the parallelogram spanned by row vectors ⟨a, b⟩ and ⟨c, d⟩.',
    relatedModule: { id: 'determinants', name: 'Determinants', num: 17 }
  },
  {
    id: 'det-3x3-laplace',
    name: '3×3 Determinant Expansion',
    formula: '|A| = a₁(b₂c₃ - b₃c₂) - b₁(a₂c₃ - a₃c₂) + c₁(a₂b₃ - a₃b₂)',
    topic: 'Laplace Expansion',
    category: 'Determinants',
    badgeClass: 'badge-linear',
    description: 'Cofactor expansion along the first row of a 3×3 square matrix.',
    explanation: 'Represents the oriented volume of the parallelepiped spanned by the three row vectors in ℝ³.',
    relatedModule: { id: 'determinants', name: 'Determinants', num: 17 }
  },
  {
    id: 'det-multiplicative-prop',
    name: 'Determinant Product Property',
    formula: '|A · B| = |A| · |B|',
    topic: 'Determinant Properties',
    category: 'Determinants',
    badgeClass: 'badge-linear',
    description: 'The determinant of a matrix product equals the product of their individual determinants.',
    explanation: 'Composing transformations multiplies their volume scaling factors. Implies |A⁻¹| = 1 / |A|.',
    relatedModule: { id: 'determinants', name: 'Determinants', num: 17 }
  },
  {
    id: 'cramers-rule',
    name: 'Cramer’s Rule for Linear Systems',
    formula: 'xᵢ = |Aᵢ| / |A|,   where |A| ≠ 0',
    topic: 'Linear Systems',
    category: 'Determinants',
    badgeClass: 'badge-linear',
    description: 'Explicit closed-form solution for linear systems AX = B using determinants.',
    explanation: 'Matrix Aᵢ is formed by replacing the i-th column of coefficient matrix A with constant column vector B.',
    relatedModule: { id: 'determinants', name: 'Determinants', num: 17 }
  },

  // ==========================================
  // 9. VECTORS
  // ==========================================
  {
    id: 'vec-dot-product',
    name: 'Vector Dot Product (Scalar Product)',
    formula: 'u⃗ · v⃗ = uₓvₓ + uᵧvᵧ + u_z v_z = |u⃗||v⃗| cos(θ)',
    topic: 'Scalar Product',
    category: 'Vectors',
    badgeClass: 'badge-vectors',
    description: 'Measures directional alignment between two spatial vectors.',
    explanation: 'If u⃗ · v⃗ = 0 and both vectors are non-zero, the vectors are perpendicular (orthogonal, θ = 90°).',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },
  {
    id: 'vec-cross-product',
    name: 'Vector Cross Product',
    formula: 'u⃗ × v⃗ = ⟨uᵧv_z - u_z vᵧ,  u_z vₓ - uₓv_z,  uₓvᵧ - uᵧvₓ⟩',
    topic: 'Vector Product',
    category: 'Vectors',
    badgeClass: 'badge-vectors',
    description: 'Generates a 3D vector perpendicular to both u⃗ and v⃗ following the right-hand rule.',
    explanation: 'The magnitude |u⃗ × v⃗| = |u⃗||v⃗| sin(θ) equals the geometric area of the parallelogram spanned by u⃗ and v⃗.',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },
  {
    id: 'vec-scalar-triple-product',
    name: 'Scalar Triple Product (Box Product)',
    formula: '[u⃗, v⃗, w⃗] = u⃗ · (v⃗ × w⃗) = det [u ; v ; w]',
    topic: 'Triple Products',
    category: 'Vectors',
    badgeClass: 'badge-vectors',
    description: 'Calculates the volume of the parallelepiped formed by three coterminous vectors.',
    explanation: 'If [u⃗, v⃗, w⃗] = 0, the three vectors lie in the same geometric plane (coplanar).',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },
  {
    id: 'vec-projection-formula',
    name: 'Projection of u⃗ on v⃗',
    formula: 'proj_v(u⃗) = [(u⃗ · v⃗) / |v⃗|²] · v⃗   (Scalar magnitude: (u⃗ · v⃗) / |v⃗|)',
    topic: 'Projections',
    category: 'Vectors',
    badgeClass: 'badge-vectors',
    description: 'Shadow component of vector u⃗ cast along the direction of vector v⃗.',
    explanation: 'Decomposes u⃗ into parallel and orthogonal components relative to reference vector v⃗.',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },

  // ==========================================
  // 10. 3D GEOMETRY
  // ==========================================
  {
    id: 'distance-3d-formula',
    name: '3D Spatial Distance Formula',
    formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²]',
    topic: '3D Coordinates',
    category: '3D Geometry',
    badgeClass: 'badge-geometry',
    description: 'Euclidean distance between points P₁(x₁, y₁, z₁) and P₂(x₂, y₂, z₂) in ℝ³ space.',
    explanation: 'Extension of Pythagorean theorem to three orthogonal spatial dimensions Δx, Δy, and Δz.',
    relatedModule: { id: 'intro-3d-geometry', name: 'Introduction to 3D Geometry', num: 11 }
  },
  {
    id: 'direction-cosines-sum',
    name: 'Direction Cosines Identity',
    formula: 'l² + m² + n² = cos²(α) + cos²(β) + cos²(γ) = 1',
    topic: 'Direction Cosines',
    category: '3D Geometry',
    badgeClass: 'badge-geometry',
    description: 'Sums the squares of direction cosines of any line or ray in 3D space.',
    explanation: 'Directly follows from normalizing a position vector to unit length: |r̂|² = (x/r)² + (y/r)² + (z/r)² = 1.',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },
  {
    id: 'line-3d-vector-eq',
    name: 'Vector Equation of 3D Line',
    formula: 'r⃗ = a⃗ + λ · b⃗',
    topic: 'Lines in Space',
    category: '3D Geometry',
    badgeClass: 'badge-geometry',
    description: 'Vector form of a straight line passing through point a⃗ with direction vector b⃗.',
    explanation: 'λ ∈ ℝ is a scalar parameter. Varying λ sweeps across all position vectors r⃗ residing on the 3D line.',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },
  {
    id: 'skew-lines-distance',
    name: 'Shortest Distance Between Skew Lines',
    formula: 'd = |(a⃗₂ - a⃗₁) · (b⃗₁ × b⃗₂)| / |b⃗₁ × b⃗₂|',
    topic: 'Skew Lines in Space',
    category: '3D Geometry',
    badgeClass: 'badge-geometry',
    description: 'Shortest perpendicular separation between two non-intersecting, non-parallel 3D lines.',
    explanation: 'Projects the displacement vector (a⃗₂ - a⃗₁) onto the common unit normal vector n̂ = (b⃗₁ × b⃗₂) / |b⃗₁ × b⃗₂|.',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },
  {
    id: 'plane-normal-equation',
    name: 'Vector Equation of Plane',
    formula: 'r⃗ · n̂ = d   or   A·x + B·y + C·z + D = 0',
    topic: 'Planes in Space',
    category: '3D Geometry',
    badgeClass: 'badge-geometry',
    description: 'Standard equation of a flat 2D plane in ℝ³ space with normal vector n⃗ = ⟨A, B, C⟩.',
    explanation: 'Every displacement vector on the plane is orthogonal to the normal vector n⃗, giving (r⃗ - a⃗) · n⃗ = 0.',
    relatedModule: { id: 'vectors-3d-geometry', name: 'Vectors & 3D Geometry', num: 23 }
  },

  // ==========================================
  // 11. LINEAR PROGRAMMING
  // ==========================================
  {
    id: 'lpp-objective-function',
    name: 'Linear Objective Function',
    formula: 'Optimize Z = c₁·x₁ + c₂·x₂ + ... + cₙ·xₙ',
    topic: 'Linear Programming',
    category: 'Linear Programming',
    badgeClass: 'badge-vectors',
    description: 'Function to be maximized (e.g. profit) or minimized (e.g. cost) subject to constraints.',
    explanation: 'Linearity ensures isocost or isoprofit contours are hyperplanes, ensuring optimal values occur on boundaries of the convex feasible set.',
    relatedModule: { id: 'linear-programming', name: 'Linear Programming', num: 24 }
  },
  {
    id: 'lpp-corner-point-theorem',
    name: 'Corner Point Theorem (Extreme Point Method)',
    formula: 'Z* = max / min { Z(Vᵢ) | Vᵢ ∈ Vertices of Feasible Region }',
    topic: 'Optimization & Feasible Region',
    category: 'Linear Programming',
    badgeClass: 'badge-vectors',
    description: 'Optimal solution of an LPP always occurs at one of the vertices (corner points) of the feasible polygon.',
    explanation: 'Because the objective function is linear and the feasible region is convex, level curves first or last touch the feasible set at an extreme corner vertex.',
    relatedModule: { id: 'linear-programming', name: 'Linear Programming', num: 24 }
  }
];

/**
 * Favorites persistence helpers
 */
export function getFavoriteFormulaIds() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('og_favorite_formulas');
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not read favorite formulas:', e);
  }
  return [];
}

export function saveFavoriteFormulaIds(ids) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('og_favorite_formulas', JSON.stringify(ids));
    }
  } catch (e) {
    console.warn('Could not save favorite formulas:', e);
  }
}

export function toggleFavoriteFormula(id) {
  const current = getFavoriteFormulaIds();
  const set = new Set(current);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  const updated = Array.from(set);
  saveFavoriteFormulaIds(updated);
  return updated;
}

/**
 * Formula Library View Controller Component
 */
export class FormulaLibraryView {
  constructor(container) {
    this.container = container;
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.favoriteIds = new Set(getFavoriteFormulaIds());
    this.expandedExplanationIds = new Set();
  }

  mount() {
    this.render();
    this.attachEventListeners();
  }

  destroy() {
    // cleanup
  }

  render() {
    const totalCount = FORMULA_DATABASE.length;
    const favCount = this.favoriteIds.size;
    const filtered = this.getFilteredFormulas();

    this.container.innerHTML = `
      <div class="view-animate-in formula-library-container">
        <!-- Header Hero -->
        <div class="glass-surface" style="padding: 28px 32px; border-radius: var(--radius-xl); margin-bottom: 24px; position: relative; overflow: hidden;">
          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <span class="badge" style="background: rgba(0, 242, 254, 0.15); color: var(--cyan-primary); border-color: rgba(0, 242, 254, 0.3);">
              Formula & Theorem Database
            </span>
            <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-secondary);">
              11 Core Categories
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 760px;">
              <h1 style="font-size: clamp(2rem, 3.2vw, 2.8rem); font-weight: 800; color: var(--text-white); margin: 0 0 8px 0; letter-spacing: -0.02em;">
                Formula & Theorem Library
              </h1>
              <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                Search, inspect, and copy verified mathematical identities, definitions, and theorems across all mathematical branches.
              </p>
            </div>
            <div class="module-icon-badge" style="width: 68px; height: 68px; font-size: 2rem;">
              ∑
            </div>
          </div>

          <!-- Search Input -->
          <div style="margin-top: 24px;">
            <div class="formula-search-bar-wrap">
              <span class="formula-search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                id="formula-search-input"
                class="formula-search-input"
                placeholder="Search formulas by name, equation, topic, or keyword..."
                value="${this.searchQuery}"
                autocomplete="off"
              />
              ${this.searchQuery ? `
                <button id="btn-clear-search" class="formula-search-clear-btn" aria-label="Clear search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Categories Filter Bar -->
        <div class="formula-categories-bar" role="tablist">
          ${FORMULA_CATEGORIES.map(cat => {
            const isFav = cat === 'Favorites';
            const isActive = this.activeCategory === cat;
            const count = isFav ? favCount : cat === 'All' ? totalCount : FORMULA_DATABASE.filter(f => f.category === cat).length;
            return `
              <button
                class="formula-category-chip ${isFav ? 'chip-fav' : ''} ${isActive ? 'active' : ''}"
                data-category="${cat}"
                role="tab"
                aria-selected="${isActive}"
              >
                ${isFav ? '★ Favorites' : cat}
                <span class="chip-counter">${count}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Result Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div style="font-size: 0.92rem; color: var(--text-secondary);">
            Showing <b style="color: var(--text-white);">${filtered.length}</b> ${filtered.length === 1 ? 'formula' : 'formulas'}
            ${this.searchQuery ? ` matching "<span style="color: var(--cyan-primary);">${this.searchQuery}</span>"` : ''}
            ${this.activeCategory !== 'All' ? ` in <span style="color: var(--cyan-primary);">${this.activeCategory}</span>` : ''}
          </div>
        </div>

        <!-- Formula Cards Grid -->
        <div id="formulas-grid-container">
          ${this.renderFormulasGrid(filtered)}
        </div>
      </div>
    `;
  }

  getFilteredFormulas() {
    let list = FORMULA_DATABASE;

    // Filter by Category or Favorites
    if (this.activeCategory === 'Favorites') {
      list = list.filter(f => this.favoriteIds.has(f.id));
    } else if (this.activeCategory !== 'All') {
      list = list.filter(f => f.category === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q) ||
        f.relatedModule.name.toLowerCase().includes(q)
      );
    }

    return list;
  }

  renderFormulasGrid(formulas) {
    if (formulas.length === 0) {
      if (this.activeCategory === 'Favorites') {
        return `
          <div class="formulas-empty-state">
            <div style="font-size: 2.8rem; color: #fbbf24; margin-bottom: 12px;">★</div>
            <h3 style="color: var(--text-white); font-size: 1.3rem; margin: 0 0 6px 0;">No Favorite Formulas Yet</h3>
            <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto; font-size: 0.95rem;">
              Click the star icon (★) on any formula card to bookmark it here for rapid recall and quick access.
            </p>
          </div>
        `;
      }
      return `
        <div class="formulas-empty-state">
          <div style="font-size: 2.8rem; color: var(--text-muted); margin-bottom: 12px;">🔍</div>
          <h3 style="color: var(--text-white); font-size: 1.3rem; margin: 0 0 6px 0;">No Formulas Found</h3>
          <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto; font-size: 0.95rem;">
            No mathematical formulas match your filter criteria. Try searching for different keywords or select "All Categories".
          </p>
        </div>
      `;
    }

    return `
      <div class="formulas-grid">
        ${formulas.map(f => {
          const isFav = this.favoriteIds.has(f.id);
          const isExpanded = this.expandedExplanationIds.has(f.id);

          return `
            <div class="formula-item-card" data-formula-id="${f.id}">
              <!-- Header -->
              <div>
                <div class="formula-card-header">
                  <div class="formula-card-badges">
                    <span class="badge ${f.badgeClass}">${f.category}</span>
                    <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-secondary);">
                      ${f.topic}
                    </span>
                  </div>
                  <div class="formula-card-actions">
                    <button
                      class="btn-fav-formula ${isFav ? 'active' : ''}"
                      data-toggle-fav="${f.id}"
                      title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                      aria-label="Favorite formula"
                    >
                      ${isFav ? '★' : '☆'}
                    </button>
                    <button
                      class="formula-copy-btn"
                      data-copy-formula="${f.formula}"
                      title="Copy formula text"
                      aria-label="Copy formula"
                    >
                      ${SVG_ICONS.copy} Copy
                    </button>
                  </div>
                </div>

                <h3 class="formula-title">${f.name}</h3>

                <!-- Math Box -->
                <div class="formula-math-box">${f.formula}</div>

                <p class="formula-description">${f.description}</p>

                <!-- Explanation Toggle -->
                <button class="formula-explanation-toggle" data-toggle-exp="${f.id}">
                  <span>${isExpanded ? 'Hide Explanation ▴' : 'Show Mathematical Explanation ▾'}</span>
                </button>

                ${isExpanded ? `
                  <div class="formula-explanation-drawer">
                    <div style="font-weight: 700; color: var(--cyan-primary); margin-bottom: 4px;">
                      Conceptual Insight & Derivation:
                    </div>
                    ${f.explanation}
                  </div>
                ` : ''}
              </div>

              <!-- Footer with Module Deep Link -->
              <div class="formula-card-footer">
                <span style="font-size: 0.78rem; color: var(--text-muted);">Related Module:</span>
                <a href="#/modules/${f.relatedModule.id}" class="formula-module-link">
                  <span>#${String(f.relatedModule.num).padStart(2, '0')}: ${f.relatedModule.name}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    // Search input
    this.container.addEventListener('input', (e) => {
      if (e.target.id === 'formula-search-input') {
        this.searchQuery = e.target.value;
        this.updateGridOnly();
      }
    });

    // Delegated clicks
    this.container.addEventListener('click', (e) => {
      // Clear search
      if (e.target.closest('#btn-clear-search')) {
        this.searchQuery = '';
        const input = document.getElementById('formula-search-input');
        if (input) input.value = '';
        this.updateGridOnly();
        return;
      }

      // Category chip click
      const catChip = e.target.closest('.formula-category-chip');
      if (catChip) {
        const cat = catChip.getAttribute('data-category');
        if (cat && cat !== this.activeCategory) {
          this.activeCategory = cat;
          this.render();
          this.attachEventListeners();
        }
        return;
      }

      // Favorite toggle
      const favBtn = e.target.closest('[data-toggle-fav]');
      if (favBtn) {
        const id = favBtn.getAttribute('data-toggle-fav');
        if (id) {
          const updated = toggleFavoriteFormula(id);
          this.favoriteIds = new Set(updated);
          showToast(this.favoriteIds.has(id) ? 'Saved to Favorites ★' : 'Removed from Favorites', 'info');
          this.render();
          this.attachEventListeners();
        }
        return;
      }

      // Copy formula
      const copyBtn = e.target.closest('[data-copy-formula]');
      if (copyBtn) {
        const expr = copyBtn.getAttribute('data-copy-formula');
        if (expr) {
          copyToClipboard(expr, 'Formula copied to clipboard!');
        }
        return;
      }

      // Explanation toggle
      const expBtn = e.target.closest('[data-toggle-exp]');
      if (expBtn) {
        const id = expBtn.getAttribute('data-toggle-exp');
        if (id) {
          if (this.expandedExplanationIds.has(id)) {
            this.expandedExplanationIds.delete(id);
          } else {
            this.expandedExplanationIds.add(id);
          }
          this.updateGridOnly();
        }
        return;
      }
    });
  }

  updateGridOnly() {
    const gridContainer = document.getElementById('formulas-grid-container');
    if (gridContainer) {
      const filtered = this.getFilteredFormulas();
      gridContainer.innerHTML = this.renderFormulasGrid(filtered);
    }
  }
}
