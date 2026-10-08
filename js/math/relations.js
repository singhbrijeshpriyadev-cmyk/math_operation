/**
 * OG - Relations & Functions Mathematical Engine
 * Comprehensive analysis for relations and functions:
 * - Set & Pair parsing with robust normalization
 * - Cartesian Product A × B and relation counts 2^(|A|·|B|)
 * - Relation properties on Set A: Reflexive, Symmetric, Transitive, Equivalence
 * - Equivalence classes [a]
 * - Function verification: Well-defined, Domain, Codomain, Range
 * - Function classification: Injective (one-to-one), Surjective (onto), Bijective (invertible)
 * - Inverse function f⁻¹
 * - Function composition (g ∘ f)(x) = g(f(x))
 * - Formula-based mapping generation: e.g. f(x) = 2x + 1
 * ES6 Module
 */

import { SetsMathEngine } from './sets.js';
import { ResultFormatter } from './formatter.js';
import { MathExpression } from './calculus.js';

export class RelationsMathEngine {
  /**
   * Parses flexible user input into an array of ordered pairs: [{ a: any, b: any }]
   * Supports: "{(1, 2), (2, 3)}", "(1,2), (2,3)", "1,2; 3,4", "1->2, 2->3", "1:2, 3:4"
   */
  static parsePairs(input, paramName = 'Relation') {
    if (!input || typeof input !== 'string') {
      return { valid: false, pairs: [], error: `${paramName} cannot be empty.`, formatted: '∅' };
    }

    let cleaned = input.trim();
    if (!cleaned || cleaned === '∅' || cleaned === '{}') {
      return { valid: true, pairs: [], error: null, formatted: '∅' };
    }

    // Strip wrapping braces if present
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    const pairs = [];
    // Regex matching (a, b) or (a; b) or [a, b] or <a> -> <b>
    const pairRegex = /(?:\(|\<|\[)\s*([^,;><\)\(\]]+)\s*(?:,|;|->|:)\s*([^,;><\)\(\]]+)\s*(?:\)|\>|\])/g;
    let match;
    let hasMatches = false;

    while ((match = pairRegex.exec(cleaned)) !== null) {
      hasMatches = true;
      const rawA = match[1].trim();
      const rawB = match[2].trim();
      const a = this._parseElement(rawA);
      const b = this._parseElement(rawB);
      pairs.push({ a, b });
    }

    // If no parenthesized pairs matched, try splitting by semicolon or comma pairs (e.g. "1,2; 3,4" or "1 2, 3 4")
    if (!hasMatches) {
      const items = cleaned.split(/[;\n]/);
      for (const item of items) {
        const itemClean = item.trim();
        if (!itemClean) continue;
        const parts = itemClean.split(/(?:->|:|,\s*|\s+)/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          pairs.push({
            a: this._parseElement(parts[0]),
            b: this._parseElement(parts[1])
          });
          hasMatches = true;
        }
      }
    }

    if (!hasMatches && cleaned.length > 0) {
      return {
        valid: false,
        pairs: [],
        error: `Could not parse pairs from "${input}". Please use standard format like (1, 2), (3, 4).`,
        formatted: '∅'
      };
    }

    // Deduplicate pairs
    const uniquePairs = this._deduplicatePairs(pairs);

    return {
      valid: true,
      pairs: uniquePairs,
      error: null,
      formatted: this.formatPairs(uniquePairs)
    };
  }

  static _parseElement(str) {
    if (!str) return '';
    const trimmed = str.replace(/^['"]|['"]$/g, '').trim();
    if (!isNaN(trimmed) && !isNaN(parseFloat(trimmed)) && isFinite(trimmed)) {
      return parseFloat(trimmed);
    }
    return trimmed;
  }

  static _deduplicatePairs(pairs) {
    const seen = new Set();
    const result = [];
    for (const p of pairs) {
      const key = `${typeof p.a}:${p.a}->${typeof p.b}:${p.b}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }
    return result;
  }

  static formatPairs(pairs) {
    if (!pairs || pairs.length === 0) return '∅';
    return '{ ' + pairs.map(p => `(${p.a}, ${p.b})`).join(', ') + ' }';
  }

  /**
   * Cartesian Product A × B and relation metrics
   */
  static cartesianProduct(setAInput, setBInput) {
    const pA = SetsMathEngine.parseSet(setAInput, 'Set A');
    const pB = SetsMathEngine.parseSet(setBInput, 'Set B');

    if (!pA.valid) return ResultFormatter.error(pA.error);
    if (!pB.valid) return ResultFormatter.error(pB.error);

    const A = pA.elements;
    const B = pB.elements;
    const cardA = A.length;
    const cardB = B.length;
    const totalPairsCount = cardA * cardB;

    const product = [];
    for (const a of A) {
      for (const b of B) {
        product.push({ a, b });
      }
    }

    // Number of possible relations is 2^(|A| * |B|)
    const relationsCount = totalPairsCount <= 53 ? Math.pow(2, totalPairsCount) : `2^${totalPairsCount}`;

    const formulaStr = 'A × B = { (a, b) | a ∈ A, b ∈ B }   |   Total Relations = 2^(|A| · |B|)';
    const steps = [
      `1. Set A (Cardinality |A| = ${cardA}): ${pA.formatted}`,
      `2. Set B (Cardinality |B| = ${cardB}): ${pB.formatted}`,
      `3. Cardinality of Cartesian Product: |A × B| = |A| × |B| = ${cardA} × ${cardB} = ${totalPairsCount}`,
      `4. Total Possible Subsets / Relations from A to B: 2^(${cardA} × ${cardB}) = 2^${totalPairsCount} = ${relationsCount}`,
      `5. Cartesian Product A × B elements:`,
      `   ${this.formatPairs(product)}`
    ];

    return ResultFormatter.success(
      {
        setA: A,
        setB: B,
        cardA,
        cardB,
        totalPairsCount,
        relationsCount,
        product,
        formattedProduct: this.formatPairs(product)
      },
      steps,
      formulaStr
    );
  }

  /**
   * Analyze Binary Relation R on set A (or from A to B)
   * Checks Reflexivity, Symmetry, Transitivity, Equivalence classes.
   */
  static analyzeRelation(setAInput, relationInput, setBInput = null) {
    const pA = SetsMathEngine.parseSet(setAInput, 'Set A');
    if (!pA.valid) return ResultFormatter.error(pA.error);
    const A = pA.elements;

    let B = A;
    let isHomogeneous = true;
    if (setBInput !== null && setBInput !== undefined && String(setBInput).trim() !== '') {
      const pB = SetsMathEngine.parseSet(setBInput, 'Set B');
      if (!pB.valid) return ResultFormatter.error(pB.error);
      B = pB.elements;
      isHomogeneous = JSON.stringify(A) === JSON.stringify(B);
    }

    const pRel = this.parsePairs(relationInput, 'Relation R');
    if (!pRel.valid) return ResultFormatter.error(pRel.error);
    const pairs = pRel.pairs;

    // Check validity of pairs relative to A and B
    const setASet = new Set(A.map(x => `${typeof x}:${x}`));
    const setBSet = new Set(B.map(x => `${typeof x}:${x}`));

    const invalidPairs = pairs.filter(p => !setASet.has(`${typeof p.a}:${p.a}`) || !setBSet.has(`${typeof p.b}:${p.b}`));
    if (invalidPairs.length > 0) {
      return ResultFormatter.error(
        `Pairs ${this.formatPairs(invalidPairs)} contain elements not in Set A or Set B.`
      );
    }

    // Domain and Range of R
    const dom = SetsMathEngine._deduplicateAndSort(pairs.map(p => p.a));
    const ran = SetsMathEngine._deduplicateAndSort(pairs.map(p => p.b));

    // Inverse Relation R⁻¹
    const invPairs = this._deduplicatePairs(pairs.map(p => ({ a: p.b, b: p.a })));

    // Fast lookup set of pairs
    const pairMap = new Set(pairs.map(p => `${typeof p.a}:${p.a}->${typeof p.b}:${p.b}`));
    const hasPair = (x, y) => pairMap.has(`${typeof x}:${x}->${typeof y}:${y}`);

    let isReflexive = false;
    let missingReflexive = [];
    let isSymmetric = false;
    let counterSymmetric = [];
    let isTransitive = false;
    let counterTransitive = [];
    let isEquivalence = false;
    let equivalenceClasses = [];

    const steps = [
      `1. Ground Set A (N = ${A.length}): ${pA.formatted}`,
      ...(isHomogeneous ? [] : [`   Codomain Set B (N = ${B.length}): ${SetsMathEngine.formatSet(B)}`]),
      `2. Relation R (${pairs.length} pairs): ${this.formatPairs(pairs)}`,
      `3. Domain(R): ${SetsMathEngine.formatSet(dom)}`,
      `4. Range(R): ${SetsMathEngine.formatSet(ran)}`,
      `5. Inverse Relation R⁻¹: ${this.formatPairs(invPairs)}`
    ];

    if (isHomogeneous) {
      // 1. Reflexive: ∀ a ∈ A, (a, a) ∈ R
      missingReflexive = A.filter(a => !hasPair(a, a));
      isReflexive = missingReflexive.length === 0;

      // 2. Symmetric: ∀ (a, b) ∈ R ⟹ (b, a) ∈ R
      for (const p of pairs) {
        if (!hasPair(p.b, p.a)) {
          counterSymmetric.push({ pair: p, needed: { a: p.b, b: p.a } });
        }
      }
      isSymmetric = counterSymmetric.length === 0;

      // 3. Transitive: ∀ (a, b) ∈ R and (b, c) ∈ R ⟹ (a, c) ∈ R
      for (const p1 of pairs) {
        for (const p2 of pairs) {
          if (`${typeof p1.b}:${p1.b}` === `${typeof p2.a}:${p2.a}`) {
            if (!hasPair(p1.a, p2.c !== undefined ? p2.c : p2.b)) {
              const a = p1.a;
              const b = p1.b;
              const c = p2.b;
              if (!hasPair(a, c)) {
                counterTransitive.push({ p1: `(${a}, ${b})`, p2: `(${b}, ${c})`, missing: `(${a}, ${c})` });
              }
            }
          }
        }
      }
      isTransitive = counterTransitive.length === 0;

      // 4. Equivalence
      isEquivalence = isReflexive && isSymmetric && isTransitive;

      // Step Derivations for properties
      steps.push(`--- Relation Properties on Set A ---`);
      if (isReflexive) {
        steps.push(`6. Reflexive: YES. For all a ∈ A, (a, a) ∈ R.`);
      } else {
        steps.push(`6. Reflexive: NO. Missing diagonal pairs: ${missingReflexive.map(a => `(${a}, ${a})`).join(', ')}.`);
      }

      if (isSymmetric) {
        steps.push(`7. Symmetric: YES. Whenever (a, b) ∈ R, (b, a) ∈ R.`);
      } else {
        steps.push(`7. Symmetric: NO. Counterexamples: ${counterSymmetric.slice(0, 3).map(c => `(${c.pair.a}, ${c.pair.b}) ∈ R but (${c.needed.a}, ${c.needed.b}) ∉ R`).join('; ')}.`);
      }

      if (isTransitive) {
        steps.push(`8. Transitive: YES. Whenever (a, b) ∈ R and (b, c) ∈ R, (a, c) ∈ R.`);
      } else {
        steps.push(`8. Transitive: NO. Counterexamples: ${counterTransitive.slice(0, 3).map(c => `${c.p1} and ${c.p2} ∈ R, but ${c.missing} ∉ R`).join('; ')}.`);
      }

      if (isEquivalence) {
        // Calculate equivalence classes [a]
        const classMap = new Map();
        for (const a of A) {
          const eqClass = A.filter(x => hasPair(a, x));
          const key = SetsMathEngine.formatSet(eqClass);
          if (!classMap.has(key)) {
            classMap.set(key, { rep: a, elements: eqClass, formatted: key });
          }
        }
        equivalenceClasses = Array.from(classMap.values());
        steps.push(`9. Equivalence Relation: YES (Reflexive, Symmetric, and Transitive).`);
        steps.push(`10. Equivalence Classes Partition:`);
        equivalenceClasses.forEach(eq => {
          steps.push(`    • [${eq.rep}] = ${eq.formatted}`);
        });
      } else {
        steps.push(`9. Equivalence Relation: NO (Fails one or more equivalence criteria).`);
      }
    }

    const formulaStr = isHomogeneous
      ? 'Reflexive: (a,a)∈R | Symmetric: (a,b)∈R⟹(b,a)∈R | Transitive: (a,b),(b,c)∈R⟹(a,c)∈R'
      : 'R ⊆ A × B   |   Domain(R) = {a | ∃b, (a,b)∈R}   |   Range(R) = {b | ∃a, (a,b)∈R}';

    return ResultFormatter.success(
      {
        setA: A,
        setB: B,
        isHomogeneous,
        pairs,
        domain: dom,
        range: ran,
        inversePairs: invPairs,
        isReflexive,
        missingReflexive,
        isSymmetric,
        counterSymmetric,
        isTransitive,
        counterTransitive,
        isEquivalence,
        equivalenceClasses
      },
      steps,
      formulaStr
    );
  }

  /**
   * Evaluate a mathematical formula like f(x) = 2*x + 1 or x^2 over Set A
   */
  static evaluateFormulaMapping(formulaStr, setAInput) {
    const pA = SetsMathEngine.parseSet(setAInput, 'Set A');
    if (!pA.valid) return ResultFormatter.error(pA.error);

    const expr = new MathExpression(formulaStr);
    if (!expr.isValid()) {
      return ResultFormatter.error(`Invalid function expression: ${expr.parseError || 'Syntax error'}`);
    }

    const pairs = [];
    for (const a of pA.elements) {
      if (typeof a !== 'number') {
        return ResultFormatter.error(`Formula evaluation requires numerical elements in Set A. Found "${a}".`);
      }
      const val = expr.evaluate(a);
      if (isNaN(val) || !isFinite(val)) {
        return ResultFormatter.error(`Function undefined or infinite at x = ${a}.`);
      }
      pairs.push({ a, b: ResultFormatter.cleanNumber(val) });
    }

    return ResultFormatter.success({
      pairs,
      formatted: this.formatPairs(pairs),
      formula: formulaStr
    });
  }

  /**
   * Complete analysis of Function f: A -> B
   * Checks whether mapping is a valid function, injective, surjective, bijective, and invertible.
   */
  static analyzeFunction(setAInput, setBInput, mappingInput, formulaExpr = null) {
    const pA = SetsMathEngine.parseSet(setAInput, 'Set A (Domain)');
    if (!pA.valid) return ResultFormatter.error(pA.error);
    const A = pA.elements;

    const pB = SetsMathEngine.parseSet(setBInput, 'Set B (Codomain)');
    if (!pB.valid) return ResultFormatter.error(pB.error);
    const B = pB.elements;

    if (A.length === 0) {
      return ResultFormatter.error('Set A (Domain) cannot be empty for a function.');
    }
    if (B.length === 0) {
      return ResultFormatter.error('Set B (Codomain) cannot be empty for a function.');
    }

    let pairs = [];
    if (formulaExpr && formulaExpr.trim() !== '') {
      const formRes = this.evaluateFormulaMapping(formulaExpr, A);
      if (!formRes.success) return formRes;
      pairs = formRes.result.pairs;
    } else {
      const pPairs = this.parsePairs(mappingInput, 'Mapping f');
      if (!pPairs.valid) return ResultFormatter.error(pPairs.error);
      pairs = pPairs.pairs;
    }

    // Step 1: Check if every element of A has an image, and exactly ONE image
    const mapCount = new Map();
    const mapTargets = new Map();

    for (const a of A) {
      mapCount.set(`${typeof a}:${a}`, 0);
      mapTargets.set(`${typeof a}:${a}`, []);
    }

    const setBSet = new Set(B.map(b => `${typeof b}:${b}`));
    const outOfBoundsB = [];

    for (const p of pairs) {
      const aKey = `${typeof p.a}:${p.a}`;
      const bKey = `${typeof p.b}:${p.b}`;

      if (!mapCount.has(aKey)) {
        return ResultFormatter.error(`Mapping contains input ${p.a} which is NOT in Domain Set A.`);
      }
      if (!setBSet.has(bKey)) {
        outOfBoundsB.push(p.b);
      }

      mapCount.set(aKey, (mapCount.get(aKey) || 0) + 1);
      mapTargets.get(aKey).push(p.b);
    }

    if (outOfBoundsB.length > 0) {
      return ResultFormatter.error(
        `Function produces image(s) ${outOfBoundsB.join(', ')} not contained in Codomain Set B.`
      );
    }

    const unmappedElements = [];
    const oneToManyElements = [];

    for (const a of A) {
      const count = mapCount.get(`${typeof a}:${a}`);
      if (count === 0) {
        unmappedElements.push(a);
      } else if (count > 1) {
        oneToManyElements.push({ element: a, images: mapTargets.get(`${typeof a}:${a}`) });
      }
    }

    const isValidFunction = unmappedElements.length === 0 && oneToManyElements.length === 0;

    // Build Step 1 Derivation
    const steps = [
      `1. Domain Set A (N = ${A.length}): ${pA.formatted}`,
      `2. Codomain Set B (N = ${B.length}): ${pB.formatted}`,
      `3. Mapping Pairs: ${this.formatPairs(pairs)}`
    ];

    if (!isValidFunction) {
      if (unmappedElements.length > 0) {
        steps.push(`❌ NOT A FUNCTION: Domain elements without an image: { ${unmappedElements.join(', ')} }. Every element of A must map to an element in B.`);
      }
      if (oneToManyElements.length > 0) {
        steps.push(`❌ NOT A FUNCTION: One-to-many mapping detected: ${oneToManyElements.map(e => `${e.element} maps to multiple values (${e.images.join(', ')})`).join('; ')}. Each domain element must map to uniquely ONE element in B.`);
      }

      return ResultFormatter.success(
        {
          isFunction: false,
          setA: A,
          setB: B,
          pairs,
          unmappedElements,
          oneToManyElements,
          isInjective: false,
          isSurjective: false,
          isBijective: false,
          isInvertible: false
        },
        steps,
        'f: A → B is a function iff ∀ a ∈ A, ∃! b ∈ B such that (a, b) ∈ f'
      );
    }

    steps.push(`✔ WELL-DEFINED FUNCTION: Every element of A maps to exactly one element of B.`);

    // Step 2: Range / Image Set
    const range = SetsMathEngine._deduplicateAndSort(pairs.map(p => p.b));
    steps.push(`4. Range / Image Set f(A): ${SetsMathEngine.formatSet(range)} (|Range| = ${range.length})`);

    // Step 3: Injective (One-to-One): f(x1) = f(x2) ==> x1 = x2
    // That means all mapped values b must be distinct
    const targetMap = new Map();
    const collisionItems = [];

    for (const p of pairs) {
      const bKey = `${typeof p.b}:${p.b}`;
      if (!targetMap.has(bKey)) {
        targetMap.set(bKey, [p.a]);
      } else {
        targetMap.get(bKey).push(p.a);
      }
    }

    for (const [bKey, preimages] of targetMap.entries()) {
      if (preimages.length > 1) {
        collisionItems.push({ image: pairs.find(p => `${typeof p.b}:${p.b}` === bKey).b, preimages });
      }
    }

    const isInjective = collisionItems.length === 0;
    if (isInjective) {
      steps.push(`5. Injective (One-to-One): YES. Distinct domain elements map to distinct images.`);
    } else {
      steps.push(`5. Injective (One-to-One): NO (Many-to-One). Collision: ${collisionItems.map(c => `image ${c.image} has pre-images {${c.preimages.join(', ')}}`).join('; ')}.`);
    }

    // Step 4: Surjective (Onto): Range(f) == Codomain B
    const unmappedCodomain = B.filter(b => !targetMap.has(`${typeof b}:${b}`));
    const isSurjective = unmappedCodomain.length === 0;

    if (isSurjective) {
      steps.push(`6. Surjective (Onto): YES. Every element of Codomain B is mapped (Range = Codomain).`);
    } else {
      steps.push(`6. Surjective (Onto): NO (Into). Unmapped codomain elements: { ${unmappedCodomain.join(', ')} }. Range ⊊ B.`);
    }

    // Step 5: Bijective & Invertible
    const isBijective = isInjective && isSurjective;
    let inversePairs = [];

    if (isBijective) {
      steps.push(`7. Bijective (One-to-One & Onto): YES. f is both injective and surjective.`);
      inversePairs = pairs.map(p => ({ a: p.b, b: p.a }));
      steps.push(`8. Invertible: YES. Inverse function f⁻¹: B → A exists:`);
      steps.push(`   f⁻¹ = ${this.formatPairs(inversePairs)}`);
    } else {
      steps.push(`7. Bijective: NO (${!isInjective && !isSurjective ? 'Neither injective nor surjective' : !isInjective ? 'Not injective' : 'Not surjective'}).`);
      steps.push(`8. Invertible: NO. Inverse function f⁻¹ does not exist as a single-valued total mapping.`);
    }

    const formulaStr = 'Injective: f(x₁)=f(x₂) ⟹ x₁=x₂   |   Surjective: Range(f)=B   |   Bijective: Injective ∧ Surjective';

    return ResultFormatter.success(
      {
        isFunction: true,
        setA: A,
        setB: B,
        pairs,
        domain: A,
        codomain: B,
        range,
        isInjective,
        collisionItems,
        isSurjective,
        unmappedCodomain,
        isBijective,
        isInvertible: isBijective,
        inversePairs
      },
      steps,
      formulaStr
    );
  }

  /**
   * Function Composition (g ∘ f)(x) = g(f(x))
   */
  static composeFunctions(fPairsInput, gPairsInput, setAInput, setBInput, setCInput) {
    const fRes = this.analyzeFunction(setAInput, setBInput, fPairsInput);
    if (!fRes.success || !fRes.result.isFunction) {
      return ResultFormatter.error(`First mapping f is not a valid function: ${fRes.error || 'Check domain coverage'}`);
    }

    const gRes = this.analyzeFunction(setBInput, setCInput, gPairsInput);
    if (!gRes.success || !gRes.result.isFunction) {
      return ResultFormatter.error(`Second mapping g is not a valid function: ${gRes.error || 'Check domain coverage'}`);
    }

    const fMap = new Map();
    fRes.result.pairs.forEach(p => fMap.set(`${typeof p.a}:${p.a}`, p.b));

    const gMap = new Map();
    gRes.result.pairs.forEach(p => gMap.set(`${typeof p.a}:${p.a}`, p.b));

    const compositePairs = [];
    const steps = [
      `1. Inner Function f: A → B: ${this.formatPairs(fRes.result.pairs)}`,
      `2. Outer Function g: B → C: ${this.formatPairs(gRes.result.pairs)}`,
      `3. Composition Evaluation (g ∘ f)(x) = g(f(x)) for each x ∈ A:`
    ];

    for (const a of fRes.result.setA) {
      const fb = fMap.get(`${typeof a}:${a}`);
      const gfb = gMap.get(`${typeof fb}:${fb}`);
      compositePairs.push({ a, b: gfb });
      steps.push(`   • x = ${a} ⟹ f(${a}) = ${fb} ⟹ g(${fb}) = ${gfb} ⟹ (g ∘ f)(${a}) = ${gfb}`);
    }

    steps.push(`4. Resulting Composite Function (g ∘ f): A → C:`);
    steps.push(`   (g ∘ f) = ${this.formatPairs(compositePairs)}`);

    const formulaStr = '(g ∘ f)(x) = g(f(x))   |   Domain(g ∘ f) = Domain(f)   |   Codomain(g ∘ f) = Codomain(g)';

    return ResultFormatter.success(
      {
        compositePairs,
        formattedComposite: this.formatPairs(compositePairs),
        fPairs: fRes.result.pairs,
        gPairs: gRes.result.pairs,
        setA: fRes.result.setA,
        setB: fRes.result.setB,
        setC: gRes.result.setB
      },
      steps,
      formulaStr
    );
  }
}
