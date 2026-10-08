/**
 * OG - Sets Mathematical Engine
 * Core calculations for Set Theory operations with rigorous step derivations & formulas.
 * ES6 Module
 *
 * Architecture:
 * UI -> Module Controller -> SetsMathEngine -> ResultFormatter -> UI
 */

import { ResultFormatter } from './formatter.js';

export class SetsMathEngine {
  /**
   * Parses flexible user input into a canonical sorted Array of distinct elements
   * Supports: "A = {1, 2, 3}", "{1, 2, 3}", "1, 2, 3", "1 2 3", "a, b, c", "∅", "{}"
   */
  static parseSet(input, paramName = 'Set') {
    if (input === null || input === undefined) {
      return { valid: false, elements: [], error: `${paramName} cannot be empty.`, formatted: '∅' };
    }

    if (Array.isArray(input)) {
      const sanitized = this._deduplicateAndSort(input);
      return { valid: true, elements: sanitized, error: null, formatted: this.formatSet(sanitized) };
    }

    if (typeof input !== 'string') {
      input = String(input);
    }

    let cleaned = input.trim();

    // Check for empty set representations
    if (!cleaned || cleaned === '∅' || cleaned === '{}' || cleaned.toLowerCase() === 'empty' || cleaned.toLowerCase() === 'null') {
      return { valid: true, elements: [], error: null, formatted: '∅' };
    }

    // Strip leading identifier e.g. "A =", "Set A =", "B:"
    cleaned = cleaned.replace(/^(?:set\s+)?[a-zA-Z0-9_]+\s*[:=]\s*/i, '');

    // Strip wrapping braces if present: { ... } or ( ... ) or [ ... ]
    cleaned = cleaned.trim();
    if ((cleaned.startsWith('{') && cleaned.endsWith('}')) ||
        (cleaned.startsWith('[') && cleaned.endsWith(']')) ||
        (cleaned.startsWith('(') && cleaned.endsWith(')'))) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    if (!cleaned) {
      return { valid: true, elements: [], error: null, formatted: '∅' };
    }

    // Split by commas, or if no comma, by whitespace
    let rawTokens = cleaned.includes(',') ? cleaned.split(',') : cleaned.split(/\s+/);

    const elements = [];
    for (let token of rawTokens) {
      token = token.trim();
      if (!token) continue;

      // Strip quotes if user entered "apple", 'banana'
      if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
        token = token.slice(1, -1).trim();
      }

      // Detect number
      if (!isNaN(token) && !isNaN(parseFloat(token)) && isFinite(token)) {
        elements.push(parseFloat(token));
      } else {
        elements.push(token);
      }
    }

