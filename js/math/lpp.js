/**
 * OG - Linear Programming Mathematical Engine
 * Graphical 2D Linear Programming Problem (LPP) solver:
 * - Objective Function: Optimize Z = c1·x + c2·y (Maximize or Minimize)
 * - Linear constraints: a·x + b·y <= d (or >= d) with non-negativity x, y >= 0
 * - Intersection and corner point determination
 * - Feasible region boundary evaluation
 * - Identification of optimal vertex (x*, y*, Z*)
 * ES6 Module
 */

import { ResultFormatter } from './formatter.js';

export class LinearProgrammingMathEngine {
  /**
   * Solves 2D LPP via Corner Point Method
   * @param {Object} objective - { c1: number, c2: number, type: 'max' | 'min' }
   * @param {Array} constraints - Array of { a: number, b: number, op: '<=' | '>=', d: number }
   */
  static solve(objective, constraints) {
    const c1 = objective.c1;
    const c2 = objective.c2;
    const isMax = objective.type !== 'min';

    if (!Array.isArray(constraints) || constraints.length === 0) {
      return ResultFormatter.error('At least one constraint is required.');
    }

    // Boundary lines: includes x = 0 and y = 0
    const lines = [
      { a: 1, b: 0, d: 0, op: '>=' }, // x >= 0
      { a: 0, b: 1, d: 0, op: '>=' }, // y >= 0
      ...constraints
    ];

    // Find all pair-wise intersection points
    const candidatePoints = [];

    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const l1 = lines[i];
        const l2 = lines[j];

        // Solve:
        // l1.a * x + l1.b * y = l1.d
        // l2.a * x + l2.b * y = l2.d
        const det = l1.a * l2.b - l1.b * l2.a;
        if (Math.abs(det) > 1e-9) {
          const x = (l1.d * l2.b - l1.b * l2.d) / det;
          const y = (l1.a * l2.d - l1.d * l2.a) / det;

          // Check non-negativity and finite
          if (x >= -1e-6 && y >= -1e-6 && Number.isFinite(x) && Number.isFinite(y)) {
            const cleanX = Math.abs(x) < 1e-6 ? 0 : x;
            const cleanY = Math.abs(y) < 1e-6 ? 0 : y;
            candidatePoints.push({ x: cleanX, y: cleanY });
          }
        }
      }
    }

    // Filter points that satisfy ALL constraints
    const feasiblePoints = [];
    candidatePoints.forEach(pt => {
      let isFeasible = true;
      for (const c of constraints) {
        const val = c.a * pt.x + c.b * pt.y;
        if (c.op === '<=' && val > c.d + 1e-5) isFeasible = false;
        if (c.op === '>=' && val < c.d - 1e-5) isFeasible = false;
      }
      if (pt.x < -1e-5 || pt.y < -1e-5) isFeasible = false;

      if (isFeasible) {
        const cx = ResultFormatter.cleanNumber(pt.x);
        const cy = ResultFormatter.cleanNumber(pt.y);
        if (!feasiblePoints.some(p => Math.abs(p.x - cx) < 1e-4 && Math.abs(p.y - cy) < 1e-4)) {
          feasiblePoints.push({ x: cx, y: cy });
        }
      }
    });

    if (feasiblePoints.length === 0) {
      return ResultFormatter.error('The feasible region is empty. Inconsistent constraints.');
    }

    // Evaluate Z = c1*x + c2*y at each feasible corner point
    const cornerEvaluations = feasiblePoints.map(pt => {
      const z = ResultFormatter.cleanNumber(c1 * pt.x + c2 * pt.y);
      return {
        x: pt.x,
        y: pt.y,
        z
      };
    });

    // Find optimum
    let optimal = cornerEvaluations[0];
    cornerEvaluations.forEach(ev => {
      if (isMax) {
        if (ev.z > optimal.z) optimal = ev;
      } else {
        if (ev.z < optimal.z) optimal = ev;
      }
    });

    const objStr = `${isMax ? 'Maximize' : 'Minimize'} Z = ${c1}x + ${c2}y`;
    const formulaStr = 'Optimal Z occurs at one of the extreme / corner points of the feasible region.';

    const steps = [
      `1. Objective Function: ${objStr}`,
      `2. System of Constraints:`,
      ...constraints.map(c => `   • ${c.a}x + ${c.b}y ${c.op} ${c.d}`),
      `   • Non-negativity restrictions: x ≥ 0, y ≥ 0`,
      `3. Feasible Region Corner Points Identified (${feasiblePoints.length} vertices):`,
      ...cornerEvaluations.map(ev => `   • Point (${ev.x}, ${ev.y}) ⟹ Z = (${c1}×${ev.x}) + (${c2}×${ev.y}) = ${ev.z}`),
      `4. Optimal Solution: ${isMax ? 'Maximum' : 'Minimum'} Z = ${optimal.z} at corner point (${optimal.x}, ${optimal.y})`
    ];

    return ResultFormatter.success(
      {
        objective: objStr,
        isMax,
        c1,
        c2,
        constraints,
        cornerPoints: cornerEvaluations,
        optimalX: optimal.x,
        optimalY: optimal.y,
        optimalZ: optimal.z
      },
      steps,
      formulaStr
    );
  }
}
