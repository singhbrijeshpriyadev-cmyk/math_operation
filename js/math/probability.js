/**
 * OG - Probability Math Engine
 * Comprehensive probability calculation and simulation engine:
 * 13. Probability Calculator (Unified evaluator)
 * 14. Sample Space & Events (Coin, Dice, Two Dice, Cards, Custom; A ∪ B, A ∩ B, A', A - B)
 * 15. Classical Probability (P(A) = favorable / total, Exact fraction, Decimal, Percentage)
 * 16. Addition & Multiplication Rules (Mutually exclusive vs general, Independent vs dependent)
 * 17. Conditional Probability (P(A|B) = P(A ∩ B) / P(B), with division-by-zero protection)
 * 18. Bayes' Theorem Solver (Multi-hypothesis partition, Prior, Likelihood, Evidence, Posterior)
 * 19. Independent & Dependent Events (Independence test, With vs without replacement)
 * 20. Permutations & Combinations Integration (nPr, nCr counting probabilities)
 * 21. Random Experiment Simulation Lab (10 to 100,000 trials, convergence, theoretical vs experimental)
 * 22. Probability Distributions (Bernoulli & Binomial PMF, mean, variance)
 * 23. Expected Value & Variance (E(X), Var(X), σ, validation ∑pᵢ = 1)
 * 24. 2x2 Contingency Table solver
 *
 * ES6 Module
 */

import { ResultFormatter } from './formatter.js';
import { CombinatoricsMathEngine } from './combinatorics.js';

