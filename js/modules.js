/**
 * OG - Mathematics Modules Registry & Renderer
 * ES6 Module
 */

export const MODULE_CATEGORIES = [
  { id: 'all', label: 'All Modules' },
  { id: 'algebra', label: 'Algebra' },
  { id: 'coordinate-geometry', label: 'Coordinate Geometry' },
  { id: 'calculus', label: 'Calculus' },
  { id: 'statistics-probability', label: 'Statistics & Probability' },
  { id: 'linear-algebra', label: 'Linear Algebra' },
  { id: 'vectors-optimization', label: 'Vectors & Optimization' }
];

export const MATHEMATICS_MODULES = [
  // 1. Sets
  {
    id: 'sets',
    num: 1,
    name: 'Sets',
    category: 'algebra',
    categoryLabel: 'Algebra',
    badgeClass: 'badge-algebra',
    icon: '∅',
    description: 'Representation of sets, subsets, power sets, Venn diagrams, union, intersection and complements.',
    topics: ['Types of Sets (Empty, Finite, Infinite)', 'Subsets & Power Sets', 'Venn Diagrams & Set Operations', 'De Morgan’s Laws'],
    keyFormulas: [
      { name: 'Cardinality of Union', formula: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B)' },
      { name: 'De Morgan’s Law', formula: '(A ∪ B)′ = A′ ∩ B′' }
    ]
  },
  // 2. Relations & Functions
  {
    id: 'relations-functions',
    num: 2,
    name: 'Relations & Functions',
    category: 'algebra',
    categoryLabel: 'Algebra',
    badgeClass: 'badge-algebra',
    icon: 'f(x)',
    description: 'Cartesian products, domain, range, codomain, injective, surjective, and bijective mappings.',
    topics: ['Cartesian Product of Sets', 'Equivalence Relations', 'One-to-One and Onto Functions', 'Composition of Functions'],
    keyFormulas: [
      { name: 'Function Composition', formula: '(g ∘ f)(x) = g(f(x))' },
      { name: 'Invertible Condition', formula: 'f ∘ f⁻¹ = f⁻¹ ∘ f = I' }
    ]
  },
  // 3. Trigonometric Functions
  {
    id: 'trigonometric-functions',
    num: 3,
    name: 'Trigonometric Functions',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: 'sin θ',
    description: 'Angles in radians, trigonometric identities, compound angles, periodic graphs, and general solutions.',
    topics: ['Radian & Degree Measure', 'Pythagorean & Compound Angle Identities', 'Multiple & Sub-multiple Angles', 'Trigonometric Equations'],
    keyFormulas: [
      { name: 'Fundamental Identity', formula: 'sin²(x) + cos²(x) = 1' },
      { name: 'Double Angle Identity', formula: 'sin(2x) = 2 sin(x) cos(x)' }
    ]
  },
  // 4. Complex Numbers and Quadratic Equations
  {
    id: 'complex-numbers',
    num: 4,
    name: 'Complex Numbers and Quadratic Equations',
    category: 'algebra',
    categoryLabel: 'Algebra',
    badgeClass: 'badge-algebra',
    icon: 'a+bi',
    description: 'Algebraic properties of complex numbers, Argand plane, polar form, modulus, and quadratic roots.',
    topics: ['Imaginary Unit (i² = -1)', 'Modulus & Conjugate', 'Polar & Euler Representation', 'Quadratic Roots in Complex Field'],
    keyFormulas: [
      { name: 'Modulus of Complex Number', formula: '|z| = √(a² + b²)' },
      { name: 'Euler Formula', formula: 'e^(iθ) = cos(θ) + i sin(θ)' }
    ]
  },
  // 5. Linear Inequalities
  {
    id: 'linear-inequalities',
    num: 5,
    name: 'Linear Inequalities',
    category: 'algebra',
    categoryLabel: 'Algebra',
    badgeClass: 'badge-algebra',
    icon: 'ax ≤ b',
    description: 'Algebraic solutions of linear inequalities in one variable and graphical representation on the Cartesian plane.',
    topics: ['Properties of Inequalities', 'One-Variable Solution Sets', 'Two-Variable Half Planes', 'Systems of Inequalities'],
    keyFormulas: [
      { name: 'Reversal Rule', formula: 'If a < b and c < 0, then ac > bc' },
      { name: 'Modulus Inequality', formula: '|x| ≤ a ⟺ -a ≤ x ≤ a' }
    ]
  },
  // 6. Permutations and Combinations
  {
    id: 'permutations-combinations',
    num: 6,
    name: 'Permutations and Combinations',
    category: 'algebra',
    categoryLabel: 'Algebra',
    badgeClass: 'badge-algebra',
    icon: 'ⁿCᵣ',
    description: 'Fundamental principles of counting, factorial notation, permutations of distinct and repeated objects, combinations.',
    topics: ['Multiplication & Addition Principle', 'Permutations: Arrangement P(n, r)', 'Combinations: Selection C(n, r)', 'Circular Permutations'],
    keyFormulas: [
      { name: 'Permutation', formula: 'P(n, r) = n! / (n - r)!' },
      { name: 'Combination', formula: 'C(n, r) = n! / [r!(n - r)!]' }
    ]
  },
  // 7. Binomial Theorem
  {
    id: 'binomial-theorem',
    num: 7,
    name: 'Binomial Theorem',
    category: 'algebra',
    categoryLabel: 'Algebra',
    badgeClass: 'badge-algebra',
    icon: '(x+a)ⁿ',
    description: 'Statement and expansion of binomial theorem for positive integral indices, general and middle terms.',
    topics: ['Pascal’s Triangle Expansion', 'General Term Formula (Tᵣ₊₁)', 'Middle Term Determinations', 'Approximations with Binomials'],
    keyFormulas: [
      { name: 'Binomial Expansion', formula: '(a + b)ⁿ = ∑ [C(n, k) · aⁿ⁻ᵏ · bᵏ]' },
      { name: 'General Term', formula: 'Tᵣ₊₁ = C(n, r) · aⁿ⁻ʳ · bʳ' }
    ]
  },
  // 8. Sequence and Series
  {
    id: 'sequence-series',
    num: 8,
    name: 'Sequence and Series',
    category: 'algebra',
    categoryLabel: 'Algebra',
    badgeClass: 'badge-algebra',
    icon: '∑aₙ',
    description: 'Arithmetic progressions (AP), Geometric progressions (GP), arithmetic and geometric means, infinite series.',
    topics: ['AP nth Term & Sum', 'GP nth Term & Infinite Sum', 'Arithmetic & Geometric Mean (AM ≥ GM)', 'Special Sums (∑n, ∑n²)'],
    keyFormulas: [
      { name: 'Sum of AP', formula: 'Sₙ = (n / 2) · [2a + (n - 1)d]' },
      { name: 'Infinite GP Sum', formula: 'S_∞ = a / (1 - r), (|r| < 1)' }
    ]
  },
  // 9. Straight Lines
  {
    id: 'straight-lines',
    num: 9,
    name: 'Straight Lines',
    category: 'coordinate-geometry',
    categoryLabel: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    icon: 'y=mx+c',
    description: 'Slope of a line, various forms of line equations, angle between lines, distance of a point from a line.',
    topics: ['Slope & Collinearity', 'Point-Slope & Intercept Forms', 'Normal & General Form', 'Perpendicular Distance'],
    keyFormulas: [
      { name: 'Slope-Intercept Form', formula: 'y = m·x + c' },
      { name: 'Distance to Line', formula: 'd = |Ax₁ + By₁ + C| / √(A² + B²)' }
    ]
  },
  // 10. Conic Sections
  {
    id: 'conic-sections',
    num: 10,
    name: 'Conic Sections',
    category: 'coordinate-geometry',
    categoryLabel: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    icon: 'x²/a²',
    description: 'Sections of a cone: standard equations of circles, parabolas, ellipses, and hyperbolas with eccentricities.',
    topics: ['Circle: Standard & General Equation', 'Parabola: Directrix, Focus & Latus Rectum', 'Ellipse: Major & Minor Axes', 'Hyperbola: Asymptotes & Eccentricity'],
    keyFormulas: [
      { name: 'Standard Ellipse', formula: 'x² / a² + y² / b² = 1' },
      { name: 'Standard Hyperbola', formula: 'x² / a² - y² / b² = 1' }
    ]
  },
  // 11. Introduction to Three-dimensional Geometry
  {
    id: 'intro-3d-geometry',
    num: 11,
    name: 'Introduction to Three-dimensional Geometry',
    category: 'coordinate-geometry',
    categoryLabel: 'Coordinate Geometry',
    badgeClass: 'badge-geometry',
    icon: 'ℝ³',
    description: 'Coordinate axes and coordinate planes in three dimensions, coordinates of points, distance formula, section formula.',
    topics: ['Octants and Coordinates in Space', '3D Distance Formula', 'Section Formula (Internal/External)', 'Centroid of a Tetrahedron'],
    keyFormulas: [
      { name: '3D Distance', formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²]' },
      { name: 'Section Formula', formula: 'P = ((m·x₂ + n·x₁) / (m + n), ...)' }
    ]
  },
  // 12. Limits and Derivatives
  {
    id: 'limits-derivatives',
    num: 12,
    name: 'Limits and Derivatives',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: 'lim',
    description: 'Intuitive idea of limit, standard limits of polynomials and trigonometry, first principles derivative.',
    topics: ['Left-Hand & Right-Hand Limits', 'Squeeze Theorem & Standard Limits', 'Derivative as Rate of Change', 'First Principles Differentiation'],
    keyFormulas: [
      { name: 'First Principle Derivative', formula: "f'(x) = lim(h→0) [f(x + h) - f(x)] / h" },
      { name: 'Standard Trig Limit', formula: 'lim(x→0) sin(x) / x = 1' }
    ]
  },
  // 13. Statistics
  {
    id: 'statistics',
    num: 13,
    name: 'Statistics',
    category: 'statistics-probability',
    categoryLabel: 'Statistics & Probability',
    badgeClass: 'badge-stats',
    icon: 'σ²',
    description: 'Measures of dispersion: range, mean deviation, variance and standard deviation of ungrouped/grouped data.',
    topics: ['Mean Deviation from Median & Mean', 'Variance & Standard Deviation', 'Coefficient of Variation', 'Frequency Distribution Analysis'],
    keyFormulas: [
      { name: 'Standard Deviation', formula: 'σ = √[∑(xᵢ - μ)² / N]' },
      { name: 'Variance', formula: 'Var(X) = E[X²] - (E[X])²' }
    ]
  },
  // 14. Probability
  {
    id: 'probability',
    num: 14,
    name: 'Probability',
    category: 'statistics-probability',
    categoryLabel: 'Statistics & Probability',
    badgeClass: 'badge-stats',
    icon: 'P(E)',
    description: 'Random experiments, outcomes, event algebra, axiomatic probability, conditional probability and Bayes’ Theorem.',
    topics: ['Axiomatic Approach to Probability', 'Conditional Probability P(A|B)', 'Multiplication Rule & Independence', 'Bayes’ Theorem'],
    keyFormulas: [
      { name: 'Conditional Probability', formula: 'P(A | B) = P(A ∩ B) / P(B)' },
      { name: 'Bayes’ Rule', formula: 'P(Aᵢ|B) = [P(B|Aᵢ)P(Aᵢ)] / ∑[P(B|Aⱼ)P(Aⱼ)]' }
    ]
  },
  // 15. Inverse Trigonometric Functions
  {
    id: 'inverse-trigonometric-functions',
    num: 15,
    name: 'Inverse Trigonometric Functions',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: 'sin⁻¹',
    description: 'Definition, range, domain, principal value branches, graphs of inverse trigonometric functions, and algebraic identities.',
    topics: ['Principal Value Branches', 'Domain & Range Restrictions', 'Addition & Subtraction of Inverse Functions', 'Transformation Identities'],
    keyFormulas: [
      { name: 'Principal Complement', formula: 'sin⁻¹(x) + cos⁻¹(x) = π / 2' },
      { name: 'Tangent Addition', formula: 'tan⁻¹(x) + tan⁻¹(y) = tan⁻¹[(x + y) / (1 - xy)]' }
    ]
  },
  // 16. Matrices
  {
    id: 'matrices',
    num: 16,
    name: 'Matrices',
    category: 'linear-algebra',
    categoryLabel: 'Linear Algebra',
    badgeClass: 'badge-linear',
    icon: '[A]',
    description: 'Matrix concept, notation, order, equality, operations (addition, multiplication), transpose, symmetric and invertible matrices.',
    topics: ['Matrix Dimensions & Types', 'Matrix Multiplication & Transpose', 'Symmetric & Skew-Symmetric Matrices', 'Elementary Row Operations & Inverse'],
    keyFormulas: [
      { name: 'Transpose Property', formula: '(AB)ᵀ = Bᵀ Aᵀ' },
      { name: 'Inverse Condition', formula: 'A · A⁻¹ = A⁻¹ · A = I' }
    ]
  },
  // 17. Determinants
  {
    id: 'determinants',
    num: 17,
    name: 'Determinants',
    category: 'linear-algebra',
    categoryLabel: 'Linear Algebra',
    badgeClass: 'badge-linear',
    icon: '|A|',
    description: 'Determinant of square matrices up to 3×3, properties, minors, cofactors, adjoint, and solving linear systems via Cramer’s rule.',
    topics: ['Minors and Cofactors', 'Properties of Determinants', 'Adjoint & Inverse Calculation', 'Matrix Method for Linear Systems'],
    keyFormulas: [
      { name: 'Matrix Inverse by Adjoint', formula: 'A⁻¹ = (1 / |A|) · adj(A)' },
      { name: 'Determinant Product', formula: '|AB| = |A| · |B|' }
    ]
  },
  // 18. Continuity and Differentiability
  {
    id: 'continuity-differentiability',
    num: 18,
    name: 'Continuity and Differentiability',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: 'dy/dx',
    description: 'Continuity, differentiability, chain rule, derivative of implicit functions, exponential and logarithmic differentiation, Rolle’s Theorem.',
    topics: ['Continuity at a Point & Interval', 'Chain Rule & Implicit Differentiation', 'Logarithmic Differentiation', 'Mean Value Theorem'],
    keyFormulas: [
      { name: 'Chain Rule', formula: 'd/dx [f(g(x))] = f\'(g(x)) · g\'(x)' },
      { name: 'Mean Value Theorem', formula: "f'(c) = [f(b) - f(a)] / (b - a)" }
    ]
  },
  // 19. Applications of Derivatives
  {
    id: 'applications-of-derivatives',
    num: 19,
    name: 'Applications of Derivatives',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: '∇f',
    description: 'Rate of change of quantities, increasing and decreasing functions, tangents and normals, maxima and minima.',
    topics: ['Rate Measures', 'Strictly Increasing/Decreasing Criteria', 'First & Second Derivative Tests', 'Optimization Problems'],
    keyFormulas: [
      { name: 'Slope of Tangent', formula: "m = dy/dx |₍ₓ₀, ᵧ₀₎" },
      { name: 'Second Derivative Test', formula: "f''(c) < 0 ⟹ Local Maximum" }
    ]
  },
  // 20. Integrals
  {
    id: 'integrals',
    num: 20,
    name: 'Integrals',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: '∫dx',
    description: 'Integration as inverse process of differentiation, substitution, partial fractions, integration by parts, fundamental theorem of calculus.',
    topics: ['Standard Indefinite Integrals', 'Integration by Substitution & Parts', 'Partial Fraction Decompositions', 'Fundamental Theorem of Calculus'],
    keyFormulas: [
      { name: 'Integration by Parts', formula: '∫ u·v dx = u∫v dx - ∫ [u\'(∫v dx)] dx' },
      { name: 'Definite Integral Evaluation', formula: '∫ₐᵇ f(x) dx = F(b) - F(a)' }
    ]
  },
  // 21. Applications of Integrals
  {
    id: 'applications-of-integrals',
    num: 21,
    name: 'Applications of Integrals',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: '∬dA',
    description: 'Applications in finding area under simple curves, especially lines, parabolas, area of circles/ellipses.',
    topics: ['Area Under a Curve y = f(x)', 'Area Between Two Curves', 'Symmetric Region Integration', 'Volumes of Revolution (Preview)'],
    keyFormulas: [
      { name: 'Area Between Curves', formula: 'A = ∫ₐᵇ [f(x) - g(x)] dx' },
      { name: 'Area along Y-axis', formula: 'A = ∫_c^d x dy' }
    ]
  },
  // 22. Differential Equations
  {
    id: 'differential-equations',
    num: 22,
    name: 'Differential Equations',
    category: 'calculus',
    categoryLabel: 'Calculus',
    badgeClass: 'badge-calculus',
    icon: "y'+Py=Q",
    description: 'Order and degree, general and particular solutions, variable separable method, homogeneous, linear first-order differential equations.',
    topics: ['Order and Degree Classification', 'Separation of Variables', 'Homogeneous Differential Equations', 'Integrating Factor for Linear ODEs'],
    keyFormulas: [
      { name: 'Integrating Factor', formula: 'IF = e^(∫ P dx)' },
      { name: 'First Order Linear Solution', formula: 'y · IF = ∫ (Q · IF) dx + C' }
    ]
  },
  // 23. Vectors and Three-Dimensional Geometry
  {
    id: 'vectors-3d-geometry',
    num: 23,
    name: 'Vectors and Three-Dimensional Geometry',
    category: 'vectors-optimization',
    categoryLabel: 'Vectors & Optimization',
    badgeClass: 'badge-vectors',
    icon: 'u⃗ × v⃗',
    description: 'Vectors and scalars, magnitude and direction, direction cosines, dot and cross product, lines and planes in 3D space.',
    topics: ['Dot & Cross Products', 'Scalar Triple Product', 'Vector Equations of Lines and Planes', 'Shortest Distance Between Skew Lines'],
    keyFormulas: [
      { name: 'Dot Product', formula: 'u⃗ · v⃗ = |u⃗||v⃗| cos(θ)' },
      { name: 'Cross Product Magnitude', formula: '|u⃗ × v⃗| = |u⃗||v⃗| sin(θ)' }
    ]
  },
  // 24. Linear Programming
  {
    id: 'linear-programming',
    num: 24,
    name: 'Linear Programming',
    category: 'vectors-optimization',
    categoryLabel: 'Vectors & Optimization',
    badgeClass: 'badge-vectors',
    icon: 'max Z',
    description: 'Introduction, related terminology such as constraints, objective function, optimization, graphical method of solution.',
    topics: ['Objective Function (Z = ax + by)', 'Constraints & Non-negative Restrictions', 'Feasible Region & Corner Point Method', 'Bounded vs Unbounded Solutions'],
    keyFormulas: [
      { name: 'Objective Function', formula: 'Optimize Z = c₁x₁ + c₂x₂' },
      { name: 'Linear Constraint', formula: 'a₁x₁ + a₂x₂ ≤ b' }
    ]
  }
];

/**
 * Render single module card HTML
 */
export function renderModuleCard(mod) {
  const formattedNum = String(mod.num).padStart(2, '0');
  return `
    <div class="module-card" data-module-id="${mod.id}" data-category="${mod.category}">
      <div class="module-card-header">
        <span class="module-number-pill">#${formattedNum}</span>
        <div class="module-icon-badge">${mod.icon}</div>
      </div>
      <div class="module-card-body">
        <span class="badge ${mod.badgeClass}" style="align-self: flex-start; margin-bottom: 4px;">${mod.categoryLabel}</span>
        <h3 class="module-card-title">${mod.name}</h3>
        <p class="module-card-description">${mod.description}</p>
      </div>
      <div class="module-card-footer">
        <a href="#/modules/${mod.id}" class="module-open-btn" aria-label="Open Module ${mod.name}">
          <span>Open Module</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  `;
}
