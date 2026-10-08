# OG — Mathematics • Calculate • Understand

> **OG** is a premium, futuristic mathematics platform engineered for calculation, theoretical exploration, and conceptual mastery. Built from the ground up with pure modern web technologies and a bespoke **Liquid Glass** user interface.

---

## ✦ Design Direction: Liquid Glass UI

OG features a spatial, multi-tiered Liquid Glass design system:
1. **Background Environment**: Deep space obsidian/navy palette with ambient gradient light sources, floating mathematical glyphs (`π`, `∑`, `∫`, `√`, `∂`, `∞`), and a mathematical grid overlay.
2. **Glass Surface Tier**: 18px blur, translucent frosted foundations with specular top-edge highlights.
3. **Elevated Glass Tier**: 28px blur, layered depth shadows, and interactive neon accents (Cyan & Indigo).
4. **Interactive Glass Tier**: Micro-animations, responsive hover glows, and tactile physical feedback.

---

## ✦ Technology Stack

- **HTML5**: Semantic, accessible markup with ARIA roles and labels.
- **CSS3**: Vanilla custom properties (`variables.css`), multi-tiered glassmorphism (`glass.css`), responsive layouts (`responsive.css`), and micro-animations (`animations.css`).
- **Vanilla JavaScript (ES6 Modules)**: Zero framework bloat (No React, No TypeScript, No external runtime dependencies).
- **Client-Side Routing**: Lightweight hash-based router supporting dynamic module templates (`#/modules/:id`).
- **State Store**: Reactive state management with local storage calculation history persistence.

---

## ✦ Mathematics Curriculum (24 Modules)

All 24 curriculum modules are visually grouped across 6 mathematical branches:

### 1. ALGEBRA
- **#01 Sets** (`∅`) — Set theory, subsets, operations & Venn diagrams.
- **#02 Relations & Functions** (`f(x)`) — Cartesian products, equivalence, injections, surjections.
- **#04 Complex Numbers and Quadratic Equations** (`a+bi`) — Argand plane, modulus, polar forms.
- **#05 Linear Inequalities** (`ax ≤ b`) — Algebraic and graphic half-plane solutions.
- **#06 Permutations and Combinations** (`ⁿCᵣ`) — Fundamental counting, arrangements, selections.
- **#07 Binomial Theorem** (`(x+a)ⁿ`) — General terms, Pascal's triangle, expansions.
- **#08 Sequence and Series** (`∑aₙ`) — Arithmetic & geometric progressions, infinite series.

### 2. COORDINATE GEOMETRY
- **#09 Straight Lines** (`y=mx+c`) — Slopes, intercepts, perpendicular distance.
- **#10 Conic Sections** (`x²/a²`) — Circles, parabolas, ellipses, hyperbolas.
- **#11 Introduction to Three-dimensional Geometry** (`ℝ³`) — Octants, 3D distance & section formulas.

### 3. CALCULUS
- **#03 Trigonometric Functions** (`sin θ`) — Radian measures, compound identities, equations.
- **#12 Limits and Derivatives** (`lim`) — First principles, standard limits, instantaneous rate.
- **#15 Inverse Trigonometric Functions** (`sin⁻¹`) — Principal value branches, domain & range.
- **#18 Continuity and Differentiability** (`dy/dx`) — Chain rule, Rolle's & Mean Value Theorems.
- **#19 Applications of Derivatives** (`∇f`) — Maxima/minima, tangents, rate of change.
- **#20 Integrals** (`∫dx`) — Indefinite & definite integrals, substitution, parts.
- **#21 Applications of Integrals** (`∬dA`) — Area under curves, bounded regions.
- **#22 Differential Equations** (`y'+Py=Q`) — Order, degree, separation of variables, integrating factors.

### 4. STATISTICS & PROBABILITY
- **#13 Statistics** (`σ²`) — Variance, standard deviation, dispersion measures.
- **#14 Probability** (`P(E)`) — Axiomatic probability, conditional probability, Bayes' theorem.

### 5. LINEAR ALGEBRA
- **#16 Matrices** (`[A]`) — Operations, transpose, symmetry, invertibility.
- **#17 Determinants** (`|A|`) — Minors, cofactors, adjoints, Cramer's rule.

### 6. VECTORS & OPTIMIZATION
- **#23 Vectors and Three-Dimensional Geometry** (`u⃗ × v⃗`) — Dot/cross products, skew lines, planes.
- **#24 Linear Programming** (`max Z`) — Feasible regions, constraints, corner point optimization.

---

## ✦ Routing Architecture

| Route | Description |
|---|---|
| `/` | Ambient Dashboard with Hero, Quick Calc, Tools & Featured Modules |
| `#/calculator` | Dedicated Scientific Calculator with Deg/Rad and Memory |
| `#/modules` | All 24 Modules with Category Filters & Real-time Search |
| `#/modules/:id` | Reusable Deep-Dive Module Template with Theorems & Solvers |
| `#/formulas` | Categorized verified mathematical identities library |
| `#/practice` | Interactive Problem Sets & Daily Challenge Arena |
| `#/history` | Calculation Session History with instant replay & copy |
| `#/settings` | User precision, angle mode, and UI customization |

---

## ✦ Development & Foundation Verification

To launch locally:
```bash
# Using Python
python3 -m http.server 8080

# Or using npx serve
npx serve .
```

Open `http://localhost:8080` in any modern web browser.
