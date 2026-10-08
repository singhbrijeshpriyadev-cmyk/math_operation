/**
 * OG - Universal Vector Input Parser
 * Parses diverse mathematical expressions and vector notation:
 * - Direct vector assignment: v = [1, 2, 3] or A = (4, 6)
 * - Multi-vector definitions: u = [1, 2, 3], v = [4, 5, 6]
 * - Binary arithmetic: [1, 2, 3] + [4, 5, 6]
 * - Dot product: [1, 2, 3] · [4, 5, 6] or [1,2,3] dot [4,5,6]
 * - Cross product: [1, 2, 3] × [4, 5, 6] or [1,2,3] cross [4,5,6]
 * - Unary commands: |[1, 2, 3]|, mag([1, 2, 3]), unit([1, 2, 3])
 * - Natural queries: "projection of [1,2] onto [3,4]", "angle between [1,2,3] and [4,5,6]"
 *
 * ES6 Module
 */

import { Vector } from './vector.js';

export class VectorParser {
  /**
   * Extracts single vector components from string like "[1, 2, 3]" or "(4, 5, 6)"
   */
  static parseSingleVector(str, defaultLabel = 'v') {
    if (!str || typeof str !== 'string') return null;

    // Check for label assignment e.g. "u = [1, 2, 3]"
    let label = defaultLabel;
    let vectorBody = str.trim();

    const assignMatch = vectorBody.match(/^([a-zA-Z][0-9]?)\s*=\s*(.+)$/);
    if (assignMatch) {
      label = assignMatch[1];
      vectorBody = assignMatch[2].trim();
    }

    // Extract inside brackets [ ... ] or ( ... ) or < ... >
    const bracketMatch = vectorBody.match(/[\[\(\<]([^\]\)\>]+)[\]\)\>]/);
    const content = bracketMatch ? bracketMatch[1] : vectorBody;

    // Split on comma or whitespace
    const parts = content.split(/[\s,;]+/).filter(Boolean);
    if (parts.length === 0) return null;

    const nums = [];
    for (const p of parts) {
      // Support simple fractions like "3/4"
      if (p.includes('/')) {
        const [num, den] = p.split('/').map(Number);
        if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
          nums.push(num / den);
          continue;
        }
      }
      const val = Number(p);
      if (!Number.isFinite(val)) return null;
      nums.push(val);
    }

    return new Vector(nums, label);
  }

  /**
   * Intelligently parses universal vector input and detects intent & operation
   */
  static parseUniversal(query) {
    if (!query || typeof query !== 'string') {
      return {
        type: 'empty',
        operation: null,
        vectors: [],
        suggestions: []
      };
    }

    const trimmed = query.trim();

    // 1. Natural Language: "projection of [u] onto [v]"
    const projMatch = trimmed.match(/proj(?:ection)?\s+(?:of\s+)?([\[\(\<].+?[\]\)\>])\s+(?:onto|on)\s+([\[\(\<].+?[\]\)\>])/i);
    if (projMatch) {
      const u = VectorParser.parseSingleVector(projMatch[1], 'u');
      const v = VectorParser.parseSingleVector(projMatch[2], 'v');
      if (u && v) {
        return {
          type: 'projection',
          operation: 'projection',
          vectors: [u, v],
          rawInput: trimmed,
          suggestions: ['Calculate Projection', 'Show Steps', 'Visualize Geometry']
        };
      }
    }

    // 2. Natural Language: "angle between [u] and [v]"
    const angleMatch = trimmed.match(/angle\s+(?:between\s+)?([\[\(\<].+?[\]\)\>])\s+(?:and|,)\s+([\[\(\<].+?[\]\)\>])/i);
    if (angleMatch) {
      const u = VectorParser.parseSingleVector(angleMatch[1], 'u');
      const v = VectorParser.parseSingleVector(angleMatch[2], 'v');
      if (u && v) {
        return {
          type: 'angle',
          operation: 'angle',
          vectors: [u, v],
          rawInput: trimmed,
          suggestions: ['Calculate Angle', 'Show Steps', 'Visualize 3D']
        };
      }
    }

    // 3. Dot Product: "[1,2,3] · [4,5,6]" or "dot"
    if (/[·\.]|\bdot\b/i.test(trimmed) && trimmed.includes('[') && trimmed.lastIndexOf('[') > 0) {
      const parts = trimmed.split(/[·\.]|\bdot\b/i);
      const u = VectorParser.parseSingleVector(parts[0], 'u');
      const v = VectorParser.parseSingleVector(parts[1], 'v');
      if (u && v) {
        return {
          type: 'dotProduct',
          operation: 'dotProduct',
          vectors: [u, v],
          rawInput: trimmed,
          suggestions: ['Compute Dot Product', 'Test Orthogonality', 'Show Steps']
        };
      }
    }

    // 4. Cross Product: "[1,2,3] × [4,5,6]" or "cross"
    if (/[×x\*]|\bcross\b/i.test(trimmed) && trimmed.includes('[') && trimmed.lastIndexOf('[') > 0) {
      const parts = trimmed.split(/[×\bcross\b]/i);
      const u = VectorParser.parseSingleVector(parts[0], 'u');
      const v = VectorParser.parseSingleVector(parts[1], 'v');
      if (u && v) {
        return {
          type: 'crossProduct',
          operation: 'crossProduct',
          vectors: [u, v],
          rawInput: trimmed,
          suggestions: ['Compute Cross Product', 'Compute Parallelogram Area', 'Show Steps']
        };
      }
    }

    // 5. Binary Addition: "[1, 2] + [3, 4]"
    if (trimmed.includes('+') && trimmed.includes('[') && trimmed.lastIndexOf('[') > 0) {
      const parts = trimmed.split('+');
      const u = VectorParser.parseSingleVector(parts[0], 'u');
      const v = VectorParser.parseSingleVector(parts[1], 'v');
      if (u && v) {
        return {
          type: 'binary',
          operation: 'add',
          vectors: [u, v],
          rawInput: trimmed,
          suggestions: ['Calculate Sum u + v', 'Visualize Vector Addition', 'Show Steps']
        };
      }
    }

    // 6. Binary Subtraction: "[1, 2] - [3, 4]"
    if (trimmed.includes('-') && trimmed.includes('[') && trimmed.lastIndexOf('[') > 0) {
      const parts = trimmed.split('-');
      const u = VectorParser.parseSingleVector(parts[0], 'u');
      const v = VectorParser.parseSingleVector(parts[1], 'v');
      if (u && v) {
        return {
          type: 'binary',
          operation: 'subtract',
          vectors: [u, v],
          rawInput: trimmed,
          suggestions: ['Calculate Difference u - v', 'Show Steps']
        };
      }
    }

    // 7. Magnitude Command: "|v|" or "mag(v)" or "norm(v)"
    const magMatch = trimmed.match(/^(?:\||mag\(|norm\()(.+?)(?:\||\))$/i);
    if (magMatch) {
      const vec = VectorParser.parseSingleVector(magMatch[1], 'v');
      if (vec) {
        return {
          type: 'unary',
          operation: 'magnitude',
          vectors: [vec],
          rawInput: trimmed,
          suggestions: ['Calculate Magnitude |v|', 'Normalize to Unit Vector', 'Show Steps']
        };
      }
    }

    // 8. Unit Vector Command: "unit(v)" or "hat(v)"
    const unitMatch = trimmed.match(/^(?:unit|hat)\((.+?)\)$/i);
    if (unitMatch) {
      const vec = VectorParser.parseSingleVector(unitMatch[1], 'v');
      if (vec) {
        return {
          type: 'unary',
          operation: 'unitVector',
          vectors: [vec],
          rawInput: trimmed,
          suggestions: ['Calculate Unit Vector v̂', 'Show Steps']
        };
      }
    }

    // 9. Multi-vector definition separated by semicolon or newline or comma outside brackets
    const allMatches = trimmed.match(/([a-zA-Z][0-9]?\s*=\s*)?[\[\(\<][^\]\)\>]+[\]\)\>]/g);
    if (allMatches && allMatches.length > 1) {
      const defaultLabels = ['u', 'v', 'w', 'a', 'b'];
      const parsedList = allMatches.map((m, idx) => VectorParser.parseSingleVector(m, defaultLabels[idx] || `v_${idx + 1}`)).filter(Boolean);
      if (parsedList.length >= 2) {
        return {
          type: 'multiVector',
          operation: 'vectorPair',
          vectors: parsedList,
          rawInput: trimmed,
          suggestions: ['Vector Addition u + v', 'Dot Product u · v', 'Cross Product u × v', 'Angle Between Vectors', 'Projection of u on v']
        };
      }
    }

    // 10. Single vector definition
    const single = VectorParser.parseSingleVector(trimmed, 'u');
    if (single) {
      return {
        type: 'singleVector',
        operation: 'analyze',
        vectors: [single],
        rawInput: trimmed,
        suggestions: ['Calculate Magnitude |u|', 'Normalize to Unit Vector', 'Direction Cosines', 'Visualize Vector']
      };
    }

    return {
      type: 'unknown',
      operation: null,
      vectors: [],
      rawInput: trimmed,
      suggestions: ['Try: u = [2, 3, 1]', 'Try: [1, 2, 3] · [4, 5, 6]', 'Try: proj of [3, 4] onto [1, 0]']
    };
  }
}
