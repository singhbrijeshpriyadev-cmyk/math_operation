/**
 * OG - Practice Question Bank
 * Curated mathematical problem sets across all 4 question types & 3 difficulties:
 * - Types: MCQ, Numerical, Expression, True/False
 * - Difficulties: Easy, Medium, Hard
 * - Topics: Algebra, Trigonometry, Coordinate Geometry, Calculus, Statistics,
 *           Probability, Matrices & Determinants, Vectors & 3D, Linear Programming
 * ES6 Module
 */

export const PRACTICE_TOPICS = [
  'All Topics',
  'Algebra',
  'Trigonometry',
  'Coordinate Geometry',
  'Calculus',
  'Statistics & Probability',
  'Matrices & Determinants',
  'Vectors & 3D Geometry',
  'Linear Programming'
];

export const QUESTION_BANK = [
  // ==========================================
  // ALGEBRA
  // ==========================================
  {
    id: 'alg-01',
    topic: 'Algebra',
    subtopic: 'Set Theory',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Given set A = {1, 2, 3, 4, 5} and set B = {3, 4, 5, 6, 7}. What is the cardinality |A ∩ B|?',
    correctAnswer: 3,
    acceptableAnswers: ['3'],
    explanation: 'The intersection A ∩ B contains only the elements present in both sets.',
    solutionSteps: [
      '1. Identify elements common to both A and B: {3, 4, 5}.',
      '2. Count the common elements: 3 elements.',
      '3. Therefore, |A ∩ B| = 3.'
    ]
  },
  {
    id: 'alg-02',
    topic: 'Algebra',
    subtopic: 'Combinatorics',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Evaluate the permutation P(5, 2).',
    correctAnswer: 20,
    acceptableAnswers: ['20'],
    explanation: 'The number of permutations of n objects taken r at a time is given by n! / (n - r)!',
    solutionSteps: [
      '1. Formula: P(n, r) = n! / (n - r)!',
      '2. Substitute n = 5, r = 2: P(5, 2) = 5! / (5 - 2)! = 5! / 3!',
      '3. Calculation: 5 × 4 = 20.'
    ]
  },
  {
    id: 'alg-03',
    topic: 'Algebra',
    subtopic: 'Binomial Theorem',
    difficulty: 'medium',
    type: 'mcq',
    prompt: 'What is the coefficient of x³ in the expansion of (1 + 2x)⁵?',
    options: ['40', '80', '10', '32'],
    correctAnswer: 1, // '80'
    explanation: 'The general term is Tᵣ₊₁ = C(n, r) · aⁿ⁻ʳ · bʳ.',
    solutionSteps: [
      '1. General term: Tᵣ₊₁ = C(5, r) · (1)⁵⁻ʳ · (2x)ʳ = C(5, r) · 2ʳ · xʳ.',
      '2. For x³, set r = 3.',
      '3. Term = C(5, 3) · 2³ · x³ = 10 · 8 · x³ = 80x³.',
      '4. Hence, the coefficient is 80.'
    ]
  },
  {
    id: 'alg-04',
    topic: 'Algebra',
    subtopic: 'Sequences & Series',
    difficulty: 'medium',
    type: 'numerical',
    prompt: 'Find the sum of the infinite geometric series: 6 + 2 + 2/3 + 2/9 + ...',
    correctAnswer: 9,
    acceptableAnswers: ['9', '9.0'],
    explanation: 'For an infinite GP with |r| < 1, the sum converges to a / (1 - r).',
    solutionSteps: [
      '1. First term a = 6. Common ratio r = 2 / 6 = 1/3.',
      '2. Since |1/3| < 1, the infinite sum converges.',
      '3. S_∞ = a / (1 - r) = 6 / (1 - 1/3) = 6 / (2/3) = 6 × (3/2) = 9.'
    ]
  },
  {
    id: 'alg-05',
    topic: 'Algebra',
    subtopic: 'Relations',
    difficulty: 'easy',
    type: 'boolean',
    prompt: 'True or False: If relation R on set A is reflexive, then for every element a ∈ A, the pair (a, a) must belong to R.',
    correctAnswer: true,
    explanation: 'By definition, a relation R on set A is reflexive iff ∀ a ∈ A, (a, a) ∈ R.',
    solutionSteps: [
      '1. Definition: A binary relation R ⊆ A × A is reflexive if every element is related to itself.',
      '2. Formally: ∀ a ∈ A, (a, a) ∈ R.',
      '3. The statement is TRUE.'
    ]
  },
  {
    id: 'alg-06',
    topic: 'Algebra',
    subtopic: 'Quadratic Equations',
    difficulty: 'hard',
    type: 'mcq',
    prompt: 'If the roots of x² - kx + 16 = 0 are real and equal, what are the possible values of k?',
    options: ['k = ±4', 'k = ±8', 'k = ±16', 'k = 8 only'],
    correctAnswer: 1, // 'k = ±8'
    explanation: 'Roots are real and equal when the discriminant Δ = b² - 4ac equals zero.',
    solutionSteps: [
      '1. In quadratic ax² + bx + c = 0, a = 1, b = -k, c = 16.',
      '2. Discriminant: Δ = b² - 4ac = (-k)² - 4(1)(16) = k² - 64.',
      '3. For real and equal roots: k² - 64 = 0 ⟹ k² = 64 ⟹ k = ±8.'
    ]
  },

  // ==========================================
  // TRIGONOMETRY
  // ==========================================
  {
    id: 'trig-01',
    topic: 'Trigonometry',
    subtopic: 'Trigonometric Identities',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Evaluate: sin²(23°) + cos²(23°)',
    correctAnswer: 1,
    acceptableAnswers: ['1', '1.0'],
    explanation: 'By the fundamental Pythagorean identity, sin²(θ) + cos²(θ) = 1 for any real angle θ.',
    solutionSteps: [
      '1. Recall the fundamental identity: sin²(θ) + cos²(θ) = 1.',
      '2. Here θ = 23°.',
      '3. Therefore, sin²(23°) + cos²(23°) = 1.'
    ]
  },
  {
    id: 'trig-02',
    topic: 'Trigonometry',
    subtopic: 'Inverse Trigonometry',
    difficulty: 'medium',
    type: 'expression',
    prompt: 'Find the principal value of sin⁻¹(1/2) in terms of π.',
    correctAnswer: 'π/6',
    acceptableAnswers: ['pi/6', 'π/6', '30°', '30 deg'],
    explanation: 'The principal value branch of arcsine is [-π/2, π/2].',
    solutionSteps: [
      '1. We seek θ ∈ [-π/2, π/2] such that sin(θ) = 1/2.',
      '2. In the first quadrant, sin(π/6) = sin(30°) = 1/2.',
      '3. Hence, the principal value is π/6.'
    ]
  },
  {
    id: 'trig-03',
    topic: 'Trigonometry',
    subtopic: 'Double Angle Formulas',
    difficulty: 'medium',
    type: 'mcq',
    prompt: 'If cos(θ) = 3/5 with θ in Quadrant I, what is the value of sin(2θ)?',
    options: ['24/25', '12/25', '7/25', '16/25'],
    correctAnswer: 0, // '24/25'
    explanation: 'sin(2θ) = 2 · sin(θ) · cos(θ).',
    solutionSteps: [
      '1. Given cos(θ) = 3/5 in Quadrant I.',
      '2. sin(θ) = √(1 - cos²θ) = √(1 - 9/25) = √(16/25) = 4/5.',
      '3. sin(2θ) = 2 · sin(θ) · cos(θ) = 2 · (4/5) · (3/5) = 24/25.'
    ]
  },
  {
    id: 'trig-04',
    topic: 'Trigonometry',
    subtopic: 'Inverse Trigonometry',
    difficulty: 'hard',
    type: 'boolean',
    prompt: 'True or False: sin⁻¹(x) + cos⁻¹(x) = π/2 is valid for all x ∈ [-1, 1].',
    correctAnswer: true,
    explanation: 'For any value in the domain [-1, 1], arcsine and arccosine are complementary acute angles adding to π/2.',
    solutionSteps: [
      '1. Let sin⁻¹(x) = θ ⟹ sin(θ) = x, with -π/2 ≤ θ ≤ π/2.',
      '2. cos(π/2 - θ) = sin(θ) = x.',
      '3. Hence, cos⁻¹(x) = π/2 - θ = π/2 - sin⁻¹(x).',
      '4. Rearranging gives sin⁻¹(x) + cos⁻¹(x) = π/2. Statement is TRUE.'
    ]
  },

  // ==========================================
  // COORDINATE GEOMETRY
  // ==========================================
  {
    id: 'geom-01',
    topic: 'Coordinate Geometry',
    subtopic: 'Straight Lines',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Find the slope of the line passing through points (2, 3) and (6, 11).',
    correctAnswer: 2,
    acceptableAnswers: ['2', '2.0'],
    explanation: 'The slope m between two points is given by (y₂ - y₁) / (x₂ - x₁).',
    solutionSteps: [
      '1. Points: (x₁, y₁) = (2, 3), (x₂, y₂) = (6, 11).',
      '2. Slope m = (11 - 3) / (6 - 2) = 8 / 4 = 2.'
    ]
  },
  {
    id: 'geom-02',
    topic: 'Coordinate Geometry',
    subtopic: 'Conic Sections',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'What is the radius of the circle given by x² + y² = 49?',
    correctAnswer: 7,
    acceptableAnswers: ['7'],
    explanation: 'Standard equation of circle centered at origin is x² + y² = r².',
    solutionSteps: [
      '1. Compare with x² + y² = r².',
      '2. r² = 49 ⟹ r = √49 = 7.'
    ]
  },
  {
    id: 'geom-03',
    topic: 'Coordinate Geometry',
    subtopic: 'Straight Lines',
    difficulty: 'medium',
    type: 'numerical',
    prompt: 'Calculate the perpendicular distance from point (3, 4) to the line 3x + 4y - 5 = 0.',
    correctAnswer: 4,
    acceptableAnswers: ['4', '4.0'],
    explanation: 'Perpendicular distance d = |Ax₁ + By₁ + C| / √(A² + B²).',
    solutionSteps: [
      '1. Line: 3x + 4y - 5 = 0 ⟹ A = 3, B = 4, C = -5. Point: (x₁, y₁) = (3, 4).',
      '2. Numerator: |3(3) + 4(4) - 5| = |9 + 16 - 5| = |20| = 20.',
      '3. Denominator: √(3² + 4²) = √(9 + 16) = √25 = 5.',
      '4. Distance: d = 20 / 5 = 4.'
    ]
  },
  {
    id: 'geom-04',
    topic: 'Coordinate Geometry',
    subtopic: 'Conic Sections',
    difficulty: 'hard',
    type: 'mcq',
    prompt: 'What is the eccentricity of the ellipse x²/25 + y²/16 = 1?',
    options: ['3/5', '4/5', '9/25', '5/3'],
    correctAnswer: 0, // '3/5'
    explanation: 'For an ellipse x²/a² + y²/b² = 1 with a > b, eccentricity e = √(1 - b²/a²).',
    solutionSteps: [
      '1. Here a² = 25 and b² = 16.',
      '2. b² = a²(1 - e²) ⟹ 16 = 25(1 - e²).',
      '3. 1 - e² = 16/25 ⟹ e² = 1 - 16/25 = 9/25.',
      '4. e = √(9/25) = 3/5.'
    ]
  },

  // ==========================================
  // CALCULUS
  // ==========================================
  {
    id: 'calc-01',
    topic: 'Calculus',
    subtopic: 'Limits',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Evaluate: lim(x → 0) [sin(3x) / x]',
    correctAnswer: 3,
    acceptableAnswers: ['3', '3.0'],
    explanation: 'Standard trigonometric limit: lim(θ → 0) [sin(kθ) / θ] = k.',
    solutionSteps: [
      '1. Rewrite expression: lim(x → 0) [3 · sin(3x) / (3x)].',
      '2. As x → 0, 3x → 0. Recall lim(u → 0) [sin(u) / u] = 1.',
      '3. Calculation: 3 · (1) = 3.'
    ]
  },
  {
    id: 'calc-02',
    topic: 'Calculus',
    subtopic: 'Differentiation',
    difficulty: 'easy',
    type: 'expression',
    prompt: 'Find the derivative of f(x) = x⁴ - 5x² + 7.',
    correctAnswer: '4x^3 - 10x',
    acceptableAnswers: ['4x^3 - 10x', '4x³ - 10x', '4*x^3 - 10*x', '4x^3-10x'],
    explanation: 'Apply the power rule d/dx [xⁿ] = n · xⁿ⁻¹ term-by-term.',
    solutionSteps: [
      '1. d/dx [x⁴] = 4x³.',
      '2. d/dx [-5x²] = -10x.',
      '3. d/dx [7] = 0.',
      '4. Summing terms: f\'(x) = 4x³ - 10x.'
    ]
  },
  {
    id: 'calc-03',
    topic: 'Calculus',
    subtopic: 'Definite Integration',
    difficulty: 'medium',
    type: 'numerical',
    prompt: 'Evaluate the definite integral: ∫₀² (3x² + 2) dx',
    correctAnswer: 12,
    acceptableAnswers: ['12', '12.0'],
    explanation: 'Find the antiderivative F(x) and evaluate F(2) - F(0).',
    solutionSteps: [
      '1. Antiderivative: ∫ (3x² + 2) dx = x³ + 2x.',
      '2. Upper limit at x = 2: (2)³ + 2(2) = 8 + 4 = 12.',
      '3. Lower limit at x = 0: (0)³ + 2(0) = 0.',
      '4. Definite integral: 12 - 0 = 12.'
    ]
  },
  {
    id: 'calc-04',
    topic: 'Calculus',
    subtopic: 'Applications of Derivatives',
    difficulty: 'medium',
    type: 'numerical',
    prompt: 'At what x-coordinate does f(x) = x³ - 3x have a local minimum?',
    correctAnswer: 1,
    acceptableAnswers: ['1', '1.0'],
    explanation: 'Find critical points where f\'(x) = 0 and verify with the second derivative test f\'\'(x) > 0.',
    solutionSteps: [
      '1. First derivative: f\'(x) = 3x² - 3 = 3(x² - 1) = 0 ⟹ x = ±1.',
      '2. Second derivative: f\'\'(x) = 6x.',
      '3. At x = 1: f\'\'(1) = 6 > 0 ⟹ Local Minimum.',
      '4. At x = -1: f\'\'(-1) = -6 < 0 ⟹ Local Maximum.',
      '5. Therefore, local minimum occurs at x = 1.'
    ]
  },
  {
    id: 'calc-05',
    topic: 'Calculus',
    subtopic: 'Differential Equations',
    difficulty: 'medium',
    type: 'mcq',
    prompt: 'What is the order and degree of the differential equation (d²y/dx²)³ + (dy/dx)⁴ + y = 0?',
    options: ['Order 2, Degree 3', 'Order 3, Degree 2', 'Order 2, Degree 4', 'Order 4, Degree 3'],
    correctAnswer: 0, // 'Order 2, Degree 3'
    explanation: 'Order is the highest derivative present; degree is the power of that highest derivative.',
    solutionSteps: [
      '1. Highest order derivative present is d²y/dx² ⟹ Order = 2.',
      '2. The power of the highest order derivative d²y/dx² is 3 ⟹ Degree = 3.',
      '3. Result: Order 2, Degree 3.'
    ]
  },
  {
    id: 'calc-06',
    topic: 'Calculus',
    subtopic: 'Integration',
    difficulty: 'hard',
    type: 'boolean',
    prompt: 'True or False: The integral of an odd function f(x) over symmetric limits [-a, a] is always 0.',
    correctAnswer: true,
    explanation: 'By symmetry, the area above the axis on [0, a] cancels identically with the equal area below the axis on [-a, 0].',
    solutionSteps: [
      '1. An odd function satisfies f(-x) = -f(x).',
      '2. Split integral: ∫₋ₐᵃ f(x) dx = ∫₋ₐ⁰ f(x) dx + ∫₀ᵃ f(x) dx.',
      '3. Substituting u = -x in the first integral yields -∫₀ᵃ f(u) du.',
      '4. Sum = -∫₀ᵃ f(x) dx + ∫₀ᵃ f(x) dx = 0. Statement is TRUE.'
    ]
  },

  // ==========================================
  // STATISTICS & PROBABILITY
  // ==========================================
  {
    id: 'stat-01',
    topic: 'Statistics & Probability',
    subtopic: 'Measures of Central Tendency',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Find the median of the dataset: 4, 1, 7, 9, 3, 8, 5.',
    correctAnswer: 5,
    acceptableAnswers: ['5'],
    explanation: 'Sort the observations in ascending order; the middle value is the median.',
    solutionSteps: [
      '1. Sorted observations: 1, 3, 4, 5, 7, 8, 9.',
      '2. Total observations N = 7 (odd).',
      '3. Rank of median = (7 + 1) / 2 = 4th element.',
      '4. The 4th element is 5.'
    ]
  },
  {
    id: 'stat-02',
    topic: 'Statistics & Probability',
    subtopic: 'Probability',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'A fair 6-sided die is rolled. What is the probability of rolling a prime number? (Enter as decimal)',
    correctAnswer: 0.5,
    acceptableAnswers: ['0.5', '1/2', '0.50'],
    explanation: 'The prime outcomes on a standard 6-sided die are 2, 3, and 5.',
    solutionSteps: [
      '1. Sample space S = {1, 2, 3, 4, 5, 6} (6 total outcomes).',
      '2. Prime outcomes: {2, 3, 5} (3 favorable outcomes).',
      '3. Probability: 3 / 6 = 1/2 = 0.5.'
    ]
  },
  {
    id: 'stat-03',
    topic: 'Statistics & Probability',
    subtopic: 'Conditional Probability',
    difficulty: 'medium',
    type: 'numerical',
    prompt: 'Given P(A) = 0.6, P(B) = 0.5, and P(A ∩ B) = 0.3. Find P(A | B).',
    correctAnswer: 0.6,
    acceptableAnswers: ['0.6', '0.60', '3/5'],
    explanation: 'Conditional probability formula: P(A | B) = P(A ∩ B) / P(B).',
    solutionSteps: [
      '1. Formula: P(A | B) = P(A ∩ B) / P(B).',
      '2. Substitute values: P(A | B) = 0.3 / 0.5 = 3/5 = 0.6.'
    ]
  },
  {
    id: 'stat-04',
    topic: 'Statistics & Probability',
    subtopic: 'Dispersion',
    difficulty: 'hard',
    type: 'numerical',
    prompt: 'If the variance of a dataset is 16, what is its standard deviation?',
    correctAnswer: 4,
    acceptableAnswers: ['4', '4.0'],
    explanation: 'Standard deviation is the non-negative square root of variance: σ = √σ².',
    solutionSteps: [
      '1. Given variance σ² = 16.',
      '2. Standard deviation σ = √16 = 4.'
    ]
  },

  // ==========================================
  // MATRICES & DETERMINANTS
  // ==========================================
  {
    id: 'mat-01',
    topic: 'Matrices & Determinants',
    subtopic: 'Determinants',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Evaluate the 2×2 determinant: det [[4, 3], [2, 5]].',
    correctAnswer: 14,
    acceptableAnswers: ['14'],
    explanation: 'For a 2×2 matrix [[a, b], [c, d]], determinant = ad - bc.',
    solutionSteps: [
      '1. Formula: det = (4 × 5) - (3 × 2).',
      '2. Calculation: 20 - 6 = 14.'
    ]
  },
  {
    id: 'mat-02',
    topic: 'Matrices & Determinants',
    subtopic: 'Matrix Algebra',
    difficulty: 'easy',
    type: 'boolean',
    prompt: 'True or False: Matrix multiplication is generally commutative (i.e. AB = BA for all square matrices).',
    correctAnswer: false,
    explanation: 'Matrix multiplication is non-commutative in general: AB ≠ BA.',
    solutionSteps: [
      '1. In linear algebra, applying transformation A then B is generally not equivalent to applying B then A.',
      '2. For instance, [[0, 1], [0, 0]] · [[0, 0], [1, 0]] = [[1, 0], [0, 0]] while the reverse product is [[0, 0], [0, 1]].',
      '3. The statement is FALSE.'
    ]
  },
  {
    id: 'mat-03',
    topic: 'Matrices & Determinants',
    subtopic: 'Invertibility',
    difficulty: 'medium',
    type: 'mcq',
    prompt: 'A square matrix A is invertible if and only if:',
    options: ['det(A) ≠ 0', 'det(A) = 0', 'Trace(A) > 0', 'A is symmetric'],
    correctAnswer: 0, // 'det(A) ≠ 0'
    explanation: 'A matrix possesses an inverse A⁻¹ = (1/|A|) · adj(A) iff its determinant is non-zero (non-singular).',
    solutionSteps: [
      '1. The inverse formula requires division by |A|: A⁻¹ = (1 / |A|) · adj(A).',
      '2. Division by zero is undefined.',
      '3. Hence, A is invertible if and only if det(A) ≠ 0.'
    ]
  },
  {
    id: 'mat-04',
    topic: 'Matrices & Determinants',
    subtopic: 'Determinant Properties',
    difficulty: 'hard',
    type: 'numerical',
    prompt: 'If matrix A has size 3×3 and det(A) = 4, what is the value of det(2A)?',
    correctAnswer: 32,
    acceptableAnswers: ['32'],
    explanation: 'For an n×n matrix and scalar k, det(kA) = kⁿ · det(A).',
    solutionSteps: [
      '1. For an n×n matrix, scaling every row by k multiplies the determinant by kⁿ.',
      '2. Here n = 3 and k = 2 ⟹ det(2A) = 2³ · det(A).',
      '3. Calculation: 8 · 4 = 32.'
    ]
  },

  // ==========================================
  // VECTORS & 3D GEOMETRY
  // ==========================================
  {
    id: 'vec-01',
    topic: 'Vectors & 3D Geometry',
    subtopic: 'Vector Algebra',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Find the magnitude of vector v⃗ = ⟨3, -4, 0⟩.',
    correctAnswer: 5,
    acceptableAnswers: ['5', '5.0'],
    explanation: 'The magnitude is |v⃗| = √(vx² + vy² + vz²).',
    solutionSteps: [
      '1. |v⃗| = √(3² + (-4)² + 0²) = √(9 + 16 + 0).',
      '2. √25 = 5.'
    ]
  },
  {
    id: 'vec-02',
    topic: 'Vectors & 3D Geometry',
    subtopic: 'Dot Product',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Calculate the dot product of u⃗ = ⟨2, 3, -1⟩ and v⃗ = ⟨4, -2, 1⟩.',
    correctAnswer: 1,
    acceptableAnswers: ['1'],
    explanation: 'Dot product u⃗ · v⃗ = ux·vx + uy·vy + uz·vz.',
    solutionSteps: [
      '1. u⃗ · v⃗ = (2 × 4) + (3 × -2) + (-1 × 1).',
      '2. Calculation: 8 - 6 - 1 = 1.'
    ]
  },
  {
    id: 'vec-03',
    topic: 'Vectors & 3D Geometry',
    subtopic: 'Orthogonality',
    difficulty: 'medium',
    type: 'numerical',
    prompt: 'For what value of k are vectors u⃗ = ⟨k, 2, 4⟩ and v⃗ = ⟨3, -1, 1⟩ orthogonal?',
    correctAnswer: -0.666667,
    acceptableAnswers: ['-2/3', '-0.67', '-0.667', '-0.6667'],
    explanation: 'Two non-zero vectors are orthogonal when their dot product equals 0.',
    solutionSteps: [
      '1. Set u⃗ · v⃗ = 0: (k)(3) + (2)(-1) + (4)(1) = 0.',
      '2. 3k - 2 + 4 = 0 ⟹ 3k + 2 = 0.',
      '3. k = -2/3.'
    ]
  },
  {
    id: 'vec-04',
    topic: 'Vectors & 3D Geometry',
    subtopic: 'Direction Cosines',
    difficulty: 'hard',
    type: 'boolean',
    prompt: 'True or False: If l, m, n are direction cosines of a line in 3D space, then l² + m² + n² = 1.',
    correctAnswer: true,
    explanation: 'Direction cosines are coordinates of a unit vector along the line, so their squared sum equals 1.',
    solutionSteps: [
      '1. Direction cosines l = cos α, m = cos β, n = cos γ are components of unit vector r̂ = l î + m ĵ + n k̂.',
      '2. Magnitude of a unit vector is 1 ⟹ |r̂|² = l² + m² + n² = 1.',
      '3. Statement is TRUE.'
    ]
  },

  // ==========================================
  // LINEAR PROGRAMMING
  // ==========================================
  {
    id: 'lpp-01',
    topic: 'Linear Programming',
    subtopic: 'Corner Point Method',
    difficulty: 'easy',
    type: 'numerical',
    prompt: 'Maximize Z = 3x + 2y at corner point (4, 3).',
    correctAnswer: 18,
    acceptableAnswers: ['18'],
    explanation: 'Evaluate the linear objective function at the given vertex.',
    solutionSteps: [
      '1. Substitute x = 4, y = 3 into Z = 3x + 2y.',
      '2. Z = 3(4) + 2(3) = 12 + 6 = 18.'
    ]
  },
  {
    id: 'lpp-02',
    topic: 'Linear Programming',
    subtopic: 'Feasible Region',
    difficulty: 'medium',
    type: 'mcq',
    prompt: 'In a 2D Linear Programming Problem, the optimal value of the objective function Z always occurs at:',
    options: [
      'A corner point (vertex) of the feasible region',
      'The exact centroid of the feasible polygon',
      'The origin (0, 0)',
      'Any interior point'
    ],
    correctAnswer: 0,
    explanation: 'By the Fundamental Theorem of Linear Programming, extrema of a linear objective over a convex polygon occur at extreme vertices.',
    solutionSteps: [
      '1. The feasible region defined by linear inequalities is a convex polygon.',
      '2. Level curves of a linear objective function Z = ax + by are parallel lines.',
      '3. The extreme values must first/last touch the boundary at an extreme corner point.'
    ]
  }
];