    const uniqueSorted = this._deduplicateAndSort(elements);
    return {
      valid: true,
      elements: uniqueSorted,
      error: null,
      formatted: this.formatSet(uniqueSorted)
    };
  }

  /**
   * Deduplicates elements and sorts (numbers numerically, strings lexicographically)
   */
  static _deduplicateAndSort(arr) {
    const seen = new Set();
    const unique = [];

    for (const item of arr) {
      const key = typeof item === 'number' ? `num:${item}` : `str:${item}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique.sort((a, b) => {
      const aIsNum = typeof a === 'number';
      const bIsNum = typeof b === 'number';
      if (aIsNum && bIsNum) return a - b;
      if (aIsNum) return -1;
      if (bIsNum) return 1;
      return String(a).localeCompare(String(b));
    });
  }

  /**
   * Formats array of elements into set notation: "{1, 2, 3}" or "∅"
   */
  static formatSet(arr) {
    if (!arr || arr.length === 0) return '∅';
    return `{${arr.join(', ')}}`;
  }

  /**
   * Formats ordered pair: "(a, b)"
   */
  static formatPair(a, b) {
    return `(${a}, ${b})`;
  }

  // --------------------------------------------------------------------------
  // 1. UNION: A ∪ B
  // --------------------------------------------------------------------------
  static union(rawA, rawB, labelA = 'A', labelB = 'B') {
    const parseA = this.parseSet(rawA, labelA);
    if (!parseA.valid) return ResultFormatter.error(parseA.error);

    const parseB = this.parseSet(rawB, labelB);
    if (!parseB.valid) return ResultFormatter.error(parseB.error);

    const elementsA = parseA.elements;
    const elementsB = parseB.elements;
    const unionElements = this._deduplicateAndSort([...elementsA, ...elementsB]);
    const formattedResult = this.formatSet(unionElements);

    const steps = [
      `1. Given set ${labelA} = ${this.formatSet(elementsA)} with cardinality |${labelA}| = ${elementsA.length}.`,
      `2. Given set ${labelB} = ${this.formatSet(elementsB)} with cardinality |${labelB}| = ${elementsB.length}.`,
      `3. Apply Union definition: ${labelA} ∪ ${labelB} contains all elements belonging to ${labelA}, ${labelB}, or both.`,
      `4. Collect all elements: [${[...elementsA, ...elementsB].join(', ')}].`,
      `5. Eliminate duplicate entries and sort in canonical mathematical order.`,
      `6. Result: ${labelA} ∪ ${labelB} = ${formattedResult} with cardinality |${labelA} ∪ ${labelB}| = ${unionElements.length}.`
    ];

    return ResultFormatter.success(
      {
        elements: unionElements,
        formatted: formattedResult,
        cardinality: unionElements.length,
        operation: 'union',
        symbol: '∪'
      },
      steps,
      `${labelA} ∪ ${labelB} = {x | x ∈ ${labelA} ∨ x ∈ ${labelB}}`
    );
  }

  // --------------------------------------------------------------------------
  // 2. INTERSECTION: A ∩ B
  // --------------------------------------------------------------------------
  static intersection(rawA, rawB, labelA = 'A', labelB = 'B') {
    const parseA = this.parseSet(rawA, labelA);
    if (!parseA.valid) return ResultFormatter.error(parseA.error);

    const parseB = this.parseSet(rawB, labelB);
    if (!parseB.valid) return ResultFormatter.error(parseB.error);

    const elementsA = parseA.elements;
    const setB = new Set(parseB.elements.map(x => this._toKey(x)));

    const intersectionElements = elementsA.filter(x => setB.has(this._toKey(x)));
    const formattedResult = this.formatSet(intersectionElements);
    const isDisjoint = intersectionElements.length === 0;

    const steps = [
      `1. Identify elements of ${labelA} = ${this.formatSet(elementsA)}.`,
      `2. Identify elements of ${labelB} = ${this.formatSet(parseB.elements)}.`,
      `3. Apply Intersection definition: ${labelA} ∩ ${labelB} contains only elements present in both ${labelA} AND ${labelB}.`,
      isDisjoint
        ? `4. No common elements found between ${labelA} and ${labelB}. Sets are disjoint.`
        : `4. Common elements found: ${formattedResult}.`,
      `5. Result: ${labelA} ∩ ${labelB} = ${formattedResult} with cardinality |${labelA} ∩ ${labelB}| = ${intersectionElements.length}.`
    ];

    return ResultFormatter.success(
      {
        elements: intersectionElements,
        formatted: formattedResult,
        cardinality: intersectionElements.length,
        isDisjoint,
        operation: 'intersection',
        symbol: '∩'
      },
      steps,
      `${labelA} ∩ ${labelB} = {x | x ∈ ${labelA} ∧ x ∈ ${labelB}}`
    );
  }

  // --------------------------------------------------------------------------
  // 3. DIFFERENCE: A - B (or B - A)
  // --------------------------------------------------------------------------
  static difference(rawA, rawB, labelA = 'A', labelB = 'B') {
    const parseA = this.parseSet(rawA, labelA);
    if (!parseA.valid) return ResultFormatter.error(parseA.error);

    const parseB = this.parseSet(rawB, labelB);
    if (!parseB.valid) return ResultFormatter.error(parseB.error);

    const elementsA = parseA.elements;
    const setB = new Set(parseB.elements.map(x => this._toKey(x)));

    const diffElements = elementsA.filter(x => !setB.has(this._toKey(x)));
    const formattedResult = this.formatSet(diffElements);

    const steps = [
      `1. Given set ${labelA} = ${this.formatSet(elementsA)}.`,
      `2. Given set ${labelB} = ${this.formatSet(parseB.elements)}.`,
      `3. Apply Relative Complement (Difference): ${labelA} - ${labelB} contains elements in ${labelA} that do not belong to ${labelB}.`,
      `4. Filter out any element of ${labelA} that appears in ${labelB}.`,
      `5. Result: ${labelA} - ${labelB} = ${formattedResult} with cardinality |${labelA} - ${labelB}| = ${diffElements.length}.`
    ];

    return ResultFormatter.success(
      {
        elements: diffElements,
        formatted: formattedResult,
        cardinality: diffElements.length,
        operation: 'difference',
        symbol: '-'
      },
      steps,
      `${labelA} - ${labelB} = {x | x ∈ ${labelA} ∧ x ∉ ${labelB}}`
    );
  }

  // --------------------------------------------------------------------------
  // 4. SYMMETRIC DIFFERENCE: A Δ B
  // --------------------------------------------------------------------------
  static symmetricDifference(rawA, rawB, labelA = 'A', labelB = 'B') {
    const diffAB = this.difference(rawA, rawB, labelA, labelB);
    if (!diffAB.success) return diffAB;

    const diffBA = this.difference(rawB, rawA, labelB, labelA);
    if (!diffBA.success) return diffBA;

    const symDiff = this._deduplicateAndSort([...diffAB.result.elements, ...diffBA.result.elements]);
    const formattedResult = this.formatSet(symDiff);

    const steps = [
      `1. Symmetric Difference represents elements belonging to either ${labelA} or ${labelB}, but NOT to both.`,
      `2. Compute relative difference (${labelA} - ${labelB}) = ${diffAB.result.formatted}.`,
      `3. Compute relative difference (${labelB} - ${labelA}) = ${diffBA.result.formatted}.`,
      `4. Form union of differences: (${labelA} - ${labelB}) ∪ (${labelB} - ${labelA}).`,
      `5. Equivalent formula: (${labelA} ∪ ${labelB}) - (${labelA} ∩ ${labelB}).`,
      `6. Result: ${labelA} Δ ${labelB} = ${formattedResult} with cardinality |${labelA} Δ ${labelB}| = ${symDiff.length}.`
    ];

    return ResultFormatter.success(
      {
        elements: symDiff,
        formatted: formattedResult,
        cardinality: symDiff.length,
        diffAB: diffAB.result.elements,
        diffBA: diffBA.result.elements,
        operation: 'symmetricDifference',
        symbol: 'Δ'
      },
      steps,
      `${labelA} Δ ${labelB} = (${labelA} - ${labelB}) ∪ (${labelB} - ${labelA}) = (${labelA} ∪ ${labelB}) - (${labelA} ∩ ${labelB})`
    );
  }

  // --------------------------------------------------------------------------
  // 5. COMPLEMENT: A' (given Universal set U)
  // --------------------------------------------------------------------------
  static complement(rawA, rawU, labelA = 'A', labelU = 'U') {
    const parseA = this.parseSet(rawA, labelA);
    if (!parseA.valid) return ResultFormatter.error(parseA.error);

    let parseU = this.parseSet(rawU, labelU);
    if (!parseU.valid || parseU.elements.length === 0) {
      return ResultFormatter.error(`Universal Set ${labelU} is required to compute absolute complement.`);
    }

    const elementsU = parseU.elements;
    const setA = new Set(parseA.elements.map(x => this._toKey(x)));

    // Verify A ⊆ U
    const missingInU = parseA.elements.filter(x => !new Set(elementsU.map(u => this._toKey(u))).has(this._toKey(x)));
    if (missingInU.length > 0) {
      return ResultFormatter.error(`All elements of ${labelA} must belong to Universal Set ${labelU}. Elements not in ${labelU}: ${this.formatSet(missingInU)}`);
    }

    const complementElements = elementsU.filter(x => !setA.has(this._toKey(x)));
    const formattedResult = this.formatSet(complementElements);

    const steps = [
      `1. Universal set ${labelU} = ${this.formatSet(elementsU)} (|${labelU}| = ${elementsU.length}).`,
      `2. Target set ${labelA} = ${this.formatSet(parseA.elements)} (|${labelA}| = ${parseA.elements.length}).`,
      `3. Apply Absolute Complement definition: ${labelA}′ = ${labelU} - ${labelA} = {x ∈ ${labelU} | x ∉ ${labelA}}.`,
      `4. Filter out all members of ${labelA} from the universal domain ${labelU}.`,
      `5. Result: ${labelA}′ = ${formattedResult} with cardinality |${labelA}′| = ${complementElements.length}.`
    ];

    return ResultFormatter.success(
      {
        elements: complementElements,
        formatted: formattedResult,
        cardinality: complementElements.length,
        operation: 'complement',
        symbol: '′'
      },
      steps,
      `${labelA}′ = ${labelU} - ${labelA} = {x ∈ ${labelU} | x ∉ ${labelA}}`
    );
  }

  // --------------------------------------------------------------------------
  // 6. SUBSET: A ⊆ B
  // --------------------------------------------------------------------------
  static isSubset(rawA, rawB, labelA = 'A', labelB = 'B') {
    const parseA = this.parseSet(rawA, labelA);
    if (!parseA.valid) return ResultFormatter.error(parseA.error);

    const parseB = this.parseSet(rawB, labelB);
    if (!parseB.valid) return ResultFormatter.error(parseB.error);

    const elementsA = parseA.elements;
    const setB = new Set(parseB.elements.map(x => this._toKey(x)));

    const notInB = elementsA.filter(x => !setB.has(this._toKey(x)));
    const isSubset = notInB.length === 0;

    const steps = [
      `1. Check if every element of ${labelA} = ${this.formatSet(elementsA)} is contained in ${labelB} = ${this.formatSet(parseB.elements)}.`,
      `2. Formal definition: ${labelA} ⊆ ${labelB} ⟺ ∀x (x ∈ ${labelA} ⟹ x ∈ ${labelB}).`,
      elementsA.length === 0
        ? `3. ${labelA} is the empty set (∅). The empty set is a subset of every set by vacuous truth.`
        : (isSubset
          ? `3. Every element in ${labelA} was found in ${labelB}.`
          : `3. Found counterexamples in ${labelA} not present in ${labelB}: ${this.formatSet(notInB)}.`),
      `4. Conclusion: ${isSubset ? `Yes, ${labelA} ⊆ ${labelB} is TRUE.` : `No, ${labelA} ⊆ ${labelB} is FALSE.`}`
    ];

    return ResultFormatter.success(
      {
        isSubset,
        counterexamples: notInB,
        formatted: isSubset ? `${labelA} ⊆ ${labelB}` : `${labelA} ⊈ ${labelB}`,
        operation: 'subset',
        symbol: '⊆'
      },
      steps,
      `${labelA} ⊆ ${labelB} ⟺ ∀x (x ∈ ${labelA} ⟹ x ∈ ${labelB})`
    );
  }

  // --------------------------------------------------------------------------
  // 7. PROPER SUBSET: A ⊂ B
  // --------------------------------------------------------------------------
  static isProperSubset(rawA, rawB, labelA = 'A', labelB = 'B') {
    const subsetCheck = this.isSubset(rawA, rawB, labelA, labelB);
    if (!subsetCheck.success) return subsetCheck;

    const parseA = this.parseSet(rawA, labelA);
    const parseB = this.parseSet(rawB, labelB);

    const isSubset = subsetCheck.result.isSubset;
    const isDifferentSize = parseA.elements.length < parseB.elements.length;
    const isProperSubset = isSubset && isDifferentSize;

    const steps = [
      `1. A proper subset requires: (1) ${labelA} ⊆ ${labelB} AND (2) ${labelA} ≠ ${labelB}.`,
      `2. Subset check (${labelA} ⊆ ${labelB}): ${isSubset ? 'PASSED' : 'FAILED'}.`,
      `3. Cardinality comparison: |${labelA}| = ${parseA.elements.length}, |${labelB}| = ${parseB.elements.length}.`,
      isProperSubset
        ? `4. Since ${labelA} ⊆ ${labelB} and ${labelB} contains at least one element not in ${labelA}, ${labelA} is a strict proper subset.`
        : (isSubset
          ? `4. Even though ${labelA} ⊆ ${labelB}, ${labelA} is equal to ${labelB} (|${labelA}| = |${labelB}|), so it is not a PROPER subset.`
          : `4. Since ${labelA} is not even a subset of ${labelB}, it cannot be a proper subset.`),
      `5. Conclusion: ${isProperSubset ? `Yes, ${labelA} ⊂ ${labelB} is TRUE.` : `No, ${labelA} ⊂ ${labelB} is FALSE.`}`
    ];

    return ResultFormatter.success(
      {
        isProperSubset,
        isSubset,
        formatted: isProperSubset ? `${labelA} ⊂ ${labelB}` : `${labelA} ⊄ ${labelB}`,
        operation: 'properSubset',
        symbol: '⊂'
      },
      steps,
      `${labelA} ⊂ ${labelB} ⟺ (${labelA} ⊆ ${labelB}) ∧ (${labelA} ≠ ${labelB})`
    );
  }

  // --------------------------------------------------------------------------
  // 8. CARTESIAN PRODUCT: A × B
  // --------------------------------------------------------------------------
  static cartesianProduct(rawA, rawB, labelA = 'A', labelB = 'B', maxPairs = 64) {
    const parseA = this.parseSet(rawA, labelA);
    if (!parseA.valid) return ResultFormatter.error(parseA.error);

    const parseB = this.parseSet(rawB, labelB);
    if (!parseB.valid) return ResultFormatter.error(parseB.error);

    const elementsA = parseA.elements;
    const elementsB = parseB.elements;
    const totalPairs = elementsA.length * elementsB.length;

    const pairs = [];
    let truncated = false;

    for (const a of elementsA) {
      for (const b of elementsB) {
        if (pairs.length < maxPairs) {
          pairs.push({ a, b, formatted: this.formatPair(a, b) });
        } else {
          truncated = true;
          break;
        }
      }
      if (truncated) break;
    }

    const pairStrings = pairs.map(p => p.formatted);
    const formattedResult = totalPairs === 0
      ? '∅'
      : `{${pairStrings.join(', ')}${truncated ? ', ...' : ''}}`;

    const steps = [
      `1. Given |${labelA}| = ${elementsA.length} and |${labelB}| = ${elementsB.length}.`,
      `2. The Cartesian Product ${labelA} × ${labelB} is the set of all ordered pairs (a, b) where a ∈ ${labelA} and b ∈ ${labelB}.`,
      `3. Total number of ordered pairs: |${labelA} × ${labelB}| = |${labelA}| × |${labelB}| = ${elementsA.length} × ${elementsB.length} = ${totalPairs}.`,
      totalPairs === 0
        ? `4. Because at least one of the sets is empty, the Cartesian product is empty (∅).`
        : `4. Generate ordered pairs systematically by pairing each element of ${labelA} with each element of ${labelB}.`,
      `5. Result: ${labelA} × ${labelB} = ${formattedResult} (${totalPairs} pairs total).`
    ];

    return ResultFormatter.success(
      {
        pairs,
        totalPairs,
        truncated,
        formatted: formattedResult,
        operation: 'cartesianProduct',
        symbol: '×'
      },
      steps,
      `${labelA} × ${labelB} = {(a, b) | a ∈ ${labelA} ∧ b ∈ ${labelB}}, |${labelA} × ${labelB}| = |${labelA}| ⋅ |${labelB}|`
    );
  }

  // --------------------------------------------------------------------------
  // 9. CARDINALITY: |A|
  // --------------------------------------------------------------------------
  static cardinality(rawSet, label = 'A') {
    const parse = this.parseSet(rawSet, label);
    if (!parse.valid) return ResultFormatter.error(parse.error);

    const count = parse.elements.length;
    const steps = [
      `1. Given set ${label} = ${parse.formatted}.`,
      `2. Cardinality n(${label}) or |${label}| measures the number of distinct elements in the set.`,
      `3. Counting distinct elements: ${count}.`,
      `4. Result: |${label}| = ${count}.`
    ];

    return ResultFormatter.success(
      {
        cardinality: count,
        elements: parse.elements,
        formatted: String(count),
        operation: 'cardinality',
        symbol: '|•|'
      },
      steps,
      `n(${label}) = |${label}|`
    );
  }

  // --------------------------------------------------------------------------
  // 10. POWER SET: P(A)
  // --------------------------------------------------------------------------
  static powerSet(rawSet, label = 'A', maxSubsets = 64) {
    const parse = this.parseSet(rawSet, label);
    if (!parse.valid) return ResultFormatter.error(parse.error);

    const elements = parse.elements;
    const n = elements.length;

    if (n > 12) {
      return ResultFormatter.error(`Set size (${n}) is too large to compute power set. Maximum supported cardinality is 12 (2¹² = 4,096 subsets).`);
    }

    const totalSubsets = Math.pow(2, n);
    const subsets = [];
    let truncated = false;

    // Generate subsets using binary bitmask
    for (let i = 0; i < totalSubsets; i++) {
      if (subsets.length >= maxSubsets) {
        truncated = true;
        break;
      }

      const subset = [];
      for (let j = 0; j < n; j++) {
        if ((i & (1 << j)) !== 0) {
          subset.push(elements[j]);
        }
      }
      subsets.push(subset);
    }

    // Sort subsets by size then elements for beautiful display
    subsets.sort((a, b) => a.length - b.length);

    const subsetStrings = subsets.map(s => this.formatSet(s));
    const formattedResult = `{${subsetStrings.join(', ')}${truncated ? ', ...' : ''}}`;

    const steps = [
      `1. Given set ${label} = ${parse.formatted} with cardinality n = ${n}.`,
      `2. The power set 𝒫(${label}) is the set of ALL possible subsets of ${label}, including the empty set ∅ and ${label} itself.`,
      `3. Cardinality theorem: |𝒫(${label})| = 2ⁿ = 2^${n} = ${totalSubsets} subsets.`,
      `4. Subsets grouped by size:`,
      `   • Size 0 (empty set): ∅`,
      n > 0 ? `   • Size 1 (singletons): ${elements.map(e => `{${e}}`).join(', ')}` : '',
      n >= 2 ? `   • Intermediate combinations up to size ${n - 1}` : '',
      n > 0 ? `   • Size ${n} (full set): ${parse.formatted}` : '',
      `5. Result: 𝒫(${label}) has ${totalSubsets} subsets.`
    ].filter(Boolean);

    return ResultFormatter.success(
      {
        subsets,
        totalSubsets,
        truncated,
        formatted: formattedResult,
        operation: 'powerSet',
        symbol: '𝒫(•)'
      },
      steps,
      `|𝒫(${label})| = 2^{|${label}|}`
    );
  }

  // --------------------------------------------------------------------------
  // COMPREHENSIVE BATCH EVALUATION
  // --------------------------------------------------------------------------
  static calculateAll(rawA, rawB, rawU = null) {
    const parseA = this.parseSet(rawA, 'A');
    if (!parseA.valid) return ResultFormatter.error(parseA.error);

    const parseB = this.parseSet(rawB, 'B');
    if (!parseB.valid) return ResultFormatter.error(parseB.error);

    // If U is not explicitly provided, default U to A ∪ B with a few domain supersets
    let elementsU;
    if (rawU !== null && rawU !== undefined && String(rawU).trim() !== '') {
      const parseU = this.parseSet(rawU, 'U');
      if (!parseU.valid) return ResultFormatter.error(parseU.error);
      elementsU = parseU.elements;
    } else {
      // Default universal set: A ∪ B (or {1..10} if numeric)
      elementsU = this._deduplicateAndSort([...parseA.elements, ...parseB.elements]);
    }

    const unionRes = this.union(parseA.elements, parseB.elements, 'A', 'B');
    const intersectRes = this.intersection(parseA.elements, parseB.elements, 'A', 'B');
    const diffABRes = this.difference(parseA.elements, parseB.elements, 'A', 'B');
    const diffBARes = this.difference(parseB.elements, parseA.elements, 'B', 'A');
    const symDiffRes = this.symmetricDifference(parseA.elements, parseB.elements, 'A', 'B');
    const complementARes = this.complement(parseA.elements, elementsU, 'A', 'U');
    const complementBRes = this.complement(parseB.elements, elementsU, 'B', 'U');
    const subsetABRes = this.isSubset(parseA.elements, parseB.elements, 'A', 'B');
    const subsetBARes = this.isSubset(parseB.elements, parseA.elements, 'B', 'A');
    const properSubsetABRes = this.isProperSubset(parseA.elements, parseB.elements, 'A', 'B');
    const cartesianABRes = this.cartesianProduct(parseA.elements, parseB.elements, 'A', 'B');
    const powerSetARes = this.powerSet(parseA.elements, 'A');
    const powerSetBRes = this.powerSet(parseB.elements, 'B');

    // Venn Regions Breakdown:
    // Region A only = A - B
    // Region AB = A ∩ B
    // Region B only = B - A
    // Region Outside = U - (A ∪ B)
    const setAUnionB = new Set(unionRes.result.elements.map(x => this._toKey(x)));
    const outsideElements = elementsU.filter(x => !setAUnionB.has(this._toKey(x)));

    const vennData = {
      onlyA: diffABRes.result.elements,
      intersection: intersectRes.result.elements,
      onlyB: diffBARes.result.elements,
      outside: outsideElements,
      universal: elementsU,
      cardinalities: {
        A: parseA.elements.length,
        B: parseB.elements.length,
        onlyA: diffABRes.result.elements.length,
        intersection: intersectRes.result.elements.length,
        onlyB: diffBARes.result.elements.length,
        outside: outsideElements.length,
        union: unionRes.result.elements.length,
        universal: elementsU.length
      }
    };

    return ResultFormatter.success(
      {
        setA: parseA.elements,
        setB: parseB.elements,
        setU: elementsU,
        formattedA: parseA.formatted,
        formattedB: parseB.formatted,
        formattedU: this.formatSet(elementsU),
        union: unionRes,
        intersection: intersectRes,
        diffAB: diffABRes,
        diffBA: diffBARes,
        symDiff: symDiffRes,
        complementA: complementARes,
        complementB: complementBRes,
        subsetAB: subsetABRes,
        subsetBA: subsetBARes,
        properSubsetAB: properSubsetABRes,
        cartesianAB: cartesianABRes,
        powerSetA: powerSetARes,
        powerSetB: powerSetBRes,
        vennData
      },
      [
        `Successfully evaluated all 10 set theory operations for sets A = ${parseA.formatted} and B = ${parseB.formatted} under universal domain U = ${this.formatSet(elementsU)}.`
      ],
      'Set Theory Fundamental Operations'
    );
  }

  static _toKey(item) {
    return typeof item === 'number' ? `num:${item}` : `str:${item}`;
  }
}