export class ProbabilityMathEngine {
  /**
   * Greatest Common Divisor
   */
  static gcd(a, b) {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y !== 0) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  /**
   * Convert a rational number or favorable/total pair to exact fraction
   */
  static toFraction(numerator, denominator = 1) {
    if (denominator === 0) return { num: 0, den: 0, str: 'Undefined (Zero Denominator)' };
    if (numerator === 0) return { num: 0, den: 1, str: '0' };

    // Handle floating numerator or denominator
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
      const precision = 100000;
      const num = Math.round((numerator / denominator) * precision);
      const g = this.gcd(num, precision);
      const simpNum = num / g;
      const simpDen = precision / g;
      return { num: simpNum, den: simpDen, str: simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}` };
    }

    const g = this.gcd(numerator, denominator);
    const sign = (numerator < 0) ^ (denominator < 0) ? -1 : 1;
    const simpNum = sign * (Math.abs(numerator) / g);
    const simpDen = Math.abs(denominator) / g;

    return {
      num: simpNum,
      den: simpDen,
      str: simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`
    };
  }

  /**
   * Format probability into exact fraction, decimal, and percentage with precision
   */
  static formatProbability(prob, favorable = null, total = null, precision = 4) {
    const p = Math.max(0, Math.min(1, Number(prob)));
    let fractionStr;

    if (favorable !== null && total !== null && total > 0) {
      fractionStr = this.toFraction(favorable, total).str;
    } else {
      fractionStr = this.toFraction(p * 10000, 10000).str;
    }

    const decStr = p.toFixed(precision);
    const pctStr = (p * 100).toFixed(precision) + '%';

    return {
      value: p,
      exact: fractionStr,
      decimal: decStr,
      percentage: pctStr,
      display: `${fractionStr} (${decStr} / ${pctStr})`
    };
  }

  /**
   * 15. Classical Probability: P(A) = favorable / total
   */
  static classicalProbability(favorableInput, totalInput, precision = 4) {
    const favorable = Number(favorableInput);
    const total = Number(totalInput);

    if (!Number.isFinite(favorable) || !Number.isFinite(total)) {
      return ResultFormatter.error('Both favorable and total outcomes must be valid numbers.');
    }
    if (total <= 0) {
      return ResultFormatter.error('Total outcomes in sample space must be strictly greater than 0.');
    }
    if (favorable < 0) {
      return ResultFormatter.error('Favorable outcomes cannot be negative.');
    }
    if (favorable > total) {
      return ResultFormatter.error(`Favorable outcomes (${favorable}) cannot exceed total outcomes (${total}).`);
    }

    const p = favorable / total;
    const formatted = this.formatProbability(p, favorable, total, precision);

    const steps = [
      `1. Total Sample Space Size: n(S) = ${total}`,
      `2. Favorable Event Outcomes: n(A) = ${favorable}`,
      `3. Classical Probability Formula: P(A) = n(A) / n(S)`,
      `4. Substitution: P(A) = ${favorable} / ${total}`,
      `5. Exact Fraction: ${formatted.exact}`,
      `6. Decimal Representation: ${formatted.decimal}`,
      `7. Percentage: ${formatted.percentage}`
    ];

    const derivation7Stage = {
      problem: `Find probability of event with ${favorable} favorable outcomes out of ${total} total outcomes.`,
      data: `Favorable n(A) = ${favorable}, Total n(S) = ${total}`,
      formula: `P(A) = n(A) / n(S)`,
      substitution: `P(A) = ${favorable} / ${total}`,
      calculation: `Exact = ${formatted.exact}, Decimal = ${formatted.decimal}, Percentage = ${formatted.percentage}`,
      result: `P(A) = ${formatted.exact} = ${formatted.decimal} (${formatted.percentage})`,
      interpretation: `Out of ${total} equally likely outcomes, the event is expected to occur in ${formatted.percentage} of trials.`
    };

    return ResultFormatter.success({
      favorable,
      total,
      ...formatted,
      derivation7Stage
    }, steps, 'Classical Probability');
  }

  /**
   * 14. Sample Space Builder & Predicate Filtering
   * Generates sample space for Coin, Dice, Two Dice, Deck of Cards, or Custom set.
   */
  static getSampleSpace(type = 'coin') {
    switch (type.toLowerCase()) {
      case 'coin':
        return {
          type: 'Coin Toss',
          elements: ['H', 'T'],
          descriptions: ['Heads (H)', 'Tails (T)'],
          total: 2
        };
      case 'two-coins':
        return {
          type: 'Two Coins',
          elements: ['HH', 'HT', 'TH', 'TT'],
          descriptions: ['Two Heads', 'Head then Tail', 'Tail then Head', 'Two Tails'],
          total: 4
        };
      case 'dice':
      case 'die':
        return {
          type: 'Single Die',
          elements: [1, 2, 3, 4, 5, 6],
          descriptions: ['1', '2', '3', '4', '5', '6'],
          total: 6
        };
      case 'two-dice': {
        const pairs = [];
        const descriptions = [];
        for (let d1 = 1; d1 <= 6; d1++) {
          for (let d2 = 1; d2 <= 6; d2++) {
            pairs.push(`(${d1}, ${d2})`);
            descriptions.push(`Die 1: ${d1}, Die 2: ${d2} (Sum = ${d1 + d2})`);
          }
        }
        return {
          type: 'Two Fair Dice',
          elements: pairs,
          descriptions,
          total: 36
        };
      }
      case 'cards': {
        const suits = ['♠ Spades', '♥ Hearts', '♦ Diamonds', '♣ Clubs'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const cards = [];
        for (const s of suits) {
          for (const r of ranks) {
            cards.push(`${r} ${s}`);
          }
        }
        return {
          type: 'Standard 52-Card Deck',
          elements: cards,
          descriptions: cards,
          total: 52
        };
      }
      default:
        return {
          type: 'Custom Sample Space',
          elements: ['A', 'B', 'C', 'D'],
          descriptions: ['Outcome A', 'Outcome B', 'Outcome C', 'Outcome D'],
          total: 4
        };
    }
  }

  /**
   * Filter events in a sample space by predefined or custom criteria
   */
  static filterSampleSpaceEvent(spaceType, condition) {
    const space = this.getSampleSpace(spaceType);
    let favorable = [];

    const cond = condition.toLowerCase().trim();

    if (spaceType === 'die' || spaceType === 'dice') {
      if (cond === 'even') favorable = [2, 4, 6];
      else if (cond === 'odd') favorable = [1, 3, 5];
      else if (cond === 'prime') favorable = [2, 3, 5];
      else if (cond === 'greater-than-4') favorable = [5, 6];
      else if (cond === '6' || cond === 'six') favorable = [6];
      else {
        const num = parseInt(cond, 10);
        if (!isNaN(num) && num >= 1 && num <= 6) favorable = [num];
      }
    } else if (spaceType === 'two-dice') {
      const targetSum = parseInt(cond.replace(/\D/g, ''), 10);
      if (!isNaN(targetSum) && targetSum >= 2 && targetSum <= 12) {
        for (let d1 = 1; d1 <= 6; d1++) {
          for (let d2 = 1; d2 <= 6; d2++) {
            if (d1 + d2 === targetSum) favorable.push(`(${d1}, ${d2})`);
          }
        }
      } else if (cond.includes('double') || cond.includes('same')) {
        favorable = ['(1, 1)', '(2, 2)', '(3, 3)', '(4, 4)', '(5, 5)', '(6, 6)'];
      }
    } else if (spaceType === 'coin') {
      if (cond === 'h' || cond === 'head' || cond === 'heads') favorable = ['H'];
      else if (cond === 't' || cond === 'tail' || cond === 'tails') favorable = ['T'];
    } else if (spaceType === 'cards') {
      if (cond.includes('ace')) favorable = space.elements.filter(c => c.startsWith('A '));
      else if (cond.includes('face')) favorable = space.elements.filter(c => c.startsWith('J ') || c.startsWith('Q ') || c.startsWith('K '));
      else if (cond.includes('spade')) favorable = space.elements.filter(c => c.includes('Spades'));
      else if (cond.includes('heart')) favorable = space.elements.filter(c => c.includes('Hearts'));
      else if (cond.includes('red')) favorable = space.elements.filter(c => c.includes('Hearts') || c.includes('Diamonds'));
      else if (cond.includes('black')) favorable = space.elements.filter(c => c.includes('Spades') || c.includes('Clubs'));
    }

    // Fallback if not matched: take first element
    if (favorable.length === 0) favorable = [space.elements[0]];

    const probRes = this.classicalProbability(favorable.length, space.total);
    return {
      space,
      condition,
      favorableOutcomes: favorable,
      favorableCount: favorable.length,
      totalCount: space.total,
      probability: probRes.result
    };
  }

  /**
   * 16. Two Events Algebra & Addition/Multiplication Rules
   */
  static twoEvents(pAInput, pBInput, pInterInput = null, precision = 4) {
    const pA = Number(pAInput);
    const pB = Number(pBInput);

    if (pA < 0 || pA > 1 || pB < 0 || pB > 1) {
      return ResultFormatter.error('Probabilities P(A) and P(B) must lie in the closed interval [0, 1].');
    }

    // Default intersection: if null/undefined, assume independent events
    let pInter;
    let assumedIndependent = false;
    if (pInterInput !== undefined && pInterInput !== null && String(pInterInput).trim() !== '') {
      pInter = Number(pInterInput);
      if (pInter < 0 || pInter > Math.min(pA, pB)) {
        return ResultFormatter.error(`Intersection P(A ∩ B) must be in [0, min(P(A), P(B))] = [0, ${Math.min(pA, pB)}]. Received: ${pInter}.`);
      }
    } else {
      pInter = pA * pB;
      assumedIndependent = true;
    }

    // Addition Rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
    const pUnionRaw = pA + pB - pInter;
    if (pUnionRaw > 1.0000001) {
      return ResultFormatter.error(`Invalid probabilities: P(A) + P(B) - P(A ∩ B) = ${pUnionRaw.toFixed(4)} which exceeds 1.`);
    }
    const pUnion = Math.min(1, Math.max(0, pUnionRaw));

    // Complements: P(A'), P(B')
    const pNotA = 1 - pA;
    const pNotB = 1 - pB;

    // Difference: P(A - B) = P(A) - P(A ∩ B)
    const pAminusB = Math.max(0, pA - pInter);
    const pBminusA = Math.max(0, pB - pInter);

    // Conditional Probabilities
    let pAgivenB = null;
    let pAgivenBFormatted = null;
    if (pB > 0) {
      pAgivenB = pInter / pB;
      pAgivenBFormatted = this.formatProbability(pAgivenB, null, null, precision);
    }

    let pBgivenA = null;
    let pBgivenAFormatted = null;
    if (pA > 0) {
      pBgivenA = pInter / pA;
      pBgivenAFormatted = this.formatProbability(pBgivenA, null, null, precision);
    }

    // Independence verification: P(A ∩ B) == P(A) * P(B)
    const independentProduct = pA * pB;
    const isIndependent = Math.abs(pInter - independentProduct) < 1e-5;

    // Mutual exclusivity verification: P(A ∩ B) == 0
    const isMutuallyExclusive = Math.abs(pInter) < 1e-9;

    const fA = this.formatProbability(pA, null, null, precision);
    const fB = this.formatProbability(pB, null, null, precision);
    const fInter = this.formatProbability(pInter, null, null, precision);
    const fUnion = this.formatProbability(pUnion, null, null, precision);
    const fNotA = this.formatProbability(pNotA, null, null, precision);
    const fNotB = this.formatProbability(pNotB, null, null, precision);
    const fAminusB = this.formatProbability(pAminusB, null, null, precision);

    const steps = [
      `1. Inputs: P(A) = ${fA.decimal}, P(B) = ${fB.decimal}, P(A ∩ B) = ${fInter.decimal} ${assumedIndependent ? '(Assumed independent P(A)·P(B))' : ''}`,
      `2. Complements: P(A') = 1 - P(A) = ${fNotA.decimal} | P(B') = 1 - P(B) = ${fNotB.decimal}`,
      `3. Addition Rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = ${fA.decimal} + ${fB.decimal} - ${fInter.decimal} = ${fUnion.decimal} (${fUnion.percentage})`,
      `   Note: ${isMutuallyExclusive ? 'Since P(A ∩ B) = 0, events are Mutually Exclusive: P(A ∪ B) = P(A) + P(B).' : 'General Addition Rule applied.'}`,
      `4. Event Difference: P(A - B) = P(A) - P(A ∩ B) = ${fAminusB.decimal}`,
      `5. Conditional Probability P(A|B): ${pB > 0 ? `P(A ∩ B) / P(B) = ${fInter.decimal} / ${fB.decimal} = ${pAgivenBFormatted.decimal} (${pAgivenBFormatted.percentage})` : 'Undefined (Conditioning event P(B) = 0)'}`,
      `6. Conditional Probability P(B|A): ${pA > 0 ? `P(A ∩ B) / P(A) = ${fInter.decimal} / ${fA.decimal} = ${pBgivenAFormatted.decimal} (${pBgivenAFormatted.percentage})` : 'Undefined (Conditioning event P(A) = 0)'}`,
      `7. Independence Verification: P(A) · P(B) = ${independentProduct.toFixed(precision)}. Comparison with P(A ∩ B) = ${fInter.decimal}: ${isIndependent ? 'Events A and B are INDEPENDENT' : 'Events A and B are DEPENDENT'}`,
      `8. Mutual Exclusivity: P(A ∩ B) = ${fInter.decimal} ⟹ ${isMutuallyExclusive ? 'Events are MUTUALLY EXCLUSIVE' : 'Events are NOT mutually exclusive'}`
    ];

    const derivation7Stage = {
      problem: `Analyze event algebra for events A and B with P(A) = ${pA}, P(B) = ${pB}, P(A ∩ B) = ${pInter}.`,
      data: `P(A) = ${pA}, P(B) = ${pB}, P(A ∩ B) = ${pInter}`,
      formula: `P(A ∪ B) = P(A) + P(B) - P(A ∩ B) | P(A|B) = P(A ∩ B)/P(B) | Independence: P(A ∩ B) = P(A)P(B)`,
      substitution: `P(A ∪ B) = ${pA} + ${pB} - ${pInter} | P(A|B) = ${pInter} / ${pB}`,
      calculation: `Union = ${fUnion.decimal}, P(A|B) = ${pAgivenBFormatted ? pAgivenBFormatted.decimal : 'N/A'}, Independent = ${isIndependent}`,
      result: `P(A ∪ B) = ${fUnion.decimal} | P(A|B) = ${pAgivenBFormatted ? pAgivenBFormatted.decimal : 'Undefined'} | Independence = ${isIndependent ? 'Yes' : 'No'}`,
      interpretation: `The probability of at least one event occurring is ${fUnion.percentage}. The events are ${isIndependent ? 'statistically independent' : 'statistically dependent'}.`
    };

    return ResultFormatter.success({
      pA: fA,
      pB: fB,
      pInter: fInter,
      pUnion: fUnion,
      pNotA: fNotA,
      pNotB: fNotB,
      pAminusB: fAminusB,
      pAgivenB: pAgivenBFormatted,
      pBgivenA: pBgivenAFormatted,
      isIndependent,
      isMutuallyExclusive,
      derivation7Stage
    }, steps, 'Event Algebra & Rules');
  }

  /**
   * 17. Conditional Probability: P(A|B) = P(A ∩ B) / P(B)
   */
  static conditionalProbability(pInterInput, pConditioningInput, precision = 4) {
    const pInter = Number(pInterInput);
    const pB = Number(pConditioningInput);

    if (pB < 0 || pB > 1) {
      return ResultFormatter.error('Conditioning probability P(B) must be between 0 and 1.');
    }
    if (pB === 0) {
      return ResultFormatter.error('Conditioning event has probability 0; conditional probability P(A|B) is mathematically undefined (division by zero).');
    }
    if (pInter < 0 || pInter > pB) {
      return ResultFormatter.error(`Intersection P(A ∩ B) (${pInter}) cannot be negative or exceed conditioning probability P(B) (${pB}).`);
    }

    const pAgivenB = pInter / pB;
    const formatted = this.formatProbability(pAgivenB, null, null, precision);
    const fInter = this.formatProbability(pInter, null, null, precision);
    const fB = this.formatProbability(pB, null, null, precision);

    const steps = [
      `1. Conditioning Event Probability: P(B) = ${fB.decimal}`,
      `2. Joint Intersection Probability: P(A ∩ B) = ${fInter.decimal}`,
      `3. Conditional Probability Formula: P(A|B) = P(A ∩ B) / P(B)`,
      `4. Substitution: P(A|B) = ${fInter.decimal} / ${fB.decimal}`,
      `5. Result: ${formatted.exact} = ${formatted.decimal} (${formatted.percentage})`
    ];

    const derivation7Stage = {
      problem: `Evaluate conditional probability P(A|B) given P(A ∩ B) = ${pInter} and P(B) = ${pB}.`,
      data: `Joint P(A ∩ B) = ${pInter}, Conditioning P(B) = ${pB}`,
      formula: `P(A|B) = P(A ∩ B) / P(B)`,
      substitution: `P(A|B) = ${pInter} / ${pB}`,
      calculation: `P(A|B) = ${formatted.decimal}`,
      result: `P(A|B) = ${formatted.exact} = ${formatted.decimal} (${formatted.percentage})`,
      interpretation: `Given that event B has occurred, the updated likelihood of event A occurring is ${formatted.percentage}.`
    };

    return ResultFormatter.success({
      pInter: fInter,
      pB: fB,
      pAgivenB: formatted,
      derivation7Stage
    }, steps, 'Conditional Probability');
  }

  /**
   * 18. Bayes' Theorem Solver
   * Supports multi-hypothesis partitions E1, E2, ... En
   * partitions: [{ name: 'E1', prior: 0.5, likelihood: 0.4 }]
   */
  static bayesTheorem(partitions, precision = 4) {
    if (!Array.isArray(partitions) || partitions.length < 2) {
      return ResultFormatter.error("Bayes' Theorem requires at least two partition hypotheses (E₁, E₂).");
    }

    // Validate priors
    let priorSum = 0;
    for (let i = 0; i < partitions.length; i++) {
      const p = partitions[i];
      const prior = Number(p.prior);
      const like = Number(p.likelihood);
      if (prior < 0 || prior > 1 || like < 0 || like > 1) {
        return ResultFormatter.error(`Hypothesis ${p.name || i + 1}: Prior and likelihood must lie in [0, 1].`);
      }
      priorSum += prior;
    }

    if (Math.abs(priorSum - 1) > 0.005) {
      return ResultFormatter.error(`Sum of prior probabilities must equal 1 (100%). Received sum: ${priorSum.toFixed(4)}.`);
    }

    // Law of Total Probability: P(A) = ∑ P(A|E_i) * P(E_i)
    let totalEvidence = 0;
    const jointList = [];

    partitions.forEach((p, idx) => {
      const joint = p.prior * p.likelihood;
      jointList.push(joint);
      totalEvidence += joint;
    });

    if (totalEvidence <= 0) {
      return ResultFormatter.error('Total evidence probability P(A) = 0. Observed event A cannot occur under any hypothesis.');
    }

    // Posterior probabilities: P(E_i|A) = (P(A|E_i) * P(E_i)) / P(A)
    const results = partitions.map((p, idx) => {
      const posteriorVal = jointList[idx] / totalEvidence;
      return {
        name: p.name || `E${idx + 1}`,
        prior: this.formatProbability(p.prior, null, null, precision),
        likelihood: this.formatProbability(p.likelihood, null, null, precision),
        joint: this.formatProbability(jointList[idx], null, null, precision),
        posterior: this.formatProbability(posteriorVal, null, null, precision)
      };
    });

    const fEvidence = this.formatProbability(totalEvidence, null, null, precision);

    const steps = [
      `1. Hypotheses Partition & Priors:`,
      ...partitions.map((p, i) => `   • P(${p.name || `E${i + 1}`}) = ${p.prior}, Likelihood P(A|${p.name || `E${i + 1}`}) = ${p.likelihood}`),
      `2. Law of Total Probability (Evidence P(A)):`,
      `   P(A) = ∑ [P(A|Eᵢ) · P(Eᵢ)] = ${partitions.map((p, i) => `(${p.likelihood} × ${p.prior})`).join(' + ')} = ${fEvidence.decimal} (${fEvidence.percentage})`,
      `3. Bayes' Theorem Posterior Calculations: P(Eᵢ|A) = [P(A|Eᵢ) · P(Eᵢ)] / P(A):`,
      ...results.map(r => `   • P(${r.name}|A) = ${r.joint.decimal} / ${fEvidence.decimal} = ${r.posterior.decimal} (${r.posterior.percentage})`)
    ];

    const derivation7Stage = {
      problem: `Update probabilities of ${partitions.length} hypotheses given observed evidence A using Bayes' Theorem.`,
      data: `Priors: ${partitions.map(p => `${p.name}=${p.prior}`).join(', ')}. Likelihoods: ${partitions.map(p => `P(A|${p.name})=${p.likelihood}`).join(', ')}`,
      formula: `P(Eᵢ|A) = [P(A|Eᵢ) · P(Eᵢ)] / ∑ [P(A|Eⱼ) · P(Eⱼ)]`,
      substitution: `Evidence P(A) = ${fEvidence.decimal}. Posteriors = joint / P(A)`,
      calculation: results.map(r => `${r.name}: ${r.posterior.percentage}`).join(' | '),
      result: `Posteriors: ${results.map(r => `P(${r.name}|A) = ${r.posterior.decimal}`).join(', ')}`,
      interpretation: `After observing evidence A, the most probable hypothesis is "${results.reduce((a, b) => a.posterior.value > b.posterior.value ? a : b).name}".`
    };

    return ResultFormatter.success({
      partitions: results,
      totalEvidence: fEvidence,
      derivation7Stage
    }, steps, "Bayes' Theorem");
  }

  /**
   * 19. Dependent Events: Drawing with vs without replacement
   */
  static drawingExperiment(redCount, blueCount, drawCount = 2, withReplacement = false, precision = 4) {
    const R = Math.max(0, parseInt(redCount, 10));
    const B = Math.max(0, parseInt(blueCount, 10));
    const total = R + B;

    if (total === 0) {
      return ResultFormatter.error('Urn must contain at least 1 object.');
    }

    // Probability of drawing 2 Red balls
    let pTwoRed;
    let explanation;

    if (withReplacement) {
      const p1 = R / total;
      const p2 = R / total;
      pTwoRed = p1 * p2;
      explanation = `With replacement: trials are independent. P(R₁) = ${R}/${total}, P(R₂) = ${R}/${total}. P(R₁ ∩ R₂) = (${R}/${total}) × (${R}/${total}) = ${pTwoRed.toFixed(precision)}.`;
    } else {
      if (total < 2) {
        return ResultFormatter.error('Cannot draw 2 objects without replacement from an urn with only 1 object.');
      }
      const p1 = R / total;
      const p2 = (R - 1) / (total - 1);
      pTwoRed = Math.max(0, p1 * p2);
      explanation = `Without replacement: trials are dependent. P(R₁) = ${R}/${total}. After drawing 1 red ball, remaining are ${R - 1} red out of ${total - 1} total: P(R₂|R₁) = ${R - 1}/${total - 1}. P(R₁ ∩ R₂) = (${R}/${total}) × (${R - 1}/${total - 1}) = ${pTwoRed.toFixed(precision)}.`;
    }

    const formatted = this.formatProbability(pTwoRed, null, null, precision);

    return ResultFormatter.success({
      redCount: R,
      blueCount: B,
      totalObjects: total,
      withReplacement,
      probabilityTwoRed: formatted,
      explanation
    }, [
      `1. Urn Contents: ${R} Red, ${B} Blue (Total = ${total})`,
      `2. Sampling Mode: ${withReplacement ? 'With Replacement (Independent)' : 'Without Replacement (Dependent)'}`,
      `3. ${explanation}`,
      `4. Final Probability: ${formatted.exact} = ${formatted.decimal} (${formatted.percentage})`
    ]);
  }

  /**
   * Helper nCr method connecting to CombinatoricsMathEngine
   */
  static nCr(n, r) {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    const res = CombinatoricsMathEngine.combination(n, r);
    if (res && res.success && res.result && res.result.value) {
      return Number(res.result.value);
    }
    let c = 1;
    const effR = Math.min(r, n - r);
    for (let i = 1; i <= effR; i++) {
      c = (c * (n - i + 1)) / i;
    }
    return Math.round(c);
  }

  /**
   * Helper nPr method connecting to CombinatoricsMathEngine
   */
  static nPr(n, r) {
    if (r < 0 || r > n) return 0;
    if (r === 0) return 1;
    const res = CombinatoricsMathEngine.permutation(n, r);
    if (res && res.success && res.result && res.result.value) {
      return Number(res.result.value);
    }
    let p = 1;
    for (let i = 0; i < r; i++) {
      p *= (n - i);
    }
    return p;
  }

  /**
   * 20. Permutations and Combinations Counting-Based Probability Integration
   * Select r items from n total, with favorable combinations
   */
  static countingProbability(favorableN, favorableR, totalN, totalR, precision = 4) {
    const favValidation = CombinatoricsMathEngine.validateNR(favorableN, favorableR);
    const totalValidation = CombinatoricsMathEngine.validateNR(totalN, totalR);

    if (!favValidation.valid) return ResultFormatter.error(`Favorable combinations error: ${favValidation.error}`);
    if (!totalValidation.valid) return ResultFormatter.error(`Total combinations error: ${totalValidation.error}`);

    const favWays = this.nCr(favorableN, favorableR);
    const totalWays = this.nCr(totalN, totalR);

    if (totalWays === 0) return ResultFormatter.error('Total combinations equal 0; probability is undefined.');
    if (favWays > totalWays) return ResultFormatter.error(`Favorable combinations (${favWays}) exceed total combinations (${totalWays}).`);

    const p = favWays / totalWays;
    const formatted = this.formatProbability(p, favWays, totalWays, precision);

    const steps = [
      `1. Favorable Combinations: nCr(${favorableN}, ${favorableR}) = ${favWays}`,
      `2. Total Sample Combinations: nCr(${totalN}, ${totalR}) = ${totalWays}`,
      `3. Probability Formula: P = Favorable Combinations / Total Combinations`,
      `4. Substitution: P = ${favWays} / ${totalWays}`,
      `5. Result: ${formatted.exact} = ${formatted.decimal} (${formatted.percentage})`
    ];

    return ResultFormatter.success({
      favWays,
      totalWays,
      ...formatted
    }, steps, 'Combinatorics Counting Probability');
  }

  /**
   * 22. Probability Distributions: Bernoulli and Binomial
   * Binomial(n, p, x): P(X = x) = nCx * p^x * (1 - p)^(n - x)
   */
  static binomialDistribution(nInput, pInput, xInput = null, precision = 4) {
    const n = parseInt(nInput, 10);
    const p = Number(pInput);

    if (!Number.isInteger(n) || n < 0) {
      return ResultFormatter.error('Number of trials n must be a non-negative integer.');
    }
    if (n > 100) {
      return ResultFormatter.error('Number of trials n exceeds calculation limit of 100.');
    }
    if (p < 0 || p > 1) {
      return ResultFormatter.error('Probability of success p must be between 0 and 1.');
    }

    const q = 1 - p;
    const mean = n * p;
    const variance = n * p * q;
    const stdDev = Math.sqrt(variance);

    // Compute full PMF table for k = 0 ... n
    const pmfTable = [];
    for (let k = 0; k <= n; k++) {
      const nCk = this.nCr(n, k);
      const probK = nCk * Math.pow(p, k) * Math.pow(q, n - k);
      pmfTable.push({
        k,
        prob: probK,
        formatted: this.formatProbability(probK, null, null, precision)
      });
    }

    let targetResult = null;
    if (xInput !== null && xInput !== undefined && String(xInput).trim() !== '') {
      const x = parseInt(xInput, 10);
      if (x < 0 || x > n) {
        return ResultFormatter.error(`Number of successes x must be an integer between 0 and n (${n}).`);
      }
      const targetEntry = pmfTable[x];
      targetResult = {
        x,
        probability: targetEntry.formatted
      };
    }

    const cMean = ResultFormatter.cleanNumber(mean);
    const cVar = ResultFormatter.cleanNumber(variance);
    const cStd = ResultFormatter.cleanNumber(stdDev);

    const steps = [
      `1. Binomial Parameters: n = ${n} (trials), p = ${p} (success prob), q = 1 - p = ${q.toFixed(precision)}`,
      `2. Expected Value (Mean): μ = n · p = ${n} × ${p} = ${cMean}`,
      `3. Variance: σ² = n · p · q = ${n} × ${p} × ${q.toFixed(precision)} = ${cVar}`,
      `4. Standard Deviation: σ = √σ² = √(${cVar}) = ${cStd}`
    ];

    if (targetResult) {
      steps.push(`5. Probability P(X = ${targetResult.x}): ⁿCₓ · pˣ · qⁿ⁻ˣ = C(${n}, ${targetResult.x}) × ${p}^${targetResult.x} × ${q.toFixed(precision)}^${n - targetResult.x} = ${targetResult.probability.decimal} (${targetResult.probability.percentage})`);
    }

    const derivation7Stage = {
      problem: `Evaluate Binomial distribution X ~ Bin(${n}, ${p})${targetResult ? ` at x = ${targetResult.x}` : ''}.`,
      data: `n = ${n}, p = ${p}, q = ${q.toFixed(precision)}`,
      formula: `P(X = k) = ⁿCₖ · pᵏ · qⁿ⁻ᵏ | Mean = np | Variance = npq`,
      substitution: `Mean = ${n} × ${p} = ${cMean} | Var = ${n} × ${p} × ${q.toFixed(precision)} = ${cVar}`,
      calculation: targetResult ? `P(X = ${targetResult.x}) = ${targetResult.probability.decimal}` : `Mean = ${cMean}, Var = ${cVar}`,
      result: `Mean: ${cMean} | Std Dev: ${cStd}${targetResult ? ` | P(X = ${targetResult.x}) = ${targetResult.probability.decimal}` : ''}`,
      interpretation: `In ${n} independent Bernoulli trials with success probability ${p}, the expected number of successes is ${cMean}.`
    };

    return ResultFormatter.success({
      n,
      p,
      q,
      mean: cMean,
      variance: cVar,
      stdDev: cStd,
      targetResult,
      pmfTable,
      derivation7Stage
    }, steps, 'Binomial Distribution');
  }

  /**
   * 23. Expected Value and Variance for Discrete Random Variable
   * Given outcomes x_i and probabilities p_i, validates ∑p_i = 1
   */
  static expectedValueAndVariance(pairs, precision = 4) {
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return ResultFormatter.error('Expected value calculation requires at least one outcome-probability pair.');
    }

    let sumP = 0;
    const cleanPairs = [];

    for (let i = 0; i < pairs.length; i++) {
      const x = Number(pairs[i].x);
      const p = Number(pairs[i].p);

      if (!Number.isFinite(x) || !Number.isFinite(p)) {
        return ResultFormatter.error(`Row ${i + 1}: Outcome (x) and probability (P(X=x)) must be valid numbers.`);
      }
      if (p < 0 || p > 1) {
        return ResultFormatter.error(`Row ${i + 1}: Probability P(X = ${x}) = ${p} is invalid. Each probability must lie in [0, 1].`);
      }

      sumP += p;
      cleanPairs.push({ x, p });
    }

    if (Math.abs(sumP - 1) > 0.005) {
      return ResultFormatter.error(`The sum of probabilities ∑P(X = x) must equal exactly 1.000. Received sum: ${sumP.toFixed(4)}. Please ensure the distribution is complete.`);
    }

    let expectedValue = 0;
    let expectedX2 = 0;

    const tableRows = cleanPairs.map(r => {
      const xp = r.x * r.p;
      const x2p = Math.pow(r.x, 2) * r.p;
      expectedValue += xp;
      expectedX2 += x2p;
      return {
        x: r.x,
        p: r.p,
        xp: ResultFormatter.cleanNumber(xp),
        x2p: ResultFormatter.cleanNumber(x2p)
      };
    });

    const variance = expectedX2 - Math.pow(expectedValue, 2);
    const stdDev = Math.sqrt(Math.max(0, variance));

    const cExp = ResultFormatter.cleanNumber(expectedValue);
    const cExp2 = ResultFormatter.cleanNumber(expectedX2);
    const cVar = ResultFormatter.cleanNumber(variance);
    const cStd = ResultFormatter.cleanNumber(stdDev);

    const steps = [
      `1. Probability Distribution Validation: ∑P(X = x) = ${sumP.toFixed(4)} ≈ 1.0 (Valid)`,
      `2. Expected Value (Mean): E(X) = ∑ [x · P(X = x)] = ${cExp}`,
      `3. Second Moment: E(X²) = ∑ [x² · P(X = x)] = ${cExp2}`,
      `4. Variance: Var(X) = E(X²) - [E(X)]² = ${cExp2} - (${cExp})² = ${cVar}`,
      `5. Standard Deviation: σ = √Var(X) = √(${cVar}) = ${cStd}`
    ];

    const derivation7Stage = {
      problem: `Compute Expected Value E(X) and Variance Var(X) for discrete random variable X with ${pairs.length} outcomes.`,
      data: `Outcomes & Probabilities: ${cleanPairs.map(r => `(${r.x}, ${r.p})`).join(', ')}`,
      formula: `E(X) = ∑ x·P(X = x) | Var(X) = E(X²) - [E(X)]² | σ = √Var(X)`,
      substitution: `E(X) = ${cExp} | E(X²) = ${cExp2} | Var(X) = ${cExp2} - (${cExp})²`,
      calculation: `E(X) = ${cExp}, Var(X) = ${cVar}, σ = ${cStd}`,
      result: `Expected Value E(X) = ${cExp} | Variance = ${cVar} | Std Dev = ${cStd}`,
      interpretation: `Over many repetitions of this experiment, the long-term average outcome of X will approach ${cExp}.`
    };

    return ResultFormatter.success({
      pairs: tableRows,
      expectedValue: cExp,
      expectedX2: cExp2,
      variance: cVar,
      stdDev: cStd,
      derivation7Stage
    }, steps, 'Expected Value & Variance');
  }

  /**
   * 21. Random Experiment Simulation Runner
   * Runs empirical trials (10 to 100,000) and compares against exact theoretical probability
   */
  static runSimulation(experimentType, trials = 1000) {
    const numTrials = Math.max(10, Math.min(100000, parseInt(trials, 10)));
    let theoretical = {};
    let counts = {};

    if (experimentType === 'coin') {
      theoretical = { Heads: 0.5, Tails: 0.5 };
      counts = { Heads: 0, Tails: 0 };
      for (let i = 0; i < numTrials; i++) {
        if (Math.random() < 0.5) counts.Heads++;
        else counts.Tails++;
      }
    } else if (experimentType === 'die' || experimentType === 'dice') {
      for (let k = 1; k <= 6; k++) {
        theoretical[`Face ${k}`] = 1 / 6;
        counts[`Face ${k}`] = 0;
      }
      for (let i = 0; i < numTrials; i++) {
        const roll = Math.floor(Math.random() * 6) + 1;
        counts[`Face ${roll}`]++;
      }
    } else if (experimentType === 'two-dice') {
      // Sum of two dice
      for (let s = 2; s <= 12; s++) {
        const ways = 6 - Math.abs(s - 7);
        theoretical[`Sum ${s}`] = ways / 36;
        counts[`Sum ${s}`] = 0;
      }
      for (let i = 0; i < numTrials; i++) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const sum = d1 + d2;
        counts[`Sum ${sum}`]++;
      }
    } else {
      // Default: Card Draw (Suits)
      theoretical = { Spades: 0.25, Hearts: 0.25, Diamonds: 0.25, Clubs: 0.25 };
      counts = { Spades: 0, Hearts: 0, Diamonds: 0, Clubs: 0 };
      const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
      for (let i = 0; i < numTrials; i++) {
        const s = suits[Math.floor(Math.random() * 4)];
        counts[s]++;
      }
    }

    const comparison = Object.keys(theoretical).map(key => {
      const expFreq = counts[key] / numTrials;
      const theoProb = theoretical[key];
      const absDiff = Math.abs(expFreq - theoProb);
      return {
        outcome: key,
        count: counts[key],
        experimentalFreq: expFreq.toFixed(4),
        theoreticalProb: theoProb.toFixed(4),
        discrepancy: absDiff.toFixed(4),
        pctDifference: ((absDiff / theoProb) * 100).toFixed(2) + '%'
      };
    });

    return {
      experimentType,
      trials: numTrials,
      comparison,
      note: 'Notice: As the number of trials increases, experimental frequency converges toward theoretical probability by the Law of Large Numbers.'
    };
  }

  /**
   * 24. 2x2 Contingency Table
   * Cells: [ [A_and_B, A_and_NotB], [NotA_and_B, NotA_and_NotB] ]
   */
  static solveContingencyTable(nAB, nAnB, nnAB, nnAnB, precision = 4) {
    const ab = Number(nAB);
    const anb = Number(nAnB);
    const nab = Number(nnAB);
    const nanb = Number(nnAnB);

    if (ab < 0 || anb < 0 || nab < 0 || nanb < 0) {
      return ResultFormatter.error('Contingency counts must be non-negative.');
    }

    const totalA = ab + anb;
    const totalNotA = nab + nanb;
    const totalB = ab + nab;
    const totalNotB = anb + nanb;
    const N = totalA + totalNotA;

    if (N === 0) return ResultFormatter.error('Total observations in contingency table cannot be zero.');

    const pA = totalA / N;
    const pB = totalB / N;
    const pInter = ab / N;
    const pAgivenB = totalB > 0 ? ab / totalB : 0;
    const pBgivenA = totalA > 0 ? ab / totalA : 0;

    return ResultFormatter.success({
      counts: { ab, anb, nab, nanb, totalA, totalNotA, totalB, totalNotB, N },
      pA: this.formatProbability(pA, totalA, N, precision),
      pB: this.formatProbability(pB, totalB, N, precision),
      pInter: this.formatProbability(pInter, ab, N, precision),
      pAgivenB: this.formatProbability(pAgivenB, ab, totalB, precision),
      pBgivenA: this.formatProbability(pBgivenA, ab, totalA, precision)
    }, [
      `1. Total Sample Size N = ${N}`,
      `2. Marginal Totals: n(A) = ${totalA}, n(A') = ${totalNotA}, n(B) = ${totalB}, n(B') = ${totalNotB}`,
      `3. P(A) = ${totalA}/${N} = ${(pA).toFixed(precision)} | P(B) = ${totalB}/${N} = ${(pB).toFixed(precision)}`,
      `4. Joint P(A ∩ B) = ${ab}/${N} = ${(pInter).toFixed(precision)}`,
      `5. Conditional P(A|B) = n(A ∩ B) / n(B) = ${ab}/${totalB} = ${(pAgivenB).toFixed(precision)}`,
      `6. Conditional P(B|A) = n(A ∩ B) / n(A) = ${ab}/${totalA} = ${(pBgivenA).toFixed(precision)}`
    ], '2x2 Contingency Table');
  }
}
